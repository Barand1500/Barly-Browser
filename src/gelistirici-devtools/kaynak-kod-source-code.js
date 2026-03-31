// ========== KAYNAK KOD İNDİR - SOURCE CODE DOWNLOAD ==========
import { state } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';

export async function downloadSourceCode(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) {
    showToast('⚠️ Önce bir siteye gir', 'warning');
    return;
  }
  showToast('📄 Kaynak kod indiriliyor...', 'info');
  try {
    const htmlContent = await webview.executeJavaScript('document.documentElement.outerHTML');
    let siteName = 'site';
    try {
      const urlObj = new URL(tab.url);
      siteName = urlObj.hostname.replace(/^www\./, '').replace(/\./g, '-');
    } catch(e) {}
    const fileName = `${siteName}-kodlari.html`;
    const filePath = await window.electronAPI.saveSourceCode({ fileName, content: htmlContent });
    if (!filePath) { showToast('İndirme iptal edildi', 'warning'); return; }
    state.downloads.unshift({
      name: fileName, status: 'completed', path: filePath,
      totalBytes: htmlContent.length, receivedBytes: htmlContent.length,
      startTime: Date.now(), id: 'src-' + Date.now()
    });
    showToast(`✅ "${fileName}" indirildi!`, 'success');
  } catch(e) {
    showToast('❌ Kaynak kod alınamadı', 'error');
  }
}
