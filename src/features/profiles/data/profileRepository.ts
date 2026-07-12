import {
  clearActiveProfileId,
  getActiveProfileId as getStoredActiveProfileId,
  getProfileRegistry,
  setActiveProfileId as setStoredActiveProfileId,
  setProfileRegistry,
  type ProfileRegistryEntry,
} from '../../../shared/storage';
import type { Profile } from '../domain/Profile';
import type { ProfilePinGateway } from '../domain/profilePin';
import {
  MAX_PROFILES,
  type ProfileRepository,
} from '../domain/profileRepository';
import {
  deprovisionProfileStorage,
  provisionProfileStorage,
} from './profileStorageProvisioning';

function toProfile(entry: ProfileRegistryEntry): Profile {
  return { id: entry.id, name: entry.name, avatarColor: entry.avatarColor };
}

// Not cryptographically unique, but doesn't need to be: at most 4 profiles
// ever exist on one device (MAX_PROFILES), so timestamp + a short random
// suffix is more than enough entropy, without pulling in a UUID library
// and its crypto.getRandomValues polyfill dependency for this alone.
function generateProfileId(): string {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `profile_${Date.now().toString(36)}_${randomSuffix}`;
}

// Implements the profiles/domain ProfileRepository port against the
// app_meta MMKV registry (spec.md §17) plus Task Group 2's storage
// provisioning — the only place in the app that writes profile registry
// entries. `dbLocation`/`imageBaseDir` mirror provisionProfileStorage's own
// override params — left undefined in production, overridden in tests.
export class LocalProfileRepository implements ProfileRepository {
  // create/update/remove each do a read-check-(await)-write against the
  // same registry; two calls overlapping (e.g. a double-tap racing a retry)
  // could otherwise interleave and lose one's write. Chaining every
  // mutation through this queue serializes them per repository instance —
  // App.tsx's single shared instance means this covers the whole app.
  private mutationQueue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly pinGateway: ProfilePinGateway,
    private readonly dbLocation?: string,
    private readonly imageBaseDir?: string,
  ) {}

  private enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(operation, operation);
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async list(): Promise<Profile[]> {
    return getProfileRegistry()
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(toProfile);
  }

  create(name: string, avatarColor: string): Promise<Profile> {
    return this.enqueueMutation(() => this.createInternal(name, avatarColor));
  }

  private async createInternal(
    name: string,
    avatarColor: string,
  ): Promise<Profile> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Profile name is required.');
    }

    const registry = getProfileRegistry();
    if (registry.length >= MAX_PROFILES) {
      throw new Error(`Cannot create more than ${MAX_PROFILES} profiles.`);
    }

    const entry: ProfileRegistryEntry = {
      id: generateProfileId(),
      name: trimmedName,
      avatarColor,
      createdAt: new Date().toISOString(),
    };

    // Task Group 3.3: provision storage before writing the registry entry,
    // so a failure here never leaves a registry entry with no backing DB
    // file/image directory. The reverse (storage provisioned, registry
    // write never happens) is the safer failure direction — an orphaned
    // directory is inert, whereas a registry entry pointing at missing
    // storage would break on the next read.
    await provisionProfileStorage(entry.id, this.dbLocation, this.imageBaseDir);
    setProfileRegistry([...registry, entry]);

    return toProfile(entry);
  }

  update(
    profileId: string,
    name: string,
    avatarColor: string,
  ): Promise<Profile> {
    return this.enqueueMutation(() =>
      this.updateInternal(profileId, name, avatarColor),
    );
  }

  private async updateInternal(
    profileId: string,
    name: string,
    avatarColor: string,
  ): Promise<Profile> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Profile name is required.');
    }

    const registry = getProfileRegistry();
    const index = registry.findIndex(entry => entry.id === profileId);
    if (index === -1) {
      throw new Error(`Profile ${profileId} does not exist.`);
    }

    const updated: ProfileRegistryEntry = {
      ...registry[index],
      name: trimmedName,
      avatarColor,
    };
    const nextRegistry = [...registry];
    nextRegistry[index] = updated;
    setProfileRegistry(nextRegistry);

    return toProfile(updated);
  }

  remove(profileId: string): Promise<void> {
    return this.enqueueMutation(() => this.removeInternal(profileId));
  }

  private async removeInternal(profileId: string): Promise<void> {
    const registry = getProfileRegistry();
    if (!registry.some(entry => entry.id === profileId)) {
      return;
    }

    // Task Group 4.3: cascading storage removal (Task Group 2.3) before the
    // registry entry — mirrors create()'s ordering. deprovisionProfileStorage
    // tolerates already-missing storage, so a retried delete after a partial
    // failure is always safe to call again. If it throws, the PIN hash and
    // registry entry are deliberately left in place too — same "don't
    // remove the entry until storage removal is confirmed" reasoning.
    await deprovisionProfileStorage(
      profileId,
      this.dbLocation,
      this.imageBaseDir,
    );
    await this.pinGateway.clearPin(profileId);
    setProfileRegistry(registry.filter(entry => entry.id !== profileId));

    if (getStoredActiveProfileId() === profileId) {
      clearActiveProfileId();
    }
  }

  getActiveProfileId(): string | undefined {
    return getStoredActiveProfileId();
  }

  setActiveProfileId(profileId: string): void {
    setStoredActiveProfileId(profileId);
  }
}
