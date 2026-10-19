/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */

// src/core/base.js
var VERSION = "1.4.0";
var uid = 0;
var nextId = (prefix) => `${prefix}-${++uid}`;
var emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
var storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {
    }
  }
};
var TslElement = class extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  attributeChangedCallback(name, before, after) {
    if (before === after || !this._tslBuilt) return;
    this.attributeChanged(name, before, after);
  }
  attributeChanged() {
  }
  connectedCallback() {
    if (this._tslReady) {
      this._tslAttach();
      this.reconnected();
      return;
    }
    const go = () => {
      if (this._tslReady || !this.isConnected) return;
      this._tslReady = true;
      this._tslAttach();
      this.setup();
      this._tslBuilt = true;
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go, { once: true });
    } else {
      go();
    }
  }
  disconnectedCallback() {
    if (this._tslAbort) this._tslAbort.abort();
    this._tslAbort = null;
  }
  // Señal que se aborta al desconectar el elemento (undefined si no está conectado)
  get signal() {
    return this._tslAbort ? this._tslAbort.signal : void 0;
  }
  listen(target, type, handler, options) {
    const opts = typeof options === "boolean" ? { capture: options } : { ...options };
    (this._tslListeners ||= []).push([target, type, handler, opts]);
    if (this._tslAbort) target.addEventListener(type, handler, { ...opts, signal: this._tslAbort.signal });
  }
  _tslAttach() {
    if (this._tslAbort) return;
    this._tslAbort = new AbortController();
    const { signal } = this._tslAbort;
    (this._tslListeners || []).forEach(([target, type, handler, opts]) => target.addEventListener(type, handler, { ...opts, signal }));
  }
  setup() {
  }
  reconnected() {
  }
};
var define = (name, ctor) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
};
var isRtl = (el) => getComputedStyle(el || document.documentElement).direction === "rtl";
function moveFocus(items, current, key, { horizontal = false } = {}) {
  const rtl = horizontal && current && isRtl(current);
  const prevKey = horizontal ? rtl ? "ArrowRight" : "ArrowLeft" : "ArrowUp";
  const nextKey = horizontal ? rtl ? "ArrowLeft" : "ArrowRight" : "ArrowDown";
  const idx = items.indexOf(current);
  let next = null;
  if (key === nextKey) next = items[(idx + 1) % items.length];
  else if (key === prevKey) next = items[(idx - 1 + items.length) % items.length];
  else if (key === "Home") next = items[0];
  else if (key === "End") next = items[items.length - 1];
  return next;
}
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var normalize = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
var pad = (n) => String(n).padStart(2, "0");
var toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
var fromISO = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
var liveRegion = null;
function announce(text) {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.className = "tsl-sr-only";
    liveRegion.setAttribute("aria-live", "assertive");
    liveRegion.setAttribute("role", "status");
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = "";
  setTimeout(() => liveRegion.textContent = text, 20);
}

export {
  VERSION,
  nextId,
  emit,
  storage,
  TslElement,
  define,
  isRtl,
  moveFocus,
  clamp,
  normalize,
  pad,
  toISO,
  fromISO,
  announce
};
