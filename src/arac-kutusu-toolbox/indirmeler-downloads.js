// ========== İNDİRMELER - DOWNLOADS ==========
// FIX #1: Gerçek indirmeleri takip eden panel

import { dom, state } from '../cekirdek-core/durum-state.js';
import { on } from '../cekirdek-core/olaylar-events.js';
import { showToast, showPanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, formatBytes } from '../cekirdek-core/yardimcilar-helpers.js';

export function initDownloads() {
  // IPC'den gelen gerçek indirme olaylarını dinle
  if (window.electronAPI.onDownloadStarted) {
    window.electronAPI.onDownloadStarted((data) => {
      state.downloads.unshift({
        id: data.id,
        name: data.filename,
        path: data.savePath,
        totalBytes: data.totalBytes,
        receivedBytes: 0,
        status: 'downloading',
        startTime: Date.now()
      });
      showToast(`📥 İndiriliyor: ${data.filename}`, 'info');
    });
  }

  if (window.electronAPI.onDownloadProgress) {
    window.electronAPI.onDownloadProgress((data) => {
      const dl = state.downloads.find(d => d.id === data.id);
      if (dl) {
        dl.receivedBytes = data.receivedBytes;
        dl.totalBytes = data.totalBytes;
        dl.status = 'downloading';
      }
    });
  }

  if (window.electronAPI.onDownloadDone) {
    window.electronAPI.onDownloadDone((data) => {
      const dl = state.downloads.find(d => d.id === data.id);
      if (dl) {
        dl.status = data.state; // 'completed' or 'cancelled' or 'interrupted'
        dl.receivedBytes = dl.totalBytes;
        if (data.state === 'completed') {
          showToast(`✅ İndirildi: ${dl.name}`, 'success');
        }
      }
    });
  }
}

export function showDownloadsPanel() {
  let content = '';
  if (state.downloads.length === 0) {
    content = `<div class="panel-empty"><div class="panel-empty-icon">📥</div>İndirme yok</div>`;
  } else {
    content = '<div id="downloads-list">';
    state.downloads.forEach(d => {
      const progress = d.totalBytes > 0 ? Math.round((d.receivedBytes / d.totalBytes) * 100) : 0;
      const statusText = d.status === 'downloading'
        ? `⬇️ %${progress} — ${formatBytes(d.receivedBytes)} / ${formatBytes(d.totalBytes)}`
        : d.status === 'completed' ? '✅ Tamamlandı' : d.status === 'cancelled' ? '❌ İptal' : `⚠️ ${d.status}`;
      content += `
        <div class="panel-item">
          <div class="panel-item-icon">📄</div>
          <div class="panel-item-info">
            <div class="panel-item-title">${escapeHtml(d.name)}</div>
            <div class="panel-item-subtitle">${statusText}</div>
            ${d.status === 'downloading' ? `<div class="download-progress-bar"><div class="download-progress-fill" style="width:${progress}%"></div></div>` : ''}
          </div>
          ${d.status === 'completed' && d.path ? `<button class="panel-item-action download-open" data-path="${escapeHtml(d.path)}" title="Klasörü Aç">📂</button>` : ''}
        </div>`;
    });
    content += '</div>';
    content += '<button class="btn btn-secondary" id="clear-downloads-btn" style="width:100%;margin-top:12px;">🗑️ Listeyi Temizle</button>';
  }
  showPanel('📥 İndirilenler', content);

  setTimeout(() => {
    document.querySelectorAll('.download-open').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { window.electronAPI.showDownload(btn.dataset.path); } catch(err) {}
      });
    });
    document.getElementById('clear-downloads-btn')?.addEventListener('click', () => {
      state.downloads = state.downloads.filter(d => d.status === 'downloading');
      showDownloadsPanel();
      showToast('Liste temizlendi', 'success');
    });
  }, 50);
}
