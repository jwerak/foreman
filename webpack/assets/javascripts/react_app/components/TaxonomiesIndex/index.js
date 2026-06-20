import React from 'react';
import PropTypes from 'prop-types';

import { translate as __, ngettext as n__ } from '../../common/I18n';
import IndexPage from '../common/IndexPage';
import API from '../../redux/API/API';

const TaxonomiesIndex = ({
  taxonomyResource,
  taxonomySingle,
  mismatchesUrl,
  countNilHosts,
  ...props
}) => {
  const columns = [
    {
      key: 'title',
      title: __('Name'),
      sortKey: 'title',
      wrapper: row => (
        <a href={`/${taxonomyResource}/${row.id}/edit`}>{row.title}</a>
      ),
    },
    {
      key: 'hosts_count',
      title: __('Hosts'),
      wrapper: row => (
        <a
          href={`/hosts?search=${encodeURIComponent(`${taxonomySingle} = "${row.title}"`)}`}
        >
          {row.hosts_count}
        </a>
      ),
    },
  ];

  const rowActions = (row, fetchData) => [
    {
      title: __('Edit'),
      onClick: () => {
        window.location.href = `/${taxonomyResource}/${row.id}/edit`;
      },
    },
    {
      title: __('Nest'),
      onClick: () => {
        window.location.href = `/${taxonomyResource}/${row.id}/nest`;
      },
    },
    {
      title: __('Clone'),
      onClick: () => {
        window.location.href = `/${taxonomyResource}/${row.id}/clone`;
      },
    },
    {
      title: __('Delete'),
      onClick: () => {
        if (window.confirm(__('Delete %s?').replace('%s', row.title))) {
          API.delete(`/api/v2/${taxonomyResource}/${row.id}`).then(() =>
            fetchData()
          );
        }
      },
    },
  ];

  const customActions = mismatchesUrl
    ? [{ title: __('Mismatches Report'), action: { href: mismatchesUrl } }]
    : [];

  return (
    <>
      {countNilHosts > 0 && (
        <div className="pf-v6-c-page__main-section pf-m-light">
          <div className="pf-v6-c-alert pf-m-warning pf-m-inline">
            <div className="pf-v6-c-alert__icon">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <p className="pf-v6-c-alert__title">
              {n__(
                'There is %{count} host with no %{taxonomy} assigned',
                'There are %{count} hosts with no %{taxonomy} assigned',
                countNilHosts
              )
                .replace('%{count}', countNilHosts)
                .replace('%{taxonomy}', taxonomySingle)}
            </p>
          </div>
        </div>
      )}
      <IndexPage
        {...props}
        columns={columns}
        rowActions={rowActions}
        customActions={customActions}
      />
    </>
  );
};

TaxonomiesIndex.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  taxonomyResource: PropTypes.string.isRequired,
  taxonomySingle: PropTypes.string.isRequired,
  mismatchesUrl: PropTypes.string,
  countNilHosts: PropTypes.number,
};

TaxonomiesIndex.defaultProps = {
  mismatchesUrl: '',
  countNilHosts: 0,
};

export default TaxonomiesIndex;
