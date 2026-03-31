// ========== ARAÇ ÇUBUĞU - TOOLBAR ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, showModal, hideModal } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

// ===== FIND IN PAGE =====
let findBarVisible = false;

export function showFindBar(getActiveWebview) {
  let bar = $('find-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'find-bar';
    bar.className = 'find-bar';
    bar.innerHTML = `
      <input type="text" id="find-input" placeholder="Sayfada ara..." autocomplete="off">
      <span id="find-count" class="find-count"></span>
      <button class="find-btn" id="find-prev">▲</button>
      <button class="find-btn" id="find-next">▼</button>
      <button class="find-btn" id="find-close">✕</button>
    `;
    document.querySelector('.browser-content')?.appendChild(bar);
    const input = bar.querySelector('#find-input');
    input.addEventListener('input', () => findInPage(getActiveWebview, input.value));
    bar.querySelector('#find-prev').addEventListener('click', () => findInPage(getActiveWebview, input.value, 'prev'));
    bar.querySelector('#find-next').addEventListener('click', () => findInPage(getActiveWebview, input.value, 'next'));
    bar.querySelector('#find-close').addEventListener('click', () => hideFindBar(getActiveWebview));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') findInPage(getActiveWebview, input.value, e.shiftKey ? 'prev' : 'next');
      if (e.key === 'Escape') hideFindBar(getActiveWebview);
    });
  }
  bar.classList.remove('hidden');
  bar.classList.add('visible');
  findBarVisible = true;
  bar.querySelector('#find-input').focus();
}

export function hideFindBar(getActiveWebview) {
  const bar = $('find-bar');
  if (bar) { bar.classList.remove('visible'); bar.classList.add('hidden'); findBarVisible = false; }
  const webview = getActiveWebview();
  if (webview) try { webview.stopFindInPage('clearSelection'); } catch(e) {}
}

export function findInPage(getActiveWebview, text, direction) {
  const webview = getActiveWebview();
  if (!webview || !text) { if (webview) try { webview.stopFindInPage('clearSelection'); } catch(e) {} return; }
  const opts = { forward: direction !== 'prev', findNext: !!direction };
  webview.findInPage(text, opts);
}

export function isFindBarVisible() { return findBarVisible; }

// ===== SCREENSHOT =====
export async function takeScreenshot(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  showToast('📸 Ekran görüntüsü alınıyor...', 'info');
  try {
    const nativeImage = await webview.capturePage();
    const dataUrl = nativeImage.toDataURL();
    let siteName = 'sayfa';
    try { siteName = new URL(tab.url).hostname.replace(/^www\./, ''); } catch(e) {}
    const modalContent = `
      <div style="text-align:center;padding:16px;">
        <img src="${dataUrl}" style="max-width:100%;max-height:400px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.3);">
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:center;flex-wrap:wrap;">
          <button id="ss-copy-btn" class="modal-btn" style="background:var(--accent);color:#fff;">📋 Kopyala</button>
          <button id="ss-save-btn" class="modal-btn" style="background:#22c55e;color:#fff;">💾 Kaydet</button>
          <button id="ss-close-btn" class="modal-btn" style="background:var(--sidebar-bg);color:var(--text);">Kapat</button>
        </div>
      </div>
    `;
    showModal('📸 Ekran Görüntüsü', modalContent);
    setTimeout(() => {
      document.querySelector('#ss-copy-btn')?.addEventListener('click', async () => {
        try {
          const resp = await fetch(dataUrl);
          const blob = await resp.blob();
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          showToast('📋 Panoya kopyalandı', 'success');
        } catch(e) { showToast('❌ Kopyalanamadı', 'error'); }
      });
      document.querySelector('#ss-save-btn')?.addEventListener('click', async () => {
        try {
          const path = await window.electronAPI.saveScreenshot({ dataUrl, siteName });
          if (path) showToast('💾 Kaydedildi: ' + path, 'success'); else showToast('İptal edildi', 'warning');
        } catch(e) { showToast('❌ Kaydedilemedi', 'error'); }
      });
      document.querySelector('#ss-close-btn')?.addEventListener('click', hideModal);
    }, 50);
  } catch(e) { showToast('❌ Ekran görüntüsü alınamadı', 'error'); }
}

