import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const MediaIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => <Link to={`/media/${row.id}`}>{row.name}</Link>,
    },
    {
      key: 'path',
      title: __('Path'),
      sortKey: 'path',
    },
    {
      key: 'os_family',
      title: __('OS Family'),
      sortKey: 'family',
    },
    {
      key: 'operatingsystem_names',
      title: __('Operating Systems'),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Clone'),
      onClick: () => {
        window.location.href = `/media/${row.id}/clone`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/media/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Installation Media')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

MediaIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default MediaIndex;
