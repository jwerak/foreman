import React from 'react';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntegrationTestHelper from '../../../../common/IntegrationTestHelper';
import history from '../../../../history';
import * as selectors from '../RegistrationCommandsPageSelectors';
import RegistrationCommandsPage from '../index';
import { APIMiddleware } from '../../../../redux/API';
import apiReducer from '../../../../redux/API/APIReducer';
import * as apiHelpers from '../../../../redux/API/APIHelpers';
import { spySelector } from './fixtures';
import ForemanContext from '../../../../Root/Context/ForemanContext';

jest.mock('../../../../redux/API/API');

jest.mock('../../../../components/common/Slot', () => () => <></>);
jest
  .spyOn(ForemanContext, 'useForemanOrganization')
  .mockReturnValue({ id: 3, title: 'ACME' });
jest
  .spyOn(ForemanContext, 'useForemanLocation')
  .mockReturnValue({ id: 4, title: 'munich' });

jest.spyOn(apiHelpers, 'getApiResponse').mockReturnValue({ data: {} });

spySelector(selectors);

const reducers = {
  apiReducer,
};
describe('RegistrationCommandsPage integration', () => {
  it('generate command', () => {
    const integrationTestHelper = new IntegrationTestHelper(reducers, [
      thunk,
      APIMiddleware,
    ]);
    const { container } = integrationTestHelper.mount(
      <Router history={history}>
        <RegistrationCommandsPage />
      </Router>
    );
    integrationTestHelper.takeStoreAndLastActionSnapshot('rendered');

    const submitBtn = container.querySelector('#generate_btn');
    const commandField = container.querySelector(
      '.pf-v6-c-clipboard-copy__expandable-content pre'
    );

    expect(submitBtn).not.toHaveClass('pf-m-disabled');
    expect(commandField).toBeNull();

    // check that only current Org and Loc are selectable
    const orgSelect = container.querySelector('#reg_organization');
    const organizationOptions = orgSelect.querySelectorAll('option');
    // Should have 2 options: "Not specified" + ACME (id=3)
    expect(organizationOptions).toHaveLength(2);
    // No option with value "1"
    const orgValues = Array.from(organizationOptions).map(o => o.value);
    expect(orgValues).not.toContain('1');
    expect(orgValues).toContain('3');

    const locSelect = container.querySelector('#reg_location');
    const locationOptions = locSelect.querySelectorAll('option');
    // Should have 2 options: "Not specified" + munich (id=4)
    expect(locationOptions).toHaveLength(2);
    const locValues = Array.from(locationOptions).map(o => o.value);
    expect(locValues).not.toContain('2');
    expect(locValues).toContain('4');

    fireEvent.click(submitBtn);
    integrationTestHelper.takeStoreAndLastActionSnapshot('generated command');
  });
});
