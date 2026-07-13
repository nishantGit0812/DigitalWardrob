import { pickReadableTextColor } from '../../../../app/theme';
import { AVATAR_COLORS } from '../AvatarColorPicker';

// Regression guard for the WCAG AA contrast bug flagged in PR review:
// ProfileTile draws its initial letter over an arbitrary AVATAR_COLORS
// swatch, so every current (and future) palette entry must resolve to a
// readable pick, not just look plausible by eye.
function relativeLuminanceForTest(hex: string): number {
  const normalized = hex.replace('#', '');
  const channel = (start: number) => {
    const c = parseInt(normalized.substring(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrastAgainst(hex: string, textColor: '#FFFFFF' | '#000000') {
  const bg = relativeLuminanceForTest(hex);
  const text = textColor === '#FFFFFF' ? 1 : 0;
  const lighter = Math.max(bg, text);
  const darker = Math.min(bg, text);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('AVATAR_COLORS text contrast', () => {
  it.each(AVATAR_COLORS)(
    'picks a text color for %s that clears WCAG AA large-text contrast (3:1)',
    color => {
      const textColor = pickReadableTextColor(color) as '#FFFFFF' | '#000000';

      expect(contrastAgainst(color, textColor)).toBeGreaterThanOrEqual(3);
    },
  );
});
