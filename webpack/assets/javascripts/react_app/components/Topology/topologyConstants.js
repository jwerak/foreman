export const PERSPECTIVES = {
  infrastructure: {
    key: 'infrastructure',
    label: 'Infrastructure & Provisioning',
    apiPath: '/api/v2/topology/infrastructure',
  },
  configuration: {
    key: 'configuration',
    label: 'Configuration Management',
    apiPath: '/api/v2/topology/configuration',
  },
};

export const LAYOUTS = {
  Dagre: 'Dagre',
  Cola: 'Cola',
};

export const DEFAULT_PERSPECTIVE = 'infrastructure';
export const DEFAULT_LAYOUT = LAYOUTS.Dagre;

export const NODE_TYPES = {
  COMPUTE_RESOURCE: 'compute-resource',
  BARE_METAL: 'bare-metal',
  HOSTGROUP: 'hostgroup',
  HOST: 'host',
};

export const STATUS_COLORS = {
  ok: 'var(--pf-t--global--color--status--success--default)',
  warning: 'var(--pf-t--global--color--status--warning--default)',
  error: 'var(--pf-t--global--color--status--danger--default)',
  unknown: 'var(--pf-t--global--color--status--info--default)',
};
