import RFB from '@novnc/novnc/core/rfb';
import { sprintf, translate as __ } from './react_app/common/I18n';

let rfb;
const StatusLevelLookup = {
  failed: 'danger',
  fatal: 'danger',
  normal: 'success',
  disconnected: 'default',
};

function sendCtrlAltDel() {
  rfb.sendCtrlAltDel();
  return false;
}

function showStatus(state, message) {
  const level = StatusLevelLookup[state] || 'warning';
  const status = document.getElementById('noVNC_status');
  const ctrlAltDeleteButton = document.getElementById('ctrlAltDelButton');

  if (ctrlAltDeleteButton) {
    ctrlAltDeleteButton.disabled = state !== 'normal';
  }

  if (status && typeof message !== 'undefined') {
    status.className = `col-md-12 label label-${level}`;
    status.innerHTML = message;
  }
}

function securityFailed(e) {
  let msg = '';
  if ('reason' in e.detail) {
    msg = sprintf(
      __('New connection has been rejected with reason: %'),
      e.detail.reason
    );
  } else {
    msg = __('New connection has been rejected');
  }
  showStatus('fatal', msg);
}

function disconnectFinished() {
  showStatus('failed', __('Disconnected'));
}

function connectFinished() {
  showStatus('normal', __('Connected'));
}

function onClose(e) {
  if (e.code === 1006) {
    showStatus(
      'failed',
      __(
        'The connection was closed by the browser. please verify that the certificate authority is valid'
      )
    );
  }
}

document.addEventListener('ContentLoad', () => {
  const vncScreen = document.getElementById('noVNC_screen');

  if (vncScreen) {
    const sendBtn = document.getElementById('sendCtrlAltDelButton');
    if (sendBtn) sendBtn.addEventListener('click', sendCtrlAltDel);

    const vncEl = document.getElementById('vnc');
    if (!vncEl) return;

    const protocol = vncEl.dataset.encrypt ? 'wss' : 'ws';
    const host = vncEl.getAttribute('data-host') || window.location.hostname;
    const port = vncEl.getAttribute('data-port');
    const path = vncEl.getAttribute('data-path');
    const password = vncEl.getAttribute('data-password');
    const tokenProtocol = vncEl.getAttribute('data-token-protocol');
    const plainProtocol = vncEl.getAttribute('data-plain-protocol');
    const url = `${protocol}://${host}:${port}${path || ''}`;
    const options = {};
    if (password) {
      options.credentials = { password };
    }
    if (tokenProtocol || plainProtocol) {
      options.wsProtocols = [tokenProtocol, plainProtocol].filter(String);
    }
    rfb = new RFB(vncScreen, url, options);
    rfb._sock.on('close', onClose);
    rfb.addEventListener('connect', connectFinished);
    rfb.addEventListener('disconnect', disconnectFinished);
    rfb.addEventListener('securityfailure', securityFailed);

    showStatus('disconnected', __('Loading...'));
  }
});
