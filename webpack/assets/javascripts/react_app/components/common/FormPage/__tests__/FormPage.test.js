import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import FormPage from '../index';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import API from '../../../../redux/API/API';

const textFields = [
  { name: 'name', label: 'Name', required: true, helpText: 'Enter a unique name' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const defaultProps = {
  apiUrl: '/api/v2/architectures',
  title: 'Create Architecture',
  fields: textFields,
  cancelUrl: '/architectures',
  resourceName: 'architecture',
};

describe('FormPage', () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (window.location !== originalLocation) {
      window.location = originalLocation;
    }
  });

  test('renders form with text fields', () => {
    render(<FormPage {...defaultProps} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Enter a unique name')).toBeInTheDocument();
  });

  test('renders Create submit button in create mode', () => {
    render(<FormPage {...defaultProps} />);

    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('renders Update submit button in edit mode', async () => {
    API.get.mockResolvedValue({
      data: { id: 1, name: 'x86_64', description: 'Intel arch' },
    });

    render(<FormPage {...defaultProps} resourceId={1} title="Edit x86_64" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('x86_64')).toBeInTheDocument();
    });

    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  test('renders custom submit label', () => {
    render(<FormPage {...defaultProps} submitLabel="Save Architecture" />);

    expect(screen.getByText('Save Architecture')).toBeInTheDocument();
  });

  test('renders cancel link', () => {
    render(<FormPage {...defaultProps} />);

    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn.closest('a')).toHaveAttribute('href', '/architectures');
  });

  test('shows required asterisk for required fields', () => {
    render(<FormPage {...defaultProps} />);

    const nameGroup = screen.getByLabelText('Name').closest('.pf-v6-c-form__group');
    expect(nameGroup).toHaveTextContent('Name');
    expect(nameGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
  });

  test('shows validation error for empty required fields on submit', async () => {
    render(<FormPage {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(screen.getByText("can't be blank")).toBeInTheDocument();
  });

  test('submits form data via POST for create', async () => {
    API.post.mockResolvedValue({ data: { id: 1, name: 'arm64' } });
    const onSuccess = jest.fn();

    render(<FormPage {...defaultProps} onSubmitSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'arm64' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(API.post).toHaveBeenCalledWith('/api/v2/architectures', {
      architecture: { name: 'arm64', description: '' },
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  test('shows loading spinner in edit mode', () => {
    API.get.mockReturnValue(new Promise(() => {}));

    render(<FormPage {...defaultProps} resourceId={1} />);

    expect(screen.getByLabelText('Loading form data')).toBeInTheDocument();
  });

  test('shows server-side errors after failed submit', async () => {
    API.post.mockRejectedValue({
      response: {
        data: {
          error: {
            errors: { name: ['has already been taken'] },
            full_messages: ['Name has already been taken'],
          },
        },
      },
    });

    render(<FormPage {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'duplicate' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(screen.getByText('Unable to save')).toBeInTheDocument();
    expect(screen.getByText('Name has already been taken')).toBeInTheDocument();
    expect(screen.getByText('has already been taken')).toBeInTheDocument();
  });

  test('renders select field with options', () => {
    const fieldsWithSelect = [
      {
        name: 'os_family',
        label: 'OS Family',
        type: 'select',
        options: [
          { value: 'redhat', label: 'Red Hat' },
          { value: 'debian', label: 'Debian' },
        ],
      },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithSelect} />);

    expect(screen.getByLabelText('OS Family')).toBeInTheDocument();
    expect(screen.getByText('Red Hat')).toBeInTheDocument();
    expect(screen.getByText('Debian')).toBeInTheDocument();
  });

  test('renders checkbox field', () => {
    const fieldsWithCheckbox = [
      {
        name: 'admin',
        label: 'Admin',
        type: 'checkbox',
        checkboxLabel: 'Administrator privileges',
      },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithCheckbox} />);

    expect(screen.getByText('Administrator privileges')).toBeInTheDocument();
  });

  test('renders password field', () => {
    const fieldsWithPassword = [
      { name: 'password', label: 'Password', type: 'password' },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithPassword} />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('renders form sections', () => {
    const fieldsWithSections = [
      { name: 'name', label: 'Name', required: true },
      { name: 'dns', label: 'DNS Server', section: 'Network' },
      { name: 'gateway', label: 'Gateway', section: 'Network' },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithSections} />);

    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByLabelText('DNS Server')).toBeInTheDocument();
    expect(screen.getByLabelText('Gateway')).toBeInTheDocument();
  });

  test('renders form with tabs when fields have tab property', () => {
    const tabbedFields = [
      { name: 'name', label: 'Name', required: true, tab: 'General' },
      { name: 'description', label: 'Description', tab: 'General' },
      { name: 'domain_ids', label: 'Associated Domains', type: 'checkboxGroup', tab: 'Domains',
        options: [
          { value: 1, label: 'example.com' },
          { value: 2, label: 'test.org' },
        ] },
    ];

    render(<FormPage {...defaultProps} fields={tabbedFields} />);

    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Domains' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  test('switches tabs when clicking tab header', async () => {
    const tabbedFields = [
      { name: 'name', label: 'Name', required: true, tab: 'General' },
      { name: 'domain_ids', label: 'Associated Domains', type: 'checkboxGroup', tab: 'Domains',
        options: [
          { value: 1, label: 'example.com' },
        ] },
    ];

    render(<FormPage {...defaultProps} fields={tabbedFields} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Domains' }));

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
  });

  test('renders checkboxGroup field with options', () => {
    const fieldsWithCheckboxGroup = [
      {
        name: 'role_ids',
        label: 'Roles',
        type: 'checkboxGroup',
        options: [
          { value: 1, label: 'Viewer' },
          { value: 2, label: 'Manager' },
          { value: 3, label: 'Admin' },
        ],
      },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithCheckboxGroup} />);

    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('checkboxGroup toggles selections', async () => {
    API.post.mockResolvedValue({ data: { id: 1 } });
    const onSuccess = jest.fn();

    const fieldsWithCheckboxGroup = [
      {
        name: 'role_ids',
        label: 'Roles',
        type: 'checkboxGroup',
        options: [
          { value: 1, label: 'Viewer' },
          { value: 2, label: 'Manager' },
        ],
      },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithCheckboxGroup} onSubmitSuccess={onSuccess} />);

    fireEvent.click(screen.getByLabelText('Viewer'));
    fireEvent.click(screen.getByLabelText('Manager'));

    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(API.post).toHaveBeenCalledWith('/api/v2/architectures', {
      architecture: { role_ids: [1, 2] },
    });
  });

  test('checkboxGroup shows empty message when no options', () => {
    const fieldsWithEmptyCheckboxGroup = [
      {
        name: 'role_ids',
        label: 'Roles',
        type: 'checkboxGroup',
        options: [],
      },
    ];

    render(<FormPage {...defaultProps} fields={fieldsWithEmptyCheckboxGroup} />);

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  test('loads checkboxGroup data from association objects in edit mode', async () => {
    API.get.mockResolvedValue({
      data: {
        id: 1,
        name: 'test',
        domains: [{ id: 1, name: 'example.com' }, { id: 3, name: 'foo.org' }],
      },
    });

    const tabbedFields = [
      { name: 'name', label: 'Name', tab: 'General' },
      { name: 'domain_ids', label: 'Associated Domains', type: 'checkboxGroup', tab: 'Domains',
        loadKey: 'domains',
        options: [
          { value: 1, label: 'example.com' },
          { value: 2, label: 'test.org' },
          { value: 3, label: 'foo.org' },
        ] },
    ];

    render(<FormPage {...defaultProps} fields={tabbedFields} resourceId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Domains' }));

    await waitFor(() => {
      const checkbox1 = screen.getByLabelText('example.com');
      const checkbox2 = screen.getByLabelText('test.org');
      const checkbox3 = screen.getByLabelText('foo.org');
      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
      expect(checkbox3).toBeChecked();
    });
  });

  test('loads and populates data in edit mode', async () => {
    API.get.mockResolvedValue({
      data: { id: 1, name: 'x86_64', description: 'Intel architecture' },
    });

    render(<FormPage {...defaultProps} resourceId={1} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('x86_64')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Intel architecture')).toBeInTheDocument();
  });

  test('submits form data via PUT for edit', async () => {
    API.get.mockResolvedValue({
      data: { id: 1, name: 'x86_64', description: '' },
    });
    API.put.mockResolvedValue({ data: { id: 1, name: 'x86_64-v2' } });
    const onSuccess = jest.fn();

    render(<FormPage {...defaultProps} resourceId={1} onSubmitSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('x86_64')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'x86_64-v2' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Update'));
    });

    expect(API.put).toHaveBeenCalledWith('/api/v2/architectures/1', {
      architecture: { name: 'x86_64-v2', description: '' },
    });
    expect(onSuccess).toHaveBeenCalled();
  });
});
