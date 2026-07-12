import {
  DocumentDirectoryPath,
  exists,
  mkdir,
  unlink,
} from '@dr.pogodin/react-native-fs';
import { assertValidProfileId } from '../profileId';

// `baseDir` mirrors profileDatabase.ts's `location` param: left undefined
// in production so it resolves to the app's internal files directory
// (tech-stack.md: images live under internal files/profiles/<profileId>/,
// never external/public storage); tests pass a temp dir.
export function getProfileImageDirectoryPath(
  profileId: string,
  baseDir: string = DocumentDirectoryPath,
): string {
  assertValidProfileId(profileId);
  return `${baseDir}/profiles/${profileId}`;
}

export async function createProfileImageDirectory(
  profileId: string,
  baseDir?: string,
): Promise<void> {
  await mkdir(getProfileImageDirectoryPath(profileId, baseDir));
}

// Task Group 2.3's cascading delete: `unlink` recursively removes
// directories, and is a no-op (not an error) when the path is already gone
// — deleting a profile that was only partially provisioned must still
// succeed.
export async function deleteProfileImageDirectory(
  profileId: string,
  baseDir?: string,
): Promise<void> {
  const path = getProfileImageDirectoryPath(profileId, baseDir);
  if (await exists(path)) {
    await unlink(path);
  }
}
