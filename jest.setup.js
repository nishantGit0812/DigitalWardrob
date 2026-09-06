/* eslint-env jest */
// Standard react-native-reanimated Jest setup: swaps in its JS-only mock so
// tests don't need the native worklet runtime. See the "Testing" section of
// Reanimated's docs.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Standard react-native-gesture-handler Jest setup (its own docs' "Testing"
// section) — swaps in its JS-only mocks so Gesture.Pan()-driven components
// (BottomSheet) don't need the native gesture runtime under test.
require('react-native-gesture-handler/jestSetup');
