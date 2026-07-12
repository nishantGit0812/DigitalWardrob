import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useThemeMode } from '../../theme';
import { PlaceholderScreen } from './PlaceholderScreen';

// Dark-mode toggle per plan.md 6.2 — deliberately a no-op setting: it only
// flips ThemeModeContext's in-memory state to drive Paper's theme for manual
// light/dark QA (6.3). It does NOT persist (no MMKV/Redux write); real
// persistence is roadmap 8.1. Labeled "preview only" so this stays visibly
// a stub rather than silently becoming the real implementation.
export function SettingsScreen() {
  const { mode, toggle } = useThemeMode();

  return (
    <PlaceholderScreen title="Settings">
      <View style={styles.row}>
        <Text variant="bodyLarge">Dark mode (preview only — not saved)</Text>
        <Switch
          value={mode === 'dark'}
          onValueChange={toggle}
          accessibilityLabel="Toggle dark mode preview"
        />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
});
