import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinInput } from './PinInput';
import { useProfilePinGateway } from './ProfilePinContext';
import { useProfileRepository } from './ProfileRepositoryContext';

interface PinEntryScreenProps {
  profileId: string;
  profileName: string;
  onVerified: () => void;
  onForgotPin: () => void;
}

// Gates profile selection for a PIN-protected profile (plan.md 5.2/5.3) —
// auto-verifies once 4 digits are entered, matching lock-screen UX (spec.md
// "Profile PIN format" decision) rather than requiring an explicit submit.
export function PinEntryScreen({
  profileId,
  profileName,
  onVerified,
  onForgotPin,
}: PinEntryScreenProps) {
  const pinGateway = useProfilePinGateway();
  const profileRepository = useProfileRepository();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleChange = useCallback((value: string) => {
    setPin(value);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (pin.length !== 4) {
      return;
    }

    let cancelled = false;
    setIsVerifying(true);
    pinGateway.verifyPin(profileId, pin).then(isValid => {
      if (cancelled || !isMountedRef.current) {
        return;
      }
      if (isValid) {
        profileRepository.setActiveProfileId(profileId);
        onVerified();
        return;
      }
      setError('Incorrect PIN. Please try again.');
      setPin('');
      setIsVerifying(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pin, pinGateway, profileId, profileRepository, onVerified]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" accessibilityRole="header">
        Enter {profileName}&rsquo;s PIN
      </Text>

      <PinInput value={pin} onChangeValue={handleChange} label="PIN" />

      {isVerifying && (
        <ActivityIndicator size="small" accessibilityLabel="Verifying PIN" />
      )}

      {error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}

      <Button
        mode="text"
        onPress={onForgotPin}
        disabled={isVerifying}
        accessibilityLabel="Forgot PIN"
      >
        Forgot PIN?
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
});
