import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const SubnetsIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => (
        <Link to={`/subnets/${row.id}`}>{row.name}</Link>
      ),
    },
    {
      key: 'network_address',
      title: __('Network'),
      sortKey: 'network',
    },
    {
      key: 'vlanid',
      title: __('VLAN ID'),
      sortKey: 'vlanid',
    },
    {
      key: 'dhcp_name',
      title: __('DHCP Proxy'),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(`subnet.name="${row.name}"`)}`}
        >
          {row.hosts_count}
        </a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/subnets/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Subnets')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

SubnetsIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default SubnetsIndex;
