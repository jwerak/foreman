import PropTypes from 'prop-types';
import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';

import { selectRoutes } from '../RouterSelector';
import RailsPage from '../RailsPage';

const ForemanSwitcher = ({ children: coreRoutes }) => {
  const routes = useSelector(() => selectRoutes(coreRoutes), shallowEqual);
  const location = useLocation();
  const taxonomyKey = location.state?.taxonomySwitch || 0;

  return (
    <Switch key={taxonomyKey}>
      {routes}
      <Route component={RailsPage} key="default-route" />
    </Switch>
  );
};

ForemanSwitcher.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default ForemanSwitcher;
