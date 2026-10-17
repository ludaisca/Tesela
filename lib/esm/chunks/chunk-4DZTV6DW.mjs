/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  isOpenPopover,
  position
} from "./chunk-EWFNMPDO.mjs";
import {
  TslElement,
  define,
  emit,
  moveFocus,
  nextId
} from "./chunk-ZOAS4LFV.mjs";

// src/components/context-menu.js
var TslContextMenu = class extends TslElement {
  setup() {
    this.list = this.querySelector(":scope > .tsl-menu__list");
    if (!this.list) return;
    this.list.id = this.list.id || nextId("tsl-ctx");
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
    this.addEventListener("keydown", (e) => {
      if (this.list.contains(e.target)) return;
      if (e.key === "ContextMenu" || e.shiftKey && e.key === "F10") {
        e.preventDefault();
        const r = (e.target instanceof Element ? e.target : this).getBoundingClientRect();
        this.openAt(r.left + r.width / 2, r.top + r.height / 2);
      }
    });
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
      const item = e.target.closest(".tsl-menu__item");
      if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
      emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
      this.close(true);
    });
    this.outside = (e) => {
      if (!this.list.contains(e.target)) this.close();
    };
    this.dismiss = () => this.close();
  }
  items() {
    return Array.from(this.list.querySelectorAll(".tsl-menu__item:not([disabled])"));
  }
  openAt(x, y) {
    this.close();
    this.returnTo = document.activeElement;
    this.list.showPopover();
    position(null, this.list, { point: { x, y }, placement: "bottom-start", offset: 2 });
    const first = this.items()[0];
    if (first) first.focus();
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
};
define("tsl-context-menu", TslContextMenu);

export {
  TslContextMenu
};
