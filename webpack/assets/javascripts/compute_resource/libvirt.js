import { showSpinner } from '../foreman_tools';
import { translate as __ } from '../react_app/common/I18n';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function networkSelected(item) {
  const selected = item.value;
  const parent = item.closest('.fields');
  if (!parent) return false;

  const bridge = parent.querySelector('#bridge');
  const nat = parent.querySelector('#nat');

  switch (selected) {
    case '':
      disableDropdown(bridge);
      disableDropdown(nat);
      break;
    case 'network':
      disableDropdown(bridge);
      enableDropdown(nat);
      break;
    case 'bridge':
      disableDropdown(nat);
      enableDropdown(bridge);
      break;
    default:
      break;
  }
  return false;
}

function disableDropdown(el) {
  if (!el) return;
  el.style.display = 'none';
  el.setAttribute('disabled', 'true');
}

function enableDropdown(el) {
  if (!el) return;
  el.removeAttribute('disabled');
  el.querySelectorAll(':scope input, :scope select, :scope textarea').forEach(input => {
    input.removeAttribute('disabled');
  });
  el.style.display = '';
}

export function imageSelected(item) {
  const template = item.value;

  if (template) {
    const url = item.getAttribute('data-url');
    const help = document.querySelector('#image_selection .form-group > div > .help-block');

    showSpinner();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: `template_id=${template}`,
    })
      .then(response => {
        if (!response.ok) throw new Error(__('Image not found'));
        return response.json();
      })
      .then(result => {
        if (help) help.innerHTML = '';

        const capacity = document.getElementById(
          'host_compute_attributes_volumes_attributes_0_capacity'
        );

        if (capacity) {
          const capacityInForm = parseInt(
            capacity.getAttribute('value').slice(0, -1),
            10
          );
          const capacityFromImage = parseInt(result.capacity, capacityInForm);

          if (capacityInForm < capacityFromImage) {
            capacity.setAttribute('value', `${capacityFromImage}G`);
          }
        }

        const volume = document.querySelector(
          '#storage_volumes .fields #host_compute_attributes_volumes_attributes_0_format_type'
        );

        if (volume) {
          volume.value = 'qcow2';
          volume.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })
      .catch(() => {
        if (help) {
          help.innerHTML = `<span class="text-danger">${__('Image not found')}</span>`;
        }
      })
      .finally(() => {
        if (typeof window.reloadOnAjaxComplete === 'function') {
          window.reloadOnAjaxComplete(item);
        }
      });
  }
}

export function allocationSwitcher(element, action) {
  const parent = element.parentElement;
  if (parent) {
    const previous = parent.querySelector('.active');
    if (previous) previous.classList.remove('active');
  }

  const fields = element.closest('.fields');
  if (!fields) return false;

  const capacity = fields.querySelector('[id$=capacity]');
  const allocation = fields.querySelector('[id$=allocation]');
  if (!allocation) return false;

  switch (action) {
    case 'None':
      allocation.setAttribute('readonly', 'readonly');
      allocation.value = '0G';
      break;
    case 'Size':
      allocation.removeAttribute('readonly');
      allocation.value = '0G';
      allocation.focus();
      break;
    case 'Full':
      allocation.setAttribute('readonly', 'readonly');
      if (capacity) allocation.value = capacity.value;
      break;
    default:
      break;
  }

  element.classList.toggle('active');
  return false;
}
