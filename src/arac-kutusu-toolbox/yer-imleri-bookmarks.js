// ========== YER İMLERİ - BOOKMARKS ==========

import { dom, state, $, $$ } from '../cekirdek-core/durum-state.js';
import { on } from '../cekirdek-core/olaylar-events.js';
import { showToast, showPanel, hidePanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, getDomain, setupPanelSearch } from '../cekirdek-core/yardimcilar-helpers.js';

// Tab modülünden doğrudan import yerine event dinleyeceğiz
let _getActiveTab = null;
let _navigate = null;

export function initBookmarks(getActiveTab, navigate) {
  _getActiveTab = getActiveTab;
  _navigate = navigate;
  on('tab-switched', () => updateBookmarkButton());
  on('tab-navigated', () => updateBookmarkButton());
}

export async function updateBookmarkButton() {
  if (!dom.btnBookmarkAdd || !_getActiveTab) return;
  const tab = _getActiveTab();
  if (!tab || tab.isStartPage || !tab.url) {
    dom.btnBookmarkAdd.textContent = '☆';
    return;
  }
  try {
    const bookmarks = await window.electronAPI.getBookmarks();
    const isBookmarked = bookmarks.some(b => b.url === tab.url);
    dom.btnBookmarkAdd.textContent = isBookmarked ? '★' : '☆';
  } catch(e) {}
}

export async function toggleBookmark() {
  if (!_getActiveTab) return;
  const tab = _getActiveTab();
  if (!tab || tab.isStartPage) return;
  try {
    const bookmarks = await window.electronAPI.getBookmarks();
    const existing = bookmarks.find(b => b.url === tab.url);
    if (existing) {
      await window.electronAPI.removeBookmark(existing.id);
      showToast('Yer imi kaldırıldı', 'info');
    } else {
      await window.electronAPI.addBookmark({ url: tab.url, title: tab.title });
      showToast('⭐ Yer imi eklendi', 'success');
    }
    updateBookmarkButton();
  } catch(e) {}
}

export async function showBookmarksPanel() {
  try {
    const bookmarks = await window.electronAPI.getBookmarks();
    let content = '<div class="panel-search"><input type="text" placeholder="Ara..." id="bookmarks-search"></div>';
    if (bookmarks.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">⭐</div>Yer imi yok</div>`;
    } else {
      content += '<div id="bookmarks-list">';
      bookmarks.forEach(b => {
        content += `
          <div class="panel-item" data-url="${escapeHtml(b.url)}">
            <div class="panel-item-icon">⭐</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(b.title)}</div>
              <div class="panel-item-subtitle">${escapeHtml(getDomain(b.url))}</div>
            </div>
            <button class="panel-item-action" data-id="${b.id}">✕</button>
          </div>`;
      });
      content += '</div>';
    }
    showPanel('⭐ Yer İmleri', content);
    setTimeout(() => {
      setupPanelSearch('bookmarks');
      $$('#bookmarks-list .panel-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('panel-item-action')) {
            if (_navigate) _navigate(item.dataset.url);
            hidePanel();
          }
        });
      });
      $$('#bookmarks-list .panel-item-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeBookmark(parseInt(btn.dataset.id));
          showBookmarksPanel();
        });
      });
    }, 50);
  } catch(e) {}
}
