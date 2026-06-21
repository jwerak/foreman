import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaIndex from '../index';

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
        id: 1,
        name: 'CentOS mirror',
        path: 'http://mirror.centos.org/centos/$version/os/$arch',
        os_family: 'Redhat',
        operatingsystem_names: 'CentOS 8',
      },
      {
        id: 2,
        name: 'Ubuntu archive',
        path: 'http://archive.ubuntu.com/ubuntu',
        os_family: 'Debian',
        operatingsystem_names: 'Ubuntu 20.04, Ubuntu 22.04',
      },
    ],
    total: 2,
    subtotal: 2,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

const defaultProps = {
  apiUrl: '/api/v2/media',
  controller: 'media',
  createUrl: '/media/new',
  searchable: true,
  creatable: true,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <MediaIndex {...defaultProps} {...props} />
      </Provider>
    </MemoryRouter>
  );

describe('MediaIndex', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockApiResponse);
    API.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with media data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS mirror')).toBeInTheDocument();
    });

    expect(screen.getByText('Ubuntu archive')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
    expect(screen.getByText('OS Family')).toBeInTheDocument();
    expect(screen.getByText('Operating Systems')).toBeInTheDocument();
  });

  test('name links to detail page', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS mirror')).toBeInTheDocument();
    });

    expect(screen.getByText('CentOS mirror').closest('a')).toHaveAttribute(
      'href',
      '/media/1'
    );
  });

  test('displays path and OS family', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('http://mirror.centos.org/centos/$version/os/$arch')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Redhat')).toBeInTheDocument();
    expect(screen.getByText('Debian')).toBeInTheDocument();
  });

  test('displays operating system names', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS 8')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Ubuntu 20.04, Ubuntu 22.04')
    ).toBeInTheDocument();
  });

  test('renders row actions with clone and delete', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CentOS mirror')).toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Kebab toggle')).toHaveLength(2);
  });
});
