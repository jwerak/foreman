import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rtlHelpers } from '../../../../common/testHelpers';
import {
  dateTimeWithErrorProps,
  textFieldWithHelpProps,
  formAutocompleteDataProps,
} from '../FormField.fixtures';
import FormField from '../FormField';

const stabilizeHtml = container => {
  const clone = container.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(el => {
    el.id = el.id.replace(/time-picker-\w+/g, 'time-picker-stable');
  });
  return clone;
};

describe('FormField', () => {
  describe('rendering', () => {
    it('renders text input', () => {
      const { container } = render(<FormField type="text" name="a" />);
      expect(container).toMatchSnapshot();
    });

    it('renders Date input', () => {
      const { container } = render(<FormField type="date" name="a" />);
      expect(container).toMatchSnapshot();
    });

    it('renders Time input', () => {
      const { container } = render(<FormField type="time" name="a" />);
      expect(stabilizeHtml(container)).toMatchSnapshot();
    });

    it('renders DateTime input', () => {
      const { container } = render(<FormField type="dateTime" name="a" />);
      expect(stabilizeHtml(container)).toMatchSnapshot();
    });

    it('renders text complex options and help', () => {
      const { container } = render(<FormField {...textFieldWithHelpProps} />);
      expect(container).toMatchSnapshot();
    });

    it('renders DateTime complex options and error', () => {
      const { container } = render(
        <FormField {...dateTimeWithErrorProps} />
      );
      expect(stabilizeHtml(container)).toMatchSnapshot();
    });

    it('renders AutoComplete', () => {
      const { container } = rtlHelpers.renderWithStore(
        <FormField
          type="autocomplete"
          name={formAutocompleteDataProps.name}
          id={formAutocompleteDataProps.id}
          data={{
            autocomplete: {
              url: formAutocompleteDataProps.url,
              searchQuery: formAutocompleteDataProps.searchQuery,
            },
            controller: formAutocompleteDataProps.controller,
            disabled: formAutocompleteDataProps.disabled,
          }}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
