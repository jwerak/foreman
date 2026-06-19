import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import componentRegistry from '../../componentRegistry';
import ComponentWrapper from './ComponentWrapper';

jest.mock('@apollo/client/link/batch-http');
jest.mock('../../componentRegistry');

describe('ComponentWrapper', () => {
  it('should render core component', () => {
    const AwesomeComponent = () => <div>Awesome content</div>;
    componentRegistry.getComponent = jest.fn(() => ({
      type: AwesomeComponent,
    }));

    render(<ComponentWrapper data={{ component: 'AwesomeComponent' }} />);

    expect(componentRegistry.getComponent).toHaveBeenCalledWith(
      'AwesomeComponent'
    );
    expect(screen.getByText('Awesome content')).toBeInTheDocument();
  });

  it('should render core component with props', () => {
    const AwesomeComponent = ({ greeting }) => <div>{greeting}</div>;
    componentRegistry.getComponent = jest.fn(() => ({
      type: AwesomeComponent,
    }));

    render(
      <ComponentWrapper
        data={{
          component: 'AwesomeComponent',
          componentProps: { greeting: 'Hello from props' },
        }}
      />
    );

    expect(screen.getByText('Hello from props')).toBeInTheDocument();
  });

  it('should not render unregistered component', () => {
    componentRegistry.getComponent = jest.fn(() => undefined);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <ComponentWrapper data={{ component: 'NotAwesomeComponent' }} />
      );
    }).toThrow('Component name is missing!');

    spy.mockRestore();
  });

  it('should not render self', () => {
    componentRegistry.getComponent = jest.fn(() => undefined);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ComponentWrapper data={{ component: 'ComponentWrapper' }} />);
    }).toThrow('Cannot wrap component wrapper');

    spy.mockRestore();
  });
});
