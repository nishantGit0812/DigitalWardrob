const fs = require('fs');
const path = require('path');

// eslint-plugin-import's no-restricted-paths matches glob `target`/`from`
// patterns via minimatch, which mishandles Windows' backslash path
// separators. Literal (non-glob) paths use a path.relative-based check
// instead, which works cross-platform — so zones are generated per
// feature directory rather than with a `*` glob.
const featuresDir = path.join(__dirname, 'src/features');
const featureNames = fs.existsSync(featuresDir)
  ? fs
      .readdirSync(featuresDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  : [];

const presentationDataZones = featureNames.map(name => ({
  target: `src/features/${name}/presentation`,
  from: `src/features/${name}/data`,
  message:
    'Presentation must not import Data directly — go through the Domain layer (spec.md §18a).',
}));

module.exports = {
  root: true,
  extends: '@react-native',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      // Domain layer is pure TypeScript — no React Native or platform
      // imports allowed (spec.md §18a).
      files: ['src/features/*/domain/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react-native', 'react-native/*', 'react-native-*'],
                message:
                  'Domain layer must be pure TypeScript with no React Native or platform-specific imports (spec.md §18a).',
              },
            ],
          },
        ],
      },
    },
    {
      // Presentation may only communicate with Domain — never Data
      // directly, own feature or another's (spec.md §18a).
      files: ['src/features/*/presentation/**/*.{ts,tsx}'],
      plugins: ['import'],
      rules: {
        'import/no-restricted-paths': [
          'error',
          { zones: presentationDataZones },
        ],
      },
    },
  ],
};
