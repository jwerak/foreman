import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ForemanActionsBarContext } from '../../../../components/HostDetails/ActionsBar';
import BulkEditParametersModal from './BulkEditParametersModal';

const BulkEditParametersModalScene = ({ isOpen, closeModal }) => {
  const { selectedCount, fetchBulkParams } = useContext(
    ForemanActionsBarContext
  );
  return (
    <BulkEditParametersModal
      key="bulk-edit-parameters-modal"
      selectedCount={selectedCount}
      fetchBulkParams={fetchBulkParams}
      isOpen={isOpen}
      closeModal={closeModal}
    />
  );
};

export default BulkEditParametersModalScene;

BulkEditParametersModalScene.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};
