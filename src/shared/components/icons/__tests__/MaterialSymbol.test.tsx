import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { MaterialSymbol } from '../MaterialSymbol';

// Stand-ins for the two react-native-svg components MaterialSymbol
// switches between — a plain View is enough to assert which one rendered
// and that props (width/height/color/...) were forwarded to it.
function Outline(props: SvgProps) {
  return <View testID="outline" {...props} />;
}

function Filled(props: SvgProps) {
  return <View testID="filled" {...props} />;
}

describe('MaterialSymbol', () => {
  it('renders the Outline variant when not selected', async () => {
    const { queryByTestId } = await render(
      <MaterialSymbol Outline={Outline} Filled={Filled} />,
    );

    expect(queryByTestId('outline')).not.toBeNull();
    expect(queryByTestId('filled')).toBeNull();
  });

  it('renders the Filled variant when selected', async () => {
    const { queryByTestId } = await render(
      <MaterialSymbol Outline={Outline} Filled={Filled} selected />,
    );

    expect(queryByTestId('filled')).not.toBeNull();
    expect(queryByTestId('outline')).toBeNull();
  });

  it('defaults to the 24dp icon-default size token', async () => {
    const { getByTestId } = await render(
      <MaterialSymbol Outline={Outline} Filled={Filled} />,
    );

    expect(getByTestId('outline').props.width).toBe(24);
    expect(getByTestId('outline').props.height).toBe(24);
  });

  it('accepts a size override and forwards other svg props', async () => {
    const { getByTestId } = await render(
      <MaterialSymbol
        Outline={Outline}
        Filled={Filled}
        size={32}
        color="#4F46E5"
      />,
    );

    const icon = getByTestId('outline');
    expect(icon.props.width).toBe(32);
    expect(icon.props.height).toBe(32);
    expect(icon.props.color).toBe('#4F46E5');
  });
});
