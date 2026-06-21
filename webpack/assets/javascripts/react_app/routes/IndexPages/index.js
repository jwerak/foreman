import React from 'react';
import { translate as __ } from '../../common/I18n';
import IndexPageRoute from './IndexPageRoute';

import DomainsIndex from '../../components/DomainsIndex';
import ArchitecturesIndex from '../../components/ArchitecturesIndex';
import RealmsIndex from '../../components/RealmsIndex';
import MediaIndex from '../../components/MediaIndex';
import ComputeProfilesIndex from '../../components/ComputeProfilesIndex';
import SubnetsIndex from '../../components/SubnetsIndex';
import ComputeResourcesIndex from '../../components/ComputeResourcesIndex';
import HttpProxiesIndex from '../../components/HttpProxiesIndex';
import OperatingsystemsIndex from '../../components/OperatingsystemsIndex';
import PtablesIndex from '../../components/PtablesIndex';
import ProvisioningTemplatesIndex from '../../components/ProvisioningTemplatesIndex';
import ReportTemplatesIndex from '../../components/ReportTemplatesIndex';
import ConfigReportsIndex from '../../components/ConfigReportsIndex';
import UsersIndex from '../../components/UsersIndex';
import UserGroupsIndex from '../../components/UserGroupsIndex';
import RolesIndex from '../../components/RolesIndex';
import TaxonomiesIndex from '../../components/TaxonomiesIndex';
import BookmarksIndex from '../../components/BookmarksIndex';
import HostgroupsIndex from '../../components/HostgroupsIndex';
import SmartProxiesIndex from '../../components/SmartProxiesIndex';
import FactValuesIndex from '../../components/FactValuesIndex';

const route = (path, Component, indexProps, title) => ({
  path,
  exact: true,
  render: () => (
    <IndexPageRoute
      title={title}
      component={Component}
      indexProps={indexProps}
    />
  ),
});

