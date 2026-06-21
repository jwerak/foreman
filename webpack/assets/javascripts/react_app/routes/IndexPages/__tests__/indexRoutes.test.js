jest.mock('../../../components/DomainsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ArchitecturesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/RealmsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/MediaIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ComputeProfilesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/SubnetsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ComputeResourcesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/HttpProxiesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/OperatingsystemsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/PtablesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ProvisioningTemplatesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ReportTemplatesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/ConfigReportsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/UsersIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/UserGroupsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/RolesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/TaxonomiesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/BookmarksIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/HostgroupsIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/SmartProxiesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/FactValuesIndex', () => ({ __esModule: true, default: () => null }));
jest.mock('../IndexPageRoute', () => ({ __esModule: true, default: () => null }));

// eslint-disable-next-line import/first
import indexRoutes from '../index';

describe('Index page routes', () => {
  it('exports an array of 22 route definitions', () => {
    expect(Array.isArray(indexRoutes)).toBe(true);
    expect(indexRoutes.length).toBe(22);
  });

  it('each route has path, exact, and render', () => {
    indexRoutes.forEach(r => {
      expect(r).toHaveProperty('path');
      expect(r).toHaveProperty('exact', true);
      expect(typeof r.render).toBe('function');
    });
  });

  it('includes all expected paths', () => {
    const paths = indexRoutes.map(r => r.path);
    expect(paths).toContain('/domains');
    expect(paths).toContain('/architectures');
    expect(paths).toContain('/realms');
    expect(paths).toContain('/media');
    expect(paths).toContain('/compute_profiles');
    expect(paths).toContain('/subnets');
    expect(paths).toContain('/compute_resources');
    expect(paths).toContain('/http_proxies');
    expect(paths).toContain('/operatingsystems');
    expect(paths).toContain('/templates/ptables');
    expect(paths).toContain('/templates/provisioning_templates');
    expect(paths).toContain('/templates/report_templates');
    expect(paths).toContain('/config_reports');
    expect(paths).toContain('/users');
    expect(paths).toContain('/usergroups');
    expect(paths).toContain('/roles');
    expect(paths).toContain('/locations');
    expect(paths).toContain('/organizations');
    expect(paths).toContain('/bookmarks');
    expect(paths).toContain('/hostgroups');
    expect(paths).toContain('/smart_proxies');
    expect(paths).toContain('/fact_values');
  });

  it('handles /templates/ prefix routes correctly', () => {
    const templatePaths = indexRoutes
      .filter(r => r.path.startsWith('/templates/'))
      .map(r => r.path);
    expect(templatePaths).toEqual([
      '/templates/ptables',
      '/templates/provisioning_templates',
      '/templates/report_templates',
    ]);
  });

  it('has two taxonomy routes for locations and organizations', () => {
    const locRoute = indexRoutes.find(r => r.path === '/locations');
    const orgRoute = indexRoutes.find(r => r.path === '/organizations');
    expect(locRoute).toBeDefined();
    expect(orgRoute).toBeDefined();
  });
});
