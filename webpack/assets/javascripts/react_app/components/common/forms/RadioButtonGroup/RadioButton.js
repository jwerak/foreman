import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Radio } from '@patternfly/react-core';
import { deprecate } from '../../../../common/DeprecationService';

const RadioButton = ({ input, item, disabled, checked }) => {
  useEffect(() => {
    deprecate(
      'forms/RadioButtonGroup',
      'Radio from @patternfly/react-core',
      '3.21'
    );
  }, []);

  return (
    <Radio
      {...input}
      id={input.id || `radio-${item.value}`}
      label={item.label}
      isChecked={checked}
      isDisabled={disabled}
      value={item.value}
      name={input.name}
    />
  );
};

RadioButton.propTypes = {
  input: PropTypes.object.isRequired,
  item: PropTypes.shape({
    label: PropTypes.node,
    value: PropTypes.string,
  }),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

RadioButton.defaultProps = {
  item: {
    label: '',
    value: '',
  },
  checked: false,
  disabled: false,
};

export default RadioButton;
