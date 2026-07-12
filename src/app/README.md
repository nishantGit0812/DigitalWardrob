# App Shell

Navigation root, providers, and theming for the app shell, per `docs/spec.md`
§17.

- `navigation/` — root stack + bottom-tab setup (Task Group 5). `RootNavigator`
  now gates `MainTabs` behind `BiometricGateScreen` (Phase 1 Task Group 1);
  profile-selection will sit between them once Task Group 3 lands. Each of
  the 5 tabs (`screens/`) is a placeholder pending its real Phase 2+
  implementation.
- `theme/` — MD3 light/dark tokens via React Native Paper (Task Group 6).
  `ThemeModeContext` holds the active mode in memory only (no-op per
  plan.md 6.2 — real persistence is roadmap 8.1); Settings' dark-mode
  switch drives it for manual light/dark contrast verification.
- `store/` — not created yet. Redux Toolkit + Redux Persist (tech-stack.md,
  requirements.md's carried-over decisions) has no task group in Phase 0's
  `plan.md` — there's no global state to manage until Phase 1 (Profiles &
  Security) introduces the active profile. Wiring starts there, not here.

Component tests for `navigation/`/`theme/` screens must use React Native
Testing Library (`tech-stack.md`). `__tests__/App.test.tsx` at the repo root
predates this standard and still uses bare `react-test-renderer` — a known
gap, not the pattern to follow for anything added here.
