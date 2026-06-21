import '@testing-library/jest-dom';

jest.mock('../../../common/I18n', () => ({
  translate: str => str,
}));

jest.mock('@patternfly/react-core', () => {
  const React = require('react');
  return {
    Toolbar: ({ children }) => <div data-testid="toolbar">{children}</div>,
    ToolbarContent: ({ children }) => <div>{children}</div>,
    ToolbarItem: ({ children }) => <div>{children}</div>,
    ToolbarGroup: ({ children }) => <div>{children}</div>,
    Select: ({ children, toggle, isOpen }) => {
      const ref = { current: null };
      return (
        <div>
          {toggle(ref)}
          {isOpen && children}
        </div>
      );
    },
    SelectOption: ({ children, value }) => (
      <div data-value={value}>{children}</div>
    ),
    MenuToggle: React.forwardRef(({ children, onClick }, ref) => (
      <button ref={ref} onClick={onClick}>
        {children}
      </button>
    )),
    ToggleGroup: ({ children, ...props }) => (
      <div aria-label={props['aria-label']}>{children}</div>
    ),
    ToggleGroupItem: ({ text, isSelected, onChange, buttonId }) => (
      <button id={buttonId} data-selected={isSelected} onClick={onChange}>
        {text}
      </button>
    ),
    Switch: ({ id, label, isChecked, onChange }) => (
      <label htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={e => onChange(e, e.target.checked)}
        />
        {label}
      </label>
    ),
    Label: ({ children, onClick, color }) => (
      <span data-color={color} onClick={onClick} role="button">
        {children}
      </span>
    ),
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopologyToolbar from '../TopologyToolbar';

const defaultProps = {
  perspective: 'infrastructure',
  onPerspectiveChange: jest.fn(),
  layout: 'Dagre',
  onLayoutChange: jest.fn(),
  showHosts: false,
  onShowHostsChange: jest.fn(),
  errorsOnly: false,
  onErrorsOnlyChange: jest.fn(),
  meta: { total_hosts: 42 },
};

describe('TopologyToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the perspective label', () => {
    render(<TopologyToolbar {...defaultProps} />);
    expect(
      screen.getByText('Infrastructure & Provisioning')
    ).toBeInTheDocument();
  });

  it('renders layout toggle buttons', () => {
    render(<TopologyToolbar {...defaultProps} />);
    expect(screen.getByText('Hierarchical')).toBeInTheDocument();
    expect(screen.getByText('Force')).toBeInTheDocument();
  });

  it('calls onLayoutChange when layout toggle clicked', () => {
    render(<TopologyToolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('Force'));
    expect(defaultProps.onLayoutChange).toHaveBeenCalledWith('Cola');
  });

  it('renders show hosts switch', () => {
    render(<TopologyToolbar {...defaultProps} />);
    expect(screen.getByText('Show Hosts')).toBeInTheDocument();
  });

  it('renders show errors only label', () => {
    render(<TopologyToolbar {...defaultProps} />);
    expect(screen.getByText('Show Errors Only')).toBeInTheDocument();
  });

  it('calls onErrorsOnlyChange when errors label clicked', () => {
    render(<TopologyToolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('Show Errors Only'));
    expect(defaultProps.onErrorsOnlyChange).toHaveBeenCalledWith(true);
  });

  it('displays total host count from meta', () => {
    render(<TopologyToolbar {...defaultProps} />);
    expect(screen.getByText('42 hosts')).toBeInTheDocument();
  });
});
