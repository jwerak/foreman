// replaces @theforeman/test.js
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import {
  mockWindowLocation,
  classFunctionUnitTest,
  shallowRenderComponentWithFixtures,
  testComponentSnapshotsWithFixtures,
  runActionInDepth,
  testActionSnapshot,
  testActionSnapshotWithFixtures,
  testReducerSnapshotWithFixtures,
  testSelectorsSnapshotWithFixtures,
  initMockStore,
} from './assets/javascripts/react_app/common/testHelpers';
import IntegrationTestHelper from './assets/javascripts/react_app/common/IntegrationTestHelper';

export {
  mockWindowLocation,
  classFunctionUnitTest,
  shallowRenderComponentWithFixtures,
  testComponentSnapshotsWithFixtures,
  runActionInDepth,
  testActionSnapshot,
  testActionSnapshotWithFixtures,
  testReducerSnapshotWithFixtures,
  testSelectorsSnapshotWithFixtures,
  initMockStore,
  IntegrationTestHelper,
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  MockAdapter,
};
