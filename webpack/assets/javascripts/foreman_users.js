import { escape } from 'lodash';
import { notify } from './foreman_toast_notifications';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function initInheritedRoles() {
  const links = document.querySelectorAll('#inherited-roles .dropdown-menu a');
  links.forEach(link => {
    link.addEventListener('click', e => {
      const target = e.target;
      document.querySelectorAll('#roles_tab li').forEach(li => {
        li.style.display = 'none';
      });
      const dataId = target.getAttribute('data-id');
      document.querySelectorAll(`#roles_tab li[data-id='${dataId}']`).forEach(li => {
        li.style.display = '';
      });
      const btn = target.closest('.dropdown').querySelector('.btn');
      if (btn) {
        btn.innerHTML = `${escape(target.textContent)} <span class="caret"></span>`;
      }
    });
  });
  if (links.length > 0) links[0].click();
}

function getSelectValues({ options = [] }) {
  return Array.from(options)
    .filter(opt => opt.selected)
    .map(opt => [opt.value, opt.text]);
}

export function taxonomyAdded(taxonomies, type) {
  const selected = [['', ''], ...getSelectValues(taxonomies)];
  const defaults = document.getElementById(`user_default_${type}_id`);

  if (defaults) {
    defaults.innerHTML = selected
      .map(opt => `<option value='${opt[0]}'>${escape(opt[1])}</option>`)
      .join('');
  }
}

export function testMail(item, url, param = {}) {
  const spinner = document.getElementById('test_indicator');

  item.classList.add('disabled');
  if (spinner) spinner.style.display = '';

  const body = typeof param === 'string' ? param : new URLSearchParams(param).toString();

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-Token': getCsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  })
    .then(response => {
      if (!response.ok) return response.text().then(text => { throw JSON.parse(text); });
      return response.json();
    })
    .then(({ message }) => notify({ message, type: 'success' }))
    .catch(err => notify({ message: err.message || String(err), type: 'danger' }))
    .finally(() => {
      if (spinner) spinner.style.display = 'none';
      item.classList.remove('disabled');
    });
}

export function authSourceSelected(param) {
  const id = param.selectedOptions[0].textContent;
  const passwordSection = document.getElementById('password');
  if (passwordSection) {
    passwordSection.style.display = id === 'INTERNAL' ? '' : 'none';
  }
}
