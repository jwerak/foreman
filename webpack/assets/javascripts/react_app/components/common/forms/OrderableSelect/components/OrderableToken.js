import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@patternfly/react-core';

import { orderable } from '../helpers';

const orderConfig = {
  type: 'multiValue',
  getItem: props => ({ value: props.data.value }),
  getIndex: props => props.data.index,
  getMoveFnc: props => props.moveDraggedOption,
};

const OrderableToken = ({
  isDragging,
  moveDraggedOption,
  data,
  disabled,
  onRemove,
  tabIndex,
  labelKey,
}) => (
  <Label
    variant="outline"
    onClose={disabled ? undefined : onRemove}
    closeBtnProps={{ tabIndex }}
    isDisabled={disabled}
  >
    {data[labelKey]}
  </Label>
);

OrderableToken.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  moveDraggedOption: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  labelKey: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  onRemove: PropTypes.func,
};

OrderableToken.defaultProps = {
  disabled: false,
  tabIndex: -1,
  onRemove: undefined,
};

export default orderable(OrderableToken, orderConfig);
