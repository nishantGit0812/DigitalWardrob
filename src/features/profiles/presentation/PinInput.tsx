import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

const PIN_LENGTH = 4;

interface PinInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  label: string;
}

// A visible masked TextInput (not a hidden one with decorative dots
// standing in for it) — simpler and more reliably TalkBack-accessible than
// tricks that hide the real input. The dot row underneath is purely
// decorative fill-progress, hidden from screen readers so it isn't
// announced redundantly alongside the input's own value changes.
export function PinInput({ value, onChangeValue, label }: PinInputProps) {
  const theme = useTheme();

  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={text =>
          onChangeValue(text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))
        }
        keyboardType="number-pad"
        secureTextEntry
        maxLength={PIN_LENGTH}
        accessibilityLabel={label}
      />
      <View
        style={styles.dotsRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { borderColor: theme.colors.onSurfaceVariant },
              index < value.length && {
                backgroundColor: theme.colors.onSurfaceVariant,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
