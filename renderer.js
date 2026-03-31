// ========== BARLY BROWSER v4.0 - DEVELOPER EDITION ==========

// ========== DOM ELEMENTS ==========
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// Ana elementler
let appContainer, sidebar, startPage, searchInput, searchBtn, urlInput, urlBar, securityIcon;
let tabsList, tabGroupsContainer, webviewContainer, webviewContainerSplit, webviewWrapper;
let loadingBar, rightPanel, panelTitle, panelContent, panelClose;
let findBar, findInput, findCount, speedDialGrid, timeStats;
let modal, modalTitle, modalBody, modalFooter, toastContainer;
let perfTime, perfMemory, perfBandwidth, perfTabMemory;
let contextMenu, shareMenu, notepadMini, notepadContent, gestureCanvas;
let httpsWarning, httpsWarningClose, httpsWarningContinue;
let compactToggleBtn, sidebarResizeHandle;
let pageTimeline, timelineBar, tabPreview, tabPreviewImg, tabPreviewTitle;

// Butonlar
let btnBack, btnForward, btnReload, btnHome, btnNewTab, btnIncognito;
let btnBookmarks, btnHistory, btnDownloads, btnReadingList, btnNotes, btnPasswords, btnSettings;
let btnCompact, btnMinimize, btnMaximize, btnClose;
let btnBookmarkAdd, btnReadingListAdd, btnFind, btnScreenshot, btnPip, btnSplit, btnMute, btnReader;
let btnAddSpeedDial, findPrev, findNext, findClose, modalClose, notepadClose, notepadSave;
let btnTodos, btnConsole, btnSessions;
let btnSourceCode, btnCssEditor, btnPerfAnalyze;
let btnThemeCustomize;
let btnAi, btnAnnotate, btnSiteLimits;
let aiPanel, aiPanelContent, aiPanelTabs, aiPanelClose;
let miniPlayer, miniPlayerTitleEl, miniPlayerPlayPause, miniPlayerMute, miniPlayerGoto, miniPlayerCloseBtn;
let linkPreviewTooltip, linkPreviewImg, linkPreviewTitleElm, linkPreviewDesc, linkPreviewUrlEl;

// ========== STATE ==========
const SEARCH_ENGINE = 'https://www.google.com/search?q=';
let settings = { theme: 'dark', adBlockEnabled: true, compactMode: false, httpsWarning: true, sessionRestore: true, tabSuspendTimeout: 10, sidebarWidth: 260, fontFamily: 'Inter' };
let themeConfig = { preset: 'default', wallpaper: null, forceWebTheme: true };
let shortcuts = {};
let tabs = [];
let tabGroups = [];
let activeTabId = null;
let tabCounter = 0;
let downloads = [];
let currentFindText = '';
let splitMode = false;
let splitTabId = null;
let isRecordingShortcut = null;
let totalBandwidth = 0;
let timeTrackingInterval = null;
let gesturePoints = [];
let isGesturing = false;

// Yeni state
let consoleLogs = [];
let todoFilter = 'all';
let httpsWarningDismissed = {};
let isResizingSidebar = false;
let draggedTabId = null;
let tabSuspendTimers = {};

// Yeni özellikler state
let aiPanelOpen = false;
let annotationMode = false;
let siteLimits = {};
let miniPlayerTabId = null;
let miniPlayerPlaying = true;
let linkPreviewCache = {};
let annotationsData = {};
let linkPreviewTimeout = null;

const AI_SERVICES = {
  gemini:     { name: 'Gemini',      icon: '✦',  color: '#4285f4', url: 'https://gemini.google.com' },
  chatgpt:    { name: 'ChatGPT',     icon: '◉',  color: '#10a37f', url: 'https://chatgpt.com' },
  claude:     { name: 'Claude',      icon: '◈',  color: '#d97706', url: 'https://claude.ai' },
  perplexity: { name: 'Perplexity',  icon: '◎',  color: '#22d3ee', url: 'https://perplexity.ai' },
  copilot:    { name: 'Copilot',     icon: '⬡',  color: '#0078d4', url: 'https://copilot.microsoft.com' },
  grok:       { name: 'Grok',        icon: '✗',  color: '#1d9bf0', url: 'https://grok.com' },
  deepseek:   { name: 'DeepSeek',    icon: '◆',  color: '#6366f1', url: 'https://chat.deepseek.com' },
  mistral:    { name: 'Mistral',     icon: '▣',  color: '#ff7000', url: 'https://chat.mistral.ai' },
  you:        { name: 'You.com',     icon: '●',  color: '#7c3aed', url: 'https://you.com' },
  phind:      { name: 'Phind',       icon: '◐',  color: '#06b6d4', url: 'https://phind.com' }
};

let aiTabs = [];  // { id, serviceKey, webview }
let activeAiTabId = null;
let aiTabCounter = 0;
let aiSplitMode = false;

// ========== INITIALIZATION ==========
function initElements() {
  appContainer = $('app-container');
  sidebar = $('sidebar');
  startPage = $('start-page');
  searchInput = $('search-input');
  searchBtn = $('search-btn');
  urlInput = $('url-input');
  urlBar = $('url-bar');
  securityIcon = $('security-icon');
  tabsList = $('tabs-list');
  tabGroupsContainer = $('tab-groups-container');
  webviewContainer = $('webview-container');
  webviewContainerSplit = $('webview-container-split');
  webviewWrapper = $('webview-wrapper');
  loadingBar = $('loading-bar');
  rightPanel = $('right-panel');
  panelTitle = $('panel-title');
  panelContent = $('panel-content');
  panelClose = $('panel-close');
  findBar = $('find-bar');
  findInput = $('find-input');
  findCount = $('find-count');
  speedDialGrid = $('speed-dial-grid');
  timeStats = $('time-stats');
  modal = $('modal');
  modalTitle = $('modal-title');
  modalBody = $('modal-body');
  modalFooter = $('modal-footer');
  toastContainer = $('toast-container');
  perfTime = $('perf-time');
  perfMemory = $('perf-memory');
  perfBandwidth = $('perf-bandwidth');
  perfTabMemory = $('perf-tab-memory');
  contextMenu = $('context-menu');
  shareMenu = $('share-menu');
  notepadMini = $('notepad-mini');
  notepadContent = $('notepad-content');
  gestureCanvas = $('gesture-canvas');
  httpsWarning = $('https-warning');
  httpsWarningClose = $('https-warning-close');
  httpsWarningContinue = $('https-warning-continue');
  compactToggleBtn = $('compact-toggle-btn');
  sidebarResizeHandle = $('sidebar-resize-handle');
  pageTimeline = $('page-timeline');
  timelineBar = $('timeline-bar');
  tabPreview = $('tab-preview');
  tabPreviewImg = $('tab-preview-img');
  tabPreviewTitle = $('tab-preview-title');

  // Butonlar
  btnBack = $('btn-back');
  btnForward = $('btn-forward');
  btnReload = $('btn-reload');
  btnHome = $('btn-home');
  btnNewTab = $('btn-new-tab');
  btnIncognito = $('btn-incognito');
  btnBookmarks = $('btn-bookmarks');
  btnHistory = $('btn-history');
  btnDownloads = $('btn-downloads');
  btnReadingList = $('btn-readinglist');
  btnNotes = $('btn-notes');
  btnPasswords = $('btn-passwords');
  btnSettings = $('btn-settings');
  btnCompact = $('btn-compact');
  btnMinimize = $('btn-minimize');
  btnMaximize = $('btn-maximize');
  btnClose = $('btn-close');
  btnBookmarkAdd = $('btn-bookmark-add');
  btnReadingListAdd = $('btn-readinglist-add');
  btnFind = $('btn-find');
  btnScreenshot = $('btn-screenshot');
  btnPip = $('btn-pip');
  btnSplit = $('btn-split');
  btnMute = $('btn-mute');
  btnReader = $('btn-reader');
  btnAddSpeedDial = $('btn-add-speeddial');
  findPrev = $('find-prev');
  findNext = $('find-next');
  findClose = $('find-close');
  modalClose = $('modal-close');
  notepadClose = $('notepad-close');
  notepadSave = $('notepad-save');
  btnTodos = $('btn-todos');
  btnConsole = $('btn-console');
  btnSessions = $('btn-sessions');
  btnSourceCode = $('btn-source-code');
  btnCssEditor = $('btn-css-editor');
  btnPerfAnalyze = $('btn-perf-analyze');
  btnThemeCustomize = $('btn-theme-customize');
  btnAi = $('btn-ai');
  btnAnnotate = $('btn-annotate');
  btnSiteLimits = $('btn-sitelimits');
  aiPanel = $('ai-panel');
  aiPanelContent = $('ai-panel-content');
  aiPanelTabs = $('ai-panel-tabs');
  aiPanelClose = $('ai-panel-close');
  miniPlayer = $('mini-player');
  miniPlayerTitleEl = $('mini-player-title');
  miniPlayerPlayPause = $('mini-player-playpause');
  miniPlayerMute = $('mini-player-mute');
  miniPlayerGoto = $('mini-player-goto');
  miniPlayerCloseBtn = $('mini-player-close');
  linkPreviewTooltip = $('link-preview-tooltip');
  linkPreviewImg = $('link-preview-img');
  linkPreviewTitleElm = $('link-preview-title');
  linkPreviewDesc = $('link-preview-desc');
  linkPreviewUrlEl = $('link-preview-url');
}

async function init() {
  initElements();

  try {
    settings = await window.electronAPI.getSettings() || settings;
    shortcuts = await window.electronAPI.getShortcuts() || {};
    tabGroups = await window.electronAPI.getTabGroups() || [];
    const savedThemeConfig = await window.electronAPI.getThemes();
    if (savedThemeConfig && Object.keys(savedThemeConfig).length > 0) {
      themeConfig = { ...themeConfig, ...savedThemeConfig };
    }
    siteLimits = await window.electronAPI.getSiteLimits() || {};
    annotationsData = await window.electronAPI.getAnnotations() || {};
  } catch(e) {
    console.log('Settings load error:', e);
  }

  applyTheme(settings.theme);
  applyWallpaper(themeConfig.wallpaper);
  // Apply saved theme preset
  if (themePresets && themeConfig.preset && themeConfig.preset !== 'default') {
    const preset = themePresets.find(p => p.id === themeConfig.preset);
    if (preset) applyThemePreset(preset);
  }
  applyCompactMode(settings.compactMode);
  applySidebarWidth(settings.sidebarWidth || 260);
  applyFont(settings.fontFamily || 'Inter');

  await loadSpeedDial();
  await loadTimeStats();
  renderTabGroups();

  // Oturum geri yükleme
  if (settings.sessionRestore) {
    await restoreLastSession();
  } else {
    createTab();
  }

  setupEventListeners();
  setupGlobalClickHandler();
  setupCollapsibleSections();
  setupSidebarResize();
  startTimeTracking();
  startPerfMonitor();

  // App kapanırken oturumu kaydet
  window.electronAPI.onAppClosing(async () => {
    await saveCurrentSession();
  });

  console.log('🌐 Barly Browser v4.0 Developer Edition başlatıldı!');
}

// ========== SESSION RESTORE ==========
async function saveCurrentSession() {
  try {
    const sessionTabs = tabs.filter(t => !t.isIncognito && t.url && !t.isStartPage).map(t => ({
      url: t.url, title: t.title, groupId: t.groupId
    }));
    if (sessionTabs.length > 0) {
      await window.electronAPI.saveSession({ tabs: sessionTabs });
    }
  } catch(e) { console.error('Session save error:', e); }
}

async function restoreLastSession() {
  try {
    const session = await window.electronAPI.restoreSession(null);
    if (session && session.tabs && session.tabs.length > 0) {
      session.tabs.forEach((t, i) => {
        createTab(t.url, false, t.groupId);
      });
      showToast('Önceki oturum geri yüklendi', 'success');
      return;
    }
  } catch(e) { console.error('Session restore error:', e); }
  createTab();
}

// ========== COLLAPSIBLE SECTIONS ==========
function setupCollapsibleSections() {
  const sectionHeaders = document.querySelectorAll('.sidebar-section-header');
  sectionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.sidebar-section');
      if (section) {
        section.classList.toggle('collapsed');
        const sectionName = header.dataset.section;
        if (sectionName) {
          const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
          collapsedSections[sectionName] = section.classList.contains('collapsed');
          localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
        }
      }
    });
  });

  try {
    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
    Object.keys(collapsedSections).forEach(sectionName => {
      if (collapsedSections[sectionName]) {
        const header = document.querySelector(`[data-section="${sectionName}"]`);
        if (header) {
          const section = header.closest('.sidebar-section');
          if (section) section.classList.add('collapsed');
        }
      }
    });
  } catch(e) {}
}

// ========== SIDEBAR RESIZE ==========
function setupSidebarResize() {
  if (!sidebarResizeHandle || !sidebar) return;

  sidebarResizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizingSidebar = true;
    sidebarResizeHandle.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizingSidebar) return;
    const newWidth = Math.max(200, Math.min(500, e.clientX));
    sidebar.style.width = newWidth + 'px';
    sidebar.style.minWidth = newWidth + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isResizingSidebar) {
      isResizingSidebar = false;
      sidebarResizeHandle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      settings.sidebarWidth = parseInt(sidebar.style.width);
      window.electronAPI.setSettings(settings);
    }
  });
}

function applySidebarWidth(width) {
  if (sidebar && width) {
    sidebar.style.width = width + 'px';
    sidebar.style.minWidth = width + 'px';
  }
}

// ========== GLOBAL CLICK HANDLER ==========
function setupGlobalClickHandler() {
  document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.add('hidden');
    }
    if (shareMenu && !shareMenu.contains(e.target)) {
      shareMenu.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAllMenus();
  });
}

function hideAllMenus() {
  if (contextMenu) contextMenu.classList.add('hidden');
  if (shareMenu) shareMenu.classList.add('hidden');
  if (findBar) findBar.classList.add('hidden');
  if (modal) modal.classList.add('hidden');
  if (notepadMini) notepadMini.classList.add('hidden');
  hideLinkPreview();
}

// ========== THEME ==========
let themePresets = null; // set later when THEME_PRESETS is defined

function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  if (appContainer && tabs.some(t => t.isIncognito && t.id === activeTabId)) {
    appContainer.classList.add('incognito-mode');
  }
  settings.theme = theme;
  
  // Apply native dark/light to websites via prefers-color-scheme
  if (themeConfig.forceWebTheme) {
    applyWebTheme();
  }
  
  // Re-apply preset colors on body (class change resets inline styles)
  if (themePresets && themeConfig.preset && themeConfig.preset !== 'default') {
    const preset = themePresets.find(p => p.id === themeConfig.preset);
    if (preset) applyThemePreset(preset);
  }
}

function applyWebTheme() {
  const mode = settings.theme === 'dark' ? 'dark' : 'light';
  try { window.electronAPI.setNativeTheme(mode); } catch(e) {}
}

function applyWallpaper(wallpaperPath) {
  if (!startPage) return;
  if (wallpaperPath) {
    startPage.style.backgroundImage = `url('file:///${wallpaperPath.replace(/\\/g, '/')}')`;
    startPage.classList.add('has-wallpaper');
  } else {
    startPage.style.backgroundImage = '';
    startPage.classList.remove('has-wallpaper');
  }
}

function toggleTheme() {
  const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  window.electronAPI.setSettings(settings);
  showToast(`${newTheme === 'dark' ? '🌙 Karanlık' : '☀️ Aydınlık'} tema`, 'success');
}

// ========== FONT ==========
function applyFont(fontFamily) {
  document.documentElement.style.setProperty('--ui-font', `'${fontFamily}'`);
}

// ========== COMPACT MODE - FULL CLOSE ==========
function applyCompactMode(compact) {
  settings.compactMode = compact;
  if (appContainer) {
    appContainer.classList.toggle('compact', compact);
  }
  if (compactToggleBtn) {
    compactToggleBtn.classList.toggle('hidden', !compact);
  }
  if (btnCompact) {
    btnCompact.classList.toggle('active', compact);
  }
}

function toggleCompactMode() {
  applyCompactMode(!settings.compactMode);
  window.electronAPI.setSettings(settings);
  showToast(settings.compactMode ? '◫ Kompakt mod açık' : '◫ Kompakt mod kapalı', 'success');
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ========== MODAL ==========
function showModal(title, body, footer = '') {
  if (!modal) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalFooter.innerHTML = footer;
  modal.classList.remove('hidden');
}

function hideModal() {
  if (modal) modal.classList.add('hidden');
}

// ========== PANEL ==========
function showPanel(title, content) {
  if (!rightPanel) return;
  panelTitle.textContent = title;
  panelContent.innerHTML = content;
  rightPanel.classList.remove('hidden');
}

function hidePanel() {
  if (rightPanel) rightPanel.classList.add('hidden');
}

// ========== TAB GROUPS ==========
function renderTabGroups() {
  if (!tabGroupsContainer) return;
  tabGroupsContainer.innerHTML = '';

  // Tümü chip
  const allChip = document.createElement('div');
  allChip.className = 'tab-group-chip active';
  allChip.innerHTML = '<span class="group-dot" style="background:var(--text-muted)"></span>Tümü';
  allChip.title = 'Tüm Sekmeler';
  allChip.addEventListener('click', () => {
    $$('.tab-group-chip').forEach(i => i.classList.remove('active'));
    allChip.classList.add('active');
    filterTabsByGroup(null);
  });
  tabGroupsContainer.appendChild(allChip);

  tabGroups.forEach(group => {
    const chip = document.createElement('div');
    chip.className = 'tab-group-chip';
    chip.style.background = group.color;
    chip.innerHTML = `${group.icon ? `<span class="group-icon">${group.icon}</span>` : `<span class="group-dot" style="background:white"></span>`}${escapeHtml(group.name)}`;
    chip.title = group.name;
    chip.dataset.id = group.id;
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      $$('.tab-group-chip').forEach(i => i.classList.remove('active'));
      chip.classList.add('active');
      filterTabsByGroup(group.id);
    });
    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showGroupOptions(e, group);
    });
    tabGroupsContainer.appendChild(chip);
  });

  // "+" chip
  const addChip = document.createElement('div');
  addChip.className = 'tab-group-chip add';
  addChip.textContent = '+ Yeni';
  addChip.title = 'Yeni Grup Oluştur';
  addChip.addEventListener('click', (e) => {
    e.stopPropagation();
    showAddGroupModal();
  });
  tabGroupsContainer.appendChild(addChip);
}

function showGroupOptions(e, group) {
  const menu = document.createElement('div');
  menu.className = 'context-menu mini';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.innerHTML = `
    <div class="context-item" data-action="rename">✏️ Yeniden Adlandır</div>
    <div class="context-item danger" data-action="delete">🗑️ Sil</div>
  `;
  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 10);

  menu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', async () => {
      if (item.dataset.action === 'delete') {
        tabGroups = await window.electronAPI.removeTabGroup(group.id);
        renderTabGroups();
        showToast('Grup silindi', 'success');
      }
      menu.remove();
    });
  });
}

