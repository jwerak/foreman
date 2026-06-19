import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { STATUS } from '../../../constants';
import Loader from './index';

jest.unmock('./index');

const loaderChildren = [
  <div key="0" className="success">
    Success
  </div>,
  <div key="1" className="failure">
    Failure
  </div>,
];

describe('Loader', () => {
  describe('renders correct content based on status', () => {
    it('success', () => {
      render(
        <Loader status={STATUS.RESOLVED}>{loaderChildren}</Loader>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('failure', () => {
      render(<Loader status={STATUS.ERROR}>{loaderChildren}</Loader>);

      expect(screen.getByText('Failure')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('pending', () => {
      const { container } = render(
        <Loader status={STATUS.PENDING}>{loaderChildren}</Loader>
      );

      expect(container.querySelector('.loader-root')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });

    it('pending-different-spinner', () => {
      render(
        <Loader status={STATUS.PENDING} spinnerSize="xs">
          {loaderChildren}
        </Loader>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('default case', () => {
      render(<Loader />);

      expect(screen.getByText('Invalid Status')).toBeInTheDocument();
    });
  });
});
