import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { addToast } from '../../../ToastsList/slice';
import { translate as __ } from '../../../../common/I18n';
import { failedHostsToastParams } from '../helpers';
import { STATUS } from '../../../../constants';
import { selectAPIStatus } from '../../../../redux/API/APISelectors';
import { bulkRebuildConfig, BULK_REBUILD_CONFIG_KEY } from './actions';

const BulkRebuildConfigModal = ({
  isOpen,
  closeModal,
  selectedCount,
  fetchBulkParams,
}) => {
  const dispatch = useDispatch();
  const rebuildStatus = useSelector(state =>
    selectAPIStatus(state, BULK_REBUILD_CONFIG_KEY)
  );

  const handleError = ({ response }) => {
    closeModal();
    dispatch(
      addToast(
        failedHostsToastParams({
          ...response.data.error,
          key: BULK_REBUILD_CONFIG_KEY,
        })
      )
    );
  };

  const handleSave = () => {
    const requestBody = {
      included: {
        search: fetchBulkParams(),
      },
      rebuild_configuration: true,
    };

    dispatch(bulkRebuildConfig(requestBody, closeModal, handleError));
  };

  const modalActions = [
    <Button
      key="add"
      ouiaId="bulk-rebuild-config-modal-confirm-button"
      variant="primary"
      onClick={handleSave}
      isDisabled={rebuildStatus === STATUS.PENDING}
      isLoading={rebuildStatus === STATUS.PENDING}
    >
      {__('Confirm')}
    </Button>,
    <Button
      key="cancel"
      ouiaId="bulk-rebuild-config-modal-cancel-button"
      variant="link"
      onClick={closeModal}
    >
      {__('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      onEscapePress={closeModal}
      width="50%"
      position="top"
      id="bulk-rebuild-config-modal"
      key="bulk-rebuild-config-modal"
      ouiaId="bulk-rebuild-config-modal"
      aria-labelledby="bulk-rebuild-config-modal-title"
    >
      <ModalHeader
        title={__('Rebuild config')}
        labelId="bulk-rebuild-config-modal-title"
      />
      <ModalBody>
        <Content>
          <Content component="p" ouiaId="bulk-rebuild-config-description">
            <FormattedMessage
              defaultMessage={__(
                'Rebuild orchestration configuration for {hosts}.'
              )}
              values={{
                hosts: (
                  <strong>
                    <FormattedMessage
                      defaultMessage="{count, plural, one {# {singular}} other {# {plural}}}"
                      values={{
                        count: selectedCount,
                        singular: __('selected host'),
                        plural: __('selected hosts'),
                      }}
                      id="bulk-rebuild-config-selected-hosts"
                    />
                  </strong>
                ),
              }}
              id="bulk-rebuild-config-description"
            />
          </Content>
        </Content>
      </ModalBody>
      <ModalFooter>{modalActions}</ModalFooter>
    </Modal>
  );
};

BulkRebuildConfigModal.propTypes = {
  isOpen: PropTypes.bool,
  closeModal: PropTypes.func,
  selectedCount: PropTypes.number.isRequired,
  fetchBulkParams: PropTypes.func.isRequired,
};

BulkRebuildConfigModal.defaultProps = {
  isOpen: false,
  closeModal: () => {},
};

export default BulkRebuildConfigModal;
