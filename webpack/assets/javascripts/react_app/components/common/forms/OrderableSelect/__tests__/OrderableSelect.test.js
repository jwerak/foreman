import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import OrderableSelect from '../OrderableSelect';
import { yesNoOpts } from '../../__fixtures__/Form.fixtures';

const WrappedInTestContext = props => (
  <DndProvider backend={HTML5Backend}>
    <OrderableSelect {...props} />
  </DndProvider>
);

describe('OrderableSelect', () => {
  it('renders selected tokens for initial value', () => {
    render(
      <WrappedInTestContext
        id="testOrderable"
        options={yesNoOpts}
        value={['yes', 'no', 'dnk']}
      />
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Do Not Know')).toBeInTheDocument();
  });

  it('renders hidden inputs if name given', () => {
    const value = ['yes', 'no', 'dnk'];
    const { container } = render(
      <WrappedInTestContext
        id="testOrderable"
        options={yesNoOpts}
        value={value}
        name="uncertain_select[]"
      />
    );
    const inputs = container.querySelectorAll('input[type="hidden"]');
    expect(inputs).toHaveLength(3);
    inputs.forEach((input, idx) => {
      expect(input.value).toBe(value[idx]);
      expect(input.name).toBe('uncertain_select[]');
    });
  });

  it('renders token container elements with correct ids', () => {
    const { container } = render(
      <WrappedInTestContext
        id="testOrderable"
        options={yesNoOpts}
        value={['yes', 'no']}
      />
    );
    expect(
      container.querySelector('#testOrderable-yes')
    ).toBeInTheDocument();
    expect(
      container.querySelector('#testOrderable-no')
    ).toBeInTheDocument();
  });
});
