/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */

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
  connectedCallback() {
    if (this._tslReady) return;
    const go = () => {
      if (this._tslReady || !this.isConnected) return;
      this._tslReady = true;
      this.setup();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go, { once: true });
    } else {
      go();
    }
  }
  setup() {
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
