import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders its numeral content', async () => {
    const { getByText } = await render(<Badge>3</Badge>);

    expect(getByText('3')).toBeTruthy();
  });

  it('renders as visible dot content when given no children', async () => {
    const { queryByText } = await render(<Badge visible />);

    expect(queryByText(/\d/)).toBeNull();
  });
});
