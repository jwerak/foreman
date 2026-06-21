import Cookies from 'js-cookie';

import {
  sprintf,
  ngettext as n__,
  translate as __,
} from '../react_app/common/I18n';
import { getURIsearch } from '../react_app/common/urlHelpers';
import { foremanUrl } from '../foreman_tools';
import * as sessionStorage from './HostsSessionStorage';

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

const cookieName = `_ForemanSelected${window.location.pathname.replace(
  /\//,
  ''
)}`;
let foremanSelectedHosts = readFromCookie();

export function hostChecked({ id, checked }) {
  const multipleAlert = document.getElementById('multiple-alert');
  const cid = parseInt(id.replace('host_ids_', ''), 10);
  if (checked) addHostId(cid);
  else {
    rmHostId(cid);
    if (multipleAlert) {
      multipleAlert.style.display = 'none';
      multipleAlert.dataset.multiple = 'false';
    }
  }
  Cookies.set(cookieName, JSON.stringify(foremanSelectedHosts), {
    secure: window.location.protocol === 'https:',
  });
  toggleActions();
  updateCounter();
  return false;
}

function addHostId(id) {
  if (foremanSelectedHosts.indexOf(id) === -1) foremanSelectedHosts.push(id);
}

function rmHostId(id) {
  const pos = foremanSelectedHosts.indexOf(id);
  if (pos >= 0) foremanSelectedHosts.splice(pos, 1);
}

function readFromCookie() {
  try {
    const r = Cookies.get(cookieName);
    if (r) return JSON.parse(r);
    return [];
  } catch (err) {
    removeForemanHostsCookie();
    return [];
  }
}

function toggleActions() {
  const dropDownContainer = document.getElementById('submit_multiple');
  if (!dropDownContainer) return;

  const dropdowns = dropDownContainer.querySelectorAll('a');
  const disabledMessage = __('Please select hosts to perform action on.');

  if (foremanSelectedHosts.length === 0) {
    dropdowns.forEach(a => {
      a.classList.add('disabled');
      a.setAttribute('disabled', 'disabled');
    });
    dropDownContainer.setAttribute('title', disabledMessage);
  } else {
    dropdowns.forEach(a => {
      a.classList.remove('disabled');
      a.removeAttribute('disabled');
    });
    dropDownContainer.removeAttribute('title');
  }
}

document.addEventListener('ContentLoad', () => {
  if (window.location.pathname !== foremanUrl('/hosts')) return;

  const hostQuery = sessionStorage.getHostQuery();
  const uriSearch = getURIsearch();

  if (uriSearch !== '' && hostQuery !== uriSearch) {
    cleanHostsSelection();
    sessionStorage.setHostQuery(uriSearch);
    return;
  }
  sessionStorage.setHostQuery(uriSearch);

  for (let i = 0; i < foremanSelectedHosts.length; i++) {
    const cid = `host_ids_${foremanSelectedHosts[i]}`;
    const box = document.getElementById(cid);
    if (box) box.checked = true;
  }
  toggleActions();
  updateCounter();

  const cancelBtn = document.querySelector('#confirmation-modal .secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideModal('confirmation-modal');
    });
  }
});

function removeForemanHostsCookie() {
  Cookies.remove(cookieName);
}

export function resetSelection() {
  removeForemanHostsCookie();
  foremanSelectedHosts = [];
}

function cleanHostsSelection() {
  document.querySelectorAll('.host_select_boxes').forEach(box => {
    box.checked = false;
    hostChecked(box);
  });
  resetSelection();
  toggleActions();
  updateCounter();
  return false;
}

export function multipleSelection() {
  const { total } = paginationMetaData();
  const alertText = sprintf(
    n__(
      'Single host is selected in total',
      'All <b> %d </b> hosts are selected.',
      total
    ),
    total
  );
  const undoText = __('Undo selection');
  const multipleAlert = document.getElementById('multiple-alert');
  if (!multipleAlert) return;

  const textEl = multipleAlert.querySelector('.text');
  if (textEl) {
    textEl.innerHTML =
      `${alertText} <a href="#" onclick="tfm.hosts.table.undoMultipleSelection();">${undoText}</a>`;
  }
  multipleAlert.dataset.multiple = 'true';
  document.querySelectorAll('.select_count').forEach(el => {
    el.innerHTML = String(total);
  });
}

export function undoMultipleSelection() {
  const pagination = paginationMetaData();
  const alertText = sprintf(
    n__(
      'Single host on this page is selected.',
      'All %s hosts on this page are selected.',
      pagination.perPage
    ),
    pagination.perPage
  );
  const selectText = sprintf(
    n__('Select this host', 'Select all<b> %s </b> hosts', pagination.total),
    pagination.total
  );
  const multipleAlert = document.getElementById('multiple-alert');
  if (!multipleAlert) return;

  const textEl = multipleAlert.querySelector('.text');
  if (textEl) {
    textEl.innerHTML =
      `${alertText} <a href="#" onclick="tfm.hosts.table.multipleSelection();">${selectText}</a>`;
  }
  multipleAlert.dataset.multiple = 'false';
  document.querySelectorAll('.select_count').forEach(el => {
    el.innerHTML = String(pagination.perPage);
  });
}

