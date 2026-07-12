import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Paper's stock MD3 tokens are already WCAG-contrast-compliant (NFR-7);
// custom brand tokens can replace these per-key once design work exists.
export const lightTheme: MD3Theme = { ...MD3LightTheme };
export const darkTheme: MD3Theme = { ...MD3DarkTheme };

// Bridges Paper's MD3 colors into React Navigation's theme so the header
// and tab bar (which Paper doesn't render) switch with the toggle too —
// otherwise 6.3's dark-mode check would only cover Paper components.
const { LightTheme: navigationLightTheme, DarkTheme: navigationDarkTheme } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

export const lightNavigationTheme: NavigationTheme = navigationLightTheme;
export const darkNavigationTheme: NavigationTheme = navigationDarkTheme;
