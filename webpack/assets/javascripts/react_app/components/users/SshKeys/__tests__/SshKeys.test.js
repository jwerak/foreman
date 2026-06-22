import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
import SshKeys from '../SshKeys';

const mockStore = configureMockStore();
const store = mockStore({});

const renderWithStore = ui =>
  render(<Provider store={store}>{ui}</Provider>);

const mockKeys = [
  {
    id: 1,
    name: 'my-key',
    fingerprint: 'SHA256:abc123',
    length: 4096,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'deploy-key',
    fingerprint: 'SHA256:def456',
    length: 2048,
    created_at: '2026-02-20T14:30:00Z',
  },
];

describe('SshKeys', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  test('renders empty state when no keys exist', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });

    renderWithStore(<SshKeys userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('SSH Keys')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/You can add SSH public keys/)
    ).toBeInTheDocument();
    expect(screen.getByText('Add SSH Key')).toBeInTheDocument();
  });

  test('renders SSH keys table with correct data', async () => {
    API.get.mockResolvedValueOnce({ data: { results: mockKeys } });

    renderWithStore(<SshKeys userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('my-key')).toBeInTheDocument();
    });

    expect(screen.getByText('deploy-key')).toBeInTheDocument();
    expect(screen.getByText('SHA256:abc123')).toBeInTheDocument();
    expect(screen.getByText('SHA256:def456')).toBeInTheDocument();
    expect(screen.getByText('4096')).toBeInTheDocument();
    expect(screen.getByText('2048')).toBeInTheDocument();

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  test('fetches keys from correct API endpoint', async () => {
    API.get.mockResolvedValueOnce({ data: { results: [] } });

    renderWithStore(<SshKeys userId={42} />);

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith('/api/v2/users/42/ssh_keys');
    });
  });

  test('has add SSH key button in table view', async () => {
    API.get.mockResolvedValueOnce({ data: { results: mockKeys } });

    renderWithStore(<SshKeys userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('my-key')).toBeInTheDocument();
    });

    expect(screen.getByText('Add SSH Key')).toBeInTheDocument();
  });

  test('delete button dispatches confirm modal action', async () => {
    API.get.mockResolvedValueOnce({ data: { results: mockKeys } });

    renderWithStore(<SshKeys userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('my-key')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    const actions = store.getActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toContain('confirmModal');
  });
});
