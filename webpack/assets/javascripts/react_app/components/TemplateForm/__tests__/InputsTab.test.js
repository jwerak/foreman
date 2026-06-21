import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputsTab from '../tabs/InputsTab';
import TemplateFormContext from '../TemplateFormContext';

jest.mock('../../../common/I18n');

const defaultContext = {
  values: {
    locked: false,
    template_inputs_attributes: [],
  },
  errors: {},
  onChange: jest.fn(),
  options: {
    inputTypes: [
      { value: 'user', label: 'User input' },
      { value: 'fact', label: 'Fact value' },
      { value: 'variable', label: 'Variable' },
    ],
    valueTypes: [
      { value: 'plain', label: 'Plain' },
      { value: 'search', label: 'Search' },
      { value: 'date', label: 'Date' },
      { value: 'resource', label: 'Resource' },
    ],
    resourceTypes: [{ value: 'Host', label: 'Host' }],
  },
  isSubmitting: false,
  meta: {},
};

const renderInputsTab = (contextOverrides = {}) =>
  render(
    <TemplateFormContext.Provider value={{ ...defaultContext, ...contextOverrides }}>
      <InputsTab />
    </TemplateFormContext.Provider>
  );

describe('InputsTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders info alert', () => {
    renderInputsTab();
    expect(screen.getByText(/Inputs can be used to parametrize/)).toBeInTheDocument();
  });

  test('renders Add Input button', () => {
    renderInputsTab();
    expect(screen.getByText('Add Input')).toBeInTheDocument();
  });

  test('hides Add Input button when locked', () => {
    renderInputsTab({
      values: { locked: true, template_inputs_attributes: [] },
    });
    expect(screen.queryByText('Add Input')).not.toBeInTheDocument();
  });

  test('renders existing inputs', () => {
    renderInputsTab({
      values: {
        locked: false,
        template_inputs_attributes: [
          { id: 1, name: 'cpu_count', input_type: 'fact', value_type: 'plain' },
          { id: 2, name: 'env', input_type: 'user', value_type: 'plain' },
        ],
      },
    });

    expect(screen.getByText('cpu_count')).toBeInTheDocument();
    expect(screen.getByText('env')).toBeInTheDocument();
  });

  test('does not render destroyed inputs', () => {
    renderInputsTab({
      values: {
        locked: false,
        template_inputs_attributes: [
          { id: 1, name: 'visible', input_type: 'user', value_type: 'plain' },
          { id: 2, name: 'hidden', input_type: 'user', value_type: 'plain', _destroy: true },
        ],
      },
    });

    expect(screen.getByText('visible')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  test('clicking Add Input calls onChange with new input', () => {
    const onChange = jest.fn();
    renderInputsTab({ onChange });

    fireEvent.click(screen.getByText('Add Input'));

    expect(onChange).toHaveBeenCalledWith(
      'template_inputs_attributes',
      expect.arrayContaining([
        expect.objectContaining({ name: '', input_type: '', value_type: 'plain' }),
      ])
    );
  });

  test('shows fact_name field when input_type is fact', () => {
    renderInputsTab({
      values: {
        locked: false,
        template_inputs_attributes: [
          { id: 1, name: 'test', input_type: 'fact', value_type: 'plain' },
        ],
      },
    });

    expect(screen.getByRole('textbox', { name: /Fact name/i })).toBeInTheDocument();
  });

  test('shows variable_name field when input_type is variable', () => {
    renderInputsTab({
      values: {
        locked: false,
        template_inputs_attributes: [
          { id: 1, name: 'test', input_type: 'variable', value_type: 'plain' },
        ],
      },
    });

    expect(screen.getByRole('textbox', { name: /Variable name/i })).toBeInTheDocument();
  });
});
