import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { DocumentDirectoryPath } from '@dr.pogodin/react-native-fs';
import {
  createProfileImageDirectory,
  deleteProfileImageDirectory,
  getProfileImageDirectoryPath,
} from '../profileImageDirectory';

describe('getProfileImageDirectoryPath', () => {
  it('defaults to the app-internal files directory when baseDir is omitted', () => {
    expect(getProfileImageDirectoryPath('abc123')).toBe(
      `${DocumentDirectoryPath}/profiles/abc123`,
    );
  });

  it('rejects a profileId containing path separators or traversal', () => {
    expect(() => getProfileImageDirectoryPath('../etc')).toThrow(
      'Invalid profileId',
    );
    expect(() => getProfileImageDirectoryPath('a/b')).toThrow(
      'Invalid profileId',
    );
    expect(() => getProfileImageDirectoryPath('')).toThrow('Invalid profileId');
  });
});

describe('createProfileImageDirectory / deleteProfileImageDirectory', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobeai-fs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates the directory at the expected path', async () => {
    const profileId = 'profile-fresh';
    await createProfileImageDirectory(profileId, tempDir);

    const expectedPath = getProfileImageDirectoryPath(profileId, tempDir);
    expect(fs.existsSync(expectedPath)).toBe(true);
    expect(fs.statSync(expectedPath).isDirectory()).toBe(true);
  });

  it('deletes an existing directory and its contents', async () => {
    const profileId = 'profile-with-files';
    await createProfileImageDirectory(profileId, tempDir);
    const dirPath = getProfileImageDirectoryPath(profileId, tempDir);
    fs.writeFileSync(path.join(dirPath, 'photo.jpg'), 'fake-image');

    await deleteProfileImageDirectory(profileId, tempDir);

    expect(fs.existsSync(dirPath)).toBe(false);
  });

  it('deleting a directory that was never created is a no-op, not an error', async () => {
    await expect(
      deleteProfileImageDirectory('never-provisioned', tempDir),
    ).resolves.toBeUndefined();
  });
});
