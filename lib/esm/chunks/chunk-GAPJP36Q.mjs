/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslFormElement
} from "./chunk-5N22NWZA.mjs";
import {
  define,
  emit
} from "./chunk-KUBYC2WE.mjs";

// src/components/phone.js
var COUNTRIES = {
  MX: { name: "México", dial: "52", mask: "## #### ####" },
  US: { name: "Estados Unidos", dial: "1", mask: "(###) ###-####" },
  CA: { name: "Canadá", dial: "1", mask: "(###) ###-####" },
  ES: { name: "España", dial: "34", mask: "### ## ## ##" },
  CO: { name: "Colombia", dial: "57", mask: "### ### ####" },
  AR: { name: "Argentina", dial: "54", mask: "## ####-####" },
  CL: { name: "Chile", dial: "56", mask: "# #### ####" },
  PE: { name: "Perú", dial: "51", mask: "### ### ###" },
  BR: { name: "Brasil", dial: "55", mask: "(##) #####-####" },
  GT: { name: "Guatemala", dial: "502", mask: "#### ####" },
  FR: { name: "Francia", dial: "33", mask: "# ## ## ## ##" },
  GB: { name: "Reino Unido", dial: "44", mask: "#### ######" }
};
var digitsOf = (s) => String(s || "").replace(/\D/g, "");
var lengthOf = (mask) => mask.replace(/[^#]/g, "").length;
var TslPhone = class extends TslFormElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "country", "value", "placeholder", "label", "country-label"];
  }
  setup() {
    const list = (this.getAttribute("countries") || Object.keys(COUNTRIES).join(",")).split(",").map((c) => c.trim().toUpperCase()).filter((c) => COUNTRIES[c]);
    this.codes = list.length ? list : Object.keys(COUNTRIES);
    this.textContent = "";
    this.picker = document.createElement("span");
    this.picker.className = "tsl-phone__country";
    this.badge = document.createElement("span");
    this.badge.className = "tsl-phone__badge";
    this.badge.setAttribute("aria-hidden", "true");
    this.select = document.createElement("select");
    this.select.className = "tsl-phone__select";
    this.codes.forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = `${COUNTRIES[c].name} (+${COUNTRIES[c].dial})`;
      this.select.appendChild(o);
    });
    this.picker.append(this.badge, this.select);
    this.input = document.createElement("input");
    this.input.className = "tsl-phone__input";
    this.input.type = "tel";
    this.input.inputMode = "tel";
    this.input.autocomplete = "tel-national";
    this.append(this.picker, this.input);
    this.paintLabels();
    this.select.addEventListener("change", () => {
      this.applyCountry(this.select.value);
      this.input.focus();
      this.fire();
    });
    this.input.addEventListener("keydown", (e) => this.skipSeparator(e));
    this.input.addEventListener("input", () => this.onInput());
    this.input.addEventListener("paste", (e) => {
      const text = e.clipboardData && e.clipboardData.getData("text") || "";
      if (!text.trim().startsWith("+") && !text.trim().startsWith("00")) return;
      e.preventDefault();
      this.value = text;
      this.fire();
    });
    this.input.addEventListener("blur", () => this.fire());
    this.initial = { country: this.startCountry(), value: this.getAttribute("value") || "" };
    this.applyCountry(this.initial.country);
    if (this.initial.value) this.value = this.initial.value;
    this.committed = this.value;
    this.syncDisabled();
  }
  attributeChanged(name, before, after) {
    super.attributeChanged(name, before, after);
    if (name === "country" && COUNTRIES[(after || "").toUpperCase()]) this.applyCountry(after.toUpperCase());
    else if (name === "placeholder") this.applyCountry(this._country);
    else if (name === "value") {
      this.initial = { country: this._country, value: after || "" };
      this.value = this.initial.value;
      this.committed = this.value;
    } else if (name === "label" || name === "country-label") this.paintLabels();
  }
  paintLabels() {
    this.select.setAttribute("aria-label", this.getAttribute("country-label") || "País");
    this.input.setAttribute("aria-label", this.getAttribute("label") || "Teléfono");
  }
  startCountry() {
    const c = (this.getAttribute("country") || "").toUpperCase();
    return this.codes.includes(c) ? c : this.codes[0];
  }
  get country() {
    return this._country;
  }
  set country(c) {
    this.setAttribute("country", c);
  }
  get info() {
    return COUNTRIES[this._country];
  }
  applyCountry(code) {
    this._country = code;
    this.select.value = code;
    this.badge.textContent = `${code} +${COUNTRIES[code].dial}`;
    this.input.placeholder = this.getAttribute("placeholder") || COUNTRIES[code].mask.replace(/#/g, "0");
    this.render(this.national);
  }
  /** Dígitos del número nacional, sin prefijo. */
  get national() {
    return this.input ? digitsOf(this.input.value).slice(0, lengthOf(this.info.mask)) : "";
  }
  get isComplete() {
    return this.national.length === lengthOf(this.info.mask);
  }
  /** Valor E.164 ("+525512345678") o "" si está vacío. Incompleto se envía igual, pero no es válido. */
  get value() {
    if (!this.input) return this.getAttribute("value") || "";
    return this.national ? `+${this.info.dial}${this.national}` : "";
  }
  set value(v) {
    let d = digitsOf(v);
    const intl = /^\s*(\+|00)/.test(String(v || ""));
    if (intl) {
      if (String(v).trim().startsWith("00")) d = d.slice(2);
      const match = [this._country, ...this.codes].filter((c, i, a) => a.indexOf(c) === i && d.startsWith(COUNTRIES[c].dial)).sort((a, b) => COUNTRIES[b].dial.length - COUNTRIES[a].dial.length)[0];
      if (match) {
        if (match !== this._country) this.applyCountry(match);
        d = d.slice(COUNTRIES[match].dial.length);
      }
    }
    this.render(d);
    this.committed = this.value;
  }
  /** El número como se lee: "+52 55 1234 5678". */
  get formatted() {
    return this.national ? `+${this.info.dial} ${this.mask(this.national)}` : "";
  }
  mask(digits) {
    let out = "";
    let i = 0;
    for (const ch of this.info.mask) {
      if (i >= digits.length) break;
      if (ch === "#") out += digits[i++];
      else out += ch;
    }
    return out;
  }
  render(digits) {
    this.input.value = this.mask(digitsOf(digits).slice(0, lengthOf(this.info.mask)));
    this.sync();
  }
  // Retroceso o Supr junto a un espacio, guion o paréntesis borran el dígito más cercano, no el separador
  skipSeparator(e) {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    const el = this.input;
    const at = el.selectionStart;
    if (at !== el.selectionEnd) return;
    const back = e.key === "Backspace";
    const next = back ? el.value[at - 1] : el.value[at];
    if (next === void 0 || /\d/.test(next)) return;
    e.preventDefault();
    let i = back ? at - 1 : at;
    while (i >= 0 && i < el.value.length && !/\d/.test(el.value[i])) i += back ? -1 : 1;
    if (i < 0 || i >= el.value.length) return;
    const before = digitsOf(el.value.slice(0, i)).length;
    const d = digitsOf(el.value);
    this.render(d.slice(0, before) + d.slice(before + 1));
    this.placeCaret(before);
  }
  // Cursor detrás del dígito número `count`
  placeCaret(count) {
    const text = this.input.value;
    let pos = 0;
    let seen = 0;
    while (pos < text.length && seen < count) {
      if (/\d/.test(text[pos])) seen += 1;
      pos += 1;
    }
    this.input.setSelectionRange(pos, pos);
  }
  onInput() {
    const raw = this.input.value;
    if (/^\s*(\+|00)/.test(raw) && digitsOf(raw).length > 3) {
      this.value = raw;
      return;
    }
    const caret = this.input.selectionStart ?? raw.length;
    const before = digitsOf(raw.slice(0, caret)).length;
    this.render(raw);
    this.placeCaret(before);
  }
  fire() {
    if (this.value === this.committed) return;
    this.committed = this.value;
    emit(this, "tsl-change", { value: this.value, country: this._country, complete: this.isComplete });
  }
  sync() {
    if (!this.internals) return;
    const value = this.value;
    this.internals.setFormValue(value || null);
    const missing = lengthOf(this.info.mask) - this.national.length;
    if (this.hasAttribute("required") && !value) {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Escribe un teléfono.", this.input);
    } else if (value && missing > 0) {
      this.internals.setValidity({ tooShort: true }, `Faltan ${missing} ${missing === 1 ? "dígito" : "dígitos"}.`, this.input);
    } else {
      this.internals.setValidity({});
    }
    this.toggleAttribute("data-complete", this.isComplete);
  }
  focus(options) {
    if (this.input) this.input.focus(options);
  }
  syncDisabled() {
    if (!this.input) return;
    this.input.disabled = this.isDisabled;
    this.select.disabled = this.isDisabled;
  }
  reset() {
    this.applyCountry(this.initial.country);
    this.render("");
    if (this.initial.value) this.value = this.initial.value;
    this.committed = this.value;
  }
};
TslPhone.countries = COUNTRIES;
define("tsl-phone", TslPhone);

export {
  TslPhone
};
