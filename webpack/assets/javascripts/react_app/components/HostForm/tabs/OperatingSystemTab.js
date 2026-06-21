import React, { useState, useEffect } from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  FormSelect,
  FormSelectOption,
  Radio,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import API from '../../../redux/API/API';
import { useHostFormContext } from '../HostFormContext';

const PXE_LOADER_OPTIONS = [
  { value: '', label: '' },
  { value: 'None', label: 'None' },
  { value: 'PXELinux BIOS', label: 'PXELinux BIOS' },
  { value: 'PXELinux UEFI', label: 'PXELinux UEFI' },
  { value: 'Grub2 UEFI', label: 'Grub2 UEFI' },
  { value: 'Grub2 UEFI SecureBoot', label: 'Grub2 UEFI SecureBoot' },
  { value: 'iPXE Embedded', label: 'iPXE Embedded' },
  { value: 'iPXE UEFI HTTP', label: 'iPXE UEFI HTTP' },
  { value: 'iPXE Chain BIOS', label: 'iPXE Chain BIOS' },
  { value: 'iPXE Chain UEFI', label: 'iPXE Chain UEFI' },
];

const OperatingSystemTab = () => {
  const { values, errors, onChange, options, meta, isSubmitting } =
    useHostFormContext();

  const [localOptions, setLocalOptions] = useState({
    operatingsystems: [],
    media: [],
    ptables: [],
  });

  const renderError = fieldName =>
    errors[fieldName] && (
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant="error">{errors[fieldName]}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    );

  const renderHelp = text => (
    <FormHelperText>
      <HelperText>
        <HelperTextItem>{text}</HelperTextItem>
      </HelperText>
    </FormHelperText>
  );

  // When architecture changes, fetch available OSes
  useEffect(() => {
    if (!values.architecture_id) return;
    const fetchOSes = async () => {
      try {
        const { data } = await API.get('/api/v2/operatingsystems', {}, {
          per_page: 'all',
          search: `architecture_id=${values.architecture_id}`,
        });
        setLocalOptions(prev => ({
          ...prev,
          operatingsystems: (data.results || []).map(os => ({
            value: os.id,
            label: os.title,
          })),
        }));
      } catch (err) {
        /* ignore */
      }
    };
    fetchOSes();
  }, [values.architecture_id]);

  // When OS changes, fetch available media and ptables
  useEffect(() => {
    if (!values.operatingsystem_id) return;
    const fetchOSDetails = async () => {
      try {
        const { data } = await API.get(
          `/api/v2/operatingsystems/${values.operatingsystem_id}`
        );
        setLocalOptions(prev => ({
          ...prev,
          media: (data.media || []).map(m => ({
            value: m.id,
            label: m.name,
          })),
          ptables: (data.ptables || []).map(pt => ({
            value: pt.id,
            label: pt.name,
          })),
        }));
      } catch (err) {
        /* ignore */
      }
    };
    fetchOSDetails();
  }, [values.operatingsystem_id]);

  const showProvisionMethod =
    meta.capabilities && meta.capabilities.length > 1;

  return (
    <>
      <FormGroup
        label={__('Architecture')}
        fieldId="host-form-architecture-id"
      >
        <FormSelect
          id="host-form-architecture-id"
          value={values.architecture_id || ''}
          onChange={(_event, val) => onChange('architecture_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Architecture')}
        >
          <FormSelectOption key="" value="" label="" />
          {(options.architectures || []).map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('architecture_id')}
      </FormGroup>

      <FormGroup
        label={__('Operating System')}
        fieldId="host-form-operatingsystem-id"
      >
        <FormSelect
          id="host-form-operatingsystem-id"
          value={values.operatingsystem_id || ''}
          onChange={(_event, val) => onChange('operatingsystem_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Operating System')}
        >
          <FormSelectOption key="" value="" label="" />
          {localOptions.operatingsystems.map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('operatingsystem_id')}
      </FormGroup>

      <FormGroup
        label={__('Partition Table')}
        fieldId="host-form-ptable-id"
      >
        <FormSelect
          id="host-form-ptable-id"
          value={values.ptable_id || ''}
          onChange={(_event, val) => onChange('ptable_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Partition Table')}
        >
          <FormSelectOption key="" value="" label="" />
          {localOptions.ptables.map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('ptable_id')}
      </FormGroup>

      <FormGroup
        label={__('Installation Media')}
        fieldId="host-form-medium-id"
      >
        <FormSelect
          id="host-form-medium-id"
          value={values.medium_id || ''}
          onChange={(_event, val) => onChange('medium_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Installation Media')}
        >
          <FormSelectOption key="" value="" label="" />
          {localOptions.media.map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('medium_id')}
      </FormGroup>

      <FormGroup
        label={__('PXE Loader')}
        fieldId="host-form-pxe-loader"
      >
        <FormSelect
          id="host-form-pxe-loader"
          value={values.pxe_loader || ''}
          onChange={(_event, val) => onChange('pxe_loader', val)}
          isDisabled={isSubmitting}
          aria-label={__('PXE Loader')}
        >
          {PXE_LOADER_OPTIONS.map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('pxe_loader')}
      </FormGroup>

      {showProvisionMethod && (
        <FormGroup
          label={__('Provision Method')}
          fieldId="host-form-provision-method"
        >
          <Radio
            id="host-form-provision-method-build"
            name="provision_method"
            label={__('Build')}
            isChecked={values.provision_method === 'build'}
            onChange={() => onChange('provision_method', 'build')}
            isDisabled={isSubmitting}
          />
          <Radio
            id="host-form-provision-method-image"
            name="provision_method"
            label={__('Image')}
            isChecked={values.provision_method === 'image'}
            onChange={() => onChange('provision_method', 'image')}
            isDisabled={isSubmitting}
          />
          {renderError('provision_method')}
        </FormGroup>
      )}

      <FormGroup
        label={__('Root Password')}
        isRequired
        fieldId="host-form-root-pass"
      >
        <TextInput
          id="host-form-root-pass"
          name="root_pass"
          type="password"
          value={values.root_pass || ''}
          onChange={(_event, val) => onChange('root_pass', val)}
          isDisabled={isSubmitting}
          isRequired
          validated={errors.root_pass ? 'error' : 'default'}
          aria-label={__('Root Password')}
        />
        {errors.root_pass
          ? renderError('root_pass')
          : renderHelp(__('Password must be 8 characters or more.'))}
      </FormGroup>
    </>
  );
};

export default OperatingSystemTab;
