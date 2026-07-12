import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { Profile } from '../../domain/Profile';
import type { ProfilePinGateway } from '../../domain/profilePin';
import type { ProfileRepository } from '../../domain/profileRepository';
import { EditProfileScreen } from '../EditProfileScreen';
import { ProfilePinProvider } from '../ProfilePinContext';
import { ProfileRepositoryProvider } from '../ProfileRepositoryContext';

const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const profile: Profile = { id: 'a', name: 'Priya', avatarColor: '#E57373' };

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

function fakePinGateway(
  overrides: Partial<ProfilePinGateway> = {},
): ProfilePinGateway {
  return {
    setPin: jest.fn().mockResolvedValue(undefined),
    verifyPin: jest.fn().mockResolvedValue(false),
    hasPin: jest.fn().mockResolvedValue(false),
    clearPin: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function renderScreen(
  repository: ProfileRepository,
  pinGateway: ProfilePinGateway = fakePinGateway(),
) {
  const onSaved = jest.fn();
  const onDeleted = jest.fn();
  const onSetupPin = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfilePinProvider gateway={pinGateway}>
        <ProfileRepositoryProvider repository={repository}>
          <EditProfileScreen
            profile={profile}
            onSaved={onSaved}
            onDeleted={onDeleted}
            onSetupPin={onSetupPin}
          />
        </ProfileRepositoryProvider>
      </ProfilePinProvider>
    </SafeAreaProvider>,
  );
  return { onSaved, onDeleted, onSetupPin };
}

describe('EditProfileScreen', () => {
  it('pre-fills the name and current avatar color', async () => {
    await renderScreen(fakeRepository({}));

    expect(screen.getByLabelText('Profile name').props.value).toBe('Priya');
    expect(
      screen.getByRole('button', { name: 'Avatar color #E57373' }).props
        .accessibilityState?.selected,
    ).toBe(true);
  });

  it('pre-fills the PIN toggle from the profile’s current PIN state', async () => {
    const pinGateway = fakePinGateway({
      hasPin: jest.fn().mockResolvedValue(true),
    });

    await renderScreen(fakeRepository({}), pinGateway);

    const toggle = await screen.findByLabelText(
      'Protect this profile with a PIN',
    );
    await waitFor(() => expect(toggle.props.value).toBe(true));
  });

  it('saves the renamed/re-colored profile and calls onSaved', async () => {
    const updated: Profile = {
      id: 'a',
      name: 'Priya S.',
      avatarColor: '#4FC3F7',
    };
    const repository = fakeRepository({
      update: jest.fn().mockResolvedValue(updated),
    });

    const { onSaved } = await renderScreen(repository);
    await fireEvent.changeText(
      screen.getByLabelText('Profile name'),
      'Priya S.',
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Avatar color #4FC3F7' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(repository.update).toHaveBeenCalledWith(
        'a',
        'Priya S.',
        '#4FC3F7',
      ),
    );
    expect(onSaved).toHaveBeenCalledWith(updated);
  });

  it('disables Save once the name is cleared', async () => {
    await renderScreen(fakeRepository({}));

    await fireEvent.changeText(screen.getByLabelText('Profile name'), '');

    expect(
      screen.getByRole('button', { name: 'Save changes' }).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it('shows an inline error and does not call onSaved when saving fails', async () => {
    const repository = fakeRepository({
      update: jest
        .fn()
        .mockRejectedValue(new Error('Profile a does not exist.')),
    });

    const { onSaved } = await renderScreen(repository);
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByText('Profile a does not exist.'),
    ).toBeOnTheScreen();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('routes to onSetupPin instead of onSaved when PIN protection is turned on', async () => {
    const updated: Profile = { ...profile };
    const repository = fakeRepository({
      update: jest.fn().mockResolvedValue(updated),
    });

    const { onSaved, onSetupPin } = await renderScreen(repository);
    await fireEvent(
      await screen.findByLabelText('Protect this profile with a PIN'),
      'valueChange',
      true,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSetupPin).toHaveBeenCalledWith(updated));
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('clears the PIN and calls onSaved when PIN protection is turned off', async () => {
    const updated: Profile = { ...profile };
    const repository = fakeRepository({
      update: jest.fn().mockResolvedValue(updated),
    });
    const pinGateway = fakePinGateway({
      hasPin: jest.fn().mockResolvedValue(true),
    });

    const { onSaved, onSetupPin } = await renderScreen(repository, pinGateway);
    const toggle = await screen.findByLabelText(
      'Protect this profile with a PIN',
    );
    await waitFor(() => expect(toggle.props.value).toBe(true));
    await fireEvent(toggle, 'valueChange', false);
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(pinGateway.clearPin).toHaveBeenCalledWith('a'));
    expect(onSaved).toHaveBeenCalledWith(updated);
    expect(onSetupPin).not.toHaveBeenCalled();
  });

  it('confirms before deleting, with explicit "cannot be undone" copy', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
    const repository = fakeRepository({});

    await renderScreen(repository);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Delete profile' }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete profile?',
      expect.stringContaining('cannot be undone'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete', style: 'destructive' }),
      ]),
    );
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('deletes the profile and calls onDeleted when the destructive action is confirmed', async () => {
    const repository = fakeRepository({
      remove: jest.fn().mockResolvedValue(undefined),
    });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const destructive = buttons?.find(
        button => button.style === 'destructive',
      );
      destructive?.onPress?.();
    });

    const { onDeleted } = await renderScreen(repository);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Delete profile' }),
    );

    await waitFor(() => expect(repository.remove).toHaveBeenCalledWith('a'));
    expect(onDeleted).toHaveBeenCalled();
  });

  it('shows an inline error and does not call onDeleted when deletion fails', async () => {
    const repository = fakeRepository({
      remove: jest.fn().mockRejectedValue(new Error('disk full')),
    });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const destructive = buttons?.find(
        button => button.style === 'destructive',
      );
      destructive?.onPress?.();
    });

    const { onDeleted } = await renderScreen(repository);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Delete profile' }),
    );

    expect(await screen.findByText('disk full')).toBeOnTheScreen();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
