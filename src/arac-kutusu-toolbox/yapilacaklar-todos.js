// ========== YAPILACAKLAR - TODOS ==========

import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

export async function showTodosPanel() {
  try {
    const todos = await window.electronAPI.getTodos();
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;

    let content = `
      <div class="todo-input-row">
        <input type="text" id="todo-input" placeholder="Yeni görev ekle...">
        <select id="todo-priority-select" class="todo-priority-select">
          <option value="high">🔴 Yüksek</option>
          <option value="medium" selected>🟡 Orta</option>
          <option value="low">🟢 Düşük</option>
        </select>
        <button id="todo-add-btn" title="Görev Ekle">+</button>
      </div>
      <div class="todo-filters">
        <button class="todo-filter ${state.todoFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü</button>
        <button class="todo-filter ${state.todoFilter === 'active' ? 'active' : ''}" data-filter="active">Aktif</button>
        <button class="todo-filter ${state.todoFilter === 'completed' ? 'active' : ''}" data-filter="completed">Tamamlanan</button>
      </div>
      <div id="todo-list">`;

    const filtered = todos.filter(t => {
      if (state.todoFilter === 'active') return !t.completed;
      if (state.todoFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      content += `<div class="panel-empty" style="padding:24px"><div class="panel-empty-icon">✅</div>${state.todoFilter === 'completed' ? 'Tamamlanan görev yok' : 'Görev yok'}</div>`;
    } else {
      filtered.forEach(todo => {
        const priorityClass = todo.priority || 'medium';
        const priorityLabel = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' }[priorityClass] || 'Orta';
        content += `
          <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">${todo.completed ? '✓' : ''}</div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <span class="todo-priority ${priorityClass}">${priorityLabel}</span>
            <button class="todo-delete" data-id="${todo.id}">✕</button>
          </div>`;
      });
    }

    content += `</div>
      <div class="todo-stats">
        <span>${completed}/${total} tamamlandı</span>
        <button class="btn btn-sm btn-secondary" id="todo-clear-btn">Tamamlananları Sil</button>
      </div>`;

    showPanel('✅ Yapılacaklar', content);

    setTimeout(() => {
      const addTodo = async () => {
        const input = $('todo-input');
        const prioritySel = $('todo-priority-select');
        const text = input?.value.trim();
        if (text) {
          const priority = prioritySel?.value || 'medium';
          await window.electronAPI.addTodo({ text, priority });
          showTodosPanel();
        }
      };
      $('todo-add-btn')?.addEventListener('click', addTodo);
      $('todo-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });
      $('todo-input')?.focus();

      $$('.todo-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          state.todoFilter = btn.dataset.filter;
          showTodosPanel();
        });
      });
      $$('.todo-checkbox').forEach(cb => {
        cb.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(cb.dataset.id);
          const todo = todos.find(t => t.id === id);
          if (todo) { await window.electronAPI.updateTodo({ id, completed: !todo.completed }); showTodosPanel(); }
        });
      });
      $$('.todo-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.electronAPI.removeTodo(parseInt(btn.dataset.id));
          showTodosPanel();
        });
      });
      $('todo-clear-btn')?.addEventListener('click', async () => {
        await window.electronAPI.clearCompletedTodos();
        showTodosPanel();
        showToast('Tamamlanan görevler silindi', 'success');
      });
    }, 50);
  } catch(e) { console.error('Todos error:', e); }
}
