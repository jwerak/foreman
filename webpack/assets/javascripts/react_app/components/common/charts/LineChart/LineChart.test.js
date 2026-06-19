import React from 'react';
import { render } from '@testing-library/react';
import { rtlHelpers } from 'foremanReact/common/testHelpers';
import { data, timeseriesData } from './LineChart.fixtures';
import LineChart from './index';

describe('Line Chart', () => {
  it('should render line chart', () => {
    const { container } = render(<LineChart data={data} id="abc" />);
    expect(container).toMatchSnapshot();
  });

  it('should render line chart with timeseries', () => {
    const { container } = render(
      <LineChart
        data={timeseriesData}
        xAxisDataLabel="x"
        config="timeseries"
        id="xyz"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render empty state when no data', () => {
    const { container } = rtlHelpers.renderWithStore(
      <LineChart data={undefined} id="empty" />
    );
    expect(container).toMatchSnapshot();
  });
});
