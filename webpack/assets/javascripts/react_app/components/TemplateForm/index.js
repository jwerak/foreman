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
import TemplateFormContext from './TemplateFormContext';
import useTemplateForm from './useTemplateForm';
import TemplateTab from './tabs/TemplateTab';
import InputsTab from './tabs/InputsTab';
import TypeTab from './tabs/TypeTab';
import TaxonomyTab from './tabs/TaxonomyTab';
import { TEMPLATE_TYPES } from './constants';

const TemplateForm = ({ template, options, editor, meta }) => {
  const formState = useTemplateForm({ template, options, meta });
  const [activeTab, setActiveTab] = useState(0);

  const { submitErrors, isLoading, isSubmitting, onSubmit } = formState;
  const isEdit = !meta.isNew;
  const isPtable = meta.templateType === TEMPLATE_TYPES.ptable;
  const showTypeTab = !isPtable;

  const contextValue = {
    ...formState,
    meta,
    editor,
  };

  if (isLoading) {
    return (
      <div className="pf-v6-c-page__main-section pf-m-light">
        <Spinner size="xl" aria-label={__('Loading form data')} />
      </div>
    );
  }

  let tabIndex = 0;
  const templateTabKey = tabIndex++;
  const inputsTabKey = tabIndex++;
  const typeTabKey = showTypeTab ? tabIndex++ : null;
  const locationsTabKey = meta.showLocationTab ? tabIndex++ : null;
  const organizationsTabKey = meta.showOrganizationTab ? tabIndex++ : null;

  return (
    <div className="pf-v6-c-page__main-section pf-m-light">
      <TemplateFormContext.Provider value={contextValue}>
        <Form onSubmit={onSubmit}>
          {submitErrors && (
            <Alert
              variant="danger"
              title={__('Unable to save')}
              isInline
              ouiaId="template-form-submit-error"
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
            aria-label={__('Template form tabs')}
          >
            <Tab
              eventKey={templateTabKey}
              title={<TabTitleText>{__('Template')}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <TemplateTab />
              </div>
            </Tab>

            <Tab
              eventKey={inputsTabKey}
              title={<TabTitleText>{__('Inputs')}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <InputsTab />
              </div>
            </Tab>

            {showTypeTab && (
              <Tab
                eventKey={typeTabKey}
                title={<TabTitleText>{__('Type')}</TabTitleText>}
              >
                <div className="pf-v6-u-pt-md">
                  <TypeTab />
                </div>
              </Tab>
            )}

            {meta.showLocationTab && (
              <Tab
                eventKey={locationsTabKey}
                title={<TabTitleText>{__('Locations')}</TabTitleText>}
              >
                <div className="pf-v6-u-pt-md">
                  <TaxonomyTab type="locations" />
                </div>
              </Tab>
            )}

            {meta.showOrganizationTab && (
              <Tab
                eventKey={organizationsTabKey}
                title={<TabTitleText>{__('Organizations')}</TabTitleText>}
              >
                <div className="pf-v6-u-pt-md">
                  <TaxonomyTab type="organizations" />
                </div>
              </Tab>
            )}
          </Tabs>

          <ActionGroup className="pf-v6-u-mt-lg">
            <Button
              variant="primary"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              ouiaId="template-form-submit-button"
            >
              {isEdit ? __('Update') : __('Create')}
            </Button>
            {meta.cancelUrl && (
              <Button
                variant="link"
                component="a"
                href={meta.cancelUrl}
                isDisabled={isSubmitting}
                ouiaId="template-form-cancel-button"
              >
                {__('Cancel')}
              </Button>
            )}
          </ActionGroup>
        </Form>
      </TemplateFormContext.Provider>
    </div>
  );
};

TemplateForm.propTypes = {
  template: PropTypes.object,
  options: PropTypes.shape({
    templateKinds: PropTypes.array,
    osFamilies: PropTypes.array,
    locations: PropTypes.array,
    organizations: PropTypes.array,
    inputTypes: PropTypes.array,
    valueTypes: PropTypes.array,
    resourceTypes: PropTypes.array,
  }),
  editor: PropTypes.shape({
    dslCache: PropTypes.string,
    renderPath: PropTypes.string,
    safemodeRenderPath: PropTypes.string,
    showImport: PropTypes.bool,
    showPreview: PropTypes.bool,
    showHostSelector: PropTypes.bool,
    isSafemodeEnabled: PropTypes.bool,
    templateClass: PropTypes.string,
    templateFieldName: PropTypes.string,
  }),
  meta: PropTypes.shape({
    isNew: PropTypes.bool,
    cancelUrl: PropTypes.string,
    templateType: PropTypes.string,
    apiUrl: PropTypes.string,
    resourceName: PropTypes.string,
    showDefault: PropTypes.bool,
    showLocationTab: PropTypes.bool,
    showOrganizationTab: PropTypes.bool,
    osFamilies: PropTypes.array,
  }),
};

TemplateForm.defaultProps = {
  template: {},
  options: {},
  editor: {},
  meta: {
    isNew: true,
    cancelUrl: '',
    templateType: 'provisioning_template',
    apiUrl: '',
    resourceName: '',
    showDefault: false,
    showLocationTab: false,
    showOrganizationTab: false,
  },
};

export default TemplateForm;
