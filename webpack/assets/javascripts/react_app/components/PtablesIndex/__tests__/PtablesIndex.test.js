import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PtablesIndex from '../index';

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
      { id: 1, name: 'Kickstart default', os_family: 'Redhat', operatingsystem_names: 'CentOS 8, RHEL 9', snippet: false, locked: true },
      { id: 2, name: 'Ubuntu preseed', os_family: 'Debian', operatingsystem_names: 'Ubuntu 22.04', snippet: false, locked: false },
      { id: 3, name: 'Disk helper', os_family: null, operatingsystem_names: '', snippet: true, locked: false },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/ptables',
  controller: 'ptables',
  createUrl: '/ptables/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <PtablesIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('PtablesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with partition table data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(screen.getByText('Ubuntu preseed')).toBeInTheDocument();
    expect(screen.getByText('Disk helper')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('OS Family')).toBeInTheDocument();
    expect(screen.getByText('Operating Systems')).toBeInTheDocument();
    expect(screen.getByText('Snippet')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  test('name links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Kickstart default').closest('a')
    ).toHaveAttribute('href', '/ptables/1');
  });

  test('displays OS family and operating system names', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Redhat')).toBeInTheDocument();
    });

    expect(screen.getByText('Debian')).toBeInTheDocument();
    expect(screen.getByText('CentOS 8, RHEL 9')).toBeInTheDocument();
    expect(screen.getByText('Ubuntu 22.04')).toBeInTheDocument();
  });

  test('renders snippet and locked icons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    const rows = document.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(3);
  });
});
