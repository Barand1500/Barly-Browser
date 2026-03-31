// ========== AYARLAR VE KISAYOLLAR - SETTINGS & SHORTCUTS ==========
import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, hidePanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';
import { applyTheme, applyWebTheme, applyFont, applyCompactMode, saveThemeConfig, showThemeCustomizer, toggleTheme } from '../tema-theme/tema-theme.js';

let shortcuts = {};
let isRecordingShortcut = null;

export const DEFAULT_SHORTCUTS = {
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

export function getShortcuts() { return shortcuts; }
export function setShortcuts(sc) { shortcuts = sc; }
export function getIsRecordingShortcut() { return isRecordingShortcut; }

export function getShortcutValue(action) {
  return shortcuts[action] || DEFAULT_SHORTCUTS[action]?.key || '';
}

export function shortcutKeyToString(e) {
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

function generateShortcutsList() {
  return Object.entries(DEFAULT_SHORTCUTS).map(([action, info]) => {
    const currentKey = getShortcutValue(action);
    return `<div class="shortcut-item"><span class="shortcut-label">${info.label}</span><button class="shortcut-key-btn" data-action="${action}" title="Değiştirmek için tıkla">${escapeHtml(currentKey)}</button></div>`;
  }).join('');
}

function checkShortcutConflict(newKey, excludeAction) {
  for (const [action, info] of Object.entries(DEFAULT_SHORTCUTS)) {
    if (action === excludeAction) continue;
    const current = getShortcutValue(action);
    if (current.toLowerCase() === newKey.toLowerCase()) return info.label;
  }
  return null;
}

function setupShortcutRecording() {
  document.querySelectorAll('.shortcut-key-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (isRecordingShortcut) {
        const prev = document.querySelector('.shortcut-key-btn.recording');
        if (prev) { prev.classList.remove('recording'); prev.textContent = getShortcutValue(prev.dataset.action); }
      }
      isRecordingShortcut = this.dataset.action;
      this.classList.add('recording');
      this.textContent = '⏺ Tuşa bas...';

      const handler = (e) => {
        e.preventDefault(); e.stopPropagation();
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

export async function loadShortcuts() {
  try { shortcuts = await window.electronAPI.getShortcuts() || {}; } catch(e) {}
}

export async function showSettingsPanel() {
  try {
    const loadedSettings = await window.electronAPI.getSettings();
    if (loadedSettings) Object.assign(state.settings, loadedSettings);
    shortcuts = await window.electronAPI.getShortcuts() || {};
  } catch(e) {}

  const fontOptions = ['Inter', 'Segoe UI', 'Roboto', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Arial'];

  const content = `
    <div class="settings-section">
      <div class="settings-section-title">Görünüm</div>
      <div class="settings-item"><div class="settings-item-title">Karanlık Tema</div><div class="toggle ${state.settings.theme === 'dark' ? 'active' : ''}" id="toggle-theme"></div></div>
      <div class="settings-item"><div class="settings-item-title">Web Sayfalarında Karanlık Mod</div><div class="toggle ${state.settings.webTheme ? 'active' : ''}" id="toggle-web-theme"></div></div>
      <div class="settings-item"><div class="settings-item-title">Kompakt Mod</div><div class="toggle ${state.settings.compactMode ? 'active' : ''}" id="toggle-compact"></div></div>
      <div class="settings-item"><div class="settings-item-title">Yazı Tipi</div><select class="form-select" id="font-select" style="width:140px;">${fontOptions.map(f => `<option value="${f}" ${state.settings.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Gizlilik & Güvenlik</div>
      <div class="settings-item"><div class="settings-item-title">Reklam Engelleyici</div><div class="toggle ${state.settings.adBlockEnabled ? 'active' : ''}" id="toggle-adblock"></div></div>
      <div class="settings-item"><div class="settings-item-title">HTTPS Uyarısı</div><div class="toggle ${state.settings.httpsWarning ? 'active' : ''}" id="toggle-https"></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Oturum & Sekmeler</div>
      <div class="settings-item"><div class="settings-item-title">Oturumu Geri Yükle</div><div class="toggle ${state.settings.sessionRestore ? 'active' : ''}" id="toggle-session"></div></div>
      <div class="settings-item"><div class="settings-item-title">Sekme Askıya Alma (dk)</div><select class="form-select" id="suspend-timeout" style="width:80px;">${[5,10,15,30,60].map(m => `<option value="${m}" ${state.settings.tabSuspendTimeout === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Pencere</div>
      <button class="btn btn-secondary" id="btn-fullscreen" style="width:100%;">⛶ Tam Ekran</button>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">⌨️ Kısayolları Yönet</div>
      <div class="shortcuts-list" id="shortcuts-list">${generateShortcutsList()}</div>
      <div style="display:flex;gap:8px;margin-top:12px;"><button class="btn btn-danger" id="reset-shortcuts" style="flex:1;">↩️ Varsayılana Sıfırla</button></div>
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
      state.settings.theme = this.classList.contains('active') ? 'dark' : 'light';
      applyTheme(state.settings.theme);
      window.electronAPI.setSettings(state.settings);
    });
    $('toggle-compact')?.addEventListener('click', function() {
      this.classList.toggle('active');
      state.settings.compactMode = this.classList.contains('active');
      applyCompactMode(state.settings.compactMode);
      window.electronAPI.setSettings(state.settings);
    });
    $('toggle-web-theme')?.addEventListener('click', function() {
      this.classList.toggle('active');
      state.settings.webTheme = this.classList.contains('active');
      showToast(state.settings.webTheme ? '🌐 Web teması açıldı' : '🌐 Web teması kapatıldı', 'info');
      window.electronAPI.setSettings(state.settings);
    });
    $('toggle-adblock')?.addEventListener('click', async function() {
      this.classList.toggle('active');
      state.settings.adBlockEnabled = this.classList.contains('active');
      await window.electronAPI.setSettings(state.settings);
      try { await window.electronAPI.toggleAdBlock(state.settings.adBlockEnabled); } catch(e) {}
      showToast(state.settings.adBlockEnabled ? 'Reklam engelleyici açık' : 'Reklam engelleyici kapalı', 'success');
    });
    $('toggle-https')?.addEventListener('click', function() {
      this.classList.toggle('active');
      state.settings.httpsWarning = this.classList.contains('active');
      window.electronAPI.setSettings(state.settings);
    });
    $('toggle-session')?.addEventListener('click', function() {
      this.classList.toggle('active');
      state.settings.sessionRestore = this.classList.contains('active');
      window.electronAPI.setSettings(state.settings);
    });
    $('font-select')?.addEventListener('change', function() {
      state.settings.fontFamily = this.value;
      applyFont(state.settings.fontFamily);
      window.electronAPI.setSettings(state.settings);
    });
    $('suspend-timeout')?.addEventListener('change', function() {
      state.settings.tabSuspendTimeout = parseInt(this.value);
      window.electronAPI.setSettings(state.settings);
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
