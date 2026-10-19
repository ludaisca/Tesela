/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  define,
  emit
} from "./chunk-KUBYC2WE.mjs";

// src/components/dropzone.js
var formatBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};
var TslDropzone = class extends TslElement {
  setup() {
    this.files = [];
    this.tabIndex = 0;
    this.setAttribute("role", "button");
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.hidden = true;
    if (this.hasAttribute("multiple")) this.fileInput.multiple = true;
    if (this.getAttribute("accept")) this.fileInput.accept = this.getAttribute("accept");
    if (this.getAttribute("name")) this.fileInput.name = this.getAttribute("name");
    this.listEl = document.createElement("div");
    this.listEl.className = "tsl-dropzone__files";
    this.append(this.fileInput, this.listEl);
    this.addEventListener("click", (e) => {
      if (e.target !== this.fileInput) this.fileInput.click();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.fileInput.click();
      }
    });
    this.fileInput.addEventListener("change", () => this.take(this.fileInput.files));
    ["dragenter", "dragover"].forEach(
      (type) => this.addEventListener(type, (e) => {
        e.preventDefault();
        this.setAttribute("data-dragging", "");
      })
    );
    ["dragleave", "drop"].forEach(
      (type) => this.addEventListener(type, (e) => {
        e.preventDefault();
        this.removeAttribute("data-dragging");
      })
    );
    this.addEventListener("drop", (e) => this.take(e.dataTransfer.files));
  }
  take(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    this.files = this.hasAttribute("multiple") ? this.files.concat(incoming) : incoming.slice(0, 1);
    this.listEl.textContent = "";
    this.files.forEach((f) => {
      const row = document.createElement("div");
      row.className = "tsl-dropzone__file";
      const name = document.createElement("span");
      name.textContent = f.name;
      const size = document.createElement("span");
      size.className = "tsl-muted";
      size.textContent = formatBytes(f.size);
      row.append(name, size);
      this.listEl.appendChild(row);
    });
    emit(this, "tsl-change", { files: this.files.slice() });
  }
};
define("tsl-dropzone", TslDropzone);

export {
  TslDropzone
};
