import React from 'react';
import PropTypes from 'prop-types';
import {
	Progress,
	Modal,
	ModalBody,
	ModalHeader
} from '@patternfly/react-core';
import { sprintf, translate as __ } from '../../../common/I18n';
import './ModalProgressBar.scss';

const ModalProgressBar = ({ show, container, title, progress }) => (
  <Modal
    id="modal-progress-bar"
    ouiaId="modal-progress-bar"
    variant="small"
    isOpen={show}
    aria-labelledby="modal-progress-bar-title"
    appendTo={container}
    disableFocusTrap
  >
    {title && <ModalHeader title={title} labelId="modal-progress-bar-title" />}
    <ModalBody>
      <Progress
        value={progress}
        label={sprintf(__('%s%% Complete'), progress)}
        aria-label="progress-bar"
      />
    </ModalBody>
  </Modal>
);

ModalProgressBar.propTypes = {
  show: PropTypes.bool.isRequired,
  container: PropTypes.shape({}),
  title: PropTypes.string,
  progress: PropTypes.number,
};

ModalProgressBar.defaultProps = {
  container: document.body,
  title: null,
  progress: 0,
};

export default ModalProgressBar;
