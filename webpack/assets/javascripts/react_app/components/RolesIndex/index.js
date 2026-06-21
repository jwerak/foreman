import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LockIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const BUILTIN_DEFAULT_ROLE = 2;

const RolesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/roles/${row.id}`}>{row.name}</Link>
      ),
    },
    {
      key: 'description',
      title: __('Description'),
      sortKey: 'description',
    },
    {
      key: 'locked',
      title: __('Locked'),
      sortKey: 'locked',
      wrapper: row =>
        row.locked ? (
          <LockIcon title={__('This role is locked for editing.')} />
        ) : null,
    },
  ];

  const rowActions = (row, fetchData) => {
    const actions = [
      {
        title: __('Filters'),
        onClick: () => {
          window.location.href = `/filters?role_id=${row.id}`;
        },
      },
    ];

    if (!row.locked) {
      actions.push({
        title: __('Add filter'),
        onClick: () => {
          window.location.href = `/filters/new?role_id=${row.id}`;
        },
      });
    }

    actions.push({
      title: __('Clone'),
      onClick: () => {
        window.location.href = `/roles/${row.id}/clone`;
      },
    });

    if (row.builtin === 0 && !row.locked) {
      actions.push({
        title: __('Delete'),
        onClick: () => {
          if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
            API.delete(`/api/v2/roles/${row.id}`).then(() => fetchData());
          }
        },
      });
    }

    return actions;
  };

  return (
    <IndexPage
      {...props}
      title={__('Roles')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

RolesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default RolesIndex;
