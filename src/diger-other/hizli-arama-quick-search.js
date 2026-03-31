// ========== HIZLI ARAMA - QUICK SEARCH ==========
import { state, $, SEARCH_ENGINE } from '../cekirdek-core/durum-state.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

let quickSearchOverlay = null;

export function showQuickSearchPalette(createTab, switchTab) {
  if (quickSearchOverlay) { hideQuickSearch(); return; }

  const overlay = document.createElement('div');
  overlay.className = 'quick-search-overlay';
  overlay.innerHTML = `<div class="quick-search-panel"><div class="quick-search-header"><input type="text" class="quick-search-input" placeholder="🔍 Sekme ara, URL gir veya geçmişte ara..." autocomplete="off"></div><div class="quick-search-results" id="quick-search-results"></div></div>`;
  document.body.appendChild(overlay);
  quickSearchOverlay = overlay;

  const input = overlay.querySelector('.quick-search-input');
  const resultsDiv = overlay.querySelector('#quick-search-results');
  let selectedIndex = -1;

  renderQuickResults('', resultsDiv, createTab, switchTab);

  input.addEventListener('input', () => {
    selectedIndex = -1;
    renderQuickResults(input.value, resultsDiv, createTab, switchTab);
  });

  input.addEventListener('keydown', (e) => {
    const items = resultsDiv.querySelectorAll('.quick-search-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, items.length - 1); updateQuickSelection(items, selectedIndex); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); updateQuickSelection(items, selectedIndex); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) { items[selectedIndex].click(); }
      else if (input.value.trim()) {
        const q = input.value.trim();
        if (q.match(/^https?:\/\//) || q.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
          createTab(q.startsWith('http') ? q : 'https://' + q);
        } else {
          createTab(SEARCH_ENGINE + encodeURIComponent(q));
        }
        hideQuickSearch();
      }
    } else if (e.key === 'Escape') { hideQuickSearch(); }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) hideQuickSearch(); });
  setTimeout(() => input.focus(), 50);
}

async function renderQuickResults(query, container, createTab, switchTab) {
  const results = [];
  const q = query.toLowerCase().trim();

  state.tabs.forEach(tab => {
    if (!tab.isStartPage && tab.url) {
      const title = tab.element?.querySelector('.tab-title')?.textContent || tab.url;
      if (!q || title.toLowerCase().includes(q) || tab.url.toLowerCase().includes(q)) {
        results.push({ type: 'tab', icon: tab.isIncognito ? '🕵️' : '🔖', title, subtitle: tab.url, action: () => { switchTab(tab.id); hideQuickSearch(); } });
      }
    }
  });

  try {
    const clipText = await navigator.clipboard.readText();
    if (clipText && (clipText.startsWith('http://') || clipText.startsWith('https://') || clipText.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/))) {
      results.push({ type: 'clipboard', icon: '📋', title: 'Panodan ziyaret et', subtitle: clipText.substring(0, 60) + (clipText.length > 60 ? '...' : ''), action: () => { createTab(clipText.startsWith('http') ? clipText : 'https://' + clipText); hideQuickSearch(); } });
    }
  } catch(e) {}

  if (q.length >= 2) {
    try {
      const history = await window.electronAPI.getHistory();
      history.filter(h => h.title?.toLowerCase().includes(q) || h.url?.toLowerCase().includes(q)).slice(0, 5).forEach(h => {
        if (!results.find(r => r.subtitle === h.url)) results.push({ type: 'history', icon: '🕐', title: h.title || h.url, subtitle: h.url, action: () => { createTab(h.url); hideQuickSearch(); } });
      });
    } catch(e) {}
    try {
      const bookmarks = await window.electronAPI.getBookmarks();
      bookmarks.filter(b => b.title?.toLowerCase().includes(q) || b.url?.toLowerCase().includes(q)).slice(0, 3).forEach(b => {
        if (!results.find(r => r.subtitle === b.url)) results.push({ type: 'bookmark', icon: '⭐', title: b.title || b.url, subtitle: b.url, action: () => { createTab(b.url); hideQuickSearch(); } });
      });
    } catch(e) {}
  }

  if (q) results.push({ type: 'search', icon: '🔎', title: `"${query}" için ara`, subtitle: 'Google ile ara', action: () => { createTab(SEARCH_ENGINE + encodeURIComponent(query)); hideQuickSearch(); } });

  if (results.length === 0) { container.innerHTML = '<div class="quick-search-empty">Sonuç bulunamadı</div>'; return; }
  container.innerHTML = results.slice(0, 12).map((r, i) => `<div class="quick-search-item" data-index="${i}"><span class="quick-search-item-icon">${r.icon}</span><div class="quick-search-item-info"><div class="quick-search-item-title">${escapeHtml(r.title)}</div><div class="quick-search-item-url">${escapeHtml(r.subtitle)}</div></div><span class="quick-search-item-badge">${r.type === 'tab' ? 'Sekme' : r.type === 'history' ? 'Geçmiş' : r.type === 'bookmark' ? 'Yer İmi' : r.type === 'clipboard' ? 'Pano' : 'Ara'}</span></div>`).join('');
  container.querySelectorAll('.quick-search-item').forEach((item, i) => { item.addEventListener('click', () => results[i].action()); });
}

function updateQuickSelection(items, index) { items.forEach((item, i) => { item.classList.toggle('selected', i === index); if (i === index) item.scrollIntoView({ block: 'nearest' }); }); }

export function hideQuickSearch() { if (quickSearchOverlay) { quickSearchOverlay.remove(); quickSearchOverlay = null; } }
