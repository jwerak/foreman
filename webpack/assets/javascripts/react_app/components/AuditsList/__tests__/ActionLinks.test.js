import React from 'react';
import { render } from '@testing-library/react';
import ActionLinks from '../ActionLinks';

import { actionsList } from './AuditsList.fixtures';

const actionLinksFixture = {
  'render action links': { allowedActions: actionsList },
};

describe('ActionLinks', () => {
  describe('rendering', () => {
    Object.entries(actionLinksFixture).forEach(([description, props]) => {
      it(description, () => {
        const { container } = render(<ActionLinks {...props} />);
        expect(container.querySelectorAll('a.pf-v5-c-button')).toHaveLength(1);
        expect(container).toMatchSnapshot();
      });
    });
  });
});
