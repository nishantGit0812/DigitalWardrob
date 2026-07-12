import type { DB } from '@op-engineering/op-sqlite';

export interface Migration {
  version: number;
  up: (db: DB) => void;
}

// `PRAGMA user_version` (as a bare statement) returns no rows on some
// bindings (observed on op-sqlite's Node.js test façade, which wraps
// better-sqlite3). `pragma_user_version()` is the same value exposed as a
// table-valued function, which is portable across every SQLite binding.
export function getUserVersion(db: DB): number {
  const result = db.executeSync('SELECT * FROM pragma_user_version()');
  const row = result.rows?.[0] as { user_version?: number } | undefined;
  return row?.user_version ?? 0;
}

export function runMigrations(db: DB, migrations: Migration[]): void {
  const pending = [...migrations]
    .sort((a, b) => a.version - b.version)
    .filter(migration => migration.version > getUserVersion(db));

  for (const migration of pending) {
    db.executeSync('BEGIN');
    try {
      migration.up(db);
      db.executeSync(`PRAGMA user_version = ${migration.version}`);
      db.executeSync('COMMIT');
    } catch (error) {
      db.executeSync('ROLLBACK');
      throw error;
    }
  }
}
