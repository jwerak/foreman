import { notify, clear } from './foreman_toast_notifications';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function testConnection(item, url) {
  let httpProxyId = '';
  const passwordField = document.getElementById('http_proxy_password');

  if (passwordField && passwordField.disabled) {
    const formElement = document.querySelector('form');
    httpProxyId = formElement.dataset.id || '';
  }

  const formData = new URLSearchParams(new FormData(document.querySelector('form')));
  formData.append('http_proxy_id', httpProxyId);
  const data = formData.toString();

  const indicator = document.getElementById('test_connection_indicator');
  if (indicator) indicator.style.display = '';
  item.classList.add('disabled');
  clear();

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
      if (!response.ok) return response.json().then(err => { throw err; });
      return response.json();
    })
    .then(result => {
      notify({ message: result.message, type: 'success' });
    })
    .catch(err => {
      notify({ message: err.message || String(err), type: 'danger' });
    })
    .finally(() => {
      if (indicator) indicator.style.display = 'none';
      item.classList.remove('disabled');
    });
}
