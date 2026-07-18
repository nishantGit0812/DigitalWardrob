import { MD3DarkTheme } from 'react-native-paper';
import { darkColors } from '../colors.dark';
import { darkTheme } from '../dark';
import { lightTheme } from '../light';

describe('darkTheme', () => {
  it('overrides every role listed in colors.dark with the spec value', () => {
    Object.entries(darkColors).forEach(([role, value]) => {
      expect(darkTheme.colors[role as keyof typeof darkTheme.colors]).toBe(
        value,
      );
    });
  });

  it('falls back to the Paper MD3DarkTheme default for roles not overridden', () => {
    expect(darkTheme.colors.errorContainer).toBe(
      MD3DarkTheme.colors.errorContainer,
    );
  });

  it('applies the same Inter font family map as lightTheme', () => {
    expect(darkTheme.fonts.bodyMedium.fontFamily).toBe(
      lightTheme.fonts.bodyMedium.fontFamily,
    );
  });

  it('differs from lightTheme on brand-accent roles', () => {
    expect(darkTheme.colors.primary).not.toBe(lightTheme.colors.primary);
    expect(darkTheme.colors.secondary).not.toBe(lightTheme.colors.secondary);
    expect(darkTheme.colors.tertiary).not.toBe(lightTheme.colors.tertiary);
  });
});
