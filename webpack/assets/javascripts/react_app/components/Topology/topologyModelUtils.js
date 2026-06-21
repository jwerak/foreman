import { NodeShape, EdgeStyle } from '@patternfly/react-topology';
import { NODE_TYPES } from './topologyConstants';

const NODE_CONFIG = {
  [NODE_TYPES.COMPUTE_RESOURCE]: { width: 75, height: 75, shape: NodeShape.rect },
  [NODE_TYPES.BARE_METAL]: { width: 75, height: 75, shape: NodeShape.rect },
  [NODE_TYPES.HOSTGROUP]: { width: 75, height: 75, shape: NodeShape.rect },
  [NODE_TYPES.HOST]: { width: 50, height: 50, shape: NodeShape.ellipse },
};

const DEFAULT_NODE_CONFIG = { width: 60, height: 60, shape: NodeShape.ellipse };

export const transformToModel = (apiData, layoutType) => {
  if (!apiData?.nodes) {
    return { nodes: [], edges: [], graph: { id: 'topology-graph', type: 'graph', layout: layoutType } };
  }

  const nodes = apiData.nodes.map(node => {
    const config = NODE_CONFIG[node.type] || DEFAULT_NODE_CONFIG;
    return {
      id: node.id,
      type: node.type,
      label: node.label,
      width: config.width,
      height: config.height,
      shape: config.shape,
      data: node.data || {},
    };
  });

  const edges = (apiData.edges || []).map(edge => ({
    id: edge.id,
    type: 'edge',
    source: edge.source,
    target: edge.target,
    edgeStyle: EdgeStyle.default,
  }));

  return {
    nodes,
    edges,
    graph: {
      id: 'topology-graph',
      type: 'graph',
      layout: layoutType,
    },
  };
};
