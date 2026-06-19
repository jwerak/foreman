import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterInput from '../';

describe('CounterInput', () => {
  it('warning alert', () => {
    const setWarning = jest.fn();
    render(
      <CounterInput value={11} recommendedMaxValue={10} inputKey={'cpus'} setWarning={setWarning} />
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('11');
    expect(setWarning).toHaveBeenCalledTimes(1);
  });

  it('error alert', () => {
    const setError = jest.fn();
    render(
      <CounterInput value={21} max={20} inputKey={'cpus'} setError={setError} />
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('21');
    expect(setError).toHaveBeenCalledTimes(1);
  });
});
