import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

import DiffModal from '../DiffModal';
import { rtlHelpers } from '../../../../common/rtlTestHelpers';

configure({ testIdAttribute: 'data-ouia-component-id' });

const initialState = {
  diffModal: {
    isOpen: true,
    diff: 'some diff',
    title: 'log1',
    diffViewType: 'split',
  },
};

describe('DiffModal', () => {
  describe('rendering', () => {
    it('should render modal with title and close button', () => {
      rtlHelpers.renderWithStore(
        <DiffModal oldText="old" newText="new" />,
        initialState
      );

      expect(screen.getByText('log1')).toBeInTheDocument();
      const closeButton = document.querySelector('.diff-modal-close');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('close', 'diff-modal-close');
    });
  });

  describe('triggering..', () => {
    it('should trigger onHide', async () => {
      rtlHelpers.renderWithStore(
        <DiffModal oldText="old" newText="new" />,
        initialState
      );
      const closeButton = screen.getByTestId('diff-modal-close-button');

      await act(async () => await fireEvent.click(closeButton));

      expect(screen.queryByText('log1')).not.toBeInTheDocument();
    });
  });
});
