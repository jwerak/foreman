import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsTabContent from '../DetailsTabContent';

describe('DetailsTabContent', () => {
  test('renders text field values in a description list', () => {
    const fields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
    ];
    const resource = { name: 'example.com', description: 'A test domain' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('A test domain')).toBeInTheDocument();
  });

  test('renders dash for empty values', () => {
    const fields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
    ];
    const resource = { name: 'test', description: '' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('skips hidden fields', () => {
    const fields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'secret', label: 'Secret', type: 'hidden' },
    ];
    const resource = { name: 'test', secret: 'hidden-value' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.queryByText('hidden-value')).not.toBeInTheDocument();
  });

  test('renders checkbox as Yes/No', () => {
    const fields = [
      { name: 'admin', label: 'Admin', type: 'checkbox' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ];
    const resource = { admin: true, active: false };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('renders password as masked', () => {
    const fields = [
      { name: 'password', label: 'Password', type: 'password' },
    ];
    const resource = { password: 'supersecret' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('********')).toBeInTheDocument();
    expect(screen.queryByText('supersecret')).not.toBeInTheDocument();
  });

  test('renders select field with option label', () => {
    const fields = [
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
    const resource = { os_family: 'redhat' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('Red Hat')).toBeInTheDocument();
  });

  test('renders checkboxGroup as comma-separated names', () => {
    const fields = [
      {
        name: 'domain_ids',
        label: 'Domains',
        type: 'checkboxGroup',
        loadKey: 'domains',
      },
    ];
    const resource = {
      domain_ids: [1, 2],
      domains: [
        { id: 1, name: 'example.com' },
        { id: 2, name: 'test.org' },
      ],
    };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('example.com, test.org')).toBeInTheDocument();
  });

  test('renders checkboxGroup as None when empty', () => {
    const fields = [
      {
        name: 'domain_ids',
        label: 'Domains',
        type: 'checkboxGroup',
        loadKey: 'domains',
      },
    ];
    const resource = { domain_ids: [], domains: [] };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  test('groups fields by tab into cards', () => {
    const fields = [
      { name: 'name', label: 'Name', type: 'text', tab: 'General' },
      { name: 'dns', label: 'DNS', type: 'text', tab: 'Network' },
    ];
    const resource = { name: 'test', dns: '8.8.8.8' };

    render(<DetailsTabContent fields={fields} resource={resource} />);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
  });
});
