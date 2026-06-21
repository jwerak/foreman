import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostForm from '../index';

jest.mock('../../../common/I18n');

jest.mock('../../common/Slot', () => {
  const MockSlot = () => null;
  return { __esModule: true, default: MockSlot };
});

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const defaultMeta = {
  isNew: true,
  isManaged: true,
  cancelUrl: '/hosts',
  showOrganizationTab: false,
  showLocationTab: false,
};

const defaultOptions = {
  organizations: [],
  locations: [],
  hostgroups: [],
  computeResources: [],
  computeProfiles: [],
  realms: [],
  models: [],
  owners: [],
  architectures: [],
};

const renderHostForm = (props = {}) =>
  render(
    <HostForm
      host={{}}
      options={defaultOptions}
      meta={defaultMeta}
      {...props}
    />
  );

describe('HostForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props and shows Host tab active', () => {
    renderHostForm();

    expect(screen.getByRole('tab', { name: 'Host' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  test('renders Host and Additional Information tabs', () => {
    renderHostForm();

    expect(screen.getByRole('tab', { name: 'Host' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Additional Information' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Interfaces' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Parameters' })
    ).toBeInTheDocument();
  });

  test('shows Operating System tab when isManaged is true', () => {
    renderHostForm({ meta: { ...defaultMeta, isManaged: true } });

    expect(
      screen.getByRole('tab', { name: 'Operating System' })
    ).toBeInTheDocument();
  });

  test('hides Operating System tab when isManaged is false', () => {
    renderHostForm({ meta: { ...defaultMeta, isManaged: false } });

    expect(
      screen.queryByRole('tab', { name: 'Operating System' })
    ).not.toBeInTheDocument();
  });

  test('shows error when submitting without name', async () => {
    renderHostForm();

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    expect(await screen.findByText("can't be blank")).toBeInTheDocument();
  });

  test('submit button shows "Create" for new host', () => {
    renderHostForm({ meta: { ...defaultMeta, isNew: true } });

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.queryByText('Update')).not.toBeInTheDocument();
  });

  test('submit button shows "Update" for edit host', () => {
    renderHostForm({
      host: { id: 1, name: 'test-host' },
      meta: { ...defaultMeta, isNew: false },
    });

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  test('cancel button links to cancelUrl', () => {
    renderHostForm({ meta: { ...defaultMeta, cancelUrl: '/hosts' } });

    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn.closest('a')).toHaveAttribute('href', '/hosts');
  });
});
