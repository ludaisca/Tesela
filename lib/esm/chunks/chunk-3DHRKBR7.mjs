/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  accepts,
  describeAccept,
  formatBytes,
  iconFor,
  parseSize
} from "./chunk-DHS3AUIU.mjs";
import {
  icon
} from "./chunk-VKGZI2YC.mjs";
import {
  TslFormElement
} from "./chunk-5N22NWZA.mjs";
import {
  announce,
  define,
  emit
} from "./chunk-KUBYC2WE.mjs";

// src/components/upload.js
var seq = 0;
function xhrUpload(url, field, file, { signal, progress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.addEventListener("progress", (e) => e.lengthComputable && progress(e.loaded / e.total));
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (_) {
          resolve(xhr.responseText);
        }
      } else reject(new Error(`El servidor respondió ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Sin conexión con el servidor")));
    xhr.addEventListener("abort", () => reject(new DOMException("Cancelada", "AbortError")));
    signal.addEventListener("abort", () => xhr.abort());
    const body = new FormData();
    body.append(field, file);
    xhr.send(body);
  });
}
var TslUpload = class extends TslFormElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label", "drop-label", "hint"];
  }
  setup() {
    this.entries = [];
    this.active = 0;
    this.textContent = "";
    this.picker = document.createElement("input");
    this.picker.type = "file";
    this.picker.hidden = true;
    this.picker.multiple = this.hasAttribute("multiple");
    if (this.getAttribute("accept")) this.picker.accept = this.getAttribute("accept");
    this.picker.addEventListener("change", () => {
      this.addFiles(this.picker.files);
      this.picker.value = "";
    });
    this.drop = document.createElement("button");
    this.drop.type = "button";
    this.drop.className = "tsl-upload__drop";
    const dropIcon = icon("cloud-upload", "tsl-upload__icon");
    this.titleEl = document.createElement("span");
    this.titleEl.className = "tsl-upload__title";
    this.hint = document.createElement("span");
    this.hint.className = "tsl-upload__hint";
    this.hint.id = `tsl-upload-hint-${++seq}`;
    this.drop.setAttribute("aria-describedby", this.hint.id);
    this.drop.append(dropIcon, this.titleEl, this.hint);
    this.drop.addEventListener("click", () => this.openFilePicker());
    this.list = document.createElement("ul");
    this.list.className = "tsl-upload__list";
    this.list.hidden = true;
    this.append(this.picker, this.drop, this.list);
    this.paintLabels();
    let depth = 0;
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes("Files");
    this.drop.addEventListener("dragenter", (e) => {
      if (!hasFiles(e) || this.isDisabled) return;
      e.preventDefault();
      depth += 1;
      this.setAttribute("data-dragging", "");
    });
    this.drop.addEventListener("dragover", (e) => hasFiles(e) && e.preventDefault());
    this.drop.addEventListener("dragleave", () => {
      depth = Math.max(0, depth - 1);
      if (!depth) this.removeAttribute("data-dragging");
    });
    this.drop.addEventListener("drop", (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      this.removeAttribute("data-dragging");
      if (!this.isDisabled) this.addFiles(e.dataTransfer.files);
    });
    this.syncDisabled();
    this.sync();
  }
  attributeChanged(name, before, after) {
    super.attributeChanged(name, before, after);
    if (name !== "disabled") this.paintLabels();
  }
  paintLabels() {
    this.titleEl.textContent = this.getAttribute("drop-label") || (this.picker.multiple ? "Arrastra archivos o haz clic para elegirlos" : "Arrastra un archivo o haz clic para elegirlo");
    this.hint.textContent = this.getAttribute("hint") || this.describeLimits();
    this.list.setAttribute("aria-label", this.getAttribute("label") || "Archivos");
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    queueMicrotask(() => {
      if (this.isConnected) return;
      (this.entries || []).forEach((e) => {
        this.stop(e);
        if (e.url) URL.revokeObjectURL(e.url);
      });
    });
  }
  describeLimits() {
    const parts = [];
    const accept = this.getAttribute("accept");
    if (accept) parts.push(describeAccept(accept));
    if (this.maxSize < Infinity) parts.push(`hasta ${formatBytes(this.maxSize)}`);
    if (this.maxFiles < Infinity && this.picker.multiple) parts.push(`máx. ${this.maxFiles} archivos`);
    return parts.join(" · ");
  }
  get maxFiles() {
    if (!this.hasAttribute("multiple")) return 1;
    return parseInt(this.getAttribute("max-files"), 10) || Infinity;
  }
  get maxSize() {
    return parseSize(this.getAttribute("max-size")) || Infinity;
  }
  /** Estado de cada archivo: nombre, tamaño, estado, progreso (0-1), resultado y error. */
  get files() {
    return (this.entries || []).map(({ file, status, progress, result, error }) => ({ file, name: file.name, size: file.size, status, progress, result, error }));
  }
  /** Resultados de los archivos ya subidos. */
  get value() {
    return (this.entries || []).filter((e) => e.status === "done").map((e) => e.result === void 0 ? e.file : e.result);
  }
  /** Hay archivos subiendo o en cola. */
  get busy() {
    return (this.entries || []).some((e) => e.status === "uploading" || e.status === "queued");
  }
  get uploader() {
    return this._uploader || null;
  }
  set uploader(fn) {
    this._uploader = typeof fn === "function" ? fn : null;
  }
  openFilePicker() {
    if (!this.isDisabled) this.picker.click();
  }
  /** Añade archivos: valida tipo, tamaño y cantidad, y los pone en cola. */
  addFiles(fileList) {
    const accept = this.getAttribute("accept");
    let incoming = Array.from(fileList || []);
    if (!this.hasAttribute("multiple")) {
      incoming = incoming.slice(0, 1);
      if (incoming.length) this.entries.slice().forEach((e) => this.removeFile(this.entries.indexOf(e), false));
    }
    incoming.forEach((file) => {
      let reason = "";
      let message = "";
      if (!accepts(accept, file)) [reason, message] = ["type", `${file.name}: tipo de archivo no admitido`];
      else if (file.size > this.maxSize) [reason, message] = ["size", `${file.name}: supera ${formatBytes(this.maxSize)}`];
      else if (this.entries.length >= this.maxFiles) [reason, message] = ["count", `Máximo ${this.maxFiles} archivos`];
      if (reason) {
        announce(message);
        emit(this, "tsl-error", { file, reason, message });
        return;
      }
      const entry = { id: ++seq, file, status: "queued", progress: 0, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" };
      entry.row = this.buildRow(entry);
      this.entries.push(entry);
      this.list.appendChild(entry.row);
      this.paintRow(entry);
    });
    this.list.hidden = this.entries.length === 0;
    this.sync();
    emit(this, "tsl-files", { files: this.files });
    this.pump();
  }
  /** Arranca subidas hasta llenar `concurrency` (3 por defecto). */
  pump() {
    const limit = parseInt(this.getAttribute("concurrency"), 10) || 3;
    for (const entry of this.entries) {
      if (this.active >= limit) break;
      if (entry.status === "queued") this.start(entry);
    }
  }
  start(entry) {
    const action = this.getAttribute("action");
    const run = this._uploader || (action ? (file, opts) => xhrUpload(action, this.getAttribute("field") || "file", file, opts) : null);
    if (!run) {
      entry.status = "done";
      entry.progress = 1;
      this.paintRow(entry);
      this.sync();
      this.settle();
      return;
    }
    entry.status = "uploading";
    entry.progress = 0;
    entry.error = "";
    entry.controller = new AbortController();
    const token = {};
    entry.run = token;
    this.active += 1;
    this.paintRow(entry);
    this.sync();
    const progress = (f) => {
      if (entry.status !== "uploading") return;
      entry.progress = Math.max(0, Math.min(1, Number(f) || 0));
      this.paintRow(entry);
      emit(this, "tsl-progress", { file: entry.file, progress: entry.progress });
    };
    Promise.resolve().then(() => run(entry.file, { signal: entry.controller.signal, progress })).then(
      (result) => {
        if (entry.run !== token) return;
        entry.status = "done";
        entry.progress = 1;
        entry.result = result;
        announce(`${entry.file.name} subido`);
        emit(this, "tsl-upload", { file: entry.file, result });
      },
      (err) => {
        if (entry.run !== token) return;
        const aborted = entry.controller.signal.aborted || err && err.name === "AbortError";
        entry.status = aborted ? "canceled" : "error";
        entry.error = aborted ? "Cancelada" : err && err.message || "No se pudo subir";
        announce(`${entry.file.name}: ${entry.error}`);
        if (!aborted) emit(this, "tsl-error", { file: entry.file, reason: "upload", message: entry.error });
      }
    ).finally(() => {
      if (entry.run !== token) return;
      entry.run = null;
      this.active = Math.max(0, this.active - 1);
      entry.controller = null;
      this.paintRow(entry);
      this.sync();
      this.pump();
      this.settle();
    });
  }
  settle() {
    if (this.busy) return;
    emit(this, "tsl-complete", { results: this.value, failed: this.entries.filter((e) => e.status === "error").length });
  }
  cancel(index) {
    const entry = this.entries[index];
    if (!entry) return;
    if (entry.status === "queued") {
      entry.status = "canceled";
      entry.error = "Cancelada";
      this.paintRow(entry);
      this.sync();
      this.settle();
    } else if (entry.status === "uploading") {
      this.stop(entry);
      entry.status = "canceled";
      entry.error = "Cancelada";
      announce(`${entry.file.name}: subida cancelada`);
      this.paintRow(entry);
      this.sync();
      this.pump();
      this.settle();
    }
  }
  // Corta la subida en curso de una fila y libera su hueco en la cola
  stop(entry) {
    if (!entry.run) return;
    entry.run = null;
    if (entry.controller) entry.controller.abort();
    entry.controller = null;
    this.active = Math.max(0, this.active - 1);
  }
  retry(index) {
    const entry = this.entries[index];
    if (!entry || entry.status !== "error" && entry.status !== "canceled") return;
    entry.status = "queued";
    entry.error = "";
    this.paintRow(entry);
    this.sync();
    this.pump();
  }
  removeFile(index, focus = true) {
    const entry = this.entries[index];
    if (!entry) return;
    this.stop(entry);
    entry.status = "removed";
    if (entry.url) URL.revokeObjectURL(entry.url);
    this.entries.splice(index, 1);
    entry.row.remove();
    this.list.hidden = this.entries.length === 0;
    this.sync();
    if (focus) {
      const next = this.entries[index] || this.entries[index - 1];
      const target = next ? Object.values(next.buttons).find((b) => !b.hidden) : null;
      (target || this.drop).focus();
      announce(`Quitado ${entry.file.name}`);
    }
    emit(this, "tsl-files", { files: this.files });
    this.pump();
  }
  clear() {
    while (this.entries.length) this.removeFile(0, false);
  }
  buildRow(entry) {
    const li = document.createElement("li");
    li.className = "tsl-upload__item";
    const media = document.createElement("span");
    media.className = "tsl-upload__media";
    media.setAttribute("aria-hidden", "true");
    if (entry.url) {
      const img = document.createElement("img");
      img.src = entry.url;
      img.alt = "";
      media.appendChild(img);
    } else media.replaceChildren(icon(iconFor(entry.file)));
    const body = document.createElement("div");
    body.className = "tsl-upload__body";
    const name = document.createElement("span");
    name.className = "tsl-upload__name";
    name.textContent = entry.file.name;
    name.title = entry.file.name;
    const meta = document.createElement("span");
    meta.className = "tsl-upload__meta";
    const bar = document.createElement("progress");
    bar.className = "tsl-progress tsl-upload__progress";
    bar.max = 100;
    bar.setAttribute("aria-label", `Progreso de ${entry.file.name}`);
    body.append(name, meta, bar);
    const actions = document.createElement("div");
    actions.className = "tsl-upload__actions";
    const button = (cls, text, label, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `tsl-btn tsl-btn--sm tsl-btn--subtle ${cls}`;
      b.append(text);
      b.setAttribute("aria-label", `${label} ${entry.file.name}`);
      b.addEventListener("click", () => fn(this.entries.indexOf(entry)));
      actions.appendChild(b);
      return b;
    };
    entry.buttons = {
      cancel: button("tsl-upload__cancel", "Cancelar", "Cancelar la subida de", (i) => this.cancel(i)),
      retry: button("tsl-upload__retry", "Reintentar", "Reintentar", (i) => this.retry(i)),
      remove: button("tsl-btn--icon tsl-upload__remove", icon("x"), "Quitar", (i) => this.removeFile(i))
    };
    li.append(media, body, actions);
    entry.meta = meta;
    entry.bar = bar;
    return li;
  }
  paintRow(entry) {
    const pct = Math.round(entry.progress * 100);
    entry.row.dataset.status = entry.status;
    const size = formatBytes(entry.file.size);
    const text = {
      queued: `${size} · En cola`,
      uploading: `${size} · ${pct} %`,
      done: `${size} · ${this.hasAttribute("action") || this._uploader ? "Subido" : "Listo"}`,
      error: `${entry.error}`,
      canceled: `${size} · Cancelada`
    }[entry.status];
    entry.meta.textContent = text || size;
    if (entry.status === "uploading") entry.bar.value = pct;
    else if (entry.status === "queued") entry.bar.removeAttribute("value");
    else entry.bar.value = entry.status === "done" ? 100 : pct;
    entry.bar.hidden = entry.status === "done" || entry.status === "canceled" || entry.status === "error";
    const keep = document.activeElement;
    entry.buttons.cancel.hidden = !(entry.status === "uploading" || entry.status === "queued");
    entry.buttons.retry.hidden = !(entry.status === "error" || entry.status === "canceled");
    entry.buttons.remove.hidden = entry.status === "uploading" || entry.status === "queued";
    if (keep && entry.row.contains(keep) && keep.hidden) {
      const visible = Object.values(entry.buttons).find((b) => !b.hidden);
      if (visible) visible.focus();
    }
  }
  sync() {
    if (!this.internals) return;
    const name = this.getAttribute("name");
    if (name) {
      const data = new FormData();
      this.value.forEach((r) => {
        if (r instanceof File) data.append(name, r);
        else if (r && typeof r === "object") data.append(name, String(r.id ?? r.url ?? JSON.stringify(r)));
        else data.append(name, String(r ?? ""));
      });
      this.internals.setFormValue(data);
    }
    if (this.busy) {
      this.internals.setValidity({ customError: true }, this.getAttribute("busy-message") || "Espera a que terminen de subirse los archivos.", this.drop);
    } else if (this.hasAttribute("required") && this.value.length === 0) {
      this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Sube al menos un archivo.", this.drop);
    } else {
      this.internals.setValidity({});
    }
    this.toggleAttribute("data-busy", this.busy);
    this.drop.disabled = this.isDisabled || this.hasAttribute("multiple") && this.entries.length >= this.maxFiles;
  }
  syncDisabled() {
    if (this.drop) this.sync();
  }
  reset() {
    this.clear();
  }
};
define("tsl-upload", TslUpload);

export {
  TslUpload
};
