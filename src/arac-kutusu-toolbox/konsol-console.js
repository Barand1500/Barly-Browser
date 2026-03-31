// ========== KONSOL - CONSOLE ==========

import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

export function showConsolePanel() {
  const logCount = state.consoleLogs.filter(l => l.type === 'log').length;
  const warnCount = state.consoleLogs.filter(l => l.type === 'warn').length;
  const errCount = state.consoleLogs.filter(l => l.type === 'error').length;
  const infoCount = state.consoleLogs.filter(l => l.type === 'info').length;

  let content = `
    <div class="console-header-bar">
      <div class="console-status">
        <span class="console-status-dot ${errCount > 0 ? 'error' : 'ok'}"></span>
        <span>${state.consoleLogs.length} mesaj</span>
      </div>
      <div class="console-stats">
        <span class="console-stat log">${logCount} log</span>
        <span class="console-stat warn">${warnCount} uyarı</span>
        <span class="console-stat error">${errCount} hata</span>
        <span class="console-stat info">${infoCount} bilgi</span>
      </div>
    </div>
    <div class="console-toolbar">
      <button class="console-filter active" data-type="all">Tümü</button>
      <button class="console-filter" data-type="log">📋 Log</button>
      <button class="console-filter warn-filter" data-type="warn">⚠️ Uyarı</button>
      <button class="console-filter error-filter" data-type="error">❌ Hata</button>
      <button class="console-filter" data-type="info">ℹ️ Bilgi</button>
      <input type="text" class="console-search" id="console-search" placeholder="🔍 Filtrele...">
      <button class="console-clear-btn" id="console-clear">🗑️</button>
    </div>
    <div class="console-output" id="console-output">`;

  if (state.consoleLogs.length === 0) {
    content += `<div class="console-empty"><div class="console-empty-icon">⌨️</div><div class="console-empty-title">Konsol Boş</div><div class="console-empty-hint">Sayfa konsola mesaj yazdığında burada görünür.</div></div>`;
  } else {
    state.consoleLogs.slice(-200).forEach(log => {
      const typeIcon = { log: '📋', warn: '⚠️', error: '❌', info: 'ℹ️' }[log.type] || '📋';
      const sourceShort = log.source ? log.source.split('/').pop() : '';
      content += `
        <div class="console-line ${log.type}" data-msg="${escapeHtml(log.message).toLowerCase()}">
          <span class="console-line-icon">${typeIcon}</span>
          <span class="console-line-type">${log.type.toUpperCase()}</span>
          <span class="console-line-msg">${escapeHtml(log.message)}</span>
          ${sourceShort ? `<span class="console-line-source" title="${escapeHtml(log.source)}">${escapeHtml(sourceShort)}${log.line ? ':' + log.line : ''}</span>` : ''}
          <span class="console-line-time">${log.time}</span>
        </div>`;
    });
  }
  content += '</div>';
  showPanel('🖥️ DevTools Konsol', content);

  setTimeout(() => {
    const output = $('console-output');
    if (output) output.scrollTop = output.scrollHeight;
    $$('.console-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.console-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        $$('.console-line').forEach(line => {
          line.style.display = (type === 'all' || line.classList.contains(type)) ? 'flex' : 'none';
        });
      });
    });
    $('console-search')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      $$('.console-line').forEach(line => {
        line.style.display = (line.dataset.msg || '').includes(query) ? 'flex' : 'none';
      });
    });
    $('console-clear')?.addEventListener('click', () => {
      state.consoleLogs.length = 0;
      showConsolePanel();
      showToast('Konsol temizlendi', 'success');
    });
  }, 50);
}
