/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  TslElement,
  announce,
  define,
  emit,
  isRtl,
  nextId
} from "./chunk-LW5JCRG7.mjs";

// src/components/sortable.js
var SORTABLES = /* @__PURE__ */ new Map();
var TslSortable = class extends TslElement {
  setup() {
    this.group = this.getAttribute("group") || this.id || nextId("tsl-sortgroup");
    this.axis = this.getAttribute("direction") || "vertical";
    if (!SORTABLES.has(this.group)) SORTABLES.set(this.group, /* @__PURE__ */ new Set());
    SORTABLES.get(this.group).add(this);
    this.setAttribute("role", "list");
    this.prepare();
    this.mo = new MutationObserver(() => this.prepare());
    this.mo.observe(this, { childList: true });
    this.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.addEventListener("keydown", (e) => this.onKey(e));
  }
  disconnectedCallback() {
    if (this.mo) this.mo.disconnect();
    if (SORTABLES.has(this.group)) SORTABLES.get(this.group).delete(this);
  }
  get itemEls() {
    return Array.from(this.children).filter((c) => c.classList.contains("tsl-sortable__item"));
  }
  prepare() {
    this.itemEls.forEach((el) => {
      if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
      el.setAttribute("role", "listitem");
      el.setAttribute("aria-roledescription", "elemento ordenable");
    });
  }
  get siblings() {
    return Array.from(SORTABLES.get(this.group) || []).sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  }
  nameOf(item) {
    return item.getAttribute("aria-label") || item.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
  }
  listName() {
    return this.getAttribute("label") || this.getAttribute("aria-label") || "";
  }
  // ---- Puntero -----------------------------------------------------------------
  onPointerDown(e) {
    if (e.button !== 0 || this.drag) return;
    const item = e.target.closest(".tsl-sortable__item");
    if (!item || item.parentElement !== this) return;
    const handle = this.getAttribute("handle");
    if (handle) {
      if (!e.target.closest(handle)) return;
    } else if (e.target.closest("input, textarea, select, a[href], button, [contenteditable]")) return;
    this.pending = { item, x: e.clientX, y: e.clientY, id: e.pointerId };
    const move = (ev) => this.onPointerMove(ev);
    const up = (ev) => {
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", up, true);
      document.removeEventListener("keydown", esc, true);
      this.endDrag(ev.type === "pointercancel");
    };
    const esc = (ev) => {
      if (ev.key === "Escape" && this.drag) {
        ev.preventDefault();
        up({ type: "pointercancel" });
      }
    };
    document.addEventListener("pointermove", move, true);
    document.addEventListener("pointerup", up, true);
    document.addEventListener("pointercancel", up, true);
    document.addEventListener("keydown", esc, true);
  }
  onPointerMove(e) {
    if (!this.pending) return;
    if (!this.drag) {
      if (Math.hypot(e.clientX - this.pending.x, e.clientY - this.pending.y) < 5) return;
      this.startDrag(e);
    }
    const d = this.drag;
    d.item.style.left = `${e.clientX - d.dx}px`;
    d.item.style.top = `${e.clientY - d.dy}px`;
    const target = this.containerAt(e.clientX, e.clientY) || d.container;
    this.placeIn(target, e.clientX, e.clientY);
    this.autoscroll(e, target);
  }
  startDrag(e) {
    const item = this.pending.item;
    const rect = item.getBoundingClientRect();
    const cs = getComputedStyle(item);
    const placeholder = document.createElement("div");
    placeholder.className = "tsl-sortable__placeholder";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.margin = cs.margin;
    this.drag = {
      item,
      placeholder,
      container: this,
      origin: { container: this, next: item.nextElementSibling, index: this.itemEls.indexOf(item) },
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top
    };
    item.after(placeholder);
    item.classList.add("is-dragging");
    item.style.cssText += `;position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;z-index:1000;pointer-events:none`;
    document.body.classList.add("tsl-is-sorting");
    announce(`${this.nameOf(item)} tomado.`);
  }
  containerAt(x, y) {
    const group = SORTABLES.get(this.group);
    for (const el of document.elementsFromPoint(x, y)) {
      const c = el.closest && el.closest("tsl-sortable");
      if (c && group.has(c)) return c;
    }
    return null;
  }
  // Coloca el marcador en el punto de inserción de `target` según el puntero
  placeIn(target, x, y) {
    const d = this.drag;
    const items = target.itemEls.filter((i) => i !== d.item);
    let before = null;
    if (target.axis === "grid") {
      let best = Infinity;
      items.forEach((it) => {
        const r = it.getBoundingClientRect();
        const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (dist < best) {
          best = dist;
          before = x < r.left + r.width / 2 ? it : it.nextElementSibling;
        }
      });
    } else {
      const horizontal = target.axis === "horizontal";
      before = items.find((it) => {
        const r = it.getBoundingClientRect();
        return horizontal ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
      });
    }
    while (before && (before === d.placeholder || !before.classList.contains("tsl-sortable__item"))) before = before.nextElementSibling;
    if (before) {
      if (d.placeholder.nextElementSibling !== before || d.placeholder.parentElement !== target) target.insertBefore(d.placeholder, before);
    } else if (d.placeholder.parentElement !== target || d.placeholder.nextElementSibling) target.appendChild(d.placeholder);
    d.container = target;
  }
  autoscroll(e, target) {
    if (e.clientY < 50) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 14);
    if (target.scrollHeight > target.clientHeight + 2) {
      const r = target.getBoundingClientRect();
      if (e.clientY < r.top + 36) target.scrollTop -= 10;
      else if (e.clientY > r.bottom - 36) target.scrollTop += 10;
    }
  }
  endDrag(cancel) {
    this.pending = null;
    const d = this.drag;
    this.drag = null;
    if (!d) return;
    document.body.classList.remove("tsl-is-sorting");
    const { item, placeholder, origin } = d;
    const to = { container: placeholder.parentElement, index: Array.from(placeholder.parentElement.children).filter((c) => c.classList.contains("tsl-sortable__item") || c === placeholder).indexOf(placeholder) };
    if (cancel) {
      placeholder.remove();
      if (origin.next && origin.next.parentElement === origin.container) origin.container.insertBefore(item, origin.next);
      else origin.container.appendChild(item);
    } else placeholder.replaceWith(item);
    item.classList.remove("is-dragging");
    ["position", "left", "top", "width", "height", "margin", "z-index", "pointer-events"].forEach((p) => item.style.removeProperty(p));
    if (cancel) {
      announce("Movimiento cancelado.");
      return;
    }
    this.finish(item, origin, to.container);
  }
  finish(item, origin, container) {
    const index = container.itemEls.indexOf(item);
    const changed = container !== origin.container || index !== origin.index;
    if (changed) {
      const list = container.listName();
      announce(`${this.nameOf(item)} soltado${list ? ` en ${list}` : ""}, posición ${index + 1} de ${container.itemEls.length}.`);
      emit(container, "tsl-sort", { item, from: { container: origin.container, index: origin.index }, to: { container, index } });
    } else announce(`${this.nameOf(item)} soltado en su posición original.`);
  }
  // ---- Teclado -----------------------------------------------------------------
  onKey(e) {
    const item = e.target.closest(".tsl-sortable__item");
    if (!item || item.parentElement !== this || e.target !== item) return;
    const k = e.key;
    const items = this.itemEls;
    const i = items.indexOf(item);
    const vertical = this.axis !== "horizontal";
    const rtl = !vertical && isRtl(this);
    const prevKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const grabbed = this.kb && this.kb.item === item;
    if (k === " " || k === "Enter") {
      e.preventDefault();
      if (!grabbed) {
        this.kb = { item, origin: { container: this, next: item.nextElementSibling, index: i } };
        item.setAttribute("aria-pressed", "true");
        item.classList.add("is-grabbed");
        announce(`${this.nameOf(item)} tomado. Posición ${i + 1} de ${items.length}. Usa las flechas para mover, Espacio para soltar y Escape para cancelar.`);
      } else this.dropKb();
      return;
    }
    if (k === "Escape" && grabbed) {
      e.preventDefault();
      const { origin } = this.kb;
      if (origin.next && origin.next.parentElement === origin.container) origin.container.insertBefore(item, origin.next);
      else origin.container.appendChild(item);
      this.kb = null;
      item.removeAttribute("aria-pressed");
      item.classList.remove("is-grabbed");
      item.focus();
      announce("Movimiento cancelado.");
      return;
    }
    if (!grabbed) {
      if (k === prevKey || k === nextKey) {
        e.preventDefault();
        const t = items[i + (k === nextKey ? 1 : -1)];
        if (t) t.focus();
      }
      return;
    }
    let moved = false;
    if (k === prevKey && i > 0) {
      this.insertBefore(item, items[i - 1]);
      moved = true;
    } else if (k === nextKey && i < items.length - 1) {
      this.insertBefore(item, items[i + 1].nextElementSibling);
      moved = true;
    } else if (k === "Home" || k === "End") {
      if (k === "Home") this.insertBefore(item, items[0]);
      else this.appendChild(item);
      moved = true;
    } else if (vertical && (k === "ArrowLeft" || k === "ArrowRight") || !vertical && (k === "ArrowUp" || k === "ArrowDown")) {
      const lists = this.siblings;
      const to = lists[lists.indexOf(this) + (k === "ArrowRight" || k === "ArrowDown" ? 1 : -1)];
      if (to) {
        const targetItems = to.itemEls;
        const ref = targetItems[Math.min(i, targetItems.length)] || null;
        to.insertBefore(item, ref);
        this.kb.item = item;
        item.focus();
        const idx = to.itemEls.indexOf(item);
        announce(`${to.listName() ? `${to.listName()}, ` : ""}posición ${idx + 1} de ${to.itemEls.length}.`);
        to.kb = this.kb;
        this.kb = null;
        return;
      }
      moved = false;
    } else return;
    e.preventDefault();
    if (moved) {
      item.focus();
      announce(`Posición ${this.itemEls.indexOf(item) + 1} de ${this.itemEls.length}.`);
    }
  }
  dropKb() {
    const { item, origin } = this.kb;
    this.kb = null;
    item.removeAttribute("aria-pressed");
    item.classList.remove("is-grabbed");
    this.finish(item, origin, this);
  }
};
define("tsl-sortable", TslSortable);

export {
  TslSortable
};
