import type { ComponentProps } from 'react';
import { Badge as PaperBadge } from 'react-native-paper';

// docs/spec.md §45.7 — small `radius-full` dot or numeral overlay, used
// only for the wardrobe-item wear-count (plain numeral, no icon, §28a.5)
// and the Profile Selection PIN-lock indicator. Paper's Badge already
// computes its border radius as `size / 2` for any size (confirmed against
// Badge.tsx) — always a pill/circle regardless of the numeral it holds, so
// there's no token delta to apply here; kept as its own file purely for a
// consistent shared-component import surface alongside the rest of the
// Chip family (§45.7 groups Chips & Badges together).
export type BadgeProps = ComponentProps<typeof PaperBadge>;

export function Badge(props: BadgeProps) {
  return <PaperBadge {...props} />;
}
