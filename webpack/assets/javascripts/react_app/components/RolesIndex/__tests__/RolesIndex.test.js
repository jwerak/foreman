import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesIndex from '../index';

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
      { id: 1, name: 'Manager', description: 'Can manage hosts', locked: false, builtin: 0 },
      { id: 2, name: 'Viewer', description: 'Read-only access', locked: true, builtin: 0 },
      { id: 3, name: 'Default role', description: '', locked: false, builtin: 2 },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/roles',
  controller: 'roles',
  createUrl: '/roles/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <RolesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('RolesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with role data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  test('name links to filters page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    expect(screen.getByText('Manager').closest('a')).toHaveAttribute(
      'href',
      '/roles/1/filters'
    );
  });

  test('shows lock icon for locked roles', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    expect(screen.getByTitle('This role is locked for editing.')).toBeInTheDocument();
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(3);
  });
});
