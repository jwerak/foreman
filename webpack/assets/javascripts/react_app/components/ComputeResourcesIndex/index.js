import React from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ComputeResourcesIndex = props => {
  const history = useHistory();

  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/compute_resources/${row.id}`}>{row.name}</Link>
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
        history.push(`/compute_resources/${row.id}/edit`);
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
