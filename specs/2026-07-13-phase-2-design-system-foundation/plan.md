# Plan — Phase 2: Design System Foundation

Numbered task groups, each independently verifiable. Sequenced so tokens and theme land before anything visual consumes them, the icon pipeline lands before components that embed icons, and the independent hooks (responsive/haptic/sound) are parallelizable with the component batches.

## Task Group 1 — Design Tokens (roadmap 2.1, 2.2)

1.1. `src/app/theme/tokens.ts`: spacing, radius, elevation, stroke-width, and opacity scales (spec §44.1–§44.6), exported as a single typed `Tokens` object.
1.2. Extend the same module with remaining size tokens: icon/avatar/button/FAB/chip heights, card/grid/nav spacing, animation-duration scale, z-index/stacking policy (spec §44.7–§44.14).
1.3. Lint rule (or documented convention, if an ESLint rule isn't feasible this task group) flagging raw pixel/dp literals in `StyleSheet` calls outside this file.
1.4. Unit test: every token category has at least one exported constant; no duplicate keys across categories.

## Task Group 2 — Theme File Refactor (roadmap 2.3)

2.1. Split Phase 1's `paperTheme.ts` into `colors.light.ts` / `colors.dark.ts` (MD3 role tables, spec §28a.3).
2.2. Extract `statusColors.ts` (Worn/Planned/Skipped semantic tokens, theme-aware by value rather than light/dark-split), carrying forward the corrected Skipped-token pairing already noted in roadmap 6.11.
2.3. Extract `typography.ts` (Inter role map, spec §28a.4) and migrate Phase 1's `textContrast.ts` logic into the new structure.
2.4. Assemble `light.ts` / `dark.ts` from the above, consumed via a single `useAppTheme()` hook; no component reads `Appearance.getColorScheme()` directly.
2.5. Migrate `disabledState.ts` (Phase 1's 38%/12% opacity token) into the new theme structure unchanged in value — visual regression check: no diff in the already-shipped "Add Profile" disabled state.
2.6. Regression test: existing Phase 1 theme unit tests (`disabledState.test.ts`, `textContrast.test.ts`) pass unmodified in behavior against the refactored structure (test files may move/import differently, but assertions don't change).

## Task Group 3 — Icon Pipeline (roadmap 2.4, 2.5)

3.1. Add `react-native-svg` and React Native Vector Icons dependencies; configure the Material Symbols Rounded base set (fill/weight/optical-size axes, spec §46.1).
3.2. Add the SVGO pre-commit hook to Husky (`removeViewBox: false`, `removeDimensions: true`, `convertShapeToPath: false`, spec §60.1), alongside the existing lint/format hooks.
3.3. Author the custom icon subset as SVG on a 24×24 artboard: cutout icon, Try-On tab outline/filled pair, backup/restore icon (spec §46.2/§46.3).
3.4. Typed icon-name map (`src/shared/assets/icons/index.ts`); each custom icon registered in the same commit that adds its SVG file.
3.5. Lint check (or documented review step) that an icon file with no map entry fails, per tech-stack.md's registration discipline.

## Task Group 4 — Shared Components, Batches 1–2 (roadmap 2.6, 2.7)

4.1. Button family: Filled/Outlined/Text/Tonal variants (spec §45.1), built on Task Group 1 tokens.
4.2. Icon Button, FAB (spec §45.1), consuming Task Group 3's icon map.
4.3. Card (base), List Item, Section Header (spec §45.2) — base-only; feature-specific card variants are explicitly out of scope for this phase.
4.4. Component tests (React Native Testing Library, per tech-stack.md's required standard): role/label queries for each component's interactive and disabled states.
4.5. Accessibility pass on this batch: 48dp touch targets, TalkBack labels, contrast check in light and dark mode.

## Task Group 5 — Shared Components, Batches 3–4 (roadmap 2.8, 2.9)

5.1. Dialog, Bottom Sheet, Snackbar, Tooltip (spec §45.6).
5.2. Chip family: base/filter/assist/tag (spec §45.7).
5.3. Badge (spec §45.7).
5.4. Component tests (RNTL) for each, including open/dismiss/focus-trap behavior for Dialog and Bottom Sheet.
5.5. Reduced-motion branch on every enter/exit transition in this batch (Dialog, Bottom Sheet, Snackbar) — collapses to instant when the system setting is on.

## Task Group 6 — Shared Components, Batches 5–6 (roadmap 2.10, 2.11)

6.1. Progress Indicator, Skeleton Loader, Loading Overlay (spec §45.8).
6.2. Empty State component (spec §45.9) — generic base; feature-specific illustrations (e.g. `il_empty_wardrobe`) are added by the phase that first needs them.
6.3. Confirmation/Error/Success/Backup-Progress Dialog variants built on Task Group 5's base Dialog (spec §45.9).
6.4. Component tests (RNTL) for each; reduced-motion branch on Skeleton Loader's shimmer and Progress Indicator's enter transition.

## Task Group 7 — Responsive Layout Hook (roadmap 2.12)

7.1. Add the `androidx.window` (Jetpack WindowManager) native dependency.
7.2. `useBreakpoint()` hook wrapping `useWindowDimensions`: phone portrait/landscape, tablet at `sw600dp`+ (spec §53).
7.3. `FoldingFeature` detection wired into the same hook for foldable hinge geometry.
7.4. Unit/integration test across simulated width classes and a mocked `FoldingFeature` state.

## Task Group 8 — Haptics Hook (roadmap 2.13)

8.1. Native haptics module (Kotlin): named effects (tick/click/double-click/heavy-click) via `VibrationEffect`/`HapticFeedbackConstants` composition (API 31+), TurboModule per tech-stack.md's one-module-per-capability convention.
8.2. `useHaptic()` JS hook as the single enforcement point over the native module.
8.3. Global on/off Settings-store key (MMKV), default on — store key only; the Settings-screen toggle row itself ships in roadmap 9.4.
8.4. Native module test (JUnit/Espresso) confirming each named effect fires without throwing when haptics are enabled, and confirming no vibration call is made when the store key is off.

## Task Group 9 — Sound Hook (roadmap 2.14)

9.1. Native sound module (Kotlin): wraps Android `SoundPool` for short, low-latency UI sound-effect playback, TurboModule per the one-module-per-capability convention (see requirements.md Decisions — resolves the tech-stack.md "not yet finalized" blocker in favor of a custom module over `react-native-sound` or a Nitro-modules package).
9.2. `useSound()` JS hook, mirroring 8.2's `useHaptic()` shape.
9.3. Global on/off Settings-store key (MMKV), **off by default** (inverse of haptics' default-on, per spec §52 and mission.md's shared-household-device consideration).
9.4. Confirm camera shutter sound (Item Capture, Phase 3) is explicitly out of this module's scope — it uses the OS `MediaActionSound.SHUTTER_CLICK` system sound directly, not this hook.
9.5. Native module test confirming sound playback is a no-op when the store key is off, and that no sound-only event lacks a haptic and/or visual signal as its primary carrier (spec §52).

## Task Group 10 — PIN-Haptic Retrofit (roadmap 2.15)

10.1. Wire Task Group 8's `useHaptic()` onto the already-shipped Phase 1 PIN Entry component: success tick, failure effect (spec §51 "PIN entry" rows).
10.2. Regression test: existing Phase 1 PIN Entry tests (`PinEntryScreen.test.tsx`, `pinResetFlow.integration.test.tsx`) still pass with the haptic call present (mocked in tests, per the existing native-module mock pattern).
10.3. Manual verification on a physical device: haptic fires on both success and failure, respects the Task Group 8 on/off toggle.

## Task Group 11 — Adaptive App Icon (roadmap 2.16)

11.1. Replace the RN default launcher icon with the logomark construction (spec §47.1–§47.6).
11.2. Monochrome themed-icon layer for Android 12+ dynamic theming (spec §48.1) — the one deliberate Material-You touchpoint in the app, at the OS icon level only.
11.3. Notification icon (spec §48.3/§48.7).
11.4. Manual verification: icon renders correctly across launcher, themed-icon (Android 12+), and notification contexts.

## Sequencing Notes

- Task Group 1 (tokens) blocks everything else — land first.
- Task Group 2 (theme refactor) depends on Task Group 1 and should land before or alongside Task Group 3, since components in Groups 4–6 consume both tokens and theme.
- Task Group 3 (icons) blocks Task Group 4 (Icon Button/FAB need the icon map) but is independent of Task Group 2.
- Task Groups 4, 5, 6 (component batches) are sequential only in roadmap numbering, not strict dependency — 5 and 6 could be parallelized once 1–3 land, but batch 6's Confirmation/Error/Success Dialogs build on batch 5's base Dialog, so 5 must precede 6.
- Task Groups 7, 8, 9 (responsive/haptic/sound hooks) are independent of each other and of the component batches — parallelizable with Groups 4–6.
- Task Group 10 depends on Task Group 8 (consumes `useHaptic()`).
- Task Group 11 has no dependency on any other task group in this phase — can land anytime, sequenced last as a low-risk closeout item.
- Suggested build order: 1 → 2 and 3 in parallel → 4 → 5 → 6, with 7/8/9 run in parallel to the 4–6 chain → 10 (after 8) → 11 (anytime, last).
