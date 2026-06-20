import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LatestEventsCard from '../LatestEventsCard';

const mockEvents = [
  {
    id: 1,
    hostName: 'web01.example.com',
    reportsUrl: '/hosts/web01/config_reports',
    applied: 3,
    restarted: 1,
    failed: 0,
    failedRestarts: 0,
    skipped: 2,
    pending: 0,
  },
  {
    id: 2,
    hostName: 'db01.example.com',
    reportsUrl: '/hosts/db01/config_reports',
    applied: 0,
    restarted: 0,
    failed: 2,
    failedRestarts: 1,
    skipped: 0,
    pending: 0,
  },
];

describe('LatestEventsCard', () => {
  it('renders the card title', () => {
    render(<LatestEventsCard events={[]} />);
    expect(screen.getByText('Latest Events')).toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    render(<LatestEventsCard events={[]} />);
    expect(screen.getByText('No interesting reports received in the last week')).toBeInTheDocument();
  });

  it('renders event rows', () => {
    render(<LatestEventsCard events={mockEvents} />);

    expect(screen.getByText('web01.example.com')).toBeInTheDocument();
    expect(screen.getByText('db01.example.com')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<LatestEventsCard events={mockEvents} />);

    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders non-zero counts as labels', () => {
    render(<LatestEventsCard events={mockEvents} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });
});
