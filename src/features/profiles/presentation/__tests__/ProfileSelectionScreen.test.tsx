import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { Profile } from '../../domain/Profile';
import type { ProfilePinGateway } from '../../domain/profilePin';
import type { ProfileRepository } from '../../domain/profileRepository';
import { ProfilePinProvider } from '../ProfilePinContext';
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

// useFocusEffect (used to refresh the list on refocus, e.g. after Edit
// Profile) needs a real navigator ancestor, not just NavigationContainer —
// a two-screen stack lets tests drive an actual focus/blur/refocus cycle.
const TestStack = createNativeStackNavigator();

async function renderScreen(
  repository: ProfileRepository,
  pinGateway: ProfilePinGateway = fakePinGateway(),
) {
  const onProfileSelected = jest.fn();
  const onAddProfile = jest.fn();
  const onEditProfile = jest.fn();
  const onPinRequired = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfilePinProvider gateway={pinGateway}>
        <ProfileRepositoryProvider repository={repository}>
          <NavigationContainer>
            <TestStack.Navigator screenOptions={{ headerShown: false }}>
              <TestStack.Screen name="ProfileSelection">
                {() => (
                  <ProfileSelectionScreen
                    onProfileSelected={onProfileSelected}
                    onAddProfile={onAddProfile}
                    onEditProfile={onEditProfile}
                    onPinRequired={onPinRequired}
                  />
                )}
              </TestStack.Screen>
            </TestStack.Navigator>
          </NavigationContainer>
        </ProfileRepositoryProvider>
      </ProfilePinProvider>
    </SafeAreaProvider>,
  );
  return { onProfileSelected, onAddProfile, onEditProfile, onPinRequired };
}

async function renderScreenWithBackNavigation(repository: ProfileRepository) {
  const onProfileSelected = jest.fn();
  const onAddProfile = jest.fn();
  const onPinRequired = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfilePinProvider gateway={fakePinGateway()}>
        <ProfileRepositoryProvider repository={repository}>
          <NavigationContainer>
            <TestStack.Navigator screenOptions={{ headerShown: false }}>
              <TestStack.Screen name="ProfileSelection">
                {({ navigation }) => (
                  <ProfileSelectionScreen
                    onProfileSelected={onProfileSelected}
                    onAddProfile={onAddProfile}
                    onEditProfile={() => navigation.navigate('Other')}
                    onPinRequired={onPinRequired}
                  />
                )}
              </TestStack.Screen>
              <TestStack.Screen name="Other">
                {({ navigation }) => (
                  <Button onPress={() => navigation.goBack()}>Back</Button>
                )}
              </TestStack.Screen>
            </TestStack.Navigator>
          </NavigationContainer>
        </ProfileRepositoryProvider>
      </ProfilePinProvider>
    </SafeAreaProvider>,
  );
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

  it('selecting a profile with no PIN sets it active and calls onProfileSelected', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([profileA]),
    });

    const { onProfileSelected, onPinRequired } = await renderScreen(repository);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Open Priya's profile",
      }),
    );

    expect(repository.setActiveProfileId).toHaveBeenCalledWith('a');
    expect(onProfileSelected).toHaveBeenCalledWith(profileA);
    expect(onPinRequired).not.toHaveBeenCalled();
  });

  it('selecting a PIN-protected profile calls onPinRequired instead, without setting it active', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([profileA]),
    });
    const pinGateway = fakePinGateway({
      hasPin: jest.fn().mockResolvedValue(true),
    });

    const { onProfileSelected, onPinRequired } = await renderScreen(
      repository,
      pinGateway,
    );

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Open Priya's profile",
      }),
    );

    expect(onPinRequired).toHaveBeenCalledWith(profileA);
    expect(repository.setActiveProfileId).not.toHaveBeenCalled();
    expect(onProfileSelected).not.toHaveBeenCalled();
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

  it('pressing Edit on a tile calls onEditProfile with that profile', async () => {
    const repository = fakeRepository({
      list: jest.fn().mockResolvedValue([profileA]),
    });

    const { onEditProfile } = await renderScreen(repository);

    await fireEvent.press(
      await screen.findByRole('button', { name: "Edit Priya's profile" }),
    );

    expect(onEditProfile).toHaveBeenCalledWith(profileA);
  });

  it('re-fetches the profile list when the screen regains focus', async () => {
    const list = jest
      .fn()
      .mockResolvedValueOnce([profileA])
      .mockResolvedValueOnce([profileA, profileB]);
    const repository = fakeRepository({ list });

    await renderScreenWithBackNavigation(repository);
    expect(await screen.findByText('Priya')).toBeOnTheScreen();
    expect(list).toHaveBeenCalledTimes(1);

    await fireEvent.press(
      await screen.findByRole('button', { name: "Edit Priya's profile" }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Devraj')).toBeOnTheScreen();
    expect(list).toHaveBeenCalledTimes(2);
  });
});
