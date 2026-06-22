import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  PageSection,
  Breadcrumb,
  BreadcrumbItem,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Spinner,
  Alert,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { translate as __ } from '../../../common/I18n';
import useDetailData from './useDetailData';
import DetailsTabContent from './DetailsTabContent';
import FormPage from '../FormPage';

const TAB_DETAILS = 'details';
const TAB_EDIT = 'edit';

const DetailPage = ({
  resourceId,
  apiUrl,
  fieldsUrl,
  indexPath,
  title,
  resourceName,
  nameField,
  initialTab,
  customTabs,
}) => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(
    initialTab === 'edit' ? TAB_EDIT : initialTab || TAB_DETAILS
  );

  const { resource, fields, metadata, isLoading, error } = useDetailData({
    apiUrl,
    resourceId,
    fieldsUrl,
  });

  if (isLoading) {
    return (
      <PageSection>
        <Spinner size="xl" aria-label={__('Loading')} />
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Alert variant="danger" title={__('Error loading resource')} isInline>
          {error}
        </Alert>
      </PageSection>
    );
  }

  const displayName = resource?.[nameField] || `${resourceName} ${resourceId}`;
  const tabContext = { resourceId, resource, apiUrl, metadata };

  const visibleCustomTabs = customTabs.filter(
    tab => !tab.isVisible || tab.isVisible(tabContext)
  );

  return (
    <>
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={indexPath}>{title}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{displayName}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          {displayName}
        </Title>
      </PageSection>

      <PageSection variant="light" type="tabs">
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, key) => setActiveTab(key)}
          aria-label={`${displayName} tabs`}
        >
          <Tab
            eventKey={TAB_DETAILS}
            title={<TabTitleText>{__('Details')}</TabTitleText>}
          >
            <div className="pf-v6-u-pt-md">
              <DetailsTabContent fields={fields} resource={resource} />
            </div>
          </Tab>
          <Tab
            eventKey={TAB_EDIT}
            title={<TabTitleText>{__('Edit')}</TabTitleText>}
          >
            <div className="pf-v6-u-pt-md">
              <FormPage
                apiUrl={apiUrl}
                title={`${__('Edit')} ${displayName}`}
                fields={fields}
                resourceId={resourceId}
                resourceName={resourceName}
                onSubmitSuccess={() => history.push(indexPath)}
              />
            </div>
          </Tab>
          {visibleCustomTabs.map(tab => (
            <Tab
              key={tab.eventKey}
              eventKey={tab.eventKey}
              title={<TabTitleText>{tab.title}</TabTitleText>}
            >
              <div className="pf-v6-u-pt-md">
                <tab.component {...tab.getProps(tabContext)} />
              </div>
            </Tab>
          ))}
        </Tabs>
      </PageSection>
    </>
  );
};

DetailPage.propTypes = {
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  apiUrl: PropTypes.string.isRequired,
  fieldsUrl: PropTypes.string.isRequired,
  indexPath: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  nameField: PropTypes.string,
  initialTab: PropTypes.string,
  customTabs: PropTypes.arrayOf(
    PropTypes.shape({
      eventKey: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      component: PropTypes.elementType.isRequired,
      getProps: PropTypes.func.isRequired,
      isVisible: PropTypes.func,
    })
  ),
};

DetailPage.defaultProps = {
  nameField: 'name',
  initialTab: 'details',
  customTabs: [],
};

export default DetailPage;
