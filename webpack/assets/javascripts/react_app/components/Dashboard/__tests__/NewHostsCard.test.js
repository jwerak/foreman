import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../common/dates/RelativeDateTime', () => {
  const MockRelativeDateTime = ({ date }) => <span>{date}</span>;
  return { __esModule: true, default: MockRelativeDateTime };
});

import NewHostsCard from '../NewHostsCard';

const mockHosts = [
  {
    id: 1,
    name: 'web01.example.com',
    hostUrl: '/new/hosts/web01.example.com',
    operatingSystem: 'CentOS 8',
    owner: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
    installedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 2,
    name: 'db01.example.com',
    hostUrl: '/new/hosts/db01.example.com',
    operatingSystem: null,
    owner: null,
    createdAt: '2024-01-14T08:00:00Z',
    installedAt: null,
  },
];

describe('NewHostsCard', () => {
  it('renders the card title', () => {
    render(<NewHostsCard hosts={[]} />);
    expect(screen.getByText('New Hosts')).toBeInTheDocument();
  });

  it('renders empty state when no hosts', () => {
    render(<NewHostsCard hosts={[]} />);
    expect(screen.getByText('No hosts available.')).toBeInTheDocument();
  });

  it('renders host rows', () => {
    render(<NewHostsCard hosts={mockHosts} />);
    expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    expect(screen.getByText('db01.example.com')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<NewHostsCard hosts={mockHosts} />);
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Operating System')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Installed')).toBeInTheDocument();
  });

  it('renders OS and owner info', () => {
    render(<NewHostsCard hosts={mockHosts} />);
    expect(screen.getByText('CentOS 8')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('renders host links', () => {
    render(<NewHostsCard hosts={mockHosts} />);
    const link = screen.getByText('web01.example.com');
    expect(link.closest('a')).toHaveAttribute('href', '/new/hosts/web01.example.com');
  });
});
