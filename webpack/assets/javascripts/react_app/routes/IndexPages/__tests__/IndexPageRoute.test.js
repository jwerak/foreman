import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import IndexPageRoute from '../IndexPageRoute';

jest.mock('../../../components/BreadcrumbBar', () => {
  const MockBreadcrumbBar = ({ breadcrumbItems }) => (
    <div data-testid="breadcrumb-bar">
      {breadcrumbItems.map((item, i) => (
        <span key={i}>{item.caption}</span>
      ))}
    </div>
  );
  MockBreadcrumbBar.displayName = 'MockBreadcrumbBar';
  return MockBreadcrumbBar;
});

jest.mock('../../../components/Head', () => {
  const MockHead = ({ children }) => <div data-testid="head">{children}</div>;
  MockHead.displayName = 'MockHead';
  return MockHead;
});

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

const MockComponent = props => (
  <div data-testid="mock-index">
    <span data-testid="api-url">{props.apiUrl}</span>
    <span data-testid="controller">{props.controller}</span>
    <span data-testid="initial-search">{props.initialSearch}</span>
  </div>
);

const renderRoute = (extraProps = {}) =>
  render(
    <Provider store={store}>
      <IndexPageRoute
        title="Test Page"
        component={MockComponent}
        indexProps={{
          apiUrl: '/api/v2/test',
          controller: 'test',
          createUrl: '/test/new',
          ...extraProps,
        }}
      />
    </Provider>
  );

describe('IndexPageRoute', () => {
  it('renders the page title as breadcrumb heading', () => {
    renderRoute();
    const breadcrumb = screen.getByTestId('breadcrumb-bar');
    expect(breadcrumb).toHaveTextContent('Test Page');
  });

  it('renders the index component with correct props', () => {
    renderRoute();
    expect(screen.getByTestId('api-url')).toHaveTextContent('/api/v2/test');
    expect(screen.getByTestId('controller')).toHaveTextContent('test');
  });

  it('passes initialSearch from URL search params', () => {
    delete window.location;
    window.location = new URL('http://localhost/test?search=foo');
    renderRoute();
    expect(screen.getByTestId('initial-search')).toHaveTextContent('foo');
    window.location = new URL('http://localhost/');
  });

  it('passes empty initialSearch when no search param', () => {
    delete window.location;
    window.location = new URL('http://localhost/test');
    renderRoute();
    expect(screen.getByTestId('initial-search')).toHaveTextContent('');
    window.location = new URL('http://localhost/');
  });
});
