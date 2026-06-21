import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import {
  Pagination,
  SearchInput,
  Spinner,
  Label,
  Button,
} from '@patternfly/react-core';
import { foremanUrl } from '../../../foreman_tools';
import { translate as __ } from '../../common/I18n';
import { NODE_TYPES } from './topologyConstants';

const StatusLabel = ({ status }) => {
  if (status === 0) return <Label color="green">{__('OK')}</Label>;
  if (status === 1) return <Label color="orange">{__('Warning')}</Label>;
  if (status === 2) return <Label color="red">{__('Error')}</Label>;
  return <Label color="grey">{__('Unknown')}</Label>;
};

const buildSearchQuery = (nodeType, nodeId, search) => {
  let base;
  switch (nodeType) {
    case NODE_TYPES.COMPUTE_RESOURCE:
      base = `compute_resource_id = ${nodeId}`;
      break;
    case NODE_TYPES.HOSTGROUP:
      base = `hostgroup_id = ${nodeId}`;
      break;
    case NODE_TYPES.BARE_METAL:
      base = 'has compute_resource = false';
      break;
    default:
      return search || '';
  }
  return search ? `${base} and name ~ ${search}` : base;
};

const SidebarHostTable = ({ nodeType, nodeId }) => {
  const [hosts, setHosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nodeType === NODE_TYPES.HOST) return;
    if (!nodeId && nodeType !== NODE_TYPES.BARE_METAL) return;

    const fetchHosts = async () => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(nodeType, nodeId, search);
        const url = foremanUrl(
          `/api/v2/hosts?thin=true&search=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}`
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
        setHosts(json.results || []);
        setTotal(json.total || 0);
      } catch {
        setHosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, [nodeType, nodeId, page, perPage, search]);

  if (nodeType === NODE_TYPES.HOST) return null;

  return (
    <div>
      <SearchInput
        placeholder={__('Filter hosts by name...')}
        value={search}
        onChange={(_event, value) => {
          setSearch(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch('');
          setPage(1);
        }}
        style={{ marginBottom: '0.5rem' }}
      />

      {loading ? (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Spinner size="md" aria-label={__('Loading hosts')} />
        </div>
      ) : hosts.length === 0 ? (
        <div style={{ padding: '0.5rem 0', color: 'var(--pf-t--global--color--status--info--default)' }}>
          {__('No hosts found.')}
        </div>
      ) : (
        <>
          <Table aria-label={__('Hosts')} variant="compact">
            <Thead>
              <Tr>
                <Th>{__('Name')}</Th>
                <Th>{__('Status')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {hosts.map(host => (
                <Tr key={host.id}>
                  <Td>
                    <Button
                      variant="link"
                      component="a"
                      href={`/new/hosts/${host.name}`}
                      isInline
                    >
                      {host.name}
                    </Button>
                  </Td>
                  <Td>
                    <StatusLabel status={host.global_status} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination
            itemCount={total}
            page={page}
            perPage={perPage}
            onSetPage={(_event, p) => setPage(p)}
            onPerPageSelect={(_event, pp) => {
              setPerPage(pp);
              setPage(1);
            }}
            isCompact
          />
        </>
      )}
    </div>
  );
};

export default SidebarHostTable;
