/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  announce,
  define,
  emit
} from "./chunk-O4IHLMQS.mjs";

// src/components/branch.js
var TslBranch = class extends TslElement {
  setup() {
    this.selector = this.querySelector(".tsl-branch__selector");
    if (!this.selector) {
      this.selector = document.createElement("div");
      this.selector.className = "tsl-branch__selector";
      this.appendChild(this.selector);
    }
    this.selector.setAttribute("role", "group");
    this.selector.setAttribute("aria-label", this.getAttribute("label") || "Versiones");
    const button = (cls, label, text, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle ${cls}`;
      b.setAttribute("aria-label", label);
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    };
    this.prevBtn = button("tsl-branch__prev", this.getAttribute("prev-label") || "Versión anterior", "‹", () => this.prev());
    this.nextBtn = button("tsl-branch__next", this.getAttribute("next-label") || "Versión siguiente", "›", () => this.next());
    this.counter = document.createElement("span");
    this.counter.className = "tsl-branch__count";
    this.selector.replaceChildren(this.prevBtn, this.counter, this.nextBtn);
    const start = parseInt(this.getAttribute("index"), 10);
    this._index = Number.isNaN(start) ? this.items.length - 1 : start;
    this.known = this.items.length;
    this.mutations = new MutationObserver(() => {
      const n = this.items.length;
      if (n > this.known) this.goTo(n - 1, n > 1);
      else this.paint();
      this.known = n;
    });
    this.mutations.observe(this, { childList: true });
    this.paint();
  }
  disconnectedCallback() {
    if (this.mutations) this.mutations.disconnect();
    this._tslReady = false;
  }
  get items() {
    return Array.from(this.querySelectorAll(":scope > .tsl-branch__item"));
  }
  get count() {
    return this.items.length;
  }
  get index() {
    return this._index || 0;
  }
  set index(v) {
    this.goTo(v, false);
  }
  /** Muestra la versión `i` (0 = la primera); con `fire` emite `tsl-change`. */
  goTo(i, fire = true) {
    const n = this.count;
    if (!n) return;
    const next = (i % n + n) % n;
    const changed = next !== this._index;
    this._index = next;
    this.paint();
    if (changed && fire) {
      announce(this.counter.textContent);
      emit(this, "tsl-change", { index: next, count: n });
    }
  }
  next() {
    this.goTo(this.index + 1);
  }
  prev() {
    this.goTo(this.index - 1);
  }
  paint() {
    const items = this.items;
    const n = items.length;
    if (this._index >= n) this._index = Math.max(0, n - 1);
    items.forEach((item, i) => item.hidden = i !== this._index);
    this.counter.textContent = (this.getAttribute("count-label") || "{n} de {total}").replace("{n}", this._index + 1).replace("{total}", n);
    this.selector.hidden = n < 2;
    this.setAttribute("data-count", String(n));
  }
};
define("tsl-branch", TslBranch);

export {
  TslBranch
};
