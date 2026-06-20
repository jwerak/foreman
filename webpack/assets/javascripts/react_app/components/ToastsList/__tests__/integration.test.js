import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';

import store from '../../../redux';
import ToastsList, { addToast, deleteToast } from '../index';
import { toast } from './fixtures';

describe('ToastsList', () => {
  it('integration', () => {
    render(
      <Provider store={store}>
        <ToastsList />
      </Provider>
    );

    expect(
      document.body.querySelectorAll('.pf-v6-c-alert.foreman-toast')
    ).toHaveLength(0);

    act(() => {
      store.dispatch(addToast(toast));
    });

    const alerts = document.body.querySelectorAll(
      '.pf-v6-c-alert.foreman-toast'
    );
    expect(alerts).toHaveLength(1);
    expect(screen.getByText(/message/)).toBeInTheDocument();

    act(() => {
      store.dispatch(deleteToast(toast.key));
    });

    expect(
      document.body.querySelectorAll('.pf-v6-c-alert.foreman-toast')
    ).toHaveLength(0);
  });
});
