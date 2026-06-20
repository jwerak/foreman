import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ThemeToggle from './ThemeToggle';

jest.mock('../../../../common/I18n', () => ({
  translate: s => s,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('pf-v6-theme-dark');
    localStorage.clear();
  });

  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('applies dark class and switches icon on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('persists preference to localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(localStorage.getItem('foreman-theme-preference')).toBe('dark');
  });

  it('toggles back to light mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    expect(localStorage.getItem('foreman-theme-preference')).toBe('light');
  });
});
