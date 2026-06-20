import React from 'react';
import { fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntegrationTestHelper from 'foremanReact/common/IntegrationTestHelper';

import { submitForm } from '../../../../redux/actions/common/forms';

import { initialValues, ConnectedFormComponent } from './ForemanForm.fixtures';
import { APIMiddleware } from '../../../../redux/API';
import APIHelper from '../../../../redux/API/API';
import apiReducer from '../../../../redux/API/APIReducer';

jest.mock('../../../../redux/API/API');

const nameErrors = ['is too long', 'should not contain numbers'];
const baseErrors = [
  'does not have enough vitamins',
  'does not have enough proteins',
];
const reducers = {
  apiReducer,
};
const severity = 'warning';
const errorResponse = {
  response: {
    status: 422,
    data: {
      error: {
        errors: {
          name: nameErrors,
          base: baseErrors,
        },
        severity,
      },
    },
  },
};
const handleSubmit = (values, actions) =>
  submitForm({
    url: '/test/form',
    values,
    item: 'Test',
    message: __('Form was successfully created.'),
    actions,
  });

const props = {
  submitForm: handleSubmit,
  onCancel: () => jest.fn,
  initValues: initialValues,
};

describe('ForemanForm integration test', () => {
  it('should render form with errors', async () => {
    APIHelper.post.mockRejectedValue(errorResponse);

    const testHelper = new IntegrationTestHelper(reducers, [APIMiddleware]);

    const { container } = testHelper.mount(<ConnectedFormComponent {...props} />);

    const submitBtn = container.querySelector('button[type="submit"]');
    await act(async () => {
      fireEvent.click(submitBtn);
      await IntegrationTestHelper.flushAllPromises();
    });

    await waitFor(() => {
      const alert = container.querySelector('.pf-v6-c-alert, .pf-c-alert');
      expect(alert).toBeInTheDocument();
    });

    const alert = container.querySelector('.pf-v6-c-alert, .pf-c-alert');
    expect(alert).toMatchSnapshot();
  });
});
