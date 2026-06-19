import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchInput from './';

describe('Search Input', () => {
  it('should render', () => {
    const { container } = render(
      <SearchInput searchValue="val" timeout={300} />
    );

    const input = container.querySelector('input#breadcrumbs-search');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('val');
    expect(input).toHaveAttribute('placeholder', 'filter...');
    expect(
      screen.getByRole('button', { name: 'Clear' })
    ).toBeInTheDocument();
  });

  it('shouldnt gain focus', () => {
    const { container } = render(
      <SearchInput searchValue="val" timeout={300} />
    );
    const input = container.querySelector('input#breadcrumbs-search');

    expect(input).not.toHaveFocus();
  });

  it('should gain focus', () => {
    const { container } = render(
      <SearchInput searchValue="val" timeout={300} focus />
    );
    const input = container.querySelector('input#breadcrumbs-search');

    expect(input).toHaveFocus();
  });
});
