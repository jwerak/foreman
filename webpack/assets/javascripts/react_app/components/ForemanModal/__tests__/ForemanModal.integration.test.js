import React from 'react';
import '@testing-library/jest-dom';
import ForemanModal, { reducers } from '../index';
import ForemanModalHeader from '../subcomponents/ForemanModalHeader';
import ForemanModalFooter from '../subcomponents/ForemanModalFooter';
import IntegrationTestHelper from '../../../common/IntegrationTestHelper';

import { setModalOpen, setModalClosed, addModal } from '../ForemanModalActions';

// This file is for integration tests of the Redux-connected ForemanModal component

describe('ForemanModal - integration tests', () => {
  it('should add, open, and close modals as directed by Redux actions', () => {
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    integrationTestHelper.takeStoreSnapshot('initial state');

    integrationTestHelper.store.dispatch(addModal({ id: 'modal1' }));
    integrationTestHelper.store.dispatch(addModal({ id: 'modal2' }));
    integrationTestHelper.store.dispatch(addModal({ id: 'modal3' }));

    const { container: container1 } = integrationTestHelper.mount(
      <ForemanModal id="modal1" title="modal1 title" />
    );
    const { container: container2 } = integrationTestHelper.mount(
      <ForemanModal id="modal2" title="modal1 title" />
    );
    const { container: container3 } = integrationTestHelper.mount(
      <ForemanModal id="modal3" title="modal1 title" />
    );

    integrationTestHelper.takeStoreSnapshot('state after adding 3 modals');

    // Check if the modal is shown by looking for the PF Modal's open state in the DOM.
    // PF Modal renders with class 'pf-m-open' or the isOpen attribute controls visibility.
    // Since RTL renders to the actual DOM, we check if the modal dialog is visible.
    const isModalShown = container => {
      const modal = container.querySelector('.pf-v5-c-modal-box, .pf-c-modal-box');
      return modal !== null;
    };

    // Modals should not be shown (PF Modal does not render content when isOpen=false)
    expect(isModalShown(container1)).toEqual(false);
    expect(isModalShown(container2)).toEqual(false);
    expect(isModalShown(container3)).toEqual(false);

    // Open modal1
    integrationTestHelper.store.dispatch(setModalOpen({ id: 'modal1' }));
    // Verify state after opening modal1
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'after opening modal1'
    );
    // Note: PF Modal uses a portal and renders into document.body, not the container
    // Check the Redux store state instead for isOpen
    expect(
      integrationTestHelper.store.getState().foremanModals.modal1.isOpen
    ).toEqual(true);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal2.isOpen
    ).toEqual(false);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal3.isOpen
    ).toEqual(false);

    // Open modal2
    integrationTestHelper.store.dispatch(setModalOpen({ id: 'modal2' }));
    // Verify state after opening modal2
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'after opening modal2'
    );
    expect(
      integrationTestHelper.store.getState().foremanModals.modal1.isOpen
    ).toEqual(true);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal2.isOpen
    ).toEqual(true);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal3.isOpen
    ).toEqual(false);

    // Close modal1
    integrationTestHelper.store.dispatch(setModalClosed({ id: 'modal1' }));
    // Verify state after closing modal1
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'after closing modal1'
    );
    expect(
      integrationTestHelper.store.getState().foremanModals.modal1.isOpen
    ).toEqual(false);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal2.isOpen
    ).toEqual(true);
    expect(
      integrationTestHelper.store.getState().foremanModals.modal3.isOpen
    ).toEqual(false);
  });
});

// these tests have to live in this file because the subcomponents are created in
// index.js and not ForemanModal.js

describe('ForemanModal subcomponents', () => {
  it('has a Header subcomponent', () => {
    expect(ForemanModal.Header).toEqual(ForemanModalHeader);
  });
  it('has a Footer subcomponent', () => {
    expect(ForemanModal.Footer).toEqual(ForemanModalFooter);
  });
});
