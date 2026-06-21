import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterfacesTab from '../tabs/InterfacesTab';
import HostFormContext from '../HostFormContext';

jest.mock('../../../common/I18n');

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

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
  return render(
    <HostFormContext.Provider value={state}>
      <InterfacesTab />
    </HostFormContext.Provider>
  );
};

describe('InterfacesTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with interface columns', () => {
    renderWithContext();

    expect(screen.getByText('Identifier')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('MAC Address')).toBeInTheDocument();
    expect(screen.getByText('IPv4 Address')).toBeInTheDocument();
    expect(screen.getByText('IPv6 Address')).toBeInTheDocument();
    expect(screen.getByText('FQDN')).toBeInTheDocument();
  });

  test('shows empty state when no interfaces', () => {
    renderWithContext({
      values: { interfaces_attributes: [] },
    });

    expect(
      screen.getByText('No interfaces defined. Click "Add Interface" to create one.')
    ).toBeInTheDocument();
  });

  test('renders interfaces from values', () => {
    renderWithContext({
      values: {
        interfaces_attributes: [
          {
            identifier: 'eth0',
            type: 'Nic::Managed',
            mac: 'aa:bb:cc:dd:ee:ff',
            ip: '192.168.1.10',
            ip6: 'fe80::1',
            name: 'host.example.com',
            primary: true,
            provision: true,
            managed: true,
            _destroy: false,
          },
        ],
      },
    });

    expect(screen.getByText('eth0')).toBeInTheDocument();
    expect(screen.getByText('Interface')).toBeInTheDocument();
    expect(screen.getByText('aa:bb:cc:dd:ee:ff')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('fe80::1')).toBeInTheDocument();
    expect(screen.getByText('host.example.com')).toBeInTheDocument();
  });

  test('Add Interface button opens modal', () => {
    renderWithContext();

    const addButton = screen.getByText('Add Interface');
    fireEvent.click(addButton);

    // InterfaceModal should be open with form fields
    expect(screen.getByLabelText('Identifier')).toBeInTheDocument();
    expect(screen.getByLabelText('MAC Address')).toBeInTheDocument();
  });

  test('Delete button marks interface as _destroy', () => {
    const onChange = jest.fn();
    renderWithContext({
      values: {
        interfaces_attributes: [
          {
            identifier: 'eth0',
            type: 'Nic::Managed',
            mac: 'aa:bb:cc:dd:ee:ff',
            ip: '192.168.1.10',
            ip6: '',
            name: '',
            primary: true,
            provision: true,
            managed: true,
            _destroy: false,
          },
        ],
      },
      onChange,
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(onChange).toHaveBeenCalledWith(
      'interfaces_attributes',
      expect.arrayContaining([
        expect.objectContaining({ _destroy: true }),
      ])
    );
  });

  test('does not show interfaces marked as _destroy', () => {
    renderWithContext({
      values: {
        interfaces_attributes: [
          {
            identifier: 'eth0',
            type: 'Nic::Managed',
            _destroy: true,
          },
          {
            identifier: 'eth1',
            type: 'Nic::Managed',
            _destroy: false,
          },
        ],
      },
    });

    expect(screen.queryByText('eth0')).not.toBeInTheDocument();
    expect(screen.getByText('eth1')).toBeInTheDocument();
  });
});
