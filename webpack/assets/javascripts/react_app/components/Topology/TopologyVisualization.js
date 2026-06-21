import React, { useMemo, useState, useCallback } from 'react';
import {
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  TopologyView,
  TopologyControlBar,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  action,
  SELECTION_EVENT,
} from '@patternfly/react-topology';
import { transformToModel } from './topologyModelUtils';
import { componentFactory } from './factories/componentFactory';
import { layoutFactory } from './factories/layoutFactory';
import './Topology.scss';

const TopologyVisualization = ({
  data,
  layout,
  toolbar,
  sidebar,
  sidebarOpen,
  onNodeSelect,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelection = useCallback(
    ids => {
      setSelectedIds(ids);
      if (onNodeSelect) {
        if (ids.length === 1) {
          const node = data?.nodes?.find(n => n.id === ids[0]);
          onNodeSelect(node || null);
        } else {
          onNodeSelect(null);
        }
      }
    },
    [data, onNodeSelect]
  );

  const controller = useMemo(() => {
    const ctrl = new Visualization();
    ctrl.registerLayoutFactory(layoutFactory);
    ctrl.registerComponentFactory(componentFactory);
    ctrl.addEventListener(SELECTION_EVENT, handleSelection);

    const model = transformToModel(data, layout);
    ctrl.fromModel(model, false);

    return ctrl;
  }, [data, layout, handleSelection]);

  const controlButtons = createTopologyControlButtons({
    ...defaultControlButtonsOptions,
    zoomInCallback: action(() => {
      controller.getGraph().scaleBy(4 / 3);
    }),
    zoomOutCallback: action(() => {
      controller.getGraph().scaleBy(3 / 4);
    }),
    fitToScreenCallback: action(() => {
      controller.getGraph().fit(80);
    }),
    resetViewCallback: action(() => {
      controller.getGraph().reset();
      controller.getGraph().layout();
    }),
    legend: false,
  });

  return (
    <VisualizationProvider controller={controller}>
      <TopologyView
        contextToolbar={toolbar}
        controlBar={
          <TopologyControlBar controlButtons={controlButtons} />
        }
        sideBar={sidebar}
        sideBarOpen={sidebarOpen}
      >
        <VisualizationSurface state={{ selectedIds }} />
      </TopologyView>
    </VisualizationProvider>
  );
};

export default TopologyVisualization;
