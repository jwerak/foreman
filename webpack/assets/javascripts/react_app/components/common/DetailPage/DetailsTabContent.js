import React from 'react';
import PropTypes from 'prop-types';
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Card,
  CardBody,
  CardTitle,
} from '@patternfly/react-core';
import { translate as __ } from '../../../common/I18n';

const formatValue = (field, resource) => {
  const raw = resource[field.name];

  switch (field.type) {
    case 'hidden':
      return null;

    case 'password':
      return '********';

    case 'checkbox':
      return raw ? __('Yes') : __('No');

    case 'checkboxGroup': {
      const key = field.loadKey || field.name;
      const items = resource[key];
      if (!Array.isArray(items) || items.length === 0) return __('None');
      return items
        .map(item => (typeof item === 'object' ? item.name || item.label : item))
        .join(', ');
    }

    case 'select': {
      if (raw == null || raw === '') return '-';
      const opt = (field.options || []).find(o => {
        const optVal = typeof o === 'object' ? o.value : o;
        return String(optVal) === String(raw);
      });
      if (opt && typeof opt === 'object') return opt.label;
      return String(raw);
    }

    default:
      if (raw == null || raw === '') return '-';
      return String(raw);
  }
};

const DetailsTabContent = ({ fields, resource }) => {
  const visibleFields = fields.filter(f => f.type !== 'hidden');

  const tabs = {};
  const tabOrder = [];
  const ungrouped = [];

  visibleFields.forEach(field => {
    if (field.tab) {
      if (!tabs[field.tab]) {
        tabs[field.tab] = [];
        tabOrder.push(field.tab);
      }
      tabs[field.tab].push(field);
    } else {
      ungrouped.push(field);
    }
  });

  const renderFieldGroup = fieldList => (
    <DescriptionList isHorizontal>
      {fieldList.map(field => {
        const formatted = formatValue(field, resource);
        if (formatted === null) return null;
        return (
          <DescriptionListGroup key={field.name}>
            <DescriptionListTerm>{field.label || field.name}</DescriptionListTerm>
            <DescriptionListDescription>{formatted}</DescriptionListDescription>
          </DescriptionListGroup>
        );
      })}
    </DescriptionList>
  );

  if (tabOrder.length === 0) {
    return renderFieldGroup(ungrouped.length > 0 ? ungrouped : visibleFields);
  }

  return (
    <>
      {ungrouped.length > 0 && renderFieldGroup(ungrouped)}
      {tabOrder.map(tabName => (
        <Card key={tabName} isPlain className="pf-v6-u-mt-md">
          <CardTitle>{tabName}</CardTitle>
          <CardBody>{renderFieldGroup(tabs[tabName])}</CardBody>
        </Card>
      ))}
    </>
  );
};

DetailsTabContent.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      type: PropTypes.string,
      options: PropTypes.array,
      loadKey: PropTypes.string,
      tab: PropTypes.string,
    })
  ).isRequired,
  resource: PropTypes.object.isRequired,
};

export default DetailsTabContent;
