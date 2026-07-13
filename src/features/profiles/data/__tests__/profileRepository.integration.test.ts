import * as fsPromises from 'node:fs/promises';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { appMetaStorage } from '../../../../shared/storage/mmkv';
import { getProfileDatabaseName } from '../../../../shared/database';
import { getProfileImageDirectoryPath } from '../../../../shared/filesystem';
import type { ProfilePinGateway } from '../../domain/profilePin';
import { LocalProfileRepository } from '../profileRepository';

function fakePinGateway(): ProfilePinGateway {
  return {
    setPin: jest.fn().mockResolvedValue(undefined),
    verifyPin: jest.fn().mockResolvedValue(false),
    hasPin: jest.fn().mockResolvedValue(false),
    clearPin: jest.fn().mockResolvedValue(undefined),
  };
}

// Exercises the full real Data-layer stack (MMKV registry + op-sqlite's
// Node façade + the RNFS Jest mock backed by real node:fs) end to end,
// rather than mocking profileStorageProvisioning as profileRepository.test.ts
// does — Task Group 4.4 wants proof through the actual repository, not just
// the underlying primitive (already covered by
// profileStorageProvisioning.test.ts's own isolation describe block).
describe('LocalProfileRepository storage isolation on delete', () => {
  let tempDir: string;
  let repo: LocalProfileRepository;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'wardrobeai-repo-isolation-test-'),
    );
    appMetaStorage.clearAll();
    repo = new LocalProfileRepository(fakePinGateway(), tempDir, tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('deleting profile A removes its DB file and image directory while leaving profile B untouched', async () => {
    const profileA = await repo.create('Priya', '#E57373');
    const profileB = await repo.create('Devraj', '#4FC3F7');

    const dbPathA = path.join(tempDir, getProfileDatabaseName(profileA.id));
    const dbPathB = path.join(tempDir, getProfileDatabaseName(profileB.id));
    const dirA = getProfileImageDirectoryPath(profileA.id, tempDir);
    const dirB = getProfileImageDirectoryPath(profileB.id, tempDir);
    await fsPromises.writeFile(path.join(dirB, 'keep.jpg'), 'b-only');

    await repo.remove(profileA.id);

    expect(fs.existsSync(dbPathA)).toBe(false);
    expect(fs.existsSync(dirA)).toBe(false);
    expect(fs.existsSync(dbPathB)).toBe(true);
    expect(fs.existsSync(dirB)).toBe(true);
    expect(await fsPromises.readdir(dirB)).toEqual(['keep.jpg']);

    expect((await repo.list()).map(p => p.id)).toEqual([profileB.id]);
  });
});
