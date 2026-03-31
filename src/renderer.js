// ========== BARLY BROWSER v4.0 - MODULAR ENTRY POINT ==========
// Tüm modülleri import eder ve başlatır

// === CORE ===
import { $, $$, dom, initElements, state, AI_SERVICES } from './cekirdek-core/durum-state.js';
import { on, emit } from './cekirdek-core/olaylar-events.js';
import { escapeHtml, getDomain, formatBytes } from './cekirdek-core/yardimcilar-helpers.js';
import { showToast, showModal, hideModal, showPanel, hidePanel, hideAllMenus, checkHttpsWarning, dismissHttpsWarning } from './cekirdek-core/arayuz-ui.js';

// === TABS ===
import {
  getActiveTab, getActiveWebview, navigate, goBack, goForward, reload, goHome,
  createTab, switchTab, closeTab, toggleSplitView, hideStartPage
} from './sekmeler-tabs/sekme-yonetici-tab-manager.js';
import { renderTabGroups } from './sekmeler-tabs/sekme-gruplar-tab-groups.js';

// === THEME ===
import {
  THEME_PRESETS, themeConfig, setThemeConfig,
  applyTheme, applyWebTheme, applyWallpaper, toggleTheme,
  applyFont, applyCompactMode, toggleCompactMode, applyThemePreset,
  saveThemeConfig, showThemeCustomizer
} from './tema-theme/tema-theme.js';

// === SETTINGS ===
import {
  getShortcutValue, shortcutKeyToString, getIsRecordingShortcut,
  loadShortcuts, showSettingsPanel
} from './ayarlar-settings/ayarlar-settings.js';

// === TOOLBOX ===
import { initBookmarks, toggleBookmark, showBookmarksPanel } from './arac-kutusu-toolbox/yer-imleri-bookmarks.js';
import { initHistory, showHistoryPanel } from './arac-kutusu-toolbox/gecmis-history.js';
import { initDownloads, showDownloadsPanel } from './arac-kutusu-toolbox/indirmeler-downloads.js';
import { initOffline, showOfflinePanel } from './arac-kutusu-toolbox/cevrimdisi-offline.js';
import { showNotepadMini, hideNotepadMini, saveQuickNote, showNotesPanel, webClipper } from './arac-kutusu-toolbox/notlar-notes.js';
import { showPasswordsPanel } from './arac-kutusu-toolbox/sifreler-passwords.js';
import { showTodosPanel } from './arac-kutusu-toolbox/yapilacaklar-todos.js';
import { showConsolePanel } from './arac-kutusu-toolbox/konsol-console.js';
import { initSessions, showSessionsPanel, saveCurrentSession, restoreLastSession } from './arac-kutusu-toolbox/oturumlar-sessions.js';

// === DEVTOOLS ===
import { downloadSourceCode } from './gelistirici-devtools/kaynak-kod-source-code.js';
import { toggleCssEditor } from './gelistirici-devtools/kod-enjekte-code-editor.js';
import { analyzePagePerformance } from './gelistirici-devtools/performans-analizi-perf.js';
import { initSiteLimits, showSiteLimitsPanel, checkSiteLimit } from './gelistirici-devtools/site-limitleri-site-limits.js';

// === AI ===
import { toggleAIPanel, showAiServicePicker, toggleAiSplitMode } from './yapay-zeka-ai/yapay-zeka-panel.js';

// === TOOLBAR ===
import { showFindBar, hideFindBar, findInPage, takeScreenshot, enablePiP, toggleReaderMode, showQRCode, archivePage, showShareMenu, shareToSocial, initToolbar } from './arac-cubugu-toolbar/arac-cubugu-toolbar.js';
import { toggleMute, updateMuteButton, showMiniPlayer, hideMiniPlayer, miniPlayerTogglePlay, miniPlayerToggleMute, miniPlayerGoToTab } from './arac-cubugu-toolbar/ses-kontrolu-volume.js';
import { toggleAnnotationMode, hideLinkPreview } from './arac-cubugu-toolbar/aciklamalar-annotations.js';

// === MONITORING ===
import { startTimeTracking, loadTimeStats, startPerfMonitor, showPageTimeline } from './izleme-monitoring/izleme-monitoring.js';

