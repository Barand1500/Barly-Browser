const { app, BrowserWindow, ipcMain, session, dialog, clipboard, nativeImage, shell, Menu, webContents, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const DATA_PATH = path.join(app.getPath('userData'), 'barly-data');

// Veri klasörünü oluştur
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true });
}

// Veri dosyaları
const BOOKMARKS_FILE = path.join(DATA_PATH, 'bookmarks.json');
const HISTORY_FILE = path.join(DATA_PATH, 'history.json');
const PASSWORDS_FILE = path.join(DATA_PATH, 'passwords.json');
const SETTINGS_FILE = path.join(DATA_PATH, 'settings.json');
const SPEEDDIAL_FILE = path.join(DATA_PATH, 'speeddial.json');
const NOTES_FILE = path.join(DATA_PATH, 'notes.json');
const READINGLIST_FILE = path.join(DATA_PATH, 'readinglist.json');
const TABGROUPS_FILE = path.join(DATA_PATH, 'tabgroups.json');
const SHORTCUTS_FILE = path.join(DATA_PATH, 'shortcuts.json');
const TIMETRACKING_FILE = path.join(DATA_PATH, 'timetracking.json');
const TODOS_FILE = path.join(DATA_PATH, 'todos.json');
const SESSIONS_FILE = path.join(DATA_PATH, 'sessions.json');
const AUTOFILL_FILE = path.join(DATA_PATH, 'autofill.json');
const OFFLINE_FILE = path.join(DATA_PATH, 'offline.json');
const THEMES_FILE = path.join(DATA_PATH, 'themes.json');
const SITELIMITS_FILE = path.join(DATA_PATH, 'sitelimits.json');
const ANNOTATIONS_FILE = path.join(DATA_PATH, 'annotations.json');
const OFFLINE_PAGES_DIR = path.join(DATA_PATH, 'offline-pages');

if (!fs.existsSync(OFFLINE_PAGES_DIR)) {
  fs.mkdirSync(OFFLINE_PAGES_DIR, { recursive: true });
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS = {
  theme: 'dark',
  adBlockEnabled: true,
  searchEngine: 'google',
  compactMode: false,
  startPage: 'home',
  language: 'tr',
  sidebarWidth: 260,
  fontFamily: 'Inter',
  gesturesEnabled: true,
  httpsWarning: true,
  sessionRestore: true,
  tabSuspendTimeout: 10
};

// Varsayılan kısayollar
const DEFAULT_SHORTCUTS = {
  newTab: 'Ctrl+T',
  closeTab: 'Ctrl+W',
  incognitoTab: 'Ctrl+Shift+N',
  reload: 'Ctrl+R',
  find: 'Ctrl+F',
  bookmark: 'Ctrl+D',
  history: 'Ctrl+H',
  settings: 'Ctrl+,',
  devtools: 'F12',
  home: 'Alt+Home',
  back: 'Alt+Left',
  forward: 'Alt+Right',
  zoomIn: 'Ctrl++',
  zoomOut: 'Ctrl+-',
  fullscreen: 'F11',
  notepad: 'Ctrl+Shift+N',
  screenshot: 'Ctrl+Shift+S',
  splitView: 'Ctrl+Shift+V'
};

// Dosya okuma/yazma yardımcıları
function readJSON(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.error('Read error:', e);
  }
  return defaultValue;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Write error:', e);
    return false;
  }
}

// ========== PERFORMANS BAYRAKLARI ==========
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder,CanvasOopRasterization');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512 --lite-mode');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      backgroundThrottling: true,
      v8CacheOptions: 'bypassHeatCheck'
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.loadFile('index.html');
  
  // Sağ tık menüsü için webview'a ilet
  mainWindow.webContents.on('context-menu', (e, params) => {
    mainWindow.webContents.send('context-menu', params);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true);
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false);
  });
}

// ========== PENCERE KONTROLLER ==========
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());
ipcMain.handle('window-is-maximized', () => mainWindow.isMaximized());

