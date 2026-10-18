/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslFormElement
} from "./chunk-APNO5X2D.mjs";
import {
  clamp,
  define,
  emit,
  isRtl
} from "./chunk-O4IHLMQS.mjs";

// src/components/rating.js
var STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"/></svg>`;
var TslRating = class extends TslFormElement {
  setup() {
    this.max = Math.max(1, parseInt(this.getAttribute("max") || "5", 10));
    this.half = this.hasAttribute("half");
    this.stepSize = this.half ? 0.5 : 1;
    this.initial = this.norm(parseFloat(this.getAttribute("value") || "0"));
    this.val = this.initial;
    this.hover = null;
    this.textContent = "";
    this.stars = Array.from({ length: this.max }, () => {
      const s = document.createElement("span");
      s.className = "tsl-rating__star";
      s.innerHTML = `${STAR}<span class="tsl-rating__fill">${STAR}</span>`;
      this.appendChild(s);
      return s;
    });
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(this.max));
    this.setAttribute("aria-label", this.getAttribute("label") || "Valoración");
    this.addEventListener("pointermove", (e) => {
      if (this.interactive && e.pointerType !== "touch") {
        this.hover = this.valueAt(e.clientX);
        this.paint();
      }
    });
    this.addEventListener("pointerleave", () => {
      this.hover = null;
      this.paint();
    });
    this.addEventListener("click", (e) => {
      if (!this.interactive) return;
      const v = this.valueAt(e.clientX);
      this.set(this.hasAttribute("clearable") && v === this.val ? 0 : v, true);
      this.focus();
    });
    this.addEventListener("keydown", (e) => {
      if (!this.interactive) return;
      const k = e.key;
      let next = null;
      const up = isRtl(this) ? "ArrowLeft" : "ArrowRight";
      const down = isRtl(this) ? "ArrowRight" : "ArrowLeft";
      if (k === up || k === "ArrowUp") next = this.val + this.stepSize;
      else if (k === down || k === "ArrowDown") next = this.val - this.stepSize;
      else if (k === "Home") next = this.hasAttribute("clearable") ? 0 : this.stepSize;
      else if (k === "End") next = this.max;
      else if ((k === "Delete" || k === "Backspace") && this.hasAttribute("clearable")) next = 0;
      if (next === null) return;
      e.preventDefault();
      this.set(next, true);
    });
    this.syncDisabled();
    this.paint();
    this.sync(false);
  }
  get interactive() {
    return !this.hasAttribute("readonly") && !this.isDisabled;
  }
  norm(v) {
    if (!Number.isFinite(v)) return 0;
    return clamp(Math.round(v / this.stepSize) * this.stepSize, 0, this.max);
  }
  valueAt(clientX) {
    const rtl = isRtl(this);
    for (let i = 0; i < this.stars.length; i++) {
      const r = this.stars[i].getBoundingClientRect();
      if (rtl ? clientX >= r.left : clientX <= r.right) {
        const frac = clamp(rtl ? (r.right - clientX) / r.width : (clientX - r.left) / r.width, 0, 1);
        return i + (this.half && frac <= 0.5 ? 0.5 : 1);
      }
    }
    return this.max;
  }
  get value() {
    return this.val;
  }
  set value(v) {
    this.set(parseFloat(v), false);
  }
  set(v, fire) {
    this.val = this.norm(v);
    this.paint();
    this.sync(fire);
  }
  reset() {
    this.set(this.initial, false);
  }
  paint() {
    const shown = this.hover !== null && this.interactive ? this.hover : this.val;
    this.stars.forEach((s, i) => s.style.setProperty("--f", String(clamp(shown - i, 0, 1))));
    this.classList.toggle("is-hovering", this.hover !== null);
  }
  syncDisabled() {
    if (!this.stars) return;
    const ro = this.hasAttribute("readonly");
    this.setAttribute("role", ro ? "img" : "slider");
    if (this.interactive) this.tabIndex = 0;
    else this.removeAttribute("tabindex");
    this.toggleAttribute("aria-disabled", this.isDisabled);
  }
  sync(fire) {
    const text = `${this.val} de ${this.max}`;
    this.setAttribute("aria-valuenow", String(this.val));
    this.setAttribute("aria-valuetext", text);
    if (this.hasAttribute("readonly")) this.setAttribute("aria-label", `${this.getAttribute("label") || "Valoración"}: ${text}`);
    this.publish(this.val ? String(this.val) : null, !this.val, this);
    if (fire) emit(this, "tsl-change", { value: this.val });
  }
};
define("tsl-rating", TslRating);

export {
  TslRating
};
