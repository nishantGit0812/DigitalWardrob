import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotionPreference } from '../../../shared/hooks/useReducedMotionPreference';
import { useBiometricGateway } from './BiometricGateContext';

const TRANSITION_DURATION_MS = 220;

type GateState =
  | { phase: 'checking' | 'prompting' | 'blocked' }
  | { phase: 'retry'; message: string };

interface BiometricGateScreenProps {
  onAuthenticated: () => void;
}

// Gates app launch behind the device's biometric/PIN/pattern/password lock
// (roadmap 1.1/1.2) — no Profile Selection screen exists yet (Task Group 3),
// so RootNavigator routes straight into MainTabs on success for now. 1.3's
// no-biometric-hardware fallback needs no UI here: BiometricPrompt itself
// offers the device credential prompt automatically. 1.4's reduced-motion
// enter/exit fade is the first animation in the app — later Phase 1 screens
// (PIN entry, profile grid) reuse this hook + Reanimated pairing.
export function BiometricGateScreen({
  onAuthenticated,
}: BiometricGateScreenProps) {
  const gateway = useBiometricGateway();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const reduceMotionEnabled = useReducedMotionPreference();
  const [state, setState] = useState<GateState>({ phase: 'checking' });

  const opacity = useSharedValue(reduceMotionEnabled ? 1 : 0);

  useEffect(() => {
    opacity.value = reduceMotionEnabled
      ? 1
      : withTiming(1, { duration: TRANSITION_DURATION_MS });
    // Only re-runs if the system setting changes mid-session; not meant to
    // replay on every state transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotionEnabled]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const finishWithTransition = useCallback(() => {
    if (reduceMotionEnabled) {
      onAuthenticated();
      return;
    }
    opacity.value = withTiming(
      0,
      { duration: TRANSITION_DURATION_MS },
      finished => {
        if (finished) {
          runOnJS(onAuthenticated)();
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAuthenticated, reduceMotionEnabled]);

  const runAuthentication = useCallback(async () => {
    setState({ phase: 'prompting' });
    const outcome = await gateway.authenticate(
      'Unlock WardrobeAI',
      "Confirm it's you to continue",
    );

    if (outcome.type === 'success') {
      finishWithTransition();
      return;
    }

    setState({
      phase: 'retry',
      message:
        outcome.type === 'cancelled'
          ? 'Authentication was cancelled.'
          : outcome.message,
    });
  }, [gateway, finishWithTransition]);

  const checkAndPrompt = useCallback(async () => {
    setState({ phase: 'checking' });
    const availability = await gateway.checkAvailability();
    if (availability === 'available') {
      await runAuthentication();
    } else {
      setState({ phase: 'blocked' });
    }
  }, [gateway, runAuthentication]);

  useEffect(() => {
    checkAndPrompt();
    // Runs once on launch (plan.md 1.2) — checkAndPrompt is intentionally
    // not a dependency so retries (below) don't re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      {(state.phase === 'checking' || state.phase === 'prompting') && (
        <>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Waiting for authentication"
          />
          <Text variant="bodyLarge" style={styles.message}>
            Confirm your identity to continue
          </Text>
        </>
      )}

      {state.phase === 'blocked' && (
        <>
          <Text
            variant="headlineSmall"
            accessibilityRole="header"
            style={styles.message}
          >
            Set up a screen lock to continue
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            WardrobeAI requires a device PIN, pattern, password, or biometric to
            protect your profiles. Set one up in your device settings, then try
            again.
          </Text>
          <Button
            mode="contained"
            onPress={checkAndPrompt}
            accessibilityLabel="Check again after setting up a device lock"
          >
            Try Again
          </Button>
        </>
      )}

      {state.phase === 'retry' && (
        <>
          <Text variant="bodyLarge" style={styles.message}>
            {state.message}
          </Text>
          <Button
            mode="contained"
            onPress={runAuthentication}
            accessibilityLabel="Try authentication again"
          >
            Try Again
          </Button>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  message: {
    textAlign: 'center',
  },
});
