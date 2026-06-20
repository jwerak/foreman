import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import DonutChart from '../common/charts/DonutChart';
import { translate as __ } from '../../common/I18n';

const StatusChartCard = ({ overview }) => (
  <Card isFullHeight>
    <CardHeader>
      <CardTitle>{__('Host Configuration Chart')}</CardTitle>
    </CardHeader>
    <CardBody>
      <DonutChart
        data={overview?.data}
        searchUrl={overview?.searchUrl}
        searchFilters={overview?.searchFilters}
        config="regular"
        noDataMsg={__('No data available')}
      />
    </CardBody>
  </Card>
);

StatusChartCard.propTypes = {
  overview: PropTypes.shape({
    data: PropTypes.array,
    searchUrl: PropTypes.string,
    searchFilters: PropTypes.object,
  }),
};

StatusChartCard.defaultProps = {
  overview: {},
};

export default StatusChartCard;
