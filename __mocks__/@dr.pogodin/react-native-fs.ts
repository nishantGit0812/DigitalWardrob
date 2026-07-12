// Manual Jest mock for @dr.pogodin/react-native-fs (Jest's manual-mock
// convention for node_modules packages, matching __mocks__/react-native-mmkv.ts
// — the real package is a native module that isn't reachable under plain
// Jest/Node). Backed by real node:fs/promises rather than an in-memory stub
// so profileImageDirectory/profileStorageProvisioning tests exercise genuine
// disk I/O (the same rigor profileDatabase.test.ts gets from op-sqlite's own
// Node façade) — every test overrides `baseDir` to a temp directory, so
// DocumentDirectoryPath below is only a placeholder default.
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

export const DocumentDirectoryPath = path.join(
  os.tmpdir(),
  'wardrobeai-jest-rnfs-default',
);

export async function mkdir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

// Mirrors react-native-fs's real behavior: removes a file, or a directory
// and its contents recursively.
export async function unlink(itemPath: string): Promise<void> {
  await fs.rm(itemPath, { recursive: true, force: true });
}

export async function exists(itemPath: string): Promise<boolean> {
  try {
    await fs.access(itemPath);
    return true;
  } catch {
    return false;
  }
}
