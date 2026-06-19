import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ForemanModalHeader from '../ForemanModalHeader';
import * as ModalContext from '../../ForemanModalHooks';

const contextValues = {
  title: 'modal title passed thru mock context :)',
  onClose: jest.fn(),
};

jest
  .spyOn(ModalContext, 'useModalContext')
  .mockImplementation(() => contextValues);

describe('ForemanModal.Header', () => {
  describe('rendering', () => {
    it('should render with default markup', () => {
      render(<ForemanModalHeader />);
      expect(
        screen.getByText(contextValues.title)
      ).toBeInTheDocument();
    });

    it('should render with supplied children', () => {
      render(
        <ForemanModalHeader>
          <h1>Modal Title</h1>
        </ForemanModalHeader>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      // title from context is also rendered
      expect(
        screen.getByText(contextValues.title)
      ).toBeInTheDocument();
    });
  });

  describe('data flow', () => {
    it('renders the title from context', () => {
      render(<ForemanModalHeader />);
      expect(
        screen.getByText(contextValues.title)
      ).toBeInTheDocument();
    });

    it('passes props to the wrapper element using spread', () => {
      const { container } = render(
        <ForemanModalHeader data-testid="custom-header" className="my-class" />
      );
      const header = container.querySelector('.foreman-modal-header');
      expect(header).toHaveClass('my-class');
    });

    it('does not render title heading when context title is empty', () => {
      jest
        .spyOn(ModalContext, 'useModalContext')
        .mockImplementation(() => ({ title: '', onClose: jest.fn() }));

      const { container } = render(<ForemanModalHeader />);
      expect(container.querySelector('h4')).not.toBeInTheDocument();

      // Restore original mock
      jest
        .spyOn(ModalContext, 'useModalContext')
        .mockImplementation(() => contextValues);
    });
  });
});
