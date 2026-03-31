// ========== PERFORMANS ANALİZİ - PERFORMANCE ANALYSIS ==========
import { showToast, showPanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

export async function analyzePagePerformance(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  showToast('🔍 Performans analiz ediliyor...', 'info');
  try {
    const data = await webview.executeJavaScript(`
      (function(){
        const perf=performance.getEntriesByType('navigation')[0]||{};
        const resources=performance.getEntriesByType('resource')||[];
        const scripts=resources.filter(r=>r.initiatorType==='script');
        const styles=resources.filter(r=>r.initiatorType==='css'||r.name.endsWith('.css'));
        const images=resources.filter(r=>r.initiatorType==='img'||r.name.match(/\\.(png|jpg|jpeg|gif|svg|webp|ico)/i));
        const fonts=resources.filter(r=>r.initiatorType==='font'||r.name.match(/\\.(woff|woff2|ttf|otf|eot)/i));
        const allElements=document.querySelectorAll('*');
        const usedFonts=new Set();
        try{const c=getComputedStyle(document.body);usedFonts.add(c.fontFamily.split(',')[0].trim().replace(/['"]/g,''));}catch(e){}
        const totalResourceSize=resources.reduce((sum,r)=>sum+(r.transferSize||0),0);
        return{url:location.href,title:document.title,domElements:allElements.length,domContentLoaded:Math.round(perf.domContentLoadedEventEnd-perf.startTime)||0,loadTime:Math.round(perf.loadEventEnd-perf.startTime)||0,ttfb:Math.round(perf.responseStart-perf.startTime)||0,scriptCount:scripts.length,styleCount:styles.length,imageCount:images.length,fontCount:fonts.length,totalResources:resources.length,totalSize:totalResourceSize,usedFonts:Array.from(usedFonts),doctype:document.doctype?document.doctype.name:'yok',charset:document.characterSet,linkCount:document.querySelectorAll('a').length,formCount:document.querySelectorAll('form').length,iframeCount:document.querySelectorAll('iframe').length,metaCount:document.querySelectorAll('meta').length,hasServiceWorker:!!navigator.serviceWorker?.controller,isHttps:location.protocol==='https:'};
      })();
    `);
    const formatSize = (bytes) => { if (bytes < 1024) return bytes + ' B'; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / 1048576).toFixed(1) + ' MB'; };
    let score = 100;
    if (data.loadTime > 3000) score -= 20; else if (data.loadTime > 1500) score -= 10;
    if (data.domElements > 1500) score -= 15; else if (data.domElements > 800) score -= 5;
    if (data.scriptCount > 20) score -= 15; else if (data.scriptCount > 10) score -= 5;
    if (data.totalSize > 5242880) score -= 15; else if (data.totalSize > 2097152) score -= 5;
    if (!data.isHttps) score -= 10;
    if (data.iframeCount > 3) score -= 5;
    score = Math.max(0, Math.min(100, score));
    const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    const scoreLabel = score >= 80 ? 'İyi' : score >= 50 ? 'Orta' : 'Düşük';

    const content = `
      <div class="perf-score-section"><div class="perf-score-circle" style="--score-color:${scoreColor}"><span class="perf-score-value">${score}</span><span class="perf-score-label">${scoreLabel}</span></div><div class="perf-score-info"><div class="perf-score-title">${escapeHtml(data.title || 'Sayfa')}</div><div class="perf-score-url">${escapeHtml(data.url).substring(0, 50)}</div></div></div>
      <div class="perf-grid"><div class="perf-card"><div class="perf-card-icon">⚡</div><div class="perf-card-value">${data.loadTime}ms</div><div class="perf-card-label">Yüklenme Süresi</div></div><div class="perf-card"><div class="perf-card-icon">🏁</div><div class="perf-card-value">${data.ttfb}ms</div><div class="perf-card-label">TTFB</div></div><div class="perf-card"><div class="perf-card-icon">📦</div><div class="perf-card-value">${formatSize(data.totalSize)}</div><div class="perf-card-label">Toplam Boyut</div></div><div class="perf-card"><div class="perf-card-icon">🧱</div><div class="perf-card-value">${data.domElements}</div><div class="perf-card-label">DOM Element</div></div></div>
      <div class="perf-details"><div class="perf-detail-title">📊 Kaynaklar</div><div class="perf-detail-row"><span>📜 JavaScript</span><span class="perf-detail-value">${data.scriptCount}</span></div><div class="perf-detail-row"><span>🎨 CSS</span><span class="perf-detail-value">${data.styleCount}</span></div><div class="perf-detail-row"><span>🖼️ Görseller</span><span class="perf-detail-value">${data.imageCount}</span></div><div class="perf-detail-row"><span>🔤 Fontlar</span><span class="perf-detail-value">${data.fontCount}</span></div><div class="perf-detail-row"><span>📦 Toplam</span><span class="perf-detail-value">${data.totalResources}</span></div></div>
      <div class="perf-details"><div class="perf-detail-title">🔧 Sayfa Bilgisi</div><div class="perf-detail-row"><span>🔗 Bağlantılar</span><span class="perf-detail-value">${data.linkCount}</span></div><div class="perf-detail-row"><span>📝 Formlar</span><span class="perf-detail-value">${data.formCount}</span></div><div class="perf-detail-row"><span>🖼️ iframe</span><span class="perf-detail-value">${data.iframeCount}</span></div><div class="perf-detail-row"><span>🔒 HTTPS</span><span class="perf-detail-value">${data.isHttps ? '✅' : '❌'}</span></div><div class="perf-detail-row"><span>⚙️ SW</span><span class="perf-detail-value">${data.hasServiceWorker ? '✅' : '❌'}</span></div><div class="perf-detail-row"><span>🔠 Font</span><span class="perf-detail-value">${data.usedFonts[0] || '?'}</span></div></div>
    `;
    showPanel('🔍 Performans Analizi', content);
  } catch(e) { showToast('❌ Performans analizi yapılamadı', 'error'); }
}
