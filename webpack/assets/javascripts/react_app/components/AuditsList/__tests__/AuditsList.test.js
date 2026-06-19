import React from 'react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { rtlHelpers } from '../../../common/testHelpers';
import AuditsList from '../../AuditsList';
import { AuditsProps } from './AuditsList.fixtures';

describe('AuditsList', () => {
  it('render resources list', async () => {
    let result;
    await act(async () => {
      result = rtlHelpers.renderWithI18n(
        <AuditsList data={{ ...AuditsProps }} fetchAndPush={jest.fn()} />,
        new Date('2025-01-15T12:00:00Z'),
        'UTC'
      );
    });
    expect(result.container).toMatchSnapshot();
  });
});
