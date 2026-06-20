import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
	Chart,
	ChartAxis,
	ChartGroup,
	ChartLine,
	ChartVoronoiContainer,
	ChartLegend,
	ChartThemeColor
} from '@patternfly/react-charts/victory';
import { Icon } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../../../../react_app/common/I18n';
import EmptyState from '../../EmptyState';

const DEFAULT_COLOR_SCALE = [
  '#0088ce',
  '#ec7a08',
  '#3f9c35',
  '#005c66',
  '#f9d67a',
  '#703fec',
];

const CHART_DIMENSIONS = {
  regular: { width: 1000, height: 350 },
  timeseries: { width: 1000, height: 350 },
};

const CHART_PADDING = {
  regular: { top: 20, bottom: 60, left: 60, right: 20 },
  timeseries: { top: 10, bottom: 70, left: 30, right: 20 },
};

/**
 * Transform the legacy data format into Victory-compatible chart series.
 *
 * Input format:
 *   [
 *     ['seriesName', [y1, y2, y3], '#color'],
 *     ['x', [x1, x2, x3], null],          // optional x-axis values for timeseries
 *   ]
 *
 * Returns { series: [...], xValues: [...] | null, colorScale: [...], legendData: [...] }
 */
const transformData = (rawData, xAxisDataLabel) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return null;
  }

  let xValues = null;
  const seriesEntries = [];

  rawData.forEach(item => {
    const [label, values, color] = item;

    if (label === xAxisDataLabel && xAxisDataLabel) {
      // This entry provides x-axis values (timestamps or categories)
      xValues = values;
    } else if (
      values &&
      Array.isArray(values) &&
      values.some(v => v !== 0)
    ) {
      seriesEntries.push({ name: label, values, color });
    }
  });

  if (seriesEntries.length === 0) return null;

  const colorScale = seriesEntries.map(
    (s, idx) => s.color || DEFAULT_COLOR_SCALE[idx % DEFAULT_COLOR_SCALE.length]
  );

  const legendData = seriesEntries.map((s, idx) => ({
    name: s.name,
    symbol: { fill: colorScale[idx] },
  }));

  const series = seriesEntries.map(s =>
    s.values.map((y, idx) => ({
      x: xValues ? new Date(xValues[idx]) : idx + 1,
      y,
      name: s.name,
    }))
  );

  return { series, xValues, colorScale, legendData };
};

/* Data format example:
  data={[
      ['red', [5, 7, 9], '#AA4643'],
      ['green', [2, 4, 6], '#89A54E'],
      ['x', [1557014400000, 1559779200000, 1562457600000], null],
    ]}
*/
const LineChart = ({
  data,
  title,
  config,
  noDataMsg,
  unloadData,
  xAxisDataLabel,
  axisOpts,
  onclick,
  id,
}) => {
  const chartData = useMemo(
    () => transformData(data, xAxisDataLabel),
    [data, xAxisDataLabel]
  );

  if (!chartData) {
    return (
      <EmptyState
        variant="xs"
        icon={
          <Icon iconSize="lg">
            <InfoCircleIcon />
          </Icon>
        }
        header={noDataMsg}
      />
    );
  }

  const { series, xValues, colorScale, legendData } = chartData;
  const dimensions = CHART_DIMENSIONS[config] || CHART_DIMENSIONS.regular;
  const padding = CHART_PADDING[config] || CHART_PADDING.regular;
  const isTimeseries = config === 'timeseries';

  const xAxisProps = {};
  if (isTimeseries && xValues) {
    xAxisProps.tickFormat = date => {
      if (date instanceof Date) {
        return new Intl.DateTimeFormat().format(date);
      }
      return String(date);
    };
    xAxisProps.style = {
      tickLabels: { angle: -40, verticalAnchor: 'end', textAnchor: 'end' },
    };
  }

  const handleClick = onclick
    ? () => [
        {
          target: 'data',
          mutation: p => {
            if (p.datum?.name) {
              onclick({ id: p.datum.name, value: p.datum.y });
            }
            return null;
          },
        },
      ]
    : undefined;

  return (
    <Chart
      ariaDesc={title?.text || __('Line chart')}
      height={dimensions.height}
      width={dimensions.width}
      themeColor={ChartThemeColor.multi}
      padding={padding}
      legendData={legendData}
      legendOrientation="horizontal"
      legendPosition="bottom"
      legendComponent={<ChartLegend />}
      containerComponent={
        <ChartVoronoiContainer
          labels={({ datum }) => `${datum.name}: ${datum.y}`}
          constrainToVisibleArea
        />
      }
      {...(handleClick
        ? {
            events: [
              {
                target: 'data',
                eventHandlers: { onClick: handleClick },
              },
            ],
          }
        : {})}
      name={id}
    >
      <ChartAxis {...xAxisProps} />
      <ChartAxis dependentAxis showGrid />
      <ChartGroup>
        {series.map((seriesData, idx) => (
          <ChartLine
            key={legendData[idx].name}
            data={seriesData}
            name={legendData[idx].name}
            style={{
              data: { stroke: colorScale[idx] },
            }}
          />
        ))}
      </ChartGroup>
    </Chart>
  );
};

LineChart.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  config: PropTypes.oneOf(['regular', 'timeseries']),
  noDataMsg: PropTypes.string,
  title: PropTypes.object,
  unloadData: PropTypes.bool,
  axisOpts: PropTypes.object,
  xAxisDataLabel: PropTypes.string,
  onclick: PropTypes.func,
  id: PropTypes.string,
};

LineChart.defaultProps = {
  data: undefined,
  config: 'regular',
  noDataMsg: __('No data available'),
  title: { type: 'percent' },
  unloadData: false,
  axisOpts: {},
  xAxisDataLabel: '',
  onclick: () => {},
  id: undefined,
};

export default LineChart;
