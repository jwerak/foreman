import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProvisioningTemplatesIndex from '../index';

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
      { id: 1, name: 'Kickstart default', template_kind_name: 'provision', combination: 'Base, Web Servers', snippet: false, locked: true },
      { id: 2, name: 'PXELinux global default', template_kind_name: 'PXELinux', combination: '', snippet: false, locked: false },
      { id: 3, name: 'Disk layout helper', template_kind_name: null, combination: '', snippet: true, locked: false },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/provisioning_templates',
  controller: 'provisioning_templates',
  createUrl: '/templates/provisioning_templates/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <ProvisioningTemplatesIndex {...defaultProps} {...props} />
    </Provider>
  );

describe('ProvisioningTemplatesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with provisioning template data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(screen.getByText('PXELinux global default')).toBeInTheDocument();
    expect(screen.getByText('Disk layout helper')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Host Group / Environment')).toBeInTheDocument();
    expect(screen.getByText('Kind')).toBeInTheDocument();
    expect(screen.getByText('Snippet')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  test('name links to edit page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Kickstart default').closest('a')
    ).toHaveAttribute('href', '/templates/provisioning_templates/1/edit');
  });

  test('kind links to filtered search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('provision')).toBeInTheDocument();
    });

    expect(screen.getByText('provision').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('search=')
    );
  });

  test('displays combination column', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Base, Web Servers')).toBeInTheDocument();
    });
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(3);
  });

  test('renders action buttons toolbar with dropdown', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Kickstart default')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('toggle action dropdown')
    ).toBeInTheDocument();
  });
});
