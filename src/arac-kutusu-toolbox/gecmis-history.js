// ========== GEÇMİŞ - HISTORY ==========

import { $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, hidePanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, getDomain, setupPanelSearch } from '../cekirdek-core/yardimcilar-helpers.js';

let _navigate = null;
export function initHistory(navigate) { _navigate = navigate; }

export async function showHistoryPanel() {
  try {
    const history = await window.electronAPI.getHistory();
    let content = '<div class="panel-search"><input type="text" placeholder="Ara..." id="history-search"></div>';
    if (history.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">📜</div>Geçmiş boş</div>`;
    } else {
      content += '<div id="history-list">';
      const today = new Date().toDateString();
      let currentDate = '';
      history.slice(0, 100).forEach(h => {
        const itemDate = new Date(h.visitedAt).toDateString();
        if (itemDate !== currentDate) {
          currentDate = itemDate;
          content += `<div class="panel-section-title">${itemDate === today ? 'Bugün' : itemDate}</div>`;
        }
        content += `
          <div class="panel-item" data-url="${escapeHtml(h.url)}">
            <div class="panel-item-icon">🕐</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(h.title || h.url)}</div>
              <div class="panel-item-subtitle">${escapeHtml(getDomain(h.url))}</div>
            </div>
          </div>`;
      });
      content += '</div>';
      content += '<button class="btn btn-danger" id="clear-history-btn" style="width:100%;margin-top:12px;">🗑️ Temizle</button>';
    }
    showPanel('📜 Geçmiş', content);
    setTimeout(() => {
      setupPanelSearch('history');
      $$('#history-list .panel-item').forEach(item => {
        item.addEventListener('click', () => {
          if (_navigate) _navigate(item.dataset.url);
          hidePanel();
        });
      });
      $('clear-history-btn')?.addEventListener('click', async () => {
        if (confirm('Geçmişi temizle?')) {
          await window.electronAPI.clearHistory();
          showHistoryPanel();
          showToast('Geçmiş temizlendi', 'success');
        }
      });
    }, 50);
  } catch(e) {}
}
