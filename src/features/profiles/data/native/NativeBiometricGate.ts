import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

// Codegen spec for the `biometric` native module (spec.md §17,
// tech-stack.md's one-module-per-capability TurboModule convention). Status
// fields are left as plain strings rather than string-literal unions —
// the Data layer (`../biometricGateway.ts`) owns mapping them onto the
// Domain's typed `BiometricAvailability`/`BiometricAuthOutcome`, keeping the
// codegen-visible surface as simple as possible.
export interface AvailabilityResult {
  status: string;
}

export interface AuthenticationResult {
  status: string;
  errorMessage: string;
}

export interface Spec extends TurboModule {
  checkAvailability(): Promise<AvailabilityResult>;
  authenticate(
    promptTitle: string,
    promptSubtitle: string,
  ): Promise<AuthenticationResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BiometricGate');
