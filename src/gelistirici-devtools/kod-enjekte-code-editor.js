// ========== KOD ENJEKTE EDİTÖR - CODE EDITOR ==========
import { $, $$ } from '../cekirdek-core/durum-state.js';
import { showToast } from '../cekirdek-core/arayuz-ui.js';
import { escapeHtml } from '../cekirdek-core/yardimcilar-helpers.js';

let cssEditorOverlay = null;
let codeEditorState = { mode: 'css', css: '', js: '', html: '' };
const NEWLINE = '\n';

const CODE_AUTOCOMPLETE = {
  css: [
    { trigger: 'bg', text: 'background: ', desc: 'Arkaplan' },
    { trigger: 'bgc', text: 'background-color: ', desc: 'Arkaplan rengi' },
    { trigger: 'bgi', text: 'background-image: url()', desc: 'Arkaplan resmi' },
    { trigger: 'c', text: 'color: ', desc: 'Yazı rengi' },
    { trigger: 'fs', text: 'font-size: ', desc: 'Yazı boyutu' },
    { trigger: 'fw', text: 'font-weight: ', desc: 'Yazı kalınlığı' },
    { trigger: 'ff', text: 'font-family: ', desc: 'Yazı tipi' },
    { trigger: 'w', text: 'width: ', desc: 'Genişlik' },
    { trigger: 'h', text: 'height: ', desc: 'Yükseklik' },
    { trigger: 'mw', text: 'max-width: ', desc: 'Max genişlik' },
    { trigger: 'mh', text: 'max-height: ', desc: 'Max yükseklik' },
    { trigger: 'm', text: 'margin: ', desc: 'Dış boşluk' },
    { trigger: 'mt', text: 'margin-top: ', desc: 'Üst boşluk' },
    { trigger: 'mb', text: 'margin-bottom: ', desc: 'Alt boşluk' },
    { trigger: 'ml', text: 'margin-left: ', desc: 'Sol boşluk' },
    { trigger: 'mr', text: 'margin-right: ', desc: 'Sağ boşluk' },
    { trigger: 'p', text: 'padding: ', desc: 'İç boşluk' },
    { trigger: 'pt', text: 'padding-top: ', desc: 'Üst iç boşluk' },
    { trigger: 'pb', text: 'padding-bottom: ', desc: 'Alt iç boşluk' },
    { trigger: 'pl', text: 'padding-left: ', desc: 'Sol iç boşluk' },
    { trigger: 'pr', text: 'padding-right: ', desc: 'Sağ iç boşluk' },
    { trigger: 'br', text: 'border-radius: ', desc: 'Köşe yuvarlama' },
    { trigger: 'b', text: 'border: ', desc: 'Kenarlık' },
    { trigger: 'bs', text: 'box-shadow: ', desc: 'Kutu gölge' },
    { trigger: 'ts', text: 'text-shadow: ', desc: 'Yazı gölge' },
    { trigger: 'ta', text: 'text-align: ', desc: 'Yazı hizalama' },
    { trigger: 'td', text: 'text-decoration: ', desc: 'Yazı süsleme' },
    { trigger: 'tt', text: 'text-transform: ', desc: 'Yazı dönüşümü' },
    { trigger: 'o', text: 'opacity: ', desc: 'Opaklık' },
    { trigger: 'ov', text: 'overflow: ', desc: 'Taşma' },
    { trigger: 'z', text: 'z-index: ', desc: 'Z sırası' },
    { trigger: 'pos', text: 'position: ', desc: 'Konum' },
    { trigger: 'dis', text: 'display: ', desc: 'Görüntüleme' },
    { trigger: 'dflex', text: 'display: flex;', desc: 'Flex layout' },
    { trigger: 'dgrid', text: 'display: grid;', desc: 'Grid layout' },
    { trigger: 'dnone', text: 'display: none;', desc: 'Gizle' },
    { trigger: 'dblock', text: 'display: block;', desc: 'Block' },
    { trigger: 'jc', text: 'justify-content: ', desc: 'Yatay hizalama' },
    { trigger: 'ai', text: 'align-items: ', desc: 'Dikey hizalama' },
    { trigger: 'fd', text: 'flex-direction: ', desc: 'Flex yönü' },
    { trigger: 'gap', text: 'gap: ', desc: 'Aralık' },
    { trigger: 'gtc', text: 'grid-template-columns: ', desc: 'Sütun şablonu' },
    { trigger: 'gtr', text: 'grid-template-rows: ', desc: 'Satır şablonu' },
    { trigger: 'trans', text: 'transition: all 0.3s ease;', desc: 'Geçiş efekti' },
    { trigger: 'anim', text: 'animation: ', desc: 'Animasyon' },
    { trigger: 'tf', text: 'transform: ', desc: 'Dönüşüm' },
    { trigger: 'cur', text: 'cursor: pointer;', desc: 'İmleç pointer' },
    { trigger: 'ls', text: 'letter-spacing: ', desc: 'Harf aralığı' },
    { trigger: 'lh', text: 'line-height: ', desc: 'Satır yüksekliği' },
    { trigger: 'vis', text: 'visibility: ', desc: 'Görünürlük' },
    { trigger: 'bgsz', text: 'background-size: cover;', desc: 'BG kapla' },
    { trigger: 'center', text: 'display: flex; align-items: center; justify-content: center;', desc: 'Ortala (Flex)' },
    { trigger: 'abs-center', text: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);', desc: 'Ortala (Absolute)' },
    { trigger: 'hide-scroll', text: 'scrollbar-width: none; -ms-overflow-style: none;', desc: 'Scrollbar gizle' },
  ],
  js: [
    { trigger: 'qs', text: "document.querySelector('')", desc: 'querySelector' },
    { trigger: 'qsa', text: "document.querySelectorAll('')", desc: 'querySelectorAll' },
    { trigger: 'gid', text: "document.getElementById('')", desc: 'getElementById' },
    { trigger: 'cel', text: "document.createElement('')", desc: 'createElement' },
    { trigger: 'ael', text: ".addEventListener('click', () => {\n  \n})", desc: 'addEventListener' },
    { trigger: 'log', text: "console.log()", desc: 'console.log' },
    { trigger: 'warn', text: "console.warn()", desc: 'console.warn' },
    { trigger: 'err', text: "console.error()", desc: 'console.error' },
    { trigger: 'al', text: "alert('')", desc: 'alert' },
    { trigger: 'fn', text: "function name() {\n  \n}", desc: 'Fonksiyon' },
    { trigger: 'afn', text: "const name = () => {\n  \n}", desc: 'Arrow fonksiyon' },
    { trigger: 'if', text: "if (condition) {\n  \n}", desc: 'if bloğu' },
    { trigger: 'ife', text: "if (condition) {\n  \n} else {\n  \n}", desc: 'if-else' },
    { trigger: 'for', text: "for (let i = 0; i < length; i++) {\n  \n}", desc: 'for döngüsü' },
    { trigger: 'fore', text: ".forEach((item) => {\n  \n})", desc: 'forEach' },
    { trigger: 'map', text: ".map((item) => {\n  \n})", desc: 'map' },
    { trigger: 'filter', text: ".filter((item) => {\n  \n})", desc: 'filter' },
    { trigger: 'fetch', text: "fetch('url')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));", desc: 'Fetch API' },
    { trigger: 'timeout', text: "setTimeout(() => {\n  \n}, 1000);", desc: 'setTimeout' },
    { trigger: 'interval', text: "setInterval(() => {\n  \n}, 1000);", desc: 'setInterval' },
    { trigger: 'class', text: "class ClassName {\n  constructor() {\n    \n  }\n}", desc: 'Sınıf' },
    { trigger: 'try', text: "try {\n  \n} catch (error) {\n  console.error(error);\n}", desc: 'try-catch' },
    { trigger: 'async', text: "async function name() {\n  const result = await fetch('url');\n}", desc: 'async fonksiyon' },
    { trigger: 'promise', text: "new Promise((resolve, reject) => {\n  \n})", desc: 'Promise' },
    { trigger: 'stor', text: "localStorage.setItem('key', JSON.stringify(value))", desc: 'localStorage set' },
    { trigger: 'storget', text: "JSON.parse(localStorage.getItem('key'))", desc: 'localStorage get' },
    { trigger: 'inner', text: ".innerHTML = ''", desc: 'innerHTML' },
    { trigger: 'txt', text: ".textContent = ''", desc: 'textContent' },
    { trigger: 'style', text: ".style.property = 'value'", desc: 'style değiştir' },
    { trigger: 'cls', text: ".classList.add('')", desc: 'class ekle' },
    { trigger: 'clsr', text: ".classList.remove('')", desc: 'class kaldır' },
    { trigger: 'clst', text: ".classList.toggle('')", desc: 'class toggle' },
    { trigger: 'attr', text: ".setAttribute('key', 'value')", desc: 'Attribute set' },
    { trigger: 'remove', text: ".remove()", desc: 'Element kaldır' },
    { trigger: 'append', text: ".appendChild(element)", desc: 'appendChild' },
    { trigger: 'dom', text: "document.addEventListener('DOMContentLoaded', () => {\n  \n});", desc: 'DOMContentLoaded' },
  ],
  html: [
    { trigger: 'div', text: "<div></div>", desc: 'div' },
    { trigger: 'p', text: "<p></p>", desc: 'Paragraf' },
    { trigger: 'h1', text: "<h1></h1>", desc: 'Başlık 1' },
    { trigger: 'h2', text: "<h2></h2>", desc: 'Başlık 2' },
    { trigger: 'h3', text: "<h3></h3>", desc: 'Başlık 3' },
    { trigger: 'span', text: "<span></span>", desc: 'span' },
    { trigger: 'a', text: "<a href=''>Link</a>", desc: 'Link' },
    { trigger: 'img', text: "<img src='' alt='' />", desc: 'Resim' },
    { trigger: 'btn', text: "<button>Buton</button>", desc: 'Buton' },
    { trigger: 'input', text: "<input type='text' placeholder='' />", desc: 'Input' },
    { trigger: 'form', text: "<form>\n  \n</form>", desc: 'Form' },
    { trigger: 'ul', text: "<ul>\n  <li></li>\n</ul>", desc: 'Liste' },
    { trigger: 'ol', text: "<ol>\n  <li></li>\n</ol>", desc: 'Sıralı liste' },
    { trigger: 'table', text: "<table>\n  <tr><th>Başlık</th></tr>\n  <tr><td>Veri</td></tr>\n</table>", desc: 'Tablo' },
    { trigger: 'section', text: "<section>\n  \n</section>", desc: 'Section' },
    { trigger: 'nav', text: "<nav>\n  \n</nav>", desc: 'Navigation' },
    { trigger: 'header', text: "<header>\n  \n</header>", desc: 'Header' },
    { trigger: 'footer', text: "<footer>\n  \n</footer>", desc: 'Footer' },
    { trigger: 'main', text: "<main>\n  \n</main>", desc: 'Main' },
    { trigger: 'article', text: "<article>\n  \n</article>", desc: 'Article' },
    { trigger: 'video', text: "<video src='' controls></video>", desc: 'Video' },
    { trigger: 'audio', text: "<audio src='' controls></audio>", desc: 'Ses' },
    { trigger: 'canvas', text: "<canvas id='' width='' height=''></canvas>", desc: 'Canvas' },
    { trigger: 'iframe', text: "<iframe src='' frameborder='0'></iframe>", desc: 'iframe' },
    { trigger: 'select', text: "<select>\n  <option value=''>Seçin</option>\n</select>", desc: 'Select' },
    { trigger: 'textarea', text: "<textarea rows='4' cols='50'></textarea>", desc: 'Textarea' },
    { trigger: 'style', text: "<style>\n  \n</style>", desc: 'Style bloğu' },
    { trigger: 'script', text: "<script>\n  \n</script>", desc: 'Script bloğu' },
    { trigger: 'card', text: "<div style='background:#1a1a2e; border-radius:12px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,.3); color:#fff; max-width:400px;'>\n  <h2>Başlık</h2>\n  <p>İçerik buraya</p>\n  <button style='background:#e94560; border:none; color:#fff; padding:10px 24px; border-radius:8px; cursor:pointer;'>Buton</button>\n</div>", desc: 'Hazır kart' },
    { trigger: 'alert-box', text: "<div style='background:#fef3cd; border:1px solid #ffc107; border-radius:8px; padding:16px; color:#856404;'>\n  ⚠️ Uyarı mesajı buraya\n</div>", desc: 'Uyarı kutusu' },
    { trigger: 'hero', text: "<div style='text-align:center; padding:80px 20px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff;'>\n  <h1 style='font-size:48px; margin-bottom:16px;'>Başlık</h1>\n  <p style='font-size:20px; opacity:.8;'>Alt başlık</p>\n  <button style='margin-top:24px; padding:14px 32px; background:#fff; color:#764ba2; border:none; border-radius:30px; font-size:16px; cursor:pointer;'>Başla</button>\n</div>", desc: 'Hero section' },
  ]
};

