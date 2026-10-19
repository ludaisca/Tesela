import { TslElement, define } from "../core/base.js";

/**
 * <tsl-scroll-area orientation="vertical|horizontal|both" label="Registro" style="height:200px">
 * Zona con scrollbar discreta y degradado en los bordes que aún tienen contenido
 * (atributos data-top/bottom/left/right). El área es enfocable para desplazarla con teclado.
 */
export class TslScrollArea extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  attributeChanged() {
    if (this.viewport) this.paintLabels();
  }

  paintLabels() {
    this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Contenido desplazable");
  }

  setup() {
    this.viewport = document.createElement("div");
    this.viewport.className = "tsl-scroll-area__viewport";
    this.viewport.tabIndex = 0;
    this.viewport.setAttribute("role", "region");
    this.paintLabels();
    this.viewport.append(...this.childNodes);
    this.appendChild(this.viewport);
    const o = this.getAttribute("orientation") || "vertical";
    this.viewport.style.overflowX = o === "vertical" ? "hidden" : "auto";
    this.viewport.style.overflowY = o === "horizontal" ? "hidden" : "auto";
    const update = () => this.edges();
    this.viewport.addEventListener("scroll", update, { passive: true });
    if ("ResizeObserver" in window) {
      this.ro = new ResizeObserver(update);
      this.ro.observe(this.viewport);
      Array.from(this.viewport.children).forEach((c) => this.ro.observe(c));
    }
    this.edges();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ro) this.ro.disconnect();
  }

  reconnected() {
    if (!this.ro) return;
    this.ro.observe(this.viewport);
    Array.from(this.viewport.children).forEach((c) => this.ro.observe(c));
    this.edges();
  }

  edges() {
    const v = this.viewport;
    const set = (name, on) => (on ? this.setAttribute(name, "") : this.removeAttribute(name));
    set("data-top", v.scrollTop > 1);
    set("data-bottom", v.scrollTop + v.clientHeight < v.scrollHeight - 1);
    set("data-left", v.scrollLeft > 1);
    set("data-right", v.scrollLeft + v.clientWidth < v.scrollWidth - 1);
  }

  // Misma firma que Element.scrollTo: (opciones) o (x, y); se aplica al área desplazable
  scrollTo(...args) {
    this.viewport.scrollTo(...args);
  }
}

define("tsl-scroll-area", TslScrollArea);
