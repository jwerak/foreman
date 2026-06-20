import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersIndex from '../index';

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
      { id: 1, login: 'admin', firstname: 'Bob', lastname: 'Smith', mail: 'admin@example.com', admin: true, last_login_on: '2026-06-20T10:00:00Z', auth_source_name: 'Internal' },
      { id: 2, login: 'jdoe', firstname: 'John', lastname: 'Doe', mail: 'jdoe@example.com', admin: false, last_login_on: null, auth_source_name: 'LDAP' },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/users',
  controller: 'users',
  createUrl: '/users/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <UsersIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('UsersIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with user data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Firstname')).toBeInTheDocument();
    expect(screen.getByText('Lastname')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('login links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.getByText('admin').closest('a')).toHaveAttribute(
      'href',
      '/users/1/edit'
    );
  });

  test('displays auth source name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Internal')).toBeInTheDocument();
    });

    expect(screen.getByText('LDAP')).toBeInTheDocument();
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
