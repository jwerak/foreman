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
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import API from '../../../../redux/API/API';
// eslint-disable-next-line import/first
import ExternalUsergroupsTab from '../index';

const mockStore = configureMockStore();
const store = mockStore({});

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <ExternalUsergroupsTab usergroupId={1} {...props} />
    </Provider>
  );

describe('ExternalUsergroupsTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  it('shows empty state when no external groups exist', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(
          'No external user groups have been linked to this user group.'
        )
      ).toBeInTheDocument();
    });
  });

  it('renders external groups in a table', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            name: 'ldap-admins',
            auth_source: { id: 5, name: 'My LDAP' },
          },
        ],
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('ldap-admins')).toBeInTheDocument();
    });
    expect(screen.getByText('My LDAP')).toBeInTheDocument();
  });

  it('fetches external groups for the correct usergroup', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent({ usergroupId: 42 });
    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        '/api/v2/usergroups/42/external_usergroups'
      );
    });
  });

  it('shows refresh and delete buttons for each group', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            name: 'ldap-admins',
            auth_source: { id: 5, name: 'My LDAP' },
          },
        ],
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows add button', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText('Add External User Group')
      ).toBeInTheDocument();
    });
  });
});
