import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Label,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { translate as __ } from '../../common/I18n';
import EmptyState from '../common/EmptyState/EmptyStatePattern';

const labelVariant = (count, type) => {
  if (count === 0) return null;
  const variants = {
    applied: 'blue',
    restarted: 'blue',
    failed: 'red',
    failedRestarts: 'orange',
    skipped: 'blue',
    pending: 'blue',
  };
  return (
    <Label color={variants[type] || 'blue'} isCompact>
      {count}
    </Label>
  );
};

const LatestEventsCard = ({ events }) => (
  <Card isFullHeight>
    <CardHeader>
      <CardTitle>{__('Latest Events')}</CardTitle>
    </CardHeader>
    <CardBody>
      {events.length === 0 ? (
        <EmptyState
          variant="xs"
          header={__('No interesting reports received in the last week')}
        />
      ) : (
        <Table aria-label={__('Latest Events')} variant="compact">
          <Thead>
            <Tr>
              <Th>{__('Host')}</Th>
              <Th>{__('Applied')}</Th>
              <Th>{__('Restarted')}</Th>
              <Th>{__('Failed')}</Th>
              <Th>{__('Failed Restarts')}</Th>
              <Th>{__('Skipped')}</Th>
              <Th>{__('Pending')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.map(event => (
              <Tr key={event.id}>
                <Td dataLabel={__('Host')}>
                  <a href={event.reportsUrl}>{event.hostName}</a>
                </Td>
                <Td dataLabel={__('Applied')}>
                  {labelVariant(event.applied, 'applied')}
                </Td>
                <Td dataLabel={__('Restarted')}>
                  {labelVariant(event.restarted, 'restarted')}
                </Td>
                <Td dataLabel={__('Failed')}>
                  {labelVariant(event.failed, 'failed')}
                </Td>
                <Td dataLabel={__('Failed Restarts')}>
                  {labelVariant(event.failedRestarts, 'failedRestarts')}
                </Td>
                <Td dataLabel={__('Skipped')}>
                  {labelVariant(event.skipped, 'skipped')}
                </Td>
                <Td dataLabel={__('Pending')}>
                  {labelVariant(event.pending, 'pending')}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </CardBody>
  </Card>
);

LatestEventsCard.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      hostName: PropTypes.string.isRequired,
      reportsUrl: PropTypes.string.isRequired,
      applied: PropTypes.number,
      restarted: PropTypes.number,
      failed: PropTypes.number,
      failedRestarts: PropTypes.number,
      skipped: PropTypes.number,
      pending: PropTypes.number,
    })
  ),
};

LatestEventsCard.defaultProps = {
  events: [],
};

export default LatestEventsCard;
