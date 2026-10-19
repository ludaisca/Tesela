/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  getIcon,
  iconFromUrl,
  iconSync,
  onLibraryChange
} from "./chunk-VKGZI2YC.mjs";
import {
  define,
  emit
} from "./chunk-LW5JCRG7.mjs";

// src/components/icon.js
var TslIcon = class extends HTMLElement {
  static get observedAttributes() {
    return ["name", "library", "src", "label"];
  }
  // Atributos que solo lee el CSS (02b-iconos.css); se declaran para la documentación y el autocompletado
  static get styleAttributes() {
    return ["size", "spin", "flip-rtl"];
  }
  connectedCallback() {
    this.render();
    this.off = onLibraryChange((lib) => {
      if (lib === (this.getAttribute("library") || "tesela") && !this.hasAttribute("src")) this.render();
    });
  }
  disconnectedCallback() {
    if (this.off) this.off();
  }
  attributeChangedCallback(attr, before, after) {
    if (before === after || !this.isConnected) return;
    if (attr === "label") this.syncLabel();
    else this.render();
  }
  get name() {
    return this.getAttribute("name") || "";
  }
  set name(v) {
    this.setAttribute("name", v);
  }
  get library() {
    return this.getAttribute("library") || "tesela";
  }
  set library(v) {
    this.setAttribute("library", v);
  }
  get label() {
    return this.getAttribute("label") || "";
  }
  set label(v) {
    if (v) this.setAttribute("label", v);
    else this.removeAttribute("label");
  }
  syncLabel() {
    const label = this.getAttribute("label");
    if (label) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }
  paint(svg) {
    this.replaceChildren(...svg ? [svg] : []);
    this.toggleAttribute("data-missing", !svg);
    emit(this, svg ? "tsl-load" : "tsl-error", { name: this.name, library: this.library });
  }
  async render() {
    this.syncLabel();
    const src = this.getAttribute("src");
    const name = this.name;
    const library = this.library;
    const token = this.token = {};
    if (!src && !name) return this.replaceChildren();
    if (!src) {
      const sync = iconSync(name, library);
      if (sync) return this.paint(sync);
    }
    const svg = src ? await iconFromUrl(src) : await getIcon(name, library);
    if (token === this.token && this.isConnected) this.paint(svg);
  }
};
define("tsl-icon", TslIcon);

export {
  TslIcon
};
