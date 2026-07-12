# Profiles — Presentation Layer

Screens, components, hooks, and state slices for the Profiles feature. May
only import from `../domain/`, never `../data/` directly (enforced by
`.eslintrc.js`).

- `BiometricGateContext.tsx` — `BiometricGateProvider`/`useBiometricGateway`,
  the Domain-typed seam App.tsx (composition root) injects the concrete
  `NativeBiometricGateway` through.
- `BiometricGateScreen.tsx` — Task Group 1's device biometric gate; also the
  first consumer of `shared/hooks/useReducedMotionPreference`.
- `ProfileRepositoryContext.tsx` — same seam as `BiometricGateContext.tsx`,
  for the `LocalProfileRepository` (Task Group 3).
- `ProfileSelectionScreen.tsx` — the profile grid (Task Group 3.1); no PIN
  gate yet (Task Group 5 inserts one between tile selection and this
  screen's `onProfileSelected` firing).
- `CreateProfileScreen.tsx` — name + avatar/color picker (Task Group 3.2),
  wired to storage provisioning via `LocalProfileRepository.create`
  (Task Group 3.3).
- `ProfileTile.tsx` / `AddProfileTile.tsx` — the grid's tile components;
  `AddProfileTile` is the first consumer of `app/theme/disabledState.ts`'s
  disabled-state token (Task Group 6), since it's a custom control rather
  than a Paper `Button` (which already handles MD3 disabled styling itself).

Edit/Delete Profile and PIN handling (Task Group 4/5, see
`specs/roadmap.md`) still need to land here.

Component tests here must use React Native Testing Library (`tech-stack.md`),
not bare `react-test-renderer`.
