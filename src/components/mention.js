import { TslElement, define, emit, nextId, normalize } from "../core/base.js";
import { position } from "../core/position.js";

// ---- Mention ----------------------------------------------------------------
const MIRROR_PROPS = ["direction", "boxSizing", "width", "overflowX", "overflowY", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "lineHeight", "fontFamily", "textAlign", "textTransform", "textIndent", "letterSpacing", "wordSpacing", "tabSize"];

// Coordenadas (relativas al viewport) del cursor dentro de un textarea, con un espejo oculto
function caretPoint(field) {
  const isInput = field.tagName === "INPUT";
  const cs = getComputedStyle(field);
  const mirror = document.createElement("div");
  MIRROR_PROPS.forEach((p) => (mirror.style[p] = cs[p]));
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = isInput ? "pre" : "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.textContent = field.value.slice(0, field.selectionStart);
  const marker = document.createElement("span");
  marker.textContent = field.value.slice(field.selectionStart) || ".";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  const rect = field.getBoundingClientRect();
  const point = {
    x: rect.left + marker.offsetLeft - field.scrollLeft + parseFloat(cs.borderLeftWidth) * 0,
    y: rect.top + marker.offsetTop - field.scrollTop + lh
  };
  mirror.remove();
  return point;
}

/**
 * <tsl-mention trigger="@" max="6">
 *   <textarea class="tsl-textarea" name="mensaje"></textarea>
 *   <option value="luis" data-hint="Diseño">Luis Islas</option>
 * </tsl-mention>
 * Al escribir `@` (o el carácter de `trigger`) ofrece usuarios; inserta `@valor `.
 * Evento tsl-mention { user, value }. `element.users = [{ value, label, hint }]` carga datos dinámicos.
 */
export class TslMention extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  attributeChanged() {
    if (this.listEl) this.paintLabels();
  }

  paintLabels() {
    this.listEl.setAttribute("aria-label", this.getAttribute("label") || "Menciones");
  }

  setup() {
    this.field = this.querySelector("textarea, input");
    if (!this.field) return;
    this.trig = this.getAttribute("trigger") || "@";
    this.users = Array.from(this.querySelectorAll(":scope > option")).map((o) => ({
      value: o.getAttribute("value") || o.textContent.trim(),
      label: o.textContent.trim(),
      hint: o.dataset.hint || ""
    }));
    this.querySelectorAll(":scope > option").forEach((o) => o.remove());
    this.items = [];
    this.index = 0;
    this.range = null;

    const id = nextId("tsl-mention");
    this.panel = document.createElement("div");
    this.panel.className = "tsl-select__panel tsl-mention__panel";
    this.panel.setAttribute("popover", "manual");
    this.listEl = document.createElement("div");
    this.listEl.className = "tsl-select__list";
    this.listEl.id = id;
    this.listEl.setAttribute("role", "listbox");
    this.paintLabels();
    this.panel.appendChild(this.listEl);
    this.appendChild(this.panel);

    const f = this.field;
    // Un <input> es un combobox; un <textarea> no admite ese rol y queda como cuadro de texto con
    // autocompletado (aria-autocomplete, aria-controls y aria-activedescendant sí valen en él)
    this.combo = f.tagName === "INPUT";
    if (this.combo) {
      f.setAttribute("role", "combobox");
      f.setAttribute("aria-expanded", "false");
    }
    f.setAttribute("aria-autocomplete", "list");
    f.setAttribute("aria-controls", id);
    f.addEventListener("input", () => this.detect());
    f.addEventListener("click", () => this.detect());
    f.addEventListener("blur", () => setTimeout(() => !this.panel.contains(document.activeElement) && this.close(), 0));
    f.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        this.index = (this.index + (e.key === "ArrowDown" ? 1 : -1) + this.items.length) % this.items.length;
        this.paint();
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        this.pick(this.items[this.index]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });
    this.listEl.addEventListener("pointerdown", (e) => e.preventDefault());
    this.listEl.addEventListener("click", (e) => {
      const el = e.target.closest(".tsl-select__option");
      if (el) this.pick(this.items[Number(el.dataset.i)]);
    });
    this.listEl.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".tsl-select__option");
      if (el && Number(el.dataset.i) !== this.index) {
        this.index = Number(el.dataset.i);
        this.paint();
      }
    });
  }

  get isOpen() {
    return Boolean(this.panel) && this.panel.matches(":popover-open");
  }

  // Busca "@consulta" justo antes del cursor
  detect() {
    const f = this.field;
    const before = f.value.slice(0, f.selectionStart);
    const esc = this.trig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = new RegExp(`(^|\\s)${esc}([\\p{L}\\p{N}_.\\-]*)$`, "u").exec(before);
    if (!m) {
      this.close();
      return;
    }
    const query = m[2];
    const q = normalize(query);
    const max = parseInt(this.getAttribute("max") || "6", 10);
    this.items = this.users.filter((u) => !q || normalize(`${u.value} ${u.label}`).includes(q)).slice(0, max);
    this.range = { start: f.selectionStart - query.length - this.trig.length, end: f.selectionStart };
    if (!this.items.length) {
      this.close();
      return;
    }
    this.index = Math.min(this.index, this.items.length - 1);
    this.render();
    if (!this.isOpen) this.panel.showPopover();
    this.place();
    if (this.combo) f.setAttribute("aria-expanded", "true");
  }

  render() {
    this.listEl.textContent = "";
    this.items.forEach((u, i) => {
      const el = document.createElement("div");
      el.className = "tsl-select__option";
      el.id = `${this.listEl.id}-${i}`;
      el.dataset.i = String(i);
      el.setAttribute("role", "option");
      const name = document.createElement("span");
      name.className = "tsl-select__label";
      name.textContent = u.label;
      const handle = document.createElement("span");
      handle.className = "tsl-select__hint";
      handle.textContent = `${this.trig}${u.value}`;
      el.append(name, handle);
      this.listEl.appendChild(el);
    });
    this.paint();
  }

  paint() {
    Array.from(this.listEl.children).forEach((el, i) => {
      el.classList.toggle("is-active", i === this.index);
      el.setAttribute("aria-selected", String(i === this.index));
      if (i === this.index) this.field.setAttribute("aria-activedescendant", el.id);
    });
  }

  place() {
    position(null, this.panel, { point: caretPoint(this.field), placement: "bottom-start", offset: 4 });
  }

  pick(user) {
    if (!user || !this.range) return;
    const f = this.field;
    const insert = `${this.trig}${user.value} `;
    f.value = f.value.slice(0, this.range.start) + insert + f.value.slice(this.range.end);
    const caret = this.range.start + insert.length;
    f.setSelectionRange(caret, caret);
    this.close();
    f.dispatchEvent(new Event("input", { bubbles: true }));
    f.focus();
    emit(this, "tsl-mention", { user, value: insert.trim() });
  }

  close() {
    if (this.panel && this.isOpen) this.panel.hidePopover();
    if (this.field) {
      if (this.combo) this.field.setAttribute("aria-expanded", "false");
      this.field.removeAttribute("aria-activedescendant");
    }
  }
}

define("tsl-mention", TslMention);
