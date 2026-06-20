import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(() => ({})),
}));

import StatusChartCard from '../StatusChartCard';

describe('StatusChartCard', () => {
  it('renders the card title', () => {
    render(<StatusChartCard overview={{}} />);
    expect(screen.getByText('Host Configuration Chart')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<StatusChartCard overview={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders the donut chart when data is provided', () => {
    const overview = {
      data: [['Active', 2, '#4572A7'], ['OK', 5, '#89A54E']],
      searchUrl: '/hosts?search=~VAL~',
      searchFilters: {},
    };
    const { container } = render(<StatusChartCard overview={overview} />);
    expect(container.querySelector('.donut-chart-pf')).toBeInTheDocument();
  });
});
