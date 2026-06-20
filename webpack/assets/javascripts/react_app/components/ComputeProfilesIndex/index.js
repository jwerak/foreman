import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ComputeProfilesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <a href={`/compute_profiles/${row.id}`}>{row.name}</a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Rename'),
      onClick: () => {
        window.location.href = `/compute_profiles/${row.id}/edit`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/compute_profiles/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Compute Profiles')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

ComputeProfilesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ComputeProfilesIndex;
