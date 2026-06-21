import {
  ModelKind,
  withPanZoom,
  GraphComponent,
  withDragNode,
  withSelection,
  DefaultEdge,
} from '@patternfly/react-topology';
import CustomNode from '../nodes/CustomNode';

export const componentFactory = (kind, type) => {
  switch (kind) {
    case ModelKind.graph:
      return withPanZoom()(GraphComponent);
    case ModelKind.node:
      return withDragNode()(withSelection()(CustomNode));
    case ModelKind.edge:
      return DefaultEdge;
    default:
      return undefined;
  }
};
