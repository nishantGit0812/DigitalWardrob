import {
  deleteProfileDatabase,
  openProfileDatabase,
  type Migration,
} from '../../../shared/database';
import {
  createProfileImageDirectory,
  deleteProfileImageDirectory,
} from '../../../shared/filesystem';

// Phase 1 has no per-profile schema yet (that lands with Phase 2's wardrobe
// tables) — provisioning still runs the migration pipeline so every
// profile's PRAGMA user_version starts from a known baseline.
const INITIAL_PROFILE_MIGRATIONS: Migration[] = [];

// Task Groups 2.1/2.2: a profile is not considered created until both its
// DB file and image directory exist (wired up by Task Group 3.3).
// `dbLocation`/`imageBaseDir` mirror the underlying primitives' own
// location params — left undefined in production, overridden to a shared
// temp dir in tests.
export async function provisionProfileStorage(
  profileId: string,
  dbLocation?: string,
  imageBaseDir?: string,
): Promise<void> {
  openProfileDatabase(
    profileId,
    INITIAL_PROFILE_MIGRATIONS,
    dbLocation,
  ).close();
  await createProfileImageDirectory(profileId, imageBaseDir);
}

// Task Group 2.3: removes both the DB file and image directory. Both
// removals are attempted even if the DB step throws, so a failure in one
// never silently strands the other resource — as atomic as two independent
// physical resources (a SQLite file, a directory tree) can be made.
export async function deprovisionProfileStorage(
  profileId: string,
  dbLocation?: string,
  imageBaseDir?: string,
): Promise<void> {
  let dbError: unknown;
  try {
    deleteProfileDatabase(profileId, dbLocation);
  } catch (error) {
    dbError = error;
  }

  await deleteProfileImageDirectory(profileId, imageBaseDir);

  if (dbError) {
    throw dbError;
  }
}
