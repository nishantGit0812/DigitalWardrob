import type { MD3Theme } from 'react-native-paper';
import {
  DISABLED_CONTAINER_OPACITY,
  DISABLED_CONTENT_OPACITY,
  disabledContainerColor,
  disabledContentColor,
} from '../disabledState';

const theme = {
  colors: { onSurface: '#1C1B1F' },
} as MD3Theme;

describe('disabledState', () => {
  it('derives content color from onSurface at 38% opacity', () => {
    expect(disabledContentColor(theme)).toBe(
      `rgba(28, 27, 31, ${DISABLED_CONTENT_OPACITY})`,
    );
  });

  it('derives container color from onSurface at 12% opacity', () => {
    expect(disabledContainerColor(theme)).toBe(
      `rgba(28, 27, 31, ${DISABLED_CONTAINER_OPACITY})`,
    );
  });
});
