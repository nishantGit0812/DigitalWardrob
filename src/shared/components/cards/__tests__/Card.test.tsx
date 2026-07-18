import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native-paper';
import { Card } from '../Card';

describe('Card', () => {
  it('renders its children', async () => {
    const { getByText } = await render(
      <Card>
        <Text>Wardrobe item</Text>
      </Card>,
    );

    expect(getByText('Wardrobe item')).toBeTruthy();
  });

  it('applies card-padding/16dp internal padding by default', async () => {
    const { getByTestId } = await render(
      <Card>
        <Text>Wardrobe item</Text>
      </Card>,
    );

    const style = [getByTestId('card').props.style].flat(Infinity);
    expect(style).toContainEqual({ padding: 16 });
  });

  it('rests at elevation-0 (no shadow) by default', async () => {
    const { getByTestId } = await render(
      <Card>
        <Text>Wardrobe item</Text>
      </Card>,
    );

    expect(getByTestId('card-container').props.style.shadowOpacity).toBe(0);
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Card onPress={onPress}>
        <Text>Wardrobe item</Text>
      </Card>,
    );

    fireEvent.press(getByText('Wardrobe item'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
