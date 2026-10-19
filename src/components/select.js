import { define, emit, nextId, normalize } from "../core/base.js";
import { TslFormElement } from "../core/form.js";
import { dismissOnOutside, position, trackPosition } from "../core/position.js";
import { icon } from "../core/icons.js";

const CHEVRON = `<svg class="tsl-trigger__icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
const CHECK = `<svg class="tsl-select__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;


/**
 * <tsl-select name="rol" value="admin" placeholder="Elige…" searchable multiple creatable clearable required>
 *   <option value="admin">Administrador</option>
 *   <optgroup label="Equipo"><option value="dev" data-hint="Código">Desarrollo</option></optgroup>
 * </tsl-select>
 * Con el atributo `autocomplete` (o <tsl-combobox>) el campo es un input donde se escribe para filtrar.
 * value: string (o array con `multiple`). Evento tsl-change { value, values }.
 */
export class TslSelect extends TslFormElement {
  setup() {
    this.multiple = this.hasAttribute("multiple");
    this.inline = this.hasAttribute("autocomplete");
    this.searchable = this.hasAttribute("searchable") && !this.inline;
    this.creatable = this.hasAttribute("creatable");
    this.options = this.readOptions();
    this.initial = this.initialValues();
    this.values = this.initial.slice();
    this.query = "";
    this.active = null;
    this.typeahead = "";
    this.build();
    this.renderList();
    this.sync(false);
  }

  readOptions() {
    const out = [];
    const read = (o, group) =>
      out.push({
        value: o.getAttribute("value") !== null ? o.getAttribute("value") : o.textContent.trim(),
        label: o.textContent.trim(),
        disabled: o.hasAttribute("disabled"),
        hint: o.dataset.hint || "",
        selected: o.hasAttribute("selected"),
        group
      });
    Array.from(this.children).forEach((child) => {
      if (child.tagName === "OPTION") read(child, "");
      else if (child.tagName === "OPTGROUP") Array.from(child.children).forEach((o) => read(o, child.getAttribute("label") || ""));
    });
    return out;
  }

  initialValues() {
    const attr = this.getAttribute("value");
    let vals = attr !== null && attr !== "" ? (this.multiple ? attr.split(",").map((v) => v.trim()) : [attr]) : this.options.filter((o) => o.selected).map((o) => o.value);
    if (!this.multiple) vals = vals.slice(0, 1);
    return vals.filter((v) => this.options.some((o) => o.value === v));
  }

  build() {
    const listId = nextId("tsl-select-list");
    this.textContent = "";
    this.wrap = document.createElement("div");
    this.wrap.className = "tsl-select__wrap";

    if (this.inline) {
      this.trigger = document.createElement("div");
      this.trigger.className = "tsl-trigger tsl-trigger--input";
      this.input = document.createElement("input");
      this.input.className = "tsl-trigger__input";
      this.input.type = "text";
      this.input.autocomplete = "off";
      this.input.spellcheck = false;
      this.input.placeholder = this.getAttribute("placeholder") || "";
      this.input.setAttribute("role", "combobox");
      this.input.setAttribute("aria-autocomplete", "list");
      this.owner = this.input;
      this.trigger.appendChild(this.input);
      this.trigger.insertAdjacentHTML("beforeend", CHEVRON);
    } else {
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "tsl-trigger";
      this.trigger.innerHTML = `<span class="tsl-trigger__value"></span>${CHEVRON}`;
      this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
      this.owner = this.trigger;
    }
    this.trigger.setAttribute("aria-haspopup", "listbox");
    this.wrap.appendChild(this.trigger);

    this.clearBtn = document.createElement("button");
    this.clearBtn.type = "button";
    this.clearBtn.className = "tsl-trigger__clear";
    this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar selección");
    this.clearBtn.appendChild(icon("x"));
    this.clearBtn.hidden = true;
    if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);

