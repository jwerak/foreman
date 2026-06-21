import { notify } from './foreman_toast_notifications';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function testConnection(item, url) {
  const indicator = document.getElementById('test_connection_indicator');
  if (indicator) indicator.style.display = '';
  item.classList.add('disabled');

  const data = new URLSearchParams(new FormData(document.querySelector('form'))).toString();

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-Token': getCsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: data,
  })
    .then(response => {
      if (!response.ok) return response.text().then(text => { throw JSON.parse(text); });
      return response.json();
    })
    .then(({ message }) => notify({ message, type: 'success' }))
    .catch(err => notify({ message: err.message || String(err), type: 'danger' }))
    .finally(() => {
      if (indicator) indicator.style.display = 'none';
      item.classList.remove('disabled');
    });
}

export function changeLdapPort(item) {
  const port = document.getElementById('auth_source_ldap_port');
  if (!port) return;

  const value = parseInt(port.value, 10);
  const defaultPorts = JSON.parse(port.getAttribute('data-default-ports') || 'null');

  if (
    !Number.isNaN(value) &&
    defaultPorts != null &&
    defaultPorts.ldap != null &&
    defaultPorts.ldaps != null
  ) {
    if (item.checked) {
      if (value === defaultPorts.ldap) {
        port.value = defaultPorts.ldaps;
      }
    } else if (value === defaultPorts.ldaps) {
      port.value = defaultPorts.ldap;
    }
  }
}

function updateLdapAccountHelp(selectedType) {
  ['account', 'base_dn', 'groups_base'].forEach(fieldName => {
    const element = document.getElementById(`auth_source_ldap_${fieldName}`);
    if (!element) return;

    const helpData = JSON.parse(element.getAttribute('data-help') || '{}');
    const help = helpData[selectedType];
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;

    const popover = formGroup.querySelector('label a[rel=popover]');
    if (!popover) return;

    if (help !== undefined) {
      popover.setAttribute('data-content', help);
      popover.style.display = '';
    } else {
      popover.style.display = 'none';
    }
  });
}

export function changeLdapServerType() {
  const typeSelect = document.getElementById('auth_source_ldap_server_type');
  if (!typeSelect) return;

  const type = typeSelect.value;
  const membershipType = document.getElementById('auth_source_ldap_ldap_group_membership');
  if (!membershipType) return;

  const membershipGroup = membershipType.closest('.form-group');
  if (membershipGroup) {
    membershipGroup.style.display = type !== 'active_directory' ? '' : 'none';
  }

  if (type !== 'active_directory') {
    const rfc4519 = membershipType.querySelector('option[value="rfc4519"]');

    if (type !== 'posix') {
      if (rfc4519) rfc4519.disabled = true;
      if (membershipType.value === 'rfc4519') {
        membershipType.value = 'posix';
        membershipType.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      if (rfc4519) rfc4519.disabled = false;
    }
  }

  updateLdapAccountHelp(type);
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.match(/auth_source_ldaps/i)) {
    changeLdapServerType();
  }
});
