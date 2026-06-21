import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

jest.mock('../../../Root/Context/ForemanContext', () => ({
  useForemanLocation: jest.fn(() => undefined),
  useForemanOrganization: jest.fn(() => undefined),
}));

const makeItems = (subItems, className = '') => [
  {
    title: 'Infrastructure',
    iconClass: 'fa fa-server',
    className,
    subItems,
  },
];

const baseSubs = [
  { title: 'Domains', isDivider: false, href: '/domains', id: 'menu_item_domains' },
  { title: 'Subnets', isDivider: false, href: '/subnets', id: 'menu_item_subnets' },
  { title: 'Operating Systems', isDivider: false, href: '/operatingsystems', id: 'menu_item_os' },
];

const defaultProps = {
  navigate: jest.fn(),
  items: makeItems(baseSubs),
  navigationActiveItem: null,
  setNavigationActiveItem: jest.fn(),
};

const renderNav = (props = {}, pathname = '/domains') => {
  delete window.location;
  window.location = { pathname };
  return render(<Navigation {...defaultProps} {...props} />);
};

describe('Navigation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('exact path matching', () => {
    it('highlights sub-item when path matches exactly', () => {
      renderNav({}, '/domains');
      const navItem = screen.getByText('Domains').closest('.pf-v6-c-nav__link');
      expect(navItem).toHaveClass('pf-m-current');
    });

    it('does not highlight non-matching sub-items', () => {
      renderNav({}, '/domains');
      const navItem = screen.getByText('Subnets').closest('.pf-v6-c-nav__link');
      expect(navItem).not.toHaveClass('pf-m-current');
    });
  });

  describe('prefix path matching', () => {
    it('highlights sub-item when path is a child of the href', () => {
      renderNav({}, '/domains/5');
      const navItem = screen.getByText('Domains').closest('.pf-v6-c-nav__link');
      expect(navItem).toHaveClass('pf-m-current');
    });

    it('highlights sub-item on edit path', () => {
      renderNav({}, '/domains/5/edit');
      const navItem = screen.getByText('Domains').closest('.pf-v6-c-nav__link');
      expect(navItem).toHaveClass('pf-m-current');
    });

    it('does not false-match similar prefixes without slash separator', () => {
      const items = makeItems([
        { title: 'OS', isDivider: false, href: '/operatingsystems', id: 'menu_item_os' },
        { title: 'OS Other', isDivider: false, href: '/operatingsystems_other', id: 'menu_item_os_other' },
      ]);
      renderNav({ items }, '/operatingsystems_other');
      const osLink = screen.getByText('OS').closest('.pf-v6-c-nav__link');
      expect(osLink).not.toHaveClass('pf-m-current');
      const osOtherLink = screen.getByText('OS Other').closest('.pf-v6-c-nav__link');
      expect(osOtherLink).toHaveClass('pf-m-current');
    });
  });

  describe('parent expandable active state', () => {
    const findParentLi = container => {
      let parentLi = null;
      container.querySelectorAll('nav li').forEach(li => {
        if (li.textContent.includes('Infrastructure') && li.querySelectorAll('li').length > 0) {
          parentLi = li;
        }
      });
      return parentLi;
    };

    it('marks parent section active on exact child path', () => {
      const { container } = renderNav({}, '/domains');
      const parentLi = findParentLi(container);
      expect(parentLi).not.toBeNull();
      expect(parentLi.className).toContain('current');
    });

    it('marks parent section active on child detail path', () => {
      const { container } = renderNav({}, '/domains/5');
      const parentLi = findParentLi(container);
      expect(parentLi).not.toBeNull();
      expect(parentLi.className).toContain('current');
    });
  });

  describe('expanded sections', () => {
    it('auto-expands parent section when on a detail path', () => {
      renderNav({}, '/subnets/3');
      expect(screen.getByText('Subnets')).toBeVisible();
    });
  });

  describe('query parameter stripping', () => {
    it('matches href with query params against clean path', () => {
      const items = makeItems([
        { title: 'Reports', isDivider: false, href: '/config_reports?search=eventful', id: 'menu_item_reports' },
      ]);
      renderNav({ items }, '/config_reports');
      const navItem = screen.getByText('Reports').closest('.pf-v6-c-nav__link');
      expect(navItem).toHaveClass('pf-m-current');
    });
  });

  describe('clickAndNavigate', () => {
    it('updates active state after navigation click', async () => {
      renderNav({}, '/domains');
      await act(async () => {
        fireEvent.click(screen.getByText('Subnets'));
      });
      const subnetsLink = screen.getByText('Subnets').closest('.pf-v6-c-nav__link');
      expect(subnetsLink).toHaveClass('pf-m-current');
    });
  });

  describe('renders nothing with empty items', () => {
    it('returns null when items is empty', () => {
      const { container } = renderNav({ items: [] });
      expect(container.innerHTML).toBe('');
    });
  });
});
