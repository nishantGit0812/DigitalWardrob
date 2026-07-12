import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { Profile } from '../../domain/Profile';
import type { ProfileRepository } from '../../domain/profileRepository';
import { CreateProfileScreen } from '../CreateProfileScreen';
import { ProfileRepositoryProvider } from '../ProfileRepositoryContext';

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
    update: jest.fn(),
    remove: jest.fn(),
    getActiveProfileId: jest.fn(),
    setActiveProfileId: jest.fn(),
    ...overrides,
  };
}

async function renderScreen(repository: ProfileRepository) {
  const onCreated = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfileRepositoryProvider repository={repository}>
        <CreateProfileScreen onCreated={onCreated} />
      </ProfileRepositoryProvider>
    </SafeAreaProvider>,
  );
  return { onCreated };
}

describe('CreateProfileScreen', () => {
  it('disables Create until a name is entered', async () => {
    const repository = fakeRepository({});
    await renderScreen(repository);

    const createButton = screen.getByRole('button', {
      name: 'Create profile',
    });
    expect(createButton.props.accessibilityState?.disabled).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('Profile name'), 'Priya');

    expect(createButton.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('rejects a whitespace-only name', async () => {
    const repository = fakeRepository({});
    await renderScreen(repository);

    await fireEvent.changeText(screen.getByLabelText('Profile name'), '   ');

    expect(
      screen.getByRole('button', { name: 'Create profile' }).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it('creates with the trimmed name and default color, sets it active, and calls onCreated', async () => {
    const created: Profile = {
      id: 'p1',
      name: 'Priya',
      avatarColor: '#E57373',
    };
    const repository = fakeRepository({
      create: jest.fn().mockResolvedValue(created),
    });

    const { onCreated } = await renderScreen(repository);
    await fireEvent.changeText(
      screen.getByLabelText('Profile name'),
      '  Priya  ',
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create profile' }),
    );

    await waitFor(() =>
      expect(repository.create).toHaveBeenCalledWith('Priya', '#E57373'),
    );
    expect(repository.setActiveProfileId).toHaveBeenCalledWith('p1');
    expect(onCreated).toHaveBeenCalledWith(created);
  });

  it('creates with whichever color swatch was selected', async () => {
    const repository = fakeRepository({
      create: jest
        .fn()
        .mockResolvedValue({ id: 'p1', name: 'Priya', avatarColor: '#4FC3F7' }),
    });

    await renderScreen(repository);
    await fireEvent.changeText(screen.getByLabelText('Profile name'), 'Priya');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Avatar color #4FC3F7' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create profile' }),
    );

    await waitFor(() =>
      expect(repository.create).toHaveBeenCalledWith('Priya', '#4FC3F7'),
    );
  });

  it('shows an inline error and re-enables Create when creation fails', async () => {
    const repository = fakeRepository({
      create: jest
        .fn()
        .mockRejectedValue(new Error('Profile name is required.')),
    });

    await renderScreen(repository);
    await fireEvent.changeText(screen.getByLabelText('Profile name'), 'Priya');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create profile' }),
    );

    expect(
      await screen.findByText('Profile name is required.'),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Create profile' }).props
        .accessibilityState?.disabled,
    ).not.toBe(true);
  });
});
