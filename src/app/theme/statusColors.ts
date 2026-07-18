import { darkColors } from './colors.dark';
import { lightColors } from './colors.light';

// docs/spec.md §28a.3 — Worn/Planned/Skipped semantic status tokens
// (Planner/Statistics). Kept deliberately separate from the Tertiary brand
// accent, since "worn" is a functional/positive signal, not a brand moment.
// Shared rather than light/dark-split (unlike colors.light.ts/colors.dark.ts)
// because each status is already theme-aware per-value — every entry below
// carries both its light and dark hex directly.
export const statusColors = {
  worn: {
    fill: { light: '#2E7D5B', dark: '#8FD9B4' },
    onFill: { light: '#FFFFFF', dark: '#0B3823' },
  },
  planned: {
    // No bespoke color of its own — reuses Secondary Container / On
    // Secondary Container from the MD3 role table rather than a new literal.
    fill: {
      light: lightColors.secondaryContainer,
      dark: darkColors.secondaryContainer,
    },
    onFill: {
      light: lightColors.onSecondaryContainer,
      dark: darkColors.onSecondaryContainer,
    },
  },
  skipped: {
    // Corrected in the 1.4.0 UX pass (roadmap 6.11): the 1.3.0 draft's plain
    // Outline label measured ~4.4:1 against light Surface — enough for
    // icons/large text (3:1) but just short of the 4.5:1 body-text bar this
    // section itself claims. Swapped to the Secondary token, which is
    // already verified at body-text contrast elsewhere in this table.
    // De-emphasized text/icon only — intentionally no fill, no separate
    // on-color.
    content: { light: lightColors.secondary, dark: darkColors.secondary },
  },
} as const;
