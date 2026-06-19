import { testComponentSnapshotsWithFixtures } from '../../../common/testHelpers';
import SearchLink from '../SearchLink';

import { searchLinkProp } from './AuditsList.fixtures';

const searchLinkFixture = {
  'render a search link': searchLinkProp,
};

describe('SearchLink', () =>
  testComponentSnapshotsWithFixtures(SearchLink, searchLinkFixture));
