import React from 'react';
import { DefaultNode, observer } from '@patternfly/react-topology';
import { NODE_TYPES, STATUS_COLORS } from '../topologyConstants';

const getStatusDecoratorColor = data => {
  if (!data) return STATUS_COLORS.unknown;
  if (data.error_count > 0) return STATUS_COLORS.error;
  if (data.hosts_count > 0) return STATUS_COLORS.ok;
  return STATUS_COLORS.unknown;
};

const getHostStatusColor = globalStatus => {
  switch (globalStatus) {
    case 0:
      return STATUS_COLORS.ok;
    case 1:
      return STATUS_COLORS.warning;
    case 2:
      return STATUS_COLORS.error;
    default:
      return STATUS_COLORS.unknown;
  }
};

const getBadge = (nodeType, data) => {
  if (!data) return undefined;

  switch (nodeType) {
    case NODE_TYPES.COMPUTE_RESOURCE:
    case NODE_TYPES.BARE_METAL:
    case NODE_TYPES.HOSTGROUP:
      return data.hosts_count != null ? `${data.hosts_count}` : undefined;
    default:
      return undefined;
  }
};

const getStatusColor = (nodeType, data) => {
  if (nodeType === NODE_TYPES.HOST) {
    return getHostStatusColor(data?.global_status);
  }
  return getStatusDecoratorColor(data);
};

const CustomNode = observer(({ element, ...rest }) => {
  const data = element.getData();
  const nodeType = element.getType();
  const badge = getBadge(nodeType, data);
  const statusColor = getStatusColor(nodeType, data);

  return (
    <DefaultNode
      element={element}
      badge={badge}
      badgeColor={statusColor}
      showStatusDecorator
      statusDecoratorTooltip={
        data?.error_count > 0
          ? `${data.error_count} error(s)`
          : undefined
      }
      {...rest}
    />
  );
});

export default CustomNode;
