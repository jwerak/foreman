import React, { useEffect } from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import Slot from '../../common/Slot';
import { useHostFormContext } from '../HostFormContext';

const HostTab = () => {
  const {
    values,
    errors,
    onChange,
    options,
    meta,
    isSubmitting,
    applyHostgroupDefaults,
    refreshTaxonomyOptions,
  } = useHostFormContext();

  useEffect(() => {
    if (values.hostgroup_id) {
      applyHostgroupDefaults(values.hostgroup_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.hostgroup_id]);

  useEffect(() => {
    if (values.organization_id || values.location_id) {
      refreshTaxonomyOptions(values.organization_id, values.location_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.organization_id, values.location_id]);

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

  const showComputeResource =
    meta.isNew || !!values.compute_resource_id;
  const isComputeResourceDisabled =
    !meta.isNew && !!values.compute_resource_id;
  const showComputeProfile =
    meta.isNew && !!values.compute_resource_id;

  return (
    <>
      <FormGroup
        label={__('Name')}
        isRequired
        fieldId="host-form-name"
      >
        <TextInput
          id="host-form-name"
          name="name"
          value={values.name || ''}
          onChange={(_event, val) => onChange('name', val)}
          isDisabled={isSubmitting}
          isRequired
          validated={errors.name ? 'error' : 'default'}
          aria-label={__('Name')}
        />
        {errors.name ? renderError('name') : renderHelp(
          __("This value is used also as the host's primary interface name.")
        )}
      </FormGroup>

      {meta.showOrganizationTab && (
        <FormGroup
          label={__('Organization')}
          fieldId="host-form-organization-id"
        >
          <FormSelect
            id="host-form-organization-id"
            value={values.organization_id || ''}
            onChange={(_event, val) => onChange('organization_id', val)}
            isDisabled={isSubmitting}
            aria-label={__('Organization')}
          >
            <FormSelectOption key="" value="" label="" />
            {(options.organizations || []).map(opt => (
              <FormSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </FormSelect>
          {renderError('organization_id')}
        </FormGroup>
      )}

      {meta.showLocationTab && (
        <FormGroup
          label={__('Location')}
          fieldId="host-form-location-id"
        >
          <FormSelect
            id="host-form-location-id"
            value={values.location_id || ''}
            onChange={(_event, val) => onChange('location_id', val)}
            isDisabled={isSubmitting}
            aria-label={__('Location')}
          >
            <FormSelectOption key="" value="" label="" />
            {(options.locations || []).map(opt => (
              <FormSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </FormSelect>
          {renderError('location_id')}
        </FormGroup>
      )}

      <FormGroup
        label={__('Host Group')}
        fieldId="host-form-hostgroup-id"
      >
        <FormSelect
          id="host-form-hostgroup-id"
          value={values.hostgroup_id || ''}
          onChange={(_event, val) => onChange('hostgroup_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Host Group')}
        >
          <FormSelectOption key="" value="" label="" />
          {(options.hostgroups || []).map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('hostgroup_id')}
      </FormGroup>

      {showComputeResource && (
        <FormGroup
          label={__('Deploy On')}
          fieldId="host-form-compute-resource-id"
        >
          <FormSelect
            id="host-form-compute-resource-id"
            value={values.compute_resource_id || ''}
            onChange={(_event, val) => onChange('compute_resource_id', val)}
            isDisabled={isSubmitting || isComputeResourceDisabled}
            aria-label={__('Deploy On')}
          >
            <FormSelectOption key="" value="" label={__('Bare Metal')} />
            {(options.computeResources || []).map(opt => (
              <FormSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </FormSelect>
          {renderError('compute_resource_id')}
        </FormGroup>
      )}

      {showComputeProfile && (
        <FormGroup
          label={__('Compute Profile')}
          fieldId="host-form-compute-profile-id"
        >
          <FormSelect
            id="host-form-compute-profile-id"
            value={values.compute_profile_id || ''}
            onChange={(_event, val) => onChange('compute_profile_id', val)}
            isDisabled={isSubmitting}
            aria-label={__('Compute Profile')}
          >
            <FormSelectOption key="" value="" label="" />
            {(options.computeProfiles || []).map(opt => (
              <FormSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </FormSelect>
          {renderError('compute_profile_id')}
        </FormGroup>
      )}

      <FormGroup
        label={__('Realm')}
        fieldId="host-form-realm-id"
      >
        <FormSelect
          id="host-form-realm-id"
          value={values.realm_id || ''}
          onChange={(_event, val) => onChange('realm_id', val)}
          isDisabled={isSubmitting}
          aria-label={__('Realm')}
        >
          <FormSelectOption key="" value="" label="" />
          {(options.realms || []).map(opt => (
            <FormSelectOption
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </FormSelect>
        {renderError('realm_id')}
      </FormGroup>

      <Slot id="host-form-main-fields" multi />
    </>
  );
};

export default HostTab;
