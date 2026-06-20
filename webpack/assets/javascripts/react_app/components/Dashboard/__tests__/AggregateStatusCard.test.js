import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AggregateStatusCard from '../AggregateStatusCard';

const defaultProps = {
  status: {
    total_hosts: 10,
    active_hosts_ok_enabled: 2,
    bad_hosts_enabled: 1,
    ok_hosts_enabled: 5,
    pending_hosts_enabled: 1,
    out_of_sync_hosts_enabled: 0,
    reports_missing: 1,
    disabled_hosts: 0,
  },
  searchUrl: '/hosts?search=~VAL~',
  overview: {
    searchFilters: {
      Active: 'status.applied > 0',
      Error: 'status.failed > 0',
    },
  },
  reportOrigins: ['All', 'Puppet'],
  selectedOrigin: 'All',
  onOriginChange: jest.fn(),
  loading: false,
};

describe('AggregateStatusCard', () => {
  it('renders host counts', () => {
    render(<AggregateStatusCard {...defaultProps} />);

    expect(screen.getByText('Host Configuration Status')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total Hosts')).toBeInTheDocument();
  });

  it('renders all status labels', () => {
    render(<AggregateStatusCard {...defaultProps} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Out of sync')).toBeInTheDocument();
    expect(screen.getByText('No report')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders origin dropdown when multiple origins exist', () => {
    render(<AggregateStatusCard {...defaultProps} />);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('does not render origin dropdown with single origin', () => {
    const props = { ...defaultProps, reportOrigins: ['All'] };
    const { container } = render(<AggregateStatusCard {...props} />);
    expect(container.querySelector('[class*="pf-v6-c-menu-toggle"]')).not.toBeInTheDocument();
  });

  it('renders status links', () => {
    render(<AggregateStatusCard {...defaultProps} />);

    const links = screen.getAllByRole('link');
    const activeLink = links.find(l => l.href.includes('status.applied'));
    expect(activeLink).toBeDefined();
  });
});
