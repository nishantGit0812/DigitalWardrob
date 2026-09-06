import { render, fireEvent } from '@testing-library/react-native';
import { Chip } from '../Chip';

function flattenStyle(style: unknown): Record<string, unknown> {
  return ([style].flat(Infinity) as Record<string, unknown>[]).reduce(
    (acc, value) => (value ? { ...acc, ...value } : acc),
    {},
  );
}

describe('Chip', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<Chip>Cotton</Chip>);

    expect(getByText('Cotton')).toBeTruthy();
  });

  it('applies height-chip/32dp and a full pill radius (spec.md §44.2/§44.9)', async () => {
    const { getByTestId } = await render(<Chip testID="chip">Cotton</Chip>);

    // Paper's Surface splits `height` onto a separate outer-layer node from
    // the rest of the style (confirmed against Surface.tsx's
    // `outerLayerStyleProperties`) — border-radius styles land on both.
    const outerStyle = flattenStyle(
      getByTestId('chip-container-outer-layer').props.style,
    );
    const innerStyle = flattenStyle(getByTestId('chip-container').props.style);
    expect(outerStyle).toMatchObject({ height: 32 });
    expect(innerStyle).toMatchObject({ borderRadius: 9999 });
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Chip onPress={onPress}>Cotton</Chip>);

    fireEvent.press(getByText('Cotton'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
