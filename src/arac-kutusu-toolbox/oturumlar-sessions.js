// ========== OTURUMLAR - SESSIONS ==========
import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showModal, hideModal, showPanel, hidePanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

let _createTab = null;
export function initSessions(createTab) { _createTab = createTab; }

export async function showSessionsPanel() {
  try {
    const sessions = await window.electronAPI.getSessions();
    let content = `<button class="btn btn-primary" id="save-session-btn" style="width:100%;margin-bottom:16px;">💾 Mevcut Oturumu Kaydet</button>`;
    const sessionNames = Object.keys(sessions).filter(k => k !== '_lastSession');
    if (sessionNames.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">💾</div>Kayıtlı oturum yok</div>`;
    } else {
      sessionNames.forEach(name => {
        const sess = sessions[name]; const date = new Date(sess.savedAt).toLocaleDateString('tr-TR');
        const tabCount = sess.tabs ? sess.tabs.length : 0;
        content += `<div class="session-item" data-name="${escapeHtml(name)}"><div class="panel-item-icon">💾</div><div class="session-info"><div class="session-name">${escapeHtml(name)}</div><div class="session-meta">${tabCount} sekme • ${date}</div></div><div class="session-actions"><button class="session-action-btn" data-action="restore" data-name="${escapeHtml(name)}" title="Geri Yükle">▶</button><button class="session-action-btn danger" data-action="delete" data-name="${escapeHtml(name)}" title="Sil">✕</button></div></div>`;
      });
    }
    showPanel('💾 Oturum Yöneticisi', content);
    setTimeout(() => {
      $('save-session-btn')?.addEventListener('click', () => {
        showModal('Oturumu Kaydet', `<div class="form-group"><label class="form-label">Oturum Adı</label><input type="text" class="form-input" id="session-name" placeholder="İş sekmeleri, Proje..."></div>`,
          `<button class="btn btn-secondary" id="session-cancel-btn">İptal</button><button class="btn btn-primary" id="confirm-save-session">Kaydet</button>`);
        setTimeout(() => {
          $('session-cancel-btn')?.addEventListener('click', hideModal);
          $('confirm-save-session')?.addEventListener('click', async () => {
            const name = $('session-name')?.value.trim();
            if (name) {
              const sessionTabs = state.tabs.filter(t => !t.isIncognito && t.url && !t.isStartPage).map(t => ({ url: t.url, title: t.title }));
              await window.electronAPI.saveSession({ name, tabs: sessionTabs });
              hideModal(); showSessionsPanel(); showToast('Oturum kaydedildi', 'success');
            }
          });
        }, 50);
      });
      $$('[data-action="restore"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation(); const name = btn.dataset.name;
          const session = await window.electronAPI.restoreSession(name);
          if (session?.tabs) { session.tabs.forEach(t => _createTab?.(t.url)); showToast(`"${name}" oturumu yüklendi`, 'success'); hidePanel(); }
        });
      });
      $$('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async (e) => { e.stopPropagation(); await window.electronAPI.removeSession(btn.dataset.name); showSessionsPanel(); showToast('Oturum silindi', 'success'); });
      });
    }, 50);
  } catch(e) {}
}

export async function saveCurrentSession() {
  const sessionTabs = state.tabs.filter(t => !t.isIncognito && t.url && !t.isStartPage).map(t => ({ url: t.url, title: t.title }));
  if (sessionTabs.length > 0) {
    try { await window.electronAPI.saveSession({ name: '_lastSession', tabs: sessionTabs }); } catch(e) {}
  }
}

export async function restoreLastSession() {
  try {
    const session = await window.electronAPI.restoreSession('_lastSession');
    if (session?.tabs?.length > 0) {
      session.tabs.forEach(t => _createTab?.(t.url));
      showToast('Son oturum geri yüklendi', 'success');
    }
  } catch(e) {}
}
