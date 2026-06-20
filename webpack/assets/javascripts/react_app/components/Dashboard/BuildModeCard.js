import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Icon,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  InProgressIcon,
  ExclamationCircleIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';
import { translate as __ } from '../../common/I18n';
import RelativeDateTime from '../common/dates/RelativeDateTime';

const STATUS_ICONS = {
  in_progress: { icon: InProgressIcon, color: 'var(--pf-t--global--color--nonstatus--blue--default)' },
  build_error: { icon: ExclamationCircleIcon, color: 'var(--pf-t--global--color--status--danger--default)' },
  token_expired: { icon: OutlinedClockIcon, color: 'var(--pf-t--global--color--status--danger--default)' },
};

const BuildStatusIcon = ({ buildStatus }) => {
  const config = STATUS_ICONS[buildStatus] || STATUS_ICONS.in_progress;
  const IconComponent = config.icon;
  return (
    <Icon style={{ color: config.color }} size="sm">
      <IconComponent />
    </Icon>
  );
};

BuildStatusIcon.propTypes = {
  buildStatus: PropTypes.string.isRequired,
};

const BuildModeCard = ({ hosts }) => (
  <Card>
    <CardHeader>
      <CardTitle>{__('Hosts in Build Mode')}</CardTitle>
    </CardHeader>
    <CardBody>
      <Table aria-label={__('Hosts in Build Mode')} variant="compact">
        <Thead>
          <Tr>
            <Th>{__('Host')}</Th>
            <Th>{__('Owner')}</Th>
            <Th>{__('Build Duration')}</Th>
            <Th>{__('Token Expiry')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {hosts.map(host => (
            <Tr key={host.id}>
              <Td dataLabel={__('Host')}>
                <BuildStatusIcon buildStatus={host.buildStatus} />{' '}
                <a href={host.hostUrl}>{host.name}</a>
              </Td>
              <Td dataLabel={__('Owner')}>
                {host.owner || ''}
              </Td>
              <Td dataLabel={__('Build Duration')}>
                {host.buildDuration || ''}
              </Td>
              <Td dataLabel={__('Token Expiry')}>
                {host.tokenExpiry && <RelativeDateTime date={host.tokenExpiry} />}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardBody>
  </Card>
);

BuildModeCard.propTypes = {
  hosts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      hostUrl: PropTypes.string.isRequired,
      owner: PropTypes.string,
      buildDuration: PropTypes.string,
      tokenExpiry: PropTypes.string,
      buildStatus: PropTypes.string,
    })
  ),
};

BuildModeCard.defaultProps = {
  hosts: [],
};

export default BuildModeCard;
