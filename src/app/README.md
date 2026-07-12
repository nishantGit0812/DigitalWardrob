# App Shell

Navigation root, providers, and theming for the app shell, per `docs/spec.md`
§17.

- `navigation/` — root stack + bottom-tab setup (Task Group 5).
  `RootNavigator`'s flow is now BiometricGate → ProfileSelection →
  (optionally CreateProfile/EditProfile) → MainTabs (Phase 1 Task Groups
  1/3/4); Task Group 5 will insert PIN Entry between ProfileSelection and
  MainTabs. Each of the 5 tabs (`screens/`) is a placeholder pending its
  real Phase 2+ implementation.
- `theme/` — MD3 light/dark tokens via React Native Paper (Task Group 6).
  `ThemeModeContext` holds the active mode in memory only (no-op per
  plan.md 6.2 — real persistence is roadmap 8.1); Settings' dark-mode
  switch drives it for manual light/dark contrast verification.
  `disabledState.ts` is the shared MD3 disabled-content/container token
  (Task Group 6), for custom controls that don't go through Paper's own
  `disabled` prop handling.
- `store/` — not created yet. Redux Toolkit + Redux Persist (tech-stack.md,
  requirements.md's carried-over decisions) has no task group in Phase 0's
  `plan.md` — there's no global state to manage until Phase 1 (Profiles &
  Security) introduces the active profile. Wiring starts there, not here.

Component tests for `navigation/`/`theme/` screens must use React Native
Testing Library (`tech-stack.md`). `__tests__/App.test.tsx` at the repo root
predates this standard and still uses bare `react-test-renderer` — a known
gap, not the pattern to follow for anything added here.
