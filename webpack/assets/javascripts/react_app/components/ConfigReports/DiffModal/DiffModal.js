import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Icon,
	Button,
	Modal,
	ModalBody,
	ModalHeader
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { toggleModal as toggleModalAction, changeViewType as changeViewTypeAction } from './DiffModalActions';
import DiffView from '../../DiffView/DiffView';
import DiffToggle from '../../DiffView/DiffToggle';

import './diffmodal.scss';

const DiffModal = ({
  oldText,
  newText,
}) => {
  const dispatch = useDispatch();
  const { isOpen, diff, title, diffViewType } = useSelector(state => state.diffModal);
  const toggleModal = () => dispatch(toggleModalAction());
  const changeViewType = viewType => dispatch(changeViewTypeAction(viewType));

  const header = (
    <div className="diff-modal-header">
      <h4 id="diff-modal-h4">{title}</h4>
      <Button icon={<Icon>
          <TimesIcon />
        </Icon>}
        ouiaId="diff-modal-close-button"
        className="close diff-modal-close"
        onClick={toggleModal}
        variant="link"
      >
        
      </Button>
      <DiffToggle changeState={changeViewType} stateView={diffViewType} />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={toggleModal}
      className="diff-modal"
      aria-labelledby="diff-modal-h4"
    >
      <ModalHeader labelId="diff-modal-h4">
        {header}
      </ModalHeader>
      <ModalBody>
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
      </ModalBody>
    </Modal>
  );
};

DiffModal.propTypes = {
  oldText: PropTypes.string,
  newText: PropTypes.string,
};

DiffModal.defaultProps = {
  oldText: '',
  newText: '',
};

export default DiffModal;
