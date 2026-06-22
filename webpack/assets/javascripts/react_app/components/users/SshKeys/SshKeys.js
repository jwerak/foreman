import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  Icon,
} from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
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
import NewSshKeyModal from './NewSshKeyModal';

const SshKeys = ({ userId }) => {
  const dispatch = useDispatch();
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiUrl = `/api/v2/users/${userId}/ssh_keys`;

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get(apiUrl);
      setKeys(data.results || []);
    } catch {
      setKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleDelete = id => {
    dispatch(
      openConfirmModal({
        title: __('Delete SSH key'),
        message: __('Are you sure you want to delete this SSH key?'),
        confirmButtonText: __('Delete'),
        isWarning: true,
        onConfirm: async () => {
          await API.delete(`${apiUrl}/${id}`);
          fetchKeys();
        },
      })
    );
  };

  const handleCreate = async (name, key) => {
    await API.post(apiUrl, { ssh_key: { name, key } });
    setIsModalOpen(false);
    fetchKeys();
  };

  if (isLoading) {
    return null;
  }

  if (keys.length === 0) {
    return (
      <>
        <EmptyState
          titleText={__('SSH Keys')}
          headingLevel="h4"
          icon={() => (
            <Icon size="xl">
              <KeyIcon />
            </Icon>
          )}
        >
          <p>
            {__(
              'You can add SSH public keys to a user in Foreman.'
            )}
          </p>
          <p>
            {__(
              'The keys can be used in provisioning templates and are also available for configuration management tools managed by Foreman.'
            )}
          </p>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="primary"
                ouiaId="add-ssh-key-button"
                onClick={() => setIsModalOpen(true)}
              >
                {__('Add SSH Key')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
        <NewSshKeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      </>
    );
  }

  return (
    <>
      <Table aria-label={__('SSH Keys')} ouiaId="ssh-keys-table">
        <Thead>
          <Tr>
            <Th>{__('Name')}</Th>
            <Th>{__('Fingerprint')}</Th>
            <Th>{__('Length')}</Th>
            <Th>{__('Created')}</Th>
            <Th>{__('Actions')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {keys.map(sshKey => (
            <Tr key={sshKey.id}>
              <Td dataLabel={__('Name')}>{sshKey.name}</Td>
              <Td dataLabel={__('Fingerprint')}>{sshKey.fingerprint}</Td>
              <Td dataLabel={__('Length')}>{sshKey.length}</Td>
              <Td dataLabel={__('Created')}>
                {new Date(sshKey.created_at).toLocaleDateString()}
              </Td>
              <Td dataLabel={__('Actions')}>
                <Button
                  variant="danger"
                  size="sm"
                  ouiaId={`delete-ssh-key-${sshKey.id}`}
                  onClick={() => handleDelete(sshKey.id)}
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
          ouiaId="add-ssh-key-button"
          onClick={() => setIsModalOpen(true)}
        >
          {__('Add SSH Key')}
        </Button>
      </div>
      <NewSshKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
};

SshKeys.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SshKeys;
