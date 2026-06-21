import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostgroupsIndex from '../index';

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
        name: 'Base',
        title: 'Base',
        description: 'Base group',
        hosts_count: 10,
        children_hosts_count: 25,
      },
      {
        id: 2,
        name: 'Web',
        title: 'Base/Web',
        description: 'Web servers',
        hosts_count: 5,
        children_hosts_count: 5,
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
  apiUrl: '/api/v2/hostgroups',
  controller: 'hostgroups',
  createUrl: '/hostgroups/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <HostgroupsIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('HostgroupsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with hostgroup data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Base')).toBeInTheDocument();
    });

    expect(screen.getByText('Base/Web')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('Hosts including Sub-groups')).toBeInTheDocument();
  });

  test('title links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Base')).toBeInTheDocument();
    });

    expect(screen.getByText('Base').closest('a')).toHaveAttribute(
      'href',
      '/hostgroups/1'
    );
  });

  test('shows ancestry path in title column', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Base/Web')).toBeInTheDocument();
    });

    expect(screen.getByText('Base/Web').closest('a')).toHaveAttribute(
      'href',
      '/hostgroups/2'
    );
  });

  test('hosts count links to host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    expect(screen.getByText('10').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('hostgroup_fullname')
    );
  });

  test('children hosts count links to parent host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    expect(screen.getByText('25').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('parent_hostgroup')
    );
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Base')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
