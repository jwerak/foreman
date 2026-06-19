import React from 'react';
import { fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import IntegrationTestHelper from '../../../common/IntegrationTestHelper';

import { passwords } from '../PasswordStrength.fixtures';
import PasswordStrength, { reducers } from '../index';

// mock the document.getElementById
document.getElementById = jest.fn(id => ({ value: passwords[id].password }));

describe('PasswordStrength integration test', () => {
  // The ReactPasswordStrength component is a controlled component that reads
  // input.value via a ref in its handleChange callback. We need to set the
  // native value setter to bypass React's controlled input behavior, then
  // dispatch a native input event to trigger the component's change handler.
  const setInputValue = (input, value) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(input, value);
    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  it('should flow', () => {
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const { container } = integrationTestHelper.mount(
      <div>
        <input id="username" value={passwords.username.password} readOnly />
        <input id="email" value={passwords.email.password} readOnly />
        <PasswordStrength
          data={{
            className: 'form-control',
            id: 'user_password',
            name: 'user[password]',
            verify: { name: 'user[password_confirmation]' },
            userInputIds: ['username', 'email'],
          }}
        />
      </div>
    );

    integrationTestHelper.takeStoreSnapshot('initial state');

    Object.keys(passwords).forEach(key => {
      const { password, expected } = passwords[key];

      const passwordInput = container.querySelector('input#user_password');
      setInputValue(passwordInput, password);

      // Re-query the warning element each time as the component re-renders
      const passwordWarning = container.querySelector(
        '.ReactPasswordStrength-strength-desc'
      );
      expect(passwordWarning.textContent).toBe(expected);
      integrationTestHelper.takeStoreAndLastActionSnapshot(`${key} fixture`);
    });

    const passwordConfirmationInput = container.querySelector(
      'input#password_confirmation'
    );
    setInputValue(passwordConfirmationInput, passwords.strong.password);
    expect(container.querySelectorAll('.help-block')).toHaveLength(1);
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'unmached password confirmation'
    );

    setInputValue(passwordConfirmationInput, passwords.veryStrong.password);
    expect(container.querySelectorAll('.help-block')).toHaveLength(0);
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'mached password confirmation'
    );
  });
});
