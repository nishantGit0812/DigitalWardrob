import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import type { ProfilePinGateway } from '../../domain/profilePin';
import type { ProfileRepository } from '../../domain/profileRepository';
import { PinEntryScreen } from '../PinEntryScreen';
import { PinSetupScreen } from '../PinSetupScreen';
import { ProfilePinProvider } from '../ProfilePinContext';
import { ProfileRepositoryProvider } from '../ProfileRepositoryContext';

const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// Simulates the native ProfilePin module's external contract (store on
// setPin, compare on verifyPin) without touching real bcrypt/
// EncryptedSharedPreferences — that's Android instrumentation territory
// (tech-stack.md), out of reach here. This proves the JS-side orchestration
// plan.md 5.5 describes: wrong PIN rejected, correct PIN accepted, and a
// forgot-PIN reset replaces the hash such that only the new PIN works
// afterward.
function createInMemoryPinGateway(): ProfilePinGateway {
  const store = new Map<string, string>();
  return {
    setPin: jest.fn(async (profileId: string, pin: string) => {
      store.set(profileId, pin);
    }),
    verifyPin: jest.fn(async (profileId: string, pin: string) => {
      return store.get(profileId) === pin;
    }),
    hasPin: jest.fn(async (profileId: string) => store.has(profileId)),
    clearPin: jest.fn(async (profileId: string) => {
      store.delete(profileId);
    }),
  };
}

function fakeRepository(): ProfileRepository {
  return {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getActiveProfileId: jest.fn(),
    setActiveProfileId: jest.fn(),
  };
}

describe('PIN entry + forgot-PIN reset flow (plan.md 5.5)', () => {
  it('rejects the wrong PIN, accepts the right one, and a forgot-PIN reset replaces it end to end', async () => {
    const pinGateway = createInMemoryPinGateway();
    const repository = fakeRepository();
    await pinGateway.setPin('a', '1111');

    // Phase 1: wrong PIN is rejected.
    const onVerified = jest.fn();
    const entryScreen1 = await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <ProfilePinProvider gateway={pinGateway}>
          <ProfileRepositoryProvider repository={repository}>
            <PinEntryScreen
              profileId="a"
              profileName="Priya"
              onVerified={onVerified}
              onForgotPin={jest.fn()}
            />
          </ProfileRepositoryProvider>
        </ProfilePinProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.changeText(entryScreen1.getByLabelText('PIN'), '0000');
    expect(
      await entryScreen1.findByText('Incorrect PIN. Please try again.'),
    ).toBeOnTheScreen();
    expect(onVerified).not.toHaveBeenCalled();
    await entryScreen1.unmount();

    // Phase 2: the original PIN is accepted.
    const entryScreen2 = await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <ProfilePinProvider gateway={pinGateway}>
          <ProfileRepositoryProvider repository={repository}>
            <PinEntryScreen
              profileId="a"
              profileName="Priya"
              onVerified={onVerified}
              onForgotPin={jest.fn()}
            />
          </ProfileRepositoryProvider>
        </ProfilePinProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.changeText(entryScreen2.getByLabelText('PIN'), '1111');
    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1));
    await entryScreen2.unmount();

    // Phase 3: forgot-PIN reset (reached after re-passing the biometric
    // gate, per plan.md 5.4 — not re-tested here, that's
    // BiometricGateScreen's own coverage) sets a brand-new PIN, overwriting
    // the old hash.
    const onSaved = jest.fn();
    const setupScreen = await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <ProfilePinProvider gateway={pinGateway}>
          <PinSetupScreen profileId="a" profileName="Priya" onSaved={onSaved} />
        </ProfilePinProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.changeText(setupScreen.getByLabelText('New PIN'), '2222');
    await fireEvent.changeText(
      setupScreen.getByLabelText('Confirm PIN'),
      '2222',
    );
    await fireEvent.press(
      setupScreen.getByRole('button', { name: 'Save PIN' }),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    await setupScreen.unmount();

    // Phase 4: the old PIN no longer works; the new one does.
    const oldPinRejected = jest.fn();
    const entryScreen3 = await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <ProfilePinProvider gateway={pinGateway}>
          <ProfileRepositoryProvider repository={repository}>
            <PinEntryScreen
              profileId="a"
              profileName="Priya"
              onVerified={oldPinRejected}
              onForgotPin={jest.fn()}
            />
          </ProfileRepositoryProvider>
        </ProfilePinProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.changeText(entryScreen3.getByLabelText('PIN'), '1111');
    expect(
      await entryScreen3.findByText('Incorrect PIN. Please try again.'),
    ).toBeOnTheScreen();
    expect(oldPinRejected).not.toHaveBeenCalled();
    await entryScreen3.unmount();

    const newPinAccepted = jest.fn();
    const entryScreen4 = await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <ProfilePinProvider gateway={pinGateway}>
          <ProfileRepositoryProvider repository={repository}>
            <PinEntryScreen
              profileId="a"
              profileName="Priya"
              onVerified={newPinAccepted}
              onForgotPin={jest.fn()}
            />
          </ProfileRepositoryProvider>
        </ProfilePinProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.changeText(entryScreen4.getByLabelText('PIN'), '2222');
    await waitFor(() => expect(newPinAccepted).toHaveBeenCalledTimes(1));
  });
});
