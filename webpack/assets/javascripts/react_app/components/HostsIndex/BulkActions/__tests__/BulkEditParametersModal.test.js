import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BulkEditParametersModal from '../editParameters/BulkEditParametersModal';

jest.mock('../../../../common/I18n');

const mockStore = configureMockStore([thunk]);
const store = mockStore({ API: {} });

const defaultProps = {
  selectedCount: 3,
  fetchBulkParams: jest.fn(() => 'id ^ (1,2,3)'),
  isOpen: true,
  closeModal: jest.fn(),
};

const renderModal = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <BulkEditParametersModal {...defaultProps} {...props} />
      </Provider>
    </IntlProvider>
  );

describe('BulkEditParametersModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  it('renders when open', () => {
    renderModal();
    expect(screen.getByText('Edit parameters')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Edit parameters')).not.toBeInTheDocument();
  });

  it('shows parameter name and value fields', () => {
    renderModal();
    // The first row is rendered by default
    expect(screen.getByPlaceholderText('Parameter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Parameter value')).toBeInTheDocument();
  });

  it('shows Name and Value labels on the first row', () => {
    renderModal();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('Add parameter adds a row', () => {
    renderModal();

    const addButton = screen.getByText('Add parameter');
    fireEvent.click(addButton);

    // Should now have 2 rows (2 name inputs + 2 value inputs)
    const nameInputs = screen.getAllByPlaceholderText('Parameter name');
    const valueInputs = screen.getAllByPlaceholderText('Parameter value');
    expect(nameInputs).toHaveLength(2);
    expect(valueInputs).toHaveLength(2);
  });

  it('Save button disabled when no valid rows', () => {
    renderModal();

    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('Save button enabled when a row has both name and value', () => {
    renderModal();

    fireEvent.change(screen.getByPlaceholderText('Parameter name'), {
      target: { value: 'env' },
    });
    fireEvent.change(screen.getByPlaceholderText('Parameter value'), {
      target: { value: 'production' },
    });

    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).not.toBeDisabled();
  });

  it('calls closeModal on Cancel', () => {
    const closeModal = jest.fn();
    renderModal({ closeModal });

    fireEvent.click(screen.getByText('Cancel'));
    expect(closeModal).toHaveBeenCalled();
  });

  it('displays host count in description', () => {
    renderModal({ selectedCount: 5 });
    const description = document.querySelector(
      '[data-ouia-component-id="bulk-edit-parameters-description"]'
    );
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain('5');
    expect(description.textContent).toContain('selected hosts');
  });
});
