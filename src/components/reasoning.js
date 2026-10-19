import { TslElement, define, emit, nextId } from "../core/base.js";
import { icon } from "../core/icons.js";

/**
 * <tsl-reasoning streaming>
 *   <div class="tsl-reasoning__content">Texto del razonamiento…</div>
 * </tsl-reasoning>
 * Bloque plegable con el razonamiento de un asistente. Mientras tiene `streaming` se abre solo,
 * anuncia «Pensando…» con brillo y cuenta el tiempo; al quitar el atributo pasa a «Pensó durante N s»
 * y se pliega (salvo que la persona lo haya abierto o cerrado a mano). `duration` fija los segundos
 * de un razonamiento ya terminado.
 */
export class TslReasoning extends TslElement {
  static get observedAttributes() {
    return ["streaming", "duration"];
  }

  setup() {
    this.content = this.querySelector(":scope > .tsl-reasoning__content");
    if (!this.content) {
      this.content = document.createElement("div");
      this.content.className = "tsl-reasoning__content";
      this.content.append(...this.childNodes);
      this.appendChild(this.content);
    }
    const inner = document.createElement("div");
    inner.className = "tsl-reasoning__inner";
    inner.append(...this.content.childNodes);
    this.content.appendChild(inner);
    this.content.id = this.content.id || nextId("tsl-reasoning");

    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "tsl-reasoning__trigger";
    this.trigger.setAttribute("aria-controls", this.content.id);
    this.icon = icon("brain", "tsl-reasoning__icon");
    this.label = document.createElement("span");
    this.label.className = "tsl-reasoning__label";
    const chevron = document.createElement("span");
    chevron.className = "tsl-collapsible__chevron";
    this.trigger.append(this.icon, this.label, chevron);
    this.prepend(this.trigger);
    // Estado anunciado aparte: el texto del botón cambia cada segundo y no debe repetirse en voz alta
    this.status = document.createElement("span");
    this.status.className = "tsl-sr-only";
    this.status.setAttribute("role", "status");
    this.appendChild(this.status);

    this.touched = false;
    this.trigger.addEventListener("click", () => {
      this.touched = true;
      this.toggle();
    });

    this.seconds = this.hasAttribute("duration") ? parseFloat(this.getAttribute("duration")) || 0 : null;
    if (this.isStreaming) this.begin();
    else if (!this.hasAttribute("open")) this.content.inert = true;
    this.paint();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._tslReady || oldValue === newValue) return;
    if (name === "duration") {
      this.seconds = newValue === null ? this.seconds : parseFloat(newValue) || 0;
      this.paint();
      return;
    }
    if (this.isStreaming) this.begin();
    else this.finish();
  }

  disconnectedCallback() {
    clearInterval(this.tick);
    clearTimeout(this.closer);
  }

  get isStreaming() {
    return this.hasAttribute("streaming");
  }

  get isOpen() {
    return this.hasAttribute("open");
  }

  /** Segundos que duró (o lleva) el razonamiento. */
  get duration() {
    if (this.isStreaming && this.started) return (performance.now() - this.started) / 1000;
    return this.seconds || 0;
  }

  begin() {
    this.started = performance.now();
    this.touched = false;
    clearTimeout(this.closer);
    this.toggle(true, false);
    this.status.textContent = this.getAttribute("thinking-label") || "Pensando…";
    clearInterval(this.tick);
    this.tick = setInterval(() => this.paint(), 1000);
    this.paint();
  }

  finish() {
    clearInterval(this.tick);
    if (this.started && !this.hasAttribute("duration")) this.seconds = (performance.now() - this.started) / 1000;
    this.started = 0;
    this.paint();
    this.status.textContent = this.label.textContent;
    emit(this, "tsl-complete", { duration: this.seconds || 0 });
    const delay = parseInt(this.getAttribute("close-delay") || "1000", 10);
    if (!this.touched && delay >= 0) this.closer = setTimeout(() => this.toggle(false, false), delay);
  }

  toggle(force, fire = true) {
    const next = force === undefined ? !this.isOpen : Boolean(force);
    if (next === this.isOpen) return;
    this.toggleAttribute("open", next);
    this.paint();
    if (fire) emit(this, "tsl-toggle", { open: next });
  }

  open() {
    this.toggle(true);
  }

  close() {
    this.toggle(false);
  }

  paint() {
    if (!this.trigger) return;
    const s = Math.round(this.duration);
    let text;
    if (this.isStreaming) {
      text = this.getAttribute("thinking-label") || "Pensando…";
      if (s >= 1) text += ` ${s} s`;
    } else if (s < 1) {
      text = this.getAttribute("instant-label") || "Pensó unos instantes";
    } else {
      text = (this.getAttribute("done-label") || "Pensó durante {s} s").replace("{s}", s);
    }
    this.label.textContent = text;
    this.label.classList.toggle("tsl-shimmer", this.isStreaming);
    this.trigger.setAttribute("aria-expanded", String(this.isOpen));
    this.content.inert = !this.isOpen;
  }
}

define("tsl-reasoning", TslReasoning);
