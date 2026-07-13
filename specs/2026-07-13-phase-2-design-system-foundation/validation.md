# Validation — Phase 2: Design System Foundation

How to know Phase 2 is actually done. This phase ships no user-facing product feature on its own — "done" means every later phase can consume tokens, theme, icons, components, and hooks without reinventing them, and nothing already shipped (Phase 1) regresses.

## Per-Task-Group Checks

**Task Group 1 — Design Tokens**
- [ ] `tokens.ts` exports spacing, radius, elevation, stroke-width, opacity, icon/avatar/button/FAB/chip sizes, card/grid/nav spacing, animation-duration scale, and z-index/stacking policy as named constants.
- [ ] No raw pixel/dp literal exists in any `StyleSheet` outside `tokens.ts` in code this phase touches.
- [ ] Unit tests confirm no duplicate keys across token categories.

**Task Group 2 — Theme File Refactor**
- [ ] `colors.light.ts`, `colors.dark.ts`, `statusColors.ts`, `typography.ts`, `light.ts`, `dark.ts` exist per spec §58.2 structure.
- [ ] `useAppTheme()` is the only path components use to read theme values — no direct `Appearance.getColorScheme()` call introduced or left in touched files.
- [ ] Visual regression: the Phase 1 "Add Profile" disabled state (38%/12% opacity) renders identically before and after the refactor, in both light and dark mode.
- [ ] Phase 1's existing `disabledState.test.ts` and `textContrast.test.ts` assertions still pass (imports may change, behavior must not).

**Task Group 3 — Icon Pipeline**
- [ ] Material Symbols Rounded base set renders with correct fill/weight/optical-size axes (spec §46.1).
- [ ] SVGO pre-commit hook runs on staged SVG files alongside existing lint/format hooks; confirm it actually blocks/reformats an unoptimized SVG in a test commit.
- [ ] Cutout, Try-On tab (outline + filled), and backup/restore icons exist and are registered in the typed icon-name map.
- [ ] An icon file added without a map entry fails lint (or the documented review step), per tech-stack.md's registration discipline.

**Task Group 4 — Shared Components, Batches 1–2**
- [ ] Button (Filled/Outlined/Text/Tonal), Icon Button, FAB, Card, List Item, Section Header all render and pass RNTL component tests querying by role/label.
- [ ] Every interactive control in this batch meets the 48dp touch-target minimum and is TalkBack-reachable with a correct announced label.
- [ ] Contrast-compliant (WCAG) in both light and dark mode.

**Task Group 5 — Shared Components, Batches 3–4**
- [ ] Dialog, Bottom Sheet, Snackbar, Tooltip, Chip family, Badge all render and pass RNTL component tests, including Dialog/Bottom Sheet open-dismiss-focus behavior.
- [ ] Reduced-motion system setting on → every enter/exit transition in this batch collapses to instant (≤50ms), verified per component.

**Task Group 6 — Shared Components, Batches 5–6**
- [ ] Progress Indicator, Skeleton Loader, Loading Overlay, Empty State, and the Confirmation/Error/Success/Backup-Progress Dialog variants all render and pass RNTL component tests.
- [ ] Skeleton Loader's shimmer and Progress Indicator's enter transition both branch correctly on reduced-motion.
- [ ] Confirmation/Error/Success/Backup-Progress Dialogs correctly extend Task Group 5's base Dialog rather than duplicating its structure.

**Task Group 7 — Responsive Layout Hook**
- [ ] `useBreakpoint()` correctly classifies phone portrait, phone landscape, and tablet (`sw600dp`+) across simulated window-dimension values.
- [ ] `FoldingFeature` detection correctly reports folded/unfolded state against a mocked Jetpack WindowManager response.
- [ ] No component in this phase reads `useWindowDimensions` directly where `useBreakpoint()` should be used instead.

**Task Group 8 — Haptics Hook**
- [ ] Each named effect (tick/click/double-click/heavy-click) fires correctly on a physical device via the native module.
- [ ] Global on/off store key correctly gates every haptic call through `useHaptic()` — confirmed off means zero native vibration calls.
- [ ] JUnit/Espresso native module tests pass.

**Task Group 9 — Sound Hook**
- [ ] `useSound()` correctly plays each configured short UI sound effect on a physical device when enabled.
- [ ] Default state is off; confirmed no sound plays until the user explicitly enables it (store key check).
- [ ] Every sound-paired event in this phase already has a haptic and/or visual signal as its primary carrier (spec §52) — spot-checked, not sound-only.
- [ ] Camera shutter sound is confirmed untouched by this module (uses OS `MediaActionSound.SHUTTER_CLICK` directly).

**Task Group 10 — PIN-Haptic Retrofit**
- [ ] PIN Entry (Phase 1, already shipped) fires the success haptic on correct PIN and the failure haptic on incorrect PIN, on a physical device.
- [ ] Existing Phase 1 PIN Entry tests (`PinEntryScreen.test.tsx`, `pinResetFlow.integration.test.tsx`) still pass with the haptic call mocked.
- [ ] Haptic respects the Task Group 8 global on/off toggle (off → no vibration on PIN success/failure).

**Task Group 11 — Adaptive App Icon**
- [ ] Launcher icon shows the logomark construction, replacing the RN default, on a physical device.
- [ ] Monochrome themed-icon layer renders correctly under Android 12+ system theming (Material You wallpaper-based tinting).
- [ ] Notification icon renders correctly in the system notification shade.

## Phase-Level Definition of Done

- [ ] All eleven task groups above are individually checked off.
- [ ] Every later-phase-facing surface (tokens, theme, icons, the six component batches, `useBreakpoint()`, `useHaptic()`, `useSound()`) is exercised by at least one real consumer in this phase (the PIN-haptic retrofit for `useHaptic()`; component tests and the theme refactor's visual-regression check for tokens/theme/icons/components) — not shipped as untested scaffolding.
- [ ] No TODO/placeholder code paths exist anywhere in this phase's merged code.
- [ ] No new third-party runtime dependency was added for sound playback — the custom `SoundPool`-based native module decision (requirements.md Decisions) is what actually shipped, not a fallback to `react-native-sound` or a Nitro-modules package.
- [ ] `tech-stack.md`'s "Sound playback... Not yet finalized" row is updated to reflect the resolved decision once this phase merges.
- [ ] Design QA Checklist (spec §61) run on a physical device across every new component and screen surface this phase touches (alignment, contrast, dark/light, touch targets, reduced motion, responsiveness) — the first phase this checklist formally applies to.
- [ ] Manually verified on a physical Android device (not just emulator) in both light/dark mode and both orientations, per mission.md's Definition of Done.
- [ ] TalkBack pass across every new component this phase adds.
- [ ] No network permission, analytics/telemetry SDK, or crash reporter introduced — re-checked explicitly since this phase adds Dialog/Snackbar/Error-state components that could tempt a "just report this" telemetry add.
- [ ] No regression in Phase 0/Phase 1 shipped behavior: existing test suites (theme, profiles, biometric, PIN) pass unmodified in assertion intent.
- [ ] CI is green on the PR that merges this phase into `develop`.
