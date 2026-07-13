import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

// Codegen spec for the `profilepin` native module (spec.md §17). Hashing
// (bcrypt) and storage (Keystore-backed EncryptedSharedPreferences) both
// happen natively — the plaintext PIN only ever exists transiently on the
// JS side long enough to be passed into these calls, never persisted or
// logged there either.
export interface Spec extends TurboModule {
  setPin(profileId: string, pin: string): Promise<void>;
  verifyPin(profileId: string, pin: string): Promise<boolean>;
  hasPin(profileId: string): Promise<boolean>;
  clearPin(profileId: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ProfilePin');
