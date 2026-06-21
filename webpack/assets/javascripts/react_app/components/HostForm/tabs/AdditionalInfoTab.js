import React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  FormSelect,
  FormSelectOption,
  Checkbox,
  TextArea,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import { useHostFormContext } from '../HostFormContext';

const AdditionalInfoTab = () => {
  const { values, errors, onChange, options, isSubmitting } =
    useHostFormContext();

  const renderError = fieldName =>
    errors[fieldName] && (
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant="error">{errors[fieldName]}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    );

  const ownerOptions = options.owners || [];
  const userOptions = ownerOptions.filter(o => o.group === 'Users');
  const usergroupOptions = ownerOptions.filter(o => o.group === 'Usergroups');

  const showModel = !values.compute_resource_id;

  return (
    <>
      <FormGroup
        label={__('Owned By')}
        fieldId="host-form-is-owned-by"
      >
        <FormSelect
          id="host-form-is-owned-by"
          value={values.is_owned_by || ''}
          onChange={(_event, val) => onChange('is_owned_by', val)}
          isDisabled={isSubmitting}
          aria-label={__('Owned By')}
        >
          <FormSelectOption key="" value="" label={__('Select an owner')} />
          {userOptions.length > 0 && (
            <optgroup label={__('Users')}>
              {userOptions.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </optgroup>
          )}
          {usergroupOptions.length > 0 && (
            <optgroup label={__('Usergroups')}>
              {usergroupOptions.map(opt => (
                <FormSelectOption
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </optgroup>
          )}
        </FormSelect>
        {renderError('is_owned_by')}
      </FormGroup>

      <FormGroup fieldId="host-form-enabled">
        <Checkbox
          id="host-form-enabled"
          name="enabled"
          label={__('Notifications enabled')}
          isChecked={!!values.enabled}
          onChange={(_event, checked) => onChange('enabled', checked)}
          isDisabled={isSubmitting}
          aria-label={__('Notifications enabled')}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {__(
                'Send email notifications when configuration errors are reported'
              )}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {renderError('enabled')}
      </FormGroup>

      {showModel && (
        <FormGroup
          label={__('Hardware Model')}
          fieldId="host-form-model-id"
        >
          <FormSelect
            id="host-form-model-id"
            value={values.model_id || ''}
            onChange={(_event, val) => onChange('model_id', val)}
            isDisabled={isSubmitting}
            aria-label={__('Hardware Model')}
          >
            <FormSelectOption key="" value="" label="" />
            {(options.models || []).map(opt => (
              <FormSelectOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            ))}
          </FormSelect>
          {renderError('model_id')}
        </FormGroup>
      )}

      <FormGroup
        label={__('Comment')}
        fieldId="host-form-comment"
      >
        <TextArea
          id="host-form-comment"
          name="comment"
          value={values.comment || ''}
          onChange={(_event, val) => onChange('comment', val)}
          isDisabled={isSubmitting}
          rows={3}
          resizeOrientation="vertical"
          aria-label={__('Comment')}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {__('Additional information about this host')}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {renderError('comment')}
      </FormGroup>
    </>
  );
};

export default AdditionalInfoTab;
