import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  EmptyState,
  Spinner,
  } from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';

// Centered patternfly loading icon
const Loading = ({ textSize, iconSize, showText }) => {
  const LoadingSpinner = () => (
    <Spinner size={iconSize} aria-label="loading icon" />
  );
  return (
    <Bullseye>
      <EmptyState  headingLevel="h4" icon={LoadingSpinner}  titleText={showText ? __('Loading') : undefined}>
        </EmptyState>
    </Bullseye>
  );
};

Loading.propTypes = {
  textSize: PropTypes.string,
  iconSize: PropTypes.string,
  showText: PropTypes.bool,
};

Loading.defaultProps = {
  textSize: 'lg',
  iconSize: 'xl',
  showText: true,
};

export default Loading;
