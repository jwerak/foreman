import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxonomiesIndex from '../index';

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
      { id: 1, name: 'Default Location', title: 'Default Location', hosts_count: 5 },
      { id: 2, name: 'Berlin', title: 'Berlin', hosts_count: 3 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/locations',
  title: 'Locations',
  controller: 'locations',
  createUrl: '/locations/new',
  searchable: true,
  creatable: true,
  taxonomyResource: 'locations',
  taxonomySingle: 'location',
  mismatchesUrl: '/locations/mismatches',
  countNilHosts: 0,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <TaxonomiesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('TaxonomiesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with taxonomy data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Location')).toBeInTheDocument();
    });

    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Location')).toBeInTheDocument();
    });

    expect(screen.getByText('Default Location').closest('a')).toHaveAttribute(
      'href',
      '/locations/1/edit'
    );
  });

  test('shows warning banner when countNilHosts > 0', async () => {
    renderComponent({ countNilHosts: 10 });

    await waitFor(() => {
      expect(screen.getByText('Default Location')).toBeInTheDocument();
    });

    expect(screen.getByText(/10 hosts with no location assigned/)).toBeInTheDocument();
  });

  test('does not show warning when countNilHosts is 0', async () => {
    renderComponent({ countNilHosts: 0 });

    await waitFor(() => {
      expect(screen.getByText('Default Location')).toBeInTheDocument();
    });

    expect(screen.queryByText(/hosts with no/)).not.toBeInTheDocument();
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Default Location')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