// === OTHER ===
import { showPageContextMenu, handleContextAction } from './diger-other/baglam-menusu-context-menu.js';
import { showQuickSearchPalette, hideQuickSearch } from './diger-other/hizli-arama-quick-search.js';
import { loadSpeedDial, showAddSpeedDialModal } from './diger-other/hiz-paneli-speed-dial.js';

// === SIDEBAR ===
import { setupCollapsibleSections, setupSidebarResize, applySidebarWidth, setupGlobalClickHandler } from './kenar-cubugu-sidebar/kenar-cubugu-sidebar.js';


// ========== SETUP EVENT LISTENERS ==========
function setupEventListeners() {
  // Window controls
  dom.btnMinimize?.addEventListener('click', () => window.electronAPI.minimize());
  dom.btnMaximize?.addEventListener('click', () => window.electronAPI.maximize());
  dom.btnClose?.addEventListener('click', () => window.electronAPI.close());

  // Navigation
  dom.btnBack?.addEventListener('click', goBack);
  dom.btnForward?.addEventListener('click', goForward);
  dom.btnReload?.addEventListener('click', reload);
  dom.btnHome?.addEventListener('click', goHome);
  dom.btnNewTab?.addEventListener('click', () => createTab());
  dom.btnIncognito?.addEventListener('click', () => createTab(null, true));

  // Sidebar tool buttons
  dom.btnBookmarks?.addEventListener('click', showBookmarksPanel);
  dom.btnHistory?.addEventListener('click', showHistoryPanel);
  dom.btnDownloads?.addEventListener('click', showDownloadsPanel);
  dom.btnReadingList?.addEventListener('click', showOfflinePanel);
  dom.btnNotes?.addEventListener('click', showNotesPanel);
  dom.btnPasswords?.addEventListener('click', showPasswordsPanel);
  dom.btnTodos?.addEventListener('click', showTodosPanel);
  dom.btnConsole?.addEventListener('click', showConsolePanel);
  dom.btnSessions?.addEventListener('click', showSessionsPanel);
  dom.btnSettings?.addEventListener('click', showSettingsPanel);

  // Theme & compact
  dom.btnThemeCustomize?.addEventListener('click', showThemeCustomizer);
  dom.btnCompact?.addEventListener('click', toggleCompactMode);
  dom.compactToggleBtn?.addEventListener('click', () => {
    applyCompactMode(false);
    window.electronAPI.setSettings(state.settings);
  });

  // Toolbar buttons
  dom.btnFind?.addEventListener('click', () => showFindBar(getActiveWebview));
  dom.btnScreenshot?.addEventListener('click', () => takeScreenshot(getActiveWebview, getActiveTab));
  dom.btnPip?.addEventListener('click', () => enablePiP(getActiveWebview));
  dom.btnSplit?.addEventListener('click', toggleSplitView);
  dom.btnMute?.addEventListener('click', () => toggleMute(getActiveWebview, getActiveTab));
  dom.btnReader?.addEventListener('click', () => toggleReaderMode(getActiveWebview, getActiveTab));
  $('btn-qr')?.addEventListener('click', () => showQRCode(getActiveTab));
  $('btn-archive')?.addEventListener('click', () => archivePage(getActiveWebview, getActiveTab));
  $('btn-share')?.addEventListener('click', () => showShareMenu(getActiveTab));

  // Bookmark
  dom.btnBookmarkAdd?.addEventListener('click', toggleBookmark);
  dom.btnReadingListAdd?.addEventListener('click', () => {
    const tab = getActiveTab();
    if (tab && !tab.isStartPage) {
      import('./arac-kutusu-toolbox/cevrimdisi-offline.js').then(m => m.saveOfflinePage());
    }
  });

  // Notepad
  $('btn-notepad')?.addEventListener('click', showNotepadMini);

  // DevTools
  dom.btnSourceCode?.addEventListener('click', () => downloadSourceCode(getActiveWebview, getActiveTab));
  dom.btnCssEditor?.addEventListener('click', () => toggleCssEditor(getActiveWebview, getActiveTab));
  dom.btnPerfAnalyze?.addEventListener('click', () => analyzePagePerformance(getActiveWebview, getActiveTab));
  $('btn-quick-search')?.addEventListener('click', () => showQuickSearchPalette(createTab, switchTab));
  $('btn-timeline')?.addEventListener('click', () => showPageTimeline(getActiveWebview, getActiveTab));

  // AI panel
  dom.btnAi?.addEventListener('click', toggleAIPanel);
  dom.btnAnnotate?.addEventListener('click', () => toggleAnnotationMode(getActiveWebview, getActiveTab));
  dom.btnSiteLimits?.addEventListener('click', showSiteLimitsPanel);
  dom.aiPanelClose?.addEventListener('click', toggleAIPanel);
  $('ai-panel-addtab')?.addEventListener('click', showAiServicePicker);
  $('ai-panel-split')?.addEventListener('click', toggleAiSplitMode);

  // Mini player
  dom.miniPlayerPlayPause?.addEventListener('click', miniPlayerTogglePlay);
  dom.miniPlayerMute?.addEventListener('click', miniPlayerToggleMute);
  dom.miniPlayerGoto?.addEventListener('click', miniPlayerGoToTab);
  dom.miniPlayerCloseBtn?.addEventListener('click', hideMiniPlayer);

  // Modal
  dom.modalClose?.addEventListener('click', hideModal);
  dom.modal?.addEventListener('click', (e) => { if (e.target === dom.modal) hideModal(); });

  // Notepad mini
  dom.notepadClose?.addEventListener('click', hideNotepadMini);
  dom.notepadSave?.addEventListener('click', saveQuickNote);

  // Speed dial
  dom.btnAddSpeedDial?.addEventListener('click', () => showAddSpeedDialModal(navigate));

  // Panel close
  dom.panelClose?.addEventListener('click', hidePanel);

  // Search
  dom.searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { navigate(dom.searchInput.value); dom.searchInput.value = ''; }
  });
  dom.searchBtn?.addEventListener('click', () => {
    if (dom.searchInput) { navigate(dom.searchInput.value); dom.searchInput.value = ''; }
  });

  // URL
  dom.urlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && dom.urlInput) navigate(dom.urlInput.value); });
  dom.urlInput?.addEventListener('focus', () => { if (dom.urlInput) dom.urlInput.select(); });

  // Find in page
  dom.findInput?.addEventListener('input', () => findInPage(getActiveWebview, dom.findInput.value));
  dom.findInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findInPage(getActiveWebview, dom.findInput.value, e.shiftKey ? 'backward' : 'forward');
  });
  dom.findPrev?.addEventListener('click', () => findInPage(getActiveWebview, dom.findInput?.value, 'backward'));
  dom.findNext?.addEventListener('click', () => findInPage(getActiveWebview, dom.findInput?.value, 'forward'));
  dom.findClose?.addEventListener('click', () => hideFindBar(getActiveWebview));

  // HTTPS Warning
  dom.httpsWarningClose?.addEventListener('click', () => dismissHttpsWarning(getActiveTab));
  dom.httpsWarningContinue?.addEventListener('click', () => dismissHttpsWarning(getActiveTab));

  // Context menu items
  $$('.context-item[data-action]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleContextAction(item.dataset.action, {
        getActiveTab, getActiveWebview, goBack, goForward, reload,
        toggleBookmark, webClipper: () => webClipper(getActiveWebview, getActiveTab),
        takeScreenshot: () => takeScreenshot(getActiveWebview, getActiveTab),
        showFindBar: () => showFindBar(getActiveWebview),
        toggleReaderMode: () => toggleReaderMode(getActiveWebview, getActiveTab),
        downloadSourceCode: () => downloadSourceCode(getActiveWebview, getActiveTab),
        openInSplit: (url) => { import('./sekmeler-tabs/sekme-yonetici-tab-manager.js').then(m => m.openInSplit(url)); }
      });
    });
  });

  // Share menu
  $$('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      shareToSocial(btn.dataset.platform);
    });
  });

  // Context menu trigger
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('.panel-content') && !e.target.closest('.modal-body') && !e.target.closest('.tabs-list')) {
      e.preventDefault();
      showPageContextMenu(e.clientX, e.clientY);
    }
  });

  // URL Drag & Drop
  document.addEventListener('dragover', (e) => {
    if (e.dataTransfer.types.includes('text/uri-list') || e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault();
    }
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      createTab(url);
      showToast('URL açıldı', 'success');
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (getIsRecordingShortcut()) return;

    const pressed = shortcutKeyToString(e);
    if (!pressed) return;

    const actions = {
      [getShortcutValue('newTab')]: () => createTab(),
      [getShortcutValue('newIncognito')]: () => createTab(null, true),
      [getShortcutValue('closeTab')]: () => { if (state.activeTabId) closeTab(state.activeTabId); },
      [getShortcutValue('focusUrl')]: () => { if (dom.urlInput) dom.urlInput.focus(); },
      [getShortcutValue('reload')]: () => reload(),
      [getShortcutValue('find')]: () => showFindBar(getActiveWebview),
      [getShortcutValue('bookmark')]: () => toggleBookmark(),
      [getShortcutValue('history')]: () => showHistoryPanel(),
      [getShortcutValue('screenshot')]: () => takeScreenshot(getActiveWebview, getActiveTab),
      [getShortcutValue('todos')]: () => showTodosPanel(),
      [getShortcutValue('console')]: () => showConsolePanel(),
      [getShortcutValue('quickSearch')]: () => showQuickSearchPalette(createTab, switchTab),
      [getShortcutValue('back')]: () => goBack(),
      [getShortcutValue('forward')]: () => goForward(),
      [getShortcutValue('fullscreen')]: () => { try { window.electronAPI.toggleFullscreen(); } catch(ex) {} },
      [getShortcutValue('devtools')]: () => { const wv = getActiveWebview(); if (wv) { try { wv.openDevTools(); } catch(ex) {} } },
    };

    if (e.key === 'F5') { e.preventDefault(); reload(); return; }
    if (e.key === 'Escape') { hideAllMenus(); hidePanel(); hideQuickSearch(); return; }

    const action = actions[pressed];
    if (action) {
      e.preventDefault();
      action();
    }
  });

  // Logo - ana sayfa
  $('logo')?.addEventListener('click', goHome);

  // === EVENT BUS SUBSCRIPTIONS ===
  on('switch-tab', switchTab);
  on('mute-changed', (tab) => updateMuteButton(tab));
}


