import PropTypes from 'prop-types';
import React from 'react';
import {
	Title,
	TitleSizes,
	Modal,
	ModalBody,
	ModalHeader
} from '@patternfly/react-core';
import StatusTable from './StatusTable';
import { translate as __ } from '../../../common/I18n';
import { noop } from '../../../common/helpers';

const StatusModal = ({
  isOpen,
  onClose,
  statuses,
  hostName,
  canForgetStatuses,
}) => {
  const header = (
    <>
      <Title
        ouiaId="statuses-modal-title"
        id="statuses-modal-header"
        headingLevel="h1"
        size={TitleSizes['2xl']}
      >
        {__('Manage host statuses')}
      </Title>
    </>
  );

  return (
    <Modal
      ouiaId="statuses-modal"
      width="50%"
      aria-labelledby="statuses-modal-header"
      isOpen={isOpen}
      onClose={onClose}
      appendTo={document.body}
    >
      <ModalHeader labelId="statuses-modal-header">
        {header}
      </ModalHeader>
      <ModalBody>
        <br />
        <StatusTable
          canForgetStatuses={canForgetStatuses}
          statuses={statuses}
          hostName={hostName}
        />
      </ModalBody>
    </Modal>
  );
};

StatusModal.propTypes = {
  hostName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  statuses: PropTypes.arrayOf(PropTypes.object),
  canForgetStatuses: PropTypes.bool,
};

StatusModal.defaultProps = {
  isOpen: false,
  onClose: noop,
  statuses: [],
  canForgetStatuses: undefined,
};

export default StatusModal;
