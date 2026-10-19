/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  define,
  emit,
  moveFocus,
  nextId
} from "./chunk-LW5JCRG7.mjs";

// src/components/menu.js
var openMenus = /* @__PURE__ */ new Set();
var TslMenu = class extends TslElement {
  setup() {
    this.trigger = this.querySelector("[data-tsl-trigger]") || this.querySelector("button");
    this.list = this.querySelector(".tsl-menu__list");
    if (!this.trigger || !this.list) return;
    this.list.id = this.list.id || nextId("tsl-menu");
    this.list.setAttribute("role", "menu");
    this.list.hidden = true;
    this.trigger.setAttribute("aria-haspopup", "menu");
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.setAttribute("aria-controls", this.list.id);
    this.items().forEach((item) => {
      item.setAttribute("role", "menuitem");
      item.tabIndex = -1;
    });
    this.trigger.addEventListener("click", () => this.list.hidden ? this.open() : this.close());
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
      const item = e.target.closest(".tsl-menu__item");
      if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
      emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
      this.close(true);
    });
  }
  items() {
    return Array.from(this.list.querySelectorAll(".tsl-menu__item:not([disabled])"));
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
};
document.addEventListener("pointerdown", (e) => {
  openMenus.forEach((menu) => {
    if (!menu.contains(e.target)) menu.close();
  });
});
define("tsl-menu", TslMenu);

export {
  TslMenu
};
