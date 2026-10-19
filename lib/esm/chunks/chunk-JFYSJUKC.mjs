/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  icon
} from "./chunk-VKGZI2YC.mjs";
import {
  TslElement,
  define,
  emit
} from "./chunk-LW5JCRG7.mjs";

// src/components/message-scroller.js
var reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var TslMessageScroller = class extends TslElement {
  setup() {
    this.viewport = document.createElement("div");
    this.viewport.className = "tsl-message-scroller__viewport";
    this.viewport.tabIndex = 0;
    this.viewport.setAttribute("role", "region");
    this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Conversación");
    this.content = this.querySelector(":scope > .tsl-message-scroller__content") || document.createElement("div");
    this.content.classList.add("tsl-message-scroller__content");
    this.content.setAttribute("role", "log");
    this.content.setAttribute("aria-live", "polite");
    this.content.setAttribute("aria-relevant", "additions");
    this.viewport.appendChild(this.content);
    this.prepend(this.viewport);
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "tsl-btn tsl-btn--sm tsl-message-scroller__end";
    this.button.append(icon("arrow-down"), this.getAttribute("end-label") || "Ir al final");
    this.button.addEventListener("click", () => this.scrollToEnd());
    this.appendChild(this.button);
    this.stuck = true;
    this.viewport.addEventListener("scroll", () => this.onScroll(), { passive: true });
    this.viewport.addEventListener("wheel", (e) => e.deltaY < 0 && this.release(), { passive: true });
    this.viewport.addEventListener("touchmove", () => !this.nearEnd() && this.release(), { passive: true });
    this.height = this.content.scrollHeight;
    const changed = () => {
      if (this.stuck && !this.hasAttribute("manual")) this.scrollToEnd(false);
      else this.paint();
    };
    this.mutations = new MutationObserver(changed);
    this.mutations.observe(this.content, { childList: true, subtree: true, characterData: true });
    this.resizer = new ResizeObserver(changed);
    this.resizer.observe(this.content);
    this.resizer.observe(this.viewport);
    this.scrollToEnd(false);
  }
  disconnectedCallback() {
    if (this.mutations) this.mutations.disconnect();
    if (this.resizer) this.resizer.disconnect();
    this._tslReady = false;
  }
  get threshold() {
    return parseInt(this.getAttribute("threshold"), 10) || 48;
  }
  get atEnd() {
    return this.nearEnd();
  }
  nearEnd() {
    const v = this.viewport;
    return v.scrollHeight - v.scrollTop - v.clientHeight <= this.threshold;
  }
  release() {
    if (this.stuck) {
      this.stuck = false;
      this.paint();
    }
  }
  onScroll() {
    const top = this.viewport.scrollTop;
    const up = top < (this.lastTop || 0);
    this.lastTop = top;
    if (this.programmatic) return;
    const near = this.nearEnd();
    if (!near && this.stuck && !up) return;
    if (near !== this.stuck) {
      this.stuck = near;
      this.paint();
      emit(this, "tsl-scroll-state", { atEnd: near });
    }
  }
  /** Baja al último mensaje y vuelve a seguir el final. */
  scrollToEnd(smooth = true) {
    this.stuck = true;
    this.programmatic = true;
    this.viewport.scrollTo({ top: this.viewport.scrollHeight, behavior: smooth && !reduced() ? "smooth" : "instant" });
    clearTimeout(this.settle);
    this.settle = setTimeout(() => {
      this.programmatic = false;
      this.stuck = this.nearEnd();
      this.paint();
    }, smooth && !reduced() ? 450 : 30);
    this.paint();
  }
  scrollToStart(smooth = true) {
    this.release();
    this.viewport.scrollTo({ top: 0, behavior: smooth && !reduced() ? "smooth" : "instant" });
  }
  paint() {
    this.toggleAttribute("data-scrollable", this.viewport.scrollHeight > this.viewport.clientHeight + 1);
    const away = !this.stuck && !this.nearEnd();
    this.toggleAttribute("data-away", away);
    this.button.tabIndex = away ? 0 : -1;
    this.button.setAttribute("aria-hidden", String(!away));
  }
};
define("tsl-message-scroller", TslMessageScroller);

export {
  TslMessageScroller
};
