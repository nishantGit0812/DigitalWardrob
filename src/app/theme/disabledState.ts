import type { MD3Theme } from 'react-native-paper';

export const DISABLED_CONTENT_OPACITY = 0.38;
export const DISABLED_CONTAINER_OPACITY = 0.12;

// MD3's standard disabled treatment (spec.md §28a.9), derived from the
// theme's own onSurface color rather than a separate hardcoded gray, so it
// automatically matches both light and dark mode. Paper's own components
// (Button, IconButton, ...) already apply this internally via their
// `disabled` prop — this token exists for custom (non-Paper) controls, like
// the profile grid's tiles, so they stay consistent with Paper's built-ins
// instead of reinventing their own gray (plan.md 6.3). Every later disabled
// custom control (category delete, Outfit Builder slots) should reuse this,
// not redefine its own.
export function disabledContentColor(theme: MD3Theme): string {
  return hexToRgba(theme.colors.onSurface, DISABLED_CONTENT_OPACITY);
}

export function disabledContainerColor(theme: MD3Theme): string {
  return hexToRgba(theme.colors.onSurface, DISABLED_CONTAINER_OPACITY);
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
