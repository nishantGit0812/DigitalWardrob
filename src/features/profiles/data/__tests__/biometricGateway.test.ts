import { NativeBiometricGateway } from '../biometricGateway';

const mockCheckAvailability = jest.fn();
const mockAuthenticate = jest.fn();

jest.mock('../native/NativeBiometricGate', () => ({
  __esModule: true,
  default: {
    checkAvailability: (...args: unknown[]) => mockCheckAvailability(...args),
    authenticate: (...args: unknown[]) => mockAuthenticate(...args),
  },
}));

beforeEach(() => {
  mockCheckAvailability.mockReset();
  mockAuthenticate.mockReset();
});

describe('NativeBiometricGateway.checkAvailability', () => {
  it.each([
    ['available', 'available'],
    ['no_hardware', 'no_hardware'],
    ['not_enrolled', 'not_enrolled'],
    ['unavailable', 'unavailable'],
  ])('maps native status %s to %s', async (nativeStatus, expected) => {
    mockCheckAvailability.mockResolvedValue({ status: nativeStatus });

    const result = await new NativeBiometricGateway().checkAvailability();

    expect(result).toBe(expected);
  });

  it('falls back to unavailable for an unrecognized native status', async () => {
    mockCheckAvailability.mockResolvedValue({ status: 'something_new' });

    const result = await new NativeBiometricGateway().checkAvailability();

    expect(result).toBe('unavailable');
  });
});

describe('NativeBiometricGateway.authenticate', () => {
  it('resolves success', async () => {
    mockAuthenticate.mockResolvedValue({ status: 'success', errorMessage: '' });

    const result = await new NativeBiometricGateway().authenticate('t', 's');

    expect(result).toEqual({ type: 'success' });
    expect(mockAuthenticate).toHaveBeenCalledWith('t', 's');
  });

  it('resolves cancelled', async () => {
    mockAuthenticate.mockResolvedValue({
      status: 'cancelled',
      errorMessage: '',
    });

    const result = await new NativeBiometricGateway().authenticate('t', 's');

    expect(result).toEqual({ type: 'cancelled' });
  });

  it('resolves failed with the native error message', async () => {
    mockAuthenticate.mockResolvedValue({
      status: 'error',
      errorMessage: 'Lockout',
    });

    const result = await new NativeBiometricGateway().authenticate('t', 's');

    expect(result).toEqual({ type: 'failed', message: 'Lockout' });
  });
});
