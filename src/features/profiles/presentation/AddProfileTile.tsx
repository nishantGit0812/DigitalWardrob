import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import {
  disabledContainerColor,
  disabledContentColor,
} from '../../../app/theme/disabledState';
import { useGridTileMotion } from './gridMotion';

const TILE_SIZE = 72;

interface AddProfileTileProps {
  index: number;
  onPress: () => void;
  disabled: boolean;
}

// Matches ProfileTile's shape so it sits naturally in the same grid. Not a
// Paper `Button` — Paper's own disabled styling only applies to Paper
// components, so this custom tile reads the shared disabled-state token
// directly (Task Group 6) rather than duplicating a hardcoded gray. Always
// the grid's last tile, so `index` (= profile count) both staggers its
// entry after the real tiles and drives its own reflow when the count
// changes (gridMotion.ts).
export function AddProfileTile({
  index,
  onPress,
  disabled,
}: AddProfileTileProps) {
  const theme = useTheme();
  const motion = useGridTileMotion(index);
  const circleStyle = disabled
    ? { backgroundColor: disabledContainerColor(theme) }
    : { backgroundColor: theme.colors.surfaceVariant };
  const plusStyle = disabled
    ? { color: disabledContentColor(theme) }
    : { color: theme.colors.onSurfaceVariant };

  return (
    <Animated.View entering={motion.entering} layout={motion.layout}>
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
    </Animated.View>
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
