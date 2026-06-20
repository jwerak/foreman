import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigReportsIndex from '../index';

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
      { id: 1, host_name: 'web01.example.com', host_id: 10, reported_at: '2026-06-20T10:30:00Z', origin: 'Puppet', applied: 5, restarted: 2, failed: 0, failed_restarts: 0, skipped: 1, pending: 0 },
      { id: 2, host_name: 'db01.example.com', host_id: 11, reported_at: '2026-06-20T09:15:00Z', origin: 'Ansible', applied: 3, restarted: 0, failed: 1, failed_restarts: 0, skipped: 0, pending: 2 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: false,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/config_reports',
  controller: 'config_reports',
  searchable: true,
  creatable: false,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <ConfigReportsIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('ConfigReportsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with config report data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('db01.example.com')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Last report')).toBeInTheDocument();
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Restarted')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Restart Failures')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('host name links to host reports', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(
      screen.getByText('web01.example.com').closest('a')
    ).toHaveAttribute('href', '/hosts/web01.example.com/config_reports');
  });

  test('displays origin', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Puppet')).toBeInTheDocument();
    });

    expect(screen.getByText('Ansible')).toBeInTheDocument();
  });

  test('displays status counters', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
