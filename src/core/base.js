export const VERSION = "1.4.0";
let uid = 0;
export const nextId = (prefix) => `${prefix}-${++uid}`;

export const emit = (el, name, detail) =>
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

export const storage = {
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
    } catch (_) {}
  }
};

// Runs setup() once, after children are parsed, even if the script is in <head>
export class TslElement extends HTMLElement {
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

  setup() {}
}

export const define = (name, ctor) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
};

// Roving focus for lists of items driven by arrow keys
export function moveFocus(items, current, key, { horizontal = false } = {}) {
  const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
  const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
  const idx = items.indexOf(current);
  let next = null;
  if (key === nextKey) next = items[(idx + 1) % items.length];
  else if (key === prevKey) next = items[(idx - 1 + items.length) % items.length];
  else if (key === "Home") next = items[0];
  else if (key === "End") next = items[items.length - 1];
  return next;
}

// Utilidades numéricas, de texto y de fechas compartidas
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const normalize = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};

// Región aria-live compartida para anunciar acciones (reordenar, etc.)
let liveRegion = null;
export function announce(text) {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.className = "tsl-sr-only";
    liveRegion.setAttribute("aria-live", "assertive");
    liveRegion.setAttribute("role", "status");
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = "";
  // El vaciado previo fuerza que el lector de pantalla repita mensajes iguales
  setTimeout(() => (liveRegion.textContent = text), 20);
}
