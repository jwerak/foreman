import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ActionsColumn,
} from '@patternfly/react-table';

import { translate as __ } from '../../../common/I18n';
import { getControllerSearchProps } from '../../../constants';
import SearchBar from '../../SearchBar';
import EmptyPage from '../../../routes/common/EmptyPage';
import IndexPageActionButtons from './ActionButtons';
import useIndexData from './useIndexData';

const IndexPage = ({
  apiUrl,
  title,
  columns,
  controller,
  creatable,
  createUrl,
  createLabel,
  exportable,
  exportUrl,
  hasHelpPage,
  documentationUrl,
  customActions,
  rowActions,
  searchable,
  initialSearch,
  idColumn,
  isStriped,
}) => {
  const {
    results,
    subtotal,
    page,
    perPage,
    isLoading,
    error,
    canCreate,
    onPagination,
    onSort,
    onSearch,
    fetchData,
  } = useIndexData({
    apiUrl,
    initialSearch,
  });

  const searchProps = useMemo(
    () => (controller ? getControllerSearchProps(controller) : null),
    [controller]
  );

  if (searchProps) {
    searchProps.autocomplete.searchQuery = initialSearch || '';
  }

  const handleSort = (_event, index, direction) => {
    const col = columns[index];
    if (col?.sortKey) {
      onSort(col.sortKey, direction);
    }
  };

  const getSortParams = colIndex => {
    const col = columns[colIndex];
    if (!col?.sortKey) return undefined;
    return {
      columnIndex: colIndex,
      sortBy: {
        defaultDirection: 'asc',
      },
      onSort: handleSort,
    };
  };

  const handleSetPage = (_event, newPage) => {
    onPagination({ page: newPage });
  };

  const handlePerPageSelect = (_event, newPerPage) => {
    onPagination({ per_page: newPerPage });
  };

  const paginationTitles = {
    items: __('items'),
    page: '',
    itemsPerPage: __('Items per page'),
    perPageSuffix: __('per page'),
    toFirstPageAriaLabel: __('Go to first page'),
    toPreviousPageAriaLabel: __('Go to previous page'),
    toLastPageAriaLabel: __('Go to last page'),
    toNextPageAriaLabel: __('Go to next page'),
    optionsToggleAriaLabel: __('Items per page'),
    currPageAriaLabel: __('Current page'),
    paginationAriaLabel: __('Pagination'),
  };

  return (
    <>
      <div className="pf-v6-c-page__main-section pf-m-light index-page-toolbar">
        <Toolbar ouiaId="index-page-toolbar">
          <ToolbarContent>
            {searchable && searchProps && (
              <ToolbarGroup variant="filter-group">
                <ToolbarItem className="toolbar-search">
                  <SearchBar
                    data={searchProps}
                    initialQuery={initialSearch || ''}
                    onSearch={onSearch}
                  />
                </ToolbarItem>
                {isLoading && (
                  <ToolbarItem>
                    <Spinner size="sm" />
                  </ToolbarItem>
                )}
              </ToolbarGroup>
            )}
            <ToolbarGroup
              align={{ default: 'alignStart' }}
              variant="action-group"
            >
              <ToolbarItem>
                <IndexPageActionButtons
                  creatable={creatable}
                  canCreate={canCreate}
                  createUrl={createUrl}
                  createLabel={createLabel}
                  exportable={exportable}
                  exportUrl={exportUrl}
                  hasHelpPage={hasHelpPage}
                  documentationUrl={documentationUrl}
                  customActions={customActions}
                />
              </ToolbarItem>
            </ToolbarGroup>
            {subtotal > 0 && (
              <ToolbarItem variant="pagination">
                <Pagination
                  titles={paginationTitles}
                  isCompact
                  variant={PaginationVariant.top}
                  page={page}
                  perPage={perPage}
                  itemCount={subtotal}
                  onSetPage={handleSetPage}
                  onPerPageSelect={handlePerPageSelect}
                />
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>
      </div>

      <div className="pf-v6-c-page__main-section pf-m-light pf-m-no-padding">
        <Table
          variant="compact"
          ouiaId={`${controller || 'index'}-table`}
          isStriped={isStriped}
          aria-label={title}
        >
          <Thead>
            <Tr ouiaId="table-header">
              {columns.map((col, idx) => (
                <Th
                  key={col.key || col.title}
                  sort={getSortParams(idx)}
                  modifier="wrap"
                  aria-label={col.title}
                >
                  {col.title}
                </Th>
              ))}
              {rowActions && <Th aria-label={__('Actions')} />}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && results.length === 0 && (
              <Tr ouiaId="table-loading">
                <Td colSpan={columns.length + (rowActions ? 1 : 0)}>
                  <EmptyPage
                    message={{ type: 'loading', text: __('Loading...') }}
                  />
                </Td>
              </Tr>
            )}
            {!isLoading && results.length === 0 && !error && (
              <Tr ouiaId="table-empty">
                <Td colSpan={columns.length + (rowActions ? 1 : 0)}>
                  <EmptyPage message={{ type: 'empty' }} />
                </Td>
              </Tr>
            )}
            {error && (
              <Tr ouiaId="table-error">
                <Td colSpan={columns.length + (rowActions ? 1 : 0)}>
                  <EmptyPage message={{ type: 'error', text: error }} />
                </Td>
              </Tr>
            )}
            {!error &&
              results.map(row => {
                const actions = rowActions ? rowActions(row, fetchData) : [];
                return (
                  <Tr
                    key={row[idColumn] || row.id}
                    ouiaId={`table-row-${row[idColumn] || row.id}`}
                  >
                    {columns.map(col => (
                      <Td key={col.key || col.title} dataLabel={col.title}>
                        {col.wrapper ? col.wrapper(row) : row[col.key]}
                      </Td>
                    ))}
                    {rowActions && (
                      <Td isActionCell>
                        {actions.length > 0 && (
                          <ActionsColumn items={actions} />
                        )}
                      </Td>
                    )}
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
        {!error && results.length > 0 && (
          <Pagination
            titles={paginationTitles}
            variant={PaginationVariant.bottom}
            page={page}
            perPage={perPage}
            itemCount={subtotal}
            onSetPage={handleSetPage}
            onPerPageSelect={handlePerPageSelect}
          />
        )}
      </div>
    </>
  );
};

IndexPage.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string.isRequired,
      sortKey: PropTypes.string,
      wrapper: PropTypes.func,
    })
  ).isRequired,
  controller: PropTypes.string,
  creatable: PropTypes.bool,
  createUrl: PropTypes.string,
  createLabel: PropTypes.string,
  exportable: PropTypes.bool,
  exportUrl: PropTypes.string,
  hasHelpPage: PropTypes.bool,
  documentationUrl: PropTypes.string,
  customActions: PropTypes.array,
  rowActions: PropTypes.func,
  searchable: PropTypes.bool,
  initialSearch: PropTypes.string,
  idColumn: PropTypes.string,
  isStriped: PropTypes.bool,
};

IndexPage.defaultProps = {
  controller: '',
  creatable: true,
  createUrl: '',
  createLabel: null,
  exportable: false,
  exportUrl: '',
  hasHelpPage: false,
  documentationUrl: '',
  customActions: [],
  rowActions: null,
  searchable: true,
  initialSearch: '',
  idColumn: 'id',
  isStriped: true,
};

export default IndexPage;
