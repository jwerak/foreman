import React from 'react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { rtlHelpers } from 'foremanReact/common/testHelpers';
import AppSwitcher from '../';
import { children } from './ForemanSwitcher.fixtures';

describe('Routes', () => {
  describe('rendering routes with children', () => {
    it('renders routes with chidlren', () => {
      const { container } = rtlHelpers.renderWithStore(
        <MemoryRouter>
          <AppSwitcher {...children} />
        </MemoryRouter>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
