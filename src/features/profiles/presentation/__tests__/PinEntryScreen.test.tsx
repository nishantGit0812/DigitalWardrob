import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { ProfilePinGateway } from '../../domain/profilePin';
import type { ProfileRepository } from '../../domain/profileRepository';
import { PinEntryScreen } from '../PinEntryScreen';
import { ProfilePinProvider } from '../ProfilePinContext';
import { ProfileRepositoryProvider } from '../ProfileRepositoryContext';

const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

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

function fakeRepository(
  overrides: Partial<ProfileRepository> = {},
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

async function renderScreen(
  pinGateway: ProfilePinGateway,
  repository: ProfileRepository = fakeRepository(),
) {
  const onVerified = jest.fn();
  const onForgotPin = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfilePinProvider gateway={pinGateway}>
        <ProfileRepositoryProvider repository={repository}>
          <PinEntryScreen
            profileId="a"
            profileName="Priya"
            onVerified={onVerified}
            onForgotPin={onForgotPin}
          />
        </ProfileRepositoryProvider>
      </ProfilePinProvider>
    </SafeAreaProvider>,
  );
  return { onVerified, onForgotPin };
}

describe('PinEntryScreen', () => {
  it('auto-verifies once 4 digits are entered and accepts the correct PIN', async () => {
    const repository = fakeRepository();
    const pinGateway = fakePinGateway({
      verifyPin: jest.fn().mockResolvedValue(true),
    });

    const { onVerified } = await renderScreen(pinGateway, repository);
    await fireEvent.changeText(screen.getByLabelText('PIN'), '1234');

    await waitFor(() =>
      expect(pinGateway.verifyPin).toHaveBeenCalledWith('a', '1234'),
    );
    expect(repository.setActiveProfileId).toHaveBeenCalledWith('a');
    expect(onVerified).toHaveBeenCalled();
  });

  it('rejects an incorrect PIN with clear feedback and clears the input for retry', async () => {
    const pinGateway = fakePinGateway({
      verifyPin: jest.fn().mockResolvedValue(false),
    });

    const { onVerified } = await renderScreen(pinGateway);
    await fireEvent.changeText(screen.getByLabelText('PIN'), '0000');

    expect(
      await screen.findByText('Incorrect PIN. Please try again.'),
    ).toBeOnTheScreen();
    expect(onVerified).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByLabelText('PIN').props.value).toBe(''),
    );
  });

  it('pressing Forgot PIN calls onForgotPin', async () => {
    const { onForgotPin } = await renderScreen(fakePinGateway());

    await fireEvent.press(screen.getByRole('button', { name: 'Forgot PIN' }));

    expect(onForgotPin).toHaveBeenCalled();
  });
});
