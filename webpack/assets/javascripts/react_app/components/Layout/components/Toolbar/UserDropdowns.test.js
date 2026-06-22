import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import UserDropdowns from './UserDropdowns';

const userWithMenuItems = {
  current_user: {
    firstname: 'Admin',
    lastname: 'User',
    name: 'Admin User',
  },
  user_dropdown: [
    {
      type: 'sub_menu',
      name: 'User',
      icon: 'fa fa-user',
      children: [
        {
          type: 'item',
          url: '/users/4/edit',
          name: 'My Account',
        },
        { type: 'divider' },
        {
          type: 'item',
          url: '/users/logout',
          name: 'Log Out',
          html_options: { 'data-method': 'post' },
        },
      ],
    },
  ],
};

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

  const meta = document.createElement('meta');
  meta.setAttribute('name', 'csrf-token');
  meta.setAttribute('content', 'test-csrf-token');
  document.head.appendChild(meta);
});

afterEach(() => {
  delete global.fetch;
  document.head.querySelector('meta[name="csrf-token"]')?.remove();
  delete window.location;
  window.location = { href: '' };
});

describe('UserDropdowns', () => {
  it('renders the user name in the toggle', () => {
    render(<UserDropdowns user={userWithMenuItems} />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('renders My Account as an anchor link', async () => {
    const user = userEvent.setup();
    render(<UserDropdowns user={userWithMenuItems} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Admin User/i }));
    });

    const myAccountLink = screen.getByRole('menuitem', { name: 'My Account' });
    expect(myAccountLink.tagName).toBe('A');
    expect(myAccountLink.getAttribute('href')).toBe('/users/4/edit');
  });

  it('renders Log Out without an href (click handler instead)', async () => {
    const user = userEvent.setup();
    render(<UserDropdowns user={userWithMenuItems} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Admin User/i }));
    });

    const logoutItem = screen.getByRole('menuitem', { name: 'Log Out' });
    expect(logoutItem.tagName).toBe('BUTTON');
  });

  it('POSTs to logout URL with CSRF token on click', async () => {
    const user = userEvent.setup();
    render(<UserDropdowns user={userWithMenuItems} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Admin User/i }));
    });

    await act(async () => {
      await user.click(screen.getByText('Log Out'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/users/logout', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': 'test-csrf-token',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });
  });

  it('renders a divider between menu items', async () => {
    const user = userEvent.setup();
    render(<UserDropdowns user={userWithMenuItems} />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Admin User/i }));
    });

    expect(screen.getByRole('separator')).toBeTruthy();
  });
});
