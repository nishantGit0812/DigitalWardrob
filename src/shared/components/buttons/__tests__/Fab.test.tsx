import { render, fireEvent } from '@testing-library/react-native';
import { AccessibilityInfo, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { Fab } from '../Fab';

function PlusIcon(props: SvgProps) {
  return <View testID="plus-icon" {...props} />;
}

const isReduceMotionEnabledMock =
  AccessibilityInfo.isReduceMotionEnabled as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  isReduceMotionEnabledMock.mockResolvedValue(false);
});

describe('Fab', () => {
  it('renders its icon', async () => {
    const { queryByTestId } = await render(
      <Fab icon={PlusIcon} accessibilityLabel="Add item" onPress={() => {}} />,
    );

    expect(queryByTestId('plus-icon')).not.toBeNull();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Fab icon={PlusIcon} accessibilityLabel="Add item" onPress={onPress} />,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('still fires onPress when the system reduced-motion setting is on', async () => {
    isReduceMotionEnabledMock.mockResolvedValue(true);
    const onPress = jest.fn();
    const { getByRole, findByRole } = await render(
      <Fab icon={PlusIcon} accessibilityLabel="Add item" onPress={onPress} />,
    );
    await findByRole('button');

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies radius-lg/16dp via the medium-size default (spec.md §44.2/§44.9)', async () => {
    const { getByTestId } = await render(
      <Fab icon={PlusIcon} accessibilityLabel="Add item" onPress={() => {}} />,
    );

    expect(getByTestId('fab-container').props.style.borderRadius).toBe(16);
  });

  it('accepts a size override without crashing', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Fab
        icon={PlusIcon}
        accessibilityLabel="Add item"
        onPress={onPress}
        size="small"
      />,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
