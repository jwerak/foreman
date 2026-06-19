import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import InlineEdit from '../InlineEdit';

const actualValue = 'burger';
const attribute = 'favorite_food';
const defaultProps = {
  onSave: jest.fn(),
  value: actualValue,
  attribute,
};

test('Passed function is called after editing and clicking submit for text input', async () => {
  const mockEdit = jest.fn();
  const { getByLabelText, findByLabelText } = render(
    <InlineEdit {...defaultProps} onSave={mockEdit} />
  );

  getByLabelText(`edit ${attribute}`).click();
  const textInput = await findByLabelText(`${attribute} text input`);
  fireEvent.change(textInput, {
    target: { value: actualValue },
  });
  getByLabelText(`submit ${attribute}`).click();

  await waitFor(() => expect(mockEdit.mock.calls).toHaveLength(1));
  expect(mockEdit.mock.calls[0][0]).toBe(actualValue); // first arg
});

test('Passed function is called after editing and clicking submit for text area', async () => {
  const mockEdit = jest.fn();
  const { getByLabelText, findByLabelText } = render(
    <InlineEdit {...defaultProps} textArea={true} onSave={mockEdit} />
  );

  getByLabelText(`edit ${attribute}`).click();
  const textArea = await findByLabelText(`${attribute} text area`);
  fireEvent.change(textArea, {
    target: { value: actualValue },
  });
  getByLabelText(`submit ${attribute}`).click();

  await waitFor(() => expect(mockEdit.mock.calls).toHaveLength(1));
  expect(mockEdit.mock.calls[0][0]).toBe(actualValue); // first arg
});

test('Passed function is called after editing and hitting enter', async () => {
  const mockEdit = jest.fn();
  const { getByLabelText, findByLabelText } = render(
    <InlineEdit {...defaultProps} onSave={mockEdit} />
  );

  getByLabelText(`edit ${attribute}`).click();
  const textInputLabel = `${attribute} text input`;
  const textInput = await findByLabelText(textInputLabel);
  fireEvent.change(textInput, {
    target: { value: actualValue },
  });
  fireEvent.keyDown(getByLabelText(textInputLabel), {
    key: 'Enter',
    code: 'Enter',
  });

  await waitFor(() => expect(mockEdit.mock.calls).toHaveLength(1));
  expect(mockEdit.mock.calls[0][0]).toBe(actualValue); // first arg
});

test('input is set back to original value after clearing', async () => {
  const value = 'Sandwich';
  const { getByLabelText, findByLabelText } = render(<InlineEdit {...defaultProps} />);

  // Show original value on load
  expect(getByLabelText(`${attribute} text value`)).toHaveTextContent(
    actualValue
  );
  getByLabelText(`edit ${attribute}`).click();
  // Update text input
  const textInput = await findByLabelText(`${attribute} text input`);
  fireEvent.change(textInput, {
    target: { value },
  });
  expect(getByLabelText(`${attribute} text input`)).toHaveValue(value);
  // Clear text
  getByLabelText(`clear ${attribute}`).click();
  // Original value is still showing even though it's been edited
  await waitFor(() =>
    expect(getByLabelText(`${attribute} text value`)).toHaveTextContent(
      actualValue
    )
  );
});