// ========== INIT ==========
async function init() {
  initElements();

  // Load saved data
  try {
    const savedSettings = await window.electronAPI.getSettings();
    if (savedSettings) Object.assign(state.settings, savedSettings);

    const savedShortcuts = await window.electronAPI.getShortcuts();
    if (savedShortcuts) {
      const { setShortcuts } = await import('./ayarlar-settings/ayarlar-settings.js');
      setShortcuts(savedShortcuts);
    }

    state.tabGroups = await window.electronAPI.getTabGroups() || [];

    const savedThemeConfig = await window.electronAPI.getThemes();
    if (savedThemeConfig && Object.keys(savedThemeConfig).length > 0) {
      setThemeConfig(savedThemeConfig);
    }

    const savedLimits = await window.electronAPI.getSiteLimits();
    if (savedLimits) await initSiteLimits();

    state.annotationsData = await window.electronAPI.getAnnotations() || {};
  } catch(e) {
    console.log('Settings load error:', e);
  }

  // Apply theme & appearance
  applyTheme(state.settings.theme);
  applyWallpaper(themeConfig.wallpaper);
  if (themeConfig.preset && themeConfig.preset !== 'default') {
    const preset = THEME_PRESETS.find(p => p.id === themeConfig.preset);
    if (preset) applyThemePreset(preset, true);
  }
  applyCompactMode(state.settings.compactMode);
  applySidebarWidth(state.settings.sidebarWidth || 260);
  applyFont(state.settings.fontFamily || 'Inter');

  // Load content
  await loadSpeedDial(navigate);
  await loadTimeStats(navigate);
  renderTabGroups();

  // Session restore
  if (state.settings.sessionRestore) {
    await restoreLastSession();
  } else {
    createTab();
  }

  // Init modules that need deps
  initBookmarks(getActiveTab, navigate);
  initHistory(navigate);
  initDownloads();
  initOffline(getActiveTab, getActiveWebview, hideStartPage);
  initSessions(createTab);
  initToolbar(getActiveTab);

  // Setup UI
  setupEventListeners();
  setupGlobalClickHandler();
  setupCollapsibleSections();
  setupSidebarResize();
  startTimeTracking(getActiveTab, (domain) => checkSiteLimit(domain, getActiveTab));
  startPerfMonitor();

  // Save session on app close
  window.electronAPI.onAppClosing(async () => {
    await saveCurrentSession();
  });

  console.log('🌐 Barly Browser v4.0 Developer Edition başlatıldı!');
}

document.addEventListener('DOMContentLoaded', init);