// Fullscreen toggle
ipcMain.handle('toggle-fullscreen', () => {
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
  return mainWindow.isFullScreen();
});
ipcMain.handle('is-fullscreen', () => mainWindow.isFullScreen());

// ========== YER İMLERİ ==========
ipcMain.handle('bookmarks-get', () => readJSON(BOOKMARKS_FILE, []));
ipcMain.handle('bookmarks-add', (e, bookmark) => {
  const bookmarks = readJSON(BOOKMARKS_FILE, []);
  bookmark.id = Date.now();
  bookmark.createdAt = new Date().toISOString();
  bookmarks.push(bookmark);
  writeJSON(BOOKMARKS_FILE, bookmarks);
  return bookmarks;
});
ipcMain.handle('bookmarks-remove', (e, id) => {
  let bookmarks = readJSON(BOOKMARKS_FILE, []);
  bookmarks = bookmarks.filter(b => b.id !== id);
  writeJSON(BOOKMARKS_FILE, bookmarks);
  return bookmarks;
});

// ========== GEÇMİŞ ==========
ipcMain.handle('history-get', () => readJSON(HISTORY_FILE, []));
ipcMain.handle('history-add', (e, item) => {
  const history = readJSON(HISTORY_FILE, []);
  item.id = Date.now();
  item.visitedAt = new Date().toISOString();
  history.unshift(item);
  if (history.length > 1000) history.pop();
  writeJSON(HISTORY_FILE, history);
  return true;
});
ipcMain.handle('history-clear', () => {
  writeJSON(HISTORY_FILE, []);
  return true;
});
ipcMain.handle('history-remove', (e, id) => {
  let history = readJSON(HISTORY_FILE, []);
  history = history.filter(h => h.id !== id);
  writeJSON(HISTORY_FILE, history);
  return history;
});

// ========== HIZLI ERİŞİM ==========
ipcMain.handle('speeddial-get', () => readJSON(SPEEDDIAL_FILE, []));
ipcMain.handle('speeddial-add', (e, item) => {
  const items = readJSON(SPEEDDIAL_FILE, []);
  item.id = Date.now();
  items.push(item);
  writeJSON(SPEEDDIAL_FILE, items);
  return items;
});
ipcMain.handle('speeddial-remove', (e, id) => {
  let items = readJSON(SPEEDDIAL_FILE, []);
  items = items.filter(i => i.id !== id);
  writeJSON(SPEEDDIAL_FILE, items);
  return items;
});

// ========== ŞİFRE YÖNETİCİSİ ==========
ipcMain.handle('passwords-get', () => readJSON(PASSWORDS_FILE, []));
ipcMain.handle('passwords-add', (e, password) => {
  const passwords = readJSON(PASSWORDS_FILE, []);
  password.id = Date.now();
  password.createdAt = new Date().toISOString();
  passwords.push(password);
  writeJSON(PASSWORDS_FILE, passwords);
  return passwords;
});
ipcMain.handle('passwords-remove', (e, id) => {
  let passwords = readJSON(PASSWORDS_FILE, []);
  passwords = passwords.filter(p => p.id !== id);
  writeJSON(PASSWORDS_FILE, passwords);
  return passwords;
});

// ========== AYARLAR ==========
ipcMain.handle('settings-get', () => readJSON(SETTINGS_FILE, DEFAULT_SETTINGS));
ipcMain.handle('settings-set', (e, settings) => {
  writeJSON(SETTINGS_FILE, settings);
  return settings;
});

// ========== KLAVYE KISAYOLLARI ==========
ipcMain.handle('shortcuts-get', () => readJSON(SHORTCUTS_FILE, DEFAULT_SHORTCUTS));
ipcMain.handle('shortcuts-set', (e, shortcuts) => {
  writeJSON(SHORTCUTS_FILE, shortcuts);
  return shortcuts;
});
ipcMain.handle('shortcuts-reset', () => {
  writeJSON(SHORTCUTS_FILE, DEFAULT_SHORTCUTS);
  return DEFAULT_SHORTCUTS;
});

