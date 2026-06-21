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
  Checkbox,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';
import API from '../../redux/API/API';

const NIC_TYPES = [
  { value: 'Nic::Managed', label: __('Interface') },
  { value: 'Nic::BMC', label: __('BMC') },
  { value: 'Nic::Bond', label: __('Bond') },
  { value: 'Nic::Bridge', label: __('Bridge') },
];

const EMPTY_NIC = {
  identifier: '',
  type: 'Nic::Managed',
  mac: '',
  domain_id: '',
  subnet_id: '',
  subnet6_id: '',
  ip: '',
  ip6: '',
  managed: true,
  primary: false,
  provision: false,
  virtual: false,
  attached_to: '',
  tag: '',
};

const InterfaceModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [nicValues, setNicValues] = useState({ ...EMPTY_NIC });
  const [domainOptions, setDomainOptions] = useState([]);
  const [subnetOptions, setSubnetOptions] = useState([]);
  const [subnet6Options, setSubnet6Options] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNicValues(initialData ? { ...EMPTY_NIC, ...initialData } : { ...EMPTY_NIC });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const fetchDomains = async () => {
      try {
        const { data } = await API.get('/api/v2/domains', {}, { per_page: 'all' });
        if (!cancelled) {
          setDomainOptions(
            (data.results || []).map(d => ({ value: d.id, label: d.name }))
          );
        }
      } catch (_err) { /* ignore */ }
    };
    fetchDomains();
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!nicValues.domain_id) {
      setSubnetOptions([]);
      setSubnet6Options([]);
      return;
    }
    let cancelled = false;
    const fetchSubnets = async () => {
      try {
        const [ipv4Res, ipv6Res] = await Promise.all([
          API.get('/api/v2/subnets', {}, {
            per_page: 'all',
            search: `domain_id=${nicValues.domain_id} and type=Subnet::Ipv4`,
          }),
          API.get('/api/v2/subnets', {}, {
            per_page: 'all',
            search: `domain_id=${nicValues.domain_id} and type=Subnet::Ipv6`,
          }),
        ]);
        if (!cancelled) {
          setSubnetOptions(
            (ipv4Res.data.results || []).map(s => ({
              value: s.id,
              label: s.to_label || s.name,
            }))
          );
          setSubnet6Options(
            (ipv6Res.data.results || []).map(s => ({
              value: s.id,
              label: s.to_label || s.name,
            }))
          );
        }
      } catch (_err) { /* ignore */ }
    };
    fetchSubnets();
    return () => { cancelled = true; };
  }, [nicValues.domain_id]);

  const handleChange = (field, value) => {
    setNicValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(nicValues);
    onClose();
  };

  const isEditing = initialData && initialData.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="medium"
      ouiaId="interface-modal"
    >
      <ModalHeader
        title={isEditing ? __('Edit Interface') : __('Add Interface')}
      />
      <ModalBody>
        <Form isHorizontal>
          <FormGroup
            label={__('Identifier')}
            fieldId="nic-identifier"
          >
            <TextInput
              id="nic-identifier"
              value={nicValues.identifier || ''}
              onChange={(_event, val) => handleChange('identifier', val)}
              aria-label={__('Identifier')}
            />
          </FormGroup>

          <FormGroup
            label={__('Type')}
            fieldId="nic-type"
          >
            <FormSelect
              id="nic-type"
              value={nicValues.type || 'Nic::Managed'}
              onChange={(_event, val) => handleChange('type', val)}
              aria-label={__('Type')}
            >
              {NIC_TYPES.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup
            label={__('MAC Address')}
            fieldId="nic-mac"
          >
            <TextInput
              id="nic-mac"
              value={nicValues.mac || ''}
              onChange={(_event, val) => handleChange('mac', val)}
              aria-label={__('MAC Address')}
            />
          </FormGroup>

          <FormGroup
            label={__('Domain')}
            fieldId="nic-domain-id"
          >
            <FormSelect
              id="nic-domain-id"
              value={nicValues.domain_id || ''}
              onChange={(_event, val) => handleChange('domain_id', val)}
              aria-label={__('Domain')}
            >
              <FormSelectOption key="" value="" label="" />
              {domainOptions.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup
            label={__('IPv4 Subnet')}
            fieldId="nic-subnet-id"
          >
            <FormSelect
              id="nic-subnet-id"
              value={nicValues.subnet_id || ''}
              onChange={(_event, val) => handleChange('subnet_id', val)}
              aria-label={__('IPv4 Subnet')}
            >
              <FormSelectOption key="" value="" label="" />
              {subnetOptions.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup
            label={__('IPv6 Subnet')}
            fieldId="nic-subnet6-id"
          >
            <FormSelect
              id="nic-subnet6-id"
              value={nicValues.subnet6_id || ''}
              onChange={(_event, val) => handleChange('subnet6_id', val)}
              aria-label={__('IPv6 Subnet')}
            >
              <FormSelectOption key="" value="" label="" />
              {subnet6Options.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup
            label={__('IPv4 Address')}
            fieldId="nic-ip"
          >
            <TextInput
              id="nic-ip"
              value={nicValues.ip || ''}
              onChange={(_event, val) => handleChange('ip', val)}
              aria-label={__('IPv4 Address')}
            />
          </FormGroup>

          <FormGroup
            label={__('IPv6 Address')}
            fieldId="nic-ip6"
          >
            <TextInput
              id="nic-ip6"
              value={nicValues.ip6 || ''}
              onChange={(_event, val) => handleChange('ip6', val)}
              aria-label={__('IPv6 Address')}
            />
          </FormGroup>

          <FormGroup fieldId="nic-managed">
            <Checkbox
              id="nic-managed"
              label={__('Managed')}
              isChecked={!!nicValues.managed}
              onChange={(_event, checked) => handleChange('managed', checked)}
              aria-label={__('Managed')}
            />
          </FormGroup>

          <FormGroup fieldId="nic-primary">
            <Checkbox
              id="nic-primary"
              label={__('Primary')}
              isChecked={!!nicValues.primary}
              onChange={(_event, checked) => handleChange('primary', checked)}
              aria-label={__('Primary')}
            />
          </FormGroup>

          <FormGroup fieldId="nic-provision">
            <Checkbox
              id="nic-provision"
              label={__('Provisioning')}
              isChecked={!!nicValues.provision}
              onChange={(_event, checked) => handleChange('provision', checked)}
              aria-label={__('Provisioning')}
            />
          </FormGroup>

          <FormGroup fieldId="nic-virtual">
            <Checkbox
              id="nic-virtual"
              label={__('Virtual')}
              isChecked={!!nicValues.virtual}
              onChange={(_event, checked) => handleChange('virtual', checked)}
              aria-label={__('Virtual')}
            />
          </FormGroup>

          {nicValues.virtual && (
            <>
              <FormGroup
                label={__('Attached to')}
                fieldId="nic-attached-to"
              >
                <TextInput
                  id="nic-attached-to"
                  value={nicValues.attached_to || ''}
                  onChange={(_event, val) => handleChange('attached_to', val)}
                  aria-label={__('Attached to')}
                />
              </FormGroup>

              <FormGroup
                label={__('VLAN tag')}
                fieldId="nic-tag"
              >
                <TextInput
                  id="nic-tag"
                  value={nicValues.tag || ''}
                  onChange={(_event, val) => handleChange('tag', val)}
                  aria-label={__('VLAN tag')}
                />
              </FormGroup>
            </>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSave}
          ouiaId="interface-modal-ok"
        >
          {__('OK')}
        </Button>
        <Button
          variant="link"
          onClick={onClose}
          ouiaId="interface-modal-cancel"
        >
          {__('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

InterfaceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

InterfaceModal.defaultProps = {
  initialData: null,
};

export default InterfaceModal;
