/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  define,
  emit,
  moveFocus
} from "./chunk-KUBYC2WE.mjs";

// src/components/segmented.js
var TslSegmented = class extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "value"];
  }
  setup() {
    this.classList.add("tsl-segmented");
    this.setAttribute("role", "radiogroup");
    this.items = Array.from(this.querySelectorAll(".tsl-segmented__item"));
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
    this.select(this.getAttribute("value") || this.items[0] && this.items[0].value, false);
  }
  attributeChanged(name, before, after) {
    if (after !== null) this.select(after, false);
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
    if (fire) emit(this, "tsl-change", { value });
  }
};
define("tsl-segmented", TslSegmented);

export {
  TslSegmented
};
