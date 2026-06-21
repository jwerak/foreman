import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParametersTab from '../tabs/ParametersTab';
import HostFormContext from '../HostFormContext';

jest.mock('../../../common/I18n');

const createMockFormState = (overrides = {}) => ({
  values: {
    name: 'test-host',
    interfaces_attributes: [],
    host_parameters_attributes: [],
    ...overrides.values,
  },
  errors: {},
  submitErrors: null,
  isLoading: false,
  isSubmitting: false,
  options: {
    organizations: [],
    locations: [],
    hostgroups: [],
    computeResources: [],
    computeProfiles: [],
    realms: [],
    models: [],
    owners: [],
    architectures: [],
  },
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  applyHostgroupDefaults: jest.fn(),
  refreshTaxonomyOptions: jest.fn(),
  meta: {
    isNew: true,
    isManaged: true,
    cancelUrl: '/hosts',
    showOrganizationTab: false,
    showLocationTab: false,
  },
  ...overrides,
});

const renderWithContext = (formState = {}) => {
  const state = createMockFormState(formState);
  return {
    ...render(
      <HostFormContext.Provider value={state}>
        <ParametersTab />
      </HostFormContext.Provider>
    ),
    onChange: state.onChange,
  };
};

describe('ParametersTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders "No host parameters defined" when empty', () => {
    renderWithContext({
      values: { host_parameters_attributes: [] },
    });

    expect(
      screen.getByText('No host parameters defined.')
    ).toBeInTheDocument();
  });

  test('renders parameter rows from values', () => {
    renderWithContext({
      values: {
        host_parameters_attributes: [
          { name: 'env', value: 'production', _destroy: false },
          { name: 'region', value: 'us-east-1', _destroy: false },
        ],
      },
    });

    expect(screen.getByDisplayValue('env')).toBeInTheDocument();
    expect(screen.getByDisplayValue('production')).toBeInTheDocument();
    expect(screen.getByDisplayValue('region')).toBeInTheDocument();
    expect(screen.getByDisplayValue('us-east-1')).toBeInTheDocument();
  });

  test('Add parameter button adds a row', () => {
    const { onChange } = renderWithContext({
      values: { host_parameters_attributes: [] },
    });

    const addButton = screen.getByText('Add parameter');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      'host_parameters_attributes',
      [{ name: '', value: '', _destroy: false }]
    );
  });

  test('Remove button removes new parameter (no id)', () => {
    const { onChange } = renderWithContext({
      values: {
        host_parameters_attributes: [
          { name: 'env', value: 'production', _destroy: false },
        ],
      },
    });

    const removeButton = screen.getByLabelText('Remove parameter');
    fireEvent.click(removeButton);

    // New parameter (no id) is removed entirely from the array
    expect(onChange).toHaveBeenCalledWith(
      'host_parameters_attributes',
      []
    );
  });

  test('Remove button marks existing parameter (with id) as _destroy', () => {
    const { onChange } = renderWithContext({
      values: {
        host_parameters_attributes: [
          { id: 1, name: 'env', value: 'production', _destroy: false },
        ],
      },
    });

    const removeButton = screen.getByLabelText('Remove parameter');
    fireEvent.click(removeButton);

    // Existing parameter (with id) is marked as _destroy
    expect(onChange).toHaveBeenCalledWith(
      'host_parameters_attributes',
      [expect.objectContaining({ id: 1, _destroy: true })]
    );
  });

  test('does not show parameters marked as _destroy', () => {
    renderWithContext({
      values: {
        host_parameters_attributes: [
          { id: 1, name: 'hidden', value: 'val', _destroy: true },
          { name: 'visible', value: 'val2', _destroy: false },
        ],
      },
    });

    expect(screen.queryByDisplayValue('hidden')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('visible')).toBeInTheDocument();
  });
});
