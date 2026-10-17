// ============================================================================
// Experimentos funcionales — DevTools y registros (9), IA y agentes (10), Shaders y canvas (10)
// ============================================================================

(function () {
  "use strict";
  const X = window.DEVL_XP;
  const { head, esc } = X;

  // ==========================================================================
  // DEVTOOLS & LOGS
  // ==========================================================================
  X.addMany("devtools", {
    "network-waterfall": {
      html: `
        ${head("DevTools · network-waterfall.tsx", "Cascada de red", "Línea de tiempo estilo HAR: filtra por tipo, haz clic en una petición para ver su desglose de DNS / TLS / TTFB / descarga y recarga para volver a capturar.")}
        <div class="dv-row"><div class="dv-row" style="--gap:6px" data-types></div><span class="dv-spacer"></span><span class="dv-muted xp-mono" data-sum></span><button type="button" class="dv-btn dv-btn--sm" data-reload>⟳ Recargar</button></div>
        <div class="dv-table-wrap"><table class="dv-table dv-table--compact"><thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th class="is-num">Tamaño</th><th style="width:40%">Cascada</th><th class="is-num">Tiempo</th></tr></thead><tbody data-rows></tbody></table></div>
        <div class="xp-panel" data-detail><span class="dv-muted">Selecciona una petición para inspeccionar sus tiempos.</span></div>`,
      setup(root, ctx) {
        const types = ["all", "doc", "script", "style", "img", "fetch", "ws"];
        const names = [["/", "doc"], ["app.js", "script"], ["styles.css", "style"], ["devl-ui.js", "script"], ["logo.svg", "img"], ["/api/session", "fetch"], ["/api/projects", "fetch"], ["hero.webp", "img"], ["fonts.woff2", "style"], ["wss://edge/sync", "ws"], ["/api/metrics", "fetch"]];
        let reqs = [];
        let filter = "all";
        let selected = null;
        const capture = () => {
          let t = 0;
          reqs = names.map(([name, type], i) => {
            const dns = i < 2 ? 4 + Math.random() * 12 : 0;
            const tls = i < 2 ? 8 + Math.random() * 20 : 0;
            const ttfb = 10 + Math.random() * (type === "fetch" ? 140 : 60);
            const dl = 3 + Math.random() * (type === "img" ? 120 : 40);
            const start = i === 0 ? 0 : t + Math.random() * 30;
            if (i < 3) t = start + dns + tls + ttfb;
            const status = type === "ws" ? 101 : Math.random() < 0.08 ? 500 : Math.random() < 0.1 ? 304 : 200;
            return { name, type, status, size: Math.round(1 + Math.random() * (type === "img" ? 220 : 60)), start, dns, tls, ttfb, dl };
          });
          render();
        };
        const render = () => {
          const total = Math.max(...reqs.map((r) => r.start + r.dns + r.tls + r.ttfb + r.dl));
          const pct = (v) => (v / total) * 100;
          const rows = reqs.filter((r) => filter === "all" || r.type === filter);
          ctx.$("[data-rows]").innerHTML = rows
            .map((r) => {
              const i = reqs.indexOf(r);
              const seg = (w, c) => `<span style="display:inline-block;height:10px;width:${pct(w)}%;background:${c}"></span>`;
              return `<tr data-i="${i}" style="cursor:pointer${selected === i ? ";background:var(--dv-surface-strong)" : ""}"><td class="xp-mono">${r.name}</td><td>${r.type}</td><td><span class="dv-badge dv-badge--${r.status >= 500 ? "danger" : r.status === 304 ? "info" : "success"}">${r.status}</span></td><td class="is-num">${r.size} kB</td><td><div style="white-space:nowrap;padding-left:${pct(r.start)}%;line-height:0">${seg(r.dns, "var(--dv-info)")}${seg(r.tls, "var(--dv-warning)")}${seg(r.ttfb, "var(--dv-success)")}${seg(r.dl, "var(--xp-accent)")}</div></td><td class="is-num xp-mono">${(r.dns + r.tls + r.ttfb + r.dl).toFixed(0)}ms</td></tr>`;
            })
            .join("");
          ctx.$("[data-sum]").textContent = `${rows.length} peticiones · ${rows.reduce((s, r) => s + r.size, 0)} kB · fin ${total.toFixed(0)}ms`;
        };
        ctx.$("[data-types]").innerHTML = types.map((t) => `<button type="button" class="dv-chip" data-t="${t}" aria-pressed="${t === "all"}">${t === "all" ? "todo" : t}</button>`).join("");
        ctx.on(ctx.$("[data-types]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          filter = b.dataset.t;
          ctx.$$("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          render();
        });
        ctx.on(ctx.$("[data-rows]"), "click", (e) => {
          const tr = e.target.closest("[data-i]");
          if (!tr) return;
          selected = Number(tr.dataset.i);
          const r = reqs[selected];
          ctx.$("[data-detail]").innerHTML = `<div class="dv-row"><strong class="xp-mono">${r.name}</strong><span class="dv-badge">${r.type}</span><span class="dv-spacer"></span><span class="dv-muted">inició a los ${r.start.toFixed(1)}ms</span></div>
            <dl class="xp-kv" style="margin-top:10px"><dt><span class="dv-dot dv-dot--info"></span> DNS</dt><dd>${r.dns.toFixed(1)}ms</dd><dt><span class="dv-dot dv-dot--warning"></span> TLS</dt><dd>${r.tls.toFixed(1)}ms</dd><dt><span class="dv-dot dv-dot--success"></span> TTFB</dt><dd>${r.ttfb.toFixed(1)}ms</dd><dt><span class="dv-dot dv-dot--accent"></span> Descarga</dt><dd>${r.dl.toFixed(1)}ms</dd><dt>Tamaño</dt><dd>${r.size} kB (br)</dd></dl>`;
          render();
        });
        ctx.on(ctx.$("[data-reload]"), "click", () => {
          selected = null;
          capture();
          ctx.toast({ title: "Página recargada", description: "Nuevo HAR capturado", variant: "info" });
        });
        capture();
      }
    },

    "flamegraph-profiler": {
      html: `
        ${head("DevTools · flamegraph-profiler.tsx", "Perfilador de flamegraph", "Haz clic en un marco para acercarte, usa la ruta de navegación para alejarte y busca para resaltar las rutas más costosas.")}
        <div class="dv-row"><ol class="dv-breadcrumb" data-crumbs></ol><span class="dv-spacer"></span><input class="dv-input xp-search" data-q placeholder="Resaltar función…" aria-label="Resaltar función" /></div>
        <div class="xp-panel xp-rel" style="padding:10px"><div data-flame class="dv-stack" style="--gap:2px"></div><div class="xp-tip" data-tip hidden></div></div>
        <div class="dv-muted xp-mono" data-info>Pasa el cursor sobre un marco para ver el tiempo propio / total.</div>`,
      setup(root, ctx) {
        const tree = { name: "main", t: 1000, c: [
          { name: "render", t: 520, c: [{ name: "layout", t: 210, c: [{ name: "measureText", t: 120, c: [] }, { name: "flexbox", t: 70, c: [] }] }, { name: "paint", t: 240, c: [{ name: "rasterize", t: 160, c: [] }, { name: "composite", t: 60, c: [] }] }] },
          { name: "fetchData", t: 300, c: [{ name: "JSON.parse", t: 110, c: [] }, { name: "normalize", t: 150, c: [{ name: "sortBy", t: 90, c: [] }] }] },
          { name: "gc", t: 120, c: [] }
        ] };
        let rootNode = tree;
        const path = [tree];
        const colors = ["#f97316", "#f59e0b", "#eab308", "#ef4444", "#fb7185"];
        const render = () => {
          const q = ctx.$("[data-q]").value.trim().toLowerCase();
          const rows = [];
          const walk = (n, depth, offset, scale) => {
            (rows[depth] = rows[depth] || []).push({ n, left: offset, width: n.t * scale });
            let o = offset;
            n.c.forEach((ch) => {
              walk(ch, depth + 1, o, scale);
              o += ch.t * scale;
            });
          };
          walk(rootNode, 0, 0, 100 / rootNode.t);
          ctx.$("[data-flame]").innerHTML = rows
            .map((row, d) => `<div style="position:relative;height:24px">${row.map(({ n, left, width }) => {
              const self = n.t - n.c.reduce((s, c) => s + c.t, 0);
              const hit = q && n.name.toLowerCase().includes(q);
              return `<button type="button" data-name="${n.name}" data-total="${n.t}" data-self="${self}" style="position:absolute;left:${left}%;width:calc(${width}% - 2px);height:22px;border:0;border-radius:3px;background:${hit ? "var(--xp-accent)" : colors[d % colors.length]};opacity:${q && !hit ? 0.35 : 0.9};color:#111;font:inherit;font-size:11px;text-align:left;padding:0 6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer">${n.name}</button>`;
            }).join("")}</div>`)
            .join("");
          ctx.$("[data-crumbs]").innerHTML = path.map((n, i) => `<li>${i === path.length - 1 ? `<span aria-current="page">${n.name}</span>` : `<a href="#" data-up="${i}">${n.name}</a>`}</li>`).join("");
        };
        const find = (n, name) => (n.name === name ? n : n.c.map((c) => find(c, name)).find(Boolean));
        ctx.on(ctx.$("[data-flame]"), "click", (e) => {
          const b = e.target.closest("[data-name]");
          if (!b) return;
          const node = find(rootNode, b.dataset.name);
          if (!node || node === rootNode || !node.c.length) return ctx.toast({ title: `${b.dataset.name}: marco hoja`, variant: "neutral", duration: 1200 });
          const chain = [];
          const trace = (n) => (n === node ? (chain.push(n), true) : n.c.some((c) => trace(c) && chain.unshift(n)));
          trace(rootNode);
          path.push(...chain.slice(1));
          rootNode = node;
          render();
        });
        ctx.on(ctx.$("[data-crumbs]"), "click", (e) => {
          const a = e.target.closest("[data-up]");
          if (!a) return;
          e.preventDefault();
          path.length = Number(a.dataset.up) + 1;
          rootNode = path[path.length - 1];
          render();
        });
        ctx.on(ctx.$("[data-flame]"), "pointermove", (e) => {
          const b = e.target.closest("[data-name]");
          const tipEl = ctx.$("[data-tip]");
          if (!b) return (tipEl.hidden = true);
          DEVL_XP.chart.tip(tipEl, e, `<strong>${b.dataset.name}</strong><br>total ${b.dataset.total}ms · propio ${b.dataset.self}ms · ${((b.dataset.total / tree.t) * 100).toFixed(1)}%`);
        });
        ctx.on(ctx.$("[data-flame]"), "pointerleave", () => (ctx.$("[data-tip]").hidden = true));
        ctx.on(ctx.$("[data-q]"), "input", render);
        render();
      }
    },

    "json-tree-explorer": {
      html: `
        ${head("DevTools · json-tree-explorer.tsx", "Explorador de árbol JSON", "Edita el JSON a la izquierda; el árbol se vuelve a analizar en vivo. Haz clic en cualquier clave para obtener su ruta; expande o contrae todo.")}
        <div class="dv-grid" style="--min:320px;align-items:start">
          <div class="dv-stack"><textarea class="dv-textarea xp-mono" data-src style="min-height:340px;font-size:12px" spellcheck="false" aria-label="Origen JSON"></textarea><span class="dv-error" data-err></span></div>
          <div class="xp-panel dv-stack">
            <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-all="1">Expandir todo</button><button type="button" class="dv-btn dv-btn--sm" data-all="0">Contraer todo</button><span class="dv-spacer"></span></div>
            <div class="dv-input-group"><input class="dv-input xp-mono" readonly data-path id="json-path" value="$" aria-label="Ruta seleccionada" /><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" style="margin:3px" data-dv-copy data-dv-copy-target="#json-path">Copiar</button></div>
            <div class="xp-mono xp-scroll" data-tree style="font-size:12px;line-height:1.7;--max:300px"></div>
          </div>
        </div>`,
      setup(root, ctx) {
        const src = ctx.$("[data-src]");
        src.value = JSON.stringify({ workspace: "acme", plan: { name: "pro", seats: 24, trial: false }, users: [{ id: 1, name: "Ana", roles: ["admin"] }, { id: 2, name: "Leo", roles: [] }], features: { sso: true, auditLog: null } }, null, 2);
        const color = (v) => (v === null ? "var(--dv-fg-subtle)" : typeof v === "string" ? "var(--dv-success)" : typeof v === "number" ? "var(--dv-warning)" : typeof v === "boolean" ? "var(--dv-info)" : "inherit");
        const node = (key, v, path) => {
          const label = key === null ? "" : `<a href="#" data-p="${esc(path)}" style="color:var(--xp-accent);text-decoration:none">${esc(key)}</a>: `;
          if (v && typeof v === "object") {
            const isArr = Array.isArray(v);
            const entries = isArr ? v.map((x, i) => [i, x]) : Object.entries(v);
            const kids = entries.map(([k, x]) => node(k, x, isArr ? `${path}[${k}]` : /^[A-Za-z_$][\w$]*$/.test(k) ? `${path}.${k}` : `${path}["${k}"]`)).join("");
            return `<details open style="padding-left:14px"><summary style="cursor:pointer;margin-left:-14px">${label}<span class="dv-muted">${isArr ? `Array(${v.length})` : `{${entries.length}}`}</span></summary>${kids}</details>`;
          }
          return `<div style="padding-left:14px">${label}<span style="color:${color(v)}">${esc(JSON.stringify(v))}</span></div>`;
        };
        const parse = () => {
          try {
            const data = JSON.parse(src.value);
            ctx.$("[data-tree]").innerHTML = node(null, data, "$");
            ctx.$("[data-err]").textContent = "";
            src.setAttribute("aria-invalid", "false");
          } catch (err) {
            ctx.$("[data-err]").textContent = err.message;
            src.setAttribute("aria-invalid", "true");
          }
        };
        ctx.on(src, "input", parse);
        ctx.on(ctx.$("[data-tree]"), "click", (e) => {
          const a = e.target.closest("[data-p]");
          if (!a) return;
          e.preventDefault();
          ctx.$("[data-path]").value = a.dataset.p;
        });
        ctx.$$("[data-all]").forEach((b) => ctx.on(b, "click", () => ctx.$$("[data-tree] details").forEach((d, i) => (d.open = b.dataset.all === "1" || i === 0))));
        parse();
      }
    },

    "sql-query-workbench": {
      html: `
        ${head("DevTools · sql-query-workbench.tsx", "Banco de consultas SQL", "Un pequeño motor SQL real sobre una tabla de usuarios en memoria: SELECT · WHERE (=, !=, >, <, LIKE, AND) · ORDER BY · LIMIT.")}
        <div class="dv-row" data-examples></div>
        <textarea class="dv-textarea xp-mono" data-sql spellcheck="false" style="min-height:90px;font-size:12.5px" aria-label="Consulta SQL">SELECT name, plan, mrr FROM users WHERE plan = 'pro' ORDER BY mrr DESC LIMIT 5</textarea>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-run>Ejecutar ⌘↵</button><span class="dv-muted xp-mono" data-meta></span></div>
        <div class="dv-alert dv-alert--danger" data-err hidden><div><div class="dv-alert__title">Error en la consulta</div><div class="dv-alert__desc xp-mono" data-err-msg></div></div></div>
        <div class="dv-table-wrap"><table class="dv-table dv-table--compact" data-out></table></div>`,
      setup(root, ctx) {
        const names = ["Ana", "Leo", "Sara", "Tom", "Mia", "Noah", "Lucía", "Omar", "Eva", "Kai", "Iris", "Ben", "Zoe", "Max"];
        const users = names.map((n, i) => ({ id: i + 1, name: n, plan: ["free", "pro", "team", "pro"][i % 4], mrr: [0, 29, 99, 29][i % 4] * (1 + (i % 3)), country: ["MX", "ES", "US", "DE"][i % 4], signup: `2026-0${(i % 9) + 1}-1${i % 9}` }));
        const examples = ["SELECT * FROM users LIMIT 5", "SELECT name, country FROM users WHERE country = 'MX'", "SELECT name, mrr FROM users WHERE mrr > 50 ORDER BY mrr DESC", "SELECT name FROM users WHERE name LIKE '%a%' AND plan != 'free'"];
        ctx.$("[data-examples]").innerHTML = examples.map((q, i) => `<button type="button" class="dv-chip" data-ex="${i}">Ejemplo ${i + 1}</button>`).join("");
        const sql = ctx.$("[data-sql]");
        const run = () => {
          const t0 = performance.now();
          try {
            const q = sql.value.trim().replace(/;$/, "");
            const m = /^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/i.exec(q);
            if (!m) throw new Error("Se esperaba: SELECT columnas FROM tabla [WHERE …] [ORDER BY col [ASC|DESC]] [LIMIT n]");
            const [, colsRaw, table, where, orderBy, dir, limit] = m;
            if (table.toLowerCase() !== "users") throw new Error(`Tabla desconocida "${table}". Disponible: users`);
            const cols = colsRaw.trim() === "*" ? Object.keys(users[0]) : colsRaw.split(",").map((c) => c.trim());
            cols.forEach((c) => {
              if (!(c in users[0])) throw new Error(`Columna desconocida "${c}"`);
            });
            let rows = users.slice();
            if (where) {
              const conds = where.split(/\s+and\s+/i).map((c) => {
                const cm = /^(\w+)\s*(=|!=|<>|>=|<=|>|<|like)\s*(?:'([^']*)'|(-?\d+(?:\.\d+)?))$/i.exec(c.trim());
                if (!cm) throw new Error(`No se pudo interpretar la condición "${c.trim()}"`);
                if (!(cm[1] in users[0])) throw new Error(`Columna desconocida "${cm[1]}"`);
                return { col: cm[1], op: cm[2].toLowerCase(), val: cm[3] !== undefined ? cm[3] : Number(cm[4]) };
              });
              rows = rows.filter((r) =>
                conds.every(({ col, op, val }) => {
                  const v = r[col];
                  if (op === "like") return new RegExp(`^${String(val).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".")}$`, "i").test(String(v));
                  return op === "=" ? v == val : op === "!=" || op === "<>" ? v != val : op === ">" ? v > val : op === "<" ? v < val : op === ">=" ? v >= val : v <= val;
                })
              );
            }
            if (orderBy) {
              if (!(orderBy in users[0])) throw new Error(`Columna desconocida "${orderBy}"`);
              rows.sort((a, b) => (a[orderBy] > b[orderBy] ? 1 : a[orderBy] < b[orderBy] ? -1 : 0) * (dir && dir.toLowerCase() === "desc" ? -1 : 1));
            }
            if (limit) rows = rows.slice(0, Number(limit));
            ctx.$("[data-out]").innerHTML = `<thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td class="${typeof r[c] === "number" ? "is-num" : ""}">${esc(r[c])}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${cols.length}" class="dv-muted">0 filas</td></tr>`}</tbody>`;
            ctx.$("[data-err]").hidden = true;
            ctx.$("[data-meta]").textContent = `${rows.length} fila${rows.length === 1 ? "" : "s"} · ${(performance.now() - t0).toFixed(2)}ms`;
          } catch (err) {
            ctx.$("[data-err]").hidden = false;
            ctx.$("[data-err-msg]").textContent = err.message;
            ctx.$("[data-meta]").textContent = "";
          }
        };
        ctx.on(ctx.$("[data-run]"), "click", run);
        ctx.on(sql, "keydown", (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
        });
        ctx.on(ctx.$("[data-examples]"), "click", (e) => {
          const b = e.target.closest("[data-ex]");
          if (!b) return;
          sql.value = examples[b.dataset.ex];
          run();
        });
        run();
      }
    },

    "env-secrets-vault": {
      html: `
        ${head("DevTools · env-secrets-vault.tsx", "Bóveda de secretos de entorno", "Variables por entorno: revela, copia, elimina, agrega (se exige UPPER_SNAKE_CASE) y exporta un archivo .env.")}
        <div class="dv-row"><dv-segmented value="production" data-env><button class="dv-segmented__item" value="development">Desarrollo</button><button class="dv-segmented__item" value="preview">Vista previa</button><button class="dv-segmented__item" value="production">Producción</button></dv-segmented><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-export>Descargar .env</button></div>
        <ul class="dv-list" data-vars></ul>
        <form class="dv-row xp-panel" data-add style="padding:10px"><input class="dv-input xp-mono" style="width:220px" name="key" placeholder="NUEVA_CLAVE" required pattern="[A-Z][A-Z0-9_]*" aria-label="Clave" /><input class="dv-input xp-mono" style="flex:1;min-width:160px" name="value" placeholder="valor" required aria-label="Valor" /><button type="submit" class="dv-btn dv-btn--primary dv-btn--sm">Agregar</button></form>`,
      setup(root, ctx) {
        const vault = {
          development: { DATABASE_URL: "postgres://localhost/acme", STRIPE_KEY: "sk_test_51Hd…dev", DEBUG: "true" },
          preview: { DATABASE_URL: "postgres://preview.db/acme", STRIPE_KEY: "sk_test_51Hd…pre" },
          production: { DATABASE_URL: "postgres://prod.db.internal/acme", STRIPE_KEY: "sk_live_51Hd…9fA", SENTRY_DSN: "https://k@o1.ingest.sentry.io/42" }
        };
        let env = "production";
        const revealed = new Set();
        const render = () => {
          const list = ctx.$("[data-vars]");
          list.innerHTML = "";
          Object.entries(vault[env]).forEach(([k, v]) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong class="xp-mono" style="min-width:160px"></strong><code class="xp-mono dv-muted" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></code><div class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-act="reveal"></button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-act="copy">Copiar</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-act="del" aria-label="Eliminar ${k}">✕</button></div>`;
            li.dataset.k = k;
            li.querySelector("strong").textContent = k;
            li.querySelector("code").textContent = revealed.has(k) ? v : "•".repeat(Math.min(24, v.length));
            li.querySelector('[data-act="reveal"]').textContent = revealed.has(k) ? "Ocultar" : "Revelar";
            list.appendChild(li);
          });
          if (!list.children.length) list.innerHTML = '<li class="dv-muted">No hay variables en este entorno.</li>';
        };
        ctx.on(ctx.$("[data-vars]"), "click", (e) => {
          const b = e.target.closest("[data-act]");
          if (!b) return;
          const k = b.closest("li").dataset.k;
          if (b.dataset.act === "reveal") revealed.has(k) ? revealed.delete(k) : revealed.add(k);
          if (b.dataset.act === "copy") DevlUI.copy(vault[env][k]).then(() => ctx.toast({ title: `${k} copiada` }));
          if (b.dataset.act === "del") {
            delete vault[env][k];
            ctx.toast({ title: `${k} eliminada de ${env}`, variant: "danger" });
          }
          render();
        });
        ctx.on(ctx.$("[data-env]"), "dv-change", (e) => {
          env = e.detail.value;
          revealed.clear();
          render();
        });
        ctx.on(ctx.$("[data-add]"), "submit", (e) => {
          e.preventDefault();
          const f = e.target;
          if (!f.reportValidity()) return;
          vault[env][f.key.value] = f.value.value;
          ctx.toast({ title: `${f.key.value} agregada`, description: env });
          f.reset();
          render();
        });
        ctx.on(ctx.$("[data-export]"), "click", () => {
          const text = Object.entries(vault[env]).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("\n") + "\n";
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
          a.download = `.env.${env}`;
          a.click();
        });
        render();
      }
    },

    "webhook-payload-diff": {
      html: `
        ${head("DevTools · webhook-payload-diff.tsx", "Diff de payload de webhook", "Diff por líneas entre dos entregas, una firma HMAC-SHA256 real del payload actual y reentrega con registro.")}
        <div class="dv-grid" style="--min:280px">
          <label class="dv-field"><span class="dv-label">Entrega anterior</span><textarea class="dv-textarea xp-mono" data-a style="min-height:170px;font-size:12px" spellcheck="false"></textarea></label>
          <label class="dv-field"><span class="dv-label">Entrega actual</span><textarea class="dv-textarea xp-mono" data-b style="min-height:170px;font-size:12px" spellcheck="false"></textarea></label>
        </div>
        <pre class="dv-code" data-diff style="padding:0"></pre>
        <div class="xp-panel dv-stack">
          <div class="dv-row"><span class="dv-label">Secreto de firma</span><input class="dv-input xp-mono" style="max-width:220px" value="whsec_devl_123" data-secret aria-label="Secreto de firma" /><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-redeliver>Reentregar</button></div>
          <code class="xp-mono" data-sig style="word-break:break-all;font-size:11.5px"></code>
          <ul class="dv-list" data-log></ul>
        </div>`,
      setup(root, ctx) {
        const a = ctx.$("[data-a]");
        const b = ctx.$("[data-b]");
        a.value = JSON.stringify({ event: "invoice.paid", id: "evt_1", data: { invoice: "INV-2091", amount: 4200, currency: "usd", status: "pending" } }, null, 2);
        b.value = JSON.stringify({ event: "invoice.paid", id: "evt_2", data: { invoice: "INV-2091", amount: 4200, currency: "usd", status: "paid", paid_at: "2026-10-14T12:00:00Z" } }, null, 2);
        const diff = (x, y) => {
          const n = x.length;
          const m = y.length;
          const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
          for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
          const out = [];
          let i = 0;
          let j = 0;
          while (i < n && j < m) {
            if (x[i] === y[j]) out.push([" ", x[i++], j++]);
            else if (L[i + 1][j] >= L[i][j + 1]) out.push(["-", x[i++]]);
            else out.push(["+", y[j++]]);
          }
          while (i < n) out.push(["-", x[i++]]);
          while (j < m) out.push(["+", y[j++]]);
          return out;
        };
        const sign = async () => {
          const enc = new TextEncoder();
          const ts = Math.floor(Date.now() / 1000);
          try {
            const key = await crypto.subtle.importKey("raw", enc.encode(ctx.$("[data-secret]").value), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
            const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${b.value}`));
            ctx.$("[data-sig]").textContent = `devl-signature: t=${ts},v1=${Array.from(new Uint8Array(sig), (x) => x.toString(16).padStart(2, "0")).join("")}`;
          } catch (_) {
            ctx.$("[data-sig]").textContent = "Web Crypto no disponible (requiere https o localhost).";
          }
        };
        const render = () => {
          const rows = diff(a.value.split("\n"), b.value.split("\n"));
          ctx.$("[data-diff]").innerHTML = rows.map(([t, line]) => `<div class="${t === "+" ? "xp-diff-add" : t === "-" ? "xp-diff-del" : ""}" style="padding:0 14px"><span class="dv-muted">${t}</span> ${esc(line)}</div>`).join("");
          sign();
        };
        ctx.on(a, "input", render);
        ctx.on(b, "input", render);
        ctx.on(ctx.$("[data-secret]"), "input", sign);
        ctx.on(ctx.$("[data-redeliver]"), "click", () => {
          const ok = Math.random() > 0.25;
          const li = document.createElement("li");
          li.innerHTML = `<span class="dv-badge dv-badge--${ok ? "success" : "danger"}">${ok ? "200 OK" : "500"}</span><span class="xp-mono dv-muted">${new Date().toLocaleTimeString()}</span><span>${ok ? "Entregado" : "Error del endpoint — se reintentará con retroceso exponencial"}</span><span class="dv-list__end xp-mono dv-muted">${Math.round(80 + Math.random() * 300)}ms</span>`;
          ctx.$("[data-log]").prepend(li);
          sign();
        });
        render();
      }
    },

    "cron-schedule-visualizer": {
      html: `
        ${head("DevTools · cron-schedule-visualizer.tsx", "Visualizador de cron", "Analizador cron real de 5 campos (*, listas, rangos, pasos) con una descripción en lenguaje natural y las próximas ejecuciones en tu zona horaria.")}
        <div class="dv-row" data-presets></div>
        <div class="dv-grid" style="--min:280px;align-items:start">
          <div class="dv-stack">
            <input class="dv-input xp-mono" style="font-size:18px;height:46px" data-expr value="*/15 9-17 * * 1-5" aria-label="Expresión cron" spellcheck="false" />
            <div class="dv-row xp-mono dv-muted" style="font-size:10px;--gap:0;justify-content:space-around"><span>minuto</span><span>hora</span><span>día</span><span>mes</span><span>día sem.</span></div>
            <div class="dv-alert dv-alert--info" data-desc-box><div><div class="dv-alert__title" data-desc></div></div></div>
          </div>
          <div class="xp-panel"><span class="dv-eyebrow">Próximas ejecuciones</span><ol class="dv-timeline" style="margin-top:12px" data-runs></ol></div>
        </div>`,
      setup(root, ctx) {
        const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
        const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
        const parseField = (f, [lo, hi]) => {
          const set = new Set();
          f.split(",").forEach((part) => {
            const m = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
            if (!m) throw new Error(`Token no válido "${part}"`);
            let [a, b] = m[1] === "*" ? [lo, hi] : m[1].split("-").map(Number);
            if (b === undefined) b = m[2] ? hi : a;
            const step = m[2] ? Number(m[2]) : 1;
            if (a < lo || b > hi || a > b || step < 1) throw new Error(`"${part}" fuera de rango ${lo}-${hi}`);
            for (let v = a; v <= b; v += step) set.add(v);
          });
          return set;
        };
        const describe = (parts) => {
          const [mi, h, dom, mon, dow] = parts;
          const at = mi.startsWith("*/") ? `cada ${mi.slice(2)} minutos` : mi === "*" ? "cada minuto" : `en el minuto ${mi}`;
          const hours = h === "*" ? "" : h.includes("-") ? ` entre las ${h.split("-")[0]}:00 y las ${h.split("-")[1]}:59` : ` a la hora ${h}`;
          const wd = dow === "*" ? "" : dow === "1-5" ? " de lunes a viernes" : ` los ${dow.split(",").map((d) => (d.includes("-") ? d.split("-").map((x) => days[x]).join("–") : days[d] || d)).join(", ")}`;
          const dm = dom === "*" ? "" : ` el día ${dom} del mes`;
          const mo = mon === "*" ? "" : ` en el mes ${mon}`;
          return `Se ejecuta ${at}${hours}${wd}${dm}${mo}.`;
        };
        const render = () => {
          const expr = ctx.$("[data-expr]").value.trim();
          const box = ctx.$("[data-desc-box]");
          try {
            const parts = expr.split(/\s+/);
            if (parts.length !== 5) throw new Error("Se esperan 5 campos: minuto hora día mes día-de-la-semana");
            const sets = parts.map((p, i) => parseField(p, ranges[i]));
            const runs = [];
            const d = new Date();
            d.setSeconds(0, 0);
            d.setMinutes(d.getMinutes() + 1);
            for (let i = 0; i < 525600 && runs.length < 6; i++) {
              const domOk = sets[2].has(d.getDate());
              const dowOk = sets[4].has(d.getDay());
              const dayOk = parts[2] !== "*" && parts[4] !== "*" ? domOk || dowOk : domOk && dowOk;
              if (sets[0].has(d.getMinutes()) && sets[1].has(d.getHours()) && sets[3].has(d.getMonth() + 1) && dayOk) runs.push(new Date(d));
              d.setMinutes(d.getMinutes() + 1);
            }
            box.className = "dv-alert dv-alert--info";
            ctx.$("[data-desc]").textContent = describe(parts);
            ctx.$("[data-expr]").setAttribute("aria-invalid", "false");
            ctx.$("[data-runs]").innerHTML = runs.map((r, i) => `<li style="--c:${i ? "var(--dv-fg-subtle)" : "var(--xp-accent)"}"><strong>${r.toLocaleString("es-MX", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong><div class="dv-timeline__meta">en ${Math.round((r - Date.now()) / 60000)} min</div></li>`).join("") || '<li class="dv-muted">Sin ejecuciones en el próximo año.</li>';
          } catch (err) {
            box.className = "dv-alert dv-alert--danger";
            ctx.$("[data-desc]").textContent = err.message;
            ctx.$("[data-expr]").setAttribute("aria-invalid", "true");
            ctx.$("[data-runs]").innerHTML = "";
          }
        };
        const presets = [["Cada 15 min (horario laboral)", "*/15 9-17 * * 1-5"], ["Cada noche 02:30", "30 2 * * *"], ["Lunes 09:00", "0 9 * * 1"], ["Día 1 del mes", "0 0 1 * *"], ["Cada 5 minutos", "*/5 * * * *"]];
        ctx.$("[data-presets]").innerHTML = presets.map(([l, e]) => `<button type="button" class="dv-chip" data-e="${e}">${l}</button>`).join("");
        ctx.on(ctx.$("[data-presets]"), "click", (e) => {
          const b = e.target.closest("[data-e]");
          if (!b) return;
          ctx.$("[data-expr]").value = b.dataset.e;
          render();
        });
        ctx.on(ctx.$("[data-expr]"), "input", render);
        render();
      }
    },

    "memory-heap-map": {
      html: `
        ${head("DevTools · memory-heap-map.tsx", "Mapa del heap de memoria", "Treemap del tamaño retenido. Asigna objetos, desconecta algunos y ejecuta el GC para recuperar los inalcanzables.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-alloc>+ Asignar</button><button type="button" class="dv-btn dv-btn--sm" data-leak>Desconectar al azar</button><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-gc>Ejecutar GC</button><span class="dv-spacer"></span><span class="xp-mono dv-muted" data-total></span></div>
        <div class="dv-meter" style="height:8px"><span data-used style="--w:0%"></span></div>
        <div data-map style="position:relative;height:340px;border-radius:var(--dv-radius);overflow:hidden;border:1px solid var(--dv-border)"></div>
        <div class="xp-panel xp-mono" data-info style="font-size:12px">Haz clic en un bloque para inspeccionar sus retenedores.</div>`,
      setup(root, ctx) {
        const LIMIT = 64;
        const kinds = ["Array", "Object", "String", "Closure", "DOM node", "Map"];
        let objs = [
          { name: "Array(10000)", size: 9.2, kind: "Array", live: true, by: "window.cache" },
          { name: "Árbol de fibras de React", size: 7.5, kind: "Object", live: true, by: "root" },
          { name: "Respuesta JSON", size: 5.1, kind: "String", live: true, by: "store.data" },
          { name: "closure de listener", size: 2.4, kind: "Closure", live: false, by: "(desconectado)" },
          { name: "<div> × 420", size: 6.3, kind: "DOM node", live: true, by: "document" }
        ];
        const palette = { Array: "#6366f1", Object: "#0ea5e9", String: "#10b981", Closure: "#f59e0b", "DOM node": "#ec4899", Map: "#a855f7" };
        // Treemap tipo «slice-and-dice» que alterna la dirección en cada nivel
        const layout = (items, x, y, w, h, vertical) => {
          if (!items.length) return [];
          if (items.length === 1) return [{ ...items[0], x, y, w, h }];
          const total = items.reduce((s, o) => s + o.size, 0);
          let acc = 0;
          let i = 0;
          while (i < items.length - 1 && acc + items[i].size < total / 2) acc += items[i++].size;
          if (i === 0) acc = items[i++].size;
          const k = acc / total;
          const a = items.slice(0, i);
          const b = items.slice(i);
          return vertical
            ? layout(a, x, y, w, h * k, !vertical).concat(layout(b, x, y + h * k, w, h * (1 - k), !vertical))
            : layout(a, x, y, w * k, h, !vertical).concat(layout(b, x + w * k, y, w * (1 - k), h, !vertical));
        };
        const render = () => {
          const sorted = objs.slice().sort((p, q) => q.size - p.size);
          const rects = layout(sorted, 0, 0, 100, 100, false);
          ctx.$("[data-map]").innerHTML = rects
            .map((r) => `<button type="button" data-n="${esc(r.name)}" style="position:absolute;left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;border:1px solid var(--dv-bg);background:${palette[r.kind]};opacity:${r.live ? 0.85 : 0.35};color:#fff;font:inherit;font-size:11px;text-align:left;padding:6px;overflow:hidden;cursor:pointer;${r.live ? "" : "background-image:repeating-linear-gradient(45deg,transparent 0 6px,rgba(0,0,0,.25) 6px 12px)"}">${esc(r.name)}<br><strong>${r.size.toFixed(1)} MB</strong></button>`)
            .join("");
          const total = objs.reduce((s, o) => s + o.size, 0);
          ctx.$("[data-total]").textContent = `${total.toFixed(1)} / ${LIMIT} MB · ${objs.filter((o) => !o.live).length} inalcanzables`;
          const used = ctx.$("[data-used]");
          used.style.setProperty("--w", `${Math.min(100, (total / LIMIT) * 100)}%`);
          used.style.setProperty("--c", total > LIMIT * 0.8 ? "var(--dv-danger)" : "var(--xp-accent)");
        };
        let n = 0;
        ctx.on(ctx.$("[data-alloc]"), "click", () => {
          const kind = kinds[n++ % kinds.length];
          objs.push({ name: `${kind} #${n}`, size: +(0.8 + Math.random() * 6).toFixed(1), kind, live: true, by: `module${n}.ref` });
          render();
        });
        ctx.on(ctx.$("[data-leak]"), "click", () => {
          const live = objs.filter((o) => o.live);
          if (!live.length) return;
          const o = live[Math.floor(Math.random() * live.length)];
          o.live = false;
          o.by = "(desconectado)";
          render();
        });
        ctx.on(ctx.$("[data-gc]"), "click", () => {
          const dead = objs.filter((o) => !o.live);
          const freed = dead.reduce((s, o) => s + o.size, 0);
          objs = objs.filter((o) => o.live);
          ctx.toast({ title: `El GC recuperó ${freed.toFixed(1)} MB`, description: `${dead.length} objetos recolectados` });
          render();
        });
        ctx.on(ctx.$("[data-map]"), "click", (e) => {
          const b = e.target.closest("[data-n]");
          if (!b) return;
          const o = objs.find((x) => x.name === b.dataset.n);
          ctx.$("[data-info]").innerHTML = `<strong>${esc(o.name)}</strong> · ${o.kind} · ${o.size} MB · retenido por <code>${esc(o.by)}</code> · ${o.live ? '<span class="dv-badge dv-badge--success">alcanzable</span>' : '<span class="dv-badge dv-badge--danger">basura</span>'}`;
        });
        render();
      }
    },

    "regex-ast-tester": {
      html: `
        ${head("DevTools · regex-ast-tester.tsx", "Probador de regex con AST", "Coincidencias en vivo con resaltado, grupos de captura por coincidencia, interruptores de flags y una explicación token por token.")}
        <div class="dv-input-group"><span class="dv-input-group__addon">/</span><input class="dv-input xp-mono" data-re value="(\\w+)@(\\w+)\\.(com|dev)" aria-label="Patrón" spellcheck="false" /><span class="dv-input-group__addon">/</span><span class="dv-input-group__addon" data-flags style="gap:4px">${["g", "i", "m", "s"].map((f) => `<button type="button" class="dv-chip" data-f="${f}" aria-pressed="${f === "g" || f === "i"}" style="padding:1px 7px">${f}</button>`).join("")}</span></div>
        <span class="dv-error" data-err></span>
        <textarea class="dv-textarea xp-mono" data-text spellcheck="false" style="min-height:90px;font-size:12.5px" aria-label="Texto de prueba">Escribe a ana@acme.dev o a leo@globex.com — no a bob@site.org.</textarea>
        <div class="xp-panel xp-mono" data-hl style="white-space:pre-wrap;font-size:12.5px;line-height:1.8"></div>
        <div class="dv-grid" style="--min:280px;align-items:start">
          <div><span class="dv-eyebrow">Coincidencias</span><ul class="dv-list" data-matches style="margin-top:8px"></ul></div>
          <div><span class="dv-eyebrow">Explicación</span><ul class="dv-list xp-mono" data-explain style="margin-top:8px;font-size:12px"></ul></div>
        </div>`,
      setup(root, ctx) {
        const re = ctx.$("[data-re]");
        const text = ctx.$("[data-text]");
        const explain = (src) => {
          const out = [];
          const tok = /\\[dDwWsSbB]|\\.|\[(?:\\.|[^\]])*\]|\((?:\?[:=!]|\?<[^>]+>)?|\)|[*+?]\??|\{\d+(?:,\d*)?\}\??|\^|\$|\||\.|[^\\[\]()*+?{}^$|.]+/g;
          const names = { "\\w": "carácter de palabra [A-Za-z0-9_]", "\\d": "dígito", "\\s": "espacio en blanco", "\\W": "carácter no de palabra", "\\D": "no dígito", "\\S": "no espacio en blanco", "\\b": "límite de palabra", ".": "cualquier carácter", "^": "inicio", "$": "fin", "|": "O", ")": "fin de grupo", "*": "0 o más", "+": "1 o más", "?": "opcional" };
          let m;
          let group = 0;
          while ((m = tok.exec(src))) {
            const t = m[0];
            let d = names[t];
            if (!d && t.startsWith("(")) d = t === "(" ? `grupo de captura #${++group}` : t === "(?:" ? "grupo sin captura" : t.startsWith("(?<") ? `grupo con nombre ${t.slice(3, -1)}` : "lookaround";
            if (!d && t.startsWith("[")) d = `uno de ${t}`;
            if (!d && t.startsWith("{")) d = `repetir ${t}`;
            if (!d && t.startsWith("\\")) d = `literal ${t.slice(1)}`;
            if (!d && /[*+?]\?/.test(t)) d = "cuantificador perezoso";
            out.push([t, d || `literal “${t}”`]);
          }
          return out;
        };
        const render = () => {
          const flags = ctx.$$('[data-f][aria-pressed="true"]').map((b) => b.dataset.f).join("");
          let rx;
          try {
            rx = new RegExp(re.value, flags.includes("g") ? flags : flags + "g");
            ctx.$("[data-err]").textContent = "";
            re.setAttribute("aria-invalid", "false");
          } catch (err) {
            ctx.$("[data-err]").textContent = err.message;
            re.setAttribute("aria-invalid", "true");
            return;
          }
          const src = text.value;
          const matches = [];
          let m;
          while ((m = rx.exec(src)) && matches.length < 200) {
            matches.push(m);
            if (m[0] === "") rx.lastIndex++;
            if (!flags.includes("g")) break;
          }
          let html = "";
          let last = 0;
          matches.forEach((mm) => {
            html += esc(src.slice(last, mm.index)) + `<mark class="xp-mark">${esc(mm[0])}</mark>`;
            last = mm.index + mm[0].length;
          });
          ctx.$("[data-hl]").innerHTML = html + esc(src.slice(last));
          ctx.$("[data-matches]").innerHTML = matches.map((mm, i) => `<li><span class="dv-badge">${i + 1}</span><code>${esc(mm[0])}</code><span class="dv-list__end dv-muted xp-mono">${mm.slice(1).map((g, gi) => `$${gi + 1}=${esc(g === undefined ? "∅" : g)}`).join("  ")}</span></li>`).join("") || '<li class="dv-muted">Sin coincidencias</li>';
          ctx.$("[data-explain]").innerHTML = explain(re.value).map(([t, d]) => `<li><code style="color:var(--xp-accent);min-width:70px">${esc(t)}</code><span class="dv-muted">${esc(d)}</span></li>`).join("");
        };
        ctx.on(re, "input", render);
        ctx.on(text, "input", render);
        ctx.on(ctx.$("[data-flags]"), "click", (e) => {
          const b = e.target.closest("[data-f]");
          if (!b) return;
          b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // AI & AGENTS
  // ==========================================================================
  X.addMany("ai-agents", {
    "prompt-composer": {
      html: `
        ${head("IA y agentes · prompt-composer.tsx", "Compositor de prompts", "Escribe «/» para ver plantillas, adjunta archivos, ajusta la temperatura y envía: la respuesta llega en streaming y se puede detener.")}
        <div class="xp-panel dv-stack" style="max-width:820px;width:100%;margin:0 auto">
          <div class="xp-rel">
            <div class="dv-menu__list" data-slash hidden style="top:auto;bottom:calc(100% + 6px)"></div>
            <textarea class="dv-textarea" data-prompt placeholder="Pregunta lo que quieras… escribe / para ver plantillas" style="min-height:110px" aria-label="Prompt"></textarea>
          </div>
          <div class="dv-row" data-files></div>
          <div class="dv-row">
            <label class="dv-btn dv-btn--sm" style="cursor:pointer">📎 Adjuntar<input type="file" multiple hidden data-file /></label>
            <select class="dv-select" style="width:auto;height:28px" data-model aria-label="Modelo"><option>devl-large</option><option>devl-fast</option><option>devl-reasoner</option></select>
            <label class="dv-choice" style="font-size:11px">temp. <input type="range" class="dv-range" min="0" max="10" value="7" style="width:90px" data-temp data-dv-output="#pc-temp" aria-label="Temperatura" /><span class="xp-mono" id="pc-temp">7</span></label>
            <span class="dv-spacer"></span>
            <span class="xp-mono dv-muted" data-tokens>0 tokens</span>
            <button type="button" class="dv-btn dv-btn--primary" data-send>Enviar ↵</button>
          </div>
        </div>
        <div class="xp-panel" style="max-width:820px;width:100%;margin:0 auto"><span class="dv-eyebrow" data-who>Asistente</span><p data-out style="margin-top:8px;line-height:1.7;white-space:pre-wrap" class="dv-muted">Las respuestas aparecen aquí.</p></div>`,
      setup(root, ctx) {
        const prompt = ctx.$("[data-prompt]");
        const slash = ctx.$("[data-slash]");
        const templates = { "/resumir": "Resume lo siguiente en 3 viñetas:\n", "/traducir": "Traduce al inglés, conservando el tono:\n", "/codigo": "Escribe una función de JavaScript sin dependencias que ", "/criticar": "Critica este texto de interfaz en cuanto a claridad y tono:\n" };
        const files = [];
        let stop = null;
        const tokens = () => (ctx.$("[data-tokens]").textContent = `${Math.ceil((prompt.value.length + files.reduce((s, f) => s + f.size, 0) / 4) / 4)} tokens`);
        const showSlash = () => {
          const q = prompt.value.startsWith("/") && !prompt.value.includes(" ") && !prompt.value.includes("\n") ? prompt.value : null;
          const hits = q === null ? [] : Object.keys(templates).filter((t) => t.startsWith(q));
          slash.hidden = !hits.length;
          slash.innerHTML = hits.map((t) => `<button type="button" class="dv-menu__item" data-t="${t}">${t}<span class="dv-nav__meta">${templates[t].split(/[:\n]/)[0].slice(0, 28)}</span></button>`).join("");
        };
        ctx.on(prompt, "input", () => (showSlash(), tokens()));
        ctx.on(slash, "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          prompt.value = templates[b.dataset.t];
          slash.hidden = true;
          prompt.focus();
          tokens();
        });
        ctx.on(ctx.$("[data-file]"), "change", (e) => {
          Array.from(e.target.files).forEach((f) => files.push(f));
          ctx.$("[data-files]").innerHTML = files.map((f, i) => `<span class="dv-chip" style="color:var(--dv-fg)">📄 ${esc(f.name)} <button type="button" class="dv-chip__remove" data-rm="${i}" aria-label="Quitar">✕</button></span>`).join("");
          tokens();
        });
        ctx.on(ctx.$("[data-files]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          files.splice(Number(b.dataset.rm), 1);
          b.closest(".dv-chip").remove();
          tokens();
        });
        const send = () => {
          const btn = ctx.$("[data-send]");
          if (stop) {
            stop();
            stop = null;
            btn.textContent = "Enviar ↵";
            return;
          }
          const q = prompt.value.trim();
          if (!q) return ctx.toast({ title: "Escribe un prompt primero", variant: "warning" });
          const out = ctx.$("[data-out]");
          out.textContent = "";
          out.classList.remove("dv-muted");
          const model = ctx.$("[data-model]").value;
          const temp = Number(ctx.$("[data-temp]").value) / 10;
          ctx.$("[data-who]").textContent = `${model} · temp. ${temp}`;
          const reply = `Esta es una propuesta ${temp > 0.6 ? "creativa" : "precisa"} sobre «${q.slice(0, 60)}${q.length > 60 ? "…" : ""}».\n\n• Parte de la intención del usuario, no del componente.\n• Mantén tokens y espaciado consistentes: devl-ui lo hace por ti.\n• Lanza en pequeño, mide y luego itera.${files.length ? `\n\nTambién leí ${files.length} archivo${files.length > 1 ? "s" : ""} adjunto${files.length > 1 ? "s" : ""}.` : ""}`;
          btn.textContent = "■ Detener";
          stop = DEVL_XP.stream(ctx, out, reply, { wps: model === "devl-fast" ? 45 : 22, onDone: () => ((stop = null), (btn.textContent = "Enviar ↵")) });
        };
        ctx.on(ctx.$("[data-send]"), "click", send);
        ctx.on(prompt, "keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey && slash.hidden) {
            e.preventDefault();
            send();
          }
        });
      }
    },

    "streaming-trace": {
      html: `
        ${head("IA y agentes · streaming-trace.tsx", "Traza de streaming", "Ejecuta un agente: el razonamiento llega en streaming a un bloque plegable, se ejecutan las herramientas y luego la respuesta, con tokens/s en vivo.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-run>▶ Ejecutar agente</button><span class="dv-badge dv-badge--outline xp-mono" data-tps>0 tok/s</span><span class="dv-badge dv-badge--outline xp-mono" data-time>0.0s</span></div>
        <div class="dv-stack" data-trace></div>`,
      setup(root, ctx) {
        let running = false;
        let tokens = 0;
        let t0 = 0;
        const trace = ctx.$("[data-trace]");
        ctx.every(100, () => {
          if (!running) return;
          const s = (performance.now() - t0) / 1000;
          ctx.$("[data-time]").textContent = `${s.toFixed(1)}s`;
          ctx.$("[data-tps]").textContent = `${Math.round(tokens / s)} tok/s`;
        });
        const block = (title, open = true) => {
          const d = document.createElement("details");
          d.className = "dv-accordion";
          d.open = open;
          d.innerHTML = `<summary style="padding:10px 14px;cursor:pointer;font-size:12px"><span class="dv-spinner" style="--size:11px;margin-right:8px"></span>${title}</summary><div class="dv-accordion__content xp-mono" style="white-space:pre-wrap;padding-top:4px"></div>`;
          trace.appendChild(d);
          return d;
        };
        const done = (d, label) => {
          const sp = d.querySelector(".dv-spinner");
          if (sp) sp.outerHTML = '<span style="color:var(--dv-success);margin-right:8px">✓</span>';
          if (label) d.querySelector("summary").lastChild.textContent = label;
        };
        const streamInto = (el, text, wps) => new Promise((res) => DEVL_XP.stream(ctx, el, text, { wps, onWord: () => tokens++, onDone: res }));
        ctx.on(ctx.$("[data-run]"), "click", async () => {
          if (running) return;
          running = true;
          tokens = 0;
          t0 = performance.now();
          trace.innerHTML = "";
          const think = block("Pensando…");
          await streamInto(think.querySelector("div"), "El usuario quiere la tasa de cancelación por plan del T3. Debo consultar el almacén de datos, agregar por plan y luego comparar con el T2 para explicar la diferencia.", 40);
          done(think, "Pensó un momento");
          think.open = false;
          const tool = block("Herramienta · run_sql");
          await streamInto(tool.querySelector("div"), "SELECT plan, churn_rate FROM metrics WHERE quarter IN ('Q2','Q3')\n→ 3 filas · 41ms", 30);
          done(tool);
          const ans = block("Respuesta");
          await streamInto(ans.querySelector("div"), "La cancelación bajó de 3.4% a 2.1% en total. El plan Team mejoró más (−1.8 pts) tras los cambios en la incorporación; Free se mantuvo estable.", 26);
          done(ans);
          running = false;
          ctx.toast({ title: `Listo · ${tokens} tokens` });
        });
      }
    },

    "tool-call-inspector": {
      html: `
        ${head("IA y agentes · tool-call-inspector.tsx", "Inspector de llamadas a herramientas", "Selecciona una llamada para ver sus argumentos y su resultado. Reproducir la vuelve a ejecutar con una latencia nueva (y puede fallar).")}
        <div class="xp-split" style="--cols:300px minmax(0,1fr)">
          <div class="xp-pane dv-stack" style="--gap:8px"><label class="dv-choice"><input type="checkbox" class="dv-check" data-failed /> Solo fallidas</label><ul class="dv-list" data-calls></ul></div>
          <div class="xp-pane dv-stack" data-detail><span class="dv-muted">Selecciona una llamada a herramienta.</span></div>
        </div>`,
      setup(root, ctx) {
        const calls = [
          { tool: "search_docs", args: { query: "trampa de foco en diálogos", top_k: 3 }, result: { hits: ["dialog.md#focus", "a11y.md#modals", "drawer.md"] }, ms: 182, ok: true },
          { tool: "run_sql", args: { sql: "SELECT count(*) FROM users WHERE plan='pro'" }, result: { rows: [{ count: 412 }] }, ms: 41, ok: true },
          { tool: "http_get", args: { url: "https://status.devl.dev/api" }, result: { error: "ETIMEDOUT tras 5000ms" }, ms: 5003, ok: false },
          { tool: "write_file", args: { path: "src/Button.tsx", bytes: 1834 }, result: { written: true }, ms: 12, ok: true }
        ];
        let sel = 0;
        const render = () => {
          const only = ctx.$("[data-failed]").checked;
          ctx.$("[data-calls]").innerHTML = calls.map((c, i) => (only && c.ok ? "" : `<li class="xp-select-item" data-i="${i}" aria-selected="${i === sel}"><span class="dv-dot dv-dot--${c.ok ? "success" : "danger"}"></span><span class="xp-mono" style="flex:1">${c.tool}</span><span class="dv-muted xp-mono">${c.ms}ms</span></li>`)).join("") || '<li class="dv-muted">Sin llamadas fallidas</li>';
          const c = calls[sel];
          ctx.$("[data-detail]").innerHTML = `<div class="dv-row"><strong class="xp-mono">${c.tool}</strong><span class="dv-badge dv-badge--${c.ok ? "success" : "danger"}">${c.ok ? "ok" : "error"}</span><span class="dv-muted xp-mono">${c.ms}ms</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-replay>⟳ Reproducir</button></div>
            <dv-tabs><div class="dv-tabs__list"><button class="dv-tabs__tab" data-tab="args">Argumentos</button><button class="dv-tabs__tab" data-tab="res">Resultado</button></div>
            <div class="dv-tabs__panel" data-panel="args"><pre class="dv-code"></pre></div><div class="dv-tabs__panel" data-panel="res"><pre class="dv-code"></pre></div></dv-tabs>`;
          const pres = ctx.$$("[data-detail] pre");
          pres[0].textContent = JSON.stringify(c.args, null, 2);
          pres[1].textContent = JSON.stringify(c.result, null, 2);
        };
        ctx.on(ctx.$("[data-calls]"), "click", (e) => {
          const li = e.target.closest("[data-i]");
          if (li) {
            sel = Number(li.dataset.i);
            render();
          }
        });
        ctx.on(ctx.$("[data-failed]"), "change", render);
        ctx.on(ctx.$("[data-detail]"), "click", (e) => {
          if (!e.target.closest("[data-replay]")) return;
          const c = calls[sel];
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(500, () => {
            c.ok = Math.random() > 0.3;
            c.ms = Math.round(10 + Math.random() * (c.ok ? 300 : 5000));
            if (!c.ok) c.result = { error: "503 del servicio origen" };
            else if (c.result.error) c.result = { ok: true };
            ctx.toast({ title: `${c.tool} ${c.ok ? "terminó bien" : "falló"} en ${c.ms}ms`, variant: c.ok ? "success" : "danger" });
            render();
          });
        });
        render();
      }
    },

    "model-arena-selector": {
      html: `
        ${head("IA y agentes · model-arena-selector.tsx", "Arena de modelos", "Ejecuta dos modelos lado a lado con el mismo prompt, compara latencia y costo, y luego vota: el Elo se actualiza en vivo.")}
        <div class="dv-row"><input class="dv-input" style="flex:1" data-prompt value="Explica las container queries de CSS en un párrafo." aria-label="Prompt" /><button type="button" class="dv-btn dv-btn--primary" data-run>Ejecutar ambos</button></div>
        <div class="dv-grid" style="--min:300px" data-cols></div>
        <div class="dv-row" data-vote hidden><span class="dv-muted">¿Cuál fue mejor?</span><button type="button" class="dv-btn" data-v="0">← A</button><button type="button" class="dv-btn" data-v="0.5">Empate</button><button type="button" class="dv-btn" data-v="1">B →</button></div>
        <div class="dv-table-wrap"><table class="dv-table dv-table--compact"><thead><tr><th>Modelo</th><th class="is-num">Elo</th><th class="is-num">Combates</th></tr></thead><tbody data-board></tbody></table></div>`,
      setup(root, ctx) {
        const models = { "devl-large": { elo: 1240, n: 0, wps: 24, cost: 15 }, "devl-fast": { elo: 1180, n: 0, wps: 60, cost: 2 }, "devl-reasoner": { elo: 1265, n: 0, wps: 14, cost: 30 } };
        const opts = Object.keys(models).map((m) => `<option>${m}</option>`).join("");
        ctx.$("[data-cols]").innerHTML = ["A", "B"].map((s, i) => `<div class="xp-panel dv-stack"><div class="dv-row"><span class="dv-badge dv-badge--accent">${s}</span><select class="dv-select" style="width:auto;height:28px" data-m="${i}" aria-label="Modelo ${s}">${opts}</select><span class="dv-spacer"></span><span class="xp-mono dv-muted" data-stat="${i}"></span></div><p data-out="${i}" style="line-height:1.7;min-height:96px" class="dv-muted">Esperando…</p></div>`).join("");
        ctx.$('[data-m="1"]').value = "devl-fast";
        const board = () => (ctx.$("[data-board]").innerHTML = Object.entries(models).sort((a, b) => b[1].elo - a[1].elo).map(([m, s]) => `<tr><td class="xp-mono">${m}</td><td class="is-num">${Math.round(s.elo)}</td><td class="is-num">${s.n}</td></tr>`).join(""));
        const answers = ["Las container queries permiten que un componente se estilice según el tamaño de su contenedor en lugar del viewport. Declara container-type: inline-size en un elemento padre y luego usa @container (min-width: 400px) { … } en el hijo. Por fin las tarjetas y las barras laterales se adaptan dondequiera que se coloquen.", "Son como las media queries, pero acotadas a un elemento padre: marca un contenedor con container-type y escribe reglas @container para que el componente responda al espacio que realmente tiene."];
        ctx.on(ctx.$("[data-run]"), "click", () => {
          ctx.$("[data-vote]").hidden = true;
          let done = 0;
          [0, 1].forEach((i) => {
            const m = models[ctx.$(`[data-m="${i}"]`).value];
            const out = ctx.$(`[data-out="${i}"]`);
            out.textContent = "";
            out.classList.remove("dv-muted");
            const t0 = performance.now();
            const text = answers[i];
            ctx.timeout(150 + Math.random() * 400, () =>
              DEVL_XP.stream(ctx, out, text, {
                wps: m.wps,
                onDone: () => {
                  const words = text.split(/\s+/).length;
                  ctx.$(`[data-stat="${i}"]`).textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s · ${words * 1.3 | 0} tok · $${((words * 1.3 * m.cost) / 1e6).toFixed(5)}`;
                  if (++done === 2) ctx.$("[data-vote]").hidden = false;
                }
              })
            );
          });
        });
        ctx.on(ctx.$("[data-vote]"), "click", (e) => {
          const b = e.target.closest("[data-v]");
          if (!b) return;
          const a = models[ctx.$('[data-m="0"]').value];
          const bb = models[ctx.$('[data-m="1"]').value];
          const sB = Number(b.dataset.v);
          const expB = 1 / (1 + 10 ** ((a.elo - bb.elo) / 400));
          const K = 32;
          bb.elo += K * (sB - expB);
          a.elo += K * (1 - sB - (1 - expB));
          a.n++;
          bb.n++;
          ctx.$("[data-vote]").hidden = true;
          ctx.toast({ title: "Voto registrado", description: "Clasificación actualizada" });
          board();
        });
        board();
      }
    },

    "token-budget-meter": {
      html: `
        ${head("IA y agentes · token-budget-meter.tsx", "Medidor de presupuesto de tokens", "Reparte la ventana de contexto entre sistema, herramientas, historial, RAG y salida. Si te pasas del presupuesto se pone en rojo; el caché reduce el costo.")}
        <div class="dv-row"><span class="dv-label">Ventana de contexto</span><dv-segmented value="128000" data-limit><button class="dv-segmented__item" value="8000">8k</button><button class="dv-segmented__item" value="32000">32k</button><button class="dv-segmented__item" value="128000">128k</button><button class="dv-segmented__item" value="200000">200k</button></dv-segmented><label class="dv-choice">Caché de prompts <input type="checkbox" role="switch" class="dv-switch" data-cache checked /></label></div>
        <div class="dv-meter" style="height:16px" data-meter></div>
        <div class="dv-row"><strong class="xp-mono" data-total></strong><span class="dv-badge" data-state></span><span class="dv-spacer"></span><span class="dv-muted">Costo est. / solicitud <strong class="xp-mono" data-cost></strong></span></div>
        <div class="dv-grid" style="--min:220px" data-sliders></div>`,
      setup(root, ctx) {
        const parts = [["Sistema", 4000, "var(--xp-accent)", true], ["Herramientas", 9000, "var(--dv-info)", true], ["Historial", 38000, "var(--dv-warning)", false], ["Fragmentos RAG", 30000, "var(--dv-success)", false], ["Reserva de salida", 8000, "var(--dv-danger)", false]];
        ctx.$("[data-sliders]").innerHTML = parts.map(([n, v, c], i) => `<div class="xp-panel dv-stack" style="--gap:6px;padding:12px"><div class="dv-row"><span class="dv-dot" style="--_c:${c}"></span><span>${n}</span><span class="dv-spacer"></span><span class="xp-mono" data-v="${i}"></span></div><input type="range" class="dv-range" min="0" max="100000" step="500" value="${v}" data-i="${i}" aria-label="${n}: tokens" /></div>`).join("");
        const render = () => {
          const limit = Number(ctx.$("[data-limit]").value || 128000);
          const vals = ctx.$$("[data-i]").map((s) => Number(s.value));
          const total = vals.reduce((a, b) => a + b, 0);
          vals.forEach((v, i) => (ctx.$(`[data-v="${i}"]`).textContent = `${(v / 1000).toFixed(1)}k`));
          ctx.$("[data-meter]").innerHTML = parts.map(([, , c], i) => `<span style="--w:${Math.min(100, (vals[i] / Math.max(total, limit)) * 100)}%;--c:${c}"></span>`).join("");
          ctx.$("[data-total]").textContent = `${total.toLocaleString("es-MX")} / ${limit.toLocaleString("es-MX")} tokens`;
          const over = total > limit;
          ctx.$("[data-state]").className = `dv-badge dv-badge--${over ? "danger" : total > limit * 0.85 ? "warning" : "success"}`;
          ctx.$("[data-state]").textContent = over ? `Excedido por ${(total - limit).toLocaleString("es-MX")}` : `${((total / limit) * 100).toFixed(1)}% usado`;
          const cached = ctx.$("[data-cache]").checked ? vals[0] + vals[1] : 0;
          const input = total - vals[4];
          const cost = ((input - cached) * 3 + cached * 0.3 + vals[4] * 15) / 1e6;
          ctx.$("[data-cost]").textContent = `$${cost.toFixed(4)}`;
        };
        ctx.on(ctx.$("[data-sliders]"), "input", render);
        ctx.on(ctx.$("[data-limit]"), "dv-change", render);
        ctx.on(ctx.$("[data-cache]"), "change", render);
        render();
      }
    },

    "context-window-stack": {
      html: `
        ${head("IA y agentes · context-window-stack.tsx", "Pila de la ventana de contexto", "Fija lo que debe quedarse, suelta archivos para agregar contexto y poda automáticamente lo menos relevante para que todo quepa en la ventana.")}
        <div class="dv-row"><strong class="xp-mono" data-total></strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-prune>Podar automáticamente</button></div>
        <div class="dv-meter" style="height:10px"><span data-bar></span></div>
        <ul class="dv-list" data-items></ul>
        <dv-dropzone multiple data-drop><strong>Suelta archivos para agregar contexto</strong><span>≈ 1 token por cada 4 bytes</span></dv-dropzone>`,
      setup(root, ctx) {
        const LIMIT = 32000;
        const items = [
          { name: "system-prompt.md", tokens: 1800, rel: 1, pin: true },
          { name: "src/Button.tsx", tokens: 3200, rel: 0.9, pin: false },
          { name: "docs/design-tokens.md", tokens: 6400, rel: 0.7, pin: false },
          { name: "historial-de-chat (42 turnos)", tokens: 14800, rel: 0.5, pin: false },
          { name: "rag: dialog.md#focus", tokens: 2100, rel: 0.8, pin: false },
          { name: "package-lock.json", tokens: 9800, rel: 0.1, pin: false }
        ];
        const render = () => {
          const total = items.reduce((s, i) => s + i.tokens, 0);
          ctx.$("[data-total]").textContent = `${total.toLocaleString("es-MX")} / ${LIMIT.toLocaleString("es-MX")} tokens`;
          const bar = ctx.$("[data-bar]");
          bar.style.setProperty("--w", `${Math.min(100, (total / LIMIT) * 100)}%`);
          bar.style.setProperty("--c", total > LIMIT ? "var(--dv-danger)" : "var(--xp-accent)");
          ctx.$("[data-items]").innerHTML = items.map((it, i) => `<li><button type="button" class="dv-btn dv-btn--icon dv-btn--sm ${it.pin ? "dv-btn--accent" : "dv-btn--subtle"}" data-pin="${i}" aria-pressed="${it.pin}" aria-label="Fijar ${esc(it.name)}">📌</button><div style="flex:1;min-width:0"><div class="dv-list__title xp-mono">${esc(it.name)}</div><div class="dv-meter" style="height:4px;margin-top:4px;max-width:200px"><span style="--w:${it.rel * 100}%;--c:var(--dv-success)"></span></div></div><span class="xp-mono dv-muted">${(it.tokens / 1000).toFixed(1)}k</span><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-rm="${i}" aria-label="Quitar">✕</button></li>`).join("");
        };
        ctx.on(ctx.$("[data-items]"), "click", (e) => {
          const p = e.target.closest("[data-pin]");
          const r = e.target.closest("[data-rm]");
          if (p) items[p.dataset.pin].pin = !items[p.dataset.pin].pin;
          if (r) items.splice(Number(r.dataset.rm), 1);
          render();
        });
        ctx.on(ctx.$("[data-prune]"), "click", () => {
          const removed = [];
          let total = items.reduce((s, i) => s + i.tokens, 0);
          items.filter((i) => !i.pin).sort((a, b) => a.rel - b.rel).forEach((it) => {
            if (total <= LIMIT) return;
            items.splice(items.indexOf(it), 1);
            total -= it.tokens;
            removed.push(it.name);
          });
          ctx.toast(removed.length ? { title: `${removed.length} elemento${removed.length > 1 ? "s" : ""} podado${removed.length > 1 ? "s" : ""}`, description: removed.join(", ") } : { title: "Ya cabe", variant: "info" });
          render();
        });
        let seen = 0;
        ctx.on(ctx.$("[data-drop]"), "dv-change", (e) => {
          e.detail.files.slice(seen).forEach((f) => items.push({ name: f.name, tokens: Math.max(1, Math.round(f.size / 4)), rel: 0.6, pin: false }));
          seen = e.detail.files.length;
          render();
        });
        render();
      }
    },

    "agent-handoff-graph": {
      html: `
        ${head("IA y agentes · agent-handoff-graph.tsx", "Grafo de traspasos entre agentes", "El orquestador reparte el trabajo entre subagentes. Ejecútalo para animar los traspasos; haz que el revisor falle para ver un ciclo de reintento.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-run>▶ Ejecutar</button><label class="dv-choice">El revisor rechaza el primer borrador <input type="checkbox" role="switch" class="dv-switch" data-fail /></label></div>
        <div class="dv-grid" style="--min:320px;align-items:start">
          <div class="xp-panel"><svg viewBox="0 0 520 300" class="xp-chart" data-g></svg></div>
          <div class="xp-panel"><span class="dv-eyebrow">Registro de traspasos</span><ol class="dv-timeline" data-log style="margin-top:12px"></ol></div>
        </div>`,
      setup(root, ctx) {
        const nodes = { orch: [70, 150, "Orquestador"], research: [260, 60, "Investigador"], coder: [260, 150, "Programador"], review: [260, 240, "Revisor"], final: [450, 150, "Finalizador"] };
        const edges = [["orch", "research"], ["orch", "coder"], ["research", "coder"], ["coder", "review"], ["review", "coder"], ["review", "final"]];
        const state = {};
        const svg = ctx.$("[data-g]");
        const draw = (active) => {
          svg.innerHTML =
            edges.map(([a, b]) => {
              const [x1, y1] = nodes[a];
              const [x2, y2] = nodes[b];
              const on = active && active[0] === a && active[1] === b;
              const back = a === "review" && b === "coder";
              return `<path d="M${x1},${y1} C${(x1 + x2) / 2 + (back ? 60 : 0)},${y1} ${(x1 + x2) / 2 + (back ? 60 : 0)},${y2} ${x2},${y2}" fill="none" stroke="${on ? "var(--xp-accent)" : "currentColor"}" stroke-opacity="${on ? 1 : 0.25}" stroke-width="${on ? 2.5 : 1.5}" ${on ? 'stroke-dasharray="6 6"' : back ? 'stroke-dasharray="3 4"' : ""}>${on ? '<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.5s" repeatCount="indefinite"/>' : ""}</path>`;
            }).join("") +
            Object.entries(nodes).map(([k, [x, y, label]]) => {
              const s = state[k] || "idle";
              const c = s === "running" ? "var(--xp-accent)" : s === "done" ? "var(--dv-success)" : s === "error" ? "var(--dv-danger)" : "var(--dv-border-strong)";
              return `<g><rect x="${x - 56}" y="${y - 18}" width="112" height="36" rx="8" fill="var(--dv-bg-elevated)" stroke="${c}" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="currentColor" style="fill:var(--dv-fg)">${label}</text></g>`;
            }).join("");
        };
        const log = (text) => {
          const li = document.createElement("li");
          li.style.setProperty("--c", "var(--xp-accent)");
          li.innerHTML = `<span></span><div class="dv-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.firstChild.textContent = text;
          ctx.$("[data-log]").appendChild(li);
        };
        const wait = (ms) => new Promise((r) => ctx.timeout(ms, r));
        let running = false;
        ctx.on(ctx.$("[data-run]"), "click", async () => {
          if (running) return;
          running = true;
          Object.keys(nodes).forEach((k) => (state[k] = "idle"));
          ctx.$("[data-log]").innerHTML = "";
          const hop = async (a, b, msg) => {
            state[a] = "done";
            state[b] = "running";
            draw([a, b]);
            log(msg);
            await wait(900);
          };
          state.orch = "running";
          draw();
          log("El orquestador recibió la tarea: «Agregar interruptor de modo oscuro»");
          await wait(600);
          await hop("orch", "research", "→ Investigador: buscar los tokens de tema existentes");
          await hop("research", "coder", "→ Programador: implementar el interruptor con DevlUI.setTheme");
          await hop("coder", "review", "→ Revisor: verificar a11y + pruebas");
          if (ctx.$("[data-fail]").checked) {
            state.review = "error";
            draw(["review", "coder"]);
            log("✕ Revisor: falta aria-pressed — vuelve al Programador");
            await wait(900);
            await hop("review", "coder", "→ Programador: agregar aria-pressed");
            await hop("coder", "review", "→ Revisor: revisar de nuevo");
          }
          await hop("review", "final", "→ Finalizador: abrir PR");
          state.final = "done";
          draw();
          log("✓ Listo — PR #485 abierto");
          running = false;
        });
        draw();
      }
    },

    "citation-popover": {
      html: `
        ${head("IA y agentes · citation-popover.tsx", "Popover de citas", "Pasa el cursor o enfoca una cita para previsualizar su fuente con una puntuación de confianza; haz clic para resaltarla en la lista de fuentes.")}
        <div class="xp-panel xp-rel" style="line-height:1.9;font-size:14px" data-text>
          Los elementos <code>&lt;dialog&gt;</code> nativos atrapan el foco y se cierran con Escape sin código adicional<button type="button" class="dv-badge dv-badge--accent" data-c="0" style="border:0;cursor:pointer;margin:0 2px">1</button>. Las container queries son compatibles con todos los navegadores actuales<button type="button" class="dv-badge dv-badge--accent" data-c="1" style="border:0;cursor:pointer;margin:0 2px">2</button>, y <code>color-mix()</code> vuelve trivial el tematizado basado en tokens<button type="button" class="dv-badge dv-badge--accent" data-c="2" style="border:0;cursor:pointer;margin:0 2px">3</button>.
          <div class="dv-card" data-pop hidden style="position:absolute;z-index:10;width:300px;box-shadow:var(--dv-shadow-lg);background:var(--dv-bg-elevated)"><div class="dv-card__body dv-stack" style="--gap:6px;font-size:12px;line-height:1.5"></div></div>
        </div>
        <ol class="dv-list" data-sources></ol>`,
      setup(root, ctx) {
        const src = [
          { title: "El elemento dialog", host: "developer.mozilla.org", snippet: "Un diálogo modal… el foco se mueve al diálogo y el resto de la página queda inerte.", conf: 0.96 },
          { title: "Container queries", host: "web.dev", snippet: "Las container queries tienen disponibilidad amplia en Baseline.", conf: 0.88 },
          { title: "color-mix()", host: "css-tricks.com", snippet: "Mezcla dos colores en un espacio de color dado según un porcentaje.", conf: 0.74 }
        ];
        const pop = ctx.$("[data-pop]");
        const host = ctx.$("[data-text]");
        const show = (btn) => {
          const s = src[btn.dataset.c];
          const body = pop.firstElementChild;
          body.innerHTML = `<span class="dv-eyebrow"></span><strong></strong><span class="dv-muted"></span><div class="dv-row"><div class="dv-meter" style="flex:1;height:5px"><span style="--w:${s.conf * 100}%;--c:${s.conf > 0.85 ? "var(--dv-success)" : "var(--dv-warning)"}"></span></div><span class="xp-mono">${Math.round(s.conf * 100)}%</span></div>`;
          body.children[0].textContent = s.host;
          body.children[1].textContent = s.title;
          body.children[2].textContent = `“${s.snippet}”`;
          pop.hidden = false;
          const b = btn.getBoundingClientRect();
          const h = host.getBoundingClientRect();
          pop.style.left = `${Math.min(h.width - 310, Math.max(0, b.left - h.left - 140))}px`;
          pop.style.top = `${b.bottom - h.top + 8}px`;
        };
        ctx.$$("[data-c]").forEach((b) => {
          ctx.on(b, "pointerenter", () => show(b));
          ctx.on(b, "focus", () => show(b));
          ctx.on(b, "pointerleave", () => (pop.hidden = true));
          ctx.on(b, "blur", () => (pop.hidden = true));
          ctx.on(b, "click", () => {
            ctx.$$("[data-sources] li").forEach((li, i) => (li.style.background = i === Number(b.dataset.c) ? "var(--dv-surface-strong)" : ""));
          });
        });
        ctx.$("[data-sources]").innerHTML = src.map((s, i) => `<li><span class="dv-badge dv-badge--accent">${i + 1}</span><div><div class="dv-list__title">${s.title}</div><div class="dv-list__desc">${s.host}</div></div><span class="dv-list__end xp-mono dv-muted">${Math.round(s.conf * 100)}%</span></li>`).join("");
      }
    },

    "voice-waveform-hud": {
      html: `
        ${head("IA y agentes · voice-waveform-hud.tsx", "HUD de forma de onda de voz", "Mantén presionado el botón (o la barra espaciadora mientras tiene el foco) para hablar: la forma de onda reacciona, el VAD se enciende y al soltar se transcribe en streaming. Opcionalmente usa tu micrófono real.")}
        <div class="xp-panel dv-stack" style="align-items:center">
          <canvas class="xp-canvas" data-wave style="height:140px;border:0;background:transparent"></canvas>
          <div class="dv-row"><span class="dv-badge" data-vad>● inactivo</span></div>
          <div class="dv-row"><button type="button" class="dv-btn dv-btn--lg dv-btn--pill dv-btn--accent" data-ptt>Mantén para hablar</button><button type="button" class="dv-btn dv-btn--sm" data-mic>Usar micrófono</button></div>
          <p data-transcript class="dv-muted" style="min-height:44px;text-align:center;max-width:520px">La transcripción aparece aquí.</p>
        </div>`,
      setup(root, ctx) {
        const cv = ctx.$("[data-wave]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        let talking = false;
        let level = 0;
        let analyser = null;
        let buf = null;
        const phrases = ["Agenda una revisión de diseño para el jueves a las tres.", "Resume el último deploy y publícalo en #eng.", "Abre el experimento de precios en una pestaña nueva."];
        let pi = 0;
        ctx.raf((t) => {
          let target = talking ? 0.5 + Math.sin(t / 90) * 0.25 + Math.random() * 0.25 : 0.03;
          if (analyser) {
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) sum += ((buf[i] - 128) / 128) ** 2;
            target = Math.min(1, Math.sqrt(sum / buf.length) * 6);
          }
          level += (target - level) * 0.2;
          const { w, h, dpr } = size;
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim() || "#6366f1";
          for (let k = 0; k < 3; k++) {
            g.beginPath();
            for (let x = 0; x <= w; x += 4) {
              const env = Math.sin((x / w) * Math.PI);
              const y = h / 2 + Math.sin(x / (18 + k * 9) + t / (220 - k * 40)) * env * level * (h / 2.4) * (1 - k * 0.25);
              x ? g.lineTo(x, y) : g.moveTo(x, y);
            }
            g.strokeStyle = accent;
            g.globalAlpha = 1 - k * 0.3;
            g.lineWidth = 2 - k * 0.5;
            g.stroke();
          }
          g.globalAlpha = 1;
          const vad = ctx.$("[data-vad]");
          const speaking = level > 0.15;
          vad.className = `dv-badge${speaking ? " dv-badge--success" : ""}`;
          vad.textContent = speaking ? "● voz detectada" : "● inactivo";
        });
        const btn = ctx.$("[data-ptt]");
        const start = () => {
          talking = true;
          btn.textContent = "Escuchando…";
          ctx.$("[data-transcript]").textContent = "";
        };
        const end = () => {
          if (!talking) return;
          talking = false;
          btn.textContent = "Mantén para hablar";
          const out = ctx.$("[data-transcript]");
          out.classList.remove("dv-muted");
          DEVL_XP.stream(ctx, out, phrases[pi++ % phrases.length], { wps: 9 });
        };
        ctx.on(btn, "pointerdown", start);
        ctx.on(btn, "pointerup", end);
        ctx.on(btn, "pointerleave", end);
        ctx.on(btn, "keydown", (e) => {
          if (e.key === " " && !e.repeat) {
            e.preventDefault();
            start();
          }
        });
        ctx.on(btn, "keyup", (e) => e.key === " " && end());
        ctx.on(ctx.$("[data-mic]"), "click", async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            analyser = ac.createAnalyser();
            analyser.fftSize = 1024;
            buf = new Uint8Array(analyser.fftSize);
            ac.createMediaStreamSource(stream).connect(analyser);
            ctx.onCleanup(() => {
              stream.getTracks().forEach((tr) => tr.stop());
              ac.close();
            });
            ctx.toast({ title: "Micrófono conectado", description: "La forma de onda ahora sigue tu voz." });
          } catch (_) {
            ctx.toast({ title: "Micrófono no disponible", description: "Permiso denegado o no compatible.", variant: "warning" });
          }
        });
      }
    },

    "diff-apply-review": {
      html: `
        ${head("IA y agentes · diff-apply-review.tsx", "Revisión y aplicación de diff", "Acepta o rechaza cada hunk que propuso el agente y luego aplica: el archivo resultante se reconstruye con tus decisiones.")}
        <div class="dv-row"><strong class="xp-mono">src/Button.tsx</strong><span class="dv-badge" data-count></span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-all="1">Aceptar todo</button><button type="button" class="dv-btn dv-btn--sm" data-all="0">Rechazar todo</button><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-apply>Aplicar</button></div>
        <div class="dv-stack" data-hunks></div>
        <div class="xp-panel" data-result hidden><span class="dv-eyebrow">Resultado</span><pre class="dv-code" style="margin-top:8px" data-file></pre></div>`,
      setup(root, ctx) {
        const base = ["export function Button({ children }) {", "  return (", '    <button className="btn">', "      {children}", "    </button>", "  );", "}"];
        const hunks = [
          { at: 0, del: ["export function Button({ children }) {"], add: ['export function Button({ children, variant = "default", ...props }) {'], why: "Agregar prop variant" },
          { at: 2, del: ['    <button className="btn">'], add: ['    <button type="button" className={`dv-btn dv-btn--${variant}`} {...props}>'], why: "Usar clases de devl-ui + type" },
          { at: 4, del: ["    </button>"], add: ["    </button>", "    // TODO: estado de carga"], why: "Dejar TODO (opcional)" }
        ];
        const choice = hunks.map(() => null);
        const render = () => {
          ctx.$("[data-hunks]").innerHTML = hunks
            .map((h, i) => `<div class="dv-card dv-card--flat" style="border-color:${choice[i] === true ? "var(--dv-success)" : choice[i] === false ? "var(--dv-danger)" : "var(--dv-border)"}"><div class="dv-row" style="padding:8px 12px;border-bottom:1px solid var(--dv-border)"><span class="xp-mono dv-muted">@@ línea ${h.at + 1} @@</span><span>${h.why}</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-h="${i}" data-v="1" aria-pressed="${choice[i] === true}">✓ Aceptar</button><button type="button" class="dv-btn dv-btn--sm" data-h="${i}" data-v="0" aria-pressed="${choice[i] === false}">✕ Rechazar</button></div><pre class="xp-mono" style="margin:0;padding:8px 0;font-size:12px">${h.del.map((l) => `<div class="xp-diff-del" style="padding:0 12px">- ${esc(l)}</div>`).join("")}${h.add.map((l) => `<div class="xp-diff-add" style="padding:0 12px">+ ${esc(l)}</div>`).join("")}</pre></div>`)
            .join("");
          const acc = choice.filter((c) => c === true).length;
          const rej = choice.filter((c) => c === false).length;
          ctx.$("[data-count]").textContent = `${acc} aceptados · ${rej} rechazados · ${hunks.length - acc - rej} pendientes`;
        };
        ctx.on(ctx.$("[data-hunks]"), "click", (e) => {
          const b = e.target.closest("[data-h]");
          if (!b) return;
          choice[b.dataset.h] = b.dataset.v === "1";
          render();
        });
        ctx.$$("[data-all]").forEach((b) => ctx.on(b, "click", () => (choice.fill(b.dataset.all === "1"), render())));
        ctx.on(ctx.$("[data-apply]"), "click", () => {
          if (choice.includes(null)) return ctx.toast({ title: "Revisa todos los hunks primero", variant: "warning" });
          const out = [];
          base.forEach((line, i) => {
            const hi = hunks.findIndex((h) => h.at === i);
            if (hi >= 0 && choice[hi]) out.push(...hunks[hi].add);
            else out.push(line);
          });
          ctx.$("[data-file]").textContent = out.join("\n");
          ctx.$("[data-result]").hidden = false;
          ctx.toast({ title: "Parche aplicado", description: `${choice.filter(Boolean).length} hunks` });
        });
        render();
      }
    }
  });

  // ==========================================================================
  // SHADERS & CANVAS
  // ==========================================================================
  const canvasHead = (file, title, desc, controls = "") => `
    ${head(`Shaders y canvas · ${file}`, title, desc)}
    ${controls ? `<div class="dv-row">${controls}</div>` : ""}
    <canvas class="xp-canvas" data-cv style="height:420px"></canvas>`;

  X.addMany("shaders-canvas", {
    "magnetic-cursor-grid": {
      html: canvasHead("magnetic-cursor-grid.tsx", "Cuadrícula de cursor magnético", "Cada aguja apunta hacia el puntero dentro del radio de fuerza. Ajusta el radio y la densidad.", `<label class="dv-choice">Radio <input type="range" class="dv-range" min="40" max="400" value="180" data-r style="width:140px" aria-label="Radio" /></label><label class="dv-choice">Espaciado <input type="range" class="dv-range" min="14" max="48" value="24" data-s style="width:140px" aria-label="Espaciado" /></label>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        let mx = -999;
        let my = -999;
        ctx.on(cv, "pointermove", (e) => ({ x: mx, y: my } = DEVL_XP.pointer(cv, e)));
        ctx.on(cv, "pointerleave", () => (mx = my = -999));
        const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
        ctx.raf((t) => {
          const { w, h, dpr } = size;
          const R = Number(ctx.$("[data-r]").value);
          const S = Number(ctx.$("[data-s]").value);
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          const cx = mx < -900 ? w / 2 + Math.cos(t / 900) * w * 0.3 : mx;
          const cy = my < -900 ? h / 2 + Math.sin(t / 700) * h * 0.3 : my;
          for (let y = S / 2; y < h; y += S)
            for (let x = S / 2; x < w; x += S) {
              const dx = cx - x;
              const dy = cy - y;
              const d = Math.hypot(dx, dy);
              const f = Math.max(0, 1 - d / R);
              const a = f > 0 ? Math.atan2(dy, dx) : 0;
              const len = S * 0.3 + f * S * 0.35;
              g.strokeStyle = f > 0 ? accent : "rgba(150,150,160,.3)";
              g.lineWidth = 1 + f * 1.5;
              g.beginPath();
              g.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
              g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
              g.stroke();
            }
        });
      }
    },

    "ascii-matrix-field": {
      html: canvasHead("ascii-matrix-field.tsx", "Campo matricial ASCII", "Ruido de valor animado representado como luminancia de glifos. El puntero ilumina el campo; cambia el juego de caracteres.", `<dv-segmented value=" .:-=+*#%@" data-set><button class="dv-segmented__item" value=" .:-=+*#%@">Clásico</button><button class="dv-segmented__item" value=" ░▒▓█">Bloques</button><button class="dv-segmented__item" value=" 01">Binario</button></dv-segmented><label class="dv-choice">Celda <input type="range" class="dv-range" min="8" max="20" value="12" data-cell style="width:120px" aria-label="Tamaño de celda" /></label>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        const hash = (x, y) => {
          const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
          return s - Math.floor(s);
        };
        const noise = (x, y) => {
          const xi = Math.floor(x);
          const yi = Math.floor(y);
          const xf = x - xi;
          const yf = y - yi;
          const u = xf * xf * (3 - 2 * xf);
          const v = yf * yf * (3 - 2 * yf);
          const a = hash(xi, yi);
          const b = hash(xi + 1, yi);
          const c = hash(xi, yi + 1);
          const d = hash(xi + 1, yi + 1);
          return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
        };
        let mx = -1;
        let my = -1;
        ctx.on(cv, "pointermove", (e) => ({ x: mx, y: my } = DEVL_XP.pointer(cv, e)));
        const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
        ctx.raf((t) => {
          const { w, h, dpr } = size;
          const cell = Number(ctx.$("[data-cell]").value);
          const chars = ctx.$("[data-set]").value || " .:-=+*#%@";
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          g.font = `${cell}px ui-monospace, monospace`;
          g.textBaseline = "top";
          const tt = t / 1400;
          for (let y = 0; y < h; y += cell)
            for (let x = 0; x < w; x += cell * 0.62) {
              let v = noise(x / 90 + tt, y / 90 - tt * 0.6) * 0.7 + noise(x / 30 - tt, y / 30) * 0.3;
              const d = mx < 0 ? 1e9 : Math.hypot(mx - x, my - y);
              v = Math.min(1, v + Math.max(0, 1 - d / 140) * 0.6);
              const ch = chars[Math.min(chars.length - 1, Math.floor(v * chars.length))];
              g.fillStyle = v > 0.75 ? accent : `rgba(160,160,170,${0.25 + v * 0.6})`;
              g.fillText(ch, x, y);
            }
        });
      }
    },

    "simplex-flow-lines": {
      html: canvasHead("simplex-flow-lines.tsx", "Líneas de flujo simplex", "Las partículas siguen un campo de ruido tipo curl y dejan estelas que se desvanecen. Cambia el número de partículas o regenera el campo.", `<label class="dv-choice">Partículas <input type="range" class="dv-range" min="200" max="3000" step="100" value="1200" data-n style="width:160px" aria-label="Partículas" /></label><button type="button" class="dv-btn dv-btn--sm" data-seed>Regenerar</button><button type="button" class="dv-btn dv-btn--sm" data-clear>Limpiar</button>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        let seed = Math.random() * 1000;
        const size = DEVL_XP.fitCanvas(ctx, cv, () => g.clearRect(0, 0, cv.width, cv.height));
        const hash = (x, y) => {
          const s = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
          return s - Math.floor(s);
        };
        const noise = (x, y) => {
          const xi = Math.floor(x);
          const yi = Math.floor(y);
          const u = (x - xi) ** 2 * (3 - 2 * (x - xi));
          const v = (y - yi) ** 2 * (3 - 2 * (y - yi));
          const a = hash(xi, yi);
          const b = hash(xi + 1, yi);
          const c = hash(xi, yi + 1);
          const d = hash(xi + 1, yi + 1);
          return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
        };
        let parts = [];
        const spawn = () => {
          const n = Number(ctx.$("[data-n]").value);
          parts = Array.from({ length: n }, () => ({ x: Math.random() * size.w, y: Math.random() * size.h, life: Math.random() * 200 }));
        };
        spawn();
        ctx.on(ctx.$("[data-n]"), "input", spawn);
        ctx.on(ctx.$("[data-seed]"), "click", () => ((seed = Math.random() * 1000), spawn()));
        ctx.on(ctx.$("[data-clear]"), "click", () => g.clearRect(0, 0, cv.width, cv.height));
        const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
        ctx.raf(() => {
          const { w, h, dpr } = size;
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.globalCompositeOperation = "destination-out";
          g.fillStyle = "rgba(0,0,0,0.06)";
          g.fillRect(0, 0, w, h);
          g.globalCompositeOperation = "source-over";
          g.strokeStyle = accent;
          g.globalAlpha = 0.5;
          g.lineWidth = 1;
          g.beginPath();
          parts.forEach((p) => {
            const a = noise(p.x / 140, p.y / 140) * Math.PI * 4;
            const nx = p.x + Math.cos(a) * 1.4;
            const ny = p.y + Math.sin(a) * 1.4;
            g.moveTo(p.x, p.y);
            g.lineTo(nx, ny);
            p.x = nx;
            p.y = ny;
            if (--p.life < 0 || nx < 0 || ny < 0 || nx > w || ny > h) {
              p.x = Math.random() * w;
              p.y = Math.random() * h;
              p.life = 100 + Math.random() * 200;
            }
          });
          g.stroke();
          g.globalAlpha = 1;
        });
      }
    },

    "dither-halftone-shader": {
      html: canvasHead("dither-halftone-shader.tsx", "Shader de dithering y medios tonos", "Una imagen procedural en movimiento renderizada con dithering ordenado de Bayer o puntos de medios tonos, píxel por píxel en la CPU.", `<dv-segmented value="bayer4" data-mode><button class="dv-segmented__item" value="bayer4">Bayer 4×4</button><button class="dv-segmented__item" value="bayer8">Bayer 8×8</button><button class="dv-segmented__item" value="halftone">Medios tonos</button><button class="dv-segmented__item" value="none">Original</button></dv-segmented><label class="dv-choice">Píxel <input type="range" class="dv-range" min="2" max="8" value="3" data-px style="width:110px" aria-label="Tamaño de píxel" /></label>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        const bayer = (n) => {
          let m = [[0]];
          while (m.length < n) {
            const k = m.length;
            const next = Array.from({ length: k * 2 }, () => new Array(k * 2));
            for (let y = 0; y < k; y++)
              for (let x = 0; x < k; x++) {
                const v = m[y][x] * 4;
                next[y][x] = v;
                next[y][x + k] = v + 2;
                next[y + k][x] = v + 3;
                next[y + k][x + k] = v + 1;
              }
            m = next;
          }
          return m.map((row) => row.map((v) => (v + 0.5) / (n * n)));
        };
        const B4 = bayer(4);
        const B8 = bayer(8);
        const off = document.createElement("canvas");
        const og = off.getContext("2d");
        let mx = 0.5;
        let my = 0.5;
        ctx.on(cv, "pointermove", (e) => {
          const p = DEVL_XP.pointer(cv, e);
          mx = p.x / p.w;
          my = p.y / p.h;
        });
        ctx.raf((t) => {
          const px = Number(ctx.$("[data-px]").value);
          const mode = ctx.$("[data-mode]").value || "bayer4";
          const W = Math.max(1, Math.floor(size.w / px));
          const H = Math.max(1, Math.floor(size.h / px));
          if (off.width !== W || off.height !== H) {
            off.width = W;
            off.height = H;
          }
          const img = og.createImageData(W, H);
          const d = img.data;
          const tt = t / 1000;
          for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++) {
              const u = x / W;
              const v = y / H;
              let l = 0.5 + 0.5 * Math.sin(u * 6 + tt) * Math.cos(v * 5 - tt * 0.7);
              l = l * 0.6 + Math.max(0, 1 - Math.hypot(u - mx, (v - my) * (H / W)) * 3) * 0.6;
              l = Math.min(1, Math.max(0, l));
              let out = l;
              if (mode === "bayer4") out = l > B4[y % 4][x % 4] ? 1 : 0;
              else if (mode === "bayer8") out = l > B8[y % 8][x % 8] ? 1 : 0;
              else if (mode === "halftone") {
                const c = 4;
                const cx = (x % c) - c / 2 + 0.5;
                const cy = (y % c) - c / 2 + 0.5;
                out = Math.hypot(cx, cy) < l * c * 0.75 ? 1 : 0;
              }
              const i = (y * W + x) * 4;
              d[i] = d[i + 1] = d[i + 2] = out * 235 + 12;
              d[i + 3] = 255;
            }
          og.putImageData(img, 0, 0);
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.imageSmoothingEnabled = false;
          g.drawImage(off, 0, 0, cv.width, cv.height);
        });
      }
    },

    "interactive-cloth-mesh": {
      html: canvasHead("interactive-cloth-mesh.tsx", "Malla de tela interactiva", "Tela integrada con Verlet y sujeta por arriba. Arrastra para jalarla; con el desgarro activado, estírala con fuerza para romper las restricciones.", `<label class="dv-choice">Gravedad <input type="range" class="dv-range" min="0" max="20" value="9" data-g style="width:120px" aria-label="Gravedad" /></label><label class="dv-choice">Desgarro <input type="checkbox" role="switch" class="dv-switch" data-tear checked /></label><button type="button" class="dv-btn dv-btn--sm" data-reset>Restablecer</button>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        let pts;
        let links;
        const COLS = 34;
        const ROWS = 20;
        const build = () => {
          const sp = Math.min((size.w - 80) / COLS, 14);
          const ox = (size.w - sp * COLS) / 2;
          pts = [];
          links = [];
          for (let y = 0; y <= ROWS; y++)
            for (let x = 0; x <= COLS; x++) {
              const p = { x: ox + x * sp, y: 30 + y * sp, px: ox + x * sp, py: 30 + y * sp, pin: y === 0 && x % 4 === 0 };
              pts.push(p);
              if (x) links.push([pts[pts.length - 2], p, sp]);
              if (y) links.push([pts[pts.length - 1 - (COLS + 1)], p, sp]);
            }
        };
        build();
        ctx.on(ctx.$("[data-reset]"), "click", build);
        let grab = null;
        ctx.on(cv, "pointerdown", (e) => {
          const m = DEVL_XP.pointer(cv, e);
          let best = null;
          let bd = 30;
          pts.forEach((p) => {
            const d = Math.hypot(p.x - m.x, p.y - m.y);
            if (d < bd) (bd = d), (best = p);
          });
          grab = best;
          cv.setPointerCapture(e.pointerId);
        });
        ctx.on(cv, "pointermove", (e) => {
          if (!grab) return;
          const m = DEVL_XP.pointer(cv, e);
          grab.x = m.x;
          grab.y = m.y;
        });
        ctx.on(cv, "pointerup", () => (grab = null));
        const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
        ctx.raf(() => {
          const grav = Number(ctx.$("[data-g]").value) * 0.03;
          const tear = ctx.$("[data-tear]").checked;
          pts.forEach((p) => {
            if (p.pin || p === grab) return;
            const vx = (p.x - p.px) * 0.99;
            const vy = (p.y - p.py) * 0.99;
            p.px = p.x;
            p.py = p.y;
            p.x += vx;
            p.y += vy + grav;
            p.y = Math.min(size.h - 2, p.y);
          });
          for (let it = 0; it < 4; it++)
            for (let i = links.length - 1; i >= 0; i--) {
              const [a, b, rest] = links[i];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = Math.hypot(dx, dy) || 0.001;
              if (tear && d > rest * 4.5) {
                links.splice(i, 1);
                continue;
              }
              const diff = ((d - rest) / d) * 0.5;
              if (!a.pin && a !== grab) {
                a.x += dx * diff;
                a.y += dy * diff;
              }
              if (!b.pin && b !== grab) {
                b.x -= dx * diff;
                b.y -= dy * diff;
              }
            }
          const { w, h, dpr } = size;
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          g.strokeStyle = accent;
          g.globalAlpha = 0.7;
          g.beginPath();
          links.forEach(([a, b]) => {
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
          });
          g.stroke();
          g.globalAlpha = 1;
          g.fillStyle = accent;
          pts.forEach((p) => p.pin && g.fillRect(p.x - 2, p.y - 2, 4, 4));
        });
      }
    },

    "raymarched-sdf-orb": {
      html: canvasHead("raymarched-sdf-orb.tsx", "Esfera SDF con raymarching", "Un raymarcher GLSL real: una esfera y una caja mezcladas con smooth-min e iluminadas con sombreado suave. Arrastra para orbitar y desliza para mezclar.", `<label class="dv-choice">Mezcla <input type="range" class="dv-range" min="0" max="100" value="45" data-k style="width:150px" aria-label="Mezcla" /></label><label class="dv-choice">Transformación <input type="range" class="dv-range" min="0" max="100" value="50" data-m style="width:150px" aria-label="Transformación" /></label>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const gl = cv.getContext("webgl");
        if (!gl) {
          cv.replaceWith(Object.assign(document.createElement("div"), { className: "dv-alert dv-alert--warning", textContent: "WebGL no está disponible en este navegador." }));
          return;
        }
        const size = DEVL_XP.fitCanvas(ctx, cv, () => gl.viewport(0, 0, cv.width, cv.height));
        const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
        const fs = `precision mediump float;uniform vec2 r;uniform float t,k,m;uniform vec2 rot;
          float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
          mat2 R(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
          float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-.05;}
          float map(vec3 p){p.xz*=R(rot.x+t*.3);p.yz*=R(rot.y);float s=length(p-vec3(.55*m,0.,0.))-.6;float b=box(p+vec3(.55*m,0.,0.),vec3(.42));return smin(s,b,k+.001);}
          vec3 nor(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
          void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;vec3 ro=vec3(0.,0.,3.),rd=normalize(vec3(uv,-1.6));float d=0.;vec3 col=vec3(0.);
          for(int i=0;i<80;i++){vec3 p=ro+rd*d;float h=map(p);if(h<.001){vec3 n=nor(p);vec3 l=normalize(vec3(.6,.8,.5));float dif=clamp(dot(n,l),0.,1.);float sp=pow(clamp(dot(reflect(-l,n),-rd),0.,1.),32.);float fr=pow(1.-clamp(dot(n,-rd),0.,1.),3.);col=vec3(.39,.4,.95)*(.15+dif*.85)+sp*.8+fr*vec3(.3,.6,1.)*.6;break;}d+=h;if(d>8.)break;}
          gl_FragColor=vec4(col,col==vec3(0.)?0.:1.);}`;
        const sh = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };
        const prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = (n) => gl.getUniformLocation(prog, n);
        let rot = [0.4, 0.3];
        let drag = null;
        ctx.on(cv, "pointerdown", (e) => ((drag = [e.clientX, e.clientY, ...rot]), cv.setPointerCapture(e.pointerId)));
        ctx.on(cv, "pointermove", (e) => {
          if (drag) rot = [drag[2] + (e.clientX - drag[0]) / 100, drag[3] + (e.clientY - drag[1]) / 100];
        });
        ctx.on(cv, "pointerup", () => (drag = null));
        ctx.raf((t) => {
          gl.uniform2f(U("r"), cv.width, cv.height);
          gl.uniform1f(U("t"), drag ? 0 : t / 1000);
          gl.uniform1f(U("k"), Number(ctx.$("[data-k]").value) / 100);
          gl.uniform1f(U("m"), Number(ctx.$("[data-m]").value) / 50);
          gl.uniform2f(U("rot"), rot[0], rot[1]);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          return size.w > 0;
        });
        ctx.onCleanup(() => {
          const ext = gl.getExtension("WEBGL_lose_context");
          if (ext) ext.loseContext();
        });
      }
    },

    "audio-fft-spectrum": {
      html: canvasHead("audio-fft-spectrum.tsx", "Espectro FFT de audio", "Un grafo real de Web Audio: oscilador + LFO → analizador. Inícialo, cambia la forma de onda y el tono, y observa los armónicos.", `<button type="button" class="dv-btn dv-btn--primary" data-play>▶ Iniciar audio</button><select class="dv-select" style="width:auto;height:30px" data-wave aria-label="Forma de onda"><option>sawtooth</option><option>square</option><option>triangle</option><option>sine</option></select><label class="dv-choice">Tono <input type="range" class="dv-range" min="40" max="880" value="110" data-f style="width:150px" aria-label="Tono" /><span class="xp-mono" data-fv>110 Hz</span></label><label class="dv-choice">Volumen <input type="range" class="dv-range" min="0" max="100" value="20" data-v style="width:100px" aria-label="Volumen" /></label>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        let ac = null;
        let osc;
        let gain;
        let analyser;
        let data;
        const start = () => {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return ctx.toast({ title: "Web Audio no es compatible", variant: "warning" });
          ac = new AC();
          osc = ac.createOscillator();
          const lfo = ac.createOscillator();
          const lfoGain = ac.createGain();
          gain = ac.createGain();
          analyser = ac.createAnalyser();
          analyser.fftSize = 2048;
          data = new Uint8Array(analyser.frequencyBinCount);
          lfo.frequency.value = 0.5;
          lfoGain.gain.value = 6;
          lfo.connect(lfoGain).connect(osc.frequency);
          osc.connect(gain).connect(analyser).connect(ac.destination);
          sync();
          osc.start();
          lfo.start();
          ctx.$("[data-play]").textContent = "■ Detener audio";
        };
        const stop = () => {
          if (!ac) return;
          ac.close();
          ac = null;
          ctx.$("[data-play]").textContent = "▶ Iniciar audio";
        };
        const sync = () => {
          const f = Number(ctx.$("[data-f]").value);
          ctx.$("[data-fv]").textContent = `${f} Hz`;
          if (!ac) return;
          osc.type = ctx.$("[data-wave]").value;
          osc.frequency.setTargetAtTime(f, ac.currentTime, 0.03);
          gain.gain.setTargetAtTime(Number(ctx.$("[data-v]").value) / 400, ac.currentTime, 0.03);
        };
        ctx.on(ctx.$("[data-play]"), "click", () => (ac ? stop() : start()));
        ["[data-wave]", "[data-f]", "[data-v]"].forEach((s) => ctx.on(ctx.$(s), "input", sync));
        ctx.onCleanup(stop);
        const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
        ctx.raf((t) => {
          const { w, h, dpr } = size;
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          const bars = 96;
          const bw = w / bars;
          if (ac) analyser.getByteFrequencyData(data);
          for (let i = 0; i < bars; i++) {
            let v;
            if (ac) {
              const idx = Math.floor(Math.pow(i / bars, 2) * data.length * 0.5);
              v = data[idx] / 255;
            } else v = 0.04 + 0.03 * Math.sin(t / 400 + i / 5);
            const bh = v * (h - 30);
            g.fillStyle = accent;
            g.globalAlpha = 0.35 + v * 0.65;
            g.fillRect(i * bw + 1, h - bh - 20, bw - 2, bh);
          }
          g.globalAlpha = 1;
          g.fillStyle = "rgba(150,150,160,.7)";
          g.font = "10px ui-monospace, monospace";
          ["20Hz", "200Hz", "2kHz", "20kHz"].forEach((l, i) => g.fillText(l, (i / 3) * (w - 40) + 4, h - 5));
        });
      }
    },

    "bezier-node-graph": {
      html: `
        ${head("Shaders & Canvas · bezier-node-graph.tsx", "Grafo de nodos Bézier", "Arrastra los nodos; haz clic en un puerto de salida y luego en uno de entrada para conectar un cable; haz clic en un cable para quitarlo. La señal fluye cuando la cadena llega a Salida.")}
        <div class="xp-board" data-board><svg data-wires style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></svg></div>
        <div class="dv-row"><span class="dv-badge" data-status></span><span class="dv-muted" data-hint>Consejo: Oscilador → Filtro → Ganancia → Salida</span></div>`,
      setup(root, ctx) {
        const board = ctx.$("[data-board]");
        const svg = ctx.$("[data-wires]");
        const defs = [["osc", "Oscilador", 40, 60, false, true], ["lfo", "LFO", 40, 240, false, true], ["filter", "Filtro", 260, 90, true, true], ["gain", "Ganancia", 470, 160, true, true], ["out", "Salida", 680, 200, true, false]];
        defs.forEach(([id, label, x, y, inp, out]) => {
          const n = document.createElement("div");
          n.className = "xp-node";
          n.dataset.id = id;
          n.style.left = `${x}px`;
          n.style.top = `${y}px`;
          n.style.minWidth = "120px";
          n.innerHTML = `${inp ? '<button type="button" data-port="in" aria-label="Entrada" style="position:absolute;left:-7px;top:50%;margin-top:-6px;width:12px;height:12px;border-radius:50%;border:2px solid var(--dv-fg-muted);background:var(--dv-bg);cursor:crosshair"></button>' : ""}<strong></strong>${out ? '<button type="button" data-port="out" aria-label="Salida" style="position:absolute;right:-7px;top:50%;margin-top:-6px;width:12px;height:12px;border-radius:50%;border:2px solid var(--xp-accent);background:var(--dv-bg);cursor:crosshair"></button>' : ""}`;
          n.querySelector("strong").textContent = label;
          board.appendChild(n);
        });
        let wires = [["osc", "filter"], ["filter", "gain"]];
        let pending = null;
        const portPos = (id, side) => {
          const n = board.querySelector(`[data-id="${id}"]`);
          return [n.offsetLeft + (side === "out" ? n.offsetWidth : 0), n.offsetTop + n.offsetHeight / 2];
        };
        const live = () => {
          const reach = new Set(["out"]);
          let changed = true;
          while (changed) {
            changed = false;
            wires.forEach(([a, b]) => {
              if (reach.has(b) && !reach.has(a)) {
                reach.add(a);
                changed = true;
              }
            });
          }
          return reach;
        };
        const draw = () => {
          const reach = live();
          svg.innerHTML = wires
            .map(([a, b], i) => {
              const [x1, y1] = portPos(a, "out");
              const [x2, y2] = portPos(b, "in");
              const dx = Math.max(40, Math.abs(x2 - x1) / 2);
              const on = reach.has(a) && reach.has("osc");
              return `<path data-w="${i}" d="M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}" fill="none" stroke="${on ? "var(--xp-accent)" : "var(--dv-fg-subtle)"}" stroke-width="3" style="pointer-events:stroke;cursor:pointer" ${on ? 'stroke-dasharray="8 6"' : ""}>${on ? '<animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.6s" repeatCount="indefinite"/>' : ""}</path>`;
            })
            .join("");
          const ok = reach.has("osc");
          ctx.$("[data-status]").className = `dv-badge dv-badge--${ok ? "success" : "warning"}`;
          ctx.$("[data-status]").textContent = ok ? "♪ La señal llega a la salida" : "Sin señal en la salida";
        };
        let drag = null;
        ctx.on(board, "pointerdown", (e) => {
          const port = e.target.closest("[data-port]");
          const node = e.target.closest(".xp-node");
          if (port) {
            const id = node.dataset.id;
            if (port.dataset.port === "out") {
              pending = id;
              ctx.$("[data-hint]").textContent = `Ahora haz clic en un puerto de entrada para conectar ${id}…`;
            } else if (pending && pending !== id) {
              wires = wires.filter(([, b]) => b !== id).concat([[pending, id]]);
              pending = null;
              ctx.$("[data-hint]").textContent = "Conectado.";
              draw();
            }
            return;
          }
          if (!node) return;
          drag = { node, x: e.clientX, y: e.clientY, l: node.offsetLeft, t: node.offsetTop };
          board.setPointerCapture(e.pointerId);
        });
        ctx.on(board, "pointermove", (e) => {
          if (!drag) return;
          drag.node.style.left = `${drag.l + e.clientX - drag.x}px`;
          drag.node.style.top = `${drag.t + e.clientY - drag.y}px`;
          draw();
        });
        ctx.on(board, "pointerup", () => (drag = null));
        ctx.on(svg, "click", (e) => {
          const p = e.target.closest("[data-w]");
          if (!p) return;
          wires.splice(Number(p.dataset.w), 1);
          draw();
        });
        draw();
      }
    },

    "voronoi-cell-reactor": {
      html: canvasHead("voronoi-cell-reactor.tsx", "Reactor de celdas de Voronoi", "Teselación por píxel según la semilla más cercana, con semillas a la deriva. Haz clic para agregar una semilla; relaja para repartirlas de forma uniforme (Lloyd).", `<button type="button" class="dv-btn dv-btn--sm" data-relax>Relajación de Lloyd</button><label class="dv-choice">Deriva <input type="checkbox" role="switch" class="dv-switch" data-drift checked /></label><label class="dv-choice">Bordes <input type="checkbox" role="switch" class="dv-switch" data-edges checked /></label><span class="dv-muted xp-mono" data-n></span>`),
      setup(root, ctx) {
        const cv = ctx.$("[data-cv]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        const S = 4;
        const off = document.createElement("canvas");
        const og = off.getContext("2d");
        let seeds = Array.from({ length: 18 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0008, vy: (Math.random() - 0.5) * 0.0008, hue: Math.random() * 360 }));
        ctx.on(cv, "click", (e) => {
          const p = DEVL_XP.pointer(cv, e);
          seeds.push({ x: p.x / p.w, y: p.y / p.h, vx: 0, vy: 0, hue: Math.random() * 360 });
        });
        let owner = null;
        ctx.on(ctx.$("[data-relax]"), "click", () => {
          if (!owner) return;
          const W = off.width;
          const acc = seeds.map(() => [0, 0, 0]);
          owner.forEach((s, i) => {
            acc[s][0] += i % W;
            acc[s][1] += Math.floor(i / W);
            acc[s][2]++;
          });
          seeds.forEach((s, i) => {
            if (acc[i][2]) {
              s.x = acc[i][0] / acc[i][2] / W;
              s.y = acc[i][1] / acc[i][2] / off.height;
            }
          });
        });
        ctx.raf(() => {
          const W = Math.max(1, Math.floor(size.w / S));
          const H = Math.max(1, Math.floor(size.h / S));
          if (off.width !== W || off.height !== H) {
            off.width = W;
            off.height = H;
          }
          if (ctx.$("[data-drift]").checked)
            seeds.forEach((s) => {
              s.x += s.vx;
              s.y += s.vy;
              if (s.x < 0 || s.x > 1) s.vx *= -1;
              if (s.y < 0 || s.y > 1) s.vy *= -1;
            });
          const img = og.createImageData(W, H);
          owner = new Uint16Array(W * H);
          const edges = ctx.$("[data-edges]").checked;
          for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++) {
              let best = 0;
              let bd = 1e9;
              let second = 1e9;
              for (let i = 0; i < seeds.length; i++) {
                const dx = x - seeds[i].x * W;
                const dy = y - seeds[i].y * H;
                const d = dx * dx + dy * dy;
                if (d < bd) {
                  second = bd;
                  bd = d;
                  best = i;
                } else if (d < second) second = d;
              }
              owner[y * W + x] = best;
              const edge = edges && Math.sqrt(second) - Math.sqrt(bd) < 1.2;
              const h = seeds[best].hue;
              const l = edge ? 0.9 : 0.25 + 0.25 * (1 - Math.min(1, Math.sqrt(bd) / 40));
              const c = (1 - Math.abs(2 * l - 1)) * 0.6;
              const hp = h / 60;
              const xx = c * (1 - Math.abs((hp % 2) - 1));
              const [r1, g1, b1] = hp < 1 ? [c, xx, 0] : hp < 2 ? [xx, c, 0] : hp < 3 ? [0, c, xx] : hp < 4 ? [0, xx, c] : hp < 5 ? [xx, 0, c] : [c, 0, xx];
              const m = l - c / 2;
              const k = (y * W + x) * 4;
              img.data[k] = (r1 + m) * 255;
              img.data[k + 1] = (g1 + m) * 255;
              img.data[k + 2] = (b1 + m) * 255;
              img.data[k + 3] = 255;
            }
          og.putImageData(img, 0, 0);
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.imageSmoothingEnabled = false;
          g.drawImage(off, 0, 0, cv.width, cv.height);
          ctx.$("[data-n]").textContent = `${seeds.length} celdas`;
        });
      }
    },

    "crt-scanline-terminal": {
      html: `
        ${head("Shaders & Canvas · crt-scanline-terminal.tsx", "Terminal CRT con líneas de barrido", "Una shell funcional sobre un pequeño sistema de archivos virtual: help, ls, cd, cat, echo, date, whoami, history, clear, theme. ↑/↓ para el historial, Tab para autocompletar.")}
        <div class="dv-row"><label class="dv-choice">Parpadeo <input type="checkbox" role="switch" class="dv-switch" data-flicker checked /></label></div>
        <div class="xp-terminal" data-term tabindex="-1"><div data-out></div><div><span data-prompt></span> <input data-in aria-label="Entrada de la terminal" autocomplete="off" spellcheck="false" /></div></div>`,
      setup(root, ctx) {
        const fs = { "/": ["home", "etc", "readme.txt"], "/home": ["luis"], "/home/luis": ["notes.md", "todo.txt"], "/etc": ["motd"] };
        const files = { "/readme.txt": "devl.dev — experimentos funcionales de UI construidos con devl-ui.", "/home/luis/notes.md": "# Notas\n- publicar la galería\n- celebrar", "/home/luis/todo.txt": "[x] biblioteca\n[ ] dominación mundial", "/etc/motd": "Bienvenido a DEVL OS 1.0 (tty1)" };
        let cwd = "/home/luis";
        const history = [];
        let hi = 0;
        let green = true;
        const out = ctx.$("[data-out]");
        const input = ctx.$("[data-in]");
        const term = ctx.$("[data-term]");
        const resolve = (p) => {
          if (!p) return cwd;
          const parts = (p.startsWith("/") ? p : `${cwd}/${p}`).split("/").filter(Boolean);
          const stack = [];
          parts.forEach((s) => (s === ".." ? stack.pop() : s !== "." && stack.push(s)));
          return `/${stack.join("/")}`;
        };
        const print = (text) => {
          const div = document.createElement("div");
          div.style.whiteSpace = "pre-wrap";
          div.textContent = text;
          out.appendChild(div);
        };
        const prompt = () => (ctx.$("[data-prompt]").textContent = `luis@devl:${cwd.replace("/home/luis", "~")}$`);
        const cmds = {
          help: () => "comandos: help ls cd cat echo date whoami history clear theme",
          ls: (a) => {
            const p = resolve(a[0]);
            return fs[p] ? fs[p].join("  ") : files[p] ? p.split("/").pop() : `ls: ${a[0]}: No existe el archivo o directorio`;
          },
          cd: (a) => {
            const p = resolve(a[0] || "/home/luis");
            if (!fs[p]) return `cd: ${a[0]}: No es un directorio`;
            cwd = p;
            prompt();
            return "";
          },
          cat: (a) => (a[0] ? files[resolve(a[0])] ?? `cat: ${a[0]}: No existe el archivo` : "uso: cat <archivo>"),
          echo: (a) => a.join(" "),
          date: () => new Date().toString(),
          whoami: () => "luis",
          history: () => history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join("\n"),
          clear: () => ((out.innerHTML = ""), ""),
          theme: () => {
            green = !green;
            term.style.color = green ? "#7dffa1" : "#ffb84d";
            term.style.textShadow = `0 0 6px ${green ? "rgba(125,255,161,.55)" : "rgba(255,184,77,.55)"}`;
            return `fósforo: ${green ? "P1 verde" : "P3 ámbar"}`;
          }
        };
        ctx.on(input, "keydown", (e) => {
          if (e.key === "Enter") {
            const line = input.value;
            print(`${ctx.$("[data-prompt]").textContent} ${line}`);
            input.value = "";
            if (line.trim()) {
              history.push(line);
              hi = history.length;
              const [cmd, ...args] = line.trim().split(/\s+/);
              const res = cmds[cmd] ? cmds[cmd](args) : `${cmd}: comando no encontrado`;
              if (res) print(res);
            }
            term.scrollTop = term.scrollHeight;
          } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            hi = Math.max(0, Math.min(history.length, hi + (e.key === "ArrowUp" ? -1 : 1)));
            input.value = history[hi] || "";
          } else if (e.key === "Tab") {
            e.preventDefault();
            const parts = input.value.split(" ");
            const last = parts.pop();
            const pool = parts.length ? (fs[cwd] || []) : Object.keys(cmds);
            const hit = pool.filter((x) => x.startsWith(last));
            if (hit.length === 1) input.value = [...parts, hit[0]].join(" ");
            else if (hit.length > 1) print(hit.join("  "));
          }
        });
        ctx.on(term, "click", () => input.focus());
        ctx.every(90, () => (term.style.opacity = ctx.$("[data-flicker]").checked ? String(0.94 + Math.random() * 0.06) : "1"));
        print(files["/etc/motd"]);
        print("Escribe 'help' para empezar.");
        prompt();
      }
    }
  });
})();
