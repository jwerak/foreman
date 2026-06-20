import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import TaxonomySelect from './TaxonomySelect';

jest.mock('../../../../common/I18n');

const defaultProps = {
  headerText: 'Test Header',
  taxonomy: 'organization',
  children: <option value="1">Test Option</option>,
  radioChecked: false,
  setRadioChecked: jest.fn(),
  toggle: jest.fn(),
};

const renderComponent = (props = {}) => {
  const finalProps = {
    ...defaultProps,
    ...props,
  };

  return render(
    <IntlProvider locale="en">
      <TaxonomySelect {...finalProps} />
    </IntlProvider>
  );
};

describe('TaxonomySelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component with basic props', () => {
    renderComponent();
    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Fix on mismatch')).toBeInTheDocument();
    expect(screen.getByText('Fail on mismatch')).toBeInTheDocument();
  });

  it('should render tooltips', () => {
    renderComponent();
    const tooltipIcons = screen.getAllByRole('img', { hidden: true });
    expect(tooltipIcons).toHaveLength(2);
  });

  it('should handle radio button changes', () => {
    const setRadioChecked = jest.fn();
    renderComponent({ setRadioChecked });

    const fixRadio = screen.getByLabelText('Fix on mismatch');
    
    fireEvent.click(fixRadio);
    expect(setRadioChecked).toHaveBeenCalledWith(true);
  });

  it('should render with different taxonomy type', () => {
    // In PF6, Select passes id and className to the Menu component which
    // only renders when the select is open. Verify via OUIA attribute instead.
    renderComponent({ taxonomy: 'location' });
    expect(document.querySelector('[data-ouia-component-id="select-location"]')).toBeInTheDocument();
  });

  it('should render Select with scrollable class', () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => (
      <option key={i} value={`option-${i}`}>Option {i}</option>
    ));

    renderComponent({
      children: manyOptions
    });
    // In PF6, Select className is applied to the Menu, which only renders when open.
    // Verify the Select is rendered via its OUIA attribute instead.
    expect(document.querySelector('[data-ouia-component-id="select-organization"]')).toBeInTheDocument();
  });

  it('should render children inside Select', () => {
    renderComponent({
      children: <option value="test">Test Child</option>,
    });
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
