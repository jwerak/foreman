import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../../common/rtlTestHelpers';
import AuditsPage from '../AuditsPage';
import { auditsPageProps } from '../AuditsPage.fixtures';
import { AuditsProps } from '../../../../components/AuditsList/__tests__/AuditsList.fixtures';

const fullAuditsPageProps = {
  ...auditsPageProps,
  audits: AuditsProps.audits,
  itemCount: AuditsProps.audits.length,
};

const renderAuditsPage = (props = {}) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <MemoryRouter>
          <AuditsPage {...fullAuditsPageProps} {...props} />
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

    it('render loading audits page', () => {
      const { container } = renderAuditsPage({
        hasError: false,
        hasData: true,
        audits: [],
      });
      expect(container).toMatchSnapshot();
    });

    it('render audits page w/empty audits', () => {
      const { container } = renderAuditsPage({
        hasError: true,
        message: { type: 'empty', text: 'no audits' },
      });
      expect(container).toMatchSnapshot();
    });

    it('render audits page w/error', () => {
      const { container } = renderAuditsPage({
        hasError: true,
        message: { type: 'error', text: 'some-error' },
      });
      expect(container).toMatchSnapshot();
    });
  });
});
