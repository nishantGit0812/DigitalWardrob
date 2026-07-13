import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { iconSize } from '../../../app/theme';

export interface MaterialSymbolProps
  extends Omit<SvgProps, 'width' | 'height'> {
  /** The idle/unselected (fill axis 0) variant. */
  Outline: ComponentType<SvgProps>;
  /** The selected/active (fill axis 1) variant. */
  Filled: ComponentType<SvgProps>;
  selected?: boolean;
  /** @default tokens.iconSize.default (24dp, spec.md §44.7) */
  size?: number;
}

// docs/spec.md §28a.5 — the standard MD3 selection-state pattern (outlined
// idle / filled selected), applied the same way whether the two SVGs come
// from the Material Symbols base set (materialSymbolsConfig.ts) or this
// app's own custom subset (assets/icons/index.ts) — both are ultimately
// just a pair of react-native-svg components switched on `selected`, so
// there is one component for the switch itself rather than one per icon.
export function MaterialSymbol({
  Outline,
  Filled,
  selected = false,
  size = iconSize.default,
  ...svgProps
}: MaterialSymbolProps) {
  const Icon = selected ? Filled : Outline;
  return <Icon width={size} height={size} {...svgProps} />;
}
