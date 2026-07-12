module.exports = {
  preset: '@react-native/jest-preset',
  // op-sqlite ships a Node.js-compatible façade (its own package.json
  // "exports" conditions would pick it up automatically under plain Node,
  // but @react-native/jest-preset's custom resolver prioritizes the
  // "react-native" field for Metro-parity, so tests need to be redirected
  // to the façade explicitly and have it pass through Babel (it's ESM).
  moduleNameMapper: {
    '^@op-engineering/op-sqlite$':
      '<rootDir>/node_modules/@op-engineering/op-sqlite/node/dist/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@op-engineering/op-sqlite)/)',
  ],
};
