import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { translate as __ } from '../../common/I18n';
import RelativeDateTime from '../common/dates/RelativeDateTime';
import EmptyState from '../common/EmptyState/EmptyStatePattern';

const NewHostsCard = ({ hosts }) => (
  <Card isFullHeight>
    <CardHeader>
      <CardTitle>{__('New Hosts')}</CardTitle>
    </CardHeader>
    <CardBody>
      {hosts.length === 0 ? (
        <EmptyState variant="xs" header={__('No hosts available.')} />
      ) : (
        <Table aria-label={__('New Hosts')} variant="compact">
          <Thead>
            <Tr>
              <Th>{__('Host')}</Th>
              <Th>{__('Operating System')}</Th>
              <Th>{__('Owner')}</Th>
              <Th>{__('Created')}</Th>
              <Th>{__('Installed')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hosts.map(host => (
              <Tr key={host.id}>
                <Td dataLabel={__('Host')}>
                  <a href={host.hostUrl}>{host.name}</a>
                </Td>
                <Td dataLabel={__('Operating System')}>
                  {host.operatingSystem || ''}
                </Td>
                <Td dataLabel={__('Owner')}>
                  {host.owner || ''}
                </Td>
                <Td dataLabel={__('Created')}>
                  {host.createdAt && <RelativeDateTime date={host.createdAt} />}
                </Td>
                <Td dataLabel={__('Installed')}>
                  {host.installedAt && <RelativeDateTime date={host.installedAt} />}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </CardBody>
  </Card>
);

NewHostsCard.propTypes = {
  hosts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      hostUrl: PropTypes.string.isRequired,
      operatingSystem: PropTypes.string,
      owner: PropTypes.string,
      createdAt: PropTypes.string,
      installedAt: PropTypes.string,
    })
  ),
};

NewHostsCard.defaultProps = {
  hosts: [],
};

export default NewHostsCard;
