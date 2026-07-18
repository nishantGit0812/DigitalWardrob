import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { lightColors } from './colors.light';
import { typography } from './typography';

// docs/spec.md §58.2/§58.3 — assembles Paper's MD3LightTheme defaults with
// this project's color tokens (§28a.3) and font role map (§28a.4). Any role
// not explicitly overridden here falls back to Paper's own MD3 baseline
// (§58.1's merge rule), so this file only states the app's actual
// customizations rather than the full MD3 spec.
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...lightColors },
  fonts: configureFonts({ config: typography }),
};
