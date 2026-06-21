import React from 'react';
import {
  FormGroup,
  TextInput,
  TextArea,
  Checkbox,
  Button,
  Alert,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { TrashIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../common/I18n';
import { useTemplateFormContext } from '../TemplateFormContext';

const INPUT_TYPE_FIELDS = {
  user: ['options', 'default', 'advanced', 'hidden_value'],
  fact: ['fact_name'],
  variable: ['variable_name'],
};

const InputRow = ({ input, index, onChange, onRemove, isLocked, isSubmitting, options }) => {
  const handleChange = (field, value) => {
    onChange(index, { ...input, [field]: value });
  };

  const inputId = prefix => `input-${index}-${prefix}`;
  const disabled = isLocked || isSubmitting;
  const typeFields = INPUT_TYPE_FIELDS[input.input_type] || [];

  return (
    <Card isCompact className="pf-v6-u-mb-md">
      <CardHeader
        actions={
          !isLocked
            ? {
                actions: (
                  <Button
                    variant="plain"
                    onClick={() => onRemove(index)}
                    isDisabled={isSubmitting}
                    aria-label={__('Remove input')}
                    icon={<TrashIcon />}
                  />
                ),
              }
            : undefined
        }
      >
        <CardTitle>{input.name || __('New Input')}</CardTitle>
      </CardHeader>
      <CardBody>
        <FormGroup label={__('Name')} isRequired fieldId={inputId('name')}>
          <TextInput
            id={inputId('name')}
            value={input.name || ''}
            onChange={(_e, val) => handleChange('name', val)}
            isDisabled={disabled}
            isRequired
          />
        </FormGroup>

        <FormGroup fieldId={inputId('required')}>
          <Checkbox
            id={inputId('required')}
            label={__('Required')}
            isChecked={!!input.required}
            onChange={(_e, checked) => handleChange('required', checked)}
            isDisabled={disabled}
          />
        </FormGroup>

        <FormGroup label={__('Input type')} isRequired fieldId={inputId('input-type')}>
          <FormSelect
            id={inputId('input-type')}
            value={input.input_type || ''}
            onChange={(_e, val) => handleChange('input_type', val)}
            isDisabled={disabled}
            isRequired
          >
            <FormSelectOption key="" value="" label={__('Select input type')} />
            {(options.inputTypes || []).map(opt => (
              <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup label={__('Value type')} fieldId={inputId('value-type')}>
          <FormSelect
            id={inputId('value-type')}
            value={input.value_type || 'plain'}
            onChange={(_e, val) => handleChange('value_type', val)}
            isDisabled={disabled}
          >
            {(options.valueTypes || []).map(opt => (
              <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
            ))}
          </FormSelect>
        </FormGroup>

        {(input.value_type === 'search' || input.value_type === 'resource') && (
          <FormGroup label={__('Resource type')} fieldId={inputId('resource-type')}>
            <FormSelect
              id={inputId('resource-type')}
              value={input.resource_type || ''}
              onChange={(_e, val) => handleChange('resource_type', val)}
              isDisabled={disabled}
            >
              <FormSelectOption key="" value="" label="" />
              {(options.resourceTypes || []).map(opt => (
                <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </FormSelect>
          </FormGroup>
        )}

        {typeFields.includes('fact_name') && (
          <FormGroup label={__('Fact name')} isRequired fieldId={inputId('fact-name')}>
            <TextInput
              id={inputId('fact-name')}
              value={input.fact_name || ''}
              onChange={(_e, val) => handleChange('fact_name', val)}
              isDisabled={disabled}
              isRequired
            />
          </FormGroup>
        )}

        {typeFields.includes('variable_name') && (
          <FormGroup label={__('Variable name')} isRequired fieldId={inputId('variable-name')}>
            <TextInput
              id={inputId('variable-name')}
              value={input.variable_name || ''}
              onChange={(_e, val) => handleChange('variable_name', val)}
              isDisabled={disabled}
              isRequired
            />
          </FormGroup>
        )}

        {typeFields.includes('options') && (
          <FormGroup
            label={__('Options')}
            fieldId={inputId('options')}
          >
            <TextArea
              id={inputId('options')}
              value={input.options || ''}
              onChange={(_e, val) => handleChange('options', val)}
              isDisabled={disabled}
              rows={3}
              resizeOrientation="vertical"
              aria-label={__('Options (one per line)')}
            />
          </FormGroup>
        )}

        {typeFields.includes('default') && (
          <FormGroup label={__('Default value')} fieldId={inputId('default')}>
            <TextInput
              id={inputId('default')}
              value={input.default || ''}
              onChange={(_e, val) => handleChange('default', val)}
              isDisabled={disabled}
            />
          </FormGroup>
        )}

        {typeFields.includes('advanced') && (
          <FormGroup fieldId={inputId('advanced')}>
            <Checkbox
              id={inputId('advanced')}
              label={__('Advanced')}
              isChecked={!!input.advanced}
              onChange={(_e, checked) => handleChange('advanced', checked)}
              isDisabled={disabled}
            />
          </FormGroup>
        )}

        {typeFields.includes('hidden_value') && (
          <FormGroup fieldId={inputId('hidden-value')}>
            <Checkbox
              id={inputId('hidden-value')}
              label={__('Hidden value')}
              isChecked={!!input.hidden_value}
              onChange={(_e, checked) => handleChange('hidden_value', checked)}
              isDisabled={disabled}
            />
          </FormGroup>
        )}

        <FormGroup label={__('Description')} fieldId={inputId('description')}>
          <TextArea
            id={inputId('description')}
            value={input.description || ''}
            onChange={(_e, val) => handleChange('description', val)}
            isDisabled={disabled}
            rows={3}
            resizeOrientation="vertical"
          />
        </FormGroup>
      </CardBody>
    </Card>
  );
};

const InputsTab = () => {
  const { values, onChange, options, isSubmitting } = useTemplateFormContext();
  const isLocked = values.locked;
  const inputs = (values.template_inputs_attributes || []).filter(
    i => !i._destroy
  );

  const handleInputChange = (index, updatedInput) => {
    const allInputs = values.template_inputs_attributes || [];
    const visibleIndex = allInputs.filter(i => !i._destroy).indexOf(inputs[index]);
    const actualIndex =
      visibleIndex >= 0
        ? allInputs.indexOf(inputs[index])
        : index;
    const next = [...allInputs];
    next[actualIndex] = updatedInput;
    onChange('template_inputs_attributes', next);
  };

  const handleRemove = index => {
    const allInputs = [...(values.template_inputs_attributes || [])];
    const target = inputs[index];
    const actualIndex = allInputs.indexOf(target);
    if (target.id) {
      allInputs[actualIndex] = { ...target, _destroy: true };
    } else {
      allInputs.splice(actualIndex, 1);
    }
    onChange('template_inputs_attributes', allInputs);
  };

  const handleAdd = () => {
    const allInputs = [...(values.template_inputs_attributes || [])];
    allInputs.push({
      name: '',
      input_type: '',
      value_type: 'plain',
      required: false,
      description: '',
    });
    onChange('template_inputs_attributes', allInputs);
  };

  return (
    <>
      <Alert
        variant="info"
        isInline
        title={__('Template inputs')}
        className="pf-v6-u-mb-md"
      >
        <p>
          {__(
            "Inputs can be used to parametrize templates during rendering. To use a value loaded via input, use input('name') global macro. The template needs to be saved before input macro can load the value."
          )}
        </p>
      </Alert>

      {inputs.map((input, index) => (
        <InputRow
          key={input.id || `new-${index}`}
          input={input}
          index={index}
          onChange={handleInputChange}
          onRemove={handleRemove}
          isLocked={isLocked}
          isSubmitting={isSubmitting}
          options={options}
        />
      ))}

      {!isLocked && (
        <Button
          variant="link"
          onClick={handleAdd}
          isDisabled={isSubmitting}
          icon={<PlusCircleIcon />}
        >
          {__('Add Input')}
        </Button>
      )}
    </>
  );
};

export default InputsTab;
