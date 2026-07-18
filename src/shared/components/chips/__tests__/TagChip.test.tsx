import { render, fireEvent } from '@testing-library/react-native';
import { TagChip } from '../TagChip';

describe('TagChip', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<TagChip>Vintage</TagChip>);

    expect(getByText('Vintage')).toBeTruthy();
  });

  it('shows no remove affordance when read-only (no onClose)', async () => {
    const { queryByLabelText } = await render(<TagChip>Vintage</TagChip>);

    expect(queryByLabelText(/remove/i)).toBeNull();
  });

  it('fires onClose when its remove "x" is tapped, once editable', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await render(
      <TagChip onClose={onClose} closeIconAccessibilityLabel="Remove Vintage">
        Vintage
      </TagChip>,
    );

    fireEvent.press(getByLabelText('Remove Vintage'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
