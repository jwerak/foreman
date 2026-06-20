import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexPage from '../index';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('../../../SearchBar', () => {
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
import API from '../../../../redux/API/API';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

const mockApiResponse = {
  data: {
    results: [
      { id: 1, name: 'example.com', hosts_count: 5 },
      { id: 2, name: 'test.org', hosts_count: 3 },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const columns = [
  { key: 'name', title: 'Name', sortKey: 'name' },
  { key: 'hosts_count', title: 'Hosts' },
];

const defaultProps = {
  apiUrl: '/api/v2/domains',
  title: 'Domains',
  columns,
  controller: 'domains',
  creatable: true,
  createUrl: '/domains/new',
  searchable: true,
};

const renderWithStore = ui =>
  render(<Provider store={store}>{ui}</Provider>);

describe('IndexPage', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with data after loading', async () => {
    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('test.org')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  test('renders create button when canCreate is true', async () => {
    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    const createBtn = screen.getByText('Create new');
    expect(createBtn.closest('a')).toHaveAttribute('href', '/domains/new');
  });

  test('shows loading state initially', () => {
    API.get.mockReturnValue(new Promise(() => {}));
    renderWithStore(<IndexPage {...defaultProps} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows error state', async () => {
    API.get.mockRejectedValue({
      response: { data: { error: { message: 'Access denied' } } },
    });

    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });
  });

  test('shows empty state when no results', async () => {
    API.get.mockResolvedValue({
      data: {
        results: [],
        total: 0,
        subtotal: 0,
        page: 1,
        per_page: 20,
        can_create: true,
      },
    });

    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No Results')).toBeInTheDocument();
    });
  });

  test('renders row actions when rowActions prop is provided', async () => {
    const rowActions = () => [
      { title: 'Edit', onClick: jest.fn() },
      { title: 'Delete', onClick: jest.fn() },
    ];

    renderWithStore(<IndexPage {...defaultProps} rowActions={rowActions} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });

  test('renders export and documentation buttons', async () => {
    renderWithStore(
      <IndexPage
        {...defaultProps}
        exportable
        exportUrl="/domains.csv"
        hasHelpPage
        documentationUrl="https://docs.example.com"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('toggle action dropdown'));
    });

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  test('renders with custom column wrapper', async () => {
    const customColumns = [
      {
        key: 'name',
        title: 'Name',
        wrapper: row => <a href={`/domains/${row.id}`}>{row.name}</a>,
      },
    ];

    renderWithStore(<IndexPage {...defaultProps} columns={customColumns} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('example.com').closest('a')).toHaveAttribute(
      'href',
      '/domains/1'
    );
  });

  test('renders pagination when there are results', async () => {
    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Pagination').length).toBeGreaterThan(0);
  });

  test('does not render create button when canCreate is false', async () => {
    API.get.mockResolvedValue({
      data: {
        ...mockApiResponse.data,
        can_create: false,
      },
    });

    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.queryByText('Create new')).not.toBeInTheDocument();
  });

  test('renders search bar when searchable', async () => {
    renderWithStore(<IndexPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  test('does not render search bar when not searchable', async () => {
    renderWithStore(<IndexPage {...defaultProps} searchable={false} />);

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });
});
