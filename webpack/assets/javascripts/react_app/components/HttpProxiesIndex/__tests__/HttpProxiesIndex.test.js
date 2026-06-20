import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HttpProxiesIndex from '../index';

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
      { id: 1, name: 'Corporate Proxy', url: 'http://proxy.corp.example.com:8080' },
      { id: 2, name: 'Dev Proxy', url: 'http://proxy.dev.example.com:3128' },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/http_proxies',
  controller: 'http_proxies',
  createUrl: '/http_proxies/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <HttpProxiesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('HttpProxiesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with HTTP proxy data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Corporate Proxy')).toBeInTheDocument();
    });

    expect(screen.getByText('Dev Proxy')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Corporate Proxy')).toBeInTheDocument();
    });

    expect(screen.getByText('Corporate Proxy').closest('a')).toHaveAttribute(
      'href',
      '/http_proxies/1/edit'
    );
  });

  test('displays proxy URL', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('http://proxy.corp.example.com:8080')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('http://proxy.dev.example.com:3128')
    ).toBeInTheDocument();
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Corporate Proxy')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
