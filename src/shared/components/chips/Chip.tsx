import type { ComponentProps } from 'react';
import { Chip as PaperChip } from 'react-native-paper';
import { componentHeight, radius } from '../../../app/theme';

// docs/spec.md §45.7 — `height-chip`/32dp and `radius-full` both need an
// explicit override: Paper's Chip has no fixed height of its own (sized by
// label line-height + padding, confirmed against Chip.tsx) and its default
// border radius is `roundness * 2` = 8dp, not a full pill (confirmed
// against Chip.tsx's `defaultBorderRadius`). `FilterChip`/`AssistChip`/
// `TagChip` all build on this base rather than each re-stating the same
// two overrides.
export type ChipProps = ComponentProps<typeof PaperChip>;

export function Chip({ style, ...rest }: ChipProps) {
  return (
    <PaperChip
      style={[
        { height: componentHeight.chip, borderRadius: radius.full },
        style,
      ]}
      {...rest}
    />
  );
}
