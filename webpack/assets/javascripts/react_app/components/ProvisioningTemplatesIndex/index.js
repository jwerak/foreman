import React from 'react';
import PropTypes from 'prop-types';
import { CheckIcon, LockIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const ProvisioningTemplatesIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <a href={`/templates/provisioning_templates/${row.id}/edit`}>{row.name}</a>
      ),
    },
    {
      key: 'combination',
      title: __('Host Group / Environment'),
    },
    {
      key: 'template_kind_name',
      title: __('Kind'),
      sortKey: 'kind',
      wrapper: row =>
        row.template_kind_name ? (
          <a
            href={`/templates/provisioning_templates?search=${encodeURIComponent(
              `kind = ${row.template_kind_name}`
            )}`}
          >
            {row.template_kind_name}
          </a>
        ) : null,
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
          window.location.href = `/templates/provisioning_templates/${row.id}/clone_template`;
        },
      },
      {
        title: __('Export'),
        onClick: () => {
          window.location.href = `/templates/provisioning_templates/${row.id}/export`;
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
            window.location.href = `/templates/provisioning_templates/${row.id}/unlock`;
          }
        },
      });
    } else {
      actions.push({
        title: __('Lock'),
        onClick: () => {
          window.location.href = `/templates/provisioning_templates/${row.id}/lock`;
        },
      });
      actions.push({
        title: __('Delete'),
        onClick: () => {
          if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
            API.delete(`/api/v2/provisioning_templates/${row.id}`).then(() =>
              fetchData()
            );
          }
        },
      });
    }

    return actions;
  };

  const handleBuildPxeDefault = () => {
    if (
      window.confirm(
        __(
          'You are about to change the default PXE menu on all configured TFTP servers - continue?'
        )
      )
    ) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/provisioning_templates/build_pxe_default';
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'authenticity_token';
      csrfInput.value = document.querySelector(
        'meta[name="csrf-token"]'
      )?.content;
      form.appendChild(csrfInput);
      document.body.appendChild(form);
      form.submit();
    }
  };

  const customActions = [
    {
      title: __('Build PXE Default'),
      action: { onClick: handleBuildPxeDefault },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Provisioning Templates')}
      columns={columns}
      rowActions={rowActions}
      customActions={customActions}
    />
  );
};

ProvisioningTemplatesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default ProvisioningTemplatesIndex;
