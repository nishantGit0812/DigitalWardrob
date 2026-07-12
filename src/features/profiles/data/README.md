# Profiles — Data Layer

Repository implementations and DAOs for the Profiles feature, implementing
the interfaces defined in `../domain/`.

- `native/NativeBiometricGate.ts` — codegen spec for the `biometric`
  TurboModule (spec.md §17); `__mocks__/` backs it with a jest double since
  `TurboModuleRegistry.getEnforcing` throws outside a native binary.
- `biometricGateway.ts` — `NativeBiometricGateway`, the only place allowed
  to import the codegen spec directly (Task Group 1).
- `profileStorageProvisioning.ts` — `provisionProfileStorage`/
  `deprovisionProfileStorage` (Task Group 2), composing
  `shared/database`'s SQLite primitive with `shared/filesystem`'s image
  directory primitive so a profile's DB file and image directory are
  created/removed together. This is what Task Group 3.3's Create Profile
  and Task Group 4.3's Delete Profile wire up to — not the shared
  primitives directly.

- `profileRepository.ts` — `LocalProfileRepository`, implementing the
  Domain's `ProfileRepository` port against the `app_meta` MMKV registry
  (`shared/storage`) plus `profileStorageProvisioning.ts` (Task Group 3/4).
  `create()` provisions storage before writing the registry entry, and
  `remove()` deprovisions storage before removing it — both so a failure
  never leaves a registry entry pointing at storage that doesn't match its
  state. `remove()` also clears `activeProfileId` if it pointed at the
  deleted profile. The constructor's `dbLocation`/`imageBaseDir` params
  exist purely for tests (real disk I/O against a temp dir, mirroring
  `profileStorageProvisioning.ts`'s own override params) — production
  code always uses `new LocalProfileRepository()` with both omitted.

PIN handling (Task Group 5, see `specs/roadmap.md`) still needs to land
here — including extending `remove()`'s cascading delete to also clear a
profile's PIN hash once that storage exists.

Tested with Jest — unit tests for repository logic, integration tests against
an in-memory/temp SQLite instance (`tech-stack.md`).
