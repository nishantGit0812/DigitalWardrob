import type { ComponentProps } from 'react';
import { Tooltip as PaperTooltip } from 'react-native-paper';

// docs/spec.md §45.6 — long-press-triggered (500ms hold) plain-text hint,
// supplementary for sighted users only, never a substitute for the
// `accessibilityLabel` TalkBack already reads on the wrapped icon-only
// control. Paper's own `enterTouchDelay` default is already 500ms
// (confirmed against Tooltip.tsx) — this is a pure pass-through, kept as
// its own file for a consistent shared-component import surface rather
// than reaching into `react-native-paper` directly from screens.
export type TooltipProps = ComponentProps<typeof PaperTooltip>;

export function Tooltip(props: TooltipProps) {
  return <PaperTooltip {...props} />;
}
