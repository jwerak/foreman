import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';

const EditorRadioButton = ({
  btnView,
  disabled,
  icon,
  onClick,
  stateView,
  title,
}) => (
  <li
    className={stateView === btnView ? 'active' : ''}
    id={`${btnView}-navitem`}
  >
    <Button
      variant="link"
      isDisabled={disabled}
      onClick={onClick}
      isInline
    >
      {icon}
      {icon ? ` ${title}` : title}
    </Button>
  </li>
);

EditorRadioButton.propTypes = {
  btnView: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  stateView: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

EditorRadioButton.defaultProps = {
  icon: null,
  disabled: false,
};

export default EditorRadioButton;
