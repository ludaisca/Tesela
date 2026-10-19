/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  announce,
  define,
  emit
} from "./chunk-LW5JCRG7.mjs";

// src/components/wizard.js
var FIELDS = "input:not([type=hidden]), select, textarea, [name]:not(input, select, textarea, button, fieldset)";
var TslWizard = class extends TslElement {
  setup() {
    this.form = this.querySelector("form");
    if (!this.form) return;
    this.steps = Array.from(this.form.querySelectorAll(".tsl-wizard__step"));
    this.btn = {
      prev: this.form.querySelector("[data-prev]"),
      next: this.form.querySelector("[data-next]"),
      submit: this.form.querySelector("[data-submit]")
    };
    this.form.noValidate = true;
    this.indicator = this.querySelector(":scope > .tsl-steps");
    if (!this.indicator) {
      this.indicator = document.createElement("ol");
      this.indicator.className = "tsl-steps";
      this.prepend(this.indicator);
    }
    this.indicator.classList.add("tsl-wizard__steps");
    this.indicator.setAttribute("aria-label", this.getAttribute("label") || "Pasos");
    this.indicator.replaceChildren(
      ...this.steps.map((step, i) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tsl-wizard__jump";
        b.textContent = step.dataset.title || `Paso ${i + 1}`;
        b.addEventListener("click", () => this.goTo(i));
        li.appendChild(b);
        return li;
      })
    );
    this.steps.forEach((step, i) => {
      step.setAttribute("role", "group");
      step.setAttribute("aria-label", step.dataset.title || `Paso ${i + 1}`);
      const heading = step.querySelector("legend, h2, h3, h4");
      if (heading) heading.tabIndex = -1;
    });
    const start = parseInt(this.getAttribute("index"), 10);
    this.active = Number.isNaN(start) ? 0 : Math.max(0, Math.min(this.steps.length - 1, start));
    this.furthest = this.active;
    if (this.btn.prev) this.btn.prev.addEventListener("click", () => this.prev());
    if (this.btn.next) this.btn.next.addEventListener("click", () => this.next());
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit();
    });
    this.form.addEventListener("input", (e) => e.target.removeAttribute && e.target.removeAttribute("aria-invalid"));
    this.form.addEventListener("change", (e) => {
      if (e.target.removeAttribute) e.target.removeAttribute("aria-invalid");
      emit(this, "tsl-change", { values: this.values });
    });
    this.form.addEventListener("keydown", (e) => {
      const t = e.target;
      if (e.defaultPrevented || e.key !== "Enter" || e.isComposing || t.tagName === "TEXTAREA" || t.tagName === "BUTTON") return;
      if (!t.matches("input")) return;
      e.preventDefault();
      if (this.isLast) this.form.requestSubmit();
      else this.next();
    });
    this.form.addEventListener("reset", () => setTimeout(() => this.restart()));
    this.paint();
  }
  get index() {
    return this.active || 0;
  }
  get count() {
    return this.steps ? this.steps.length : 0;
  }
  get isLast() {
    return this.index === this.count - 1;
  }
  /** Valores del formulario: { nombre: valor | [valores] }. */
  get values() {
    const out = {};
    new FormData(this.form).forEach((v, k) => {
      out[k] = k in out ? [].concat(out[k], v) : v;
    });
    return out;
  }
  fields(step) {
    return Array.from(step.querySelectorAll(FIELDS)).filter((f) => typeof f.checkValidity === "function" && !f.disabled);
  }
  /** Comprueba un paso; con `report` marca el primer campo inválido y muestra su mensaje. */
  validate(i, report = true) {
    const step = this.steps[i];
    if (!step) return true;
    const bad = this.fields(step).filter((f) => !f.checkValidity());
    bad.forEach((f) => f.setAttribute && f.setAttribute("aria-invalid", "true"));
    if (bad.length && report) {
      if (typeof bad[0].reportValidity === "function") bad[0].reportValidity();
      if (typeof bad[0].focus === "function") bad[0].focus();
    }
    return bad.length === 0;
  }
  /** Va a un paso: hacia atrás siempre; hacia delante solo si los anteriores son válidos. */
  goTo(i, focus = true) {
    const target = Math.max(0, Math.min(this.count - 1, i));
    if (target === this.active) return true;
    if (target > this.active) {
      for (let s = this.active; s < target; s++) {
        if (!this.validate(s, true)) {
          this.show(s, false);
          return false;
        }
      }
    }
    this.show(target, focus);
    return true;
  }
  show(i, focus) {
    const changed = i !== this.active;
    this.active = i;
    this.furthest = Math.max(this.furthest, i);
    this.paint();
    if (!changed) return;
    const step = this.steps[i];
    if (focus) {
      const heading = step.querySelector("legend, h2, h3, h4");
      const target = heading || this.fields(step)[0];
      if (target) target.focus({ preventScroll: false });
    }
    const title = step.dataset.title || "";
    announce((this.getAttribute("step-label") || "Paso {n} de {total}: {title}").replace("{n}", i + 1).replace("{total}", this.count).replace("{title}", title));
    emit(this, "tsl-step", { index: i, count: this.count, title });
  }
  next() {
    return this.goTo(this.active + 1);
  }
  prev() {
    return this.goTo(this.active - 1);
  }
  /** Revisa todos los pasos (lleva al primero con errores) y emite `tsl-submit` con los valores. */
  submit() {
    for (let i = 0; i < this.count; i++) {
      if (!this.validate(i, false)) {
        this.show(i, true);
        this.validate(i, true);
        return false;
      }
    }
    this.toggleAttribute("data-complete", true);
    emit(this, "tsl-submit", { values: this.values });
    return true;
  }
  /** Vuelve al primer paso y olvida el avance (no borra los campos; para eso, `form.reset()`). */
  restart() {
    this.furthest = 0;
    this.removeAttribute("data-complete");
    this.form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
    this.show(0, false);
    this.paint();
  }
  paint() {
    this.steps.forEach((step, i) => step.hidden = i !== this.active);
    Array.from(this.indicator.children).forEach((li, i) => {
      const b = li.firstElementChild;
      li.toggleAttribute("data-current", i === this.active);
      if (i < this.active || i <= this.furthest && i !== this.active) li.setAttribute("data-state", "done");
      else li.removeAttribute("data-state");
      b.disabled = i === this.active || i > this.furthest + 1;
      if (i === this.active) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    if (this.btn.prev) this.btn.prev.hidden = this.active === 0;
    if (this.btn.next) this.btn.next.hidden = this.isLast;
    if (this.btn.submit) this.btn.submit.hidden = !this.isLast;
    this.setAttribute("data-step", String(this.active));
  }
};
define("tsl-wizard", TslWizard);

export {
  TslWizard
};
