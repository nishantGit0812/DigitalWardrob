import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { adaptNavigationTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { useThemeMode } from './ThemeModeContext';
import type { ThemeMode } from './ThemeModeContext';

export { lightTheme } from './light';
export { darkTheme } from './dark';
export { lightColors } from './colors.light';
export { darkColors } from './colors.dark';
export { statusColors } from './statusColors';
export { typography } from './typography';
export { ThemeModeProvider, useThemeMode } from './ThemeModeContext';
export type { ThemeMode } from './ThemeModeContext';
export {
  DISABLED_CONTENT_OPACITY,
  DISABLED_CONTAINER_OPACITY,
  disabledContentColor,
  disabledContainerColor,
} from './disabledState';
export { pickReadableTextColor } from './textContrast';
export {
  tokens,
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
} from './tokens';
export type { Tokens } from './tokens';

// Bridges Paper's MD3 colors into React Navigation's theme so the header
// and tab bar (which Paper doesn't render) switch with the mode too —
// computed once here (rather than once per light.ts/dark.ts) since
// `adaptNavigationTheme` always produces both halves in a single call.
const { LightTheme: lightNavigationTheme, DarkTheme: darkNavigationTheme } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

export { lightNavigationTheme, darkNavigationTheme };

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  paperTheme: MD3Theme;
  navigationTheme: NavigationTheme;
}

// docs/spec.md §58.1 — the single read path for the app's active theme; no
// component should branch on `mode`/`Appearance.getColorScheme()` itself to
// pick a theme object, so a future token or role change only ever touches
// this file plus the light.ts/dark.ts/colors.*.ts sources it assembles.
export function useAppTheme(): AppTheme {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return {
    mode,
    isDark,
    paperTheme: isDark ? darkTheme : lightTheme,
    navigationTheme: isDark ? darkNavigationTheme : lightNavigationTheme,
  };
}
