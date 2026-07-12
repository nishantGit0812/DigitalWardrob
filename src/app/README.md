# App Shell

Navigation root, providers, and theming for the app shell, per `docs/spec.md`
§17.

- `navigation/` — root stack + bottom-tab setup (Task Group 5). `RootNavigator`
  is a single-screen stack wrapping `MainTabs` for now; Phase 1 adds the
  biometric gate and profile-selection screens ahead of it. Each of the 5
  tabs (`screens/`) is a placeholder pending its real Phase 2+ implementation.
- `theme/` — MD3 light/dark tokens (Task Group 6).
- `store/` — Redux store setup, Redux Persist config (Task Group 5 onward).
