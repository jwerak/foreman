import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartProxiesIndex from '../index';

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
      {
        id: 1,
        name: 'proxy01.example.com',
        url: 'https://proxy01.example.com:8443',
        features: [
          { name: 'DHCP', id: 1 },
          { name: 'DNS', id: 2 },
        ],
        hosts_count: 15,
      },
      {
        id: 2,
        name: 'proxy02.example.com',
        url: 'https://proxy02.example.com:8443',
        features: [{ name: 'Puppet CA', id: 3 }],
        hosts_count: 8,
      },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/smart_proxies',
  controller: 'smart_proxies',
  createUrl: '/smart_proxies/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <SmartProxiesIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('SmartProxiesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with smart proxy data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('proxy01.example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('proxy02.example.com')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  test('name links to show page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('proxy01.example.com')).toBeInTheDocument();
    });

    expect(
      screen.getByText('proxy01.example.com').closest('a')
    ).toHaveAttribute('href', '/smart_proxies/1');
  });

  test('renders features as sorted comma-separated list', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('DHCP, DNS')).toBeInTheDocument();
    });

    expect(screen.getByText('Puppet CA')).toBeInTheDocument();
  });

  test('renders URL column', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('https://proxy01.example.com:8443')
      ).toBeInTheDocument();
    });
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('proxy01.example.com')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
