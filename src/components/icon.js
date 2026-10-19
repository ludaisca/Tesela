import { define, emit } from "../core/base.js";
import { getIcon, iconFromUrl, iconSync, onLibraryChange } from "../core/icons.js";

/**
 * <tsl-icon name="search"></tsl-icon>
 * <tsl-icon name="rocket" library="tabler" label="Lanzamiento"></tsl-icon>
 * <tsl-icon src="/iconos/marca.svg"></tsl-icon>
 * Icono SVG en línea que hereda el color (currentColor) y mide 1em (cambia con font-size o
 * --tsl-icon-size). Sin `label` es decorativo (aria-hidden); con `label` se anuncia como imagen.
 * Los iconos del set base se pintan al instante; los de otras bibliotecas se piden una vez y se
 * guardan en caché. Emite tsl-load al pintarse y tsl-error si el icono no existe.
 */
export class TslIcon extends HTMLElement {
  static get observedAttributes() {
    return ["name", "library", "src", "label"];
  }

  // Atributos que solo lee el CSS (02b-iconos.css); se declaran para la documentación y el autocompletado
  static get styleAttributes() {
    return ["size", "spin", "flip-rtl"];
  }

  connectedCallback() {
    this.render();
    // Si se registra la biblioteca después de crear el icono, se vuelve a pintar
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
    this.replaceChildren(...(svg ? [svg] : []));
    this.toggleAttribute("data-missing", !svg);
    emit(this, svg ? "tsl-load" : "tsl-error", { name: this.name, library: this.library });
  }

  async render() {
    this.syncLabel();
    const src = this.getAttribute("src");
    const name = this.name;
    const library = this.library;
    const token = (this.token = {});
    if (!src && !name) return this.replaceChildren();
    if (!src) {
      const sync = iconSync(name, library);
      if (sync) return this.paint(sync);
    }
    const svg = src ? await iconFromUrl(src) : await getIcon(name, library);
    // Si cambió el nombre mientras se esperaba la red, gana la petición más reciente
    if (token === this.token && this.isConnected) this.paint(svg);
  }
}

define("tsl-icon", TslIcon);
