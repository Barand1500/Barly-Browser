// ========== ÇEVRİMDIŞI SAYFALAR - OFFLINE PAGES ==========
// FIX #6: Okuma listesi ve çevrimdışı sayfalar birleştirildi

import { $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, hidePanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, getDomain } from '../cekirdek-core/yardimcilar-helpers.js';

let _getActiveTab = null;
let _getActiveWebview = null;
let _hideStartPage = null;

export function initOffline(getActiveTab, getActiveWebview, hideStartPage) {
  _getActiveTab = getActiveTab;
  _getActiveWebview = getActiveWebview;
  _hideStartPage = hideStartPage;
}

export async function saveOfflinePage() {
  const tab = _getActiveTab?.();
  const webview = _getActiveWebview?.();
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
    if (result.success) showToast('📴 Sayfa çevrimdışı kaydedildi!', 'success');
    else showToast('❌ Kaydetme hatası', 'error');
  } catch(e) {
    showToast('❌ Sayfa kaydedilemedi: ' + (e.message || ''), 'error');
  }
}

export async function showOfflinePanel() {
  try {
    const list = await window.electronAPI.getOfflinePages();
    let content = `<div style="padding:12px;background:var(--accent-glow);border-radius:10px;margin-bottom:14px;font-size:12px;color:var(--text-dim);">
      📴 <strong>Çevrimdışı Mod:</strong> Sayfanın son aktif halini kaydedin ve internet olmadan bile açın.
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
          </div>`;
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
            const tab = _getActiveTab?.();
            if (tab) {
              tab.isStartPage = false;
              tab.title = data.title + ' (Çevrimdışı)';
              tab.url = data.url;
              _hideStartPage?.();
              tab.webview.classList.add('active');
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
          showOfflinePanel();
        });
      });
    }, 50);
  } catch(e) {
    showToast('❌ Çevrimdışı listesi yüklenemedi', 'error');
  }
}
