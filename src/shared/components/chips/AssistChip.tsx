import type { ComponentProps, ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { Chip } from './Chip';

export interface AssistChipProps
  extends Omit<ComponentProps<typeof Chip>, 'mode' | 'selected' | 'icon'> {
  icon: ComponentType<SvgProps>;
}

// docs/spec.md §45.7 — single leading icon + label, no toggle state; used
// for one-shot suggestions (e.g. a "Try this outfit" assist chip from Home
// Dashboard). `icon` is required (an Assist Chip without one is just a
// Chip); `selected` is intentionally not exposed, since this variant has
// no toggle state to represent. `icon` takes this app's own SVG component
// shape (`width`/`height`/`color`, same as FAB's `icon` prop) rather than
// Paper's raw `IconSource`, and is bridged into Paper's `{ size, color }`
// render-prop callback here — passing an SVG component straight through
// would silently drop its `size` since Paper's callback never provides
// `width`/`height` directly (same bridging IconButton/Fab already do).
export function AssistChip({ icon: Icon, ...rest }: AssistChipProps) {
  return (
    <Chip
      mode="outlined"
      // Paper's `IconSource` render-prop contract is itself a function
      // invoked inline each render, not a component type held across
      // renders — not the unstable-component pattern this rule targets.
      // eslint-disable-next-line react/no-unstable-nested-components
      icon={({ size, color }) => (
        <Icon width={size} height={size} color={color} />
      )}
      {...rest}
    />
  );
}
