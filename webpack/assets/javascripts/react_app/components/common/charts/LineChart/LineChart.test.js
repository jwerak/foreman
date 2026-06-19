import { testComponentSnapshotsWithFixtures } from 'foremanReact/common/testHelpers';
import { data, timeseriesData } from './LineChart.fixtures';
import LineChart from './index';

const fixtures = {
  'should render line chart': {
    data,
    id: 'abc',
  },
  'should render line chart with timeseries': {
    data: timeseriesData,
    xAxisDataLabel: 'x',
    config: 'timeseries',
    id: 'xyz',
  },
  'should render empty state when no data': {
    data: undefined,
    id: 'empty',
  },
};

describe('Line Chart', () =>
  testComponentSnapshotsWithFixtures(LineChart, fixtures));
