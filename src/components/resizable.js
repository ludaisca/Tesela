import { TslElement, clamp, define, emit, nextId, storage } from "../core/base.js";

/**
 * <tsl-resizable direction="horizontal|vertical" storage-key="mi-layout" style="height:260px">
 *   <div class="tsl-resizable__panel" data-size="30" data-min="15" data-max="60">…</div>
 *   <div class="tsl-resizable__panel">…</div>
 * </tsl-resizable>
 * Inserta separadores arrastrables entre paneles. Teclado: flechas (Shift ×5), Home/End; doble clic restablece.
 * Evento tsl-resize { sizes } con porcentajes.
 */
export class TslResizable extends TslElement {
  setup() {
    this.vertical = this.getAttribute("direction") === "vertical";
    this.panels = Array.from(this.querySelectorAll(":scope > .tsl-resizable__panel"));
    this.setAttribute("data-direction", this.vertical ? "vertical" : "horizontal");
    if (this.panels.length < 2) return;

    const declared = this.panels.map((p) => parseFloat(p.dataset.size));
    const fixed = declared.reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0);
    const free = declared.filter((n) => !Number.isFinite(n)).length;
    this.initial = declared.map((n) => (Number.isFinite(n) ? n : (100 - fixed) / free));
    this.sizes = this.initial.slice();
    const key = this.getAttribute("storage-key");
    if (key) {
      try {
        const saved = JSON.parse(storage.get(`tsl-resizable:${key}`) || "null");
        if (Array.isArray(saved) && saved.length === this.panels.length) this.sizes = saved;
      } catch (_) {}
    }

    this.handles = [];
    this.panels.slice(0, -1).forEach((panel, i) => {
      const h = document.createElement("div");
      h.className = "tsl-resizable__handle";
      h.tabIndex = 0;
      h.setAttribute("role", "separator");
      h.setAttribute("aria-orientation", this.vertical ? "horizontal" : "vertical");
      h.setAttribute("aria-label", this.getAttribute("handle-label") || "Cambiar tamaño");
      panel.after(h);
      this.handles.push(h);
      this.bindHandle(h, i);
    });
    this.apply();
  }

  min(i) {
    return parseFloat(this.panels[i].dataset.min || "10");
  }

  max(i) {
    return parseFloat(this.panels[i].dataset.max || "90");
  }

  // Mueve `delta` puntos porcentuales entre el panel i y el i+1, respetando mínimos y máximos
  resize(i, delta) {
    const a = this.sizes[i];
    const b = this.sizes[i + 1];
    const total = a + b;
    let next = clamp(a + delta, Math.max(this.min(i), total - this.max(i + 1)), Math.min(this.max(i), total - this.min(i + 1)));
    next = Math.round(next * 100) / 100;
    if (next === a) return false;
    this.sizes[i] = next;
    this.sizes[i + 1] = Math.round((total - next) * 100) / 100;
    this.apply();
    return true;
  }

  bindHandle(h, i) {
    let start = null;
    h.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      const r = this.getBoundingClientRect();
      const handlesPx = this.handles.reduce((s, x) => s + (this.vertical ? x.offsetHeight : x.offsetWidth), 0);
      start = { pos: this.vertical ? e.clientY : e.clientX, size: this.sizes[i], avail: (this.vertical ? r.height : r.width) - handlesPx };
      this.classList.add("is-resizing");
    });
    h.addEventListener("pointermove", (e) => {
      if (!start) return;
      const dx = (this.vertical ? e.clientY : e.clientX) - start.pos;
      const total = this.sizes[i] + this.sizes[i + 1];
      const target = start.size + (dx / start.avail) * 100;
      this.resize(i, target - this.sizes[i]);
      void total;
    });
    const end = () => {
      if (!start) return;
      start = null;
      this.classList.remove("is-resizing");
      this.save();
    };
    h.addEventListener("pointerup", end);
    h.addEventListener("pointercancel", end);
    h.addEventListener("dblclick", () => {
      const total = this.sizes[i] + this.sizes[i + 1];
      const ratio = this.initial[i] / (this.initial[i] + this.initial[i + 1]);
      this.resize(i, total * ratio - this.sizes[i]);
      this.save();
    });
    h.addEventListener("keydown", (e) => {
      const prev = this.vertical ? "ArrowUp" : "ArrowLeft";
      const next = this.vertical ? "ArrowDown" : "ArrowRight";
      const step = e.shiftKey ? 10 : 2;
      let moved = null;
      if (e.key === prev) moved = this.resize(i, -step);
      else if (e.key === next) moved = this.resize(i, step);
      else if (e.key === "Home") moved = this.resize(i, -100);
      else if (e.key === "End") moved = this.resize(i, 100);
      else return;
      e.preventDefault();
      if (moved) this.save();
    });
  }

  apply() {
    this.panels.forEach((p, i) => {
      p.style.flex = `${this.sizes[i]} 1 0%`;
    });
    this.handles.forEach((h, i) => {
      h.setAttribute("aria-valuenow", String(Math.round(this.sizes[i])));
      h.setAttribute("aria-valuemin", String(this.min(i)));
      h.setAttribute("aria-valuemax", String(this.max(i)));
      h.setAttribute("aria-controls", this.panels[i].id || (this.panels[i].id = nextId("tsl-panel")));
    });
    emit(this, "tsl-resize", { sizes: this.sizes.slice() });
  }

  save() {
    const key = this.getAttribute("storage-key");
    if (key) storage.set(`tsl-resizable:${key}`, JSON.stringify(this.sizes));
  }
}

define("tsl-resizable", TslResizable);
