import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MEGABYTES } from '../constants';
import MemoryAllocationInput from '../';

describe('MemoryAllocationInput', () => {
  it('warning alert', () => {
    const setWarning = jest.fn();
    const { container } = render(
      <MemoryAllocationInput
        value={11264 * MEGABYTES}
        recommendedMaxValue={10240}
        setWarning={setWarning}
      />
    );
    const input = container.querySelector('.foreman-numeric-input-input');
    expect(input).toHaveValue('11264 MB');
    expect(setWarning).toHaveBeenCalledTimes(1);
  });

  it('error alert', () => {
    const setError = jest.fn();
    const { container } = render(
      <MemoryAllocationInput
        value={21504 * MEGABYTES}
        maxValue={20480 * MEGABYTES}
        setError={setError}
      />
    );
    const input = container.querySelector('.foreman-numeric-input-input');
    expect(input).toHaveValue('21504 MB');
    expect(setError).toHaveBeenCalledTimes(1);
  });
});
