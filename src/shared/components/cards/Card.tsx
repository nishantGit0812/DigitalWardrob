import type { ComponentProps } from 'react';
import { Card as PaperCard } from 'react-native-paper';
import { spacing } from '../../../app/theme';

// docs/spec.md §45.2 — `mode="outlined"` is the base card: a
// `stroke-hairline` Outline-Variant border substitutes for elevation as the
// resting affordance (this app's flat "quietly technical" tone, §28a.1).
// Radius (`radius-md`/12dp) needs no override — Paper's Card computes
// `3 * theme.roundness` = `3 * 4` = 12 (confirmed against Card.tsx), which
// already matches. Elevation itself isn't exposed: confirmed against
// Card.tsx that MD3 always forwards `elevation: 0` to the underlying
// Surface for any non-`elevated` mode, so an `elevation` prop would be a
// silent no-op here — Paper's own types agree (`OutlinedCardProps` types
// `elevation` as `never`). That also means Paper's built-in press-elevation
// animation has no visible effect in outlined mode; this wrapper doesn't
// attempt to re-implement the spec's "brief elevation-1 lift" itself, since
// doing so would mean forking Card rather than a thin wrapper over it.
export type CardProps = Omit<
  ComponentProps<typeof PaperCard>,
  'mode' | 'elevation'
>;

export function Card({ contentStyle, ...rest }: CardProps) {
  return (
    <PaperCard
      mode="outlined"
      contentStyle={[{ padding: spacing.base }, contentStyle]}
      {...rest}
    />
  );
}
