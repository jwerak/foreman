import React from 'react';
import { fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import API from '../../../redux/API/API';
import BreadcrumbBar from '../BreadcrumbBar';
import {
  resource,
  breadcrumbItems,
  mockBreadcrumbItemOnClick,
} from '../BreadcrumbBar.fixtures';
import { rtlHelpers } from '../../../common/rtlTestHelpers';

jest.mock('../../../redux/API/API');
jest.useFakeTimers();

const defaultBreadcrumbBarState = {
  resourceSwitcherItems: [],
  isLoadingResources: false,
  isSwitcherOpen: false,
  resourceUrl: null,
  requestError: null,
  currentPage: null,
  searchQuery: '',
  pages: null,
  titleReplacement: null,
  total: 0,
  perPage: 10,
};

describe('BreadcrumbBar', () => {
  beforeEach(() => {
    mockBreadcrumbItemOnClick.mockClear();
    // Make API.get return a never-resolving promise so async thunks
    // stay in the loading state for assertion purposes.
    API.get.mockImplementation(() => new Promise(() => {}));
  });

  describe('rendering', () => {
    it('renders breadcrumb-bar', () => {
      const { container } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable={false}
        />,
        { breadcrumbBar: defaultBreadcrumbBarState }
      );
      expect(container).toMatchSnapshot();
    });

    it('renders switchable breadcrumb-bar', () => {
      const { container } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            searchQuery: 'some value',
          },
        }
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('triggering', () => {
    it('should dispatch open switcher action on button click', async () => {
      const { store } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            searchQuery: 'some value',
          },
        }
      );

      expect(store.getState().breadcrumbBar.isSwitcherOpen).toBe(false);

      await act(async () =>
        fireEvent.click(screen.getByLabelText('open breadcrumb switcher'))
      );

      expect(store.getState().breadcrumbBar.isSwitcherOpen).toBe(true);
    });

    it('should dispatch load resources on open when no current page', async () => {
      const { store } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            searchQuery: 'some value',
          },
        }
      );

      await act(async () =>
        fireEvent.click(screen.getByLabelText('open breadcrumb switcher'))
      );

      // The open handler calls loadSwitcherResourcesByResource when no currentPage,
      // which dispatches BREADCRUMB_BAR_RESOURCES_REQUEST synchronously
      await act(async () => jest.runAllTimers());

      expect(store.getState().breadcrumbBar.isLoadingResources).toBe(true);
      expect(store.getState().breadcrumbBar.resourceUrl).toBe(
        resource.resourceUrl
      );
    });

    it('should dispatch pagination actions on next page', async () => {
      const { store } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            isSwitcherOpen: true,
            currentPage: 2,
            total: 40,
            perPage: 10,
            searchQuery: '',
          },
        }
      );

      await act(async () =>
        fireEvent.click(screen.getByLabelText('Go to next page'))
      );

      // loadSwitcherResourcesByResource dispatches RESOURCES_REQUEST synchronously
      expect(store.getState().breadcrumbBar.isLoadingResources).toBe(true);
    });

    it('should dispatch pagination actions on previous page', async () => {
      const { store } = rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            isSwitcherOpen: true,
            currentPage: 2,
            total: 40,
            perPage: 10,
            searchQuery: '',
          },
        }
      );

      await act(async () =>
        fireEvent.click(screen.getByLabelText('Go to previous page'))
      );

      expect(store.getState().breadcrumbBar.isLoadingResources).toBe(true);
    });

    it('onclick callbacks should work', async () => {
      window.history.pushState({}, 'Test Title', '/hosts/1');
      const onSwitcherItemClick = jest.fn();

      rtlHelpers.renderWithStore(
        <BreadcrumbBar
          resource={resource}
          breadcrumbItems={breadcrumbItems.items}
          isSwitchable
          searchDebounceTimeout={0}
          onSwitcherItemClick={onSwitcherItemClick}
        />,
        {
          breadcrumbBar: {
            ...defaultBreadcrumbBarState,
            isSwitcherOpen: true,
            resourceSwitcherItems: [{ name: 'breadcrumb item 3', id: '1' }],
            currentPage: 1,
            total: 1,
            perPage: 10,
            searchQuery: '',
          },
        }
      );

      await act(async () => jest.runAllTimers());
      expect(onSwitcherItemClick.mock.calls).toHaveLength(0);

      // test breadcrumb switcher item click
      await act(async () =>
        fireEvent.click(screen.getByText('breadcrumb item 3'))
      );
      expect(onSwitcherItemClick.mock.calls).toHaveLength(1);

      // test breadcrumb item click
      await act(async () =>
        fireEvent.click(screen.getByText('child with onClick'))
      );
      expect(mockBreadcrumbItemOnClick.mock.calls).toHaveLength(1);
    });
  });
});
