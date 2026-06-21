import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComputeResourcesIndex from '../index';

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
      { id: 1, name: 'VMware Production', provider: 'Vmware', provider_friendly_name: 'VMware' },
      { id: 2, name: 'Libvirt Dev', provider: 'Libvirt', provider_friendly_name: 'Libvirt' },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/compute_resources',
  controller: 'compute_resources',
  createUrl: '/compute_resources/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <ComputeResourcesIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('ComputeResourcesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with compute resource data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('VMware Production')).toBeInTheDocument();
    });

    expect(screen.getByText('Libvirt Dev')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  test('name links to show page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('VMware Production')).toBeInTheDocument();
    });

    expect(screen.getByText('VMware Production').closest('a')).toHaveAttribute(
      'href',
      '/compute_resources/1'
    );
  });

  test('displays provider friendly name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('VMware')).toBeInTheDocument();
    });

    expect(screen.getByText('Libvirt')).toBeInTheDocument();
  });

  test('renders row actions with edit and delete', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('VMware Production')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
