// ============================================================================
// Tesela — Entorno de ejecución de los experimentos funcionales
// Cada experimento de la galería es { html, setup(root, ctx) } construido sobre tesela-ui.
// ctx registra intervalos, fotogramas de animación y listeners para que el sandbox
// pueda desmontar un experimento sin dejar residuos al navegar a otro.
// ============================================================================

(function () {
  "use strict";

  const registry = new Map();
  const keyOf = (cat, slug) => `${cat}/${slug}`;

  // -------------------------------------------------------------- Formato
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // narrowSymbol evita el prefijo "USD" que es-MX añade a las divisas distintas del peso
  const money = (n, currency = "USD", digits = 2) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const num = (n, digits = 0) =>
    new Intl.NumberFormat("es-MX", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const pct = (n, digits = 1) => `${num(n, digits)}%`;

  // PRNG determinista: los datos generados se mantienen estables entre renderizados
  function rng(seed = 1) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const fmt = { money, num, pct, esc };

  // -------------------------------------------------------------- Context
  function createCtx(root) {
    const cleanups = [];
    const ctx = {
      root,
      fmt,
      rng,
      $: (sel) => root.querySelector(sel),
      $$: (sel) => Array.from(root.querySelectorAll(sel)),
      toast: (opts) => window.TeselaUI.toast(opts),
      every(ms, fn) {
        const id = setInterval(fn, ms);
        cleanups.push(() => clearInterval(id));
        return id;
      },
      timeout(ms, fn) {
        const id = setTimeout(fn, ms);
        cleanups.push(() => clearTimeout(id));
        return id;
      },
      // Llama a fn(time, delta) en cada fotograma hasta que se libere (o fn devuelva false)
      raf(fn) {
        let id = 0;
        let last = performance.now();
        const loop = (t) => {
          const keep = fn(t, Math.min(64, t - last));
          last = t;
          if (keep !== false) id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        cleanups.push(() => cancelAnimationFrame(id));
      },
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        cleanups.push(() => target.removeEventListener(type, fn, opts));
      },
      onCleanup(fn) {
        cleanups.push(fn);
      },
      dispose() {
        cleanups.splice(0).reverse().forEach((fn) => {
          try {
            fn();
          } catch (_) {}
        });
      }
    };
    return ctx;
  }

  // -------------------------------------------------------------- Utilidades de código fuente
  function dedent(src) {
    const lines = String(src).replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(ind)).join("\n");
  }

  function fnSource(fn) {
    let src = fn.toString();
    if (!/^(function|async|\(|[\w$]+\s*=>)/.test(src)) src = `function ${src}`;
    const lines = src.split("\n");
    if (lines.length > 1) {
      const closing = lines[lines.length - 1].match(/^ */)[0].length;
      for (let i = 1; i < lines.length; i++) lines[i] = lines[i].slice(Math.min(closing, lines[i].match(/^ */)[0].length));
    }
    return lines.join("\n");
  }

  // -------------------------------------------------------------- Registro
  function add(cat, slug, def) {
    registry.set(keyOf(cat, slug), def);
  }

  function addMany(cat, defs) {
    Object.keys(defs).forEach((slug) => add(cat, slug, defs[slug]));
  }

  function get(cat, slug) {
    return registry.get(keyOf(cat, slug));
  }

  function htmlOf(item) {
    const def = get(item.categoryId, item.slug);
    if (!def) return "";
    return dedent(typeof def.html === "function" ? def.html(item) : def.html);
  }

  function source(item) {
    const def = get(item.categoryId, item.slug);
    if (!def) return { html: "", js: "" };
    const html = htmlOf(item);
    const js = def.setup
      ? `// Requiere lib/tesela-ui.js + js/experiments/core.js (utilidades de ctx)\nconst root = document.querySelector('[data-xp="${item.categoryId}/${item.slug}"]');\nconst ctx = TESELA_XP.createCtx(root);\n\n(${fnSource(def.setup)})(root, ctx);`
      : "// No hace falta JavaScript: solo HTML + lib/tesela-ui.css";
    return {
      html: `<div class="xp" data-xp="${item.categoryId}/${item.slug}">\n${html.replace(/^/gm, "  ")}\n</div>`,
      js
    };
  }

  /** Renderiza un experimento en `stage` y devuelve una función para desmontarlo. */
  function mount(stage, item) {
    const def = get(item.categoryId, item.slug);
    if (!def) return null;
    stage.innerHTML = `<div class="xp" data-xp="${item.categoryId}/${item.slug}" style="--xp-accent:${item.categoryAccent}">${htmlOf(item)}</div>`;
    const root = stage.firstElementChild;
    window.TeselaUI.init(root);
    const ctx = createCtx(root);
    if (def.setup) {
      try {
        const ret = def.setup(root, ctx);
        if (typeof ret === "function") ctx.onCleanup(ret);
      } catch (err) {
        console.error(`[xp] ${item.categoryId}/${item.slug}`, err);
      }
    }
    return () => ctx.dispose();
  }

  // -------------------------------------------------------------- Utilidades de HTML
  const head = (eyebrow, title, desc = "") => `
    <header class="xp-head">
      <span class="tsl-eyebrow">${eyebrow}</span>
      <h2 class="xp-title">${title}</h2>
      ${desc ? `<p class="xp-desc">${desc}</p>` : ""}
    </header>`;

  const badge = (text, variant = "") => `<span class="tsl-badge${variant ? ` tsl-badge--${variant}` : ""}">${esc(text)}</span>`;

  // -------------------------------------------------------------- Constructor de tablas de datos
  /**
   * table({ eyebrow, title, desc, columns, rows, filterKey, filters, badges, bulk, rowAction, pageSize, search })
   * columns: [{ key, label, num, sort: "text"|"number", mono, render(row) }]
   * badges: { claveDeColumna: { valor: "success"|"warning"|... } }
   * bulk: [{ label, remove: true } | { label, set: "clave=valor" }]
   * rowAction: { label, toast: "… {id} …", remove, set: "clave=valor" }
   */
  function table(cfg) {
    const cols = cfg.columns;
    const badges = cfg.badges || {};
    const filterKey = cfg.filterKey || "status";
    const cell = (row, col) => {
      if (col.render) return col.render(row);
      const v = row[col.key];
      const variant = badges[col.key] && badges[col.key][v];
      return variant ? badge(v, variant) : esc(v);
    };
    const filters = cfg.filters || [];
    const html = `
      ${head(cfg.eyebrow, cfg.title, cfg.desc)}
      <div class="tsl-row xp-toolbar">
        ${cfg.search === false ? "" : `<input class="tsl-input xp-search" data-t-search placeholder="${esc(cfg.searchPlaceholder || "Buscar…")}" aria-label="Buscar filas" />`}
        ${filters.length ? `<div class="tsl-row" style="--gap:6px">
          <button type="button" class="tsl-chip" data-t-filter="all" aria-pressed="true">Todos</button>
          ${filters.map((f) => `<button type="button" class="tsl-chip" data-t-filter="${esc(f)}" aria-pressed="false">${esc(f)}</button>`).join("")}
        </div>` : ""}
        <span class="tsl-spacer"></span>
        <span class="tsl-muted" data-t-count></span>
        ${cfg.toolbar || ""}
      </div>
      <div class="tsl-row xp-bulk" data-t-bulk hidden>
        <strong data-t-selected>0 seleccionadas</strong>
        <span class="tsl-spacer"></span>
        ${(cfg.bulk || [])
          .map((b) => `<button type="button" class="tsl-btn tsl-btn--sm${b.remove ? " tsl-btn--danger" : ""}" data-t-action="${b.remove ? "remove" : "set"}"${b.set ? ` data-set="${esc(b.set)}"` : ""}>${esc(b.label)}</button>`)
          .join("")}
      </div>
      <div class="tsl-table-wrap">
        <table class="tsl-table" data-tsl-sortable data-page-size="${cfg.pageSize || 0}" data-filter-key="${filterKey}" data-badges='${esc(JSON.stringify(badges))}'>
          <thead><tr>
            <th style="width:36px"><input type="checkbox" class="tsl-check" data-t-all aria-label="Seleccionar todo" /></th>
            ${cols.map((c) => `<th${c.sort ? ` data-sort="${c.sort}"` : ""}${c.num ? ' class="is-num"' : ""}>${esc(c.label)}</th>`).join("")}
            ${cfg.rowAction ? "<th></th>" : ""}
          </tr></thead>
          <tbody>
            ${cfg.rows
              .map(
                (r) => `<tr data-id="${esc(r.id)}" data-status="${esc(r[filterKey] || "")}">
              <td><input type="checkbox" class="tsl-check" data-t-row aria-label="Seleccionar ${esc(r.id)}" /></td>
              ${cols.map((c) => `<td data-f="${c.key}"${c.num ? ' class="is-num"' : ""}${c.mono ? ' style="font-family:var(--tsl-font-mono)"' : ""}>${cell(r, c)}</td>`).join("")}
              ${cfg.rowAction ? `<td class="is-num"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-t-row-action${cfg.rowAction.remove ? " data-remove" : ""}${cfg.rowAction.set ? ` data-set="${esc(cfg.rowAction.set)}"` : ""} data-toast="${esc(cfg.rowAction.toast || "")}">${esc(cfg.rowAction.label)}</button></td>` : ""}
            </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="tsl-empty" data-t-empty hidden><div class="tsl-empty__title">Sin filas coincidentes</div><p class="tsl-empty__desc">Prueba con otra búsqueda o filtro.</p></div>
      <nav class="tsl-pagination" data-t-pager aria-label="Paginación"></nav>`;
    return { html, setup: tableSetup };
  }

  function tableSetup(root, ctx) {
    const table = root.querySelector("table");
    const tbody = table.tBodies[0];
    const search = root.querySelector("[data-t-search]");
    const bulk = root.querySelector("[data-t-bulk]");
    const all = root.querySelector("[data-t-all]");
    const pager = root.querySelector("[data-t-pager]");
    const size = Number(table.dataset.pageSize) || 0;
    const filterKey = table.dataset.filterKey;
    const badges = JSON.parse(table.dataset.badges || "{}");
    let status = "all";
    let page = 0;

    const rows = () => Array.from(tbody.rows);
    const matches = (tr) => {
      const q = search ? search.value.trim().toLowerCase() : "";
      return (status === "all" || tr.dataset.status === status) && (!q || tr.textContent.toLowerCase().includes(q));
    };
    const visibleRows = () => rows().filter(matches);

    function setCell(tr, key, value) {
      const td = tr.querySelector(`[data-f="${key}"]`);
      if (!td) return;
      const variant = badges[key] && badges[key][value];
      td.innerHTML = "";
      if (variant) {
        const b = document.createElement("span");
        b.className = `tsl-badge tsl-badge--${variant}`;
        b.textContent = value;
        td.appendChild(b);
      } else {
        td.textContent = value;
      }
      if (key === filterKey) tr.dataset.status = value;
    }

    function syncSelection() {
      const selected = rows().filter((tr) => tr.querySelector("[data-t-row]").checked);
      bulk.hidden = selected.length === 0;
      root.querySelector("[data-t-selected]").textContent = `${selected.length} seleccionadas`;
      const vis = visibleRows();
      all.checked = vis.length > 0 && vis.every((tr) => tr.querySelector("[data-t-row]").checked);
      all.indeterminate = !all.checked && selected.length > 0;
      return selected;
    }

    function refresh() {
      const vis = visibleRows();
      const pages = size ? Math.max(1, Math.ceil(vis.length / size)) : 1;
      page = Math.min(page, pages - 1);
      rows().forEach((tr) => (tr.hidden = true));
      vis.forEach((tr, i) => (tr.hidden = size ? Math.floor(i / size) !== page : false));
      root.querySelector("[data-t-count]").textContent = `${vis.length} de ${rows().length}`;
      root.querySelector("[data-t-empty]").hidden = vis.length > 0;
      pager.hidden = pages < 2;
      pager.innerHTML = "";
      for (let p = 0; p < pages; p++) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = String(p + 1);
        b.dataset.page = String(p);
        if (p === page) b.setAttribute("aria-current", "page");
        pager.appendChild(b);
      }
      syncSelection();
    }

    if (search) ctx.on(search, "input", () => ((page = 0), refresh()));
    root.querySelectorAll("[data-t-filter]").forEach((chip) =>
      ctx.on(chip, "click", () => {
        status = chip.dataset.tFilter;
        page = 0;
        root.querySelectorAll("[data-t-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        refresh();
      })
    );
    ctx.on(pager, "click", (e) => {
      const b = e.target.closest("[data-page]");
      if (b) {
        page = Number(b.dataset.page);
        refresh();
      }
    });
    ctx.on(all, "change", () => {
      visibleRows().forEach((tr) => (tr.querySelector("[data-t-row]").checked = all.checked));
      syncSelection();
    });
    ctx.on(tbody, "change", syncSelection);
    // tesela-ui ordena con el clic en el documento; se vuelve a paginar después
    ctx.on(table.tHead, "click", () => ctx.timeout(0, refresh));

    root.querySelectorAll("[data-t-action]").forEach((btn) =>
      ctx.on(btn, "click", () => {
        const selected = syncSelection();
        if (btn.dataset.tAction === "remove") selected.forEach((tr) => tr.remove());
        else {
          const [k, v] = btn.dataset.set.split("=");
          selected.forEach((tr) => {
            setCell(tr, k, v);
            tr.querySelector("[data-t-row]").checked = false;
          });
        }
        ctx.toast({ title: `${btn.textContent.trim()}: ${selected.length} fila${selected.length === 1 ? "" : "s"}` });
        refresh();
      })
    );

    ctx.on(tbody, "click", (e) => {
      const btn = e.target.closest("[data-t-row-action]");
      if (!btn) return;
      const tr = btn.closest("tr");
      if (btn.dataset.set) {
        const [k, v] = btn.dataset.set.split("=");
        setCell(tr, k, v);
      }
      if (btn.dataset.toast) ctx.toast({ title: btn.dataset.toast.replace("{id}", tr.dataset.id), variant: "info" });
      if (btn.hasAttribute("data-remove")) tr.remove();
      refresh();
    });

    refresh();
  }

  // -------------------------------------------------------------- Constructor de formularios
  /**
   * Validación genérica para cualquier <form data-xp-form> dentro de root:
   * required / type=email / minlength / data-match="otherName" / data-pattern-msg,
   * mostrar contraseña ([data-pw-toggle]) y medidores de seguridad ([data-pw-strength]).
   * Si es válido: estado ocupado, toast(data-success) y cambio opcional al panel data-next.
   */
  function formSetup(root, ctx) {
    const scoreOf = (v) => [v.length >= 8, /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    const labels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
    const colors = ["var(--tsl-danger)", "var(--tsl-danger)", "var(--tsl-warning)", "var(--tsl-info)", "var(--tsl-success)"];

    root.querySelectorAll("[data-pw-toggle]").forEach((btn) =>
      ctx.on(btn, "click", () => {
        const input = btn.parentElement.querySelector("input");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Ocultar" : "Mostrar";
      })
    );

    root.querySelectorAll("[data-pw-strength]").forEach((meter) => {
      const input = root.querySelector(`[name="${meter.dataset.pwStrength}"]`);
      const label = meter.parentElement.querySelector("[data-pw-label]");
      const update = () => {
        const s = scoreOf(input.value);
        meter.querySelectorAll("span").forEach((seg, i) => {
          seg.style.setProperty("--w", "25%");
          seg.style.setProperty("--c", i < s ? colors[s] : "transparent");
        });
        if (label) label.textContent = input.value ? labels[s] : "";
      };
      ctx.on(input, "input", update);
      update();
    });

    root.querySelectorAll("form[data-xp-form]").forEach((form) => {
      const errorFor = (input) => {
        const field = input.closest(".tsl-field") || input.parentElement;
        let el = field.querySelector(".tsl-error");
        if (!el) {
          el = document.createElement("span");
          el.className = "tsl-error";
          field.appendChild(el);
        }
        return el;
      };
      const validate = (input) => {
        const v = input.type === "checkbox" ? input.checked : input.value.trim();
        let msg = "";
        if (input.required && !v) msg = input.dataset.requiredMsg || "Este campo es obligatorio.";
        else if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Ingresa un correo electrónico válido.";
        else if (v && input.minLength > 0 && String(v).length < input.minLength) msg = `Usa al menos ${input.minLength} caracteres.`;
        else if (v && input.pattern && !new RegExp(`^(?:${input.pattern})$`).test(v)) msg = input.dataset.patternMsg || "Formato no válido.";
        else if (input.dataset.match) {
          const other = form.querySelector(`[name="${input.dataset.match}"]`);
          if (other && other.value !== input.value) msg = "Los valores no coinciden.";
        }
        input.setAttribute("aria-invalid", String(Boolean(msg)));
        if (input.type !== "checkbox" || msg) errorFor(input).textContent = msg;
        else errorFor(input).textContent = "";
        return !msg;
      };

      const inputs = () => Array.from(form.querySelectorAll("input[name], textarea[name], select[name]"));
      inputs().forEach((input) =>
        ctx.on(input, input.type === "checkbox" ? "change" : "input", () => {
          if (input.getAttribute("aria-invalid") === "true") validate(input);
        })
      );

      ctx.on(form, "submit", (e) => {
        e.preventDefault();
        const ok = inputs().map(validate).every(Boolean);
        if (!ok) {
          const first = form.querySelector('[aria-invalid="true"]');
          if (first) first.focus();
          return;
        }
        const btn = form.querySelector('[type="submit"]');
        if (btn) btn.setAttribute("aria-busy", "true");
        ctx.timeout(Number(form.dataset.delay || 700), () => {
          if (btn) btn.removeAttribute("aria-busy");
          const data = Object.fromEntries(new FormData(form));
          const msg = (form.dataset.success || "Guardado").replace(/\{(\w+)\}/g, (_, k) => data[k] || "");
          ctx.toast({ title: msg });
          if (form.dataset.next) {
            const next = root.querySelector(form.dataset.next);
            if (next) {
              form.hidden = true;
              next.hidden = false;
              const label = next.querySelector("[data-echo]");
              if (label) label.textContent = data[label.dataset.echo] || "";
            }
          }
          if (form.hasAttribute("data-reset")) form.reset();
          form.dispatchEvent(new CustomEvent("xp-submit", { detail: data, bubbles: true }));
        });
      });
    });

    // [data-back] dentro de un panel de éxito ([data-panel]) regresa al formulario
    root.querySelectorAll("[data-back]").forEach((b) =>
      ctx.on(b, "click", () => {
        const panel = b.closest("[data-panel]");
        if (panel) panel.hidden = true;
        root.querySelectorAll("form[data-xp-form]").forEach((f) => (f.hidden = false));
      })
    );
  }

  // Utilidad de marcado de campos usada por los constructores
  function field(f) {
    const id = `f-${f.name}-${Math.random().toString(36).slice(2, 7)}`;
    const attrs = [
      `id="${id}"`,
      `name="${f.name}"`,
      `type="${f.type || "text"}"`,
      f.placeholder ? `placeholder="${esc(f.placeholder)}"` : "",
      f.value ? `value="${esc(f.value)}"` : "",
      f.required === false ? "" : "required",
      f.minlength ? `minlength="${f.minlength}"` : "",
      f.match ? `data-match="${f.match}"` : "",
      f.autocomplete ? `autocomplete="${f.autocomplete}"` : ""
    ]
      .filter(Boolean)
      .join(" ");
    const input =
      f.type === "password"
        ? `<div class="tsl-input-group"><input class="tsl-input" ${attrs} /><button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" data-pw-toggle style="margin:3px">Mostrar</button></div>`
        : `<input class="tsl-input" ${attrs} />`;
    const strength = f.strength
      ? `<div class="tsl-row" style="--gap:8px"><div class="tsl-meter" data-pw-strength="${f.name}" style="flex:1;height:5px"><span></span><span></span><span></span><span></span></div><span class="tsl-hint" data-pw-label></span></div>`
      : "";
    const labelRow = f.aside
      ? `<div class="tsl-row" style="justify-content:space-between"><label class="tsl-label" for="${id}">${esc(f.label)}</label>${f.aside}</div>`
      : `<label class="tsl-label" for="${id}">${esc(f.label)}</label>`;
    return `<div class="tsl-field">${labelRow}${input}${strength}${f.hint ? `<span class="tsl-hint">${esc(f.hint)}</span>` : ""}</div>`;
  }

  // -------------------------------------------------------------- Utilidades de gráficas SVG
  const chart = {
    /** Escala lineal: mapea [d0,d1] → [r0,r1] */
    scale(d0, d1, r0, r1) {
      const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
      return (v) => r0 + (v - d0) * k;
    },
    /** Redondea un máximo hacia arriba a un límite de eje "redondo" */
    niceMax(v) {
      if (v <= 0) return 1;
      const p = Math.pow(10, Math.floor(Math.log10(v)));
      const n = v / p;
      return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
    },
    /** Ruta "M x,y L …" a partir de [[x,y], …] */
    path(points) {
      return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    },
    /** Líneas de cuadrícula horizontales + etiquetas del eje y para un área de gráfica */
    grid(box, max, ticks = 4, format = (v) => v) {
      let out = "";
      for (let i = 0; i <= ticks; i++) {
        const v = (max / ticks) * i;
        const y = box.y + box.h - (box.h / ticks) * i;
        out += `<line x1="${box.x}" x2="${box.x + box.w}" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity="0.1"/><text x="${box.x - 6}" y="${y + 3}" text-anchor="end">${format(v)}</text>`;
      }
      return out;
    },
    /** Mapea la x del puntero sobre `svg` al más cercano de `count` puntos equiespaciados en [x0,x1] (unidades del viewBox) */
    indexAt(svg, e, count, x0, x1) {
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const x = ((e.clientX - r.left) / r.width) * vb.width;
      return Math.max(0, Math.min(count - 1, Math.round(((x - x0) / (x1 - x0)) * (count - 1))));
    },
    /** Posiciona un tooltip absoluto junto al puntero dentro de su padre relativo */
    tip(el, e, html) {
      const host = el.offsetParent || el.parentElement;
      const r = host.getBoundingClientRect();
      el.hidden = false;
      el.innerHTML = html;
      const x = Math.min(r.width - el.offsetWidth - 4, e.clientX - r.left + 12);
      el.style.left = `${Math.max(4, x)}px`;
      el.style.top = `${Math.max(4, e.clientY - r.top - el.offsetHeight - 10)}px`;
    }
  };

  /**
   * Mantiene el búfer de un canvas ajustado a su tamaño CSS × devicePixelRatio.
   * Devuelve un objeto vivo { w, h, dpr } (píxeles CSS) que se actualiza al redimensionar.
   */
  function fitCanvas(ctx, canvas, onResize) {
    const size = { w: 0, h: 0, dpr: 1 };
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = Math.max(1, r.width);
      size.h = Math.max(1, r.height);
      canvas.width = Math.round(size.w * size.dpr);
      canvas.height = Math.round(size.h * size.dpr);
      if (onResize) onResize(size);
    };
    fit();
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(fit);
      ro.observe(canvas);
      ctx.onCleanup(() => ro.disconnect());
    }
    return size;
  }

  /** Posición del puntero en píxeles CSS relativa a un elemento */
  function pointer(el, e) {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  }

  // Escribe `text` palabra por palabra en `el` (textContent) a ~`wps` palabras/segundo.
  // Devuelve una función stop(). Los temporizadores pertenecen a ctx y terminan con el experimento.
  function stream(ctx, el, text, { wps = 22, onWord, onDone } = {}) {
    const words = text.split(/(\s+)/);
    let i = 0;
    let stopped = false;
    const step = () => {
      if (stopped) return;
      if (i >= words.length) return onDone && onDone();
      el.textContent += words[i++];
      if (onWord) onWord(i);
      ctx.timeout(1000 / wps / (words[i - 1].trim() ? 1 : 4), step);
    };
    step();
    return () => (stopped = true);
  }

  window.TESELA_XP = {
    stream,
    chart,
    fitCanvas,
    pointer,
    add,
    addMany,
    get,
    has: (cat, slug) => registry.has(keyOf(cat, slug)),
    size: () => registry.size,
    mount,
    source,
    createCtx,
    fmt,
    rng,
    esc,
    head,
    badge,
    table,
    tableSetup,
    formSetup,
    field
  };
})();
