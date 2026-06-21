import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const UsersIndex = props => {
  const columns = [
    {
      key: 'login',
      title: __('Login'),
      sortKey: 'login',
      wrapper: row => <Link to={`/users/${row.id}`}>{row.login}</Link>,
    },
    {
      key: 'firstname',
      title: __('Firstname'),
      sortKey: 'firstname',
    },
    {
      key: 'lastname',
      title: __('Lastname'),
      sortKey: 'lastname',
    },
    {
      key: 'mail',
      title: __('Mail'),
      sortKey: 'mail',
    },
    {
      key: 'admin',
      title: __('Admin'),
      sortKey: 'admin',
      wrapper: row => (row.admin ? <CheckIcon /> : null),
    },
    {
      key: 'last_login_on',
      title: __('Last login on'),
      sortKey: 'last_login_on',
      wrapper: row =>
        row.last_login_on
          ? new Date(row.last_login_on).toLocaleString()
          : null,
    },
    {
      key: 'auth_source_name',
      title: __('Authorized by'),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.login))) {
          API.delete(`/api/v2/users/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Users')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

UsersIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default UsersIndex;
