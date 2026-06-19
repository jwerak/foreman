import React from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';
import { useModalContext } from '../ForemanModalHooks';

const ForemanModalHeader = ({ children, className, ...rest }) => {
  const { title } = useModalContext();
  return (
    <div className={`foreman-modal-header${className ? ` ${className}` : ''}`} {...rest}>
      {title && (
        <Title headingLevel="h4" size="2xl">
          {title}
        </Title>
      )}
      {children}
    </div>
  );
};

ForemanModalHeader.propTypes = {
  children: PropTypes.node,
};

ForemanModalHeader.defaultProps = {
  children: null,
};

export default ForemanModalHeader;
