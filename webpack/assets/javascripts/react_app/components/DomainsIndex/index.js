import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const DomainsIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/domains/${row.id}`}>
          {row.fullname || row.name}
        </Link>
      ),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a href={`/hosts?search=${encodeURIComponent(`domain = ${row.name}`)}`}>
          {row.hosts_count}
        </a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/domains/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Domains')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

DomainsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default DomainsIndex;
