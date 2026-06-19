import React from 'react';
import '@testing-library/jest-dom';
import { rtlHelpers } from 'foremanReact/common/testHelpers';
import { hasTaxonomiesMock } from '../../Layout.fixtures';
import HeaderToolbar from './HeaderToolbar';

describe('HeaderToolbar', () => {
  describe('rendering', () => {
    it('render HeaderToolbar', () => {
      const { container } = rtlHelpers.renderWithStore(
        <HeaderToolbar
          {...hasTaxonomiesMock.data}
          currentLocation={hasTaxonomiesMock.currentLocation}
          currentOrganization={hasTaxonomiesMock.currentOrganization}
          isLoading={false}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
