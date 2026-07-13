# App Shell

Navigation root, providers, and theming for the app shell, per `docs/spec.md`
§17.

- `navigation/` — root stack + bottom-tab setup. `RootNavigator`'s flow is
  now BiometricGate → ProfileSelection → (optionally CreateProfile/
  EditProfile, and for PIN-protected profiles PinEntry, whose "Forgot PIN?"
  loops back through the biometric gate into PinSetup) → MainTabs — Phase 1
  (Task Groups 1/3/4/5) complete. Each of the 5 tabs (`screens/`) is a
  placeholder pending its real Phase 2+ implementation.
- `theme/` — MD3 light/dark tokens via React Native Paper (Task Group 6).
  `ThemeModeContext` holds the active mode in memory only (no-op per
  plan.md 6.2 — real persistence is roadmap 8.1); Settings' dark-mode
  switch drives it for manual light/dark contrast verification.
  `disabledState.ts` is the shared MD3 disabled-content/container token
  (Task Group 6), for custom controls that don't go through Paper's own
  `disabled` prop handling.
  `tokens.ts` (Phase 2, Task Group 1) is the full design token set from
  spec.md §44 — spacing, radius, elevation, stroke width, opacity,
  icon/avatar/component sizing, animation duration, and z-index/stacking
  policy — as a single typed `tokens` object. A raw pixel/dp literal in a
  `StyleSheet.create()` call outside this file is a spec violation; see
  `.eslintrc.js`'s `no-restricted-syntax` override for the (best-effort,
  not exhaustive) automated check, which excludes the Phase 0/1 files that
  predate this module.
- `store/` — not created yet. Redux Toolkit + Redux Persist (tech-stack.md,
  requirements.md's carried-over decisions) has no task group in Phase 0's
  `plan.md` — there's no global state to manage until Phase 1 (Profiles &
  Security) introduces the active profile. Wiring starts there, not here.

Component tests for `navigation/`/`theme/` screens must use React Native
Testing Library (`tech-stack.md`). `__tests__/App.test.tsx` at the repo root
predates this standard and still uses bare `react-test-renderer` — a known
gap, not the pattern to follow for anything added here.