    this.panel = document.createElement("div");
    this.panel.className = "tsl-select__panel";
    this.panel.setAttribute("popover", "manual");
    if (this.searchable) {
      const box = document.createElement("div");
      box.className = "tsl-select__searchbox";
      this.search = document.createElement("input");
      this.search.className = "tsl-select__search";
      this.search.type = "text";
      this.search.autocomplete = "off";
      this.search.spellcheck = false;
      this.search.placeholder = this.getAttribute("search-placeholder") || "Buscar…";
      this.search.setAttribute("aria-label", this.getAttribute("search-placeholder") || "Buscar");
      this.search.setAttribute("role", "combobox");
      this.search.setAttribute("aria-expanded", "true");
      this.search.setAttribute("aria-controls", listId);
      this.search.setAttribute("aria-autocomplete", "list");
      box.appendChild(this.search);
      this.panel.appendChild(box);
      this.owner = this.search;
    }
    this.list = document.createElement("div");
    this.list.className = "tsl-select__list";
    this.list.id = listId;
    this.list.setAttribute("role", "listbox");
    if (this.multiple) this.list.setAttribute("aria-multiselectable", "true");
    if (this.getAttribute("label")) this.list.setAttribute("aria-label", this.getAttribute("label"));
    this.empty = document.createElement("div");
    this.empty.className = "tsl-select__empty";
    this.empty.textContent = this.getAttribute("empty") || "Sin resultados";
    this.empty.hidden = true;
    this.panel.append(this.list, this.empty);
    this.append(this.wrap, this.panel);

