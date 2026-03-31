// ========== NOTLAR - NOTES ==========
// FIX #7: Not defteri mini ve notlar paneli birleştirildi

import { dom, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, showModal, hideModal } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

// Notepad Mini
export function showNotepadMini() {
  if (dom.notepadMini) dom.notepadMini.classList.remove('hidden');
  if (dom.notepadContent) dom.notepadContent.focus();
}

export function hideNotepadMini() {
  if (dom.notepadMini) dom.notepadMini.classList.add('hidden');
}

export async function saveQuickNote() {
  if (!dom.notepadContent) return;
  const content = dom.notepadContent.value.trim();
  if (content) {
    try {
      await window.electronAPI.addNote({ title: 'Hızlı Not', content });
      dom.notepadContent.value = '';
      hideNotepadMini();
      showToast('Not kaydedildi', 'success');
    } catch(e) {}
  }
}

// Notes Panel
export async function showNotesPanel() {
  try {
    const notes = await window.electronAPI.getNotes();
    let content = '<button class="btn btn-primary" id="new-note-btn" style="width:100%;margin-bottom:12px;">+ Yeni Not</button>';
    if (notes.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">📝</div>Not yok</div>`;
    } else {
      notes.forEach(note => {
        content += `
          <div class="panel-item" data-id="${note.id}">
            <div class="panel-item-icon">📝</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(note.title)}</div>
              <div class="panel-item-subtitle">${escapeHtml((note.content || '').substring(0, 50))}...</div>
            </div>
            <button class="panel-item-action" data-id="${note.id}">✕</button>
          </div>`;
      });
    }
    showPanel('📝 Notlar', content);
    setTimeout(() => {
      $('new-note-btn')?.addEventListener('click', () => showNoteEditor());
      $$('.panel-item[data-id]').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('panel-item-action')) {
            const note = notes.find(n => n.id === parseInt(item.dataset.id));
            if (note) showNoteEditor(note);
          }
        });
      });
      $$('.panel-item-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeNote(parseInt(btn.dataset.id));
          showNotesPanel();
        });
      });
    }, 50);
  } catch(e) {}
}

function showNoteEditor(note = null) {
  showModal(note ? 'Not Düzenle' : 'Yeni Not', `
    <div class="form-group">
      <label class="form-label">Başlık</label>
      <input type="text" class="form-input" id="note-title" value="${note ? escapeHtml(note.title) : ''}">
    </div>
    <div class="form-group">
      <label class="form-label">İçerik</label>
      <textarea class="form-textarea" id="note-content" style="min-height:150px;">${note ? escapeHtml(note.content) : ''}</textarea>
    </div>
  `, `
    <button class="btn btn-secondary" id="note-cancel-btn">İptal</button>
    <button class="btn btn-primary" id="save-note-btn">Kaydet</button>
  `);
  setTimeout(() => {
    document.getElementById('note-cancel-btn')?.addEventListener('click', hideModal);
    $('save-note-btn')?.addEventListener('click', async () => {
      const title = $('note-title')?.value.trim() || 'Not';
      const content = $('note-content')?.value.trim();
      if (content) {
        try {
          if (note) await window.electronAPI.updateNote({ id: note.id, title, content });
          else await window.electronAPI.addNote({ title, content });
          hideModal();
          showNotesPanel();
          showToast('Not kaydedildi', 'success');
        } catch(e) {}
      }
    });
  }, 50);
}

// Web Clipper
export async function webClipper(getActiveWebview, getActiveTab) {
  const webview = getActiveWebview();
  if (!webview) return;
  try {
    const selectedText = await webview.executeJavaScript('window.getSelection().toString()');
    const tab = getActiveTab();
    if (selectedText && selectedText.trim()) {
      await window.electronAPI.addNote({
        title: `📋 ${tab?.title || 'Web Clip'}`,
        content: `Kaynak: ${tab?.url || ''}\n\n${selectedText.trim()}`
      });
      showToast('✂️ Metin notlara kaydedildi', 'success');
    } else {
      showToast('Önce bir metin seçin', 'warning');
    }
  } catch(e) {
    showToast('Web clipper hatası', 'error');
  }
}
