import React from 'react';
import PropTypes from 'prop-types';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const HostgroupsIndex = props => {
  const columns = [
    {
      key: 'title',
      title: __('Name'),
      sortKey: 'label',
      wrapper: row => (
        <a href={`/hostgroups/${row.id}/edit`}>{row.title}</a>
      ),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(
            `hostgroup_fullname = "${row.title}"`
          )}`}
        >
          {row.hosts_count}
        </a>
      ),
    },
    {
      key: 'children_hosts_count',
      title: __('Hosts including Sub-groups'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(
            `parent_hostgroup = "${row.title}"`
          )}`}
        >
          {row.children_hosts_count}
        </a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Nest'),
      onClick: () => {
        window.location.href = `/hostgroups/${row.id}/nest`;
      },
    },
    {
      title: __('Create Host'),
      onClick: () => {
        window.location.href = `/hosts/new?hostgroup_id=${row.id}`;
      },
    },
    {
      title: __('Clone'),
      onClick: () => {
        window.location.href = `/hostgroups/${row.id}/clone`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.title))) {
          API.delete(`/api/v2/hostgroups/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Host Groups')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

HostgroupsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default HostgroupsIndex;
