/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslFormElement
} from "./chunk-5N22NWZA.mjs";
import {
  clamp,
  define,
  emit,
  isRtl
} from "./chunk-KUBYC2WE.mjs";

// src/components/slider.js
var decimalsOf = (n) => (String(n).split(".")[1] || "").length;
var TslSlider = class extends TslFormElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "value", "label"];
  }
  setup() {
    this.min = parseFloat(this.getAttribute("min") || "0");
    this.max = parseFloat(this.getAttribute("max") || "100");
    this.step = parseFloat(this.getAttribute("step") || "1") || 1;
    const raw = this.getAttribute("value") || "";
    this.range = this.hasAttribute("range") || raw.includes(",");
    let vals = raw.split(",").map(Number).filter(Number.isFinite);
    const span = this.max - this.min;
    if (this.range) {
      if (vals.length < 2) vals = [this.min + span * 0.25, this.min + span * 0.75];
      vals = vals.slice(0, 2).map((v) => this.snap(v)).sort((a, b) => a - b);
    } else {
      vals = [this.snap(vals.length ? vals[0] : this.min)];
    }
    this.initial = vals.slice();
    this.vals = vals.slice();
    this.drag = null;
    this.build();
    this.update(false);
  }
  attributeChanged(name, before, after) {
    super.attributeChanged(name, before, after);
    if (name === "value") {
      this.value = after || "";
      this.initial = this.vals.slice();
    } else if (name === "label") this.paintLabels();
  }
  paintLabels() {
    const label = this.getAttribute("label") || "Valor";
    this.thumbs.forEach((t, i) => t.setAttribute("aria-label", this.range ? `${label}: ${i === 0 ? "mínimo" : "máximo"}` : label));
  }
  snap(v) {
    const stepped = Math.round((clamp(v, this.min, this.max) - this.min) / this.step) * this.step + this.min;
    return clamp(Number(stepped.toFixed(decimalsOf(this.step) + decimalsOf(this.min))), this.min, this.max);
  }
  build() {
    this.textContent = "";
    this.track = document.createElement("div");
    this.track.className = "tsl-slider__track";
    this.fill = document.createElement("div");
    this.fill.className = "tsl-slider__fill";
    this.track.appendChild(this.fill);
    this.thumbs = this.vals.map((_, i) => {
      const t = document.createElement("div");
      t.className = "tsl-slider__thumb";
      t.setAttribute("role", "slider");
      t.setAttribute("aria-orientation", "horizontal");
      t.setAttribute("aria-valuemin", String(this.min));
      t.setAttribute("aria-valuemax", String(this.max));
      t.dataset.i = String(i);
      this.track.appendChild(t);
      return t;
    });
    this.appendChild(this.track);
    this.paintLabels();
    this.track.addEventListener("pointerdown", (e) => {
      if (this.isDisabled || e.button !== 0) return;
      e.preventDefault();
      const v = this.valueAt(e.clientX);
      let i = this.thumbs.indexOf(e.target.closest(".tsl-slider__thumb"));
      if (i === -1) {
        i = 0;
        if (this.range) i = Math.abs(v - this.vals[0]) < Math.abs(v - this.vals[1]) || v === this.vals[0] && v === this.vals[1] && v < this.max ? 0 : 1;
      }
      this.drag = i;
      this.thumbs[i].focus();
      this.track.setPointerCapture(e.pointerId);
      this.classList.add("is-dragging");
      this.setThumb(i, v, false);
    });
    this.track.addEventListener("pointermove", (e) => {
      if (this.drag !== null) this.setThumb(this.drag, this.valueAt(e.clientX), false);
    });
    const end = () => {
      if (this.drag === null) return;
      this.drag = null;
      this.classList.remove("is-dragging");
      emit(this, "tsl-change", { value: this.value, values: this.vals.slice() });
    };
    this.track.addEventListener("pointerup", end);
    this.track.addEventListener("pointercancel", end);
    this.thumbs.forEach((t, i) => t.addEventListener("keydown", (e) => this.onKey(e, i)));
  }
  valueAt(clientX) {
    const r = this.track.getBoundingClientRect();
    const frac = isRtl(this) ? (r.right - clientX) / r.width : (clientX - r.left) / r.width;
    return this.min + clamp(frac, 0, 1) * (this.max - this.min);
  }
  onKey(e, i) {
    if (this.isDisabled) return;
    const k = e.key;
    const cur = this.vals[i];
    let next = null;
    const up = isRtl(this) ? "ArrowLeft" : "ArrowRight";
    const down = isRtl(this) ? "ArrowRight" : "ArrowLeft";
    if (k === up || k === "ArrowUp") next = cur + this.step;
    else if (k === down || k === "ArrowDown") next = cur - this.step;
    else if (k === "PageUp") next = cur + this.step * 10;
    else if (k === "PageDown") next = cur - this.step * 10;
    else if (k === "Home") next = this.min;
    else if (k === "End") next = this.max;
    if (next === null) return;
    e.preventDefault();
    this.setThumb(i, next, true);
  }
  setThumb(i, v, commit) {
    v = this.snap(v);
    if (this.range) v = i === 0 ? Math.min(v, this.vals[1]) : Math.max(v, this.vals[0]);
    if (v === this.vals[i]) return;
    this.vals[i] = v;
    this.update(true);
    if (commit) emit(this, "tsl-change", { value: this.value, values: this.vals.slice() });
  }
  get value() {
    return this.vals.join(",");
  }
  set value(v) {
    const vals = String(v).split(",").map(Number).filter(Number.isFinite).map((n) => this.snap(n));
    if (vals.length !== this.vals.length) return;
    this.vals = this.range ? vals.sort((a, b) => a - b) : vals;
    this.update(false);
  }
  get values() {
    return this.vals.slice();
  }
  reset() {
    this.vals = this.initial.slice();
    this.update(false);
  }
  syncDisabled() {
    if (!this.thumbs) return;
    this.toggleAttribute("aria-disabled", this.isDisabled);
    this.thumbs.forEach((t) => t.tabIndex = this.isDisabled ? -1 : 0);
  }
  update(fireInput) {
    const span = this.max - this.min || 1;
    const pct = this.vals.map((v) => (v - this.min) / span * 100);
    const prefix = this.getAttribute("prefix") || "";
    const suffix = this.getAttribute("suffix") || "";
    this.thumbs.forEach((t, i) => {
      t.style.setProperty("--p", `${pct[i]}%`);
      t.setAttribute("aria-valuenow", String(this.vals[i]));
      t.setAttribute("aria-valuetext", `${prefix}${this.vals[i]}${suffix}`);
      t.dataset.value = `${prefix}${this.vals[i]}${suffix}`;
      t.style.zIndex = this.range && this.vals[0] === this.vals[1] ? i === 0 ? pct[0] > 50 ? 2 : 1 : pct[1] > 50 ? 1 : 2 : "";
    });
    this.fill.style.insetInlineStart = this.range ? `${pct[0]}%` : "0";
    this.fill.style.width = this.range ? `${pct[1] - pct[0]}%` : `${pct[0]}%`;
    this.syncDisabled();
    if (this.range) {
      const fd = new FormData();
      this.vals.forEach((v) => fd.append(this.name, String(v)));
      this.publish(fd, false, this.thumbs[0]);
    } else {
      this.publish(String(this.vals[0]), false, this.thumbs[0]);
    }
    if (fireInput) emit(this, "tsl-input", { value: this.value, values: this.vals.slice() });
  }
};
define("tsl-slider", TslSlider);

export {
  TslSlider
};
