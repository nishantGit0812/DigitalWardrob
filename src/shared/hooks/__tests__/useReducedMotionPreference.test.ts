import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotionPreference } from '../useReducedMotionPreference';

// `addEventListener` is overloaded per event name; a plain jest.Mock cast
// keeps the mock configuration below from having to satisfy every overload.
const addEventListenerMock = AccessibilityInfo.addEventListener as jest.Mock;
const isReduceMotionEnabledMock =
  AccessibilityInfo.isReduceMotionEnabled as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabledMock.mockResolvedValue(false);
  addEventListenerMock.mockReturnValue({ remove: jest.fn() });
});

describe('useReducedMotionPreference', () => {
  it('starts false and adopts the system value once it resolves', async () => {
    isReduceMotionEnabledMock.mockResolvedValue(true);

    const { result } = await renderHook(() => useReducedMotionPreference());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('tracks the reduceMotionChanged event after mount', async () => {
    let changeHandler: ((enabled: boolean) => void) | undefined;
    addEventListenerMock.mockImplementation((_event, handler) => {
      changeHandler = handler;
      return { remove: jest.fn() };
    });

    const { result } = await renderHook(() => useReducedMotionPreference());
    await waitFor(() => expect(result.current).toBe(false));

    await act(async () => {
      changeHandler?.(true);
    });

    expect(result.current).toBe(true);
  });

  it('removes its subscription on unmount', async () => {
    const remove = jest.fn();
    addEventListenerMock.mockReturnValue({ remove });

    const { unmount } = await renderHook(() => useReducedMotionPreference());
    await unmount();

    expect(remove).toHaveBeenCalled();
  });
});
