import * as fsPromises from 'node:fs/promises';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  getProfileDatabaseName,
  openProfileDatabase,
} from '../../../../shared/database';
import { getProfileImageDirectoryPath } from '../../../../shared/filesystem';
import {
  deprovisionProfileStorage,
  provisionProfileStorage,
} from '../profileStorageProvisioning';

describe('profile storage provisioning', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'wardrobeai-provisioning-test-'),
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates the DB file and image directory together', async () => {
    await provisionProfileStorage('profile-a', tempDir, tempDir);

    expect(
      fs.existsSync(path.join(tempDir, getProfileDatabaseName('profile-a'))),
    ).toBe(true);
    expect(
      fs.existsSync(getProfileImageDirectoryPath('profile-a', tempDir)),
    ).toBe(true);
  });

  it('deprovisioning removes both the DB file and image directory', async () => {
    await provisionProfileStorage('profile-a', tempDir, tempDir);

    await deprovisionProfileStorage('profile-a', tempDir, tempDir);

    expect(
      fs.existsSync(path.join(tempDir, getProfileDatabaseName('profile-a'))),
    ).toBe(false);
    expect(
      fs.existsSync(getProfileImageDirectoryPath('profile-a', tempDir)),
    ).toBe(false);
  });

  it('deprovisioning a never-provisioned profile does not throw', async () => {
    await expect(
      deprovisionProfileStorage('never-provisioned', tempDir, tempDir),
    ).resolves.toBeUndefined();
  });
});

// Task Group 2.4 / mission.md non-negotiable #2: profile isolation must be
// real at the storage layer, not just filtered in the UI. This is the first
// concrete proof of that guarantee.
describe('profile storage isolation', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'wardrobeai-isolation-test-'),
    );
    await provisionProfileStorage('profile-a', tempDir, tempDir);
    await provisionProfileStorage('profile-b', tempDir, tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('a marker row written to profile A is absent from profile B', () => {
    const dbA = openProfileDatabase(
      'profile-a',
      [
        {
          version: 1,
          up: db => {
            db.executeSync('CREATE TABLE marker (secret TEXT)');
            db.executeSync("INSERT INTO marker (secret) VALUES ('a-only')");
          },
        },
      ],
      tempDir,
    );
    dbA.close();

    // Re-open profile B fresh (no code path shares a connection or query
    // across profiles) and confirm it has no knowledge of profile A's table.
    const dbB = openProfileDatabase('profile-b', [], tempDir);
    expect(() => dbB.executeSync('SELECT * FROM marker')).toThrow();
    dbB.close();
  });

  it('a marker file written to profile A is absent from profile B', async () => {
    const dirA = getProfileImageDirectoryPath('profile-a', tempDir);
    const dirB = getProfileImageDirectoryPath('profile-b', tempDir);
    await fsPromises.writeFile(path.join(dirA, 'marker.jpg'), 'a-only');

    const filesInB = await fsPromises.readdir(dirB);

    expect(filesInB).toEqual([]);
    expect(fs.existsSync(path.join(dirB, 'marker.jpg'))).toBe(false);
  });

  it('deleting profile A leaves profile B fully intact', async () => {
    const dirB = getProfileImageDirectoryPath('profile-b', tempDir);
    await fsPromises.writeFile(path.join(dirB, 'keep.jpg'), 'b-only');
    const dbPathB = path.join(tempDir, getProfileDatabaseName('profile-b'));

    await deprovisionProfileStorage('profile-a', tempDir, tempDir);

    expect(fs.existsSync(dbPathB)).toBe(true);
    expect(fs.existsSync(dirB)).toBe(true);
    expect(await fsPromises.readdir(dirB)).toEqual(['keep.jpg']);
  });
});
