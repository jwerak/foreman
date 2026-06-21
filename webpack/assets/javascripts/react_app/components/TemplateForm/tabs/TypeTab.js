import React from 'react';
import {
  FormGroup,
  Checkbox,
  FormSelect,
  FormSelectOption,
  Alert,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import { useTemplateFormContext } from '../TemplateFormContext';
import { TEMPLATE_TYPES } from '../constants';

const TypeTab = () => {
  const { values, onChange, options, meta, isSubmitting } =
    useTemplateFormContext();

  const isLocked = values.locked;
  const isProvisioning =
    meta.templateType === TEMPLATE_TYPES.provisioning_template;

  return (
    <>
      <FormGroup fieldId="template-snippet">
        <Checkbox
          id="template-snippet"
          label={__('Snippet')}
          isChecked={!!values.snippet}
          onChange={(_event, checked) => onChange('snippet', checked)}
          isDisabled={isLocked || isSubmitting}
        />
      </FormGroup>

      {isProvisioning && !values.snippet && (
        <FormGroup label={__('Type')} fieldId="template-kind">
          <FormSelect
            id="template-kind"
            value={values.template_kind_id || ''}
            onChange={(_event, val) =>
              onChange('template_kind_id', val ? Number(val) : null)
            }
            isDisabled={isLocked || isSubmitting}
          >
            <FormSelectOption key="" value="" label="" />
            {(options.templateKinds || []).map(kind => (
              <FormSelectOption
                key={kind.value}
                value={kind.value}
                label={kind.label}
              />
            ))}
          </FormSelect>
        </FormGroup>
      )}

      {values.snippet && (
        <Alert
          variant="info"
          isInline
          title={__('Not relevant for snippet')}
          className="pf-v6-u-mt-md"
        />
      )}
    </>
  );
};

export default TypeTab;
