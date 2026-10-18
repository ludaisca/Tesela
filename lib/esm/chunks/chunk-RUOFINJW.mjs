/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  FOCUSABLE,
  position
} from "./chunk-5JUXMGRM.mjs";
import {
  TslElement,
  define,
  emit,
  isRtl,
  moveFocus,
  nextId
} from "./chunk-O4IHLMQS.mjs";

// src/components/bar.js
var TslBar = class extends TslElement {
  get isMenubar() {
    return this.localName === "tsl-menubar";
  }
  setup() {
    this.setAttribute("role", this.isMenubar ? "menubar" : "navigation");
    this.entries = Array.from(this.querySelectorAll(":scope > .tsl-bar__item")).map((root) => {
      const isLink = root.tagName === "A";
      const trigger = isLink ? root : root.querySelector(":scope > [data-tsl-trigger]") || root.querySelector(":scope > button");
      const panel = isLink ? null : root.querySelector(":scope > .tsl-menu__list, :scope > .tsl-bar__panel");
      return { root, trigger, panel };
    }).filter((e) => e.trigger);
    this.current = null;
    this.stops = this.entries.map((e) => e.trigger);
    this.entries.forEach((entry) => {
      const { trigger, panel } = entry;
      if (this.isMenubar) trigger.setAttribute("role", "menuitem");
      if (!panel) return;
      panel.id = panel.id || nextId("tsl-bar-panel");
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
      this.stops.forEach((s, i) => s.tabIndex = i === 0 ? 0 : -1);
      this.addEventListener("focusin", (e) => {
        const idx = this.stops.indexOf(e.target);
        if (idx !== -1) this.stops.forEach((s, i) => s.tabIndex = i === idx ? 0 : -1);
      });
    }
    this.addEventListener("keydown", (e) => this.onKey(e));
    this.addEventListener("click", (e) => this.onItemClick(e));
  }
  // Roles y submenús de una lista de menú
  prepareList(list) {
    if (!this.isMenubar) return;
    list.querySelectorAll(":scope > .tsl-menu__item, :scope > .tsl-menu__sub > .tsl-menu__item").forEach((item) => {
      item.tabIndex = -1;
      item.setAttribute("role", item.hasAttribute("data-check") ? "menuitemcheckbox" : "menuitem");
    });
    list.querySelectorAll(":scope > .tsl-menu__sub").forEach((sub) => {
      const parent = sub.querySelector(":scope > .tsl-menu__item");
      const child = sub.querySelector(":scope > .tsl-menu__list");
      if (!parent || !child) return;
      child.id = child.id || nextId("tsl-bar-sub");
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
    return Array.from(list.querySelectorAll(":scope > .tsl-menu__item:not([disabled]), :scope > .tsl-menu__sub > .tsl-menu__item:not([disabled])"));
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
      emit(this, "tsl-open", { item: entry.trigger.textContent.trim() });
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
    const parent = sub.querySelector(":scope > .tsl-menu__item");
    const child = sub.querySelector(":scope > .tsl-menu__list");
    if (!child || child.matches(":popover-open")) return;
    sub.parentElement.querySelectorAll(":scope > .tsl-menu__sub").forEach((s) => s !== sub && this.closeSub(s));
    child.showPopover();
    position(parent, child, { placement: "right-start", offset: 2 });
    parent.setAttribute("aria-expanded", "true");
  }
  closeSub(sub) {
    const parent = sub.querySelector(":scope > .tsl-menu__item");
    const child = sub.querySelector(":scope > .tsl-menu__list");
    if (!child || !child.matches(":popover-open")) return;
    child.querySelectorAll(":scope > .tsl-menu__sub").forEach((s) => this.closeSub(s));
    child.hidePopover();
    parent.setAttribute("aria-expanded", "false");
  }
  closeAll(returnFocus) {
    const entry = this.current;
    if (!entry) return;
    clearTimeout(this.hoverTimer);
    entry.panel.querySelectorAll(".tsl-menu__sub").forEach((s) => this.closeSub(s));
    if (entry.panel.matches(":popover-open")) entry.panel.hidePopover();
    entry.trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", this.outside, true);
    window.removeEventListener("scroll", this.reposition, true);
    window.removeEventListener("resize", this.reposition);
    this.current = null;
    if (returnFocus) entry.trigger.focus();
    emit(this, "tsl-close", {});
  }
  // ---- Teclado --------------------------------------------------------------
  onKey(e) {
    const t = e.target;
    const k = e.key;
    const rtl = isRtl(this);
    const fwdKey = rtl ? "ArrowLeft" : "ArrowRight";
    const backKey = rtl ? "ArrowRight" : "ArrowLeft";
    const stopIdx = this.stops.indexOf(t);
    if (stopIdx !== -1) {
      const entry = this.entries[stopIdx];
      if (k === fwdKey || k === backKey) {
        e.preventDefault();
        const next = this.entries[(stopIdx + (k === fwdKey ? 1 : -1) + this.entries.length) % this.entries.length];
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
      const list2 = t.closest(".tsl-menu__list");
      const sub = list2 && list2.parentElement.classList.contains("tsl-menu__sub") ? list2.parentElement : null;
      if (sub && this.isMenubar) {
        this.closeSub(sub);
        sub.querySelector(":scope > .tsl-menu__item").focus();
      } else this.closeAll(true);
      return;
    }
    if (k === "Tab") {
      this.closeAll(false);
      return;
    }
    if (!this.isMenubar) return;
    const list = t.closest(".tsl-menu__list");
    const items = this.itemsOf(list);
    const isSubParent = t.hasAttribute("data-submenu");
    if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
      const next = moveFocus(items, t, k);
      if (next) {
        e.preventDefault();
        next.focus();
      }
    } else if (k === fwdKey && isSubParent) {
      e.preventDefault();
      const sub = t.parentElement;
      this.openSub(sub);
      this.focusIn(sub.querySelector(":scope > .tsl-menu__list"), "first");
    } else if (k === backKey && list.parentElement.classList.contains("tsl-menu__sub")) {
      e.preventDefault();
      const sub = list.parentElement;
      this.closeSub(sub);
      sub.querySelector(":scope > .tsl-menu__item").focus();
    } else if (k === fwdKey || k === backKey) {
      e.preventDefault();
      const i = this.entries.indexOf(this.current);
      const next = this.entries[(i + (k === fwdKey ? 1 : -1) + this.entries.length) % this.entries.length];
      next.trigger.focus();
      if (next.panel) this.open(next, "first");
    } else if (k === "Enter" || k === " ") {
      if (isSubParent) {
        e.preventDefault();
        const sub = t.parentElement;
        this.openSub(sub);
        this.focusIn(sub.querySelector(":scope > .tsl-menu__list"), "first");
      }
    }
  }
  onItemClick(e) {
    const item = e.target.closest(".tsl-menu__item");
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
      emit(this, "tsl-select", detail);
      this.closeAll(true);
    } else if (!this.isMenubar && this.current && this.current.panel.contains(e.target) && e.target.closest("a[href], button")) {
      emit(this, "tsl-select", { value: e.target.closest("a, button").textContent.trim() });
      this.closeAll(false);
    }
  }
};
var TslMenubar = class extends TslBar {
};
var TslNavMenu = class extends TslBar {
};
define("tsl-menubar", TslMenubar);
define("tsl-nav-menu", TslNavMenu);

export {
  TslBar,
  TslMenubar,
  TslNavMenu
};
