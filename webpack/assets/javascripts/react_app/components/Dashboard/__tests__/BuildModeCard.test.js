import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../common/dates/RelativeDateTime', () => {
  const MockRelativeDateTime = ({ date }) => <span>{date}</span>;
  return { __esModule: true, default: MockRelativeDateTime };
});

import BuildModeCard from '../BuildModeCard';

const mockHosts = [
  {
    id: 1,
    name: 'build01.example.com',
    hostUrl: '/new/hosts/build01.example.com',
    owner: 'admin',
    buildDuration: 'about 1 hour',
    tokenExpiry: '2024-01-20T10:00:00Z',
    buildStatus: 'in_progress',
  },
  {
    id: 2,
    name: 'build02.example.com',
    hostUrl: '/new/hosts/build02.example.com',
    owner: 'deployer',
    buildDuration: 'N/A',
    tokenExpiry: null,
    buildStatus: 'build_error',
  },
  {
    id: 3,
    name: 'build03.example.com',
    hostUrl: '/new/hosts/build03.example.com',
    owner: null,
    buildDuration: 'N/A',
    tokenExpiry: '2024-01-10T10:00:00Z',
    buildStatus: 'token_expired',
  },
];

describe('BuildModeCard', () => {
  it('renders the card title', () => {
    render(<BuildModeCard hosts={mockHosts} />);
    expect(screen.getByText('Hosts in Build Mode')).toBeInTheDocument();
  });

  it('renders host rows', () => {
    render(<BuildModeCard hosts={mockHosts} />);
    expect(screen.getByText('build01.example.com')).toBeInTheDocument();
    expect(screen.getByText('build02.example.com')).toBeInTheDocument();
    expect(screen.getByText('build03.example.com')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<BuildModeCard hosts={mockHosts} />);
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Build Duration')).toBeInTheDocument();
    expect(screen.getByText('Token Expiry')).toBeInTheDocument();
  });

  it('renders build duration and owner', () => {
    render(<BuildModeCard hosts={mockHosts} />);
    expect(screen.getByText('about 1 hour')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('deployer')).toBeInTheDocument();
  });

  it('renders host links', () => {
    render(<BuildModeCard hosts={mockHosts} />);
    const link = screen.getByText('build01.example.com');
    expect(link.closest('a')).toHaveAttribute('href', '/new/hosts/build01.example.com');
  });
});
