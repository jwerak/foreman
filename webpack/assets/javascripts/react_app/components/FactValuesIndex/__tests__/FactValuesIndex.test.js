import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FactValuesIndex from '../index';

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
        host_name: 'web01.example.com',
        host_id: 10,
        fact_name: 'os.name',
        value: 'CentOS',
        origin: 'Facter',
        updated_at: '2026-06-20T10:30:00Z',
      },
      {
        id: 2,
        host_name: 'db01.example.com',
        host_id: 11,
        fact_name: 'memory.total',
        value: '16 GB',
        origin: 'Facter',
        updated_at: '2026-06-20T09:15:00Z',
      },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: false,
  },
};

const defaultProps = {
  apiUrl: '/fact_values.json',
  controller: 'fact_values',
  searchable: true,
  creatable: false,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <FactValuesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('FactValuesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with fact data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('db01.example.com')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Reported at')).toBeInTheDocument();
  });

  test('host name links to host facts page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(
      screen.getByText('web01.example.com').closest('a')
    ).toHaveAttribute('href', '/hosts/web01.example.com/facts');
  });

  test('renders fact name and value', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('os.name')).toBeInTheDocument();
    });

    expect(screen.getByText('CentOS')).toBeInTheDocument();
    expect(screen.getByText('memory.total')).toBeInTheDocument();
    expect(screen.getByText('16 GB')).toBeInTheDocument();
  });

  test('renders origin', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Facter')).toHaveLength(2);
    });
  });

  test('does not render row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(screen.queryAllByLabelText('Kebab toggle')).toHaveLength(0);
  });
});
