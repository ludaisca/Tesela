import { TslElement, define, emit } from "../core/base.js";

/**
 * <tsl-password meter min-length="8" name="clave" placeholder="…" required>
 * Envuelve un <input> (o lo crea) con botón mostrar/ocultar y medidor de seguridad opcional.
 * Evento tsl-change { value, score } con score de 0 a 4.
 */
const PW_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
const PW_COLORS = ["var(--tsl-danger)", "var(--tsl-danger)", "var(--tsl-warning)", "var(--tsl-info)", "var(--tsl-success)"];

function passwordScore(v, min) {
  return [v.length >= min, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
}

export class TslPassword extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "placeholder", "label", "show-label", "hide-label", "min-length"];
  }

  setup() {
    this.min = parseInt(this.getAttribute("min-length") || "8", 10);
    let input = this.querySelector("input");
    if (!input) {
      input = document.createElement("input");
      ["name", "placeholder", "required", "autocomplete", "id"].forEach((a) => {
        if (this.hasAttribute(a)) input.setAttribute(a, this.getAttribute(a));
      });
      if (!input.hasAttribute("autocomplete")) input.autocomplete = "new-password";
      this.ownInput = true;
    }
    this.input = input;
    if (this.ownInput) this.paintInput();
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

  attributeChanged(name, before, after) {
    if (name === "min-length") {
      this.min = parseInt(after || "8", 10);
      this.update(false);
    } else if (name === "show-label" || name === "hide-label") this.paintToggle(this.input.type === "text");
    // placeholder y label pasan al input solo si lo creó el componente (el del autor es suyo)
    else if (this.ownInput) this.paintInput();
  }

  paintInput() {
    const ph = this.getAttribute("placeholder");
    if (ph !== null) this.input.placeholder = ph;
    else this.input.removeAttribute("placeholder");
    const label = this.getAttribute("label");
    if (label) this.input.setAttribute("aria-label", label);
    else this.input.removeAttribute("aria-label");
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
}

define("tsl-password", TslPassword);