export function toggleCssEditor(getActiveWebview, getActiveTab) {
  if (cssEditorOverlay) { closeCssEditor(); return; }
  const webview = getActiveWebview();
  const tab = getActiveTab();
  if (!webview || !tab || tab.isStartPage) { showToast('⚠️ Önce bir siteye gir', 'warning'); return; }

  const overlay = document.createElement('div');
  overlay.className = 'css-editor-overlay';
  overlay.innerHTML = `
    <div class="css-editor-header">
      <div class="code-editor-tabs">
        <button class="code-tab active" data-mode="css">CSS</button>
        <button class="code-tab" data-mode="js">JavaScript</button>
        <button class="code-tab" data-mode="html">HTML</button>
      </div>
      <div class="css-editor-actions">
        <button class="css-editor-btn" id="code-run-btn" title="Çalıştır">▶ Çalıştır</button>
        <button class="css-editor-btn" id="css-copy-btn" title="Kopyala">📋</button>
        <button class="css-editor-btn" id="css-reset-btn" title="Sıfırla">↩️</button>
        <button class="css-editor-btn close" id="css-close-btn" title="Kapat">✕</button>
      </div>
    </div>
    <div class="code-editor-area">
      <div class="code-line-numbers" id="code-line-numbers">1</div>
      <textarea class="css-editor-textarea" id="css-editor-input" placeholder="Kod yazın, Tab ile otomatik tamamlayın..." spellcheck="false"></textarea>
      <div class="code-autocomplete hidden" id="code-autocomplete"></div>
    </div>
    <div class="css-editor-status">
      <span class="code-mode-badge" id="code-mode-badge">CSS</span>
      <span id="css-editor-status-text">Hazır — Kod yazın, ▶ ile çalıştırın</span>
      <span class="code-line-info" id="code-line-info">Satır 1, Sütun 1</span>
    </div>
  `;
  document.body.appendChild(overlay);
  cssEditorOverlay = overlay;

  const input = overlay.querySelector('#css-editor-input');
  const statusText = overlay.querySelector('#css-editor-status-text');
  const lineNumbers = overlay.querySelector('#code-line-numbers');
  const autocompleteEl = overlay.querySelector('#code-autocomplete');
  const modeBadge = overlay.querySelector('#code-mode-badge');
  const lineInfo = overlay.querySelector('#code-line-info');
  const tabs = overlay.querySelectorAll('.code-tab');
  let currentMode = 'css';
  codeEditorState.mode = 'css';
  let autocompleteVisible = false;
  let autocompleteItems = [];
  let selectedAutocomplete = 0;

  input.value = codeEditorState[currentMode] || '';
  updateLineNumbers();

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      codeEditorState[currentMode] = input.value;
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      currentMode = t.dataset.mode;
      codeEditorState.mode = currentMode;
      input.value = codeEditorState[currentMode] || '';
      modeBadge.textContent = currentMode.toUpperCase();
      modeBadge.className = 'code-mode-badge mode-' + currentMode;
      statusText.textContent = 'Hazır — Kod yazın, ▶ ile çalıştırın';
      updateLineNumbers();
      input.focus();
    });
  });

  function updateLineNumbers() {
    const lines = (input.value || '').split(NEWLINE).length;
    lineNumbers.innerHTML = Array.from({length: Math.max(lines, 1)}, (_, i) => i + 1).join('<br>');
  }

  function updateLineInfo() {
    const val = input.value.substring(0, input.selectionStart);
    const line = val.split(NEWLINE).length;
    const col = val.split(NEWLINE).pop().length + 1;
    lineInfo.textContent = 'Satır ' + line + ', Sütun ' + col;
  }

  function getCurrentWord() {
    const pos = input.selectionStart;
    const text = input.value.substring(0, pos);
    const match = text.match(/[a-zA-Z0-9_-]+$/);
    return match ? match[0] : '';
  }

  function showAutocompleteMenu(word) {
    const suggestions = CODE_AUTOCOMPLETE[currentMode] || [];
    autocompleteItems = suggestions.filter(s =>
      s.trigger.toLowerCase().startsWith(word.toLowerCase()) && s.trigger.toLowerCase() !== word.toLowerCase()
    ).slice(0, 8);
    if (autocompleteItems.length === 0 || word.length < 1) { hideAutocomplete(); return; }
    selectedAutocomplete = 0;
    autocompleteEl.innerHTML = autocompleteItems.map((item, i) =>
      '<div class="autocomplete-item' + (i === 0 ? ' selected' : '') + '" data-index="' + i + '">' +
      '<span class="ac-trigger">' + item.trigger + '</span>' +
      '<span class="ac-desc">' + item.desc + '</span></div>'
    ).join('');
    autocompleteEl.classList.remove('hidden');
    autocompleteVisible = true;
    const pos = input.selectionStart;
    const textBefore = input.value.substring(0, pos);
    const lines = textBefore.split(NEWLINE);
    const lineH = 21, charW = 7.8;
    autocompleteEl.style.top = Math.min(lines.length * lineH, input.clientHeight - 200) + 'px';
    autocompleteEl.style.left = Math.min(lines[lines.length - 1].length * charW + 50, input.clientWidth - 200) + 'px';
    autocompleteEl.querySelectorAll('.autocomplete-item').forEach(el => {
      el.addEventListener('click', () => applyAutocomplete(parseInt(el.dataset.index)));
    });
  }

  function hideAutocomplete() { autocompleteEl.classList.add('hidden'); autocompleteVisible = false; }

  function applyAutocomplete(index) {
    const item = autocompleteItems[index];
    if (!item) return;
    const word = getCurrentWord();
    const pos = input.selectionStart;
    const before = input.value.substring(0, pos - word.length);
    const after = input.value.substring(pos);
    input.value = before + item.text + after;
    input.selectionStart = input.selectionEnd = before.length + item.text.length;
    codeEditorState[currentMode] = input.value;
    hideAutocomplete();
    updateLineNumbers();
    input.focus();
  }

  input.addEventListener('input', () => {
    codeEditorState[currentMode] = input.value;
    updateLineNumbers(); updateLineInfo();
    const word = getCurrentWord();
    if (word.length >= 1) showAutocompleteMenu(word); else hideAutocomplete();
  });
  input.addEventListener('click', () => { updateLineInfo(); hideAutocomplete(); });
  input.addEventListener('scroll', () => { lineNumbers.scrollTop = input.scrollTop; });

  input.addEventListener('keydown', (e) => {
    updateLineInfo();
    if (autocompleteVisible) {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedAutocomplete = Math.min(selectedAutocomplete + 1, autocompleteItems.length - 1); autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el, i) => el.classList.toggle('selected', i === selectedAutocomplete)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); selectedAutocomplete = Math.max(selectedAutocomplete - 1, 0); autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el, i) => el.classList.toggle('selected', i === selectedAutocomplete)); return; }
      if (e.key === 'Tab' || e.key === 'Enter') { if (autocompleteItems.length > 0) { e.preventDefault(); applyAutocomplete(selectedAutocomplete); return; } }
      if (e.key === 'Escape') { hideAutocomplete(); return; }
    }
    if (e.key === 'Tab' && !autocompleteVisible) {
      e.preventDefault();
      const start = input.selectionStart, end = input.selectionEnd;
      input.value = input.value.substring(0, start) + '  ' + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + 2;
      codeEditorState[currentMode] = input.value;
      updateLineNumbers();
    }
  });

  overlay.querySelector('#code-run-btn').addEventListener('click', async () => {
    await runInjectedCode(webview, statusText, getActiveTab);
  });
  overlay.querySelector('#css-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(input.value);
    showToast('📋 Kod kopyalandı', 'success');
  });
  overlay.querySelector('#css-reset-btn').addEventListener('click', async () => {
    input.value = '';
    codeEditorState[currentMode] = '';
    try {
      const wcId = webview.getWebContentsId();
      if (wcId) {
        await window.electronAPI.removeInjectedCSS({ webContentsId: wcId });
        await window.electronAPI.injectJS({ webContentsId: wcId, code: `(function(){var el=document.getElementById('barly-live-html');if(el)el.remove();var ind=document.getElementById('barly-inject-indicator');if(ind)ind.remove();})();` });
      }
    } catch(e) {}
    statusText.textContent = 'Temizlendi — Kod yazın, ▶ ile çalıştırın';
    updateLineNumbers();
    showToast('↩️ Tüm enjekte kodlar sıfırlandı', 'success');
  });
  overlay.querySelector('#css-close-btn').addEventListener('click', closeCssEditor);
  setTimeout(() => input.focus(), 50);
}

