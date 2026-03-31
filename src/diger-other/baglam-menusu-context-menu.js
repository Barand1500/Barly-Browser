// ========== BAĞLAM MENÜSÜ - CONTEXT MENU ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';

export function showPageContextMenu(x, y) {
  const contextMenu = $('context-menu');
  if (!contextMenu) return;
  const menuWidth = 200;
  const menuHeight = 350;
  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.classList.remove('hidden');
}

export async function handleContextAction(action, deps) {
  // deps: { getActiveTab, getActiveWebview, goBack, goForward, reload, toggleBookmark, webClipper, takeScreenshot, showQRCode, archivePage, cloneTab, openInSplit, suspendTab, unsuspendTab, showShareMenu, toggleReaderMode, askAI, toggleAIPanel }
  const tab = deps.getActiveTab();
  const contextMenu = $('context-menu');

  switch (action) {
    case 'back': deps.goBack(); break;
    case 'forward': deps.goForward(); break;
    case 'reload': deps.reload(); break;
    case 'bookmark': deps.toggleBookmark(); break;
    case 'clip': deps.webClipper(); break;
    case 'screenshot': deps.takeScreenshot(); break;
    case 'qrcode': deps.showQRCode(); break;
    case 'archive': deps.archivePage(); break;
    case 'clone': if (tab) deps.cloneTab(tab.id); break;
    case 'split': if (tab?.url) deps.openInSplit(tab.url); break;
    case 'suspend':
      if (tab) { tab.isSuspended ? deps.unsuspendTab(tab.id) : deps.suspendTab(tab.id); }
      break;
    case 'share': deps.showShareMenu(); break;
    case 'copy-url':
      if (tab?.url) { navigator.clipboard.writeText(tab.url); showToast('URL kopyalandı', 'success'); }
      break;
    case 'reader': deps.toggleReaderMode(); break;
    case 'inspect':
      const webview = deps.getActiveWebview();
      if (webview) { try { webview.openDevTools(); } catch(e) {} }
      break;
    case 'ask-ai':
      const wv = deps.getActiveWebview();
      if (wv) {
        try {
          const selectedText = await wv.executeJavaScript('window.getSelection().toString()');
          if (selectedText?.trim()) deps.askAI(selectedText.trim()); else deps.toggleAIPanel();
        } catch(e) { deps.toggleAIPanel(); }
      } else { deps.toggleAIPanel(); }
      break;
  }
  if (contextMenu) contextMenu.classList.add('hidden');
}
