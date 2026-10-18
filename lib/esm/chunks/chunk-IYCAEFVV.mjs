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
  fromISO
} from "./chunk-O4IHLMQS.mjs";

// src/components/date-picker.js
var TslDatePicker = class extends TslFormElement {
  setup() {
    this.range = this.hasAttribute("range");
    this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
    this.initial = this.getAttribute("value") || "";
    this.val = this.initial;
    this.build();
    this.sync(false);
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
    this.trigger.innerHTML = `<svg class="tsl-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="tsl-trigger__value"></span>`;
    this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
    this.wrap.appendChild(this.trigger);
    this.clearBtn = document.createElement("button");
    this.clearBtn.type = "button";
    this.clearBtn.className = "tsl-trigger__clear";
    this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar fecha");
    this.clearBtn.textContent = "✕";
    this.clearBtn.hidden = true;
    if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);
    this.panel = document.createElement("div");
    this.panel.className = "tsl-popover__panel tsl-date__panel";
    this.panel.setAttribute("popover", "manual");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-label", this.getAttribute("label") || (this.range ? "Elegir intervalo de fechas" : "Elegir fecha"));
    this.cal = document.createElement("tsl-calendar");
    ["locale", "week-start", "min", "max"].forEach((a) => this.hasAttribute(a) && this.cal.setAttribute(a, this.getAttribute(a)));
    if (this.range) this.cal.setAttribute("mode", "range");
    this.cal.setAttribute("months", this.getAttribute("months") || (this.range ? "2" : "1"));
    if (this.val) this.cal.setAttribute("value", this.val);
    this.panel.appendChild(this.cal);
    this.append(this.wrap, this.panel);
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
    this.cal.addEventListener("tsl-change", (e) => {
      e.stopPropagation();
      if (this.range && !e.detail.complete) return;
      this.set(e.detail.value, true);
      this.close(true);
    });
    this.clearBtn.addEventListener("click", () => {
      this.set("", true);
      this.trigger.focus();
    });
  }
  get isOpen() {
    return Boolean(this.panel) && this.panel.matches(":popover-open");
  }
  get value() {
    return this.val;
  }
  set value(v) {
    this.set(v || "", false);
  }
  get start() {
    return this.val.split("/")[0] || "";
  }
  get end() {
    return this.range ? this.val.split("/")[1] || "" : "";
  }
  set(v, fire) {
    this.val = v;
    if (this.cal._tslReady) this.cal.value = v;
    else if (v) this.cal.setAttribute("value", v);
    else this.cal.removeAttribute("value");
    this.sync(fire);
  }
  reset() {
    this.set(this.initial, false);
  }
  format(iso) {
    const d = fromISO(iso);
    return d ? new Intl.DateTimeFormat(this.locale, { dateStyle: this.getAttribute("date-style") || "medium" }).format(d) : "";
  }
  sync(fire) {
    const [a, b] = this.val.split("/");
    this.valueEl.classList.toggle("is-placeholder", !a);
    this.valueEl.textContent = a ? this.range ? `${this.format(a)} – ${this.format(b)}` : this.format(a) : this.getAttribute("placeholder") || (this.range ? "Elige un intervalo" : "Elige una fecha");
    this.clearBtn.hidden = !a;
    this.syncDisabled();
    this.publish(a ? this.val : null, !a, this.trigger);
    if (fire) emit(this, "tsl-change", { value: this.val, start: this.start, end: this.end });
  }
  syncDisabled() {
    if (!this.trigger) return;
    this.trigger.disabled = this.isDisabled;
    this.clearBtn.disabled = this.isDisabled;
    if (this.isDisabled) this.close();
  }
  open() {
    if (this.isDisabled || this.isOpen) return;
    this.panel.showPopover();
    position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.trigger.setAttribute("aria-expanded", "true");
    this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
    const day = this.cal.querySelector('.tsl-cal__day[tabindex="0"]');
    if (day) day.focus();
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
define("tsl-date-picker", TslDatePicker);

export {
  TslDatePicker
};
