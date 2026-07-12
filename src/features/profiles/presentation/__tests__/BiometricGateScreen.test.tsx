import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type {
  BiometricAuthOutcome,
  BiometricAvailability,
  BiometricGateway,
} from '../../domain/biometricGate';
import { BiometricGateProvider } from '../BiometricGateContext';
import { BiometricGateScreen } from '../BiometricGateScreen';

// Without initialMetrics, SafeAreaProvider waits on a native measurement
// event that never fires in Jest, so its children never render.
const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderGate(gateway: BiometricGateway) {
  const onAuthenticated = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <BiometricGateProvider gateway={gateway}>
        <BiometricGateScreen onAuthenticated={onAuthenticated} />
      </BiometricGateProvider>
    </SafeAreaProvider>,
  );
  return { onAuthenticated };
}

function fakeGateway(overrides: Partial<BiometricGateway>): BiometricGateway {
  return {
    checkAvailability: jest.fn<Promise<BiometricAvailability>, []>(),
    authenticate: jest.fn<Promise<BiometricAuthOutcome>, [string, string]>(),
    ...overrides,
  };
}

describe('BiometricGateScreen', () => {
  it('prompts automatically on launch and calls onAuthenticated on success', async () => {
    const gateway = fakeGateway({
      checkAvailability: jest.fn().mockResolvedValue('available'),
      authenticate: jest.fn().mockResolvedValue({ type: 'success' }),
    });

    const { onAuthenticated } = await renderGate(gateway);

    await waitFor(() => expect(gateway.authenticate).toHaveBeenCalled());
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalled());
  });

  it('shows a blocking message when the device has no lock configured at all', async () => {
    const gateway = fakeGateway({
      checkAvailability: jest.fn().mockResolvedValue('no_hardware'),
      authenticate: jest.fn(),
    });

    await renderGate(gateway);

    expect(
      await screen.findByText('Set up a screen lock to continue'),
    ).toBeOnTheScreen();
    expect(gateway.authenticate).not.toHaveBeenCalled();
  });

  it('re-checks availability when Try Again is pressed from the blocked state', async () => {
    const gateway = fakeGateway({
      checkAvailability: jest
        .fn()
        .mockResolvedValueOnce('not_enrolled')
        .mockResolvedValueOnce('available'),
      authenticate: jest.fn().mockResolvedValue({ type: 'success' }),
    });

    await renderGate(gateway);
    const retryButton = await screen.findByRole('button', {
      name: 'Check again after setting up a device lock',
    });

    fireEvent.press(retryButton);

    await waitFor(() => expect(gateway.authenticate).toHaveBeenCalled());
  });

  it('shows a retry state with the failure message and lets the user retry', async () => {
    const gateway = fakeGateway({
      checkAvailability: jest.fn().mockResolvedValue('available'),
      authenticate: jest
        .fn()
        .mockResolvedValueOnce({
          type: 'failed',
          message: 'Too many attempts.',
        })
        .mockResolvedValueOnce({ type: 'success' }),
    });

    const { onAuthenticated } = await renderGate(gateway);

    expect(await screen.findByText('Too many attempts.')).toBeOnTheScreen();

    fireEvent.press(
      screen.getByRole('button', { name: 'Try authentication again' }),
    );

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalled());
  });

  it('surfaces cancellation with dedicated copy, not the raw native message', async () => {
    const gateway = fakeGateway({
      checkAvailability: jest.fn().mockResolvedValue('available'),
      authenticate: jest.fn().mockResolvedValue({ type: 'cancelled' }),
    });

    await renderGate(gateway);

    expect(
      await screen.findByText('Authentication was cancelled.'),
    ).toBeOnTheScreen();
  });
});
