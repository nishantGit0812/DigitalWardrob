import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import { Animated, AccessibilityInfo } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { Dialog } from '../Dialog';

const isReduceMotionEnabledMock =
  AccessibilityInfo.isReduceMotionEnabled as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabledMock.mockResolvedValue(false);
});

describe('Dialog', () => {
  it('renders its content when visible', async () => {
    const { getByText } = await render(
      <Dialog visible onDismiss={() => {}}>
        <Dialog.Content>
          <Text>Delete this profile?</Text>
        </Dialog.Content>
      </Dialog>,
      { wrapper: PaperProvider },
    );

    expect(getByText('Delete this profile?')).toBeTruthy();
  });

  it('fires onDismiss when the scrim is tapped (dismissable by default)', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await render(
      <Dialog visible onDismiss={onDismiss}>
        <Dialog.Content>
          <Text>Delete this profile?</Text>
        </Dialog.Content>
      </Dialog>,
      { wrapper: PaperProvider },
    );

    fireEvent.press(getByTestId('modal-backdrop'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not fire onDismiss on scrim tap when dismissable={false}', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await render(
      <Dialog visible onDismiss={onDismiss} dismissable={false}>
        <Dialog.Content>
          <Text>Restoring backup…</Text>
        </Dialog.Content>
      </Dialog>,
      { wrapper: PaperProvider },
    );

    fireEvent.press(getByTestId('modal-backdrop'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('animates its enter transition with a non-zero duration by default', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');

    const { rerender } = await render(
      <Dialog visible={false} onDismiss={() => {}}>
        <Dialog.Content>
          <Text>Delete this profile?</Text>
        </Dialog.Content>
      </Dialog>,
      { wrapper: PaperProvider },
    );
    await act(async () => {
      rerender(
        <Dialog visible onDismiss={() => {}}>
          <Dialog.Content>
            <Text>Delete this profile?</Text>
          </Dialog.Content>
        </Dialog>,
      );
    });

    await waitFor(() => expect(timingSpy).toHaveBeenCalled());
    const [, config] = timingSpy.mock.calls[timingSpy.mock.calls.length - 1];
    expect(config.duration).toBeGreaterThan(0);
  });

  it('collapses the enter transition to instant under reduced motion', async () => {
    isReduceMotionEnabledMock.mockResolvedValue(true);
    const timingSpy = jest.spyOn(Animated, 'timing');

    const { rerender } = await render(
      <Dialog visible={false} onDismiss={() => {}}>
        <Dialog.Content>
          <Text>Delete this profile?</Text>
        </Dialog.Content>
      </Dialog>,
      { wrapper: PaperProvider },
    );
    await waitFor(() => expect(isReduceMotionEnabledMock).toHaveBeenCalled());
    await act(async () => {
      rerender(
        <Dialog visible onDismiss={() => {}}>
          <Dialog.Content>
            <Text>Delete this profile?</Text>
          </Dialog.Content>
        </Dialog>,
      );
    });

    await waitFor(() => expect(timingSpy).toHaveBeenCalled());
    const [, config] = timingSpy.mock.calls[timingSpy.mock.calls.length - 1];
    expect(config.duration).toBe(0);
  });
});
