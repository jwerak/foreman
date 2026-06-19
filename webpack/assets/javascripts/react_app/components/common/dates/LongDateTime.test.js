import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LongDateTime from './LongDateTime';
import { i18nProviderWrapperFactory } from '../../../common/i18nProviderWrapperFactory';

describe('LongDateTime', () => {
  const date = new Date('2017-10-13 00:54:55 -1100');
  const now = new Date('2017-10-28 00:00:00 -1100');
  const IntlDate = i18nProviderWrapperFactory(now, 'UTC')(LongDateTime);

  it('formats date', async () => {
    render(<IntlDate date={date} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText(/October 13, 2017/)).toBeInTheDocument();
    });
  });

  it('formats date with relative tooltip', async () => {
    render(
      <IntlDate
        date={date}
        defaultValue="Default value"
        showRelativeTimeTooltip
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/October 13, 2017/)).toBeInTheDocument();
      expect(screen.getByText(/October 13, 2017/).closest('span[title]')).toHaveAttribute(
        'title',
        '15 days ago'
      );
    });
  });

  it('formats date with seconds', async () => {
    render(<IntlDate date={date} seconds defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText(/October 13, 2017/)).toBeInTheDocument();
      expect(screen.getByText(/11:54:55/)).toBeInTheDocument();
    });
  });

  it('renders default value', async () => {
    render(<IntlDate date={null} defaultValue="Default value" />);

    await waitFor(() => {
      expect(screen.getByText('Default value')).toBeInTheDocument();
    });
  });
});
