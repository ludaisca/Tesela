/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  autosize
} from "./chunk-7SBQ3Q2I.mjs";
import {
  accepts,
  formatBytes,
  iconFor,
  parseSize
} from "./chunk-DHS3AUIU.mjs";
import {
  icon
} from "./chunk-VKGZI2YC.mjs";
import {
  TslElement,
  announce,
  define,
  emit
} from "./chunk-KUBYC2WE.mjs";

// src/components/prompt-input.js
var TslPromptInput = class extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "status", "disabled", "label", "attachments-label", "submit-label", "stop-label"];
  }
  setup() {
    this.form = this.querySelector("form");
    this.textarea = this.querySelector("textarea");
    if (!this.form || !this.textarea) return;
    this.form.classList.add("tsl-prompt-input__form");
    this.form.noValidate = true;
    this.textarea.classList.add("tsl-prompt-input__textarea");
    if (!this.textarea.matches("[rows]")) this.textarea.rows = 1;
    if (!this.textarea.dataset.maxRows) this.textarea.dataset.maxRows = this.getAttribute("max-rows") || "8";
    this.ownLabel = !this.textarea.hasAttribute("aria-label") && !this.textarea.labels?.length;
    this.submitBtn = this.form.querySelector("[data-submit]") || this.form.querySelector("button[type=submit]");
    if (this.submitBtn) {
      this.submitBtn.classList.add("tsl-prompt-input__submit");
      if (!this.submitBtn.textContent.trim() && !this.submitBtn.children.length) {
        const icon2 = document.createElement("span");
        icon2.className = "tsl-prompt-input__icon";
        icon2.setAttribute("aria-hidden", "true");
        this.submitBtn.appendChild(icon2);
      }
    }
    this._files = [];
    this.list = this.querySelector(".tsl-prompt-input__attachments");
    if (!this.list) {
      this.list = document.createElement("div");
      this.list.className = "tsl-prompt-input__attachments";
      this.form.prepend(this.list);
    }
    this.list.classList.add("tsl-attachment-group");
    this.list.setAttribute("role", "list");
    this.paintLabels();
    this.picker = document.createElement("input");
    this.picker.type = "file";
    this.picker.hidden = true;
    this.picker.multiple = this.maxFiles !== 1;
    if (this.getAttribute("accept")) this.picker.accept = this.getAttribute("accept");
    this.picker.addEventListener("change", () => {
      this.addFiles(this.picker.files);
      this.picker.value = "";
    });
    this.appendChild(this.picker);
    this.form.querySelectorAll("[data-attach]").forEach((b) => b.addEventListener("click", () => this.openFilePicker()));
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.busy) this.stop();
      else this.submit();
    });
    this.textarea.addEventListener("keydown", (e) => this.onKey(e));
    this.textarea.addEventListener("input", () => {
      autosize(this.textarea);
      this.paint();
    });
    this.textarea.addEventListener("paste", (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (!files.length) return;
      e.preventDefault();
      this.addFiles(files);
    });
    let depth = 0;
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes("Files");
    this.addEventListener("dragenter", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      this.setAttribute("data-dragging", "");
    });
    this.addEventListener("dragover", (e) => hasFiles(e) && e.preventDefault());
    this.addEventListener("dragleave", () => {
      depth = Math.max(0, depth - 1);
      if (!depth) this.removeAttribute("data-dragging");
    });
    this.addEventListener("drop", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      this.removeAttribute("data-dragging");
      this.addFiles(e.dataTransfer.files);
    });
    autosize(this.textarea);
    this.paint();
  }
  attributeChanged(name) {
    if (name === "label" || name === "attachments-label") this.paintLabels();
    else this.paint();
  }
  paintLabels() {
    if (this.ownLabel) this.textarea.setAttribute("aria-label", this.getAttribute("label") || "Mensaje");
    this.list.setAttribute("aria-label", this.getAttribute("attachments-label") || "Adjuntos");
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    (this._files || []).forEach((f) => f.url && URL.revokeObjectURL(f.url));
  }
  get status() {
    return this.getAttribute("status") || "ready";
  }
  set status(v) {
    this.setAttribute("status", v);
  }
  /** Hay una respuesta en curso: el botón detiene en vez de enviar. */
  get busy() {
    return this.status === "submitted" || this.status === "streaming";
  }
  get value() {
    return this.textarea ? this.textarea.value : "";
  }
  set value(v) {
    if (!this.textarea) return;
    this.textarea.value = v;
    autosize(this.textarea);
    this.paint();
  }
  get files() {
    return (this._files || []).map((f) => f.file);
  }
  get maxFiles() {
    return parseInt(this.getAttribute("max-files"), 10) || Infinity;
  }
  get maxSize() {
    return parseSize(this.getAttribute("max-size")) || Infinity;
  }
  /** Puede enviarse: hay texto o adjuntos y no está deshabilitado ni ocupado. */
  get canSubmit() {
    return !this.hasAttribute("disabled") && !this.busy && (this.value.trim() !== "" || this._files.length > 0);
  }
  focus(options) {
    if (this.textarea) this.textarea.focus(options);
  }
  openFilePicker() {
    if (!this.hasAttribute("disabled")) this.picker.click();
  }
  /** Añade archivos validando tipo (`accept`), tamaño (`max-size`) y cantidad (`max-files`). */
  addFiles(fileList) {
    const accept = this.getAttribute("accept");
    const added = [];
    Array.from(fileList || []).forEach((file) => {
      let reason = "";
      let message = "";
      if (!accepts(accept, file)) {
        reason = "type";
        message = `${file.name}: tipo de archivo no admitido`;
      } else if (file.size > this.maxSize) {
        reason = "size";
        message = `${file.name}: supera ${formatBytes(this.maxSize)}`;
      } else if (this._files.length >= this.maxFiles) {
        reason = "count";
        message = `Máximo ${this.maxFiles} ${this.maxFiles === 1 ? "archivo" : "archivos"}`;
      }
      if (reason) {
        announce(message);
        emit(this, "tsl-error", { file, reason, message });
        return;
      }
      const entry = { file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" };
      this._files.push(entry);
      added.push(file);
    });
    if (!added.length) return;
    this.renderFiles();
    this.paint();
    announce(added.length === 1 ? `Adjuntado ${added[0].name}` : `${added.length} archivos adjuntados`);
    emit(this, "tsl-files", { files: this.files });
  }
  removeFile(index) {
    const [entry] = this._files.splice(index, 1);
    if (!entry) return;
    if (entry.url) URL.revokeObjectURL(entry.url);
    this.renderFiles();
    this.paint();
    announce(`Quitado ${entry.file.name}`);
    emit(this, "tsl-files", { files: this.files });
    this.focus();
  }
  renderFiles() {
    this.list.textContent = "";
    this._files.forEach(({ file, url }, i) => {
      const item = document.createElement("div");
      item.className = "tsl-attachment tsl-attachment--sm";
      item.setAttribute("role", "listitem");
      const media = document.createElement("div");
      media.className = "tsl-attachment__media";
      media.setAttribute("aria-hidden", "true");
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        media.appendChild(img);
      } else {
        media.replaceChildren(icon(iconFor(file)));
      }
      const content = document.createElement("div");
      content.className = "tsl-attachment__content";
      const title = document.createElement("div");
      title.className = "tsl-attachment__title";
      title.textContent = file.name;
      title.title = file.name;
      const desc = document.createElement("div");
      desc.className = "tsl-attachment__desc";
      desc.textContent = formatBytes(file.size);
      content.append(title, desc);
      const actions = document.createElement("div");
      actions.className = "tsl-attachment__actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle";
      remove.setAttribute("aria-label", `Quitar ${file.name}`);
      remove.appendChild(icon("x"));
      remove.addEventListener("click", () => this.removeFile(i));
      actions.appendChild(remove);
      item.append(media, content, actions);
      this.list.appendChild(item);
    });
    this.list.hidden = this._files.length === 0;
  }
  /** Emite `tsl-submit` con el texto, los adjuntos y los demás campos del formulario; si nadie lo cancela, vacía la caja. */
  submit() {
    if (!this.canSubmit) return false;
    const values = {};
    new FormData(this.form).forEach((v, k) => {
      if (k === this.textarea.name || v instanceof File) return;
      values[k] = k in values ? [].concat(values[k], v) : v;
    });
    const ev = new CustomEvent("tsl-submit", {
      bubbles: true,
      cancelable: true,
      detail: { text: this.value.trim(), files: this.files, values }
    });
    this.dispatchEvent(ev);
    if (!ev.defaultPrevented) this.clear();
    return true;
  }
  stop() {
    emit(this, "tsl-stop", {});
  }
  /** Vacía el texto y los adjuntos. */
  clear() {
    this._files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    this._files = [];
    this.renderFiles();
    this.value = "";
  }
  onKey(e) {
    if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
    const mod = e.ctrlKey || e.metaKey;
    const sendOnMod = this.getAttribute("submit-key") === "mod-enter";
    if (e.shiftKey || sendOnMod && !mod || !sendOnMod && e.altKey) return;
    e.preventDefault();
    if (!this.busy) this.submit();
  }
  paint() {
    if (!this.form) return;
    const disabled = this.hasAttribute("disabled");
    this.textarea.disabled = disabled;
    this.form.querySelectorAll("[data-attach]").forEach((b) => b.disabled = disabled || this._files.length >= this.maxFiles);
    Array.from(this.form.elements).forEach((c) => {
      if (c === this.textarea || c === this.submitBtn || c === this.picker || c.matches("[data-attach]")) return;
      if (disabled && !c.disabled) {
        c.disabled = true;
        c.dataset.tslDisabled = "";
      } else if (!disabled && "tslDisabled" in c.dataset) {
        c.disabled = false;
        delete c.dataset.tslDisabled;
      }
    });
    this.toggleAttribute("data-busy", this.busy);
    this.toggleAttribute("data-has-files", this._files.length > 0);
    if (this.list) this.list.hidden = this._files.length === 0;
    if (!this.submitBtn) return;
    const label = this.busy ? this.getAttribute("stop-label") || "Detener" : this.getAttribute("submit-label") || "Enviar";
    this.submitBtn.setAttribute("aria-label", label);
    this.submitBtn.title = label;
    this.submitBtn.dataset.state = this.status === "submitted" ? "wait" : this.status === "streaming" ? "stop" : "send";
    this.submitBtn.disabled = disabled || !this.busy && !this.canSubmit;
  }
};
define("tsl-prompt-input", TslPromptInput);
document.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest("[data-tsl-suggest]");
  if (!btn) return;
  const target = document.querySelector(btn.dataset.tslSuggest);
  if (!(target instanceof TslPromptInput)) return;
  target.value = btn.dataset.value || btn.textContent.trim();
  emit(btn, "tsl-select", { value: target.value });
  if (btn.hasAttribute("data-send")) target.submit();
  else target.focus();
});

export {
  TslPromptInput
};
