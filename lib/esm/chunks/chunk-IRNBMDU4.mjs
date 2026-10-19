/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit
} from "./chunk-O4IHLMQS.mjs";

// src/components/questionnaire.js
var TslQuestionnaire = class extends TslElement {
  setup() {
    this.form = this.querySelector("form");
    if (!this.form) return;
    this.items = Array.from(this.form.querySelectorAll(":scope > .tsl-questionnaire__item"));
    this.progress = this.form.querySelector("[data-progress]");
    this.btn = {
      prev: this.form.querySelector("[data-prev]"),
      skip: this.form.querySelector("[data-skip]"),
      next: this.form.querySelector("[data-next]"),
      submit: this.form.querySelector("[data-submit]")
    };
    this.form.noValidate = true;
    this.active = 0;
    if (this.progress) {
      this.progress.setAttribute("role", "status");
      this.progress.classList.add("tsl-questionnaire__progress");
    }
    this.items.forEach((item, i) => {
      const err = item.querySelector(".tsl-questionnaire__error");
      if (err) {
        err.id = err.id || `${this.id || "tsl-q"}-err-${i}`;
        err.setAttribute("role", "alert");
      }
      if (this.shortcuts) {
        item.querySelectorAll("input[type=radio], input[type=checkbox]").forEach((input, n) => {
          if (n > 8) return;
          input.setAttribute("aria-keyshortcuts", String(n + 1));
          const label = input.closest("label");
          if (label) {
            const key = document.createElement("kbd");
            key.className = "tsl-kbd tsl-questionnaire__key";
            key.setAttribute("aria-hidden", "true");
            key.textContent = String(n + 1);
            label.appendChild(key);
          }
        });
      }
    });
    if (this.btn.prev) this.btn.prev.addEventListener("click", () => this.prev());
    if (this.btn.next) this.btn.next.addEventListener("click", () => this.next());
    if (this.btn.skip) this.btn.skip.addEventListener("click", () => this.skip());
    this.form.addEventListener("change", (e) => {
      this.clearError(this.items[this.active]);
      if (e.target.closest(".tsl-questionnaire__item")) this.paint();
    });
    this.form.addEventListener("input", () => this.clearError(this.items[this.active]));
    this.form.addEventListener("keydown", (e) => this.onKey(e));
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit();
    });
    this.form.addEventListener("reset", () => setTimeout(() => this.goTo(0, false)));
    this.paint();
  }
  get shortcuts() {
    return this.getAttribute("shortcuts") !== "off";
  }
  get activeIndex() {
    return this.applicable().indexOf(this.items[this.active]);
  }
  get count() {
    return this.applicable().length;
  }
  /** Respuestas actuales: { nombre: valor | [valores] }, solo de las preguntas que aplican. */
  get answers() {
    const out = {};
    const shown = this.applicable();
    new FormData(this.form).forEach((v, k) => {
      const owner = this.items.find((item) => item.querySelector(`[name="${CSS.escape(k)}"]`));
      if (owner && !shown.includes(owner)) return;
      if (k in out) out[k] = [].concat(out[k], v);
      else out[k] = v;
    });
    return out;
  }
  value(name) {
    return Array.from(new FormData(this.form).getAll(name)).map(String);
  }
  applicable() {
    return this.items.filter((item) => {
      const when = item.dataset.when;
      if (!when) return true;
      const [name, options = ""] = when.split("=");
      const got = this.value(name.trim());
      return options.split("|").some((o) => got.includes(o.trim()));
    });
  }
  isAnswered(item) {
    return Array.from(item.querySelectorAll("input, textarea, select")).some((f) => {
      if (f.type === "radio" || f.type === "checkbox") return f.checked;
      return String(f.value).trim() !== "";
    });
  }
  isRequired(item) {
    return item.hasAttribute("data-required");
  }
  clearError(item) {
    if (!item) return;
    item.removeAttribute("aria-invalid");
    const err = item.querySelector(".tsl-questionnaire__error");
    if (err) err.textContent = "";
  }
  /** Muestra el aviso de obligatoria en la pregunta y enfoca su primer campo; devuelve true si falta la respuesta. */
  flag(item) {
    if (!this.isRequired(item) || this.isAnswered(item)) return false;
    item.setAttribute("aria-invalid", "true");
    const err = item.querySelector(".tsl-questionnaire__error");
    if (err) err.textContent = item.dataset.error || "Elige una respuesta para continuar.";
    const field = item.querySelector("input, textarea, select");
    if (field) field.focus();
    return true;
  }
  goTo(index, focus = true) {
    const list = this.applicable();
    const item = list[Math.max(0, Math.min(list.length - 1, index))];
    if (!item) return;
    this.active = this.items.indexOf(item);
    this.paint();
    if (focus) {
      const field = item.querySelector("input:checked, input, textarea, select");
      if (field) field.focus();
    }
    emit(this, "tsl-step", { index: this.activeIndex, count: this.count, name: item.dataset.name || "" });
  }
  next() {
    const item = this.items[this.active];
    if (this.flag(item)) return false;
    this.goTo(this.activeIndex + 1);
    return true;
  }
  prev() {
    this.goTo(this.activeIndex - 1);
  }
  /** Avanza sin responder (solo las preguntas no obligatorias). */
  skip() {
    const item = this.items[this.active];
    if (this.isRequired(item)) return;
    item.setAttribute("data-skipped", "");
    this.goTo(this.activeIndex + 1);
  }
  submit() {
    for (const item of this.applicable()) {
      if (this.flag(item)) {
        this.active = this.items.indexOf(item);
        this.paint();
        return false;
      }
    }
    emit(this, "tsl-submit", { answers: this.answers });
    return true;
  }
  onKey(e) {
    const target = e.target;
    const typing = target.matches("input[type=text], input[type=search], input[type=email], input[type=number], input:not([type]), textarea");
    if (e.key === "Enter" && typing && !(target.tagName === "TEXTAREA")) {
      e.preventDefault();
      if (this.activeIndex < this.count - 1) this.next();
      else this.form.requestSubmit();
      return;
    }
    if (!this.shortcuts || typing || e.ctrlKey || e.metaKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
    const input = this.items[this.active].querySelectorAll("input[type=radio], input[type=checkbox]")[Number(e.key) - 1];
    if (!input) return;
    e.preventDefault();
    input.checked = input.type === "radio" ? true : !input.checked;
    input.focus();
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  paint() {
    const list = this.applicable();
    if (!list.includes(this.items[this.active])) this.active = this.items.indexOf(list[0]);
    this.items.forEach((item, i) => {
      item.hidden = i !== this.active;
      item.toggleAttribute("data-inactive", !list.includes(item));
    });
    const n = list.indexOf(this.items[this.active]);
    const last = n === list.length - 1;
    const optional = !this.isRequired(this.items[this.active]);
    if (this.progress) {
      this.progress.textContent = (this.getAttribute("progress-label") || "Pregunta {n} de {total}").replace("{n}", n + 1).replace("{total}", list.length);
      this.progress.style.setProperty("--tsl-q-progress", `${(n + 1) / list.length * 100}%`);
    }
    if (this.btn.prev) this.btn.prev.disabled = n <= 0;
    if (this.btn.next) this.btn.next.hidden = last;
    if (this.btn.skip) this.btn.skip.hidden = last || !optional;
    if (this.btn.submit) this.btn.submit.hidden = !last;
  }
  reset() {
    this.form.reset();
  }
};
define("tsl-questionnaire", TslQuestionnaire);

export {
  TslQuestionnaire
};
