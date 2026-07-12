import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlaceholderScreenProps {
  title: string;
}

// Phase 0 stub per plan.md 5.2/6.2 — each tab gets its real screen in a
// later phase (see roadmap.md). Deliberately empty beyond a label.
export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
