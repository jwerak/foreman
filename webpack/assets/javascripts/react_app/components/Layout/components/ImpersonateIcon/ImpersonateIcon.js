import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { EyeIcon } from '@patternfly/react-icons';
import {
  Tooltip,
  TooltipPosition,
  Modal,
  ModalVariant,
  Button,
  Icon,
} from '@patternfly/react-core';
import { translate as __ } from '../../../../common/I18n';
import { stopImpersonating } from './ImpersonateIconActions';

import './ImpersonateIcon.scss';

const ImpersonateIcon = ({ stopImpersonationUrl }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <React.Fragment>
      <Tooltip
        content={__(
          'You are impersonating another user, click to stop the impersonation'
        )}
        position={TooltipPosition.bottom}
      >
        <span className="nav-item-iconic" onClick={toggleModal}>
          <Icon className="blink-image">
            <EyeIcon />
          </Icon>
        </span>
      </Tooltip>
      <Modal
        ouiaId="impersonate-modal"
        variant={ModalVariant.small}
        position="top"
        isOpen={showModal}
        onClose={toggleModal}
        title={__('Confirm Action')}
        actions={[
          <Button
            ouiaId="stop-impersonating"
            key="confirm"
            variant="primary"
            onClick={() => dispatch(stopImpersonating(stopImpersonationUrl))}
          >
            {__('Confirm')}
          </Button>,
          <Button
            ouiaId="cancel-impersonating-modal"
            key="cancel"
            variant="secondary"
            onClick={toggleModal}
          >
            {__('Cancel')}
          </Button>,
        ]}
      >
        {__('You are about to stop impersonating other user. Are you sure?')}
      </Modal>
    </React.Fragment>
  );
};

ImpersonateIcon.propTypes = {
  stopImpersonationUrl: PropTypes.string.isRequired,
};

export default ImpersonateIcon;
