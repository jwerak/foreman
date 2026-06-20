import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexPageActionButtons from '../ActionButtons';

describe('IndexPageActionButtons', () => {
  test('renders nothing when no buttons are configured', () => {
    const { container } = render(
      <IndexPageActionButtons
        creatable={false}
        exportable={false}
        hasHelpPage={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders create button when creatable and canCreate', () => {
    render(
      <IndexPageActionButtons
        creatable
        canCreate
        createUrl="/domains/new"
      />
    );
    const btn = screen.getByText('Create new');
    expect(btn.closest('a')).toHaveAttribute('href', '/domains/new');
  });

  test('does not render create button when canCreate is false', () => {
    render(
      <IndexPageActionButtons
        creatable
        canCreate={false}
        createUrl="/domains/new"
      />
    );
    expect(screen.queryByText('Create new')).not.toBeInTheDocument();
  });

  test('renders custom create label', () => {
    render(
      <IndexPageActionButtons
        creatable
        canCreate
        createUrl="/domains/new"
        createLabel="Add Domain"
      />
    );
    expect(screen.getByText('Add Domain')).toBeInTheDocument();
  });

  test('renders export and documentation in dropdown when create is present', async () => {
    render(
      <IndexPageActionButtons
        creatable
        canCreate
        createUrl="/domains/new"
        exportable
        exportUrl="/domains.csv"
        hasHelpPage
        documentationUrl="https://docs.example.com"
      />
    );

    expect(screen.getByText('Create new')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('toggle action dropdown'));
    });

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  test('renders single export button when no create', () => {
    render(
      <IndexPageActionButtons
        creatable={false}
        exportable
        exportUrl="/domains.csv"
      />
    );
    const btn = screen.getByText('Export');
    expect(btn.closest('a')).toHaveAttribute('href', '/domains.csv');
  });

  test('renders custom actions', async () => {
    const customActions = [
      { title: 'Custom Action', action: { href: '/custom' } },
    ];
    render(
      <IndexPageActionButtons
        creatable
        canCreate
        createUrl="/domains/new"
        customActions={customActions}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByLabelText('toggle action dropdown'));
    });

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});
