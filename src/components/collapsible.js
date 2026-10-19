import { TslElement, define, emit, nextId } from "../core/base.js";

/**
 * <tsl-collapsible open>
 *   <button data-tsl-trigger>Detalles</button>
 *   <div class="tsl-collapsible__content">…</div>
 * </tsl-collapsible>
 */
export class TslCollapsible extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "open"];
  }

  attributeChanged() {
    this.paint();
  }

  setup() {
    this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > button");
    this.content = this.querySelector(":scope > .tsl-collapsible__content");
    if (!this.trigger || !this.content) return;
    // La altura se anima con grid (0fr → 1fr): el contenido va en un único hijo
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
    const next = force === undefined ? !this.isOpen : Boolean(force);
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
}

define("tsl-collapsible", TslCollapsible);
