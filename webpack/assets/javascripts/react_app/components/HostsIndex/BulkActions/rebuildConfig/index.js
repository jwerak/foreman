import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ForemanActionsBarContext } from '../../../../components/HostDetails/ActionsBar';
import BulkRebuildConfigModal from './BulkRebuildConfigModal';

const BulkRebuildConfigModalScene = ({ isOpen, closeModal }) => {
  const { selectedCount, fetchBulkParams } = useContext(
    ForemanActionsBarContext
  );
  return (
    <BulkRebuildConfigModal
      key="bulk-rebuild-config-modal"
      selectedCount={selectedCount}
      fetchBulkParams={fetchBulkParams}
      isOpen={isOpen}
      closeModal={closeModal}
    />
  );
};

export default BulkRebuildConfigModalScene;

BulkRebuildConfigModalScene.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};
