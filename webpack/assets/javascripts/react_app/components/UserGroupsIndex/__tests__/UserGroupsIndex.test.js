import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserGroupsIndex from '../index';

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
      { id: 1, name: 'Admins', user_names: 'admin, john', usergroup_names: '' },
      { id: 2, name: 'Developers', user_names: 'dev1, dev2', usergroup_names: 'Ops' },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/usergroups',
  controller: 'usergroups',
  createUrl: '/usergroups/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <UserGroupsIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('UserGroupsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with usergroup data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Admins')).toBeInTheDocument();
    });

    expect(screen.getByText('Developers')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('User Groups')).toBeInTheDocument();
  });

  test('name links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Admins')).toBeInTheDocument();
    });

    expect(screen.getByText('Admins').closest('a')).toHaveAttribute(
      'href',
      '/usergroups/1'
    );
  });

  test('displays user and usergroup names', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('admin, john')).toBeInTheDocument();
    });

    expect(screen.getByText('dev1, dev2')).toBeInTheDocument();
  });
});