function showAddGroupModal() {
  const colors = [
    { name: 'Kırmızı', value: '#ef4444' },
    { name: 'Turuncu', value: '#f97316' },
    { name: 'Sarı', value: '#eab308' },
    { name: 'Yeşil', value: '#22c55e' },
    { name: 'Mavi', value: '#3b82f6' },
    { name: 'Mor', value: '#8b5cf6' },
    { name: 'Pembe', value: '#ec4899' }
  ];

  const icons = ['📁','💼','🎮','🎵','📰','🛒','💻','📚','🔬','🎨','🏠','✈️','⚽','🎬','💬','🚀'];

  showModal('Sekme Grubu Oluştur', `
    <div class="form-group">
      <label class="form-label">Grup Adı</label>
      <input type="text" class="form-input" id="group-name" placeholder="İş, Sosyal, vb.">
    </div>
    <div class="form-group">
      <label class="form-label">İkon (isteğe bağlı)</label>
      <div class="icon-picker-grid" id="group-icon-picker">
        ${icons.map(i => `<div class="icon-picker-item" data-icon="${i}">${i}</div>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Renk</label>
      <div class="color-picker" id="color-picker">
        ${colors.map(c => `<div class="color-option" data-color="${c.value}" style="background:${c.value}" title="${c.name}"></div>`).join('')}
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" onclick="hideModal()">İptal</button>
    <button class="btn btn-primary" id="save-group-btn">Oluştur</button>
  `);

  let selectedColor = '#3b82f6';
  let selectedIcon = '';
  setTimeout(() => {
    $$('.color-option').forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedColor = opt.dataset.color;
      });
    });
    $('color-picker')?.querySelector('[data-color="#3b82f6"]')?.classList.add('selected');

    $$('#group-icon-picker .icon-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('#group-icon-picker .icon-picker-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedIcon = item.dataset.icon;
      });
    });

    $('save-group-btn')?.addEventListener('click', async () => {
      const name = $('group-name')?.value.trim();
      if (name) {
        tabGroups = await window.electronAPI.addTabGroup({ name, color: selectedColor, icon: selectedIcon });
        renderTabGroups();
        hideModal();
        showToast('Grup oluşturuldu', 'success');
      }
    });
  }, 50);
}

function filterTabsByGroup(groupId) {
  tabs.forEach(tab => {
    if (groupId === null) {
      tab.element.style.display = 'flex';
    } else {
      tab.element.style.display = tab.groupId === groupId ? 'flex' : 'none';
    }
  });
}

function assignTabToGroup(tabId, groupId) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.groupId = groupId;
    const group = tabGroups.find(g => g.id === groupId);
    if (group) {
      tab.element.classList.add('grouped');
      tab.element.style.setProperty('--tab-group-color', group.color);
    } else {
      tab.element.classList.remove('grouped');
      tab.element.style.removeProperty('--tab-group-color');
    }
  }
}

// ========== TABS ==========
function createTab(url = null, isIncognito = false, groupId = null) {
  const tabId = `tab-${++tabCounter}`;

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

  if (isIncognito) {
    tabElement.style.setProperty('--tab-group-color', '#8b5cf6');
  }

  tabElement.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-close')) {
      switchTab(tabId);
    }
  });

  tabElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTabContextMenu(e, tabId);
  });

  tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  tabElement.querySelector('.tab-mute-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTabMute(tabId);
    const btn = e.target;
    const t = tabs.find(t2 => t2.id === tabId);
    if (t) {
      btn.textContent = t.isMuted ? '🔇' : '🔊';
      btn.title = t.isMuted ? 'Sesi Aç' : 'Sesi Kapat';
    }
  });

  // Drag & Drop
  setupTabDragDrop(tabElement, tabId);

  // Tab Preview on hover
  setupTabPreview(tabElement, tabId);

  tabsList.appendChild(tabElement);

  const webview = document.createElement('webview');
  webview.id = `webview-${tabId}`;
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('webpreferences', 'contextIsolation=yes, backgroundThrottling=yes, v8CacheOptions=bypassHeatCheck');
  if (url) webview.src = url;

  setupWebviewEvents(webview, tabId);
  webviewContainer.appendChild(webview);

  const tab = {
    id: tabId,
    url: url || '',
    title: 'Yeni Sekme',
    webview,
    element: tabElement,
    isStartPage: !url,
    isIncognito,
    isMuted: false,
    isSuspended: false,
    loadStartTime: 0,
    groupId,
    bytesReceived: 0,
    thumbnail: null
  };

  if (groupId) {
    assignTabToGroup(tabId, groupId);
  }

  tabs.push(tab);
  switchTab(tabId);

  // Suspend timer
  resetSuspendTimer(tabId);

  return tabId;
}

// ========== DRAG & DROP TABS ==========
function setupTabDragDrop(element, tabId) {
  element.addEventListener('dragstart', (e) => {
    draggedTabId = tabId;
    element.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  });

  element.addEventListener('dragend', () => {
    element.classList.remove('dragging');
    draggedTabId = null;
    $$('.tab-item').forEach(el => el.classList.remove('drag-over'));
  });

  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTabId && draggedTabId !== tabId) {
      element.classList.add('drag-over');
    }
  });

  element.addEventListener('dragleave', () => {
    element.classList.remove('drag-over');
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    if (!draggedTabId || draggedTabId === tabId) return;

    const dragIdx = tabs.findIndex(t => t.id === draggedTabId);
    const dropIdx = tabs.findIndex(t => t.id === tabId);
    if (dragIdx === -1 || dropIdx === -1) return;

    const [draggedTab] = tabs.splice(dragIdx, 1);
    tabs.splice(dropIdx, 0, draggedTab);

    // DOM sıralamasını güncelle
    const draggedEl = draggedTab.element;
    const dropEl = element;
    tabsList.insertBefore(draggedEl, dropEl);
  });
}

// ========== TAB PREVIEW ==========
function setupTabPreview(element, tabId) {
  let previewTimeout;

  element.addEventListener('mouseenter', (e) => {
    previewTimeout = setTimeout(async () => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab || tab.isStartPage || !tabPreview) return;

      try {
        if (tab.thumbnail) {
          tabPreviewImg.src = tab.thumbnail;
        } else if (tab.webview && tab.webview.getURL()) {
          const image = await tab.webview.capturePage();
          if (image) {
            const dataUrl = image.toDataURL();
            tab.thumbnail = dataUrl;
            tabPreviewImg.src = dataUrl;
          }
        }
        tabPreviewTitle.textContent = tab.title || 'Yeni Sekme';
        tabPreview.style.left = (element.getBoundingClientRect().right + 10) + 'px';
        tabPreview.style.top = element.getBoundingClientRect().top + 'px';
        tabPreview.classList.remove('hidden');
      } catch(e) {}
    }, 600);
  });

  element.addEventListener('mouseleave', () => {
    clearTimeout(previewTimeout);
    if (tabPreview) tabPreview.classList.add('hidden');
  });
}

// ========== TAB SUSPENDER ==========
function resetSuspendTimer(tabId) {
  if (tabSuspendTimers[tabId]) clearTimeout(tabSuspendTimers[tabId]);
  const timeout = (settings.tabSuspendTimeout || 10) * 60 * 1000;
  tabSuspendTimers[tabId] = setTimeout(() => {
    if (tabId !== activeTabId) {
      suspendTab(tabId);
    }
  }, timeout);
}

function suspendTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab || tab.isSuspended || tab.isStartPage || tab.isIncognito) return;

  tab.isSuspended = true;
  tab.element.classList.add('suspended');
  // Webview'ı boşalt (bellek tasarrufu)
  const savedUrl = tab.url;
  const savedTitle = tab.title;
  tab.webview.src = 'about:blank';
  tab._suspendedUrl = savedUrl;
  tab._suspendedTitle = savedTitle;
  showToast(`👻 "${savedTitle}" askıya alındı`, 'info');
}

function unsuspendTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
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

function switchTab(tabId) {
  tabs.forEach(tab => {
    tab.element.classList.remove('active');
    tab.webview.classList.remove('active');
  });

  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    // Askıdaysa uyandır
    if (tab.isSuspended) unsuspendTab(tabId);

    tab.element.classList.add('active');
    activeTabId = tabId;

    // Incognito visual
    if (appContainer) {
      appContainer.classList.toggle('incognito-mode', tab.isIncognito);
    }
    if (urlInput) {
      urlInput.placeholder = tab.isIncognito ? '🕵️ Gizli ajan modu — Arama yap veya adres gir...' : 'Ara veya adres gir...';
    }

    if (tab.isStartPage) {
      showStartPage();
      tab.webview.classList.remove('active');
    } else {
      hideStartPage();
      tab.webview.classList.add('active');
      if (urlInput) urlInput.value = tab.url;
      updateSecurityIcon(tab.url);
      checkHttpsWarning(tab.url);
    }

    const titleEl = tab.element.querySelector('.tab-title');
    if (titleEl) titleEl.textContent = tab.title || 'Yeni Sekme';

    updateNavButtons();
    updateBookmarkButton();
    updateMuteButton();

    // Reset suspend timer
    resetSuspendTimer(tabId);
    // Reset timers for other tabs
    tabs.forEach(t => {
      if (t.id !== tabId) resetSuspendTimer(t.id);
    });
  }
}

function closeTab(tabId) {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  const tab = tabs[tabIndex];
  tab.element.remove();
  tab.webview.remove();
  if (tabSuspendTimers[tabId]) clearTimeout(tabSuspendTimers[tabId]);
  delete tabSuspendTimers[tabId];
  tabs.splice(tabIndex, 1);

  if (tabs.length === 0) {
    createTab();
  } else if (activeTabId === tabId) {
    const newActiveIndex = Math.min(tabIndex, tabs.length - 1);
    switchTab(tabs[newActiveIndex].id);
  }
}

function cloneTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab && tab.url) {
    createTab(tab.url, tab.isIncognito, tab.groupId);
    showToast('Sekme klonlandı', 'success');
  }
}

function getActiveTab() {
  return tabs.find(t => t.id === activeTabId);
}

function getActiveWebview() {
  const tab = getActiveTab();
  return tab ? tab.webview : null;
}

// ========== TAB CONTEXT MENU ==========
function showTabContextMenu(e, tabId) {
  const existing = document.querySelector('.tab-context-menu');
  if (existing) existing.remove();

  const tab = tabs.find(t => t.id === tabId);
  const menu = document.createElement('div');
  menu.className = 'context-menu tab-context-menu';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';

  let groupOptions = '';
  if (tabGroups.length > 0) {
    groupOptions = tabGroups.map(g =>
      `<div class="context-item sub" data-action="assign-group" data-group="${g.id}">
        <span class="group-dot" style="background:${g.color}"></span> ${g.name}
      </div>`
    ).join('');
    groupOptions += `<div class="context-item sub" data-action="remove-group">✖ Gruptan Çıkar</div>`;
  }

  // Build split tab options
  const otherTabs = tabs.filter(t => t.id !== tabId && !t.isStartPage && t.url);
  let splitOptions = otherTabs.map(t => {
    const title = (t.title || 'Yeni Sekme').substring(0, 30);
    return `<div class="context-item sub" data-action="split-with" data-split-tab="${t.id}">${title}</div>`;
  }).join('');
  if (!splitOptions) splitOptions = '<div class="context-item sub disabled">Başka sekme yok</div>';

  menu.innerHTML = `
    <div class="context-item" data-action="clone">📋 Sekmeyi Klonla</div>
    <div class="context-item" data-action="mute">${tab?.isMuted ? '🔊 Sesi Aç' : '🔇 Sesi Kapat'}</div>
    <div class="context-item" data-action="suspend">${tab?.isSuspended ? '⚡ Uyandır' : '👻 Askıya Al'}</div>
    <div class="context-divider"></div>
    <div class="context-item has-sub">⬚ Yan Yana Aç ▸
      <div class="context-submenu">${splitOptions}</div>
    </div>
    ${tabGroups.length > 0 ? `
    <div class="context-item has-sub">📁 Gruba Ekle ▸
      <div class="context-submenu">${groupOptions}</div>
    </div>
    <div class="context-divider"></div>
    ` : ''}
    <div class="context-item" data-action="close-others">✕ Diğerlerini Kapat</div>
    <div class="context-item" data-action="close-right">✕ Sağdakileri Kapat</div>
    <div class="context-divider"></div>
    <div class="context-item danger" data-action="close">✕ Sekmeyi Kapat</div>
  `;

  document.body.appendChild(menu);

  setTimeout(() => {
    const closeHandler = (ev) => {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 10);

  menu.querySelectorAll('.context-item').forEach(item => {
    if (item.classList.contains('has-sub')) return;

    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const action = item.dataset.action;

      if (action === 'clone') cloneTab(tabId);
      else if (action === 'mute') toggleTabMute(tabId);
      else if (action === 'suspend') {
        if (tab?.isSuspended) unsuspendTab(tabId);
        else suspendTab(tabId);
      }
      else if (action === 'close') closeTab(tabId);
      else if (action === 'close-others') closeOtherTabs(tabId);
      else if (action === 'close-right') closeRightTabs(tabId);
      else if (action === 'assign-group') assignTabToGroup(tabId, parseInt(item.dataset.group));
      else if (action === 'remove-group') assignTabToGroup(tabId, null);
      else if (action === 'split-with') {
        const splitTab = tabs.find(t => t.id === item.dataset.splitTab);
        if (splitTab && splitTab.url) {
          switchTab(tabId);
          openInSplit(splitTab.url);
        }
      }

      menu.remove();
    });
  });
}

function closeOtherTabs(keepTabId) {
  const tabsToClose = tabs.filter(t => t.id !== keepTabId).map(t => t.id);
  tabsToClose.forEach(id => closeTab(id));
  showToast('Diğer sekmeler kapatıldı', 'success');
}

function closeRightTabs(tabId) {
  const idx = tabs.findIndex(t => t.id === tabId);
  const tabsToClose = tabs.slice(idx + 1).map(t => t.id);
  tabsToClose.forEach(id => closeTab(id));
  showToast('Sağdaki sekmeler kapatıldı', 'success');
}

function toggleTabMute(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.isMuted = !tab.isMuted;
    try { tab.webview.setAudioMuted(tab.isMuted); } catch(e) {}
    if (tab.id === activeTabId) updateMuteButton();
    updateTabMuteIcon(tab);
    showToast(tab.isMuted ? '🔇 Ses kapatıldı' : '🔊 Ses açıldı', 'success');
  }
}

// ========== START PAGE ==========
function showStartPage() {
  if (startPage) startPage.classList.remove('hidden');
  if (urlBar) urlBar.style.display = 'none';
  // Incognito start page search placeholder
  const tab = getActiveTab();
  if (searchInput) {
    searchInput.placeholder = tab?.isIncognito ? '🕵️ Gizli moddasın — Ajan gibi ara...' : 'Aramak için yaz...';
    searchInput.focus();
  }
}

function hideStartPage() {
  if (startPage) startPage.classList.add('hidden');
  if (urlBar) urlBar.style.display = 'flex';
}

// ========== HTTPS WARNING ==========
function checkHttpsWarning(url) {
  if (!httpsWarning || !settings.httpsWarning) return;
  if (url && url.startsWith('http://') && !httpsWarningDismissed[getDomain(url)]) {
    httpsWarning.classList.remove('hidden');
  } else {
    httpsWarning.classList.add('hidden');
  }
}

function dismissHttpsWarning() {
  const tab = getActiveTab();
  if (tab && tab.url) {
    httpsWarningDismissed[getDomain(tab.url)] = true;
  }
  if (httpsWarning) httpsWarning.classList.add('hidden');
}

// ========== WEBVIEW EVENTS ==========
function setupWebviewEvents(webview, tabId) {
  webview.addEventListener('did-start-loading', () => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) tab.loadStartTime = Date.now();
    if (activeTabId === tabId && loadingBar) loadingBar.classList.add('loading');
  });

  webview.addEventListener('did-stop-loading', () => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.loadStartTime) {
      const loadTime = Date.now() - tab.loadStartTime;
      if (activeTabId === tabId) {
        if (perfTime) perfTime.textContent = `⏱️ ${loadTime}ms`;
        showPageTimeline(loadTime);
      }
    }
    if (activeTabId === tabId && loadingBar) {
      loadingBar.classList.remove('loading');
      loadingBar.style.width = '0%';
    }
    // Thumbnail cache'i resetle
    if (tab) tab.thumbnail = null;
    
  });

  webview.addEventListener('page-title-updated', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.title = e.title;
      tab.element.title = e.title;
      const titleEl = tab.element.querySelector('.tab-title');
      if (titleEl) titleEl.textContent = e.title;
      if (!tab.isIncognito && tab.url) {
        window.electronAPI.addHistory({ title: e.title, url: tab.url });
      }
    }
  });

  webview.addEventListener('did-navigate', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.url = e.url;
      tab.isStartPage = false;
      const urlEl = tab.element.querySelector('.tab-url');
      if (urlEl) urlEl.textContent = getDomain(e.url);
      if (activeTabId === tabId) {
        if (urlInput) urlInput.value = e.url;
        updateSecurityIcon(e.url);
        checkHttpsWarning(e.url);
        updateNavButtons();
        updateBookmarkButton();
      }
    }
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.url = e.url;
      const urlEl = tab.element.querySelector('.tab-url');
      if (urlEl) urlEl.textContent = getDomain(e.url);
      if (activeTabId === tabId) {
        if (urlInput) urlInput.value = e.url;
        updateSecurityIcon(e.url);
        updateNavButtons();
      }
    }
  });

  webview.addEventListener('page-favicon-updated', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && e.favicons && e.favicons.length > 0 && !tab.isIncognito) {
      const faviconEl = tab.element.querySelector('.tab-favicon');
      if (faviconEl) faviconEl.innerHTML = `<img src="${e.favicons[0]}" onerror="this.parentElement.textContent='🌐'">`;
    }
  });

  webview.addEventListener('media-started-playing', () => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      const muteBtn = tab.element.querySelector('.tab-mute-btn');
      if (muteBtn) muteBtn.classList.remove('hidden');
      // Mini player
      if (tabId !== activeTabId || miniPlayerTabId) {
        showMiniPlayer(tabId);
      }
    }
  });

  webview.addEventListener('media-paused', () => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      const muteBtn = tab.element.querySelector('.tab-mute-btn');
      if (muteBtn && !tab.isMuted) muteBtn.classList.add('hidden');
      // Mini player
      if (miniPlayerTabId === tabId) {
        miniPlayerPlaying = false;
        if (miniPlayerPlayPause) miniPlayerPlayPause.textContent = '▶️';
      }
    }
  });

  // Console monitor - capture console messages
  webview.addEventListener('console-message', (e) => {
    // Annotation data
    if (e.message.startsWith('__BARLY_ANN__:')) {
      try {
        const tab = tabs.find(t => t.id === tabId);
        const highlights = JSON.parse(e.message.substring(14));
        if (tab?.url) saveAnnotationData(tab.url, highlights);
      } catch(ex) {}
      return;
    }
    // Link preview hover
    if (e.message.startsWith('__BARLY_LINK_HOVER__:')) {
      try {
        const data = JSON.parse(e.message.substring(21));
        handleLinkHover(data, webview);
      } catch(ex) {}
      return;
    }
    // Link preview leave
    if (e.message === '__BARLY_LINK_LEAVE__') {
      hideLinkPreview();
      return;
    }

    const levels = { 0: 'log', 1: 'warn', 2: 'error', 3: 'info' };
    consoleLogs.push({
      type: levels[e.level] || 'log',
      message: e.message,
      line: e.line,
      source: e.sourceId,
      time: new Date().toLocaleTimeString()
    });
    // Son 500 log'u tut
    if (consoleLogs.length > 500) consoleLogs.shift();
  });

  // Find in page results
  webview.addEventListener('found-in-page', (e) => {
    if (activeTabId === tabId && findCount && e.result) {
      const { activeMatchOrdinal, matches } = e.result;
      findCount.textContent = matches > 0 ? `${activeMatchOrdinal}/${matches}` : '0/0';
    }
  });

  // Right-click context menu on webview
  webview.addEventListener('context-menu', (e) => {
    e.preventDefault();
    if (activeTabId === tabId) {
      const rect = webview.getBoundingClientRect();
      const x = rect.left + (e.params?.x || 0);
      const y = rect.top + (e.params?.y || 0);
      showPageContextMenu(x || 300, y || 300);
    }
  });

  // dom-ready: link preview injection + annotation re-apply
  webview.addEventListener('dom-ready', () => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.isStartPage) return;
    // Link preview injection
    injectLinkPreviewScript(webview);
    // Re-apply annotations if exists for this URL
    if (tab.url) {
      const urlKey = tab.url.split('?')[0];
      const saved = annotationsData[urlKey] || [];
      if (saved.length > 0) {
        reApplyAnnotations(webview, saved);
      }
    }
  });
}

// ========== PAGE LOAD TIMELINE ==========
function showPageTimeline(totalMs) {
  if (!pageTimeline || !timelineBar) return;
  pageTimeline.classList.remove('hidden');

  // Simüle edilmiş zaman dağılımı
  const dns = Math.round(totalMs * 0.05);
  const connect = Math.round(totalMs * 0.1);
  const ssl = Math.round(totalMs * 0.08);
  const request = Math.round(totalMs * 0.15);
  const response = Math.round(totalMs * 0.25);
  const dom = Math.round(totalMs * 0.37);

  const total = dns + connect + ssl + request + response + dom;

  timelineBar.innerHTML = `
    <div class="timeline-segment timeline-dns" style="width:${(dns/total)*100}%" title="DNS: ${dns}ms"></div>
    <div class="timeline-segment timeline-connect" style="width:${(connect/total)*100}%" title="Bağlantı: ${connect}ms"></div>
    <div class="timeline-segment timeline-ssl" style="width:${(ssl/total)*100}%" title="SSL: ${ssl}ms"></div>
    <div class="timeline-segment timeline-request" style="width:${(request/total)*100}%" title="İstek: ${request}ms"></div>
    <div class="timeline-segment timeline-response" style="width:${(response/total)*100}%" title="Yanıt: ${response}ms"></div>
    <div class="timeline-segment timeline-dom" style="width:${(dom/total)*100}%" title="DOM: ${dom}ms"></div>
  `;

  // 10 saniye sonra gizle
  setTimeout(() => {
    if (pageTimeline) pageTimeline.classList.add('hidden');
  }, 10000);
}

// ========== NAVIGATION ==========
function navigate(url) {
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

function goBack() {
  const webview = getActiveWebview();
  if (webview) { try { webview.goBack(); } catch(e) {} }
}

function goForward() {
  const webview = getActiveWebview();
  if (webview) { try { webview.goForward(); } catch(e) {} }
}

function reload() {
  const webview = getActiveWebview();
  if (webview) { try { webview.reload(); } catch(e) {} }
}

function goHome() {
  const tab = getActiveTab();
  if (tab) {
    tab.isStartPage = true;
    tab.url = '';
    showStartPage();
    tab.webview.classList.remove('active');
    if (httpsWarning) httpsWarning.classList.add('hidden');
  }
}

function updateNavButtons() {
  const webview = getActiveWebview();
  const tab = getActiveTab();

  if (btnBack) btnBack.disabled = true;
  if (btnForward) btnForward.disabled = true;

  if (webview && !tab?.isStartPage) {
    try {
      if (btnBack) btnBack.disabled = !webview.canGoBack();
      if (btnForward) btnForward.disabled = !webview.canGoForward();
    } catch(e) {}
  }
}

function updateSecurityIcon(url) {
  if (!securityIcon) return;
  if (url.startsWith('https://')) securityIcon.textContent = '🔒';
  else if (url.startsWith('http://')) securityIcon.textContent = '⚠️';
  else securityIcon.textContent = '🔒';
}

// ========== SPLIT VIEW ==========
function toggleSplitView() {
  splitMode = !splitMode;
  if (webviewContainerSplit) webviewContainerSplit.classList.toggle('hidden', !splitMode);
  if (webviewWrapper) webviewWrapper.classList.toggle('split-active', splitMode);
  if (btnSplit) btnSplit.classList.toggle('active', splitMode);
  showToast(splitMode ? '⬚ Yan yana görünüm açık' : '⬚ Yan yana görünüm kapalı', 'success');
}

function openInSplit(url) {
  if (!splitMode) toggleSplitView();
  if (!webviewContainerSplit) return;

  let splitWebview = webviewContainerSplit.querySelector('webview');
  if (!splitWebview) {
    splitWebview = document.createElement('webview');
    splitWebview.setAttribute('allowpopups', '');
    splitWebview.classList.add('active');
    webviewContainerSplit.appendChild(splitWebview);
  }
  splitWebview.src = url;
}

// ========== BOOKMARKS ==========
async function updateBookmarkButton() {
  if (!btnBookmarkAdd) return;
  const tab = getActiveTab();
  if (!tab || tab.isStartPage) {
    btnBookmarkAdd.classList.remove('bookmarked');
    btnBookmarkAdd.textContent = '☆';
    return;
  }

  try {
    const bookmarks = await window.electronAPI.getBookmarks();
    const isBookmarked = bookmarks.some(b => b.url === tab.url);
    btnBookmarkAdd.classList.toggle('bookmarked', isBookmarked);
    btnBookmarkAdd.textContent = isBookmarked ? '★' : '☆';
  } catch(e) {}
}

async function toggleBookmark() {
  const tab = getActiveTab();
  if (!tab || tab.isStartPage) return;

  try {
    const bookmarks = await window.electronAPI.getBookmarks();
    const existing = bookmarks.find(b => b.url === tab.url);

    if (existing) {
      await window.electronAPI.removeBookmark(existing.id);
      showToast('Yer imi silindi', 'warning');
    } else {
      await window.electronAPI.addBookmark({ title: tab.title, url: tab.url });
      showToast('Yer imi eklendi ⭐', 'success');
    }
    updateBookmarkButton();
  } catch(e) {}
}

async function showBookmarksPanel() {
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
          </div>
        `;
      });
      content += '</div>';
    }

    showPanel('⭐ Yer İmleri', content);

    setTimeout(() => {
      setupPanelSearch('bookmarks');
      $$('#bookmarks-list .panel-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('panel-item-action')) {
            navigate(item.dataset.url);
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

// ========== HISTORY ==========
async function showHistoryPanel() {
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
          </div>
        `;
      });
      content += '</div>';
      content += '<button class="btn btn-danger" id="clear-history-btn" style="width:100%;margin-top:12px;">🗑️ Temizle</button>';
    }

    showPanel('📜 Geçmiş', content);

    setTimeout(() => {
      setupPanelSearch('history');
      $$('#history-list .panel-item').forEach(item => {
        item.addEventListener('click', () => {
          navigate(item.dataset.url);
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

// ========== ÇEVRİMDIŞI SAYFALAR ==========
async function addToReadingList() {
  const tab = getActiveTab();
  const webview = getActiveWebview();
  if (!tab || tab.isStartPage || !webview) {
    showToast('⚠️ Önce bir siteye gir', 'warning');
    return;
  }

  showToast('📴 Sayfa çevrimdışı kaydediliyor...', 'info');

  try {
    const html = await webview.executeJavaScript('document.documentElement.outerHTML');
    const result = await window.electronAPI.saveOfflinePage({
      title: tab.title || 'Başlıksız',
      url: tab.url,
      html: html
    });
    if (result.success) {
      showToast('📴 Sayfa çevrimdışı kaydedildi!', 'success');
    } else {
      showToast('❌ Kaydetme hatası', 'error');
    }
  } catch(e) {
    showToast('❌ Sayfa kaydedilemedi: ' + (e.message || ''), 'error');
  }
}

async function showReadingListPanel() {
  try {
    const list = await window.electronAPI.getOfflinePages();

    let content = '';
    
    // Intro bilgi
    content += `<div style="padding:12px;background:var(--accent-glow);border-radius:10px;margin-bottom:14px;font-size:12px;color:var(--text-dim);">
      📴 <strong>Çevrimdışı Mod:</strong> Sayfanın son aktif halini kaydedin ve internet olmadan bile açın. 
      Herhangi bir sayfada sağ üstteki 📚 butonuna veya sağ tık menüsünden "Çevrimdışı Kaydet" ile ekleyebilirsiniz.
    </div>`;
    
    if (list.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">📴</div>Kaydedilmiş çevrimdışı sayfa yok<br><span style="font-size:11px;color:var(--text-muted);">Bir sayfayken 📚 butonuna basarak kaydedin</span></div>`;
    } else {
      content += '<div id="offline-list">';
      list.forEach(item => {
        const date = new Date(item.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        content += `
          <div class="offline-item" data-id="${item.id}">
            <div class="offline-item-icon">📄</div>
            <div class="offline-item-info">
              <div class="offline-item-title">${escapeHtml(item.title)}</div>
              <div class="offline-item-url">${escapeHtml(getDomain(item.url))}</div>
              <div class="offline-item-date">📅 ${date}</div>
            </div>
            <button class="offline-item-delete" data-delete-id="${item.id}" title="Sil">🗑️</button>
          </div>
        `;
      });
      content += '</div>';
    }

    showPanel('📴 Çevrimdışı Sayfalar', content);

    setTimeout(() => {
      $$('.offline-item').forEach(item => {
        item.addEventListener('click', async (e) => {
          if (e.target.closest('.offline-item-delete')) return;
          const id = parseInt(item.dataset.id);
          const data = await window.electronAPI.loadOfflinePage(id);
          if (data.success) {
            const tab = getActiveTab();
            if (tab) {
              tab.isStartPage = false;
              tab.title = data.title + ' (Çevrimdışı)';
              tab.url = data.url;
              hideStartPage();
              tab.webview.classList.add('active');
              // Load offline HTML into webview via data URL
              const encoded = 'data:text/html;charset=utf-8,' + encodeURIComponent(data.html);
              tab.webview.loadURL(encoded);
              const titleEl = tab.element.querySelector('.tab-title');
              if (titleEl) titleEl.textContent = tab.title;
            }
            hidePanel();
            showToast('📴 Çevrimdışı sayfa açıldı', 'success');
          } else {
            showToast('❌ ' + (data.error || 'Açılamadı'), 'error');
          }
        });
      });
      
      $$('.offline-item-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.deleteId);
          await window.electronAPI.removeOfflinePage(id);
          showToast('🗑️ Çevrimdışı sayfa silindi', 'success');
          showReadingListPanel(); // Refresh
        });
      });
    }, 50);
  } catch(e) {
    showToast('❌ Çevrimdışı listesi yüklenemedi', 'error');
  }
}

