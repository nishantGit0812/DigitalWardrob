import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Migration } from '../migrationRunner';
import { getUserVersion } from '../migrationRunner';
import {
  deleteProfileDatabase,
  getProfileDatabaseName,
  openProfileDatabase,
} from '../profileDatabase';

const noOpMigration: Migration[] = [{ version: 1, up: () => {} }];

describe('getProfileDatabaseName', () => {
  it('follows the wardrobe_<profileId>.db naming convention', () => {
    expect(getProfileDatabaseName('abc123')).toBe('wardrobe_abc123.db');
  });

  it('rejects a profileId containing path separators or traversal', () => {
    expect(() => getProfileDatabaseName('../etc/passwd')).toThrow(
      'Invalid profileId',
    );
    expect(() => getProfileDatabaseName('a/b')).toThrow('Invalid profileId');
    expect(() => getProfileDatabaseName('')).toThrow('Invalid profileId');
  });
});

describe('openProfileDatabase', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobeai-db-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates a DB file at the expected path and applies a no-op migration', () => {
    const profileId = 'profile-fresh';
    const db = openProfileDatabase(profileId, noOpMigration, tempDir);

    const expectedPath = path.join(tempDir, getProfileDatabaseName(profileId));
    expect(fs.existsSync(expectedPath)).toBe(true);
    expect(getUserVersion(db)).toBe(1);

    db.close();
  });

  it('re-opening an existing file preserves its data and schema version', () => {
    const profileId = 'profile-reopen';
    const migrations: Migration[] = [
      {
        version: 1,
        up: db => {
          db.executeSync(
            'CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT)',
          );
          db.executeSync("INSERT INTO items (name) VALUES ('jacket')");
        },
      },
    ];

    const first = openProfileDatabase(profileId, migrations, tempDir);
    expect(getUserVersion(first)).toBe(1);
    first.close();

    const second = openProfileDatabase(profileId, migrations, tempDir);
    const result = second.executeSync('SELECT * FROM items');
    expect(result.rows).toEqual([{ id: 1, name: 'jacket' }]);
    expect(getUserVersion(second)).toBe(1);
    second.close();
  });

  it('applies only newer migrations when the schema version bumps', () => {
    const profileId = 'profile-bump';
    const migrationV1: Migration[] = [
      {
        version: 1,
        up: db => db.executeSync('CREATE TABLE items (id INTEGER PRIMARY KEY)'),
      },
    ];

    const first = openProfileDatabase(profileId, migrationV1, tempDir);
    expect(getUserVersion(first)).toBe(1);
    first.close();

    let v2Applied = 0;
    const migrationV1AndV2: Migration[] = [
      migrationV1[0],
      {
        version: 2,
        up: db => {
          v2Applied += 1;
          db.executeSync('ALTER TABLE items ADD COLUMN name TEXT');
        },
      },
    ];

    const second = openProfileDatabase(profileId, migrationV1AndV2, tempDir);
    expect(getUserVersion(second)).toBe(2);
    expect(v2Applied).toBe(1);
    second.close();

    // Re-opening at the same version must not re-apply v2.
    const third = openProfileDatabase(profileId, migrationV1AndV2, tempDir);
    expect(getUserVersion(third)).toBe(2);
    expect(v2Applied).toBe(1);
    third.close();
  });

  it('closes the connection on a failed migration, allowing a clean retry', () => {
    const profileId = 'profile-fail-retry';
    const failingMigration: Migration[] = [
      {
        version: 1,
        up: () => {
          throw new Error('boom');
        },
      },
    ];

    expect(() =>
      openProfileDatabase(profileId, failingMigration, tempDir),
    ).toThrow('boom');

    const workingMigration: Migration[] = [
      {
        version: 1,
        up: db => db.executeSync('CREATE TABLE items (id INTEGER PRIMARY KEY)'),
      },
    ];
    const db = openProfileDatabase(profileId, workingMigration, tempDir);
    expect(getUserVersion(db)).toBe(1);
    db.close();
  });
});

describe('deleteProfileDatabase', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobeai-db-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('removes an existing DB file', () => {
    const profileId = 'profile-to-delete';
    const dbFilePath = path.join(tempDir, getProfileDatabaseName(profileId));
    openProfileDatabase(profileId, noOpMigration, tempDir).close();
    expect(fs.existsSync(dbFilePath)).toBe(true);

    deleteProfileDatabase(profileId, tempDir);

    expect(fs.existsSync(dbFilePath)).toBe(false);
  });

  it('deleting a DB that was never created leaves no file behind', () => {
    const profileId = 'profile-never-created';
    const dbFilePath = path.join(tempDir, getProfileDatabaseName(profileId));

    deleteProfileDatabase(profileId, tempDir);

    expect(fs.existsSync(dbFilePath)).toBe(false);
  });
});
