import { render, fireEvent } from '@testing-library/react-native';
import { ListItem } from '../ListItem';

function flattenStyle(style: unknown): Record<string, unknown> {
  return ([style].flat(Infinity) as Record<string, unknown>[]).reduce(
    (acc, value) => (value ? { ...acc, ...value } : acc),
    {},
  );
}

describe('ListItem', () => {
  it('renders its title', async () => {
    const { getByText } = await render(<ListItem title="Category" />);

    expect(getByText('Category')).toBeTruthy();
  });

  it('renders its description when supplied', async () => {
    const { getByText } = await render(
      <ListItem title="Category" description="12 items" />,
    );

    expect(getByText('12 items')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <ListItem title="Category" onPress={onPress} />,
    );

    fireEvent.press(getByText('Category'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies list-item-padding-h/16dp and -v/12dp (spec.md §44.10)', async () => {
    const { getByTestId } = await render(
      <ListItem title="Category" testID="li" />,
    );

    const style = flattenStyle(getByTestId('li').props.style);
    expect(style).toMatchObject({ paddingHorizontal: 16, paddingVertical: 12 });
  });

  it('uses the one-line min height (56dp) with no description', async () => {
    const { getByTestId } = await render(
      <ListItem title="Category" testID="li" />,
    );

    const style = flattenStyle(getByTestId('li').props.style);
    expect(style).toMatchObject({ minHeight: 56 });
  });

  it('uses the two-line min height (72dp) once a description is supplied', async () => {
    const { getByTestId } = await render(
      <ListItem title="Category" description="12 items" testID="li" />,
    );

    const style = flattenStyle(getByTestId('li').props.style);
    expect(style).toMatchObject({ minHeight: 72 });
  });
});
