// ========== YARDIMCILAR - HELPERS ==========
// Genel yardımcı fonksiyonlar

import { $ , $$ } from './durum-state.js';

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

export function getDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function setupPanelSearch(type) {
  const input = $(`${type}-search`);
  if (!input) return;
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    $$(`#${type}-list .panel-item`).forEach(item => {
      const title = item.querySelector('.panel-item-title')?.textContent.toLowerCase() || '';
      item.style.display = title.includes(query) ? 'flex' : 'none';
    });
  });
}
