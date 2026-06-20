import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DomainsIndex from '../index';

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
      { id: 1, name: 'example.com', fullname: 'Example Domain', hosts_count: 5 },
      { id: 2, name: 'test.org', fullname: '', hosts_count: 3 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/domains',
  controller: 'domains',
  createUrl: '/domains/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <DomainsIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('DomainsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with domain data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });

    expect(screen.getByText('test.org')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('renders fullname when available, name when empty', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });

    expect(screen.getByText('test.org')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });

    expect(screen.getByText('Example Domain').closest('a')).toHaveAttribute(
      'href',
      '/domains/1/edit'
    );
  });

  test('hosts count links to host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getByText('5').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('search=')
    );
  });

  test('renders row actions with delete', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
