const PROFILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Guards against a malformed profileId producing a path-traversing or
// otherwise unsafe file/directory name. Every storage primitive that turns
// a profileId into a path (SQLite file, image directory) shares this check
// — profile isolation (NFR-6) depends on them all agreeing on what a valid
// id looks like.
export function assertValidProfileId(profileId: string): void {
  if (!PROFILE_ID_PATTERN.test(profileId)) {
    throw new Error(`Invalid profileId: ${profileId}`);
  }
}
