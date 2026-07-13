// TurboModuleRegistry.getEnforcing throws outside a native binary (no
// device/emulator in Jest), so this test double stands in wherever
// NativeBiometricGate is imported without an explicit per-test jest.mock
// (see jest.config.js's moduleNameMapper). Individual tests that care about
// specific outcomes still mock BiometricGateway/BiometricGateway's consumers
// directly rather than relying on these defaults.
export default {
  checkAvailability: jest.fn().mockResolvedValue({ status: 'unavailable' }),
  authenticate: jest.fn().mockResolvedValue({
    status: 'error',
    errorMessage: 'Native module not available in tests.',
  }),
};
