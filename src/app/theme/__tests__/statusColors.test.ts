import { darkColors } from '../colors.dark';
import { lightColors } from '../colors.light';
import { statusColors } from '../statusColors';

// Regression guard for the Skipped-token contrast correction (roadmap
// 6.11 / spec.md §28a.3): the 1.3.0 draft's plain Outline label measured
// ~4.4:1 against light Surface, just under the 4.5:1 body-text bar it
// claimed to meet. This locks the corrected Secondary-token pairing so a
// future edit can't silently reintroduce the failing Outline value.
function relativeLuminanceForTest(hex: string): number {
  const normalized = hex.replace('#', '');
  const channel = (start: number) => {
    const c = parseInt(normalized.substring(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminanceForTest(hexA);
  const b = relativeLuminanceForTest(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('statusColors', () => {
  it('worn fill/onFill clears WCAG AA body-text contrast (4.5:1) in both themes', () => {
    expect(
      contrastRatio(
        statusColors.worn.fill.light,
        statusColors.worn.onFill.light,
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(statusColors.worn.fill.dark, statusColors.worn.onFill.dark),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('planned reuses Secondary Container / On Secondary Container, not a bespoke color', () => {
    expect(statusColors.planned.fill.light).toBe(
      lightColors.secondaryContainer,
    );
    expect(statusColors.planned.onFill.light).toBe(
      lightColors.onSecondaryContainer,
    );
    expect(statusColors.planned.fill.dark).toBe(darkColors.secondaryContainer);
    expect(statusColors.planned.onFill.dark).toBe(
      darkColors.onSecondaryContainer,
    );
  });

  it('skipped uses the Secondary token (not Outline) and clears 4.5:1 against Surface', () => {
    expect(statusColors.skipped.content.light).toBe(lightColors.secondary);
    expect(statusColors.skipped.content.dark).toBe(darkColors.secondary);

    expect(
      contrastRatio(statusColors.skipped.content.light, lightColors.surface),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(statusColors.skipped.content.dark, darkColors.surface),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
