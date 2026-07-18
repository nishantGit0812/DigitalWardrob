// docs/spec.md §46.1 — Material Symbols axis configuration. Not the legacy
// "Material Icons" font: Symbols is the variable-axis successor and the
// only one with the Rounded style this app uses (§28a.5).
//
// There is no npm package that exposes Material Symbols as a
// react-native-vector-icons font family (verified against the live
// registry while building this task group — only the legacy Material
// Icons/Material Design Icons fonts are published there). Base icons are
// instead sourced as pre-built SVGs from `@material-symbols/svg-400` /
// `@material-symbols/svg-500` (weight 400/500, matching the two rows
// below) and rendered via `react-native-svg`, the same runtime every
// custom icon in `./custom/` already uses — one rendering path for every
// icon in the app, base or custom.
//
// Metro resolves `.svg` imports statically (see metro.config.js), so a
// specific glyph is still a normal, explicit import at its call site, e.g.:
//
//   import SearchOutline from '@material-symbols/svg-400/rounded/search.svg';
//   import SearchFilled from '@material-symbols/svg-500/rounded/search-fill.svg';
//
// — this config documents the fixed axis values every such import should
// use; it is not itself a dynamic icon loader.
export const materialSymbolsConfig = {
  family: 'Material Symbols',
  style: 'rounded',
  fill: {
    idle: 0,
    selected: 1,
  },
  weight: {
    idle: 400,
    selected: 500,
  },
  grade: 0,
  opticalSize: 24,
} as const;
