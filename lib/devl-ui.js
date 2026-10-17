// ============================================================================
// devl-ui — Biblioteca de componentes sin dependencias (capa de comportamiento)
// Custom Elements (light DOM, con estilos de devl-ui.css) + atributos data-*.
// Expone window.DevlUI = { toast, copy, confirm, position, setTheme, getTheme, init, version }.
// Todos los eventos personalizados llevan el prefijo `dv-` y burbujean.
// ============================================================================

(function () {
  "use strict";

  const VERSION = "1.3.0";
  let uid = 0;
  const nextId = (prefix) => `${prefix}-${++uid}`;

  const emit = (el, name, detail) =>
    el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_) {}
    }
  };

  // Runs setup() once, after children are parsed, even if the script is in <head>
  class DvElement extends HTMLElement {
    connectedCallback() {
      if (this._dvReady) return;
      const go = () => {
        if (this._dvReady || !this.isConnected) return;
        this._dvReady = true;
        this.setup();
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", go, { once: true });
      } else {
        go();
      }
    }

    setup() {}
  }

  const define = (name, ctor) => {
    if (!customElements.get(name)) customElements.define(name, ctor);
  };

  // Roving focus for lists of items driven by arrow keys
  function moveFocus(items, current, key, { horizontal = false } = {}) {
    const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    const idx = items.indexOf(current);
    let next = null;
    if (key === nextKey) next = items[(idx + 1) % items.length];
    else if (key === prevKey) next = items[(idx - 1 + items.length) % items.length];
    else if (key === "Home") next = items[0];
    else if (key === "End") next = items[items.length - 1];
    return next;
  }

  // --------------------------------------------------------------------------
  // 1. Theme
  // --------------------------------------------------------------------------
  const THEME_KEY = "dv-theme";

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    storage.set(THEME_KEY, next);
    emit(document, "dv-theme", { theme: next });
    return next;
  }

  const storedTheme = storage.get(THEME_KEY);
  if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);

  // --------------------------------------------------------------------------
  // 2. Toasts
  // --------------------------------------------------------------------------
  function toastRegion() {
    let region = document.querySelector(".dv-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "dv-toast-region";
      region.setAttribute("role", "region");
      region.setAttribute("aria-label", "Notificaciones");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  /**
   * DevlUI.toast("Saved") or DevlUI.toast({ title, description, variant, duration, action: { label, onClick } })
   * variant: "success" | "info" | "warning" | "danger" | "neutral". duration: ms, 0 = sticky.
   * Returns a function that dismisses the toast.
   */
  function toast(options) {
    const opts = typeof options === "string" ? { title: options } : options || {};
    const { title = "", description = "", variant = "success", duration = 3200, action } = opts;

    const el = document.createElement("div");
    el.className = `dv-toast dv-toast--${variant}`;
    el.setAttribute("role", variant === "danger" ? "alert" : "status");

    const body = document.createElement("div");
    body.className = "dv-toast__body";
    if (title) {
      const t = document.createElement("div");
      t.className = "dv-toast__title";
      t.textContent = title;
      body.appendChild(t);
    }
    if (description) {
      const d = document.createElement("div");
      d.className = "dv-toast__desc";
      d.textContent = description;
      body.appendChild(d);
    }
    el.appendChild(body);

    let timer = 0;
    const dismiss = () => {
      clearTimeout(timer);
      if (!el.isConnected || el.classList.contains("is-leaving")) return;
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 220);
    };

    if (action && action.label) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dv-btn dv-btn--sm dv-toast__action";
      btn.textContent = action.label;
      btn.addEventListener("click", () => {
        if (typeof action.onClick === "function") action.onClick();
        dismiss();
      });
      el.appendChild(btn);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "dv-toast__close";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "✕";
    close.addEventListener("click", dismiss);
    el.appendChild(close);

    toastRegion().appendChild(el);
    if (duration > 0) {
      const arm = () => (timer = setTimeout(dismiss, duration));
      el.addEventListener("pointerenter", () => clearTimeout(timer));
      el.addEventListener("pointerleave", arm);
      arm();
    }
    return dismiss;
  }

  // --------------------------------------------------------------------------
  // 3. Clipboard
  // --------------------------------------------------------------------------
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback for insecure contexts (file://, http)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  // --------------------------------------------------------------------------
  // 4. <dv-tabs>
  // --------------------------------------------------------------------------
  class DvTabs extends DvElement {
    setup() {
      this.tabs = Array.from(this.querySelectorAll(":scope > .dv-tabs__list > .dv-tabs__tab"));
      this.panels = Array.from(this.querySelectorAll(":scope > .dv-tabs__panel"));
      const list = this.querySelector(":scope > .dv-tabs__list");
      if (list) list.setAttribute("role", "tablist");

      this.tabs.forEach((tab) => {
        const key = tab.dataset.tab;
        const panel = this.panels.find((p) => p.dataset.panel === key);
        tab.id = tab.id || nextId("dv-tab");
        tab.type = "button";
        tab.setAttribute("role", "tab");
        if (panel) {
          panel.id = panel.id || nextId("dv-panel");
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("tabindex", "0");
          panel.setAttribute("aria-labelledby", tab.id);
          tab.setAttribute("aria-controls", panel.id);
        }
        tab.addEventListener("click", () => this.select(key, true));
        tab.addEventListener("keydown", (e) => {
          const next = moveFocus(this.tabs, tab, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
            this.select(next.dataset.tab, true);
          }
        });
      });

      const initial = this.getAttribute("value") || (this.tabs[0] && this.tabs[0].dataset.tab);
      this.select(initial, false);
    }

    get value() {
      return this._value;
    }

    set value(v) {
      this.select(v, false);
    }

    select(key, fire) {
      if (!this.tabs.some((t) => t.dataset.tab === key)) return;
      this._value = key;
      this.tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      this.panels.forEach((p) => (p.hidden = p.dataset.panel !== key));
      if (fire) emit(this, "dv-change", { value: key });
    }
  }

  // --------------------------------------------------------------------------
  // 5. <dv-segmented>
  // --------------------------------------------------------------------------
  class DvSegmented extends DvElement {
    setup() {
      this.classList.add("dv-segmented");
      this.setAttribute("role", "radiogroup");
      this.items = Array.from(this.querySelectorAll(".dv-segmented__item"));
      this.items.forEach((item) => {
        item.type = "button";
        item.setAttribute("role", "radio");
        item.addEventListener("click", () => this.select(item.value, true));
        item.addEventListener("keydown", (e) => {
          const next = moveFocus(this.items, item, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
            this.select(next.value, true);
          }
        });
      });
      this.select(this.getAttribute("value") || (this.items[0] && this.items[0].value), false);
    }

    get value() {
      return this._value;
    }

    set value(v) {
      this.select(v, false);
    }

    select(value, fire) {
      if (!this.items.some((i) => i.value === value)) return;
      this._value = value;
      this.items.forEach((i) => {
        const on = i.value === value;
        i.setAttribute("aria-checked", String(on));
        i.tabIndex = on ? 0 : -1;
      });
      if (fire) emit(this, "dv-change", { value });
    }
  }

  // --------------------------------------------------------------------------
  // 6. <dv-menu> — dropdown menu with keyboard navigation
  // --------------------------------------------------------------------------
  const openMenus = new Set();

  class DvMenu extends DvElement {
    setup() {
      this.trigger = this.querySelector("[data-dv-trigger]") || this.querySelector("button");
      this.list = this.querySelector(".dv-menu__list");
      if (!this.trigger || !this.list) return;

      this.list.id = this.list.id || nextId("dv-menu");
      this.list.setAttribute("role", "menu");
      this.list.hidden = true;
      this.trigger.setAttribute("aria-haspopup", "menu");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this.list.id);

      this.items().forEach((item) => {
        item.setAttribute("role", "menuitem");
        item.tabIndex = -1;
      });

      this.trigger.addEventListener("click", () => (this.list.hidden ? this.open() : this.close()));
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.open(e.key === "ArrowUp" ? "last" : "first");
        }
      });

      this.list.addEventListener("keydown", (e) => {
        const items = this.items();
        if (e.key === "Escape") {
          e.preventDefault();
          this.close(true);
          return;
        }
        if (e.key === "Tab") {
          this.close();
          return;
        }
        const next = moveFocus(items, document.activeElement, e.key);
        if (next) {
          e.preventDefault();
          next.focus();
        }
      });

      this.list.addEventListener("click", (e) => {
        const item = e.target.closest(".dv-menu__item");
        if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
        emit(this, "dv-select", { value: item.dataset.value || item.textContent.trim(), item });
        this.close(true);
      });
    }

    items() {
      return Array.from(this.list.querySelectorAll(".dv-menu__item:not([disabled])"));
    }

    open(focus = "first") {
      openMenus.forEach((m) => m !== this && m.close());
      this.list.hidden = false;
      this.trigger.setAttribute("aria-expanded", "true");
      openMenus.add(this);
      const items = this.items();
      const target = focus === "last" ? items[items.length - 1] : items[0];
      if (target) target.focus();
    }

    close(returnFocus = false) {
      if (!this.list || this.list.hidden) return;
      this.list.hidden = true;
      this.trigger.setAttribute("aria-expanded", "false");
      openMenus.delete(this);
      if (returnFocus) this.trigger.focus();
    }
  }

  document.addEventListener("pointerdown", (e) => {
    openMenus.forEach((menu) => {
      if (!menu.contains(e.target)) menu.close();
    });
  });

  // --------------------------------------------------------------------------
  // 7. <dv-command> — command palette in a native <dialog>
  // --------------------------------------------------------------------------
  // Substring matches win; otherwise a compact in-order subsequence (e.g. "cmdp" → "command palette")
  function fuzzyScore(text, query) {
    if (!query) return 1;
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    const at = t.indexOf(q);
    if (at !== -1) return 1000 - at;
    let qi = 0;
    let first = -1;
    let lastHit = -1;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        if (first === -1) first = ti;
        lastHit = ti;
        qi++;
      }
    }
    if (qi < q.length) return 0;
    const span = lastHit - first + 1;
    return span <= q.length * 3 ? 100 - span : 0;
  }

  class DvCommand extends DvElement {
    setup() {
      const items = Array.from(this.querySelectorAll(":scope > .dv-command__item"));

      this.dialog = document.createElement("dialog");
      this.dialog.className = "dv-dialog dv-command";
      this.dialog.setAttribute("aria-label", this.getAttribute("label") || "Paleta de comandos");
      this.dialog.innerHTML = `
        <div class="dv-command__search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="dv-command__input" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" />
          <kbd class="dv-kbd">ESC</kbd>
        </div>
        <div class="dv-command__list" role="listbox"></div>
        <div class="dv-command__empty" hidden></div>
        <div class="dv-command__footer"><span>↑ ↓ navegar · ↵ elegir</span><span></span></div>`;

      this.input = this.dialog.querySelector(".dv-command__input");
      this.listEl = this.dialog.querySelector(".dv-command__list");
      this.emptyEl = this.dialog.querySelector(".dv-command__empty");
      this.input.placeholder = this.getAttribute("placeholder") || "Escribe un comando o busca…";
      this.emptyEl.textContent = this.getAttribute("empty") || "Sin resultados.";
      this.listEl.id = nextId("dv-cmdlist");
      this.input.setAttribute("aria-controls", this.listEl.id);

      // Move declared items into the dialog, grouped by data-group (in order of appearance)
      this.groups = [];
      items.forEach((item) => {
        item.type = "button";
        item.id = item.id || nextId("dv-cmd");
        item.setAttribute("role", "option");
        item.tabIndex = -1;
        const groupName = item.dataset.group || "";
        let group = this.groups.find((g) => g.name === groupName);
        if (!group) {
          const header = document.createElement("div");
          header.className = "dv-command__group";
          header.textContent = groupName;
          header.hidden = !groupName;
          group = { name: groupName, header, items: [] };
          this.groups.push(group);
        }
        group.items.push(item);
      });
      this.groups.forEach((g) => {
        this.listEl.appendChild(g.header);
        g.items.forEach((i) => this.listEl.appendChild(i));
      });
      this.appendChild(this.dialog);

      this.input.addEventListener("input", () => this.filter());
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.moveActive(e.key === "ArrowDown" ? 1 : -1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (this.active) this.choose(this.active);
        }
      });
      this.listEl.addEventListener("click", (e) => {
        const item = e.target.closest(".dv-command__item");
        if (item) this.choose(item);
      });
      this.listEl.addEventListener("pointermove", (e) => {
        const item = e.target.closest(".dv-command__item");
        if (item && item !== this.active) this.setActive(item);
      });
      this.dialog.addEventListener("click", (e) => {
        if (e.target === this.dialog) this.close();
      });

      const hotkey = this.getAttribute("hotkey");
      if (hotkey) {
        document.addEventListener("keydown", (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
            e.preventDefault();
            this.dialog.open ? this.close() : this.open();
          }
        });
      }
    }

    visibleItems() {
      return Array.from(this.listEl.querySelectorAll(".dv-command__item:not([hidden])"));
    }

    // Hides non-matches and reorders by relevance (groups by their best item)
    filter() {
      const q = this.input.value.trim();
      const scoreOf = (item, g) =>
        Math.max(
          fuzzyScore(item.textContent, q) * 2,
          fuzzyScore(`${item.dataset.keywords || ""} ${g.name}`, q)
        );
      const ranked = this.groups.map((g, gi) => {
        const items = g.items.map((item, ii) => ({ item, ii, score: q ? scoreOf(item, g) : 1 }));
        items.forEach((x) => (x.item.hidden = x.score === 0));
        if (q) items.sort((a, b) => b.score - a.score || a.ii - b.ii);
        const best = Math.max(0, ...items.map((x) => x.score));
        g.header.hidden = !g.name || best === 0;
        return { g, gi, items, best };
      });
      if (q) ranked.sort((a, b) => b.best - a.best || a.gi - b.gi);
      ranked.forEach(({ g, items }) => {
        this.listEl.appendChild(g.header);
        items.forEach((x) => this.listEl.appendChild(x.item));
      });
      const first = ranked.flatMap((r) => r.items).find((x) => !x.item.hidden);
      this.emptyEl.hidden = Boolean(first);
      this.setActive(first ? first.item : null);
      this.listEl.scrollTop = 0;
    }

    setActive(item) {
      if (this.active) this.active.setAttribute("aria-selected", "false");
      this.active = item;
      if (item) {
        item.setAttribute("aria-selected", "true");
        item.scrollIntoView({ block: "nearest" });
        this.input.setAttribute("aria-activedescendant", item.id);
      } else {
        this.input.removeAttribute("aria-activedescendant");
      }
    }

    moveActive(delta) {
      const visible = this.visibleItems();
      if (!visible.length) return;
      const idx = visible.indexOf(this.active);
      this.setActive(visible[(idx + delta + visible.length) % visible.length]);
    }

    choose(item) {
      emit(this, "dv-select", { value: item.dataset.value || item.textContent.trim(), item });
      this.close();
    }

    open() {
      if (!this.dialog || this.dialog.open) return;
      this.input.value = "";
      this.filter();
      this.dialog.showModal();
      this.input.focus();
    }

    close() {
      if (this.dialog && this.dialog.open) this.dialog.close();
    }
  }

  // --------------------------------------------------------------------------
  // 8. <dv-otp length="6" name="code">
  // --------------------------------------------------------------------------
  class DvOtp extends DvElement {
    setup() {
      const length = Math.max(1, parseInt(this.getAttribute("length") || "6", 10));
      const numeric = this.getAttribute("mode") !== "text";
      this.setAttribute("role", "group");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Código de verificación");

      this.cells = Array.from({ length }, (_, i) => {
        const cell = document.createElement("input");
        cell.className = "dv-otp__cell";
        cell.maxLength = 1;
        cell.autocomplete = i === 0 ? "one-time-code" : "off";
        cell.inputMode = numeric ? "numeric" : "text";
        cell.setAttribute("aria-label", `Carácter ${i + 1} de ${length}`);
        this.appendChild(cell);
        return cell;
      });

      if (this.getAttribute("name")) {
        this.hidden_ = document.createElement("input");
        this.hidden_.type = "hidden";
        this.hidden_.name = this.getAttribute("name");
        this.appendChild(this.hidden_);
      }

      const valid = (ch) => (numeric ? /\d/.test(ch) : /\S/.test(ch));

      this.cells.forEach((cell, i) => {
        cell.addEventListener("input", () => {
          const ch = cell.value.slice(-1);
          cell.value = valid(ch) ? ch : "";
          if (cell.value && i < length - 1) this.cells[i + 1].focus();
          this.changed();
        });
        cell.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !cell.value && i > 0) {
            this.cells[i - 1].focus();
            this.cells[i - 1].value = "";
            this.changed();
            e.preventDefault();
          } else if (e.key === "ArrowLeft" && i > 0) {
            this.cells[i - 1].focus();
          } else if (e.key === "ArrowRight" && i < length - 1) {
            this.cells[i + 1].focus();
          }
        });
        cell.addEventListener("focus", () => cell.select());
        cell.addEventListener("paste", (e) => {
          e.preventDefault();
          const chars = (e.clipboardData.getData("text") || "").split("").filter(valid);
          chars.slice(0, length - i).forEach((ch, k) => (this.cells[i + k].value = ch));
          this.cells[Math.min(i + chars.length, length - 1)].focus();
          this.changed();
        });
      });
    }

    get value() {
      return this.cells ? this.cells.map((c) => c.value).join("") : "";
    }

    clear() {
      this.cells.forEach((c) => (c.value = ""));
      this.cells[0].focus();
      this.changed();
    }

    changed() {
      const value = this.value;
      if (this.hidden_) this.hidden_.value = value;
      emit(this, "dv-change", { value });
      if (value.length === this.cells.length) emit(this, "dv-complete", { value });
    }
  }

  // --------------------------------------------------------------------------
  // 9. <dv-tags value="a,b" name="tags" placeholder="Add tag…">
  // --------------------------------------------------------------------------
  class DvTags extends DvElement {
    setup() {
      this.tags = [];
      this.input = document.createElement("input");
      this.input.className = "dv-tags__input";
      this.input.placeholder = this.getAttribute("placeholder") || "Añadir…";
      this.input.setAttribute("aria-label", this.getAttribute("label") || "Añadir etiqueta");
      this.appendChild(this.input);

      if (this.getAttribute("name")) {
        this.hidden_ = document.createElement("input");
        this.hidden_.type = "hidden";
        this.hidden_.name = this.getAttribute("name");
        this.appendChild(this.hidden_);
      }

      (this.getAttribute("value") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => this.add(t, false));

      this.addEventListener("click", (e) => {
        if (e.target === this) this.input.focus();
      });
      this.input.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === ",") && this.input.value.trim()) {
          e.preventDefault();
          this.add(this.input.value.trim(), true);
          this.input.value = "";
        } else if (e.key === "Backspace" && !this.input.value && this.tags.length) {
          this.remove(this.tags[this.tags.length - 1], true);
        }
      });
    }

    get value() {
      return this.tags.slice();
    }

    add(tag, fire) {
      const max = parseInt(this.getAttribute("max") || "0", 10);
      if (this.tags.includes(tag) || (max && this.tags.length >= max)) return;
      this.tags.push(tag);
      const chip = document.createElement("span");
      chip.className = "dv-chip";
      chip.dataset.tag = tag;
      const label = document.createElement("span");
      label.textContent = tag;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "dv-chip__remove";
      rm.setAttribute("aria-label", `Quitar ${tag}`);
      rm.textContent = "✕";
      rm.addEventListener("click", () => this.remove(tag, true));
      chip.append(label, rm);
      this.insertBefore(chip, this.input);
      this.sync(fire);
    }

    remove(tag, fire) {
      this.tags = this.tags.filter((t) => t !== tag);
      const chip = Array.from(this.querySelectorAll(".dv-chip")).find((c) => c.dataset.tag === tag);
      if (chip) chip.remove();
      this.input.focus();
      this.sync(fire);
    }

    sync(fire) {
      if (this.hidden_) this.hidden_.value = this.tags.join(",");
      if (fire) emit(this, "dv-change", { value: this.value });
    }
  }

  // --------------------------------------------------------------------------
  // 10. <dv-dropzone accept="image/*" multiple name="files">
  // --------------------------------------------------------------------------
  const formatBytes = (n) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  class DvDropzone extends DvElement {
    setup() {
      this.files = [];
      this.tabIndex = 0;
      this.setAttribute("role", "button");
      this.fileInput = document.createElement("input");
      this.fileInput.type = "file";
      this.fileInput.hidden = true;
      if (this.hasAttribute("multiple")) this.fileInput.multiple = true;
      if (this.getAttribute("accept")) this.fileInput.accept = this.getAttribute("accept");
      if (this.getAttribute("name")) this.fileInput.name = this.getAttribute("name");
      this.listEl = document.createElement("div");
      this.listEl.className = "dv-dropzone__files";
      this.append(this.fileInput, this.listEl);

      this.addEventListener("click", (e) => {
        if (e.target !== this.fileInput) this.fileInput.click();
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.fileInput.click();
        }
      });
      this.fileInput.addEventListener("change", () => this.take(this.fileInput.files));
      ["dragenter", "dragover"].forEach((type) =>
        this.addEventListener(type, (e) => {
          e.preventDefault();
          this.setAttribute("data-dragging", "");
        })
      );
      ["dragleave", "drop"].forEach((type) =>
        this.addEventListener(type, (e) => {
          e.preventDefault();
          this.removeAttribute("data-dragging");
        })
      );
      this.addEventListener("drop", (e) => this.take(e.dataTransfer.files));
    }

    take(fileList) {
      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;
      this.files = this.hasAttribute("multiple") ? this.files.concat(incoming) : incoming.slice(0, 1);
      this.listEl.textContent = "";
      this.files.forEach((f) => {
        const row = document.createElement("div");
        row.className = "dv-dropzone__file";
        const name = document.createElement("span");
        name.textContent = f.name;
        const size = document.createElement("span");
        size.className = "dv-muted";
        size.textContent = formatBytes(f.size);
        row.append(name, size);
        this.listEl.appendChild(row);
      });
      emit(this, "dv-change", { files: this.files.slice() });
    }
  }

  // --------------------------------------------------------------------------
  // 11. <dv-calendar value="2026-10-14" locale="es" week-start="1" min max mode="range" months="2">
  // --------------------------------------------------------------------------
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };

  class DvCalendar extends DvElement {
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || undefined;
      this.weekStart = parseInt(this.getAttribute("week-start") || "1", 10) % 7;
      this.mode = this.getAttribute("mode") === "range" ? "range" : "single";
      this.months = Math.max(1, parseInt(this.getAttribute("months") || "1", 10));
      this.min = this.getAttribute("min") || "";
      this.max = this.getAttribute("max") || "";
      this.selected = null;
      this.start = null;
      this.end = null;
      this.hover = null;
      this.parseValue(this.getAttribute("value"));
      const base = this.selected || this.start || new Date();
      this.view = new Date(base.getFullYear(), base.getMonth(), 1);
      this.focusDate = new Date(base);
      this.render(false);

      this.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-cal-nav]");
        if (nav) {
          this.shift(parseInt(nav.dataset.calNav, 10));
          return;
        }
        const day = e.target.closest(".dv-cal__day[data-date]");
        if (day && !day.disabled) this.pick(fromISO(day.dataset.date));
      });
      this.addEventListener("pointerover", (e) => {
        if (this.mode !== "range" || !this.start || this.end) return;
        const day = e.target.closest(".dv-cal__day[data-date]");
        this.hover = day ? fromISO(day.dataset.date) : null;
        this.paintPreview();
      });
      this.addEventListener("pointerleave", () => {
        if (this.hover) {
          this.hover = null;
          this.paintPreview();
        }
      });
      this.addEventListener("keydown", (e) => {
        if (!e.target.classList.contains("dv-cal__day")) return;
        const d = fromISO(e.target.dataset.date);
        if (!d) return;
        const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (steps[e.key] !== undefined) d.setDate(d.getDate() + steps[e.key]);
        else if (e.key === "PageUp" || e.key === "PageDown") {
          const dir = e.key === "PageUp" ? -1 : 1;
          const day = d.getDate();
          d.setDate(1);
          d.setMonth(d.getMonth() + (e.shiftKey ? 12 * dir : dir));
          d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
        } else return;
        e.preventDefault();
        if (this.isDisabled(toISO(d))) return;
        this.focusDate = d;
        // Mantiene la fecha enfocada dentro de los meses visibles
        const first = this.view.getFullYear() * 12 + this.view.getMonth();
        const idx = d.getFullYear() * 12 + d.getMonth();
        if (idx < first) this.view = new Date(d.getFullYear(), d.getMonth(), 1);
        else if (idx > first + this.months - 1) this.view = new Date(d.getFullYear(), d.getMonth() - (this.months - 1), 1);
        this.render(true);
      });
    }

    parseValue(v) {
      if (this.mode === "range") {
        const [a, b] = String(v || "").split("/");
        this.start = fromISO(a);
        this.end = fromISO(b);
      } else {
        this.selected = fromISO(v);
      }
    }

    get value() {
      if (this.mode === "range") return this.start && this.end ? `${toISO(this.start)}/${toISO(this.end)}` : "";
      return this.selected ? toISO(this.selected) : "";
    }

    set value(v) {
      this.parseValue(v);
      const ref = this.selected || this.start;
      if (ref) {
        this.view = new Date(ref.getFullYear(), ref.getMonth(), 1);
        this.focusDate = new Date(ref);
      }
      if (this._dvReady) this.render(false);
    }

    isDisabled(iso) {
      return Boolean((this.min && iso < this.min) || (this.max && iso > this.max));
    }

    shift(months) {
      this.view = new Date(this.view.getFullYear(), this.view.getMonth() + months, 1);
      this.focusDate = new Date(this.view);
      this.render(false);
    }

    pick(date) {
      if (!date || this.isDisabled(toISO(date))) return;
      this.focusDate = date;
      if (this.mode === "range") {
        if (!this.start || this.end) {
          this.start = date;
          this.end = null;
        } else if (date < this.start) {
          this.start = date;
        } else {
          this.end = date;
        }
        this.hover = null;
        this.render(true);
        emit(this, "dv-change", {
          start: toISO(this.start),
          end: this.end ? toISO(this.end) : null,
          value: this.value,
          complete: Boolean(this.end)
        });
        return;
      }
      this.selected = date;
      if (date.getMonth() !== this.view.getMonth()) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
      this.render(true);
      emit(this, "dv-change", { value: toISO(date), date });
    }

    // Vista previa del rango mientras el cursor se mueve (sin volver a renderizar)
    paintPreview() {
      const a = this.start && toISO(this.start);
      const b = this.hover && toISO(this.hover);
      this.querySelectorAll(".dv-cal__day[data-date]").forEach((btn) => {
        const iso = btn.dataset.date;
        const on = Boolean(a && b && !this.end && iso > (a < b ? a : b) && iso < (a < b ? b : a));
        btn.classList.toggle("is-preview", on);
      });
    }

    renderMonth(view, idx, total) {
      const y = view.getFullYear();
      const m = view.getMonth();
      const title = new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(view);
      const dowFmt = new Intl.DateTimeFormat(this.locale, { weekday: "narrow" });
      const fullFmt = new Intl.DateTimeFormat(this.locale, { dateStyle: "full" });
      const todayISO = toISO(new Date());
      const focusISO = toISO(this.focusDate);
      const sISO = this.mode === "range" ? this.start && toISO(this.start) : this.selected && toISO(this.selected);
      const eISO = this.mode === "range" && this.end ? toISO(this.end) : null;

      const offset = (new Date(y, m, 1).getDay() - this.weekStart + 7) % 7;
      const start = new Date(y, m, 1 - offset);

      let dows = "";
      for (let i = 0; i < 7; i++) {
        // 2023-01-01 fue domingo
        dows += `<span class="dv-cal__dow">${dowFmt.format(new Date(2023, 0, 1 + ((this.weekStart + i) % 7)))}</span>`;
      }

      let cells = "";
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const outside = d.getMonth() !== m;
        // Con varios meses, los días de otros meses se dejan en blanco para no duplicarlos
        if (outside && total > 1) {
          cells += `<span class="dv-cal__day is-blank" aria-hidden="true"></span>`;
          continue;
        }
        const iso = toISO(d);
        const pressed = iso === sISO || iso === eISO;
        const cls = [
          "dv-cal__day",
          outside ? "is-outside" : "",
          iso === todayISO ? "is-today" : "",
          iso === sISO && eISO ? "is-range-start" : "",
          iso === eISO ? "is-range-end" : "",
          sISO && eISO && iso > sISO && iso < eISO ? "in-range" : ""
        ].join(" ");
        const off = this.isDisabled(iso);
        cells += `<button type="button" class="${cls}" data-date="${iso}" aria-label="${fullFmt.format(d)}" aria-pressed="${pressed}" tabindex="${iso === focusISO && !off ? 0 : -1}"${off ? " disabled" : ""}>${d.getDate()}</button>`;
      }

      const prev = `<button type="button" class="dv-btn dv-btn--subtle dv-btn--sm dv-btn--icon" data-cal-nav="-1" aria-label="Mes anterior">‹</button>`;
      const next = `<button type="button" class="dv-btn dv-btn--subtle dv-btn--sm dv-btn--icon" data-cal-nav="1" aria-label="Mes siguiente">›</button>`;
      const spacer = `<span class="dv-cal__nav-spacer" aria-hidden="true"></span>`;
      return `<div class="dv-cal__month">
        <div class="dv-cal__head">${idx === 0 ? prev : spacer}<span aria-live="polite">${title}</span>${idx === total - 1 ? next : spacer}</div>
        <div class="dv-cal__grid">${dows}${cells}</div>
      </div>`;
    }

    render(keepFocus) {
      let html = "";
      for (let i = 0; i < this.months; i++) {
        const view = new Date(this.view.getFullYear(), this.view.getMonth() + i, 1);
        html += this.renderMonth(view, i, this.months);
      }
      this.innerHTML = `<div class="dv-cal__months">${html}</div>`;

      // Si el día enfocado no es alcanzable por teclado, el primer día habilitado lo reemplaza
      if (!this.querySelector('.dv-cal__day[tabindex="0"]')) {
        const first = this.querySelector(".dv-cal__day[data-date]:not([disabled]):not(.is-outside)");
        if (first) first.tabIndex = 0;
      }
      if (keepFocus) {
        const target = this.querySelector(`[data-date="${toISO(this.focusDate)}"]:not(.is-outside), [data-date="${toISO(this.focusDate)}"]`);
        if (target && !target.disabled) target.focus();
      }
    }
  }

  // --------------------------------------------------------------------------
  // 12. <dv-sparkline values="3,7,4,9" fill>
  // --------------------------------------------------------------------------
  class DvSparkline extends HTMLElement {
    static get observedAttributes() {
      return ["values", "fill"];
    }

    connectedCallback() {
      this.render();
      // Re-draw at the element's real size so the end dot never stretches
      if (!this._ro && "ResizeObserver" in window) {
        this._ro = new ResizeObserver(() => this.render());
        this._ro.observe(this);
      }
    }

    disconnectedCallback() {
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const values = (this.getAttribute("values") || "")
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n));
      if (values.length < 2) {
        this.innerHTML = "";
        return;
      }
      const w = Math.max(20, Math.round(this.clientWidth) || 100);
      const h = Math.max(8, Math.round(this.clientHeight) || 30);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min || 1;
      const pts = values.map((v, i) => [3 + (i / (values.length - 1)) * (w - 6), h - 3 - ((v - min) / span) * (h - 6)]);
      const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
      const last = pts[pts.length - 1];
      const area = this.hasAttribute("fill")
        ? `<path d="${line} L${last[0]},${h} L${pts[0][0]},${h} Z" fill="currentColor" opacity="0.14" stroke="none"/>`
        : "";
      this.setAttribute("role", "img");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", `Tendencia: ${values.join(", ")}`);
      const key = `${w}x${h}:${line}:${area ? 1 : 0}`;
      if (key === this._key) return;
      this._key = key;
      this.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${area}<path d="${line}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="currentColor"/></svg>`;
    }
  }

  // --------------------------------------------------------------------------
  // 13. Data-attribute behaviours (delegated)
  // --------------------------------------------------------------------------
  function syncRange(input) {
    const min = parseFloat(input.min || "0");
    const max = parseFloat(input.max || "100");
    const pct = ((parseFloat(input.value) - min) / (max - min || 1)) * 100;
    input.style.setProperty("--dv-fill", `${pct}%`);
    const out = input.dataset.dvOutput && document.querySelector(input.dataset.dvOutput);
    if (out) out.textContent = input.value + (input.dataset.dvSuffix || "");
  }

  function sortTable(th) {
    const table = th.closest("table");
    const tbody = table && table.tBodies[0];
    if (!tbody) return;
    const col = Array.from(th.parentElement.children).indexOf(th);
    const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    th.parentElement.querySelectorAll("th[aria-sort]").forEach((h) => h.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", dir);
    const numeric = th.dataset.sort === "number";
    const read = (row) => {
      const cell = row.children[col];
      const raw = cell ? cell.dataset.value || cell.textContent.trim() : "";
      return numeric ? parseFloat(raw.replace(/[^0-9.-]/g, "")) || 0 : raw.toLowerCase();
    };
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
      const va = read(a);
      const vb = read(b);
      const cmp = numeric ? va - vb : va.localeCompare(vb);
      return dir === "ascending" ? cmp : -cmp;
    });
    rows.forEach((r) => tbody.appendChild(r));
  }

  function stepNumber(btn) {
    const wrap = btn.closest(".dv-number");
    const input = wrap && wrap.querySelector("input");
    if (!input) return;
    const step = parseFloat(input.step || "1") * parseFloat(btn.dataset.step || "1");
    let next = (parseFloat(input.value) || 0) + step;
    if (input.min !== "") next = Math.max(parseFloat(input.min), next);
    if (input.max !== "") next = Math.min(parseFloat(input.max), next);
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const opener = t.closest("[data-dv-open]");
    if (opener) {
      const target = document.getElementById(opener.dataset.dvOpen);
      if (target && typeof target.open === "function" && target.tagName === "DV-COMMAND") target.open();
      else if (target && typeof target.showModal === "function") target.showModal();
      return;
    }

    const closer = t.closest("[data-dv-close]");
    if (closer) {
      const dialog = closer.closest("dialog");
      if (dialog) dialog.close(closer.dataset.dvClose || "");
      else {
        const pop = closer.closest("[popover]");
        if (pop && isOpenPopover(pop)) pop.hidePopover();
      }
      return;
    }

    // Click on the ::backdrop of a dv dialog closes it
    if (t.tagName === "DIALOG" && t.classList.contains("dv-dialog") && !t.hasAttribute("data-dv-static")) {
      const r = t.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) t.close();
      return;
    }

    const copyBtn = t.closest("[data-dv-copy]");
    if (copyBtn) {
      const sel = copyBtn.dataset.dvCopyTarget;
      const source = sel ? document.querySelector(sel) : null;
      const text = source ? source.value || source.textContent : copyBtn.dataset.dvCopy;
      copy(text || "").then((ok) => {
        const label = copyBtn.textContent;
        if (copyBtn.children.length === 0) {
          copyBtn.textContent = ok ? "Copiado" : "Error";
          setTimeout(() => (copyBtn.textContent = label), 1200);
        }
        emit(copyBtn, "dv-copy", { text, ok });
      });
      return;
    }

    const themeBtn = t.closest("[data-dv-theme-toggle]");
    if (themeBtn) {
      setTheme(getTheme() === "dark" ? "light" : "dark");
      return;
    }

    const toggle = t.closest("[data-dv-toggle]");
    if (toggle) {
      const on = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(on));
      emit(toggle, "dv-change", { pressed: on });
      return;
    }

    const stepper = t.closest(".dv-number > button[data-step]");
    if (stepper) {
      stepNumber(stepper);
      return;
    }

    const sortTh = t.closest("table[data-dv-sortable] th[data-sort]");
    if (sortTh) sortTable(sortTh);
  });

  document.addEventListener("keydown", (e) => {
    const th = e.target instanceof Element && e.target.closest("table[data-dv-sortable] th[data-sort]");
    if (th && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      sortTable(th);
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target instanceof HTMLInputElement && e.target.classList.contains("dv-range")) syncRange(e.target);
  });

  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target instanceof Element && e.target.closest(".dv-card--interactive");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--dv-mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--dv-my", `${e.clientY - r.top}px`);
    },
    { passive: true }
  );

  /** Initialise static helpers inside `root` (call after injecting HTML dynamically). */
  function init(root = document) {
    root.querySelectorAll("input.dv-range").forEach(syncRange);
    root.querySelectorAll("textarea[data-dv-autosize]").forEach(autosize);
    root.querySelectorAll("textarea[data-dv-count]").forEach(countText);
    root.querySelectorAll("table[data-dv-sortable] th[data-sort]").forEach((th) => {
      if (!th.hasAttribute("tabindex")) th.tabIndex = 0;
    });
  }

  // --------------------------------------------------------------------------
  // 14. Superposiciones: motor de posicionamiento, popover, hover card,
  //     menú contextual, confirmación (alert dialog) y sheets
  // --------------------------------------------------------------------------

  const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };

  /**
   * Posiciona `el` (position: fixed) junto a `anchor` o a un punto { x, y }.
   * placement: "top|bottom|left|right" + "-start|-end" opcional. Si no cabe, se voltea
   * al lado opuesto; después se ajusta para no salirse de la ventana. Devuelve el lado final.
   */
  function position(anchor, el, { placement = "bottom", offset = 6, padding = 8, point } = {}) {
    const a = point
      ? { left: point.x, right: point.x, top: point.y, bottom: point.y, width: 0, height: 0 }
      : anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    let [side, align = "center"] = placement.split("-");
    const fits = {
      top: a.top - offset - h >= padding,
      bottom: a.bottom + offset + h <= vh - padding,
      left: a.left - offset - w >= padding,
      right: a.right + offset + w <= vw - padding
    };
    if (!fits[side] && fits[OPPOSITE[side]]) side = OPPOSITE[side];

    let x;
    let y;
    if (side === "top" || side === "bottom") {
      y = side === "top" ? a.top - offset - h : a.bottom + offset;
      x = align === "start" ? a.left : align === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
    } else {
      x = side === "left" ? a.left - offset - w : a.right + offset;
      y = align === "start" ? a.top : align === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
    }
    x = Math.max(padding, Math.min(x, vw - w - padding));
    y = Math.max(padding, Math.min(y, vh - h - padding));
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    el.dataset.side = side;
    return side;
  }

  // Reposiciona mientras el elemento esté abierto (scroll en cualquier contenedor y resize)
  function trackPosition(anchor, el, options) {
    const update = () => position(anchor, el, options);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }

  const FOCUSABLE = "[autofocus], input:not([type=hidden]), select, textarea, button, a[href], [tabindex]:not([tabindex='-1'])";

  function focusFirst(container) {
    const target = container.querySelector(FOCUSABLE);
    if (target) target.focus();
    else {
      container.tabIndex = -1;
      container.focus();
    }
  }

  const isOpenPopover = (el) => el.matches(":popover-open");

  // <dv-popover placement="bottom-start" offset="6" manual>
  //   <button data-dv-trigger>…</button>
  //   <div class="dv-popover__panel">…</div>
  // </dv-popover>
  class DvPopover extends DvElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-dv-trigger]") || this.querySelector(":scope > button");
      this.panel = this.querySelector(":scope > .dv-popover__panel");
      if (!this.trigger || !this.panel) return;

      this.panel.id = this.panel.id || nextId("dv-popover");
      this.panel.setAttribute("popover", this.hasAttribute("manual") ? "manual" : "auto");
      if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "dialog");
      if (this.getAttribute("label") && !this.panel.hasAttribute("aria-label")) {
        this.panel.setAttribute("aria-label", this.getAttribute("label"));
      }
      this.trigger.setAttribute("popovertarget", this.panel.id);
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this.panel.id);

      this.panel.addEventListener("toggle", (e) => {
        const open = e.newState === "open";
        this.trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          this.reposition();
          this.stop = trackPosition(this.trigger, this.panel, this.options());
          focusFirst(this.panel);
          emit(this, "dv-open", {});
        } else {
          if (this.stop) this.stop();
          this.stop = null;
          emit(this, "dv-close", {});
        }
      });
      if (this.hasAttribute("manual")) {
        this.panel.addEventListener("keydown", (e) => {
          if (e.key === "Escape") this.close();
        });
      }
    }

    options() {
      return {
        placement: this.getAttribute("placement") || "bottom-start",
        offset: parseInt(this.getAttribute("offset") || "6", 10)
      };
    }

    reposition() {
      position(this.trigger, this.panel, this.options());
    }

    get isOpen() {
      return Boolean(this.panel) && isOpenPopover(this.panel);
    }

    open() {
      if (this.panel && !this.isOpen) this.panel.showPopover();
    }

    close() {
      if (this.isOpen) this.panel.hidePopover();
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }
  }

  // <dv-hovercard open-delay="300" close-delay="150" placement="bottom-start">
  //   <a data-dv-trigger href="#">@luis</a>
  //   <div class="dv-popover__panel">…</div>
  // </dv-hovercard>
  class DvHoverCard extends DvElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-dv-trigger]") || this.querySelector(":scope > a, :scope > button");
      this.panel = this.querySelector(":scope > .dv-popover__panel");
      if (!this.trigger || !this.panel) return;

      this.panel.id = this.panel.id || nextId("dv-hovercard");
      this.panel.setAttribute("popover", "manual");
      if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "group");
      this.trigger.setAttribute("aria-controls", this.panel.id);
      this.trigger.setAttribute("aria-expanded", "false");

      const delay = (name, fallback) => parseInt(this.getAttribute(name) || String(fallback), 10);
      const schedule = (fn, ms) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(fn, ms);
      };
      const enter = () => schedule(() => this.open(), delay("open-delay", 300));
      const leave = () => schedule(() => this.close(), delay("close-delay", 150));

      [this.trigger, this.panel].forEach((el) => {
        el.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && enter());
        el.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && leave());
        el.addEventListener("focusin", enter);
        el.addEventListener("focusout", (e) => {
          if (!this.contains(e.relatedTarget)) leave();
        });
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          e.stopPropagation();
          clearTimeout(this.timer);
          this.close();
        }
      });
    }

    get isOpen() {
      return Boolean(this.panel) && isOpenPopover(this.panel);
    }

    open() {
      if (!this.panel || this.isOpen) return;
      this.panel.showPopover();
      position(this.trigger, this.panel, {
        placement: this.getAttribute("placement") || "bottom-start",
        offset: parseInt(this.getAttribute("offset") || "8", 10)
      });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stop = trackPosition(this.trigger, this.panel, { placement: this.getAttribute("placement") || "bottom-start", offset: 8 });
      emit(this, "dv-open", {});
    }

    close() {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stop) this.stop();
      this.stop = null;
      emit(this, "dv-close", {});
    }
  }

  // <dv-context-menu>
  //   <div class="dv-context-zone" tabindex="0">Clic derecho aquí</div>
  //   <div class="dv-menu__list">…items…</div>
  // </dv-context-menu>
  class DvContextMenu extends DvElement {
    setup() {
      this.list = this.querySelector(":scope > .dv-menu__list");
      if (!this.list) return;
      this.list.id = this.list.id || nextId("dv-ctx");
      // "manual": con "auto" el mouseup que sigue al contextmenu (Linux/Windows) lo cerraría al instante
      this.list.setAttribute("popover", "manual");
      this.list.setAttribute("role", "menu");
      this.items().forEach((item) => {
        item.setAttribute("role", "menuitem");
        item.tabIndex = -1;
      });

      this.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (this.list.contains(e.target)) return;
        this.openAt(e.clientX, e.clientY);
      });

      // Teclado: tecla de menú contextual o Shift+F10
      this.addEventListener("keydown", (e) => {
        if (this.list.contains(e.target)) return;
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          const r = (e.target instanceof Element ? e.target : this).getBoundingClientRect();
          this.openAt(r.left + r.width / 2, r.top + r.height / 2);
        }
      });

      // Táctil: pulsación larga
      let press = 0;
      const cancel = () => clearTimeout(press);
      this.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch" || this.list.contains(e.target)) return;
        const { clientX, clientY } = e;
        press = setTimeout(() => this.openAt(clientX, clientY), 550);
      });
      ["pointerup", "pointermove", "pointercancel"].forEach((t) => this.addEventListener(t, cancel));

      this.list.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.close(true);
          return;
        }
        const next = moveFocus(this.items(), document.activeElement, e.key);
        if (next) {
          e.preventDefault();
          next.focus();
        } else if (e.key === "Tab") {
          this.close();
        }
      });
      this.list.addEventListener("click", (e) => {
        const item = e.target.closest(".dv-menu__item");
        if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
        emit(this, "dv-select", { value: item.dataset.value || item.textContent.trim(), item });
        this.close(true);
      });
      this.outside = (e) => {
        if (!this.list.contains(e.target)) this.close();
      };
      this.dismiss = () => this.close();
    }

    items() {
      return Array.from(this.list.querySelectorAll(".dv-menu__item:not([disabled])"));
    }

    openAt(x, y) {
      this.close();
      this.returnTo = document.activeElement;
      this.list.showPopover();
      position(null, this.list, { point: { x, y }, placement: "bottom-start", offset: 2 });
      const first = this.items()[0];
      if (first) first.focus();
      // Cierre propio: clic fuera, scroll o resize (se registra tras el evento que lo abrió)
      setTimeout(() => {
        if (!isOpenPopover(this.list)) return;
        document.addEventListener("pointerdown", this.outside, true);
        window.addEventListener("scroll", this.dismiss, true);
        window.addEventListener("resize", this.dismiss);
      }, 0);
    }

    close(returnFocus = false) {
      if (!this.list || !isOpenPopover(this.list)) return;
      this.list.hidePopover();
      document.removeEventListener("pointerdown", this.outside, true);
      window.removeEventListener("scroll", this.dismiss, true);
      window.removeEventListener("resize", this.dismiss);
      if (returnFocus && this.returnTo && this.returnTo.isConnected) this.returnTo.focus();
    }
  }

  /**
   * DevlUI.confirm("¿Eliminar?") o DevlUI.confirm({ title, description, confirmLabel,
   * cancelLabel, variant: "danger" }) → Promise<boolean>.
   * cancelLabel: null muestra solo el botón de aceptar (alerta). Esc o cancelar → false.
   */
  function confirmDialog(options) {
    const o = typeof options === "string" ? { title: options } : options || {};
    const { title = "¿Estás seguro?", description = "", confirmLabel = "Aceptar", cancelLabel = "Cancelar", variant = "default" } = o;

    return new Promise((resolve) => {
      const dialog = document.createElement("dialog");
      dialog.className = "dv-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("data-dv-static", "");
      const titleId = nextId("dv-alert-title");
      dialog.setAttribute("aria-labelledby", titleId);

      const header = document.createElement("div");
      header.className = "dv-dialog__header";
      const h = document.createElement("h2");
      h.className = "dv-dialog__title";
      h.id = titleId;
      h.textContent = title;
      header.appendChild(h);
      if (description) {
        const p = document.createElement("p");
        p.className = "dv-dialog__desc";
        p.id = nextId("dv-alert-desc");
        p.textContent = description;
        header.appendChild(p);
        dialog.setAttribute("aria-describedby", p.id);
      }

      const footer = document.createElement("div");
      footer.className = "dv-dialog__footer";
      let cancelBtn = null;
      if (cancelLabel !== null) {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "dv-btn";
        cancelBtn.textContent = cancelLabel;
        cancelBtn.addEventListener("click", () => dialog.close("cancel"));
        footer.appendChild(cancelBtn);
      }
      const okBtn = document.createElement("button");
      okBtn.type = "button";
      okBtn.className = `dv-btn ${variant === "danger" ? "dv-btn--danger" : "dv-btn--primary"}`;
      okBtn.textContent = confirmLabel;
      okBtn.addEventListener("click", () => dialog.close("confirm"));
      footer.appendChild(okBtn);

      // Una acción destructiva arranca con el foco en "Cancelar"
      (variant === "danger" && cancelBtn ? cancelBtn : okBtn).setAttribute("autofocus", "");

      dialog.append(header, footer);
      dialog.addEventListener("close", () => {
        resolve(dialog.returnValue === "confirm");
        dialog.remove();
      });
      document.body.appendChild(dialog);
      dialog.showModal();
    });
  }

  // Sheet inferior: arrastrar el asa hacia abajo cierra el diálogo
  document.addEventListener("pointerdown", (e) => {
    const handle = e.target instanceof Element && e.target.closest(".dv-sheet__handle");
    const dialog = handle && handle.closest("dialog");
    if (!dialog) return;
    const startY = e.clientY;
    let dy = 0;
    handle.setPointerCapture(e.pointerId);
    dialog.style.transition = "none";
    const move = (ev) => {
      dy = Math.max(0, ev.clientY - startY);
      dialog.style.transform = `translateY(${dy}px)`;
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      dialog.style.transition = "";
      dialog.style.transform = "";
      if (dy > Math.min(120, dialog.offsetHeight / 3)) dialog.close();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });

  // --------------------------------------------------------------------------
  // 15. Campos de formulario: select, combobox, selector de fecha y de hora
  //     (formAssociated: participan en <form>, FormData, reset y validación)
  // --------------------------------------------------------------------------

  class DvFormElement extends DvElement {
    static get formAssociated() {
      return true;
    }

    constructor() {
      super();
      try {
        this.internals = this.attachInternals();
      } catch (_) {
        this.internals = null;
      }
    }

    get name() {
      return this.getAttribute("name") || "";
    }

    get form() {
      return this.internals ? this.internals.form : null;
    }

    get validity() {
      return this.internals ? this.internals.validity : null;
    }

    get validationMessage() {
      return this.internals ? this.internals.validationMessage : "";
    }

    checkValidity() {
      return this.internals ? this.internals.checkValidity() : true;
    }

    reportValidity() {
      return this.internals ? this.internals.reportValidity() : true;
    }

    get isDisabled() {
      return this.hasAttribute("disabled") || Boolean(this.formDisabled);
    }

    formResetCallback() {
      this.reset();
    }

    formDisabledCallback(disabled) {
      this.formDisabled = disabled;
      this.syncDisabled();
    }

    attributeChangedCallback(name) {
      if (name === "disabled" && this._dvReady) this.syncDisabled();
    }

    static get observedAttributes() {
      return ["disabled"];
    }

    syncDisabled() {}

    reset() {}

    // Publica el valor al formulario (null = no se envía) y aplica "required"
    publish(value, empty, anchor) {
      if (!this.internals) return;
      this.internals.setFormValue(value);
      if (this.hasAttribute("required") && empty) {
        this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Completa este campo.", anchor);
      } else {
        this.internals.setValidity({});
      }
    }
  }

  const CHEVRON = `<svg class="dv-trigger__icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  const CHECK = `<svg class="dv-select__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
  const normalize = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // Cierre propio para paneles manuales: clic fuera del campo, scroll o resize
  function dismissOnOutside(host, panel, close) {
    const outside = (e) => {
      if (!host.contains(e.target)) close();
    };
    const dismiss = (e) => {
      if (e.type === "scroll" && panel.contains(e.target)) return;
      close();
    };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", dismiss);
    };
  }

  /**
   * <dv-select name="rol" value="admin" placeholder="Elige…" searchable multiple creatable clearable required>
   *   <option value="admin">Administrador</option>
   *   <optgroup label="Equipo"><option value="dev" data-hint="Código">Desarrollo</option></optgroup>
   * </dv-select>
   * Con el atributo `autocomplete` (o <dv-combobox>) el campo es un input donde se escribe para filtrar.
   * value: string (o array con `multiple`). Evento dv-change { value, values }.
   */
  class DvSelect extends DvFormElement {
    setup() {
      this.multiple = this.hasAttribute("multiple");
      this.inline = this.hasAttribute("autocomplete");
      this.searchable = this.hasAttribute("searchable") && !this.inline;
      this.creatable = this.hasAttribute("creatable");
      this.options = this.readOptions();
      this.initial = this.initialValues();
      this.values = this.initial.slice();
      this.query = "";
      this.active = null;
      this.typeahead = "";
      this.build();
      this.renderList();
      this.sync(false);
    }

    readOptions() {
      const out = [];
      const read = (o, group) =>
        out.push({
          value: o.getAttribute("value") !== null ? o.getAttribute("value") : o.textContent.trim(),
          label: o.textContent.trim(),
          disabled: o.hasAttribute("disabled"),
          hint: o.dataset.hint || "",
          selected: o.hasAttribute("selected"),
          group
        });
      Array.from(this.children).forEach((child) => {
        if (child.tagName === "OPTION") read(child, "");
        else if (child.tagName === "OPTGROUP") Array.from(child.children).forEach((o) => read(o, child.getAttribute("label") || ""));
      });
      return out;
    }

    initialValues() {
      const attr = this.getAttribute("value");
      let vals = attr !== null && attr !== "" ? (this.multiple ? attr.split(",").map((v) => v.trim()) : [attr]) : this.options.filter((o) => o.selected).map((o) => o.value);
      if (!this.multiple) vals = vals.slice(0, 1);
      return vals.filter((v) => this.options.some((o) => o.value === v));
    }

    build() {
      const listId = nextId("dv-select-list");
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "dv-select__wrap";

      if (this.inline) {
        this.trigger = document.createElement("div");
        this.trigger.className = "dv-trigger dv-trigger--input";
        this.input = document.createElement("input");
        this.input.className = "dv-trigger__input";
        this.input.type = "text";
        this.input.autocomplete = "off";
        this.input.spellcheck = false;
        this.input.placeholder = this.getAttribute("placeholder") || "";
        this.input.setAttribute("role", "combobox");
        this.input.setAttribute("aria-autocomplete", "list");
        this.owner = this.input;
        this.trigger.appendChild(this.input);
        this.trigger.insertAdjacentHTML("beforeend", CHEVRON);
      } else {
        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "dv-trigger";
        this.trigger.innerHTML = `<span class="dv-trigger__value"></span>${CHEVRON}`;
        this.valueEl = this.trigger.querySelector(".dv-trigger__value");
        this.owner = this.trigger;
      }
      this.trigger.setAttribute("aria-haspopup", "listbox");
      this.wrap.appendChild(this.trigger);

      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "dv-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar selección");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);

      this.panel = document.createElement("div");
      this.panel.className = "dv-select__panel";
      this.panel.setAttribute("popover", "manual");
      if (this.searchable) {
        const box = document.createElement("div");
        box.className = "dv-select__searchbox";
        this.search = document.createElement("input");
        this.search.className = "dv-select__search";
        this.search.type = "text";
        this.search.autocomplete = "off";
        this.search.spellcheck = false;
        this.search.placeholder = this.getAttribute("search-placeholder") || "Buscar…";
        this.search.setAttribute("aria-label", this.getAttribute("search-placeholder") || "Buscar");
        this.search.setAttribute("role", "combobox");
        this.search.setAttribute("aria-expanded", "true");
        this.search.setAttribute("aria-controls", listId);
        this.search.setAttribute("aria-autocomplete", "list");
        box.appendChild(this.search);
        this.panel.appendChild(box);
        this.owner = this.search;
      }
      this.list = document.createElement("div");
      this.list.className = "dv-select__list";
      this.list.id = listId;
      this.list.setAttribute("role", "listbox");
      if (this.multiple) this.list.setAttribute("aria-multiselectable", "true");
      if (this.getAttribute("label")) this.list.setAttribute("aria-label", this.getAttribute("label"));
      this.empty = document.createElement("div");
      this.empty.className = "dv-select__empty";
      this.empty.textContent = this.getAttribute("empty") || "Sin resultados";
      this.empty.hidden = true;
      this.panel.append(this.list, this.empty);
      this.append(this.wrap, this.panel);

      // El rol combobox lo lleva quien recibe el teclado
      if (this.owner === this.trigger) {
        this.trigger.setAttribute("role", "combobox");
        this.trigger.setAttribute("aria-controls", listId);
        this.trigger.setAttribute("aria-expanded", "false");
      } else {
        this.trigger.setAttribute("aria-expanded", "false");
        if (this.owner === this.input) this.input.setAttribute("aria-controls", listId);
      }
      if (this.getAttribute("label")) this.owner.setAttribute("aria-label", this.getAttribute("label"));

      this.bind();
    }

    bind() {
      const toggle = () => (this.isOpen ? this.close() : this.open());
      if (this.inline) {
        this.input.addEventListener("focus", () => !this.isDisabled && this.input.select());
        this.input.addEventListener("click", () => !this.isDisabled && !this.isOpen && this.open());
        this.input.addEventListener("input", () => {
          this.query = this.input.value;
          if (!this.isOpen) this.open();
          else this.renderList();
        });
        this.trigger.addEventListener("pointerdown", (e) => {
          if (e.target !== this.input) {
            e.preventDefault();
            this.input.focus();
            toggle();
          }
        });
        this.input.addEventListener("blur", () => {
          // Si el foco sale del campo sin elegir nada, se restaura el texto de la selección
          setTimeout(() => {
            if (!this.contains(document.activeElement)) {
              this.close();
              this.showSelection();
            }
          }, 0);
        });
      } else {
        this.trigger.addEventListener("click", toggle);
      }
      if (this.search) {
        this.search.addEventListener("input", () => {
          this.query = this.search.value;
          this.renderList();
        });
      }
      this.owner.addEventListener("keydown", (e) => this.onKey(e));
      this.clearBtn.addEventListener("click", () => {
        this.setValues([], true);
        this.owner.focus();
      });
      this.list.addEventListener("pointerdown", (e) => e.preventDefault());
      this.list.addEventListener("click", (e) => {
        const el = e.target.closest(".dv-select__option");
        if (el) this.choose(this.visible.find((r) => r.id === el.id));
      });
      this.list.addEventListener("pointermove", (e) => {
        const el = e.target.closest(".dv-select__option");
        const rec = el && this.visible.find((r) => r.id === el.id);
        if (rec && !rec.disabled && rec !== this.active) this.setActive(rec, false);
      });
      this.panel.addEventListener("focusout", (e) => {
        if (!this.contains(e.relatedTarget) && this.isOpen && !this.inline) this.close();
      });
    }

    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }

    get value() {
      return this.multiple ? this.values.slice() : this.values[0] || "";
    }

    set value(v) {
      const vals = (Array.isArray(v) ? v : v === "" || v == null ? [] : [v]).map(String);
      this.setValues(this.multiple ? vals : vals.slice(0, 1), false);
    }

    /** Reemplaza las opciones: [{ value, label, disabled, hint, group }] */
    setOptions(list) {
      this.options = list.map((o) => ({ value: String(o.value), label: o.label || String(o.value), disabled: Boolean(o.disabled), hint: o.hint || "", group: o.group || "", selected: false }));
      this.values = this.values.filter((v) => this.options.some((o) => o.value === v));
      this.renderList();
      this.sync(false);
    }

    labelOf(value) {
      const o = this.options.find((x) => x.value === value);
      return o ? o.label : value;
    }

    // ---- Lista --------------------------------------------------------------
    matches() {
      const q = normalize(this.query.trim());
      const list = this.options.filter((o) => !q || normalize(`${o.label} ${o.hint}`).includes(q));
      const exact = this.options.some((o) => normalize(o.label) === q);
      if (this.creatable && q && !exact) {
        list.push({ value: this.query.trim(), label: `${this.getAttribute("create-label") || "Crear"} «${this.query.trim()}»`, create: true, group: "", hint: "", disabled: false });
      }
      return list;
    }

    renderList() {
      this.visible = this.matches();
      this.list.textContent = "";
      let group = null;
      this.visible.forEach((rec, i) => {
        rec.id = `${this.list.id}-${i}`;
        if (rec.group !== group && rec.group) {
          const g = document.createElement("div");
          g.className = "dv-select__group";
          g.setAttribute("role", "presentation");
          g.textContent = rec.group;
          this.list.appendChild(g);
        }
        group = rec.group;
        const el = document.createElement("div");
        el.className = "dv-select__option";
        el.id = rec.id;
        el.setAttribute("role", "option");
        el.setAttribute("aria-selected", String(this.values.includes(rec.value) && !rec.create));
        if (rec.disabled) el.setAttribute("aria-disabled", "true");
        const text = document.createElement("span");
        text.className = "dv-select__label";
        text.textContent = rec.label;
        el.appendChild(text);
        if (rec.hint) {
          const hint = document.createElement("span");
          hint.className = "dv-select__hint";
          hint.textContent = rec.hint;
          el.appendChild(hint);
        }
        el.insertAdjacentHTML("beforeend", CHECK);
        this.list.appendChild(el);
      });
      this.empty.hidden = this.visible.length > 0;
      const enabled = this.visible.filter((r) => !r.disabled);
      const firstSelected = enabled.find((r) => this.values.includes(r.value) && !r.create);
      this.setActive(this.query ? enabled[0] : firstSelected || enabled[0], true);
    }

    el(rec) {
      return rec && this.list.querySelector(`#${CSS.escape(rec.id)}`);
    }

    setActive(rec, scroll) {
      const prev = this.el(this.active);
      if (prev) prev.classList.remove("is-active");
      this.active = rec || null;
      const el = this.el(rec);
      if (el) {
        el.classList.add("is-active");
        if (scroll !== false) el.scrollIntoView({ block: "nearest" });
        this.owner.setAttribute("aria-activedescendant", el.id);
      } else {
        this.owner.removeAttribute("aria-activedescendant");
      }
    }

    move(delta) {
      const enabled = this.visible.filter((r) => !r.disabled);
      if (!enabled.length) return;
      const idx = enabled.indexOf(this.active);
      this.setActive(enabled[(idx + delta + enabled.length) % enabled.length], true);
    }

    // ---- Interacción ----------------------------------------------------------
    onKey(e) {
      if (this.isDisabled) return;
      const k = e.key;
      if (!this.isOpen) {
        if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || (k === " " && !this.inline)) {
          e.preventDefault();
          this.open();
        } else if (!this.inline && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          this.open();
          this.jump(k);
        } else if (k === "Backspace" && this.multiple && this.values.length && (!this.inline || !this.input.value)) {
          this.setValues(this.values.slice(0, -1), true);
        }
        return;
      }
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        this.move(k === "ArrowDown" ? 1 : -1);
      } else if (k === "Home" || k === "End") {
        if (this.inline || this.search) return;
        e.preventDefault();
        const enabled = this.visible.filter((r) => !r.disabled);
        this.setActive(k === "Home" ? enabled[0] : enabled[enabled.length - 1], true);
      } else if (k === "Enter" || (k === " " && !this.inline && !this.search && !this.typeahead)) {
        e.preventDefault();
        if (this.active) this.choose(this.active);
      } else if (k === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close(true);
      } else if (k === "Tab") {
        this.close();
      } else if (k === "Backspace" && this.multiple && this.values.length && !(this.search || this.input || {}).value) {
        this.setValues(this.values.slice(0, -1), true);
      } else if (!this.inline && !this.search && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        this.jump(k);
      }
    }

    // Búsqueda por teclado en select sin buscador
    jump(ch) {
      clearTimeout(this.typeTimer);
      this.typeahead += normalize(ch);
      this.typeTimer = setTimeout(() => (this.typeahead = ""), 600);
      const enabled = this.visible.filter((r) => !r.disabled);
      const hit = enabled.find((r) => normalize(r.label).startsWith(this.typeahead));
      if (hit) this.setActive(hit, true);
    }

    choose(rec) {
      if (!rec || rec.disabled) return;
      if (rec.create) {
        this.options.push({ value: rec.value, label: rec.value, disabled: false, hint: "", group: "", selected: false });
        this.query = "";
        if (this.search) this.search.value = "";
        if (this.input) this.input.value = "";
      }
      if (this.multiple) {
        const has = this.values.includes(rec.value);
        this.values = has ? this.values.filter((v) => v !== rec.value) : this.values.concat(rec.value);
        this.renderList();
        this.sync(true);
        if (rec.create) this.setActive(this.visible.find((r) => r.value === rec.value), true);
      } else {
        this.query = "";
        this.values = [rec.value];
        this.renderList();
        this.sync(true);
        this.close(true);
      }
    }

    setValues(values, fire) {
      this.values = values;
      this.renderList();
      this.sync(fire);
    }

    reset() {
      this.values = this.initial.slice();
      this.query = "";
      this.renderList();
      this.sync(false);
    }

    open() {
      if (this.isDisabled || this.isOpen) return;
      this.query = "";
      if (this.search) this.search.value = "";
      this.renderList();
      this.panel.style.minWidth = `${this.wrap.offsetWidth}px`;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.owner.setAttribute("aria-expanded", "true");
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      if (this.search) this.search.focus();
      if (this.input) this.input.select();
      const el = this.el(this.active);
      if (el) el.scrollIntoView({ block: "nearest" });
      emit(this, "dv-open", {});
    }

    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.owner.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      this.query = "";
      if (this.search) this.search.value = "";
      this.showSelection();
      if (returnFocus) (this.inline ? this.input : this.trigger).focus();
      emit(this, "dv-close", {});
    }

    // ---- Presentación y formulario ------------------------------------------------
    showSelection() {
      if (this.inline) {
        this.input.value = this.multiple ? "" : this.values[0] ? this.labelOf(this.values[0]) : "";
        this.input.placeholder = this.multiple && this.values.length ? this.values.map((v) => this.labelOf(v)).join(", ") : this.getAttribute("placeholder") || "";
        return;
      }
      this.valueEl.textContent = "";
      if (!this.values.length) {
        this.valueEl.classList.add("is-placeholder");
        this.valueEl.textContent = this.getAttribute("placeholder") || "Selecciona…";
      } else if (this.multiple) {
        this.valueEl.classList.remove("is-placeholder");
        const max = parseInt(this.getAttribute("max-chips") || "3", 10);
        this.values.slice(0, max).forEach((v) => {
          const chip = document.createElement("span");
          chip.className = "dv-select__chip";
          chip.textContent = this.labelOf(v);
          this.valueEl.appendChild(chip);
        });
        if (this.values.length > max) {
          const more = document.createElement("span");
          more.className = "dv-select__chip dv-select__chip--more";
          more.textContent = `+${this.values.length - max}`;
          this.valueEl.appendChild(more);
        }
      } else {
        this.valueEl.classList.remove("is-placeholder");
        this.valueEl.textContent = this.labelOf(this.values[0]);
      }
    }

    sync(fire) {
      this.showSelection();
      this.clearBtn.hidden = !this.values.length;
      this.syncDisabled();
      if (this.multiple) {
        const fd = new FormData();
        this.values.forEach((v) => fd.append(this.name, v));
        this.publish(this.values.length ? fd : null, !this.values.length, this.trigger);
      } else {
        this.publish(this.values.length ? this.values[0] : null, !this.values.length, this.trigger);
      }
      if (fire) emit(this, "dv-change", { value: this.value, values: this.values.slice() });
    }

    syncDisabled() {
      if (!this.trigger) return;
      const d = this.isDisabled;
      if (this.input) this.input.disabled = d;
      else this.trigger.disabled = d;
      this.clearBtn.disabled = d;
      if (d) this.close();
    }
  }

  class DvCombobox extends DvSelect {
    setup() {
      this.setAttribute("autocomplete", "");
      super.setup();
    }
  }

  /**
   * <dv-date-picker name="fecha" value="2026-10-14" min max locale="es" week-start="1"
   *                 placeholder="Elige una fecha" clearable required range months="2" date-style="medium">
   * Con `range` elige un intervalo; el valor es "inicio/fin" (ISO 8601).
   */
  class DvDatePicker extends DvFormElement {
    setup() {
      this.range = this.hasAttribute("range");
      this.locale = this.getAttribute("locale") || document.documentElement.lang || undefined;
      this.initial = this.getAttribute("value") || "";
      this.val = this.initial;
      this.build();
      this.sync(false);
    }

    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "dv-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "dv-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<svg class="dv-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="dv-trigger__value"></span>`;
      this.valueEl = this.trigger.querySelector(".dv-trigger__value");
      this.wrap.appendChild(this.trigger);

      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "dv-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar fecha");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);

      this.panel = document.createElement("div");
      this.panel.className = "dv-popover__panel dv-date__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || (this.range ? "Elegir intervalo de fechas" : "Elegir fecha"));
      this.cal = document.createElement("dv-calendar");
      ["locale", "week-start", "min", "max"].forEach((a) => this.hasAttribute(a) && this.cal.setAttribute(a, this.getAttribute(a)));
      if (this.range) this.cal.setAttribute("mode", "range");
      this.cal.setAttribute("months", this.getAttribute("months") || (this.range ? "2" : "1"));
      if (this.val) this.cal.setAttribute("value", this.val);
      this.panel.appendChild(this.cal);
      this.append(this.wrap, this.panel);

      this.trigger.addEventListener("click", () => (this.isOpen ? this.close() : this.open()));
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
      this.cal.addEventListener("dv-change", (e) => {
        e.stopPropagation();
        if (this.range && !e.detail.complete) return;
        this.set(e.detail.value, true);
        this.close(true);
      });
      this.clearBtn.addEventListener("click", () => {
        this.set("", true);
        this.trigger.focus();
      });
    }

    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }

    get value() {
      return this.val;
    }

    set value(v) {
      this.set(v || "", false);
    }

    get start() {
      return this.val.split("/")[0] || "";
    }

    get end() {
      return this.range ? this.val.split("/")[1] || "" : "";
    }

    set(v, fire) {
      this.val = v;
      if (this.cal._dvReady) this.cal.value = v;
      else if (v) this.cal.setAttribute("value", v);
      else this.cal.removeAttribute("value");
      this.sync(fire);
    }

    reset() {
      this.set(this.initial, false);
    }

    format(iso) {
      const d = fromISO(iso);
      return d ? new Intl.DateTimeFormat(this.locale, { dateStyle: this.getAttribute("date-style") || "medium" }).format(d) : "";
    }

    sync(fire) {
      const [a, b] = this.val.split("/");
      this.valueEl.classList.toggle("is-placeholder", !a);
      this.valueEl.textContent = a ? (this.range ? `${this.format(a)} – ${this.format(b)}` : this.format(a)) : this.getAttribute("placeholder") || (this.range ? "Elige un intervalo" : "Elige una fecha");
      this.clearBtn.hidden = !a;
      this.syncDisabled();
      this.publish(a ? this.val : null, !a, this.trigger);
      if (fire) emit(this, "dv-change", { value: this.val, start: this.start, end: this.end });
    }

    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      this.clearBtn.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }

    open() {
      if (this.isDisabled || this.isOpen) return;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      const day = this.cal.querySelector('.dv-cal__day[tabindex="0"]');
      if (day) day.focus();
      emit(this, "dv-open", {});
    }

    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "dv-close", {});
    }
  }

  /**
   * <dv-time-picker name="hora" value="09:30" step="5" hour12 min="08:00" max="18:00"
   *                 placeholder="Elige una hora" clearable required locale="es">
   * Valor siempre "HH:MM" (24 h). En el panel: ↑ ↓ cambian el valor, ← → cambian de columna.
   */
  class DvTimePicker extends DvFormElement {
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || undefined;
      this.step = Math.max(1, parseInt(this.getAttribute("step") || "5", 10));
      this.h12 = this.hasAttribute("hour12");
      this.initial = this.getAttribute("value") || "";
      const t = this.parse(this.initial);
      this.h = t ? t[0] : null;
      this.m = t ? t[1] : null;
      this.period = this.h !== null && this.h >= 12 ? "PM" : "AM";
      this.build();
      this.sync(false);
    }

    parse(v) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(v || "");
      return m && +m[1] < 24 && +m[2] < 60 ? [+m[1], +m[2]] : null;
    }

    minutesOf(attr) {
      const t = this.parse(this.getAttribute(attr));
      return t ? t[0] * 60 + t[1] : null;
    }

    outOfRange(total) {
      const lo = this.minutesOf("min");
      const hi = this.minutesOf("max");
      return (lo !== null && total < lo) || (hi !== null && total > hi);
    }

    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "dv-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "dv-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<svg class="dv-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="dv-trigger__value"></span>`;
      this.valueEl = this.trigger.querySelector(".dv-trigger__value");
      this.wrap.appendChild(this.trigger);

      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "dv-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar hora");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);

      this.panel = document.createElement("div");
      this.panel.className = "dv-popover__panel dv-time__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir hora");
      this.cols = document.createElement("div");
      this.cols.className = "dv-time__cols";
      this.panel.appendChild(this.cols);
      this.append(this.wrap, this.panel);

      this.trigger.addEventListener("click", () => (this.isOpen ? this.close() : this.open()));
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.cols.addEventListener("click", (e) => {
        const opt = e.target.closest(".dv-time__opt");
        if (opt && !opt.disabled) this.pick(opt.closest(".dv-time__col").dataset.col, opt.dataset.v, true);
      });
      this.cols.addEventListener("keydown", (e) => this.onKey(e));
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
      this.clearBtn.addEventListener("click", () => {
        this.h = this.m = null;
        this.sync(true);
        this.trigger.focus();
      });
    }

    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }

    get value() {
      return this.h === null ? "" : `${pad(this.h)}:${pad(this.m === null ? 0 : this.m)}`;
    }

    set value(v) {
      const t = this.parse(v);
      this.h = t ? t[0] : null;
      this.m = t ? t[1] : null;
      if (t) this.period = t[0] >= 12 ? "PM" : "AM";
      this.sync(false);
    }

    reset() {
      this.value = this.initial;
    }

    // ---- Columnas -------------------------------------------------------------
    renderCols() {
      const hours = [];
      if (this.h12) for (let i = 1; i <= 12; i++) hours.push(i);
      else for (let i = 0; i < 24; i++) hours.push(i);
      const mins = [];
      for (let i = 0; i < 60; i += this.step) mins.push(i);
      if (this.m !== null && !mins.includes(this.m)) mins.push(this.m), mins.sort((a, b) => a - b);

      const hourSel = this.h === null ? null : this.h12 ? this.h % 12 || 12 : this.h;
      const col = (key, label, items) => `<div class="dv-time__col" role="listbox" aria-label="${label}" data-col="${key}">${items
        .map((it) => `<button type="button" role="option" class="dv-time__opt" data-v="${it.v}" aria-selected="${it.sel}" tabindex="${it.sel ? 0 : -1}"${it.off ? " disabled" : ""}>${it.t}</button>`)
        .join("")}</div>`;

      const h24 = (n) => (this.h12 ? (n % 12) + (this.period === "PM" ? 12 : 0) : n);
      const hItems = hours.map((n) => {
        const t = h24(n);
        return { v: n, t: pad(n), sel: n === hourSel, off: this.outOfRange(t * 60 + 59) && this.outOfRange(t * 60) };
      });
      const mItems = mins.map((n) => ({ v: n, t: pad(n), sel: n === this.m, off: this.h !== null && this.outOfRange(this.h * 60 + n) }));
      let html = col("h", this.getAttribute("hour-label") || "Hora", hItems) + col("m", this.getAttribute("minute-label") || "Minutos", mItems);
      if (this.h12) {
        html += col("p", "AM/PM", ["AM", "PM"].map((p) => ({ v: p, t: p, sel: p === this.period, off: false })));
      }
      this.cols.innerHTML = html;
      // Si nada está seleccionado, la primera opción de cada columna es alcanzable con Tab
      this.cols.querySelectorAll(".dv-time__col").forEach((c) => {
        if (!c.querySelector('[tabindex="0"]')) {
          const first = c.querySelector(".dv-time__opt:not([disabled])");
          if (first) first.tabIndex = 0;
        }
      });
    }

    pick(colKey, v, userClick) {
      if (colKey === "h") {
        const n = +v;
        this.h = this.h12 ? (n % 12) + (this.period === "PM" ? 12 : 0) : n;
        if (this.m === null) this.m = 0;
      } else if (colKey === "m") {
        this.m = +v;
        if (this.h === null) this.h = this.h12 && this.period === "PM" ? 12 : 0;
      } else {
        this.period = v;
        if (this.h !== null) this.h = (this.h % 12) + (v === "PM" ? 12 : 0);
      }
      this.sync(true);
      this.renderCols();
      const sel = this.cols.querySelector(`[data-col="${colKey}"] [aria-selected="true"]`);
      if (sel) sel.focus();
      // En clic, tras elegir los minutos (o AM/PM) el panel se cierra
      if (userClick && (colKey === "m" || colKey === "p")) this.close(true);
    }

    onKey(e) {
      const opt = e.target.closest(".dv-time__opt");
      if (!opt) return;
      const colEl = opt.closest(".dv-time__col");
      const key = colEl.dataset.col;
      const opts = Array.from(colEl.querySelectorAll(".dv-time__opt:not([disabled])"));
      const i = opts.indexOf(opt);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = opts[Math.max(0, Math.min(opts.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
        if (next && next !== opt) this.pick(key, next.dataset.v, false);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        this.pick(key, opts[e.key === "Home" ? 0 : opts.length - 1].dataset.v, false);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const cols = Array.from(this.cols.querySelectorAll(".dv-time__col"));
        const target = cols[cols.indexOf(colEl) + (e.key === "ArrowRight" ? 1 : -1)];
        if (target) (target.querySelector('[aria-selected="true"]') || target.querySelector(".dv-time__opt:not([disabled])")).focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (opt.disabled) return;
        this.pick(key, opt.dataset.v, true);
        if (key === "h") {
          const m = this.cols.querySelector('[data-col="m"] [aria-selected="true"]') || this.cols.querySelector('[data-col="m"] .dv-time__opt');
          if (m) m.focus();
        }
      }
    }

    // ---- Presentación -----------------------------------------------------------
    format() {
      if (this.h === null) return "";
      return new Intl.DateTimeFormat(this.locale, { hour: "numeric", minute: "2-digit", hour12: this.h12 }).format(new Date(2000, 0, 1, this.h, this.m || 0));
    }

    sync(fire) {
      this.valueEl.classList.toggle("is-placeholder", this.h === null);
      this.valueEl.textContent = this.h === null ? this.getAttribute("placeholder") || "Elige una hora" : this.format();
      this.clearBtn.hidden = this.h === null;
      this.syncDisabled();
      this.publish(this.h === null ? null : this.value, this.h === null, this.trigger);
      if (fire) emit(this, "dv-change", { value: this.value });
    }

    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      this.clearBtn.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }

    open() {
      if (this.isDisabled || this.isOpen) return;
      this.renderCols();
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      this.cols.querySelectorAll(".dv-time__col").forEach((c) => {
        const sel = c.querySelector('[aria-selected="true"]');
        if (sel) c.scrollTop = sel.offsetTop - c.clientHeight / 2 + sel.offsetHeight / 2;
      });
      const first = this.cols.querySelector('[aria-selected="true"]') || this.cols.querySelector(".dv-time__opt:not([disabled])");
      if (first) first.focus({ preventScroll: true });
      emit(this, "dv-open", {});
    }

    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "dv-close", {});
    }
  }

  // --------------------------------------------------------------------------
  // 16. Barras de menú: <dv-menubar> (estilo aplicación) y <dv-nav-menu> (mega menú)
  // --------------------------------------------------------------------------
  /**
   * <dv-menubar>
   *   <div class="dv-bar__item">
   *     <button data-dv-trigger>Archivo</button>
   *     <div class="dv-menu__list">
   *       <button class="dv-menu__item" data-value="new">Nuevo <kbd class="dv-kbd">⌘N</kbd></button>
   *       <button class="dv-menu__item" data-check aria-checked="true" data-value="grid">Cuadrícula</button>
   *       <div class="dv-menu__sub">
   *         <button class="dv-menu__item" data-submenu>Compartir</button>
   *         <div class="dv-menu__list">…</div>
   *       </div>
   *     </div>
   *   </div>
   *   <a class="dv-bar__item" href="#">Enlace simple</a>
   * </dv-menubar>
   * Con <dv-nav-menu> el panel (.dv-bar__panel) puede llevar cualquier contenido y se abre al pasar el cursor.
   */
  class DvBar extends DvElement {
    get isMenubar() {
      return this.localName === "dv-menubar";
    }

    setup() {
      this.setAttribute("role", this.isMenubar ? "menubar" : "navigation");
      this.entries = Array.from(this.querySelectorAll(":scope > .dv-bar__item")).map((root) => {
        const isLink = root.tagName === "A";
        const trigger = isLink ? root : root.querySelector(":scope > [data-dv-trigger]") || root.querySelector(":scope > button");
        const panel = isLink ? null : root.querySelector(":scope > .dv-menu__list, :scope > .dv-bar__panel");
        return { root, trigger, panel };
      }).filter((e) => e.trigger);
      this.current = null;
      this.stops = this.entries.map((e) => e.trigger);

      this.entries.forEach((entry) => {
        const { trigger, panel } = entry;
        if (this.isMenubar) trigger.setAttribute("role", "menuitem");
        if (!panel) return;
        panel.id = panel.id || nextId("dv-bar-panel");
        panel.setAttribute("popover", "manual");
        if (this.isMenubar) panel.setAttribute("role", "menu");
        trigger.setAttribute("aria-haspopup", this.isMenubar ? "menu" : "true");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", panel.id);
        this.prepareList(panel);

        trigger.addEventListener("click", (e) => {
          if (this.current === entry) this.closeAll(false);
          else this.open(entry, e.detail === 0 ? "first" : null);
        });
        if (this.isMenubar) {
          trigger.addEventListener("pointerenter", () => {
            if (this.current && this.current !== entry) this.open(entry);
          });
        } else {
          const delay = parseInt(this.getAttribute("hover-delay") || "120", 10);
          entry.root.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "touch") return;
            clearTimeout(this.hoverTimer);
            this.hoverTimer = setTimeout(() => this.open(entry), this.current ? 0 : delay);
          });
          entry.root.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "touch") return;
            clearTimeout(this.hoverTimer);
            this.hoverTimer = setTimeout(() => this.current === entry && this.closeAll(false), 220);
          });
        }
      });

      if (this.isMenubar && this.stops.length) {
        this.stops.forEach((s, i) => (s.tabIndex = i === 0 ? 0 : -1));
        this.addEventListener("focusin", (e) => {
          const idx = this.stops.indexOf(e.target);
          if (idx !== -1) this.stops.forEach((s, i) => (s.tabIndex = i === idx ? 0 : -1));
        });
      }

      this.addEventListener("keydown", (e) => this.onKey(e));
      this.addEventListener("click", (e) => this.onItemClick(e));
    }

    // Roles y submenús de una lista de menú
    prepareList(list) {
      if (!this.isMenubar) return;
      list.querySelectorAll(":scope > .dv-menu__item, :scope > .dv-menu__sub > .dv-menu__item").forEach((item) => {
        item.tabIndex = -1;
        item.setAttribute("role", item.hasAttribute("data-check") ? "menuitemcheckbox" : "menuitem");
      });
      list.querySelectorAll(":scope > .dv-menu__sub").forEach((sub) => {
        const parent = sub.querySelector(":scope > .dv-menu__item");
        const child = sub.querySelector(":scope > .dv-menu__list");
        if (!parent || !child) return;
        child.id = child.id || nextId("dv-bar-sub");
        child.setAttribute("popover", "manual");
        child.setAttribute("role", "menu");
        parent.setAttribute("aria-haspopup", "menu");
        parent.setAttribute("aria-expanded", "false");
        parent.setAttribute("aria-controls", child.id);
        this.prepareList(child);
        const timer = {};
        sub.addEventListener("pointerenter", (e) => {
          if (e.pointerType === "touch") return;
          clearTimeout(timer.t);
          timer.t = setTimeout(() => this.openSub(sub), 150);
        });
        sub.addEventListener("pointerleave", () => {
          clearTimeout(timer.t);
          timer.t = setTimeout(() => this.closeSub(sub), 200);
        });
      });
    }

    itemsOf(list) {
      return Array.from(list.querySelectorAll(":scope > .dv-menu__item:not([disabled]), :scope > .dv-menu__sub > .dv-menu__item:not([disabled])"));
    }

    // ---- Abrir / cerrar -------------------------------------------------------
    open(entry, focus) {
      if (!entry.panel) return;
      if (this.current && this.current !== entry) this.closeAll(false);
      if (!entry.panel.matches(":popover-open")) {
        entry.panel.showPopover();
        position(entry.trigger, entry.panel, { placement: "bottom-start", offset: 4 });
        entry.trigger.setAttribute("aria-expanded", "true");
        this.current = entry;
        this.outside = (e) => {
          if (!this.contains(e.target)) this.closeAll(false);
        };
        this.reposition = () => position(entry.trigger, entry.panel, { placement: "bottom-start", offset: 4 });
        document.addEventListener("pointerdown", this.outside, true);
        window.addEventListener("scroll", this.reposition, true);
        window.addEventListener("resize", this.reposition);
        emit(this, "dv-open", { item: entry.trigger.textContent.trim() });
      }
      if (focus) this.focusIn(entry.panel, focus);
    }

    focusIn(panel, which) {
      if (this.isMenubar) {
        const items = this.itemsOf(panel);
        const target = which === "last" ? items[items.length - 1] : items[0];
        if (target) target.focus();
      } else {
        const target = panel.querySelector(FOCUSABLE);
        if (target) target.focus();
      }
    }

    openSub(sub) {
      const parent = sub.querySelector(":scope > .dv-menu__item");
      const child = sub.querySelector(":scope > .dv-menu__list");
      if (!child || child.matches(":popover-open")) return;
      // Cierra submenús hermanos
      sub.parentElement.querySelectorAll(":scope > .dv-menu__sub").forEach((s) => s !== sub && this.closeSub(s));
      child.showPopover();
      position(parent, child, { placement: "right-start", offset: 2 });
      parent.setAttribute("aria-expanded", "true");
    }

    closeSub(sub) {
      const parent = sub.querySelector(":scope > .dv-menu__item");
      const child = sub.querySelector(":scope > .dv-menu__list");
      if (!child || !child.matches(":popover-open")) return;
      child.querySelectorAll(":scope > .dv-menu__sub").forEach((s) => this.closeSub(s));
      child.hidePopover();
      parent.setAttribute("aria-expanded", "false");
    }

    closeAll(returnFocus) {
      const entry = this.current;
      if (!entry) return;
      clearTimeout(this.hoverTimer);
      entry.panel.querySelectorAll(".dv-menu__sub").forEach((s) => this.closeSub(s));
      if (entry.panel.matches(":popover-open")) entry.panel.hidePopover();
      entry.trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", this.outside, true);
      window.removeEventListener("scroll", this.reposition, true);
      window.removeEventListener("resize", this.reposition);
      this.current = null;
      if (returnFocus) entry.trigger.focus();
      emit(this, "dv-close", {});
    }

    // ---- Teclado --------------------------------------------------------------
    onKey(e) {
      const t = e.target;
      const k = e.key;
      const stopIdx = this.stops.indexOf(t);

      // Elementos de la barra superior
      if (stopIdx !== -1) {
        const entry = this.entries[stopIdx];
        if (k === "ArrowRight" || k === "ArrowLeft") {
          e.preventDefault();
          const next = this.entries[(stopIdx + (k === "ArrowRight" ? 1 : -1) + this.entries.length) % this.entries.length];
          next.trigger.focus();
          if (this.current && next.panel) this.open(next, this.isMenubar ? "first" : null);
        } else if (k === "Home" || k === "End") {
          e.preventDefault();
          this.stops[k === "Home" ? 0 : this.stops.length - 1].focus();
        } else if (k === "ArrowDown" && entry.panel) {
          e.preventDefault();
          this.open(entry, "first");
        } else if (k === "ArrowUp" && entry.panel && this.isMenubar) {
          e.preventDefault();
          this.open(entry, "last");
        } else if (k === "Escape" && this.current) {
          e.preventDefault();
          this.closeAll(true);
        }
        return;
      }

      const panel = this.current && this.current.panel;
      if (!panel || !panel.contains(t)) return;
      if (k === "Escape") {
        e.preventDefault();
        const list = t.closest(".dv-menu__list");
        const sub = list && list.parentElement.classList.contains("dv-menu__sub") ? list.parentElement : null;
        if (sub && this.isMenubar) {
          this.closeSub(sub);
          sub.querySelector(":scope > .dv-menu__item").focus();
        } else this.closeAll(true);
        return;
      }
      if (k === "Tab") {
        this.closeAll(false);
        return;
      }
      if (!this.isMenubar) return;

      const list = t.closest(".dv-menu__list");
      const items = this.itemsOf(list);
      const isSubParent = t.hasAttribute("data-submenu");
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
        const next = moveFocus(items, t, k);
        if (next) {
          e.preventDefault();
          next.focus();
        }
      } else if (k === "ArrowRight" && isSubParent) {
        e.preventDefault();
        const sub = t.parentElement;
        this.openSub(sub);
        this.focusIn(sub.querySelector(":scope > .dv-menu__list"), "first");
      } else if (k === "ArrowLeft" && list.parentElement.classList.contains("dv-menu__sub")) {
        e.preventDefault();
        const sub = list.parentElement;
        this.closeSub(sub);
        sub.querySelector(":scope > .dv-menu__item").focus();
      } else if (k === "ArrowRight" || k === "ArrowLeft") {
        e.preventDefault();
        const i = this.entries.indexOf(this.current);
        const next = this.entries[(i + (k === "ArrowRight" ? 1 : -1) + this.entries.length) % this.entries.length];
        next.trigger.focus();
        if (next.panel) this.open(next, "first");
      } else if (k === "Enter" || k === " ") {
        if (isSubParent) {
          e.preventDefault();
          const sub = t.parentElement;
          this.openSub(sub);
          this.focusIn(sub.querySelector(":scope > .dv-menu__list"), "first");
        }
      }
    }

    onItemClick(e) {
      const item = e.target.closest(".dv-menu__item");
      if (item && this.isMenubar && this.contains(item)) {
        if (item.disabled || item.getAttribute("aria-disabled") === "true") return;
        if (item.hasAttribute("data-submenu")) {
          this.openSub(item.parentElement);
          return;
        }
        const detail = { value: item.dataset.value || item.textContent.trim(), item };
        if (item.hasAttribute("data-check")) {
          const on = item.getAttribute("aria-checked") !== "true";
          item.setAttribute("aria-checked", String(on));
          detail.checked = on;
        }
        emit(this, "dv-select", detail);
        this.closeAll(true);
      } else if (!this.isMenubar && this.current && this.current.panel.contains(e.target) && e.target.closest("a[href], button")) {
        emit(this, "dv-select", { value: e.target.closest("a, button").textContent.trim() });
        this.closeAll(false);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 17. Inputs avanzados: slider, rating, color, contraseña, textarea, mention
  // --------------------------------------------------------------------------
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const decimalsOf = (n) => (String(n).split(".")[1] || "").length;

  /**
   * <dv-slider name="precio" min="0" max="100" step="5" value="20,80" range prefix="$" suffix="k">
   * Con `range` (o dos valores en `value`) tiene dos pulgares que no se cruzan.
   * Eventos: dv-input (mientras se mueve) y dv-change (al soltar / con teclado).
   * Teclado: ← → ± step, PgUp PgDn ± 10 pasos, Home End.
   */
  class DvSlider extends DvFormElement {
    setup() {
      this.min = parseFloat(this.getAttribute("min") || "0");
      this.max = parseFloat(this.getAttribute("max") || "100");
      this.step = parseFloat(this.getAttribute("step") || "1") || 1;
      const raw = this.getAttribute("value") || "";
      this.range = this.hasAttribute("range") || raw.includes(",");
      let vals = raw.split(",").map(Number).filter(Number.isFinite);
      const span = this.max - this.min;
      if (this.range) {
        if (vals.length < 2) vals = [this.min + span * 0.25, this.min + span * 0.75];
        vals = vals.slice(0, 2).map((v) => this.snap(v)).sort((a, b) => a - b);
      } else {
        vals = [this.snap(vals.length ? vals[0] : this.min)];
      }
      this.initial = vals.slice();
      this.vals = vals.slice();
      this.drag = null;
      this.build();
      this.update(false);
    }

    snap(v) {
      const stepped = Math.round((clamp(v, this.min, this.max) - this.min) / this.step) * this.step + this.min;
      return clamp(Number(stepped.toFixed(decimalsOf(this.step) + decimalsOf(this.min))), this.min, this.max);
    }

    build() {
      this.textContent = "";
      this.track = document.createElement("div");
      this.track.className = "dv-slider__track";
      this.fill = document.createElement("div");
      this.fill.className = "dv-slider__fill";
      this.track.appendChild(this.fill);
      this.thumbs = this.vals.map((_, i) => {
        const t = document.createElement("div");
        t.className = "dv-slider__thumb";
        t.setAttribute("role", "slider");
        t.setAttribute("aria-orientation", "horizontal");
        t.setAttribute("aria-valuemin", String(this.min));
        t.setAttribute("aria-valuemax", String(this.max));
        const label = this.getAttribute("label") || "Valor";
        t.setAttribute("aria-label", this.range ? `${label}: ${i === 0 ? "mínimo" : "máximo"}` : label);
        t.dataset.i = String(i);
        this.track.appendChild(t);
        return t;
      });
      this.appendChild(this.track);

      this.track.addEventListener("pointerdown", (e) => {
        if (this.isDisabled || e.button !== 0) return;
        e.preventDefault();
        const v = this.valueAt(e.clientX);
        let i = this.thumbs.indexOf(e.target.closest(".dv-slider__thumb"));
        if (i === -1) {
          i = 0;
          if (this.range) i = Math.abs(v - this.vals[0]) < Math.abs(v - this.vals[1]) || (v === this.vals[0] && v === this.vals[1] && v < this.max) ? 0 : 1;
        }
        this.drag = i;
        this.thumbs[i].focus();
        this.track.setPointerCapture(e.pointerId);
        this.classList.add("is-dragging");
        this.setThumb(i, v, false);
      });
      this.track.addEventListener("pointermove", (e) => {
        if (this.drag !== null) this.setThumb(this.drag, this.valueAt(e.clientX), false);
      });
      const end = () => {
        if (this.drag === null) return;
        this.drag = null;
        this.classList.remove("is-dragging");
        emit(this, "dv-change", { value: this.value, values: this.vals.slice() });
      };
      this.track.addEventListener("pointerup", end);
      this.track.addEventListener("pointercancel", end);
      this.thumbs.forEach((t, i) => t.addEventListener("keydown", (e) => this.onKey(e, i)));
    }

    valueAt(clientX) {
      const r = this.track.getBoundingClientRect();
      return this.min + clamp((clientX - r.left) / r.width, 0, 1) * (this.max - this.min);
    }

    onKey(e, i) {
      if (this.isDisabled) return;
      const k = e.key;
      const cur = this.vals[i];
      let next = null;
      if (k === "ArrowRight" || k === "ArrowUp") next = cur + this.step;
      else if (k === "ArrowLeft" || k === "ArrowDown") next = cur - this.step;
      else if (k === "PageUp") next = cur + this.step * 10;
      else if (k === "PageDown") next = cur - this.step * 10;
      else if (k === "Home") next = this.min;
      else if (k === "End") next = this.max;
      if (next === null) return;
      e.preventDefault();
      this.setThumb(i, next, true);
    }

    setThumb(i, v, commit) {
      v = this.snap(v);
      if (this.range) v = i === 0 ? Math.min(v, this.vals[1]) : Math.max(v, this.vals[0]);
      if (v === this.vals[i]) return;
      this.vals[i] = v;
      this.update(true);
      if (commit) emit(this, "dv-change", { value: this.value, values: this.vals.slice() });
    }

    get value() {
      return this.vals.join(",");
    }

    set value(v) {
      const vals = String(v).split(",").map(Number).filter(Number.isFinite).map((n) => this.snap(n));
      if (vals.length !== this.vals.length) return;
      this.vals = this.range ? vals.sort((a, b) => a - b) : vals;
      this.update(false);
    }

    get values() {
      return this.vals.slice();
    }

    reset() {
      this.vals = this.initial.slice();
      this.update(false);
    }

    syncDisabled() {
      if (!this.thumbs) return;
      this.toggleAttribute("aria-disabled", this.isDisabled);
      this.thumbs.forEach((t) => (t.tabIndex = this.isDisabled ? -1 : 0));
    }

    update(fireInput) {
      const span = this.max - this.min || 1;
      const pct = this.vals.map((v) => ((v - this.min) / span) * 100);
      const prefix = this.getAttribute("prefix") || "";
      const suffix = this.getAttribute("suffix") || "";
      this.thumbs.forEach((t, i) => {
        t.style.setProperty("--p", `${pct[i]}%`);
        t.setAttribute("aria-valuenow", String(this.vals[i]));
        t.setAttribute("aria-valuetext", `${prefix}${this.vals[i]}${suffix}`);
        t.dataset.value = `${prefix}${this.vals[i]}${suffix}`;
        // El pulgar activo queda por encima cuando ambos coinciden en un extremo
        t.style.zIndex = this.range && this.vals[0] === this.vals[1] ? (i === 0 ? (pct[0] > 50 ? 2 : 1) : pct[1] > 50 ? 1 : 2) : "";
      });
      this.fill.style.left = this.range ? `${pct[0]}%` : "0";
      this.fill.style.width = this.range ? `${pct[1] - pct[0]}%` : `${pct[0]}%`;
      this.syncDisabled();
      if (this.range) {
        const fd = new FormData();
        this.vals.forEach((v) => fd.append(this.name, String(v)));
        this.publish(fd, false, this.thumbs[0]);
      } else {
        this.publish(String(this.vals[0]), false, this.thumbs[0]);
      }
      if (fireInput) emit(this, "dv-input", { value: this.value, values: this.vals.slice() });
    }
  }

  const STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"/></svg>`;

  /**
   * <dv-rating name="nota" value="3.5" max="5" half clearable readonly label="Valoración">
   * Un único control con role="slider": ← → ± paso, Home/End, Supr borra (con `clearable`).
   */
  class DvRating extends DvFormElement {
    setup() {
      this.max = Math.max(1, parseInt(this.getAttribute("max") || "5", 10));
      this.half = this.hasAttribute("half");
      this.stepSize = this.half ? 0.5 : 1;
      this.initial = this.norm(parseFloat(this.getAttribute("value") || "0"));
      this.val = this.initial;
      this.hover = null;
      this.textContent = "";
      this.stars = Array.from({ length: this.max }, () => {
        const s = document.createElement("span");
        s.className = "dv-rating__star";
        s.innerHTML = `${STAR}<span class="dv-rating__fill">${STAR}</span>`;
        this.appendChild(s);
        return s;
      });
      this.setAttribute("aria-valuemin", "0");
      this.setAttribute("aria-valuemax", String(this.max));
      this.setAttribute("aria-label", this.getAttribute("label") || "Valoración");

      this.addEventListener("pointermove", (e) => {
        if (this.interactive && e.pointerType !== "touch") {
          this.hover = this.valueAt(e.clientX);
          this.paint();
        }
      });
      this.addEventListener("pointerleave", () => {
        this.hover = null;
        this.paint();
      });
      this.addEventListener("click", (e) => {
        if (!this.interactive) return;
        const v = this.valueAt(e.clientX);
        this.set(this.hasAttribute("clearable") && v === this.val ? 0 : v, true);
        this.focus();
      });
      this.addEventListener("keydown", (e) => {
        if (!this.interactive) return;
        const k = e.key;
        let next = null;
        if (k === "ArrowRight" || k === "ArrowUp") next = this.val + this.stepSize;
        else if (k === "ArrowLeft" || k === "ArrowDown") next = this.val - this.stepSize;
        else if (k === "Home") next = this.hasAttribute("clearable") ? 0 : this.stepSize;
        else if (k === "End") next = this.max;
        else if ((k === "Delete" || k === "Backspace") && this.hasAttribute("clearable")) next = 0;
        if (next === null) return;
        e.preventDefault();
        this.set(next, true);
      });
      this.syncDisabled();
      this.paint();
      this.sync(false);
    }

    get interactive() {
      return !this.hasAttribute("readonly") && !this.isDisabled;
    }

    norm(v) {
      if (!Number.isFinite(v)) return 0;
      return clamp(Math.round(v / this.stepSize) * this.stepSize, 0, this.max);
    }

    valueAt(clientX) {
      for (let i = 0; i < this.stars.length; i++) {
        const r = this.stars[i].getBoundingClientRect();
        if (clientX <= r.right) {
          const frac = clamp((clientX - r.left) / r.width, 0, 1);
          return i + (this.half && frac <= 0.5 ? 0.5 : 1);
        }
      }
      return this.max;
    }

    get value() {
      return this.val;
    }

    set value(v) {
      this.set(parseFloat(v), false);
    }

    set(v, fire) {
      this.val = this.norm(v);
      this.paint();
      this.sync(fire);
    }

    reset() {
      this.set(this.initial, false);
    }

    paint() {
      const shown = this.hover !== null && this.interactive ? this.hover : this.val;
      this.stars.forEach((s, i) => s.style.setProperty("--f", String(clamp(shown - i, 0, 1))));
      this.classList.toggle("is-hovering", this.hover !== null);
    }

    syncDisabled() {
      if (!this.stars) return;
      const ro = this.hasAttribute("readonly");
      this.setAttribute("role", ro ? "img" : "slider");
      if (this.interactive) this.tabIndex = 0;
      else this.removeAttribute("tabindex");
      this.toggleAttribute("aria-disabled", this.isDisabled);
    }

    sync(fire) {
      const text = `${this.val} de ${this.max}`;
      this.setAttribute("aria-valuenow", String(this.val));
      this.setAttribute("aria-valuetext", text);
      if (this.hasAttribute("readonly")) this.setAttribute("aria-label", `${this.getAttribute("label") || "Valoración"}: ${text}`);
      this.publish(this.val ? String(this.val) : null, !this.val, this);
      if (fire) emit(this, "dv-change", { value: this.val });
    }
  }

  // ---- Color ----------------------------------------------------------------
  const hsv2rgb = (h, s, v) => {
    const f = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    };
    return [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
  };
  const rgb2hsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const d = max - Math.min(r, g, b);
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return [h, max ? d / max : 0, max];
  };
  const toHex = (r, g, b, a = 1) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : ""}`;
  function parseHex(str) {
    const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(String(str).trim());
    if (!m) return null;
    let h = m[1];
    if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const DEFAULT_SWATCHES = "#f43f5e,#f59e0b,#10b981,#0ea5e9,#6366f1,#a855f7,#ec4899,#141415,#8e8e96,#ffffff";

  /**
   * <dv-color-picker name="color" value="#6366f1" alpha swatches="#f00,#0f0" label="Color">
   * Área de saturación/brillo, tono, opacidad (con `alpha`), campo hexadecimal y cuentagotas
   * (si el navegador lo soporta). Valor: "#rrggbb" o "#rrggbbaa". Teclado en cada control: flechas (Shift = ×10).
   */
  class DvColorPicker extends DvFormElement {
    setup() {
      this.alphaOn = this.hasAttribute("alpha");
      this.initial = this.getAttribute("value") || "#6366f1";
      this.setHex(this.initial, false);
      this.build();
      this.paint();
      this.sync(false);
    }

    setHex(str, fire) {
      const c = parseHex(str);
      if (!c) return false;
      [this.h, this.s, this.v] = rgb2hsv(c.r, c.g, c.b);
      this.a = this.alphaOn ? c.a : 1;
      if (fire) this.sync(true);
      return true;
    }

    get value() {
      return toHex(...hsv2rgb(this.h, this.s, this.v), this.a);
    }

    set value(v) {
      if (this.setHex(v, false) && this.area) {
        this.paint();
        this.sync(false);
      }
    }

    reset() {
      this.value = this.initial;
    }

    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "dv-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "dv-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<span class="dv-color__swatch"><span></span></span><span class="dv-trigger__value dv-mono"></span>`;
      this.swatchEl = this.trigger.querySelector(".dv-color__swatch > span");
      this.valueEl = this.trigger.querySelector(".dv-trigger__value");
      if (this.getAttribute("label")) this.trigger.setAttribute("aria-label", this.getAttribute("label"));
      this.wrap.appendChild(this.trigger);

      this.panel = document.createElement("div");
      this.panel.className = "dv-popover__panel dv-color__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir color");
      const slider = (cls, label) => {
        const el = document.createElement("div");
        el.className = cls;
        el.tabIndex = 0;
        el.setAttribute("role", "slider");
        el.setAttribute("aria-label", label);
        const thumb = document.createElement("span");
        thumb.className = "dv-color__thumb";
        el.appendChild(thumb);
        return el;
      };
      this.area = slider("dv-color__area", this.getAttribute("area-label") || "Saturación y brillo");
      this.hue = slider("dv-color__hue", this.getAttribute("hue-label") || "Tono");
      this.hue.setAttribute("aria-valuemin", "0");
      this.hue.setAttribute("aria-valuemax", "360");
      this.panel.append(this.area, this.hue);
      if (this.alphaOn) {
        this.alpha = slider("dv-color__alpha", this.getAttribute("alpha-label") || "Opacidad");
        this.alpha.setAttribute("aria-valuemin", "0");
        this.alpha.setAttribute("aria-valuemax", "100");
        this.panel.appendChild(this.alpha);
      }
      const row = document.createElement("div");
      row.className = "dv-color__row";
      this.hexInput = document.createElement("input");
      this.hexInput.className = "dv-input dv-mono";
      this.hexInput.spellcheck = false;
      this.hexInput.maxLength = 9;
      this.hexInput.setAttribute("aria-label", "Valor hexadecimal");
      row.appendChild(this.hexInput);
      if ("EyeDropper" in window) {
        const eye = document.createElement("button");
        eye.type = "button";
        eye.className = "dv-btn dv-btn--icon";
        eye.setAttribute("aria-label", "Cuentagotas");
        eye.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3z"/></svg>`;
        eye.addEventListener("click", async () => {
          try {
            const { sRGBHex } = await new window.EyeDropper().open();
            this.setHex(sRGBHex, true);
            this.paint();
          } catch (_) {}
        });
        row.appendChild(eye);
      }
      this.panel.appendChild(row);
      const swatches = (this.getAttribute("swatches") || DEFAULT_SWATCHES).split(",").map((s) => s.trim()).filter(Boolean);
      if (swatches.length && this.getAttribute("swatches") !== "") {
        const sw = document.createElement("div");
        sw.className = "dv-color__swatches";
        swatches.forEach((hex) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "dv-color__chip";
          b.style.setProperty("--c", hex);
          b.setAttribute("aria-label", hex);
          b.dataset.hex = hex;
          sw.appendChild(b);
        });
        sw.addEventListener("click", (e) => {
          const b = e.target.closest(".dv-color__chip");
          if (b && this.setHex(b.dataset.hex, true)) this.paint();
        });
        this.panel.appendChild(sw);
      }
      this.append(this.wrap, this.panel);

      this.drag(this.area, (x, y) => {
        this.s = x;
        this.v = 1 - y;
      });
      this.drag(this.hue, (x) => (this.h = x * 360));
      if (this.alpha) this.drag(this.alpha, (x) => (this.a = Math.round(x * 100) / 100));
      this.keys(this.area, (e) => {
        const d = e.shiftKey ? 0.1 : 0.01;
        if (e.key === "ArrowRight") this.s = clamp(this.s + d, 0, 1);
        else if (e.key === "ArrowLeft") this.s = clamp(this.s - d, 0, 1);
        else if (e.key === "ArrowUp") this.v = clamp(this.v + d, 0, 1);
        else if (e.key === "ArrowDown") this.v = clamp(this.v - d, 0, 1);
        else return false;
      });
      this.keys(this.hue, (e) => {
        const d = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") this.h = clamp(this.h + d, 0, 360);
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.h = clamp(this.h - d, 0, 360);
        else return false;
      });
      if (this.alpha) {
        this.keys(this.alpha, (e) => {
          const d = e.shiftKey ? 0.1 : 0.01;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") this.a = clamp(Math.round((this.a + d) * 100) / 100, 0, 1);
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.a = clamp(Math.round((this.a - d) * 100) / 100, 0, 1);
          else return false;
        });
      }
      const commitHex = () => {
        if (this.setHex(this.hexInput.value, true)) this.paint();
        else this.hexInput.value = this.value;
      };
      this.hexInput.addEventListener("change", commitHex);
      this.hexInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitHex();
        }
      });

      this.trigger.addEventListener("click", () => (this.isOpen ? this.close() : this.open()));
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
    }

    // Arrastre con puntero: fn recibe (x, y) normalizados 0..1
    drag(el, fn) {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        fn(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
        this.paint();
        this.sync(false, true);
      };
      el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        el.focus();
        el.setPointerCapture(e.pointerId);
        el._dragging = true;
        move(e);
      });
      el.addEventListener("pointermove", (e) => el._dragging && move(e));
      const end = () => {
        if (!el._dragging) return;
        el._dragging = false;
        this.sync(true);
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    }

    keys(el, fn) {
      el.addEventListener("keydown", (e) => {
        if (fn(e) === false) return;
        e.preventDefault();
        this.paint();
        this.sync(true);
      });
    }

    paint() {
      const [r, g, b] = hsv2rgb(this.h, this.s, this.v);
      const hue = `hsl(${this.h} 100% 50%)`;
      this.panel.style.setProperty("--hue", hue);
      this.panel.style.setProperty("--rgb", `${r} ${g} ${b}`);
      this.area.firstChild.style.left = `${this.s * 100}%`;
      this.area.firstChild.style.top = `${(1 - this.v) * 100}%`;
      this.area.setAttribute("aria-valuetext", `Saturación ${Math.round(this.s * 100)}%, brillo ${Math.round(this.v * 100)}%`);
      this.hue.firstChild.style.left = `${(this.h / 360) * 100}%`;
      this.hue.setAttribute("aria-valuenow", String(Math.round(this.h)));
      if (this.alpha) {
        this.alpha.firstChild.style.left = `${this.a * 100}%`;
        this.alpha.setAttribute("aria-valuenow", String(Math.round(this.a * 100)));
      }
      if (document.activeElement !== this.hexInput) this.hexInput.value = this.value;
    }

    sync(fire, live) {
      const hex = this.value;
      this.swatchEl.style.background = hex;
      this.valueEl.textContent = hex;
      if (document.activeElement !== this.hexInput && this.hexInput) this.hexInput.value = hex;
      this.syncDisabled();
      this.publish(hex, false, this.trigger);
      if (live) emit(this, "dv-input", { value: hex });
      else if (fire) emit(this, "dv-change", { value: hex });
    }

    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }

    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }

    open() {
      if (this.isDisabled || this.isOpen) return;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      this.paint();
      this.area.focus();
      emit(this, "dv-open", {});
    }

    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "dv-close", {});
    }
  }

  /**
   * <dv-password meter min-length="8" name="clave" placeholder="…" required>
   * Envuelve un <input> (o lo crea) con botón mostrar/ocultar y medidor de seguridad opcional.
   * Evento dv-change { value, score } con score de 0 a 4.
   */
  const PW_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  const PW_COLORS = ["var(--dv-danger)", "var(--dv-danger)", "var(--dv-warning)", "var(--dv-info)", "var(--dv-success)"];

  function passwordScore(v, min) {
    return [v.length >= min, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
  }

  class DvPassword extends DvElement {
    setup() {
      this.min = parseInt(this.getAttribute("min-length") || "8", 10);
      let input = this.querySelector("input");
      if (!input) {
        input = document.createElement("input");
        ["name", "placeholder", "required", "autocomplete", "id"].forEach((a) => {
          if (this.hasAttribute(a)) input.setAttribute(a, this.getAttribute(a));
        });
        if (!input.hasAttribute("autocomplete")) input.autocomplete = "new-password";
        if (this.getAttribute("label")) input.setAttribute("aria-label", this.getAttribute("label"));
      }
      this.input = input;
      input.type = "password";
      input.classList.add("dv-input");

      const group = document.createElement("div");
      group.className = "dv-input-group";
      this.toggle = document.createElement("button");
      this.toggle.type = "button";
      this.toggle.className = "dv-btn dv-btn--subtle dv-btn--sm";
      this.toggle.style.margin = "3px";
      this.toggle.setAttribute("aria-pressed", "false");
      this.paintToggle(false);
      this.toggle.addEventListener("click", () => {
        const show = this.input.type === "password";
        this.input.type = show ? "text" : "password";
        this.paintToggle(show);
        this.input.focus();
      });
      group.append(input, this.toggle);
      this.textContent = "";
      this.appendChild(group);

      if (this.hasAttribute("meter")) {
        const row = document.createElement("div");
        row.className = "dv-row dv-password__meter";
        row.style.setProperty("--gap", "8px");
        this.meter = document.createElement("div");
        this.meter.className = "dv-meter";
        this.meter.style.cssText = "flex:1;height:5px";
        for (let i = 0; i < 4; i++) {
          const seg = document.createElement("span");
          seg.style.setProperty("--w", "25%");
          this.meter.appendChild(seg);
        }
        this.meter.setAttribute("role", "meter");
        this.meter.setAttribute("aria-label", "Seguridad de la contraseña");
        this.meter.setAttribute("aria-valuemin", "0");
        this.meter.setAttribute("aria-valuemax", "4");
        this.labelEl = document.createElement("span");
        this.labelEl.className = "dv-hint";
        this.labelEl.setAttribute("aria-live", "polite");
        row.append(this.meter, this.labelEl);
        this.appendChild(row);
      }
      input.addEventListener("input", () => this.update(true));
      this.update(false);
    }

    paintToggle(shown) {
      this.toggle.textContent = shown ? this.getAttribute("hide-label") || "Ocultar" : this.getAttribute("show-label") || "Mostrar";
      this.toggle.setAttribute("aria-label", shown ? "Ocultar contraseña" : "Mostrar contraseña");
      this.toggle.setAttribute("aria-pressed", String(shown));
    }

    get value() {
      return this.input.value;
    }

    update(fire) {
      const v = this.input.value;
      const score = passwordScore(v, this.min);
      if (this.meter) {
        this.meter.querySelectorAll("span").forEach((seg, i) => seg.style.setProperty("--c", v && i < score ? PW_COLORS[score] : "transparent"));
        this.meter.setAttribute("aria-valuenow", String(v ? score : 0));
        this.labelEl.textContent = v ? PW_LABELS[score] : "";
      }
      if (fire) emit(this, "dv-change", { value: v, score });
    }
  }

  // ---- Mention ----------------------------------------------------------------
  const MIRROR_PROPS = ["direction", "boxSizing", "width", "overflowX", "overflowY", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "lineHeight", "fontFamily", "textAlign", "textTransform", "textIndent", "letterSpacing", "wordSpacing", "tabSize"];

  // Coordenadas (relativas al viewport) del cursor dentro de un textarea, con un espejo oculto
  function caretPoint(field) {
    const isInput = field.tagName === "INPUT";
    const cs = getComputedStyle(field);
    const mirror = document.createElement("div");
    MIRROR_PROPS.forEach((p) => (mirror.style[p] = cs[p]));
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = isInput ? "pre" : "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.top = "0";
    mirror.style.left = "-9999px";
    mirror.textContent = field.value.slice(0, field.selectionStart);
    const marker = document.createElement("span");
    marker.textContent = field.value.slice(field.selectionStart) || ".";
    mirror.appendChild(marker);
    document.body.appendChild(mirror);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    const rect = field.getBoundingClientRect();
    const point = {
      x: rect.left + marker.offsetLeft - field.scrollLeft + parseFloat(cs.borderLeftWidth) * 0,
      y: rect.top + marker.offsetTop - field.scrollTop + lh
    };
    mirror.remove();
    return point;
  }

  /**
   * <dv-mention trigger="@" max="6">
   *   <textarea class="dv-textarea" name="mensaje"></textarea>
   *   <option value="luis" data-hint="Diseño">Luis Islas</option>
   * </dv-mention>
   * Al escribir `@` (o el carácter de `trigger`) ofrece usuarios; inserta `@valor `.
   * Evento dv-mention { user, value }. `element.users = [{ value, label, hint }]` carga datos dinámicos.
   */
  class DvMention extends DvElement {
    setup() {
      this.field = this.querySelector("textarea, input");
      if (!this.field) return;
      this.trig = this.getAttribute("trigger") || "@";
      this.users = Array.from(this.querySelectorAll(":scope > option")).map((o) => ({
        value: o.getAttribute("value") || o.textContent.trim(),
        label: o.textContent.trim(),
        hint: o.dataset.hint || ""
      }));
      this.querySelectorAll(":scope > option").forEach((o) => o.remove());
      this.items = [];
      this.index = 0;
      this.range = null;

      const id = nextId("dv-mention");
      this.panel = document.createElement("div");
      this.panel.className = "dv-select__panel dv-mention__panel";
      this.panel.setAttribute("popover", "manual");
      this.listEl = document.createElement("div");
      this.listEl.className = "dv-select__list";
      this.listEl.id = id;
      this.listEl.setAttribute("role", "listbox");
      this.listEl.setAttribute("aria-label", this.getAttribute("label") || "Menciones");
      this.panel.appendChild(this.listEl);
      this.appendChild(this.panel);

      const f = this.field;
      f.setAttribute("role", "combobox");
      f.setAttribute("aria-autocomplete", "list");
      f.setAttribute("aria-expanded", "false");
      f.setAttribute("aria-controls", id);
      f.addEventListener("input", () => this.detect());
      f.addEventListener("click", () => this.detect());
      f.addEventListener("blur", () => setTimeout(() => !this.panel.contains(document.activeElement) && this.close(), 0));
      f.addEventListener("keydown", (e) => {
        if (!this.isOpen) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.index = (this.index + (e.key === "ArrowDown" ? 1 : -1) + this.items.length) % this.items.length;
          this.paint();
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          this.pick(this.items[this.index]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      });
      this.listEl.addEventListener("pointerdown", (e) => e.preventDefault());
      this.listEl.addEventListener("click", (e) => {
        const el = e.target.closest(".dv-select__option");
        if (el) this.pick(this.items[Number(el.dataset.i)]);
      });
      this.listEl.addEventListener("pointermove", (e) => {
        const el = e.target.closest(".dv-select__option");
        if (el && Number(el.dataset.i) !== this.index) {
          this.index = Number(el.dataset.i);
          this.paint();
        }
      });
    }

    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }

    // Busca "@consulta" justo antes del cursor
    detect() {
      const f = this.field;
      const before = f.value.slice(0, f.selectionStart);
      const esc = this.trig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = new RegExp(`(^|\\s)${esc}([\\p{L}\\p{N}_.\\-]*)$`, "u").exec(before);
      if (!m) {
        this.close();
        return;
      }
      const query = m[2];
      const q = normalize(query);
      const max = parseInt(this.getAttribute("max") || "6", 10);
      this.items = this.users.filter((u) => !q || normalize(`${u.value} ${u.label}`).includes(q)).slice(0, max);
      this.range = { start: f.selectionStart - query.length - this.trig.length, end: f.selectionStart };
      if (!this.items.length) {
        this.close();
        return;
      }
      this.index = Math.min(this.index, this.items.length - 1);
      this.render();
      if (!this.isOpen) this.panel.showPopover();
      this.place();
      f.setAttribute("aria-expanded", "true");
    }

    render() {
      this.listEl.textContent = "";
      this.items.forEach((u, i) => {
        const el = document.createElement("div");
        el.className = "dv-select__option";
        el.id = `${this.listEl.id}-${i}`;
        el.dataset.i = String(i);
        el.setAttribute("role", "option");
        const name = document.createElement("span");
        name.className = "dv-select__label";
        name.textContent = u.label;
        const handle = document.createElement("span");
        handle.className = "dv-select__hint";
        handle.textContent = `${this.trig}${u.value}`;
        el.append(name, handle);
        this.listEl.appendChild(el);
      });
      this.paint();
    }

    paint() {
      Array.from(this.listEl.children).forEach((el, i) => {
        el.classList.toggle("is-active", i === this.index);
        el.setAttribute("aria-selected", String(i === this.index));
        if (i === this.index) this.field.setAttribute("aria-activedescendant", el.id);
      });
    }

    place() {
      position(null, this.panel, { point: caretPoint(this.field), placement: "bottom-start", offset: 4 });
    }

    pick(user) {
      if (!user || !this.range) return;
      const f = this.field;
      const insert = `${this.trig}${user.value} `;
      f.value = f.value.slice(0, this.range.start) + insert + f.value.slice(this.range.end);
      const caret = this.range.start + insert.length;
      f.setSelectionRange(caret, caret);
      this.close();
      f.dispatchEvent(new Event("input", { bubbles: true }));
      f.focus();
      emit(this, "dv-mention", { user, value: insert.trim() });
    }

    close() {
      if (this.panel && this.isOpen) this.panel.hidePopover();
      if (this.field) {
        this.field.setAttribute("aria-expanded", "false");
        this.field.removeAttribute("aria-activedescendant");
      }
    }
  }

  /**
   * <dv-toggle-group type="single|multiple" value="negrita,cursiva" required>
   *   <button class="dv-toggle-group__item" value="negrita">B</button>
   * </dv-toggle-group>
   * Botones con aria-pressed. En `single` volver a pulsar deselecciona (salvo `required`).
   */
  class DvToggleGroup extends DvElement {
    setup() {
      this.multiple = this.getAttribute("type") === "multiple";
      this.items = Array.from(this.querySelectorAll(".dv-toggle-group__item"));
      this.setAttribute("role", "group");
      const initial = (this.getAttribute("value") || "").split(",").map((v) => v.trim()).filter(Boolean);
      this.values = this.multiple ? initial : initial.slice(0, 1);
      this.items.forEach((item) => {
        item.type = "button";
        item.addEventListener("click", () => this.toggle(item.value));
        item.addEventListener("keydown", (e) => {
          const next = moveFocus(this.items.filter((i) => !i.disabled), item, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
          }
        });
      });
      this.paint();
    }

    get value() {
      return this.multiple ? this.values.slice() : this.values[0] || "";
    }

    set value(v) {
      this.values = (Array.isArray(v) ? v : v ? [v] : []).map(String);
      this.paint();
    }

    toggle(value) {
      const on = this.values.includes(value);
      if (this.multiple) this.values = on ? this.values.filter((v) => v !== value) : this.values.concat(value);
      else if (on) {
        if (this.hasAttribute("required")) return;
        this.values = [];
      } else this.values = [value];
      this.paint();
      emit(this, "dv-change", { value: this.value });
    }

    paint() {
      const focusable = this.items.find((i) => this.values.includes(i.value) && !i.disabled) || this.items.find((i) => !i.disabled);
      this.items.forEach((i) => {
        i.setAttribute("aria-pressed", String(this.values.includes(i.value)));
        i.tabIndex = i === focusable ? 0 : -1;
      });
    }
  }

  // --------------------------------------------------------------------------
  // 18. Estructura: collapsible, scroll area y paneles redimensionables
  // --------------------------------------------------------------------------
  /**
   * <dv-collapsible open>
   *   <button data-dv-trigger>Detalles</button>
   *   <div class="dv-collapsible__content">…</div>
   * </dv-collapsible>
   */
  class DvCollapsible extends DvElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-dv-trigger]") || this.querySelector(":scope > button");
      this.content = this.querySelector(":scope > .dv-collapsible__content");
      if (!this.trigger || !this.content) return;
      // La altura se anima con grid (0fr → 1fr): el contenido va en un único hijo
      const inner = document.createElement("div");
      inner.className = "dv-collapsible__inner";
      inner.append(...this.content.childNodes);
      this.content.appendChild(inner);
      this.content.id = this.content.id || nextId("dv-collapsible");
      this.trigger.setAttribute("aria-controls", this.content.id);
      this.trigger.addEventListener("click", () => this.toggle());
      this.paint();
    }

    get isOpen() {
      return this.hasAttribute("open");
    }

    set isOpen(v) {
      this.toggleAttribute("open", Boolean(v));
      this.paint();
    }

    toggle(force) {
      const next = force === undefined ? !this.isOpen : Boolean(force);
      if (next === this.isOpen) return;
      this.isOpen = next;
      emit(this, "dv-toggle", { open: next });
    }

    open() {
      this.toggle(true);
    }

    close() {
      this.toggle(false);
    }

    paint() {
      if (!this.content) return;
      this.trigger.setAttribute("aria-expanded", String(this.isOpen));
      this.content.inert = !this.isOpen;
    }
  }

  /**
   * <dv-scroll-area orientation="vertical|horizontal|both" label="Registro" style="height:200px">
   * Zona con scrollbar discreta y degradado en los bordes que aún tienen contenido
   * (atributos data-top/bottom/left/right). El área es enfocable para desplazarla con teclado.
   */
  class DvScrollArea extends DvElement {
    setup() {
      this.viewport = document.createElement("div");
      this.viewport.className = "dv-scroll-area__viewport";
      this.viewport.tabIndex = 0;
      this.viewport.setAttribute("role", "region");
      this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Contenido desplazable");
      this.viewport.append(...this.childNodes);
      this.appendChild(this.viewport);
      const o = this.getAttribute("orientation") || "vertical";
      this.viewport.style.overflowX = o === "vertical" ? "hidden" : "auto";
      this.viewport.style.overflowY = o === "horizontal" ? "hidden" : "auto";
      const update = () => this.edges();
      this.viewport.addEventListener("scroll", update, { passive: true });
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(update);
        this.ro.observe(this.viewport);
        Array.from(this.viewport.children).forEach((c) => this.ro.observe(c));
      }
      this.edges();
    }

    disconnectedCallback() {
      if (this.ro) this.ro.disconnect();
    }

    edges() {
      const v = this.viewport;
      const set = (name, on) => (on ? this.setAttribute(name, "") : this.removeAttribute(name));
      set("data-top", v.scrollTop > 1);
      set("data-bottom", v.scrollTop + v.clientHeight < v.scrollHeight - 1);
      set("data-left", v.scrollLeft > 1);
      set("data-right", v.scrollLeft + v.clientWidth < v.scrollWidth - 1);
    }

    scrollTo(opts) {
      this.viewport.scrollTo(opts);
    }
  }

  /**
   * <dv-resizable direction="horizontal|vertical" storage-key="mi-layout" style="height:260px">
   *   <div class="dv-resizable__panel" data-size="30" data-min="15" data-max="60">…</div>
   *   <div class="dv-resizable__panel">…</div>
   * </dv-resizable>
   * Inserta separadores arrastrables entre paneles. Teclado: flechas (Shift ×5), Home/End; doble clic restablece.
   * Evento dv-resize { sizes } con porcentajes.
   */
  class DvResizable extends DvElement {
    setup() {
      this.vertical = this.getAttribute("direction") === "vertical";
      this.panels = Array.from(this.querySelectorAll(":scope > .dv-resizable__panel"));
      this.setAttribute("data-direction", this.vertical ? "vertical" : "horizontal");
      if (this.panels.length < 2) return;

      const declared = this.panels.map((p) => parseFloat(p.dataset.size));
      const fixed = declared.reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0);
      const free = declared.filter((n) => !Number.isFinite(n)).length;
      this.initial = declared.map((n) => (Number.isFinite(n) ? n : (100 - fixed) / free));
      this.sizes = this.initial.slice();
      const key = this.getAttribute("storage-key");
      if (key) {
        try {
          const saved = JSON.parse(storage.get(`dv-resizable:${key}`) || "null");
          if (Array.isArray(saved) && saved.length === this.panels.length) this.sizes = saved;
        } catch (_) {}
      }

      this.handles = [];
      this.panels.slice(0, -1).forEach((panel, i) => {
        const h = document.createElement("div");
        h.className = "dv-resizable__handle";
        h.tabIndex = 0;
        h.setAttribute("role", "separator");
        h.setAttribute("aria-orientation", this.vertical ? "horizontal" : "vertical");
        h.setAttribute("aria-label", this.getAttribute("handle-label") || "Cambiar tamaño");
        panel.after(h);
        this.handles.push(h);
        this.bindHandle(h, i);
      });
      this.apply();
    }

    min(i) {
      return parseFloat(this.panels[i].dataset.min || "10");
    }

    max(i) {
      return parseFloat(this.panels[i].dataset.max || "90");
    }

    // Mueve `delta` puntos porcentuales entre el panel i y el i+1, respetando mínimos y máximos
    resize(i, delta) {
      const a = this.sizes[i];
      const b = this.sizes[i + 1];
      const total = a + b;
      let next = clamp(a + delta, Math.max(this.min(i), total - this.max(i + 1)), Math.min(this.max(i), total - this.min(i + 1)));
      next = Math.round(next * 100) / 100;
      if (next === a) return false;
      this.sizes[i] = next;
      this.sizes[i + 1] = Math.round((total - next) * 100) / 100;
      this.apply();
      return true;
    }

    bindHandle(h, i) {
      let start = null;
      h.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        const r = this.getBoundingClientRect();
        const handlesPx = this.handles.reduce((s, x) => s + (this.vertical ? x.offsetHeight : x.offsetWidth), 0);
        start = { pos: this.vertical ? e.clientY : e.clientX, size: this.sizes[i], avail: (this.vertical ? r.height : r.width) - handlesPx };
        this.classList.add("is-resizing");
      });
      h.addEventListener("pointermove", (e) => {
        if (!start) return;
        const dx = (this.vertical ? e.clientY : e.clientX) - start.pos;
        const total = this.sizes[i] + this.sizes[i + 1];
        const target = start.size + (dx / start.avail) * 100;
        this.resize(i, target - this.sizes[i]);
        void total;
      });
      const end = () => {
        if (!start) return;
        start = null;
        this.classList.remove("is-resizing");
        this.save();
      };
      h.addEventListener("pointerup", end);
      h.addEventListener("pointercancel", end);
      h.addEventListener("dblclick", () => {
        const total = this.sizes[i] + this.sizes[i + 1];
        const ratio = this.initial[i] / (this.initial[i] + this.initial[i + 1]);
        this.resize(i, total * ratio - this.sizes[i]);
        this.save();
      });
      h.addEventListener("keydown", (e) => {
        const prev = this.vertical ? "ArrowUp" : "ArrowLeft";
        const next = this.vertical ? "ArrowDown" : "ArrowRight";
        const step = e.shiftKey ? 10 : 2;
        let moved = null;
        if (e.key === prev) moved = this.resize(i, -step);
        else if (e.key === next) moved = this.resize(i, step);
        else if (e.key === "Home") moved = this.resize(i, -100);
        else if (e.key === "End") moved = this.resize(i, 100);
        else return;
        e.preventDefault();
        if (moved) this.save();
      });
    }

    apply() {
      this.panels.forEach((p, i) => {
        p.style.flex = `${this.sizes[i]} 1 0%`;
      });
      this.handles.forEach((h, i) => {
        h.setAttribute("aria-valuenow", String(Math.round(this.sizes[i])));
        h.setAttribute("aria-valuemin", String(this.min(i)));
        h.setAttribute("aria-valuemax", String(this.max(i)));
        h.setAttribute("aria-controls", this.panels[i].id || (this.panels[i].id = nextId("dv-panel")));
      });
      emit(this, "dv-resize", { sizes: this.sizes.slice() });
    }

    save() {
      const key = this.getAttribute("storage-key");
      if (key) storage.set(`dv-resizable:${key}`, JSON.stringify(this.sizes));
    }
  }

  /**
   * Autoajuste y contador de <textarea> (se activan con atributos, sin elemento propio):
   *   <textarea class="dv-textarea" data-dv-autosize data-max-rows="8" data-dv-count="#cuenta" maxlength="200">
   */
  function autosize(ta) {
    const cs = getComputedStyle(ta);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const maxRows = parseInt(ta.dataset.maxRows || "0", 10);
    ta.style.height = "auto";
    const full = ta.scrollHeight + border;
    const cap = maxRows ? lh * maxRows + pad + border : Infinity;
    ta.style.height = `${Math.min(full, cap)}px`;
    ta.style.overflowY = full > cap ? "auto" : "hidden";
  }

  function countText(ta) {
    const out = ta.dataset.dvCount && document.querySelector(ta.dataset.dvCount);
    if (!out) return;
    const max = ta.maxLength > 0 ? ta.maxLength : 0;
    out.textContent = max ? `${ta.value.length} / ${max}` : String(ta.value.length);
    out.classList.toggle("is-over", Boolean(max) && ta.value.length >= max);
  }

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLTextAreaElement)) return;
    if (t.hasAttribute("data-dv-autosize")) autosize(t);
    if (t.dataset.dvCount) countText(t);
  });

  define("dv-tabs", DvTabs);
  define("dv-segmented", DvSegmented);
  define("dv-menu", DvMenu);
  define("dv-command", DvCommand);
  define("dv-otp", DvOtp);
  define("dv-tags", DvTags);
  define("dv-dropzone", DvDropzone);
  define("dv-calendar", DvCalendar);
  define("dv-sparkline", DvSparkline);
  define("dv-popover", DvPopover);
  define("dv-hovercard", DvHoverCard);
  define("dv-context-menu", DvContextMenu);
  define("dv-select", DvSelect);
  define("dv-combobox", DvCombobox);
  define("dv-date-picker", DvDatePicker);
  define("dv-time-picker", DvTimePicker);
  define("dv-slider", DvSlider);
  define("dv-rating", DvRating);
  define("dv-color-picker", DvColorPicker);
  define("dv-password", DvPassword);
  define("dv-mention", DvMention);
  define("dv-toggle-group", DvToggleGroup);
  define("dv-collapsible", DvCollapsible);
  define("dv-scroll-area", DvScrollArea);
  define("dv-resizable", DvResizable);
  define("dv-menubar", DvBar);
  define("dv-nav-menu", class extends DvBar {});

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }

  window.DevlUI = { version: VERSION, toast, copy, confirm: confirmDialog, position, setTheme, getTheme, init };
})();
