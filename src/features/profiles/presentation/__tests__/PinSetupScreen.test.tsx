import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { ProfilePinGateway } from '../../domain/profilePin';
import { PinSetupScreen } from '../PinSetupScreen';
import { ProfilePinProvider } from '../ProfilePinContext';

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

async function renderScreen(pinGateway: ProfilePinGateway) {
  const onSaved = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ProfilePinProvider gateway={pinGateway}>
        <PinSetupScreen profileId="a" profileName="Priya" onSaved={onSaved} />
      </ProfilePinProvider>
    </SafeAreaProvider>,
  );
  return { onSaved };
}

describe('PinSetupScreen', () => {
  it('disables Save PIN until both fields have 4 digits', async () => {
    await renderScreen(fakePinGateway());

    const saveButton = screen.getByRole('button', { name: 'Save PIN' });
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '1234');
    expect(saveButton.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('rejects mismatched PINs without saving', async () => {
    const pinGateway = fakePinGateway();
    await renderScreen(pinGateway);

    await fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    await fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '5678');
    await fireEvent.press(screen.getByRole('button', { name: 'Save PIN' }));

    expect(
      await screen.findByText('PINs do not match. Please try again.'),
    ).toBeOnTheScreen();
    expect(pinGateway.setPin).not.toHaveBeenCalled();
  });

  it('saves a matching PIN and calls onSaved', async () => {
    const pinGateway = fakePinGateway();
    const { onSaved } = await renderScreen(pinGateway);

    await fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    await fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Save PIN' }));

    await waitFor(() =>
      expect(pinGateway.setPin).toHaveBeenCalledWith('a', '1234'),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows an inline error and does not call onSaved when saving fails', async () => {
    const pinGateway = fakePinGateway({
      setPin: jest.fn().mockRejectedValue(new Error('Could not save the PIN.')),
    });
    const { onSaved } = await renderScreen(pinGateway);

    await fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    await fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Save PIN' }));

    expect(
      await screen.findByText('Could not save the PIN.'),
    ).toBeOnTheScreen();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
