import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rtlHelpers } from 'foremanReact/common/rtlTestHelpers';
import ImpersonateIcon from './ImpersonateIcon';

describe('ImpersonateIcon', () => {
  it('should render', () => {
    const { container } = rtlHelpers.renderWithStore(
      <ImpersonateIcon stopImpersonationUrl="/stop_impersonation" />
    );
    expect(container).toMatchSnapshot();
  });
});
