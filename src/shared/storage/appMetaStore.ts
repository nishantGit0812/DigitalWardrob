import { appMetaStorage } from './mmkv';

// Registry shape reviewed against roadmap.md 1.3/1.4: Phase 1's Create
// Profile writes name + avatarColor here, then provisions a per-profile DB
// file/image directory keyed off `id`. No CRUD yet — schema only.
export interface ProfileRegistryEntry {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

const PROFILES_KEY = 'profiles';
const ACTIVE_PROFILE_ID_KEY = 'activeProfileId';
const THEME_MODE_KEY = 'themeMode';
const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';

export function getProfileRegistry(): ProfileRegistryEntry[] {
  const raw = appMetaStorage.getString(PROFILES_KEY);
  return raw ? (JSON.parse(raw) as ProfileRegistryEntry[]) : [];
}

export function setProfileRegistry(profiles: ProfileRegistryEntry[]): void {
  appMetaStorage.set(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | undefined {
  return appMetaStorage.getString(ACTIVE_PROFILE_ID_KEY);
}

export function setActiveProfileId(profileId: string): void {
  appMetaStorage.set(ACTIVE_PROFILE_ID_KEY, profileId);
}

// Task Group 4.3: deleting the currently-active profile must not leave a
// stale pointer at a profile whose storage no longer exists.
export function clearActiveProfileId(): void {
  appMetaStorage.remove(ACTIVE_PROFILE_ID_KEY);
}

export function getThemeMode(): ThemeMode {
  const value = appMetaStorage.getString(THEME_MODE_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function setThemeMode(mode: ThemeMode): void {
  appMetaStorage.set(THEME_MODE_KEY, mode);
}

export function getOnboardingComplete(): boolean {
  return appMetaStorage.getBoolean(ONBOARDING_COMPLETE_KEY) ?? false;
}

export function setOnboardingComplete(value: boolean): void {
  appMetaStorage.set(ONBOARDING_COMPLETE_KEY, value);
}
