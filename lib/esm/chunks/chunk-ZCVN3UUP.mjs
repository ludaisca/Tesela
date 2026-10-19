/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  icon
} from "./chunk-VKGZI2YC.mjs";
import {
  TslElement,
  define,
  emit
} from "./chunk-LW5JCRG7.mjs";

// src/components/tags.js
var TslTags = class extends TslElement {
  setup() {
    this.tags = [];
    this.input = document.createElement("input");
    this.input.className = "tsl-tags__input";
    this.input.placeholder = this.getAttribute("placeholder") || "Añadir…";
    this.input.setAttribute("aria-label", this.getAttribute("label") || "Añadir etiqueta");
    this.appendChild(this.input);
    if (this.getAttribute("name")) {
      this.hidden_ = document.createElement("input");
      this.hidden_.type = "hidden";
      this.hidden_.name = this.getAttribute("name");
      this.appendChild(this.hidden_);
    }
    (this.getAttribute("value") || "").split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => this.addTag(t, false));
    this.addEventListener("click", (e) => {
      if (e.target === this) this.input.focus();
    });
    this.input.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === ",") && this.input.value.trim()) {
        e.preventDefault();
        this.addTag(this.input.value.trim(), true);
        this.input.value = "";
      } else if (e.key === "Backspace" && !this.input.value && this.tags.length) {
        this.removeTag(this.tags[this.tags.length - 1], true);
      }
    });
  }
  get value() {
    return this.tags.slice();
  }
  addTag(tag, fire) {
    const max = parseInt(this.getAttribute("max") || "0", 10);
    if (this.tags.includes(tag) || max && this.tags.length >= max) return;
    this.tags.push(tag);
    const chip = document.createElement("span");
    chip.className = "tsl-chip";
    chip.dataset.tag = tag;
    const label = document.createElement("span");
    label.textContent = tag;
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "tsl-chip__remove";
    rm.setAttribute("aria-label", `Quitar ${tag}`);
    rm.appendChild(icon("x"));
    rm.addEventListener("click", () => this.removeTag(tag, true));
    chip.append(label, rm);
    this.insertBefore(chip, this.input);
    this.sync(fire);
  }
  removeTag(tag, fire) {
    this.tags = this.tags.filter((t) => t !== tag);
    const chip = Array.from(this.querySelectorAll(".tsl-chip")).find((c) => c.dataset.tag === tag);
    if (chip) chip.remove();
    this.input.focus();
    this.sync(fire);
  }
  sync(fire) {
    if (this.hidden_) this.hidden_.value = this.tags.join(",");
    if (fire) emit(this, "tsl-change", { value: this.value });
  }
};
define("tsl-tags", TslTags);

export {
  TslTags
};
