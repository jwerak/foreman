import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(() => ({})),
}));

jest.mock('../../common/Slot/Slot', () => {
  const MockSlot = () => <div data-testid="slot" />;
  return { __esModule: true, default: MockSlot };
});

jest.mock('../../common/dates/RelativeDateTime', () => {
  const MockRelativeDateTime = ({ date }) => <span>{date}</span>;
  return { __esModule: true, default: MockRelativeDateTime };
});

import Dashboard from '../index';

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
  overview: {
    data: [['Active', 2, '#4572A7'], ['OK', 5, '#89A54E']],
    searchUrl: '/hosts?search=~VAL~',
    searchFilters: {},
  },
  runDistribution: [['30', 5], ['20', 3]],
  latestEvents: [],
  newHosts: [],
  hostsInBuildMode: [],
  reportOrigins: ['All', 'Puppet'],
  searchUrl: '/hosts?search=~VAL~',
};

describe('Dashboard', () => {
  it('renders all card sections', () => {
    render(<Dashboard {...defaultProps} />);

    expect(screen.getByText('Host Configuration Status')).toBeInTheDocument();
    expect(screen.getByText('Host Configuration Chart')).toBeInTheDocument();
    expect(screen.getByText('Run Distribution Chart')).toBeInTheDocument();
    expect(screen.getByText('Latest Events')).toBeInTheDocument();
    expect(screen.getByText('New Hosts')).toBeInTheDocument();
  });

  it('does not render BuildModeCard when no hosts in build mode', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.queryByText('Hosts in Build Mode')).not.toBeInTheDocument();
  });

  it('renders BuildModeCard when hosts are in build mode', () => {
    const props = {
      ...defaultProps,
      hostsInBuildMode: [
        { id: 1, name: 'host1.example.com', hostUrl: '/hosts/1', buildStatus: 'in_progress' },
      ],
    };
    render(<Dashboard {...props} />);
    expect(screen.getByText('Hosts in Build Mode')).toBeInTheDocument();
  });

  it('renders the Slot for plugin extension', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByTestId('slot')).toBeInTheDocument();
  });
});
