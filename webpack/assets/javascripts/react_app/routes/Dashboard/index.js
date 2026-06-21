import React, { useState, useEffect } from 'react';
import { Spinner } from '@patternfly/react-core';
import Dashboard from '../../components/Dashboard';
import { foremanUrl } from '../../../foreman_tools';
import { translate as __ } from '../../common/I18n';

export const DASHBOARD_PATH = '/dashboard';

const DashboardRoute = () => {
  const [props, setProps] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `${__('Overview')} - Foreman`;

    const fetchData = async () => {
      try {
        const response = await fetch(foremanUrl('/dashboard.json'), {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();
        setProps(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="pf-v6-c-page__main-section">
        <div className="pf-v6-c-alert pf-m-danger pf-m-inline">
          <div className="pf-v6-c-alert__title">
            {__('Failed to load dashboard')}: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!props) {
    return (
      <div className="pf-v6-c-page__main-section" style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
        <Spinner size="xl" aria-label={__('Loading dashboard')} />
      </div>
    );
  }

  return <Dashboard {...props} />;
};

export default {
  path: DASHBOARD_PATH,
  exact: true,
  render: () => <DashboardRoute />,
};
