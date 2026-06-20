import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  Button,
  Icon,
} from '@patternfly/react-core';
import {
  WarningTriangleIcon,
  ErrorCircleOIcon,
  HelpIcon,
} from '@patternfly/react-icons';
import InputFactory from './InputFactory';
import { noop } from '../../../common/helpers';

const InlineMessage = ({ error, warning, helpInline }) => {
  if (!error && !warning && !helpInline) {
    return null;
  }

  let variant = 'default';
  let icon = null;
  if (error) {
    variant = 'error';
    icon = (
      <Icon className="error-icon">
        <ErrorCircleOIcon />
      </Icon>
    );
  } else if (warning) {
    variant = 'warning';
    icon = (
      <Icon className="warning-icon">
        <WarningTriangleIcon />
      </Icon>
    );
  }

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem variant={variant} icon={icon}>
          {error || warning || helpInline}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};
InlineMessage.propTypes = {
  error: PropTypes.string,
  warning: PropTypes.string,
  helpInline: PropTypes.string,
};
InlineMessage.defaultProps = {
  error: null,
  warning: null,
  helpInline: null,
};

const FormField = ({
  type,
  id,
  name,
  className,
  disabled,
  required,
  error,
  value,
  label,
  labelHelp,
  helpInline,
  labelSizeClass,
  inputSizeClass,
  onChange,
  children,
  inputProps,
  ...otherProps
}) => {
  const [innerError, setError] = useState(error);
  const [innerWarning, setWarning] = useState(null);

  const controlProps = {
    id,
    value,
    name,
    disabled,
    required,
    className,
    onChange,
    setError,
    setWarning,
    ...otherProps,
    ...inputProps,
  };

  let validated;
  if (innerError) validated = 'error';
  else if (innerWarning) validated = 'warning';

  return (
    <FormGroup
      fieldId={id}
      label={label}
      isRequired={required}
      labelHelp={
        labelHelp ? (
          <Popover bodyContent={<React.Fragment>{labelHelp}</React.Fragment>}>
            <Button icon={<Icon isInline>
                <HelpIcon />
              </Icon>}
              type="button"
              variant="plain"
              className="field-help"
              onClick={e => e.preventDefault()}
             />
          </Popover>
        ) : undefined
      }
    >
      <div className={inputSizeClass}>
        {children || (
          <InputFactory type={type} validated={validated} {...controlProps} />
        )}
      </div>
      <InlineMessage
        error={innerError}
        warning={innerWarning}
        helpInline={helpInline}
      />
    </FormGroup>
  );
};

FormField.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
    PropTypes.array,
    PropTypes.bool,
  ]),
  className: PropTypes.string,
  label: PropTypes.string,
  labelHelp: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helpInline: PropTypes.string,
  inputSizeClass: PropTypes.string,
  labelSizeClass: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.element,
  inputProps: PropTypes.object,
};

FormField.defaultProps = {
  type: 'text',
  id: null,
  name: undefined,
  value: undefined,
  className: '',
  label: '',
  labelHelp: null,
  required: false,
  disabled: false,
  error: null,
  helpInline: null,
  inputSizeClass: 'col-md-4',
  labelSizeClass: 'col-md-2',
  onChange: noop,
  children: null,
  inputProps: null,
};

export default FormField;
