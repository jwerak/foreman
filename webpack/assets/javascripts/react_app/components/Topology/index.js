import React, { useState, useEffect, useCallback } from 'react';
import { PageSection, Spinner, Alert } from '@patternfly/react-core';
import { foremanUrl } from '../../../foreman_tools';
import { translate as __ } from '../../common/I18n';
import TopologyVisualization from './TopologyVisualization';
import TopologyToolbar from './TopologyToolbar';
import TopologySidebar from './TopologySidebar';
import {
  PERSPECTIVES,
  DEFAULT_PERSPECTIVE,
  DEFAULT_LAYOUT,
} from './topologyConstants';

const TopologyPage = () => {
  const [perspective, setPerspective] = useState(DEFAULT_PERSPECTIVE);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHosts, setShowHosts] = useState(false);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchTopology = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const params = new URLSearchParams();
      if (showHosts) params.set('show_hosts', 'true');
      if (errorsOnly) params.set('errors_only', 'true');
      const apiPath = PERSPECTIVES[perspective].apiPath;
      const queryString = params.toString();
      const url = foremanUrl(
        queryString ? `${apiPath}?${queryString}` : apiPath
      );
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`${response.status}`);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [perspective, showHosts, errorsOnly]);

  useEffect(() => {
    document.title = `${__('Topology')} - Foreman`;
    fetchTopology();
  }, [fetchTopology]);

  if (error) {
    return (
      <PageSection>
        <Alert variant="danger" isInline title={__('Failed to load topology')}>
          {error}
        </Alert>
      </PageSection>
    );
  }

  if (loading || !data) {
    return (
      <PageSection
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '3rem',
        }}
      >
        <Spinner size="xl" aria-label={__('Loading topology')} />
      </PageSection>
    );
  }

  const sidebarOpen = selectedNode != null;

  return (
    <div className="topology-page">
      <TopologyVisualization
        data={data}
        layout={layout}
        onNodeSelect={setSelectedNode}
        toolbar={
          <TopologyToolbar
            perspective={perspective}
            onPerspectiveChange={setPerspective}
            layout={layout}
            onLayoutChange={setLayout}
            showHosts={showHosts}
            onShowHostsChange={setShowHosts}
            errorsOnly={errorsOnly}
            onErrorsOnlyChange={setErrorsOnly}
            meta={data.meta}
          />
        }
        sidebar={
          <TopologySidebar
            selectedNode={selectedNode}
            isOpen={sidebarOpen}
            onClose={() => setSelectedNode(null)}
            perspective={perspective}
          />
        }
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
};

export default TopologyPage;
