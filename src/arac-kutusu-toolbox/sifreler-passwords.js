// ========== ŞİFRELER - PASSWORDS ==========

import { $ } from '../cekirdek-core/durum-state.js';
import { showToast, showPanel, showModal, hideModal } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Zayıf', color: '#ef4444', percent: 20 };
  if (score <= 2) return { label: 'Orta', color: '#f59e0b', percent: 40 };
  if (score <= 3) return { label: 'İyi', color: '#22c55e', percent: 60 };
  if (score <= 4) return { label: 'Güçlü', color: '#3b82f6', percent: 80 };
  return { label: 'Çok Güçlü', color: '#8b5cf6', percent: 100 };
}

export async function showPasswordsPanel() {
  try {
    const passwords = await window.electronAPI.getPasswords();
    let content = '<button class="btn btn-primary" id="add-pwd-btn" style="width:100%;margin-bottom:8px;">+ Şifre Ekle</button>';
    content += '<button class="btn btn-secondary" id="gen-pwd-btn" style="width:100%;margin-bottom:12px;">🎲 Şifre Üret</button>';
    if (passwords.length === 0) {
      content += `<div class="panel-empty"><div class="panel-empty-icon">🔐</div>Kayıtlı şifre yok</div>`;
    } else {
      passwords.forEach(p => {
        const strength = getPasswordStrength(p.password || '');
        content += `
          <div class="panel-item">
            <div class="panel-item-icon">🔐</div>
            <div class="panel-item-info">
              <div class="panel-item-title">${escapeHtml(p.site)}</div>
              <div class="panel-item-subtitle">${escapeHtml(p.username)}</div>
              <div class="pwd-strength-bar"><div class="pwd-strength-fill" style="width:${strength.percent}%;background:${strength.color}"></div></div>
            </div>
            <button class="panel-item-action" data-id="${p.id}">✕</button>
          </div>`;
      });
    }
    showPanel('🔐 Şifreler', content);
    setTimeout(() => {
      $('add-pwd-btn')?.addEventListener('click', showAddPasswordModal);
      $('gen-pwd-btn')?.addEventListener('click', showPasswordGenerator);
      document.querySelectorAll('.panel-item-action').forEach(btn => {
        btn.addEventListener('click', async () => {
          await window.electronAPI.removePassword(parseInt(btn.dataset.id));
          showPasswordsPanel();
          showToast('Şifre silindi', 'warning');
        });
      });
    }, 50);
  } catch(e) {}
}

function showAddPasswordModal() {
  showModal('Şifre Ekle', `
    <div class="form-group">
      <label class="form-label">Site</label>
      <input type="text" class="form-input" id="pwd-site" placeholder="example.com">
    </div>
    <div class="form-group">
      <label class="form-label">Kullanıcı Adı</label>
      <input type="text" class="form-input" id="pwd-username">
    </div>
    <div class="form-group">
      <label class="form-label">Şifre</label>
      <input type="password" class="form-input" id="pwd-password">
      <div class="pwd-strength-bar" id="pwd-str-bar"><div class="pwd-strength-fill" id="pwd-str-fill"></div></div>
      <div class="pwd-strength-text" id="pwd-str-text"></div>
    </div>
  `, `
    <button class="btn btn-secondary" id="pwd-cancel-btn">İptal</button>
    <button class="btn btn-primary" id="save-pwd-btn">Kaydet</button>
  `);
  setTimeout(() => {
    document.getElementById('pwd-cancel-btn')?.addEventListener('click', hideModal);
    $('pwd-password')?.addEventListener('input', (e) => {
      const strength = getPasswordStrength(e.target.value);
      const fill = $('pwd-str-fill');
      const text = $('pwd-str-text');
      if (fill) { fill.style.width = strength.percent + '%'; fill.style.background = strength.color; }
      if (text) { text.textContent = strength.label; text.style.color = strength.color; }
    });
    $('save-pwd-btn')?.addEventListener('click', async () => {
      const site = $('pwd-site')?.value;
      const username = $('pwd-username')?.value;
      const password = $('pwd-password')?.value;
      if (site && username && password) {
        await window.electronAPI.addPassword({ site, username, password });
        hideModal();
        showPasswordsPanel();
        showToast('Şifre kaydedildi', 'success');
      }
    });
  }, 50);
}

function showPasswordGenerator() {
  const generate = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, v => chars[v % chars.length]).join('');
  };
  const pwd = generate();
  const strength = getPasswordStrength(pwd);

  showModal('🎲 Şifre Üretici', `
    <div class="form-group">
      <label class="form-label">Üretilen Şifre</label>
      <input type="text" class="form-input password-display" id="gen-password" value="${pwd}" readonly>
      <div class="pwd-strength-bar"><div class="pwd-strength-fill" id="gen-str-fill" style="width:${strength.percent}%;background:${strength.color}"></div></div>
      <div class="pwd-strength-text" id="gen-str-text" style="color:${strength.color}">${strength.label}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Uzunluk: <span id="len-val">16</span></label>
      <input type="range" id="pwd-length" min="8" max="32" value="16" style="width:100%;">
    </div>
  `, `
    <button class="btn btn-secondary" id="regen-btn">🔄 Yenile</button>
    <button class="btn btn-primary" id="copy-pwd-btn">📋 Kopyala</button>
  `);
  setTimeout(() => {
    const updateGen = () => {
      const len = parseInt($('pwd-length')?.value || 16);
      const newPwd = generate(len);
      const s = getPasswordStrength(newPwd);
      if ($('gen-password')) $('gen-password').value = newPwd;
      if ($('gen-str-fill')) { $('gen-str-fill').style.width = s.percent + '%'; $('gen-str-fill').style.background = s.color; }
      if ($('gen-str-text')) { $('gen-str-text').textContent = s.label; $('gen-str-text').style.color = s.color; }
    };
    $('pwd-length')?.addEventListener('input', (e) => {
      if ($('len-val')) $('len-val').textContent = e.target.value;
      updateGen();
    });
    $('regen-btn')?.addEventListener('click', updateGen);
    $('copy-pwd-btn')?.addEventListener('click', () => {
      const pwdVal = $('gen-password');
      if (pwdVal) {
        navigator.clipboard.writeText(pwdVal.value);
        showToast('Şifre kopyalandı', 'success');
        hideModal();
      }
    });
  }, 50);
}
