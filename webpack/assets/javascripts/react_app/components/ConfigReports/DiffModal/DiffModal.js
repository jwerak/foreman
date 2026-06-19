import React from 'react';
import { Modal, Icon, Button } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { noop } from '../../../common/helpers';
import DiffView from '../../DiffView/DiffView';
import DiffToggle from '../../DiffView/DiffToggle';

import './diffmodal.scss';

const DiffModal = ({
  title,
  oldText,
  newText,
  diff,
  isOpen,
  toggleModal,
  diffViewType,
  changeViewType,
}) => {
  const header = (
    <div className="diff-modal-header">
      <h4 id="diff-modal-h4">{title}</h4>
      <Button
        ouiaId="diff-modal-close-button"
        className="close diff-modal-close"
        onClick={toggleModal}
        variant="link"
      >
        <Icon>
          <TimesIcon />
        </Icon>
      </Button>
      <DiffToggle changeState={changeViewType} stateView={diffViewType} />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={toggleModal}
      className="diff-modal"
      header={header}
      aria-labelledby="diff-modal-h4"
      hasNoBodyWrapper
    >
      <div className="diff-modal-body">
        <div id="diff-table">
          <DiffView
            oldText={oldText}
            newText={newText}
            patch={diff}
            viewType={diffViewType}
          />
        </div>
      </div>
    </Modal>
  );
};

DiffModal.propTypes = {
  title: PropTypes.string,
  diff: PropTypes.string,
  oldText: PropTypes.string,
  newText: PropTypes.string,
  diffViewType: PropTypes.oneOf(['split', 'unified']),
  isOpen: PropTypes.bool,
  changeViewType: PropTypes.func,
  toggleModal: PropTypes.func,
};

DiffModal.defaultProps = {
  title: '',
  diff: '',
  oldText: '',
  newText: '',
  diffViewType: 'split',
  isOpen: false,
  changeViewType: noop,
  toggleModal: noop,
};

export default DiffModal;
