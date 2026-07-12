# Profiles — Data Layer

Repository implementations and DAOs for the Profiles feature, implementing
the interfaces defined in `../domain/`.

- `native/NativeBiometricGate.ts` — codegen spec for the `biometric`
  TurboModule (spec.md §17); `__mocks__/` backs it with a jest double since
  `TurboModuleRegistry.getEnforcing` throws outside a native binary.
- `biometricGateway.ts` — `NativeBiometricGateway`, the only place allowed
  to import the codegen spec directly (Task Group 1).

Profile creation/CRUD (Task Group 2+, see `specs/roadmap.md`) still needs to
land here.

Tested with Jest — unit tests for repository logic, integration tests against
an in-memory/temp SQLite instance (`tech-stack.md`).
