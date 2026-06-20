import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../../common/rtlTestHelpers';
import AuditsPage from '../AuditsPage';
import { AuditsProps } from '../../../../components/AuditsList/__tests__/AuditsList.fixtures';

// Mock the actions to prevent actual API calls
jest.mock('../AuditsPageActions', () => ({
  initializeAudits: () => () => {},
  fetchAndPush: () => () => {},
  fetchAudits: () => () => {},
}));

const defaultState = {
  auditsPage: {
    data: {
      audits: AuditsProps.audits,
      isLoading: false,
      hasData: true,
      hasError: false,
      message: '',
    },
    query: {
      page: 1,
      perPage: 20,
      searchQuery: '',
      itemCount: AuditsProps.audits.length,
    },
  },
};

const renderAuditsPage = (stateOverrides = {}) => {
  const store = createTestStore({ ...defaultState, ...stateOverrides });
  return render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <MemoryRouter>
          <AuditsPage />
        </MemoryRouter>
      </IntlProvider>
    </Provider>
  );
};

describe('AuditsPage', () => {
  describe('rendering', () => {
    it('render audits page', () => {
      const { container } = renderAuditsPage();
      expect(container).toMatchSnapshot();
    });

    it('render audits page with error', () => {
      const { container } = renderAuditsPage({
        auditsPage: {
          data: {
            audits: [],
            isLoading: false,
            hasData: false,
            hasError: true,
            message: { type: 'error', text: 'some-error' },
          },
          query: {
            page: 1,
            perPage: 20,
            searchQuery: '',
            itemCount: 0,
          },
        },
      });
      expect(container).toMatchSnapshot();
    });
  });
});
