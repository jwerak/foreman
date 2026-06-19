import React from 'react';
import { testComponentSnapshotsWithFixtures } from '../../../common/testHelpers';

import NavItem from '../components/NavItem';

const fixtures = {
  'render NavItem': { children: [<span key="key">TEST</span>] },
};

describe('NavItem', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(NavItem, fixtures));
});
