import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Snackbar } from '../Snackbar';

// Snackbar arms its auto-dismiss `setTimeout` only inside the completion
// callback of its own entrance `Animated.timing(...).start()` (confirmed
// against Snackbar.tsx) — under the native driver, that callback never
// fires in a JS-only test environment. What this suite actually owns is
// the *duration value* passed to that timeout (4s/8s/override), so the
// animation itself is stubbed to finish immediately.
beforeAll(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start: (cb?: (result: { finished: boolean }) => void) =>
          cb?.({ finished: true }),
      } as unknown as Animated.CompositeAnimation),
  );
});

function flattenStyle(style: unknown): Record<string, unknown> {
  return ([style].flat(Infinity) as Record<string, unknown>[]).reduce(
    (acc, value) => (value ? { ...acc, ...value } : acc),
    {},
  );
}

describe('Snackbar', () => {
  it('renders its message when visible', async () => {
    const { getByText } = await render(
      <Snackbar visible onDismiss={() => {}}>
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    expect(getByText('Item deleted')).toBeTruthy();
  });

  it('auto-dismisses after 4s with no action', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    await render(
      <Snackbar visible onDismiss={onDismiss}>
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    jest.advanceTimersByTime(3999);
    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('auto-dismisses after 8s (not 4s) once an action is present', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    await render(
      <Snackbar
        visible
        onDismiss={onDismiss}
        action={{ label: 'Undo', onPress: () => {} }}
      >
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    jest.advanceTimersByTime(4000);
    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('lets a caller override the duration explicitly', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    await render(
      <Snackbar visible onDismiss={onDismiss} duration={2000}>
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    jest.advanceTimersByTime(2000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('applies radius-sm/8dp (spec.md §44.2)', async () => {
    const { getByTestId } = await render(
      <Snackbar visible onDismiss={() => {}} testID="snackbar">
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    const style = flattenStyle(getByTestId('snackbar').props.style);
    expect(style.borderRadius).toBe(8);
  });

  it('fires the action callback when its button is tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Snackbar
        visible
        onDismiss={() => {}}
        action={{ label: 'Undo', onPress }}
      >
        Item deleted
      </Snackbar>,
      { wrapper: PaperProvider },
    );

    fireEvent.press(getByText('Undo'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
