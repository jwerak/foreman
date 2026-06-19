import React, { useEffect, useMemo } from 'react';
import { Alert, Button, Divider, Title, Tooltip } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import Controller from './controller/';
import * as VmWareActions from '../../../../redux/actions/hosts/storage/vmware';
import { MaxDisksPerController } from './StorageContainer.consts';
import { translate as __ } from '../../../../../react_app/common/I18n';
import './StorageContainer.scss';
import { STATUS } from '../../../../constants';

const filterKeyFromVolume = volume => {
  // eslint-disable-next-line no-unused-vars
  const { key, ...volumeWithoutKey } = volume;
  return volumeWithoutKey;
};

export const controllersToJsonString = (controllers, volumes) =>
  JSON.stringify({
    controllers,
    volumes: volumes.map(v => filterKeyFromVolume(v)),
  });

const StorageContainer = ({ data }) => {
  const dispatch = useDispatch();
  const actions = useMemo(
    () => bindActionCreators(VmWareActions, dispatch),
    [dispatch]
  );

  const {
    controllers,
    config,
    cluster,
    volumes,
    datastores,
    datastoresLoading,
    datastoresError,
    storagePods,
    storagePodsLoading,
    storagePodsError,
  } = useSelector(state => state.hosts.storage.vmware);

  useEffect(() => {
    const {
      config: initConfig,
      controllers: initControllers,
      volumes: initVolumes,
      cluster: initCluster,
    } = data;
    actions.initController(initConfig, initCluster, initControllers, initVolumes);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getDatastoresStatus = () => {
    if (datastoresError) {
      return STATUS.ERROR;
    }
    if (datastoresLoading) {
      return STATUS.PENDING;
    }
    return STATUS.RESOLVED;
  };

  const getStoragePodsStatus = () => {
    if (storagePodsError) {
      return STATUS.ERROR;
    }
    if (storagePodsLoading) {
      return STATUS.PENDING;
    }
    return STATUS.RESOLVED;
  };

  const renderControllers = ctrls =>
    ctrls.map((controller, idx) => {
      const controllerVolumes = volumes.filter(
        v => v.controllerKey === controller.key
      );

      return (
        <React.Fragment key={controller.key}>
          {idx > 0 && <Divider className="controller-divider" />}
          <Controller
            removeController={() => actions.removeController(controller.key)}
            controller={controller}
            controllerVolumes={controllerVolumes}
            addDiskEnabled={controllerVolumes.length < MaxDisksPerController}
            addDisk={() => actions.addDisk(controller.key)}
            updateDisk={actions.updateDisk}
            removeDisk={actions.removeDisk}
            updateController={newValues =>
              actions.updateController(idx, newValues)
            }
            config={config}
            datastores={datastores}
            datastoresError={datastoresError}
            datastoresStatus={getDatastoresStatus()}
            storagePods={storagePods}
            storagePodsError={storagePodsError}
            storagePodsStatus={getStoragePodsStatus()}
          />
        </React.Fragment>
      );
    });

  const paramsScope = config && config.paramsScope;
  const enableAddControllerBtn =
    config && config.addControllerEnabled && !config.vmExists;
  const hasControllers = controllers.length > 0;

  if (!cluster) {
    return (
      <Alert
        variant="info"
        ouiaId="alert-info"
        title={__('Please select a cluster')}
      />
    );
  }

  return (
    <div className="vmware-storage-container">
      <Title headingLevel="h2" size="lg" ouiaId="storage-title">
        {__('Storage')}
      </Title>
      <div className="storage-body">
        {renderControllers(controllers)}
        {hasControllers && <Divider className="controller-divider" />}
        {!enableAddControllerBtn ? (
          <Tooltip content={__('Cannot add controllers to an existing VM')}>
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              className="btn-add-controller"
              ouiaId="btn-add-controller"
              isAriaDisabled
            >
              {hasControllers
                ? __('Create another controller')
                : __('Create controller')}
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            className="btn-add-controller"
            ouiaId="btn-add-controller"
            onClick={actions.addController}
          >
            {hasControllers
              ? __('Create another controller')
              : __('Create controller')}
          </Button>
        )}
        <input
          value={controllersToJsonString(controllers, volumes)}
          id="controller_hidden"
          name={paramsScope}
          type="hidden"
        />
      </div>
    </div>
  );
};

StorageContainer.propTypes = {
  data: PropTypes.shape({
    config: PropTypes.object.isRequired,
    controllers: PropTypes.array.isRequired,
    volumes: PropTypes.array.isRequired,
    cluster: PropTypes.string,
  }).isRequired,
};

export default StorageContainer;
