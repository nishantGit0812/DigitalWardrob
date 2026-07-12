import { open, type DB } from '@op-engineering/op-sqlite';
import { type Migration, runMigrations } from './migrationRunner';

// Guards against a malformed profileId producing a path-traversing or
// otherwise unsafe file name — this primitive's whole purpose is
// per-profile data isolation (NFR-6), so the id shape matters.
const PROFILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function getProfileDatabaseName(profileId: string): string {
  if (!PROFILE_ID_PATTERN.test(profileId)) {
    throw new Error(`Invalid profileId: ${profileId}`);
  }
  return `wardrobe_${profileId}.db`;
}

// `location` is left undefined in production so op-sqlite uses its default
// app-internal storage directory (no external/public storage, per
// tech-stack.md's Storage section). Tests pass a temp dir or ':memory:'.
export function openProfileDatabase(
  profileId: string,
  migrations: Migration[],
  location?: string,
): DB {
  const db = open({ name: getProfileDatabaseName(profileId), location });
  try {
    runMigrations(db, migrations);
  } catch (error) {
    db.close();
    throw error;
  }
  return db;
}
