# Profiles — Data Layer

Repository implementations and DAOs for the Profiles feature, implementing
the interfaces defined in `../domain/`.

- `native/NativeBiometricGate.ts` — codegen spec for the `biometric`
  TurboModule (spec.md §17); `__mocks__/` backs it with a jest double since
  `TurboModuleRegistry.getEnforcing` throws outside a native binary.
- `biometricGateway.ts` — `NativeBiometricGateway`, the only place allowed
  to import the codegen spec directly (Task Group 1).
- `native/NativeProfilePin.ts` — codegen spec for the `profilepin`
  TurboModule (Task Group 5); bcrypt hashing and Keystore-backed
  EncryptedSharedPreferences storage both happen natively (spec.md §26) —
  the plaintext PIN only ever exists transiently on the JS side.
- `profilePinGateway.ts` — `NativeProfilePinGateway`, the only place
  allowed to import that codegen spec directly.
- `profileStorageProvisioning.ts` — `provisionProfileStorage`/
  `deprovisionProfileStorage` (Task Group 2), composing
  `shared/database`'s SQLite primitive with `shared/filesystem`'s image
  directory primitive so a profile's DB file and image directory are
  created/removed together. This is what Task Group 3.3's Create Profile
  and Task Group 4.3's Delete Profile wire up to — not the shared
  primitives directly.

- `profileRepository.ts` — `LocalProfileRepository`, implementing the
  Domain's `ProfileRepository` port against the `app_meta` MMKV registry
  (`shared/storage`) plus `profileStorageProvisioning.ts` (Task Group 3/4)
  and a `ProfilePinGateway` (Task Group 5, constructor-injected — required,
  not optional, since App.tsx always has a real one to hand it). `create()`
  provisions storage before writing the registry entry; `remove()`
  deprovisions storage, then clears the PIN hash, then removes the registry
  entry — each step gates the next so a failure never leaves the registry
  pointing at storage/PIN state that doesn't match. `remove()` also clears
  `activeProfileId` if it pointed at the deleted profile. All mutating
  methods (`create`/`update`/`remove`) are serialized through an internal
  mutation queue, since each does an unguarded read-check-write against the
  registry that two overlapping calls could otherwise interleave. The
  constructor's `dbLocation`/`imageBaseDir` params exist purely for tests
  (real disk I/O against a temp dir) — production code always passes both
  as `undefined`.

Phase 1 is now feature-complete (Task Groups 1-6, see `specs/roadmap.md`).

Tested with Jest — unit tests for repository logic, integration tests against
an in-memory/temp SQLite instance (`tech-stack.md`).
