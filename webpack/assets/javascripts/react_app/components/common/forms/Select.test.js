import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import $ from 'jquery';

import Select from './Select';

// Mock select2 plugin on jQuery prototype
$.fn.select2 = jest.fn();

describe('Select', () => {
  it('onChange called exactly once even after update', () => {
    const options = { one: '1', two: '2' };
    const onChangeMock = jest.fn();
    const { container, rerender } = render(
      <Select options={options} onChange={onChangeMock} />
    );

    const selectElement = container.querySelector('select');
    fireEvent.change(selectElement, { target: { value: 'val' } });

    expect(onChangeMock).toHaveBeenCalledTimes(1);

    options.three = '3';
    rerender(<Select options={options} onChange={onChangeMock} />);

    onChangeMock.mockClear();
    fireEvent.change(selectElement, { target: { value: 'val' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });
});
