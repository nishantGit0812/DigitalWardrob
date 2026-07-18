import { render } from '@testing-library/react-native';
import { MD3LightTheme } from 'react-native-paper';
import { SectionHeader } from '../SectionHeader';

function flattenStyle(style: unknown): Record<string, unknown> {
  return ([style].flat(Infinity) as Record<string, unknown>[]).reduce(
    (acc, value) => (value ? { ...acc, ...value } : acc),
    {},
  );
}

describe('SectionHeader', () => {
  it('renders its text', async () => {
    const { getByText } = await render(
      <SectionHeader>Recently added</SectionHeader>,
    );

    expect(getByText('Recently added')).toBeTruthy();
  });

  it('applies space-base/16dp top margin and space-sm/8dp bottom margin', async () => {
    const { getByText } = await render(
      <SectionHeader>Recently added</SectionHeader>,
    );

    const style = flattenStyle(getByText('Recently added').props.style);
    expect(style).toMatchObject({ marginTop: 16, marginBottom: 8 });
  });

  it('colors the text On-Surface-Variant', async () => {
    const { getByText } = await render(
      <SectionHeader>Recently added</SectionHeader>,
    );

    const style = flattenStyle(getByText('Recently added').props.style);
    expect(style.color).toBe(MD3LightTheme.colors.onSurfaceVariant);
  });
});
