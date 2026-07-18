import BackupRestore from './custom/ic_backup_restore.svg';
import Cutout from './custom/ic_cutout.svg';
import TryOnFilled from './custom/ic_tryon_filled.svg';
import TryOnOutline from './custom/ic_tryon_outline.svg';

// docs/spec.md §46.3/§28a.5 — the typed custom icon-name map. Every SVG
// under `./custom/` (and, once one exists, `./base/` — any Material Symbol
// re-exported as a static SVG for a non-standard fill/weight combination)
// must have an entry here in the same commit it's added; the registration
// test in `__tests__/registration.test.ts` fails the build if a file exists
// without one, rather than silently existing unused (§46.3's "Registration"
// row) — plan.md 3.5 permits a "documented review step" in place of an
// ESLint rule where a filesystem-vs-map cross-check isn't expressible as a
// pure AST lint rule; a Jest test does the same job and runs in the same
// CI gate.
export const customIcons = {
  cutout: Cutout,
  tryOnOutline: TryOnOutline,
  tryOnFilled: TryOnFilled,
  backupRestore: BackupRestore,
} as const;

export type CustomIconName = keyof typeof customIcons;
