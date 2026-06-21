import store from './react_app/redux';
import { actions as TemplateActions } from './react_app/components/TemplateGenerator';

export function initTypeChanges() {
  document.querySelectorAll('select.input_type_selector').forEach(select => {
    updateVisibilityAfterInputTypeChange(select);
  });

  document.addEventListener('change', e => {
    if (e.target.matches('select.input_type_selector')) {
      updateVisibilityAfterInputTypeChange(e.target);
    }
  });
}

function updateVisibilityAfterInputTypeChange(select) {
  const fieldset = select.closest('fieldset');
  if (!fieldset) return;

  fieldset.querySelectorAll('div.custom_input_type_fields').forEach(el => {
    el.style.display = 'none';
  });
  fieldset.querySelectorAll(`div.${select.value}_input_type`).forEach(el => {
    el.style.display = '';
  });
}

export const toggleEmailFields = checkbox => {
  const form = checkbox.closest('form');
  if (!form) return;

  const checked = checkbox.checked;
  form.querySelectorAll('.email-fields').forEach(el => {
    el.style.display = checked ? '' : 'none';
  });
};

export const generateTemplate = (url, templateInputData) => {
  store.dispatch(TemplateActions.generateTemplate(url, templateInputData));
};

export const pollReportData = url => {
  store.dispatch(TemplateActions.pollReportData(url));
};

export const inputValueOnchange = input => {
  const searchValue = input.value === 'search';
  const resourceValue = input.value === 'resource';
  const plainValue = input.value === 'plain';
  const inputId = input.dataset.item;
  const fields = input.closest('.fields');
  if (!fields) return;

  fields.querySelectorAll(`.resource-type-${inputId}`).forEach(el => {
    el.style.display = (searchValue || resourceValue) ? '' : 'none';
  });
  fields.querySelectorAll(`.input-options-${inputId}`).forEach(el => {
    el.style.display = plainValue ? '' : 'none';
  });
  fields.querySelectorAll(`.input-hidden-value-${inputId}`).forEach(el => {
    el.style.display = plainValue ? '' : 'none';
  });
};

export function snippetChanged(item) {
  const checked = item.checked;

  const kindSelector = document.getElementById('kind_selector');
  const snippetMessage = document.getElementById('snippet_message');
  const association = document.getElementById('association');
  const ptableOsFamily = document.getElementById('ptable_os_family');

  if (kindSelector) kindSelector.style.display = checked ? 'none' : '';
  if (snippetMessage) snippetMessage.style.display = checked ? '' : 'none';
  if (association) association.style.display = checked ? 'none' : '';

  if (checked && ptableOsFamily) {
    ptableOsFamily.value = '';
    ptableOsFamily.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
