import React from 'react';
import { Checkbox } from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';
import { useTemplateFormContext } from '../TemplateFormContext';

const TaxonomyTab = ({ type }) => {
  const { values, onChange, options, isSubmitting } =
    useTemplateFormContext();

  const isLocations = type === 'locations';
  const fieldName = isLocations ? 'location_ids' : 'organization_ids';
  const items = isLocations
    ? options.locations || []
    : options.organizations || [];
  const selected = Array.isArray(values[fieldName]) ? values[fieldName] : [];

  const handleToggle = (itemValue, isChecked) => {
    const next = isChecked
      ? [...selected, itemValue]
      : selected.filter(v => v !== itemValue);
    onChange(fieldName, next);
  };

  if (items.length === 0) {
    return <p>{__('No options available')}</p>;
  }

  return (
    <div className="form-page-checkbox-group">
      {items.map(item => (
        <Checkbox
          key={item.value}
          id={`${fieldName}-${item.value}`}
          label={item.label}
          isChecked={selected.includes(item.value)}
          onChange={(_event, isChecked) => handleToggle(item.value, isChecked)}
          isDisabled={isSubmitting}
        />
      ))}
    </div>
  );
};

export default TaxonomyTab;
