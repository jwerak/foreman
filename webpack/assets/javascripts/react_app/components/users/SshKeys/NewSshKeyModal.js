import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Alert,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';

const NewSshKeyModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(name, key);
      setName('');
      setKey('');
    } catch (err) {
      const msg =
        err?.response?.data?.error?.full_messages?.join(', ') ||
        err?.response?.data?.error?.message ||
        err.message;
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setKey('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="add-ssh-key-title"
      variant="medium"
      ouiaId="add-ssh-key-modal"
    >
      <ModalHeader title={__('Add SSH Key')} labelId="add-ssh-key-title" />
      <ModalBody>
        {error && (
          <Alert variant="danger" title={__('Error')} isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label={__('Name')} isRequired fieldId="ssh-key-name">
            <TextInput
              id="ssh-key-name"
              value={name}
              onChange={(_event, val) => setName(val)}
              isRequired
              ouiaId="ssh-key-name-input"
            />
          </FormGroup>
          <FormGroup label={__('Public Key')} isRequired fieldId="ssh-key-value">
            <TextArea
              id="ssh-key-value"
              value={key}
              onChange={(_event, val) => setKey(val)}
              isRequired
              rows={6}
              ouiaId="ssh-key-value-input"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isDisabled={!name || !key || isSubmitting}
          isLoading={isSubmitting}
          ouiaId="submit-ssh-key-button"
        >
          {__('Submit')}
        </Button>
        <Button variant="link" onClick={handleClose} ouiaId="cancel-ssh-key-button">
          {__('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

NewSshKeyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default NewSshKeyModal;
