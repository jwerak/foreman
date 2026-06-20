import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { useAPI } from '../../common/hooks/API/APIHooks';
import { EMPTY_RESOURCE_TYPE } from './FiltersFormConstants';
import { translate as __ } from '../../common/I18n';

export const SelectResourceType = ({
  type,
  setType,
  setIsGranular,
  defaultType,
  setAutocompleteQuery,
}) => {
  const apiOption = useMemo(
    () => {
      if (!defaultType) {
        return {};
      }
      return {
        handleSuccess: ({ data: { resource_types: results } }) => {
          const typeData =
            results.find(result => result.name === defaultType) ||
            EMPTY_RESOURCE_TYPE;
          setType(typeData);
          setIsGranular(typeData.granular);
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const {
    response: { resource_types: types = [] },
  } = useAPI(
    'get',
    '/permissions/show_resource_types_with_translations',
    apiOption
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const allOptions = [
    { key: EMPTY_RESOURCE_TYPE.name, translation: EMPTY_RESOURCE_TYPE.translation, data: EMPTY_RESOURCE_TYPE },
    ...types.map(option => ({ key: option.name, translation: option.translation, data: option })),
  ];

  const filteredOptions = filterValue
    ? allOptions.filter(opt =>
        opt.translation?.toLowerCase().includes(filterValue.toLowerCase())
      )
    : allOptions;

  const handleSelect = (_event, value) => {
    const selected = allOptions.find(opt => opt.translation === value);
    if (selected) {
      if (selected.key === EMPTY_RESOURCE_TYPE.name) {
        setType(EMPTY_RESOURCE_TYPE);
        setIsGranular(false);
      } else {
        setType(selected.data);
        setIsGranular(selected.data.granular);
      }
      setAutocompleteQuery('');
    }
    setFilterValue('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setType(EMPTY_RESOURCE_TYPE);
    setIsGranular(false);
    setAutocompleteQuery('');
    setFilterValue('');
    setIsOpen(false);
  };

  return (
    <FormGroup label={__('Resource Type')} isRequired>
      <Select
        ouiaId="resource-type-select"
        className="without_select2"
        maxMenuHeight="45vh"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleSelect}
        selected={type.translation}
        toggle={toggleRef => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            variant="typeahead"
            isFullWidth
            aria-label="resource type toggle"
          >
            <TextInputGroup isPlain>
              <TextInputGroupMain
                value={filterValue || type.translation || ''}
                onChange={(_event, val) => {
                  setFilterValue(val);
                  setIsOpen(true);
                }}
                autoComplete="off"
                placeholder={__('Select a resource type')}
                aria-label="Select a resource type"
              />
              {(filterValue || type.translation) && (
                <TextInputGroupUtilities>
                  <Button icon={<TimesIcon />}
                    variant="plain"
                    onClick={handleClear}
                    aria-label="Clear"
                   />
                </TextInputGroupUtilities>
              )}
            </TextInputGroup>
          </MenuToggle>
        )}
      >
        <SelectList>
          {filteredOptions.map(opt => (
            <SelectOption key={opt.key} value={opt.translation}>
              {opt.translation}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

SelectResourceType.propTypes = {
  type: PropTypes.shape({
    name: PropTypes.string,
    translation: PropTypes.string,
    granular: PropTypes.bool,
    search_path: PropTypes.string,
  }).isRequired,
  setType: PropTypes.func.isRequired,
  setIsGranular: PropTypes.func.isRequired,
  defaultType: PropTypes.string,
  setAutocompleteQuery: PropTypes.func.isRequired,
};

SelectResourceType.defaultProps = {
  defaultType: '',
};
