import { TslElement, define, emit, isRtl, normalize } from "../core/base.js";

/**
 * <tsl-tree selection="single|multiple|none" checkable label="Archivos">
 *   <ul>
 *     <li data-value="src" data-expanded>src
 *       <ul><li data-value="app.js">app.js</li></ul>
 *     </li>
 *   </ul>
 * </tsl-tree>
 * Teclado: ↑ ↓ navegan, → expande o entra, ← colapsa o sube, Home End, Enter selecciona,
 * Espacio marca (con `checkable`), * expande los hermanos, letras saltan por nombre.
 * Eventos: tsl-select { value, values }, tsl-toggle { value, expanded }, tsl-check { values }.
 */
export class TslTree extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  attributeChanged() {
    if (this.rootList) this.paintLabels();
  }

  paintLabels() {
    const label = this.getAttribute("label");
    if (label) this.rootList.setAttribute("aria-label", label);
    else this.rootList.removeAttribute("aria-label");
  }

  setup() {
    this.mode = this.getAttribute("selection") || "single";
    this.checkable = this.hasAttribute("checkable");
    this.rootList = this.querySelector(":scope > ul");
    if (!this.rootList) return;
    this.selected = new Set();
    this.rootList.setAttribute("role", "tree");
    if (this.mode === "multiple") this.rootList.setAttribute("aria-multiselectable", "true");
    this.paintLabels();
    this.typeahead = "";
    this.build(this.rootList, 1);

    this.addEventListener("click", (e) => this.onClick(e));
    this.addEventListener("dblclick", (e) => {
      const li = e.target.closest("li[role=treeitem]");
      if (li && !e.target.closest(".tsl-tree__check")) this.toggleItem(li);
    });
    this.addEventListener("keydown", (e) => this.onKey(e));
    this.addEventListener("change", (e) => {
      const box = e.target.closest(".tsl-tree__check");
      if (box) this.setChecked(box.closest("li"), box.checked, true);
    });
    this.addEventListener("focusin", (e) => {
      const li = e.target.closest("li[role=treeitem]");
      if (li && e.target === li) this.rove(li);
    });
    const first = this.items().find((li) => li.getAttribute("aria-selected") === "true") || this.items()[0];
    if (first) first.tabIndex = 0;
    this.refreshChecks();
  }

  build(ul, level) {
    ul.querySelectorAll(":scope > li").forEach((li) => {
      const sub = li.querySelector(":scope > ul");
      const nodes = Array.from(li.childNodes).filter((n) => n !== sub);
      const row = document.createElement("div");
      row.className = "tsl-tree__row";
      const chevron = document.createElement("span");
      chevron.className = "tsl-tree__chevron";
      chevron.setAttribute("aria-hidden", "true");
      if (!sub) chevron.classList.add("is-leaf");
      row.appendChild(chevron);
      if (this.checkable) {
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "tsl-check tsl-tree__check";
        box.tabIndex = -1;
        box.setAttribute("aria-hidden", "true");
        row.appendChild(box);
      }
      const label = document.createElement("span");
      label.className = "tsl-tree__label";
      label.append(...nodes);
      row.appendChild(label);
      li.insertBefore(row, sub);

      li.setAttribute("role", "treeitem");
      li.setAttribute("aria-level", String(level));
      li.tabIndex = -1;
      li.dataset.value = li.dataset.value || label.textContent.trim();
      li.setAttribute("aria-label", li.getAttribute("aria-label") || label.textContent.trim());
      if (this.mode !== "none") li.setAttribute("aria-selected", String(li.hasAttribute("data-selected")));
      if (li.hasAttribute("data-selected")) this.selected.add(li.dataset.value);
      if (this.checkable && li.hasAttribute("data-checked")) row.querySelector(".tsl-tree__check").checked = true;
      if (sub) {
        sub.setAttribute("role", "group");
        li.setAttribute("aria-expanded", String(li.hasAttribute("data-expanded")));
        this.build(sub, level + 1);
      }
    });
  }

  items() {
    return Array.from(this.querySelectorAll("li[role=treeitem]"));
  }

  visibleItems() {
    return this.items().filter((li) => {
      let p = li.parentElement && li.parentElement.closest("li[role=treeitem]");
      while (p) {
        if (p.getAttribute("aria-expanded") !== "true") return false;
        p = p.parentElement && p.parentElement.closest("li[role=treeitem]");
      }
      return true;
    });
  }

  rove(li) {
    this.items().forEach((x) => (x.tabIndex = x === li ? 0 : -1));
  }

  focusItem(li) {
    if (!li) return;
    this.rove(li);
    li.focus();
  }

  hasChildren(li) {
    return li.hasAttribute("aria-expanded");
  }

  get value() {
    return this.mode === "multiple" ? Array.from(this.selected) : Array.from(this.selected)[0] || "";
  }

  set value(v) {
    const vals = Array.isArray(v) ? v : v ? [v] : [];
    this.selected = new Set(vals.map(String));
    this.items().forEach((li) => this.mode !== "none" && li.setAttribute("aria-selected", String(this.selected.has(li.dataset.value))));
  }

  get checkedValues() {
    return this.items().filter((li) => li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check:checked")).map((li) => li.dataset.value);
  }

  expand(value, on = true) {
    const li = this.items().find((x) => x.dataset.value === value);
    if (li && this.hasChildren(li)) this.setExpanded(li, on);
  }

  expandAll(on = true) {
    this.items().forEach((li) => this.hasChildren(li) && this.setExpanded(li, on, false));
  }

  collapseAll() {
    this.expandAll(false);
  }

  setExpanded(li, on, fire = true) {
    if (!this.hasChildren(li) || (li.getAttribute("aria-expanded") === "true") === on) return;
    li.setAttribute("aria-expanded", String(on));
    if (!on) {
      // Si el foco quedaba dentro de lo colapsado, sube al padre
      const active = document.activeElement;
      if (active && li !== active && li.contains(active)) this.focusItem(li);
    }
    if (fire) emit(this, "tsl-toggle", { value: li.dataset.value, expanded: on });
  }

  toggleItem(li) {
    this.setExpanded(li, li.getAttribute("aria-expanded") !== "true");
  }

  select(li, fire = true) {
    if (this.mode === "none") return;
    const v = li.dataset.value;
    if (this.mode === "multiple") {
      if (this.selected.has(v)) this.selected.delete(v);
      else this.selected.add(v);
    } else {
      this.selected = new Set([v]);
    }
    this.items().forEach((x) => x.setAttribute("aria-selected", String(this.selected.has(x.dataset.value))));
    if (fire) emit(this, "tsl-select", { value: v, values: Array.from(this.selected) });
  }

  // Marca un nodo y todos sus descendientes; los ancestros quedan en estado mixto
  setChecked(li, on, fire) {
    li.querySelectorAll(".tsl-tree__check").forEach((b) => ((b.checked = on), (b.indeterminate = false)));
    this.refreshChecks();
    if (fire) emit(this, "tsl-check", { values: this.checkedValues });
  }

  refreshChecks() {
    if (!this.checkable) return;
    const items = this.items().reverse();
    items.forEach((li) => {
      const box = li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check");
      const kids = Array.from(li.querySelectorAll(":scope > ul > li > .tsl-tree__row > .tsl-tree__check"));
      if (kids.length) {
        const checked = kids.filter((k) => k.checked).length;
        const mixed = kids.some((k) => k.indeterminate);
        box.checked = checked === kids.length;
        box.indeterminate = !box.checked && (checked > 0 || mixed);
      }
      li.setAttribute("aria-checked", box.indeterminate ? "mixed" : String(box.checked));
    });
  }

  onClick(e) {
    const li = e.target.closest("li[role=treeitem]");
    if (!li || !this.contains(li)) return;
    if (e.target.closest(".tsl-tree__chevron")) {
      this.toggleItem(li);
      this.focusItem(li);
      return;
    }
    if (e.target.closest(".tsl-tree__check")) return;
    this.focusItem(li);
    this.select(li);
  }

  onKey(e) {
    const li = e.target.closest && e.target.closest("li[role=treeitem]");
    if (!li || e.target !== li) return;
    const vis = this.visibleItems();
    const i = vis.indexOf(li);
    const k = e.key;
    let handled = true;
    if (k === "ArrowDown") this.focusItem(vis[Math.min(vis.length - 1, i + 1)]);
    else if (k === "ArrowUp") this.focusItem(vis[Math.max(0, i - 1)]);
    else if (k === "Home") this.focusItem(vis[0]);
    else if (k === "End") this.focusItem(vis[vis.length - 1]);
    else if (k === (isRtl(this) ? "ArrowLeft" : "ArrowRight")) {
      if (this.hasChildren(li)) {
        if (li.getAttribute("aria-expanded") !== "true") this.setExpanded(li, true);
        else this.focusItem(li.querySelector(":scope > ul > li"));
      }
    } else if (k === (isRtl(this) ? "ArrowRight" : "ArrowLeft")) {
      if (this.hasChildren(li) && li.getAttribute("aria-expanded") === "true") this.setExpanded(li, false);
      else this.focusItem(li.parentElement.closest("li[role=treeitem]"));
    } else if (k === "Enter") this.select(li);
    else if (k === " ") {
      if (this.checkable) {
        const box = li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check");
        this.setChecked(li, !box.checked || box.indeterminate, true);
      } else this.select(li);
    } else if (k === "*") {
      li.parentElement.querySelectorAll(":scope > li").forEach((s) => this.hasChildren(s) && this.setExpanded(s, true));
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      clearTimeout(this.typeTimer);
      this.typeahead += normalize(k);
      this.typeTimer = setTimeout(() => (this.typeahead = ""), 600);
      const order = vis.slice(i + 1).concat(vis.slice(0, i + 1));
      const hit = order.find((x) => normalize(x.dataset.value).startsWith(this.typeahead));
      if (hit) this.focusItem(hit);
      handled = Boolean(hit);
    } else handled = false;
    if (handled) e.preventDefault();
  }
}

define("tsl-tree", TslTree);
