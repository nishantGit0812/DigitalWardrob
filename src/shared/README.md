# Shared

Cross-cutting code used by more than one feature, per `docs/spec.md` §17.
Populated as later task groups need it:

- `database/` — SQLite connection manager, migrations, and
  `deleteProfileDatabase` (Task Group 2.3's cascading delete).
- `filesystem/profileImageDirectory.ts` — per-profile image directory
  create/delete (Task Group 2.2/2.3), via `@dr.pogodin/react-native-fs`
  (tech-stack.md gap filled here; no filesystem library was chosen in
  Phase 0).
- `profileId.ts` — `assertValidProfileId`, shared by `database/` and
  `filesystem/` so every storage primitive agrees on what a safe profileId
  looks like.
- `hooks/useReducedMotionPreference.ts` — backs every reduced-motion branch
  (spec.md §28a.7); first consumer is the biometric gate's enter/exit fade
  (Task Group 1.4).
- `components/`, `utils/`, `types/`, `constants/`, `assets/` — reusable
  pieces added as features are built (Phase 1 onward).
- `assets/icons/` (Phase 2, Task Group 3) — `custom/` holds this app's
  wardrobe-specific SVG subset (spec.md §28a.5/§46.2/§46.3); `index.ts` is
  the typed `customIcons` map every file in `custom/`(and, once one exists,
  `base/`) must be registered in the same commit it's added, enforced by
  `__tests__/registration.test.ts` rather than an ESLint rule (a directory
  listing isn't expressible as a pure AST check). `materialSymbolsConfig.ts`
  documents the Material Symbols Rounded fill/weight/grade/opsz axis values
  (spec.md §46.1) that any future per-icon import from
  `@material-symbols/svg-400`/`-500` should use — there is no npm package
  that ships Material Symbols as a react-native-vector-icons font family
  (verified against the registry), so base icons are SVGs from those
  packages via `react-native-svg`, the same runtime the custom set uses.
- `components/icons/MaterialSymbol.tsx` — the shared outline/filled
  selection-state switch (spec.md §28a.5) both the base and custom icon
  sets render through, so there's one component for that pattern rather
  than one per icon.
- `types/svg.d.ts` — ambient `declare module '*.svg'` so a `.svg` import
  (turned into a component by `metro.config.js`'s
  `react-native-svg-transformer`) typechecks as `FC<SvgProps>`.
- `components/buttons/` (Phase 2, Task Group 4, spec.md §45.1) — `Button`
  (one component spanning Filled/Outlined/Text/Tonal via an `emphasis`
  prop, since Paper models the visual difference as a single `mode` and
  its default MD3 geometry already matches this app's tokens), `IconButton`
  (bridges this app's SVG icon set — a single component, or an
  `{ Outline, Filled }` pair for the *toggle* sub-variant — into Paper's
  `IconSource` render-prop shape; `accessibilityLabel` is mandatory, not
  optional, per spec.md §28/§24), and `Fab` (Paper's `size="medium"` default
  already reproduces `height-fab-default`/56dp and `radius-lg`/16dp; adds
  the spec's press scale-and-spring feedback, reduced-motion-gated, since
  Paper's `FAB` exposes no onPressIn/onPressOut to hook it onto directly).
- `components/cards/` (Phase 2, Task Group 4, spec.md §45.2) — `Card`
  (base-only; feature-specific variants like Wardrobe/Outfit Card are
  out of scope for this phase, built later on top of this), `ListItem`
  (overrides Paper's default `List.Item` padding to this app's
  `list-item-padding-h`/`-v` tokens and picks the one-line/two-line
  `list-item-min-height` off whether `description` is supplied), and
  `SectionHeader` (fully custom — Label Large, On-Surface-Variant, no
  Paper default to wrap).
- `components/overlays/` (Phase 2, Task Group 5, spec.md §45.6) — `Dialog`
  (always renders through a `Portal`; collapses Paper's built-in fade to
  instant under reduced motion via a `theme.animation.scale` override),
  `Snackbar` (overrides Paper's default radius/elevation to
  `radius-sm`/`elevation-3`; 4s/8s auto-dismiss duration is spec-driven,
  not Paper's own SHORT/MEDIUM/LONG constants), `Tooltip` (a pure
  pass-through — Paper's own 500ms long-press default already matches
  spec.md §45.6), and `BottomSheet` — fully custom, since no Paper
  component exists for it despite the spec's "(Paper default, themed)"
  label (confirmed against react-native-paper's own component list).
  Built on `react-native-gesture-handler`'s `Gesture.Pan` (first consumer
  of that dependency in this app — added this task group, requiring
  `GestureHandlerRootView` at the app root, see `App.tsx`) for 1:1
  drag-to-dismiss; `shouldDismissBottomSheet` (the velocity/height-fraction
  threshold decision) is exported as a pure function so it's unit-testable
  without simulating a native gesture.
- `components/chips/` (Phase 2, Task Group 5, spec.md §45.7) — `Chip`
  (base: overrides Paper's default height/radius to `height-chip`/
  `radius-full`), `FilterChip` (toggle via `selected`, with
  `showSelectedCheck` turned off — this app has no MaterialCommunityIcons
  font for Paper's default checkmark), `AssistChip` and `TagChip` (leading
  icon / close icon bridged from this app's own SVG components into
  Paper's `IconSource` render-prop shape, same pattern as `IconButton`/
  `Fab`), and `Badge` (a pure pass-through — Paper's own `size/2` radius
  calc already gives a pill/circle for any size).

Testing per `tech-stack.md`: Jest for `database/`/`utils/` unit and
integration tests; shared `components/`/`hooks/` must use React Native
Testing Library rather than bare `react-test-renderer`.
