// Manual Jest mock for react-native-mmkv. The real package is a Nitro
// Module (native binding touched at import time, not just on use), which
// crashes immediately under plain Jest/Node — its own built-in test-mode
// detection (isTest()) never gets a chance to run. This mock is an in-memory
// Map-backed stand-in, adapted from the library's own createMockMMKV, used
// automatically by Jest for any `import ... from 'react-native-mmkv'` in
// tests (Jest's manual-mock convention for node_modules packages).
type StorageValue = string | boolean | number;

export interface MockMMKVConfiguration {
  id?: string;
}

export function createMMKV(
  config: MockMMKVConfiguration = { id: 'mmkv.default' },
) {
  const storage = new Map<string, StorageValue>();

  return {
    id: config.id,
    set: (key: string, value: StorageValue): void => {
      if (key === '') throw new Error('Cannot set a value for an empty key!');
      storage.set(key, value);
    },
    getString: (key: string): string | undefined => {
      const result = storage.get(key);
      return typeof result === 'string' ? result : undefined;
    },
    getNumber: (key: string): number | undefined => {
      const result = storage.get(key);
      return typeof result === 'number' ? result : undefined;
    },
    getBoolean: (key: string): boolean | undefined => {
      const result = storage.get(key);
      return typeof result === 'boolean' ? result : undefined;
    },
    getAllKeys: (): string[] => Array.from(storage.keys()),
    contains: (key: string): boolean => storage.has(key),
    remove: (key: string): boolean => storage.delete(key),
    clearAll: (): void => storage.clear(),
  };
}
