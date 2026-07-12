/* eslint-env jest */
// Standard react-native-reanimated Jest setup: swaps in its JS-only mock so
// tests don't need the native worklet runtime. See the "Testing" section of
// Reanimated's docs.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
