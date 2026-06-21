import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypeTab from '../tabs/TypeTab';
import TemplateFormContext from '../TemplateFormContext';

jest.mock('../../../common/I18n');

const defaultContext = {
  values: { snippet: false, template_kind_id: null, locked: false },
  errors: {},
  onChange: jest.fn(),
  options: {
    templateKinds: [
      { value: 1, label: 'PXELinux' },
      { value: 2, label: 'provision' },
    ],
  },
  isSubmitting: false,
  meta: {
    templateType: 'provisioning_template',
  },
};

const renderTypeTab = (contextOverrides = {}) =>
  render(
    <TemplateFormContext.Provider value={{ ...defaultContext, ...contextOverrides }}>
      <TypeTab />
    </TemplateFormContext.Provider>
  );

describe('TypeTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Snippet checkbox', () => {
    renderTypeTab();
    expect(screen.getByLabelText('Snippet')).toBeInTheDocument();
  });

  test('renders kind selector for provisioning templates when not snippet', () => {
    renderTypeTab();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  test('hides kind selector when snippet is checked', () => {
    renderTypeTab({
      values: { snippet: true, template_kind_id: null, locked: false },
    });
    expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
    expect(screen.getByText('Not relevant for snippet')).toBeInTheDocument();
  });

  test('clicking Snippet calls onChange', () => {
    const onChange = jest.fn();
    renderTypeTab({ onChange });

    fireEvent.click(screen.getByLabelText('Snippet'));
    expect(onChange).toHaveBeenCalledWith('snippet', true);
  });

  test('does not render kind selector for report templates', () => {
    renderTypeTab({
      meta: { templateType: 'report_template' },
    });
    expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
  });
});
