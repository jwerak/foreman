import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const OperatingsystemsIndex = props => {
  const columns = [
    {
      key: 'title',
      title: __('Title'),
      sortKey: 'title',
      wrapper: row => (
        <a href={`/operatingsystems/${row.id}/edit`}>{row.title}</a>
      ),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(`os_id = ${row.id}`)}`}
        >
          {row.hosts_count}
        </a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Clone'),
      onClick: () => {
        window.location.href = `/operatingsystems/${row.id}/clone`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.title))) {
          API.delete(`/api/v2/operatingsystems/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Operating Systems')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

OperatingsystemsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default OperatingsystemsIndex;
