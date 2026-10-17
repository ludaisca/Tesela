/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslFormElement
} from "./chunk-KSTMF7G7.mjs";
import {
  dismissOnOutside,
  position,
  trackPosition
} from "./chunk-EWFNMPDO.mjs";
import {
  clamp,
  define,
  emit
} from "./chunk-ZOAS4LFV.mjs";

// src/components/color-picker.js
var hsv2rgb = (h, s, v) => {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
};
var rgb2hsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, max ? d / max : 0, max];
};
var toHex = (r, g, b, a = 1) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : ""}`;
function parseHex(str) {
  const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(String(str).trim());
  if (!m) return null;
  let h = m[1];
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}
var DEFAULT_SWATCHES = "#f43f5e,#f59e0b,#10b981,#0ea5e9,#6366f1,#a855f7,#ec4899,#141415,#8e8e96,#ffffff";
var TslColorPicker = class extends TslFormElement {
  setup() {
    this.alphaOn = this.hasAttribute("alpha");
    this.initial = this.getAttribute("value") || "#6366f1";
    this.setHex(this.initial, false);
    this.build();
    this.paint();
    this.sync(false);
  }
  setHex(str, fire) {
    const c = parseHex(str);
    if (!c) return false;
    [this.h, this.s, this.v] = rgb2hsv(c.r, c.g, c.b);
    this.a = this.alphaOn ? c.a : 1;
    if (fire) this.sync(true);
    return true;
  }
  get value() {
    return toHex(...hsv2rgb(this.h, this.s, this.v), this.a);
  }
  set value(v) {
    if (this.setHex(v, false) && this.area) {
      this.paint();
      this.sync(false);
    }
  }
  reset() {
    this.value = this.initial;
  }
  build() {
    this.textContent = "";
    this.wrap = document.createElement("div");
    this.wrap.className = "tsl-select__wrap";
    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "tsl-trigger";
    this.trigger.setAttribute("aria-haspopup", "dialog");
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.innerHTML = `<span class="tsl-color__swatch"><span></span></span><span class="tsl-trigger__value tsl-mono"></span>`;
    this.swatchEl = this.trigger.querySelector(".tsl-color__swatch > span");
    this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
    if (this.getAttribute("label")) this.trigger.setAttribute("aria-label", this.getAttribute("label"));
    this.wrap.appendChild(this.trigger);
    this.panel = document.createElement("div");
    this.panel.className = "tsl-popover__panel tsl-color__panel";
    this.panel.setAttribute("popover", "manual");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir color");
    const slider = (cls, label) => {
      const el = document.createElement("div");
      el.className = cls;
      el.tabIndex = 0;
      el.setAttribute("role", "slider");
      el.setAttribute("aria-label", label);
      const thumb = document.createElement("span");
      thumb.className = "tsl-color__thumb";
      el.appendChild(thumb);
      return el;
    };
    this.area = slider("tsl-color__area", this.getAttribute("area-label") || "Saturación y brillo");
    this.hue = slider("tsl-color__hue", this.getAttribute("hue-label") || "Tono");
    this.hue.setAttribute("aria-valuemin", "0");
    this.hue.setAttribute("aria-valuemax", "360");
    this.panel.append(this.area, this.hue);
    if (this.alphaOn) {
      this.alpha = slider("tsl-color__alpha", this.getAttribute("alpha-label") || "Opacidad");
      this.alpha.setAttribute("aria-valuemin", "0");
      this.alpha.setAttribute("aria-valuemax", "100");
      this.panel.appendChild(this.alpha);
    }
    const row = document.createElement("div");
    row.className = "tsl-color__row";
    this.hexInput = document.createElement("input");
    this.hexInput.className = "tsl-input tsl-mono";
    this.hexInput.spellcheck = false;
    this.hexInput.maxLength = 9;
    this.hexInput.setAttribute("aria-label", "Valor hexadecimal");
    row.appendChild(this.hexInput);
    if ("EyeDropper" in window) {
      const eye = document.createElement("button");
      eye.type = "button";
      eye.className = "tsl-btn tsl-btn--icon";
      eye.setAttribute("aria-label", "Cuentagotas");
      eye.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3z"/></svg>`;
      eye.addEventListener("click", async () => {
        try {
          const { sRGBHex } = await new window.EyeDropper().open();
          this.setHex(sRGBHex, true);
          this.paint();
        } catch (_) {
        }
      });
      row.appendChild(eye);
    }
    this.panel.appendChild(row);
    const swatches = (this.getAttribute("swatches") || DEFAULT_SWATCHES).split(",").map((s) => s.trim()).filter(Boolean);
    if (swatches.length && this.getAttribute("swatches") !== "") {
      const sw = document.createElement("div");
      sw.className = "tsl-color__swatches";
      swatches.forEach((hex) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tsl-color__chip";
        b.style.setProperty("--c", hex);
        b.setAttribute("aria-label", hex);
        b.dataset.hex = hex;
        sw.appendChild(b);
      });
      sw.addEventListener("click", (e) => {
        const b = e.target.closest(".tsl-color__chip");
        if (b && this.setHex(b.dataset.hex, true)) this.paint();
      });
      this.panel.appendChild(sw);
    }
    this.append(this.wrap, this.panel);
    this.drag(this.area, (x, y) => {
      this.s = x;
      this.v = 1 - y;
    });
    this.drag(this.hue, (x) => this.h = x * 360);
    if (this.alpha) this.drag(this.alpha, (x) => this.a = Math.round(x * 100) / 100);
    this.keys(this.area, (e) => {
      const d = e.shiftKey ? 0.1 : 0.01;
      if (e.key === "ArrowRight") this.s = clamp(this.s + d, 0, 1);
      else if (e.key === "ArrowLeft") this.s = clamp(this.s - d, 0, 1);
      else if (e.key === "ArrowUp") this.v = clamp(this.v + d, 0, 1);
      else if (e.key === "ArrowDown") this.v = clamp(this.v - d, 0, 1);
      else return false;
    });
    this.keys(this.hue, (e) => {
      const d = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") this.h = clamp(this.h + d, 0, 360);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.h = clamp(this.h - d, 0, 360);
      else return false;
    });
    if (this.alpha) {
      this.keys(this.alpha, (e) => {
        const d = e.shiftKey ? 0.1 : 0.01;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") this.a = clamp(Math.round((this.a + d) * 100) / 100, 0, 1);
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.a = clamp(Math.round((this.a - d) * 100) / 100, 0, 1);
        else return false;
      });
    }
    const commitHex = () => {
      if (this.setHex(this.hexInput.value, true)) this.paint();
      else this.hexInput.value = this.value;
    };
    this.hexInput.addEventListener("change", commitHex);
    this.hexInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitHex();
      }
    });
    this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open());
    this.trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    });
    this.panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close(true);
      }
    });
    this.panel.addEventListener("focusout", (e) => {
      if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
    });
  }
  // Arrastre con puntero: fn recibe (x, y) normalizados 0..1
  drag(el, fn) {
    const move = (e) => {
      const r = el.getBoundingClientRect();
      fn(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
      this.paint();
      this.sync(false, true);
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.focus();
      el.setPointerCapture(e.pointerId);
      el._dragging = true;
      move(e);
    });
    el.addEventListener("pointermove", (e) => el._dragging && move(e));
    const end = () => {
      if (!el._dragging) return;
      el._dragging = false;
      this.sync(true);
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }
  keys(el, fn) {
    el.addEventListener("keydown", (e) => {
      if (fn(e) === false) return;
      e.preventDefault();
      this.paint();
      this.sync(true);
    });
  }
  paint() {
    const [r, g, b] = hsv2rgb(this.h, this.s, this.v);
    const hue = `hsl(${this.h} 100% 50%)`;
    this.panel.style.setProperty("--hue", hue);
    this.panel.style.setProperty("--rgb", `${r} ${g} ${b}`);
    this.area.firstChild.style.left = `${this.s * 100}%`;
    this.area.firstChild.style.top = `${(1 - this.v) * 100}%`;
    this.area.setAttribute("aria-valuetext", `Saturación ${Math.round(this.s * 100)}%, brillo ${Math.round(this.v * 100)}%`);
    this.hue.firstChild.style.left = `${this.h / 360 * 100}%`;
    this.hue.setAttribute("aria-valuenow", String(Math.round(this.h)));
    if (this.alpha) {
      this.alpha.firstChild.style.left = `${this.a * 100}%`;
      this.alpha.setAttribute("aria-valuenow", String(Math.round(this.a * 100)));
    }
    if (document.activeElement !== this.hexInput) this.hexInput.value = this.value;
  }
  sync(fire, live) {
    const hex = this.value;
    this.swatchEl.style.background = hex;
    this.valueEl.textContent = hex;
    if (document.activeElement !== this.hexInput && this.hexInput) this.hexInput.value = hex;
    this.syncDisabled();
    this.publish(hex, false, this.trigger);
    if (live) emit(this, "tsl-input", { value: hex });
    else if (fire) emit(this, "tsl-change", { value: hex });
  }
  get isOpen() {
    return Boolean(this.panel) && this.panel.matches(":popover-open");
  }
  syncDisabled() {
    if (!this.trigger) return;
    this.trigger.disabled = this.isDisabled;
    if (this.isDisabled) this.close();
  }
  open() {
    if (this.isDisabled || this.isOpen) return;
    this.panel.showPopover();
    position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.trigger.setAttribute("aria-expanded", "true");
    this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
    this.paint();
    this.area.focus();
    emit(this, "tsl-open", {});
  }
  close(returnFocus = false) {
    if (!this.isOpen) return;
    this.panel.hidePopover();
    this.trigger.setAttribute("aria-expanded", "false");
    if (this.stopPos) this.stopPos();
    if (this.stopOutside) this.stopOutside();
    this.stopPos = this.stopOutside = null;
    if (returnFocus) this.trigger.focus();
    emit(this, "tsl-close", {});
  }
};
define("tsl-color-picker", TslColorPicker);

export {
  TslColorPicker
};
