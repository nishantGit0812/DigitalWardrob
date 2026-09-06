import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import type { SvgProps } from 'react-native-svg';
import { IconButton } from '../../buttons/IconButton';
import { Tooltip } from '../Tooltip';

function CameraIcon(props: SvgProps) {
  return <View testID="camera-icon" {...props} />;
}

// A pure pass-through over Paper's own Tooltip (see Tooltip.tsx's header
// comment) — Paper's own test suite already covers its internal long-press
// timing and positioning logic, so this suite only confirms the wrapper
// renders its wrapped control and forwards props/children unchanged,
// rather than re-asserting Paper's internals through brittle prop
// inspection of its nested TouchableRipple/Pressable implementation.
describe('Tooltip', () => {
  it('renders its wrapped control', async () => {
    const { getByLabelText } = await render(
      <Tooltip title="Selected Camera">
        <IconButton
          icon={CameraIcon}
          accessibilityLabel="Camera"
          onPress={() => {}}
        />
      </Tooltip>,
      { wrapper: PaperProvider },
    );

    expect(getByLabelText('Camera')).toBeTruthy();
  });

  it('does not render its title text until interacted with', async () => {
    const { queryByText } = await render(
      <Tooltip title="Selected Camera">
        <IconButton
          icon={CameraIcon}
          accessibilityLabel="Camera"
          onPress={() => {}}
        />
      </Tooltip>,
      { wrapper: PaperProvider },
    );

    expect(queryByText('Selected Camera')).toBeNull();
  });

  it('still fires the wrapped control onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <Tooltip title="Selected Camera">
        <IconButton
          icon={CameraIcon}
          accessibilityLabel="Camera"
          onPress={onPress}
        />
      </Tooltip>,
      { wrapper: PaperProvider },
    );

    fireEvent.press(getByLabelText('Camera'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
