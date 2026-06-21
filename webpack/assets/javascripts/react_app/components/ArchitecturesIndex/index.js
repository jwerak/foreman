import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ArchitecturesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/architectures/${row.id}`}>{row.name}</Link>
      ),
    },
    {
      key: 'operatingsystem_names',
      title: __('Operating Systems'),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(`architecture = ${row.name}`)}`}
        >
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
          API.delete(`/api/v2/architectures/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Architectures')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

ArchitecturesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ArchitecturesIndex;
