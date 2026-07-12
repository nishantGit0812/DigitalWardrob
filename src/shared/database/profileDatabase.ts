import { open, type DB } from '@op-engineering/op-sqlite';
import { type Migration, runMigrations } from './migrationRunner';

export function getProfileDatabaseName(profileId: string): string {
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
  runMigrations(db, migrations);
  return db;
}
