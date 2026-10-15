// ============================================================================
// devl-ui — Zero-dependency component library (behaviour layer)
// Custom Elements (light DOM, styled by devl-ui.css) + data-attribute helpers.
// Exposes window.DevlUI = { toast, copy, setTheme, getTheme, init, version }.
// All custom events are prefixed `dv-` and bubble.
// ============================================================================

(function () {
  "use strict";

  const VERSION = "1.0.0";
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
      region.setAttribute("aria-label", "Notifications");
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
    close.setAttribute("aria-label", "Dismiss");
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
      this.dialog.setAttribute("aria-label", this.getAttribute("label") || "Command palette");
      this.dialog.innerHTML = `
        <div class="dv-command__search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="dv-command__input" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" />
          <kbd class="dv-kbd">ESC</kbd>
        </div>
        <div class="dv-command__list" role="listbox"></div>
        <div class="dv-command__empty" hidden></div>
        <div class="dv-command__footer"><span>↑ ↓ navigate · ↵ select</span><span></span></div>`;

      this.input = this.dialog.querySelector(".dv-command__input");
      this.listEl = this.dialog.querySelector(".dv-command__list");
      this.emptyEl = this.dialog.querySelector(".dv-command__empty");
      this.input.placeholder = this.getAttribute("placeholder") || "Type a command or search…";
      this.emptyEl.textContent = this.getAttribute("empty") || "No results found.";
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
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Verification code");

      this.cells = Array.from({ length }, (_, i) => {
        const cell = document.createElement("input");
        cell.className = "dv-otp__cell";
        cell.maxLength = 1;
        cell.autocomplete = i === 0 ? "one-time-code" : "off";
        cell.inputMode = numeric ? "numeric" : "text";
        cell.setAttribute("aria-label", `Character ${i + 1} of ${length}`);
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
      this.input.placeholder = this.getAttribute("placeholder") || "Add…";
      this.input.setAttribute("aria-label", this.getAttribute("label") || "Add tag");
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
      rm.setAttribute("aria-label", `Remove ${tag}`);
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
  // 11. <dv-calendar value="2026-10-14" locale="es" week-start="1">
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
      this.selected = fromISO(this.getAttribute("value"));
      const base = this.selected || new Date();
      this.view = new Date(base.getFullYear(), base.getMonth(), 1);
      this.focusDate = new Date(base);
      this.render(false);

      this.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-cal-nav]");
        if (nav) {
          this.shift(parseInt(nav.dataset.calNav, 10));
          return;
        }
        const day = e.target.closest(".dv-cal__day");
        if (day) this.pick(fromISO(day.dataset.date));
      });
      this.addEventListener("keydown", (e) => {
        if (!e.target.classList.contains("dv-cal__day")) return;
        const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (steps[e.key] === undefined) return;
        e.preventDefault();
        const d = fromISO(e.target.dataset.date);
        d.setDate(d.getDate() + steps[e.key]);
        this.focusDate = d;
        this.view = new Date(d.getFullYear(), d.getMonth(), 1);
        this.render(true);
      });
    }

    get value() {
      return this.selected ? toISO(this.selected) : "";
    }

    set value(v) {
      this.selected = fromISO(v);
      if (this.selected) this.view = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
      if (this._dvReady) this.render(false);
    }

    shift(months) {
      this.view = new Date(this.view.getFullYear(), this.view.getMonth() + months, 1);
      this.focusDate = new Date(this.view);
      this.render(false);
    }

    pick(date) {
      this.selected = date;
      this.focusDate = date;
      if (date.getMonth() !== this.view.getMonth()) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
      this.render(true);
      emit(this, "dv-change", { value: toISO(date), date });
    }

    render(keepFocus) {
      const y = this.view.getFullYear();
      const m = this.view.getMonth();
      const title = new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(this.view);
      const dowFmt = new Intl.DateTimeFormat(this.locale, { weekday: "narrow" });
      const todayISO = toISO(new Date());
      const selISO = this.value;
      const focusISO = toISO(this.focusDate);

      const offset = (new Date(y, m, 1).getDay() - this.weekStart + 7) % 7;
      const start = new Date(y, m, 1 - offset);

      let dows = "";
      for (let i = 0; i < 7; i++) {
        // 2023-01-01 was a Sunday
        dows += `<span class="dv-cal__dow">${dowFmt.format(new Date(2023, 0, 1 + ((this.weekStart + i) % 7)))}</span>`;
      }

      let cells = "";
      const fullFmt = new Intl.DateTimeFormat(this.locale, { dateStyle: "full" });
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const iso = toISO(d);
        const cls = ["dv-cal__day", d.getMonth() !== m ? "is-outside" : "", iso === todayISO ? "is-today" : ""].join(" ");
        cells += `<button type="button" class="${cls}" data-date="${iso}" aria-label="${fullFmt.format(d)}" aria-pressed="${iso === selISO}" tabindex="${iso === focusISO ? 0 : -1}">${d.getDate()}</button>`;
      }

      this.innerHTML = `
        <div class="dv-cal__head">
          <button type="button" class="dv-btn dv-btn--subtle dv-btn--sm dv-btn--icon" data-cal-nav="-1" aria-label="Previous month">‹</button>
          <span aria-live="polite">${title}</span>
          <button type="button" class="dv-btn dv-btn--subtle dv-btn--sm dv-btn--icon" data-cal-nav="1" aria-label="Next month">›</button>
        </div>
        <div class="dv-cal__grid">${dows}${cells}</div>`;

      if (keepFocus) {
        const target = this.querySelector(`[data-date="${focusISO}"]`);
        if (target) target.focus();
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
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", `Trend: ${values.join(", ")}`);
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
          copyBtn.textContent = ok ? "Copied" : "Failed";
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
    root.querySelectorAll("table[data-dv-sortable] th[data-sort]").forEach((th) => {
      if (!th.hasAttribute("tabindex")) th.tabIndex = 0;
    });
  }

  define("dv-tabs", DvTabs);
  define("dv-segmented", DvSegmented);
  define("dv-menu", DvMenu);
  define("dv-command", DvCommand);
  define("dv-otp", DvOtp);
  define("dv-tags", DvTags);
  define("dv-dropzone", DvDropzone);
  define("dv-calendar", DvCalendar);
  define("dv-sparkline", DvSparkline);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }

  window.DevlUI = { version: VERSION, toast, copy, setTheme, getTheme, init };
})();
