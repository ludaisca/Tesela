/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  isOpenPopover,
  position,
  trackPosition
} from "./chunk-5JUXMGRM.mjs";
import {
  TslElement,
  define,
  emit,
  nextId
} from "./chunk-O4IHLMQS.mjs";

// src/components/hovercard.js
var TslHoverCard = class extends TslElement {
  setup() {
    this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > a, :scope > button");
    this.panel = this.querySelector(":scope > .tsl-popover__panel");
    if (!this.trigger || !this.panel) return;
    this.panel.id = this.panel.id || nextId("tsl-hovercard");
    this.panel.setAttribute("popover", "manual");
    if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "group");
    this.trigger.setAttribute("aria-controls", this.panel.id);
    this.trigger.setAttribute("aria-expanded", "false");
    const delay = (name, fallback) => parseInt(this.getAttribute(name) || String(fallback), 10);
    const schedule = (fn, ms) => {
      clearTimeout(this.timer);
      this.timer = setTimeout(fn, ms);
    };
    const enter = () => schedule(() => this.open(), delay("open-delay", 300));
    const leave = () => schedule(() => this.close(), delay("close-delay", 150));
    [this.trigger, this.panel].forEach((el) => {
      el.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && enter());
      el.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && leave());
      el.addEventListener("focusin", enter);
      el.addEventListener("focusout", (e) => {
        if (!this.contains(e.relatedTarget)) leave();
      });
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        e.stopPropagation();
        clearTimeout(this.timer);
        this.close();
      }
    });
  }
  get isOpen() {
    return Boolean(this.panel) && isOpenPopover(this.panel);
  }
  open() {
    if (!this.panel || this.isOpen) return;
    this.panel.showPopover();
    position(this.trigger, this.panel, {
      placement: this.getAttribute("placement") || "bottom-start",
      offset: parseInt(this.getAttribute("offset") || "8", 10)
    });
    this.trigger.setAttribute("aria-expanded", "true");
    this.stop = trackPosition(this.trigger, this.panel, { placement: this.getAttribute("placement") || "bottom-start", offset: 8 });
    emit(this, "tsl-open", {});
  }
  close() {
    if (!this.isOpen) return;
    this.panel.hidePopover();
    this.trigger.setAttribute("aria-expanded", "false");
    if (this.stop) this.stop();
    this.stop = null;
    emit(this, "tsl-close", {});
  }
};
define("tsl-hovercard", TslHoverCard);

export {
  TslHoverCard
};
