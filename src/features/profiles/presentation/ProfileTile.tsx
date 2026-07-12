import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Profile } from '../domain/Profile';

const TILE_SIZE = 72;

interface ProfileTileProps {
  profile: Profile;
  onPress: () => void;
}

// A profile's avatar is just its chosen color plus the first letter of its
// name (spec.md FR-1's "name and avatar/color") — no photo/icon picker in
// Phase 1.
export function ProfileTile({ profile, onPress }: ProfileTileProps) {
  const initial = profile.name.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Open ${profile.name}'s profile`}
    >
      <View style={[styles.circle, { backgroundColor: profile.avatarColor }]}>
        <Text variant="headlineSmall" style={styles.initial}>
          {initial}
        </Text>
      </View>
      <Text variant="bodyMedium" numberOfLines={1} style={styles.label}>
        {profile.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TILE_SIZE + 16,
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  circle: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
  },
  label: {
    maxWidth: TILE_SIZE + 16,
  },
});
