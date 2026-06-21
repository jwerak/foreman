import '@testing-library/jest-dom';

jest.mock('@patternfly/react-core', () => ({
  PageSection: ({ children, ...props }) => <div {...props}>{children}</div>,
  Spinner: props => <div role="status" aria-label={props['aria-label']} />,
  Alert: ({ title, children }) => (
    <div role="alert">
      <span>{title}</span>
      {children}
    </div>
  ),
}));

jest.mock('../../../../foreman_tools', () => ({
  foremanUrl: path => path,
}));

jest.mock('../../../common/I18n', () => ({
  translate: str => str,
}));

jest.mock('../TopologyVisualization', () => {
  const MockViz = ({ toolbar, sidebar }) => (
    <div data-testid="topology-viz">
      {toolbar}
      {sidebar}
    </div>
  );
  return MockViz;
});

jest.mock('../TopologyToolbar', () => {
  const MockToolbar = () => <div data-testid="topology-toolbar" />;
  return MockToolbar;
});

jest.mock('../TopologySidebar', () => {
  const MockSidebar = () => null;
  return MockSidebar;
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TopologyPage from '../index';

const mockApiResponse = {
  nodes: [
    {
      id: 'cr-1',
      type: 'compute-resource',
      label: 'Test CR',
      data: { provider: 'Libvirt', hosts_count: 5, error_count: 0 },
    },
  ],
  edges: [],
  meta: { total_compute_resources: 1, total_hosts: 5 },
};

describe('TopologyPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows spinner while loading', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(<TopologyPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders topology visualization after data loads', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<TopologyPage />);

    await waitFor(() => {
      expect(screen.getByTestId('topology-viz')).toBeInTheDocument();
    });
  });

  it('shows error alert on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<TopologyPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
