import React from 'react';
import { render } from '@testing-library/react';
import RadioButton from './RadioButton';

const requiredProps = {
  input: { id: 'test-radio', name: 'test-radio-name' },
  item: { label: 'default-label', value: 'default-value' },
};

describe('RadioButton', () => {
  it('renders with default props', () => {
    const { container } = render(<RadioButton {...requiredProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with item', () => {
    const { container } = render(
      <RadioButton
        {...requiredProps}
        item={{ label: 'some-label', checked: true, value: 'some-value' }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { container } = render(
      <RadioButton {...requiredProps} disabled />
    );
    expect(container).toMatchSnapshot();
  });
});
