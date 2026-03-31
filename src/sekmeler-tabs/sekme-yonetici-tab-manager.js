// ========== SEKME YONETICI - TAB MANAGER ==========
// Sekme oluşturma, değiştirme, kapatma, navigasyon, sürükle-bırak, önizleme, askıya alma

import { dom, state, SEARCH_ENGINE } from '../cekirdek-core/durum-state.js';
import { emit } from '../cekirdek-core/olaylar-events.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';
import { checkHttpsWarning } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, getDomain } from '../cekirdek-core/yardimcilar-helpers.js';
import { setupWebviewEvents } from './webview-olaylar-webview-events.js';
import { assignTabToGroup } from './sekme-gruplar-tab-groups.js';

// ========== AKTIF SEKME ERİŞİMCİLERİ ==========
export function getActiveTab() {
  return state.tabs.find(t => t.id === state.activeTabId);
}

export function getActiveWebview() {
  const tab = getActiveTab();
  return tab ? tab.webview : null;
}

// ========== START PAGE ==========
export function showStartPage() {
  if (dom.startPage) dom.startPage.classList.remove('hidden');
  if (dom.urlBar) dom.urlBar.style.display = 'none';
  const tab = getActiveTab();
  if (dom.searchInput) {
    dom.searchInput.placeholder = tab?.isIncognito ? '🕵️ Gizli moddasın — Ajan gibi ara...' : 'Aramak için yaz...';
    dom.searchInput.focus();
  }
}

export function hideStartPage() {
  if (dom.startPage) dom.startPage.classList.add('hidden');
  if (dom.urlBar) dom.urlBar.style.display = 'flex';
}

// ========== NAVİGASYON ==========
export function navigate(url) {
  let finalUrl = url.trim();
  if (!finalUrl) return;
  if (!finalUrl.includes('.') && !finalUrl.startsWith('http')) {
    finalUrl = SEARCH_ENGINE + encodeURIComponent(finalUrl);
  } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }
  const tab = getActiveTab();
  if (tab) {
    tab.isStartPage = false;
    tab.url = finalUrl;
    tab.webview.src = finalUrl;
    hideStartPage();
    tab.webview.classList.add('active');
  }
}

export function goBack() {
  const webview = getActiveWebview();
  if (webview) { try { webview.goBack(); } catch(e) {} }
}

export function goForward() {
  const webview = getActiveWebview();
  if (webview) { try { webview.goForward(); } catch(e) {} }
}

export function reload() {
  const webview = getActiveWebview();
  if (webview) { try { webview.reload(); } catch(e) {} }
}

export function goHome() {
  const tab = getActiveTab();
  if (tab) {
    tab.isStartPage = true;
    tab.url = '';
    showStartPage();
    tab.webview.classList.remove('active');
    if (dom.httpsWarning) dom.httpsWarning.classList.add('hidden');
  }
}

export function updateNavButtons() {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (dom.btnBack) dom.btnBack.disabled = true;
  if (dom.btnForward) dom.btnForward.disabled = true;
  if (webview && !tab?.isStartPage) {
    try {
      if (dom.btnBack) dom.btnBack.disabled = !webview.canGoBack();
      if (dom.btnForward) dom.btnForward.disabled = !webview.canGoForward();
    } catch(e) {}
  }
}

export function updateSecurityIcon(url) {
  if (!dom.securityIcon) return;
  if (url.startsWith('https://')) dom.securityIcon.textContent = '🔒';
  else if (url.startsWith('http://')) dom.securityIcon.textContent = '⚠️';
  else dom.securityIcon.textContent = '🔒';
}

// ========== SPLIT VIEW ==========
export function toggleSplitView() {
  state.splitMode = !state.splitMode;
  if (dom.webviewContainerSplit) dom.webviewContainerSplit.classList.toggle('hidden', !state.splitMode);
  if (dom.webviewWrapper) dom.webviewWrapper.classList.toggle('split-active', state.splitMode);
  if (dom.btnSplit) dom.btnSplit.classList.toggle('active', state.splitMode);
  showToast(state.splitMode ? '⬚ Yan yana görünüm açık' : '⬚ Yan yana görünüm kapalı', 'success');
}

export function openInSplit(url) {
  if (!state.splitMode) toggleSplitView();
  if (!dom.webviewContainerSplit) return;
  let splitWebview = dom.webviewContainerSplit.querySelector('webview');
  if (!splitWebview) {
    splitWebview = document.createElement('webview');
    splitWebview.setAttribute('allowpopups', '');
    splitWebview.classList.add('active');
    dom.webviewContainerSplit.appendChild(splitWebview);
  }
  splitWebview.src = url;
}

