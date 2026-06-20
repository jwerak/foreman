import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ConfigReportsIndex = props => {
  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const columns = [
    {
      key: 'host_name',
      title: __('Host'),
      wrapper: row =>
        row.host_name ? (
          <a
            href={`/hosts/${row.host_name}/config_reports`}
          >
            {row.host_name}
          </a>
        ) : null,
    },
    {
      key: 'reported_at',
      title: __('Last report'),
      sortKey: 'reported',
      wrapper: row =>
        row.reported_at ? (
          <a href={`/config_reports/${row.id}`}>{formatDate(row.reported_at)}</a>
        ) : null,
    },
    {
      key: 'origin',
      title: __('Origin'),
      sortKey: 'origin',
    },
    {
      key: 'applied',
      title: __('Applied'),
      sortKey: 'applied',
    },
    {
      key: 'restarted',
      title: __('Restarted'),
      sortKey: 'restarted',
    },
    {
      key: 'failed',
      title: __('Failed'),
      sortKey: 'failed',
    },
    {
      key: 'failed_restarts',
      title: __('Restart Failures'),
      sortKey: 'failed_restarts',
    },
    {
      key: 'skipped',
      title: __('Skipped'),
      sortKey: 'skipped',
    },
    {
      key: 'pending',
      title: __('Pending'),
      sortKey: 'pending',
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (
          window.confirm(
            __('Delete report for %s?').replace('%s', row.host_name || '')
          )
        ) {
          API.delete(`/api/v2/config_reports/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Reports')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

ConfigReportsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ConfigReportsIndex;
