import { TslElement, define, emit, moveFocus } from "../core/base.js";

/**
 * <tsl-toggle-group type="single|multiple" value="negrita,cursiva" required>
 *   <button class="tsl-toggle-group__item" value="negrita">B</button>
 * </tsl-toggle-group>
 * Botones con aria-pressed. En `single` volver a pulsar deselecciona (salvo `required`).
 */
export class TslToggleGroup extends TslElement {
  setup() {
    this.multiple = this.getAttribute("type") === "multiple";
    this.items = Array.from(this.querySelectorAll(".tsl-toggle-group__item"));
    this.setAttribute("role", "group");
    const initial = (this.getAttribute("value") || "").split(",").map((v) => v.trim()).filter(Boolean);
    this.values = this.multiple ? initial : initial.slice(0, 1);
    this.items.forEach((item) => {
      item.type = "button";
      item.addEventListener("click", () => this.toggle(item.value));
      item.addEventListener("keydown", (e) => {
        const next = moveFocus(this.items.filter((i) => !i.disabled), item, e.key, { horizontal: true });
        if (next) {
          e.preventDefault();
          next.focus();
        }
      });
    });
    this.paint();
  }

  get value() {
    return this.multiple ? this.values.slice() : this.values[0] || "";
  }

  set value(v) {
    this.values = (Array.isArray(v) ? v : v ? [v] : []).map(String);
    this.paint();
  }

  toggle(value) {
    const on = this.values.includes(value);
    if (this.multiple) this.values = on ? this.values.filter((v) => v !== value) : this.values.concat(value);
    else if (on) {
      if (this.hasAttribute("required")) return;
      this.values = [];
    } else this.values = [value];
    this.paint();
    emit(this, "tsl-change", { value: this.value });
  }

  paint() {
    const focusable = this.items.find((i) => this.values.includes(i.value) && !i.disabled) || this.items.find((i) => !i.disabled);
    this.items.forEach((i) => {
      i.setAttribute("aria-pressed", String(this.values.includes(i.value)));
      i.tabIndex = i === focusable ? 0 : -1;
    });
  }
}

define("tsl-toggle-group", TslToggleGroup);