// ========== NOT DEFTERİ ==========
ipcMain.handle('notes-get', () => readJSON(NOTES_FILE, []));
ipcMain.handle('notes-add', (e, note) => {
  const notes = readJSON(NOTES_FILE, []);
  note.id = Date.now();
  note.createdAt = new Date().toISOString();
  note.updatedAt = note.createdAt;
  notes.unshift(note);
  writeJSON(NOTES_FILE, notes);
  return notes;
});
ipcMain.handle('notes-update', (e, { id, content, title }) => {
  const notes = readJSON(NOTES_FILE, []);
  const note = notes.find(n => n.id === id);
  if (note) {
    note.content = content;
    if (title) note.title = title;
    note.updatedAt = new Date().toISOString();
    writeJSON(NOTES_FILE, notes);
  }
  return notes;
});
ipcMain.handle('notes-remove', (e, id) => {
  let notes = readJSON(NOTES_FILE, []);
  notes = notes.filter(n => n.id !== id);
  writeJSON(NOTES_FILE, notes);
  return notes;
});

// ========== OKUMA LİSTESİ ==========
ipcMain.handle('readinglist-get', () => readJSON(READINGLIST_FILE, []));
ipcMain.handle('readinglist-add', (e, item) => {
  const list = readJSON(READINGLIST_FILE, []);
  item.id = Date.now();
  item.addedAt = new Date().toISOString();
  item.read = false;
  list.unshift(item);
  writeJSON(READINGLIST_FILE, list);
  return list;
});
ipcMain.handle('readinglist-toggle', (e, id) => {
  const list = readJSON(READINGLIST_FILE, []);
  const item = list.find(i => i.id === id);
  if (item) {
    item.read = !item.read;
    writeJSON(READINGLIST_FILE, list);
  }
  return list;
});
ipcMain.handle('readinglist-remove', (e, id) => {
  let list = readJSON(READINGLIST_FILE, []);
  list = list.filter(i => i.id !== id);
  writeJSON(READINGLIST_FILE, list);
  return list;
});

// ========== SEKME GRUPLARI ==========
ipcMain.handle('tabgroups-get', () => readJSON(TABGROUPS_FILE, []));
ipcMain.handle('tabgroups-add', (e, group) => {
  const groups = readJSON(TABGROUPS_FILE, []);
  group.id = Date.now();
  groups.push(group);
  writeJSON(TABGROUPS_FILE, groups);
  return groups;
});
ipcMain.handle('tabgroups-update', (e, group) => {
  const groups = readJSON(TABGROUPS_FILE, []);
  const idx = groups.findIndex(g => g.id === group.id);
  if (idx !== -1) {
    groups[idx] = group;
    writeJSON(TABGROUPS_FILE, groups);
  }
  return groups;
});
ipcMain.handle('tabgroups-remove', (e, id) => {
  let groups = readJSON(TABGROUPS_FILE, []);
  groups = groups.filter(g => g.id !== id);
  writeJSON(TABGROUPS_FILE, groups);
  return groups;
});

// ========== ZAMAN TAKİBİ ==========
ipcMain.handle('timetracking-get', () => readJSON(TIMETRACKING_FILE, {}));
ipcMain.handle('timetracking-update', (e, { domain, seconds }) => {
  const tracking = readJSON(TIMETRACKING_FILE, {});
  const today = new Date().toISOString().split('T')[0];
  if (!tracking[today]) tracking[today] = {};
  if (!tracking[today][domain]) tracking[today][domain] = 0;
  tracking[today][domain] += seconds;
  writeJSON(TIMETRACKING_FILE, tracking);
  return tracking;
});
ipcMain.handle('timetracking-clear', () => {
  writeJSON(TIMETRACKING_FILE, {});
  return {};
});

