/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslFormElement
} from "./chunk-APNO5X2D.mjs";
import {
  dismissOnOutside,
  position,
  trackPosition
} from "./chunk-5JUXMGRM.mjs";
import {
  define,
  emit,
  pad
} from "./chunk-O4IHLMQS.mjs";

// src/components/time-picker.js
var TslTimePicker = class extends TslFormElement {
  setup() {
    this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
    this.step = Math.max(1, parseInt(this.getAttribute("step") || "5", 10));
    this.h12 = this.hasAttribute("hour12");
    this.initial = this.getAttribute("value") || "";
    const t = this.parse(this.initial);
    this.h = t ? t[0] : null;
    this.m = t ? t[1] : null;
    this.period = this.h !== null && this.h >= 12 ? "PM" : "AM";
    this.build();
    this.sync(false);
  }
  parse(v) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(v || "");
    return m && +m[1] < 24 && +m[2] < 60 ? [+m[1], +m[2]] : null;
  }
  minutesOf(attr) {
    const t = this.parse(this.getAttribute(attr));
    return t ? t[0] * 60 + t[1] : null;
  }
  outOfRange(total) {
    const lo = this.minutesOf("min");
    const hi = this.minutesOf("max");
    return lo !== null && total < lo || hi !== null && total > hi;
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
    this.trigger.innerHTML = `<svg class="tsl-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="tsl-trigger__value"></span>`;
    this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
    this.wrap.appendChild(this.trigger);
    this.clearBtn = document.createElement("button");
    this.clearBtn.type = "button";
    this.clearBtn.className = "tsl-trigger__clear";
    this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar hora");
    this.clearBtn.textContent = "✕";
    this.clearBtn.hidden = true;
    if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);
    this.panel = document.createElement("div");
    this.panel.className = "tsl-popover__panel tsl-time__panel";
    this.panel.setAttribute("popover", "manual");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir hora");
    this.cols = document.createElement("div");
    this.cols.className = "tsl-time__cols";
    this.panel.appendChild(this.cols);
    this.append(this.wrap, this.panel);
    this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open());
    this.trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    });
    this.cols.addEventListener("click", (e) => {
      const opt = e.target.closest(".tsl-time__opt");
      if (opt && !opt.disabled) this.pick(opt.closest(".tsl-time__col").dataset.col, opt.dataset.v, true);
    });
    this.cols.addEventListener("keydown", (e) => this.onKey(e));
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
    this.clearBtn.addEventListener("click", () => {
      this.h = this.m = null;
      this.sync(true);
      this.trigger.focus();
    });
  }
  get isOpen() {
    return Boolean(this.panel) && this.panel.matches(":popover-open");
  }
  get value() {
    return this.h === null ? "" : `${pad(this.h)}:${pad(this.m === null ? 0 : this.m)}`;
  }
  set value(v) {
    const t = this.parse(v);
    this.h = t ? t[0] : null;
    this.m = t ? t[1] : null;
    if (t) this.period = t[0] >= 12 ? "PM" : "AM";
    this.sync(false);
  }
  reset() {
    this.value = this.initial;
  }
  // ---- Columnas -------------------------------------------------------------
  renderCols() {
    const hours = [];
    if (this.h12) for (let i = 1; i <= 12; i++) hours.push(i);
    else for (let i = 0; i < 24; i++) hours.push(i);
    const mins = [];
    for (let i = 0; i < 60; i += this.step) mins.push(i);
    if (this.m !== null && !mins.includes(this.m)) mins.push(this.m), mins.sort((a, b) => a - b);
    const hourSel = this.h === null ? null : this.h12 ? this.h % 12 || 12 : this.h;
    const col = (key, label, items) => `<div class="tsl-time__col" role="listbox" aria-label="${label}" data-col="${key}">${items.map((it) => `<button type="button" role="option" class="tsl-time__opt" data-v="${it.v}" aria-selected="${it.sel}" tabindex="${it.sel ? 0 : -1}"${it.off ? " disabled" : ""}>${it.t}</button>`).join("")}</div>`;
    const h24 = (n) => this.h12 ? n % 12 + (this.period === "PM" ? 12 : 0) : n;
    const hItems = hours.map((n) => {
      const t = h24(n);
      return { v: n, t: pad(n), sel: n === hourSel, off: this.outOfRange(t * 60 + 59) && this.outOfRange(t * 60) };
    });
    const mItems = mins.map((n) => ({ v: n, t: pad(n), sel: n === this.m, off: this.h !== null && this.outOfRange(this.h * 60 + n) }));
    let html = col("h", this.getAttribute("hour-label") || "Hora", hItems) + col("m", this.getAttribute("minute-label") || "Minutos", mItems);
    if (this.h12) {
      html += col("p", "AM/PM", ["AM", "PM"].map((p) => ({ v: p, t: p, sel: p === this.period, off: false })));
    }
    this.cols.innerHTML = html;
    this.cols.querySelectorAll(".tsl-time__col").forEach((c) => {
      if (!c.querySelector('[tabindex="0"]')) {
        const first = c.querySelector(".tsl-time__opt:not([disabled])");
        if (first) first.tabIndex = 0;
      }
    });
  }
  pick(colKey, v, userClick) {
    if (colKey === "h") {
      const n = +v;
      this.h = this.h12 ? n % 12 + (this.period === "PM" ? 12 : 0) : n;
      if (this.m === null) this.m = 0;
    } else if (colKey === "m") {
      this.m = +v;
      if (this.h === null) this.h = this.h12 && this.period === "PM" ? 12 : 0;
    } else {
      this.period = v;
      if (this.h !== null) this.h = this.h % 12 + (v === "PM" ? 12 : 0);
    }
    this.sync(true);
    this.renderCols();
    const sel = this.cols.querySelector(`[data-col="${colKey}"] [aria-selected="true"]`);
    if (sel) sel.focus();
    if (userClick && (colKey === "m" || colKey === "p")) this.close(true);
  }
  onKey(e) {
    const opt = e.target.closest(".tsl-time__opt");
    if (!opt) return;
    const colEl = opt.closest(".tsl-time__col");
    const key = colEl.dataset.col;
    const opts = Array.from(colEl.querySelectorAll(".tsl-time__opt:not([disabled])"));
    const i = opts.indexOf(opt);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = opts[Math.max(0, Math.min(opts.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
      if (next && next !== opt) this.pick(key, next.dataset.v, false);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      this.pick(key, opts[e.key === "Home" ? 0 : opts.length - 1].dataset.v, false);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const cols = Array.from(this.cols.querySelectorAll(".tsl-time__col"));
      const target = cols[cols.indexOf(colEl) + (e.key === "ArrowRight" ? 1 : -1)];
      if (target) (target.querySelector('[aria-selected="true"]') || target.querySelector(".tsl-time__opt:not([disabled])")).focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (opt.disabled) return;
      this.pick(key, opt.dataset.v, true);
      if (key === "h") {
        const m = this.cols.querySelector('[data-col="m"] [aria-selected="true"]') || this.cols.querySelector('[data-col="m"] .tsl-time__opt');
        if (m) m.focus();
      }
    }
  }
  // ---- Presentación -----------------------------------------------------------
  format() {
    if (this.h === null) return "";
    return new Intl.DateTimeFormat(this.locale, { hour: "numeric", minute: "2-digit", hour12: this.h12 }).format(new Date(2e3, 0, 1, this.h, this.m || 0));
  }
  sync(fire) {
    this.valueEl.classList.toggle("is-placeholder", this.h === null);
    this.valueEl.textContent = this.h === null ? this.getAttribute("placeholder") || "Elige una hora" : this.format();
    this.clearBtn.hidden = this.h === null;
    this.syncDisabled();
    this.publish(this.h === null ? null : this.value, this.h === null, this.trigger);
    if (fire) emit(this, "tsl-change", { value: this.value });
  }
  syncDisabled() {
    if (!this.trigger) return;
    this.trigger.disabled = this.isDisabled;
    this.clearBtn.disabled = this.isDisabled;
    if (this.isDisabled) this.close();
  }
  open() {
    if (this.isDisabled || this.isOpen) return;
    this.renderCols();
    this.panel.showPopover();
    position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.trigger.setAttribute("aria-expanded", "true");
    this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
    this.cols.querySelectorAll(".tsl-time__col").forEach((c) => {
      const sel = c.querySelector('[aria-selected="true"]');
      if (sel) c.scrollTop = sel.offsetTop - c.clientHeight / 2 + sel.offsetHeight / 2;
    });
    const first = this.cols.querySelector('[aria-selected="true"]') || this.cols.querySelector(".tsl-time__opt:not([disabled])");
    if (first) first.focus({ preventScroll: true });
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
define("tsl-time-picker", TslTimePicker);

export {
  TslTimePicker
};
