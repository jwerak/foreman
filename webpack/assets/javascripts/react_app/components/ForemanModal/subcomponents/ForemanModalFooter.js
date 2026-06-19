import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { useModalContext } from '../ForemanModalHooks';
import { translate as __ } from '../../../common/I18n';

import SubmitOrCancel from './SubmitOrCancel';

const ForemanModalFooter = ({ children, className, ...rest }) => {
  const childCount = React.Children.count(children);
  const { onClose, isSubmitting, id, submitProps } = useModalContext();

  // Render the provided children, or default markup if none given
  const closeButton = childCount === 0 && (
    <Button ouiaId="close-modal-button" variant="secondary" onClick={onClose}>
      {__('Close')}
    </Button>
  );

  const submitOrCancel = childCount === 0 && submitProps && (
    <SubmitOrCancel
      isSubmitting={isSubmitting}
      onCancel={onClose}
      submitProps={submitProps}
      id={id}
    />
  );

  return (
    <div className={`foreman-modal-footer${className ? ` ${className}` : ''}`} {...rest}>
      {children}
      {submitOrCancel || closeButton}
    </div>
  );
};

ForemanModalFooter.propTypes = {
  children: PropTypes.node,
};

ForemanModalFooter.defaultProps = {
  children: null,
};

export default ForemanModalFooter;
