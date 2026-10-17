/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  clamp,
  define,
  emit
} from "./chunk-ZOAS4LFV.mjs";

// src/components/chart.js
function niceTicks(min, max, count = 4) {
  if (min === max) max = min + 1;
  const raw = (max - min) / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return { lo, hi, ticks };
}
function linePath(pts, smooth) {
  if (!pts.length) return "";
  const f = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  if (!smooth || pts.length < 3) return `M${pts.map(f).join("L")}`;
  const n = pts.length;
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  t[n - 1] = m[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) t[i] = t[i + 1] = 0;
    else {
      const a = t[i] / m[i];
      const b = t[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        t[i] = tau * a * m[i];
        t[i + 1] = tau * b * m[i];
      }
    }
  }
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const c1 = [pts[i][0] + dx[i] / 3, pts[i][1] + t[i] * dx[i] / 3];
    const c2 = [pts[i + 1][0] - dx[i] / 3, pts[i + 1][1] - t[i + 1] * dx[i] / 3];
    d += `C${f(c1)} ${f(c2)} ${f(pts[i + 1])}`;
  }
  return d;
}
var polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
var color = (i) => `var(--tsl-chart-${i % 8 + 1})`;
var escXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var TslChart = class extends TslElement {
  static get observedAttributes() {
    return ["type", "data", "height", "stacked", "horizontal", "smooth", "legend", "caption"];
  }
  attributeChangedCallback(name, old, val) {
    if (!this._tslReady || old === val) return;
    if (name === "data") this._data = this.parseAttrData();
    this.render();
  }
  parseAttrData() {
    try {
      return JSON.parse(this.getAttribute("data") || "null");
    } catch (_) {
      return null;
    }
  }
  get data() {
    return this._data;
  }
  set data(v) {
    this._data = v;
    this.hidden_ = /* @__PURE__ */ new Set();
    if (this._tslReady) this.render();
  }
  setup() {
    this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
    if (this._data === void 0) this._data = this.parseAttrData();
    this.hidden_ = this.hidden_ || /* @__PURE__ */ new Set();
    this.active = -1;
    this.width = 0;
    this.textContent = "";
    this.caption = document.createElement("div");
    this.caption.className = "tsl-chart__caption";
    this.legendEl = document.createElement("div");
    this.legendEl.className = "tsl-chart__legend";
    this.stage = document.createElement("div");
    this.stage.className = "tsl-chart__stage";
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("aria-hidden", "true");
    this.tip = document.createElement("div");
    this.tip.className = "tsl-chart__tip";
    this.tip.hidden = true;
    this.stage.append(this.svg, this.tip);
    this.liveEl = document.createElement("div");
    this.liveEl.className = "tsl-sr-only";
    this.liveEl.setAttribute("aria-live", "polite");
    this.tableEl = document.createElement("div");
    this.tableEl.className = "tsl-sr-only";
    this.append(this.caption, this.legendEl, this.stage, this.liveEl, this.tableEl);
    this.tabIndex = 0;
    this.setAttribute("role", "group");
    this.setAttribute("aria-roledescription", "gráfica");
    this.classList.add("is-animating");
    setTimeout(() => this.classList.remove("is-animating"), 900);
    this.svg.addEventListener("pointermove", (e) => this.onPointer(e));
    this.svg.addEventListener("pointerleave", () => this.setActive(-1));
    this.svg.addEventListener("click", (e) => {
      if (this.active >= 0) emit(this, "tsl-chart-click", this.describe(this.active));
      void e;
    });
    this.addEventListener("keydown", (e) => this.onKey(e));
    this.addEventListener("blur", () => this.setActive(-1));
    this.legendEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      const i = Number(b.dataset.i);
      if (this.hidden_.has(i)) this.hidden_.delete(i);
      else if (this.legendItems().length - this.hidden_.size > 1) this.hidden_.add(i);
      this.render();
    });
    if ("ResizeObserver" in window) {
      this.ro = new ResizeObserver(() => {
        const w = Math.round(this.stage.clientWidth);
        if (w && w !== this.width) {
          this.width = w;
          this.render();
        }
      });
      this.ro.observe(this.stage);
    }
    this.width = Math.round(this.stage.clientWidth) || 600;
    this.render();
  }
  disconnectedCallback() {
    if (this.ro) this.ro.disconnect();
  }
  get type() {
    return this.getAttribute("type") || "line";
  }
  get height() {
    return parseInt(this.getAttribute("height") || "240", 10);
  }
  fmt(v) {
    if (v === null || v === void 0 || Number.isNaN(v)) return "—";
    const s = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 }).format(v);
    return `${this.getAttribute("prefix") || ""}${s}${this.getAttribute("suffix") || ""}`;
  }
  tick(v) {
    const s = new Intl.NumberFormat(this.locale, { notation: Math.abs(v) >= 1e4 ? "compact" : "standard", maximumFractionDigits: 1 }).format(v);
    return `${this.getAttribute("prefix") || ""}${s}${this.getAttribute("suffix") || ""}`;
  }
  // Elementos de leyenda según el tipo (series o segmentos)
  legendItems() {
    const d = this._data || {};
    if (this.type === "donut") return (d.segments || []).map((s, i) => ({ name: s.label, i }));
    if (["line", "area", "bar"].includes(this.type)) return (d.series || []).map((s, i) => ({ name: s.name, i }));
    return [];
  }
  render() {
    if (!this.svg) return;
    const d = this._data;
    const W = this.width || 600;
    const H = this.height;
    this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", String(H));
    this.hit = null;
    const cap = this.getAttribute("caption");
    this.caption.textContent = cap || "";
    this.caption.hidden = !cap;
    this.setAttribute("aria-label", cap || this.getAttribute("aria-label") || "Gráfica");
    let markup = "";
    if (!d) markup = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
    else if (this.type === "donut") markup = this.renderDonut(W, H, d);
    else if (this.type === "gauge") markup = this.renderGauge(W, H, d);
    else if (this.type === "heatmap") markup = this.renderHeatmap(W, H, d);
    else markup = this.renderXY(W, H, d);
    this.svg.innerHTML = markup;
    this.cursor = this.svg.querySelector(".tsl-chart__cursor");
    this.renderLegend();
    this.renderTable();
    if (this.active >= 0) this.setActive(Math.min(this.active, (this.hit ? this.hit.count : 1) - 1), true);
  }
  renderLegend() {
    const items = this.legendItems();
    const show = this.hasAttribute("legend") || this.type === "donut" && this.getAttribute("legend") !== "false" || items.length > 1 && this.getAttribute("legend") !== "false";
    this.legendEl.textContent = "";
    this.legendEl.hidden = !show || !items.length;
    items.forEach(({ name, i }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tsl-chart__legend-item";
      b.dataset.i = String(i);
      b.setAttribute("aria-pressed", String(!this.hidden_.has(i)));
      const dot = document.createElement("span");
      dot.className = "tsl-chart__dot";
      dot.style.background = color(i);
      b.append(dot, name);
      this.legendEl.appendChild(b);
    });
  }
  renderTable() {
    const d = this._data;
    if (!d) return this.tableEl.textContent = "";
    let head = [];
    let body = [];
    if (["line", "area", "bar"].includes(this.type)) {
      head = ["", ...(d.series || []).map((s) => s.name)];
      body = (d.labels || []).map((l, i) => [l, ...(d.series || []).map((s) => this.fmt(s.values[i]))]);
    } else if (this.type === "donut") {
      head = ["", "Valor"];
      body = (d.segments || []).map((s) => [s.label, this.fmt(s.value)]);
    } else if (this.type === "gauge") {
      head = ["", "Valor"];
      body = [[d.label || "Valor", this.fmt(d.value)]];
    } else if (this.type === "heatmap") {
      head = ["", ...d.cols || []];
      body = (d.rows || []).map((r, ri) => [r, ...(d.values[ri] || []).map((v) => this.fmt(v))]);
    }
    const table = document.createElement("table");
    const cap = document.createElement("caption");
    cap.textContent = this.getAttribute("caption") || "Datos de la gráfica";
    table.appendChild(cap);
    const thead = document.createElement("tr");
    head.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      thead.appendChild(th);
    });
    table.appendChild(thead);
    body.forEach((r) => {
      const tr = document.createElement("tr");
      r.forEach((c, i) => {
        const td = document.createElement(i === 0 ? "th" : "td");
        td.textContent = String(c);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    this.tableEl.textContent = "";
    this.tableEl.appendChild(table);
  }
  // ---- Línea / área / barras ------------------------------------------------------------
  renderXY(W, H, d) {
    const labels = d.labels || [];
    const all = d.series || [];
    const vis = all.map((s, i) => ({ s, i })).filter(({ i }) => !this.hidden_.has(i));
    const type = this.type;
    const stacked = type === "bar" && this.hasAttribute("stacked");
    const horizontal = type === "bar" && this.hasAttribute("horizontal");
    const n = labels.length;
    if (!n || !vis.length) return `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
    const values = (s) => s.values.map((v) => v === null || v === void 0 ? NaN : Number(v));
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < n; i++) {
      if (stacked) {
        let pos = 0;
        let neg = 0;
        vis.forEach(({ s }) => {
          const v = values(s)[i] || 0;
          if (v >= 0) pos += v;
          else neg += v;
        });
        hi = Math.max(hi, pos);
        lo = Math.min(lo, neg);
      } else {
        vis.forEach(({ s }) => {
          const v = values(s)[i];
          if (!Number.isNaN(v)) {
            hi = Math.max(hi, v);
            lo = Math.min(lo, v);
          }
        });
      }
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (type === "bar" || type === "area") lo = Math.min(0, lo);
    const { lo: y0v, hi: y1v, ticks } = niceTicks(lo, Math.max(hi, lo + 1));
    const tickLen = Math.max(...ticks.map((t) => this.tick(t).length));
    const labelLen = Math.max(...labels.map((l) => String(l).length));
    const m = { top: 10, right: 14, bottom: horizontal ? 24 : 28, left: horizontal ? Math.min(160, labelLen * 6.4 + 14) : Math.max(34, tickLen * 6.4 + 12) };
    const pw = Math.max(10, W - m.left - m.right);
    const ph = Math.max(10, H - m.top - m.bottom);
    const vs = (v) => horizontal ? m.left + (v - y0v) / (y1v - y0v) * pw : m.top + ph - (v - y0v) / (y1v - y0v) * ph;
    const band = (horizontal ? ph : pw) / n;
    const cpos = (i) => type === "bar" ? (horizontal ? m.top : m.left) + band * (i + 0.5) : n === 1 ? m.left + pw / 2 : m.left + pw * i / (n - 1);
    let out = "";
    ticks.forEach((t) => {
      const p = vs(t);
      if (horizontal) out += `<line class="tsl-chart__grid" x1="${p}" x2="${p}" y1="${m.top}" y2="${m.top + ph}"/><text class="tsl-chart__tick" x="${p}" y="${H - 8}" text-anchor="middle">${escXml(this.tick(t))}</text>`;
      else out += `<line class="tsl-chart__grid" x1="${m.left}" x2="${m.left + pw}" y1="${p}" y2="${p}"/><text class="tsl-chart__tick" x="${m.left - 8}" y="${p + 3.5}" text-anchor="end">${escXml(this.tick(t))}</text>`;
    });
    const maxLabels = Math.max(1, Math.floor(horizontal ? ph / 16 : pw / (labelLen * 6.4 + 10)));
    const every = Math.ceil(n / maxLabels);
    labels.forEach((l, i) => {
      if (i % every) return;
      if (horizontal) out += `<text class="tsl-chart__tick" x="${m.left - 8}" y="${cpos(i) + 3.5}" text-anchor="end">${escXml(l)}</text>`;
      else out += `<text class="tsl-chart__tick" x="${cpos(i)}" y="${H - 9}" text-anchor="middle">${escXml(l)}</text>`;
    });
    const zero = vs(Math.max(y0v, Math.min(0, y1v)));
    if (type === "bar") {
      const g = Math.max(2, band * 0.2);
      const inner = band - g;
      const k = stacked ? 1 : vis.length;
      const bw = Math.max(2, inner / k - (k > 1 ? 2 : 0));
      vis.forEach(({ s, i: si }, vi) => {
        const vals = values(s);
        labels.forEach((_, i) => {
          const v = vals[i];
          if (Number.isNaN(v)) return;
          let a = zero;
          let b = vs(v);
          if (stacked) {
            let base = 0;
            for (let j = 0; j < vi; j++) {
              const pv = values(vis[j].s)[i] || 0;
              if (pv >= 0 === v >= 0) base += pv;
            }
            a = vs(base);
            b = vs(base + v);
          }
          const start = band * i + g / 2 + (stacked ? 0 : vi * (inner / k));
          if (horizontal) {
            const x = Math.min(a, b);
            out += `<rect class="tsl-chart__bar" x="${x}" y="${m.top + start}" width="${Math.max(1, Math.abs(b - a))}" height="${bw}" rx="2" fill="${color(si)}"/>`;
          } else {
            const y = Math.min(a, b);
            out += `<rect class="tsl-chart__bar" x="${m.left + start}" y="${y}" width="${bw}" height="${Math.max(1, Math.abs(b - a))}" rx="2" fill="${color(si)}"/>`;
          }
        });
      });
      out += `<line class="tsl-chart__axis" ${horizontal ? `x1="${zero}" x2="${zero}" y1="${m.top}" y2="${m.top + ph}"` : `x1="${m.left}" x2="${m.left + pw}" y1="${zero}" y2="${zero}"`}/>`;
    } else {
      vis.forEach(({ s, i: si }) => {
        const pts = values(s).map((v, i) => Number.isNaN(v) ? null : [cpos(i), vs(v)]);
        const segs = [];
        let cur = [];
        pts.forEach((p) => {
          if (p) cur.push(p);
          else if (cur.length) segs.push(cur), cur = [];
        });
        if (cur.length) segs.push(cur);
        segs.forEach((seg) => {
          const smooth = this.hasAttribute("smooth");
          const path = linePath(seg, smooth);
          if (type === "area") out += `<path class="tsl-chart__area" d="${path}L${seg[seg.length - 1][0].toFixed(1)},${zero}L${seg[0][0].toFixed(1)},${zero}Z" fill="${color(si)}"/>`;
          out += `<path class="tsl-chart__line" d="${path}" pathLength="1" stroke="${color(si)}"/>`;
        });
        if (n <= 24) pts.forEach((p) => p && (out += `<circle class="tsl-chart__point" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="${color(si)}"/>`));
      });
    }
    out += `<g class="tsl-chart__cursor"></g>`;
    this.hit = { kind: "xy", count: n, m, pw, ph, band, cpos, vs, vis, values, labels, horizontal, stacked, type, zero };
    return out;
  }
  // ---- Dona -----------------------------------------------------------------------------------
  segments() {
    const d = this._data || {};
    return (d.segments || []).map((s, i) => ({ ...s, i })).filter((s) => !this.hidden_.has(s.i) && Number(s.value) > 0);
  }
  renderDonut(W, H, d) {
    const segs = this.segments();
    const total = segs.reduce((a2, s) => a2 + Number(s.value), 0);
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.max(20, Math.min(W, H) / 2 - 10);
    const ratio = parseFloat(this.getAttribute("thickness") || "0.3");
    const ri = r * (1 - ratio);
    if (!total) return `<text x="${cx}" y="${cy}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
    let out = "";
    let a = -Math.PI / 2;
    const gap = segs.length > 1 ? 0.025 : 0;
    segs.forEach((s) => {
      const sweep = Math.min(Number(s.value) / total * Math.PI * 2, Math.PI * 2 - 1e-4);
      const a0 = a + gap / 2;
      const a1 = a + sweep - gap / 2;
      a += sweep;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const [x0, y0] = polar(cx, cy, r, a0);
      const [x1, y1] = polar(cx, cy, r, a1);
      const [x2, y2] = polar(cx, cy, ri, a1);
      const [x3, y3] = polar(cx, cy, ri, a0);
      const mid = (a0 + a1) / 2;
      out += `<path class="tsl-chart__seg" data-i="${s.i}" data-dx="${Math.cos(mid).toFixed(3)}" data-dy="${Math.sin(mid).toFixed(3)}" d="M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}A${ri},${ri} 0 ${large} 0 ${x3.toFixed(2)},${y3.toFixed(2)}Z" fill="${color(s.i)}"/>`;
    });
    out += `<g class="tsl-chart__center"><text class="tsl-chart__center-value" x="${cx}" y="${cy + 2}" text-anchor="middle">${escXml(this.fmt(total))}</text><text class="tsl-chart__center-label" x="${cx}" y="${cy + 20}" text-anchor="middle">${escXml(this.getAttribute("center-label") || "Total")}</text></g>`;
    this.hit = { kind: "donut", count: segs.length, segs, total, cx, cy, r, d };
    return out;
  }
  // ---- Gauge -----------------------------------------------------------------------------------
  renderGauge(W, H, d) {
    const min = d.min ?? 0;
    const max = d.max ?? 100;
    const value = clamp(Number(d.value), min, max);
    const ratio = (value - min) / (max - min || 1);
    const r = Math.max(30, Math.min(W / 2 - 22, H - 52));
    const cx = W / 2;
    const cy = H - 34;
    const stroke = 16;
    const arc = (r0, from, to) => {
      const [x0, y0] = polar(cx, cy, r0, Math.PI + from * Math.PI);
      const [x1, y1] = polar(cx, cy, r0, Math.PI + to * Math.PI);
      return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r0},${r0} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
    };
    let out = `<path class="tsl-chart__track" d="${arc(r, 0, 1)}" stroke-width="${stroke}"/>`;
    const th = (d.thresholds || []).slice().sort((a, b) => a.to - b.to);
    let prev = min;
    th.forEach((t) => {
      const a = (prev - min) / (max - min || 1);
      const b = (clamp(t.to, min, max) - min) / (max - min || 1);
      if (b > a) out += `<path class="tsl-chart__band-arc" d="${arc(r, a, b)}" stroke="${t.color || color(0)}" stroke-width="${stroke}"/>`;
      prev = t.to;
    });
    const hit = th.find((t) => value <= t.to);
    const c = hit && hit.color || color(0);
    if (ratio > 0) out += `<path class="tsl-chart__value-arc" d="${arc(r, 0, ratio)}" pathLength="1" stroke="${c}" stroke-width="${stroke}"/>`;
    out += `<text class="tsl-chart__center-value" x="${cx}" y="${cy - 8}" text-anchor="middle">${escXml(this.fmt(Number(d.value)))}</text>`;
    if (d.label) out += `<text class="tsl-chart__center-label" x="${cx}" y="${cy + 12}" text-anchor="middle">${escXml(d.label)}</text>`;
    out += `<text class="tsl-chart__tick" x="${cx - r}" y="${cy + 18}" text-anchor="middle">${escXml(this.tick(min))}</text><text class="tsl-chart__tick" x="${cx + r}" y="${cy + 18}" text-anchor="middle">${escXml(this.tick(max))}</text>`;
    this.setAttribute("aria-valuenow", String(d.value));
    this.setAttribute("aria-valuetext", `${d.label ? `${d.label}: ` : ""}${this.fmt(Number(d.value))}`);
    this.hit = { kind: "gauge", count: 1 };
    return out;
  }
  // ---- Mapa de calor ---------------------------------------------------------------------------
  renderHeatmap(W, H, d) {
    const rows = d.rows || [];
    const cols = d.cols || [];
    const vals = d.values || [];
    if (!rows.length || !cols.length) return `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
    const flat = vals.flat().filter((v) => v !== null && v !== void 0 && !Number.isNaN(v));
    const lo = d.min ?? Math.min(...flat);
    const hi = d.max ?? Math.max(...flat);
    const left = Math.min(120, Math.max(...rows.map((r) => String(r).length)) * 6.4 + 12);
    const top = 22;
    const bottom = 26;
    const cw = (W - left - 8) / cols.length;
    const ch = Math.max(10, Math.min(36, (H - top - bottom) / rows.length));
    let out = "";
    cols.forEach((c, ci) => out += `<text class="tsl-chart__tick" x="${left + cw * (ci + 0.5)}" y="${top - 8}" text-anchor="middle">${escXml(c)}</text>`);
    rows.forEach((r, ri) => {
      out += `<text class="tsl-chart__tick" x="${left - 8}" y="${top + ch * (ri + 0.5) + 3.5}" text-anchor="end">${escXml(r)}</text>`;
      cols.forEach((_, ci) => {
        const v = (vals[ri] || [])[ci];
        const empty = v === null || v === void 0 || Number.isNaN(v);
        const t = empty ? 0 : (v - lo) / (hi - lo || 1);
        out += `<rect class="tsl-chart__cell${empty ? " is-empty" : ""}" data-r="${ri}" data-c="${ci}" x="${(left + cw * ci + 1).toFixed(1)}" y="${(top + ch * ri + 1).toFixed(1)}" width="${Math.max(1, cw - 2).toFixed(1)}" height="${Math.max(1, ch - 2)}" rx="3" fill="${color(0)}" fill-opacity="${empty ? 0 : (0.1 + 0.9 * t).toFixed(3)}"/>`;
      });
    });
    const ly = top + ch * rows.length + 10;
    const steps = 5;
    out += `<text class="tsl-chart__tick" x="${left}" y="${ly + 9}" text-anchor="start">${escXml(this.tick(lo))}</text><text class="tsl-chart__tick" x="${W - 8}" y="${ly + 9}" text-anchor="end">${escXml(this.tick(hi))}</text>`;
    for (let i = 0; i < steps; i++) out += `<rect x="${(W / 2 - 40 + i * 16).toFixed(1)}" y="${ly}" width="14" height="10" rx="2" fill="${color(0)}" fill-opacity="${(0.1 + 0.9 * i / (steps - 1)).toFixed(2)}"/>`;
    out += `<g class="tsl-chart__cursor"></g>`;
    this.hit = { kind: "heat", count: rows.length * cols.length, rows, cols, vals, left, top, cw, ch };
    return out;
  }
  // ---- Interacción -------------------------------------------------------------------------------
  onPointer(e) {
    const h = this.hit;
    if (!h) return;
    const r = this.svg.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * (this.width || r.width);
    const y = e.clientY - r.top;
    if (h.kind === "xy") {
      const along = h.horizontal ? y : x;
      const start = h.horizontal ? h.m.top : h.m.left;
      let idx;
      if (h.type === "bar") idx = Math.floor((along - start) / h.band);
      else {
        let best = 0;
        let dist = Infinity;
        for (let i = 0; i < h.count; i++) {
          const dd = Math.abs(h.cpos(i) - along);
          if (dd < dist) dist = dd, best = i;
        }
        idx = best;
      }
      const inside = x >= h.m.left - 4 && x <= h.m.left + h.pw + 4 && y >= h.m.top - 4 && y <= h.m.top + h.ph + 4;
      this.setActive(inside ? clamp(idx, 0, h.count - 1) : -1, false, e);
    } else if (h.kind === "donut") {
      const seg = e.target.closest && e.target.closest("path[data-i]");
      const i = seg ? h.segs.findIndex((s) => s.i === Number(seg.dataset.i)) : -1;
      this.setActive(i, false, e);
    } else if (h.kind === "heat") {
      const c = e.target.closest && e.target.closest("rect[data-r]");
      this.setActive(c ? Number(c.dataset.r) * h.cols.length + Number(c.dataset.c) : -1, false, e);
    }
  }
  onKey(e) {
    const h = this.hit;
    if (!h || h.kind === "gauge") return;
    const k = e.key;
    let next = null;
    const cur = this.active < 0 ? -1 : this.active;
    if (h.kind === "heat") {
      const cols = h.cols.length;
      const base = cur < 0 ? 0 : cur;
      if (k === "ArrowRight") next = cur < 0 ? 0 : Math.min(h.count - 1, base + 1);
      else if (k === "ArrowLeft") next = cur < 0 ? 0 : Math.max(0, base - 1);
      else if (k === "ArrowDown") next = cur < 0 ? 0 : Math.min(h.count - 1, base + cols);
      else if (k === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, base - cols);
    } else {
      const horizontal = h.kind === "xy" && h.horizontal;
      const fwd = horizontal ? "ArrowDown" : "ArrowRight";
      const back = horizontal ? "ArrowUp" : "ArrowLeft";
      if (k === fwd || h.kind === "donut" && k === "ArrowDown") next = cur < 0 ? 0 : Math.min(h.count - 1, cur + 1);
      else if (k === back || h.kind === "donut" && k === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, cur - 1);
    }
    if (k === "Home") next = 0;
    else if (k === "End") next = h.count - 1;
    else if (k === "Escape") {
      this.setActive(-1);
      return;
    } else if ((k === "Enter" || k === " ") && this.active >= 0) {
      e.preventDefault();
      emit(this, "tsl-chart-click", this.describe(this.active));
      return;
    }
    if (next === null) return;
    e.preventDefault();
    this.setActive(next, true);
  }
  // Datos del punto activo: etiqueta y valores por serie
  describe(i) {
    const h = this.hit;
    if (!h) return null;
    if (h.kind === "xy") {
      return { index: i, label: h.labels[i], values: h.vis.map(({ s }) => ({ name: s.name, value: s.values[i], color: color(h.vis.find((v) => v.s === s).i) })) };
    }
    if (h.kind === "donut") {
      const s = h.segs[i];
      return { index: i, label: s.label, values: [{ name: s.label, value: Number(s.value), color: color(s.i), percent: Number(s.value) / h.total * 100 }] };
    }
    if (h.kind === "heat") {
      const r = Math.floor(i / h.cols.length);
      const c = i % h.cols.length;
      return { index: i, label: `${h.rows[r]} · ${h.cols[c]}`, values: [{ name: h.rows[r], value: (h.vals[r] || [])[c], color: color(0) }] };
    }
    return null;
  }
  setActive(i, fromKeyboard = false, pointerEvent) {
    const h = this.hit;
    const changed = i !== this.active;
    this.active = i;
    this.querySelectorAll(".tsl-chart__seg.is-active").forEach((el) => el.classList.remove("is-active"));
    if (this.cursor) this.cursor.textContent = "";
    this.stage.classList.toggle("has-active", i >= 0);
    if (!h || i < 0) {
      this.tip.hidden = true;
      this.liveEl.textContent = "";
      if (h && h.kind === "donut") this.resetCenter();
      return;
    }
    const info = this.describe(i);
    let ax = 0;
    let ay = 0;
    if (h.kind === "xy") {
      const pos = h.cpos(i);
      const g = this.cursor;
      let marks = "";
      if (h.type === "bar") {
        marks = h.horizontal ? `<rect class="tsl-chart__hl" x="${h.m.left}" y="${h.m.top + h.band * i}" width="${h.pw}" height="${h.band}"/>` : `<rect class="tsl-chart__hl" x="${h.m.left + h.band * i}" y="${h.m.top}" width="${h.band}" height="${h.ph}"/>`;
        ax = h.horizontal ? h.m.left + h.pw / 2 : pos;
        ay = h.horizontal ? pos : h.m.top;
      } else {
        marks = `<line class="tsl-chart__cross" x1="${pos}" x2="${pos}" y1="${h.m.top}" y2="${h.m.top + h.ph}"/>`;
        h.vis.forEach(({ s, i: si }) => {
          const v = Number(s.values[i]);
          if (!Number.isNaN(v) && s.values[i] !== null) marks += `<circle class="tsl-chart__hot" cx="${pos}" cy="${h.vs(v)}" r="4.5" fill="${color(si)}"/>`;
        });
        ax = pos;
        ay = h.m.top;
      }
      if (g) g.innerHTML = marks;
    } else if (h.kind === "donut") {
      const el = this.svg.querySelectorAll("path[data-i]")[i];
      if (el) {
        el.classList.add("is-active");
        el.style.transform = `translate(${(Number(el.dataset.dx) * 5).toFixed(1)}px, ${(Number(el.dataset.dy) * 5).toFixed(1)}px)`;
      }
      this.svg.querySelectorAll("path[data-i]").forEach((p, j) => j !== i && (p.style.transform = ""));
      const c = this.svg.querySelector(".tsl-chart__center");
      if (c) {
        c.querySelector(".tsl-chart__center-value").textContent = this.fmt(info.values[0].value);
        c.querySelector(".tsl-chart__center-label").textContent = `${info.label} · ${info.values[0].percent.toFixed(1)}%`;
      }
      const mid = Math.atan2(Number(el.dataset.dy), Number(el.dataset.dx));
      ax = h.cx + (h.r + 6) * Math.cos(mid);
      ay = h.cy + (h.r + 6) * Math.sin(mid);
    } else if (h.kind === "heat") {
      const r = Math.floor(i / h.cols.length);
      const c = i % h.cols.length;
      if (this.cursor) this.cursor.innerHTML = `<rect class="tsl-chart__cell-hl" x="${(h.left + h.cw * c + 0.5).toFixed(1)}" y="${(h.top + h.ch * r + 0.5).toFixed(1)}" width="${(h.cw - 1).toFixed(1)}" height="${(h.ch - 1).toFixed(1)}" rx="3"/>`;
      ax = h.left + h.cw * (c + 0.5);
      ay = h.top + h.ch * r;
    }
    this.showTip(info, ax, ay, pointerEvent);
    this.liveEl.textContent = `${info.label}: ${info.values.map((v) => `${v.name !== info.label ? `${v.name} ` : ""}${this.fmt(v.value)}`).join(", ")}`;
    if (changed) emit(this, "tsl-chart-hover", info);
    void fromKeyboard;
  }
  resetCenter() {
    const h = this.hit;
    const c = this.svg.querySelector(".tsl-chart__center");
    if (c && h && h.kind === "donut") {
      c.querySelector(".tsl-chart__center-value").textContent = this.fmt(h.total);
      c.querySelector(".tsl-chart__center-label").textContent = this.getAttribute("center-label") || "Total";
      this.svg.querySelectorAll("path[data-i]").forEach((p) => p.style.transform = "");
    }
  }
  showTip(info, ax, ay, pointerEvent) {
    this.tip.textContent = "";
    const title = document.createElement("div");
    title.className = "tsl-chart__tip-title";
    title.textContent = info.label;
    this.tip.appendChild(title);
    info.values.forEach((v) => {
      const row = document.createElement("div");
      row.className = "tsl-chart__tip-row";
      const dot = document.createElement("span");
      dot.className = "tsl-chart__dot";
      dot.style.background = v.color;
      const name = document.createElement("span");
      name.textContent = v.name === info.label ? "" : v.name;
      const val = document.createElement("strong");
      val.textContent = this.fmt(v.value);
      row.append(dot, name, val);
      if (v.percent !== void 0) {
        const pct = document.createElement("span");
        pct.className = "tsl-muted";
        pct.textContent = `${v.percent.toFixed(1)}%`;
        row.appendChild(pct);
      }
      this.tip.appendChild(row);
    });
    this.tip.hidden = false;
    const W = this.stage.clientWidth;
    const tw = this.tip.offsetWidth;
    const th = this.tip.offsetHeight;
    let x = ax + 12;
    let y = ay + 4;
    if (pointerEvent && this.hit.kind !== "xy") {
      const r = this.stage.getBoundingClientRect();
      x = pointerEvent.clientX - r.left + 14;
      y = pointerEvent.clientY - r.top + 14;
    }
    if (x + tw > W - 4) x = (this.hit.kind === "xy" ? ax : x) - tw - 14;
    this.tip.style.left = `${clamp(x, 4, Math.max(4, W - tw - 4))}px`;
    this.tip.style.top = `${clamp(y, 4, Math.max(4, this.height - th - 4))}px`;
  }
};
define("tsl-chart", TslChart);

export {
  TslChart
};
