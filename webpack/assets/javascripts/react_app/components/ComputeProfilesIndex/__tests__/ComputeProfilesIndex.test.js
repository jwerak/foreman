import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComputeProfilesIndex from '../index';

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
      { id: 1, name: '1-Small' },
      { id: 2, name: '2-Medium' },
      { id: 3, name: '3-Large' },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/compute_profiles',
  controller: 'compute_profiles',
  createUrl: '/compute_profiles/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <ComputeProfilesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('ComputeProfilesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with compute profile data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1-Small')).toBeInTheDocument();
    });

    expect(screen.getByText('2-Medium')).toBeInTheDocument();
    expect(screen.getByText('3-Large')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('name links to show page (not edit)', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1-Small')).toBeInTheDocument();
    });

    expect(screen.getByText('1-Small').closest('a')).toHaveAttribute(
      'href',
      '/compute_profiles/1'
    );
  });

  test('renders row actions with rename and delete', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1-Small')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(3);
  });
});
