import { TslElement, clamp, define, emit, nextId } from "../core/base.js";

/**
 * <tsl-virtual-list item-height="36" height="320px" overscan="6" selectable label="Contactos">
 * Renderiza solo las filas visibles: miles de elementos con un puñado de nodos en el DOM.
 *   list.items = [...];                      // cualquier arreglo
 *   list.renderItem = (item, i) => "texto"   // string (texto) o Node
 * Con `selectable`: role="listbox", ↑ ↓ PgUp PgDn Home End, Enter selecciona. Evento tsl-select { item, index }.
 * Métodos: scrollToIndex(i, "start|center|end|nearest"). Alto de fila fijo.
 */
export class TslVirtualList extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  attributeChanged() {
    if (this.viewport) this.paintLabels();
  }

  paintLabels() {
    this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Lista");
  }

  setup() {
    this._items = this._items || [];
    this.rowHeight = parseFloat(this.getAttribute("item-height") || "36");
    this.overscan = parseInt(this.getAttribute("overscan") || "6", 10);
    this.selectable = this.hasAttribute("selectable");
    this.activeIndex = -1;
    this.rows = new Map();
    this.uid = nextId("tsl-vlist");

    this.viewport = document.createElement("div");
    this.viewport.className = "tsl-vlist__viewport";
    this.viewport.tabIndex = 0;
    this.viewport.setAttribute("role", this.selectable ? "listbox" : "list");
    this.paintLabels();
    this.spacer = document.createElement("div");
    this.spacer.className = "tsl-vlist__spacer";
    this.viewport.appendChild(this.spacer);
    this.textContent = "";
    this.appendChild(this.viewport);
    if (this.getAttribute("height")) this.style.height = this.getAttribute("height");

    this.viewport.addEventListener("scroll", () => this.render(), { passive: true });
    if ("ResizeObserver" in window) {
      this.ro = new ResizeObserver(() => this.render());
      this.ro.observe(this.viewport);
    }
    if (this.selectable) {
      this.viewport.addEventListener("keydown", (e) => this.onKey(e));
      this.viewport.addEventListener("click", (e) => {
        const row = e.target.closest(".tsl-vlist__row");
        if (row) this.activate(Number(row.dataset.i), true);
      });
      this.viewport.addEventListener("focus", () => this.activeIndex < 0 && this._items.length && this.activate(0, false));
    }
    this.resize();
    this.render();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ro) this.ro.disconnect();
  }

  reconnected() {
    if (this.ro) this.ro.observe(this.viewport);
    this.render();
  }

  get items() {
    return this._items || [];
  }

  set items(list) {
    this._items = Array.isArray(list) ? list : [];
    this.activeIndex = -1;
    if (!this._tslReady) return;
    this.rows.forEach((el) => el.remove());
    this.rows.clear();
    this.resize();
    this.viewport.scrollTop = 0;
    this.render();
  }

  resize() {
    // El total lo anuncian las filas (aria-setsize): aria-rowcount solo vale en tablas y rejillas
    this.spacer.style.height = `${this._items.length * this.rowHeight}px`;
  }

  draw(item, i) {
    const out = typeof this.renderItem === "function" ? this.renderItem(item, i) : item && typeof item === "object" ? item.label ?? JSON.stringify(item) : item;
    return out instanceof Node ? out : document.createTextNode(String(out));
  }

  render() {
    if (!this.viewport) return;
    const h = this.rowHeight;
    const top = this.viewport.scrollTop;
    const view = this.viewport.clientHeight || parseFloat(this.getAttribute("height")) || 320;
    const start = Math.max(0, Math.floor(top / h) - this.overscan);
    const end = Math.min(this._items.length, Math.ceil((top + view) / h) + this.overscan);
    this.rows.forEach((el, i) => {
      if (i < start || i >= end) {
        el.remove();
        this.rows.delete(i);
      }
    });
    for (let i = start; i < end; i++) {
      if (this.rows.has(i)) continue;
      const el = document.createElement("div");
      el.className = "tsl-vlist__row";
      el.id = `${this.uid}-${i}`;
      el.dataset.i = String(i);
      el.style.height = `${h}px`;
      el.style.transform = `translateY(${i * h}px)`;
      el.setAttribute("role", this.selectable ? "option" : "listitem");
      el.setAttribute("aria-posinset", String(i + 1));
      el.setAttribute("aria-setsize", String(this._items.length));
      if (this.selectable) el.setAttribute("aria-selected", String(i === this.activeIndex));
      el.classList.toggle("is-active", i === this.activeIndex);
      el.appendChild(this.draw(this._items[i], i));
      this.spacer.appendChild(el);
      this.rows.set(i, el);
    }
  }

  scrollToIndex(i, align = "nearest") {
    i = clamp(i, 0, Math.max(0, this._items.length - 1));
    const h = this.rowHeight;
    const top = this.viewport.scrollTop;
    const view = this.viewport.clientHeight;
    const y = i * h;
    if (align === "start") this.viewport.scrollTop = y;
    else if (align === "center") this.viewport.scrollTop = y - (view - h) / 2;
    else if (align === "end") this.viewport.scrollTop = y - view + h;
    else if (y < top) this.viewport.scrollTop = y;
    else if (y + h > top + view) this.viewport.scrollTop = y + h - view;
    this.render();
  }

  activate(i, fire) {
    if (i < 0 || i >= this._items.length) return;
    const prev = this.rows.get(this.activeIndex);
    if (prev) {
      prev.classList.remove("is-active");
      prev.setAttribute("aria-selected", "false");
    }
    this.activeIndex = i;
    this.scrollToIndex(i);
    const el = this.rows.get(i);
    if (el) {
      el.classList.add("is-active");
      el.setAttribute("aria-selected", "true");
      this.viewport.setAttribute("aria-activedescendant", el.id);
    }
    if (fire) emit(this, "tsl-select", { item: this._items[i], index: i });
  }

  onKey(e) {
    const n = this._items.length;
    if (!n) return;
    const page = Math.max(1, Math.floor(this.viewport.clientHeight / this.rowHeight) - 1);
    const cur = this.activeIndex < 0 ? 0 : this.activeIndex;
    const k = e.key;
    let target = null;
    if (k === "ArrowDown") target = cur + 1;
    else if (k === "ArrowUp") target = cur - 1;
    else if (k === "PageDown") target = cur + page;
    else if (k === "PageUp") target = cur - page;
    else if (k === "Home") target = 0;
    else if (k === "End") target = n - 1;
    else if (k === "Enter" || k === " ") {
      e.preventDefault();
      this.activate(cur, true);
      return;
    }
    if (target === null) return;
    e.preventDefault();
    this.activate(clamp(target, 0, n - 1), false);
  }
}

define("tsl-virtual-list", TslVirtualList);
