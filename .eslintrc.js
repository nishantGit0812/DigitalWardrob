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
    {
      // Design tokens (spec.md §44) are named constants in
      // `src/app/theme/tokens.ts`; a raw pixel/dp literal in a
      // `StyleSheet.create()` call anywhere else is a spec violation, not a
      // style preference (plan.md Task Group 1.3). This selector-based check
      // is a best-effort, not exhaustive, guard: it catches the clearest,
      // most common token-backed properties (padding/margin/gap, radius,
      // width, elevation, zIndex, fontSize/lineHeight), including their
      // negative forms (e.g. `marginTop: -16`). It deliberately does NOT
      // flag `width`/`height`/`top`/`bottom`/`left`/`right`/`flex`/`opacity`
      // — those are legitimately arbitrary as often as they're token-backed
      // (image aspect ratios, flex ratios, one-off absolute positioning),
      // and a blanket rule there would be noise, not signal. Reviewers
      // should still hold PRs to tokens.ts for those properties per
      // requirements.md and tokens.ts's own header comment; this rule is a
      // net, not a guarantee.
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: [
        'src/app/theme/tokens.ts',
        // Phase 0/1 predate tokens.ts and are explicitly not retroactively
        // rewired to it (requirements.md's carried-over non-retroactive
        // policy, mirroring the Design QA/Handoff Checklists' own "Phase 0/1
        // predate this and are not retroactively audited" stance). New code
        // from Phase 2 onward is bound by this rule with no exclusion.
        'src/app/navigation/screens/SettingsScreen.tsx',
        'src/features/profiles/presentation/AddProfileTile.tsx',
        'src/features/profiles/presentation/AvatarColorPicker.tsx',
        'src/features/profiles/presentation/BiometricGateScreen.tsx',
        'src/features/profiles/presentation/CreateProfileScreen.tsx',
        'src/features/profiles/presentation/EditProfileScreen.tsx',
        'src/features/profiles/presentation/PinEntryScreen.tsx',
        'src/features/profiles/presentation/PinInput.tsx',
        'src/features/profiles/presentation/PinSetupScreen.tsx',
        'src/features/profiles/presentation/ProfileSelectionScreen.tsx',
        'src/features/profiles/presentation/ProfileTile.tsx',
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create'] Property[key.name=/^(padding\\w*|margin\\w*|gap|rowGap|columnGap|borderRadius|border\\w*Radius|borderWidth|border\\w*Width|elevation|zIndex|fontSize|lineHeight)$/] > Literal[raw=/^\\d+(\\.\\d+)?$/]",
            message:
              'Use a named token from src/app/theme/tokens.ts instead of a raw dp/px literal in StyleSheet.create() (spec.md §44).',
          },
          {
            selector:
              "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create'] Property[key.name=/^(padding\\w*|margin\\w*|gap|rowGap|columnGap|borderRadius|border\\w*Radius|borderWidth|border\\w*Width|elevation|zIndex|fontSize|lineHeight)$/] > UnaryExpression[operator='-'] > Literal[raw=/^\\d+(\\.\\d+)?$/]",
            message:
              'Use a named token from src/app/theme/tokens.ts instead of a raw dp/px literal in StyleSheet.create() (spec.md §44).',
          },
        ],
      },
    },
  ],
};
