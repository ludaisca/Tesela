/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  define,
  emit,
  moveFocus,
  nextId
} from "./chunk-KUBYC2WE.mjs";

// src/components/tabs.js
var TslTabs = class extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "value"];
  }
  setup() {
    this.tabs = Array.from(this.querySelectorAll(":scope > .tsl-tabs__list > .tsl-tabs__tab"));
    this.panels = Array.from(this.querySelectorAll(":scope > .tsl-tabs__panel"));
    const list = this.querySelector(":scope > .tsl-tabs__list");
    if (list) list.setAttribute("role", "tablist");
    this.tabs.forEach((tab) => {
      const key = tab.dataset.tab;
      const panel = this.panels.find((p) => p.dataset.panel === key);
      tab.id = tab.id || nextId("tsl-tab");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      if (panel) {
        panel.id = panel.id || nextId("tsl-panel");
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
    const initial = this.getAttribute("value") || this.tabs[0] && this.tabs[0].dataset.tab;
    this.select(initial, false);
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
  select(key, fire) {
    if (!this.tabs.some((t) => t.dataset.tab === key)) return;
    this._value = key;
    this.tabs.forEach((t) => {
      const on = t.dataset.tab === key;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    this.panels.forEach((p) => p.hidden = p.dataset.panel !== key);
    if (fire) emit(this, "tsl-change", { value: key });
  }
};
define("tsl-tabs", TslTabs);

export {
  TslTabs
};