export default [
  route('/domains', DomainsIndex, {
    apiUrl: '/api/v2/domains',
    controller: 'domains',
    createUrl: '/domains/new',
    hasHelpPage: true,
  }, __('Domains')),

  route('/architectures', ArchitecturesIndex, {
    apiUrl: '/api/v2/architectures',
    controller: 'architectures',
    createUrl: '/architectures/new',
    hasHelpPage: true,
  }, __('Architectures')),

  route('/realms', RealmsIndex, {
    apiUrl: '/api/v2/realms',
    controller: 'realms',
    createUrl: '/realms/new',
    documentationUrl: '/links/manual/4.3.8Realm',
  }, __('Realms')),

  route('/media', MediaIndex, {
    apiUrl: '/api/v2/media',
    controller: 'media',
    createUrl: '/media/new',
    hasHelpPage: true,
    documentationUrl: '/links/manual/4.4.2InstallationMedia',
  }, __('Installation Media')),

  route('/compute_profiles', ComputeProfilesIndex, {
    apiUrl: '/api/v2/compute_profiles',
    controller: 'compute_profiles',
    createUrl: '/compute_profiles/new',
    documentationUrl: '/links/manual/5.2.2UsingComputeProfiles',
  }, __('Compute Profiles')),

  route('/subnets', SubnetsIndex, {
    apiUrl: '/api/v2/subnets',
    controller: 'subnets',
    createUrl: '/subnets/new',
  }, __('Subnets')),

  route('/compute_resources', ComputeResourcesIndex, {
    apiUrl: '/api/v2/compute_resources',
    controller: 'compute_resources',
    createUrl: '/compute_resources/new',
    documentationUrl: '/links/manual/5.2ComputeResources',
  }, __('Compute Resources')),

  route('/http_proxies', HttpProxiesIndex, {
    apiUrl: '/api/v2/http_proxies',
    controller: 'http_proxies',
    createUrl: '/http_proxies/new',
    hasHelpPage: true,
  }, __('HTTP Proxies')),

  route('/operatingsystems', OperatingsystemsIndex, {
    apiUrl: '/api/v2/operatingsystems',
    controller: 'operatingsystems',
    createUrl: '/operatingsystems/new',
    documentationUrl: '/links/manual/4.4.1OperatingSystems',
  }, __('Operating Systems')),

  route('/templates/ptables', PtablesIndex, {
    apiUrl: '/api/v2/ptables',
    controller: 'ptables',
    createUrl: '/templates/ptables/new',
    documentationUrl: '/links/manual/4.4.4PartitionTables',
  }, __('Partition Tables')),

  route('/templates/provisioning_templates', ProvisioningTemplatesIndex, {
    apiUrl: '/api/v2/provisioning_templates',
    controller: 'provisioning_templates',
    createUrl: '/templates/provisioning_templates/new',
    documentationUrl: '/links/manual/4.4.3ProvisioningTemplates',
  }, __('Provisioning Templates')),

  route('/templates/report_templates', ReportTemplatesIndex, {
    apiUrl: '/api/v2/report_templates',
    controller: 'report_templates',
    createUrl: '/templates/report_templates/new',
    documentationUrl: '/links/manual/4.11Reports',
  }, __('Report Templates')),

  route('/config_reports', ConfigReportsIndex, {
    apiUrl: '/api/v2/config_reports',
    controller: 'config_reports',
    creatable: false,
    exportable: true,
    exportUrl: '/config_reports.csv',
    documentationUrl: '/links/manual/3.5.4PuppetReports',
  }, __('Config Reports')),

  route('/users', UsersIndex, {
    apiUrl: '/api/v2/users',
    controller: 'users',
    createUrl: '/users/new',
  }, __('Users')),

  route('/usergroups', UserGroupsIndex, {
    apiUrl: '/api/v2/usergroups',
    controller: 'usergroups',
    createUrl: '/usergroups/new',
  }, __('User Groups')),

  route('/roles', RolesIndex, {
    apiUrl: '/api/v2/roles',
    controller: 'roles',
    createUrl: '/roles/new',
    documentationUrl: '/links/manual/4.1.2RolesandPermissions',
  }, __('Roles')),

  route('/locations', TaxonomiesIndex, {
    apiUrl: '/api/v2/locations',
    controller: 'locations',
    createUrl: '/locations/new',
    title: __('Locations'),
    taxonomyResource: 'locations',
    taxonomySingle: 'location',
    mismatchesUrl: '/taxonomies/mismatches',
  }, __('Locations')),

  route('/organizations', TaxonomiesIndex, {
    apiUrl: '/api/v2/organizations',
    controller: 'organizations',
    createUrl: '/organizations/new',
    title: __('Organizations'),
    taxonomyResource: 'organizations',
    taxonomySingle: 'organization',
    mismatchesUrl: '/taxonomies/mismatches',
  }, __('Organizations')),

  route('/bookmarks', BookmarksIndex, {
    apiUrl: '/api/v2/bookmarks',
    controller: 'bookmarks',
    creatable: false,
    documentationUrl: '/links/manual/4.1.5Searching',
  }, __('Bookmarks')),

  route('/hostgroups', HostgroupsIndex, {
    apiUrl: '/api/v2/hostgroups',
    controller: 'hostgroups',
    createUrl: '/hostgroups/new',
    hasHelpPage: true,
    exportable: true,
    exportUrl: '/hostgroups.csv',
  }, __('Host Groups')),

  route('/smart_proxies', SmartProxiesIndex, {
    apiUrl: '/api/v2/smart_proxies',
    controller: 'smart_proxies',
    createUrl: '/smart_proxies/new',
    documentationUrl: '/links/manual/4.3SmartProxies',
  }, __('Smart Proxies')),

  route('/fact_values', FactValuesIndex, {
    apiUrl: '/fact_values.json',
    controller: 'fact_values',
    creatable: false,
    exportable: true,
    exportUrl: '/fact_values.csv',
    documentationUrl: '/links/manual/3.5.5FactsandtheENC',
  }, __('Facts')),
];
