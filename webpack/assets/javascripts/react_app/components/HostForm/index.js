import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  ActionGroup,
  Button,
  Alert,
  Spinner,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';
import Slot from '../common/Slot';
import HostFormContext from './HostFormContext';
import useHostForm from './useHostForm';
import HostTab from './tabs/HostTab';
import OperatingSystemTab from './tabs/OperatingSystemTab';
import InterfacesTab from './tabs/InterfacesTab';
import AdditionalInfoTab from './tabs/AdditionalInfoTab';
import ParametersTab from './tabs/ParametersTab';

const HostForm = ({ host, options, meta }) => {
  const formState = useHostForm({ host, options, meta });
  const [activeTab, setActiveTab] = useState(0);

  const { submitErrors, isLoading, isSubmitting, onSubmit } = formState;
  const isEdit = !meta.isNew;

  const contextValue = {
    ...formState,
    meta,
  };

  if (isLoading) {
    return (
      <div className="pf-v6-c-page__main-section pf-m-light">
        <Spinner size="xl" aria-label={__('Loading form data')} />
      </div>
    );
  }

  return (
    <div className="pf-v6-c-page__main-section pf-m-light">
      <HostFormContext.Provider value={contextValue}>
        <Form isWidthLimited onSubmit={onSubmit}>
          {submitErrors && (
            <Alert
              variant="danger"
              title={__('Unable to save')}
              isInline
              ouiaId="host-form-submit-error"
            >
              {submitErrors.length === 1 ? (
                <span>{submitErrors[0]}</span>
              ) : (
                <ul>
                  {submitErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(_event, key) => setActiveTab(key)}
            aria-label={__('Host form tabs')}
          >
            <Tab
              eventKey={0}
              title={<TabTitleText>{__('Host')}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <HostTab />
              </div>
            </Tab>
            {meta.isManaged && (
              <Tab
                eventKey={1}
                title={
                  <TabTitleText>{__('Operating System')}</TabTitleText>
                }
              >
                <div className="pf-v6-u-pt-md">
                  <OperatingSystemTab />
                </div>
              </Tab>
            )}
            <Tab
              eventKey={meta.isManaged ? 2 : 1}
              title={<TabTitleText>{__('Interfaces')}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <InterfacesTab />
              </div>
            </Tab>
            <Tab
              eventKey={meta.isManaged ? 3 : 2}
              title={
                <TabTitleText>{__('Additional Information')}</TabTitleText>
              }
            >
              <div className="pf-v6-u-pt-md">
                <AdditionalInfoTab />
              </div>
            </Tab>
            <Tab
              eventKey={meta.isManaged ? 4 : 3}
              title={<TabTitleText>{__('Parameters')}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <ParametersTab />
              </div>
            </Tab>
          </Tabs>

          <Slot id="host-form-extra-content" multi />

          <ActionGroup>
            <Button
              variant="primary"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              ouiaId="host-form-submit-button"
            >
              {isEdit ? __('Update') : __('Create')}
            </Button>
            {meta.cancelUrl && (
              <Button
                variant="link"
                component="a"
                href={meta.cancelUrl}
                isDisabled={isSubmitting}
                ouiaId="host-form-cancel-button"
              >
                {__('Cancel')}
              </Button>
            )}
          </ActionGroup>
        </Form>
      </HostFormContext.Provider>
    </div>
  );
};

HostForm.propTypes = {
  host: PropTypes.object,
  options: PropTypes.shape({
    organizations: PropTypes.array,
    locations: PropTypes.array,
    hostgroups: PropTypes.array,
    computeResources: PropTypes.array,
    computeProfiles: PropTypes.array,
    realms: PropTypes.array,
    models: PropTypes.array,
    owners: PropTypes.array,
    architectures: PropTypes.array,
  }),
  meta: PropTypes.shape({
    isNew: PropTypes.bool,
    isManaged: PropTypes.bool,
    cancelUrl: PropTypes.string,
    showOrganizationTab: PropTypes.bool,
    showLocationTab: PropTypes.bool,
  }),
};

HostForm.defaultProps = {
  host: {},
  options: {},
  meta: {
    isNew: true,
    isManaged: true,
    cancelUrl: '',
    showOrganizationTab: false,
    showLocationTab: false,
  },
};

export default HostForm;
