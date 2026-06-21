import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookmarksIndex from '../index';

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
      { id: 1, name: 'Active hosts', query: 'last_report > "35 minutes ago"', controller: 'hosts', public: true },
      { id: 2, name: 'My domains', query: 'name ~ example', controller: 'domains', public: false },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/bookmarks',
  controller: 'bookmarks',
  createUrl: '/bookmarks/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <BookmarksIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('BookmarksIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with bookmark data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Active hosts')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Query')).toBeInTheDocument();
    expect(screen.getByText('Controller')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  test('name links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Active hosts')).toBeInTheDocument();
    });

    expect(screen.getByText('Active hosts').closest('a')).toHaveAttribute(
      'href',
      '/bookmarks/1'
    );
  });

  test('displays query and controller columns', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('last_report > "35 minutes ago"')).toBeInTheDocument();
    });

    expect(screen.getByText('hosts')).toBeInTheDocument();
    expect(screen.getByText('domains')).toBeInTheDocument();
  });
});
