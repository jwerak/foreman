import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckIcon, LockIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ReportTemplatesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/templates/report_templates/${row.id}`}>{row.name}</Link>
      ),
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
          window.location.href = `/templates/report_templates/${row.id}/clone_template`;
        },
      },
    ];

    if (!row.snippet) {
      actions.push({
        title: __('Generate'),
        onClick: () => {
          window.location.href = `/templates/report_templates/${row.id}/generate`;
        },
      });
    }

    actions.push({
      title: __('Export'),
      onClick: () => {
        window.location.href = `/templates/report_templates/${row.id}/export`;
      },
    });

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
            window.location.href = `/templates/report_templates/${row.id}/unlock`;
          }
        },
      });
    } else {
      actions.push({
        title: __('Lock'),
        onClick: () => {
          window.location.href = `/templates/report_templates/${row.id}/lock`;
        },
      });
      actions.push({
        title: __('Delete'),
        onClick: () => {
          if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
            API.delete(`/api/v2/report_templates/${row.id}`).then(() =>
              fetchData()
            );
          }
        },
      });
    }

    return actions;
  };

  return (
    <IndexPage
      {...props}
      title={__('Report Templates')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

ReportTemplatesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ReportTemplatesIndex;
