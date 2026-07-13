import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
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
import { AvatarColorPicker } from './AvatarColorPicker';
import { useProfilePinGateway } from './ProfilePinContext';
import { useProfileRepository } from './ProfileRepositoryContext';

interface EditProfileScreenProps {
  profile: Profile;
  onSaved: (profile: Profile) => void;
  onDeleted: () => void;
  // Fires instead of onSaved when the user turned PIN protection on and
  // still needs to enter the actual digits (plan.md 5.1) — that needs a
  // separate screen, unlike turning it off, which this screen handles
  // itself since no further input is required.
  onSetupPin: (profile: Profile) => void;
}

// Rename/re-avatar (plan.md 4.1), the PIN protection toggle (spec.md's
// screen inventory lists "optional PIN toggle + entry" for Create/Edit
// alike), and the destructive delete flow (plan.md 4.2/4.3) — spec.md
// treats "Create/Edit Profile" as one screen concept, hence sharing
// CreateProfileScreen's AvatarColorPicker rather than a second copy.
export function EditProfileScreen({
  profile,
  onSaved,
  onDeleted,
  onSetupPin,
}: EditProfileScreenProps) {
  const repository = useProfileRepository();
  const pinGateway = useProfilePinGateway();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [name, setName] = useState(profile.name);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [initialHasPin, setInitialHasPin] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Guards against the initial hasPin() fetch clobbering a toggle the user
  // already made — it's a single native read that should resolve near
  // instantly in practice, but there's no reason to assume it always wins
  // the race against a fast tap.
  const userToggledPinRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    pinGateway.hasPin(profile.id).then(hasPin => {
      if (cancelled) {
        return;
      }
      setInitialHasPin(hasPin);
      if (!userToggledPinRef.current) {
        setPinEnabled(hasPin);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pinGateway, profile.id]);

  const handleTogglePin = useCallback((value: boolean) => {
    userToggledPinRef.current = true;
    setPinEnabled(value);
  }, []);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isSaving && !isDeleting;

  const handleSave = useCallback(async () => {
    if (!canSave) {
      return;
    }
    setIsSaving(true);
    setError(undefined);
    try {
      const updated = await repository.update(
        profile.id,
        trimmedName,
        avatarColor,
      );

      if (pinEnabled && !initialHasPin) {
        onSetupPin(updated);
        return;
      }
      if (!pinEnabled && initialHasPin) {
        await pinGateway.clearPin(profile.id);
      }
      onSaved(updated);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save changes. Please try again.',
      );
      setIsSaving(false);
    }
  }, [
    canSave,
    repository,
    profile.id,
    trimmedName,
    avatarColor,
    pinEnabled,
    initialHasPin,
    pinGateway,
    onSetupPin,
    onSaved,
  ]);

  const performDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(undefined);
    try {
      await repository.remove(profile.id);
      onDeleted();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete the profile. Please try again.',
      );
      setIsDeleting(false);
    }
  }, [repository, profile.id, onDeleted]);

  const handleDeletePress = useCallback(() => {
    // Destructive-action pattern (plan.md 4.2) — explicit "cannot be
    // undone" copy, matching backups' own no-recovery disclosure
    // (mission.md non-negotiable #3) rather than implying a safety net
    // that doesn't exist here either.
    Alert.alert(
      'Delete profile?',
      `This permanently deletes ${profile.name}'s wardrobe, photos, and settings. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ],
    );
  }, [profile.name, performDelete]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" accessibilityRole="header">
        Edit Profile
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
          value={pinEnabled}
          onValueChange={handleTogglePin}
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
        onPress={handleSave}
        disabled={!canSave}
        loading={isSaving}
        accessibilityLabel="Save changes"
      >
        Save
      </Button>

      <Button
        mode="outlined"
        textColor={theme.colors.error}
        onPress={handleDeletePress}
        disabled={isSaving || isDeleting}
        loading={isDeleting}
        accessibilityLabel="Delete profile"
      >
        Delete Profile
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
