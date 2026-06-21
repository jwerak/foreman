import '@testing-library/jest-dom';

jest.mock('@patternfly/react-table', () => ({
  Table: ({ children, ...props }) => (
    <table aria-label={props['aria-label']}>{children}</table>
  ),
  Thead: ({ children }) => <thead>{children}</thead>,
  Tbody: ({ children }) => <tbody>{children}</tbody>,
  Tr: ({ children }) => <tr>{children}</tr>,
  Th: ({ children }) => <th>{children}</th>,
  Td: ({ children }) => <td>{children}</td>,
}));

jest.mock('@patternfly/react-core', () => ({
  Pagination: () => <div data-testid="pagination" />,
  SearchInput: ({ placeholder, value, onChange, onClear }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e, e.target.value)}
    />
  ),
  Spinner: props => <div role="status" aria-label={props['aria-label']} />,
  Label: ({ children, color }) => <span data-color={color}>{children}</span>,
  Button: ({ children, href }) => <a href={href}>{children}</a>,
}));

jest.mock('../../../../foreman_tools', () => ({
  foremanUrl: path => path,
}));

jest.mock('../../../common/I18n', () => ({
  translate: str => str,
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SidebarHostTable from '../SidebarHostTable';

const mockHostsResponse = {
  results: [
    { id: 1, name: 'web01.example.com', global_status: 0 },
    { id: 2, name: 'web02.example.com', global_status: 2 },
  ],
  total: 2,
};

describe('SidebarHostTable', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null for host node type', () => {
    const { container } = render(
      <SidebarHostTable nodeType="host" nodeId="1" />
    );
    expect(container.querySelector('input')).toBeNull();
  });

  it('renders hosts table after loading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHostsResponse),
    });

    render(<SidebarHostTable nodeType="compute-resource" nodeId="1" />);

    await waitFor(() => {
      expect(screen.getByText('web01.example.com')).toBeInTheDocument();
      expect(screen.getByText('web02.example.com')).toBeInTheDocument();
    });
  });

  it('shows empty state when no hosts found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [], total: 0 }),
    });

    render(<SidebarHostTable nodeType="hostgroup" nodeId="1" />);

    await waitFor(() => {
      expect(screen.getByText('No hosts found.')).toBeInTheDocument();
    });
  });

  it('renders search input', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(<SidebarHostTable nodeType="compute-resource" nodeId="1" />);
    expect(
      screen.getByPlaceholderText('Filter hosts by name...')
    ).toBeInTheDocument();
  });
});
