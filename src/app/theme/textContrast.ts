// WCAG 2.x relative luminance / contrast ratio, used to pick a readable
// text color against an arbitrary background — e.g. a profile avatar's
// initial letter drawn over its chosen avatarColor (requirements.md's
// contrast non-negotiable applies "starting this phase"; a single
// hardcoded white fails AA against several lighter accent colors).
function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Returns whichever of black/white has the higher contrast ratio against
// `backgroundHex` — always at least as good as a single fixed choice, and
// comfortably clears WCAG AA for every current AVATAR_COLORS swatch
// (verified in tests).
export function pickReadableTextColor(backgroundHex: string): string {
  const backgroundLuminance = relativeLuminance(backgroundHex);
  const whiteContrast = contrastRatio(backgroundLuminance, 1);
  const blackContrast = contrastRatio(backgroundLuminance, 0);
  return whiteContrast >= blackContrast ? '#FFFFFF' : '#000000';
}