// ========== DRAG & DROP ==========
function setupTabDragDrop(element, tabId) {
  element.addEventListener('dragstart', (e) => {
    state.draggedTabId = tabId;
    element.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  });
  element.addEventListener('dragend', () => {
    element.classList.remove('dragging');
    state.draggedTabId = null;
    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('drag-over'));
  });
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (state.draggedTabId && state.draggedTabId !== tabId) element.classList.add('drag-over');
  });
  element.addEventListener('dragleave', () => element.classList.remove('drag-over'));
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    if (!state.draggedTabId || state.draggedTabId === tabId) return;
    const dragIdx = state.tabs.findIndex(t => t.id === state.draggedTabId);
    const dropIdx = state.tabs.findIndex(t => t.id === tabId);
    if (dragIdx === -1 || dropIdx === -1) return;
    const [draggedTab] = state.tabs.splice(dragIdx, 1);
    state.tabs.splice(dropIdx, 0, draggedTab);
    dom.tabsList.insertBefore(draggedTab.element, element);
  });
}

// ========== TAB PREVIEW ==========
function setupTabPreview(element, tabId) {
  let previewTimeout;
  element.addEventListener('mouseenter', () => {
    previewTimeout = setTimeout(async () => {
      const tab = state.tabs.find(t => t.id === tabId);
      if (!tab || tab.isStartPage || !dom.tabPreview) return;
      try {
        if (tab.thumbnail) {
          dom.tabPreviewImg.src = tab.thumbnail;
        } else if (tab.webview && tab.webview.getURL()) {
          const image = await tab.webview.capturePage();
          if (image) {
            const dataUrl = image.toDataURL();
            tab.thumbnail = dataUrl;
            dom.tabPreviewImg.src = dataUrl;
          }
        }
        dom.tabPreviewTitle.textContent = tab.title || 'Yeni Sekme';
        dom.tabPreview.style.left = (element.getBoundingClientRect().right + 10) + 'px';
        dom.tabPreview.style.top = element.getBoundingClientRect().top + 'px';
        dom.tabPreview.classList.remove('hidden');
      } catch(e) {}
    }, 600);
  });
  element.addEventListener('mouseleave', () => {
    clearTimeout(previewTimeout);
    if (dom.tabPreview) dom.tabPreview.classList.add('hidden');
  });
}

// ========== TAB SUSPEND ==========
export function resetSuspendTimer(tabId) {
  if (state.tabSuspendTimers[tabId]) clearTimeout(state.tabSuspendTimers[tabId]);
  const timeout = (state.settings.tabSuspendTimeout || 10) * 60 * 1000;
  state.tabSuspendTimers[tabId] = setTimeout(() => {
    if (tabId !== state.activeTabId) suspendTab(tabId);
  }, timeout);
}

export function suspendTab(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab || tab.isSuspended || tab.isStartPage || tab.isIncognito) return;
  tab.isSuspended = true;
  tab.element.classList.add('suspended');
  const savedUrl = tab.url;
  const savedTitle = tab.title;
  tab.webview.src = 'about:blank';
  tab._suspendedUrl = savedUrl;
  tab._suspendedTitle = savedTitle;
  showToast(`👻 "${savedTitle}" askıya alındı`, 'info');
}

export function unsuspendTab(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab || !tab.isSuspended) return;
  tab.isSuspended = false;
  tab.element.classList.remove('suspended');
  if (tab._suspendedUrl) {
    tab.webview.src = tab._suspendedUrl;
    tab.url = tab._suspendedUrl;
    delete tab._suspendedUrl;
    delete tab._suspendedTitle;
  }
}

// ========== MUTE ==========
export function toggleTabMute(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    tab.isMuted = !tab.isMuted;
    try { tab.webview.setAudioMuted(tab.isMuted); } catch(e) {}
    updateTabMuteIcon(tab);
    emit('mute-changed', tabId);
    showToast(tab.isMuted ? '🔇 Ses kapatıldı' : '🔊 Ses açıldı', 'success');
  }
}

export function updateTabMuteIcon(tab) {
  if (!tab) return;
  const btn = tab.element.querySelector('.tab-mute-btn');
  if (btn) {
    btn.textContent = tab.isMuted ? '🔇' : '🔊';
    btn.title = tab.isMuted ? 'Sesi Aç' : 'Sesi Kapat';
  }
}

