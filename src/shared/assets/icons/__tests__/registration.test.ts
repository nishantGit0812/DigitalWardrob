import * as fs from 'node:fs';
import * as path from 'node:path';

// docs/spec.md §46.3's "Registration" row: an icon file with no map entry
// should fail rather than silently exist unused. A pure ESLint AST rule
// can't cross-reference a directory listing against an object's keys, so
// this Jest test does the equivalent check (plan.md 3.5's "documented
// review step" allowance) — it runs in the same `npm test` CI gate as
// every other regression test in this repo.
const iconsDir = path.join(__dirname, '..');
const indexSource = fs.readFileSync(path.join(iconsDir, 'index.ts'), 'utf8');

const registeredFolders = ['custom', 'base'].filter(folder =>
  fs.existsSync(path.join(iconsDir, folder)),
);

const svgFiles = registeredFolders.flatMap(folder => {
  const dir = path.join(iconsDir, folder);
  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => `${folder}/${file}`);
});

describe('custom icon registration', () => {
  it('finds at least one icon to register (sanity check for this test itself)', () => {
    expect(svgFiles.length).toBeGreaterThan(0);
  });

  it.each(svgFiles)('%s is imported by index.ts', relativePath => {
    expect(indexSource).toContain(`./${relativePath}`);
  });
});
