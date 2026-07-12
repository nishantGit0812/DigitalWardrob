import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// No avatar color palette is specified in spec.md beyond "name and
// avatar/color" (FR-1) — this fixed set of 8 distinguishable accents is a
// Phase 1 UI decision, not a stakeholder-locked one. Shared by
// CreateProfileScreen and EditProfileScreen (spec.md's screen inventory
// treats "Create/Edit Profile" as one screen concept). Contrast for text
// drawn on top of a swatch (ProfileTile's avatar initial) is handled per
// swatch by app/theme's pickReadableTextColor, not by restricting this
// palette to colors that happen to work with a single fixed text color.
export const AVATAR_COLORS = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#7986CB',
  '#4FC3F7',
  '#4DB6AC',
  '#81C784',
  '#FFB74D',
];

interface AvatarColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function AvatarColorPicker({
  selectedColor,
  onSelect,
}: AvatarColorPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {AVATAR_COLORS.map(color => {
        const selected = color === selectedColor;
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
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
  );
}

const styles = StyleSheet.create({
  row: {
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
