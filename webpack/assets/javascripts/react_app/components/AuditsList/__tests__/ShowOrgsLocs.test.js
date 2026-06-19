import { testComponentSnapshotsWithFixtures } from '../../../common/testHelpers';
import ShowOrgsLocs from '../ShowOrgsLocs';

import { TaxonomyProps } from './AuditsList.fixtures';

const ShowOrgsLocsFixtures = {
  'render organizations and locations': { ...TaxonomyProps },
};

describe('ShowOrgsLocs', () =>
  testComponentSnapshotsWithFixtures(ShowOrgsLocs, ShowOrgsLocsFixtures));
