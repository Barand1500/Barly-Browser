// ========== DURUM - STATE ==========
// Tüm paylaşılan durum değişkenleri ve DOM referansları

// ========== DOM REFERANSLARI ==========
export const $ = id => document.getElementById(id);
export const $$ = sel => document.querySelectorAll(sel);

// DOM elementleri (initElements ile doldurulur)
export const dom = {};

export function initElements() {
  // Ana elementler
  dom.appContainer = $('app-container');
  dom.sidebar = $('sidebar');
  dom.startPage = $('start-page');
  dom.searchInput = $('search-input');
  dom.searchBtn = $('search-btn');
  dom.urlInput = $('url-input');
  dom.urlBar = $('url-bar');
  dom.securityIcon = $('security-icon');
  dom.tabsList = $('tabs-list');
  dom.tabGroupsContainer = $('tab-groups-container');
  dom.webviewContainer = $('webview-container');
  dom.webviewContainerSplit = $('webview-container-split');
  dom.webviewWrapper = $('webview-wrapper');
  dom.loadingBar = $('loading-bar');
  dom.rightPanel = $('right-panel');
  dom.panelTitle = $('panel-title');
  dom.panelContent = $('panel-content');
  dom.panelClose = $('panel-close');
  dom.findBar = $('find-bar');
  dom.findInput = $('find-input');
  dom.findCount = $('find-count');
  dom.speedDialGrid = $('speed-dial-grid');
  dom.timeStats = $('time-stats');
  dom.modal = $('modal');
  dom.modalTitle = $('modal-title');
  dom.modalBody = $('modal-body');
  dom.modalFooter = $('modal-footer');
  dom.toastContainer = $('toast-container');
  dom.perfTime = $('perf-time');
  dom.perfMemory = $('perf-memory');
  dom.perfBandwidth = $('perf-bandwidth');
  dom.perfTabMemory = $('perf-tab-memory');
  dom.contextMenu = $('context-menu');
  dom.shareMenu = $('share-menu');
  dom.notepadMini = $('notepad-mini');
  dom.notepadContent = $('notepad-content');
  dom.httpsWarning = $('https-warning');
  dom.httpsWarningClose = $('https-warning-close');
  dom.httpsWarningContinue = $('https-warning-continue');
  dom.compactToggleBtn = $('compact-toggle-btn');
  dom.sidebarResizeHandle = $('sidebar-resize-handle');
  dom.pageTimeline = $('page-timeline');
  dom.timelineBar = $('timeline-bar');
  dom.tabPreview = $('tab-preview');
  dom.tabPreviewImg = $('tab-preview-img');
  dom.tabPreviewTitle = $('tab-preview-title');

  // Butonlar
  dom.btnBack = $('btn-back');
  dom.btnForward = $('btn-forward');
  dom.btnReload = $('btn-reload');
  dom.btnHome = $('btn-home');
  dom.btnNewTab = $('btn-new-tab');
  dom.btnIncognito = $('btn-incognito');
  dom.btnBookmarks = $('btn-bookmarks');
  dom.btnHistory = $('btn-history');
  dom.btnDownloads = $('btn-downloads');
  dom.btnReadingList = $('btn-readinglist');
  dom.btnNotes = $('btn-notes');
  dom.btnPasswords = $('btn-passwords');
  dom.btnSettings = $('btn-settings');
  dom.btnCompact = $('btn-compact');
  dom.btnMinimize = $('btn-minimize');
  dom.btnMaximize = $('btn-maximize');
  dom.btnClose = $('btn-close');
  dom.btnBookmarkAdd = $('btn-bookmark-add');
  dom.btnReadingListAdd = $('btn-readinglist-add');
  dom.btnFind = $('btn-find');
  dom.btnScreenshot = $('btn-screenshot');
  dom.btnPip = $('btn-pip');
  dom.btnSplit = $('btn-split');
  dom.btnMute = $('btn-mute');
  dom.btnReader = $('btn-reader');
  dom.btnAddSpeedDial = $('btn-add-speeddial');
  dom.findPrev = $('find-prev');
  dom.findNext = $('find-next');
  dom.findClose = $('find-close');
  dom.modalClose = $('modal-close');
  dom.notepadClose = $('notepad-close');
  dom.notepadSave = $('notepad-save');
  dom.btnTodos = $('btn-todos');
  dom.btnConsole = $('btn-console');
  dom.btnSessions = $('btn-sessions');
  dom.btnSourceCode = $('btn-source-code');
  dom.btnCssEditor = $('btn-css-editor');
  dom.btnPerfAnalyze = $('btn-perf-analyze');
  dom.btnThemeCustomize = $('btn-theme-customize');
  dom.btnAi = $('btn-ai');
  dom.btnAnnotate = $('btn-annotate');
  dom.btnSiteLimits = $('btn-sitelimits');
  dom.aiPanel = $('ai-panel');
  dom.aiPanelContent = $('ai-panel-content');
  dom.aiPanelTabs = $('ai-panel-tabs');
  dom.aiPanelClose = $('ai-panel-close');
  dom.miniPlayer = $('mini-player');
  dom.miniPlayerTitleEl = $('mini-player-title');
  dom.miniPlayerPlayPause = $('mini-player-playpause');
  dom.miniPlayerMute = $('mini-player-mute');
  dom.miniPlayerGoto = $('mini-player-goto');
  dom.miniPlayerCloseBtn = $('mini-player-close');
  dom.linkPreviewTooltip = $('link-preview-tooltip');
  dom.linkPreviewImg = $('link-preview-img');
  dom.linkPreviewTitleElm = $('link-preview-title');
  dom.linkPreviewDesc = $('link-preview-desc');
  dom.linkPreviewUrlEl = $('link-preview-url');
}

// ========== UYGULAMA DURUMU ==========
export const SEARCH_ENGINE = 'https://www.google.com/search?q=';

export const state = {
  settings: { theme: 'dark', adBlockEnabled: true, compactMode: false, httpsWarning: true, sessionRestore: true, tabSuspendTimeout: 10, sidebarWidth: 260, fontFamily: 'Inter' },
  themeConfig: { preset: 'default', wallpaper: null, forceWebTheme: true },
  shortcuts: {},
  tabs: [],
  tabGroups: [],
  activeTabId: null,
  tabCounter: 0,
  downloads: [],
  currentFindText: '',
  splitMode: false,
  splitTabId: null,
  isRecordingShortcut: null,
  timeTrackingInterval: null,
  consoleLogs: [],
  todoFilter: 'all',
  httpsWarningDismissed: {},
  isResizingSidebar: false,
  draggedTabId: null,
  tabSuspendTimers: {},
  aiPanelOpen: false,
  annotationMode: false,
  siteLimits: {},
  miniPlayerTabId: null,
  miniPlayerPlaying: true,
  linkPreviewCache: {},
  annotationsData: {},
  linkPreviewTimeout: null,
  aiTabs: [],
  activeAiTabId: null,
  aiTabCounter: 0,
  aiSplitMode: false,
  cssEditorOverlay: null,
  codeEditorState: { mode: 'css', css: '', js: '', html: '' },
  quickSearchOverlay: null,
};

// AI servisleri sabit listesi
export const AI_SERVICES = {
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
