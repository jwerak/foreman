import React from 'react';
import PropTypes from 'prop-types';
import { PageSection } from '@patternfly/react-core';

import BreadcrumbBar from '../../components/BreadcrumbBar';
import Head from '../../components/Head';

const IndexPageRoute = ({ title, component: Component, indexProps }) => {
  const search = new URLSearchParams(window.location.search).get('search') || '';

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <div id="breadcrumb">
          <BreadcrumbBar breadcrumbItems={[{ caption: title }]} />
        </div>
      </PageSection>
      <Component {...indexProps} initialSearch={search} />
    </>
  );
};

IndexPageRoute.propTypes = {
  title: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
  indexProps: PropTypes.object.isRequired,
};

export default IndexPageRoute;
