import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Form from './Form';

describe('Form', () => {
  it('should render a form', () => {
    const { container } = render(<Form />);

    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should display one base error', () => {
    render(
      <Form error={{ errorMsgs: ['invalid something'], severity: 'danger' }} />
    );

    expect(screen.getByText('invalid something')).toBeInTheDocument();
  });

  it('should display multiple base errors', () => {
    render(
      <Form
        error={{
          errorMsgs: ['invalid something', 'error too'],
          severity: 'danger',
        }}
      />
    );

    expect(screen.getByText('invalid something')).toBeInTheDocument();
    expect(screen.getByText('error too')).toBeInTheDocument();
  });

  it('should accept base error title', () => {
    render(
      <Form
        error={{
          errorMsgs: ['invalid something'],
          severity: 'danger',
        }}
        errorTitle="Oops"
      />
    );

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.getByText('invalid something')).toBeInTheDocument();
  });

  it('should dispaly form errors as warning', () => {
    render(
      <Form
        error={{
          errorMsgs: ['Do not feed the trolls'],
          severity: 'warning',
        }}
      />
    );

    expect(screen.getByText('Do not feed the trolls')).toBeInTheDocument();
  });
});
