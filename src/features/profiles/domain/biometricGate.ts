// Domain port for the device biometric gate (roadmap 1.1). Pure TypeScript
// per spec.md §18a — the Data layer's NativeBiometricGateway is the only
// place this ever touches the native bridge.

export type BiometricAvailability =
  | 'available'
  | 'no_hardware'
  | 'not_enrolled'
  | 'unavailable';

export type BiometricAuthOutcome =
  | { type: 'success' }
  | { type: 'cancelled' }
  | { type: 'failed'; message: string };

export interface BiometricGateway {
  checkAvailability(): Promise<BiometricAvailability>;
  authenticate(
    promptTitle: string,
    promptSubtitle: string,
  ): Promise<BiometricAuthOutcome>;
}
