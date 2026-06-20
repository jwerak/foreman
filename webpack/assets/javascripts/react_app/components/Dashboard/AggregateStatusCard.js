import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  BanIcon,
  OutlinedClockIcon,
  BoltIcon,
} from '@patternfly/react-icons';
import { translate as __ } from '../../common/I18n';

const STATUS_ITEMS = [
  {
    key: 'active_hosts_ok_enabled',
    label: __('Active'),
    icon: BoltIcon,
    color: 'var(--pf-t--global--color--nonstatus--blue--default)',
  },
  {
    key: 'bad_hosts_enabled',
    label: __('Error'),
    icon: ExclamationCircleIcon,
    color: 'var(--pf-t--global--color--status--danger--default)',
  },
  {
    key: 'ok_hosts_enabled',
    label: __('OK'),
    icon: CheckCircleIcon,
    color: 'var(--pf-t--global--color--status--success--default)',
  },
  {
    key: 'pending_hosts_enabled',
    label: __('Pending'),
    icon: OutlinedClockIcon,
    color: 'var(--pf-t--global--color--nonstatus--purple--default)',
  },
  {
    key: 'out_of_sync_hosts_enabled',
    label: __('Out of sync'),
    icon: InfoCircleIcon,
    color: 'var(--pf-t--global--color--nonstatus--teal--default)',
  },
  {
    key: 'reports_missing',
    label: __('No report'),
    icon: ExclamationTriangleIcon,
    color: 'var(--pf-t--global--color--status--warning--default)',
  },
  {
    key: 'disabled_hosts',
    label: __('Disabled'),
    icon: BanIcon,
    color: 'var(--pf-t--global--color--nonstatus--gray--default)',
  },
];

const AggregateStatusCard = ({
  status,
  searchUrl,
  overview,
  reportOrigins,
  selectedOrigin,
  onOriginChange,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event, value) => {
    setIsOpen(false);
    onOriginChange(value);
  };

  const searchFilters = overview?.searchFilters || {};

  const buildSearchLink = (label) => {
    const filter = searchFilters[label];
    if (!filter || !searchUrl) return '#';
    return searchUrl.replace('~VAL~', encodeURIComponent(filter));
  };

  return (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              {loading && (
                <FlexItem>
                  <Spinner size="md" />
                </FlexItem>
              )}
              {reportOrigins.length > 1 && (
                <FlexItem>
                  <Select
                    isOpen={isOpen}
                    selected={selectedOrigin}
                    onSelect={onSelect}
                    onOpenChange={setIsOpen}
                    toggle={toggleRef => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsOpen(prev => !prev)}
                        isExpanded={isOpen}
                      >
                        {selectedOrigin}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      {reportOrigins.map(origin => (
                        <SelectOption key={origin} value={origin}>
                          {origin}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                </FlexItem>
              )}
            </Flex>
          ),
          hasNoOffset: true,
        }}
      >
        <CardTitle>{__('Host Configuration Status')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceAround' }}
          flexWrap={{ default: 'wrap' }}
          spaceItems={{ default: 'spaceItemsLg' }}
        >
          {STATUS_ITEMS.map(({ key, label, icon: StatusIcon, color }) => {
            const count = status[key] ?? 0;
            return (
              <FlexItem key={key}>
                <a
                  href={buildSearchLink(label)}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Flex
                    direction={{ default: 'column' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>
                      <Icon style={{ color }} size="lg">
                        <StatusIcon />
                      </Icon>
                    </FlexItem>
                    <FlexItem style={{ fontSize: 'var(--pf-t--global--font--size--heading--h2)', fontWeight: 'bold' }}>
                      {count}
                    </FlexItem>
                    <FlexItem style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                      {label}
                    </FlexItem>
                  </Flex>
                </a>
              </FlexItem>
            );
          })}
          <FlexItem>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <FlexItem style={{ fontSize: 'var(--pf-t--global--font--size--heading--h2)', fontWeight: 'bold', marginTop: 'var(--pf-t--global--spacer--xl)' }}>
                {status.total_hosts ?? 0}
              </FlexItem>
              <FlexItem style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                {__('Total Hosts')}
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

AggregateStatusCard.propTypes = {
  status: PropTypes.object,
  searchUrl: PropTypes.string,
  overview: PropTypes.object,
  reportOrigins: PropTypes.array,
  selectedOrigin: PropTypes.string,
  onOriginChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AggregateStatusCard.defaultProps = {
  status: {},
  searchUrl: '',
  overview: {},
  reportOrigins: ['All'],
  selectedOrigin: 'All',
  loading: false,
};

export default AggregateStatusCard;
