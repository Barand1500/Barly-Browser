// ========== HIZ PANELİ - SPEED DIAL ==========
import { state, $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast, showModal, hideModal } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

export async function loadSpeedDial(navigate) {
  const speedDialGrid = $('speed-dial-grid');
  if (!speedDialGrid) return;
  try {
    const items = await window.electronAPI.getSpeedDial();
    speedDialGrid.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'speed-dial-item';
      div.innerHTML = `<div class="speed-dial-icon">${item.icon || '🌐'}</div><div class="speed-dial-name">${escapeHtml(item.name)}</div><button class="speed-dial-remove" data-id="${item.id}">✕</button>`;
      div.addEventListener('click', (e) => { if (!e.target.classList.contains('speed-dial-remove')) navigate(item.url); });
      div.querySelector('.speed-dial-remove').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.electronAPI.removeSpeedDial(item.id);
        loadSpeedDial(navigate);
      });
      speedDialGrid.appendChild(div);
    });
  } catch(e) {}
}

export function showAddSpeedDialModal(navigate) {
  const emojis = ['🔍','📧','📺','🎮','🛒','📰','💬','🎵','📚','💻','🏠','✈️','⚽','🎬','📷','🔧','💡','🌍','🎯','❤️','🚀','☕','🐱','🧪'];

  showModal('Kısayol Ekle', `
    <div class="form-group"><label class="form-label">İsim</label><input type="text" class="form-input" id="sd-name" placeholder="Google"></div>
    <div class="form-group"><label class="form-label">URL</label><input type="text" class="form-input" id="sd-url" placeholder="https://google.com"></div>
    <div class="form-group"><label class="form-label">İkon Seç</label><div class="icon-picker-grid" id="sd-icon-picker">${emojis.map(e => `<div class="icon-picker-item" data-icon="${e}">${e}</div>`).join('')}</div></div>
  `);

  let selectedIcon = '🌐';
  setTimeout(() => {
    $$('#sd-icon-picker .icon-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('#sd-icon-picker .icon-picker-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedIcon = item.dataset.icon;
      });
    });

    // Add save button dynamically
    const footer = document.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = '';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = 'İptal';
      cancelBtn.addEventListener('click', hideModal);

      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = 'Ekle';
      saveBtn.addEventListener('click', async () => {
        const name = $('sd-name')?.value;
        const url = $('sd-url')?.value;
        if (name && url) {
          await window.electronAPI.addSpeedDial({ name, url, icon: selectedIcon });
          hideModal();
          loadSpeedDial(navigate);
          showToast('Kısayol eklendi', 'success');
        }
      });

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);
    }
  }, 50);
}
