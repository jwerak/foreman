import React from 'react';
import Head from '../../components/Head';
import DetailPage from '../../components/common/DetailPage';
import resourceConfigs from './resourceConfigs';

const detailRoute = config => ({
  path: `${config.indexPath}/:id(\\d+)`,
  exact: true,
  render: ({ match }) => (
    <>
      <Head>
        <title>{config.title}</title>
      </Head>
      <DetailPage
        resourceId={match.params.id}
        apiUrl={config.apiUrl}
        fieldsUrl={config.fieldsUrl}
        indexPath={config.indexPath}
        title={config.title}
        resourceName={config.resourceName}
        nameField={config.nameField}
        initialTab="details"
      />
    </>
  ),
});

const editRoute = config => ({
  path: `${config.indexPath}/:id(\\d+)/edit`,
  exact: true,
  render: ({ match }) => (
    <>
      <Head>
        <title>{config.title}</title>
      </Head>
      <DetailPage
        resourceId={match.params.id}
        apiUrl={config.apiUrl}
        fieldsUrl={config.fieldsUrl}
        indexPath={config.indexPath}
        title={config.title}
        resourceName={config.resourceName}
        nameField={config.nameField}
        initialTab="edit"
      />
    </>
  ),
});

const formPageConfigs = resourceConfigs.filter(c => !c.formComponent);

const DetailPages = formPageConfigs.flatMap(config => [
  editRoute(config),
  detailRoute(config),
]);

export default DetailPages;
