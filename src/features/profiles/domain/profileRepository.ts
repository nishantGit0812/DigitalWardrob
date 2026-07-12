import type { Profile } from './Profile';

// mission.md: "Support up to 4 isolated local profiles on one install."
export const MAX_PROFILES = 4;

export interface ProfileRepository {
  // Sorted oldest-first, so the grid's tile order is stable across launches.
  list(): Promise<Profile[]>;

  // Rejects if `name` is empty/whitespace-only, or the registry is already
  // at MAX_PROFILES — Presentation should disable/validate ahead of calling
  // this, but the repository enforces it regardless (Task Group 3.4/3.2).
  create(name: string, avatarColor: string): Promise<Profile>;

  // Rename/re-avatar in place (plan.md 4.1). Rejects an empty/whitespace
  // name or an unknown profileId.
  update(
    profileId: string,
    name: string,
    avatarColor: string,
  ): Promise<Profile>;

  // Cascading delete (plan.md 4.2/4.3): storage (Task Group 2.3) and the
  // registry entry. Idempotent — removing an already-gone profileId is a
  // no-op, not an error, so a retried/duplicate delete can't fail.
  remove(profileId: string): Promise<void>;

  // Synchronous, matching the underlying MMKV read/write these delegate to
  // (spec.md §17's app_meta store) — no PIN gate sits in front of this yet
  // (that's Task Group 5), so selecting/creating a profile sets it active
  // immediately.
  getActiveProfileId(): string | undefined;
  setActiveProfileId(profileId: string): void;
}
