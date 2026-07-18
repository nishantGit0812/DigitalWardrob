import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { IconButton } from '../IconButton';

function Standard(props: SvgProps) {
  return <View testID="standard-icon" {...props} />;
}

function Outline(props: SvgProps) {
  return <View testID="outline-icon" {...props} />;
}

function Filled(props: SvgProps) {
  return <View testID="filled-icon" {...props} />;
}

describe('IconButton', () => {
  it('renders a single standard icon', async () => {
    const { queryByTestId } = await render(
      <IconButton icon={Standard} accessibilityLabel="Back" />,
    );

    expect(queryByTestId('standard-icon')).not.toBeNull();
  });

  it('renders the Outline variant of an {Outline, Filled} pair when not selected', async () => {
    const { queryByTestId } = await render(
      <IconButton icon={{ Outline, Filled }} accessibilityLabel="Favorite" />,
    );

    expect(queryByTestId('outline-icon')).not.toBeNull();
    expect(queryByTestId('filled-icon')).toBeNull();
  });

  it('renders the Filled variant when selected', async () => {
    const { queryByTestId } = await render(
      <IconButton
        icon={{ Outline, Filled }}
        selected
        accessibilityLabel="Favorite"
      />,
    );

    expect(queryByTestId('filled-icon')).not.toBeNull();
    expect(queryByTestId('outline-icon')).toBeNull();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <IconButton
        icon={Standard}
        accessibilityLabel="Back"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the mandatory accessibilityLabel', async () => {
    const { getByLabelText } = await render(
      <IconButton icon={Standard} accessibilityLabel="Back" />,
    );

    expect(getByLabelText('Back')).toBeTruthy();
  });
});
