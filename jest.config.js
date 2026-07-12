module.exports = {
  preset: '@react-native/jest-preset',
  // Without this, Jest's default platform resolution pulls in
  // NativeWorklets.native.ts, which touches the real native module at
  // import time and crashes outside a device/emulator.
  resolver: 'react-native-worklets/jest/resolver.js',
  // op-sqlite ships a Node.js-compatible façade (its own package.json
  // "exports" conditions would pick it up automatically under plain Node,
  // but @react-native/jest-preset's custom resolver prioritizes the
  // "react-native" field for Metro-parity, so tests need to be redirected
  // to the façade explicitly and have it pass through Babel (it's ESM).
  moduleNameMapper: {
    '^@op-engineering/op-sqlite$':
      '<rootDir>/node_modules/@op-engineering/op-sqlite/node/dist/index.js',
    // TurboModuleRegistry.getEnforcing throws without a native binary —
    // tests that care about specific gateway outcomes still add their own
    // jest.mock, which takes precedence over this fallback per test file.
    'native/NativeBiometricGate$':
      '<rootDir>/src/features/profiles/data/native/__mocks__/NativeBiometricGate.ts',
  },
  // react-native-reanimated/react-native-worklets ship ESM-only source
  // (no commonjs build) and must go through Babel like the app's own code.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@op-engineering/op-sqlite|@react-navigation|react-native-screens|react-native-reanimated|react-native-worklets)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
