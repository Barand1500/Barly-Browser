// ========== WEBVIEW OLAYLARI - WEBVIEW EVENTS ==========
// Webview olay dinleyicileri

import { dom, state, $ } from '../cekirdek-core/durum-state.js';
import { emit } from '../cekirdek-core/olaylar-events.js';
import { getDomain } from '../cekirdek-core/yardimcilar-helpers.js';
import { checkHttpsWarning } from '../cekirdek-core/arayuz-ui.js';

export function setupWebviewEvents(webview, tabId) {
  webview.addEventListener('did-start-loading', () => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) tab.loadStartTime = Date.now();
    if (dom.loadingBar) dom.loadingBar.classList.remove('hidden');
  });

  webview.addEventListener('did-stop-loading', () => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (dom.loadingBar) dom.loadingBar.classList.add('hidden');
    if (tab && tab.loadStartTime) {
      const loadTime = Date.now() - tab.loadStartTime;
      // FIX #4: Gerçek Navigation Timing verisi al
      emit('page-loaded', tabId, loadTime, webview);
    }
  });

  webview.addEventListener('page-title-updated', (e) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.title = e.title;
      const titleEl = tab.element.querySelector('.tab-title');
      if (titleEl) titleEl.textContent = e.title;
      // Geçmişe ekle
      if (!tab.isIncognito && tab.url && !tab.isStartPage) {
        try { window.electronAPI.addHistory({ url: tab.url, title: e.title }); } catch(err) {}
      }
    }
  });

  webview.addEventListener('did-navigate', (e) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.url = e.url;
      tab.thumbnail = null;
      if (state.activeTabId === tabId) {
        if (dom.urlInput) dom.urlInput.value = e.url;
        emit('update-security-icon', e.url);
        emit('update-nav-buttons');
        checkHttpsWarning(e.url);
      }
      emit('tab-navigated', tabId, e.url);
    }
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab && e.isMainFrame) {
      tab.url = e.url;
      if (state.activeTabId === tabId) {
        if (dom.urlInput) dom.urlInput.value = e.url;
        emit('update-security-icon', e.url);
        emit('update-nav-buttons');
      }
    }
  });

  webview.addEventListener('page-favicon-updated', (e) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab && e.favicons && e.favicons.length > 0 && !tab.isIncognito) {
      const faviconEl = tab.element.querySelector('.tab-favicon');
      if (faviconEl) faviconEl.innerHTML = `<img src="${e.favicons[0]}" onerror="this.parentElement.textContent='🌐'">`;
    }
  });

  webview.addEventListener('media-started-playing', () => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      const muteBtn = tab.element.querySelector('.tab-mute-btn');
      if (muteBtn) muteBtn.classList.remove('hidden');
      if (tabId !== state.activeTabId || state.miniPlayerTabId) {
        emit('show-mini-player', tabId);
      }
    }
  });

  webview.addEventListener('media-paused', () => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab) {
      const muteBtn = tab.element.querySelector('.tab-mute-btn');
      if (muteBtn && !tab.isMuted) muteBtn.classList.add('hidden');
      if (state.miniPlayerTabId === tabId) {
        state.miniPlayerPlaying = false;
        if (dom.miniPlayerPlayPause) dom.miniPlayerPlayPause.textContent = '▶️';
      }
    }
  });

  webview.addEventListener('console-message', (e) => {
    // Annotation data
    if (e.message.startsWith('__BARLY_ANN__:')) {
      try {
        const tab = state.tabs.find(t => t.id === tabId);
        const highlights = JSON.parse(e.message.substring(14));
        if (tab?.url) emit('save-annotation', tab.url, highlights);
      } catch(ex) {}
      return;
    }
    // Link preview hover
    if (e.message.startsWith('__BARLY_LINK_HOVER__:')) {
      try {
        const data = JSON.parse(e.message.substring(21));
        emit('link-hover', data, webview);
      } catch(ex) {}
      return;
    }
    // Link preview leave
    if (e.message === '__BARLY_LINK_LEAVE__') {
      emit('link-leave');
      return;
    }

    const levels = { 0: 'log', 1: 'warn', 2: 'error', 3: 'info' };
    state.consoleLogs.push({
      type: levels[e.level] || 'log',
      message: e.message,
      line: e.line,
      source: e.sourceId,
      time: new Date().toLocaleTimeString()
    });
    if (state.consoleLogs.length > 500) state.consoleLogs.shift();
  });

  webview.addEventListener('found-in-page', (e) => {
    if (state.activeTabId === tabId && dom.findCount && e.result) {
      const { activeMatchOrdinal, matches } = e.result;
      dom.findCount.textContent = matches > 0 ? `${activeMatchOrdinal}/${matches}` : '0/0';
    }
  });

  webview.addEventListener('context-menu', (e) => {
    e.preventDefault();
    if (state.activeTabId === tabId) {
      const rect = webview.getBoundingClientRect();
      const x = rect.left + (e.params?.x || 0);
      const y = rect.top + (e.params?.y || 0);
      emit('show-context-menu', x || 300, y || 300);
    }
  });

  webview.addEventListener('dom-ready', () => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab || tab.isStartPage) return;
    emit('webview-dom-ready', webview, tabId);
  });
}
