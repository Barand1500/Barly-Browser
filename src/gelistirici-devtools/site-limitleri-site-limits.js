// ========== SİTE LİMİTLERİ - SITE LIMITS ==========
import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml, getDomain } from '../cekirdek-core/yardimcilar-helpers.js';

let siteLimits = {};

export async function initSiteLimits() {
  siteLimits = await window.electronAPI.getSiteLimits() || {};
}

export function getSiteLimits() { return siteLimits; }

export async function showSiteLimitsPanel() {
  siteLimits = await window.electronAPI.getSiteLimits() || {};
  const domains = Object.entries(siteLimits);
  let listHTML = domains.map(([domain, minutes]) => `
    <div class="site-limit-panel-item"><div><div class="site-limit-domain">${escapeHtml(domain)}</div><div class="site-limit-time">${minutes} dk/gün</div></div><button class="site-limit-remove" data-domain="${escapeHtml(domain)}" title="Kaldır">✕</button></div>
  `).join('');
  if (!listHTML) listHTML = '<div style="color:var(--text-dim);font-size:12px;padding:12px;">Henüz limit eklenmedi</div>';

  const html = `<div style="padding:12px;"><div style="display:flex;gap:6px;margin-bottom:16px;"><input type="text" id="limit-domain-input" placeholder="alan adı (ör: youtube.com)" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-size:13px;outline:none;"><input type="number" id="limit-minutes-input" placeholder="dk" min="1" max="1440" style="width:60px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-size:13px;outline:none;text-align:center;"><button id="limit-add-btn" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:500;">Ekle</button></div><div id="limits-list">${listHTML}</div></div>`;

  showPanel('⏱️ Site Limitleri', html);
  setTimeout(() => {
    $('limit-add-btn')?.addEventListener('click', async () => {
      const domain = $('limit-domain-input')?.value.trim().toLowerCase();
      const minutes = parseInt($('limit-minutes-input')?.value);
      if (!domain || !minutes || minutes < 1) { showToast('Geçerli alan adı ve süre girin', 'warning'); return; }
      siteLimits[domain] = minutes;
      await window.electronAPI.setSiteLimits(siteLimits);
      showToast(`${domain} için ${minutes} dk limit eklendi`, 'success');
      showSiteLimitsPanel();
    });
    $$('.site-limit-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        delete siteLimits[btn.dataset.domain];
        await window.electronAPI.setSiteLimits(siteLimits);
        showToast(`${btn.dataset.domain} limiti kaldırıldı`, 'info');
        showSiteLimitsPanel();
      });
    });
  }, 50);
}

export async function checkSiteLimit(domain, getActiveTab) {
  if (!domain || Object.keys(siteLimits).length === 0) return;
  const matchedDomain = Object.keys(siteLimits).find(d => domain.includes(d));
  if (!matchedDomain) return;
  const limitMinutes = siteLimits[matchedDomain];
  try {
    const tracking = await window.electronAPI.getTimeTracking();
    const today = new Date().toISOString().split('T')[0];
    const todayData = tracking[today] || {};
    const usedSeconds = todayData[domain] || 0;
    if (usedSeconds / 60 >= limitMinutes) {
      const tab = getActiveTab();
      if (tab && tab.webview && !tab.isStartPage) injectLimitOverlay(tab.webview, matchedDomain, limitMinutes);
    }
  } catch(e) {}
}

function injectLimitOverlay(webview, domain, limitMinutes) {
  const js = `if(!document.getElementById('barly-limit-overlay')){var o=document.createElement('div');o.id='barly-limit-overlay';o.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;';o.innerHTML='<div style="text-align:center;color:#fff;"><div style="font-size:64px;margin-bottom:20px;">⏰</div><h2 style="font-size:24px;margin-bottom:12px;">Süre Doldu!</h2><p style="font-size:16px;color:#aaa;margin-bottom:8px;">${domain} için günlük ${limitMinutes} dakika limitinize ulaştınız.</p><p style="font-size:13px;color:#666;">Yarın tekrar ziyaret edebilirsiniz.</p><button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Yine de Devam Et</button></div>';document.body.appendChild(o);}`;
  try { webview.executeJavaScript(js); } catch(e) {}
}
