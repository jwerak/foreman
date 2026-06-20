import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DebounceInput } from 'react-debounce-input';
import { Icon, Button } from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { translate as __ } from '../../../../react_app/common/I18n';
import { deprecate } from '../../../common/DeprecationService';
import { noop } from '../../../common/helpers';
import './searchInput.scss';

const SearchInput = ({ onSearchChange, searchValue, timeout, onClear, focus }) => {
  const nameInputRef = useRef(null);

  useEffect(() => {
    deprecate(
      'components/common/SearchInput',
      'SearchInput from @patternfly/react-core or SearchBar from components/SearchBar or AutocompleteInput from components/common/AutocompleteInput',
      '3.21'
    );
    if (focus) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <div className="input-search">
      <Icon>
        <SearchIcon />
      </Icon>
      <DebounceInput
        className="form-control"
        inputRef={nameInputRef}
        id="breadcrumbs-search"
        placeholder={__('filter...')}
        value={searchValue}
        minLength={0}
        debounceTimeout={timeout}
        onChange={onSearchChange}
      />
      <Button icon={<Icon>
          <TimesIcon />
        </Icon>}
        variant="plain"
        onClick={() => onClear()}
        aria-label="Clear"
        ouiaId="clear-search-input-button"
       />
    </div>
  );
};

SearchInput.propTypes = {
  focus: PropTypes.bool,
  searchValue: PropTypes.string,
  timeout: PropTypes.number,
  onSearchChange: PropTypes.func,
  onClear: PropTypes.func,
};

SearchInput.defaultProps = {
  focus: false,
  searchValue: '',
  timeout: 300,
  onSearchChange: noop,
  onClear: noop,
};

export default SearchInput;
