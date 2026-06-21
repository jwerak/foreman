import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const SmartProxiesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => <a href={`/smart_proxies/${row.id}`}>{row.name}</a>,
    },
    {
      key: 'url',
      title: __('URL'),
    },
    {
      key: 'features',
      title: __('Features'),
      wrapper: row =>
        (row.features || [])
          .map(f => f.name)
          .sort()
          .join(', '),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Edit'),
      onClick: () => {
        window.location.href = `/smart_proxies/${row.id}/edit`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/smart_proxies/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Smart Proxies')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

SmartProxiesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default SmartProxiesIndex;
