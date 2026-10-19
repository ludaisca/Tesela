import { define, emit } from "../core/base.js";
import { TslFormElement } from "../core/form.js";

/**
 * <tsl-currency name="precio" currency="MXN" locale="es-MX" value="1250.5" min="0" max="100000" step="10" label="Precio">
 * Importe con el formato del idioma mientras se escribe (separador de miles y decimales del `locale`),
 * símbolo de la moneda delante o detrás según corresponda y los decimales que use esa moneda.
 * El valor que viaja en el formulario es canónico: punto decimal y decimales completos ("1250.50").
 * ↑ ↓ suman o restan `step`; el punto o la coma del teclado numérico valen como separador decimal.
 */
export class TslCurrency extends TslFormElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "currency", "locale", "show-code", "value", "placeholder", "label"];
  }

  setup() {
    this.textContent = "";
    this.input = document.createElement("input");
    this.input.className = "tsl-currency__input";
    this.input.type = "text";
    this.input.inputMode = "decimal";
    this.input.autocomplete = "off";
    this.input.spellcheck = false;
    this.symbol = document.createElement("span");
    this.symbol.className = "tsl-currency__symbol";
    this.symbol.setAttribute("aria-hidden", "true");
    this.code = document.createElement("span");
    this.code.className = "tsl-currency__code";
    this.code.setAttribute("aria-hidden", "true");
    this.paintPlaceholder();

    this.input.addEventListener("keydown", (e) => this.onKey(e));
    this.input.addEventListener("input", () => this.onInput());
    this.input.addEventListener("blur", () => this.commit());
    this.addEventListener("click", (e) => {
      if (e.target !== this.input) this.input.focus();
    });

    this.configure();
    this.initial = this.getAttribute("value") || "";
    this.setValue(this.initial, false);
    this.committed = this.value;
    this.syncDisabled();
  }

  attributeChanged(name, before, after) {
    super.attributeChanged(name, before, after);
    if (name === "disabled") return;
    if (name === "placeholder") return this.paintPlaceholder();
    if (name === "value") {
      this.initial = after || "";
      this.setValue(this.initial, false);
      this.committed = this.value;
      return;
    }
    const keep = this.value;
    this.configure();
    this.setValue(keep, false);
  }

  paintPlaceholder() {
    const ph = this.getAttribute("placeholder");
    if (ph) this.input.placeholder = ph;
    else this.input.removeAttribute("placeholder");
  }

  /** Lee del idioma y la moneda los separadores, el símbolo, su posición y los decimales. */
  configure() {
    const host = this.closest("[lang]");
    this.locale = this.getAttribute("locale") || (host && host.lang) || "es";
    this.currency = (this.getAttribute("currency") || "USD").toUpperCase();
    try {
      this.money = new Intl.NumberFormat(this.locale, { style: "currency", currency: this.currency });
    } catch (_) {
      this.currency = "USD";
      this.money = new Intl.NumberFormat(this.locale, { style: "currency", currency: "USD" });
    }
    const parts = this.money.formatToParts(-12345.6);
    const find = (type) => (parts.find((p) => p.type === type) || {}).value;
    this.decimal = find("decimal") || ".";
    this.group = find("group") || ",";
    this.digits = this.money.resolvedOptions().maximumFractionDigits;
    const symbolAt = parts.findIndex((p) => p.type === "currency");
    const intAt = parts.findIndex((p) => p.type === "integer");
    this.symbol.textContent = find("currency") || this.currency;
    this.code.textContent = this.currency;
    this.grouper = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 0, useGrouping: true });
    // Símbolo delante ("$1,250.00") o detrás ("1.250,00 €")
    const before = symbolAt < intAt;
    this.replaceChildren(...(before ? [this.symbol, this.input] : [this.input, this.symbol]));
    if (this.hasAttribute("show-code")) this.appendChild(this.code);
    this.toggleAttribute("data-suffix", !before);
    const label = this.getAttribute("label") || "Importe";
    this.input.setAttribute("aria-label", `${label} (${this.currency})`);
  }

  get allowNegative() {
    const min = parseFloat(this.getAttribute("min"));
    return Number.isFinite(min) && min < 0;
  }

  /** Normaliza lo escrito: { neg, int, frac, dot } con solo dígitos. */
  parse(text) {
    let neg = false;
    let int = "";
    let frac = "";
    let dot = false;
    for (const ch of String(text)) {
      if (ch === "-" && this.allowNegative && !int && !dot) neg = !neg;
      else if (ch === this.decimal && this.digits > 0) dot = true;
      else if (/\d/.test(ch)) {
        if (dot) {
          if (frac.length < this.digits) frac += ch;
        } else int += ch;
      }
    }
    int = int.replace(/^0+(?=\d)/, "");
    return { neg, int, frac, dot };
  }

  render({ neg, int, frac, dot }, pad) {
    if (!int && !frac && !dot) return neg ? "-" : "";
    const grouped = this.grouper.format(BigInt(int || "0"));
    let out = (neg ? "-" : "") + grouped;
    if (pad && this.digits > 0) out += this.decimal + frac.padEnd(this.digits, "0");
    else if (dot) out += this.decimal + frac;
    return out;
  }

  onKey(e) {
    if ((e.key === "." || e.key === ",") && e.key !== this.decimal && !e.ctrlKey && !e.metaKey) {
      // Punto o coma del teclado numérico: se toma como separador decimal si aún no lo hay
      e.preventDefault();
      if (this.digits > 0 && !this.input.value.includes(this.decimal)) {
        this.input.setRangeText(this.decimal, this.input.selectionStart, this.input.selectionEnd, "end");
        this.onInput();
      }
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = parseFloat(this.getAttribute("step")) || 1;
      const now = this.valueAsNumber;
      let next = (Number.isFinite(now) ? now : 0) + (e.key === "ArrowUp" ? step : -step);
      const min = parseFloat(this.getAttribute("min"));
      const max = parseFloat(this.getAttribute("max"));
      if (Number.isFinite(min)) next = Math.max(min, next);
      if (Number.isFinite(max)) next = Math.min(max, next);
      this.setValue(String(next), false);
      this.commit();
      return;
    }
    if ((e.key === "Backspace" || e.key === "Delete") && this.input.selectionStart === this.input.selectionEnd) {
      // Junto al separador de miles se borra la cifra de al lado (el separador se volvería a poner solo)
      const el = this.input;
      const back = e.key === "Backspace";
      const at = el.selectionStart;
      if (el.value[back ? at - 1 : at] === this.group) {
        e.preventDefault();
        const i = back ? at - 2 : at + 1;
        if (i < 0 || i >= el.value.length) return;
        el.value = el.value.slice(0, i) + el.value.slice(i + 1);
        el.setSelectionRange(i, i);
        this.onInput();
      }
      return;
    }
    if (e.key === "Enter") this.commit();
  }

  onInput() {
    const raw = this.input.value;
    const caret = this.input.selectionStart ?? raw.length;
    // Se cuentan los caracteres con significado antes del cursor para devolverlo al mismo sitio
    const significant = (s) => [...s].filter((c) => /\d/.test(c) || c === this.decimal || c === "-").length;
    const before = significant(raw.slice(0, caret));
    const text = this.render(this.parse(raw), false);
    this.input.value = text;
    let pos = 0;
    let seen = 0;
    while (pos < text.length && seen < before) {
      if (/\d/.test(text[pos]) || text[pos] === this.decimal || text[pos] === "-") seen += 1;
      pos += 1;
    }
    this.input.setSelectionRange(pos, pos);
    this.sync();
  }

  /** Completa los decimales y emite `tsl-change` si el valor cambió. */
  commit() {
    if (!this.input) return;
    const parsed = this.parse(this.input.value);
    this.input.value = parsed.int || parsed.frac ? this.render(parsed, true) : "";
    this.sync();
    if (this.value !== this.committed) {
      this.committed = this.value;
      emit(this, "tsl-change", { value: this.value, number: this.valueAsNumber });
    }
  }

  /** Valor canónico: "-1250.50" (o "" si está vacío). */
  get value() {
    if (!this.input) return this.getAttribute("value") || "";
    const { neg, int, frac } = this.parse(this.input.value);
    if (!int && !frac) return "";
    const f = this.digits > 0 ? `.${frac.padEnd(this.digits, "0")}` : "";
    return `${neg ? "-" : ""}${int || "0"}${f}`;
  }

  set value(v) {
    this.setValue(v, false);
    this.committed = this.value;
  }

  get valueAsNumber() {
    return this.value === "" ? NaN : parseFloat(this.value);
  }

  /** El importe con símbolo, como lo escribiría el idioma ("$1,250.50"). */
  get formatted() {
    return this.value === "" ? "" : this.money.format(this.valueAsNumber);
  }

  setValue(v, fire) {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    if (!Number.isFinite(n)) this.input.value = "";
    else {
      const fixed = Math.abs(n).toFixed(this.digits);
      const [int, frac = ""] = fixed.split(".");
      this.input.value = this.render({ neg: n < 0 && this.allowNegative, int, frac, dot: this.digits > 0 }, true);
    }
    this.sync();
    if (fire) this.commit();
  }

  sync() {
    const value = this.value;
    if (!this.internals) return;
    this.internals.setFormValue(value === "" ? null : value);
    const n = this.valueAsNumber;
    const min = parseFloat(this.getAttribute("min"));
    const max = parseFloat(this.getAttribute("max"));
    const fmt = (x) => this.money.format(x);
    if (this.hasAttribute("required") && value === "") {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Escribe un importe.", this.input);
    } else if (Number.isFinite(n) && Number.isFinite(min) && n < min) {
      this.internals.setValidity({ rangeUnderflow: true }, `El mínimo es ${fmt(min)}.`, this.input);
    } else if (Number.isFinite(n) && Number.isFinite(max) && n > max) {
      this.internals.setValidity({ rangeOverflow: true }, `El máximo es ${fmt(max)}.`, this.input);
    } else {
      this.internals.setValidity({});
    }
    this.toggleAttribute("data-invalid", !this.internals.validity.valid && value !== "");
  }

  focus(options) {
    if (this.input) this.input.focus(options);
  }

  syncDisabled() {
    if (this.input) this.input.disabled = this.isDisabled;
  }

  reset() {
    this.setValue(this.initial, false);
    this.committed = this.value;
  }
}

define("tsl-currency", TslCurrency);
