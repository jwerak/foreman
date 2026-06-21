import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const KeyPairsIndex = ({ computeResourceId, computeResourceName, ...props }) => {
  const columns = [
    {
      key: 'active',
      title: __('Status'),
      wrapper: row => {
        if (row.active) {
          return (
            <span
              className="pficon pficon-ok"
              title={__('In use by this compute resource')}
            />
          );
        }
        if (row.used_elsewhere) {
          return (
            <span
              className="pficon pficon-warning-triangle-o"
              title={__('In use by another compute resource')}
            />
          );
        }
        return (
          <span
            className="pficon pficon-unknown"
            title={__('Not in use')}
          />
        );
      },
    },
    {
      key: 'name',
      title: __('Name'),
    },
    {
      key: 'fingerprint',
      title: __('Fingerprint'),
    },
  ];

  const rowActions = row => {
    const actions = [];
    if (row.active) {
      actions.push({
        title: __('Download'),
        onClick: () => {
          window.location.href = `/compute_resources/${computeResourceId}/key_pairs/${row.key_pair_id}`;
        },
      });
      actions.push({
        title: __('Recreate'),
        onClick: () => {
          if (window.confirm(__('Recreate SSH key pair? The old key will be deleted.'))) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/compute_resources/${computeResourceId}/key_pairs`;
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
        },
      });
    } else if (!row.used_elsewhere) {
      actions.push({
        title: __('Delete'),
        onClick: () => {
          if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
            API.delete(
              `/compute_resources/${computeResourceId}/key_pairs/${encodeURIComponent(row.name)}`
            ).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
    return actions;
  };

  return (
    <IndexPage
      {...props}
      title={__('SSH keys for: %s').replace('%s', computeResourceName)}
      columns={columns}
      rowActions={rowActions}
      searchable={false}
      creatable={false}
      idColumn="name"
    />
  );
};

KeyPairsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  computeResourceId: PropTypes.number.isRequired,
  computeResourceName: PropTypes.string.isRequired,
};

export default KeyPairsIndex;
