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
- `ProfilePinContext.tsx` — same seam again, for `NativeProfilePinGateway`
  (Task Group 5).
- `ProfileSelectionScreen.tsx` — the profile grid (Task Group 3.1). A tile
  press checks `hasPin` first (Task Group 5.2): PIN-protected profiles route
  to `onPinRequired` instead of straight through, and `setActiveProfileId`
  is deliberately deferred until the profile is actually unlocked (either
  here, when there's no PIN, or in `PinEntryScreen`'s `onVerified`).
- `CreateProfileScreen.tsx` — name + avatar/color picker (Task Group 3.2),
  wired to storage provisioning via `LocalProfileRepository.create`
  (Task Group 3.3), plus an optional PIN toggle (FR-4a) that signals
  `onCreated(profile, wantsPin)` so the caller can route into PIN Setup.
- `PinInput.tsx` — shared 4-digit masked entry (decorative dot row hidden
  from screen readers), used by both `PinEntryScreen.tsx` and
  `PinSetupScreen.tsx`.
- `PinEntryScreen.tsx` — gates a PIN-protected profile (Task Group 5.2/5.3);
  auto-verifies once 4 digits are entered, matching lock-screen UX. A
  "Forgot PIN?" link (Task Group 5.4) hands off to re-authenticating via
  the biometric gate.
- `PinSetupScreen.tsx` — 4-digit entry + confirm, bcrypt-hashed and stored
  natively (Task Group 5.1). Reused as-is for both first-time setup and the
  forgot-PIN reset — `setPin()` always overwrites unconditionally, so
  there's no separate "reset mode" to model in the component; the caller
  (RootNavigator) decides where `onSaved` goes next.
- `ProfileTile.tsx` / `AddProfileTile.tsx` — the grid's tile components;
  `AddProfileTile` is the first consumer of `app/theme/disabledState.ts`'s
  disabled-state token (Task Group 6), since it's a custom control rather
  than a Paper `Button` (which already handles MD3 disabled styling itself).
  `ProfileTile` also renders the Edit affordance (Task Group 4.1) as a
  separate labeled control rather than a tap-vs-long-press ambiguity on the
  tile itself.
- `AvatarColorPicker.tsx` — the swatch row, extracted so CreateProfileScreen
  and `EditProfileScreen.tsx` share one implementation (spec.md's screen
  inventory treats "Create/Edit Profile" as one screen concept).
- `EditProfileScreen.tsx` — rename/re-avatar (Task Group 4.1), the PIN
  protection toggle (spec.md's screen inventory lists this for Create/Edit
  alike), and the destructive delete flow (Task Group 4.2/4.3), confirmed
  via `Alert.alert` with explicit "cannot be undone" copy before calling
  `LocalProfileRepository.remove`. Turning the toggle on hands off to
  `onSetupPin` (needs a PIN Setup screen for the digits); turning it off is
  handled inline via `clearPin`. A `userToggledPinRef` guard stops the
  screen's own initial `hasPin()` fetch from clobbering a toggle the user
  already made before that fetch resolved.

Phase 1 is now feature-complete (Task Groups 1-6).

Component tests here must use React Native Testing Library (`tech-stack.md`),
not bare `react-test-renderer`.
