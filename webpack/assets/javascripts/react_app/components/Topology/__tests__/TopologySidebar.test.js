import '@testing-library/jest-dom';

jest.mock('../../../common/I18n', () => ({
  translate: str => str,
}));

jest.mock('@patternfly/react-core', () => ({
  Title: ({ children }) => <h2>{children}</h2>,
  DescriptionList: ({ children }) => <dl>{children}</dl>,
  DescriptionListGroup: ({ children }) => <div>{children}</div>,
  DescriptionListTerm: ({ children }) => <dt>{children}</dt>,
  DescriptionListDescription: ({ children }) => <dd>{children}</dd>,
  Label: ({ children, color }) => <span data-color={color}>{children}</span>,
  Button: ({ children, ...props }) => <a {...props}>{children}</a>,
  Divider: () => <hr />,
}));

jest.mock('../SidebarHostTable', () => {
  const MockTable = () => <div data-testid="host-table" />;
  return MockTable;
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarContent from '../SidebarContent';

describe('SidebarContent', () => {
  it('returns null when no node provided', () => {
    const { container } = render(<SidebarContent node={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders compute resource content', () => {
    const node = {
      id: 'cr-1',
      type: 'compute-resource',
      label: 'VMware DC1',
      data: {
        provider: 'Vmware',
        hosts_count: 42,
        error_count: 2,
        url: '/compute_resources/1',
      },
    };
    render(<SidebarContent node={node} />);
    expect(screen.getByText('VMware DC1')).toBeInTheDocument();
    expect(screen.getByText('Vmware')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByTestId('host-table')).toBeInTheDocument();
  });

  it('renders hostgroup content', () => {
    const node = {
      id: 'hg-1',
      type: 'hostgroup',
      label: 'Production',
      data: {
        title: 'Production/Web',
        hosts_count: 30,
        error_count: 0,
        url: '/hostgroups/1',
      },
    };
    render(<SidebarContent node={node} />);
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Production/Web')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders host content with status', () => {
    const node = {
      id: 'host-1',
      type: 'host',
      label: 'web01.example.com',
      data: {
        global_status: 0,
        url: '/new/hosts/web01.example.com',
      },
    };
    render(<SidebarContent node={node} />);
    expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('View Host Details')).toBeInTheDocument();
  });

  it('renders error status label for host with errors', () => {
    const node = {
      id: 'host-2',
      type: 'host',
      label: 'db01.example.com',
      data: { global_status: 2 },
    };
    render(<SidebarContent node={node} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
