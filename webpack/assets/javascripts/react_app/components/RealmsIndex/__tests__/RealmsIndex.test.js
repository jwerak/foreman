import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealmsIndex from '../index';

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
      { id: 1, name: 'EXAMPLE.COM', hosts_count: 8 },
      { id: 2, name: 'TEST.ORG', hosts_count: 0 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/realms',
  controller: 'realms',
  createUrl: '/realms/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <RealmsIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('RealmsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with realm data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EXAMPLE.COM')).toBeInTheDocument();
    });

    expect(screen.getByText('TEST.ORG')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EXAMPLE.COM')).toBeInTheDocument();
    });

    expect(screen.getByText('EXAMPLE.COM').closest('a')).toHaveAttribute(
      'href',
      '/realms/1/edit'
    );
  });

  test('hosts count links to host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    expect(screen.getByText('8').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('search=')
    );
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EXAMPLE.COM')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
