import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { Profile } from '../../domain/Profile';
import type { ProfileRepository } from '../../domain/profileRepository';
import { ProfileRepositoryProvider } from '../ProfileRepositoryContext';
import { ProfileSelectionScreen } from '../ProfileSelectionScreen';

const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function fakeRepository(
  overrides: Partial<ProfileRepository>,
): ProfileRepository {
  return {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    getActiveProfileId: jest.fn(),
    setActiveProfileId: jest.fn(),
    ...overrides,
  };
}

async function renderScreen(repository: ProfileRepository) {
  const onProfileSelected = jest.fn();
  const onAddProfile = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfileRepositoryProvider repository={repository}>
        <ProfileSelectionScreen
          onProfileSelected={onProfileSelected}
          onAddProfile={onAddProfile}
        />
      </ProfileRepositoryProvider>
    </SafeAreaProvider>,
  );
  return { onProfileSelected, onAddProfile };
}

const profileA: Profile = { id: 'a', name: 'Priya', avatarColor: '#E57373' };
const profileB: Profile = { id: 'b', name: 'Devraj', avatarColor: '#4FC3F7' };

describe('ProfileSelectionScreen', () => {
  it('renders a tile for each profile and an enabled Add Profile action below the limit', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([profileA, profileB]),
    });

    await renderScreen(repository);

    expect(await screen.findByText('Priya')).toBeOnTheScreen();
    expect(screen.getByText('Devraj')).toBeOnTheScreen();
    const addAction = screen.getByRole('button', { name: 'Add profile' });
    expect(addAction.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('disables Add Profile once 4 profiles exist', async () => {
    const fourProfiles: Profile[] = [
      profileA,
      profileB,
      { id: 'c', name: 'Ana', avatarColor: '#81C784' },
      { id: 'd', name: 'Sam', avatarColor: '#FFB74D' },
    ];
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue(fourProfiles),
    });

    await renderScreen(repository);

    const addAction = await screen.findByRole('button', {
      name: 'Add profile',
    });
    expect(addAction.props.accessibilityState?.disabled).toBe(true);
  });

  it('selecting a profile sets it active and calls onProfileSelected', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([profileA]),
    });

    const { onProfileSelected } = await renderScreen(repository);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Open Priya's profile",
      }),
    );

    expect(repository.setActiveProfileId).toHaveBeenCalledWith('a');
    expect(onProfileSelected).toHaveBeenCalledWith(profileA);
  });

  it('pressing Add Profile calls onAddProfile', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([]),
    });

    const { onAddProfile } = await renderScreen(repository);

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Add profile' }),
    );

    expect(onAddProfile).toHaveBeenCalled();
  });
});
