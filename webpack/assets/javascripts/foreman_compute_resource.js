import { activateDatatables } from './foreman_tools';
import { notify } from './foreman_toast_notifications';
import { sprintf, translate as __ } from './react_app/common/I18n';
import * as ec2 from './compute_resource/ec2';
import * as libvirt from './compute_resource/libvirt';
import * as openstack from './compute_resource/openstack';
import * as vmware from './compute_resource/vmware';

export default {
  ec2,
  libvirt,
  openstack,
  vmware,
  capacityEdit,
  providerSelected,
  testConnection,
};

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

document.addEventListener('ContentLoad', () => {
  document.querySelectorAll('#vms[data-url], #images_list[data-url], #key_pairs_list[data-url]').forEach(el => {
    const url = el.getAttribute('data-url');

    fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'text/html' },
    })
      .then(response => {
        if (!response.ok) throw response;
        return response.text();
      })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = doc.querySelector('table');
        el.innerHTML = table ? table.outerHTML : html;
        activateDatatables();
      })
      .catch(err => {
        el.innerHTML = sprintf(
          __('There was an error listing VMs: %(status)s %(statusText)s'),
          { status: err.status || '', statusText: err.statusText || String(err) }
        );
      });
  });
});

export function providerSelected(item) {
  const computeConnection = document.getElementById('compute_connection');
  const provider = item.value;

  if (provider === '') {
    if (computeConnection) computeConnection.style.display = 'none';
    document.querySelectorAll('[type=submit]').forEach(btn => {
      btn.disabled = true;
    });
    return false;
  }

  document.querySelectorAll('[type=submit]').forEach(btn => {
    btn.disabled = false;
  });

  const url = item.getAttribute('data-url');
  const data = `provider=${provider}`;

  if (computeConnection) {
    computeConnection.style.display = '';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html',
        'X-CSRF-Token': getCsrfToken(),
      },
      body: data,
    })
      .then(r => r.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('div#compute_connection');
        computeConnection.innerHTML = content ? content.innerHTML : html;
        if (typeof window.password_caps_lock_hint === 'function') {
          window.password_caps_lock_hint();
        }
      });
  }

  return false;
}

export function testConnection(item) {
  const form = document.querySelector('form');
  let crId = form ? form.dataset.id : '';
  if (crId === undefined || crId === null) crId = '';

  const passwordInput = document.querySelector('input#compute_resource_password');
  const password = passwordInput ? passwordInput.value : '';
  const passwordDisabled = passwordInput ? passwordInput.disabled : false;

  document.querySelectorAll('.tab-error').forEach(el => el.classList.remove('tab-error'));

  const indicator = document.getElementById('test_connection_indicator');
  if (indicator) indicator.style.display = '';

  const formData = new URLSearchParams(new FormData(form)).toString();
  const body = `${formData}&cr_id=${crId}`;

  fetch(item.getAttribute('data-url'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-Token': getCsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/html',
    },
    body,
  })
    .then(response => {
      if (!response.ok) throw response;
      return response.text();
    })
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const computeConnection = document.getElementById('compute_connection');
      const newContent = doc.querySelector('#compute_connection');
      const alert = doc.querySelector('.alert');

      if (computeConnection && newContent) {
        computeConnection.innerHTML = newContent.innerHTML;
      }
      if (computeConnection && alert) {
        computeConnection.insertAdjacentHTML('afterbegin', alert.outerHTML);
      }

      if (!doc.querySelector('.alert-danger') && !doc.querySelector('#compute_connection .has-error')) {
        notify({ message: __('Test connection was successful'), type: 'success' });
      }
    })
    .catch(err => {
      notify({
        message: `${__('An error occurred while testing the connection: ')}${err.statusText || String(err)}`,
        type: 'danger',
      });
    })
    .finally(() => {
      if (passwordInput) {
        passwordInput.value = password;
        passwordInput.disabled = passwordDisabled;
      }
      if (indicator) indicator.style.display = 'none';
      if (typeof window.reloadOnAjaxComplete === 'function') {
        window.reloadOnAjaxComplete('#test_connection_indicator');
      }
    });
}

export function capacityEdit(element) {
  const fields = element.closest('.fields');
  if (!fields) return false;

  const activeBtn = fields.querySelector('button[name=allocation_radio_btn].btn.active');

  if (activeBtn && activeBtn.id === 'btnAllocationFull') {
    const allocation = fields.querySelector('[id$=allocation]');
    if (allocation) allocation.value = element.value;
  }
  return false;
}
