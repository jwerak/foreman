import { importRemote } from '@module-federation/utilities';
import { sprintf, translate as __ } from './react_app/common/I18n';

import { showLoading, hideLoading } from './foreman_navigation';

import store from './react_app/redux';
import { openConfirmModal as coreOpenConfirmModal } from './react_app/components/ConfirmModal';

export const openConfirmModal = options =>
  store.dispatch(coreOpenConfirmModal(options));

export function showModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'block';
  modal.classList.add('in');
  document.body.classList.add('modal-open');
}

export function hideModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('in');
  document.body.classList.remove('modal-open');
}

export * from './react_app/common/DeprecationService';

export function showSpinner() {
  showLoading();
}

export function hideSpinner() {
  hideLoading();
}

export function iconText(name, innerText, iconClass) {
  let icon = `<span class="${iconClass} ${iconClass}-${name}"/>`;

  if (innerText !== '') {
    icon += `<strong>${innerText}</strong>`;
  }
  return icon;
}

export function activateDatatables() {
  if (!window.$ || !window.$.fn || !window.$.fn.DataTable) return;

  const language = {
    searchPlaceholder: __('Filter...'),
    emptyTable: __('No data available in table'),
    info: sprintf(__('Showing %(start)s to %(end)s of %(total)s entries'), {
      start: '_START_',
      end: '_END_',
      total: '_TOTAL_',
    }),
    infoEmpty: __('Showing 0 to 0 of 0 entries'),
    infoFiltered: sprintf(__('(filtered from %s total entries)'), '_MAX_'),
    lengthMenu: sprintf(__('Show %s entries'), '_MENU_'),
    loadingRecords: __('Loading...'),
    processing: __('Processing...'),
    search: __('Search:'),
    zeroRecords: __('No matching records found'),
    paginate: {
      first: __('First'),
      last: __('Last'),
      next: __('Next'),
      previous: __('Previous'),
    },
    aria: {
      sortAscending: __(': activate to sort column ascending'),
      sortDescending: __(': activate to sort column descending'),
    },
  };

  const $ = window.$;

  $('[data-table=inline]')
    .not('.dataTable')
    .DataTable({
      pagingType: 'simple_numbers',
      language,
      dom: "<'row'<'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
    });

  $('[data-table=server]')
    .not('.dataTable')
    .each((i, el) => {
      const url = el.getAttribute('data-source');

      $(el).DataTable({
        pagingType: 'simple_numbers',
        language,
        processing: true,
        serverSide: true,
        ordering: false,
        ajax: url,
        dom: "<'row'<'col-md-6'f>r>t<'row'<'col-md-6'><'col-md-6'p>>",
      });
    });
}

export function activateTooltips(elParam = 'body') {
  // Bootstrap tooltip plugin removed — native browser title tooltips are used instead.
  // For ellipsis overflow detection, use CSS text-overflow: ellipsis (already styled).
  // This function is kept as a no-op for backward compatibility with callers.
}

export { foremanUrl } from './react_app/common/helpers';

export const setTab = () => {
  const urlHash = document.location.hash.split('?')[0];
  if (urlHash.length && !urlHash.startsWith('#/')) {
    const tabContent = document.querySelector(urlHash);
    if (tabContent) {
      const parentTab = tabContent.closest('.tab-pane');
      if (parentTab) {
        activateTab(`.nav-tabs a[href="#${parentTab.id}"]`);
      }
      activateTab(`.nav-tabs a[href="${urlHash}"]`);
    }
  }
};

function activateTab(selector) {
  const tabLink = document.querySelector(selector);
  if (!tabLink) return;

  const tabList = tabLink.closest('ul');
  if (tabList) {
    tabList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
  }
  const parentLi = tabLink.closest('li');
  if (parentLi) parentLi.classList.add('active');

  const href = tabLink.getAttribute('href');
  if (href && href.startsWith('#')) {
    const tabContainer = document.querySelector(href);
    if (tabContainer) {
      const siblings = tabContainer.parentElement.querySelectorAll('.tab-pane');
      siblings.forEach(pane => pane.classList.remove('active', 'in'));
      tabContainer.classList.add('active', 'in');
    }
  }
}

export function highlightTabErrors() {
  const errorFields = document.querySelectorAll('.tab-content .has-error');
  errorFields.forEach(field => {
    let pane = field.closest('.tab-pane');
    while (pane) {
      const link = document.querySelector(`a[href="#${pane.id}"]`);
      if (link) link.classList.add('tab-error');
      pane = pane.parentElement ? pane.parentElement.closest('.tab-pane') : null;
    }
  });

  const firstTabError = document.querySelector('.tab-error');
  if (firstTabError) {
    activateTab(`.nav-tabs a.tab-error`);
  }
  const firstNestedTabError = document.querySelector('.nav-pills .tab-error');
  if (firstNestedTabError) {
    activateTab(`.nav-pills a.tab-error`);
  }

  const firstErrorInput = document.querySelector('.tab-content .has-error .form-control');
  if (firstErrorInput) firstErrorInput.focus();
}

export const loadPluginModule = async (url, scope, module, plugin = true) => {
  if (!window.allPluginsLoaded) {
    window.allPluginsLoaded = {};
  }
  const name = `${scope}${module}`;
  window.allPluginsLoaded[name] = false;
  await importRemote({
    url,
    scope,
    module,
    remoteEntryFileName: plugin ? `${scope}_remoteEntry.js` : 'remoteEntry.js',
  });
  window.allPluginsLoaded[name] = true;
  const loadPlugin = new Event('loadPlugin');
  document.dispatchEvent(loadPlugin);
};
