import React from 'react';
import { TopologySideBar } from '@patternfly/react-topology';
import SidebarContent from './SidebarContent';

const TopologySidebar = ({ selectedNode, isOpen, onClose, perspective }) => {
  if (!isOpen || !selectedNode) return null;

  return (
    <TopologySideBar show={isOpen} onClose={onClose}>
      <SidebarContent node={selectedNode} perspective={perspective} />
    </TopologySideBar>
  );
};

export default TopologySidebar;
