import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  Icon,
  Label,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table';
import { useDispatch } from 'react-redux';
import { translate as __ } from '../../../common/I18n';
import API from '../../../redux/API/API';
import { openConfirmModal } from '../../ConfirmModal';

const RoleFiltersTab = ({ roleId }) => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilters = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get(
        `/api/v2/filters?search=role_id%3D${roleId}&per_page=all`
      );
      setFilters(data.results || []);
    } catch {
      setFilters([]);
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleDelete = id => {
    dispatch(
      openConfirmModal({
        title: __('Delete Filter'),
        message: __('Are you sure you want to delete this filter?'),
        confirmButtonText: __('Delete'),
        isWarning: true,
        onConfirm: async () => {
          await API.delete(`/api/v2/filters/${id}`);
          fetchFilters();
        },
      })
    );
  };

  if (isLoading) {
    return null;
  }

  if (filters.length === 0) {
    return (
      <EmptyState
        titleText={__('Filters')}
        headingLevel="h4"
        icon={() => (
          <Icon size="xl">
            <FilterIcon />
          </Icon>
        )}
      >
        <p>{__('No filters have been defined for this role.')}</p>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="primary"
              ouiaId="new-filter-button"
              component="a"
              href={`/filters/new?role_id=${roleId}`}
            >
              {__('New Filter')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  }

  return (
    <>
      <Table aria-label={__('Filters')} ouiaId="role-filters-table">
        <Thead>
          <Tr>
            <Th>{__('Resource Type')}</Th>
            <Th>{__('Permissions')}</Th>
            <Th>{__('Search')}</Th>
            <Th>{__('Unlimited?')}</Th>
            <Th>{__('Override?')}</Th>
            <Th>{__('Actions')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filters.map(filter => (
            <Tr key={filter.id}>
              <Td dataLabel={__('Resource Type')}>
                {filter.resource_type_label || filter.resource_type || __('(Miscellaneous)')}
              </Td>
              <Td dataLabel={__('Permissions')}>
                {(filter.permissions || []).map(p => p.name).join(', ')}
              </Td>
              <Td dataLabel={__('Search')}>
                {filter.search || ''}
              </Td>
              <Td dataLabel={__('Unlimited?')}>
                {filter.unlimited ? (
                  <Label color="green">{__('Yes')}</Label>
                ) : (
                  <Label color="orange">{__('No')}</Label>
                )}
              </Td>
              <Td dataLabel={__('Override?')}>
                {filter.override ? (
                  <Label color="blue">{__('Yes')}</Label>
                ) : (
                  <Label>{__('No')}</Label>
                )}
              </Td>
              <Td dataLabel={__('Actions')}>
                <Button
                  variant="danger"
                  size="sm"
                  ouiaId={`delete-filter-${filter.id}`}
                  onClick={() => handleDelete(filter.id)}
                >
                  {__('Delete')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <div className="pf-v6-u-mt-md">
        <Button
          variant="primary"
          ouiaId="new-filter-button"
          component="a"
          href={`/filters/new?role_id=${roleId}`}
        >
          {__('New Filter')}
        </Button>
      </div>
    </>
  );
};

RoleFiltersTab.propTypes = {
  roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default RoleFiltersTab;
