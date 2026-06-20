import React from 'react';
import PropTypes from 'prop-types';
import { CheckIcon, LockIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const PtablesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <a href={`/ptables/${row.id}/edit`}>{row.name}</a>
      ),
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
    {
      key: 'snippet',
      title: __('Snippet'),
      sortKey: 'snippet',
      wrapper: row => (row.snippet ? <CheckIcon /> : null),
    },
    {
      key: 'locked',
      title: __('Locked'),
      sortKey: 'locked',
      wrapper: row => (row.locked ? <LockIcon /> : null),
    },
  ];

  const rowActions = (row, fetchData) => {
    const actions = [
      {
        title: __('Clone'),
        onClick: () => {
          window.location.href = `/ptables/${row.id}/clone_template`;
        },
      },
    ];

    if (row.locked) {
      actions.push({
        title: __('Unlock'),
        onClick: () => {
          if (
            window.confirm(
              __('You are about to unlock a locked template.') +
                ' ' +
                __('This is for every location and organization that uses it.') +
                ' ' +
                __('Continue?')
            )
          ) {
            window.location.href = `/ptables/${row.id}/unlock`;
          }
        },
      });
    } else {
      actions.push({
        title: __('Lock'),
        onClick: () => {
          window.location.href = `/ptables/${row.id}/lock`;
        },
      });
      actions.push({
        title: __('Delete'),
        onClick: () => {
          if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
            API.delete(`/api/v2/ptables/${row.id}`).then(() => fetchData());
          }
        },
      });
    }

    return actions;
  };

  return (
    <IndexPage
      {...props}
      title={__('Partition Tables')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

PtablesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default PtablesIndex;
