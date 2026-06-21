import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const LinkOrLabel = ({ label, path }) => {
  if (path) {
    return <Link to={path}>{label}</Link>;
  }
  return <span>{label}</span>;
};

LinkOrLabel.propTypes = {
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
};

LinkOrLabel.defaultProps = {
  path: undefined,
};

export default LinkOrLabel;
