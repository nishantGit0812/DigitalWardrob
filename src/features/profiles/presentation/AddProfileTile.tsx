import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  disabledContainerColor,
  disabledContentColor,
} from '../../../app/theme/disabledState';

const TILE_SIZE = 72;

interface AddProfileTileProps {
  onPress: () => void;
  disabled: boolean;
}

// Matches ProfileTile's shape so it sits naturally in the same grid. Not a
// Paper `Button` — Paper's own disabled styling only applies to Paper
// components, so this custom tile reads the shared disabled-state token
// directly (Task Group 6) rather than duplicating a hardcoded gray.
export function AddProfileTile({ onPress, disabled }: AddProfileTileProps) {
  const theme = useTheme();
  const circleStyle = disabled
    ? { backgroundColor: disabledContainerColor(theme) }
    : { backgroundColor: theme.colors.surfaceVariant };
  const plusStyle = disabled
    ? { color: disabledContentColor(theme) }
    : { color: theme.colors.onSurfaceVariant };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Add profile"
      accessibilityState={{ disabled }}
    >
      <View style={[styles.circle, circleStyle]}>
        <Text variant="headlineMedium" style={plusStyle}>
          +
        </Text>
      </View>
      <Text variant="bodyMedium" style={styles.label}>
        Add Profile
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
  label: {
    maxWidth: TILE_SIZE + 16,
  },
});
