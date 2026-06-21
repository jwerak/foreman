import { Route } from 'react-router-dom';
import React from 'react';
import { addGlobalFill } from '../components/common/Fill/GlobalFill';

/**
 * Adds a plugin's routes into core
 * @param  {String} id  plugin's id - can be its name
 * @param  {Array}   routes an array that contains a plugin's routes
 */
export const registerRoutes = (id, routes) =>
  routes.map(({ render, path, ...routeProps }, index) =>
    addGlobalFill(
      'routes',
      `${id}-${index}`,
      <Route
        path={path}
        key={path}
        {...routeProps}
        render={renderProps => renderRoute(render, renderProps)}
      />
    )
  );

/**
 * a Helper function for rendering a route
 * @param {Function} renderFn - a component's rendering function
 * @param {Object} props - routing props
 */
export const renderRoute = (renderFn, props) => {
  removeRailsContent();
  return renderFn(props);
};

const removeRailsContent = () => {
  const railsContainer = document.getElementById('rails-app-content');
  if (railsContainer) railsContainer.remove();
  document.body.classList.add('react-page');
};
