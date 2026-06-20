import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import BarChart from '../common/charts/BarChart';
import { translate as __ } from '../../common/I18n';

const RunDistributionCard = ({ data }) => (
  <Card isFullHeight>
    <CardHeader>
      <CardTitle>{__('Run Distribution Chart')}</CardTitle>
    </CardHeader>
    <CardBody>
      <BarChart
        data={data}
        config="small"
        xAxisLabel={__('Minutes Ago')}
        yAxisLabel={__('Number Of Clients')}
        noDataMsg={__('No data available')}
      />
    </CardBody>
  </Card>
);

RunDistributionCard.propTypes = {
  data: PropTypes.array,
};

RunDistributionCard.defaultProps = {
  data: [],
};

export default RunDistributionCard;
