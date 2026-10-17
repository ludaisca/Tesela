/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit
} from "./chunk-ZOAS4LFV.mjs";

// src/components/otp.js
var TslOtp = class extends TslElement {
  setup() {
    const length = Math.max(1, parseInt(this.getAttribute("length") || "6", 10));
    const numeric = this.getAttribute("mode") !== "text";
    this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Código de verificación");
    this.cells = Array.from({ length }, (_, i) => {
      const cell = document.createElement("input");
      cell.className = "tsl-otp__cell";
      cell.maxLength = 1;
      cell.autocomplete = i === 0 ? "one-time-code" : "off";
      cell.inputMode = numeric ? "numeric" : "text";
      cell.setAttribute("aria-label", `Carácter ${i + 1} de ${length}`);
      this.appendChild(cell);
      return cell;
    });
    if (this.getAttribute("name")) {
      this.hidden_ = document.createElement("input");
      this.hidden_.type = "hidden";
      this.hidden_.name = this.getAttribute("name");
      this.appendChild(this.hidden_);
    }
    const valid = (ch) => numeric ? /\d/.test(ch) : /\S/.test(ch);
    this.cells.forEach((cell, i) => {
      cell.addEventListener("input", () => {
        const ch = cell.value.slice(-1);
        cell.value = valid(ch) ? ch : "";
        if (cell.value && i < length - 1) this.cells[i + 1].focus();
        this.changed();
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !cell.value && i > 0) {
          this.cells[i - 1].focus();
          this.cells[i - 1].value = "";
          this.changed();
          e.preventDefault();
        } else if (e.key === "ArrowLeft" && i > 0) {
          this.cells[i - 1].focus();
        } else if (e.key === "ArrowRight" && i < length - 1) {
          this.cells[i + 1].focus();
        }
      });
      cell.addEventListener("focus", () => cell.select());
      cell.addEventListener("paste", (e) => {
        e.preventDefault();
        const chars = (e.clipboardData.getData("text") || "").split("").filter(valid);
        chars.slice(0, length - i).forEach((ch, k) => this.cells[i + k].value = ch);
        this.cells[Math.min(i + chars.length, length - 1)].focus();
        this.changed();
      });
    });
  }
  get value() {
    return this.cells ? this.cells.map((c) => c.value).join("") : "";
  }
  clear() {
    this.cells.forEach((c) => c.value = "");
    this.cells[0].focus();
    this.changed();
  }
  changed() {
    const value = this.value;
    if (this.hidden_) this.hidden_.value = value;
    emit(this, "tsl-change", { value });
    if (value.length === this.cells.length) emit(this, "tsl-complete", { value });
  }
};
define("tsl-otp", TslOtp);

export {
  TslOtp
};
