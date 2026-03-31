// ========== KENAR ÇUBUĞU - SIDEBAR ==========
import { state, $ } from '../cekirdek-core/durum-state.js';
import { hideAllMenus } from '../cekirdek-core/arayuz-ui.js';

export function setupCollapsibleSections() {
  const sectionHeaders = document.querySelectorAll('.sidebar-section-header');
  sectionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.sidebar-section');
      if (section) {
        section.classList.toggle('collapsed');
        const sectionName = header.dataset.section;
        if (sectionName) {
          const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
          collapsedSections[sectionName] = section.classList.contains('collapsed');
          localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
        }
      }
    });
  });

  try {
    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
    Object.keys(collapsedSections).forEach(sectionName => {
      if (collapsedSections[sectionName]) {
        const header = document.querySelector(`[data-section="${sectionName}"]`);
        if (header) {
          const section = header.closest('.sidebar-section');
          if (section) section.classList.add('collapsed');
        }
      }
    });
  } catch(e) {}
}

export function setupSidebarResize() {
  const sidebar = $('sidebar');
  const handle = document.querySelector('.sidebar-resize-handle');
  if (!handle || !sidebar) return;

  let isResizing = false;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    handle.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newWidth = Math.max(200, Math.min(500, e.clientX));
    sidebar.style.width = newWidth + 'px';
    sidebar.style.minWidth = newWidth + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      handle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      state.settings.sidebarWidth = parseInt(sidebar.style.width);
      window.electronAPI.setSettings(state.settings);
    }
  });
}

export function applySidebarWidth(width) {
  const sidebar = $('sidebar');
  if (sidebar && width) {
    sidebar.style.width = width + 'px';
    sidebar.style.minWidth = width + 'px';
  }
}

export function setupGlobalClickHandler() {
  const contextMenu = $('context-menu');
  const shareMenu = $('share-menu');

  document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) contextMenu.classList.add('hidden');
    if (shareMenu && !shareMenu.contains(e.target)) shareMenu.classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAllMenus();
  });
}
