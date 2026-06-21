import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import TemplateForm from '../index';

jest.mock('../../../common/I18n');

jest.mock('../../Editor', () => {
  const MockEditor = () => <div data-testid="mock-editor">Editor</div>;
  return { __esModule: true, default: MockEditor };
});

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockStore = createStore(() => ({
  editor: { value: 'template content' },
}));

const defaultMeta = {
  isNew: true,
  cancelUrl: '/provisioning_templates',
  templateType: 'provisioning_template',
  apiUrl: '/api/v2/provisioning_templates',
  resourceName: 'provisioning_template',
  showDefault: false,
  showLocationTab: true,
  showOrganizationTab: true,
  osFamilies: [],
};

const defaultOptions = {
  locations: [{ value: 1, label: 'Default Location' }],
  organizations: [{ value: 1, label: 'Default Organization' }],
  templateKinds: [{ value: 1, label: 'PXELinux' }],
  inputTypes: [{ value: 'user', label: 'User input' }],
  valueTypes: [{ value: 'plain', label: 'Plain' }],
  resourceTypes: [],
};

const defaultEditor = {
  dslCache: '{}',
  templateFieldName: 'provisioning_template[template]',
  templateClass: 'ProvisioningTemplate',
  showPreview: true,
  showHostSelector: true,
  isSafemodeEnabled: true,
  renderPath: '/preview',
  safemodeRenderPath: '/preview?force_safemode=true',
};

const renderForm = (props = {}) =>
  render(
    <Provider store={mockStore}>
      <TemplateForm
        template={{}}
        options={defaultOptions}
        editor={defaultEditor}
        meta={defaultMeta}
        {...props}
      />
    </Provider>
  );

describe('TemplateForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Template and Inputs tabs', () => {
    renderForm();

    expect(screen.getByRole('tab', { name: 'Template' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inputs' })).toBeInTheDocument();
  });

  test('renders Type tab for provisioning templates', () => {
    renderForm();

    expect(screen.getByRole('tab', { name: 'Type' })).toBeInTheDocument();
  });

  test('hides Type tab for ptables', () => {
    renderForm({
      meta: { ...defaultMeta, templateType: 'ptable' },
    });

    expect(screen.queryByRole('tab', { name: 'Type' })).not.toBeInTheDocument();
  });

  test('renders Locations and Organizations tabs when enabled', () => {
    renderForm();

    expect(
      screen.getByRole('tab', { name: 'Locations' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Organizations' })
    ).toBeInTheDocument();
  });

  test('hides taxonomy tabs when disabled', () => {
    renderForm({
      meta: { ...defaultMeta, showLocationTab: false, showOrganizationTab: false },
    });

    expect(screen.queryByRole('tab', { name: 'Locations' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Organizations' })).not.toBeInTheDocument();
  });

  test('renders the Editor component', () => {
    renderForm();

    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  test('renders Name field', () => {
    renderForm();

    expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
  });

  test('submit button shows "Create" for new template', () => {
    renderForm();

    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('submit button shows "Update" for edit template', () => {
    renderForm({
      template: { id: 1, name: 'Test' },
      meta: { ...defaultMeta, isNew: false },
    });

    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  test('cancel button links to cancelUrl', () => {
    renderForm();

    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn.closest('a')).toHaveAttribute(
      'href',
      '/provisioning_templates'
    );
  });

  test('shows error when submitting without name', async () => {
    renderForm();

    fireEvent.click(screen.getByText('Create'));

    expect(await screen.findByText("can't be blank")).toBeInTheDocument();
  });

  test('renders snippet checkbox for ptable in Template tab', () => {
    renderForm({
      meta: { ...defaultMeta, templateType: 'ptable' },
    });

    const snippetCheckboxes = screen.getAllByLabelText('Snippet');
    expect(snippetCheckboxes.length).toBeGreaterThan(0);
  });
});
