import React, { useState, useEffect } from 'react';
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
  FormSelect,
  FormSelectOption,
  Alert,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import API from '../../../redux/API/API';

const NewExternalUsergroupModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [authSourceId, setAuthSourceId] = useState('');
  const [authSources, setAuthSources] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAuthSources = async () => {
      try {
        const { data } = await API.get(
          '/api/v2/auth_sources?per_page=all'
        );
        const sources = (data.results || []).filter(
          s => s.type !== 'AuthSourceInternal' && s.type !== 'AuthSourceHidden'
        );
        setAuthSources(sources);
      } catch {
        setAuthSources([]);
      }
    };
    fetchAuthSources();
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(name, authSourceId);
      setName('');
      setAuthSourceId('');
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
    setAuthSourceId('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="add-external-usergroup-title"
      variant="medium"
      ouiaId="add-external-usergroup-modal"
    >
      <ModalHeader
        title={__('Add External User Group')}
        labelId="add-external-usergroup-title"
      />
      <ModalBody>
        {error && (
          <Alert
            variant="danger"
            title={__('Error')}
            isInline
            className="pf-v6-u-mb-md"
          >
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup
            label={__('Name')}
            isRequired
            fieldId="external-usergroup-name"
          >
            <TextInput
              id="external-usergroup-name"
              value={name}
              onChange={(_event, val) => setName(val)}
              isRequired
              ouiaId="external-usergroup-name-input"
            />
          </FormGroup>
          <FormGroup
            label={__('Auth Source')}
            isRequired
            fieldId="external-usergroup-auth-source"
          >
            <FormSelect
              id="external-usergroup-auth-source"
              value={authSourceId}
              onChange={(_event, val) => setAuthSourceId(val)}
              isRequired
              ouiaId="external-usergroup-auth-source-select"
              aria-label={__('Auth Source')}
            >
              <FormSelectOption key="" value="" label={__('Select...')} />
              {authSources.map(src => (
                <FormSelectOption
                  key={src.id}
                  value={src.id}
                  label={src.name}
                />
              ))}
            </FormSelect>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isDisabled={!name || !authSourceId || isSubmitting}
          isLoading={isSubmitting}
          ouiaId="submit-external-usergroup-button"
        >
          {__('Submit')}
        </Button>
        <Button
          variant="link"
          onClick={handleClose}
          ouiaId="cancel-external-usergroup-button"
        >
          {__('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

NewExternalUsergroupModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default NewExternalUsergroupModal;
