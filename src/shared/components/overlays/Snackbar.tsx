import type { ComponentProps } from 'react';
import { Snackbar as PaperSnackbar } from 'react-native-paper';
import { radius } from '../../../app/theme';

const DURATION_NO_ACTION_MS = 4000;
const DURATION_WITH_ACTION_MS = 8000;

// docs/spec.md §45.6 — On-Surface-Inverse background and the built-in
// 0.9→1.0 scale-and-fade transition both need no override (confirmed
// against Snackbar.tsx: `colors.inverseSurface`/`inverseOnSurface`, and its
// own `opacity`-driven scale interpolation already matches the spec's
// intent). Two real deltas: `radius-sm`/8dp (Paper's default is
// `roundness`/4dp, confirmed against Snackbar.tsx) and `elevation-3`
// (Paper's default is 2) both need an explicit override; and the
// auto-dismiss duration is spec-driven (4s with no action, 8s with one)
// rather than Paper's own SHORT/MEDIUM/LONG constants, which don't line up
// with those exact values. Swipe-to-dismiss isn't implemented — Paper's
// Snackbar has no built-in gesture for it, and this app's one Gesture
// Handler consumer so far (BottomSheet) already covers the "user needs to
// dismiss something with a gesture" need for the filter-panel/image-picker
// flows; Snackbar keeps its two existing dismiss paths (auto-timeout,
// tapping its action) rather than adding a third gesture surface for this
// batch.
export type SnackbarProps = ComponentProps<typeof PaperSnackbar>;

export function Snackbar({
  duration,
  action,
  elevation = 3,
  style,
  ...rest
}: SnackbarProps) {
  return (
    <PaperSnackbar
      duration={
        duration ?? (action ? DURATION_WITH_ACTION_MS : DURATION_NO_ACTION_MS)
      }
      action={action}
      elevation={elevation}
      style={[{ borderRadius: radius.sm }, style]}
      {...rest}
    />
  );
}
