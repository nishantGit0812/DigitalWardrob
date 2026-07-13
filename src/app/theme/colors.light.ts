// docs/spec.md §28a.3 — light MD3 color role table. Only the roles the spec
// gives an explicit value for are listed; every other MD3Theme color role
// (errorContainer, outlineVariant, inverseSurface, elevation overlays, ...)
// falls back to React Native Paper's own MD3LightTheme defaults per §58.1's
// merge rule (see light.ts).
export const lightColors = {
  primary: '#4F46E5',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E4E1FF',
  onPrimaryContainer: '#140666',
  secondary: '#5C5B77',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E1E0F9',
  onSecondaryContainer: '#191836',
  tertiary: '#A6440A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFDBCB',
  onTertiaryContainer: '#390D00',
  error: '#B3261E',
  onError: '#FFFFFF',
  background: '#FFFBFF',
  surface: '#FFFBFF',
  onSurface: '#1B1B1F',
  surfaceVariant: '#E4E1EC',
  onSurfaceVariant: '#47464F',
  outline: '#78767F',
} as const;
