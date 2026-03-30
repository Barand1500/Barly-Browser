const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Pencere kontrolleri
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', (e, maximized) => callback(maximized)),
  onAppClosing: (callback) => ipcRenderer.on('app-closing', () => callback()),
  
  // Yer imleri
  getBookmarks: () => ipcRenderer.invoke('bookmarks-get'),
  addBookmark: (bookmark) => ipcRenderer.invoke('bookmarks-add', bookmark),
  removeBookmark: (id) => ipcRenderer.invoke('bookmarks-remove', id),
  
  // Geçmiş
  getHistory: () => ipcRenderer.invoke('history-get'),
  addHistory: (item) => ipcRenderer.invoke('history-add', item),
  clearHistory: () => ipcRenderer.invoke('history-clear'),
  removeHistory: (id) => ipcRenderer.invoke('history-remove', id),
  
  // Hızlı erişim
  getSpeedDial: () => ipcRenderer.invoke('speeddial-get'),
  addSpeedDial: (item) => ipcRenderer.invoke('speeddial-add', item),
  removeSpeedDial: (id) => ipcRenderer.invoke('speeddial-remove', id),
  
  // Şifreler
  getPasswords: () => ipcRenderer.invoke('passwords-get'),
  addPassword: (password) => ipcRenderer.invoke('passwords-add', password),
  removePassword: (id) => ipcRenderer.invoke('passwords-remove', id),
  
  // Ayarlar
  getSettings: () => ipcRenderer.invoke('settings-get'),
  setSettings: (settings) => ipcRenderer.invoke('settings-set', settings),
  
  // Klavye kısayolları
  getShortcuts: () => ipcRenderer.invoke('shortcuts-get'),
  setShortcuts: (shortcuts) => ipcRenderer.invoke('shortcuts-set', shortcuts),
  resetShortcuts: () => ipcRenderer.invoke('shortcuts-reset'),
  
  // Not defteri
  getNotes: () => ipcRenderer.invoke('notes-get'),
  addNote: (note) => ipcRenderer.invoke('notes-add', note),
  updateNote: (data) => ipcRenderer.invoke('notes-update', data),
  removeNote: (id) => ipcRenderer.invoke('notes-remove', id),
  
  // Okuma listesi
  getReadingList: () => ipcRenderer.invoke('readinglist-get'),
  addToReadingList: (item) => ipcRenderer.invoke('readinglist-add', item),
  toggleReadingListItem: (id) => ipcRenderer.invoke('readinglist-toggle', id),
  removeFromReadingList: (id) => ipcRenderer.invoke('readinglist-remove', id),
  
  // Sekme grupları
  getTabGroups: () => ipcRenderer.invoke('tabgroups-get'),
  addTabGroup: (group) => ipcRenderer.invoke('tabgroups-add', group),
  updateTabGroup: (group) => ipcRenderer.invoke('tabgroups-update', group),
  removeTabGroup: (id) => ipcRenderer.invoke('tabgroups-remove', id),
  
  // Zaman takibi
  getTimeTracking: () => ipcRenderer.invoke('timetracking-get'),
  updateTimeTracking: (data) => ipcRenderer.invoke('timetracking-update', data),
  clearTimeTracking: () => ipcRenderer.invoke('timetracking-clear'),
  
  // Yapılacaklar (Todos)
  getTodos: () => ipcRenderer.invoke('todos-get'),
  addTodo: (todo) => ipcRenderer.invoke('todos-add', todo),
  updateTodo: (todo) => ipcRenderer.invoke('todos-update', todo),
  removeTodo: (id) => ipcRenderer.invoke('todos-remove', id),
  clearCompletedTodos: () => ipcRenderer.invoke('todos-clear-completed'),
  
  // Oturum yöneticisi
  getSessions: () => ipcRenderer.invoke('sessions-get'),
  saveSession: (data) => ipcRenderer.invoke('sessions-save', data),
  restoreSession: (name) => ipcRenderer.invoke('sessions-restore', name),
  removeSession: (name) => ipcRenderer.invoke('sessions-remove', name),
  
  // Otomatik doldurma
  getAutofill: () => ipcRenderer.invoke('autofill-get'),
  setAutofill: (data) => ipcRenderer.invoke('autofill-set', data),
  
  // Ekran görüntüsü
  saveScreenshot: (dataUrl) => ipcRenderer.invoke('screenshot-take', dataUrl),
  copyScreenshot: (dataUrl) => ipcRenderer.invoke('screenshot-clipboard', dataUrl),
  
  // İndirmeler
  showDownload: (path) => ipcRenderer.invoke('download-show', path),
  openDownload: (path) => ipcRenderer.invoke('download-open', path),
  saveSourceCode: (data) => ipcRenderer.invoke('save-source-code', data),
  injectCSS: (data) => ipcRenderer.invoke('inject-css', data),
  injectJS: (data) => ipcRenderer.invoke('inject-js', data),
  removeInjectedCSS: (data) => ipcRenderer.invoke('remove-injected-css', data),
  setNativeTheme: (mode) => ipcRenderer.invoke('set-native-theme', mode),
  enablePiP: (data) => ipcRenderer.invoke('enable-pip', data),
  
  // Dış bağlantı
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // QR kod
  generateQR: (text) => ipcRenderer.invoke('generate-qr', text),
  
  // Sayfa arşivleme
  archivePage: (url) => ipcRenderer.invoke('archive-page', url),
  
  // Reklam engelleyici
  toggleAdBlock: (enabled) => ipcRenderer.invoke('adblock-toggle', enabled),
  
  // Veri temizleme
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  
  // Çevrimdışı sayfalar
  getOfflinePages: () => ipcRenderer.invoke('offline-get'),
  saveOfflinePage: (data) => ipcRenderer.invoke('offline-save', data),
  loadOfflinePage: (id) => ipcRenderer.invoke('offline-load', id),
  removeOfflinePage: (id) => ipcRenderer.invoke('offline-remove', id),
  
  // Tema özelleştirme
  getThemes: () => ipcRenderer.invoke('themes-get'),
  setThemes: (data) => ipcRenderer.invoke('themes-set', data),
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // Site limitleri
  getSiteLimits: () => ipcRenderer.invoke('sitelimits-get'),
  setSiteLimits: (data) => ipcRenderer.invoke('sitelimits-set', data),

  // Sayfa notları (annotations)
  getAnnotations: () => ipcRenderer.invoke('annotations-get'),
  setAnnotations: (data) => ipcRenderer.invoke('annotations-set', data),

  // Link önizleme
  fetchLinkPreview: (url) => ipcRenderer.invoke('fetch-link-preview', url),

  // Context menu
  onContextMenu: (callback) => ipcRenderer.on('context-menu', (e, params) => callback(params))
});