// ========== NOTES ==========
function showNotepadMini() {
  if (notepadMini) notepadMini.classList.remove('hidden');
  if (notepadContent) notepadContent.focus();
}

function hideNotepadMini() {
  if (notepadMini) notepadMini.classList.add('hidden');
}

async function saveQuickNote() {
  if (!notepadContent) return;
  const content = notepadContent.value.trim();
  if (content) {
    try {
      await window.electronAPI.addNote({ title: 'Hızlı Not', content });
      notepadContent.value = '';
      hideNotepadMini();
      showToast('Not kaydedildi', 'success');
    } catch(e) {}
  }
}

async function showNotesPanel() {
  try {
    const notes = await window.electronAPI.getNotes();

    let content = '<button class="btn btn-primary" id="new-note-btn" style="width:100%;margin-bottom:12px;">+ Yeni Not</button>';

    if (notes.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">📝</div>Not yok</div>`;
    } else {
      notes.forEach(note => {
        content += `
          <div class="panel-item" data-id="${note.id}">
            <div class="panel-item-icon">📝</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(note.title)}</div>
              <div class="panel-item-subtitle">${escapeHtml((note.content || '').substring(0, 50))}...</div>
            </div>
            <button class="panel-item-action" data-id="${note.id}">✕</button>
          </div>
        `;
      });
    }

    showPanel('📝 Notlar', content);

    setTimeout(() => {
      $('new-note-btn')?.addEventListener('click', () => showNoteEditor());

      $$('.panel-item[data-id]').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('panel-item-action')) {
            const note = notes.find(n => n.id === parseInt(item.dataset.id));
            if (note) showNoteEditor(note);
          }
        });
      });

      $$('.panel-item-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeNote(parseInt(btn.dataset.id));
          showNotesPanel();
        });
      });
    }, 50);
  } catch(e) {}
}

function showNoteEditor(note = null) {
  showModal(note ? 'Not Düzenle' : 'Yeni Not', `
    <div class="form-group">
      <label class="form-label">Başlık</label>
      <input type="text" class="form-input" id="note-title" value="${note ? escapeHtml(note.title) : ''}">
    </div>
    <div class="form-group">
      <label class="form-label">İçerik</label>
      <textarea class="form-textarea" id="note-content" style="min-height:150px;">${note ? escapeHtml(note.content) : ''}</textarea>
    </div>
  `, `
    <button class="btn btn-secondary" onclick="hideModal()">İptal</button>
    <button class="btn btn-primary" id="save-note-btn">Kaydet</button>
  `);

  setTimeout(() => {
    $('save-note-btn')?.addEventListener('click', async () => {
      const title = $('note-title')?.value.trim() || 'Not';
      const content = $('note-content')?.value.trim();

      if (content) {
        try {
          if (note) {
            await window.electronAPI.updateNote({ id: note.id, title, content });
          } else {
            await window.electronAPI.addNote({ title, content });
          }
          hideModal();
          showNotesPanel();
          showToast('Not kaydedildi', 'success');
        } catch(e) {}
      }
    });
  }, 50);
}

// ========== PASSWORD MANAGER ==========
function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score <= 1) return { label: 'Zayıf', color: '#ef4444', percent: 20 };
  if (score <= 2) return { label: 'Orta', color: '#f59e0b', percent: 40 };
  if (score <= 3) return { label: 'İyi', color: '#22c55e', percent: 60 };
  if (score <= 4) return { label: 'Güçlü', color: '#3b82f6', percent: 80 };
  return { label: 'Çok Güçlü', color: '#8b5cf6', percent: 100 };
}

async function showPasswordsPanel() {
  try {
    const passwords = await window.electronAPI.getPasswords();

    let content = '<button class="btn btn-primary" id="add-pwd-btn" style="width:100%;margin-bottom:8px;">+ Şifre Ekle</button>';
    content += '<button class="btn btn-secondary" id="gen-pwd-btn" style="width:100%;margin-bottom:12px;">🎲 Şifre Üret</button>';

    if (passwords.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">🔐</div>Kayıtlı şifre yok</div>`;
    } else {
      passwords.forEach(p => {
        const strength = getPasswordStrength(p.password || '');
        content += `
          <div class="panel-item">
            <div class="panel-item-icon">🔐</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(p.site)}</div>
              <div class="panel-item-subtitle">${escapeHtml(p.username)}</div>
              <div class="pwd-strength-bar"><div class="pwd-strength-fill" style="width:${strength.percent}%;background:${strength.color}"></div></div>
            </div>
            <button class="panel-item-action" data-id="${p.id}">✕</button>
          </div>
        `;
      });
    }

    showPanel('🔐 Şifreler', content);

    setTimeout(() => {
      $('add-pwd-btn')?.addEventListener('click', showAddPasswordModal);
      $('gen-pwd-btn')?.addEventListener('click', showPasswordGenerator);

      $$('.panel-item-action').forEach(btn => {
        btn.addEventListener('click', async () => {
          await window.electronAPI.removePassword(parseInt(btn.dataset.id));
          showPasswordsPanel();
          showToast('Şifre silindi', 'warning');
        });
      });
    }, 50);
  } catch(e) {}
}

function showAddPasswordModal() {
  showModal('Şifre Ekle', `
    <div class="form-group">
      <label class="form-label">Site</label>
      <input type="text" class="form-input" id="pwd-site" placeholder="example.com">
    </div>
    <div class="form-group">
      <label class="form-label">Kullanıcı Adı</label>
      <input type="text" class="form-input" id="pwd-username">
    </div>
    <div class="form-group">
      <label class="form-label">Şifre</label>
      <input type="password" class="form-input" id="pwd-password">
      <div class="pwd-strength-bar" id="pwd-str-bar"><div class="pwd-strength-fill" id="pwd-str-fill"></div></div>
      <div class="pwd-strength-text" id="pwd-str-text"></div>
    </div>
  `, `
    <button class="btn btn-secondary" onclick="hideModal()">İptal</button>
    <button class="btn btn-primary" id="save-pwd-btn">Kaydet</button>
  `);

  setTimeout(() => {
    $('pwd-password')?.addEventListener('input', (e) => {
      const strength = getPasswordStrength(e.target.value);
      const fill = $('pwd-str-fill');
      const text = $('pwd-str-text');
      if (fill) { fill.style.width = strength.percent + '%'; fill.style.background = strength.color; }
      if (text) { text.textContent = strength.label; text.style.color = strength.color; }
    });

    $('save-pwd-btn')?.addEventListener('click', async () => {
      const site = $('pwd-site')?.value;
      const username = $('pwd-username')?.value;
      const password = $('pwd-password')?.value;

      if (site && username && password) {
        await window.electronAPI.addPassword({ site, username, password });
        hideModal();
        showPasswordsPanel();
        showToast('Şifre kaydedildi', 'success');
      }
    });
  }, 50);
}

function showPasswordGenerator() {
  const generate = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, v => chars[v % chars.length]).join('');
  };

  const pwd = generate();
  const strength = getPasswordStrength(pwd);

  showModal('🎲 Şifre Üretici', `
    <div class="form-group">
      <label class="form-label">Üretilen Şifre</label>
      <input type="text" class="form-input password-display" id="gen-password" value="${pwd}" readonly>
      <div class="pwd-strength-bar"><div class="pwd-strength-fill" id="gen-str-fill" style="width:${strength.percent}%;background:${strength.color}"></div></div>
      <div class="pwd-strength-text" id="gen-str-text" style="color:${strength.color}">${strength.label}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Uzunluk: <span id="len-val">16</span></label>
      <input type="range" id="pwd-length" min="8" max="32" value="16" style="width:100%;">
    </div>
  `, `
    <button class="btn btn-secondary" id="regen-btn">🔄 Yenile</button>
    <button class="btn btn-primary" id="copy-pwd-btn">📋 Kopyala</button>
  `);

  setTimeout(() => {
    const updateGen = () => {
      const len = parseInt($('pwd-length')?.value || 16);
      const newPwd = generate(len);
      const s = getPasswordStrength(newPwd);
      if ($('gen-password')) $('gen-password').value = newPwd;
      if ($('gen-str-fill')) { $('gen-str-fill').style.width = s.percent + '%'; $('gen-str-fill').style.background = s.color; }
      if ($('gen-str-text')) { $('gen-str-text').textContent = s.label; $('gen-str-text').style.color = s.color; }
    };

    $('pwd-length')?.addEventListener('input', (e) => {
      if ($('len-val')) $('len-val').textContent = e.target.value;
      updateGen();
    });

    $('regen-btn')?.addEventListener('click', updateGen);

    $('copy-pwd-btn')?.addEventListener('click', () => {
      const pwdVal = $('gen-password');
      if (pwdVal) {
        navigator.clipboard.writeText(pwdVal.value);
        showToast('Şifre kopyalandı', 'success');
        hideModal();
      }
    });
  }, 50);
}

// ========== DOWNLOADS ==========
function showDownloadsPanel() {
  let content = '';
  if (downloads.length === 0) {
    content = `<div class="panel-empty"><div class="panel-empty-icon">📥</div>İndirme yok</div>`;
  } else {
    downloads.forEach(d => {
      content += `
        <div class="panel-item">
          <div class="panel-item-icon">📄</div>
          <div class="panel-item-info">
            <div class="panel-item-title">${escapeHtml(d.name)}</div>
            <div class="panel-item-subtitle">${d.status}</div>
          </div>
        </div>
      `;
    });
  }
  showPanel('📥 İndirilenler', content);
}

// ========== TODO LIST ==========
async function showTodosPanel() {
  try {
    const todos = await window.electronAPI.getTodos();

    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;

    let content = `
      <div class="todo-input-row">
        <input type="text" id="todo-input" placeholder="Yeni görev ekle...">
        <select id="todo-priority-select" class="todo-priority-select">
          <option value="high">🔴 Yüksek</option>
          <option value="medium" selected>🟡 Orta</option>
          <option value="low">🟢 Düşük</option>
        </select>
        <button id="todo-add-btn" title="Görev Ekle">+</button>
      </div>
      <div class="todo-filters">
        <button class="todo-filter ${todoFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü</button>
        <button class="todo-filter ${todoFilter === 'active' ? 'active' : ''}" data-filter="active">Aktif</button>
        <button class="todo-filter ${todoFilter === 'completed' ? 'active' : ''}" data-filter="completed">Tamamlanan</button>
      </div>
      <div id="todo-list">
    `;

    const filtered = todos.filter(t => {
      if (todoFilter === 'active') return !t.completed;
      if (todoFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      content += `<div class="panel-empty" style="padding:24px"><div class="panel-empty-icon">✅</div>${todoFilter === 'completed' ? 'Tamamlanan görev yok' : 'Görev yok'}</div>`;
    } else {
      filtered.forEach(todo => {
        const priorityClass = todo.priority || 'medium';
        const priorityLabel = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' }[priorityClass] || 'Orta';
        content += `
          <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">${todo.completed ? '✓' : ''}</div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <span class="todo-priority ${priorityClass}">${priorityLabel}</span>
            <button class="todo-delete" data-id="${todo.id}">✕</button>
          </div>
        `;
      });
    }

    content += `</div>
      <div class="todo-stats">
        <span>${completed}/${total} tamamlandı</span>
        <button class="btn btn-sm btn-secondary" id="todo-clear-btn">Tamamlananları Sil</button>
      </div>
    `;

    showPanel('✅ Yapılacaklar', content);

    setTimeout(() => {
      // Görev ekleme
      const addTodo = async () => {
        const input = $('todo-input');
        const prioritySel = $('todo-priority-select');
        const text = input?.value.trim();
        if (text) {
          const priority = prioritySel?.value || 'medium';
          await window.electronAPI.addTodo({ text, priority });
          showTodosPanel();
        }
      };

      $('todo-add-btn')?.addEventListener('click', addTodo);
      $('todo-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });
      $('todo-input')?.focus();

      // Filtreler
      $$('.todo-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          todoFilter = btn.dataset.filter;
          showTodosPanel();
        });
      });

      // Checkbox toggle
      $$('.todo-checkbox').forEach(cb => {
        cb.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(cb.dataset.id);
          const todo = todos.find(t => t.id === id);
          if (todo) {
            await window.electronAPI.updateTodo({ id, completed: !todo.completed });
            showTodosPanel();
          }
        });
      });

      // Silme
      $$('.todo-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeTodo(parseInt(btn.dataset.id));
          showTodosPanel();
        });
      });

      // Tamamlananları temizle
      $('todo-clear-btn')?.addEventListener('click', async () => {
        await window.electronAPI.clearCompletedTodos();
        showTodosPanel();
        showToast('Tamamlanan görevler silindi', 'success');
      });
    }, 50);
  } catch(e) {
    console.error('Todos error:', e);
  }
}

