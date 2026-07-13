import NativeBiometricGate from './native/NativeBiometricGate';
import type {
  BiometricAuthOutcome,
  BiometricAvailability,
  BiometricGateway,
} from '../domain/biometricGate';

const KNOWN_AVAILABILITY_STATUSES: readonly string[] = [
  'available',
  'no_hardware',
  'not_enrolled',
  'unavailable',
];

function toAvailability(status: string): BiometricAvailability {
  return KNOWN_AVAILABILITY_STATUSES.includes(status)
    ? (status as BiometricAvailability)
    : 'unavailable';
}

// Implements the profiles/domain BiometricGateway port against the
// `BiometricGate` TurboModule — the only place in the app allowed to import
// the codegen spec directly (tech-stack.md: native modules are reached only
// through Data's NativeBridge).
export class NativeBiometricGateway implements BiometricGateway {
  async checkAvailability(): Promise<BiometricAvailability> {
    const { status } = await NativeBiometricGate.checkAvailability();
    return toAvailability(status);
  }

  async authenticate(
    promptTitle: string,
    promptSubtitle: string,
  ): Promise<BiometricAuthOutcome> {
    const { status, errorMessage } = await NativeBiometricGate.authenticate(
      promptTitle,
      promptSubtitle,
    );
    if (status === 'success') {
      return { type: 'success' };
    }
    if (status === 'cancelled') {
      return { type: 'cancelled' };
    }
    return { type: 'failed', message: errorMessage };
  }
}
