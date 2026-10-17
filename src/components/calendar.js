import { TslElement, define, emit, fromISO, toISO } from "../core/base.js";


export class TslCalendar extends TslElement {
  setup() {
    this.locale = this.getAttribute("locale") || document.documentElement.lang || undefined;
    this.weekStart = parseInt(this.getAttribute("week-start") || "1", 10) % 7;
    this.mode = this.getAttribute("mode") === "range" ? "range" : "single";
    this.months = Math.max(1, parseInt(this.getAttribute("months") || "1", 10));
    this.min = this.getAttribute("min") || "";
    this.max = this.getAttribute("max") || "";
    this.selected = null;
    this.start = null;
    this.end = null;
    this.hover = null;
    this.parseValue(this.getAttribute("value"));
    const base = this.selected || this.start || new Date();
    this.view = new Date(base.getFullYear(), base.getMonth(), 1);
    this.focusDate = new Date(base);
    this.render(false);

    this.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-cal-nav]");
      if (nav) {
        this.shift(parseInt(nav.dataset.calNav, 10));
        return;
      }
      const day = e.target.closest(".tsl-cal__day[data-date]");
      if (day && !day.disabled) this.pick(fromISO(day.dataset.date));
    });
    this.addEventListener("pointerover", (e) => {
      if (this.mode !== "range" || !this.start || this.end) return;
      const day = e.target.closest(".tsl-cal__day[data-date]");
      this.hover = day ? fromISO(day.dataset.date) : null;
      this.paintPreview();
    });
    this.addEventListener("pointerleave", () => {
      if (this.hover) {
        this.hover = null;
        this.paintPreview();
      }
    });
    this.addEventListener("keydown", (e) => {
      if (!e.target.classList.contains("tsl-cal__day")) return;
      const d = fromISO(e.target.dataset.date);
      if (!d) return;
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (steps[e.key] !== undefined) d.setDate(d.getDate() + steps[e.key]);
      else if (e.key === "PageUp" || e.key === "PageDown") {
        const dir = e.key === "PageUp" ? -1 : 1;
        const day = d.getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + (e.shiftKey ? 12 * dir : dir));
        d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
      } else return;
      e.preventDefault();
      if (this.isDisabled(toISO(d))) return;
      this.focusDate = d;
      // Mantiene la fecha enfocada dentro de los meses visibles
      const first = this.view.getFullYear() * 12 + this.view.getMonth();
      const idx = d.getFullYear() * 12 + d.getMonth();
      if (idx < first) this.view = new Date(d.getFullYear(), d.getMonth(), 1);
      else if (idx > first + this.months - 1) this.view = new Date(d.getFullYear(), d.getMonth() - (this.months - 1), 1);
      this.render(true);
    });
  }

  parseValue(v) {
    if (this.mode === "range") {
      const [a, b] = String(v || "").split("/");
      this.start = fromISO(a);
      this.end = fromISO(b);
    } else {
      this.selected = fromISO(v);
    }
  }

  get value() {
    if (this.mode === "range") return this.start && this.end ? `${toISO(this.start)}/${toISO(this.end)}` : "";
    return this.selected ? toISO(this.selected) : "";
  }

  set value(v) {
    this.parseValue(v);
    const ref = this.selected || this.start;
    if (ref) {
      this.view = new Date(ref.getFullYear(), ref.getMonth(), 1);
      this.focusDate = new Date(ref);
    }
    if (this._tslReady) this.render(false);
  }

  isDisabled(iso) {
    return Boolean((this.min && iso < this.min) || (this.max && iso > this.max));
  }

  shift(months) {
    this.view = new Date(this.view.getFullYear(), this.view.getMonth() + months, 1);
    this.focusDate = new Date(this.view);
    this.render(false);
  }

  pick(date) {
    if (!date || this.isDisabled(toISO(date))) return;
    this.focusDate = date;
    if (this.mode === "range") {
      if (!this.start || this.end) {
        this.start = date;
        this.end = null;
      } else if (date < this.start) {
        this.start = date;
      } else {
        this.end = date;
      }
      this.hover = null;
      this.render(true);
      emit(this, "tsl-change", {
        start: toISO(this.start),
        end: this.end ? toISO(this.end) : null,
        value: this.value,
        complete: Boolean(this.end)
      });
      return;
    }
    this.selected = date;
    if (date.getMonth() !== this.view.getMonth()) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
    this.render(true);
    emit(this, "tsl-change", { value: toISO(date), date });
  }

  // Vista previa del rango mientras el cursor se mueve (sin volver a renderizar)
  paintPreview() {
    const a = this.start && toISO(this.start);
    const b = this.hover && toISO(this.hover);
    this.querySelectorAll(".tsl-cal__day[data-date]").forEach((btn) => {
      const iso = btn.dataset.date;
      const on = Boolean(a && b && !this.end && iso > (a < b ? a : b) && iso < (a < b ? b : a));
      btn.classList.toggle("is-preview", on);
    });
  }

  renderMonth(view, idx, total) {
    const y = view.getFullYear();
    const m = view.getMonth();
    const title = new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(view);
    const dowFmt = new Intl.DateTimeFormat(this.locale, { weekday: "narrow" });
    const fullFmt = new Intl.DateTimeFormat(this.locale, { dateStyle: "full" });
    const todayISO = toISO(new Date());
    const focusISO = toISO(this.focusDate);
    const sISO = this.mode === "range" ? this.start && toISO(this.start) : this.selected && toISO(this.selected);
    const eISO = this.mode === "range" && this.end ? toISO(this.end) : null;

    const offset = (new Date(y, m, 1).getDay() - this.weekStart + 7) % 7;
    const start = new Date(y, m, 1 - offset);

    let dows = "";
    for (let i = 0; i < 7; i++) {
      // 2023-01-01 fue domingo
      dows += `<span class="tsl-cal__dow">${dowFmt.format(new Date(2023, 0, 1 + ((this.weekStart + i) % 7)))}</span>`;
    }

    let cells = "";
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const outside = d.getMonth() !== m;
      // Con varios meses, los días de otros meses se dejan en blanco para no duplicarlos
      if (outside && total > 1) {
        cells += `<span class="tsl-cal__day is-blank" aria-hidden="true"></span>`;
        continue;
      }
      const iso = toISO(d);
      const pressed = iso === sISO || iso === eISO;
      const cls = [
        "tsl-cal__day",
        outside ? "is-outside" : "",
        iso === todayISO ? "is-today" : "",
        iso === sISO && eISO ? "is-range-start" : "",
        iso === eISO ? "is-range-end" : "",
        sISO && eISO && iso > sISO && iso < eISO ? "in-range" : ""
      ].join(" ");
      const off = this.isDisabled(iso);
      cells += `<button type="button" class="${cls}" data-date="${iso}" aria-label="${fullFmt.format(d)}" aria-pressed="${pressed}" tabindex="${iso === focusISO && !off ? 0 : -1}"${off ? " disabled" : ""}>${d.getDate()}</button>`;
    }

    const prev = `<button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm tsl-btn--icon" data-cal-nav="-1" aria-label="Mes anterior">‹</button>`;
    const next = `<button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm tsl-btn--icon" data-cal-nav="1" aria-label="Mes siguiente">›</button>`;
    const spacer = `<span class="tsl-cal__nav-spacer" aria-hidden="true"></span>`;
    return `<div class="tsl-cal__month">
      <div class="tsl-cal__head">${idx === 0 ? prev : spacer}<span aria-live="polite">${title}</span>${idx === total - 1 ? next : spacer}</div>
      <div class="tsl-cal__grid">${dows}${cells}</div>
    </div>`;
  }

  render(keepFocus) {
    let html = "";
    for (let i = 0; i < this.months; i++) {
      const view = new Date(this.view.getFullYear(), this.view.getMonth() + i, 1);
      html += this.renderMonth(view, i, this.months);
    }
    this.innerHTML = `<div class="tsl-cal__months">${html}</div>`;

    // Si el día enfocado no es alcanzable por teclado, el primer día habilitado lo reemplaza
    if (!this.querySelector('.tsl-cal__day[tabindex="0"]')) {
      const first = this.querySelector(".tsl-cal__day[data-date]:not([disabled]):not(.is-outside)");
      if (first) first.tabIndex = 0;
    }
    if (keepFocus) {
      const target = this.querySelector(`[data-date="${toISO(this.focusDate)}"]:not(.is-outside), [data-date="${toISO(this.focusDate)}"]`);
      if (target && !target.disabled) target.focus();
    }
  }
}

define("tsl-calendar", TslCalendar);
