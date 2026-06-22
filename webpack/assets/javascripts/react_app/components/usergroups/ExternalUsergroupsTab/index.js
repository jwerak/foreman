import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  Icon,
} from '@patternfly/react-core';
import { UsersIcon } from '@patternfly/react-icons';
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
import NewExternalUsergroupModal from './NewExternalUsergroupModal';

const ExternalUsergroupsTab = ({ usergroupId }) => {
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiUrl = `/api/v2/usergroups/${usergroupId}/external_usergroups`;

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get(apiUrl);
      setGroups(data.results || []);
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRefresh = async id => {
    try {
      await API.put(`${apiUrl}/${id}/refresh`);
      fetchGroups();
    } catch {
      // refresh failed silently
    }
  };

  const handleDelete = id => {
    dispatch(
      openConfirmModal({
        title: __('Delete External User Group'),
        message: __(
          'Are you sure you want to delete this external user group?'
        ),
        confirmButtonText: __('Delete'),
        isWarning: true,
        onConfirm: async () => {
          await API.delete(`${apiUrl}/${id}`);
          fetchGroups();
        },
      })
    );
  };

  const handleCreate = async (name, authSourceId) => {
    await API.post(apiUrl, {
      external_usergroup: { name, auth_source_id: authSourceId },
    });
    setIsModalOpen(false);
    fetchGroups();
  };

  if (isLoading) {
    return null;
  }

  if (groups.length === 0) {
    return (
      <>
        <EmptyState
          titleText={__('External User Groups')}
          headingLevel="h4"
          icon={() => (
            <Icon size="xl">
              <UsersIcon />
            </Icon>
          )}
        >
          <p>
            {__(
              'No external user groups have been linked to this user group.'
            )}
          </p>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="primary"
                ouiaId="add-external-usergroup-button"
                onClick={() => setIsModalOpen(true)}
              >
                {__('Add External User Group')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
        <NewExternalUsergroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      </>
    );
  }

  return (
    <>
      <Table
        aria-label={__('External User Groups')}
        ouiaId="external-usergroups-table"
      >
        <Thead>
          <Tr>
            <Th>{__('Name')}</Th>
            <Th>{__('Auth Source')}</Th>
            <Th>{__('Actions')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {groups.map(group => (
            <Tr key={group.id}>
              <Td dataLabel={__('Name')}>{group.name}</Td>
              <Td dataLabel={__('Auth Source')}>
                {group.auth_source?.name || ''}
              </Td>
              <Td dataLabel={__('Actions')}>
                <Button
                  variant="secondary"
                  size="sm"
                  ouiaId={`refresh-external-usergroup-${group.id}`}
                  onClick={() => handleRefresh(group.id)}
                  className="pf-v6-u-mr-sm"
                >
                  {__('Refresh')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  ouiaId={`delete-external-usergroup-${group.id}`}
                  onClick={() => handleDelete(group.id)}
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
          ouiaId="add-external-usergroup-button"
          onClick={() => setIsModalOpen(true)}
        >
          {__('Add External User Group')}
        </Button>
      </div>
      <NewExternalUsergroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
};

ExternalUsergroupsTab.propTypes = {
  usergroupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default ExternalUsergroupsTab;
