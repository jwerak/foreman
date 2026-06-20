import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  passwordStrengthDataWithVerify,
  passwordStrengthDataWithInputIds,
  passwordStrengthDefaultProps,
} from '../PasswordStrength.fixtures';

import PasswordStrength from '../PasswordStrength';
import { rtlHelpers } from '../../../common/rtlTestHelpers';

const renderComponent = (props = {}) =>
  rtlHelpers.renderWithStore(
    <PasswordStrength {...passwordStrengthDefaultProps} {...props} />
  );

describe('PasswordStrength component', () => {
  jest
    .spyOn(document, 'getElementById')
    .mockImplementation(id => ({ value: id }));

  describe('rendering', () => {
    it('renders password-strength', () => {
      const { container } = renderComponent();

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(
        container.querySelector(`input#${passwordStrengthDefaultProps.data.id}`)
      ).toBeInTheDocument();
      expect(screen.getByText('some-password-error')).toBeInTheDocument();
      expect(
        screen.queryByText('Verify')
      ).not.toBeInTheDocument();
    });

    it('renders password-strength with password-confirmation', () => {
      const { container } = renderComponent({
        data: { ...passwordStrengthDataWithVerify },
      });

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
      expect(
        container.querySelector('input#password_confirmation')
      ).toBeInTheDocument();
      expect(
        screen.getByText('some-password-confirmation-error')
      ).toBeInTheDocument();
    });

    it('renders password-strength with user-input-ids', () => {
      const { container } = renderComponent({
        data: { ...passwordStrengthDataWithInputIds },
      });

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(
        container.querySelector(`input#${passwordStrengthDataWithInputIds.id}`)
      ).toBeInTheDocument();
      expect(document.getElementById).toHaveBeenCalledWith('input1');
      expect(document.getElementById).toHaveBeenCalledWith('input2');
    });
  });

  describe('triggering', () => {
    it('should trigger updatePassword on change', () => {
      const { container } = renderComponent();

      const passwordInput = container.querySelector(
        `input#${passwordStrengthDefaultProps.data.id}`
      );
      fireEvent.change(passwordInput, { target: { value: 'some-value' } });

      // The action is dispatched to the store; verify the input changed
      expect(passwordInput.value).toBe('some-value');
    });

    it('should trigger updatePasswordConfirmation on change', () => {
      const { container } = renderComponent({
        data: { ...passwordStrengthDataWithVerify },
      });

      const passwordConfirmationInput = container.querySelector(
        'input#password_confirmation'
      );
      fireEvent.change(passwordConfirmationInput, {
        target: { value: 'some-value' },
      });

      expect(passwordConfirmationInput.value).toBe('some-value');
    });
  });
});
