import $ from 'jquery';
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon, Spinner } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import { deprecate } from '../../../common/DeprecationService';
import { translate as __ } from '../../../common/I18n';
import { noop } from '../../../common/helpers';
import CommonForm from './CommonForm';
import { STATUS } from '../../../constants';
import EmptyState from '../EmptyState';
import { renderOptions } from './SelectHelpers';

const Select = ({
  name,
  label,
  className,
  value,
  onChange,
  options,
  disabled,
  allowClear,
  status = STATUS.RESOLVED,
  errorMessage = __('An error occurred.'),
  useSelect2,
}) => {
  const selectRef = useRef(null);

  const initializeSelect2 = () => {
    if ($.fn.select2) {
      $(selectRef.current).select2({
        allowClear,
        formatNoMatches: __('No matches found'),
      });
    }
  };

  const attachEvent = () => {
    $(selectRef.current)
      .off('select2:select select2:unselecting', onChange)
      .on('select2:select select2:unselecting', onChange);
  };

  useEffect(() => {
    deprecate(
      'Select',
      'Select or TypeaheadSelect from @patternfly/react-core or @patternfly/react-templates',
      '3.20'
    );
    if (useSelect2) {
      initializeSelect2();
      attachEvent();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (useSelect2) {
      initializeSelect2();
      attachEvent();
    }
  }, [status, useSelect2]); // eslint-disable-line react-hooks/exhaustive-deps

  let content;

  const innerSelect = (
    <div>
      <select
        name={name}
        disabled={disabled}
        ref={selectRef}
        className="form-control"
        value={value}
        onChange={onChange}
      >
        <option />
        {renderOptions(options)}
      </select>
    </div>
  );

  switch (status) {
    case STATUS.RESOLVED: {
      content = innerSelect;
      break;
    }
    case STATUS.PENDING: {
      content = <Spinner size="sm" aria-label="Loading" />;
      break;
    }
    case STATUS.ERROR: {
      content = (
        <EmptyState
          variant="xs"
          icon={
            <Icon iconSize="lg">
              <ExclamationCircleIcon />
            </Icon>
          }
          header={errorMessage}
        />
      );
      break;
    }
    default:
      content = (
        <EmptyState
          variant="xs"
          icon={
            <Icon iconSize="lg">
              <ExclamationCircleIcon />
            </Icon>
          }
          header={__('Invalid status')}
        />
      );
      break;
  }

  if (!label) {
    return innerSelect;
  }
  return (
    <CommonForm label={label} className={`common-select ${className}`}>
      {content}
    </CommonForm>
  );
};

Select.propTypes = {
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  label: PropTypes.string,
  className: PropTypes.string,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  status: PropTypes.string,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  useSelect2: PropTypes.bool,
};

Select.defaultProps = {
  name: null,
  value: undefined,
  label: '',
  className: '',
  allowClear: false,
  disabled: false,
  options: {},
  status: STATUS.RESOLVED,
  errorMessage: __('An error occurred.'),
  onChange: noop,
  useSelect2: true,
};

export default Select;
