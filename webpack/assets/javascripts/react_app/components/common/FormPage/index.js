import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  FormSection,
  TextInput,
  TextArea,
  FormSelect,
  FormSelectOption,
  Checkbox,
  ActionGroup,
  Button,
  Alert,
  Spinner,
  Popover,
  Icon,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { translate as __ } from '../../../common/I18n';
import useFormData from './useFormData';

const FormFieldInput = ({ field, value, error, onChange, isSubmitting }) => {
  const validated = error ? 'error' : 'default';
  const fieldId = `form-field-${field.name}`;

  switch (field.type) {
    case 'textarea':
      return (
        <TextArea
          id={fieldId}
          name={field.name}
          value={value || ''}
          onChange={(_event, val) => onChange(field.name, val)}
          isDisabled={field.disabled || isSubmitting}
          isRequired={field.required}
          validated={validated}
          placeholder={field.placeholder}
          resizeOrientation="vertical"
          rows={field.rows || 5}
          aria-label={field.label}
        />
      );

    case 'select':
      return (
        <FormSelect
          id={fieldId}
          name={field.name}
          value={value || ''}
          onChange={(_event, val) => onChange(field.name, val)}
          isDisabled={field.disabled || isSubmitting}
          isRequired={field.required}
          validated={validated}
          aria-label={field.label}
        >
          {!field.required && (
            <FormSelectOption key="" value="" label="" />
          )}
          {(field.options || []).map(opt => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <FormSelectOption
                key={optValue}
                value={optValue}
                label={optLabel}
              />
            );
          })}
        </FormSelect>
      );

    case 'checkbox':
      return (
        <Checkbox
          id={fieldId}
          name={field.name}
          label={field.checkboxLabel || field.label}
          isChecked={!!value}
          onChange={(_event, checked) => onChange(field.name, checked)}
          isDisabled={field.disabled || isSubmitting}
          aria-label={field.label}
        />
      );

    case 'password':
      return (
        <TextInput
          id={fieldId}
          type="password"
          name={field.name}
          value={value || ''}
          onChange={(_event, val) => onChange(field.name, val)}
          isDisabled={field.disabled || isSubmitting}
          isRequired={field.required}
          validated={validated}
          placeholder={field.placeholder}
          aria-label={field.label}
        />
      );

    default:
      return (
        <TextInput
          id={fieldId}
          type={field.type || 'text'}
          name={field.name}
          value={value ?? ''}
          onChange={(_event, val) => onChange(field.name, val)}
          isDisabled={field.disabled || isSubmitting}
          isRequired={field.required}
          validated={validated}
          placeholder={field.placeholder}
          aria-label={field.label}
        />
      );
  }
};

FormFieldInput.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    helpText: PropTypes.string,
    options: PropTypes.array,
    checkboxLabel: PropTypes.string,
    rows: PropTypes.number,
  }).isRequired,
  value: PropTypes.any,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

FormFieldInput.defaultProps = {
  value: '',
  error: null,
  isSubmitting: false,
};

const FormPage = ({
  apiUrl,
  title,
  fields,
  resourceId,
  cancelUrl,
  submitLabel,
  resourceName,
  onSubmitSuccess,
}) => {
  const {
    values,
    errors,
    submitErrors,
    isLoading,
    isSubmitting,
    isEdit,
    onChange,
    onSubmit,
  } = useFormData({ apiUrl, resourceId, fields, resourceName });

  const handleSubmit = async e => {
    const result = await onSubmit(e);
    if (result.success) {
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else if (cancelUrl) {
        window.location.href = cancelUrl;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pf-v6-c-page__main-section pf-m-light form-page-loading">
        <Spinner size="xl" aria-label={__('Loading form data')} />
      </div>
    );
  }

  const sections = {};
  const unsectionedFields = [];
  fields.forEach(field => {
    if (field.section) {
      if (!sections[field.section]) sections[field.section] = [];
      sections[field.section].push(field);
    } else {
      unsectionedFields.push(field);
    }
  });

  const renderField = field => {
    if (field.type === 'hidden') return null;

    if (field.type === 'checkbox') {
      return (
        <FormGroup key={field.name} fieldId={`form-field-${field.name}`}>
          <FormFieldInput
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={onChange}
            isSubmitting={isSubmitting}
          />
          {errors[field.name] && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">
                  {errors[field.name]}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      );
    }

    return (
      <FormGroup
        key={field.name}
        label={field.label}
        isRequired={field.required}
        fieldId={`form-field-${field.name}`}
        labelHelp={
          field.labelHelp ? (
            <Popover
              bodyContent={<React.Fragment>{field.labelHelp}</React.Fragment>}
            >
              <Button
                icon={
                  <Icon isInline>
                    <HelpIcon />
                  </Icon>
                }
                type="button"
                variant="plain"
                onClick={e => e.preventDefault()}
                aria-label={`${field.label} help`}
              />
            </Popover>
          ) : undefined
        }
      >
        <FormFieldInput
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={onChange}
          isSubmitting={isSubmitting}
        />
        {(errors[field.name] || field.helpText) && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem
                variant={errors[field.name] ? 'error' : 'default'}
              >
                {errors[field.name] || field.helpText}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    );
  };

  return (
    <div className="pf-v6-c-page__main-section pf-m-light">
      <Form isWidthLimited onSubmit={handleSubmit}>
        {submitErrors && (
          <Alert
            variant="danger"
            title={__('Unable to save')}
            isInline
            ouiaId="form-submit-error"
          >
            {submitErrors.length === 1 ? (
              <span>{submitErrors[0]}</span>
            ) : (
              <ul>
                {submitErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        {unsectionedFields.map(renderField)}

        {Object.entries(sections).map(([sectionTitle, sectionFields]) => (
          <FormSection key={sectionTitle} title={sectionTitle}>
            {sectionFields.map(renderField)}
          </FormSection>
        ))}

        <ActionGroup>
          <Button
            variant="primary"
            type="submit"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            ouiaId="form-submit-button"
          >
            {submitLabel || (isEdit ? __('Update') : __('Create'))}
          </Button>
          {cancelUrl && (
            <Button
              variant="link"
              component="a"
              href={cancelUrl}
              isDisabled={isSubmitting}
              ouiaId="form-cancel-button"
            >
              {__('Cancel')}
            </Button>
          )}
        </ActionGroup>
      </Form>
    </div>
  );
};

FormPage.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      type: PropTypes.oneOf([
        'text',
        'textarea',
        'select',
        'checkbox',
        'password',
        'email',
        'number',
        'hidden',
      ]),
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      placeholder: PropTypes.string,
      helpText: PropTypes.string,
      labelHelp: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
              .isRequired,
            label: PropTypes.string.isRequired,
          }),
        ])
      ),
      checkboxLabel: PropTypes.string,
      section: PropTypes.string,
      initialValue: PropTypes.any,
      rows: PropTypes.number,
    })
  ).isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cancelUrl: PropTypes.string,
  submitLabel: PropTypes.string,
  resourceName: PropTypes.string,
  onSubmitSuccess: PropTypes.func,
};

FormPage.defaultProps = {
  resourceId: null,
  cancelUrl: '',
  submitLabel: null,
  resourceName: '',
  onSubmitSuccess: null,
};

export default FormPage;
