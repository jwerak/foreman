import React, { useEffect } from 'react';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { translate as __ } from '../../../../../common/I18n';
import { exportURL } from '../../../../../common/urlHelpers';
import { deprecate } from '../../../../../common/DeprecationService';

const ExportButton = ({ url, title, text }) => {
  useEffect(() => {
    deprecate(
      'PageLayout/components/ExportButton',
      'Button from @patternfly/react-core',
      '3.21'
    );
  }, []);

  return (
    <Button component="a" className="export-csv" href={url} title={title} variant="secondary">
      {text}
    </Button>
  );
};

ExportButton.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  text: PropTypes.string,
};

ExportButton.defaultProps = {
  url: exportURL(),
  title: __('Export to CSV'),
  text: __('Export'),
};

export default ExportButton;
