import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<Button>Save</Button>);

    expect(getByText('Save')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button onPress={onPress}>Save</Button>);

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button onPress={onPress} disabled>
        Save
      </Button>,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('guarantees a 48dp touch target via hit-slop by default (40dp visual height)', async () => {
    const { getByRole } = await render(<Button>Save</Button>);

    expect(getByRole('button').props.hitSlop).toEqual({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
    });
  });

  it('lets a caller override hitSlop explicitly', async () => {
    const { getByRole } = await render(
      <Button hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        Save
      </Button>,
    );

    expect(getByRole('button').props.hitSlop).toEqual({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    });
  });

  it.each(['filled', 'outlined', 'text', 'tonal'] as const)(
    'renders the %s emphasis without crashing',
    async emphasis => {
      const { getByText } = await render(
        <Button emphasis={emphasis}>Save</Button>,
      );

      expect(getByText('Save')).toBeTruthy();
    },
  );
});
