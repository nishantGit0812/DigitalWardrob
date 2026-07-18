import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { darkColors } from './colors.dark';
import { typography } from './typography';

// See light.ts — same assembly rule, dark role table.
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors },
  fonts: configureFonts({ config: typography }),
};
