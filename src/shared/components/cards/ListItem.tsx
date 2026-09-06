import type { ComponentProps } from 'react';
import { List } from 'react-native-paper';
import { listSpacing } from '../../../app/theme';

// docs/spec.md §45.2 — Paper's `List.Item` default padding
// (`paddingVertical: 8, paddingRight: 24`, confirmed against ListItem.tsx)
// doesn't match this app's `list-item-padding-v`/12dp /
// `list-item-padding-h`/16dp tokens, so this wrapper overrides both via
// `style` (the outer touchable's padding) uniformly on every edge — the
// inner leading-icon-to-text gap (`itemV3.paddingLeft: 16`) is left alone
// since it already equals `space-base`/16dp. `list-item-min-height` is
// 56dp for a one-line item, 72dp for two-line (i.e. once `description` is
// supplied) — inferred from props rather than a separate prop, since
// Paper's own `description` presence already draws that same distinction.
export type ListItemProps = ComponentProps<typeof List.Item>;

export function ListItem({ style, description, ...rest }: ListItemProps) {
  return (
    <List.Item
      style={[
        {
          paddingVertical: listSpacing.itemPaddingV,
          paddingHorizontal: listSpacing.itemPaddingH,
          minHeight: description
            ? listSpacing.itemMinHeightTwoLine
            : listSpacing.itemMinHeightSingleLine,
        },
        style,
      ]}
      description={description}
      {...rest}
    />
  );
}
