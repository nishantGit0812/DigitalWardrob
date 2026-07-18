import type { ComponentProps } from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { componentHeight } from '../../../app/theme';

export type ButtonEmphasis = 'filled' | 'outlined' | 'text' | 'tonal';

const EMPHASIS_TO_MODE: Record<
  ButtonEmphasis,
  NonNullable<ComponentProps<typeof PaperButton>['mode']>
> = {
  filled: 'contained',
  outlined: 'outlined',
  text: 'text',
  tonal: 'contained-tonal',
};

// docs/spec.md §45.1 — one component spanning all four MD3 emphasis levels
// (Filled/Outlined/Text/Tonal) via `emphasis`, since Paper already models
// the visual difference as a single `mode` prop and its default MD3
// geometry (40dp visual height, `radius-full` pill, `space-lg`/24dp label
// margin — confirmed against Button.tsx's own `md3Label` style — already
// matches this app's tokens with no override needed). The one real delta
// this wrapper adds is the guaranteed 48dp touch target via hit-slop
// (`height-button`, §44.9), since Paper's Button doesn't apply one itself.
export interface ButtonProps
  extends Omit<ComponentProps<typeof PaperButton>, 'mode'> {
  /** @default 'filled' */
  emphasis?: ButtonEmphasis;
}

const TOUCH_TARGET_INSET =
  (componentHeight.button.touchTarget - componentHeight.button.visual) / 2;

export function Button({ emphasis = 'filled', hitSlop, ...rest }: ButtonProps) {
  return (
    <PaperButton
      mode={EMPHASIS_TO_MODE[emphasis]}
      hitSlop={
        hitSlop ?? {
          top: TOUCH_TARGET_INSET,
          bottom: TOUCH_TARGET_INSET,
          left: TOUCH_TARGET_INSET,
          right: TOUCH_TARGET_INSET,
        }
      }
      {...rest}
    />
  );
}
