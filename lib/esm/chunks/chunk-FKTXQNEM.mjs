/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit,
  nextId
} from "./chunk-O4IHLMQS.mjs";

// src/components/collapsible.js
var TslCollapsible = class extends TslElement {
  setup() {
    this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > button");
    this.content = this.querySelector(":scope > .tsl-collapsible__content");
    if (!this.trigger || !this.content) return;
    const inner = document.createElement("div");
    inner.className = "tsl-collapsible__inner";
    inner.append(...this.content.childNodes);
    this.content.appendChild(inner);
    this.content.id = this.content.id || nextId("tsl-collapsible");
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
    const next = force === void 0 ? !this.isOpen : Boolean(force);
    if (next === this.isOpen) return;
    this.isOpen = next;
    emit(this, "tsl-toggle", { open: next });
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
};
define("tsl-collapsible", TslCollapsible);

export {
  TslCollapsible
};
