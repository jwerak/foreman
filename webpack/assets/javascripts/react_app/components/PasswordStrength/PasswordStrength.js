import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import ReactPasswordStrength from 'react-password-strength';
import { translate as __ } from '../../../react_app/common/I18n';
import CommonForm from '../common/forms/CommonForm';
import {
  updatePassword as updatePasswordAction,
  updatePasswordConfirmation as updatePasswordConfirmationAction,
} from './PasswordStrengthActions';
import {
  doesPasswordsMatch as selectDoesPasswordsMatch,
  passwordPresent as selectPasswordPresent,
} from './PasswordStrengthSelectors';

import './PasswordStrength.scss';

const PasswordStrength = ({
  data: { className, id, name, verify, error, userInputIds, required },
}) => {
  const dispatch = useDispatch();
  const doesPasswordsMatch = useSelector(state =>
    selectDoesPasswordsMatch(state.passwordStrength)
  );
  const passwordPresent = useSelector(state =>
    selectPasswordPresent(state.passwordStrength)
  );
  const updatePassword = password =>
    dispatch(updatePasswordAction(password));
  const updatePasswordConfirmation = password =>
    dispatch(updatePasswordConfirmationAction(password));
  const userInputs =
    userInputIds && userInputIds.length > 0
      ? userInputIds.map(input => document.getElementById(input).value)
      : [];

  return (
    <div>
      <CommonForm
        label={__('Password')}
        touched
        error={!passwordPresent && error}
        required={required}
      >
        <ReactPasswordStrength
          changeCallback={({ password }) => updatePassword(password)}
          minLength={6}
          minScore={2}
          userInputs={userInputs}
          tooShortWord={__('Too short')}
          scoreWords={[
            __('Weak'),
            __('Medium'),
            __('Normal'),
            __('Strong'),
            __('Very strong'),
          ]}
          inputProps={{ name, id, className, autoComplete: 'new-password' }}
        />
      </CommonForm>
      {verify && (
        <CommonForm
          label={__('Verify')}
          touched
          required={required}
          error={
            doesPasswordsMatch ? verify.error : __('Passwords do not match')
          }
        >
          <input
            id="password_confirmation"
            name={verify.name}
            type="password"
            onChange={({ target }) => updatePasswordConfirmation(target.value)}
            className="form-control"
          />
        </CommonForm>
      )}
    </div>
  );
};

PasswordStrength.propTypes = {
  data: PropTypes.shape({
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    error: PropTypes.node,
    userInputIds: PropTypes.arrayOf(PropTypes.string),
    required: PropTypes.bool,
    verify: PropTypes.shape({
      name: PropTypes.string.isRequired,
      error: PropTypes.node,
    }),
  }).isRequired,
};

export default PasswordStrength;
