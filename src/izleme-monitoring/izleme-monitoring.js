// ========== İZLEME - MONITORING ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { escapeHtml, getDomain, formatBytes } from '../cekirdek-core/yardimcilar-helpers.js';

let timeTrackingInterval = null;
let _navigate = null;

export function startTimeTracking(getActiveTab, checkSiteLimitFn) {
  if (timeTrackingInterval) clearInterval(timeTrackingInterval);
  timeTrackingInterval = setInterval(async () => {
    const tab = getActiveTab();
    if (tab && !tab.isStartPage && !tab.isIncognito && tab.url) {
      const domain = getDomain(tab.url);
      try { await window.electronAPI.updateTimeTracking({ domain, seconds: 5 }); } catch(e) {}
      if (checkSiteLimitFn) checkSiteLimitFn(domain, getActiveTab);
    }
  }, 5000);
}

export async function loadTimeStats(navigate) {
  if (navigate) _navigate = navigate;
  const timeStats = $('time-stats');
  if (!timeStats) return;
  try {
    const tracking = await window.electronAPI.getTimeTracking();
    const today = new Date().toISOString().split('T')[0];
    const todayData = tracking[today] || {};
    const sorted = Object.entries(todayData).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
      timeStats.innerHTML = '<div style="color:var(--text-dim);font-size:11px;">Henüz veri yok</div>';
      return;
    }
    const maxTime = sorted[0][1];
    timeStats.innerHTML = sorted.map(([domain, seconds]) => {
      const minutes = Math.round(seconds / 60);
      const percent = (seconds / maxTime) * 100;
      return `<div class="time-stat-item" data-domain="${escapeHtml(domain)}" title="${escapeHtml(domain)} — ${minutes} dakika"><span class="time-stat-label">${escapeHtml(domain)}</span><div class="time-stat-bar"><div class="time-stat-fill" style="width:${percent}%"></div></div><span class="time-stat-value">${minutes}dk</span></div>`;
    }).join('');

    timeStats.querySelectorAll('.time-stat-item').forEach(item => {
      item.addEventListener('click', () => {
        const domain = item.dataset.domain;
        if (domain && _navigate) { _navigate('https://' + domain); }
      });
    });
  } catch(e) {}
}

export function startPerfMonitor() {
  const perfMemory = $('perf-memory');
  const perfBandwidth = $('perf-bandwidth');
  const perfTabMemory = $('perf-tab-memory');

  setInterval(() => {
    if (window.performance?.memory && perfMemory) {
      const memory = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
      perfMemory.textContent = `💾 ${memory} MB`;
    }
    if (perfBandwidth) perfBandwidth.textContent = `📶 ${formatBytes(0)}`;
    if (perfTabMemory) perfTabMemory.textContent = `📑 ${state.tabs.length} sekme`;
  }, 2000);

  setInterval(loadTimeStats, 60000);
}

export function showPageTimeline(getActiveWebview, getActiveTab) {
  // FIX #4 - Use real Navigation Timing API
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    import('../cekirdek-core/arayuz-ui.js').then(m => m.showToast('⚠️ Önce bir siteye gir', 'warning'));
    return;
  }

  webview.executeJavaScript(`(function(){
    const perf = performance.getEntriesByType('navigation')[0] || {};
    return {
      redirect: Math.round(perf.redirectEnd - perf.redirectStart) || 0,
      dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart) || 0,
      tcp: Math.round(perf.connectEnd - perf.connectStart) || 0,
      ssl: Math.round(perf.secureConnectionStart > 0 ? perf.connectEnd - perf.secureConnectionStart : 0) || 0,
      ttfb: Math.round(perf.responseStart - perf.requestStart) || 0,
      download: Math.round(perf.responseEnd - perf.responseStart) || 0,
      domParse: Math.round(perf.domInteractive - perf.responseEnd) || 0,
      domReady: Math.round(perf.domContentLoadedEventEnd - perf.startTime) || 0,
      load: Math.round(perf.loadEventEnd - perf.startTime) || 0
    };
  })();`).then(data => {
    const { showPanel } = require_lazy();
    const total = data.load || 1;
    const phases = [
      { name: 'Redirect', value: data.redirect, color: '#ef4444' },
      { name: 'DNS', value: data.dns, color: '#f59e0b' },
      { name: 'TCP', value: data.tcp, color: '#22c55e' },
      { name: 'SSL', value: data.ssl, color: '#06b6d4' },
      { name: 'TTFB', value: data.ttfb, color: '#8b5cf6' },
      { name: 'Download', value: data.download, color: '#ec4899' },
      { name: 'DOM Parse', value: data.domParse, color: '#6366f1' },
    ];
    const html = `<div style="padding:12px;"><div class="timeline-bar" style="display:flex;height:24px;border-radius:8px;overflow:hidden;margin-bottom:16px;">${phases.filter(p => p.value > 0).map(p => `<div style="width:${Math.max((p.value/total)*100, 2)}%;background:${p.color};position:relative;" title="${p.name}: ${p.value}ms"></div>`).join('')}</div><div style="display:flex;flex-direction:column;gap:8px;">${phases.map(p => `<div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:${p.color};"></span><span style="flex:1;font-size:13px;color:var(--text);">${p.name}</span><span style="font-size:13px;font-weight:600;color:var(--text);">${p.value}ms</span></div>`).join('')}</div><div style="margin-top:16px;padding:12px;background:var(--hover);border-radius:8px;"><div style="font-size:14px;font-weight:600;color:var(--text);">DOM Ready: ${data.domReady}ms</div><div style="font-size:14px;font-weight:600;color:var(--accent);margin-top:4px;">Load: ${data.load}ms</div></div></div>`;
    import('../cekirdek-core/arayuz-ui.js').then(m => m.showPanel('⏱️ Sayfa Zaman Çizelgesi', html));
  }).catch(() => {
    import('../cekirdek-core/arayuz-ui.js').then(m => m.showToast('❌ Timeline verisi alınamadı', 'error'));
  });
}

function require_lazy() {
  // Lazy import helper for in-promise context
  return { showPanel: (...args) => import('../cekirdek-core/arayuz-ui.js').then(m => m.showPanel(...args)) };
}
