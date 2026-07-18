import type { ComponentProps } from 'react';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import { Chip } from './Chip';

export type TagChipProps = Omit<
  ComponentProps<typeof Chip>,
  'mode' | 'selected' | 'closeIcon'
>;

// docs/spec.md §45.7 — same visual as a Filter Chip but represents a
// *stored* item tag (FR-9), not a filter predicate: read-only (no
// `onClose`) on Item Detail, editable with an "x" remove affordance (
// `onClose` supplied) on the Item Metadata Form. `selected` isn't exposed
// — a tag has no toggled/untoggled state, unlike a Filter Chip.
//
// `closeIcon` always defaults to the Material Symbols `close` glyph
// (materialSymbolsConfig.ts's documented per-icon import pattern, §46.1):
// left unset, Paper falls back to a hardcoded `MaterialCommunityIcon`
// (confirmed against Chip.tsx) rather than routing through its general
// `IconSource`/`Icon` system the way a supplied `closeIcon` would — this
// app has no MCI font installed at all, so that fallback would render
// nothing.
export function TagChip(props: TagChipProps) {
  return (
    <Chip
      mode="outlined"
      // Paper's `IconSource` render-prop contract is itself a function
      // invoked inline each render, not a component type held across
      // renders — not the unstable-component pattern this rule targets.
      // eslint-disable-next-line react/no-unstable-nested-components
      closeIcon={({ size, color }) => (
        <CloseIcon width={size} height={size} color={color} />
      )}
      {...props}
    />
  );
}
