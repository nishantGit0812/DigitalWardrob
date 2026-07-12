import { createMMKV } from 'react-native-mmkv';

// The shared app_meta store (spec.md §15): profile registry + global
// settings. Sensitive per-profile data (PIN hash/salt) is explicitly kept
// out of MMKV per spec.md §26 Security Strategy — that lives in
// EncryptedSharedPreferences instead, added when Phase 1 implements it.
export const appMetaStorage = createMMKV({ id: 'app_meta' });
