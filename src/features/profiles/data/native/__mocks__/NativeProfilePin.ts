// TurboModuleRegistry.getEnforcing throws outside a native binary (no
// device/emulator in Jest) — see NativeBiometricGate's __mocks__ for the
// same rationale. Individual tests that care about specific outcomes still
// add their own jest.mock rather than relying on these defaults.
export default {
  setPin: jest.fn().mockResolvedValue(undefined),
  verifyPin: jest.fn().mockResolvedValue(false),
  hasPin: jest.fn().mockResolvedValue(false),
  clearPin: jest.fn().mockResolvedValue(undefined),
};
