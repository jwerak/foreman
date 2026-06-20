import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const HttpProxiesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <a href={`/http_proxies/${row.id}/edit`}>{row.name}</a>
      ),
    },
    {
      key: 'url',
      title: __('URL'),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/http_proxies/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('HTTP Proxies')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

HttpProxiesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default HttpProxiesIndex;
