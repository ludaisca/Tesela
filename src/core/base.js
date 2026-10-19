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

// Ciclo de vida común:
//   setup()        una sola vez, cuando los hijos ya están en el DOM (aunque el script vaya en <head>)
//   reconnected()  cada vez que el elemento vuelve al documento después de haberse quitado
//   attributeChanged(name, antes, ahora)  cambio de un atributo observado después de setup()
//   listen()       escuchas en document/window ligadas a la conexión: se quitan al desconectar y vuelven
//                  al reconectar. Para las temporales (mientras un panel está abierto) está `this.signal`.
// Las subclases que definan disconnectedCallback() deben llamar a super.disconnectedCallback().
export class TslElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, before, after) {
    // Solo tras terminar setup(): los atributos que el propio setup() escribe no cuentan como cambios
    if (before === after || !this._tslBuilt) return;
    this.attributeChanged(name, before, after);
  }

  attributeChanged() {}

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
    return this._tslAbort ? this._tslAbort.signal : undefined;
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

  setup() {}

  reconnected() {}
}

export const define = (name, ctor) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
};

// Dirección de escritura efectiva de un elemento (atributo `dir` o CSS heredados)
export const isRtl = (el) => getComputedStyle(el || document.documentElement).direction === "rtl";

// Roving focus for lists of items driven by arrow keys (en RTL las flechas horizontales se invierten)
export function moveFocus(items, current, key, { horizontal = false } = {}) {
  const rtl = horizontal && current && isRtl(current);
  const prevKey = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
  const nextKey = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
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
