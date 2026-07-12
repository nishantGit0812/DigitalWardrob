import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import type { BiometricGateway } from '../domain/biometricGate';

const BiometricGateContext = createContext<BiometricGateway | undefined>(
  undefined,
);

interface BiometricGateProviderProps {
  gateway: BiometricGateway;
}

// Composition-root seam: App.tsx injects the concrete NativeBiometricGateway
// (Data layer) here so this feature's presentation only ever depends on the
// Domain port, never Data directly (spec.md §18a).
export function BiometricGateProvider({
  gateway,
  children,
}: PropsWithChildren<BiometricGateProviderProps>) {
  return (
    <BiometricGateContext.Provider value={gateway}>
      {children}
    </BiometricGateContext.Provider>
  );
}

export function useBiometricGateway(): BiometricGateway {
  const gateway = useContext(BiometricGateContext);
  if (!gateway) {
    throw new Error(
      'useBiometricGateway must be used within a BiometricGateProvider',
    );
  }
  return gateway;
}