async function runInjectedCode(webview, statusText, getActiveTab) {
  const mode = codeEditorState.mode || 'css';
  const code = codeEditorState[mode] || '';
  if (!code.trim()) { statusText.textContent = '⚠️ Kod alanı boş'; return; }

  let wcId;
  try { wcId = webview.getWebContentsId(); } catch(e) { wcId = null; }
  if (!wcId) { statusText.textContent = '❌ Sayfa henüz yüklenmedi'; showToast('❌ Sayfa yüklenmedi', 'error'); return; }

  const tab = getActiveTab();
  const siteName = tab ? (tab.url || '').replace(/^https?:\/\//, '').split('/')[0] : 'site';

  try {
    if (mode === 'css') {
      const result = await window.electronAPI.injectCSS({ webContentsId: wcId, css: code });
      if (!result.success) { statusText.textContent = '❌ CSS hatası: ' + result.error; return; }
      const lines = code.split(NEWLINE).filter(l => l.trim()).length;
      statusText.textContent = '✅ CSS uygulandı (' + siteName + ') — ' + lines + ' satır';
      showToast('🎨 CSS enjekte edildi: ' + siteName, 'success');
    } else if (mode === 'js') {
      const result = await window.electronAPI.injectJS({ webContentsId: wcId, code });
      if (!result.success) { statusText.textContent = '❌ JS hatası: ' + result.error; return; }
      statusText.textContent = '✅ JS çalıştırıldı (' + siteName + ')';
      showToast('⚡ JavaScript çalıştırıldı: ' + siteName, 'success');
    } else if (mode === 'html') {
      const wrappedCode = `(function(){var el=document.getElementById('barly-live-html');if(!el){el=document.createElement('div');el.id='barly-live-html';el.style.cssText='position:fixed;bottom:20px;right:20px;z-index:2147483647;';document.body.appendChild(el);}el.innerHTML=decodeURIComponent("${encodeURIComponent(code)}");el.querySelectorAll('script').forEach(function(s){var ns=document.createElement('script');ns.textContent=s.textContent;document.body.appendChild(ns);});return'ok';})();`;
      const result = await window.electronAPI.injectJS({ webContentsId: wcId, code: wrappedCode });
      if (!result.success) { statusText.textContent = '❌ HTML hatası: ' + result.error; return; }
      statusText.textContent = '✅ HTML enjekte edildi (' + siteName + ')';
      showToast('📄 HTML enjekte edildi: ' + siteName, 'success');
    }
  } catch(e) {
    statusText.textContent = '❌ Hata: ' + (e.message || 'Bilinmeyen hata');
  }
}

export function closeCssEditor() {
  if (cssEditorOverlay) {
    const input = cssEditorOverlay.querySelector('#css-editor-input');
    const activeTab = cssEditorOverlay.querySelector('.code-tab.active');
    if (input && activeTab) codeEditorState[activeTab.dataset.mode] = input.value;
    cssEditorOverlay.remove();
    cssEditorOverlay = null;
  }
}