// ========== SEKME OLUŞTUR ==========
export function createTab(url = null, isIncognito = false, groupId = null) {
  const tabId = `tab-${++state.tabCounter}`;

  const tabElement = document.createElement('div');
  tabElement.className = `tab-item${isIncognito ? ' incognito' : ''}`;
  tabElement.id = tabId;
  tabElement.title = isIncognito ? '🕶️ Gizli Sekme' : 'Yeni Sekme';
  tabElement.setAttribute('draggable', 'true');
  tabElement.innerHTML = `
    <div class="tab-favicon">${isIncognito ? '🕶️' : '🌐'}</div>
    <div class="tab-info">
      <div class="tab-title">Yeni Sekme</div>
      <div class="tab-url">barly://newtab</div>
    </div>
    <div class="tab-actions">
      <button class="tab-mute-btn hidden" title="Sesi Kapat">🔊</button>
      <button class="tab-close" title="Kapat">✕</button>
    </div>
  `;

  if (isIncognito) tabElement.style.setProperty('--tab-group-color', '#8b5cf6');

  tabElement.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-close')) switchTab(tabId);
  });
  tabElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    emit('tab-context-menu', e, tabId);
  });
  tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  tabElement.querySelector('.tab-mute-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTabMute(tabId);
  });

  setupTabDragDrop(tabElement, tabId);
  setupTabPreview(tabElement, tabId);
  dom.tabsList.appendChild(tabElement);

  const webview = document.createElement('webview');
  webview.id = `webview-${tabId}`;
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('webpreferences', 'contextIsolation=yes, backgroundThrottling=yes, v8CacheOptions=bypassHeatCheck');
  if (url) webview.src = url;

  setupWebviewEvents(webview, tabId);
  dom.webviewContainer.appendChild(webview);

  const tab = {
    id: tabId, url: url || '', title: 'Yeni Sekme', webview, element: tabElement,
    isStartPage: !url, isIncognito, isMuted: false, isSuspended: false,
    loadStartTime: 0, groupId, bytesReceived: 0, thumbnail: null
  };

  if (groupId) assignTabToGroup(tabId, groupId);
  state.tabs.push(tab);
  switchTab(tabId);
  resetSuspendTimer(tabId);
  return tabId;
}

// ========== SEKME DEĞİŞTİR ==========
export function switchTab(tabId) {
  state.tabs.forEach(tab => {
    tab.element.classList.remove('active');
    tab.webview.classList.remove('active');
  });

  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    if (tab.isSuspended) unsuspendTab(tabId);
    tab.element.classList.add('active');
    state.activeTabId = tabId;

    if (dom.appContainer) dom.appContainer.classList.toggle('incognito-mode', tab.isIncognito);
    if (dom.urlInput) dom.urlInput.placeholder = tab.isIncognito ? '🕵️ Gizli ajan modu — Arama yap veya adres gir...' : 'Ara veya adres gir...';

    if (tab.isStartPage) {
      showStartPage();
      tab.webview.classList.remove('active');
    } else {
      hideStartPage();
      tab.webview.classList.add('active');
      if (dom.urlInput) dom.urlInput.value = tab.url;
      updateSecurityIcon(tab.url);
      checkHttpsWarning(tab.url);
    }

    const titleEl = tab.element.querySelector('.tab-title');
    if (titleEl) titleEl.textContent = tab.title || 'Yeni Sekme';

    updateNavButtons();
    // Diğer modüller olay ile güncellenir
    emit('tab-switched', tabId);

    resetSuspendTimer(tabId);
    state.tabs.forEach(t => { if (t.id !== tabId) resetSuspendTimer(t.id); });
  }
}

// ========== SEKME KAPAT ==========
export function closeTab(tabId) {
  const tabIndex = state.tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;
  const tab = state.tabs[tabIndex];
  tab.element.remove();
  tab.webview.remove();
  if (state.tabSuspendTimers[tabId]) clearTimeout(state.tabSuspendTimers[tabId]);
  delete state.tabSuspendTimers[tabId];
  state.tabs.splice(tabIndex, 1);

  if (state.tabs.length === 0) {
    createTab();
  } else if (state.activeTabId === tabId) {
    const newActiveIndex = Math.min(tabIndex, state.tabs.length - 1);
    switchTab(state.tabs[newActiveIndex].id);
  }
}

export function cloneTab(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab && tab.url) {
    createTab(tab.url, tab.isIncognito, tab.groupId);
    showToast('Sekme klonlandı', 'success');
  }
}

export function closeOtherTabs(keepTabId) {
  const tabsToClose = state.tabs.filter(t => t.id !== keepTabId).map(t => t.id);
  tabsToClose.forEach(id => closeTab(id));
  showToast('Diğer sekmeler kapatıldı', 'success');
}

export function closeRightTabs(tabId) {
  const idx = state.tabs.findIndex(t => t.id === tabId);
  const tabsToClose = state.tabs.slice(idx + 1).map(t => t.id);
  tabsToClose.forEach(id => closeTab(id));
  showToast('Sağdaki sekmeler kapatıldı', 'success');
}
