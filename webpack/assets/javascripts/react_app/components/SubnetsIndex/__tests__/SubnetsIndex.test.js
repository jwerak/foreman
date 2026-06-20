import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubnetsIndex from '../index';

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));

jest.mock('../../SearchBar', () => {
  const MockSearchBar = ({ onSearch, initialQuery }) => (
    <input
      data-testid="search-bar"
      defaultValue={initialQuery}
      onChange={e => onSearch(e.target.value)}
    />
  );
  MockSearchBar.displayName = 'MockSearchBar';
  return MockSearchBar;
});

// eslint-disable-next-line import/first
import API from '../../../redux/API/API';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

const mockApiResponse = {
  data: {
    results: [
      { id: 1, name: 'Production', network_address: '10.0.0.0/24', vlanid: 100, dhcp_name: 'dhcp-proxy.example.com', hosts_count: 42 },
      { id: 2, name: 'Development', network_address: '192.168.1.0/24', vlanid: null, dhcp_name: null, hosts_count: 5 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/subnets',
  controller: 'subnets',
  createUrl: '/subnets/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <SubnetsIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('SubnetsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with subnet data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('VLAN ID')).toBeInTheDocument();
    expect(screen.getByText('DHCP Proxy')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    expect(screen.getByText('Production').closest('a')).toHaveAttribute(
      'href',
      '/subnets/1/edit'
    );
  });

  test('displays network address and VLAN ID', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('10.0.0.0/24')).toBeInTheDocument();
    });

    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('displays DHCP proxy name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('dhcp-proxy.example.com')).toBeInTheDocument();
    });
  });

  test('hosts count links to host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    expect(screen.getByText('42').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('search=')
    );
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
