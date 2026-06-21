import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportTemplatesIndex from '../index';

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
      { id: 1, name: 'Host - Installed Products', snippet: false, locked: true },
      { id: 2, name: 'Applicable Errata', snippet: false, locked: false },
      { id: 3, name: 'Report helper', snippet: true, locked: false },
    ],
    total: 3,
    subtotal: 3,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/report_templates',
  controller: 'report_templates',
  createUrl: '/templates/report_templates/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <ReportTemplatesIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('ReportTemplatesIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with report template data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Host - Installed Products')).toBeInTheDocument();
    });

    expect(screen.getByText('Applicable Errata')).toBeInTheDocument();
    expect(screen.getByText('Report helper')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Snippet')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  test('name links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Host - Installed Products')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Host - Installed Products').closest('a')
    ).toHaveAttribute('href', '/templates/report_templates/1');
  });

  test('renders row actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Host - Installed Products')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(3);
  });
});
