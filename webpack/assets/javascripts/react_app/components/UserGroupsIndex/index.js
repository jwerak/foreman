import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const UserGroupsIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/usergroups/${row.id}`}>{row.name}</Link>
      ),
    },
    {
      key: 'user_names',
      title: __('Users'),
    },
    {
      key: 'usergroup_names',
      title: __('User Groups'),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/usergroups/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('User Groups')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

UserGroupsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default UserGroupsIndex;
