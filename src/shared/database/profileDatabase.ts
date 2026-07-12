import { open, type DB } from '@op-engineering/op-sqlite';
import { assertValidProfileId } from '../profileId';
import { type Migration, runMigrations } from './migrationRunner';

export function getProfileDatabaseName(profileId: string): string {
  assertValidProfileId(profileId);
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

// Task Group 2.3's cascading delete: op-sqlite's `delete()` closes the
// connection and unlinks the file in one call. Opening a fresh handle just
// to delete it is harmless even if the file didn't already exist (the
// created-then-removed file never persists).
export function deleteProfileDatabase(
  profileId: string,
  location?: string,
): void {
  const db = open({ name: getProfileDatabaseName(profileId), location });
  db.delete();
}
