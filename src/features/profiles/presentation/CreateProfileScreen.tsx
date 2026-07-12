import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile } from '../domain/Profile';
import { AVATAR_COLORS, AvatarColorPicker } from './AvatarColorPicker';
import { useProfileRepository } from './ProfileRepositoryContext';

interface CreateProfileScreenProps {
  // `wantsPin` tells the caller (RootNavigator) whether to route into PIN
  // Setup next (plan.md 5.1) or straight into MainTabs — this screen itself
  // stays navigation-agnostic.
  onCreated: (profile: Profile, wantsPin: boolean) => void;
}

// Name input + avatar/color picker (plan.md 3.2), wired to Task Group 2's
// storage provisioning via LocalProfileRepository.create (plan.md 3.3).
// The PIN toggle is optional (FR-4a) — most profiles won't set one.
export function CreateProfileScreen({ onCreated }: CreateProfileScreenProps) {
  const repository = useProfileRepository();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [wantsPin, setWantsPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;

  const handleCreate = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      const profile = await repository.create(trimmedName, avatarColor);
      repository.setActiveProfileId(profile.id);
      onCreated(profile, wantsPin);
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : 'Could not create the profile. Please try again.',
      );
      setIsSubmitting(false);
    }
  }, [canSubmit, repository, trimmedName, avatarColor, wantsPin, onCreated]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" accessibilityRole="header">
        Add Profile
      </Text>

      <TextInput
        label="Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        maxLength={40}
        accessibilityLabel="Profile name"
      />

      <Text variant="bodyMedium">Choose a color</Text>
      <AvatarColorPicker
        selectedColor={avatarColor}
        onSelect={setAvatarColor}
      />

      <View style={styles.row}>
        <Text variant="bodyLarge">Protect with a PIN</Text>
        <Switch
          value={wantsPin}
          onValueChange={setWantsPin}
          accessibilityLabel="Protect this profile with a PIN"
        />
      </View>

      {error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleCreate}
        disabled={!canSubmit}
        loading={isSubmitting}
        accessibilityLabel="Create profile"
      >
        Create
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
