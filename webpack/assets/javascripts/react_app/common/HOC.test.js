import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import store from '../redux';

import { callOnMount, withRenderHandler, callOnPopState } from './HOC';

const Component = () => <div>component mounted</div>;

const conditions = {
  isLoading: false,
  hasData: false,
  hasError: false,
  message: {
    type: 'empty',
    text: 'empty',
  },
};

const fixtures = {
  loading: {
    ...conditions,
    isLoading: true,
  },
  component: {
    ...conditions,
    hasData: true,
  },
  empty: {
    ...conditions,
  },
  error: {
    ...conditions,
    hasError: true,
  },
};

const renderWithStore = ui =>
  render(<Provider store={store}>{ui}</Provider>);

describe('HOCs', () => {
  describe('withRenderHandler', () => {
    it('should render the wrapped component when hasData is true', () => {
      const WrappedComponent = withRenderHandler({ Component });
      renderWithStore(<WrappedComponent {...fixtures.component} />);
      expect(screen.getByText('component mounted')).toBeInTheDocument();
    });

    it('should render LoadingPage when isLoading is true', () => {
      const WrappedComponent = withRenderHandler({ Component });
      renderWithStore(<WrappedComponent {...fixtures.loading} />);
      expect(screen.getByLabelText('Loading Page')).toBeInTheDocument();
    });

    it('should render ErrorComponent when hasError is true', () => {
      const WrappedComponent = withRenderHandler({ Component });
      renderWithStore(<WrappedComponent {...fixtures.error} />);
      expect(screen.queryByText('component mounted')).not.toBeInTheDocument();
    });

    it('should render EmptyComponent when there is no data', () => {
      const WrappedComponent = withRenderHandler({ Component });
      renderWithStore(<WrappedComponent {...fixtures.empty} />);
      expect(screen.queryByText('component mounted')).not.toBeInTheDocument();
    });
  });

  it('should call callback on mount with callOnMount', () => {
    const callback = jest.fn();
    const OnMount = callOnMount(callback)(Component);
    render(<OnMount />);
    expect(callback).toHaveBeenCalled();
  });

  it('should call callback on popstate with callOnPopState', () => {
    const callback = jest.fn();
    const props = {
      history: { action: 'PUSH' },
      location: { search: 'search' },
    };

    const OnPopState = callOnPopState(callback)(Component);
    const { rerender } = render(<OnPopState {...props} />);
    rerender(
      <OnPopState
        history={{ action: 'POP' }}
        location={{ search: 'changed' }}
      />
    );
    expect(callback).toHaveBeenCalled();
  });
});
