import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  PageSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { translate as __ } from '../../common/I18n';
import { foremanUrl } from '../../../foreman_tools';
import AggregateStatusCard from './AggregateStatusCard';
import StatusChartCard from './StatusChartCard';
import RunDistributionCard from './RunDistributionCard';
import LatestEventsCard from './LatestEventsCard';
import NewHostsCard from './NewHostsCard';
import BuildModeCard from './BuildModeCard';
import Slot from '../common/Slot/Slot';

const Dashboard = ({
  status: initialStatus,
  overview: initialOverview,
  runDistribution: initialRunDistribution,
  latestEvents: initialLatestEvents,
  newHosts: initialNewHosts,
  hostsInBuildMode: initialBuildHosts,
  reportOrigins,
  searchUrl,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [status, setStatus] = useState(initialStatus);
  const [overview, setOverview] = useState(initialOverview);
  const [runDistribution, setRunDistribution] = useState(initialRunDistribution);
  const [latestEvents, setLatestEvents] = useState(initialLatestEvents);
  const [newHosts, setNewHosts] = useState(initialNewHosts);
  const [hostsInBuildMode, setHostsInBuildMode] = useState(initialBuildHosts);
  const [loading, setLoading] = useState(false);

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
};

export default Dashboard;
