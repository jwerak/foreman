import { testComponentSnapshotsWithFixtures } from '../../../common/testHelpers';
import UserDetails from '../UserDetails';

import { AuditRecord } from './AuditsList.fixtures';

const userFixtures = {
  'render user info': {
    isAuditLogin: false,
    remoteAddress: AuditRecord.remote_address,
    userInfo: AuditRecord.user_info,
  },
  'render user info with audit login': {
    isAuditLogin: true,
    remoteAddress: AuditRecord.remote_address,
    userInfo: AuditRecord.user_info,
  },
};

describe('UserDetails', () =>
  testComponentSnapshotsWithFixtures(UserDetails, userFixtures));
