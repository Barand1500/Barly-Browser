// ========== ARAYUZ - UI ==========
// Toast, Modal, Panel ve paylaşılan UI fonksiyonları

import { dom, state } from './durum-state.js';
import { getDomain } from './yardimcilar-helpers.js';

// ========== TOAST ==========
export function showToast(message, type = 'info') {
  if (!dom.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ========== MODAL ==========
export function showModal(title, body, footer = '') {
  if (!dom.modal) return;
  dom.modalTitle.textContent = title;
  dom.modalBody.innerHTML = body;
  dom.modalFooter.innerHTML = footer;
  dom.modal.classList.remove('hidden');
}

export function hideModal() {
  if (dom.modal) dom.modal.classList.add('hidden');
}

// ========== PANEL ==========
export function showPanel(title, content) {
  if (!dom.rightPanel) return;
  dom.panelTitle.textContent = title;
  dom.panelContent.innerHTML = content;
  dom.rightPanel.classList.remove('hidden');
}

export function hidePanel() {
  if (dom.rightPanel) dom.rightPanel.classList.add('hidden');
}

// ========== HTTPS UYARISI ==========
export function checkHttpsWarning(url) {
  if (!dom.httpsWarning || !state.settings.httpsWarning) return;
  if (url && url.startsWith('http://') && !state.httpsWarningDismissed[getDomain(url)]) {
    dom.httpsWarning.classList.remove('hidden');
  } else {
    dom.httpsWarning.classList.add('hidden');
  }
}

export function dismissHttpsWarning(activeTabGetter) {
  const tab = activeTabGetter();
  if (tab && tab.url) {
    state.httpsWarningDismissed[getDomain(tab.url)] = true;
  }
  if (dom.httpsWarning) dom.httpsWarning.classList.add('hidden');
}

// ========== MENÜLERI GİZLE ==========
export function hideAllMenus() {
  if (dom.contextMenu) dom.contextMenu.classList.add('hidden');
  if (dom.shareMenu) dom.shareMenu.classList.add('hidden');
  if (dom.findBar) dom.findBar.classList.add('hidden');
  if (dom.modal) dom.modal.classList.add('hidden');
  if (dom.notepadMini) dom.notepadMini.classList.add('hidden');
  if (dom.linkPreviewTooltip) dom.linkPreviewTooltip.classList.add('hidden');
}
