import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import type { ProfilePinGateway } from '../domain/profilePin';

const ProfilePinContext = createContext<ProfilePinGateway | undefined>(
  undefined,
);

interface ProfilePinProviderProps {
  gateway: ProfilePinGateway;
}

// Composition-root seam, matching BiometricGateContext.tsx's pattern:
// App.tsx injects the concrete NativeProfilePinGateway (Data layer) here so
// this feature's presentation only ever depends on the Domain port.
export function ProfilePinProvider({
  gateway,
  children,
}: PropsWithChildren<ProfilePinProviderProps>) {
  return (
    <ProfilePinContext.Provider value={gateway}>
      {children}
    </ProfilePinContext.Provider>
  );
}

export function useProfilePinGateway(): ProfilePinGateway {
  const gateway = useContext(ProfilePinContext);
  if (!gateway) {
    throw new Error(
      'useProfilePinGateway must be used within a ProfilePinProvider',
    );
  }
  return gateway;
}
