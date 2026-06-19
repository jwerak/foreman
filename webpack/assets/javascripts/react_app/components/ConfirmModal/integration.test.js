import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { Button } from '@patternfly/react-core';
import store from '../../redux';
import ConfirmModal, { openConfirmModal } from './index';

describe('Confirm modal', () => {
  it('should flow', async () => {
    const btnText = 'Trigger confirm!';
    const modalMessage = 'Are you sure?';
    const modalTitle = 'Hello there';
    const onConfirm = jest.fn();
    const handleConfirmClick = () => {
      store.dispatch(
        openConfirmModal({
          title: modalTitle,
          message: modalMessage,
          onConfirm,
        })
      );
    };

    render(
      <Provider store={store}>
        <ConfirmModal />
        <Button id="btn-confirm-trigger" onClick={handleConfirmClick}>
          {btnText}
        </Button>
      </Provider>
    );

    // Click the trigger button to open the modal
    act(() => {
      fireEvent.click(screen.getByText(btnText));
    });

    // Verify modal content
    expect(screen.getByText(modalMessage)).toBeInTheDocument();
    expect(screen.getByText(modalTitle)).toBeInTheDocument();

    expect(onConfirm).toBeCalledTimes(0);

    // Click the Confirm button in the modal
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    });

    expect(onConfirm).toBeCalledTimes(1);

    // The modal should be hidden
    expect(screen.queryByText(modalMessage)).not.toBeInTheDocument();
  });
});
