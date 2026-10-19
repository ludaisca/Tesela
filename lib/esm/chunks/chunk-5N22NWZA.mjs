/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement
} from "./chunk-KUBYC2WE.mjs";

// src/core/form.js
var TslFormElement = class extends TslElement {
  static get formAssociated() {
    return true;
  }
  constructor() {
    super();
    try {
      this.internals = this.attachInternals();
    } catch (_) {
      this.internals = null;
    }
  }
  get name() {
    return this.getAttribute("name") || "";
  }
  get form() {
    return this.internals ? this.internals.form : null;
  }
  get validity() {
    return this.internals ? this.internals.validity : null;
  }
  get validationMessage() {
    return this.internals ? this.internals.validationMessage : "";
  }
  checkValidity() {
    return this.internals ? this.internals.checkValidity() : true;
  }
  reportValidity() {
    return this.internals ? this.internals.reportValidity() : true;
  }
  // Propiedad que refleja el atributo `disabled`
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  get isDisabled() {
    return this.hasAttribute("disabled") || Boolean(this.formDisabled);
  }
  formResetCallback() {
    this.reset();
  }
  formDisabledCallback(disabled) {
    this.formDisabled = disabled;
    this.syncDisabled();
  }
  attributeChanged(name) {
    if (name === "disabled") this.syncDisabled();
  }
  static get observedAttributes() {
    return [...super.observedAttributes, "disabled"];
  }
  syncDisabled() {
  }
  reset() {
  }
  // Publica el valor al formulario (null = no se envía) y aplica "required"
  publish(value, empty, anchor) {
    if (!this.internals) return;
    this.internals.setFormValue(value);
    if (this.hasAttribute("required") && empty) {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Completa este campo.", anchor);
    } else {
      this.internals.setValidity({});
    }
  }
};

export {
  TslFormElement
};
