import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing } from '../../../app/theme';

// docs/spec.md §45.2 — Label Large, On-Surface-Variant, `space-base`/16dp
// top margin, `space-sm`/8dp bottom margin. Sentence case only — no
// all-caps transform — per §28a.1's non-shouty tone (e.g. "Recently
// added," not "RECENTLY ADDED"); this is a discipline enforced by what
// callers pass as `children`, not something this component can itself
// validate.
export interface SectionHeaderProps
  extends Omit<ComponentProps<typeof Text>, 'variant'> {
  children: string;
}

export function SectionHeader({ style, ...rest }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <Text
      variant="labelLarge"
      style={[styles.header, { color: theme.colors.onSurfaceVariant }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
});
