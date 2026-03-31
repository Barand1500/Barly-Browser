// ========== SES KONTROLÜ - VOLUME CONTROL ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';
import { on, emit } from '../cekirdek-core/olaylar-events.js';

// ===== MUTE / VOLUME =====
export function toggleMute(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab) return;
  tab.muted = !tab.muted;
  try { webview.setAudioMuted(tab.muted); } catch(e) {}
  updateMuteButton(tab);
  updateTabMuteIcon(tab);
  emit('mute-changed', { tabId: tab.id, muted: tab.muted });
  showToast(tab.muted ? '🔇 Ses kapatıldı' : '🔊 Ses açıldı', 'info');
}

export function updateMuteButton(tab) {
  const btn = $('btn-mute');
  if (btn && tab) btn.textContent = tab.muted ? '🔇' : '🔊';
}

export function updateTabMuteIcon(tab) {
  if (!tab) return;
  const tabEl = document.querySelector(`.tab[data-tab-id="${tab.id}"]`);
  if (tabEl) {
    let icon = tabEl.querySelector('.tab-mute-icon');
    if (tab.muted) {
      if (!icon) { icon = document.createElement('span'); icon.className = 'tab-mute-icon'; icon.textContent = '🔇'; tabEl.querySelector('.tab-title')?.after(icon); }
    } else { if (icon) icon.remove(); }
  }
}

export function showVolumeControl(getActiveTab) {
  const existing = document.querySelector('.volume-dropdown');
  if (existing) { existing.remove(); return; }
  const dropdown = document.createElement('div');
  dropdown.className = 'volume-dropdown';
  const tabItems = state.tabs.filter(t => !t.isStartPage).map(t => `
    <div class="volume-tab-item">
      <span class="volume-tab-title">${(t.title || 'Sekme').substring(0, 25)}</span>
      <button class="volume-tab-mute ${t.muted ? 'muted' : ''}" data-tab-id="${t.id}">${t.muted ? '🔇' : '🔊'}</button>
    </div>
  `).join('');
  dropdown.innerHTML = `
    <div class="volume-header">🔊 Ses Kontrolleri</div>
    <div class="volume-tabs">${tabItems || '<div style="padding:8px;color:var(--text-dim);font-size:12px;">Aktif sekme yok</div>'}</div>
    <div class="volume-actions">
      <button class="volume-action-btn" id="mute-all-btn">🔇 Tümünü Kapat</button>
      <button class="volume-action-btn" id="unmute-all-btn">🔊 Tümünü Aç</button>
    </div>
  `;
  const btn = $('btn-mute');
  if (btn) { btn.parentElement.style.position = 'relative'; btn.parentElement.appendChild(dropdown); }
  else document.body.appendChild(dropdown);

  dropdown.querySelectorAll('.volume-tab-mute').forEach(b => {
    b.addEventListener('click', () => {
      const tId = parseInt(b.dataset.tabId);
      const t = state.tabs.find(x => x.id === tId);
      if (t) {
        t.muted = !t.muted;
        if (t.webview) try { t.webview.setAudioMuted(t.muted); } catch(e) {}
        b.textContent = t.muted ? '🔇' : '🔊';
        b.classList.toggle('muted', t.muted);
        updateTabMuteIcon(t);
        emit('mute-changed', { tabId: t.id, muted: t.muted });
      }
    });
  });
  dropdown.querySelector('#mute-all-btn')?.addEventListener('click', () => {
    state.tabs.forEach(t => { t.muted = true; if (t.webview) try { t.webview.setAudioMuted(true); } catch(e) {} updateTabMuteIcon(t); });
    updateMuteButton(getActiveTab());
    showToast('🔇 Tüm sekmeler sessiz', 'info');
    dropdown.remove();
  });
  dropdown.querySelector('#unmute-all-btn')?.addEventListener('click', () => {
    state.tabs.forEach(t => { t.muted = false; if (t.webview) try { t.webview.setAudioMuted(false); } catch(e) {} updateTabMuteIcon(t); });
    updateMuteButton(getActiveTab());
    showToast('🔊 Tüm sesler açıldı', 'info');
    dropdown.remove();
  });
  setTimeout(() => {
    function closeVol(e) { if (!dropdown.contains(e.target)) { dropdown.remove(); document.removeEventListener('click', closeVol); } }
    document.addEventListener('click', closeVol);
  }, 100);
}

// ===== MINI PLAYER =====
let miniPlayerTabId = null;

export function showMiniPlayer(tab) {
  if (!tab) return;
  miniPlayerTabId = tab.id;
  let player = $('mini-player');
  if (!player) {
    player = document.createElement('div');
    player.id = 'mini-player';
    player.className = 'mini-player';
    player.innerHTML = `
      <div class="mini-player-info"><span class="mini-player-title" id="mini-player-title"></span></div>
      <div class="mini-player-controls">
        <button class="mp-btn" id="mp-play">⏯️</button>
        <button class="mp-btn" id="mp-mute">🔊</button>
        <button class="mp-btn" id="mp-goto">↗️</button>
        <button class="mp-btn" id="mp-close">✕</button>
      </div>
    `;
    document.body.appendChild(player);
    player.querySelector('#mp-play').addEventListener('click', miniPlayerTogglePlay);
    player.querySelector('#mp-mute').addEventListener('click', miniPlayerToggleMute);
    player.querySelector('#mp-goto').addEventListener('click', miniPlayerGoToTab);
    player.querySelector('#mp-close').addEventListener('click', hideMiniPlayer);
  }
  player.querySelector('#mini-player-title').textContent = (tab.title || 'Medya').substring(0, 40);
  player.querySelector('#mp-mute').textContent = tab.muted ? '🔇' : '🔊';
  player.classList.add('visible');
}

export function hideMiniPlayer() {
  const player = $('mini-player');
  if (player) player.classList.remove('visible');
  miniPlayerTabId = null;
}

export function miniPlayerTogglePlay() {
  const tab = state.tabs.find(t => t.id === miniPlayerTabId);
  if (tab && tab.webview) {
    tab.webview.executeJavaScript(`(function(){var v=document.querySelector('video')||document.querySelector('audio');if(v){if(v.paused)v.play();else v.pause();return v.paused?'paused':'playing';}return'no-media';})();`).then(r => {
      showToast(r === 'paused' ? '⏸ Duraklatıldı' : r === 'playing' ? '▶ Oynatılıyor' : '❌ Medya bulunamadı', 'info');
    });
  }
}

export function miniPlayerToggleMute() {
  const tab = state.tabs.find(t => t.id === miniPlayerTabId);
  if (tab) {
    tab.muted = !tab.muted;
    if (tab.webview) try { tab.webview.setAudioMuted(tab.muted); } catch(e) {}
    updateTabMuteIcon(tab);
    const player = $('mini-player');
    if (player) player.querySelector('#mp-mute').textContent = tab.muted ? '🔇' : '🔊';
    emit('mute-changed', { tabId: tab.id, muted: tab.muted });
  }
}

export function miniPlayerGoToTab() {
  if (miniPlayerTabId != null) emit('switch-tab', miniPlayerTabId);
}

export function getMiniPlayerTabId() { return miniPlayerTabId; }
