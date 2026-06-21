import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const BookmarksIndex = props => {
  const columns = [
    {
      key: 'name',
      title: __('Name'),
      sortKey: 'name',
      wrapper: row => <Link to={`/bookmarks/${row.id}`}>{row.name}</Link>,
    },
    {
      key: 'query',
      title: __('Query'),
    },
    {
      key: 'controller',
      title: __('Controller'),
      sortKey: 'controller',
    },
    {
      key: 'public',
      title: __('Public'),
      wrapper: row => String(row.public),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.name))) {
          API.delete(`/api/v2/bookmarks/${row.id}`).then(() => fetchData());
        }
      },
    },
  ];

  return (
    <IndexPage
      {...props}
      title={__('Bookmarks')}
      columns={columns}
      rowActions={rowActions}
    />
  );
};

BookmarksIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

export default BookmarksIndex;
