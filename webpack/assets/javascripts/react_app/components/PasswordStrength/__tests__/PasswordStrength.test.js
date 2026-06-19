import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  passwordStrengthDataWithVerify,
  passwordStrengthDataWithInputIds,
  passwordStrengthDefaultProps,
} from '../PasswordStrength.fixtures';

import PasswordStrength from '../PasswordStrength';

const createStubs = () => ({
  updatePassword: jest.fn(),
  updatePasswordConfirmation: jest.fn(),
});

const createProps = (props = {}) => ({
  ...createStubs(),
  ...passwordStrengthDefaultProps,
  ...props,
});

describe('PasswordStrength component', () => {
  jest
    .spyOn(document, 'getElementById')
    .mockImplementation(id => ({ value: id }));

  describe('rendering', () => {
    it('renders password-strength', () => {
      const props = createProps();
      const { container } = render(<PasswordStrength {...props} />);

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(
        container.querySelector(`input#${props.data.id}`)
      ).toBeInTheDocument();
      expect(screen.getByText('some-password-error')).toBeInTheDocument();
      expect(
        screen.queryByText('Verify')
      ).not.toBeInTheDocument();
    });

    it('renders password-strength with password-confirmation', () => {
      const props = createProps({
        data: { ...passwordStrengthDataWithVerify },
      });
      const { container } = render(<PasswordStrength {...props} />);

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
      expect(
        container.querySelector('input#password_confirmation')
      ).toBeInTheDocument();
      expect(
        screen.getByText('some-password-confirmation-error')
      ).toBeInTheDocument();
    });

    it('renders password-strength with unmatched password-confirmation', () => {
      const props = createProps({
        doesPasswordsMatch: false,
        data: { ...passwordStrengthDataWithVerify },
      });
      render(<PasswordStrength {...props} />);

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
      expect(
        screen.getByText('Passwords do not match')
      ).toBeInTheDocument();
    });

    it('renders password-strength with user-input-ids', () => {
      const props = createProps({
        data: { ...passwordStrengthDataWithInputIds },
      });
      const { container } = render(<PasswordStrength {...props} />);

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(
        container.querySelector(`input#${props.data.id}`)
      ).toBeInTheDocument();
      expect(document.getElementById).toHaveBeenCalledWith('input1');
      expect(document.getElementById).toHaveBeenCalledWith('input2');
    });
  });

  describe('triggering', () => {
    it('should trigger updatePassword', () => {
      const props = createProps();
      const { container } = render(<PasswordStrength {...props} />);

      const passwordInput = container.querySelector(
        `input#${props.data.id}`
      );
      fireEvent.change(passwordInput, { target: { value: 'some-value' } });

      expect(props.updatePassword).toHaveBeenCalledWith('some-value');
    });

    it('should trigger updatePasswordConfirmation', () => {
      const props = createProps({
        data: { ...passwordStrengthDataWithVerify },
      });
      const { container } = render(<PasswordStrength {...props} />);

      const passwordConfirmationInput = container.querySelector(
        'input#password_confirmation'
      );
      fireEvent.change(passwordConfirmationInput, {
        target: { value: 'some-value' },
      });

      expect(props.updatePasswordConfirmation).toHaveBeenCalledWith(
        'some-value'
      );
    });
  });
});
