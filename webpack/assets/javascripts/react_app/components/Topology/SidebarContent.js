import React from 'react';
import {
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  Button,
  Divider,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';
import { NODE_TYPES } from './topologyConstants';
import SidebarHostTable from './SidebarHostTable';

const StatusLabel = ({ status }) => {
  if (status === 0) return <Label color="green">{__('OK')}</Label>;
  if (status === 1) return <Label color="orange">{__('Warning')}</Label>;
  if (status === 2) return <Label color="red">{__('Error')}</Label>;
  return <Label color="grey">{__('Unknown')}</Label>;
};

const ComputeResourceContent = ({ data }) => (
  <>
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Provider')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Label>{data.provider}</Label>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Total Hosts')}</DescriptionListTerm>
        <DescriptionListDescription>
          {data.hosts_count}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {data.error_count > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>{__('Errors')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="red">{data.error_count}</Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
    {data.url && (
      <Button
        variant="link"
        component="a"
        href={data.url}
        style={{ marginTop: '1rem' }}
      >
        {__('View Details')}
      </Button>
    )}
    <Divider style={{ margin: '1rem 0' }} />
    <SidebarHostTable
      nodeType={NODE_TYPES.COMPUTE_RESOURCE}
      nodeId={data.url?.match(/\/(\d+)$/)?.[1]}
    />
  </>
);

const HostGroupContent = ({ data }) => (
  <>
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Full Path')}</DescriptionListTerm>
        <DescriptionListDescription>
          {data.title || data.label}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Hosts')}</DescriptionListTerm>
        <DescriptionListDescription>
          {data.hosts_count}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {data.error_count > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>{__('Errors')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="red">{data.error_count}</Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
    {data.url && (
      <Button
        variant="link"
        component="a"
        href={data.url}
        style={{ marginTop: '1rem' }}
      >
        {__('View Details')}
      </Button>
    )}
    <Divider style={{ margin: '1rem 0' }} />
    <SidebarHostTable
      nodeType={NODE_TYPES.HOSTGROUP}
      nodeId={data.url?.match(/\/(\d+)$/)?.[1]}
    />
  </>
);

const HostContent = ({ data }) => (
  <DescriptionList isCompact>
    <DescriptionListGroup>
      <DescriptionListTerm>{__('Status')}</DescriptionListTerm>
      <DescriptionListDescription>
        <StatusLabel status={data.global_status} />
      </DescriptionListDescription>
    </DescriptionListGroup>
    {data.hostgroup_id && (
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Host Group')}</DescriptionListTerm>
        <DescriptionListDescription>
          {data.hostgroup_id}
        </DescriptionListDescription>
      </DescriptionListGroup>
    )}
    {data.url && (
      <DescriptionListGroup>
        <DescriptionListTerm />
        <DescriptionListDescription>
          <Button variant="link" component="a" href={data.url}>
            {__('View Host Details')}
          </Button>
        </DescriptionListDescription>
      </DescriptionListGroup>
    )}
  </DescriptionList>
);

const BareMetalContent = ({ data }) => (
  <>
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{__('Total Hosts')}</DescriptionListTerm>
        <DescriptionListDescription>
          {data.hosts_count}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {data.error_count > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>{__('Errors')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color="red">{data.error_count}</Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
    <Divider style={{ margin: '1rem 0' }} />
    <SidebarHostTable nodeType={NODE_TYPES.BARE_METAL} nodeId={null} />
  </>
);

const SidebarContent = ({ node }) => {
  if (!node) return null;

  const { type, label, data } = node;

  return (
    <div style={{ padding: '1rem' }}>
      <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
        {label}
      </Title>

      {type === NODE_TYPES.COMPUTE_RESOURCE && (
        <ComputeResourceContent data={data} />
      )}
      {type === NODE_TYPES.HOSTGROUP && <HostGroupContent data={data} />}
      {type === NODE_TYPES.HOST && <HostContent data={data} />}
      {type === NODE_TYPES.BARE_METAL && <BareMetalContent data={data} />}
    </div>
  );
};

export default SidebarContent;
