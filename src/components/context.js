import { TslElement, define } from "../core/base.js";
import "./popover.js";

const ROWS = [
  ["input", "input-label", "Entrada"],
  ["output", "output-label", "Salida"],
  ["reasoning", "reasoning-label", "Razonamiento"],
  ["cached", "cached-label", "En caché"]
];

/**
 * <tsl-context used="48200" max="200000" input="36000" output="9000" reasoning="3200" cached="12000" cost="0.42" currency="USD"></tsl-context>
 * Medidor del contexto de un modelo: un anillo con el porcentaje usado que abre un panel con la
 * barra, el desglose de tokens (solo las filas que reciba) y el coste estimado. A partir del 75 %
 * pasa a aviso y del 90 % a peligro (`data-level`).
 */
export class TslContext extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "used", "max", "input", "output", "reasoning", "cached", "cost", "currency", "model", "label", "input-label", "output-label", "reasoning-label", "cached-label", "cost-label"];
  }

  setup() {
    const NS = "http://www.w3.org/2000/svg";
    this.textContent = "";
    this.pop = document.createElement("tsl-popover");
    this.pop.setAttribute("placement", this.getAttribute("placement") || "top-start");
    this.pop.setAttribute("label", this.getAttribute("label") || "Uso del contexto");

    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "tsl-btn tsl-btn--sm tsl-btn--subtle tsl-context__trigger";
    this.trigger.setAttribute("data-tsl-trigger", "");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("class", "tsl-context__ring");
    svg.setAttribute("aria-hidden", "true");
    const track = document.createElementNS(NS, "circle");
    this.arc = document.createElementNS(NS, "circle");
    [track, this.arc].forEach((c, i) => {
      c.setAttribute("cx", "10");
      c.setAttribute("cy", "10");
      c.setAttribute("r", "8");
      c.setAttribute("pathLength", "100");
      c.setAttribute("class", i ? "tsl-context__arc" : "tsl-context__track");
      svg.appendChild(c);
    });
    this.percentEl = document.createElement("span");
    this.percentEl.className = "tsl-context__percent";
    this.trigger.append(svg, this.percentEl);

    this.panel = document.createElement("div");
    this.panel.className = "tsl-popover__panel tsl-context__panel";
    this.panel.innerHTML =
      '<div class="tsl-context__head"><span class="tsl-context__title"></span><span class="tsl-context__total"></span></div>' +
      '<div class="tsl-context__bar" role="meter" aria-valuemin="0"><span class="tsl-context__fill"></span></div>' +
      '<dl class="tsl-context__rows"></dl>' +
      '<div class="tsl-context__foot" hidden><span></span><span class="tsl-context__cost"></span></div>';
    this.pop.append(this.trigger, this.panel);
    this.appendChild(this.pop);
    this.paint();
  }

  attributeChanged(name) {
    if (name === "label") this.pop.setAttribute("label", this.getAttribute("label") || "Uso del contexto");
    this.paint();
  }

  num(name) {
    const v = parseFloat(this.getAttribute(name));
    return Number.isFinite(v) ? v : null;
  }

  get used() {
    return Math.max(0, this.num("used") || 0);
  }

  get max() {
    return Math.max(0, this.num("max") || 0);
  }

  /** Fracción usada, entre 0 y 1. */
  get ratio() {
    return this.max ? Math.min(1, this.used / this.max) : 0;
  }

  get level() {
    const r = this.ratio;
    return r >= 0.9 ? "danger" : r >= 0.75 ? "warn" : "ok";
  }

  get locale() {
    const host = this.closest("[lang]");
    return (host && host.lang) || "es";
  }

  open() {
    if (this.pop && this.pop.open) this.pop.open();
  }

  close() {
    if (this.pop && this.pop.close) this.pop.close();
  }

  paint() {
    if (!this.panel) return;
    const lang = this.locale;
    const compact = new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 });
    const pct = new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 0 }).format(this.ratio);
    const usedText = `${compact.format(this.used)} / ${compact.format(this.max)}`;
    const name = this.getAttribute("label") || "Contexto";

    this.setAttribute("data-level", this.level);
    this.arc.setAttribute("stroke-dasharray", `${(this.ratio * 100).toFixed(2)} 100`);
    this.percentEl.textContent = pct;
    this.trigger.setAttribute("aria-label", `${name}: ${pct} usado (${usedText} tokens)`);

    const q = (s) => this.panel.querySelector(s);
    q(".tsl-context__title").textContent = this.getAttribute("model") ? `${this.getAttribute("model")} · ${pct}` : `${name} · ${pct}`;
    q(".tsl-context__total").textContent = usedText;
    const bar = q(".tsl-context__bar");
    bar.setAttribute("aria-label", name);
    bar.setAttribute("aria-valuemax", String(this.max));
    bar.setAttribute("aria-valuenow", String(Math.min(this.used, this.max)));
    bar.setAttribute("aria-valuetext", `${pct}, ${usedText} tokens`);
    q(".tsl-context__fill").style.inlineSize = `${this.ratio * 100}%`;

    const rows = q(".tsl-context__rows");
    rows.textContent = "";
    ROWS.forEach(([attr, labelAttr, fallback]) => {
      const v = this.num(attr);
      if (v === null) return;
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = this.getAttribute(labelAttr) || fallback;
      const dd = document.createElement("dd");
      dd.textContent = compact.format(v);
      row.append(dt, dd);
      rows.appendChild(row);
    });
    rows.hidden = !rows.children.length;

    const foot = q(".tsl-context__foot");
    const cost = this.num("cost");
    foot.hidden = cost === null;
    if (cost !== null) {
      foot.firstElementChild.textContent = this.getAttribute("cost-label") || "Coste estimado";
      const currency = this.getAttribute("currency") || "USD";
      foot.lastElementChild.textContent = new Intl.NumberFormat(lang, { style: "currency", currency, maximumFractionDigits: cost < 1 ? 4 : 2 }).format(cost);
    }
  }
}

define("tsl-context", TslContext);