export function toggleCheck() {
  const pagination = paginationMetaData();
  const multipleAlert = document.getElementById('multiple-alert');
  const checkAll = document.getElementById('check_all');
  const checked = checkAll ? checkAll.checked : false;

  document.querySelectorAll('.host_select_boxes').forEach(box => {
    box.checked = checked;
    hostChecked(box);
  });

  if (multipleAlert) {
    if (checked && pagination.perPage - pagination.total < 0) {
      multipleAlert.style.display = '';
      multipleAlert.dataset.multiple = 'false';
    } else if (!checked) {
      multipleAlert.style.display = 'none';
      multipleAlert.dataset.multiple = 'false';
      cleanHostsSelection();
    }
  }
  return false;
}

export function toggleMultipleOkButton({ value }) {
  const btn = document.querySelector('#confirmation-modal .btn-primary');
  if (!btn) return;

  if (value !== 'disabled') {
    btn.classList.remove('disabled');
    btn.disabled = false;
  } else {
    btn.classList.add('disabled');
    btn.disabled = true;
  }
}

export function submitModalForm() {
  const keepSelected = document.getElementById('keep_selected');
  if (keepSelected && !keepSelected.checked) removeForemanHostsCookie();

  if (isMultiple()) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'search';
    input.value = getURIsearch();
    const form = document.querySelector('#confirmation-modal form');
    if (form) form.appendChild(input);
  }

  const form = document.querySelector('#confirmation-modal form');
  if (form) form.submit();
  hideModal('confirmation-modal');
}

function isMultiple() {
  const alert = document.getElementById('multiple-alert');
  return alert ? alert.dataset.multiple === 'true' : false;
}

function getBulkParam() {
  return isMultiple()
    ? { search: getURIsearch() }
    : { host_ids: foremanSelectedHosts };
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'block';
  modal.classList.add('in');
  document.body.classList.add('modal-open');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade in';
  backdrop.id = `${id}-backdrop`;
  document.body.appendChild(backdrop);
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('in');
  document.body.classList.remove('modal-open');

  const backdrop = document.getElementById(`${id}-backdrop`);
  if (backdrop) backdrop.remove();
}

export function buildModal(element, url) {
  const data = getBulkParam();
  const title = element.getAttribute('data-dialog-title');
  const modalHeader = document.querySelector('#confirmation-modal .modal-header h4');
  if (modalHeader) modalHeader.textContent = title;

  const modalBody = document.querySelector('#confirmation-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = "<div class='modal-spinner spinner spinner-lg'></div>";
  }

  showModal('confirmation-modal');

  const params = new URLSearchParams(
    typeof data.host_ids !== 'undefined'
      ? data.host_ids.map(id => ['host_ids[]', id])
      : [['search', data.search]]
  ).toString();

  fetch(`${url}?${params}`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/html',
    },
  })
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.getElementById('content');

      if (modalBody) {
        modalBody.innerHTML = content ? content.innerHTML : html;
      }

      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';

      const submitMultiple = document.getElementById('submit_multiple');
      if (submitMultiple) submitMultiple.value = '';

      if (isMultiple()) {
        const multiAlert = document.getElementById('multiple-modal-alert');
        if (multiAlert) multiAlert.style.display = '';
      }

      const btn = document.querySelector('#confirmation-modal .btn-primary');
      if (btn) {
        const hasSelect = modalBody && modalBody.querySelector('form select');
        if (hasSelect) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.classList.remove('disabled');
          btn.disabled = false;
        }
      }
    });

  return false;
}

export function buildRedirect(url) {
  const data = getBulkParam();
  const params = new URLSearchParams(
    typeof data.host_ids !== 'undefined'
      ? data.host_ids.map(id => ['host_ids[]', id])
      : [['search', data.search]]
  ).toString();

  const redirectUrl = url.includes('?')
    ? `${url}&${params}`
    : `${url}?${params}`;

  window.location.replace(redirectUrl);
}

function paginationMetaData() {
  const paginationEl = document.querySelector('.pf-v6-c-pagination');
  if (!paginationEl) return { total: 0, perPage: 0 };

  const { total, perPage } = paginationEl.dataset;
  return { total: Number(total), perPage: Number(perPage) };
}

function updateCounter() {
  const item = document.getElementById('check_all');
  if (foremanSelectedHosts) {
    document.querySelectorAll('.select_count').forEach(el => {
      el.textContent = String(foremanSelectedHosts.length);
    });
  }

  if (!item) return false;

  let title = '';
  if (item.checked && foremanSelectedHosts) {
    title = `${foremanSelectedHosts.length} - ${item.getAttribute('uncheck-title')}`;
  } else {
    title = item.getAttribute('check-title');
  }

  item.setAttribute('title', title);
  return false;
}
