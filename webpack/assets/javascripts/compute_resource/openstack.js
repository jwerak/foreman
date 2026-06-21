import { showSpinner, hideSpinner } from '../foreman_tools';
import { sprintf, translate as __ } from '../react_app/common/I18n';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function schedulerHintFilterSelected(item) {
  const filter = item.value;
  const wrapper = document.getElementById('scheduler_hint_wrapper');

  if (filter === '') {
    if (wrapper) wrapper.innerHTML = '';
  } else {
    const url = item.getAttribute('data-url');
    const form = document.querySelector('form');
    const data = form
      ? new URLSearchParams(new FormData(form)).toString().replace('method=patch', 'method=post')
      : '';

    showSpinner();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html',
      },
      body: data,
    })
      .then(response => {
        if (!response.ok) throw response;
        return response.text();
      })
      .then(html => {
        if (wrapper) wrapper.innerHTML = html;
      })
      .catch(err => {
        if (wrapper) {
          wrapper.innerHTML = sprintf(
            __('Error loading scheduler hint filters information: %s'),
            err.statusText || String(err)
          );
        }
        const crTab = document.querySelector('#compute_resource_tab a');
        if (crTab) crTab.classList.add('tab-error');
      })
      .finally(() => {
        hideSpinner();
      });
  }
}