// ========== CONSOLE MONITOR ==========
function showConsolePanel() {
  const logCount = consoleLogs.filter(l => l.type === 'log').length;
  const warnCount = consoleLogs.filter(l => l.type === 'warn').length;
  const errCount = consoleLogs.filter(l => l.type === 'error').length;
  const infoCount = consoleLogs.filter(l => l.type === 'info').length;

  let content = `
    <div class="console-header-bar">
      <div class="console-status">
        <span class="console-status-dot ${errCount > 0 ? 'error' : 'ok'}"></span>
        <span>${consoleLogs.length} mesaj</span>
      </div>
      <div class="console-stats">
        <span class="console-stat log">${logCount} log</span>
        <span class="console-stat warn">${warnCount} uyarı</span>
        <span class="console-stat error">${errCount} hata</span>
        <span class="console-stat info">${infoCount} bilgi</span>
      </div>
    </div>
    <div class="console-toolbar">
      <button class="console-filter active" data-type="all">Tümü</button>
      <button class="console-filter" data-type="log">📋 Log</button>
      <button class="console-filter warn-filter" data-type="warn">⚠️ Uyarı</button>
      <button class="console-filter error-filter" data-type="error">❌ Hata</button>
      <button class="console-filter" data-type="info">ℹ️ Bilgi</button>
      <input type="text" class="console-search" id="console-search" placeholder="🔍 Filtrele...">
      <button class="console-clear-btn" id="console-clear">🗑️</button>
    </div>
    <div class="console-output" id="console-output">
  `;

  if (consoleLogs.length === 0) {
    content += `<div class="console-empty">
      <div class="console-empty-icon">⌨️</div>
      <div class="console-empty-title">Konsol Boş</div>
      <div class="console-empty-hint">Sayfa konsola mesaj yazdığında burada görünür.<br>
      <code>console.log()</code> <code>console.warn()</code> <code>console.error()</code></div>
    </div>`;
  } else {
    consoleLogs.slice(-200).forEach((log, i) => {
      const typeIcon = { log: '📋', warn: '⚠️', error: '❌', info: 'ℹ️' }[log.type] || '📋';
      const sourceShort = log.source ? log.source.split('/').pop() : '';
      content += `
        <div class="console-line ${log.type}" data-msg="${escapeHtml(log.message).toLowerCase()}">
          <span class="console-line-icon">${typeIcon}</span>
          <span class="console-line-type">${log.type.toUpperCase()}</span>
          <span class="console-line-msg">${escapeHtml(log.message)}</span>
          ${sourceShort ? `<span class="console-line-source" title="${escapeHtml(log.source)}">${escapeHtml(sourceShort)}${log.line ? ':' + log.line : ''}</span>` : ''}
          <span class="console-line-time">${log.time}</span>
        </div>
      `;
    });
  }

  content += '</div>';

  showPanel('🖥️ DevTools Konsol', content);

  setTimeout(() => {
    const output = $('console-output');
    if (output) output.scrollTop = output.scrollHeight;

    // Filtreler
    $$('.console-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.console-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        $$('.console-line').forEach(line => {
          if (type === 'all' || line.classList.contains(type)) {
            line.style.display = 'flex';
          } else {
            line.style.display = 'none';
          }
        });
      });
    });

    // Arama filtresi
    $('console-search')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      $$('.console-line').forEach(line => {
        const msg = line.dataset.msg || '';
        line.style.display = msg.includes(query) ? 'flex' : 'none';
      });
    });

    // Temizle
    $('console-clear')?.addEventListener('click', () => {
      consoleLogs = [];
      showConsolePanel();
      showToast('Konsol temizlendi', 'success');
    });
  }, 50);
}

// ========== SESSION MANAGER ==========
async function showSessionsPanel() {
  try {
    const sessions = await window.electronAPI.getSessions();

    let content = `
      <button class="btn btn-primary" id="save-session-btn" style="width:100%;margin-bottom:16px;">💾 Mevcut Oturumu Kaydet</button>
    `;

    const sessionNames = Object.keys(sessions).filter(k => k !== '_lastSession');

    if (sessionNames.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">💾</div>Kayıtlı oturum yok</div>`;
    } else {
      sessionNames.forEach(name => {
        const sess = sessions[name];
        const date = new Date(sess.savedAt).toLocaleDateString('tr-TR');
        const tabCount = sess.tabs ? sess.tabs.length : 0;
        content += `
          <div class="session-item" data-name="${escapeHtml(name)}">
            <div class="panel-item-icon">💾</div>
            <div class="session-info">
              <div class="session-name">${escapeHtml(name)}</div>
              <div class="session-meta">${tabCount} sekme • ${date}</div>
            </div>
            <div class="session-actions">
              <button class="session-action-btn" data-action="restore" data-name="${escapeHtml(name)}" title="Geri Yükle">▶</button>
              <button class="session-action-btn danger" data-action="delete" data-name="${escapeHtml(name)}" title="Sil">✕</button>
            </div>
          </div>
        `;
      });
    }

    showPanel('💾 Oturum Yöneticisi', content);

    setTimeout(() => {
      $('save-session-btn')?.addEventListener('click', () => {
        showModal('Oturumu Kaydet', `
          <div class="form-group">
            <label class="form-label">Oturum Adı</label>
            <input type="text" class="form-input" id="session-name" placeholder="İş sekmeleri, Proje...">
          </div>
        `, `
          <button class="btn btn-secondary" onclick="hideModal()">İptal</button>
          <button class="btn btn-primary" id="confirm-save-session">Kaydet</button>
        `);

        setTimeout(() => {
          $('confirm-save-session')?.addEventListener('click', async () => {
            const name = $('session-name')?.value.trim();
            if (name) {
              const sessionTabs = tabs.filter(t => !t.isIncognito && t.url && !t.isStartPage).map(t => ({
                url: t.url, title: t.title
              }));
              await window.electronAPI.saveSession({ name, tabs: sessionTabs });
              hideModal();
              showSessionsPanel();
              showToast('Oturum kaydedildi', 'success');
            }
          });
        }, 50);
      });

      // Geri yükle
      $$('[data-action="restore"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const name = btn.dataset.name;
          const session = await window.electronAPI.restoreSession(name);
          if (session && session.tabs) {
            session.tabs.forEach(t => createTab(t.url));
            showToast(`"${name}" oturumu yüklendi`, 'success');
            hidePanel();
          }
        });
      });

      // Sil
      $$('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeSession(btn.dataset.name);
          showSessionsPanel();
          showToast('Oturum silindi', 'success');
        });
      });
    }, 50);
  } catch(e) {}
}

// ========== WEB CLIPPER ==========
async function webClipper() {
  const webview = getActiveWebview();
  if (!webview) return;

  try {
    const selectedText = await webview.executeJavaScript('window.getSelection().toString()');
    const tab = getActiveTab();

    if (selectedText && selectedText.trim()) {
      await window.electronAPI.addNote({
        title: `📋 ${tab?.title || 'Web Clip'}`,
        content: `Kaynak: ${tab?.url || ''}\n\n${selectedText.trim()}`
      });
      showToast('✂️ Metin notlara kaydedildi', 'success');
    } else {
      showToast('Önce bir metin seçin', 'warning');
    }
  } catch(e) {
    showToast('Web clipper hatası', 'error');
  }
}

// ========== READER MODE ==========
async function toggleReaderMode() {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    showToast('Okuyucu modu için bir sayfa açın', 'warning');
    return;
  }

  // Mevcut reader overlay'ı kaldır
  const existing = document.querySelector('.reader-overlay');
  if (existing) {
    existing.remove();
    if (btnReader) btnReader.classList.remove('active');
    return;
  }

  try {
    const article = await webview.executeJavaScript(`
      (function() {
        const title = document.title || '';
        const article = document.querySelector('article') || document.querySelector('[role="main"]') || document.querySelector('.post-content') || document.querySelector('.entry-content') || document.body;
        const paragraphs = article.querySelectorAll('p, h1, h2, h3, h4, li, blockquote, pre');
        let content = '';
        paragraphs.forEach(p => {
          const tag = p.tagName.toLowerCase();
          const text = p.innerText.trim();
          if (text) {
            if (tag.startsWith('h')) content += '<h2>' + text + '</h2>';
            else if (tag === 'pre') content += '<pre>' + text + '</pre>';
            else content += '<p>' + text + '</p>';
          }
        });
        return { title, content: content || '<p>İçerik alınamadı.</p>' };
      })();
    `);

    const overlay = document.createElement('div');
    overlay.className = 'reader-overlay';
    overlay.innerHTML = `
      <button class="reader-close" onclick="this.parentElement.remove(); if(document.getElementById('btn-reader')) document.getElementById('btn-reader').classList.remove('active');">✕</button>
      <div class="reader-content">
        <h1>${escapeHtml(article.title)}</h1>
        ${article.content}
      </div>
    `;


    const contentArea = $('content-area');
    if (contentArea) contentArea.appendChild(overlay);
    if (btnReader) btnReader.classList.add('active');
  } catch(e) {
    showToast('Okuyucu modu hatası', 'error');
  }
}

// ========== SHORTCUTS MANAGEMENT ==========
const DEFAULT_SHORTCUTS = {
  'newTab': { label: 'Yeni Sekme', key: 'Ctrl+T' },
  'newIncognito': { label: 'Gizli Sekme', key: 'Ctrl+Shift+N' },
  'closeTab': { label: 'Sekmeyi Kapat', key: 'Ctrl+W' },
  'focusUrl': { label: 'Adres Çubuğu', key: 'Ctrl+L' },
  'reload': { label: 'Yenile', key: 'Ctrl+R' },
  'find': { label: 'Sayfada Bul', key: 'Ctrl+F' },
  'bookmark': { label: 'Yer İmi Ekle', key: 'Ctrl+D' },
  'history': { label: 'Geçmiş', key: 'Ctrl+H' },
  'screenshot': { label: 'Ekran Görüntüsü', key: 'Ctrl+Shift+S' },
  'todos': { label: 'Yapılacaklar', key: 'Ctrl+Shift+T' },
  'console': { label: 'Konsol', key: 'Ctrl+Shift+J' },
  'quickSearch': { label: 'Hızlı Arama', key: 'Ctrl+.' },
  'back': { label: 'Geri', key: 'Alt+Left' },
  'forward': { label: 'İleri', key: 'Alt+Right' },
  'fullscreen': { label: 'Tam Ekran', key: 'F11' },
  'devtools': { label: 'DevTools', key: 'F12' }
};

function getShortcutValue(action) {
  return shortcuts[action] || DEFAULT_SHORTCUTS[action]?.key || '';
}

function generateShortcutsList() {
  return Object.entries(DEFAULT_SHORTCUTS).map(([action, info]) => {
    const currentKey = getShortcutValue(action);
    return `<div class="shortcut-item">
      <span class="shortcut-label">${info.label}</span>
      <button class="shortcut-key-btn" data-action="${action}" title="Değiştirmek için tıkla">${escapeHtml(currentKey)}</button>
    </div>`;
  }).join('');
}

function shortcutKeyToString(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  const key = e.key;
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    if (key === 'ArrowLeft') parts.push('Left');
    else if (key === 'ArrowRight') parts.push('Right');
    else if (key === 'ArrowUp') parts.push('Up');
    else if (key === 'ArrowDown') parts.push('Down');
    else if (key === ' ') parts.push('Space');
    else if (key === '.') parts.push('.');
    else parts.push(key.length === 1 ? key.toUpperCase() : key);
  }
  return parts.join('+');
}

function checkShortcutConflict(newKey, excludeAction) {
  for (const [action, info] of Object.entries(DEFAULT_SHORTCUTS)) {
    if (action === excludeAction) continue;
    const current = getShortcutValue(action);
    if (current.toLowerCase() === newKey.toLowerCase()) {
      return info.label;
    }
  }
  return null;
}

function setupShortcutRecording() {
  document.querySelectorAll('.shortcut-key-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (isRecordingShortcut) {
        const prev = document.querySelector('.shortcut-key-btn.recording');
        if (prev) {
          prev.classList.remove('recording');
          prev.textContent = getShortcutValue(prev.dataset.action);
        }
      }
      isRecordingShortcut = this.dataset.action;
      this.classList.add('recording');
      this.textContent = '⏺ Tuşa bas...';

      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        const keyStr = shortcutKeyToString(e);
        if (!keyStr) return;

        const conflict = checkShortcutConflict(keyStr, isRecordingShortcut);
        if (conflict) {
          showToast(`⚠️ "${keyStr}" zaten "${conflict}" için kullanılıyor!`, 'warning');
          this.classList.remove('recording');
          this.textContent = getShortcutValue(this.dataset.action);
          isRecordingShortcut = null;
          document.removeEventListener('keydown', handler, true);
          return;
        }

        shortcuts[isRecordingShortcut] = keyStr;
        this.classList.remove('recording');
        this.textContent = keyStr;
        isRecordingShortcut = null;
        document.removeEventListener('keydown', handler, true);
        window.electronAPI.setShortcuts(shortcuts);
        showToast(`✅ Kısayol güncellendi: ${keyStr}`, 'success');
      };

      document.addEventListener('keydown', handler, true);
    });
  });

  $('reset-shortcuts')?.addEventListener('click', async () => {
    shortcuts = {};
    try { await window.electronAPI.resetShortcuts(); } catch(e) {}
    const list = $('shortcuts-list');
    if (list) list.innerHTML = generateShortcutsList();
    setupShortcutRecording();
    showToast('Kısayollar varsayılana sıfırlandı', 'success');
  });
}

