import { MD3LightTheme } from 'react-native-paper';
import { lightColors } from '../colors.light';
import { lightTheme } from '../light';

describe('lightTheme', () => {
  it('overrides every role listed in colors.light with the spec value', () => {
    Object.entries(lightColors).forEach(([role, value]) => {
      expect(lightTheme.colors[role as keyof typeof lightTheme.colors]).toBe(
        value,
      );
    });
  });

  it('falls back to the Paper MD3LightTheme default for roles not overridden', () => {
    expect(lightTheme.colors.errorContainer).toBe(
      MD3LightTheme.colors.errorContainer,
    );
  });

  it('applies the Inter font family to the roles this app authors', () => {
    expect(lightTheme.fonts.bodyMedium.fontFamily).toBe('Inter-Regular');
    expect(lightTheme.fonts.headlineSmall.fontFamily).toBe('Inter-SemiBold');
    expect(lightTheme.fonts.titleMedium.fontFamily).toBe('Inter-SemiBold');
    expect(lightTheme.fonts.labelLarge.fontFamily).toBe('Inter-Medium');
    expect(lightTheme.fonts.displaySmall.fontFamily).toBe('Inter-Bold');
  });

  it('leaves un-authored font roles at the Paper default family', () => {
    expect(lightTheme.fonts.bodyLarge.fontFamily).toBe(
      MD3LightTheme.fonts.bodyLarge.fontFamily,
    );
  });

  it('does not mutate the shared Paper MD3LightTheme.colors object', () => {
    expect(MD3LightTheme.colors.primary).not.toBe(lightColors.primary);
  });
});