// ===== PiP =====
export async function enablePiP(getActiveWebview) {
  const webview = getActiveWebview();
  if (!webview) { showToast('⚠️ Önce bir sayfa aç', 'warning'); return; }
  try {
    const wcId = webview.getWebContentsId();
    await window.electronAPI.enablePiP({ webContentsId: wcId });
    showToast('🖼️ PiP modu açıldı', 'success');
  } catch(e) { showToast('❌ PiP modu açılamadı', 'error'); }
}

// ===== READER MODE =====
export function toggleReaderMode(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  webview.executeJavaScript(`(function(){
    var existing = document.getElementById('barly-reader-overlay');
    if (existing) { existing.remove(); return 'removed'; }
    var article = document.querySelector('article') || document.querySelector('[role="main"]') || document.querySelector('.post-content, .article-body, .entry-content, main');
    var content = article ? article.innerHTML : document.body.innerText.substring(0, 50000);
    var title = document.title;
    var overlay = document.createElement('div');
    overlay.id = 'barly-reader-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:#1a1a2e;color:#e8e8f0;overflow-y:auto;padding:60px 20px;font-family:Georgia,serif;line-height:1.8;font-size:18px;';
    overlay.innerHTML = '<div style="max-width:700px;margin:0 auto;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;"><h1 style="font-size:28px;color:#a78bfa;">'+title+'</h1><button id="barly-reader-close" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:14px;">✕ Kapat</button></div><div style="color:#d1d5db;">'+content+'</div></div>';
    document.body.appendChild(overlay);
    document.getElementById('barly-reader-close').addEventListener('click', function() { overlay.remove(); });
    return 'opened';
  })();`).then(r => {
    showToast(r === 'removed' ? '📖 Okuma modu kapatıldı' : '📖 Okuma modu açıldı', 'info');
  });
}

// ===== QR CODE =====
export async function showQRCode(getActiveTab) {
  const tab = getActiveTab();
  if (!tab || !tab.url || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  try {
    const qrData = await window.electronAPI.generateQR(tab.url);
    showModal('🔲 QR Kod', `<div style="text-align:center;padding:20px;"><img src="${qrData}" style="max-width:220px;border-radius:12px;background:#fff;padding:16px;"><p style="color:var(--text-dim);margin-top:12px;font-size:12px;">${escapeHtml(tab.url).substring(0, 80)}</p></div>`);
  } catch(e) { showToast('❌ QR kod oluşturulamadı', 'error'); }
}

// ===== ARCHIVE =====
export async function archivePage(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  showToast('📦 Sayfa arşivleniyor...', 'info');
  try {
    const html = await webview.executeJavaScript('document.documentElement.outerHTML');
    await window.electronAPI.archivePage({ url: tab.url, title: tab.title, html });
    showToast('✅ Sayfa arşivlendi!', 'success');
  } catch(e) { showToast('❌ Arşivlenemedi', 'error'); }
}

// ===== SHARE =====
export function showShareMenu(getActiveTab) {
  const tab = getActiveTab();
  if (!tab || !tab.url || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  const url = encodeURIComponent(tab.url);
  const title = encodeURIComponent(tab.title || '');
  const services = [
    { name: 'WhatsApp', icon: '💬', fn: () => shareToSocial('whatsapp', tab.url, tab.title) },
    { name: 'Twitter (X)', icon: '🐦', fn: () => shareToSocial('twitter', tab.url, tab.title) },
    { name: 'Telegram', icon: '✈️', fn: () => shareToSocial('telegram', tab.url, tab.title) },
    { name: 'E-posta', icon: '✉️', fn: () => shareToSocial('email', tab.url, tab.title) },
    { name: 'Kopyala', icon: '📋', fn: () => { navigator.clipboard.writeText(tab.url); showToast('📋 URL kopyalandı', 'success'); } },
  ];
  const html = `<div style="display:flex;flex-direction:column;gap:8px;padding:12px;">${services.map((s, i) => `<button class="share-btn" data-idx="${i}" style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--sidebar-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);cursor:pointer;font-size:14px;"><span style="font-size:20px;">${s.icon}</span>${s.name}</button>`).join('')}</div>`;
  showModal('🔗 Paylaş', html);
  setTimeout(() => {
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => { services[parseInt(btn.dataset.idx)].fn(); hideModal(); });
    });
  }, 50);
}

let _getActiveTab = null;

export function initToolbar(getActiveTab) {
  _getActiveTab = getActiveTab;
}

export function shareToSocial(platform) {
  const tab = _getActiveTab ? _getActiveTab() : null;
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
}
