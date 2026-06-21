import {
  SpiceMainConn,
  sendCtrlAltDel as _sendCtrlAltDel,
} from '@spice-project/spice-html5';
import { sprintf, translate as __ } from './react_app/common/I18n';

let sc = null;

export function startSpice() {
  const spiceArea = document.getElementById('spice-area');
  if (!spiceArea) return;

  const scheme = spiceArea.dataset.encrypt ? 'wss' : 'ws';
  const host = window.location.hostname;
  const port = spiceArea.dataset.port;
  const password = spiceArea.dataset.password;

  if (!host || !port) {
    // eslint-disable-next-line no-console
    console.log(__('must set host and port'));
    return;
  }

  const uri = `${scheme}://${host}:${port}`;

  try {
    sc = new SpiceMainConn({
      uri,
      screen_id: 'spice-screen',
      password,
      onerror: spiceError,
      onsuccess: spiceSuccess,
    });
  } catch (e) {
    alert(e.toString());
    disconnect();
  }
}

export function disconnect() {
  if (sc) {
    sc.stop();
  }
}

function spiceError(e) {
  const status = document.getElementById('spice-status');
  if (status) {
    status.textContent = e;
    status.classList.remove('label-success');
    status.classList.add('label-danger');
  }
  disconnect();
}

function spiceSuccess(m) {
  const status = document.getElementById('spice-status');
  if (status) {
    status.textContent = sprintf(__('Connected to: %s'), status.getAttribute('data-host'));
    status.classList.add('label-success');
  }
}

export function sendCtrlAltDel() {
  window.sc = sc;
  _sendCtrlAltDel();
  window.sc = undefined;
}
