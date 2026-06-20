import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  PageSection,
  Grid,
  GridItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Button,
  Tooltip,
} from '@patternfly/react-core';
import {
  SyncAltIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import { translate as __ } from '../../common/I18n';
import { foremanUrl } from '../../../foreman_tools';
import { doesDocumentHasFocus } from '../../common/document';
import { reloadPage } from '../../../foreman_navigation';
import AggregateStatusCard from './AggregateStatusCard';
import StatusChartCard from './StatusChartCard';
import RunDistributionCard from './RunDistributionCard';
import LatestEventsCard from './LatestEventsCard';
import NewHostsCard from './NewHostsCard';
import BuildModeCard from './BuildModeCard';
import Slot from '../common/Slot/Slot';

const AUTO_REFRESH_INTERVAL = 60000;

const Dashboard = ({
  status: initialStatus,
  overview: initialOverview,
  runDistribution: initialRunDistribution,
  latestEvents: initialLatestEvents,
  newHosts: initialNewHosts,
  hostsInBuildMode: initialBuildHosts,
  reportOrigins,
  searchUrl,
  documentationUrl,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [status, setStatus] = useState(initialStatus);
  const [overview, setOverview] = useState(initialOverview);
  const [runDistribution, setRunDistribution] = useState(initialRunDistribution);
  const [latestEvents, setLatestEvents] = useState(initialLatestEvents);
  const [newHosts, setNewHosts] = useState(initialNewHosts);
  const [hostsInBuildMode, setHostsInBuildMode] = useState(initialBuildHosts);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshTimer = useRef(null);

  useEffect(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (autoRefresh) {
      refreshTimer.current = setTimeout(() => {
        if (doesDocumentHasFocus()) reloadPage();
      }, AUTO_REFRESH_INTERVAL);
    }
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [autoRefresh]);

  const handleOriginChange = useCallback(async (origin) => {
    setSelectedOrigin(origin);
    setLoading(true);
    try {
      const url = new URL(foremanUrl('/'), window.location.origin);
      url.searchParams.set('format', 'json');
      if (origin && origin !== 'All') {
        url.searchParams.set('origin', origin);
      }
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(__('Failed to fetch dashboard data'));
      const data = await response.json();
      setStatus(data.status);
      setOverview(data.overview);
      setRunDistribution(data.runDistribution);
      setLatestEvents(data.latestEvents);
      setNewHosts(data.newHosts);
      setHostsInBuildMode(data.hostsInBuildMode);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageSection>
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup align={{ default: 'alignEnd' }}>
            <ToolbarItem>
              <Tooltip content={autoRefresh ? __('Auto refresh on') : __('Auto refresh off')}>
                <Button
                  variant={autoRefresh ? 'primary' : 'plain'}
                  onClick={() => setAutoRefresh(prev => !prev)}
                  aria-label={__('Toggle auto refresh')}
                  icon={<SyncAltIcon />}
                />
              </Tooltip>
            </ToolbarItem>
            {documentationUrl && (
              <ToolbarItem>
                <Button
                  variant="link"
                  component="a"
                  href={documentationUrl}
                  target="_blank"
                  rel="external noopener noreferrer"
                  icon={<ExternalLinkAltIcon />}
                >
                  {__('Documentation')}
                </Button>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      <Grid hasGutter>
        <GridItem span={12}>
          <AggregateStatusCard
            status={status}
            searchUrl={searchUrl}
            overview={overview}
            reportOrigins={reportOrigins}
            selectedOrigin={selectedOrigin}
            onOriginChange={handleOriginChange}
            loading={loading}
          />
        </GridItem>
        <GridItem span={12} lg={4}>
          <StatusChartCard overview={overview} />
        </GridItem>
        <GridItem span={12} lg={8}>
          <RunDistributionCard data={runDistribution} />
        </GridItem>
        <GridItem span={12} lg={6}>
          <LatestEventsCard events={latestEvents} />
        </GridItem>
        <GridItem span={12} lg={6}>
          <NewHostsCard hosts={newHosts} />
        </GridItem>
        {hostsInBuildMode && hostsInBuildMode.length > 0 && (
          <GridItem span={12}>
            <BuildModeCard hosts={hostsInBuildMode} />
          </GridItem>
        )}
        <GridItem span={12}>
          <Slot id="dashboard-cards" multi />
        </GridItem>
      </Grid>
    </PageSection>
  );
};

Dashboard.propTypes = {
  status: PropTypes.object,
  overview: PropTypes.object,
  runDistribution: PropTypes.array,
  latestEvents: PropTypes.array,
  newHosts: PropTypes.array,
  hostsInBuildMode: PropTypes.array,
  reportOrigins: PropTypes.array,
  searchUrl: PropTypes.string,
  documentationUrl: PropTypes.string,
};

Dashboard.defaultProps = {
  status: {},
  overview: {},
  runDistribution: [],
  latestEvents: [],
  newHosts: [],
  hostsInBuildMode: [],
  reportOrigins: ['All'],
  searchUrl: '',
  documentationUrl: '',
};

export default Dashboard;