// ========== SETTINGS ==========
async function showSettingsPanel() {
  try {
    settings = await window.electronAPI.getSettings() || settings;
    shortcuts = await window.electronAPI.getShortcuts() || {};
  } catch(e) {}

  const fontOptions = ['Inter', 'Segoe UI', 'Roboto', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Arial'];

  const content = `
    <div class="settings-section">
      <div class="settings-section-title">Görünüm</div>
      <div class="settings-item">
        <div class="settings-item-title">Karanlık Tema</div>
        <div class="toggle ${settings.theme === 'dark' ? 'active' : ''}" id="toggle-theme"></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-title">Web Sayfalarında Karanlık Mod</div>
        <div class="toggle ${themeConfig.forceWebTheme ? 'active' : ''}" id="toggle-web-theme"></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-title">Kompakt Mod</div>
        <div class="toggle ${settings.compactMode ? 'active' : ''}" id="toggle-compact"></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-title">Yazı Tipi</div>
        <select class="form-select" id="font-select" style="width:140px;">
          ${fontOptions.map(f => `<option value="${f}" ${settings.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Gizlilik & Güvenlik</div>
      <div class="settings-item">
        <div class="settings-item-title">Reklam Engelleyici</div>
        <div class="toggle ${settings.adBlockEnabled ? 'active' : ''}" id="toggle-adblock"></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-title">HTTPS Uyarısı</div>
        <div class="toggle ${settings.httpsWarning ? 'active' : ''}" id="toggle-https"></div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Oturum & Sekmeler</div>
      <div class="settings-item">
        <div class="settings-item-title">Oturumu Geri Yükle</div>
        <div class="toggle ${settings.sessionRestore ? 'active' : ''}" id="toggle-session"></div>
      </div>
      <div class="settings-item">
        <div class="settings-item-title">Sekme Askıya Alma (dk)</div>
        <select class="form-select" id="suspend-timeout" style="width:80px;">
          ${[5,10,15,30,60].map(m => `<option value="${m}" ${settings.tabSuspendTimeout === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Pencere</div>
      <button class="btn btn-secondary" id="btn-fullscreen" style="width:100%;">⛶ Tam Ekran</button>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">⌨️ Kısayolları Yönet</div>
      <div class="shortcuts-list" id="shortcuts-list">
        ${generateShortcutsList()}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn btn-danger" id="reset-shortcuts" style="flex:1;">↩️ Varsayılana Sıfırla</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Veri</div>
      <button class="btn btn-danger" id="clear-all-data" style="width:100%;">🗑️ Tüm Verileri Temizle</button>
    </div>
  `;

  showPanel('⚙️ Ayarlar', content);

  setTimeout(() => {
    $('toggle-theme')?.addEventListener('click', function() {
      this.classList.toggle('active');
      settings.theme = this.classList.contains('active') ? 'dark' : 'light';
      applyTheme(settings.theme);
      window.electronAPI.setSettings(settings);
    });

    $('toggle-compact')?.addEventListener('click', function() {
      this.classList.toggle('active');
      settings.compactMode = this.classList.contains('active');
      applyCompactMode(settings.compactMode);
      window.electronAPI.setSettings(settings);
    });

    $('toggle-web-theme')?.addEventListener('click', function() {
      this.classList.toggle('active');
      themeConfig.forceWebTheme = this.classList.contains('active');
      saveThemeConfig();
      if (themeConfig.forceWebTheme) {
        applyWebTheme();
      } else {
        try { window.electronAPI.setNativeTheme('system'); } catch(e) {}
      }
    });

    $('toggle-adblock')?.addEventListener('click', async function() {
      this.classList.toggle('active');
      settings.adBlockEnabled = this.classList.contains('active');
      await window.electronAPI.setSettings(settings);
      try { await window.electronAPI.toggleAdBlock(settings.adBlockEnabled); } catch(e) {}
      showToast(settings.adBlockEnabled ? 'Reklam engelleyici açık' : 'Reklam engelleyici kapalı', 'success');
    });

    $('toggle-https')?.addEventListener('click', function() {
      this.classList.toggle('active');
      settings.httpsWarning = this.classList.contains('active');
      window.electronAPI.setSettings(settings);
    });

    $('toggle-session')?.addEventListener('click', function() {
      this.classList.toggle('active');
      settings.sessionRestore = this.classList.contains('active');
      window.electronAPI.setSettings(settings);
    });

    $('font-select')?.addEventListener('change', function() {
      settings.fontFamily = this.value;
      applyFont(settings.fontFamily);
      window.electronAPI.setSettings(settings);
    });

    $('suspend-timeout')?.addEventListener('change', function() {
      settings.tabSuspendTimeout = parseInt(this.value);
      window.electronAPI.setSettings(settings);
    });

    $('btn-fullscreen')?.addEventListener('click', () => {
      try { window.electronAPI.toggleFullscreen(); } catch(e) {}
      showToast('Tam ekran değiştirildi', 'success');
    });

    $('clear-all-data')?.addEventListener('click', async () => {
      if (confirm('Tüm veriler silinecek!')) {
        try { await window.electronAPI.clearAllData(); } catch(e) {}
        showToast('Veriler temizlendi', 'success');
      }
    });

    setupShortcutRecording();
  }, 50);
}

// ========== TEMA ÖZELLEŞTİRME PANELİ ==========
const THEME_PRESETS = [
  { id: 'default', name: 'Varsayılan', colors: ['#8b5cf6', '#09090b'] },
  { id: 'ocean', name: 'Okyanus', colors: ['#0ea5e9', '#0c1929'] },
  { id: 'forest', name: 'Orman', colors: ['#22c55e', '#0a1a0f'] },
  { id: 'sunset', name: 'Gün Batımı', colors: ['#f97316', '#1a0f05'] },
  { id: 'rose', name: 'Gül', colors: ['#f43f5e', '#1a0510'] },
  { id: 'gold', name: 'Altın', colors: ['#eab308', '#1a1505'] },
  { id: 'cyber', name: 'Siber', colors: ['#06b6d4', '#0a1419'] },
  { id: 'lavender', name: 'Lavanta', colors: ['#a78bfa', '#110e1a'] },
  { id: 'cherry', name: 'Kiraz', colors: ['#ec4899', '#1a0515'] }
];
themePresets = THEME_PRESETS;

function showThemeCustomizer() {
  const existing = document.querySelector('.theme-panel-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.className = 'theme-panel-overlay';
  
  const activePreset = themeConfig.preset || 'default';

  overlay.innerHTML = `
    <div class="theme-panel">
      <div class="theme-panel-header">
        <h3>🎨 Tema Düzenle</h3>
        <button class="theme-panel-close" id="theme-panel-close">✕</button>
      </div>
      <div class="theme-panel-body">
        <div>
          <div class="theme-section-title">Renk Temaları</div>
          <div class="theme-presets-grid">
            ${THEME_PRESETS.map(p => `
              <div class="theme-preset-card ${activePreset === p.id ? 'active' : ''}" data-preset="${p.id}">
                <div class="theme-preset-preview" style="background: linear-gradient(135deg, ${p.colors[0]} 0%, ${p.colors[1]} 100%);"></div>
                <div class="theme-preset-name">${p.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="theme-section-title">Mod</div>
          <div style="display:flex;gap:8px;">
            <button class="btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}" id="theme-mode-dark" style="flex:1;">🌙 Karanlık</button>
            <button class="btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}" id="theme-mode-light" style="flex:1;">☀️ Aydınlık</button>
          </div>
        </div>

        <div>
          <div class="theme-section-title">Web Sayfalarına Tema Uygula</div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="toggle ${themeConfig.forceWebTheme ? 'active' : ''}" id="toggle-force-web-theme"></div>
            <span style="font-size:12px;color:var(--text-dim);">Açtığın sitelere de karanlık/aydınlık tema uygula</span>
          </div>
        </div>

        <div class="wallpaper-section">
          <div class="theme-section-title">Arka Plan Görseli</div>
          <div class="wallpaper-preview" id="wallpaper-preview" ${themeConfig.wallpaper ? `style="background-image:url('file:///${themeConfig.wallpaper.replace(/\\\\/g, '/')}')"` : ''}>
            ${themeConfig.wallpaper ? '' : '📷 Görsel seçmek için tıklayın'}
          </div>
          <div class="wallpaper-actions">
            <button id="wallpaper-select">📂 Görsel Seç</button>
            <button id="wallpaper-remove">🗑️ Kaldır</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close
  overlay.querySelector('#theme-panel-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Preset selection
  overlay.querySelectorAll('.theme-preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const preset = THEME_PRESETS.find(p => p.id === card.dataset.preset);
      if (!preset) return;
      
      overlay.querySelectorAll('.theme-preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      themeConfig.preset = preset.id;
      applyThemePreset(preset);
      saveThemeConfig();
    });
  });

  // Mode toggle
  overlay.querySelector('#theme-mode-dark').addEventListener('click', () => {
    settings.theme = 'dark';
    applyTheme('dark');
    window.electronAPI.setSettings(settings);
    overlay.querySelector('#theme-mode-dark').className = 'btn btn-primary';
    overlay.querySelector('#theme-mode-light').className = 'btn btn-secondary';
    showToast('🌙 Karanlık tema', 'success');
  });
  
  overlay.querySelector('#theme-mode-light').addEventListener('click', () => {
    settings.theme = 'light';
    applyTheme('light');
    window.electronAPI.setSettings(settings);
    overlay.querySelector('#theme-mode-dark').className = 'btn btn-secondary';
    overlay.querySelector('#theme-mode-light').className = 'btn btn-primary';
    showToast('☀️ Aydınlık tema', 'success');
  });

  // Force web theme toggle
  overlay.querySelector('#toggle-force-web-theme').addEventListener('click', function() {
    this.classList.toggle('active');
    themeConfig.forceWebTheme = this.classList.contains('active');
    saveThemeConfig();
    if (themeConfig.forceWebTheme) {
      applyWebTheme();
      showToast('🌐 Web sayfalarına tema uygulanacak', 'success');
    } else {
      try { window.electronAPI.setNativeTheme('system'); } catch(e) {}
      showToast('🌐 Web tema uygulaması kapatıldı', 'success');
    }
  });

  // Wallpaper select
  overlay.querySelector('#wallpaper-select').addEventListener('click', async () => {
    const filePath = await window.electronAPI.selectImage();
    if (filePath) {
      themeConfig.wallpaper = filePath;
      applyWallpaper(filePath);
      saveThemeConfig();
      const preview = overlay.querySelector('#wallpaper-preview');
      preview.style.backgroundImage = `url('file:///${filePath.replace(/\\\\/g, '/')}')`;
      preview.textContent = '';
      showToast('🖼️ Arka plan ayarlandı', 'success');
    }
  });

  // Also clicking on the preview selects wallpaper
  overlay.querySelector('#wallpaper-preview').addEventListener('click', async () => {
    const filePath = await window.electronAPI.selectImage();
    if (filePath) {
      themeConfig.wallpaper = filePath;
      applyWallpaper(filePath);
      saveThemeConfig();
      const preview = overlay.querySelector('#wallpaper-preview');
      preview.style.backgroundImage = `url('file:///${filePath.replace(/\\\\/g, '/')}')`;
      preview.textContent = '';
      showToast('🖼️ Arka plan ayarlandı', 'success');
    }
  });

  // Wallpaper remove
  overlay.querySelector('#wallpaper-remove').addEventListener('click', () => {
    themeConfig.wallpaper = null;
    applyWallpaper(null);
    saveThemeConfig();
    const preview = overlay.querySelector('#wallpaper-preview');
    preview.style.backgroundImage = '';
    preview.textContent = '📷 Görsel seçmek için tıklayın';
    showToast('🗑️ Arka plan kaldırıldı', 'success');
  });
}

function applyThemePreset(preset) {
  const [accent, bg] = preset.colors;
  const props = {
    '--accent': accent,
    '--accent-hover': accent + 'cc',
    '--accent-dim': accent,
    '--accent-glow': accent + '40',
    '--gradient-1': `linear-gradient(135deg, ${accent} 0%, ${bg} 100%)`,
    '--gradient-2': `linear-gradient(135deg, ${accent}aa 0%, ${accent} 100%)`
  };
  
  if (preset.id === 'default') {
    Object.keys(props).forEach(p => document.body.style.removeProperty(p));
  } else {
    Object.entries(props).forEach(([k, v]) => document.body.style.setProperty(k, v));
  }
}

function saveThemeConfig() {
  try { window.electronAPI.setThemes(themeConfig); } catch(e) {}
}

// ========== DEV TOOL 1: SİTENİN KODLARI ==========
async function downloadSourceCode() {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    showToast('⚠️ Önce bir siteye gir', 'warning');
    return;
  }

  showToast('📄 Kaynak kod indiriliyor...', 'info');

  try {
    const htmlContent = await webview.executeJavaScript('document.documentElement.outerHTML');

    // Get domain name for filename
    let siteName = 'site';
    try {
      const urlObj = new URL(tab.url);
      siteName = urlObj.hostname.replace(/^www\./, '').replace(/\./g, '-');
    } catch(e) {}

    const fileName = `${siteName}-kodlari.html`;

    const filePath = await window.electronAPI.saveSourceCode({ fileName, content: htmlContent });

    if (!filePath) {
      showToast('İndirme iptal edildi', 'warning');
      return;
    }

    // Add to downloads list
    downloads.unshift({
      name: fileName,
      status: '✅ İndirildi',
      path: filePath,
      time: new Date().toLocaleTimeString()
    });

    showToast(`✅ "${fileName}" indirildi!`, 'success');
  } catch(e) {
    showToast('❌ Kaynak kod alınamadı', 'error');
  }
}

// ========== DEV TOOL 2: KOD ENJEKTE EDİTÖR ==========
let cssEditorOverlay = null;
let codeEditorState = { mode: 'css', css: '', js: '', html: '' };
const NEWLINE = '\n';

const CODE_AUTOCOMPLETE = {
  css: [
    { trigger: 'bg', text: 'background: ', desc: 'Arkaplan' },
    { trigger: 'bgc', text: 'background-color: ', desc: 'Arkaplan rengi' },
    { trigger: 'bgi', text: 'background-image: url()', desc: 'Arkaplan resmi' },
    { trigger: 'c', text: 'color: ', desc: 'Yazı rengi' },
    { trigger: 'fs', text: 'font-size: ', desc: 'Yazı boyutu' },
    { trigger: 'fw', text: 'font-weight: ', desc: 'Yazı kalınlığı' },
    { trigger: 'ff', text: 'font-family: ', desc: 'Yazı tipi' },
    { trigger: 'w', text: 'width: ', desc: 'Genişlik' },
    { trigger: 'h', text: 'height: ', desc: 'Yükseklik' },
    { trigger: 'mw', text: 'max-width: ', desc: 'Max genişlik' },
    { trigger: 'mh', text: 'max-height: ', desc: 'Max yükseklik' },
    { trigger: 'm', text: 'margin: ', desc: 'Dış boşluk' },
    { trigger: 'mt', text: 'margin-top: ', desc: 'Üst boşluk' },
    { trigger: 'mb', text: 'margin-bottom: ', desc: 'Alt boşluk' },
    { trigger: 'ml', text: 'margin-left: ', desc: 'Sol boşluk' },
    { trigger: 'mr', text: 'margin-right: ', desc: 'Sağ boşluk' },
    { trigger: 'p', text: 'padding: ', desc: 'İç boşluk' },
    { trigger: 'pt', text: 'padding-top: ', desc: 'Üst iç boşluk' },
    { trigger: 'pb', text: 'padding-bottom: ', desc: 'Alt iç boşluk' },
    { trigger: 'pl', text: 'padding-left: ', desc: 'Sol iç boşluk' },
    { trigger: 'pr', text: 'padding-right: ', desc: 'Sağ iç boşluk' },
    { trigger: 'br', text: 'border-radius: ', desc: 'Köşe yuvarlama' },
    { trigger: 'b', text: 'border: ', desc: 'Kenarlık' },
    { trigger: 'bs', text: 'box-shadow: ', desc: 'Kutu gölge' },
    { trigger: 'ts', text: 'text-shadow: ', desc: 'Yazı gölge' },
    { trigger: 'ta', text: 'text-align: ', desc: 'Yazı hizalama' },
    { trigger: 'td', text: 'text-decoration: ', desc: 'Yazı süsleme' },
    { trigger: 'tt', text: 'text-transform: ', desc: 'Yazı dönüşümü' },
    { trigger: 'o', text: 'opacity: ', desc: 'Opaklık' },
    { trigger: 'ov', text: 'overflow: ', desc: 'Taşma' },
    { trigger: 'z', text: 'z-index: ', desc: 'Z sırası' },
    { trigger: 'pos', text: 'position: ', desc: 'Konum' },
    { trigger: 'dis', text: 'display: ', desc: 'Görüntüleme' },
    { trigger: 'dflex', text: 'display: flex;', desc: 'Flex layout' },
    { trigger: 'dgrid', text: 'display: grid;', desc: 'Grid layout' },
    { trigger: 'dnone', text: 'display: none;', desc: 'Gizle' },
    { trigger: 'dblock', text: 'display: block;', desc: 'Block' },
    { trigger: 'jc', text: 'justify-content: ', desc: 'Yatay hizalama' },
    { trigger: 'ai', text: 'align-items: ', desc: 'Dikey hizalama' },
    { trigger: 'fd', text: 'flex-direction: ', desc: 'Flex yönü' },
    { trigger: 'fw', text: 'flex-wrap: ', desc: 'Flex sarma' },
    { trigger: 'gap', text: 'gap: ', desc: 'Aralık' },
    { trigger: 'gtc', text: 'grid-template-columns: ', desc: 'Sütun şablonu' },
    { trigger: 'gtr', text: 'grid-template-rows: ', desc: 'Satır şablonu' },
    { trigger: 'trans', text: 'transition: all 0.3s ease;', desc: 'Geçiş efekti' },
    { trigger: 'anim', text: 'animation: ', desc: 'Animasyon' },
    { trigger: 'tf', text: 'transform: ', desc: 'Dönüşüm' },
    { trigger: 'cur', text: 'cursor: pointer;', desc: 'İmleç pointer' },
    { trigger: 'ls', text: 'letter-spacing: ', desc: 'Harf aralığı' },
    { trigger: 'lh', text: 'line-height: ', desc: 'Satır yüksekliği' },
    { trigger: 'vis', text: 'visibility: ', desc: 'Görünürlük' },
    { trigger: 'bgsz', text: 'background-size: cover;', desc: 'BG kapla' },
    { trigger: 'center', text: 'display: flex; align-items: center; justify-content: center;', desc: 'Ortala (Flex)' },
    { trigger: 'abs-center', text: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);', desc: 'Ortala (Absolute)' },
    { trigger: 'hide-scroll', text: 'scrollbar-width: none; -ms-overflow-style: none;', desc: 'Scrollbar gizle' },
  ],
  js: [
    { trigger: 'qs', text: "document.querySelector('')", desc: 'querySelector' },
    { trigger: 'qsa', text: "document.querySelectorAll('')", desc: 'querySelectorAll' },
    { trigger: 'gid', text: "document.getElementById('')", desc: 'getElementById' },
    { trigger: 'gcn', text: "document.getElementsByClassName('')", desc: 'getElementsByClassName' },
    { trigger: 'cel', text: "document.createElement('')", desc: 'createElement' },
    { trigger: 'ael', text: ".addEventListener('click', () => {\n  \n})", desc: 'addEventListener' },
    { trigger: 'log', text: "console.log()", desc: 'console.log' },
    { trigger: 'warn', text: "console.warn()", desc: 'console.warn' },
    { trigger: 'err', text: "console.error()", desc: 'console.error' },
    { trigger: 'al', text: "alert('')", desc: 'alert' },
    { trigger: 'fn', text: "function name() {\n  \n}", desc: 'Fonksiyon' },
    { trigger: 'afn', text: "const name = () => {\n  \n}", desc: 'Arrow fonksiyon' },
    { trigger: 'if', text: "if (condition) {\n  \n}", desc: 'if bloğu' },
    { trigger: 'ife', text: "if (condition) {\n  \n} else {\n  \n}", desc: 'if-else' },
    { trigger: 'for', text: "for (let i = 0; i < length; i++) {\n  \n}", desc: 'for döngüsü' },
    { trigger: 'fore', text: ".forEach((item) => {\n  \n})", desc: 'forEach' },
    { trigger: 'map', text: ".map((item) => {\n  \n})", desc: 'map' },
    { trigger: 'filter', text: ".filter((item) => {\n  \n})", desc: 'filter' },
    { trigger: 'fetch', text: "fetch('url')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));", desc: 'Fetch API' },
    { trigger: 'timeout', text: "setTimeout(() => {\n  \n}, 1000);", desc: 'setTimeout' },
    { trigger: 'interval', text: "setInterval(() => {\n  \n}, 1000);", desc: 'setInterval' },
    { trigger: 'class', text: "class ClassName {\n  constructor() {\n    \n  }\n}", desc: 'Sınıf' },
    { trigger: 'try', text: "try {\n  \n} catch (error) {\n  console.error(error);\n}", desc: 'try-catch' },
    { trigger: 'async', text: "async function name() {\n  const result = await fetch('url');\n}", desc: 'async fonksiyon' },
    { trigger: 'promise', text: "new Promise((resolve, reject) => {\n  \n})", desc: 'Promise' },
    { trigger: 'stor', text: "localStorage.setItem('key', JSON.stringify(value))", desc: 'localStorage set' },
    { trigger: 'storget', text: "JSON.parse(localStorage.getItem('key'))", desc: 'localStorage get' },
    { trigger: 'inner', text: ".innerHTML = ''", desc: 'innerHTML' },
    { trigger: 'txt', text: ".textContent = ''", desc: 'textContent' },
    { trigger: 'style', text: ".style.property = 'value'", desc: 'style değiştir' },
    { trigger: 'cls', text: ".classList.add('')", desc: 'class ekle' },
    { trigger: 'clsr', text: ".classList.remove('')", desc: 'class kaldır' },
    { trigger: 'clst', text: ".classList.toggle('')", desc: 'class toggle' },
    { trigger: 'attr', text: ".setAttribute('key', 'value')", desc: 'Attribute set' },
    { trigger: 'remove', text: ".remove()", desc: 'Element kaldır' },
    { trigger: 'append', text: ".appendChild(element)", desc: 'appendChild' },
    { trigger: 'dom', text: "document.addEventListener('DOMContentLoaded', () => {\n  \n});", desc: 'DOMContentLoaded' },
  ],
  html: [
    { trigger: 'div', text: "<div></div>", desc: 'div' },
    { trigger: 'p', text: "<p></p>", desc: 'Paragraf' },
    { trigger: 'h1', text: "<h1></h1>", desc: 'Başlık 1' },
    { trigger: 'h2', text: "<h2></h2>", desc: 'Başlık 2' },
    { trigger: 'h3', text: "<h3></h3>", desc: 'Başlık 3' },
    { trigger: 'span', text: "<span></span>", desc: 'span' },
    { trigger: 'a', text: "<a href=''>Link</a>", desc: 'Link' },
    { trigger: 'img', text: "<img src='' alt='' />", desc: 'Resim' },
    { trigger: 'btn', text: "<button>Buton</button>", desc: 'Buton' },
    { trigger: 'input', text: "<input type='text' placeholder='' />", desc: 'Input' },
    { trigger: 'form', text: "<form>\n  \n</form>", desc: 'Form' },
    { trigger: 'ul', text: "<ul>\n  <li></li>\n</ul>", desc: 'Liste' },
    { trigger: 'ol', text: "<ol>\n  <li></li>\n</ol>", desc: 'Sıralı liste' },
    { trigger: 'table', text: "<table>\n  <tr><th>Başlık</th></tr>\n  <tr><td>Veri</td></tr>\n</table>", desc: 'Tablo' },
    { trigger: 'section', text: "<section>\n  \n</section>", desc: 'Section' },
    { trigger: 'nav', text: "<nav>\n  \n</nav>", desc: 'Navigation' },
    { trigger: 'header', text: "<header>\n  \n</header>", desc: 'Header' },
    { trigger: 'footer', text: "<footer>\n  \n</footer>", desc: 'Footer' },
    { trigger: 'main', text: "<main>\n  \n</main>", desc: 'Main' },
    { trigger: 'article', text: "<article>\n  \n</article>", desc: 'Article' },
    { trigger: 'video', text: "<video src='' controls></video>", desc: 'Video' },
    { trigger: 'audio', text: "<audio src='' controls></audio>", desc: 'Ses' },
    { trigger: 'canvas', text: "<canvas id='' width='' height=''></canvas>", desc: 'Canvas' },
    { trigger: 'iframe', text: "<iframe src='' frameborder='0'></iframe>", desc: 'iframe' },
    { trigger: 'select', text: "<select>\n  <option value=''>Seçin</option>\n</select>", desc: 'Select' },
    { trigger: 'textarea', text: "<textarea rows='4' cols='50'></textarea>", desc: 'Textarea' },
    { trigger: 'style', text: "<style>\n  \n</style>", desc: 'Style bloğu' },
    { trigger: 'script', text: "<script>\n  \n</script>", desc: 'Script bloğu' },
    { trigger: 'card', text: "<div style='background:#1a1a2e; border-radius:12px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,.3); color:#fff; max-width:400px;'>\n  <h2>Başlık</h2>\n  <p>İçerik buraya</p>\n  <button style='background:#e94560; border:none; color:#fff; padding:10px 24px; border-radius:8px; cursor:pointer;'>Buton</button>\n</div>", desc: 'Hazır kart' },
    { trigger: 'alert-box', text: "<div style='background:#fef3cd; border:1px solid #ffc107; border-radius:8px; padding:16px; color:#856404;'>\n  ⚠️ Uyarı mesajı buraya\n</div>", desc: 'Uyarı kutusu' },
    { trigger: 'hero', text: "<div style='text-align:center; padding:80px 20px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff;'>\n  <h1 style='font-size:48px; margin-bottom:16px;'>Başlık</h1>\n  <p style='font-size:20px; opacity:.8;'>Alt başlık</p>\n  <button style='margin-top:24px; padding:14px 32px; background:#fff; color:#764ba2; border:none; border-radius:30px; font-size:16px; cursor:pointer;'>Başla</button>\n</div>", desc: 'Hero section' },
  ]
};

function toggleCssEditor() {
  if (cssEditorOverlay) {
    closeCssEditor();
    return;
  }

  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    showToast('⚠️ Önce bir siteye gir', 'warning');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'css-editor-overlay';
  overlay.innerHTML = `
    <div class="css-editor-header">
      <div class="code-editor-tabs">
        <button class="code-tab active" data-mode="css">CSS</button>
        <button class="code-tab" data-mode="js">JavaScript</button>
        <button class="code-tab" data-mode="html">HTML</button>
      </div>
      <div class="css-editor-actions">
        <button class="css-editor-btn" id="code-run-btn" title="Çalıştır">▶ Çalıştır</button>
        <button class="css-editor-btn" id="css-copy-btn" title="Kopyala">📋</button>
        <button class="css-editor-btn" id="css-reset-btn" title="Sıfırla">↩️</button>
        <button class="css-editor-btn close" id="css-close-btn" title="Kapat">✕</button>
      </div>
    </div>
    <div class="code-editor-area">
      <div class="code-line-numbers" id="code-line-numbers">1</div>
      <textarea class="css-editor-textarea" id="css-editor-input" placeholder="Kod yazın, Tab ile otomatik tamamlayın..." spellcheck="false"></textarea>
      <div class="code-autocomplete hidden" id="code-autocomplete"></div>
    </div>
    <div class="css-editor-status">
      <span class="code-mode-badge" id="code-mode-badge">CSS</span>
      <span id="css-editor-status-text">Hazır — Kod yazın, ▶ ile çalıştırın</span>
      <span class="code-line-info" id="code-line-info">Satır 1, Sütun 1</span>
    </div>
  `;

  document.body.appendChild(overlay);
  cssEditorOverlay = overlay;

  const input = overlay.querySelector('#css-editor-input');
  const statusText = overlay.querySelector('#css-editor-status-text');
  const lineNumbers = overlay.querySelector('#code-line-numbers');
  const autocompleteEl = overlay.querySelector('#code-autocomplete');
  const modeBadge = overlay.querySelector('#code-mode-badge');
  const lineInfo = overlay.querySelector('#code-line-info');
  const tabs = overlay.querySelectorAll('.code-tab');
  let currentMode = 'css';
  codeEditorState.mode = 'css';
  let autocompleteVisible = false;
  let autocompleteItems = [];
  let selectedAutocomplete = 0;

  // Restore previous content
  input.value = codeEditorState[currentMode] || '';
  updateLineNumbers();

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeEditorState[currentMode] = input.value;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      codeEditorState.mode = currentMode;
      input.value = codeEditorState[currentMode] || '';
      modeBadge.textContent = currentMode.toUpperCase();
      modeBadge.className = 'code-mode-badge mode-' + currentMode;
      statusText.textContent = 'Hazır — Kod yazın, ▶ ile çalıştırın';
      updateLineNumbers();
      input.focus();
    });
  });

  function updateLineNumbers() {
    const lines = (input.value || '').split(NEWLINE).length;
    lineNumbers.innerHTML = Array.from({length: Math.max(lines, 1)}, (_, i) => i + 1).join('<br>');
  }

  function updateLineInfo() {
    const val = input.value.substring(0, input.selectionStart);
    const line = val.split(NEWLINE).length;
    const col = val.split(NEWLINE).pop().length + 1;
    lineInfo.textContent = 'Satır ' + line + ', Sütun ' + col;
  }

  // Autocomplete logic
  function getCurrentWord() {
    const pos = input.selectionStart;
    const text = input.value.substring(0, pos);
    const match = text.match(/[a-zA-Z0-9_-]+$/);
    return match ? match[0] : '';
  }

  function showAutocomplete(word) {
    const suggestions = CODE_AUTOCOMPLETE[currentMode] || [];
    autocompleteItems = suggestions.filter(s => 
      s.trigger.toLowerCase().startsWith(word.toLowerCase()) && s.trigger.toLowerCase() !== word.toLowerCase()
    ).slice(0, 8);

    if (autocompleteItems.length === 0 || word.length < 1) {
      hideAutocomplete();
      return;
    }

    selectedAutocomplete = 0;
    autocompleteEl.innerHTML = autocompleteItems.map((item, i) => 
      '<div class="autocomplete-item' + (i === 0 ? ' selected' : '') + '" data-index="' + i + '">' +
        '<span class="ac-trigger">' + item.trigger + '</span>' +
        '<span class="ac-desc">' + item.desc + '</span>' +
      '</div>'
    ).join('');
    
    autocompleteEl.classList.remove('hidden');
    autocompleteVisible = true;

    // Position near cursor
    const pos = input.selectionStart;
    const textBefore = input.value.substring(0, pos);
    const lines = textBefore.split(NEWLINE);
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length;
    const lineH = 21;
    const charW = 7.8;
    autocompleteEl.style.top = Math.min(lineNum * lineH, input.clientHeight - 200) + 'px';
    autocompleteEl.style.left = Math.min(colNum * charW + 50, input.clientWidth - 200) + 'px';

    autocompleteEl.querySelectorAll('.autocomplete-item').forEach(el => {
      el.addEventListener('click', () => {
        applyAutocomplete(parseInt(el.dataset.index));
      });
    });
  }

  function hideAutocomplete() {
    autocompleteEl.classList.add('hidden');
    autocompleteVisible = false;
  }

  function applyAutocomplete(index) {
    const item = autocompleteItems[index];
    if (!item) return;
    const word = getCurrentWord();
    const pos = input.selectionStart;
    const before = input.value.substring(0, pos - word.length);
    const after = input.value.substring(pos);
    input.value = before + item.text + after;
    const newPos = before.length + item.text.length;
    input.selectionStart = input.selectionEnd = newPos;
    codeEditorState[currentMode] = input.value;
    hideAutocomplete();
    updateLineNumbers();
    input.focus();
  }

  input.addEventListener('input', () => {
    codeEditorState[currentMode] = input.value;
    updateLineNumbers();
    updateLineInfo();
    const word = getCurrentWord();
    if (word.length >= 1) {
      showAutocomplete(word);
    } else {
      hideAutocomplete();
    }
  });

  input.addEventListener('click', () => {
    updateLineInfo();
    hideAutocomplete();
  });

  input.addEventListener('scroll', () => {
    lineNumbers.scrollTop = input.scrollTop;
  });

  input.addEventListener('keydown', (e) => {
    updateLineInfo();

    if (autocompleteVisible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedAutocomplete = Math.min(selectedAutocomplete + 1, autocompleteItems.length - 1);
        autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el, i) => {
          el.classList.toggle('selected', i === selectedAutocomplete);
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedAutocomplete = Math.max(selectedAutocomplete - 1, 0);
        autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el, i) => {
          el.classList.toggle('selected', i === selectedAutocomplete);
        });
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (autocompleteItems.length > 0) {
          e.preventDefault();
          applyAutocomplete(selectedAutocomplete);
          return;
        }
      }
      if (e.key === 'Escape') {
        hideAutocomplete();
        return;
      }
    }

    // Tab for indentation
    if (e.key === 'Tab' && !autocompleteVisible) {
      e.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.substring(0, start) + '  ' + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + 2;
      codeEditorState[currentMode] = input.value;
      updateLineNumbers();
    }
  });

  // Run button
  overlay.querySelector('#code-run-btn').addEventListener('click', async () => {
    await runInjectedCode(webview, statusText);
  });

  // Copy
  overlay.querySelector('#css-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(input.value);
    showToast('📋 Kod kopyalandı', 'success');
  });

  // Reset
  overlay.querySelector('#css-reset-btn').addEventListener('click', async () => {
    input.value = '';
    codeEditorState[currentMode] = '';
    try {
      const wcId = webview.getWebContentsId();
      if (wcId) {
        // Remove injected CSS via main process
        await window.electronAPI.removeInjectedCSS({ webContentsId: wcId });
        // Remove HTML/JS injected elements
        await window.electronAPI.injectJS({ webContentsId: wcId, code: `
          (function() {
            var el = document.getElementById('barly-live-html');
            if (el) el.remove();
            var ind = document.getElementById('barly-inject-indicator');
            if (ind) ind.remove();
          })();
        `});
      }
    } catch(e) {}
    statusText.textContent = 'Temizlendi — Kod yazın, ▶ ile çalıştırın';
    updateLineNumbers();
    showToast('↩️ Tüm enjekte kodlar sıfırlandı', 'success');
  });

  // Close
  overlay.querySelector('#css-close-btn').addEventListener('click', closeCssEditor);

  setTimeout(() => input.focus(), 50);
}

