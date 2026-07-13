import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinInput } from './PinInput';
import { useProfilePinGateway } from './ProfilePinContext';

interface PinSetupScreenProps {
  profileId: string;
  profileName: string;
  onSaved: () => void;
}

// 4-digit entry + confirm, bcrypt-hashed and stored natively (plan.md 5.1).
// Reused as-is for both first-time setup (Create/Edit Profile opting into a
// PIN) and the forgot-PIN reset (plan.md 5.4) — setPin() always overwrites
// unconditionally, so there's no separate "reset mode" to model here; the
// caller (RootNavigator) decides where onSaved goes next.
export function PinSetupScreen({
  profileId,
  profileName,
  onSaved,
}: PinSetupScreenProps) {
  const pinGateway = useProfilePinGateway();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const canSave = pin.length === 4 && confirmPin.length === 4 && !isSaving;

  const handleSave = useCallback(async () => {
    if (!canSave) {
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setIsSaving(true);
    setError(undefined);
    try {
      await pinGateway.setPin(profileId, pin);
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save the PIN. Please try again.',
      );
      setIsSaving(false);
    }
  }, [canSave, pin, confirmPin, pinGateway, profileId, onSaved]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" accessibilityRole="header">
        Set a PIN for {profileName}
      </Text>
      <Text variant="bodyMedium">
        Choose a 4-digit PIN to protect this profile.
      </Text>

      <PinInput value={pin} onChangeValue={setPin} label="New PIN" />
      <PinInput
        value={confirmPin}
        onChangeValue={setConfirmPin}
        label="Confirm PIN"
      />

      {error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!canSave}
        loading={isSaving}
        accessibilityLabel="Save PIN"
      >
        Save PIN
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
});
