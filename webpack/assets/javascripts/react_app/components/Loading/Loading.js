import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  EmptyState,
  EmptyStateIcon,
  Spinner,
  EmptyStateHeader,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';

// Centered patternfly loading icon
const Loading = ({ textSize, iconSize, showText }) => {
  const LoadingSpinner = () => (
    <Spinner size={iconSize} aria-label="loading icon" />
  );
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateHeader
          titleText={showText ? __('Loading') : undefined}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={LoadingSpinner} />}
        />
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
