# Profiles — Presentation Layer

Screens, components, hooks, and state slices for the Profiles feature. May
only import from `../domain/`, never `../data/` directly (enforced by
`.eslintrc.js`).

- `BiometricGateContext.tsx` — `BiometricGateProvider`/`useBiometricGateway`,
  the Domain-typed seam App.tsx (composition root) injects the concrete
  `NativeBiometricGateway` through.
- `BiometricGateScreen.tsx` — Task Group 1's device biometric gate; also the
  first consumer of `shared/hooks/useReducedMotionPreference`.

Profile Selection/Create/Edit/Delete (Task Group 2+, see `specs/roadmap.md`)
still need to land here.

Component tests here must use React Native Testing Library (`tech-stack.md`),
not bare `react-test-renderer`.
