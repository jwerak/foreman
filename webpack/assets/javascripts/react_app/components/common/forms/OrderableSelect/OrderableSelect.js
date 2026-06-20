import React, { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { set } from 'lodash';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  LabelGroup,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { noop } from '../../../../common/helpers';
import { orderDragged } from './helpers';
import { useInternalValue } from './OrderableSelectHooks';
import OrderableToken from './components/OrderableToken';

/**
 * Multi-select with typeahead filtering and drag-to-reorder tokens.
 * Presumes to be wrapped in a DndProvider context.
 * The value can not be changed through props once the component is rendered.
 */
const OrderableSelect = ({
  className,
  onChange,
  defaultValue,
  value,
  options,
  name,
  id,
  labelKey = 'label',
  ...props
}) => {
  const [internalValue, setInternalValue] = useInternalValue(
    value || defaultValue,
    options
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const textInputRef = useRef(null);

  const moveDraggedOption = (dragIndex, hoverIndex) => {
    setInternalValue(orderDragged(internalValue, dragIndex, hoverIndex));
  };

  const selectedValues = useMemo(
    () => new Set(internalValue.map(opt => opt.value)),
    [internalValue]
  );

  const filteredOptions = useMemo(
    () =>
      options.filter(
        opt =>
          !selectedValues.has(opt.value) &&
          (opt[labelKey] || opt.value)
            .toLowerCase()
            .includes(filterValue.toLowerCase())
      ),
    [options, selectedValues, filterValue, labelKey]
  );

  const handleSelect = (_event, optionValue) => {
    const option = options.find(opt => opt.value === optionValue);
    if (!option) return;

    if (selectedValues.has(optionValue)) {
      // Deselect
      const newValue = internalValue.filter(
        opt => opt.value !== optionValue
      );
      setInternalValue(newValue);
      onChange(newValue);
    } else {
      // Select
      const newValue = [...internalValue, option];
      setInternalValue(newValue);
      onChange(newValue);
    }
    setFilterValue('');
    textInputRef.current?.focus();
  };

  const handleRemove = optionValue => {
    const newValue = internalValue.filter(opt => opt.value !== optionValue);
    setInternalValue(newValue);
    onChange(newValue);
  };

  const onToggleClick = () => {
    setIsOpen(prev => !prev);
    textInputRef.current?.focus();
  };

  const toggle = toggleRef => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={filterValue}
          onClick={onToggleClick}
          onChange={(_event, val) => {
            setFilterValue(val);
            if (!isOpen) setIsOpen(true);
          }}
          id={`${id}-input`}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={
            internalValue.length === 0
              ? props.placeholder || 'Select...'
              : undefined
          }
          role="combobox"
          isExpanded={isOpen}
          aria-controls={`${id}-listbox`}
        />
        {(filterValue || internalValue.length > 0) && (
          <TextInputGroupUtilities>
            <Button icon={<TimesIcon aria-hidden />}
              variant="plain"
              onClick={() => {
                setFilterValue('');
                setInternalValue([]);
                onChange([]);
                textInputRef.current?.focus();
              }}
              aria-label="Clear input value"
             />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <div className={className}>
      {internalValue.length > 0 && (
        <LabelGroup>
          {internalValue.map((option, idx) => (
            <div
              id={`${id || 'selectValue'}-${option.value}`}
              style={{ display: 'inline-block' }}
              key={option.value}
            >
              <OrderableToken
                data={set({ ...option }, 'index', idx)}
                moveDraggedOption={moveDraggedOption}
                onRemove={() => handleRemove(option.value)}
                labelKey={labelKey}
              />
              {name && (
                <input type="hidden" name={name} value={option.value} />
              )}
            </div>
          ))}
        </LabelGroup>
      )}
      <Select
        id={id}
        isOpen={isOpen}
        selected={Array.from(selectedValues)}
        onSelect={handleSelect}
        onOpenChange={open => {
          if (!open) setIsOpen(false);
        }}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList id={`${id}-listbox`}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt[labelKey] || opt.value}
              </SelectOption>
            ))
          ) : (
            <SelectOption isDisabled>
              {filterValue
                ? 'No results found'
                : 'No options available'}
            </SelectOption>
          )}
        </SelectList>
      </Select>
    </div>
  );
};

OrderableSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.array,
  value: PropTypes.array,
  className: PropTypes.string,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
};

OrderableSelect.defaultProps = {
  onChange: noop,
  defaultValue: [],
  value: null,
  name: null,
  className: '',
  labelKey: 'label',
  placeholder: 'Select...',
};

export default OrderableSelect;
