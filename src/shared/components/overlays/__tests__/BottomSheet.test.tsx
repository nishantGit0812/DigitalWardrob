import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { BottomSheet, shouldDismissBottomSheet } from '../BottomSheet';

const isReduceMotionEnabledMock =
  AccessibilityInfo.isReduceMotionEnabled as jest.Mock;

// Mirrors App.tsx's real root: GestureDetector (used by BottomSheet) throws
// without a GestureHandlerRootView ancestor, same as Dialog/BottomSheet's
// Portal needing a PaperProvider ancestor.
function wrapper({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView>
      <PaperProvider>{children}</PaperProvider>
    </GestureHandlerRootView>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabledMock.mockResolvedValue(false);
});

describe('shouldDismissBottomSheet', () => {
  it('dismisses when flung faster than the 800dp/s velocity threshold', () => {
    expect(shouldDismissBottomSheet(0, 801, 400)).toBe(true);
  });

  it('does not dismiss just under the velocity threshold with little drag', () => {
    expect(shouldDismissBottomSheet(0, 799, 400)).toBe(false);
  });

  it('dismisses once dragged past 50% of the sheet height', () => {
    expect(shouldDismissBottomSheet(201, 0, 400)).toBe(true);
  });

  it('snaps back at exactly 50% of the sheet height', () => {
    expect(shouldDismissBottomSheet(200, 0, 400)).toBe(false);
  });
});

describe('BottomSheet', () => {
  it('renders its content when visible', async () => {
    const { getByText } = await render(
      <BottomSheet visible onDismiss={() => {}}>
        <Text>Camera</Text>
      </BottomSheet>,
      { wrapper },
    );

    expect(getByText('Camera')).toBeTruthy();
  });

  it('renders nothing when not visible', async () => {
    const { queryByText } = await render(
      <BottomSheet visible={false} onDismiss={() => {}}>
        <Text>Camera</Text>
      </BottomSheet>,
      { wrapper },
    );

    expect(queryByText('Camera')).toBeNull();
  });

  it('fires onDismiss when the scrim is tapped (dismissable by default)', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await render(
      <BottomSheet visible onDismiss={onDismiss}>
        <Text>Camera</Text>
      </BottomSheet>,
      { wrapper },
    );

    await act(async () => {
      fireEvent.press(getByTestId('bottom-sheet-scrim'));
    });

    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });

  it('does not fire onDismiss on scrim tap when dismissable={false}', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await render(
      <BottomSheet visible onDismiss={onDismiss} dismissable={false}>
        <Text>Camera</Text>
      </BottomSheet>,
      { wrapper },
    );

    fireEvent.press(getByTestId('bottom-sheet-scrim'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('unmounts its content once the scrim-triggered dismiss finishes', async () => {
    const onDismiss = jest.fn();
    const { getByTestId, queryByText } = await render(
      <BottomSheet visible onDismiss={onDismiss}>
        <Text>Camera</Text>
      </BottomSheet>,
      { wrapper },
    );

    await act(async () => {
      fireEvent.press(getByTestId('bottom-sheet-scrim'));
    });

    await waitFor(() => expect(queryByText('Camera')).toBeNull());
  });
});
