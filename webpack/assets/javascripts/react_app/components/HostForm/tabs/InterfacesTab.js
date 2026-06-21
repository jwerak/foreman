import React, { useState } from 'react';
import {
  Button,
  Content,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { translate as __ } from '../../../common/I18n';
import { useHostFormContext } from '../HostFormContext';
import InterfaceModal from '../InterfaceModal';

const NIC_TYPE_LABELS = {
  'Nic::Managed': __('Interface'),
  'Nic::BMC': __('BMC'),
  'Nic::Bond': __('Bond'),
  'Nic::Bridge': __('Bridge'),
};

const InterfacesTab = () => {
  const { values, onChange } = useHostFormContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const interfaces = values.interfaces_attributes || [];
  const visibleInterfaces = interfaces
    .map((nic, idx) => ({ ...nic, _originalIndex: idx }))
    .filter(nic => !nic._destroy);

  const handleAddInterface = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEditInterface = originalIndex => {
    setEditingIndex(originalIndex);
    setModalOpen(true);
  };

  const handleDeleteInterface = originalIndex => {
    const updated = interfaces.map((nic, idx) => {
      if (idx === originalIndex) {
        return { ...nic, _destroy: true };
      }
      return nic;
    });
    onChange('interfaces_attributes', updated);
  };

  const handleSave = nicData => {
    const updated = [...interfaces];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...updated[editingIndex], ...nicData };
    } else {
      updated.push({ ...nicData, _destroy: false });
    }
    onChange('interfaces_attributes', updated);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
  };

  const columns = [
    __('Identifier'),
    __('Type'),
    __('MAC Address'),
    __('IPv4 Address'),
    __('IPv6 Address'),
    __('FQDN'),
    __('Actions'),
  ];

  return (
    <>
      <Content component="p" className="pf-v6-u-mb-md">
        {__('Manage network interfaces for this host.')}
      </Content>

      <Table aria-label={__('Interfaces')} ouiaId="interfaces-table">
        <Thead>
          <Tr>
            {columns.map(col => (
              <Th key={col}>{col}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {visibleInterfaces.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length}>
                <Content component="p">
                  {__('No interfaces defined. Click "Add Interface" to create one.')}
                </Content>
              </Td>
            </Tr>
          ) : (
            visibleInterfaces.map(nic => (
              <Tr key={nic._originalIndex}>
                <Td dataLabel={__('Identifier')}>
                  {nic.identifier || ''}
                </Td>
                <Td dataLabel={__('Type')}>
                  {NIC_TYPE_LABELS[nic.type] || nic.type || ''}
                </Td>
                <Td dataLabel={__('MAC Address')}>
                  {nic.mac || ''}
                </Td>
                <Td dataLabel={__('IPv4 Address')}>
                  {nic.ip || ''}
                </Td>
                <Td dataLabel={__('IPv6 Address')}>
                  {nic.ip6 || ''}
                </Td>
                <Td dataLabel={__('FQDN')}>
                  {nic.name || ''}
                </Td>
                <Td dataLabel={__('Actions')}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditInterface(nic._originalIndex)}
                    ouiaId={`edit-interface-${nic._originalIndex}`}
                  >
                    {__('Edit')}
                  </Button>{' '}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteInterface(nic._originalIndex)}
                    ouiaId={`delete-interface-${nic._originalIndex}`}
                  >
                    {__('Delete')}
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <div className="pf-v6-u-mt-md">
        <Button
          variant="primary"
          onClick={handleAddInterface}
          ouiaId="add-interface-button"
        >
          {__('Add Interface')}
        </Button>
      </div>

      <InterfaceModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingIndex !== null ? interfaces[editingIndex] : null}
      />
    </>
  );
};

export default InterfacesTab;
