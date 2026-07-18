import type { MD3TypescaleKey } from 'react-native-paper';

// docs/spec.md §28a.4 — Inter role map. Only the roles this app actually
// authors per screen are overridden here; the full MD3 15-step type scale
// still applies (§28a.4's "practical scale" note) — every other role falls
// back to Paper's own default via configureFonts' per-role merge (light.ts/
// dark.ts), so this file only states the app's actual customizations.
//
// Every size in the spec's table already matches Paper's MD3 baseline size
// for that role — the only real override is fontFamily (Inter, replacing
// the system default). Font *files* aren't bundled yet (bundling
// `src/shared/assets/fonts/` isn't a task in this phase's plan.md); until
// they are, RN silently falls back to the system font for an unresolved
// family name, so this is forward-wiring, not a visual change.
//
// Display Small's "tabular figures" detail (used for wear-count numbers) is
// deliberately not baked in here — `fontVariant` isn't part of Paper's
// `MD3Type` interface, and the only consumer (Statistics Dashboard, roadmap
// 6.10) doesn't exist yet. Whichever phase builds that screen applies it as
// a local style addition on top of this role, the same way any component
// layers extra styles onto a Paper theme role.
export const typography: Partial<
  Record<MD3TypescaleKey, { fontFamily: string }>
> = {
  headlineSmall: { fontFamily: 'Inter-SemiBold' },
  titleMedium: { fontFamily: 'Inter-SemiBold' },
  bodyMedium: { fontFamily: 'Inter-Regular' },
  labelLarge: { fontFamily: 'Inter-Medium' },
  displaySmall: { fontFamily: 'Inter-Bold' },
};