// ========== YAPILACAKLAR (TODOS) ==========
ipcMain.handle('todos-get', () => readJSON(TODOS_FILE, []));
ipcMain.handle('todos-add', (e, todo) => {
  const todos = readJSON(TODOS_FILE, []);
  todo.id = Date.now();
  todo.createdAt = new Date().toISOString();
  todo.completed = false;
  todos.unshift(todo);
  writeJSON(TODOS_FILE, todos);
  return todos;
});
ipcMain.handle('todos-update', (e, todo) => {
  const todos = readJSON(TODOS_FILE, []);
  const idx = todos.findIndex(t => t.id === todo.id);
  if (idx !== -1) {
    todos[idx] = { ...todos[idx], ...todo, updatedAt: new Date().toISOString() };
    writeJSON(TODOS_FILE, todos);
  }
  return todos;
});
ipcMain.handle('todos-remove', (e, id) => {
  let todos = readJSON(TODOS_FILE, []);
  todos = todos.filter(t => t.id !== id);
  writeJSON(TODOS_FILE, todos);
  return todos;
});
ipcMain.handle('todos-clear-completed', () => {
  let todos = readJSON(TODOS_FILE, []);
  todos = todos.filter(t => !t.completed);
  writeJSON(TODOS_FILE, todos);
  return todos;
});

// ========== OTURUM YÖNETİCİSİ ==========
ipcMain.handle('sessions-get', () => readJSON(SESSIONS_FILE, {}));
ipcMain.handle('sessions-save', (e, data) => {
  const sessions = readJSON(SESSIONS_FILE, {});
  if (data.name) {
    sessions[data.name] = { tabs: data.tabs, savedAt: new Date().toISOString() };
  } else {
    sessions._lastSession = { tabs: data.tabs, savedAt: new Date().toISOString() };
  }
  writeJSON(SESSIONS_FILE, sessions);
  return sessions;
});
ipcMain.handle('sessions-restore', (e, name) => {
  const sessions = readJSON(SESSIONS_FILE, {});
  return sessions[name || '_lastSession'] || null;
});
ipcMain.handle('sessions-remove', (e, name) => {
  const sessions = readJSON(SESSIONS_FILE, {});
  delete sessions[name];
  writeJSON(SESSIONS_FILE, sessions);
  return sessions;
});

// ========== OTOMATİK DOLDURMA ==========
ipcMain.handle('autofill-get', () => readJSON(AUTOFILL_FILE, {}));
ipcMain.handle('autofill-set', (e, data) => {
  writeJSON(AUTOFILL_FILE, data);
  return data;
});

// ========== EKRAN GÖRÜNTÜSÜ ==========
ipcMain.handle('screenshot-take', async (e, dataUrl) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `barly-screenshot-${Date.now()}.png`,
      filters: [{ name: 'PNG', extensions: ['png'] }]
    });
    if (filePath) {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
      return filePath;
    }
  } catch (err) {
    console.error('Screenshot save error:', err);
  }
  return null;
});

ipcMain.handle('screenshot-clipboard', (e, dataUrl) => {
  try {
    const img = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(img);
    return true;
  } catch (err) {
    console.error('Screenshot clipboard error:', err);
    return false;
  }
});

// ========== İNDİRMELER ==========
ipcMain.handle('download-show', (e, filePath) => {
  shell.showItemInFolder(filePath);
});
ipcMain.handle('download-open', (e, filePath) => {
  shell.openPath(filePath);
});
ipcMain.handle('save-source-code', async (e, { fileName, content }) => {
  const safeName = fileName.replace(/[<>:"\/|?*]/g, '_');
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: safeName,
    filters: [{ name: 'HTML', extensions: ['html'] }]
  });
  if (filePath) {
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }
  return null;
});

// ========== NATIVE THEME ==========
ipcMain.handle('set-native-theme', (e, mode) => {
  // mode: 'dark', 'light', 'system'
  nativeTheme.themeSource = mode;
  return true;
});

// ========== KOD ENJEKTE ==========
let injectedCssKeys = {}; // webContentsId -> cssKey

