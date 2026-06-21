jest.mock('@patternfly/react-topology', () => ({
  NodeShape: { rect: 'rect', ellipse: 'ellipse' },
  EdgeStyle: { default: 'default' },
}));

import { transformToModel } from '../topologyModelUtils';

describe('transformToModel', () => {
  const sampleApiData = {
    nodes: [
      {
        id: 'cr-1',
        type: 'compute-resource',
        label: 'VMware DC1',
        data: { provider: 'Vmware', hosts_count: 10, error_count: 1 },
      },
      {
        id: 'host-1',
        type: 'host',
        label: 'web01.example.com',
        data: { global_status: 0 },
      },
    ],
    edges: [{ id: 'edge-cr1-host1', source: 'cr-1', target: 'host-1' }],
    meta: { total_compute_resources: 1, total_hosts: 1 },
  };

  it('transforms nodes with correct shape properties', () => {
    const model = transformToModel(sampleApiData, 'Dagre');
    expect(model.nodes).toHaveLength(2);

    const crNode = model.nodes.find(n => n.id === 'cr-1');
    expect(crNode.width).toBe(75);
    expect(crNode.height).toBe(75);
    expect(crNode.label).toBe('VMware DC1');
    expect(crNode.data.provider).toBe('Vmware');

    const hostNode = model.nodes.find(n => n.id === 'host-1');
    expect(hostNode.width).toBe(50);
    expect(hostNode.height).toBe(50);
  });

  it('transforms edges', () => {
    const model = transformToModel(sampleApiData, 'Cola');
    expect(model.edges).toHaveLength(1);
    expect(model.edges[0].source).toBe('cr-1');
    expect(model.edges[0].target).toBe('host-1');
    expect(model.edges[0].type).toBe('edge');
  });

  it('sets graph layout', () => {
    const model = transformToModel(sampleApiData, 'Dagre');
    expect(model.graph.layout).toBe('Dagre');
    expect(model.graph.type).toBe('graph');
    expect(model.graph.id).toBe('topology-graph');
  });

  it('handles null/undefined data gracefully', () => {
    const model = transformToModel(null, 'Dagre');
    expect(model.nodes).toEqual([]);
    expect(model.edges).toEqual([]);
    expect(model.graph.layout).toBe('Dagre');
  });

  it('handles empty nodes array', () => {
    const model = transformToModel({ nodes: [], edges: [] }, 'Cola');
    expect(model.nodes).toEqual([]);
    expect(model.edges).toEqual([]);
  });
});
