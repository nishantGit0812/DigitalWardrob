import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import type { ProfileRepository } from '../domain/profileRepository';

const ProfileRepositoryContext = createContext<ProfileRepository | undefined>(
  undefined,
);

interface ProfileRepositoryProviderProps {
  repository: ProfileRepository;
}

// Composition-root seam, matching BiometricGateContext.tsx's pattern: App.tsx
// injects the concrete LocalProfileRepository (Data layer) here so this
// feature's presentation only ever depends on the Domain port.
export function ProfileRepositoryProvider({
  repository,
  children,
}: PropsWithChildren<ProfileRepositoryProviderProps>) {
  return (
    <ProfileRepositoryContext.Provider value={repository}>
      {children}
    </ProfileRepositoryContext.Provider>
  );
}

export function useProfileRepository(): ProfileRepository {
  const repository = useContext(ProfileRepositoryContext);
  if (!repository) {
    throw new Error(
      'useProfileRepository must be used within a ProfileRepositoryProvider',
    );
  }
  return repository;
}
