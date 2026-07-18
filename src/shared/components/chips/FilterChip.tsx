import type { ComponentProps } from 'react';
import { Chip } from './Chip';

// docs/spec.md §45.7 — toggled state fills Secondary-Container (idle:
// Surface + outline); used for the Wardrobe category/season/color/favorite
// filters (FR-10), multi-select. `mode="outlined"` + `selected` already
// reproduces this via Paper's own selected-state color swap (the same
// pattern IconButton's toggle sub-variant relies on, Task Group 4) — no
// bespoke color logic needed on top. `showSelectedCheck` is turned off:
// Paper defaults it to `true`, rendering a checkmark through the
// MaterialCommunityIcons font this app doesn't install (§46.1's
// @material-symbols/svg-400/-500 + react-native-svg pipeline replaces it
// entirely) — the fill-color toggle alone is this app's selected signal.
export interface FilterChipProps
  extends Omit<ComponentProps<typeof Chip>, 'mode'> {
  selected: boolean;
}

export function FilterChip({ selected, ...rest }: FilterChipProps) {
  return (
    <Chip
      mode="outlined"
      selected={selected}
      showSelectedOverlay
      showSelectedCheck={false}
      {...rest}
    />
  );
}
