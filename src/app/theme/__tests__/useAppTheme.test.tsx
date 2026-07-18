import { act, renderHook } from '@testing-library/react-native';
import { ThemeModeProvider, useAppTheme, useThemeMode } from '../index';

// Combines both hooks under one render so a single `act()` toggle can be
// observed on `useAppTheme()`'s output — `renderHook` only tracks one hook
// call per render, so the toggle needs to live in the same tree.
function useTestHarness() {
  const appTheme = useAppTheme();
  const { toggle } = useThemeMode();
  return { ...appTheme, toggle };
}

describe('useAppTheme', () => {
  it('resolves the light theme bundle by default', async () => {
    const { result } = await renderHook(() => useTestHarness(), {
      wrapper: ThemeModeProvider,
    });

    expect(result.current.mode).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.paperTheme.colors.primary).toBe('#4F46E5');
  });

  it('switches every field over to dark when the mode toggles', async () => {
    const { result } = await renderHook(() => useTestHarness(), {
      wrapper: ThemeModeProvider,
    });

    await act(async () => {
      result.current.toggle();
    });

    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.paperTheme.colors.primary).toBe('#C6C1FF');
    expect(result.current.navigationTheme.dark).toBe(true);
  });
});
