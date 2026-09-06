import type { ComponentProps } from 'react';
import { Dialog as PaperDialog, Portal } from 'react-native-paper';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

// docs/spec.md §45.6 — `radius-xl`/28dp needs no override: Paper's Dialog
// computes `7 * theme.roundness` = `7 * 4` = 28 (confirmed against
// Dialog.tsx), same pattern as Card/FAB's radius already matching this
// app's tokens. This wrapper's two real deltas: (1) always renders through
// a `Portal` so callers can't forget it (a Dialog rendered outside one
// stacks under sibling content instead of over it), and (2) collapses
// Paper's built-in fade transition (Modal.tsx's `Animated.timing`, driven
// by `theme.animation.scale`) to instant when the system reduced-motion
// setting is on, by overriding that one theme field to 0 (spec.md §28a.7).
// The spec's 0.9→1.0 scale-and-fade enter isn't reproduced — Paper's
// Modal only fades (confirmed against its source), and adding a transform
// would mean forking Modal rather than thinly wrapping it.
export type DialogProps = ComponentProps<typeof PaperDialog>;

export function Dialog({ theme, ...rest }: DialogProps) {
  const reduceMotionEnabled = useReducedMotionPreference();

  return (
    <Portal>
      <PaperDialog
        theme={
          reduceMotionEnabled ? { ...theme, animation: { scale: 0 } } : theme
        }
        {...rest}
      />
    </Portal>
  );
}

Dialog.Title = PaperDialog.Title;
Dialog.Content = PaperDialog.Content;
Dialog.Actions = PaperDialog.Actions;
Dialog.Icon = PaperDialog.Icon;
Dialog.ScrollArea = PaperDialog.ScrollArea;
