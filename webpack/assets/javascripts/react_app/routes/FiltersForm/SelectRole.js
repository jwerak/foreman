import React, { useState } from 'react';
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
import { translate as __ } from '../../common/I18n';

export const SelectRole = ({ role, setRole }) => {
  const {
    response: { results = [] },
  } = useAPI('get', '/api/v2/roles?per_page=all&search=locked=false');
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const selectedName = results.find(result => result.id === role)?.name || '';

  const filteredResults = filterValue
    ? results.filter(option =>
        option.name?.toLowerCase().includes(filterValue.toLowerCase())
      )
    : results;

  const handleSelect = (_event, value) => {
    const selected = results.find(option => option.name === value);
    if (selected) {
      setRole(selected.id);
    }
    setFilterValue('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setRole('');
    setFilterValue('');
    setIsOpen(false);
  };

  return (
    <FormGroup label={__('Role')} isRequired>
      <Select
        ouiaId="select-role"
        className="without_select2"
        maxMenuHeight="45vh"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleSelect}
        selected={selectedName}
        toggle={toggleRef => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            variant="typeahead"
            isFullWidth
            aria-label="Select a role"
          >
            <TextInputGroup isPlain>
              <TextInputGroupMain
                value={filterValue || selectedName}
                onChange={(_event, val) => {
                  setFilterValue(val);
                  setIsOpen(true);
                }}
                autoComplete="off"
                placeholder={__('Select a role')}
                aria-label="Select a role"
              />
              {(filterValue || selectedName) && (
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
          {filteredResults.map(option => (
            <SelectOption key={option.id} value={option.name}>
              {option.name}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

SelectRole.propTypes = {
  role: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setRole: PropTypes.func.isRequired,
};
