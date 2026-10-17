// ============================================================================
// Tesela — Resaltador de sintaxis HTML / JS minimalista compartido por la galería y la documentación
// La salida usa las clases .tok-tag .tok-attr .tok-str .tok-com .tok-kw.
// ============================================================================

(function () {
  "use strict";

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function html(src) {
    const re = /<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*(?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/g;
    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("<!--")) {
        out += `<span class="tok-com">${esc(tok)}</span>`;
      } else {
        const parts = /^(<\/?)([\w-]+)([\s\S]*?)(\/?>)$/.exec(tok);
        const attrs = parts[3].replace(/([^\s=]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)?|([^\s=]+)/g, (all, name, eq, val, bare) => {
          if (bare) return `<span class="tok-attr">${esc(bare)}</span>`;
          return `<span class="tok-attr">${esc(name)}</span>${esc(eq || "")}${val ? `<span class="tok-str">${esc(val)}</span>` : ""}`;
        });
        out += `${esc(parts[1])}<span class="tok-tag">${parts[2]}</span>${attrs}${esc(parts[4])}`;
      }
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  function js(src) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|of|in|while|new|await|async|true|false|null|undefined|this|class|switch|case|break|continue|typeof|document|window)\b/g;
    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += `<span class="tok-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tok-str">${esc(m[2])}</span>`;
      else out += `<span class="tok-kw">${esc(m[3])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  window.TESELA_HIGHLIGHT = { html, js };
})();
