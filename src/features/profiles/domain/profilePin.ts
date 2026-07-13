// Domain port for per-profile PIN protection (roadmap 1.7-1.9). Pure
// TypeScript per spec.md §18a — hashing (bcrypt) and storage
// (EncryptedSharedPreferences) both happen natively; NativeProfilePinGateway
// (Data) is the only place this ever touches the native bridge.
export interface ProfilePinGateway {
  // Overwrites any existing hash unconditionally — used both for first-time
  // setup and for the forgot-PIN reset (plan.md 5.1/5.4).
  setPin(profileId: string, pin: string): Promise<void>;

  // bcrypt-compare against the stored hash (plan.md 5.3). Resolves false,
  // never rejects, if no PIN is set for this profileId.
  verifyPin(profileId: string, pin: string): Promise<boolean>;

  // Whether this profile has opted into PIN protection at all — PINs are
  // optional per FR-4a, so most reads gate on this first.
  hasPin(profileId: string): Promise<boolean>;

  // Removes the stored hash. A no-op if none exists.
  clearPin(profileId: string): Promise<void>;
}
