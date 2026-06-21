const matcherFieldChanged = (element, currentValue) => {
  const initialValue = element.dataset.initialValue;
  const popover = element.closest('td').querySelector('a.warn-field-changed');

  if (initialValue === currentValue) {
    element.classList.remove('matcher-field-changed');
    if (popover) popover.classList.remove('warn-show');
  } else {
    element.classList.add('matcher-field-changed');
    if (popover) popover.classList.add('warn-show');
  }
};

export const matcherKeyChanged = element => {
  const selected = element.querySelector('option:checked');
  const currentValue = selected ? selected.textContent : '';
  matcherFieldChanged(element, currentValue);
};

export const matcherValueChanged = element => {
  const currentValue = element.value;
  matcherFieldChanged(element, currentValue);
};
