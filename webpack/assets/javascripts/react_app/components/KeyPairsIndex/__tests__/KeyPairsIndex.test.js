import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KeyPairsIndex from '../index';

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
        name: 'foreman-123abc',
        fingerprint: 'aa:bb:cc:dd',
        active: true,
        key_pair_id: 5,
        used_elsewhere: false,
      },
      {
        name: 'old-key-456',
        fingerprint: 'ee:ff:00:11',
        active: false,
        key_pair_id: null,
        used_elsewhere: false,
      },
      {
        name: 'shared-key-789',
        fingerprint: '22:33:44:55',
        active: false,
        key_pair_id: null,
        used_elsewhere: true,
      },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 3,
    can_create: false,
  },
};

const defaultProps = {
  apiUrl: '/compute_resources/1/key_pairs.json',
  controller: 'key_pairs',
  computeResourceId: 1,
  computeResourceName: 'My EC2',
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <KeyPairsIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('KeyPairsIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with key pair data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('foreman-123abc')).toBeInTheDocument();
    });

    expect(screen.getByText('old-key-456')).toBeInTheDocument();
    expect(screen.getByText('shared-key-789')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Fingerprint')).toBeInTheDocument();
  });

  test('renders title with compute resource name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('foreman-123abc')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('SSH keys for: My EC2')).toBeInTheDocument();
  });

  test('renders fingerprints', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('aa:bb:cc:dd')).toBeInTheDocument();
    });

    expect(screen.getByText('ee:ff:00:11')).toBeInTheDocument();
    expect(screen.getByText('22:33:44:55')).toBeInTheDocument();
  });

  test('active key has row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('foreman-123abc')).toBeInTheDocument();
    });

    const kebabs = screen.getAllByLabelText('Kebab toggle');
    expect(kebabs.length).toBeGreaterThanOrEqual(1);
  });
});
