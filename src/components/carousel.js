import { TslElement, define, emit, nextId } from "../core/base.js";
import { icon } from "../core/icons.js";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * <tsl-carousel label="Galería" per-view="2" dots loop autoplay="5000" orientation="horizontal">
 *   <div class="tsl-carousel__track">
 *     <div class="tsl-carousel__slide">…</div>
 *   </div>
 * </tsl-carousel>
 * Desplazamiento nativo con scroll-snap (táctil, rueda y teclado); los botones, los puntos
 * y el avance automático se añaden solos. Las diapositivas fuera de vista quedan `inert`.
 */
export class TslCarousel extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  setup() {
    this.track = this.querySelector(":scope > .tsl-carousel__track");
    if (!this.track) return;
    this.slides = Array.from(this.track.querySelectorAll(":scope > .tsl-carousel__slide"));
    this.current = 0;
    this.setAttribute("role", "region");
    this.setAttribute("aria-roledescription", "carrusel");
    this.style.setProperty("--tsl-per-view", String(this.perView));
    this.track.tabIndex = 0;
    this.track.setAttribute("role", "group");
    this.track.id = this.track.id || nextId("tsl-carousel");
    this.paintLabels();
    this.slides.forEach((s, i) => {
      s.setAttribute("role", "group");
      s.setAttribute("aria-roledescription", "diapositiva");
      s.setAttribute("aria-label", `${i + 1} de ${this.slides.length}`);
    });

