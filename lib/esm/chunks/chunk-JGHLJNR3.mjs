/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslFormElement
} from "./chunk-APNO5X2D.mjs";
import {
  define,
  emit,
  moveFocus,
  nextId
} from "./chunk-O4IHLMQS.mjs";

// src/components/editor.js
var KEEP = /* @__PURE__ */ new Set(["P", "BR", "STRONG", "EM", "U", "S", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "A"]);
var RENAME = { B: "STRONG", I: "EM", STRIKE: "S", DEL: "S", H1: "H2", H4: "H3", H5: "H3", H6: "H3", DIV: "P", SECTION: "P", ARTICLE: "P" };
var DROP = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "TEMPLATE", "IFRAME", "OBJECT", "EMBED", "NOSCRIPT", "SVG", "MATH", "IMG", "VIDEO", "AUDIO", "CANVAS", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "FORM", "META", "LINK", "HEAD", "TITLE"]);
var SAFE_URL = /^(https?:|mailto:|tel:|#|\/(?!\/))/i;
var hrefOf = (a) => (a.attributes.getNamedItem("href") || {}).value || "";
var escapeHTML = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function sanitizeHTML(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html || "");
  const out = document.createDocumentFragment();
  const walk = (from, to) => {
    from.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (/^\s*$/.test(node.textContent) && node.textContent.includes("\n")) return;
        to.appendChild(document.createTextNode(node.textContent));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = RENAME[node.tagName] || node.tagName;
      if (DROP.has(node.tagName)) return;
      if (!KEEP.has(tag)) {
        walk(node, to);
        return;
      }
      const el = document.createElement(tag);
      if (tag === "A") {
        const href = hrefOf(node).trim();
        if (!SAFE_URL.test(href)) {
          walk(node, to);
          return;
        }
        el.setAttribute("href", href);
      }
      walk(node, el);
      if (/^(P|H2|H3|BLOCKQUOTE|LI)$/.test(tag) && !el.textContent.trim() && !el.querySelector("br")) return;
      to.appendChild(el);
    });
  };
  walk(tpl.content, out);
  const box = document.createElement("div");
  box.appendChild(out);
  return box.innerHTML;
}
var ICONS = {
  bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
  italic: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>',
  underline: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>',
  strike: '<path d="M5 12h14M16 6.5A4 4 0 0 0 12 5c-2.5 0-4 1.3-4 3 0 1.4.9 2.3 2.5 3M8 17.5A4.5 4.5 0 0 0 12 19c2.6 0 4.2-1.4 4.2-3.2 0-.7-.2-1.3-.6-1.8"/>',
  h2: '<path d="M4 6v12M12 6v12M4 12h8"/><text x="15" y="19" font-size="9" font-weight="700" stroke="none" fill="currentColor">2</text>',
  h3: '<path d="M4 6v12M12 6v12M4 12h8"/><text x="15" y="19" font-size="9" font-weight="700" stroke="none" fill="currentColor">3</text>',
  ul: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  ol: '<path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 13.5c.3-.8 2.5-1 2.5.3 0 .9-2.5 1.7-2.5 3.2H6"/>',
  quote: '<path d="M6 17c-1.7 0-3-1.3-3-3 0-3 2-6 5-7M15 17c-1.7 0-3-1.3-3-3 0-3 2-6 5-7"/><path d="M3 14h4v3H3zM12 14h4v3h-4z" fill="currentColor"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  undo: '<path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2"/>',
  redo: '<path d="M15 7l5 5-5 5M20 12H9a5 5 0 0 0 0 10h2"/>'
};
var mod = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "⌘" : "Ctrl+";
var TOOLS = {
  bold: { label: "Negrita", keys: `${mod}B`, cmd: "bold", toggle: true },
  italic: { label: "Cursiva", keys: `${mod}I`, cmd: "italic", toggle: true },
  underline: { label: "Subrayado", keys: `${mod}U`, cmd: "underline", toggle: true },
  strike: { label: "Tachado", cmd: "strikeThrough", toggle: true },
  h2: { label: "Título", block: "h2", toggle: true },
  h3: { label: "Subtítulo", block: "h3", toggle: true },
  ul: { label: "Lista con viñetas", cmd: "insertUnorderedList", toggle: true },
  ol: { label: "Lista numerada", cmd: "insertOrderedList", toggle: true },
  quote: { label: "Cita", block: "blockquote", toggle: true },
  code: { label: "Código", toggle: true },
  link: { label: "Enlace", keys: `${mod}K`, toggle: true },
  undo: { label: "Deshacer", keys: `${mod}Z`, cmd: "undo" },
  redo: { label: "Rehacer", keys: `${mod}${mod === "⌘" ? "⇧Z" : "Y"}`, cmd: "redo" }
};
var TslEditor = class extends TslFormElement {
  static get observedAttributes() {
    return ["disabled", "readonly"];
  }
  setup() {
    this.initial = sanitizeHTML(this.innerHTML);
    this.textContent = "";
    const label = this.getAttribute("label") || "Texto";
    this.content = document.createElement("div");
    this.content.className = "tsl-editor__content";
    this.content.id = nextId("tsl-editor");
    this.content.setAttribute("role", "textbox");
    this.content.setAttribute("aria-multiline", "true");
    this.content.setAttribute("aria-label", label);
    this.content.dataset.placeholder = this.getAttribute("placeholder") || "";
    this.content.innerHTML = this.initial;
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tsl-editor__toolbar";
    this.toolbar.setAttribute("role", "toolbar");
    this.toolbar.setAttribute("aria-label", `Formato de ${label.toLowerCase()}`);
    this.toolbar.setAttribute("aria-controls", this.content.id);
    this.tools = {};
    const spec = (this.getAttribute("toolbar") || "bold italic underline strike | h2 h3 | ul ol quote code | link | undo redo").split(/\s+/).filter(Boolean);
    spec.forEach((key) => {
      if (key === "|") {
        const sep = document.createElement("span");
        sep.className = "tsl-editor__sep";
        sep.setAttribute("aria-hidden", "true");
        this.toolbar.appendChild(sep);
        return;
      }
      const tool = TOOLS[key];
      if (!tool) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tsl-editor__tool";
      b.dataset.tool = key;
      b.tabIndex = -1;
      b.setAttribute("aria-label", tool.label);
      b.title = tool.keys ? `${tool.label} (${tool.keys})` : tool.label;
      if (tool.keys) b.setAttribute("aria-keyshortcuts", tool.keys.replace("⌘", "Meta+").replace("⇧", "Shift+"));
      if (tool.toggle) b.setAttribute("aria-pressed", "false");
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>`;
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", () => this.run(key));
      this.tools[key] = b;
      this.toolbar.appendChild(b);
    });
    const first = this.toolbar.querySelector("button");
    if (first) first.tabIndex = 0;
    this.toolbar.addEventListener("keydown", (e) => {
      const items = Array.from(this.toolbar.querySelectorAll("button:not(:disabled)"));
      const next = moveFocus(items, document.activeElement, e.key, { horizontal: true });
      if (!next) return;
      e.preventDefault();
      items.forEach((b) => b.tabIndex = -1);
      next.tabIndex = 0;
      next.focus();
    });
    this.linkbar = document.createElement("div");
    this.linkbar.className = "tsl-editor__linkbar";
    this.linkbar.hidden = true;
    this.linkbar.innerHTML = '<input class="tsl-input" type="url" placeholder="https://…" /><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-apply>Aplicar</button><button type="button" class="tsl-btn tsl-btn--sm" data-unlink>Quitar enlace</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cancel>Cancelar</button>';
    this.linkInput = this.linkbar.querySelector("input");
    this.linkInput.setAttribute("aria-label", this.getAttribute("link-label") || "Dirección del enlace");
    this.linkbar.querySelector("[data-apply]").addEventListener("click", () => this.applyLink());
    this.linkbar.querySelector("[data-unlink]").addEventListener("click", () => this.applyLink(""));
    this.linkbar.querySelector("[data-cancel]").addEventListener("click", () => this.closeLink());
    this.linkInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.applyLink();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.closeLink();
      }
    });
    this.counter = document.createElement("div");
    this.counter.className = "tsl-editor__count";
    this.counter.hidden = !this.maxLength;
    this.append(this.toolbar, this.linkbar, this.content, this.counter);
    this.content.addEventListener("focus", () => document.execCommand("defaultParagraphSeparator", false, "p"));
    this.content.addEventListener("input", () => this.sync());
    this.content.addEventListener("blur", () => this.commit());
    this.content.addEventListener("keydown", (e) => this.onKey(e));
    this.content.addEventListener("paste", (e) => this.onPaste(e));
    this.content.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (!dt) return;
      e.preventDefault();
      if (dt.files.length) return;
      const html = dt.getData("text/html");
      const text = dt.getData("text/plain");
      const range = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
      if (range) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      if (html) document.execCommand("insertHTML", false, sanitizeHTML(html));
      else if (text) document.execCommand("insertText", false, text);
    });
    document.addEventListener("selectionchange", () => {
      if (this.isConnected && this.content.contains(window.getSelection().anchorNode)) this.paintTools();
    });
    this.committed = this.value;
    this.syncDisabled();
    this.sync();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name);
    if (name === "readonly" && this._tslReady) this.syncDisabled();
  }
  get maxLength() {
    return parseInt(this.getAttribute("maxlength"), 10) || 0;
  }
  /** Texto sin formato. */
  get text() {
    return this.content ? this.content.innerText.replace(/\n{3,}/g, "\n\n").trim() : "";
  }
  get isEmpty() {
    return !this.text && !this.content.querySelector("li, br + br");
  }
  /** HTML saneado ("" si está vacío). */
  get value() {
    if (!this.content) return sanitizeHTML(this.innerHTML);
    return this.text ? sanitizeHTML(this.content.innerHTML) : "";
  }
  set value(html) {
    this.content.innerHTML = sanitizeHTML(html);
    this.committed = this.value;
    this.sync();
  }
  focus(options) {
    if (this.content) this.content.focus(options);
  }
  get editable() {
    return !this.isDisabled && !this.hasAttribute("readonly");
  }
  run(key) {
    if (!this.editable) return;
    const tool = TOOLS[key];
    if (document.activeElement !== this.content && key !== "link") this.content.focus();
    if (key === "link") this.openLink();
    else if (key === "code") this.toggleCode();
    else if (tool.block) {
      const now = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
      document.execCommand("formatBlock", false, now === tool.block ? "p" : tool.block);
    } else document.execCommand(tool.cmd, false, null);
    this.sync();
    this.paintTools();
  }
  // Elemento del tipo indicado que contiene la selección
  around(tag) {
    const sel = window.getSelection();
    let n = sel.anchorNode;
    while (n && n !== this.content) {
      if (n.nodeType === 1 && n.tagName === tag) return n;
      n = n.parentNode;
    }
    return null;
  }
  // Con el DOM y no con insertHTML: Chrome cambia el <code> insertado por un <span> con estilos
  toggleCode() {
    const sel = window.getSelection();
    const code = this.around("CODE");
    const r = document.createRange();
    if (code) {
      const text = document.createTextNode(code.textContent);
      code.replaceWith(text);
      r.selectNodeContents(text);
    } else if (!sel.isCollapsed && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const el = document.createElement("code");
      el.textContent = range.toString();
      range.deleteContents();
      range.insertNode(el);
      r.selectNodeContents(el);
    } else return;
    sel.removeAllRanges();
    sel.addRange(r);
  }
  openLink() {
    const sel = window.getSelection();
    this.savedRange = sel.rangeCount && this.content.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
    const a = this.around("A");
    this.linkInput.value = a ? hrefOf(a) : "";
    this.linkbar.querySelector("[data-unlink]").hidden = !a;
    this.linkbar.hidden = false;
    this.linkInput.focus();
  }
  closeLink() {
    this.linkbar.hidden = true;
    this.restore();
  }
  restore() {
    this.content.focus();
    if (this.savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this.savedRange);
    }
  }
  /** Aplica (o con "" quita) el enlace de la selección. */
  applyLink(href = this.linkInput.value.trim()) {
    this.linkbar.hidden = true;
    this.restore();
    const a = this.around("A");
    const sel = window.getSelection();
    if (a && sel.isCollapsed) {
      const r = document.createRange();
      r.selectNodeContents(a);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    if (!href) {
      document.execCommand("unlink", false, null);
    } else {
      const url = /^[a-z][a-z0-9+.-]*:|^[#/]/i.test(href) ? href : `https://${href}`;
      if (!SAFE_URL.test(url)) return;
      if (sel.isCollapsed) document.execCommand("insertHTML", false, `<a href="${escapeHTML(url)}">${escapeHTML(href)}</a>`);
      else document.execCommand("createLink", false, url);
    }
    this.sync();
    this.paintTools();
  }
  onKey(e) {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "k") {
      e.preventDefault();
      e.stopPropagation();
      this.run("link");
    } else if (e.key === "Tab" && this.around("LI") && this.editable) {
      e.preventDefault();
      document.execCommand(e.shiftKey ? "outdent" : "indent", false, null);
      this.sync();
    }
  }
  onPaste(e) {
    if (!e.clipboardData) return;
    e.preventDefault();
    if (!this.editable) return;
    const html = e.clipboardData.getData("text/html");
    if (html) document.execCommand("insertHTML", false, sanitizeHTML(html));
    else document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    this.sync();
  }
  paintTools() {
    Object.entries(this.tools).forEach(([key, b]) => {
      const tool = TOOLS[key];
      if (!tool.toggle) return;
      let on = false;
      if (key === "link") on = Boolean(this.around("A"));
      else if (key === "code") on = Boolean(this.around("CODE"));
      else if (tool.block) on = String(document.queryCommandValue("formatBlock") || "").toLowerCase() === tool.block;
      else on = document.queryCommandState(tool.cmd);
      b.setAttribute("aria-pressed", String(on));
    });
  }
  commit() {
    if (this.value === this.committed) return;
    this.committed = this.value;
    emit(this, "tsl-change", { value: this.value, text: this.text });
  }
  sync() {
    if (!this.content) return;
    const len = this.text.length;
    this.content.toggleAttribute("data-empty", this.isEmpty);
    if (this.maxLength) {
      this.counter.textContent = `${len} / ${this.maxLength}`;
      this.counter.toggleAttribute("data-over", len > this.maxLength);
    }
    if (!this.internals) return;
    const value = this.value;
    this.internals.setFormValue(value || null);
    if (this.hasAttribute("required") && !value) {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Escribe algo.", this.content);
    } else if (this.maxLength && len > this.maxLength) {
      const extra = len - this.maxLength;
      this.internals.setValidity({ tooLong: true }, `Máximo ${this.maxLength} caracteres (sobran ${extra}).`, this.content);
    } else {
      this.internals.setValidity({});
    }
  }
  syncDisabled() {
    if (!this.content) return;
    const on = this.editable;
    this.content.contentEditable = on ? "true" : "false";
    this.content.setAttribute("aria-disabled", String(this.isDisabled));
    this.content.setAttribute("aria-readonly", String(this.hasAttribute("readonly")));
    this.content.tabIndex = this.isDisabled ? -1 : 0;
    Object.values(this.tools).forEach((b) => b.disabled = !on);
  }
  reset() {
    this.content.innerHTML = this.initial;
    this.committed = this.value;
    this.sync();
  }
};
define("tsl-editor", TslEditor);

export {
  sanitizeHTML,
  TslEditor
};
