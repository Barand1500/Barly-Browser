// ========== YAPAY ZEKA PANELİ - AI PANEL ==========
import { state, $, AI_SERVICES } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';
import { on } from '../cekirdek-core/olaylar-events.js';

let aiPanelOpen = false;
let aiTabs = [];
let activeAiTabId = null;
let aiTabCounter = 0;
let aiSplitMode = false;

export function isAiPanelOpen() { return aiPanelOpen; }
export function getAiSplitMode() { return aiSplitMode; }

export function toggleAIPanel() {
  const panel = $('ai-panel');
  if (!panel) return;
  aiPanelOpen = !aiPanelOpen;
  if (aiPanelOpen) {
    panel.classList.remove('hidden');
    panel.classList.add('open');
    if (aiTabs.length === 0) addAiTab();
    renderAiTabs();
    if (aiSplitMode) panel.classList.add('split-mode');
  } else {
    panel.classList.remove('open');
    panel.classList.add('hidden');
  }
}

export function addAiTab(service) {
  aiTabCounter++;
  const svc = service || AI_SERVICES[Object.keys(AI_SERVICES)[0]];
  const newTab = { id: aiTabCounter, service: svc, url: svc.url, title: svc.name };
  aiTabs.push(newTab);
  activeAiTabId = newTab.id;
  renderAiTabs();
}

export function switchAiTab(id) {
  activeAiTabId = id;
  renderAiTabs();
}

export function closeAiTab(id) {
  aiTabs = aiTabs.filter(t => t.id !== id);
  if (activeAiTabId === id) activeAiTabId = aiTabs.length > 0 ? aiTabs[aiTabs.length - 1].id : null;
  if (aiTabs.length === 0) {
    const panel = $('ai-panel');
    if (panel) panel.classList.remove('open');
    aiPanelOpen = false;
  }
  renderAiTabs();
}

export function toggleAiSplitMode() {
  aiSplitMode = !aiSplitMode;
  const panel = $('ai-panel');
  if (panel) panel.classList.toggle('split-mode', aiSplitMode);
  showToast(aiSplitMode ? '↔️ Split mod açıldı' : '📱 Normal mod', 'info');
}

export function renderAiTabs() {
  const tabsContainer = $('ai-panel-tabs');
  const contentContainer = $('ai-panel-content');
  if (!tabsContainer || !contentContainer) return;

  tabsContainer.innerHTML = aiTabs.map(t => `
    <div class="ai-tab ${t.id === activeAiTabId ? 'active' : ''}" data-id="${t.id}">
      <span class="ai-tab-icon">${t.service.icon}</span>
      <span class="ai-tab-name">${escapeHtml(t.title)}</span>
      <span class="ai-tab-close" data-close="${t.id}">✕</span>
    </div>
  `).join('') + '<button class="ai-tab-add" id="ai-add-tab-btn">+</button>';

  tabsContainer.querySelectorAll('.ai-tab').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('ai-tab-close')) {
        closeAiTab(parseInt(e.target.dataset.close));
      } else {
        switchAiTab(parseInt(el.dataset.id));
      }
    });
  });
  tabsContainer.querySelector('#ai-add-tab-btn')?.addEventListener('click', showAiServicePicker);

  const activeTab = aiTabs.find(t => t.id === activeAiTabId);
  if (activeTab) {
    let existingWv = contentContainer.querySelector(`webview[data-ai-id="${activeTab.id}"]`);
    contentContainer.querySelectorAll('webview[data-ai-id]').forEach(wv => {
      wv.style.display = parseInt(wv.dataset.aiId) === activeTab.id ? 'flex' : 'none';
    });
    if (!existingWv) {
      const wv = document.createElement('webview');
      wv.dataset.aiId = activeTab.id;
      wv.src = activeTab.url;
      wv.setAttribute('allowpopups', '');
      wv.style.cssText = 'width:100%;height:100%;border:none;flex:1;';
      contentContainer.appendChild(wv);
    }
  }
}

export function showAiServicePicker() {
  const picker = document.createElement('div');
  picker.className = 'ai-service-picker';
  picker.innerHTML = `
    <div class="ai-picker-header"><h3>🤖 AI Servisi Seç</h3><button class="ai-picker-close">✕</button></div>
    <div class="ai-picker-grid">${Object.values(AI_SERVICES).map((s, i) => `
      <div class="ai-picker-item" data-idx="${i}"><span class="ai-picker-icon">${s.icon}</span><span class="ai-picker-name">${s.name}</span></div>
    `).join('')}</div>
  `;
  document.body.appendChild(picker);
  picker.querySelector('.ai-picker-close').addEventListener('click', () => picker.remove());
  picker.querySelectorAll('.ai-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      addAiTab(Object.values(AI_SERVICES)[parseInt(item.dataset.idx)]);
      picker.remove();
    });
  });
  picker.addEventListener('click', (e) => { if (e.target === picker) picker.remove(); });
}

export function askAI(text) {
  if (!aiPanelOpen) toggleAIPanel();
  if (aiTabs.length === 0) addAiTab(Object.values(AI_SERVICES).find(s => s.name === 'Perplexity') || Object.values(AI_SERVICES)[0]);
  const activeTab = aiTabs.find(t => t.id === activeAiTabId);
  if (activeTab) {
    const contentContainer = $('ai-content');
    const wv = contentContainer?.querySelector(`webview[data-ai-id="${activeTab.id}"]`);
    if (wv && activeTab.service.name === 'Perplexity') {
      const url = 'https://www.perplexity.ai/search?' + new URLSearchParams({ q: text });
      wv.loadURL(url);
    }
  }
}
