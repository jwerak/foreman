import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Popover, Button, Icon } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import CommonForm from './CommonForm';

describe('common Form', () => {
  it('should display a label field', () => {
    render(<CommonForm label="my label" />);

    expect(screen.getByText('my label')).toBeInTheDocument();
  });

  it('should accept a required field', () => {
    render(<CommonForm label="my label" required />);

    expect(screen.getByText(/my label/)).toBeInTheDocument();
    expect(screen.getByText('*', { exact: false })).toBeInTheDocument();
  });

  it('should display validation errors if touched', () => {
    const { container } = render(
      <CommonForm label="my label" touched error="is required!" />
    );

    expect(screen.getByText('is required!')).toBeInTheDocument();
    expect(container.querySelector('.has-error')).toBeInTheDocument();
  });

  it('should not display validation errors if not touched', () => {
    render(<CommonForm label="my label" error="is required!" />);

    expect(screen.queryByText('is required!')).not.toBeInTheDocument();
  });

  it('should not display validation errors if there are none', () => {
    const { container } = render(<CommonForm label="my label" />);

    expect(container.querySelector('.has-error')).not.toBeInTheDocument();
    expect(container.querySelector('.error-message')).not.toBeInTheDocument();
  });

  it('should accept customized input class', () => {
    const { container } = render(
      <CommonForm name="name" inputClassName="col-md-10" label="Name" />
    );

    expect(container.querySelector('.col-md-10')).toBeInTheDocument();
  });

  it('should render tooltip help', () => {
    const { container } = render(
      <CommonForm
        name="name"
        label="Required form field"
        required
        tooltipHelp={
          <Popover bodyContent="This is a helpful tooltip">
            <Button
              type="button"
              variant="plain"
              onClick={e => e.preventDefault()}
            >
              <Icon isInline>
                <HelpIcon />
              </Icon>
            </Button>
          </Popover>
        }
      />
    );

    expect(screen.getByText(/Required form field/)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
