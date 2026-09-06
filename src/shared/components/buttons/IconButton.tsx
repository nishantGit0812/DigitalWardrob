import type { ComponentProps, ComponentType } from 'react';
import { IconButton as PaperIconButton } from 'react-native-paper';
import type { SvgProps } from 'react-native-svg';
import { MaterialSymbol } from '../icons/MaterialSymbol';

type SingleIcon = ComponentType<SvgProps>;
type SelectableIcon = { Outline: SingleIcon; Filled: SingleIcon };

function isSelectableIcon(
  icon: SingleIcon | SelectableIcon,
): icon is SelectableIcon {
  return typeof icon === 'object' && icon !== null && 'Outline' in icon;
}

export interface IconButtonProps
  extends Omit<ComponentProps<typeof PaperIconButton>, 'icon'> {
  /**
   * Either a single SVG component (the *standard* sub-variant, §45.1 — e.g.
   * a Top App Bar back action with no selection state), or an
   * `{ Outline, Filled }` pair (the *toggle* sub-variant — e.g. the
   * favorite-heart icon button) switched via `selected`, mirroring
   * `MaterialSymbol`'s own outline/filled pattern (§28a.5).
   */
  icon: SingleIcon | SelectableIcon;
  /**
   * icon-only controls are the one case where a visible label can't supply
   * the accessible name, so spec.md §28/§24 makes this mandatory rather
   * than optional/inferred.
   */
  accessibilityLabel: string;
}

// docs/spec.md §45.1 — 40dp visual / 48dp touch target and `radius-full`
// both already fall out of Paper's own IconButton defaults (`buttonSize` =
// icon size + 2×8dp padding = 40dp, plus its built-in 10dp hit-slop, which
// alone clears the 48dp target — confirmed against IconButton.tsx), so this
// wrapper's only job is bridging this app's SVG icon set into Paper's
// `IconSource` render-function shape and enforcing the mandatory a11y
// label. The *toggle* sub-variant's "persistent tint when active" is
// Paper's own `selected` prop (icon recolors to Primary) layered with
// `MaterialSymbol`'s outline→filled artwork swap — no extra state or mode
// needed on top of what both already do.
export function IconButton({ icon, ...rest }: IconButtonProps) {
  return (
    <PaperIconButton
      // Paper's `IconSource` render-prop contract (Icon.d.ts) is itself a
      // function invoked inline each render, not a component type held
      // across renders — not the unstable-component pattern this rule
      // targets.
      // eslint-disable-next-line react/no-unstable-nested-components
      icon={({ size, color }) => {
        if (isSelectableIcon(icon)) {
          return (
            <MaterialSymbol
              Outline={icon.Outline}
              Filled={icon.Filled}
              selected={rest.selected}
              size={size}
              color={color}
            />
          );
        }
        const Icon = icon;
        return <Icon width={size} height={size} color={color} />;
      }}
      {...rest}
    />
  );
}
