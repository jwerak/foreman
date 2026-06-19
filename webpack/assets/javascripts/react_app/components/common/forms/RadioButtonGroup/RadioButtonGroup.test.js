import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import RadioButtonGroup from './RadioButtonGroup';

const radios = [
  {
    label: 'A',
    checked: true,
    value: 'A',
  },
  {
    label: 'B',
    checked: false,
    value: 'B',
  },
];

const commonFixtures = {
  name: 'RadioButtonGroupTest',
  controlLabel: 'RadioButtonGroupLabel',
};

describe('radio button group', () => {
  it('should render group of radio buttons', () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <RadioButtonGroup radios={radios} {...commonFixtures} />
      </Formik>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render disabled radio buttons', () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <RadioButtonGroup radios={radios} {...commonFixtures} disabled />
      </Formik>
    );
    expect(container).toMatchSnapshot();
  });
});
