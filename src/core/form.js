import { TslElement } from "./base.js";

export class TslFormElement extends TslElement {
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

  attributeChangedCallback(name) {
    if (name === "disabled" && this._tslReady) this.syncDisabled();
  }

  static get observedAttributes() {
    return ["disabled"];
  }

  syncDisabled() {}

  reset() {}

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
}
