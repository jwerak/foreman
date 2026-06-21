import React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  TextArea,
  Checkbox,
  Popover,
  Button,
  Icon,
  Alert,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../common/I18n';
import Editor from '../../Editor';
import { useTemplateFormContext } from '../TemplateFormContext';
import { TEMPLATE_TYPES } from '../constants';

const TemplateTab = () => {
  const { values, errors, onChange, meta, editor, isSubmitting } =
    useTemplateFormContext();

  const isLocked = values.locked;
  const isPtable = meta.templateType === TEMPLATE_TYPES.ptable;

  const editorData = {
    dslCache: editor.dslCache,
    template: values.template || '',
    locked: isLocked,
    id: values.id,
    type: 'templates',
    name: editor.templateFieldName,
    templateClass: editor.templateClass,
    title: values.name || '',
    showImport: !isLocked,
    showPreview: editor.showPreview,
    showHostSelector: editor.showHostSelector,
    isSafemodeEnabled: editor.isSafemodeEnabled,
    renderPath: editor.renderPath,
    safemodeRenderPath: editor.safemodeRenderPath,
  };

  return (
    <>
      {isLocked && (
        <Alert
          variant="warning"
          isInline
          title={__(
            'This template is locked. You may only change the associations. Please clone it to customize.'
          )}
          className="pf-v6-u-mb-md"
        />
      )}

      <FormGroup
        label={__('Name')}
        isRequired
        fieldId="template-name"
      >
        <TextInput
          id="template-name"
          value={values.name || ''}
          onChange={(_event, val) => onChange('name', val)}
          isDisabled={isLocked || isSubmitting}
          isRequired
          validated={errors.name ? 'error' : 'default'}
        />
        {errors.name && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{errors.name}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>

      {meta.showDefault && (
        <FormGroup fieldId="template-default">
          <Checkbox
            id="template-default"
            label={__('Default')}
            isChecked={!!values.default}
            onChange={(_event, checked) => onChange('default', checked)}
            isDisabled={isSubmitting}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                {__(
                  'Default templates are automatically added to new organizations and locations'
                )}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      )}

      {isPtable && (
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

          {!values.snippet && (
            <FormGroup
              label={__('Operating System Family')}
              fieldId="template-os-family"
            >
              <select
                id="template-os-family"
                className="pf-v6-c-form-control"
                value={values.os_family || ''}
                onChange={e => onChange('os_family', e.target.value)}
                disabled={isLocked || isSubmitting}
              >
                <option value="">{__('Choose a family')}</option>
                {(meta.osFamilies || []).map(fam => (
                  <option key={fam.value} value={fam.value}>
                    {fam.label}
                  </option>
                ))}
              </select>
            </FormGroup>
          )}
        </>
      )}

      <FormGroup fieldId="template-editor">
        {errors.template && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">
                {errors.template}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
        <Editor data={editorData} />
      </FormGroup>

      {values.cloned_from_name && (
        <FormGroup label={__('Cloned from')} fieldId="template-cloned-from">
          <span>{values.cloned_from_name}</span>
        </FormGroup>
      )}

      <FormGroup
        label={__('Description')}
        fieldId="template-description"
      >
        <TextArea
          id="template-description"
          value={values.description || ''}
          onChange={(_event, val) => onChange('description', val)}
          isDisabled={isLocked || isSubmitting}
          rows={3}
          resizeOrientation="vertical"
        />
      </FormGroup>

      <FormGroup
        label={__('Audit Comment')}
        fieldId="template-audit-comment"
        labelHelp={
          <Popover
            bodyContent={
              <span>
                {__(
                  'The Audit Comment field is saved with the template auditing to document the template changes'
                )}
              </span>
            }
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
              aria-label={__('Audit comment help')}
            />
          </Popover>
        }
      >
        <TextArea
          id="template-audit-comment"
          value={values.audit_comment || ''}
          onChange={(_event, val) => onChange('audit_comment', val)}
          isDisabled={isLocked || isSubmitting}
          rows={3}
          resizeOrientation="vertical"
        />
      </FormGroup>
    </>
  );
};

export default TemplateTab;
