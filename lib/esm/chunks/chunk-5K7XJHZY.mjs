/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit
} from "./chunk-O4IHLMQS.mjs";

// src/components/password.js
var PW_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
var PW_COLORS = ["var(--tsl-danger)", "var(--tsl-danger)", "var(--tsl-warning)", "var(--tsl-info)", "var(--tsl-success)"];
function passwordScore(v, min) {
  return [v.length >= min, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
}
var TslPassword = class extends TslElement {
  setup() {
    this.min = parseInt(this.getAttribute("min-length") || "8", 10);
    let input = this.querySelector("input");
    if (!input) {
      input = document.createElement("input");
      ["name", "placeholder", "required", "autocomplete", "id"].forEach((a) => {
        if (this.hasAttribute(a)) input.setAttribute(a, this.getAttribute(a));
      });
      if (!input.hasAttribute("autocomplete")) input.autocomplete = "new-password";
      if (this.getAttribute("label")) input.setAttribute("aria-label", this.getAttribute("label"));
    }
    this.input = input;
    input.type = "password";
    input.classList.add("tsl-input");
    const group = document.createElement("div");
    group.className = "tsl-input-group";
    this.toggle = document.createElement("button");
    this.toggle.type = "button";
    this.toggle.className = "tsl-btn tsl-btn--subtle tsl-btn--sm";
    this.toggle.style.margin = "3px";
    this.toggle.setAttribute("aria-pressed", "false");
    this.paintToggle(false);
    this.toggle.addEventListener("click", () => {
      const show = this.input.type === "password";
      this.input.type = show ? "text" : "password";
      this.paintToggle(show);
      this.input.focus();
    });
    group.append(input, this.toggle);
    this.textContent = "";
    this.appendChild(group);
    if (this.hasAttribute("meter")) {
      const row = document.createElement("div");
      row.className = "tsl-row tsl-password__meter";
      row.style.setProperty("--gap", "8px");
      this.meter = document.createElement("div");
      this.meter.className = "tsl-meter";
      this.meter.style.cssText = "flex:1;height:5px";
      for (let i = 0; i < 4; i++) {
        const seg = document.createElement("span");
        seg.style.setProperty("--w", "25%");
        this.meter.appendChild(seg);
      }
      this.meter.setAttribute("role", "meter");
      this.meter.setAttribute("aria-label", "Seguridad de la contraseña");
      this.meter.setAttribute("aria-valuemin", "0");
      this.meter.setAttribute("aria-valuemax", "4");
      this.labelEl = document.createElement("span");
      this.labelEl.className = "tsl-hint";
      this.labelEl.setAttribute("aria-live", "polite");
      row.append(this.meter, this.labelEl);
      this.appendChild(row);
    }
    input.addEventListener("input", () => this.update(true));
    this.update(false);
  }
  paintToggle(shown) {
    this.toggle.textContent = shown ? this.getAttribute("hide-label") || "Ocultar" : this.getAttribute("show-label") || "Mostrar";
    this.toggle.setAttribute("aria-label", shown ? "Ocultar contraseña" : "Mostrar contraseña");
    this.toggle.setAttribute("aria-pressed", String(shown));
  }
  get value() {
    return this.input.value;
  }
  update(fire) {
    const v = this.input.value;
    const score = passwordScore(v, this.min);
    if (this.meter) {
      this.meter.querySelectorAll("span").forEach((seg, i) => seg.style.setProperty("--c", v && i < score ? PW_COLORS[score] : "transparent"));
      this.meter.setAttribute("aria-valuenow", String(v ? score : 0));
      this.labelEl.textContent = v ? PW_LABELS[score] : "";
    }
    if (fire) emit(this, "tsl-change", { value: v, score });
  }
};
define("tsl-password", TslPassword);

export {
  TslPassword
};
