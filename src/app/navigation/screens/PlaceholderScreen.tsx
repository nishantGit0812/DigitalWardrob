import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlaceholderScreenProps {
  title: string;
}

// Phase 0 stub per plan.md 5.2/6.2 — each tab gets its real screen in a
// later phase (see roadmap.md). Deliberately empty beyond a label, except
// where a task group (e.g. Settings' dark-mode toggle) needs a stub control.
// Background/text pull from the Paper theme (not hardcoded) so toggling
// dark mode is actually visible here for 6.3's manual contrast check.
export function PlaceholderScreen({
  title,
  children,
}: PropsWithChildren<PlaceholderScreenProps>) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
