import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IsoDate from './IsoDate';
import { i18nProviderWrapperFactory } from '../../../common/i18nProviderWrapperFactory';

describe('IsoDate', () => {
  const date = new Date('2017-10-13 00:54:55 -1100');
  const now = new Date('2017-10-28 00:00:00 -1100');
  const IntlDate = i18nProviderWrapperFactory(now, 'UTC')(IsoDate);

  it('formats date', async () => {
    render(<IntlDate date={date} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText(/10\/13\/2017/)).toBeInTheDocument();
    });
  });

  it('renders default value', async () => {
    render(<IntlDate date={null} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText('Default value')).toBeInTheDocument();
    });
  });
});
