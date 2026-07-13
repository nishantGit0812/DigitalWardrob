import { open, type DB } from '@op-engineering/op-sqlite';
import { assertValidProfileId } from '../profileId';
import { type Migration, runMigrations } from './migrationRunner';

export function getProfileDatabaseName(profileId: string): string {
  assertValidProfileId(profileId);
  return `wardrobe_${profileId}.db`;
}

// op-sqlite's Android JSI binding reads `location` off the params object
// and calls `.asString()` on it unconditionally if the key is present at
// all — an explicit `location: undefined` (as `{ name, location }` produces
// when `location` is the omitted optional param) throws "Value is
// undefined, expected a String" instead of falling back to the default
// directory like the `location?: string` type suggests. The key must be
// genuinely absent, not present-with-undefined.
function buildOpenOptions(
  name: string,
  location?: string,
): Parameters<typeof open>[0] {
  return location === undefined ? { name } : { name, location };
}

// `location` is left undefined in production so op-sqlite uses its default
// app-internal storage directory (no external/public storage, per
// tech-stack.md's Storage section). Tests pass a temp dir or ':memory:'.
export function openProfileDatabase(
  profileId: string,
  migrations: Migration[],
  location?: string,
): DB {
  const db = open(
    buildOpenOptions(getProfileDatabaseName(profileId), location),
  );
  try {
    runMigrations(db, migrations);
  } catch (error) {
    db.close();
    throw error;
  }
  return db;
}

// Task Group 2.3's cascading delete: op-sqlite's `delete()` closes the
// connection and unlinks the file in one call. Opening a fresh handle just
// to delete it is harmless even if the file didn't already exist (the
// created-then-removed file never persists).
export function deleteProfileDatabase(
  profileId: string,
  location?: string,
): void {
  const db = open(
    buildOpenOptions(getProfileDatabaseName(profileId), location),
  );
  db.delete();
}
