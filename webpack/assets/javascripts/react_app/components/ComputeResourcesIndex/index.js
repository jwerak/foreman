import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ComputeResourcesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <a href={`/compute_resources/${row.id}`}>{row.name}</a>
      ),
    },
    {
      key: 'provider_friendly_name',
      title: __('Type'),
      sortKey: 'type',
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Edit'),
      onClick: () => {
        window.location.href = `/compute_resources/${row.id}/edit`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/compute_resources/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Compute Resources')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

ComputeResourcesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ComputeResourcesIndex;
