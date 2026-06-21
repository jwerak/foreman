import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Content,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { addToast } from '../../../ToastsList/slice';
import { translate as __ } from '../../../../common/I18n';
import { failedHostsToastParams } from '../helpers';
import { STATUS } from '../../../../constants';
import { selectAPIStatus } from '../../../../redux/API/APISelectors';
import { bulkUpdateParameters, BULK_UPDATE_PARAMETERS_KEY } from './actions';

const emptyRow = () => ({ name: '', value: '', key: Date.now() });

const BulkEditParametersModal = ({
  isOpen,
  closeModal,
  selectedCount,
  fetchBulkParams,
}) => {
  const dispatch = useDispatch();
  const [parameterRows, setParameterRows] = useState([emptyRow()]);
  const updateStatus = useSelector(state =>
    selectAPIStatus(state, BULK_UPDATE_PARAMETERS_KEY)
  );

  const handleModalClose = () => {
    setParameterRows([emptyRow()]);
    closeModal();
  };

  const handleError = ({ response }) => {
    handleModalClose();
    dispatch(
      addToast(
        failedHostsToastParams({
          ...response.data.error,
          key: BULK_UPDATE_PARAMETERS_KEY,
        })
      )
    );
  };

  const handleSave = () => {
    const validRows = parameterRows.filter(
      row => row.name.trim() !== '' && row.value.trim() !== ''
    );
    if (validRows.length === 0) return;

    const requestBody = {
      included: {
        search: fetchBulkParams(),
      },
      parameters: validRows.map(row => ({
        name: row.name.trim(),
        value: row.value.trim(),
      })),
    };

    dispatch(
      bulkUpdateParameters(requestBody, handleModalClose, handleError)
    );
  };

  const addRow = () => {
    setParameterRows(prev => [...prev, emptyRow()]);
  };

  const removeRow = index => {
    setParameterRows(prev => {
      if (prev.length <= 1) return [emptyRow()];
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateRow = (index, field, val) => {
    setParameterRows(prev =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  };

  const hasValidRows = parameterRows.some(
    row => row.name.trim() !== '' && row.value.trim() !== ''
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      onEscapePress={handleModalClose}
      width="50%"
      position="top"
      id="bulk-edit-parameters-modal"
      key="bulk-edit-parameters-modal"
      ouiaId="bulk-edit-parameters-modal"
      aria-labelledby="bulk-edit-parameters-modal-title"
    >
      <ModalHeader
        title={__('Edit parameters')}
        labelId="bulk-edit-parameters-modal-title"
      />
      <ModalBody>
        <Content>
          <Content component="p" ouiaId="bulk-edit-parameters-description">
            <FormattedMessage
              defaultMessage={__(
                'Update parameters for {hosts}. Only existing host parameters will be updated; parameters not found on a host will be skipped.'
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
                      id="bulk-edit-parameters-selected-hosts"
                    />
                  </strong>
                ),
              }}
              id="bulk-edit-parameters-description-msg"
            />
          </Content>
        </Content>
        <hr />
        {parameterRows.map((row, index) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
              marginBottom: '8px',
            }}
          >
            <FormGroup
              label={index === 0 ? __('Name') : undefined}
              fieldId={`param-name-${index}`}
              style={{ flex: 1 }}
            >
              <TextInput
                id={`param-name-${index}`}
                ouiaId={`param-name-${index}`}
                value={row.name}
                onChange={(_event, val) => updateRow(index, 'name', val)}
                placeholder={__('Parameter name')}
              />
            </FormGroup>
            <FormGroup
              label={index === 0 ? __('Value') : undefined}
              fieldId={`param-value-${index}`}
              style={{ flex: 1 }}
            >
              <TextInput
                id={`param-value-${index}`}
                ouiaId={`param-value-${index}`}
                value={row.value}
                onChange={(_event, val) => updateRow(index, 'value', val)}
                placeholder={__('Parameter value')}
              />
            </FormGroup>
            <Button
              variant="plain"
              ouiaId={`remove-param-row-${index}`}
              onClick={() => removeRow(index)}
              aria-label={__('Remove parameter row')}
              style={index === 0 ? { marginBottom: '0' } : undefined}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        <Button
          variant="link"
          ouiaId="add-parameter-row-button"
          onClick={addRow}
        >
          {__('Add parameter')}
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          ouiaId="bulk-edit-parameters-modal-save-button"
          variant="primary"
          onClick={handleSave}
          isDisabled={!hasValidRows || updateStatus === STATUS.PENDING}
          isLoading={updateStatus === STATUS.PENDING}
        >
          {__('Save')}
        </Button>
        <Button
          key="cancel"
          ouiaId="bulk-edit-parameters-modal-cancel-button"
          variant="link"
          onClick={handleModalClose}
        >
          {__('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

BulkEditParametersModal.propTypes = {
  isOpen: PropTypes.bool,
  closeModal: PropTypes.func,
  selectedCount: PropTypes.number.isRequired,
  fetchBulkParams: PropTypes.func.isRequired,
};

BulkEditParametersModal.defaultProps = {
  isOpen: false,
  closeModal: () => {},
};

export default BulkEditParametersModal;