ipcMain.handle('inject-css', async (e, { webContentsId, css }) => {
  try {
    const wc = webContents.fromId(webContentsId);
    if (!wc || wc.isDestroyed()) return { success: false, error: 'Sayfa bulunamadı (wc:' + webContentsId + ')' };
    
    // Remove previous CSS injection
    if (injectedCssKeys[webContentsId]) {
      try { await wc.removeInsertedCSS(injectedCssKeys[webContentsId]); } catch(e) {}
      delete injectedCssKeys[webContentsId];
    }
    
    // insertCSS with 'author' origin - same priority as site's own CSS
    // Since it's injected LAST, it wins by cascade order
    const key = await wc.insertCSS(css);
    injectedCssKeys[webContentsId] = key;
    return { success: true, key };
  } catch(err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('inject-js', async (e, { webContentsId, code }) => {
  try {
    const wc = webContents.fromId(webContentsId);
    if (!wc || wc.isDestroyed()) return { success: false, error: 'Sayfa bulunamadı' };
    const result = await wc.executeJavaScript(code, true);
    return { success: true, result: String(result || '') };
  } catch(err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('remove-injected-css', async (e, { webContentsId }) => {
  try {
    if (injectedCssKeys[webContentsId]) {
      const wc = webContents.fromId(webContentsId);
      if (wc && !wc.isDestroyed()) {
        await wc.removeInsertedCSS(injectedCssKeys[webContentsId]);
      }
      delete injectedCssKeys[webContentsId];
    }
    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('enable-pip', async (e, { webContentsId }) => {
  try {
    const wc = webContents.fromId(webContentsId);
    if (!wc) return { success: false, error: 'WebContents bulunamadı' };
    const result = await wc.executeJavaScript(`
      (async function() {
        // Find video - check main page and iframes
        let video = document.querySelector('video');
        if (!video) {
          // Try to find in iframes (YouTube etc.)
          const iframes = document.querySelectorAll('iframe');
          for (const iframe of iframes) {
            try {
              video = iframe.contentDocument?.querySelector('video');
              if (video) break;
            } catch(e) {}
          }
        }
        if (!video) {
          // Try looking for video in shadow DOMs
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            if (el.shadowRoot) {
              video = el.shadowRoot.querySelector('video');
              if (video) break;
            }
          }
        }
        if (video) {
          try {
            if (video.paused) await video.play();
            await video.requestPictureInPicture();
            return 'ok';
          } catch(err) {
            return 'pip-error: ' + err.message;
          }
        }
        return 'no-video';
      })()
    `);
    return { success: true, result };
  } catch(err) {
    return { success: false, error: err.message };
  }
});

// ========== DIŞ BAĞLANTI ==========
ipcMain.handle('open-external', (e, url) => {
  shell.openExternal(url);
});

// ========== QR KOD ==========
ipcMain.handle('generate-qr', (e, text) => {
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedText}`;
});

// ========== SAYFA ARŞİVLEME ==========
ipcMain.handle('archive-page', (e, url) => {
  return `https://web.archive.org/save/${url}`;
});

// ========== REKLAM ENGELLEYİCİ ==========
ipcMain.handle('adblock-toggle', (e, enabled) => {
  // Basit reklam engelleme
  if (enabled) {
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*.doubleclick.net/*', '*://*.googlesyndication.com/*', '*://*.googleadservices.com/*', '*://*.adnxs.com/*'] }, (details, callback) => {
      callback({ cancel: true });
    });
  }
  return enabled;
});

// ========== ÇEVRİMDIŞI SAYFALAR ==========
ipcMain.handle('offline-get', () => readJSON(OFFLINE_FILE, []));

ipcMain.handle('offline-save', async (e, { title, url, html }) => {
  const list = readJSON(OFFLINE_FILE, []);
  const id = Date.now();
  const fileName = `offline-${id}.html`;
  const filePath = path.join(OFFLINE_PAGES_DIR, fileName);
  fs.writeFileSync(filePath, html, 'utf8');
  list.push({ id, title, url, fileName, savedAt: new Date().toISOString() });
  writeJSON(OFFLINE_FILE, list);
  return { success: true, id };
});

ipcMain.handle('offline-load', (e, id) => {
  const list = readJSON(OFFLINE_FILE, []);
  const item = list.find(i => i.id === id);
  if (!item) return { success: false, error: 'Sayfa bulunamadı' };
  const filePath = path.join(OFFLINE_PAGES_DIR, item.fileName);
  if (!fs.existsSync(filePath)) return { success: false, error: 'Dosya bulunamadı' };
  const html = fs.readFileSync(filePath, 'utf8');
  return { success: true, html, title: item.title, url: item.url };
});

ipcMain.handle('offline-remove', (e, id) => {
  let list = readJSON(OFFLINE_FILE, []);
  const item = list.find(i => i.id === id);
  if (item) {
    const filePath = path.join(OFFLINE_PAGES_DIR, item.fileName);
    try { fs.unlinkSync(filePath); } catch(e) {}
  }
  list = list.filter(i => i.id !== id);
  writeJSON(OFFLINE_FILE, list);
  return { success: true };
});

// ========== TEMA ÖZELLEŞTİRME ==========
ipcMain.handle('themes-get', () => readJSON(THEMES_FILE, {}));
ipcMain.handle('themes-set', (e, data) => { writeJSON(THEMES_FILE, data); return true; });

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Arka Plan Görseli Seç',
    filters: [{ name: 'Görseller', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }],
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath);
  const destName = `wallpaper-${Date.now()}${ext}`;
  const destPath = path.join(DATA_PATH, destName);
  fs.copyFileSync(srcPath, destPath);
  return destPath;
});

// ========== SİTE LİMİTLERİ ==========
ipcMain.handle('sitelimits-get', () => readJSON(SITELIMITS_FILE, {}));
ipcMain.handle('sitelimits-set', (e, data) => { writeJSON(SITELIMITS_FILE, data); return true; });

// ========== SAYFA NOTLARI (ANNOTATIONS) ==========
ipcMain.handle('annotations-get', () => readJSON(ANNOTATIONS_FILE, {}));
ipcMain.handle('annotations-set', (e, data) => { writeJSON(ANNOTATIONS_FILE, data); return true; });

// ========== LİNK ÖNİZLEME ==========
ipcMain.handle('fetch-link-preview', async (e, url) => {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const httpModule = parsedUrl.protocol === 'https:' ? require('https') : require('http');
      const req = httpModule.get(url, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Barly/4.0' }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) { resolve(null); return; }
        let html = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { html += chunk; if (html.length > 50000) res.destroy(); });
        res.on('end', () => {
          const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
          const descM = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i);
          const imgM = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i);
          resolve({
            title: title.trim().substring(0, 150),
            description: (descM ? (descM[1] || '') : '').trim().substring(0, 200),
            image: imgM ? (imgM[1] || '') : ''
          });
        });
        res.on('error', () => resolve(null));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    } catch(err) { resolve(null); }
  });
});

// ========== TÜM VERİLERİ TEMİZLE ==========
ipcMain.handle('clear-all-data', () => {
  const files = [BOOKMARKS_FILE, HISTORY_FILE, PASSWORDS_FILE, SPEEDDIAL_FILE, NOTES_FILE, READINGLIST_FILE, TABGROUPS_FILE, TIMETRACKING_FILE, TODOS_FILE, SESSIONS_FILE, AUTOFILL_FILE];
  files.forEach(f => { try { fs.unlinkSync(f); } catch(e) {} });
  return true;
});

// ========== PENCERE KAPANIRKEN OTURUM KAYDET ==========
app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app-closing');
  }
});

app.whenReady().then(() => {
  // Startup ad blocker
  const savedSettings = readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
  if (savedSettings.adBlockEnabled) {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['*://*.doubleclick.net/*', '*://*.googlesyndication.com/*', '*://*.googleadservices.com/*', '*://*.adnxs.com/*', '*://*.ads.yahoo.com/*', '*://*.advertising.com/*', '*://*.outbrain.com/*', '*://*.taboola.com/*', '*://*.moatads.com/*'] },
      (details, callback) => { callback({ cancel: true }); }
    );
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// end of file
