import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OperatingsystemsIndex from '../index';

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
      { id: 1, name: 'CentOS', title: 'CentOS 8', hosts_count: 15 },
      { id: 2, name: 'Ubuntu', title: 'Ubuntu 22.04', hosts_count: 8 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/operatingsystems',
  controller: 'operatingsystems',
  createUrl: '/operatingsystems/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <OperatingsystemsIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('OperatingsystemsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with operating system data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS 8')).toBeInTheDocument();
    });

    expect(screen.getByText('Ubuntu 22.04')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('title links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS 8')).toBeInTheDocument();
    });

    expect(screen.getByText('CentOS 8').closest('a')).toHaveAttribute(
      'href',
      '/operatingsystems/1'
    );
  });

  test('hosts count links to host search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    expect(screen.getByText('15').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('search=')
    );
  });

  test('renders row actions with clone and delete', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS 8')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
