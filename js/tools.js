/* ==========================================================================
   TK TASKKRAFT STUDIO - DEVELOPER UTILITIES MODULE
   ========================================================================== */

window.TK_Tools = {
  init: function() {
    this.setupJsonTools();
    this.setupBase64Tools();
    this.setupPaletteGenerator();
    this.setupRegexTester();
  },

  // 1. JSON Formatter & Minifier
  setupJsonTools: function() {
    const jsonInput = document.getElementById('json-input');
    const formatBtn = document.getElementById('btn-format-json');
    const minifyBtn = document.getElementById('btn-minify-json');
    const copyBtn = document.getElementById('btn-copy-json');

    if (formatBtn) {
      formatBtn.addEventListener('click', () => {
        try {
          const val = jsonInput.value.trim();
          if (!val) return;
          const parsed = JSON.parse(val);
          jsonInput.value = JSON.stringify(parsed, null, 2);
          window.TK.showToast('JSON formatted successfully!', 'fa-check');
        } catch (e) {
          window.TK.showToast(`Invalid JSON: ${e.message}`, 'fa-triangle-exclamation', 'rose');
        }
      });
    }

    if (minifyBtn) {
      minifyBtn.addEventListener('click', () => {
        try {
          const val = jsonInput.value.trim();
          if (!val) return;
          const parsed = JSON.parse(val);
          jsonInput.value = JSON.stringify(parsed);
          window.TK.showToast('JSON minified!', 'fa-compress');
        } catch (e) {
          window.TK.showToast(`Invalid JSON: ${e.message}`, 'fa-triangle-exclamation', 'rose');
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (jsonInput.value) {
          navigator.clipboard.writeText(jsonInput.value);
          window.TK.showToast('JSON copied to clipboard!', 'fa-copy');
        }
      });
    }
  },

  // 2. Base64 Encoder / Decoder
  setupBase64Tools: function() {
    const b64Input = document.getElementById('b64-input');
    const encodeBtn = document.getElementById('btn-encode-b64');
    const decodeBtn = document.getElementById('btn-decode-b64');
    const copyBtn = document.getElementById('btn-copy-b64');

    if (encodeBtn) {
      encodeBtn.addEventListener('click', () => {
        try {
          b64Input.value = btoa(b64Input.value);
          window.TK.showToast('Encoded to Base64', 'fa-lock');
        } catch (e) {
          window.TK.showToast('Encoding error', 'fa-triangle-exclamation', 'rose');
        }
      });
    }

    if (decodeBtn) {
      decodeBtn.addEventListener('click', () => {
        try {
          b64Input.value = atob(b64Input.value.trim());
          window.TK.showToast('Decoded from Base64', 'fa-unlock');
        } catch (e) {
          window.TK.showToast('Invalid Base64 string', 'fa-triangle-exclamation', 'rose');
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (b64Input.value) {
          navigator.clipboard.writeText(b64Input.value);
          window.TK.showToast('Copied to clipboard!', 'fa-copy');
        }
      });
    }
  },

  // 3. Color Palette Generator
  setupPaletteGenerator: function() {
    const genBtn = document.getElementById('btn-gen-palette');
    const container = document.getElementById('palette-swatches');

    const generate = () => {
      if (!container) return;
      container.innerHTML = '';
      
      const colors = [];
      for (let i = 0; i < 5; i++) {
        const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        colors.push(hex);

        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = hex;
        swatch.textContent = hex.toUpperCase();

        swatch.addEventListener('click', () => {
          navigator.clipboard.writeText(hex);
          window.TK.showToast(`Copied ${hex.toUpperCase()}!`, 'fa-palette');
        });

        container.appendChild(swatch);
      }
    };

    if (genBtn) genBtn.addEventListener('click', generate);
    generate();
  },

  // 4. Regex Tester
  setupRegexTester: function() {
    const patternInput = document.getElementById('regex-pattern');
    const textInput = document.getElementById('regex-input');
    const resultBox = document.getElementById('regex-result');

    const evaluate = () => {
      if (!patternInput || !textInput || !resultBox) return;

      const pattern = patternInput.value.trim();
      const text = textInput.value;

      if (!pattern) {
        resultBox.innerHTML = '<span style="color: var(--text-dim);">Waiting for regex pattern...</span>';
        return;
      }

      try {
        const regex = new RegExp(pattern, 'g');
        const matches = [...text.matchAll(regex)];

        if (matches.length > 0) {
          resultBox.innerHTML = `
            <span style="color: var(--accent-emerald); font-weight: 700;">
              <i class="fa-solid fa-circle-check"></i> Found ${matches.length} match(es):
            </span> 
            <code style="margin-left: 8px;">${matches.map(m => m[0]).join(', ')}</code>
          `;
        } else {
          resultBox.innerHTML = '<span style="color: var(--accent-rose);"><i class="fa-solid fa-circle-xmark"></i> No matches found.</span>';
        }
      } catch (e) {
        resultBox.innerHTML = `<span style="color: var(--accent-amber);"><i class="fa-solid fa-triangle-exclamation"></i> Regex Error: ${e.message}</span>`;
      }
    };

    if (patternInput) patternInput.addEventListener('input', evaluate);
    if (textInput) textInput.addEventListener('input', evaluate);
  }
};

// Initialize Tools on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.TK_Tools.init();
});
