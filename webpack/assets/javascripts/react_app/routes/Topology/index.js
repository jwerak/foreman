import React from 'react';
import TopologyPage from '../../components/Topology';
import { TOPOLOGY_PATH } from './constants';

export default {
  path: TOPOLOGY_PATH,
  exact: true,
  render: props => <TopologyPage {...props} />,
};