    // Los controles viven en una barra bajo el carrusel (anterior, puntos, siguiente, pausa): nunca tapan el contenido
    this.bar = document.createElement("div");
    this.bar.className = "tsl-carousel__bar";
    this.appendChild(this.bar);
    this.prevBtn = this.control("prev", "Anterior", "chevron-left");
    if (this.hasAttribute("dots")) this.buildDots();
    this.nextBtn = this.control("next", "Siguiente", "chevron-right");
    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());
    if (this.hasAttribute("autoplay")) this.buildAutoplay();

    this.track.addEventListener("scroll", () => {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.sync(true);
      });
    }, { passive: true });
    this.track.addEventListener("keydown", (e) => {
      const keys = this.vertical ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
      const rtl = getComputedStyle(this).direction === "rtl" && !this.vertical;
      if (e.key === keys[0]) this[rtl ? "next" : "prev"]();
      else if (e.key === keys[1]) this[rtl ? "prev" : "next"]();
      else if (e.key === "Home") this.goTo(0);
      else if (e.key === "End") this.goTo(this.pageCount - 1);
      else return;
      e.preventDefault();
      this.pauseAuto();
    });
    this.addEventListener("mouseenter", () => (this.hovered = true));
    this.addEventListener("mouseleave", () => (this.hovered = false));
    this.addEventListener("focusin", () => (this.focused = true));
    this.addEventListener("focusout", () => (this.focused = false));
    this.resizer = new ResizeObserver(() => this.sync(false));
    this.resizer.observe(this.track);
    this.sync(false);
    this.startAuto();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.timer);
    if (this.resizer) this.resizer.disconnect();
  }

  reconnected() {
    this.resizer.observe(this.track);
    this.sync(false);
    // Solo si seguía avanzando: una pausa de la persona se respeta al volver a montarlo
    if (this.playing) this.startAuto(true);
  }

  attributeChanged() {
    this.paintLabels();
  }

  paintLabels() {
    const label = this.getAttribute("label") || "Carrusel";
    this.setAttribute("aria-label", label);
    this.track.setAttribute("aria-label", `${label}: diapositivas`);
  }

  get vertical() {
    return this.getAttribute("orientation") === "vertical";
  }

  get perView() {
    return Math.max(1, parseInt(this.getAttribute("per-view"), 10) || 1);
  }

  get loop() {
    return this.hasAttribute("loop");
  }

  get pageCount() {
    return Math.max(1, this.slides.length - this.perView + 1);
  }

  get index() {
    return this.current;
  }

  set index(v) {
    this.goTo(v, false);
  }

  control(kind, label, iconName) {
    let btn = this.querySelector(`:scope > [data-tsl-${kind}]`);
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = `tsl-btn tsl-btn--icon tsl-carousel__nav tsl-carousel__${kind}`;
      btn.appendChild(icon(iconName, "tsl-icon--flip-rtl"));
      this.bar.appendChild(btn);
    }
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-controls", this.track.id);
    return btn;
  }

  buildDots() {
    this.dotBar = document.createElement("div");
    this.dotBar.className = "tsl-carousel__dots";
    for (let i = 0; i < this.pageCount; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "tsl-carousel__dot";
      dot.setAttribute("aria-label", `Ir a la diapositiva ${i + 1}`);
      dot.addEventListener("click", () => {
        this.goTo(i);
        this.pauseAuto();
      });
      this.dotBar.appendChild(dot);
    }
    this.bar.appendChild(this.dotBar);
  }

  buildAutoplay() {
    this.playBtn = document.createElement("button");
    this.playBtn.type = "button";
    this.playBtn.className = "tsl-btn tsl-btn--icon tsl-btn--sm tsl-carousel__play";
    this.playBtn.addEventListener("click", () => (this.playing ? this.pauseAuto() : this.startAuto(true)));
    this.bar.appendChild(this.playBtn);
    this.playing = false;
  }

  startAuto(force) {
    if (!this.hasAttribute("autoplay") || (reduced() && !force)) return this.paintPlay();
    clearInterval(this.timer);
    const ms = Math.max(1500, parseInt(this.getAttribute("autoplay"), 10) || 5000);
    this.playing = true;
    this.timer = setInterval(() => {
      if (this.hovered || this.focused || document.hidden) return;
      if (this.current >= this.pageCount - 1) this.goTo(0);
      else this.next();
    }, ms);
    this.paintPlay();
  }

  pauseAuto() {
    clearInterval(this.timer);
    this.playing = false;
    this.paintPlay();
  }

  paintPlay() {
    if (!this.playBtn) return;
    this.playBtn.replaceChildren(icon(this.playing ? "pause" : "play"));
    this.playBtn.setAttribute("aria-label", this.playing ? "Pausar avance automático" : "Reanudar avance automático");
    this.track.setAttribute("aria-live", this.playing ? "off" : "polite");
  }

  offsetOf(slide) {
    const t = this.track.getBoundingClientRect();
    const s = slide.getBoundingClientRect();
    if (this.vertical) return s.top - t.top;
    return getComputedStyle(this).direction === "rtl" ? s.right - t.right : s.left - t.left;
  }

  goTo(i, smooth = true) {
    const page = this.loop ? ((i % this.pageCount) + this.pageCount) % this.pageCount : Math.min(this.pageCount - 1, Math.max(0, i));
    const slide = this.slides[page];
    if (!slide) return;
    const delta = this.offsetOf(slide);
    this.track.scrollBy({ [this.vertical ? "top" : "left"]: delta, behavior: smooth && !reduced() ? "smooth" : "instant" });
    if (!smooth || reduced()) this.sync(true);
  }

  next() {
    this.goTo(this.loop && this.current >= this.pageCount - 1 ? 0 : this.current + 1);
  }

  prev() {
    this.goTo(this.loop && this.current <= 0 ? this.pageCount - 1 : this.current - 1);
  }

  /** Calcula la diapositiva visible a partir del desplazamiento y actualiza controles y accesibilidad. */
  sync(fire) {
    if (!this.slides.length) return;
    let best = 0;
    let dist = Infinity;
    this.slides.forEach((s, i) => {
      const d = Math.abs(this.offsetOf(s));
      if (d < dist - 0.5) {
        dist = d;
        best = i;
      }
    });
    const idx = Math.min(best, this.pageCount - 1);
    const changed = idx !== this.current;
    this.current = idx;
    this.slides.forEach((s, i) => {
      const visible = i >= idx && i < idx + this.perView;
      s.inert = !visible;
      s.toggleAttribute("data-active", visible);
    });
    const atStart = idx <= 0;
    const atEnd = idx >= this.pageCount - 1;
    this.prevBtn.disabled = !this.loop && atStart;
    this.nextBtn.disabled = !this.loop && atEnd;
    if (this.dotBar) {
      Array.from(this.dotBar.children).forEach((d, i) => {
        d.setAttribute("aria-current", String(i === idx));
      });
    }
    if (changed && fire) emit(this, "tsl-change", { index: idx, count: this.pageCount });
  }
}

define("tsl-carousel", TslCarousel);
