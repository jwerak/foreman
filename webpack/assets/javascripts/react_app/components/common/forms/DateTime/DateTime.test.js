import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { DateTimeProps, DateTimeWithRequireAndInfo } from './DateTime.fixtures';
import DateTime from './DateTime';

const stabilizeHtml = container => {
  const clone = container.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(el => {
    el.id = el.id.replace(/time-picker-\w+/g, 'time-picker-stable');
  });
  return clone;
};

describe('DateTime', () => {
  describe('rendering', () => {
    it('renders Report Date input', () => {
      const { container } = render(
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <DateTime {...DateTimeProps} />
        </Formik>
      );
      expect(stabilizeHtml(container)).toMatchSnapshot();
    });

    it('renders with Require and Info', () => {
      const { container } = render(
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <DateTime {...DateTimeWithRequireAndInfo} />
        </Formik>
      );
      expect(stabilizeHtml(container)).toMatchSnapshot();
    });
  });
});
