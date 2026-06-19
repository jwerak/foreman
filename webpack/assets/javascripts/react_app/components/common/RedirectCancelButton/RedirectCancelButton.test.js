import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import RedirectCancelButton from './RedirectCancelButton';

jest.mock('../../../common/withReactRoutes', () => Component => props => (
  <div className="component-with-mocked-routes">
    <Component {...props} />
  </div>
));

describe('RedirectCancelButton', () => {
  it('renders correctly', () => {
    const { container } = render(
      <MemoryRouter>
        <RedirectCancelButton cancelPath="/hosts" />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