    // El rol combobox lo lleva quien recibe el teclado
    if (this.owner === this.trigger) {
      this.trigger.setAttribute("role", "combobox");
      this.trigger.setAttribute("aria-controls", listId);
      this.trigger.setAttribute("aria-expanded", "false");
    } else {
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.owner === this.input) this.input.setAttribute("aria-controls", listId);
    }
    if (this.getAttribute("label")) this.owner.setAttribute("aria-label", this.getAttribute("label"));

    this.bind();
  }

  bind() {
    const toggle = () => (this.isOpen ? this.close() : this.open());
    if (this.inline) {
      this.input.addEventListener("focus", () => !this.isDisabled && this.input.select());
      this.input.addEventListener("click", () => !this.isDisabled && !this.isOpen && this.open());
      this.input.addEventListener("input", () => {
        this.query = this.input.value;
        if (!this.isOpen) this.open();
        else this.renderList();
      });
      this.trigger.addEventListener("pointerdown", (e) => {
        if (e.target !== this.input) {
          e.preventDefault();
          this.input.focus();
          toggle();
        }
      });
      this.input.addEventListener("blur", () => {
        // Si el foco sale del campo sin elegir nada, se restaura el texto de la selección
        setTimeout(() => {
          if (!this.contains(document.activeElement)) {
            this.close();
            this.showSelection();
          }
        }, 0);
      });
    } else {
      this.trigger.addEventListener("click", toggle);
    }
    if (this.search) {
      this.search.addEventListener("input", () => {
        this.query = this.search.value;
        this.renderList();
      });
    }
    this.owner.addEventListener("keydown", (e) => this.onKey(e));
    this.clearBtn.addEventListener("click", () => {
      this.setValues([], true);
      this.owner.focus();
    });
    this.list.addEventListener("pointerdown", (e) => e.preventDefault());
    this.list.addEventListener("click", (e) => {
      const el = e.target.closest(".tsl-select__option");
      if (el) this.choose(this.visible.find((r) => r.id === el.id));
    });
    this.list.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".tsl-select__option");
      const rec = el && this.visible.find((r) => r.id === el.id);
      if (rec && !rec.disabled && rec !== this.active) this.setActive(rec, false);
    });
    this.panel.addEventListener("focusout", (e) => {
      if (!this.contains(e.relatedTarget) && this.isOpen && !this.inline) this.close();
    });
  }

  get isOpen() {
    return Boolean(this.panel) && this.panel.matches(":popover-open");
  }

  get value() {
    return this.multiple ? this.values.slice() : this.values[0] || "";
  }

  set value(v) {
    const vals = (Array.isArray(v) ? v : v === "" || v == null ? [] : [v]).map(String);
    this.setValues(this.multiple ? vals : vals.slice(0, 1), false);
  }

  /** Reemplaza las opciones: [{ value, label, disabled, hint, group }] */
  setOptions(list) {
    this.options = list.map((o) => ({ value: String(o.value), label: o.label || String(o.value), disabled: Boolean(o.disabled), hint: o.hint || "", group: o.group || "", selected: false }));
    this.values = this.values.filter((v) => this.options.some((o) => o.value === v));
    this.renderList();
    this.sync(false);
  }

  labelOf(value) {
    const o = this.options.find((x) => x.value === value);
    return o ? o.label : value;
  }

  // ---- Lista --------------------------------------------------------------
  filteredOptions() {
    const q = normalize(this.query.trim());
    const list = this.options.filter((o) => !q || normalize(`${o.label} ${o.hint}`).includes(q));
    const exact = this.options.some((o) => normalize(o.label) === q);
    if (this.creatable && q && !exact) {
      list.push({ value: this.query.trim(), label: `${this.getAttribute("create-label") || "Crear"} «${this.query.trim()}»`, create: true, group: "", hint: "", disabled: false });
    }
    return list;
  }

  renderList() {
    this.visible = this.filteredOptions();
    this.list.textContent = "";
    let group = null;
    this.visible.forEach((rec, i) => {
      rec.id = `${this.list.id}-${i}`;
      if (rec.group !== group && rec.group) {
        const g = document.createElement("div");
        g.className = "tsl-select__group";
        g.setAttribute("role", "presentation");
        g.textContent = rec.group;
        this.list.appendChild(g);
      }
      group = rec.group;
      const el = document.createElement("div");
      el.className = "tsl-select__option";
      el.id = rec.id;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", String(this.values.includes(rec.value) && !rec.create));
      if (rec.disabled) el.setAttribute("aria-disabled", "true");
      const text = document.createElement("span");
      text.className = "tsl-select__label";
      text.textContent = rec.label;
      el.appendChild(text);
      if (rec.hint) {
        const hint = document.createElement("span");
        hint.className = "tsl-select__hint";
        hint.textContent = rec.hint;
        el.appendChild(hint);
      }
      el.insertAdjacentHTML("beforeend", CHECK);
      this.list.appendChild(el);
    });
    this.empty.hidden = this.visible.length > 0;
    const enabled = this.visible.filter((r) => !r.disabled);
    const firstSelected = enabled.find((r) => this.values.includes(r.value) && !r.create);
    this.setActive(this.query ? enabled[0] : firstSelected || enabled[0], true);
  }

  el(rec) {
    return rec && this.list.querySelector(`#${CSS.escape(rec.id)}`);
  }

  setActive(rec, scroll) {
    const prev = this.el(this.active);
    if (prev) prev.classList.remove("is-active");
    this.active = rec || null;
    const el = this.el(rec);
    if (el) {
      el.classList.add("is-active");
      if (scroll !== false) el.scrollIntoView({ block: "nearest" });
      this.owner.setAttribute("aria-activedescendant", el.id);
    } else {
      this.owner.removeAttribute("aria-activedescendant");
    }
  }

  move(delta) {
    const enabled = this.visible.filter((r) => !r.disabled);
    if (!enabled.length) return;
    const idx = enabled.indexOf(this.active);
    this.setActive(enabled[(idx + delta + enabled.length) % enabled.length], true);
  }

  // ---- Interacción ----------------------------------------------------------
  onKey(e) {
    if (this.isDisabled) return;
    const k = e.key;
    if (!this.isOpen) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || (k === " " && !this.inline)) {
        e.preventDefault();
        this.open();
      } else if (!this.inline && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        this.open();
        this.jump(k);
      } else if (k === "Backspace" && this.multiple && this.values.length && (!this.inline || !this.input.value)) {
        this.setValues(this.values.slice(0, -1), true);
      }
      return;
    }
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      this.move(k === "ArrowDown" ? 1 : -1);
    } else if (k === "Home" || k === "End") {
      if (this.inline || this.search) return;
      e.preventDefault();
      const enabled = this.visible.filter((r) => !r.disabled);
      this.setActive(k === "Home" ? enabled[0] : enabled[enabled.length - 1], true);
    } else if (k === "Enter" || (k === " " && !this.inline && !this.search && !this.typeahead)) {
      e.preventDefault();
      if (this.active) this.choose(this.active);
    } else if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.close(true);
    } else if (k === "Tab") {
      this.close();
    } else if (k === "Backspace" && this.multiple && this.values.length && !(this.search || this.input || {}).value) {
      this.setValues(this.values.slice(0, -1), true);
    } else if (!this.inline && !this.search && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      this.jump(k);
    }
  }

  // Búsqueda por teclado en select sin buscador
  jump(ch) {
    clearTimeout(this.typeTimer);
    this.typeahead += normalize(ch);
    this.typeTimer = setTimeout(() => (this.typeahead = ""), 600);
    const enabled = this.visible.filter((r) => !r.disabled);
    const hit = enabled.find((r) => normalize(r.label).startsWith(this.typeahead));
    if (hit) this.setActive(hit, true);
  }

  choose(rec) {
    if (!rec || rec.disabled) return;
    if (rec.create) {
      this.options.push({ value: rec.value, label: rec.value, disabled: false, hint: "", group: "", selected: false });
      this.query = "";
      if (this.search) this.search.value = "";
      if (this.input) this.input.value = "";
    }
    if (this.multiple) {
      const has = this.values.includes(rec.value);
      this.values = has ? this.values.filter((v) => v !== rec.value) : this.values.concat(rec.value);
      this.renderList();
      this.sync(true);
      if (rec.create) this.setActive(this.visible.find((r) => r.value === rec.value), true);
    } else {
      this.query = "";
      this.values = [rec.value];
      this.renderList();
      this.sync(true);
      this.close(true);
    }
  }

  setValues(values, fire) {
    this.values = values;
    this.renderList();
    this.sync(fire);
  }

  reset() {
    this.values = this.initial.slice();
    this.query = "";
    this.renderList();
    this.sync(false);
  }

  open() {
    if (this.isDisabled || this.isOpen) return;
    this.query = "";
    if (this.search) this.search.value = "";
    this.renderList();
    this.panel.style.minWidth = `${this.wrap.offsetWidth}px`;
    this.panel.showPopover();
    position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.owner.setAttribute("aria-expanded", "true");
    this.trigger.setAttribute("aria-expanded", "true");
    this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
    this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
    if (this.search) this.search.focus();
    if (this.input) this.input.select();
    const el = this.el(this.active);
    if (el) el.scrollIntoView({ block: "nearest" });
    emit(this, "tsl-open", {});
  }

  close(returnFocus = false) {
    if (!this.isOpen) return;
    this.panel.hidePopover();
    this.owner.setAttribute("aria-expanded", "false");
    this.trigger.setAttribute("aria-expanded", "false");
    if (this.stopPos) this.stopPos();
    if (this.stopOutside) this.stopOutside();
    this.stopPos = this.stopOutside = null;
    this.query = "";
    if (this.search) this.search.value = "";
    this.showSelection();
    if (returnFocus) (this.inline ? this.input : this.trigger).focus();
    emit(this, "tsl-close", {});
  }

  // ---- Presentación y formulario ------------------------------------------------
  showSelection() {
    if (this.inline) {
      this.input.value = this.multiple ? "" : this.values[0] ? this.labelOf(this.values[0]) : "";
      this.input.placeholder = this.multiple && this.values.length ? this.values.map((v) => this.labelOf(v)).join(", ") : this.getAttribute("placeholder") || "";
      return;
    }
    this.valueEl.textContent = "";
    if (!this.values.length) {
      this.valueEl.classList.add("is-placeholder");
      this.valueEl.textContent = this.getAttribute("placeholder") || "Selecciona…";
    } else if (this.multiple) {
      this.valueEl.classList.remove("is-placeholder");
      const max = parseInt(this.getAttribute("max-chips") || "3", 10);
      this.values.slice(0, max).forEach((v) => {
        const chip = document.createElement("span");
        chip.className = "tsl-select__chip";
        chip.textContent = this.labelOf(v);
        this.valueEl.appendChild(chip);
      });
      if (this.values.length > max) {
        const more = document.createElement("span");
        more.className = "tsl-select__chip tsl-select__chip--more";
        more.textContent = `+${this.values.length - max}`;
        this.valueEl.appendChild(more);
      }
    } else {
      this.valueEl.classList.remove("is-placeholder");
      this.valueEl.textContent = this.labelOf(this.values[0]);
    }
  }

  sync(fire) {
    this.showSelection();
    this.clearBtn.hidden = !this.values.length;
    this.syncDisabled();
    if (this.multiple) {
      const fd = new FormData();
      this.values.forEach((v) => fd.append(this.name, v));
      this.publish(this.values.length ? fd : null, !this.values.length, this.trigger);
    } else {
      this.publish(this.values.length ? this.values[0] : null, !this.values.length, this.trigger);
    }
    if (fire) emit(this, "tsl-change", { value: this.value, values: this.values.slice() });
  }

  syncDisabled() {
    if (!this.trigger) return;
    const d = this.isDisabled;
    if (this.input) this.input.disabled = d;
    else this.trigger.disabled = d;
    this.clearBtn.disabled = d;
    if (d) this.close();
  }
}

export class TslCombobox extends TslSelect {
  setup() {
    this.setAttribute("autocomplete", "");
    super.setup();
  }
}

define("tsl-select", TslSelect);
define("tsl-combobox", TslCombobox);
