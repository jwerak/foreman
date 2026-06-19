import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ConfigReports from './ConfigReports';

const mockData = {
  metricsChartData: [['runtime', 5]],
  statusChartData: [['applied', 2]],
  metricsData: { tableData: [['config_retrieval', 10]], total: 10 },
};

describe('ComponentWrapper', () => {
  it('should render config reports', () => {
    const { container } = render(<ConfigReports data={mockData} />);

    expect(screen.getByText('Report Metrics')).toBeInTheDocument();
    expect(screen.getByText('Report Status')).toBeInTheDocument();
    expect(screen.getByText('config_retrieval')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(container.querySelector('table')).toBeInTheDocument();
  });
});