async function runInjectedCode(webview, statusText) {
  const mode = codeEditorState.mode || 'css';
  const code = codeEditorState[mode] || '';
  
  if (!code.trim()) {
    statusText.textContent = '⚠️ Kod alanı boş';
    return;
  }

  // Get webContents ID from webview
  let wcId;
  try {
    wcId = webview.getWebContentsId();
  } catch(e) {
    wcId = null;
  }
  
  if (!wcId) {
    statusText.textContent = '❌ Sayfa henüz yüklenmedi — sayfanın tamamen açılmasını bekleyin';
    showToast('❌ Sayfa yüklenmedi', 'error');
    return;
  }

  const tab = getActiveTab();
  const siteName = tab ? (tab.url || '').replace(/^https?:\/\//, '').split('/')[0] : 'site';

  try {
    if (mode === 'css') {
      const result = await window.electronAPI.injectCSS({ webContentsId: wcId, css: code });
      if (!result.success) {
        statusText.textContent = '❌ CSS hatası: ' + result.error;
        showToast('❌ CSS uygulanamadı: ' + result.error, 'error');
        return;
      }
      const lines = code.split(NEWLINE).filter(l => l.trim()).length;
      statusText.textContent = '✅ CSS uygulandı (' + siteName + ') — ' + lines + ' satır';
      showToast('🎨 CSS enjekte edildi: ' + siteName, 'success');
    } else if (mode === 'js') {
      const result = await window.electronAPI.injectJS({ webContentsId: wcId, code });
      if (!result.success) {
        statusText.textContent = '❌ JS hatası: ' + result.error;
        showToast('❌ JS çalıştırılamadı: ' + result.error, 'error');
        return;
      }
      statusText.textContent = '✅ JS çalıştırıldı (' + siteName + ')';
      showToast('⚡ JavaScript çalıştırıldı: ' + siteName, 'success');
    } else if (mode === 'html') {
      const wrappedCode = `
        (function() {
          var el = document.getElementById('barly-live-html');
          if (!el) {
            el = document.createElement('div');
            el.id = 'barly-live-html';
            el.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;';
            document.body.appendChild(el);
          }
          el.innerHTML = decodeURIComponent("${encodeURIComponent(code)}");
          el.querySelectorAll('script').forEach(function(s) {
            var ns = document.createElement('script');
            ns.textContent = s.textContent;
            document.body.appendChild(ns);
          });
          return 'ok';
        })();
      `;
      const result = await window.electronAPI.injectJS({ webContentsId: wcId, code: wrappedCode });
      if (!result.success) {
        statusText.textContent = '❌ HTML hatası: ' + result.error;
        showToast('❌ HTML enjekte edilemedi', 'error');
        return;
      }
      statusText.textContent = '✅ HTML enjekte edildi (' + siteName + ')';
      showToast('📄 HTML enjekte edildi: ' + siteName, 'success');
    }
  } catch(e) {
    statusText.textContent = '❌ Hata: ' + (e.message || 'Bilinmeyen hata');
    showToast('❌ ' + (e.message || 'Bilinmeyen hata'), 'error');
  }
}

function closeCssEditor() {
  if (cssEditorOverlay) {
    // Save current content
    const input = cssEditorOverlay.querySelector('#css-editor-input');
    const activeTab = cssEditorOverlay.querySelector('.code-tab.active');
    if (input && activeTab) {
      codeEditorState[activeTab.dataset.mode] = input.value;
    }
    cssEditorOverlay.remove();
    cssEditorOverlay = null;
  }
}

// ========== DEV TOOL 3: SAYFA PERFORMANS ANALİZİ ==========
async function analyzePagePerformance() {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    showToast('⚠️ Önce bir siteye gir', 'warning');
    return;
  }

  showToast('🔍 Performans analiz ediliyor...', 'info');

  try {
    const data = await webview.executeJavaScript(`
      (function() {
        const perf = performance.getEntriesByType('navigation')[0] || {};
        const resources = performance.getEntriesByType('resource') || [];

        const scripts = resources.filter(r => r.initiatorType === 'script');
        const styles = resources.filter(r => r.initiatorType === 'css' || r.name.endsWith('.css'));
        const images = resources.filter(r => r.initiatorType === 'img' || r.name.match(/\\.(png|jpg|jpeg|gif|svg|webp|ico)/i));
        const fonts = resources.filter(r => r.initiatorType === 'font' || r.name.match(/\\.(woff|woff2|ttf|otf|eot)/i));

        const allElements = document.querySelectorAll('*');
        const usedFonts = new Set();
        try {
          const computed = getComputedStyle(document.body);
          usedFonts.add(computed.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
        } catch(e) {}

        const totalResourceSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

        return {
          url: location.href,
          title: document.title,
          domElements: allElements.length,
          domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.startTime) || 0,
          loadTime: Math.round(perf.loadEventEnd - perf.startTime) || 0,
          ttfb: Math.round(perf.responseStart - perf.startTime) || 0,
          scriptCount: scripts.length,
          styleCount: styles.length,
          imageCount: images.length,
          fontCount: fonts.length,
          totalResources: resources.length,
          totalSize: totalResourceSize,
          usedFonts: Array.from(usedFonts),
          doctype: document.doctype ? document.doctype.name : 'yok',
          charset: document.characterSet,
          linkCount: document.querySelectorAll('a').length,
          formCount: document.querySelectorAll('form').length,
          iframeCount: document.querySelectorAll('iframe').length,
          metaCount: document.querySelectorAll('meta').length,
          hasServiceWorker: !!navigator.serviceWorker?.controller,
          isHttps: location.protocol === 'https:'
        };
      })();
    `);

    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Score calculation
    let score = 100;
    if (data.loadTime > 3000) score -= 20;
    else if (data.loadTime > 1500) score -= 10;
    if (data.domElements > 1500) score -= 15;
    else if (data.domElements > 800) score -= 5;
    if (data.scriptCount > 20) score -= 15;
    else if (data.scriptCount > 10) score -= 5;
    if (data.totalSize > 5242880) score -= 15;
    else if (data.totalSize > 2097152) score -= 5;
    if (!data.isHttps) score -= 10;
    if (data.iframeCount > 3) score -= 5;
    score = Math.max(0, Math.min(100, score));

    const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    const scoreLabel = score >= 80 ? 'İyi' : score >= 50 ? 'Orta' : 'Düşük';

    const content = `
      <div class="perf-score-section">
        <div class="perf-score-circle" style="--score-color: ${scoreColor}">
          <span class="perf-score-value">${score}</span>
          <span class="perf-score-label">${scoreLabel}</span>
        </div>
        <div class="perf-score-info">
          <div class="perf-score-title">${escapeHtml(data.title || 'Sayfa')}</div>
          <div class="perf-score-url">${escapeHtml(data.url).substring(0, 50)}</div>
        </div>
      </div>

      <div class="perf-grid">
        <div class="perf-card">
          <div class="perf-card-icon">⚡</div>
          <div class="perf-card-value">${data.loadTime}ms</div>
          <div class="perf-card-label">Yüklenme Süresi</div>
        </div>
        <div class="perf-card">
          <div class="perf-card-icon">🏁</div>
          <div class="perf-card-value">${data.ttfb}ms</div>
          <div class="perf-card-label">TTFB</div>
        </div>
        <div class="perf-card">
          <div class="perf-card-icon">📦</div>
          <div class="perf-card-value">${formatSize(data.totalSize)}</div>
          <div class="perf-card-label">Toplam Boyut</div>
        </div>
        <div class="perf-card">
          <div class="perf-card-icon">🧱</div>
          <div class="perf-card-value">${data.domElements}</div>
          <div class="perf-card-label">DOM Element</div>
        </div>
      </div>

      <div class="perf-details">
        <div class="perf-detail-title">📊 Kaynaklar</div>
        <div class="perf-detail-row">
          <span>📜 JavaScript Dosyaları</span>
          <span class="perf-detail-value">${data.scriptCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>🎨 CSS Dosyaları</span>
          <span class="perf-detail-value">${data.styleCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>🖼️ Görseller</span>
          <span class="perf-detail-value">${data.imageCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>🔤 Fontlar</span>
          <span class="perf-detail-value">${data.fontCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>📦 Toplam Kaynak</span>
          <span class="perf-detail-value">${data.totalResources}</span>
        </div>
      </div>

      <div class="perf-details">
        <div class="perf-detail-title">🔧 Sayfa Bilgisi</div>
        <div class="perf-detail-row">
          <span>🔗 Bağlantılar</span>
          <span class="perf-detail-value">${data.linkCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>📝 Formlar</span>
          <span class="perf-detail-value">${data.formCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>🖼️ iframe</span>
          <span class="perf-detail-value">${data.iframeCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>📄 Meta Etiketler</span>
          <span class="perf-detail-value">${data.metaCount}</span>
        </div>
        <div class="perf-detail-row">
          <span>🔒 HTTPS</span>
          <span class="perf-detail-value">${data.isHttps ? '✅ Evet' : '❌ Hayır'}</span>
        </div>
        <div class="perf-detail-row">
          <span>⚙️ Service Worker</span>
          <span class="perf-detail-value">${data.hasServiceWorker ? '✅ Aktif' : '❌ Yok'}</span>
        </div>
        <div class="perf-detail-row">
          <span>🔤 Karakter Seti</span>
          <span class="perf-detail-value">${data.charset}</span>
        </div>
        <div class="perf-detail-row">
          <span>🔠 Ana Font</span>
          <span class="perf-detail-value">${data.usedFonts[0] || 'Bilinmiyor'}</span>
        </div>
      </div>
    `;

    showPanel('🔍 Performans Analizi', content);
  } catch(e) {
    showToast('❌ Performans analizi yapılamadı', 'error');
  }
}

// ========== QUICK SEARCH PALETTE (Ctrl+.) ==========
let quickSearchOverlay = null;

