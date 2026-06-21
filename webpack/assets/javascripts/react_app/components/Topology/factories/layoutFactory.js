import { ColaLayout, DagreLayout } from '@patternfly/react-topology';

export const layoutFactory = (type, graph) => {
  switch (type) {
    case 'Cola':
      return new ColaLayout(graph);
    case 'Dagre':
      return new DagreLayout(graph);
    default:
      return new DagreLayout(graph);
  }
};
