/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslFormElement
} from "./chunk-APNO5X2D.mjs";
import {
  define,
  emit
} from "./chunk-O4IHLMQS.mjs";

// src/components/radio-group.js
var TslRadioGroup = class extends TslFormElement {
  setup() {
    this.setAttribute("role", "radiogroup");
    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) this.setAttribute("aria-label", this.getAttribute("label") || "Opciones");
    this.items = Array.from(this.querySelectorAll(".tsl-radio"));
    this.initial = this.getAttribute("value") || "";
    this.items.forEach((item) => {
      item.type = "button";
      item.setAttribute("role", "radio");
      const mark = document.createElement("span");
      mark.className = "tsl-radio__mark";
      mark.setAttribute("aria-hidden", "true");
      item.prepend(mark);
      item.addEventListener("click", () => this.choose(item.value, true));
      item.addEventListener("keydown", (e) => this.onKey(e, item));
    });
    this.addEventListener("invalid", () => this.toggleAttribute("data-invalid", true));
    this.choose(this.initial, false);
    this.syncDisabled();
  }
  get orientation() {
    return this.getAttribute("orientation") === "horizontal" ? "horizontal" : "vertical";
  }
  get value() {
    return this.val || "";
  }
  set value(v) {
    this.choose(String(v ?? ""), false);
  }
  enabledItems() {
    return this.items.filter((i) => !i.disabled && !this.isDisabled);
  }
  onKey(e, item) {
    const rtl = getComputedStyle(this).direction === "rtl";
    const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"];
    const fwd = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    const list = this.enabledItems();
    if (!list.length) return;
    const at = list.indexOf(item);
    let next = null;
    if (fwd.includes(e.key)) next = list[(at + 1) % list.length];
    else if (back.includes(e.key)) next = list[(at - 1 + list.length) % list.length];
    else if (e.key === "Home") next = list[0];
    else if (e.key === "End") next = list[list.length - 1];
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.choose(item.value, true);
      return;
    }
    if (!next) return;
    e.preventDefault();
    next.focus();
    this.choose(next.value, true);
  }
  choose(value, fire) {
    if (this.isDisabled) return;
    const target = this.items.find((i) => i.value === value && !i.disabled);
    if (value && !target) return;
    const changed = (target ? target.value : "") !== this.value;
    this.val = target ? target.value : "";
    if (this.val) this.removeAttribute("data-invalid");
    this.paint();
    if (fire && changed) emit(this, "tsl-change", { value: this.val });
  }
  paint() {
    const list = this.enabledItems();
    const stop = this.items.find((i) => i.value === this.val && !i.disabled) || list[0];
    this.items.forEach((i) => {
      const on = Boolean(this.val) && i.value === this.val;
      i.setAttribute("aria-checked", String(on));
      i.tabIndex = i === stop ? 0 : -1;
    });
    this.setAttribute("aria-orientation", this.orientation);
    this.publish(this.val || null, !this.val, this.items[0]);
  }
  syncDisabled() {
    this.toggleAttribute("aria-disabled", this.isDisabled);
    this.items.forEach((i) => {
      i.inert = this.isDisabled;
    });
    if (this._tslReady) this.paint();
  }
  reset() {
    this.val = "";
    this.choose(this.initial, false);
  }
};
define("tsl-radio-group", TslRadioGroup);

export {
  TslRadioGroup
};