function showQuickSearchPalette() {
  if (quickSearchOverlay) {
    hideQuickSearch();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'quick-search-overlay';
  overlay.innerHTML = `
    <div class="quick-search-palette">
      <div class="quick-search-header">
        <span class="quick-search-icon">🔍</span>
        <input type="text" class="quick-search-input" placeholder="Sekme ara, URL gir veya komut yaz..." autofocus>
        <span class="quick-search-shortcut">Ctrl+.</span>
      </div>
      <div class="quick-search-results" id="quick-search-results"></div>
      <div class="quick-search-footer">
        <span>↑↓ Gezin</span>
        <span>↵ Aç</span>
        <span>Esc Kapat</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  quickSearchOverlay = overlay;

  const input = overlay.querySelector('.quick-search-input');
  const resultsDiv = overlay.querySelector('#quick-search-results');
  let selectedIndex = -1;

  // Show initial results (open tabs + clipboard)
  renderQuickResults('', resultsDiv);

  input.addEventListener('input', () => {
    selectedIndex = -1;
    renderQuickResults(input.value, resultsDiv);
  });

  input.addEventListener('keydown', (e) => {
    const items = resultsDiv.querySelectorAll('.quick-search-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateQuickSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateQuickSelection(items, selectedIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      } else if (input.value.trim()) {
        const q = input.value.trim();
        if (q.match(/^https?:\/\//) || q.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
          const url = q.startsWith('http') ? q : 'https://' + q;
          createTab(url);
        } else {
          createTab(SEARCH_ENGINE + encodeURIComponent(q));
        }
        hideQuickSearch();
      }
    } else if (e.key === 'Escape') {
      hideQuickSearch();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideQuickSearch();
  });

  setTimeout(() => input.focus(), 50);
}

async function renderQuickResults(query, container) {
  const results = [];
  const q = query.toLowerCase().trim();

  // Open tabs
  tabs.forEach(tab => {
    if (!tab.isStartPage && tab.url) {
      const title = tab.element?.querySelector('.tab-title')?.textContent || tab.url;
      if (!q || title.toLowerCase().includes(q) || tab.url.toLowerCase().includes(q)) {
        results.push({
          type: 'tab',
          icon: tab.isIncognito ? '🕵️' : '🔖',
          title: title,
          subtitle: tab.url,
          action: () => { switchTab(tab.id); hideQuickSearch(); }
        });
      }
    }
  });

  // Clipboard paste
  try {
    const clipText = await navigator.clipboard.readText();
    if (clipText && (clipText.startsWith('http://') || clipText.startsWith('https://') || clipText.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/))) {
      results.push({
        type: 'clipboard',
        icon: '📋',
        title: 'Panodan ziyaret et',
        subtitle: clipText.substring(0, 60) + (clipText.length > 60 ? '...' : ''),
        action: () => { const url = clipText.startsWith('http') ? clipText : 'https://' + clipText; createTab(url); hideQuickSearch(); }
      });
    }
  } catch(e) {}

  // Search in history
  if (q.length >= 2) {
    try {
      const history = await window.electronAPI.getHistory();
      const histMatches = history.filter(h => h.title?.toLowerCase().includes(q) || h.url?.toLowerCase().includes(q)).slice(0, 5);
      histMatches.forEach(h => {
        if (!results.find(r => r.subtitle === h.url)) {
          results.push({
            type: 'history',
            icon: '🕐',
            title: h.title || h.url,
            subtitle: h.url,
            action: () => { createTab(h.url); hideQuickSearch(); }
          });
        }
      });
    } catch(e) {}

    // Search bookmarks
    try {
      const bookmarks = await window.electronAPI.getBookmarks();
      const bmMatches = bookmarks.filter(b => b.title?.toLowerCase().includes(q) || b.url?.toLowerCase().includes(q)).slice(0, 3);
      bmMatches.forEach(b => {
        if (!results.find(r => r.subtitle === b.url)) {
          results.push({
            type: 'bookmark',
            icon: '⭐',
            title: b.title || b.url,
            subtitle: b.url,
            action: () => { createTab(b.url); hideQuickSearch(); }
          });
        }
      });
    } catch(e) {}
  }

  // Google search option
  if (q) {
    results.push({
      type: 'search',
      icon: '🔎',
      title: `"${query}" için ara`,
      subtitle: 'Google ile ara',
      action: () => { createTab(SEARCH_ENGINE + encodeURIComponent(query)); hideQuickSearch(); }
    });
  }

  // Render
  if (results.length === 0) {
    container.innerHTML = '<div class="quick-search-empty">Sonuç bulunamadı</div>';
  } else {
    container.innerHTML = results.slice(0, 12).map((r, i) => `
      <div class="quick-search-item" data-index="${i}">
        <span class="quick-search-item-icon">${r.icon}</span>
        <div class="quick-search-item-info">
          <div class="quick-search-item-title">${escapeHtml(r.title)}</div>
          <div class="quick-search-item-url">${escapeHtml(r.subtitle)}</div>
        </div>
        <span class="quick-search-item-badge">${r.type === 'tab' ? 'Sekme' : r.type === 'history' ? 'Geçmiş' : r.type === 'bookmark' ? 'Yer İmi' : r.type === 'clipboard' ? 'Pano' : 'Ara'}</span>
      </div>
    `).join('');

    container.querySelectorAll('.quick-search-item').forEach((item, i) => {
      item.addEventListener('click', () => results[i].action());
    });
  }
}

function updateQuickSelection(items, index) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === index);
    if (i === index) item.scrollIntoView({ block: 'nearest' });
  });
}

function hideQuickSearch() {
  if (quickSearchOverlay) {
    quickSearchOverlay.remove();
    quickSearchOverlay = null;
  }
}

// ========== SPEED DIAL ==========
async function loadSpeedDial() {
  if (!speedDialGrid) return;
  try {
    const items = await window.electronAPI.getSpeedDial();
    speedDialGrid.innerHTML = '';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'speed-dial-item';
      div.innerHTML = `
        <div class="speed-dial-icon">${item.icon || '🌐'}</div>
        <div class="speed-dial-name">${escapeHtml(item.name)}</div>
        <button class="speed-dial-remove" data-id="${item.id}">✕</button>
      `;

      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('speed-dial-remove')) navigate(item.url);
      });

      div.querySelector('.speed-dial-remove').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.electronAPI.removeSpeedDial(item.id);
        loadSpeedDial();
      });

      speedDialGrid.appendChild(div);
    });
  } catch(e) {}
}

function showAddSpeedDialModal() {
  const emojis = ['🔍','📧','📺','🎮','🛒','📰','💬','🎵','📚','💻','🏠','✈️','⚽','🎬','📷','🔧','💡','🌍','🎯','❤️','🚀','☕','🐱','🧪'];

  showModal('Kısayol Ekle', `
    <div class="form-group">
      <label class="form-label">İsim</label>
      <input type="text" class="form-input" id="sd-name" placeholder="Google">
    </div>
    <div class="form-group">
      <label class="form-label">URL</label>
      <input type="text" class="form-input" id="sd-url" placeholder="https://google.com">
    </div>
    <div class="form-group">
      <label class="form-label">İkon Seç</label>
      <div class="icon-picker-grid" id="sd-icon-picker">
        ${emojis.map(e => `<div class="icon-picker-item" data-icon="${e}">${e}</div>`).join('')}
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" onclick="hideModal()">İptal</button>
    <button class="btn btn-primary" id="save-sd-btn">Ekle</button>
  `);

  let selectedIcon = '🌐';
  setTimeout(() => {
    $$('#sd-icon-picker .icon-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('#sd-icon-picker .icon-picker-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedIcon = item.dataset.icon;
      });
    });

    $('save-sd-btn')?.addEventListener('click', async () => {
      const name = $('sd-name')?.value;
      const url = $('sd-url')?.value;

      if (name && url) {
        await window.electronAPI.addSpeedDial({ name, url, icon: selectedIcon });
        hideModal();
        loadSpeedDial();
        showToast('Kısayol eklendi', 'success');
      }
    });
  }, 50);
}

// ========== FIND IN PAGE ==========
function showFindBar() {
  if (findBar) findBar.classList.remove('hidden');
  if (findInput) { findInput.focus(); findInput.select(); }
}

function hideFindBar() {
  if (findBar) findBar.classList.add('hidden');
  if (findInput) findInput.value = '';
  const webview = getActiveWebview();
  if (webview) { try { webview.stopFindInPage('clearSelection'); } catch(e) {} }
}

function findInPage(direction = 'forward') {
  const webview = getActiveWebview();
  if (!webview || !findInput) return;

  const text = findInput.value;
  if (!text) { if (findCount) findCount.textContent = '0/0'; return; }

  try {
    webview.findInPage(text, { forward: direction === 'forward', findNext: text === currentFindText });
  } catch(e) {}
  currentFindText = text;
}

// ========== SCREENSHOT ==========
async function takeScreenshot() {
  const tab = getActiveTab();

  if (!tab) { showToast('Aktif sekme yok', 'error'); return; }
  if (tab.isStartPage) { showToast('Ana sayfada ekran görüntüsü alınamaz', 'warning'); return; }

  const webview = tab.webview;
  if (!webview || !webview.getURL) { showToast('Sayfa yüklenmedi', 'error'); return; }

  try {
    showToast('📸 Ekran görüntüsü alınıyor...', 'info');

    const url = webview.getURL();
    if (!url || url === '' || url === 'about:blank') { showToast('Sayfa henüz yüklenmedi', 'warning'); return; }

    const image = await webview.capturePage();
    if (!image) { showToast('Görüntü alınamadı', 'error'); return; }

    const dataUrl = image.toDataURL();
    if (!dataUrl || dataUrl === 'data:,') { showToast('Görüntü boş', 'error'); return; }

    showModal('📸 Ekran Görüntüsü', `
      <img src="${dataUrl}" style="width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
    `, `
      <button class="btn btn-secondary" id="ss-copy">📋 Kopyala</button>
      <button class="btn btn-primary" id="ss-save">💾 Kaydet</button>
    `);

    setTimeout(() => {
      $('ss-copy')?.addEventListener('click', async () => {
        try { await window.electronAPI.copyScreenshot(dataUrl); } catch(e) {}
        showToast('Kopyalandı', 'success');
        hideModal();
      });

      $('ss-save')?.addEventListener('click', async () => {
        try {
          const path = await window.electronAPI.saveScreenshot(dataUrl);
          if (path) showToast('Kaydedildi: ' + path, 'success');
        } catch(e) { showToast('Kaydetme hatası', 'error'); }
        hideModal();
      });
    }, 50);
  } catch (e) {
    console.error('Screenshot error:', e);
    showToast('Ekran görüntüsü alınamadı', 'error');
  }
}

// ========== QR CODE ==========
async function showQRCode() {
  const tab = getActiveTab();
  if (!tab || tab.isStartPage) return;

  try {
    const qrUrl = await window.electronAPI.generateQR(tab.url);
    const domain = getDomain(tab.url);

    showModal('📱 QR Kod', `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0;">
        <div id="qr-img-wrap" style="background:#fff;border-radius:16px;padding:20px;display:inline-flex;">
          <img id="qr-modal-img" src="${qrUrl}" style="width:200px;height:200px;display:block;">
        </div>
        <div style="text-align:center;">
          <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px;">${escapeHtml(tab.title || domain)}</div>
          <div style="font-size:11px;color:var(--text-dim);word-break:break-all;max-width:320px;">${escapeHtml(tab.url)}</div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);">Bu QR kodu telefonunuzla tarayarak sayfayı açabilirsiniz</div>
      </div>
    `, `
      <button class="btn btn-secondary" id="qr-download-btn">⬇️ İndir</button>
      <button class="btn btn-primary" onclick="hideModal()">Tamam</button>
    `);

    setTimeout(() => {
      document.getElementById('qr-download-btn')?.addEventListener('click', () => {
        const img = document.getElementById('qr-modal-img');
        if (!img) return;
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `qr-${domain || 'code'}.png`;
        a.click();
        showToast('QR kod indirildi', 'success');
      });
    }, 50);
  } catch(e) { showToast('QR kod oluşturulamadı', 'error'); }
}

// ========== ARCHIVE PAGE ==========
async function archivePage() {
  const tab = getActiveTab();
  if (!tab || tab.isStartPage) return;

  try {
    const archiveUrl = await window.electronAPI.archivePage(tab.url);
    window.electronAPI.openExternal(archiveUrl);
    showToast('Arşivleme başlatıldı', 'success');
  } catch(e) {}
}

// ========== SHARE ==========
function showShareMenu(x, y) {
  if (!shareMenu) return;
  shareMenu.style.left = x + 'px';
  shareMenu.style.top = y + 'px';
  shareMenu.classList.remove('hidden');
}

function shareToSocial(platform) {
  const tab = getActiveTab();
  if (!tab) return;

  const url = encodeURIComponent(tab.url);
  const title = encodeURIComponent(tab.title);

  const urls = {
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    email: `mailto:?subject=${title}&body=${url}`
  };

  if (platform === 'copy') {
    navigator.clipboard.writeText(tab.url);
    showToast('URL kopyalandı', 'success');
  } else if (urls[platform]) {
    try { window.electronAPI.openExternal(urls[platform]); } catch(e) {}
  }

  if (shareMenu) shareMenu.classList.add('hidden');
}

// ========== PIP MODE ==========
async function enablePiP() {
  const webview = getActiveWebview();
  if (!webview) return;

  try {
    const wcId = webview.getWebContentsId();
    if (!wcId) {
      showToast('Sayfa henüz yüklenmedi', 'warning');
      return;
    }

    showToast('🎬 Mini oynatıcı açılıyor...', 'info');
    const res = await window.electronAPI.enablePiP({ webContentsId: wcId });
    
    if (!res.success) {
      showToast('Mini oynatıcı açılamadı: ' + (res.error || ''), 'error');
      return;
    }

    if (res.result === 'ok') {
      showToast('Mini oynatıcı açıldı 🎬', 'success');
    } else if (res.result === 'no-video') {
      showToast('Bu sayfada video bulunamadı', 'warning');
    } else if (res.result && res.result.startsWith('pip-error')) {
      showToast('Video PiP desteklemiyor: ' + res.result, 'warning');
    }
  } catch (e) {
    showToast('Mini oynatıcı hatası: ' + (e.message || ''), 'error');
  }
}

// ========== MUTE ==========
function toggleMute() {
  const tab = getActiveTab();
  if (!tab) return;

  tab.isMuted = !tab.isMuted;
  try { tab.webview.setAudioMuted(tab.isMuted); } catch(e) {}
  updateMuteButton();
  updateTabMuteIcon(tab);
  showToast(tab.isMuted ? '🔇 Ses kapalı' : '🔊 Ses açık', 'success');
}

function updateMuteButton() {
  if (!btnMute) return;
  const tab = getActiveTab();
  if (tab?.isMuted) { btnMute.textContent = '🔇'; btnMute.classList.add('muted'); }
  else { btnMute.textContent = '🔊'; btnMute.classList.remove('muted'); }
}

function updateTabMuteIcon(tab) {
  if (!tab) return;
  const btn = tab.element.querySelector('.tab-mute-btn');
  if (btn) {
    btn.textContent = tab.isMuted ? '🔇' : '🔊';
    btn.title = tab.isMuted ? 'Sesi Aç' : 'Sesi Kapat';
  }
}

function showVolumeControl() {
  // Remove existing
  const existing = document.querySelector('.volume-dropdown');
  if (existing) { existing.remove(); return; }

  const rect = btnMute.getBoundingClientRect();
  const dropdown = document.createElement('div');
  dropdown.className = 'volume-dropdown';

  const allSiteTabs = tabs.filter(t => !t.isStartPage || (t.url && t.url !== ''));
  const tab = getActiveTab();

  dropdown.innerHTML = `
    <div class="volume-header">🔊 Ses Kontrolü</div>
    <div class="volume-section">
      <div class="volume-section-title">Tüm Sekmeler (${allSiteTabs.length})</div>
      ${allSiteTabs.length > 0 ? allSiteTabs.map(t => `
        <div class="volume-tab-item ${t.id === activeTabId ? 'active-tab' : ''}">
          <span class="volume-tab-name">${t.id === activeTabId ? '▶ ' : ''}${escapeHtml(t.title || 'Yeni Sekme').substring(0, 30)}</span>
          <button class="volume-mute-btn ${t.isMuted ? 'muted' : ''}" data-tab-id="${t.id}">
            ${t.isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      `).join('') : '<div class="volume-empty">Açık sayfa yok</div>'}
    </div>
    <div class="volume-section">
      <button class="volume-mute-all-btn" id="volume-mute-all">🔇 Tümünü Sessize Al</button>
      <button class="volume-unmute-all-btn" id="volume-unmute-all">🔊 Tümünün Sesini Aç</button>
    </div>
  `;

  dropdown.style.position = 'fixed';
  dropdown.style.top = (rect.bottom + 8) + 'px';
  dropdown.style.right = (window.innerWidth - rect.right) + 'px';

  document.body.appendChild(dropdown);

  // Per-tab mute buttons
  dropdown.querySelectorAll('.volume-mute-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabId = btn.dataset.tabId;
      toggleTabMute(tabId);
      const t = tabs.find(t2 => t2.id === tabId);
      if (t) {
        btn.textContent = t.isMuted ? '🔇' : '🔊';
        btn.classList.toggle('muted', t.isMuted);
      }
    });
  });

  // Mute all
  dropdown.querySelector('#volume-mute-all')?.addEventListener('click', () => {
    tabs.forEach(t => {
      if (!t.isStartPage && t.url) {
        t.isMuted = true;
        try { t.webview.setAudioMuted(true); } catch(e) {}
        updateTabMuteIcon(t);
      }
    });
    updateMuteButton();
    dropdown.remove();
    showToast('🔇 Tüm sekmeler sessize alındı', 'success');
  });

  // Unmute all
  dropdown.querySelector('#volume-unmute-all')?.addEventListener('click', () => {
    tabs.forEach(t => {
      if (!t.isStartPage && t.url) {
        t.isMuted = false;
        try { t.webview.setAudioMuted(false); } catch(e) {}
        updateTabMuteIcon(t);
      }
    });
    updateMuteButton();
    dropdown.remove();
    showToast('🔊 Tüm sekmelerin sesi açıldı', 'success');
  });

  // Close on outside click
  const closeHandler = (e) => {
    if (!dropdown.contains(e.target) && e.target !== btnMute) {
      dropdown.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 10);
}

// ========== CONTEXT MENU ==========
function showPageContextMenu(x, y) {
  if (!contextMenu) return;

  const menuWidth = 200;
  const menuHeight = 350;
  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.classList.remove('hidden');
}

async function handleContextAction(action) {
  const tab = getActiveTab();

  switch (action) {
    case 'back': goBack(); break;
    case 'forward': goForward(); break;
    case 'reload': reload(); break;
    case 'bookmark': toggleBookmark(); break;
    case 'readinglist': addToReadingList(); break;
    case 'clip': webClipper(); break;
    case 'screenshot': takeScreenshot(); break;
    case 'qrcode': showQRCode(); break;
    case 'archive': archivePage(); break;
    case 'clone': if (tab) cloneTab(tab.id); break;
    case 'split': if (tab?.url) openInSplit(tab.url); break;
    case 'suspend':
      if (tab) { tab.isSuspended ? unsuspendTab(tab.id) : suspendTab(tab.id); }
      break;
    case 'share':
      if (contextMenu) showShareMenu(parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
      break;
    case 'copy-url':
      if (tab?.url) { navigator.clipboard.writeText(tab.url); showToast('URL kopyalandı', 'success'); }
      break;
    case 'reader': toggleReaderMode(); break;
    case 'inspect':
      const webview = getActiveWebview();
      if (webview) { try { webview.openDevTools(); } catch(e) {} }
      break;
    case 'ask-ai':
      const aiWebviewEl = getActiveWebview();
      if (aiWebviewEl) {
        try {
          const selectedText = await aiWebviewEl.executeJavaScript('window.getSelection().toString()');
          if (selectedText?.trim()) {
            askAI(selectedText.trim());
          } else {
            toggleAIPanel();
          }
        } catch(e) { toggleAIPanel(); }
      } else { toggleAIPanel(); }
      break;
  }

  if (contextMenu) contextMenu.classList.add('hidden');
}

// ========== TIME TRACKING ==========
function startTimeTracking() {
  timeTrackingInterval = setInterval(async () => {
    const tab = getActiveTab();
    if (tab && !tab.isStartPage && !tab.isIncognito && tab.url) {
      const domain = getDomain(tab.url);
      try { await window.electronAPI.updateTimeTracking({ domain, seconds: 5 }); } catch(e) {}
      // Site limit kontrolü
      checkSiteLimit(domain);
    }
  }, 5000);
}

async function loadTimeStats() {
  if (!timeStats) return;
  try {
    const tracking = await window.electronAPI.getTimeTracking();
    const today = new Date().toISOString().split('T')[0];
    const todayData = tracking[today] || {};

    const sorted = Object.entries(todayData).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
      timeStats.innerHTML = '<div style="color:var(--text-dim);font-size:11px;">Henüz veri yok</div>';
      return;
    }

    const maxTime = sorted[0][1];

    timeStats.innerHTML = sorted.map(([domain, seconds]) => {
      const minutes = Math.round(seconds / 60);
      const percent = (seconds / maxTime) * 100;
      return `
        <div class="time-stat-item" data-domain="${escapeHtml(domain)}" title="${escapeHtml(domain)} — ${minutes} dakika">
          <span class="time-stat-label">${escapeHtml(domain)}</span>
          <div class="time-stat-bar"><div class="time-stat-fill" style="width:${percent}%"></div></div>
          <span class="time-stat-value">${minutes}dk</span>
        </div>
      `;
    }).join('');

    // Make items clickable
    timeStats.querySelectorAll('.time-stat-item').forEach(item => {
      item.addEventListener('click', () => {
        const domain = item.dataset.domain;
        if (domain) createTab('https://' + domain);
      });
    });
  } catch(e) {}
}

// ========== PERFORMANCE MONITOR ==========
function startPerfMonitor() {
  setInterval(() => {
    if (window.performance?.memory && perfMemory) {
      const memory = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
      perfMemory.textContent = `💾 ${memory} MB`;
    }

    if (perfBandwidth) perfBandwidth.textContent = `📶 ${formatBytes(totalBandwidth)}`;

    // Tab count in perf bar
    if (perfTabMemory) {
      perfTabMemory.textContent = `📑 ${tabs.length} sekme`;
    }
  }, 2000);

  setInterval(loadTimeStats, 60000);
}

// ========== HELPERS ==========
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function setupPanelSearch(type) {
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

// ========== AI SIDEBAR ==========
function toggleAIPanel() {
  if (!aiPanel) return;
  aiPanelOpen = !aiPanelOpen;
  if (aiPanelOpen) {
    aiPanel.classList.remove('hidden');
    if (btnAi) btnAi.classList.add('ai-btn-active');
    if (aiTabs.length === 0) addAiTab('gemini');
  } else {
    aiPanel.classList.add('hidden');
    if (btnAi) btnAi.classList.remove('ai-btn-active');
  }
}

function addAiTab(serviceKey) {
  const svc = AI_SERVICES[serviceKey];
  if (!svc || !aiPanelContent) return;
  const id = `ai-tab-${++aiTabCounter}`;

  const webview = document.createElement('webview');
  webview.id = id;
  webview.className = 'ai-webview';
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('src', svc.url);
  aiPanelContent.appendChild(webview);

  aiTabs.push({ id, serviceKey, webview });
  switchAiTab(id);
  renderAiTabs();
}

function switchAiTab(id) {
  activeAiTabId = id;
  aiTabs.forEach(t => {
    if (aiSplitMode) {
      t.webview.classList.add('active');
      t.webview.style.width = `${100 / aiTabs.length}%`;
      t.webview.style.position = 'relative';
      t.webview.style.right = 'auto';
      t.webview.style.bottom = 'auto';
    } else {
      if (t.id === id) {
        t.webview.classList.add('active');
        t.webview.style.width = '100%';
        t.webview.style.position = 'absolute';
        t.webview.style.right = '0';
        t.webview.style.bottom = '0';
      } else {
        t.webview.classList.remove('active');
      }
    }
  });
  renderAiTabs();
}

function closeAiTab(id) {
  const idx = aiTabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  const tab = aiTabs[idx];
  tab.webview.remove();
  aiTabs.splice(idx, 1);

  if (aiTabs.length === 0) {
    toggleAIPanel();
    return;
  }
  if (activeAiTabId === id) {
    activeAiTabId = aiTabs[Math.min(idx, aiTabs.length - 1)].id;
  }
  switchAiTab(activeAiTabId);
}

function toggleAiSplitMode() {
  aiSplitMode = !aiSplitMode;
  if (aiPanelContent) aiPanelContent.classList.toggle('ai-split', aiSplitMode);
  switchAiTab(activeAiTabId);
}

function renderAiTabs() {
  if (!aiPanelTabs) return;
  aiPanelTabs.innerHTML = '';

  aiTabs.forEach(t => {
    const svc = AI_SERVICES[t.serviceKey];
    const tab = document.createElement('div');
    tab.className = `ai-tab-item${t.id === activeAiTabId ? ' active' : ''}`;
    tab.innerHTML = `<span class="ai-tab-icon" style="color:${svc.color}">${svc.icon}</span><span class="ai-tab-name">${svc.name}</span><button class="ai-tab-close" title="Kapat">✕</button>`;
    tab.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ai-tab-close')) switchAiTab(t.id);
    });
    tab.querySelector('.ai-tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeAiTab(t.id);
    });
    aiPanelTabs.appendChild(tab);
  });
}

function showAiServicePicker() {
  const picker = document.createElement('div');
  picker.className = 'ai-service-picker';
  picker.innerHTML = Object.entries(AI_SERVICES).map(([key, svc]) =>
    `<div class="ai-service-card" data-key="${key}"><span class="ai-svc-icon" style="color:${svc.color}">${svc.icon}</span><span class="ai-svc-name">${svc.name}</span></div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'ai-picker-overlay';
  overlay.appendChild(picker);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  picker.querySelectorAll('.ai-service-card').forEach(card => {
    card.addEventListener('click', () => {
      addAiTab(card.dataset.key);
      overlay.remove();
    });
  });

  document.body.appendChild(overlay);
}

