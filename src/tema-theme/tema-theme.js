// ========== TEMA - THEME ==========
// Tema ayarları, preset'ler, duvar kağıdı, font, kompakt mod

import { dom, state, $ } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';

// themeConfig - ayrı state, settings'ten bağımsız
export let themeConfig = { preset: 'default', wallpaper: null, forceWebTheme: true };

export function setThemeConfig(tc) {
  themeConfig = { ...themeConfig, ...tc };
}

export const THEME_PRESETS = [
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

export function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  if (dom.appContainer && state.tabs.some(t => t.isIncognito && t.id === state.activeTabId)) {
    dom.appContainer.classList.add('incognito-mode');
  }
  state.settings.theme = theme;

  if (themeConfig.forceWebTheme) applyWebTheme();

  // Re-apply preset colors on body (class change resets inline styles)
  if (themeConfig.preset && themeConfig.preset !== 'default') {
    const preset = THEME_PRESETS.find(p => p.id === themeConfig.preset);
    if (preset) applyThemePreset(preset, true);
  }
}

export function applyWebTheme() {
  const mode = state.settings.theme === 'dark' ? 'dark' : 'light';
  try { window.electronAPI.setNativeTheme(mode); } catch(e) {}
}

export function applyWallpaper(wallpaperPath) {
  if (!dom.startPage) return;
  if (wallpaperPath) {
    dom.startPage.style.backgroundImage = `url('file:///${wallpaperPath.replace(/\\/g, '/')}')`;
    dom.startPage.classList.add('has-wallpaper');
  } else {
    dom.startPage.style.backgroundImage = '';
    dom.startPage.classList.remove('has-wallpaper');
  }
}

export function toggleTheme() {
  const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  window.electronAPI.setSettings(state.settings);
  showToast(`${newTheme === 'dark' ? '🌙 Karanlık' : '☀️ Aydınlık'} tema`, 'success');
}

export function applyFont(fontFamily) {
  document.documentElement.style.setProperty('--ui-font', `'${fontFamily}'`);
}

export function applyCompactMode(compact) {
  state.settings.compactMode = compact;
  if (dom.appContainer) dom.appContainer.classList.toggle('compact', compact);
  if (dom.compactToggleBtn) dom.compactToggleBtn.classList.toggle('hidden', !compact);
  if (dom.btnCompact) dom.btnCompact.classList.toggle('active', compact);
}

export function toggleCompactMode() {
  applyCompactMode(!state.settings.compactMode);
  window.electronAPI.setSettings(state.settings);
  showToast(state.settings.compactMode ? '◫ Kompakt mod açık' : '◫ Kompakt mod kapalı', 'success');
}

export function applyThemePreset(preset, silent) {
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

export function saveThemeConfig() {
  try { window.electronAPI.setThemes(themeConfig); } catch(e) {}
}

export function showThemeCustomizer() {
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
            <button class="btn ${state.settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}" id="theme-mode-dark" style="flex:1;">🌙 Karanlık</button>
            <button class="btn ${state.settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}" id="theme-mode-light" style="flex:1;">☀️ Aydınlık</button>
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
    state.settings.theme = 'dark';
    applyTheme('dark');
    window.electronAPI.setSettings(state.settings);
    overlay.querySelector('#theme-mode-dark').className = 'btn btn-primary';
    overlay.querySelector('#theme-mode-light').className = 'btn btn-secondary';
    showToast('🌙 Karanlık tema', 'success');
  });

  overlay.querySelector('#theme-mode-light').addEventListener('click', () => {
    state.settings.theme = 'light';
    applyTheme('light');
    window.electronAPI.setSettings(state.settings);
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
  const selectWallpaper = async () => {
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
  };
  overlay.querySelector('#wallpaper-select').addEventListener('click', selectWallpaper);
  overlay.querySelector('#wallpaper-preview').addEventListener('click', selectWallpaper);

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
