import {
  clearActiveProfileId,
  getActiveProfileId as getStoredActiveProfileId,
  getProfileRegistry,
  setActiveProfileId as setStoredActiveProfileId,
  setProfileRegistry,
  type ProfileRegistryEntry,
} from '../../../shared/storage';
import type { Profile } from '../domain/Profile';
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
  constructor(
    private readonly dbLocation?: string,
    private readonly imageBaseDir?: string,
  ) {}

  async list(): Promise<Profile[]> {
    return getProfileRegistry()
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(toProfile);
  }

  async create(name: string, avatarColor: string): Promise<Profile> {
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

  async update(
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

  async remove(profileId: string): Promise<void> {
    const registry = getProfileRegistry();
    if (!registry.some(entry => entry.id === profileId)) {
      return;
    }

    // Task Group 4.3: cascading storage removal (Task Group 2.3) before the
    // registry entry — mirrors create()'s ordering. deprovisionProfileStorage
    // tolerates already-missing storage, so a retried delete after a partial
    // failure is always safe to call again.
    //
    // PIN hash removal (Task Group 5) will need to extend this once PIN
    // storage exists — a no-op today since no PIN system has landed yet.
    await deprovisionProfileStorage(
      profileId,
      this.dbLocation,
      this.imageBaseDir,
    );
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
