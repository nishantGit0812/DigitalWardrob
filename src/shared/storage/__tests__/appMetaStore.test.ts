import { appMetaStorage } from '../mmkv';
import {
  getActiveProfileId,
  getOnboardingComplete,
  getProfileRegistry,
  getThemeMode,
  setActiveProfileId,
  setOnboardingComplete,
  setProfileRegistry,
  setThemeMode,
  type ProfileRegistryEntry,
} from '../appMetaStore';

beforeEach(() => {
  appMetaStorage.clearAll();
});

describe('profile registry', () => {
  it('is empty by default', () => {
    expect(getProfileRegistry()).toEqual([]);
  });

  it('reads back what it writes synchronously, matching the Phase 1 shape', () => {
    const entries: ProfileRegistryEntry[] = [
      {
        id: 'p1',
        name: 'Priya',
        avatarColor: '#FF5733',
        createdAt: '2026-07-12T00:00:00.000Z',
      },
      {
        id: 'p2',
        name: 'Devraj',
        avatarColor: '#337BFF',
        createdAt: '2026-07-12T00:01:00.000Z',
      },
    ];

    // No `await` anywhere in this test — a synchronous call proves MMKV
    // (not AsyncStorage) is actually wired up, per plan.md 4.3.
    setProfileRegistry(entries);
    expect(getProfileRegistry()).toEqual(entries);
  });
});

describe('active profile id', () => {
  it('is undefined by default', () => {
    expect(getActiveProfileId()).toBeUndefined();
  });

  it('round-trips synchronously', () => {
    setActiveProfileId('p1');
    expect(getActiveProfileId()).toBe('p1');
  });
});

describe('theme mode', () => {
  it('defaults to system', () => {
    expect(getThemeMode()).toBe('system');
  });

  it('round-trips light and dark', () => {
    setThemeMode('dark');
    expect(getThemeMode()).toBe('dark');

    setThemeMode('light');
    expect(getThemeMode()).toBe('light');
  });
});

describe('onboarding complete flag', () => {
  it('defaults to false', () => {
    expect(getOnboardingComplete()).toBe(false);
  });

  it('round-trips true', () => {
    setOnboardingComplete(true);
    expect(getOnboardingComplete()).toBe(true);
  });
});
