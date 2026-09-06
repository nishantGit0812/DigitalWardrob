import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip } from '../FilterChip';

describe('FilterChip', () => {
  it('renders its label', async () => {
    const { getByText } = await render(
      <FilterChip selected={false} onPress={() => {}}>
        Summer
      </FilterChip>,
    );

    expect(getByText('Summer')).toBeTruthy();
  });

  it('exposes its selected state to TalkBack via accessibilityState', async () => {
    const { getByText } = await render(
      <FilterChip selected onPress={() => {}}>
        Summer
      </FilterChip>,
    );

    expect(
      getByText('Summer').parent?.parent?.props.accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <FilterChip selected={false} onPress={onPress}>
        Summer
      </FilterChip>,
    );

    fireEvent.press(getByText('Summer'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
