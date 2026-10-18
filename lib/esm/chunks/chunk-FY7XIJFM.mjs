/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit,
  normalize
} from "./chunk-O4IHLMQS.mjs";

// src/components/data-table.js
var TslDataTable = class extends TslElement {
  setup() {
    this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
    this.q = "";
    this.sortState = null;
    this.page = 0;
    this.pageSize = parseInt(this.getAttribute("page-size") || "10", 10);
    this.selected = /* @__PURE__ */ new Set();
    this.hiddenCols = /* @__PURE__ */ new Set();
    this.density = this.getAttribute("density") || "normal";
    this.lastIndex = null;
    this._columns = this._columns || [];
    this._rows = this._rows || [];
    this.fromMarkup();
    this._columns.forEach((c) => c.hidden && this.hiddenCols.add(c.key));
    this.buildShell();
    this.update();
  }
  fromMarkup() {
    const table = this.querySelector("table");
    if (!table || this._columns.length) return;
    this._columns = Array.from(table.querySelectorAll("thead th")).map((th, i) => ({
      key: th.dataset.key || `c${i}`,
      label: th.textContent.trim(),
      sort: th.dataset.sort,
      align: th.dataset.align || (th.classList.contains("is-num") ? "end" : void 0)
    }));
    this._rows = Array.from(table.querySelectorAll("tbody tr")).map((tr, r) => {
      const row = { id: tr.dataset.id || String(r) };
      Array.from(tr.cells).forEach((td, i) => {
        const col = this._columns[i];
        if (!col) return;
        const text = td.textContent.trim();
        row[col.key] = col.sort === "number" ? parseFloat(text.replace(/[^0-9.,-]/g, "").replace(",", ".")) : text;
      });
      return row;
    });
    if (!this.getAttribute("caption") && table.caption) this.setAttribute("caption", table.caption.textContent.trim());
  }
  get columns() {
    return this._columns;
  }
  set columns(cols) {
    this._columns = Array.isArray(cols) ? cols : [];
    if (!this._tslReady) return;
    this.hiddenCols = new Set(this._columns.filter((c) => c.hidden).map((c) => c.key));
    this.sortState = null;
    this.buildColumnMenu();
    this.update();
  }
  get rows() {
    return this._rows;
  }
  set rows(rows) {
    this._rows = Array.isArray(rows) ? rows : [];
    if (!this._tslReady) return;
    const ids = new Set(this._rows.map((r) => String(r.id)));
    this.selected = new Set(Array.from(this.selected).filter((id) => ids.has(id)));
    this.update();
  }
  get selectedIds() {
    return Array.from(this.selected);
  }
  get selectedRows() {
    return this._rows.filter((r) => this.selected.has(String(r.id)));
  }
  clearSelection() {
    this.selected.clear();
    this.refreshSelection(true);
  }
  get loading() {
    return this.hasAttribute("loading");
  }
  set loading(v) {
    this.toggleAttribute("loading", Boolean(v));
    if (this._tslReady) this.update();
  }
  // ---- Estructura -----------------------------------------------------------------
  buildShell() {
    const t = (name, fallback) => this.getAttribute(name) || fallback;
    this.textContent = "";
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tsl-dt__toolbar";
    if (this.hasAttribute("searchable")) {
      this.search = document.createElement("input");
      this.search.type = "search";
      this.search.className = "tsl-input tsl-dt__search";
      this.search.placeholder = t("search-placeholder", "Buscar…");
      this.search.setAttribute("aria-label", t("search-placeholder", "Buscar en la tabla"));
      let timer = 0;
      this.search.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.q = this.search.value;
          this.page = 0;
          this.update();
        }, 150);
      });
      this.toolbar.appendChild(this.search);
    }
    const spacer = document.createElement("span");
    spacer.className = "tsl-spacer";
    this.toolbar.appendChild(spacer);
    this.selInfo = document.createElement("span");
    this.selInfo.className = "tsl-dt__selinfo";
    this.selInfo.hidden = true;
    this.selCount = document.createElement("strong");
    this.selClear = document.createElement("button");
    this.selClear.type = "button";
    this.selClear.className = "tsl-btn tsl-btn--sm tsl-btn--subtle";
    this.selClear.textContent = t("clear-label", "Limpiar");
    this.selClear.addEventListener("click", () => this.clearSelection());
    this.selInfo.append(this.selCount, this.selClear);
    this.toolbar.appendChild(this.selInfo);
    const pop = document.createElement("tsl-popover");
    pop.setAttribute("placement", "bottom-end");
    const trig = document.createElement("button");
    trig.type = "button";
    trig.className = "tsl-btn tsl-btn--sm";
    trig.setAttribute("data-tsl-trigger", "");
    trig.textContent = `${t("columns-label", "Columnas")} ▾`;
    this.colPanel = document.createElement("div");
    this.colPanel.className = "tsl-popover__panel tsl-dt__colmenu";
    this.colPanel.setAttribute("aria-label", t("columns-label", "Columnas visibles"));
    pop.append(trig, this.colPanel);
    this.toolbar.appendChild(pop);
    this.buildColumnMenu();
    this.densityBtn = document.createElement("button");
    this.densityBtn.type = "button";
    this.densityBtn.className = "tsl-btn tsl-btn--sm";
    this.densityBtn.addEventListener("click", () => {
      const order = ["compact", "normal", "comfortable"];
      this.density = order[(order.indexOf(this.density) + 1) % order.length];
      this.paintDensity();
    });
    this.toolbar.appendChild(this.densityBtn);
    if (this.hasAttribute("exportable")) {
      const exp = document.createElement("button");
      exp.type = "button";
      exp.className = "tsl-btn tsl-btn--sm";
      exp.textContent = t("export-label", "Exportar CSV");
      exp.addEventListener("click", () => this.exportCsv());
      this.toolbar.appendChild(exp);
    }
    this.wrap = document.createElement("div");
    this.wrap.className = "tsl-dt__wrap";
    if (this.getAttribute("height")) this.wrap.style.maxHeight = this.getAttribute("height");
    this.table = document.createElement("table");
    this.table.className = "tsl-table tsl-dt__table";
    this.caption = document.createElement("caption");
    this.caption.className = "tsl-sr-only";
    this.caption.textContent = this.getAttribute("caption") || "Tabla de datos";
    this.thead = document.createElement("thead");
    this.tbody = document.createElement("tbody");
    this.table.append(this.caption, this.thead, this.tbody);
    this.wrap.appendChild(this.table);
    this.footer = document.createElement("div");
    this.footer.className = "tsl-dt__footer";
    this.rangeText = document.createElement("span");
    this.rangeText.className = "tsl-muted";
    this.rangeText.setAttribute("aria-live", "polite");
    const sizeLabel = document.createElement("label");
    sizeLabel.className = "tsl-dt__size";
    sizeLabel.append(`${t("rows-label", "Filas")} `);
    this.sizeSel = document.createElement("select");
    this.sizeSel.className = "tsl-select";
    this.sizeSel.addEventListener("change", () => {
      this.pageSize = parseInt(this.sizeSel.value, 10);
      this.page = 0;
      this.update();
      emit(this, "tsl-page", { page: this.page, pageSize: this.pageSize });
    });
    sizeLabel.appendChild(this.sizeSel);
    this.pager = document.createElement("nav");
    this.pager.className = "tsl-pagination";
    this.pager.setAttribute("aria-label", t("pager-label", "Paginación"));
    this.pager.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-page]");
      if (!b || b.disabled) return;
      this.page = Number(b.dataset.page);
      this.update();
      emit(this, "tsl-page", { page: this.page, pageSize: this.pageSize });
    });
    const sp = document.createElement("span");
    sp.className = "tsl-spacer";
    this.footer.append(this.rangeText, sp, sizeLabel, this.pager);
    this.append(this.toolbar, this.wrap, this.footer);
    this.paintDensity();
  }
  buildColumnMenu() {
    if (!this.colPanel) return;
    this.colPanel.textContent = "";
    this._columns.forEach((c) => {
      const label = document.createElement("label");
      label.className = "tsl-choice";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.className = "tsl-check";
      box.checked = !this.hiddenCols.has(c.key);
      box.addEventListener("change", () => {
        if (box.checked) this.hiddenCols.delete(c.key);
        else if (this._columns.length - this.hiddenCols.size > 1) this.hiddenCols.add(c.key);
        else box.checked = true;
        this.update();
      });
      label.append(box, c.label);
      this.colPanel.appendChild(label);
    });
  }
  paintDensity() {
    const names = { compact: "Compacta", normal: "Normal", comfortable: "Cómoda" };
    this.setAttribute("density", this.density);
    this.densityBtn.textContent = `${this.getAttribute("density-label") || "Densidad"}: ${names[this.density]}`;
  }
  // ---- Datos derivados ----------------------------------------------------------------
  get visibleColumns() {
    return this._columns.filter((c) => !this.hiddenCols.has(c.key));
  }
  textOf(row, col) {
    const v = row[col.key];
    if (col.format) return String(col.format(v, row));
    if (v === null || v === void 0) return "";
    return typeof v === "number" ? new Intl.NumberFormat(this.locale).format(v) : String(v);
  }
  get processedRows() {
    const cols = this.visibleColumns;
    const q = normalize(this.q.trim());
    let rows = q ? this._rows.filter((r) => cols.some((c) => normalize(this.textOf(r, c)).includes(q))) : this._rows.slice();
    if (this.sortState) {
      const { key, dir } = this.sortState;
      const col = this._columns.find((c) => c.key === key);
      const num = (v) => v === null || v === void 0 || v === "" ? NaN : col.sort === "date" ? Date.parse(v) : Number(v);
      rows = rows.map((r, i) => ({ r, i })).sort((a, b) => {
        const va = a.r[key];
        const vb = b.r[key];
        const na = va === null || va === void 0 || va === "";
        const nb = vb === null || vb === void 0 || vb === "";
        if (na || nb) return na === nb ? a.i - b.i : na ? 1 : -1;
        let cmp;
        if (col.sort === "number" || col.sort === "date") {
          const x = num(va);
          const y = num(vb);
          cmp = x - y;
          if (Number.isNaN(cmp)) cmp = 0;
        } else cmp = String(va).localeCompare(String(vb), this.locale, { numeric: true, sensitivity: "base" });
        return (dir === "asc" ? cmp : -cmp) || a.i - b.i;
      }).map((x) => x.r);
    }
    return rows;
  }
  // ---- Render -------------------------------------------------------------------------
  update() {
    if (!this.tbody) return;
    const cols = this.visibleColumns;
    const all = this.processedRows;
    this.total = all.length;
    this.pages = Math.max(1, Math.ceil(all.length / this.pageSize));
    this.page = Math.min(this.page, this.pages - 1);
    this.pageRows = all.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
    this.table.setAttribute("aria-rowcount", String(all.length + 1));
    this.renderHead(cols);
    this.renderBody(cols);
    this.renderFooter();
    this.refreshSelection(false);
  }
  renderHead(cols) {
    const tr = document.createElement("tr");
    if (this.hasAttribute("selectable")) {
      const th = document.createElement("th");
      th.className = "tsl-dt__select";
      this.headBox = document.createElement("input");
      this.headBox.type = "checkbox";
      this.headBox.className = "tsl-check";
      this.headBox.setAttribute("aria-label", this.getAttribute("select-all-label") || "Seleccionar la página");
      this.headBox.addEventListener("change", () => {
        this.pageRows.forEach((r) => this.headBox.checked ? this.selected.add(String(r.id)) : this.selected.delete(String(r.id)));
        this.refreshSelection(true);
      });
      th.appendChild(this.headBox);
      tr.appendChild(th);
    }
    cols.forEach((c) => {
      const th = document.createElement("th");
      th.scope = "col";
      if (c.align === "end") th.classList.add("is-num");
      if (c.width) th.style.width = c.width;
      if (c.sort) {
        const dir = this.sortState && this.sortState.key === c.key ? this.sortState.dir : null;
        th.setAttribute("aria-sort", dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tsl-dt__sort";
        b.append(c.label);
        const icon = document.createElement("span");
        icon.className = "tsl-dt__sorticon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = dir === "asc" ? "↑" : dir === "desc" ? "↓" : "↕";
        b.appendChild(icon);
        b.addEventListener("click", () => this.sortBy(c.key));
        th.appendChild(b);
      } else th.textContent = c.label;
      tr.appendChild(th);
    });
    this.thead.textContent = "";
    this.thead.appendChild(tr);
  }
  sortBy(key) {
    const cur = this.sortState && this.sortState.key === key ? this.sortState.dir : null;
    this.sortState = cur === null ? { key, dir: "asc" } : cur === "asc" ? { key, dir: "desc" } : null;
    this.page = 0;
    this.update();
    emit(this, "tsl-sort", { key, dir: this.sortState ? this.sortState.dir : null });
  }
  renderBody(cols) {
    this.tbody.textContent = "";
    const span = cols.length + (this.hasAttribute("selectable") ? 1 : 0);
    if (this.loading) {
      for (let r = 0; r < Math.min(this.pageSize, 6); r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < span; c++) {
          const td = document.createElement("td");
          const sk = document.createElement("span");
          sk.className = "tsl-skeleton";
          sk.style.setProperty("--w", `${50 + (r * 7 + c * 13) % 40}%`);
          td.appendChild(sk);
          tr.appendChild(td);
        }
        this.tbody.appendChild(tr);
      }
      this.table.setAttribute("aria-busy", "true");
      return;
    }
    this.table.removeAttribute("aria-busy");
    if (!this.pageRows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = span;
      td.className = "tsl-dt__empty";
      const msg = this.q ? `${this.getAttribute("no-match-text") || "Sin resultados para"} «${this.q}»` : this.getAttribute("empty-text") || "Sin datos";
      td.textContent = msg;
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }
    this.pageRows.forEach((row, ri) => {
      const tr = document.createElement("tr");
      tr.dataset.id = String(row.id);
      tr.setAttribute("aria-rowindex", String(this.page * this.pageSize + ri + 2));
      if (this.hasAttribute("selectable")) {
        const td = document.createElement("td");
        td.className = "tsl-dt__select";
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "tsl-check";
        box.setAttribute("aria-label", `${this.getAttribute("select-row-label") || "Seleccionar fila"} ${this.page * this.pageSize + ri + 1}`);
        box.addEventListener("click", (e) => this.onRowBox(e, ri, row));
        td.appendChild(box);
        tr.appendChild(td);
      }
      cols.forEach((c) => {
        const td = document.createElement("td");
        if (c.align === "end") td.classList.add("is-num");
        if (c.render) {
          const out = c.render(row);
          if (out instanceof Node) td.appendChild(out);
          else td.textContent = out == null ? "" : String(out);
        } else td.textContent = this.textOf(row, c);
        tr.appendChild(td);
      });
      tr.addEventListener("click", (e) => {
        if (!e.target.closest("input, button, a, select")) emit(this, "tsl-row-click", { row });
      });
      this.tbody.appendChild(tr);
    });
  }
  onRowBox(e, ri, row) {
    const checked = e.target.checked;
    if (e.shiftKey && this.lastIndex !== null) {
      const [a, b] = [Math.min(this.lastIndex, ri), Math.max(this.lastIndex, ri)];
      this.pageRows.slice(a, b + 1).forEach((r) => checked ? this.selected.add(String(r.id)) : this.selected.delete(String(r.id)));
    } else if (checked) this.selected.add(String(row.id));
    else this.selected.delete(String(row.id));
    this.lastIndex = ri;
    this.refreshSelection(true);
  }
  refreshSelection(fire) {
    if (!this.tbody) return;
    let onPage = 0;
    this.tbody.querySelectorAll("tr[data-id]").forEach((tr) => {
      const on = this.selected.has(tr.dataset.id);
      if (on) onPage++;
      tr.classList.toggle("is-selected", on);
      tr.setAttribute("aria-selected", String(on));
      const box = tr.querySelector(".tsl-dt__select .tsl-check");
      if (box) box.checked = on;
    });
    if (this.headBox && this.pageRows) {
      this.headBox.checked = this.pageRows.length > 0 && onPage === this.pageRows.length;
      this.headBox.indeterminate = onPage > 0 && onPage < this.pageRows.length;
    }
    const n = this.selected.size;
    this.selInfo.hidden = n === 0;
    this.selCount.textContent = `${n} ${n === 1 ? this.getAttribute("selected-one") || "seleccionada" : this.getAttribute("selected-many") || "seleccionadas"}`;
    if (fire) emit(this, "tsl-selection", { ids: this.selectedIds, rows: this.selectedRows });
  }
  renderFooter() {
    const from = this.total ? this.page * this.pageSize + 1 : 0;
    const to = Math.min(this.total, (this.page + 1) * this.pageSize);
    this.rangeText.textContent = this.total ? `${from}–${to} de ${new Intl.NumberFormat(this.locale).format(this.total)}` : "0 resultados";
    const sizes = (this.getAttribute("page-size-options") || "5,10,20,50").split(",").map((n) => parseInt(n, 10));
    if (!sizes.includes(this.pageSize)) sizes.push(this.pageSize);
    sizes.sort((a, b) => a - b);
    this.sizeSel.textContent = "";
    sizes.forEach((n) => {
      const o = document.createElement("option");
      o.value = String(n);
      o.textContent = String(n);
      o.selected = n === this.pageSize;
      this.sizeSel.appendChild(o);
    });
    const mk = (label, page, extra = {}) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.dataset.page = String(page);
      Object.entries(extra).forEach(([k, v]) => v === true ? b.setAttribute(k, "") : b.setAttribute(k, v));
      return b;
    };
    this.pager.textContent = "";
    this.pager.hidden = this.pages < 2;
    if (this.pages < 2) return;
    const p = this.page;
    const last = this.pages - 1;
    this.pager.appendChild(mk("‹", Math.max(0, p - 1), { "aria-label": "Página anterior", ...p === 0 ? { disabled: true } : {} }));
    const nums = new Set([0, last, p - 1, p, p + 1].filter((n) => n >= 0 && n <= last));
    let prev = -1;
    Array.from(nums).sort((a, b) => a - b).forEach((n) => {
      if (n - prev > 1) {
        const dots = document.createElement("span");
        dots.textContent = "…";
        this.pager.appendChild(dots);
      }
      this.pager.appendChild(mk(String(n + 1), n, n === p ? { "aria-current": "page" } : { "aria-label": `Página ${n + 1}` }));
      prev = n;
    });
    this.pager.appendChild(mk("›", Math.min(last, p + 1), { "aria-label": "Página siguiente", ...p === last ? { disabled: true } : {} }));
  }
  // ---- Exportar ---------------------------------------------------------------------------
  toCSV() {
    const cols = this.visibleColumns;
    const esc = (s) => /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    const lines = [cols.map((c) => esc(c.label)).join(",")];
    this.processedRows.forEach((r) => lines.push(cols.map((c) => esc(this.textOf(r, c))).join(",")));
    return lines.join("\n");
  }
  exportCsv(filename = "datos.csv") {
    const blob = new Blob([`\uFEFF${this.toCSV()}`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
  }
};
define("tsl-data-table", TslDataTable);

export {
  TslDataTable
};
