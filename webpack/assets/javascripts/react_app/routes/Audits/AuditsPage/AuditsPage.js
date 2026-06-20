import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import './auditspage.scss';

import { translate as __ } from '../../../common/I18n';
import { getManualURL } from '../../../common/helpers';
import PageLayout from '../../common/PageLayout/PageLayout';
import AuditsTable from './components/AuditsTable';
import { AUDITS_SEARCH_PROPS } from '../constants';
import {
  selectAudits,
  selectAuditsCount,
  selectAuditsMessage,
  selectAuditsPerPage,
  selectAuditsSearch,
  selectAuditsSelectedPage,
  selectAuditsHasData,
  selectAuditsHasError,
  selectAuditsIsLoadingPage,
} from './AuditsPageSelectors';
import * as auditsActions from './AuditsPageActions';

const AuditsPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Redux state
  const audits = useSelector(selectAudits);
  const isLoading = useSelector(selectAuditsIsLoadingPage);
  const itemCount = useSelector(selectAuditsCount);
  const message = useSelector(selectAuditsMessage);
  const page = useSelector(selectAuditsSelectedPage);
  const perPage = useSelector(selectAuditsPerPage);
  const searchQuery = useSelector(selectAuditsSearch);
  const hasError = useSelector(selectAuditsHasError);
  const hasData = useSelector(selectAuditsHasData);

  // Redux actions
  const initializeAudits = () => dispatch(auditsActions.initializeAudits());
  const fetchAndPush = params => dispatch(auditsActions.fetchAndPush(params));

  // callOnMount behavior
  useEffect(() => {
    initializeAudits();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // callOnPopState behavior
  const didMount = useRef(false);
  useEffect(() => {
    if (history.action === 'POP' && didMount.current) {
      initializeAudits();
    } else {
      didMount.current = true;
    }
  }, [location.search, history.action]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout
      header={__('Audits')}
      searchable
      searchProps={AUDITS_SEARCH_PROPS}
      searchQuery={searchQuery}
      isLoading={isLoading && hasData}
      onSearch={search => fetchAndPush({ searchQuery: search, page: 1 })}
      toolbarButtons={
        <Button
          ouiaId="audits-documentation-button"
          component="a"
          className="btn-docs"
          href={getManualURL('4.1.4Auditing')}
          rel="external noreferrer noopener"
          target="_blank"
          variant="secondary"
        >
          {__(' Documentation')}
        </Button>
      }
    >
      <AuditsTable
        fetchAndPush={fetchAndPush}
        isLoading={isLoading}
        hasData={hasData}
        hasError={hasError}
        message={message}
        audits={audits}
        itemCount={itemCount}
        page={page}
        perPage={perPage}
      />
    </PageLayout>
  );
};

export default AuditsPage;
