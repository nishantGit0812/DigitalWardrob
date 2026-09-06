import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { AssistChip } from '../AssistChip';

function StarIcon(props: SvgProps) {
  return <View testID="star-icon" {...props} />;
}

describe('AssistChip', () => {
  it('renders its label and leading icon', async () => {
    const { getByText, queryByTestId } = await render(
      <AssistChip icon={StarIcon} onPress={() => {}}>
        Try this outfit
      </AssistChip>,
    );

    expect(getByText('Try this outfit')).toBeTruthy();
    expect(queryByTestId('star-icon')).not.toBeNull();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <AssistChip icon={StarIcon} onPress={onPress}>
        Try this outfit
      </AssistChip>,
    );

    fireEvent.press(getByText('Try this outfit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
