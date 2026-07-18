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

Testing per `tech-stack.md`: Jest for `database/`/`utils/` unit and
integration tests; shared `components/`/`hooks/` must use React Native
Testing Library rather than bare `react-test-renderer`.
