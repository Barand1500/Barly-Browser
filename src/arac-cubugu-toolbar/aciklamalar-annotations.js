// ========== AÇIKLAMALAR / LİNK ÖNİZLEME - ANNOTATIONS / LINK PREVIEW ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';
import { on, emit } from '../cekirdek-core/olaylar-events.js';

let annotationsData = {};
let linkPreviewCache = {};

// ===== ANNOTATIONS =====
export function toggleAnnotationMode(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }
  state.annotationMode = !state.annotationMode;
  if (state.annotationMode) {
    injectAnnotationScript(webview);
    showToast('✏️ Annotation modu açıldı — Metin seçip işaretleyebilirsiniz', 'info');
  } else {
    removeAnnotationHighlights(webview);
    showToast('✏️ Annotation modu kapatıldı', 'info');
  }
}

function injectAnnotationScript(webview) {
  const js = `(function(){
    if(window.__barlyAnnotation) return;
    window.__barlyAnnotation = true;
    document.addEventListener('mouseup', function(e){
      var sel = window.getSelection();
      var text = sel.toString().trim();
      if(text.length > 0){
        var range = sel.getRangeAt(0);
        var span = document.createElement('span');
        span.style.cssText = 'background:rgba(255,255,0,0.4);border-bottom:2px solid #f59e0b;cursor:pointer;';
        span.className = 'barly-annotation';
        span.title = 'Barly Annotation';
        try { range.surroundContents(span); } catch(e2){}
        sel.removeAllRanges();
      }
    });
  })();`;
  try { webview.executeJavaScript(js); } catch(e) {}
}

function removeAnnotationHighlights(webview) {
  const js = `(function(){
    document.querySelectorAll('.barly-annotation').forEach(function(el){
      var parent = el.parentNode;
      while(el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
    window.__barlyAnnotation = false;
  })();`;
  try { webview.executeJavaScript(js); } catch(e) {}
}

export async function saveAnnotationData(url, getActiveWebview) {
  const webview = getActiveWebview();
  if (!webview || !url) return;
  try {
    const data = await webview.executeJavaScript(`(function(){
      var items = [];
      document.querySelectorAll('.barly-annotation').forEach(function(el){ items.push(el.textContent); });
      return items;
    })();`);
    if (data && data.length > 0) {
      annotationsData[url] = data;
      await window.electronAPI.saveAnnotations(annotationsData);
    }
  } catch(e) {}
}

export async function reApplyAnnotations(url, webview) {
  if (!webview || !url) return;
  if (!annotationsData[url]) {
    try { annotationsData = await window.electronAPI.getAnnotations() || {}; } catch(e) {}
  }
  const data = annotationsData[url];
  if (!data || data.length === 0) return;
  const js = `(function(){
    var texts = ${JSON.stringify(data)};
    texts.forEach(function(t){
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      while(walker.nextNode()){
        var node = walker.currentNode;
        var idx = node.textContent.indexOf(t);
        if(idx >= 0){
          var range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + t.length);
          var span = document.createElement('span');
          span.style.cssText = 'background:rgba(255,255,0,0.4);border-bottom:2px solid #f59e0b;';
          span.className = 'barly-annotation';
          try { range.surroundContents(span); } catch(e){}
          break;
        }
      }
    });
  })();`;
  try { webview.executeJavaScript(js); } catch(e) {}
}

// ===== LINK PREVIEW =====
export function injectLinkPreviewScript(webview) {
  if (!webview) return;
  const js = `(function(){
    if(window.__barlyLinkPreview) return;
    window.__barlyLinkPreview = true;
    var hoverTimer = null;
    document.addEventListener('mouseover', function(e){
      var link = e.target.closest('a[href]');
      if(!link) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function(){
        var rect = link.getBoundingClientRect();
        var data = { href: link.href, text: link.textContent.trim().substring(0, 100), x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
        window.postMessage({ type: 'barly-link-hover', data: data }, '*');
      }, 600);
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest('a[href]')){ clearTimeout(hoverTimer); window.postMessage({ type: 'barly-link-leave' }, '*'); }
    });
  })();`;
  try { webview.executeJavaScript(js); } catch(e) {}
}

export function handleLinkHover(data) {
  // Create or show link preview tooltip
  let tooltip = $('link-preview-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'link-preview-tooltip';
    tooltip.className = 'link-preview-tooltip';
    document.body.appendChild(tooltip);
  }
  const displayUrl = data.href.length > 60 ? data.href.substring(0, 60) + '...' : data.href;
  tooltip.innerHTML = `<div class="lp-url">${displayUrl}</div>${data.text ? '<div class="lp-text">' + data.text.substring(0, 80) + '</div>' : ''}`;
  tooltip.style.display = 'block';
  // Position near the webview area
  tooltip.style.left = Math.min(data.x || 100, window.innerWidth - 320) + 'px';
  tooltip.style.top = Math.min((data.y || 100) + 10, window.innerHeight - 80) + 'px';
}

export function hideLinkPreview() {
  const tooltip = $('link-preview-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}
