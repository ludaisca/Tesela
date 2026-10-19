/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  define
} from "./chunk-LW5JCRG7.mjs";

// src/components/sparkline.js
var TslSparkline = class extends HTMLElement {
  static get observedAttributes() {
    return ["values", "fill"];
  }
  connectedCallback() {
    this.render();
    if (!this._ro && "ResizeObserver" in window) {
      this._ro = new ResizeObserver(() => this.render());
      this._ro.observe(this);
    }
  }
  disconnectedCallback() {
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
  }
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
  render() {
    const values = (this.getAttribute("values") || "").split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
    if (values.length < 2) {
      this.innerHTML = "";
      return;
    }
    const w = Math.max(20, Math.round(this.clientWidth) || 100);
    const h = Math.max(8, Math.round(this.clientHeight) || 30);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [3 + i / (values.length - 1) * (w - 6), h - 3 - (v - min) / span * (h - 6)]);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
    const last = pts[pts.length - 1];
    const area = this.hasAttribute("fill") ? `<path d="${line} L${last[0]},${h} L${pts[0][0]},${h} Z" fill="currentColor" opacity="0.14" stroke="none"/>` : "";
    this.setAttribute("role", "img");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", `Tendencia: ${values.join(", ")}`);
    const key = `${w}x${h}:${line}:${area ? 1 : 0}`;
    if (key === this._key) return;
    this._key = key;
    this.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${area}<path d="${line}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="currentColor"/></svg>`;
  }
};
define("tsl-sparkline", TslSparkline);

export {
  TslSparkline
};
