// Design Token Specification (docs/spec.md §44). Every visual constant used
// anywhere in the app — spacing, radius, elevation, opacity, stroke width,
// icon/avatar/component sizing, animation duration, and stacking order —
// is named here once and consumed from here, rather than re-decided as a
// per-screen judgment call (§44 intro). A raw pixel/dp literal in a
// `StyleSheet.create()` call outside this file is a spec violation, not a
// style preference; see `.eslintrc.js`'s `no-restricted-syntax` override for
// the (best-effort, not exhaustive — see that file's comment) enforcement.

// §44.1 — 4dp base unit, whole multiples of the 48dp touch-target grid (NFR-7).
export const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// §44.2 — MD3 shape scale. Nothing outside this list is used anywhere in the app.
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 9999,
} as const;

// §44.3 — MD3 tonal elevation: Android `elevation` dp (drives the system
// shadow) paired with the dark-theme tonal-primary surface-tint overlay
// percentage (light theme relies on shadow only — tonal overlays on a light
// surface read as muddy per MD3 guidance).
export const elevation = {
  0: { dp: 0, darkSurfaceTint: 0 },
  1: { dp: 1, darkSurfaceTint: 0.05 },
  2: { dp: 3, darkSurfaceTint: 0.08 },
  3: { dp: 6, darkSurfaceTint: 0.11 },
  4: { dp: 8, darkSurfaceTint: 0.12 },
  5: { dp: 12, darkSurfaceTint: 0.14 },
} as const;

// §44.4 — MD3 *interaction* state-layer overlays, expressed as On-Surface
// (or On-Primary, for filled surfaces) opacity. Distinct from `elevation`,
// which Android renders as a physical shadow automatically.
export const stateOpacity = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
  dragged: 0.16,
  scrim: 0.32,
  disabledContent: 0.38,
  disabledContainer: 0.12,
} as const;

// §44.5
export const strokeWidth = {
  hairline: 1,
  focus: 2,
  icon: 2,
} as const;

// §44.6 — Non-interaction opacity values.
export const opacity = {
  cutoutChecker: 0.06,
  imageLoading: 0.12,
  illustrationBg: 1,
} as const;

// §44.7
export const iconSize = {
  inline: 16,
  default: 24,
  medium: 32,
  large: 48,
  illustration: 96,
} as const;

// §44.8
export const avatarSize = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
} as const;

// §44.9 — `visual` is the rendered size; `touchTarget` is the minimum hit-slop
// size satisfying NFR-7's 48dp minimum without inflating visual density.
export const componentHeight = {
  button: { visual: 40, touchTarget: 48 },
  iconButton: { visual: 40, touchTarget: 48 },
  fabSmall: 40,
  fabDefault: 56,
  fabLarge: 96,
  chip: 32,
} as const;

// §44.10
export const cardSpacing = {
  padding: spacing.base,
  imageGap: spacing.md,
  gutter: spacing.sm,
} as const;

export const listSpacing = {
  itemPaddingV: spacing.md,
  itemPaddingH: spacing.base,
  itemMinHeightSingleLine: 56,
  itemMinHeightTwoLine: 72,
} as const;

// §44.11
export const gridSpacing = {
  margin: 16,
  gutter: spacing.sm,
  columnsPhonePortrait: 2,
  columnsPhoneLandscape: 3,
  columnsTablet: 4,
} as const;

// §44.12
export const navigationSpacing = {
  topAppBarHeight: 64,
  bottomNavHeight: 80,
  bottomNavIconSize: iconSize.default,
  bottomNavLabelSize: 12,
  navRailWidthCollapsed: 80,
  navRailWidthExpanded: 220,
} as const;

// §44.13 — MD3 duration scale. `curve` names the labeled easing curve from
// the spec's table; only `standard` and `emphasizedDecelerate` have a
// concrete cubic-bezier formula given in docs/spec.md §44.13 — the
// `standard-decelerate` and `emphasized` labels appear in that table without
// a formula in this section, so they're recorded as-labeled rather than
// guessed, and should be resolved (likely in §28a.7) before Reanimated
// configures a curve for the durations that reference them.
export const animationDuration = {
  short1: { ms: 50, curve: 'standard' },
  short2: { ms: 100, curve: 'standard' },
  short3: { ms: 150, curve: 'standard' },
  short4: { ms: 200, curve: 'standard' },
  medium1: { ms: 250, curve: 'standard-decelerate' },
  medium2: { ms: 300, curve: 'standard-decelerate' },
  medium3: { ms: 350, curve: 'standard' },
  medium4: { ms: 400, curve: 'standard' },
  long1: { ms: 450, curve: 'emphasized-decelerate' },
  long2: { ms: 500, curve: 'emphasized' },
} as const;

// The two easing curves docs/spec.md §44.13 gives a concrete formula for.
export const easingCurve = {
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
} as const;

// §44.14 — within a single screen, RN has no cascade z-index; this fixes an
// explicit layering policy so overlapping UI is deterministic. Implemented
// via a single app-root `<Portal>` per layer band rather than manual
// z-index math per screen.
export const zIndex = {
  content: 0,
  stickyHeader: 1,
  floatingAction: 2,
  overlayScrim: 10,
  overlayContent: 11,
  loadingOverlay: 20,
  transientFeedback: 30,
} as const;

export const tokens = {
  spacing,
  radius,
  elevation,
  stateOpacity,
  strokeWidth,
  opacity,
  iconSize,
  avatarSize,
  componentHeight,
  cardSpacing,
  listSpacing,
  gridSpacing,
  navigationSpacing,
  animationDuration,
  easingCurve,
  zIndex,
} as const;

export type Tokens = typeof tokens;
