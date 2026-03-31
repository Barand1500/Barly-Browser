// ========== SEKME GRUPLARI - TAB GROUPS ==========
// Sekme grubu oluşturma, düzenleme, filtreleme

import { dom, state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showModal, hideModal } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

export function renderTabGroups() {
  if (!dom.tabGroupsContainer) return;
  dom.tabGroupsContainer.innerHTML = '';

  // "Tümü" chp
  const allChip = document.createElement('div');
  allChip.className = 'tab-group-chip active';
  allChip.textContent = '🗂️ Tümü';
  allChip.addEventListener('click', (e) => {
    e.stopPropagation();
    $$('.tab-group-chip').forEach(i => i.classList.remove('active'));
    allChip.classList.add('active');
    filterTabsByGroup(null);
  });
  dom.tabGroupsContainer.appendChild(allChip);

  state.tabGroups.forEach(group => {
    const chip = document.createElement('div');
    chip.className = 'tab-group-chip';
    chip.style.background = group.color;
    chip.innerHTML = `${group.icon ? `<span class="group-icon">${group.icon}</span>` : `<span class="group-dot" style="background:white"></span>`}${escapeHtml(group.name)}`;
    chip.title = group.name;
    chip.dataset.id = group.id;
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      $$('.tab-group-chip').forEach(i => i.classList.remove('active'));
      chip.classList.add('active');
      filterTabsByGroup(group.id);
    });
    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showGroupOptions(e, group);
    });
    dom.tabGroupsContainer.appendChild(chip);
  });

  // "+" chip
  const addChip = document.createElement('div');
  addChip.className = 'tab-group-chip add';
  addChip.textContent = '+ Yeni';
  addChip.title = 'Yeni Grup Oluştur';
  addChip.addEventListener('click', (e) => {
    e.stopPropagation();
    showAddGroupModal();
  });
  dom.tabGroupsContainer.appendChild(addChip);
}

// FIX #3: Grup yeniden adlandırma eklendi
function showGroupOptions(e, group) {
  const menu = document.createElement('div');
  menu.className = 'context-menu mini';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.innerHTML = `
    <div class="context-item" data-action="rename">✏️ Yeniden Adlandır</div>
    <div class="context-item danger" data-action="delete">🗑️ Sil</div>
  `;
  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 10);

  menu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', async () => {
      const action = item.dataset.action;
      if (action === 'rename') {
        // Yeniden adlandırma modalı
        showModal('Grubu Yeniden Adlandır', `
          <div class="form-group">
            <label class="form-label">Yeni İsim</label>
            <input type="text" class="form-input" id="rename-group-input" value="${escapeHtml(group.name)}">
          </div>
        `, `
          <button class="btn btn-secondary" id="rename-cancel-btn">İptal</button>
          <button class="btn btn-primary" id="rename-save-btn">Kaydet</button>
        `);
        setTimeout(() => {
          const input = document.getElementById('rename-group-input');
          if (input) { input.focus(); input.select(); }
          document.getElementById('rename-cancel-btn')?.addEventListener('click', hideModal);
          document.getElementById('rename-save-btn')?.addEventListener('click', async () => {
            const newName = input?.value.trim();
            if (newName && newName !== group.name) {
              state.tabGroups = await window.electronAPI.updateTabGroup({ id: group.id, name: newName });
              renderTabGroups();
              hideModal();
              showToast(`Grup "${newName}" olarak yeniden adlandırıldı`, 'success');
            } else {
              hideModal();
            }
          });
        }, 50);
      } else if (action === 'delete') {
        state.tabGroups = await window.electronAPI.removeTabGroup(group.id);
        renderTabGroups();
        showToast('Grup silindi', 'success');
      }
      menu.remove();
    });
  });
}

export function showAddGroupModal() {
  const colors = [
    { name: 'Kırmızı', value: '#ef4444' }, { name: 'Turuncu', value: '#f97316' },
    { name: 'Sarı', value: '#eab308' }, { name: 'Yeşil', value: '#22c55e' },
    { name: 'Mavi', value: '#3b82f6' }, { name: 'Mor', value: '#8b5cf6' },
    { name: 'Pembe', value: '#ec4899' }
  ];
  const icons = ['📁','💼','🎮','🎵','📰','🛒','💻','📚','🔬','🎨','🏠','✈️','⚽','🎬','💬','🚀'];

  showModal('Sekme Grubu Oluştur', `
    <div class="form-group">
      <label class="form-label">Grup Adı</label>
      <input type="text" class="form-input" id="group-name" placeholder="İş, Sosyal, vb.">
    </div>
    <div class="form-group">
      <label class="form-label">İkon (isteğe bağlı)</label>
      <div class="icon-picker-grid" id="group-icon-picker">
        ${icons.map(i => `<div class="icon-picker-item" data-icon="${i}">${i}</div>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Renk</label>
      <div class="color-picker" id="color-picker">
        ${colors.map(c => `<div class="color-option" data-color="${c.value}" style="background:${c.value}" title="${c.name}"></div>`).join('')}
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" id="group-cancel-btn">İptal</button>
    <button class="btn btn-primary" id="save-group-btn">Oluştur</button>
  `);

  let selectedColor = '#3b82f6';
  let selectedIcon = '';
  setTimeout(() => {
    document.getElementById('group-cancel-btn')?.addEventListener('click', hideModal);
    $$('.color-option').forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedColor = opt.dataset.color;
      });
    });
    $('color-picker')?.querySelector('[data-color="#3b82f6"]')?.classList.add('selected');

    $$('#group-icon-picker .icon-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('#group-icon-picker .icon-picker-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedIcon = item.dataset.icon;
      });
    });

    $('save-group-btn')?.addEventListener('click', async () => {
      const name = $('group-name')?.value.trim();
      if (name) {
        state.tabGroups = await window.electronAPI.addTabGroup({ name, color: selectedColor, icon: selectedIcon });
        renderTabGroups();
        hideModal();
        showToast('Grup oluşturuldu', 'success');
      }
    });
  }, 50);
}

export function filterTabsByGroup(groupId) {
  state.tabs.forEach(tab => {
    tab.element.style.display = (groupId === null || tab.groupId === groupId) ? 'flex' : 'none';
  });
}

export function assignTabToGroup(tabId, groupId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    tab.groupId = groupId;
    const group = state.tabGroups.find(g => g.id === groupId);
    if (group) tab.element.style.setProperty('--tab-group-color', group.color);
  }
}
