import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile } from '../domain/Profile';
import { useProfileRepository } from './ProfileRepositoryContext';

// No avatar color palette is specified in spec.md beyond "name and
// avatar/color" (FR-1) — this fixed set of 8 distinguishable, WCAG-friendly
// accents is a Phase 1 UI decision, not a stakeholder-locked one.
const AVATAR_COLORS = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#7986CB',
  '#4FC3F7',
  '#4DB6AC',
  '#81C784',
  '#FFB74D',
];

interface CreateProfileScreenProps {
  onCreated: (profile: Profile) => void;
}

// Name input + avatar/color picker (plan.md 3.2), wired to Task Group 2's
// storage provisioning via LocalProfileRepository.create (plan.md 3.3).
export function CreateProfileScreen({ onCreated }: CreateProfileScreenProps) {
  const repository = useProfileRepository();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
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
      onCreated(profile);
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : 'Could not create the profile. Please try again.',
      );
      setIsSubmitting(false);
    }
  }, [canSubmit, repository, trimmedName, avatarColor, onCreated]);

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
      <View style={styles.colorRow}>
        {AVATAR_COLORS.map(color => {
          const selected = color === avatarColor;
          return (
            <Pressable
              key={color}
              onPress={() => setAvatarColor(color)}
              accessibilityRole="button"
              accessibilityLabel={`Avatar color ${color}`}
              accessibilityState={{ selected }}
              style={[
                styles.swatch,
                { backgroundColor: color },
                selected && [
                  styles.swatchSelected,
                  { borderColor: theme.colors.onBackground },
                ],
              ]}
            />
          );
        })}
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // 48dp minimum touch target (mission.md non-negotiable #4).
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  swatchSelected: {
    borderWidth: 3,
  },
});
