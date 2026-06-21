import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';

const FactValuesIndex = props => {
  const formatDate = dateStr => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  const columns = [
    {
      key: 'host_name',
      title: __('Host'),
      sortKey: 'host',
      wrapper: row =>
        row.host_name ? (
          <a href={`/hosts/${row.host_name}/facts`}>{row.host_name}</a>
        ) : (
          __('N/A')
        ),
    },
    {
      key: 'fact_name',
      title: __('Name'),
      sortKey: 'name',
    },
    {
      key: 'value',
      title: __('Value'),
      sortKey: 'value',
    },
    {
      key: 'origin',
      title: __('Origin'),
      sortKey: 'origin',
    },
    {
      key: 'updated_at',
      title: __('Reported at'),
      sortKey: 'reported_at',
      wrapper: row => formatDate(row.updated_at),
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Fact Values')}
      columns={columns}
    />
  );
};

FactValuesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default FactValuesIndex;