function askAI(text) {
  if (!text) return;
  if (!aiPanelOpen) toggleAIPanel();
  // Send to perplexity for search queries
  const svc = AI_SERVICES['perplexity'];
  if (svc) {
    const existing = aiTabs.find(t => t.serviceKey === 'perplexity');
    if (existing) {
      existing.webview.src = `https://perplexity.ai/search?q=${encodeURIComponent(text)}`;
      switchAiTab(existing.id);
    } else {
      addAiTab('perplexity');
      setTimeout(() => {
        const pt = aiTabs.find(t => t.serviceKey === 'perplexity');
        if (pt) pt.webview.src = `https://perplexity.ai/search?q=${encodeURIComponent(text)}`;
      }, 100);
    }
  }
}

// ========== SITE LIMIT SYSTEM ==========
async function showSiteLimitsPanel() {
  siteLimits = await window.electronAPI.getSiteLimits() || {};
  const domains = Object.entries(siteLimits);

  let listHTML = domains.map(([domain, minutes]) => `
    <div class="site-limit-panel-item">
      <div>
        <div class="site-limit-domain">${escapeHtml(domain)}</div>
        <div class="site-limit-time">${minutes} dk/gün</div>
      </div>
      <button class="site-limit-remove" data-domain="${escapeHtml(domain)}" title="Kaldır">✕</button>
    </div>
  `).join('');

  if (!listHTML) listHTML = '<div style="color:var(--text-dim);font-size:12px;padding:12px;">Henüz limit eklenmedi</div>';

  const html = `
    <div style="padding:12px;">
      <div style="display:flex;gap:6px;margin-bottom:16px;">
        <input type="text" id="limit-domain-input" placeholder="alan adı (ör: youtube.com)" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-size:13px;outline:none;">
        <input type="number" id="limit-minutes-input" placeholder="dk" min="1" max="1440" style="width:60px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-size:13px;outline:none;text-align:center;">
        <button id="limit-add-btn" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:500;">Ekle</button>
      </div>
      <div id="limits-list">${listHTML}</div>
    </div>
  `;

  showPanel('⏱️ Site Limitleri', html);

  setTimeout(() => {
    const addBtn = $('limit-add-btn');
    addBtn?.addEventListener('click', async () => {
      const domainInput = $('limit-domain-input');
      const minutesInput = $('limit-minutes-input');
      const domain = domainInput?.value.trim().toLowerCase();
      const minutes = parseInt(minutesInput?.value);
      if (!domain || !minutes || minutes < 1) { showToast('Geçerli alan adı ve süre girin', 'warning'); return; }
      siteLimits[domain] = minutes;
      await window.electronAPI.setSiteLimits(siteLimits);
      showToast(`${domain} için ${minutes} dk limit eklendi`, 'success');
      showSiteLimitsPanel();
    });

    $$('.site-limit-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const domain = btn.dataset.domain;
        delete siteLimits[domain];
        await window.electronAPI.setSiteLimits(siteLimits);
        showToast(`${domain} limiti kaldırıldı`, 'info');
        showSiteLimitsPanel();
      });
    });
  }, 50);
}

async function checkSiteLimit(domain) {
  if (!domain || Object.keys(siteLimits).length === 0) return;
  const matchedDomain = Object.keys(siteLimits).find(d => domain.includes(d));
  if (!matchedDomain) return;

  const limitMinutes = siteLimits[matchedDomain];
  try {
    const tracking = await window.electronAPI.getTimeTracking();
    const today = new Date().toISOString().split('T')[0];
    const todayData = tracking[today] || {};
    const usedSeconds = todayData[domain] || 0;
    const usedMinutes = usedSeconds / 60;

    if (usedMinutes >= limitMinutes) {
      const tab = getActiveTab();
      if (tab && tab.webview && !tab.isStartPage) {
        injectLimitOverlay(tab.webview, matchedDomain, limitMinutes);
      }
    }
  } catch(e) {}
}

function injectLimitOverlay(webview, domain, limitMinutes) {
  const js = `
    if (!document.getElementById('barly-limit-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'barly-limit-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;';
      overlay.innerHTML = '<div style="text-align:center;color:#fff;"><div style="font-size:64px;margin-bottom:20px;">⏰</div><h2 style="font-size:24px;margin-bottom:12px;">Süre Doldu!</h2><p style="font-size:16px;color:#aaa;margin-bottom:8px;">${domain} için günlük ${limitMinutes} dakika limitinize ulaştınız.</p><p style="font-size:13px;color:#666;">Yarın tekrar ziyaret edebilirsiniz.</p><button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Yine de Devam Et</button></div>';
      document.body.appendChild(overlay);
    }
  `;
  try { webview.executeJavaScript(js); } catch(e) {}
}

// ========== MINI PLAYER ==========
function showMiniPlayer(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab || !miniPlayer) return;
  miniPlayerTabId = tabId;
  miniPlayerPlaying = true;
  if (miniPlayerTitleEl) miniPlayerTitleEl.textContent = tab.title || 'Medya çalıyor...';
  if (miniPlayerPlayPause) miniPlayerPlayPause.textContent = '⏸️';
  if (miniPlayerMute) miniPlayerMute.textContent = tab.isMuted ? '🔇' : '🔊';
  miniPlayer.classList.remove('hidden');
}

function hideMiniPlayer() {
  if (miniPlayer) miniPlayer.classList.add('hidden');
  miniPlayerTabId = null;
}

function miniPlayerTogglePlay() {
  if (!miniPlayerTabId) return;
  const tab = tabs.find(t => t.id === miniPlayerTabId);
  if (!tab?.webview) return;
  miniPlayerPlaying = !miniPlayerPlaying;
  if (miniPlayerPlayPause) miniPlayerPlayPause.textContent = miniPlayerPlaying ? '⏸️' : '▶️';
  const js = miniPlayerPlaying
    ? `(document.querySelector('video') || document.querySelector('audio'))?.play()`
    : `(document.querySelector('video') || document.querySelector('audio'))?.pause()`;
  try { tab.webview.executeJavaScript(js); } catch(e) {}
}

function miniPlayerToggleMute() {
  if (!miniPlayerTabId) return;
  const tab = tabs.find(t => t.id === miniPlayerTabId);
  if (!tab) return;
  toggleTabMute(miniPlayerTabId);
  if (miniPlayerMute) miniPlayerMute.textContent = tab.isMuted ? '🔇' : '🔊';
}

function miniPlayerGoToTab() {
  if (miniPlayerTabId) switchTab(miniPlayerTabId);
}

// ========== WEB ANNOTATIONS ==========
function toggleAnnotationMode() {
  annotationMode = !annotationMode;
  if (btnAnnotate) {
    btnAnnotate.classList.toggle('annotation-active', annotationMode);
    btnAnnotate.title = annotationMode ? 'Notları Kapat' : 'Sayfa Notları';
  }
  const webview = getActiveWebview();
  if (!webview) return;
  if (annotationMode) {
    injectAnnotationScript(webview);
    showToast('✏️ Not modu açıldı - metin seçerek vurgulayın', 'info');
  } else {
    removeAnnotationHighlights(webview);
    showToast('Not modu kapatıldı', 'info');
  }
}

function injectAnnotationScript(webview) {
  const tab = getActiveTab();
  if (!tab || !tab.url) return;
  const urlKey = tab.url.split('?')[0];
  const saved = annotationsData[urlKey] || [];

  const js = `
    (function() {
      if (window.__barlyAnnotation) return;
      window.__barlyAnnotation = true;

      const style = document.createElement('style');
      style.id = 'barly-ann-style';
      style.textContent = '.barly-highlight { background: #fef08a !important; color: #000 !important; cursor: pointer; border-radius: 2px; padding: 0 1px; } .barly-highlight-popup { position: fixed; background: #1a1a2e; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); user-select: none; }';
      document.head.appendChild(style);

      // Re-apply saved highlights
      const saved = ${JSON.stringify(saved)};
      saved.forEach(text => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.parentElement?.classList?.contains('barly-highlight')) continue;
          const idx = node.nodeValue.indexOf(text);
          if (idx !== -1) {
            try {
              const range = document.createRange();
              range.setStart(node, idx);
              range.setEnd(node, idx + text.length);
              const mark = document.createElement('mark');
              mark.className = 'barly-highlight';
              range.surroundContents(mark);
            } catch(e) {}
            break;
          }
        }
      });

      let popup = null;
      document.addEventListener('mouseup', (e) => {
        setTimeout(() => {
          if (popup) { popup.remove(); popup = null; }
          const sel = window.getSelection();
          const text = sel.toString().trim();
          if (text.length < 2 || text.length > 500) return;
          if (e.target.closest('.barly-highlight-popup')) return;

          popup = document.createElement('div');
          popup.className = 'barly-highlight-popup';
          popup.textContent = '✏️ Vurgula';
          popup.style.left = Math.min(e.clientX, window.innerWidth - 100) + 'px';
          popup.style.top = Math.max(e.clientY - 40, 10) + 'px';
          document.body.appendChild(popup);

          popup.addEventListener('click', () => {
            try {
              const range = sel.getRangeAt(0);
              const mark = document.createElement('mark');
              mark.className = 'barly-highlight';
              range.surroundContents(mark);
              sel.removeAllRanges();
            } catch(ex) {}
            popup.remove();
            popup = null;

            const highlights = [];
            document.querySelectorAll('.barly-highlight').forEach(el => {
              highlights.push(el.textContent);
            });
            console.log('__BARLY_ANN__:' + JSON.stringify(highlights));
          });
        }, 10);
      });

      document.addEventListener('mousedown', (e) => {
        if (popup && !popup.contains(e.target)) {
          popup.remove();
          popup = null;
        }
      });
    })();
  `;
  try { webview.executeJavaScript(js); } catch(e) {}
}

function removeAnnotationHighlights(webview) {
  const js = `
    (function() {
      document.querySelectorAll('.barly-highlight').forEach(mark => {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      });
      const style = document.getElementById('barly-ann-style');
      if (style) style.remove();
      delete window.__barlyAnnotation;
    })();
  `;
  try { webview.executeJavaScript(js); } catch(e) {}
}

async function saveAnnotationData(url, highlights) {
  if (!url) return;
  const urlKey = url.split('?')[0];
  if (highlights.length === 0) {
    delete annotationsData[urlKey];
  } else {
    annotationsData[urlKey] = highlights;
  }
  await window.electronAPI.setAnnotations(annotationsData);
}

function reApplyAnnotations(webview, saved) {
  const js = `
    (function() {
      const style = document.createElement('style');
      style.id = 'barly-ann-style';
      style.textContent = '.barly-highlight { background: #fef08a !important; color: #000 !important; border-radius: 2px; padding: 0 1px; }';
      if (!document.getElementById('barly-ann-style')) document.head.appendChild(style);

      const saved = ${JSON.stringify(saved)};
      saved.forEach(text => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.parentElement?.classList?.contains('barly-highlight')) continue;
          const idx = node.nodeValue.indexOf(text);
          if (idx !== -1) {
            try {
              const range = document.createRange();
              range.setStart(node, idx);
              range.setEnd(node, idx + text.length);
              const mark = document.createElement('mark');
              mark.className = 'barly-highlight';
              range.surroundContents(mark);
            } catch(e) {}
            break;
          }
        }
      });
    })();
  `;
  try { webview.executeJavaScript(js); } catch(e) {}
}

// ========== LINK PREVIEW ==========
function injectLinkPreviewScript(webview) {
  const js = `
    (function() {
      if (window.__barlyLinkPreview) return;
      window.__barlyLinkPreview = true;

      let hoverTimeout = null;
      let lastUrl = '';

      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.href;
        if (!href || href.startsWith('javascript:') || href.startsWith('#') || href === lastUrl) return;

        hoverTimeout = setTimeout(() => {
          lastUrl = href;
          const rect = link.getBoundingClientRect();
          console.log('__BARLY_LINK_HOVER__:' + JSON.stringify({
            url: href,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 5
          }));
        }, 600);
      });

      document.addEventListener('mouseout', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
          clearTimeout(hoverTimeout);
          lastUrl = '';
          console.log('__BARLY_LINK_LEAVE__');
        }
      });
    })();
  `;
  try { webview.executeJavaScript(js); } catch(e) {}
}

async function handleLinkHover(data, webview) {
  if (!linkPreviewTooltip || !data?.url) return;

  // Position tooltip
  const rect = webview.getBoundingClientRect();
  const x = rect.left + data.x;
  const y = rect.top + data.y;

  // Check cache
  let preview = linkPreviewCache[data.url];
  if (!preview) {
    try {
      preview = await window.electronAPI.fetchLinkPreview(data.url);
      if (preview) linkPreviewCache[data.url] = preview;
    } catch(e) {}
  }

  if (!preview || (!preview.title && !preview.description)) {
    hideLinkPreview();
    return;
  }

  if (linkPreviewTitleElm) linkPreviewTitleElm.textContent = preview.title || '';
  if (linkPreviewDesc) linkPreviewDesc.textContent = preview.description || '';
  if (linkPreviewUrlEl) linkPreviewUrlEl.textContent = data.url;
  if (linkPreviewImg) {
    if (preview.image) {
      linkPreviewImg.src = preview.image;
      linkPreviewImg.classList.remove('hidden');
    } else {
      linkPreviewImg.classList.add('hidden');
    }
  }

  // Position
  let px = Math.min(x, window.innerWidth - 340);
  let py = y + 8;
  if (py + 200 > window.innerHeight) py = rect.top + data.y - 200;
  linkPreviewTooltip.style.left = Math.max(px, 10) + 'px';
  linkPreviewTooltip.style.top = Math.max(py, 10) + 'px';
  linkPreviewTooltip.classList.remove('hidden');
}

function hideLinkPreview() {
  if (linkPreviewTooltip) linkPreviewTooltip.classList.add('hidden');
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Window controls
  btnMinimize?.addEventListener('click', () => { try { window.electronAPI.minimize(); } catch(e) {} });
  btnMaximize?.addEventListener('click', () => { try { window.electronAPI.maximize(); } catch(e) {} });
  btnClose?.addEventListener('click', () => { try { window.electronAPI.close(); } catch(e) {} });

  // Navigation
  btnBack?.addEventListener('click', goBack);
  btnForward?.addEventListener('click', goForward);
  btnReload?.addEventListener('click', reload);
  btnHome?.addEventListener('click', goHome);

  // Tabs
  btnNewTab?.addEventListener('click', () => createTab());
  btnIncognito?.addEventListener('click', () => createTab(null, true));

  // Toolbar
  btnBookmarkAdd?.addEventListener('click', toggleBookmark);
  btnReadingListAdd?.addEventListener('click', addToReadingList);
  btnFind?.addEventListener('click', showFindBar);
  btnScreenshot?.addEventListener('click', takeScreenshot);
  btnPip?.addEventListener('click', enablePiP);
  btnSplit?.addEventListener('click', toggleSplitView);
  btnMute?.addEventListener('click', showVolumeControl);
  btnReader?.addEventListener('click', toggleReaderMode);
  btnCompact?.addEventListener('click', toggleCompactMode);

  // Compact toggle button (sidebar kapalıyken)
  compactToggleBtn?.addEventListener('click', toggleCompactMode);

  // Panels
  btnBookmarks?.addEventListener('click', showBookmarksPanel);
  btnHistory?.addEventListener('click', showHistoryPanel);
  btnDownloads?.addEventListener('click', showDownloadsPanel);
  btnReadingList?.addEventListener('click', showReadingListPanel);
  btnNotes?.addEventListener('click', showNotesPanel);
  btnPasswords?.addEventListener('click', showPasswordsPanel);
  btnSettings?.addEventListener('click', showSettingsPanel);
  btnTodos?.addEventListener('click', showTodosPanel);
  btnConsole?.addEventListener('click', showConsolePanel);
  btnSessions?.addEventListener('click', showSessionsPanel);
  btnSourceCode?.addEventListener('click', downloadSourceCode);
  btnCssEditor?.addEventListener('click', toggleCssEditor);
  btnPerfAnalyze?.addEventListener('click', analyzePagePerformance);
  btnThemeCustomize?.addEventListener('click', showThemeCustomizer);
  panelClose?.addEventListener('click', hidePanel);

  // Yeni özellikler
  btnAi?.addEventListener('click', toggleAIPanel);
  btnAnnotate?.addEventListener('click', toggleAnnotationMode);
  btnSiteLimits?.addEventListener('click', showSiteLimitsPanel);
  aiPanelClose?.addEventListener('click', toggleAIPanel);
  $('ai-panel-addtab')?.addEventListener('click', showAiServicePicker);
  $('ai-panel-split')?.addEventListener('click', toggleAiSplitMode);

  // Mini player
  miniPlayerPlayPause?.addEventListener('click', miniPlayerTogglePlay);
  miniPlayerMute?.addEventListener('click', miniPlayerToggleMute);
  miniPlayerGoto?.addEventListener('click', miniPlayerGoToTab);
  miniPlayerCloseBtn?.addEventListener('click', hideMiniPlayer);

  // Modal
  modalClose?.addEventListener('click', hideModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  // Notepad
  notepadClose?.addEventListener('click', hideNotepadMini);
  notepadSave?.addEventListener('click', saveQuickNote);

  // Speed dial
  btnAddSpeedDial?.addEventListener('click', showAddSpeedDialModal);

  // Search
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { navigate(searchInput.value); searchInput.value = ''; }
  });
  searchBtn?.addEventListener('click', () => {
    if (searchInput) { navigate(searchInput.value); searchInput.value = ''; }
  });

  // URL
  urlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && urlInput) navigate(urlInput.value); });
  urlInput?.addEventListener('focus', () => { if (urlInput) urlInput.select(); });

  // Find
  findInput?.addEventListener('input', () => findInPage());
  findInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findInPage(e.shiftKey ? 'backward' : 'forward');
  });
  findPrev?.addEventListener('click', () => findInPage('backward'));
  findNext?.addEventListener('click', () => findInPage('forward'));
  findClose?.addEventListener('click', hideFindBar);

  // HTTPS Warning
  httpsWarningClose?.addEventListener('click', dismissHttpsWarning);
  httpsWarningContinue?.addEventListener('click', dismissHttpsWarning);

  // Context menu items
  $$('.context-item[data-action]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleContextAction(item.dataset.action);
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
    // Skip if recording a shortcut
    if (isRecordingShortcut) return;

    const pressed = shortcutKeyToString(e);
    if (!pressed) return;

    const actions = {
      [getShortcutValue('newTab')]: () => createTab(),
      [getShortcutValue('newIncognito')]: () => createTab(null, true),
      [getShortcutValue('closeTab')]: () => { if (activeTabId) closeTab(activeTabId); },
      [getShortcutValue('focusUrl')]: () => { if (urlInput) urlInput.focus(); },
      [getShortcutValue('reload')]: () => reload(),
      [getShortcutValue('find')]: () => showFindBar(),
      [getShortcutValue('bookmark')]: () => toggleBookmark(),
      [getShortcutValue('history')]: () => showHistoryPanel(),
      [getShortcutValue('screenshot')]: () => takeScreenshot(),
      [getShortcutValue('todos')]: () => showTodosPanel(),
      [getShortcutValue('console')]: () => showConsolePanel(),
      [getShortcutValue('quickSearch')]: () => showQuickSearchPalette(),
      [getShortcutValue('back')]: () => goBack(),
      [getShortcutValue('forward')]: () => goForward(),
      [getShortcutValue('fullscreen')]: () => { try { window.electronAPI.toggleFullscreen(); } catch(ex) {} },
      [getShortcutValue('devtools')]: () => { const wv = getActiveWebview(); if (wv) { try { wv.openDevTools(); } catch(ex) {} } },
    };

    // Also handle F5 for reload
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
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
