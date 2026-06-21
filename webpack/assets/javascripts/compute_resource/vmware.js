import store from '../react_app/redux';
import { translate as __ } from '../react_app/common/I18n';
import { showSpinner, hideSpinner } from '../foreman_tools';
import { changeCluster } from '../react_app/redux/actions/hosts/storage/vmware';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

export function onClusterChange(item) {
  const clusterId = item.value;
  const resPoolsUrl = item.dataset.poolsurl;
  const networksUrl = item.dataset.networksurl;

  store.dispatch(changeCluster(clusterId));

  fetchResourcePools(resPoolsUrl, clusterId);
  fetchNetworks(networksUrl, clusterId);
}

function fetchResourcePools(url, clusterId) {
  const selectbox = document.querySelector('select[id$="resource_pool"]');
  if (!selectbox) return;

  if (!clusterId) {
    // select2 jQuery plugin — use global $ if available
    if (window.$ && window.$(selectbox).select2) {
      window.$(selectbox).select2('destroy');
    }
    selectbox.innerHTML = `<option value="">${__('Please select a cluster')}</option>`;
    selectbox.disabled = true;
    if (window.$ && window.$(selectbox).select2) {
      window.$(selectbox).select2();
    }
    return;
  }

  showSpinner();

  fetch(`${url}?cluster_id=${encodeURIComponent(clusterId)}`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(request => {
      if (window.$ && window.$(selectbox).select2) {
        window.$(selectbox).select2('destroy');
      }
      selectbox.innerHTML = '';
      selectbox.disabled = false;
      request.forEach(({ name }) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectbox.appendChild(option);
      });
      if (window.$ && window.$(selectbox).select2) {
        window.$(selectbox).select2();
      }
    })
    .finally(() => {
      hideSpinner();
    });
}

function fetchNetworks(url, clusterId) {
  const networkOptions = document.querySelectorAll('select[id$=_network]');

  showSpinner();

  fetch(`${url}?cluster_id=${encodeURIComponent(clusterId)}`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
    },
  })
    .then(response => response.json())
    .then(response => {
      networkOptions.forEach(select => {
        select.innerHTML = '';
        response.results.forEach(({ name, id }) => {
          const option = new Option(name, id, false, false);
          select.appendChild(option);
        });
      });

      if (typeof window.update_interface_table === 'function') {
        window.update_interface_table();
      }
    })
    .finally(() => {
      hideSpinner();
    });
}
