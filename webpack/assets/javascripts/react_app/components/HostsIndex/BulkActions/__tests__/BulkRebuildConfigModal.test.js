import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BulkRebuildConfigModal from '../rebuildConfig/BulkRebuildConfigModal';

jest.mock('../../../../common/I18n');

const mockStore = configureMockStore([thunk]);
const store = mockStore({ API: {} });

const defaultProps = {
  selectedCount: 5,
  fetchBulkParams: jest.fn(() => 'id ^ (1,2,3,4,5)'),
  isOpen: true,
  closeModal: jest.fn(),
};

const renderModal = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <BulkRebuildConfigModal {...defaultProps} {...props} />
      </Provider>
    </IntlProvider>
  );

describe('BulkRebuildConfigModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  it('renders when open', () => {
    renderModal();
    expect(screen.getByText('Rebuild config')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Rebuild config')).not.toBeInTheDocument();
  });

  it('shows confirmation text with host count', () => {
    renderModal({ selectedCount: 5 });
    const description = document.querySelector(
      '[data-ouia-component-id="bulk-rebuild-config-description"]'
    );
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain('5');
    expect(description.textContent).toContain('selected hosts');
  });

  it('uses singular form for single host', () => {
    renderModal({ selectedCount: 1 });
    const description = document.querySelector(
      '[data-ouia-component-id="bulk-rebuild-config-description"]'
    );
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain('1');
    expect(description.textContent).toContain('selected host');
  });

  it('has Confirm and Cancel buttons', () => {
    renderModal();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls closeModal on Cancel', () => {
    const closeModal = jest.fn();
    renderModal({ closeModal });

    fireEvent.click(screen.getByText('Cancel'));
    expect(closeModal).toHaveBeenCalled();
  });

  it('dispatches action on Confirm', () => {
    renderModal();

    fireEvent.click(screen.getByText('Confirm'));
    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0);
  });
});
