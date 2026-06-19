import React from 'react';
import '@testing-library/jest-dom';
import { rtlHelpers } from '../../../../../common/testHelpers';
import General from '../../components/General';
import { generalComponentProps } from '../fixtures';

describe('RegistrationCommandsPage - General', () => {
  it('renders', () => {
    const { container } = rtlHelpers.renderWithStore(
      <General {...generalComponentProps} />
    );
    expect(container).toMatchSnapshot();
  });
});
