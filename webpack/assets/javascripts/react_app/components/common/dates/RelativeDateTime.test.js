import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelativeDateTime from './RelativeDateTime';
import { i18nProviderWrapperFactory } from '../../../common/i18nProviderWrapperFactory';

describe('RelativeDateTime', () => {
  const date = new Date('2017-10-13 00:54:55 -1100');
  const now = new Date('2017-10-28 00:00:00 -1100');
  const IntlDate = i18nProviderWrapperFactory(now, 'UTC')(RelativeDateTime);

  it('formats date', async () => {
    render(<IntlDate date={date} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText(/15 days ago/)).toBeInTheDocument();
    });
  });

  it('renders default value', async () => {
    render(<IntlDate date={null} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText('Default value')).toBeInTheDocument();
    });
  });
});
