import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import API from '../../../../redux/API/API';
// eslint-disable-next-line import/first
import RoleFiltersTab from '../index';

const mockStore = configureMockStore();
const store = mockStore({});

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <RoleFiltersTab roleId={1} {...props} />
    </Provider>
  );

describe('RoleFiltersTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  it('shows empty state when no filters exist', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText('No filters have been defined for this role.')
      ).toBeInTheDocument();
    });
  });

  it('renders filters in a table', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 10,
            resource_type: 'Host',
            resource_type_label: 'Host',
            permissions: [{ name: 'view_hosts' }, { name: 'edit_hosts' }],
            search: 'name ~ foo',
            unlimited: false,
            override: true,
          },
        ],
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Host')).toBeInTheDocument();
    });
    expect(screen.getByText('view_hosts, edit_hosts')).toBeInTheDocument();
    expect(screen.getByText('name ~ foo')).toBeInTheDocument();
  });

  it('fetches filters for the correct role', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent({ roleId: 42 });
    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        '/api/v2/filters?search=role_id%3D42&per_page=all'
      );
    });
  });

  it('shows "New Filter" button linking to filter creation', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent({ roleId: 5 });
    await waitFor(() => {
      const link = screen.getByText('New Filter').closest('a');
      expect(link).toHaveAttribute('href', '/filters/new?role_id=5');
    });
  });

  it('shows delete button for each filter', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 10,
            resource_type: 'Host',
            permissions: [],
            unlimited: true,
            override: false,
          },
        ],
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });
});
