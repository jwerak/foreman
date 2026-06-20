import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import Breadcrumb from './components/Breadcrumb';
import PF4BreadcrumbSwitcher from '../PF4/BreadcrumbSwitcher';
import {
  selectResourceSwitcherItems,
  selectIsSwitcherOpen,
  selectResourceUrl,
  selectIsLoadingResources,
  selectHasError,
  selectCurrentPage,
  selectTotal,
  selectSearchQuery,
  selectTitleReplacement,
  selectPerPage,
} from './BreadcrumbBarSelector';
import {
  openSwitcher as openSwitcherAction,
  closeSwitcher as closeSwitcherAction,
  loadSwitcherResourcesByResource as loadSwitcherResourcesByResourceAction,
  removeSearchQuery as removeSearchQueryAction,
} from './BreadcrumbBarActions';
import './BreadcrumbBar.scss';

const BreadcrumbBar = ({
  breadcrumbItems,
  isSwitchable,
  resource,
  searchDebounceTimeout,
  onSwitcherItemClick,
  isPf4,
}) => {
  const dispatch = useDispatch();
  const resourceSwitcherItems = useSelector(selectResourceSwitcherItems);
  const isSwitcherOpen = useSelector(selectIsSwitcherOpen);
  const resourceUrl = useSelector(selectResourceUrl);
  const isLoadingResources = useSelector(selectIsLoadingResources);
  const hasError = useSelector(selectHasError);
  const currentPage = useSelector(selectCurrentPage);
  const total = useSelector(selectTotal);
  const searchQuery = useSelector(selectSearchQuery);
  const titleReplacement = useSelector(selectTitleReplacement);
  const perPage = useSelector(selectPerPage);

  const openSwitcher = () => dispatch(openSwitcherAction());
  const closeSwitcher = () => dispatch(closeSwitcherAction());
  const loadSwitcherResourcesByResource = (res, opts) =>
    dispatch(loadSwitcherResourcesByResourceAction(res, opts));
  const removeSearchQuery = res => dispatch(removeSearchQueryAction(res));
  const handleOpen = () => {
    const isUrlFormatValid = resourceSwitcherItems.length
      ? resourceSwitcherItems[0].href ===
        resource.switcherItemUrl?.replace(':id', resourceSwitcherItems[0].id)
      : true;
    if (
      !currentPage ||
      resourceUrl !== resource.resourceUrl ||
      !isUrlFormatValid
    ) {
      loadSwitcherResourcesByResource(resource);
    }
  };

  const isTitle = breadcrumbItems.length === 1;
  const handleSwitcherItemClick = (e, href) => {
    closeSwitcher();
    if (onSwitcherItemClick) {
      onSwitcherItemClick(e, href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className={isPf4 ? 'breadcrumb-bar-pf4' : 'breadcrumb-bar'}>
      <Breadcrumb
        items={breadcrumbItems}
        isTitle={isTitle}
        titleReplacement={titleReplacement}
        className="breadcrumbs-list"
        ouiaId="breadcrumbs-list"
      >
        {isSwitchable && (
          <PF4BreadcrumbSwitcher
            isOpen={isSwitcherOpen}
            isLoading={isLoadingResources}
            hasError={hasError}
            items={resourceSwitcherItems}
            currentPage={currentPage}
            total={total}
            openSwitcher={openSwitcher}
            onHide={() => closeSwitcher()}
            onOpen={() => handleOpen()}
            onSetPage={pageNumber => {
              loadSwitcherResourcesByResource(resource, {
                page: pageNumber,
                searchQuery,
                perPage,
              });
            }}
            onSearchChange={searchTerm =>
              loadSwitcherResourcesByResource(resource, {
                searchQuery: searchTerm,
                perPage,
              })
            }
            onPerPageSelect={newPerPage => {
              loadSwitcherResourcesByResource(resource, {
                perPage: newPerPage,
              });
            }}
            perPage={perPage}
            searchValue={searchQuery}
            onSearchClear={() => removeSearchQuery(resource)}
            searchDebounceTimeout={searchDebounceTimeout}
            onResourceClick={handleSwitcherItemClick}
          />
        )}
      </Breadcrumb>
      {!isTitle && !isPf4 && <hr className="breadcrumb-line" />}
    </div>
  );
};

BreadcrumbBar.propTypes = {
  isSwitchable: PropTypes.bool,
  resource: PropTypes.shape({
    nameField: PropTypes.string,
    resourceUrl: PropTypes.string,
    switcherItemUrl: PropTypes.string,
    resourceFilter: PropTypes.string,
  }),
  breadcrumbItems: Breadcrumb.propTypes.items,
  searchDebounceTimeout: PropTypes.number,
  onSwitcherItemClick: PropTypes.func,
  isPf4: PropTypes.bool,
};

BreadcrumbBar.defaultProps = {
  isSwitchable: false,
  resource: {},
  breadcrumbItems: [],
  searchDebounceTimeout: 300,
  onSwitcherItemClick: null,
  isPf4: false,
};

export default BreadcrumbBar;
