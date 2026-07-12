import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { pickReadableTextColor } from '../../../app/theme';
import type { Profile } from '../domain/Profile';

const TILE_SIZE = 72;

interface ProfileTileProps {
  profile: Profile;
  onPress: () => void;
  onEdit: () => void;
}

// A profile's avatar is just its chosen color plus the first letter of its
// name (spec.md FR-1's "name and avatar/color") — no photo/icon picker in
// Phase 1. The tile itself opens the profile; a separate "Edit" affordance
// (Task Group 4.1) reaches Edit Profile without that ambiguity of what a
// tap vs. long-press does — long-press has no reliable TalkBack exposure,
// so it's a distinct, clearly-labeled control instead.
export function ProfileTile({ profile, onPress, onEdit }: ProfileTileProps) {
  const initial = profile.name.trim().charAt(0).toUpperCase();
  const initialColor = pickReadableTextColor(profile.avatarColor);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={styles.tilePressable}
        accessibilityRole="button"
        accessibilityLabel={`Open ${profile.name}'s profile`}
      >
        <View style={[styles.circle, { backgroundColor: profile.avatarColor }]}>
          <Text variant="headlineSmall" style={{ color: initialColor }}>
            {initial}
          </Text>
        </View>
        <Text variant="bodyMedium" numberOfLines={1} style={styles.label}>
          {profile.name}
        </Text>
      </Pressable>
      <Pressable
        onPress={onEdit}
        style={styles.editButton}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${profile.name}'s profile`}
      >
        <Text variant="labelMedium">Edit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TILE_SIZE + 16,
    alignItems: 'center',
    padding: 8,
  },
  tilePressable: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    maxWidth: TILE_SIZE + 16,
  },
  // 48dp minimum touch target (mission.md non-negotiable #4).
  editButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
