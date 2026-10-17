// ============================================================================
// Experimentos funcionales — Paneles (9), Tablas (9), Filtros (4), Gráficas (9)
// ============================================================================

(function () {
  "use strict";
  const X = window.TESELA_XP;
  const { head, esc, rng } = X;
  const tip = '<div class="xp-tip" data-tip hidden></div>';

  // ==========================================================================
  // DASHBOARDS
  // ==========================================================================
  X.addMany("dashboards", {
    "metrics-overview": {
      html: `
        ${head("Paneles · metrics-overview.tsx", "Resumen de métricas", "Cambia el rango para recalcular los KPI, las variaciones y la gráfica de tendencia. Pasa el cursor sobre la gráfica para ver los valores diarios.")}
        <div class="tsl-row"><tsl-segmented value="30" data-range><button class="tsl-segmented__item" value="7">7 d</button><button class="tsl-segmented__item" value="30">30 d</button><button class="tsl-segmented__item" value="90">90 d</button></tsl-segmented><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-export>Exportar CSV</button></div>
        <div class="tsl-grid" style="--min:200px" data-kpis></div>
        <div class="xp-panel xp-rel"><span class="tsl-eyebrow">Ingresos por día</span>${tip}<svg class="xp-chart" viewBox="0 0 760 240" data-chart style="margin-top:10px"></svg></div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const svg = ctx.$("[data-chart]");
        const tipEl = ctx.$("[data-tip]");
        let series = [];
        const gen = (days, seed) => {
          const r = TESELA_XP.rng(seed);
          let v = 4200;
          return Array.from({ length: days * 2 }, () => (v = Math.max(1200, v + (r() - 0.42) * 600)));
        };
        const box = { x: 46, y: 10, w: 700, h: 200 };
        const render = (days) => {
          const all = gen(days, days * 7);
          const prev = all.slice(0, days);
          series = all.slice(days);
          const sum = (a) => a.reduce((s, v) => s + v, 0);
          const kpis = [
            ["Ingresos", sum(series), sum(prev), (v) => ctx.fmt.money(v, "USD", 0)],
            ["Pedidos", sum(series) / 42, sum(prev) / 42, (v) => ctx.fmt.num(v)],
            ["Pedido promedio", 42 + (series[series.length - 1] % 9), 42 + (prev[prev.length - 1] % 9), (v) => ctx.fmt.money(v)],
            ["Conversión", 3.1 + (sum(series) % 7) / 10, 3.1 + (sum(prev) % 7) / 10, (v) => ctx.fmt.pct(v)]
          ];
          ctx.$("[data-kpis]").innerHTML = kpis
            .map(([label, cur, before, f]) => {
              const d = ((cur - before) / before) * 100;
              return `<div class="tsl-stat"><span class="tsl-eyebrow">${label}</span><span class="tsl-stat__value">${f(cur)}</span><span class="tsl-stat__delta ${d >= 0 ? "is-up" : "is-down"}">${d >= 0 ? "+" : ""}${d.toFixed(1)}% vs. ${days} d previos</span></div>`;
            })
            .join("");
          const max = C.niceMax(Math.max(...series));
          const x = C.scale(0, series.length - 1, box.x, box.x + box.w);
          const y = C.scale(0, max, box.y + box.h, box.y);
          const pts = series.map((v, i) => [x(i), y(v)]);
          svg.innerHTML = `${C.grid(box, max, 4, (v) => `$${Math.round(v / 1000)}k`)}
            <path d="${C.path(pts)} L${box.x + box.w},${box.y + box.h} L${box.x},${box.y + box.h} Z" fill="var(--xp-accent)" opacity="0.15"/>
            <path d="${C.path(pts)}" fill="none" stroke="var(--xp-accent)" stroke-width="2"/>
            <line data-cross y1="${box.y}" y2="${box.y + box.h}" stroke="currentColor" stroke-dasharray="3 3" opacity="0"/>
            <circle data-dot r="4" fill="var(--xp-accent)" opacity="0"/>`;
          svg.__x = x;
          svg.__y = y;
        };
        ctx.on(svg, "pointermove", (e) => {
          const i = C.indexAt(svg, e, series.length, box.x, box.x + box.w);
          const cx = svg.__x(i);
          const cross = svg.querySelector("[data-cross]");
          cross.setAttribute("x1", cx);
          cross.setAttribute("x2", cx);
          cross.setAttribute("opacity", "0.5");
          const dot = svg.querySelector("[data-dot]");
          dot.setAttribute("cx", cx);
          dot.setAttribute("cy", svg.__y(series[i]));
          dot.setAttribute("opacity", "1");
          const day = new Date(Date.now() - (series.length - 1 - i) * 864e5).toLocaleDateString("es-MX", { month: "short", day: "numeric" });
          C.tip(tipEl, e, `<strong>${day}</strong> · ${ctx.fmt.money(series[i], "USD", 0)}`);
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-range]"), "tsl-change", (e) => render(Number(e.detail.value)));
        ctx.on(ctx.$("[data-export]"), "click", () => {
          const csv = "day,revenue\n" + series.map((v, i) => `${i + 1},${v.toFixed(2)}`).join("\n");
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
          a.download = "revenue.csv";
          a.click();
          ctx.toast({ title: `Se exportaron ${series.length} filas` });
        });
        render(30);
      }
    },

    usage: {
      html: `
        ${head("Paneles · usage.tsx", "Uso del plan", "Simula tráfico para ver cómo se llenan las cuotas; avisos al 80 % y una invitación a mejorar el plan cuando se alcanza un límite.")}
        <div class="tsl-row"><span class="tsl-badge tsl-badge--accent">Plan Pro</span><span class="tsl-muted">Se reinicia en 12 días</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn" data-sim aria-pressed="false">▶ Simular tráfico</button><button type="button" class="tsl-btn tsl-btn--subtle" data-reset>Restablecer</button></div>
        <div class="tsl-alert tsl-alert--danger" data-limit hidden><div style="flex:1"><div class="tsl-alert__title">Límite alcanzado</div><div class="tsl-alert__desc" data-limit-text></div></div><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-upgrade>Mejorar plan</button></div>
        <div class="tsl-grid" style="--min:260px" data-meters></div>`,
      setup(root, ctx) {
        let limits = { "Solicitudes API": 1000000, "Almacenamiento (GB)": 50, "Ancho de banda (GB)": 500, Asientos: 10 };
        const base = { "Solicitudes API": 612000, "Almacenamiento (GB)": 31.4, "Ancho de banda (GB)": 205, Asientos: 7 };
        let used = { ...base };
        let running = false;
        const render = () => {
          const full = [];
          ctx.$("[data-meters]").innerHTML = Object.keys(limits)
            .map((k) => {
              const pct = Math.min(100, (used[k] / limits[k]) * 100);
              if (pct >= 100) full.push(k);
              const state = pct >= 100 ? "danger" : pct >= 80 ? "warning" : "success";
              return `<div class="tsl-stat"><div class="tsl-row"><span class="tsl-eyebrow">${k}</span><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--${state}">${pct.toFixed(0)}%</span></div>
                <span class="tsl-stat__value">${ctx.fmt.num(used[k], k.includes("GB") ? 1 : 0)}<span class="tsl-muted" style="font-size:13px"> / ${ctx.fmt.num(limits[k])}</span></span>
                <div class="tsl-meter"><span style="--w:${pct}%;--c:var(--tsl-${state})"></span></div></div>`;
            })
            .join("");
          ctx.$("[data-limit]").hidden = !full.length;
          ctx.$("[data-limit-text]").textContent = `${full.join(", ")} agotado: las solicitudes se están limitando.`;
        };
        ctx.every(400, () => {
          if (!running) return;
          used["Solicitudes API"] = Math.min(limits["Solicitudes API"], used["Solicitudes API"] + 18000);
          used["Ancho de banda (GB)"] = Math.min(limits["Ancho de banda (GB)"], used["Ancho de banda (GB)"] + 6.5);
          used["Almacenamiento (GB)"] = Math.min(limits["Almacenamiento (GB)"], used["Almacenamiento (GB)"] + 0.4);
          render();
        });
        const sim = ctx.$("[data-sim]");
        ctx.on(sim, "click", () => {
          running = !running;
          sim.setAttribute("aria-pressed", String(running));
          sim.textContent = running ? "❚❚ Pausar" : "▶ Simular tráfico";
        });
        ctx.on(ctx.$("[data-reset]"), "click", () => {
          used = { ...base };
          render();
        });
        ctx.on(ctx.$("[data-upgrade]"), "click", () => {
          limits = Object.fromEntries(Object.entries(limits).map(([k, v]) => [k, v * 2]));
          ctx.toast({ title: "Plan mejorado a Business", description: "Todos los límites se duplicaron." });
          render();
        });
        render();
      }
    },

    analytics: {
      html: `
        ${head("Paneles · analytics.tsx", "Analítica", "Contador de visitantes en vivo, barras diarias con información al pasar el cursor y páginas principales ordenables.")}
        <div class="tsl-grid" style="--min:180px">
          <div class="tsl-stat"><span class="tsl-eyebrow"><span class="tsl-dot tsl-dot--success tsl-dot--pulse"></span> Visitantes en vivo</span><span class="tsl-stat__value" data-live>128</span></div>
          <div class="tsl-stat"><span class="tsl-eyebrow">Páginas vistas (14 d)</span><span class="tsl-stat__value" data-pv></span></div>
          <div class="tsl-stat"><span class="tsl-eyebrow">Tasa de rebote</span><span class="tsl-stat__value">38.2%</span></div>
        </div>
        <div class="xp-panel xp-rel"><span class="tsl-eyebrow">Visitantes por día</span>${tip}<svg class="xp-chart" viewBox="0 0 760 200" data-bars style="margin-top:10px"></svg></div>
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="tsl-table-wrap"><table class="tsl-table" data-tsl-sortable><thead><tr><th data-sort="text">Página</th><th data-sort="number" class="is-num">Vistas</th><th data-sort="number" class="is-num">Tiempo prom.</th></tr></thead><tbody>
            ${[["/", 18420, 42], ["/pricing", 6210, 95], ["/docs", 5402, 188], ["/blog/tesela-ui", 3307, 241], ["/changelog", 1288, 63]].map(([p, v, t]) => `<tr><td class="xp-mono">${p}</td><td class="is-num">${v.toLocaleString("es-MX")}</td><td class="is-num" data-value="${t}">${Math.floor(t / 60)}m ${t % 60}s</td></tr>`).join("")}
          </tbody></table></div>
          <div class="xp-panel tsl-stack" style="--gap:10px"><span class="tsl-eyebrow">Países</span>
            ${[["México", 34], ["Estados Unidos", 28], ["España", 14], ["Alemania", 9], ["Otros", 15]].map(([c, p]) => `<div><div class="tsl-row" style="justify-content:space-between;font-size:12px"><span>${c}</span><span class="tsl-muted">${p}%</span></div><div class="tsl-meter" style="height:5px;margin-top:4px"><span style="--w:${p}%"></span></div></div>`).join("")}
          </div>
        </div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const r = TESELA_XP.rng(11);
        const days = Array.from({ length: 14 }, (_, i) => Math.round(1800 + r() * 1600 + (i % 7 < 5 ? 600 : -300)));
        ctx.$("[data-pv]").textContent = ctx.fmt.num(days.reduce((a, b) => a + b, 0) * 2.3);
        const svg = ctx.$("[data-bars]");
        const box = { x: 40, y: 10, w: 710, h: 160 };
        const max = C.niceMax(Math.max(...days));
        const bw = box.w / days.length;
        svg.innerHTML =
          C.grid(box, max, 4, (v) => `${(v / 1000).toFixed(1)}k`) +
          days
            .map((v, i) => {
              const h = (v / max) * box.h;
              const d = new Date(Date.now() - (13 - i) * 864e5);
              return `<rect data-i="${i}" x="${box.x + i * bw + 4}" y="${box.y + box.h - h}" width="${bw - 8}" height="${h}" rx="3" fill="var(--xp-accent)" opacity="0.75"/><text x="${box.x + i * bw + bw / 2}" y="${box.y + box.h + 16}" text-anchor="middle">${d.getDate()}</text>`;
            })
            .join("");
        const tipEl = ctx.$("[data-tip]");
        ctx.on(svg, "pointermove", (e) => {
          const bar = e.target.closest("rect[data-i]");
          svg.querySelectorAll("rect[data-i]").forEach((b) => b.setAttribute("opacity", b === bar ? "1" : "0.55"));
          if (!bar) return (tipEl.hidden = true);
          C.tip(tipEl, e, `<strong>${ctx.fmt.num(days[bar.dataset.i])}</strong> visitantes`);
        });
        ctx.on(svg, "pointerleave", () => {
          tipEl.hidden = true;
          svg.querySelectorAll("rect[data-i]").forEach((b) => b.setAttribute("opacity", "0.75"));
        });
        let live = 128;
        ctx.every(1500, () => {
          live = Math.max(40, live + Math.round((Math.random() - 0.45) * 14));
          ctx.$("[data-live]").textContent = String(live);
        });
      }
    },

    home: {
      html: `
        ${head("Paneles · home.tsx", "Inicio personal", "Saludo según la hora del día, una lista de tareas funcional y un temporizador de enfoque.")}
        <div><h3 class="xp-title" style="margin:0" data-greet></h3><p class="tsl-muted" data-date></p></div>
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel tsl-stack">
            <div class="tsl-row"><span class="tsl-eyebrow">Hoy</span><span class="tsl-spacer"></span><span class="tsl-badge" data-left></span></div>
            <form class="tsl-input-group" data-add><input class="tsl-input" placeholder="Agrega una tarea y presiona Enter" aria-label="Nueva tarea" /></form>
            <ul class="tsl-list" data-tasks></ul>
          </div>
          <div class="xp-panel tsl-stack" style="align-items:center;text-align:center">
            <span class="tsl-eyebrow">Temporizador de enfoque</span>
            <div class="xp-num xp-mono" style="font-size:48px" data-time>25:00</div>
            <progress class="tsl-progress" max="1500" value="0" data-bar></progress>
            <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-start>Iniciar</button><button type="button" class="tsl-btn" data-reset>Restablecer</button></div>
          </div>
        </div>`,
      setup(root, ctx) {
        const h = new Date().getHours();
        ctx.$("[data-greet]").textContent = `${h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches"}, Luis`;
        ctx.$("[data-date]").textContent = new Date().toLocaleDateString("es-MX", { weekday: "long", month: "long", day: "numeric" });
        const list = ctx.$("[data-tasks]");
        const sync = () => (ctx.$("[data-left]").textContent = `${list.querySelectorAll("input:not(:checked)").length} pendientes`);
        const addTask = (text, done = false) => {
          const li = document.createElement("li");
          li.innerHTML = `<label class="tsl-choice" style="flex:1"><input type="checkbox" class="tsl-check" /><span></span></label><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--subtle tsl-btn--sm" aria-label="Eliminar tarea">✕</button>`;
          const box = li.querySelector("input");
          const label = li.querySelector("span");
          label.textContent = text;
          box.checked = done;
          const style = () => (label.style.textDecoration = box.checked ? "line-through" : "");
          style();
          box.addEventListener("change", () => (style(), sync()));
          li.querySelector("button").addEventListener("click", () => (li.remove(), sync()));
          list.appendChild(li);
          sync();
        };
        ctx.on(ctx.$("[data-add]"), "submit", (e) => {
          e.preventDefault();
          const input = e.target.querySelector("input");
          if (input.value.trim()) addTask(input.value.trim());
          input.value = "";
        });
        ["Revisar PR #482", "Redactar notas de la versión", "1:1 con Ana"].forEach((t, i) => addTask(t, i === 0));
        let left = 1500;
        let running = false;
        const render = () => {
          ctx.$("[data-time]").textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
          ctx.$("[data-bar]").value = 1500 - left;
        };
        ctx.every(1000, () => {
          if (!running) return;
          left = Math.max(0, left - 1);
          render();
          if (!left) {
            running = false;
            ctx.$("[data-start]").textContent = "Iniciar";
            ctx.toast({ title: "Sesión de enfoque completada 🎉" });
          }
        });
        ctx.on(ctx.$("[data-start]"), "click", (e) => {
          running = !running;
          e.target.textContent = running ? "Pausar" : "Iniciar";
        });
        ctx.on(ctx.$("[data-reset]"), "click", () => {
          left = 1500;
          render();
        });
      }
    },

    revenue: {
      html: `
        ${head("Paneles · revenue.tsx", "Ingresos", "Movimientos de MRR apilados por mes. Activa o desactiva series en la leyenda; los totales y la retención neta se recalculan.")}
        <div class="tsl-grid" style="--min:170px" data-kpis></div>
        <div class="xp-panel xp-rel">
          <div class="tsl-row" data-legend>
            <button type="button" class="tsl-chip" data-s="new" aria-pressed="true"><span class="tsl-dot" style="--_c:var(--tsl-success)"></span> Nuevo</button>
            <button type="button" class="tsl-chip" data-s="expansion" aria-pressed="true"><span class="tsl-dot" style="--_c:var(--tsl-info)"></span> Expansión</button>
            <button type="button" class="tsl-chip" data-s="churn" aria-pressed="true"><span class="tsl-dot" style="--_c:var(--tsl-danger)"></span> Cancelaciones</button>
          </div>${tip}
          <svg class="xp-chart" viewBox="0 0 760 260" data-chart style="margin-top:10px"></svg>
        </div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const r = TESELA_XP.rng(5);
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const data = months.map(() => ({ new: 6000 + r() * 6000, expansion: 2000 + r() * 4000, churn: 1500 + r() * 2500 }));
        const on = { new: true, expansion: true, churn: true };
        const colors = { new: "var(--tsl-success)", expansion: "var(--tsl-info)", churn: "var(--tsl-danger)" };
        const svg = ctx.$("[data-chart]");
        const tipEl = ctx.$("[data-tip]");
        const box = { x: 50, y: 10, w: 700, h: 210 };
        const render = () => {
          const pos = data.map((d) => (on.new ? d.new : 0) + (on.expansion ? d.expansion : 0));
          const neg = data.map((d) => (on.churn ? d.churn : 0));
          const max = C.niceMax(Math.max(...pos, ...neg, 1));
          const zero = box.y + (box.h * max) / (max * 1.35);
          const k = (zero - box.y) / max;
          const bw = box.w / 12;
          let bars = `<line x1="${box.x}" x2="${box.x + box.w}" y1="${zero}" y2="${zero}" stroke="currentColor" stroke-opacity="0.3"/>`;
          data.forEach((d, i) => {
            let top = zero;
            ["new", "expansion"].forEach((s) => {
              if (!on[s]) return;
              const h = d[s] * k;
              top -= h;
              bars += `<rect data-i="${i}" x="${box.x + i * bw + 6}" y="${top}" width="${bw - 12}" height="${h}" fill="${colors[s]}" opacity="0.8"/>`;
            });
            if (on.churn) bars += `<rect data-i="${i}" x="${box.x + i * bw + 6}" y="${zero}" width="${bw - 12}" height="${d.churn * k}" fill="${colors.churn}" opacity="0.7"/>`;
            bars += `<text x="${box.x + i * bw + bw / 2}" y="${box.y + box.h + 22}" text-anchor="middle">${months[i]}</text>`;
          });
          svg.innerHTML = bars;
          const sum = (key) => data.reduce((s, d) => s + d[key], 0);
          const net = (on.new ? sum("new") : 0) + (on.expansion ? sum("expansion") : 0) - (on.churn ? sum("churn") : 0);
          const nrr = ((100000 + sum("expansion") - sum("churn")) / 100000) * 100;
          ctx.$("[data-kpis]").innerHTML = [
            ["MRR nuevo neto", ctx.fmt.money(net, "USD", 0)],
            ["ARR proyectado", ctx.fmt.money((84000 + net / 12) * 12, "USD", 0)],
            ["Cancelado", ctx.fmt.money(sum("churn"), "USD", 0)],
            ["Retención neta", ctx.fmt.pct(nrr)]
          ]
            .map(([l, v]) => `<div class="tsl-stat"><span class="tsl-eyebrow">${l}</span><span class="tsl-stat__value">${v}</span></div>`)
            .join("");
        };
        ctx.on(ctx.$("[data-legend]"), "click", (e) => {
          const b = e.target.closest("[data-s]");
          if (!b) return;
          on[b.dataset.s] = !on[b.dataset.s];
          b.setAttribute("aria-pressed", String(on[b.dataset.s]));
          render();
        });
        ctx.on(svg, "pointermove", (e) => {
          const bar = e.target.closest("[data-i]");
          if (!bar) return (tipEl.hidden = true);
          const d = data[bar.dataset.i];
          C.tip(tipEl, e, `<strong>${months[bar.dataset.i]}</strong><br>Nuevo ${ctx.fmt.money(d.new, "USD", 0)} · Exp. ${ctx.fmt.money(d.expansion, "USD", 0)} · Cancel. −${ctx.fmt.money(d.churn, "USD", 0)}`);
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        render();
      }
    },

    services: {
      html: `
        ${head("Paneles · services.tsx", "Estado de los servicios", "La latencia se actualiza cada segundo. Provoca un incidente para ver cómo reaccionan el estado, el aviso y la disponibilidad; resuélvelo para recuperarte.")}
        <div class="tsl-alert tsl-alert--success" data-banner><div><div class="tsl-alert__title" data-banner-title>Todos los sistemas operan con normalidad</div><div class="tsl-alert__desc" data-banner-desc>Actualizado justo ahora</div></div></div>
        <div class="tsl-table-wrap"><table class="tsl-table"><thead><tr><th>Servicio</th><th>Estado</th><th>Latencia (p95)</th><th class="is-num">Disponibilidad 30 d</th><th></th></tr></thead><tbody data-rows></tbody></table></div>`,
      setup(root, ctx) {
        const services = ["Puerta de enlace API", "Autenticación", "Base de datos", "CDN de borde", "Webhooks"].map((name, i) => ({ name, base: 30 + i * 18, hist: [], down: false, uptime: 99.9 + i * 0.015 }));
        const tbody = ctx.$("[data-rows]");
        tbody.innerHTML = services
          .map((s, i) => `<tr data-i="${i}"><td><strong>${s.name}</strong></td><td data-status></td><td><div class="tsl-row" style="flex-wrap:nowrap"><tsl-sparkline style="--w:120px;--h:24px" data-spark></tsl-sparkline><span class="xp-mono" data-lat></span></div></td><td class="is-num xp-mono" data-up></td><td class="is-num"><button type="button" class="tsl-btn tsl-btn--sm" data-toggle>Simular incidente</button></td></tr>`)
          .join("");
        const tick = () => {
          services.forEach((s, i) => {
            const v = s.down ? s.base * 6 + Math.random() * 300 : s.base + Math.random() * 20;
            s.hist = s.hist.concat(v).slice(-24);
            if (s.down) s.uptime = Math.max(98.5, s.uptime - 0.004);
            const row = tbody.querySelector(`[data-i="${i}"]`);
            row.querySelector("[data-spark]").setAttribute("values", s.hist.map((x) => x.toFixed(0)).join(","));
            row.querySelector("[data-spark]").style.color = s.down ? "var(--tsl-danger)" : "var(--tsl-success)";
            row.querySelector("[data-lat]").textContent = `${v.toFixed(0)}ms`;
            row.querySelector("[data-up]").textContent = `${s.uptime.toFixed(3)}%`;
            row.querySelector("[data-status]").innerHTML = s.down ? '<span class="tsl-badge tsl-badge--danger">Degradado</span>' : '<span class="tsl-badge tsl-badge--success">Operativo</span>';
            row.querySelector("[data-toggle]").textContent = s.down ? "Resolver" : "Simular incidente";
          });
          const bad = services.filter((s) => s.down);
          const banner = ctx.$("[data-banner]");
          banner.className = `tsl-alert tsl-alert--${bad.length ? "danger" : "success"}`;
          ctx.$("[data-banner-title]").textContent = bad.length ? `Incidente: ${bad.map((s) => s.name).join(", ")} degradado` : "Todos los sistemas operan con normalidad";
          ctx.$("[data-banner-desc]").textContent = `Actualizado ${new Date().toLocaleTimeString("es-MX")}`;
        };
        ctx.on(tbody, "click", (e) => {
          const b = e.target.closest("[data-toggle]");
          if (!b) return;
          const s = services[b.closest("tr").dataset.i];
          s.down = !s.down;
          ctx.toast({ title: s.down ? `Incidente abierto: ${s.name}` : `${s.name} resuelto`, variant: s.down ? "danger" : "success" });
          tick();
        });
        for (let i = 0; i < 20; i++) tick();
        ctx.every(1000, tick);
      }
    },

    engineering: {
      html: `
        ${head("Paneles · engineering.tsx", "Velocidad de ingeniería", "Métricas DORA, tiempo de ciclo semanal y una lista de pull requests que puedes filtrar y fusionar.")}
        <div class="tsl-grid" style="--min:170px">
          <div class="tsl-stat"><span class="tsl-eyebrow">Deploys / semana</span><span class="tsl-stat__value" data-deploys>23</span></div>
          <div class="tsl-stat"><span class="tsl-eyebrow">Lead time</span><span class="tsl-stat__value">1.8d</span></div>
          <div class="tsl-stat"><span class="tsl-eyebrow">Fallos por cambio</span><span class="tsl-stat__value">4.2%</span></div>
          <div class="tsl-stat"><span class="tsl-eyebrow">PR abiertos</span><span class="tsl-stat__value" data-open></span></div>
        </div>
        <div class="xp-panel"><span class="tsl-eyebrow">Tiempo de ciclo (horas) · últimas 8 semanas</span><svg class="xp-chart" viewBox="0 0 760 170" data-chart style="margin-top:10px"></svg></div>
        <div class="tsl-row"><tsl-segmented value="open" data-filter><button class="tsl-segmented__item" value="open">Abiertos</button><button class="tsl-segmented__item" value="merged">Fusionados</button><button class="tsl-segmented__item" value="all">Todos</button></tsl-segmented></div>
        <ul class="tsl-list" data-prs></ul>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const weeks = [42, 38, 45, 31, 29, 33, 26, 22];
        const box = { x: 36, y: 10, w: 714, h: 130 };
        const max = C.niceMax(Math.max(...weeks));
        const x = C.scale(0, weeks.length - 1, box.x + 20, box.x + box.w - 20);
        const y = C.scale(0, max, box.y + box.h, box.y);
        const pts = weeks.map((v, i) => [x(i), y(v)]);
        ctx.$("[data-chart]").innerHTML = C.grid(box, max, 3) + `<path d="${C.path(pts)}" fill="none" stroke="var(--xp-accent)" stroke-width="2"/>` + pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--xp-accent)"/><text x="${p[0]}" y="${p[1] - 9}" text-anchor="middle">${weeks[i]}h</text>`).join("");
        const prs = [
          { n: 482, t: "Ranking de la paleta de comandos", a: "Leo", s: "open", checks: true },
          { n: 483, t: "Corregir retorno del foco en el panel lateral", a: "Ana", s: "open", checks: false },
          { n: 484, t: "Agregar selector OKLCH", a: "Sara", s: "open", checks: true },
          { n: 479, t: "Actualizar ejecutor de pruebas", a: "Tom", s: "merged", checks: true }
        ];
        let filter = "open";
        const render = () => {
          const list = ctx.$("[data-prs]");
          list.innerHTML = "";
          prs.filter((p) => filter === "all" || p.s === filter).forEach((p) => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="tsl-badge tsl-badge--${p.s === "merged" ? "accent" : "success"}">${p.s === "merged" ? "fusionado" : "abierto"}</span><div><div class="tsl-list__title"></div><div class="tsl-list__desc">#${p.n} · ${p.a} · ${p.checks ? "✓ verificaciones aprobadas" : "✕ verificaciones fallando"}</div></div><div class="tsl-list__end">${p.s === "open" ? `<button type="button" class="tsl-btn tsl-btn--sm"${p.checks ? "" : " disabled"}>Fusionar</button>` : ""}</div>`;
            li.querySelector(".tsl-list__title").textContent = p.t;
            const btn = li.querySelector("button");
            if (btn)
              btn.addEventListener("click", () => {
                p.s = "merged";
                ctx.$("[data-deploys]").textContent = String(Number(ctx.$("[data-deploys]").textContent) + 1);
                ctx.toast({ title: `PR #${p.n} fusionado`, description: "Deploy iniciado" });
                render();
              });
            list.appendChild(li);
          });
          ctx.$("[data-open]").textContent = String(prs.filter((p) => p.s === "open").length);
        };
        ctx.on(ctx.$("[data-filter]"), "tsl-change", (e) => ((filter = e.detail.value), render()));
        render();
      }
    },

    support: {
      html: `
        ${head("Paneles · support.tsx", "Cola de soporte", "Los temporizadores de SLA descuentan en vivo; los tickets vencidos se ponen en rojo. Asigna, resuelve y filtra por prioridad.")}
        <div class="tsl-row"><tsl-segmented value="all" data-filter><button class="tsl-segmented__item" value="all">Todos</button><button class="tsl-segmented__item" value="Urgente">Urgente</button><button class="tsl-segmented__item" value="Alta">Alta</button><button class="tsl-segmented__item" value="Normal">Normal</button></tsl-segmented><span class="tsl-spacer"></span><span class="tsl-badge" data-csat>CSAT 94%</span><span class="tsl-badge tsl-badge--danger" data-breached></span></div>
        <div class="tsl-table-wrap"><table class="tsl-table"><thead><tr><th>Ticket</th><th>Cliente</th><th>Prioridad</th><th>Asignado a</th><th class="is-num">SLA</th><th></th></tr></thead><tbody data-rows></tbody></table></div>`,
      setup(root, ctx) {
        const tickets = [
          ["T-901", "Bucle de inicio de sesión en Safari", "Globex", "Urgente", 95],
          ["T-902", "La factura muestra un IVA incorrecto", "Initech", "Alta", 640],
          ["T-903", "Tiempo de espera agotado al exportar CSV", "Acme", "Alta", 20],
          ["T-904", "Solicitud de función: SSO", "Umbrella", "Normal", 2600],
          ["T-905", "Reintentos de webhook", "Hooli", "Normal", 1400]
        ].map(([id, subject, customer, prio, sla]) => ({ id, subject, customer, prio, sla, owner: "Sin asignar" }));
        let filter = "all";
        const tbody = ctx.$("[data-rows]");
        const fmt = (s) => (s <= 0 ? `−${Math.floor(-s / 60)} min ${-s % 60} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
        const render = () => {
          tbody.innerHTML = tickets
            .filter((t) => filter === "all" || t.prio === filter)
            .map((t) => `<tr data-id="${t.id}"><td><span class="xp-mono tsl-muted">${t.id}</span><br><strong>${esc(t.subject)}</strong></td><td>${esc(t.customer)}</td><td><span class="tsl-badge tsl-badge--${t.prio === "Urgente" ? "danger" : t.prio === "Alta" ? "warning" : "info"}">${t.prio}</span></td><td>${t.owner}</td><td class="is-num xp-mono" data-sla style="color:${t.sla <= 0 ? "var(--tsl-danger)" : t.sla < 120 ? "var(--tsl-warning)" : ""}">${fmt(t.sla)}</td><td class="is-num"><div class="tsl-row" style="justify-content:flex-end;flex-wrap:nowrap"><button type="button" class="tsl-btn tsl-btn--sm" data-assign>Asignarme</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-resolve>Resolver</button></div></td></tr>`)
            .join("") || '<tr><td colspan="6" class="tsl-muted">La cola está vacía 🎉</td></tr>';
          ctx.$("[data-breached]").textContent = `${tickets.filter((t) => t.sla <= 0).length} vencidos`;
        };
        ctx.every(1000, () => {
          tickets.forEach((t) => t.sla--);
          tbody.querySelectorAll("tr[data-id]").forEach((tr) => {
            const t = tickets.find((x) => x.id === tr.dataset.id);
            const cell = tr.querySelector("[data-sla]");
            cell.textContent = fmt(t.sla);
            cell.style.color = t.sla <= 0 ? "var(--tsl-danger)" : t.sla < 120 ? "var(--tsl-warning)" : "";
          });
          ctx.$("[data-breached]").textContent = `${tickets.filter((t) => t.sla <= 0).length} vencidos`;
        });
        ctx.on(tbody, "click", (e) => {
          const tr = e.target.closest("tr[data-id]");
          if (!tr) return;
          const i = tickets.findIndex((t) => t.id === tr.dataset.id);
          if (e.target.closest("[data-assign]")) {
            tickets[i].owner = "Luis";
            render();
          } else if (e.target.closest("[data-resolve]")) {
            ctx.toast({ title: `${tickets[i].id} resuelto` });
            tickets.splice(i, 1);
            render();
          }
        });
        ctx.on(ctx.$("[data-filter]"), "tsl-change", (e) => ((filter = e.detail.value), render()));
        render();
      }
    },

    market: {
      html: `
        ${head("Paneles · market.tsx", "Mercados", "Cotizaciones simuladas en vivo con paseo aleatorio. Selecciona una y compra o vende; el portafolio y el efectivo se actualizan.")}
        <div class="xp-split" style="--cols:300px minmax(0,1fr)">
          <ul class="tsl-list" data-watch style="border:0;border-radius:0"></ul>
          <div class="xp-pane tsl-stack">
            <div class="tsl-row"><h3 class="xp-title" style="margin:0" data-sym></h3><span class="xp-num xp-mono" style="font-size:22px" data-price></span><span class="tsl-badge" data-chg></span></div>
            <tsl-sparkline fill style="--w:100%;--h:120px" data-big></tsl-sparkline>
            <form class="tsl-row" data-trade><div class="tsl-number"><button type="button" data-step="-1" aria-label="Menos">−</button><input type="number" min="1" max="1000" value="10" name="qty" aria-label="Cantidad" /><button type="button" data-step="1" aria-label="Más">+</button></div><button type="submit" class="tsl-btn tsl-btn--primary" value="buy">Comprar</button><button type="submit" class="tsl-btn" value="sell">Vender</button><span class="tsl-spacer"></span><span class="tsl-muted">Efectivo <strong class="xp-mono" data-cash></strong></span></form>
            <div class="tsl-table-wrap"><table class="tsl-table tsl-table--compact"><thead><tr><th>Posición</th><th class="is-num">Cant.</th><th class="is-num">Valor</th><th class="is-num">G/P</th></tr></thead><tbody data-pos></tbody></table></div>
          </div>
        </div>`,
      setup(root, ctx) {
        const tickers = { TSLX: 142.3, ACME: 88.1, GLBX: 23.75, INIT: 310.4, UMBR: 57.9 };
        // Inicializa cada cotización con un paseo aleatorio hacia atrás que termina en el precio de hoy
        const hist = Object.fromEntries(
          Object.entries(tickers).map(([k, v]) => {
            const r = TESELA_XP.rng(k.charCodeAt(0) * 31 + k.charCodeAt(1));
            const out = [v];
            for (let i = 1; i < 40; i++) out.unshift(+(out[0] * (1 + (r() - 0.5) * 0.02)).toFixed(2));
            return [k, out];
          })
        );
        const open = { ...tickers };
        let sel = "TSLX";
        let cash = 10000;
        const pos = {};
        const watch = ctx.$("[data-watch]");
        watch.innerHTML = Object.keys(tickers).map((k) => `<li class="xp-select-item" data-k="${k}"><strong class="xp-mono" style="width:52px">${k}</strong><tsl-sparkline style="--w:80px;--h:22px"></tsl-sparkline><span class="tsl-list__end xp-mono" data-p></span></li>`).join("");
        const render = () => {
          Object.keys(tickers).forEach((k) => {
            const li = watch.querySelector(`[data-k="${k}"]`);
            const up = tickers[k] >= open[k];
            li.setAttribute("aria-selected", String(k === sel));
            li.querySelector("tsl-sparkline").setAttribute("values", hist[k].join(","));
            li.querySelector("tsl-sparkline").style.color = up ? "var(--tsl-success)" : "var(--tsl-danger)";
            li.querySelector("[data-p]").textContent = tickers[k].toFixed(2);
            li.querySelector("[data-p]").style.color = up ? "var(--tsl-success)" : "var(--tsl-danger)";
          });
          const chg = ((tickers[sel] - open[sel]) / open[sel]) * 100;
          ctx.$("[data-sym]").textContent = sel;
          ctx.$("[data-price]").textContent = ctx.fmt.money(tickers[sel]);
          ctx.$("[data-chg]").className = `tsl-badge tsl-badge--${chg >= 0 ? "success" : "danger"}`;
          ctx.$("[data-chg]").textContent = `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`;
          ctx.$("[data-big]").setAttribute("values", hist[sel].join(","));
          ctx.$("[data-big]").style.color = chg >= 0 ? "var(--tsl-success)" : "var(--tsl-danger)";
          ctx.$("[data-cash]").textContent = ctx.fmt.money(cash);
          ctx.$("[data-pos]").innerHTML = Object.keys(pos).length
            ? Object.entries(pos).map(([k, p]) => {
                const pl = (tickers[k] - p.avg) * p.qty;
                return `<tr><td class="xp-mono">${k}</td><td class="is-num">${p.qty}</td><td class="is-num">${ctx.fmt.money(p.qty * tickers[k])}</td><td class="is-num" style="color:${pl >= 0 ? "var(--tsl-success)" : "var(--tsl-danger)"}">${ctx.fmt.money(pl)}</td></tr>`;
              }).join("")
            : '<tr><td colspan="4" class="tsl-muted">Aún no hay posiciones.</td></tr>';
        };
        ctx.every(1000, () => {
          Object.keys(tickers).forEach((k) => {
            tickers[k] = Math.max(1, tickers[k] * (1 + (Math.random() - 0.5) * 0.012));
            hist[k] = hist[k].slice(1).concat(+tickers[k].toFixed(2));
          });
          render();
        });
        ctx.on(watch, "click", (e) => {
          const li = e.target.closest("[data-k]");
          if (li) {
            sel = li.dataset.k;
            render();
          }
        });
        ctx.on(ctx.$("[data-trade]"), "submit", (e) => {
          e.preventDefault();
          const qty = Math.max(1, parseInt(e.target.qty.value, 10) || 0);
          const side = e.submitter ? e.submitter.value : "buy";
          const price = tickers[sel];
          if (side === "buy") {
            if (qty * price > cash) return ctx.toast({ title: "Efectivo insuficiente", variant: "danger" });
            const p = pos[sel] || { qty: 0, avg: 0 };
            p.avg = (p.avg * p.qty + price * qty) / (p.qty + qty);
            p.qty += qty;
            pos[sel] = p;
            cash -= qty * price;
          } else {
            const p = pos[sel];
            if (!p || p.qty < qty) return ctx.toast({ title: `Tienes ${p ? p.qty : 0} ${sel}`, variant: "warning" });
            p.qty -= qty;
            cash += qty * price;
            if (!p.qty) delete pos[sel];
          }
          ctx.toast({ title: `${side === "buy" ? "Compraste" : "Vendiste"} ${qty} ${sel} a ${price.toFixed(2)}` });
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // TABLES
  // ==========================================================================
  const r = rng(42);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const people = ["Ana López", "Leo Kim", "Sara Ruiz", "Tom Weber", "Mia Chen", "Noah Patel", "Lucía Gómez", "Omar Haddad", "Eva Novak", "Kai Tanaka", "Iris Moreau", "Ben Carter"];
  const companies = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka", "Soylent", "Tyrell", "Cyberdyne", "Aperture"];
  const date = (d) => new Date(Date.UTC(2026, 9, 14) - d * 864e5).toISOString().slice(0, 10);

  const tables = {
    invoices: {
      eyebrow: "Tablas · invoices.tsx", title: "Facturas", desc: "Busca, filtra por estado, ordena, selecciona filas y márcalas como pagadas en lote.",
      columns: [{ key: "id", label: "Factura", sort: "text", mono: true }, { key: "customer", label: "Cliente", sort: "text" }, { key: "status", label: "Estado" }, { key: "due", label: "Vence", sort: "text" }, { key: "amount", label: "Monto", sort: "number", num: true }],
      rows: companies.map((c, i) => ({ id: `INV-${2091 + i}`, customer: c, status: pick(["Pagada", "Pendiente", "Vencida"]), due: date(i * 3 - 10), amount: ctxMoney(400 + r() * 6000) })),
      filters: ["Pagada", "Pendiente", "Vencida"], badges: { status: { Pagada: "success", Pendiente: "warning", Vencida: "danger" } },
      bulk: [{ label: "Marcar como pagada", set: "status=Pagada" }, { label: "Eliminar", remove: true }], rowAction: { label: "Recordar", toast: "Recordatorio enviado para {id}" }, pageSize: 8
    },
    members: {
      eyebrow: "Tablas · members.tsx", title: "Miembros del equipo", desc: "Cambia roles en lote, filtra por rol y elimina miembros.",
      columns: [{ key: "name", label: "Nombre", sort: "text" }, { key: "email", label: "Correo" }, { key: "role", label: "Rol" }, { key: "mfa", label: "2FA" }, { key: "seen", label: "Última vez visto", sort: "text" }],
      rows: people.map((p, i) => ({ id: p, name: p, email: `${p.split(" ")[0].toLowerCase()}@acme.dev`, role: pick(["Admin", "Miembro", "Miembro", "Lector"]), mfa: i % 3 ? "Activado" : "Desactivado", seen: `hace ${(i % 9) + 1} h` })),
      filterKey: "role", filters: ["Admin", "Miembro", "Lector"], badges: { role: { Admin: "accent", Miembro: "info", Lector: "" }, mfa: { Activado: "success", Desactivado: "warning" } },
      bulk: [{ label: "Hacer admin", set: "role=Admin" }, { label: "Hacer lector", set: "role=Lector" }, { label: "Quitar", remove: true }], rowAction: { label: "Quitar", remove: true, toast: "Se quitó a {id}" }
    },
    orders: {
      eyebrow: "Tablas · orders.tsx", title: "Pedidos", desc: "Despacha pedidos uno por uno o en lote; filtra por estado de cumplimiento.",
      columns: [{ key: "id", label: "Pedido", sort: "text", mono: true }, { key: "customer", label: "Cliente", sort: "text" }, { key: "items", label: "Artículos", sort: "number", num: true }, { key: "status", label: "Cumplimiento" }, { key: "total", label: "Total", sort: "number", num: true }],
      rows: Array.from({ length: 14 }, (_, i) => ({ id: `#10${40 + i}`, customer: pick(people), items: 1 + Math.floor(r() * 5), status: pick(["Sin enviar", "Enviado", "Entregado"]), total: ctxMoney(20 + r() * 380) })),
      filters: ["Sin enviar", "Enviado", "Entregado"], badges: { status: { "Sin enviar": "warning", Enviado: "info", Entregado: "success" } },
      bulk: [{ label: "Marcar como enviado", set: "status=Enviado" }], rowAction: { label: "Enviar", set: "status=Enviado", toast: "Etiqueta impresa para {id}" }, pageSize: 7
    },
    "api-keys": {
      eyebrow: "Tablas · api-keys.tsx", title: "API keys", desc: "Revoca claves de forma individual o en lote; las claves revocadas siguen listadas para auditoría.",
      columns: [{ key: "name", label: "Nombre", sort: "text" }, { key: "key", label: "Clave", mono: true }, { key: "scopes", label: "Permisos" }, { key: "used", label: "Último uso", sort: "text" }, { key: "status", label: "Estado" }],
      rows: ["Producción", "Staging", "Deploy de CI", "Exportación de analítica", "Zapier", "App móvil"].map((n, i) => ({ id: n, name: n, key: `tsl_live_••••${(1000 + i * 1337).toString(16)}`, scopes: pick(["lectura", "lectura, escritura", "admin"]), used: `hace ${i + 1} d`, status: "Activa" })),
      filters: ["Activa", "Revocada"], badges: { status: { Activa: "success", Revocada: "danger" } },
      bulk: [{ label: "Revocar", set: "status=Revocada" }], rowAction: { label: "Revocar", set: "status=Revocada", toast: "{id} revocada" }
    },
    inventory: {
      eyebrow: "Tablas · inventory.tsx", title: "Inventario", desc: "Los SKU con poco stock o agotados se marcan. Reabastece una fila o varias a la vez.",
      columns: [{ key: "id", label: "SKU", sort: "text", mono: true }, { key: "product", label: "Producto", sort: "text" }, { key: "stock", label: "Existencias", sort: "number", num: true }, { key: "wh", label: "Almacén" }, { key: "status", label: "Estado" }],
      rows: ["Lámpara de escritorio", "Brazo para monitor", "Hub USB-C", "Teclado", "Tapete de ratón", "Cámara web", "Diadema", "Kit de cables", "Tapete para silla", "Cuaderno"].map((p, i) => {
        const stock = [0, 4, 120, 18, 0, 64, 7, 230, 12, 88][i];
        return { id: `SKU-${300 + i}`, product: p, stock, wh: pick(["MEX-1", "MAD-2", "SFO-1"]), status: stock === 0 ? "Agotado" : stock < 20 ? "Bajo" : "En stock" };
      }),
      filters: ["En stock", "Bajo", "Agotado"], badges: { status: { "En stock": "success", Bajo: "warning", Agotado: "danger" } },
      bulk: [{ label: "Reabastecer", set: "status=En stock" }], rowAction: { label: "Reabastecer", set: "status=En stock", toast: "Orden de compra creada para {id}" }
    },
    issues: {
      eyebrow: "Tablas · issues.tsx", title: "Seguimiento de incidencias", desc: "Lista al estilo Linear: filtra por prioridad, ordena y cierra incidencias en lote.",
      columns: [{ key: "id", label: "ID", sort: "text", mono: true }, { key: "title", label: "Título", sort: "text" }, { key: "priority", label: "Prioridad" }, { key: "assignee", label: "Asignado a" }, { key: "state", label: "Estado" }],
      rows: ["Ranking de la paleta", "Foco del panel lateral", "Contraste de insignias", "Paginación de tablas", "Pegado de OTP", "Idioma del calendario", "Apilado de toasts", "Teclado en menús", "Destello en modo oscuro", "Relleno de rango en Firefox", "Búsqueda en docs", "Hidratación SSR"].map((t, i) => ({ id: `DEV-${120 + i}`, title: t, priority: pick(["Urgente", "Alta", "Media", "Baja"]), assignee: pick(people).split(" ")[0], state: pick(["Pendiente", "En curso", "Hecho"]) })),
      filterKey: "priority", filters: ["Urgente", "Alta", "Media", "Baja"], badges: { priority: { Urgente: "danger", Alta: "warning", Media: "info", Baja: "" }, state: { Pendiente: "", "En curso": "info", Hecho: "success" } },
      bulk: [{ label: "Cerrar", set: "state=Hecho" }, { label: "Iniciar", set: "state=En curso" }], pageSize: 8
    },
    "audit-log": {
      eyebrow: "Tablas · audit-log.tsx", title: "Registro de auditoría", desc: "Historial de seguridad filtrado por acción. Exporta lo que ves como CSV.",
      columns: [{ key: "time", label: "Hora", sort: "text", mono: true }, { key: "actor", label: "Actor", sort: "text" }, { key: "action", label: "Acción" }, { key: "target", label: "Objetivo" }, { key: "ip", label: "IP", mono: true }],
      rows: Array.from({ length: 16 }, (_, i) => ({ id: `evt_${9000 + i}`, time: `2026-10-${String(14 - Math.floor(i / 3)).padStart(2, "0")} ${String(9 + (i % 9)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`, actor: pick(people), action: pick(["login", "role.update", "key.create", "member.remove", "billing.update"]), target: pick(["espacio de trabajo", "API key", "miembro", "plan"]), ip: `189.203.${i}.${40 + i}` })),
      filterKey: "action", filters: ["login", "role.update", "key.create", "member.remove", "billing.update"], badges: { action: { login: "", "role.update": "warning", "key.create": "info", "member.remove": "danger", "billing.update": "accent" } },
      toolbar: '<button type="button" class="tsl-btn tsl-btn--sm" data-export>Exportar CSV</button>', pageSize: 8
    }
  };
  function ctxMoney(n) {
    return Math.round(n * 100) / 100;
  }
  // Las columnas de dinero se muestran con formato pero se ordenan numéricamente
  ["invoices", "orders"].forEach((k) => {
    const col = tables[k].columns.find((c) => c.key === (k === "invoices" ? "amount" : "total"));
    col.render = (row) => `<span data-value="${row[col.key]}">${X.fmt.money(row[col.key])}</span>`;
  });

  Object.entries(tables).forEach(([slug, cfg]) => {
    const t = X.table(cfg);
    X.add("tables", slug, t);
  });

  // Registro de auditoría: tabla + exportación CSV de las filas visibles
  X.add("tables", "audit-log", {
    html: X.table(tables["audit-log"]).html,
    setup(root, ctx) {
      TESELA_XP.tableSetup(root, ctx);
      ctx.on(ctx.$("[data-export]"), "click", () => {
        const visible = ctx.$$("tbody tr").filter((tr) => !tr.hidden);
        const csv = ["time,actor,action,target,ip"].concat(visible.map((tr) => Array.from(tr.querySelectorAll("[data-f]"), (td) => `"${td.textContent.trim()}"`).join(","))).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "audit-log.csv";
        a.click();
        ctx.toast({ title: `Se exportaron ${visible.length} eventos` });
      });
    }
  });

  // Logs: filtro de severidad + seguimiento en vivo que antepone filas nuevas
  X.add("tables", "logs", {
    html: X.table({
      eyebrow: "Tablas · logs.tsx", title: "Logs del servidor", desc: "Activa el seguimiento en vivo para recibir líneas nuevas; filtra por nivel y busca en el mensaje.",
      columns: [{ key: "time", label: "Hora", mono: true }, { key: "level", label: "Nivel" }, { key: "route", label: "Ruta", mono: true }, { key: "ms", label: "Latencia", num: true, sort: "number" }, { key: "msg", label: "Mensaje" }],
      rows: Array.from({ length: 10 }, (_, i) => ({ id: `log${i}`, time: `12:0${i}:1${i}`, level: pick(["INFO", "INFO", "WARN", "ERROR"]), route: pick(["GET /api/v2/session", "POST /v2/compile", "GET /health"]), ms: Math.round(5 + r() * 300), msg: pick(["correcto", "fallo de caché", "consulta lenta", "tiempo de espera agotado en origen"]) })),
      filterKey: "level", filters: ["INFO", "WARN", "ERROR"], badges: { level: { INFO: "info", WARN: "warning", ERROR: "danger" } },
      toolbar: '<label class="tsl-choice">Seguimiento en vivo <input type="checkbox" role="switch" class="tsl-switch" data-live /></label>'
    }).html,
    setup(root, ctx) {
      TESELA_XP.tableSetup(root, ctx);
      const tbody = ctx.$("tbody");
      const search = ctx.$("[data-t-search]");
      let n = 0;
      ctx.every(1200, () => {
        if (!ctx.$("[data-live]").checked) return;
        const level = Math.random() < 0.15 ? "ERROR" : Math.random() < 0.3 ? "WARN" : "INFO";
        const variant = { INFO: "info", WARN: "warning", ERROR: "danger" }[level];
        const ms = Math.round(5 + Math.random() * (level === "ERROR" ? 2000 : 300));
        const tr = document.createElement("tr");
        tr.dataset.id = `live${++n}`;
        tr.dataset.status = level;
        tr.innerHTML = `<td><input type="checkbox" class="tsl-check" data-t-row aria-label="Seleccionar" /></td><td data-f="time" style="font-family:var(--tsl-font-mono)">${new Date().toLocaleTimeString("es-MX")}</td><td data-f="level"><span class="tsl-badge tsl-badge--${variant}">${level}</span></td><td data-f="route" style="font-family:var(--tsl-font-mono)">${["GET /api/v2/session", "POST /v2/compile", "GET /health"][n % 3]}</td><td data-f="ms" class="is-num">${ms}</td><td data-f="msg">${level === "ERROR" ? "tiempo de espera agotado en origen" : level === "WARN" ? "consulta lenta" : "correcto"}</td>`;
        tbody.prepend(tr);
        if (tbody.rows.length > 60) tbody.lastElementChild.remove();
        search.dispatchEvent(new Event("input"));
      });
    }
  });

  // Transacciones: filtro por categoría + totales de las filas visibles
  X.add("tables", "transactions", {
    html: X.table({
      eyebrow: "Tablas · transactions.tsx", title: "Transacciones", desc: "Los totales de ingresos, gastos y neto se recalculan según lo que está visible.",
      columns: [{ key: "date", label: "Fecha", sort: "text", mono: true }, { key: "merchant", label: "Comercio", sort: "text" }, { key: "category", label: "Categoría" }, { key: "amount", label: "Monto", sort: "number", num: true, render: (row) => `<span data-value="${row.amount}" style="color:${row.amount < 0 ? "var(--tsl-fg)" : "var(--tsl-success)"}">${row.amount < 0 ? "−" : "+"}${X.fmt.money(Math.abs(row.amount))}</span>` }],
      rows: Array.from({ length: 14 }, (_, i) => {
        const cat = pick(["Software", "Viajes", "Nómina", "Ingresos", "Oficina"]);
        return { id: `tx${i}`, date: date(i), merchant: cat === "Ingresos" ? pick(companies) : pick(["Figma", "Delta", "Gusto", "AWS", "WeWork", "Notion"]), category: cat, amount: ctxMoney(cat === "Ingresos" ? 800 + r() * 5000 : -(20 + r() * 2400)) };
      }),
      filterKey: "category", filters: ["Software", "Viajes", "Nómina", "Ingresos", "Oficina"],
      toolbar: '<span class="tsl-badge tsl-badge--success" data-in></span><span class="tsl-badge" data-out></span><span class="tsl-badge tsl-badge--accent" data-net></span>'
    }).html,
    setup(root, ctx) {
      TESELA_XP.tableSetup(root, ctx);
      const totals = () => {
        let income = 0;
        let spend = 0;
        ctx.$$("tbody tr").forEach((tr) => {
          if (tr.hidden) return;
          const v = Number(tr.querySelector("[data-value]").dataset.value);
          if (v >= 0) income += v;
          else spend -= v;
        });
        ctx.$("[data-in]").textContent = `Entradas ${ctx.fmt.money(income)}`;
        ctx.$("[data-out]").textContent = `Salidas ${ctx.fmt.money(spend)}`;
        ctx.$("[data-net]").textContent = `Neto ${ctx.fmt.money(income - spend)}`;
      };
      ctx.on(root, "input", () => ctx.timeout(0, totals));
      ctx.on(root, "click", () => ctx.timeout(0, totals));
      totals();
    }
  });

  // ==========================================================================
  // FILTERS
  // ==========================================================================
  const tasks = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    title: ["Auditar tokens", "Corregir foco del menú", "Escribir docs", "Publicar OTP", "Idioma del calendario", "Exportación de tablas", "Página de precios", "Textos de onboarding", "Cola de toasts", "QA del modo oscuro", "Accesibilidad del panel", "Rendimiento de sparklines", "Prueba A/B del login", "Configurar SSO", "PDF de facturas", "Versión 1.1"][i],
    status: ["Pendiente", "En curso", "Hecho"][i % 3],
    assignee: ["Ana", "Leo", "Sara", "Tom"][i % 4],
    priority: ["Baja", "Media", "Alta", "Urgente"][(i * 7) % 4],
    points: [1, 2, 3, 5, 8][(i * 3) % 5]
  }));
  const tasksJSON = esc(JSON.stringify(tasks));

  X.addMany("filters", {
    toolbar: {
      html: `
        ${head("Filtros · toolbar.tsx", "Barra de filtros", "Busca, ordena, agrupa y cambia la vista. Cada control vuelve a renderizar la lista al instante.")}
        <div class="tsl-row xp-panel" style="padding:10px">
          <input class="tsl-input xp-search" data-q placeholder="Buscar tareas…" aria-label="Buscar tareas" />
          <label class="tsl-choice">Ordenar <select class="tsl-select" style="width:auto;height:30px" data-sort><option value="title">Título</option><option value="priority">Prioridad</option><option value="points">Puntos</option></select></label>
          <label class="tsl-choice">Agrupar <select class="tsl-select" style="width:auto;height:30px" data-group><option value="">Ninguno</option><option value="status">Estado</option><option value="assignee">Asignado a</option></select></label>
          <span class="tsl-spacer"></span>
          <tsl-segmented value="list" data-display><button class="tsl-segmented__item" value="list">Lista</button><button class="tsl-segmented__item" value="grid">Cuadrícula</button></tsl-segmented>
        </div>
        <div data-out data-tasks="${tasksJSON}"></div>`,
      setup(root, ctx) {
        const data = JSON.parse(ctx.$("[data-out]").dataset.tasks);
        const order = { Urgente: 0, Alta: 1, Media: 2, Baja: 3 };
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          const sortKey = ctx.$("[data-sort]").value;
          const groupKey = ctx.$("[data-group]").value;
          const grid = ctx.$("[data-display]").value === "grid";
          const rows = data
            .filter((t) => t.title.toLowerCase().includes(q))
            .sort((a, b) => (sortKey === "priority" ? order[a.priority] - order[b.priority] : sortKey === "points" ? b.points - a.points : a.title.localeCompare(b.title)));
          const groups = groupKey ? [...new Set(rows.map((t) => t[groupKey]))].map((g) => [g, rows.filter((t) => t[groupKey] === g)]) : [["", rows]];
          const item = (t) => (grid ? `<div class="tsl-card tsl-card--flat"><div class="tsl-card__body tsl-stack" style="--gap:6px"><strong>${t.title}</strong><div class="tsl-row" style="--gap:6px"><span class="tsl-badge">${t.status}</span><span class="tsl-badge tsl-badge--outline">${t.priority}</span><span class="tsl-muted">${t.points} pts · ${t.assignee}</span></div></div></div>` : `<li><span class="tsl-badge" style="width:84px;justify-content:center">${t.status}</span><span style="flex:1">${t.title}</span><span class="tsl-muted">${t.assignee}</span><span class="tsl-badge tsl-badge--outline">${t.priority}</span><span class="xp-mono tsl-muted">${t.points}</span></li>`);
          ctx.$("[data-out]").innerHTML = rows.length
            ? groups.map(([g, list]) => `${g ? `<div class="tsl-divider">${g} · ${list.length}</div>` : ""}${grid ? `<div class="tsl-grid" style="--min:200px">${list.map(item).join("")}</div>` : `<ul class="tsl-list">${list.map(item).join("")}</ul>`}`).join("")
            : '<div class="tsl-empty"><div class="tsl-empty__title">Ninguna tarea coincide</div></div>';
        };
        ["[data-q]", "[data-sort]", "[data-group]"].forEach((s) => ctx.on(ctx.$(s), "input", render));
        ctx.on(ctx.$("[data-display]"), "tsl-change", render);
        render();
      }
    },

    faceted: {
      html: `
        ${head("Filtros · faceted.tsx", "Popover con facetas", "Facetas de selección múltiple con conteos en vivo. Las facetas activas se muestran como una insignia en su botón.")}
        <div class="tsl-row" data-bar>
          ${["status", "assignee", "priority"].map((f) => `<tsl-menu data-facet="${f}"><button type="button" class="tsl-btn tsl-btn--sm" data-tsl-trigger>${{ status: "Estado", assignee: "Asignado a", priority: "Prioridad" }[f]} <span class="tsl-badge tsl-badge--accent" data-n hidden></span> ▾</button><div class="tsl-menu__list" data-opts></div></tsl-menu>`).join("")}
          <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-clear>Borrar todo</button><span class="tsl-spacer"></span><span class="tsl-muted" data-count></span>
        </div>
        <ul class="tsl-list" data-out data-tasks="${tasksJSON}"></ul>`,
      setup(root, ctx) {
        const data = JSON.parse(ctx.$("[data-out]").dataset.tasks);
        const sel = { status: new Set(), assignee: new Set(), priority: new Set() };
        const match = (t, skip) => Object.keys(sel).every((k) => k === skip || !sel[k].size || sel[k].has(String(t[k])));
        const render = () => {
          ctx.$$("[data-facet]").forEach((menu) => {
            const f = menu.dataset.facet;
            const values = [...new Set(data.map((t) => t[f]))];
            const opts = menu.querySelector("[data-opts]");
            opts.innerHTML = values.map((v) => `<label class="tsl-menu__item"><input type="checkbox" class="tsl-check" value="${v}"${sel[f].has(v) ? " checked" : ""} /> ${v}<span class="tsl-nav__meta">${data.filter((t) => t[f] === v && match(t, f)).length}</span></label>`).join("");
            const n = menu.querySelector("[data-n]");
            n.hidden = !sel[f].size;
            n.textContent = String(sel[f].size);
          });
          const rows = data.filter((t) => match(t));
          ctx.$("[data-count]").textContent = `${rows.length} de ${data.length}`;
          ctx.$("[data-out]").innerHTML = rows.map((t) => `<li><span style="flex:1">${t.title}</span><span class="tsl-badge">${t.status}</span><span class="tsl-muted">${t.assignee}</span><span class="tsl-badge tsl-badge--outline">${t.priority}</span></li>`).join("") || '<li class="tsl-muted">Sin resultados</li>';
        };
        ctx.on(ctx.$("[data-bar]"), "change", (e) => {
          const menu = e.target.closest("[data-facet]");
          if (!menu) return;
          const set = sel[menu.dataset.facet];
          e.target.checked ? set.add(e.target.value) : set.delete(e.target.value);
          render();
        });
        // mantiene el menú abierto mientras se marcan casillas
        ctx.$$(".tsl-menu__list").forEach((l) => ctx.on(l, "click", (e) => e.stopPropagation(), true));
        ctx.on(ctx.$("[data-clear]"), "click", () => {
          Object.values(sel).forEach((s) => s.clear());
          render();
        });
        render();
      }
    },

    chips: {
      html: `
        ${head("Filtros · chips.tsx", "Chips de filtros activos", "Crea filtros como campo · operador · valor. Los chips se pueden quitar y se combinan con AND.")}
        <form class="tsl-row xp-panel" style="padding:10px" data-builder>
          <select class="tsl-select" style="width:auto" name="field" aria-label="Campo"><option value="status">Estado</option><option value="assignee">Asignado a</option><option value="priority">Prioridad</option><option value="points">Puntos</option></select>
          <select class="tsl-select" style="width:auto" name="op" aria-label="Operador"><option value="is">es</option><option value="not">no es</option><option value="gt">mayor que</option></select>
          <input class="tsl-input" style="width:160px" name="value" placeholder="p. ej. Hecho, Ana, 3" aria-label="Valor" required />
          <button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--sm">Agregar filtro</button>
        </form>
        <div class="tsl-row" data-chips><span class="tsl-muted" data-none>Sin filtros: se muestra todo.</span></div>
        <ul class="tsl-list" data-out data-tasks="${tasksJSON}"></ul>`,
      setup(root, ctx) {
        const data = JSON.parse(ctx.$("[data-out]").dataset.tasks);
        const filters = [];
        const ops = { is: "es", not: "no es", gt: ">" };
        const fieldLabels = { status: "estado", assignee: "asignado a", priority: "prioridad", points: "puntos" };
        const test = (t, f) => {
          const v = String(t[f.field]).toLowerCase();
          const q = f.value.toLowerCase();
          if (f.op === "gt") return Number(t[f.field]) > Number(f.value);
          return f.op === "is" ? v === q : v !== q;
        };
        const render = () => {
          const chips = ctx.$("[data-chips]");
          chips.innerHTML = filters.length ? "" : '<span class="tsl-muted">Sin filtros: se muestra todo.</span>';
          filters.forEach((f, i) => {
            const chip = document.createElement("span");
            chip.className = "tsl-chip";
            chip.style.color = "var(--tsl-fg)";
            chip.innerHTML = `<span></span><button type="button" class="tsl-chip__remove" aria-label="Quitar filtro">✕</button>`;
            chip.firstChild.textContent = `${fieldLabels[f.field]} ${ops[f.op]} ${f.value}`;
            chip.lastChild.addEventListener("click", () => {
              filters.splice(i, 1);
              render();
            });
            chips.appendChild(chip);
          });
          const rows = data.filter((t) => filters.every((f) => test(t, f)));
          ctx.$("[data-out]").innerHTML = rows.map((t) => `<li><span style="flex:1">${t.title}</span><span class="tsl-badge">${t.status}</span><span class="tsl-muted">${t.assignee}</span><span class="tsl-badge tsl-badge--outline">${t.priority}</span><span class="xp-mono">${t.points}</span></li>`).join("") || '<li class="tsl-muted">Ninguna tarea cumple todos los filtros.</li>';
        };
        ctx.on(ctx.$("[data-builder]"), "submit", (e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.target));
          filters.push({ field: f.field, op: f.op, value: f.value.trim() });
          e.target.value.value = "";
          render();
        });
        filters.push({ field: "status", op: "not", value: "Hecho" });
        render();
      }
    },

    sidebar: {
      html: `
        ${head("Filtros · sidebar.tsx", "Barra lateral de filtros", "Los filtros de categoría, rango de precio, calificación y existencias acotan una cuadrícula de productos en vivo.")}
        <div class="xp-split" style="--cols:240px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" data-form>
            <span class="tsl-label">Categoría</span>
            ${["Audio", "Escritorio", "Iluminación", "Cables"].map((c) => `<label class="tsl-choice"><input type="checkbox" class="tsl-check" name="cat" value="${c}" checked /> ${c}</label>`).join("")}
            <span class="tsl-label" style="margin-top:8px">Precio máx. <strong class="xp-mono" id="sb-price-out">$300</strong></span>
            <input type="range" class="tsl-range" min="10" max="300" value="300" name="price" data-tsl-output="#sb-price-out" aria-label="Precio máximo" />
            <span class="tsl-label" style="margin-top:8px">Calificación mín.</span>
            <tsl-segmented value="0" name="rating" data-rating><button class="tsl-segmented__item" value="0">Cualquiera</button><button class="tsl-segmented__item" value="4">4★+</button><button class="tsl-segmented__item" value="4.5">4.5★+</button></tsl-segmented>
            <label class="tsl-choice" style="margin-top:8px;justify-content:space-between">Solo en stock <input type="checkbox" role="switch" class="tsl-switch" name="stock" /></label>
            <button type="button" class="tsl-btn tsl-btn--sm" data-reset>Restablecer filtros</button>
          </aside>
          <div class="xp-pane tsl-stack"><span class="tsl-muted" data-count></span><div class="tsl-grid" style="--min:170px" data-grid></div></div>
        </div>`,
      setup(root, ctx) {
        const products = [
          ["Audífonos de estudio", "Audio", 199, 4.7, true], ["Tapete de escritorio XL", "Escritorio", 39, 4.4, true], ["Lámpara de arco", "Iluminación", 129, 4.6, false], ["Cable USB-C 2 m", "Cables", 19, 4.1, true],
          ["Bocina Bluetooth", "Audio", 89, 4.3, true], ["Elevador de monitor", "Escritorio", 59, 4.8, true], ["Tira LED", "Iluminación", 29, 3.9, true], ["Cable HDMI 2.1", "Cables", 24, 4.5, false],
          ["Micrófono para podcast", "Audio", 249, 4.9, true], ["Organizador de cables", "Escritorio", 34, 4.2, true], ["Luz principal", "Iluminación", 179, 4.7, true], ["Thunderbolt 4", "Cables", 69, 4.6, true]
        ];
        const render = () => {
          const cats = ctx.$$('[name="cat"]:checked').map((c) => c.value);
          const max = Number(ctx.$('[name="price"]').value);
          const rating = Number(ctx.$("[data-rating]").value || 0);
          const stock = ctx.$('[name="stock"]').checked;
          const rows = products.filter(([, c, p, r, s]) => cats.includes(c) && p <= max && r >= rating && (!stock || s));
          ctx.$("[data-count]").textContent = `${rows.length} de ${products.length} productos`;
          ctx.$("[data-grid]").innerHTML = rows.map(([n, c, p, r, s]) => `<div class="tsl-card tsl-card--flat"><div class="tsl-card__body tsl-stack" style="--gap:6px"><span class="tsl-eyebrow">${c}</span><strong>${n}</strong><div class="tsl-row" style="--gap:6px"><span class="xp-mono">$${p}</span><span class="tsl-muted">★ ${r}</span>${s ? "" : '<span class="tsl-badge tsl-badge--warning">Agotado</span>'}</div></div></div>`).join("") || '<div class="tsl-empty"><div class="tsl-empty__title">Sin productos</div><p class="tsl-empty__desc">Afloja algún filtro.</p></div>';
        };
        ctx.on(ctx.$("[data-form]"), "input", render);
        ctx.on(ctx.$("[data-form]"), "change", render);
        ctx.on(ctx.$("[data-rating]"), "tsl-change", render);
        ctx.on(ctx.$("[data-reset]"), "click", () => {
          ctx.$$('[name="cat"]').forEach((c) => (c.checked = true));
          const range = ctx.$('[name="price"]');
          range.value = "300";
          range.dispatchEvent(new Event("input", { bubbles: true }));
          ctx.$("[data-rating]").value = "0";
          ctx.$('[name="stock"]').checked = false;
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // CHARTS
  // ==========================================================================
  X.addMany("charts", {
    "revenue-area": {
      html: `
        ${head("Gráficas · revenue-area.tsx", "Área de ingresos", "Área con degradado, tooltip con cruz, selector de rango y comparación opcional con el periodo anterior.")}
        <div class="tsl-row"><tsl-segmented value="12" data-range><button class="tsl-segmented__item" value="6">6 m</button><button class="tsl-segmented__item" value="12">12 m</button><button class="tsl-segmented__item" value="24">24 m</button></tsl-segmented><label class="tsl-choice">Comparar con el periodo anterior <input type="checkbox" role="switch" class="tsl-switch" data-compare checked /></label></div>
        <div class="xp-panel xp-rel">${tip}<svg class="xp-chart" viewBox="0 0 760 280" data-chart></svg></div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const r = TESELA_XP.rng(3);
        let v = 40000;
        const all = Array.from({ length: 48 }, () => (v = v * (1 + (r() - 0.35) * 0.09)));
        const svg = ctx.$("[data-chart]");
        const tipEl = ctx.$("[data-tip]");
        const box = { x: 56, y: 12, w: 690, h: 230 };
        let cur = [];
        let prev = [];
        let x;
        let y;
        const render = () => {
          const n = Number(ctx.$("[data-range]").value || 12);
          cur = all.slice(-n);
          prev = all.slice(-2 * n, -n);
          const cmp = ctx.$("[data-compare]").checked;
          const max = C.niceMax(Math.max(...cur, ...(cmp ? prev : [])));
          x = C.scale(0, n - 1, box.x, box.x + box.w);
          y = C.scale(0, max, box.y + box.h, box.y);
          const pts = cur.map((val, i) => [x(i), y(val)]);
          svg.innerHTML = `<defs><linearGradient id="xp-ra-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--xp-accent)" stop-opacity="0.4"/><stop offset="1" stop-color="var(--xp-accent)" stop-opacity="0"/></linearGradient></defs>
            ${C.grid(box, max, 4, (val) => `$${Math.round(val / 1000)}k`)}
            ${cmp ? `<path d="${C.path(prev.map((val, i) => [x(i), y(val)]))}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="4 4"/>` : ""}
            <path d="${C.path(pts)} L${x(n - 1)},${box.y + box.h} L${box.x},${box.y + box.h} Z" fill="url(#xp-ra-g)"/>
            <path d="${C.path(pts)}" fill="none" stroke="var(--xp-accent)" stroke-width="2.5"/>
            <line data-x y1="${box.y}" y2="${box.y + box.h}" stroke="currentColor" stroke-dasharray="3 3" opacity="0"/><circle data-d r="5" fill="var(--xp-accent)" stroke="var(--tsl-bg)" stroke-width="2" opacity="0"/>`;
        };
        ctx.on(svg, "pointermove", (e) => {
          const i = C.indexAt(svg, e, cur.length, box.x, box.x + box.w);
          const line = svg.querySelector("[data-x]");
          const dot = svg.querySelector("[data-d]");
          line.setAttribute("x1", x(i));
          line.setAttribute("x2", x(i));
          line.setAttribute("opacity", "0.5");
          dot.setAttribute("cx", x(i));
          dot.setAttribute("cy", y(cur[i]));
          dot.setAttribute("opacity", "1");
          const d = ((cur[i] - prev[i]) / prev[i]) * 100;
          const month = new Date(2026, 9 - (cur.length - 1 - i), 1).toLocaleDateString("es-MX", { month: "short", year: "numeric" });
          C.tip(tipEl, e, `<strong>${month}</strong><br>${ctx.fmt.money(cur[i], "USD", 0)} <span style="color:${d >= 0 ? "var(--tsl-success)" : "var(--tsl-danger)"}">${d >= 0 ? "+" : ""}${d.toFixed(1)}%</span>`);
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-range]"), "tsl-change", render);
        ctx.on(ctx.$("[data-compare]"), "change", render);
        render();
      }
    },

    "cohort-heatmap": {
      html: `
        ${head("Gráficas · cohort-heatmap.tsx", "Mapa de calor de cohortes", "Retención semanal por cohorte de registro. Alterna entre % y usuarios y pasa el cursor sobre cualquier celda.")}
        <div class="tsl-row"><tsl-segmented value="pct" data-metric><button class="tsl-segmented__item" value="pct">Retención %</button><button class="tsl-segmented__item" value="users">Usuarios</button></tsl-segmented></div>
        <div class="xp-panel xp-rel" style="overflow:auto">${tip}<table class="tsl-table tsl-table--compact" data-grid style="width:auto"></table></div>`,
      setup(root, ctx) {
        const r = TESELA_XP.rng(9);
        const cohorts = Array.from({ length: 8 }, (_, c) => {
          const size = Math.round(400 + r() * 600);
          let ret = 100;
          return { name: `Sem ${32 + c}`, size, weeks: Array.from({ length: 8 - c }, (_, w) => (w === 0 ? 100 : (ret = ret * (0.62 + r() * 0.3)))) };
        });
        const table = ctx.$("[data-grid]");
        const render = () => {
          const pct = (ctx.$("[data-metric]").value || "pct") === "pct";
          table.innerHTML = `<thead><tr><th>Cohorte</th><th class="is-num">Usuarios</th>${Array.from({ length: 8 }, (_, w) => `<th class="is-num">S${w}</th>`).join("")}</tr></thead><tbody>${cohorts
            .map((c, ci) => `<tr><td>${c.name}</td><td class="is-num">${c.size}</td>${Array.from({ length: 8 }, (_, w) => {
              const v = c.weeks[w];
              if (v === undefined) return "<td></td>";
              const users = Math.round((c.size * v) / 100);
              return `<td class="is-num" data-c="${ci}" data-w="${w}" style="background:color-mix(in srgb, var(--xp-accent) ${Math.round(v * 0.85)}%, transparent);color:${v > 55 ? "#fff" : "var(--tsl-fg)"}">${pct ? `${v.toFixed(0)}%` : users}</td>`;
            }).join("")}</tr>`)
            .join("")}</tbody>`;
        };
        const tipEl = ctx.$("[data-tip]");
        ctx.on(table, "pointermove", (e) => {
          const td = e.target.closest("[data-c]");
          if (!td) return (tipEl.hidden = true);
          const c = cohorts[td.dataset.c];
          const v = c.weeks[td.dataset.w];
          TESELA_XP.chart.tip(tipEl, e, `<strong>${c.name} · semana ${td.dataset.w}</strong><br>${Math.round((c.size * v) / 100)} de ${c.size} usuarios (${v.toFixed(1)}%)`);
        });
        ctx.on(table, "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-metric]"), "tsl-change", render);
        render();
      }
    },

    funnel: {
      html: `
        ${head("Gráficas · funnel.tsx", "Embudo", "Edita el conteo de cualquier etapa: las barras, la conversión por paso y la caída se recalculan. La mayor fuga se resalta.")}
        <div class="xp-panel tsl-stack" data-funnel></div>
        <div class="tsl-row"><span class="tsl-badge tsl-badge--accent" data-overall></span><span class="tsl-badge tsl-badge--danger" data-leak></span></div>`,
      setup(root, ctx) {
        const stages = [["Visitaron", 24000], ["Se registraron", 6200], ["Activaron", 3100], ["Se suscribieron", 840], ["Retenidos a 90 d", 610]];
        const wrap = ctx.$("[data-funnel]");
        wrap.innerHTML = stages
          .map(([name, v], i) => `<div class="tsl-row" style="flex-wrap:nowrap;--gap:12px"><span style="width:110px">${name}</span><input class="tsl-input xp-mono" type="number" min="0" value="${v}" data-i="${i}" style="width:100px" aria-label="${name}" /><div style="flex:1;height:30px;background:var(--tsl-surface-strong);border-radius:6px;overflow:hidden"><div data-bar style="height:100%;background:var(--xp-accent);border-radius:6px;transition:width .3s"></div></div><span class="xp-mono tsl-muted" style="width:120px;text-align:right" data-conv></span></div>`)
          .join("");
        const render = () => {
          const vals = ctx.$$("[data-i]").map((i) => Math.max(0, Number(i.value) || 0));
          let worst = { drop: -1, i: 0 };
          ctx.$$("[data-bar]").forEach((bar, i) => {
            bar.style.width = `${vals[0] ? (vals[i] / vals[0]) * 100 : 0}%`;
            const conv = i === 0 ? 100 : vals[i - 1] ? (vals[i] / vals[i - 1]) * 100 : 0;
            if (i > 0 && 100 - conv > worst.drop) worst = { drop: 100 - conv, i };
            ctx.$$("[data-conv]")[i].textContent = i === 0 ? "100%" : `${conv.toFixed(1)}% (−${(100 - conv).toFixed(0)}%)`;
          });
          ctx.$$("[data-bar]").forEach((bar, i) => (bar.style.background = i === worst.i ? "var(--tsl-danger)" : "var(--xp-accent)"));
          ctx.$("[data-overall]").textContent = `Conversión global ${vals[0] ? ((vals[vals.length - 1] / vals[0]) * 100).toFixed(2) : 0}%`;
          ctx.$("[data-leak]").textContent = `Mayor fuga: ${stages[worst.i][0]} (−${worst.drop.toFixed(0)}%)`;
        };
        ctx.on(wrap, "input", render);
        render();
      }
    },

    gauges: {
      html: `
        ${head("Gráficas · gauges.tsx", "Indicadores radiales", "Arrastra los controles deslizantes (o presiona Animar): los arcos, los colores y los umbrales se actualizan.")}
        <div class="tsl-grid" style="--min:200px" data-gauges></div>
        <div class="tsl-row"><button type="button" class="tsl-btn" data-anim aria-pressed="false">▶ Animar carga</button></div>`,
      setup(root, ctx) {
        const defs = [["CPU", 42, "%"], ["Memoria", 68, "%"], ["Apdex", 91, ""]];
        const wrap = ctx.$("[data-gauges]");
        wrap.innerHTML = defs.map(([n, v, u], i) => `<div class="xp-panel tsl-stack" style="align-items:center"><svg viewBox="0 0 120 70" style="width:180px"><path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="var(--tsl-surface-strong)" stroke-width="10" stroke-linecap="round"/><path data-arc d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke-width="10" stroke-linecap="round" pathLength="100"/><text x="60" y="56" text-anchor="middle" font-size="18" font-weight="600" fill="currentColor" data-val></text></svg><span class="tsl-eyebrow">${n}</span><input type="range" class="tsl-range" min="0" max="100" value="${v}" data-g="${i}" aria-label="${n}" /></div>`).join("");
        const render = () => {
          ctx.$$("[data-g]").forEach((input, i) => {
            const v = Number(input.value);
            const apdex = i === 2;
            const bad = apdex ? v < 70 : v > 85;
            const warn = apdex ? v < 85 : v > 65;
            const color = bad ? "var(--tsl-danger)" : warn ? "var(--tsl-warning)" : "var(--tsl-success)";
            const card = input.closest(".xp-panel");
            const arc = card.querySelector("[data-arc]");
            arc.setAttribute("stroke", color);
            arc.setAttribute("stroke-dasharray", `${v} 100`);
            card.querySelector("[data-val]").textContent = apdex ? (v / 100).toFixed(2) : `${v}${defs[i][2]}`;
          });
        };
        ctx.on(wrap, "input", render);
        let anim = false;
        const btn = ctx.$("[data-anim]");
        ctx.on(btn, "click", () => {
          anim = !anim;
          btn.setAttribute("aria-pressed", String(anim));
          btn.textContent = anim ? "❚❚ Detener" : "▶ Animar carga";
        });
        ctx.every(300, () => {
          if (!anim) return;
          ctx.$$("[data-g]").forEach((input) => {
            input.value = String(Math.max(0, Math.min(100, Number(input.value) + Math.round((Math.random() - 0.5) * 18))));
            TeselaUI.init(root);
          });
          render();
        });
        render();
      }
    },

    "bar-grouped": {
      html: `
        ${head("Gráficas · bar-grouped.tsx", "Barras agrupadas", "Comparación trimestral de tres productos. Activa o desactiva series para reescalar; pasa el cursor para ver los valores.")}
        <div class="tsl-row" data-legend></div>
        <div class="xp-panel xp-rel">${tip}<svg class="xp-chart" viewBox="0 0 760 260" data-chart></svg></div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const series = [["Núcleo", "var(--xp-accent)", [120, 150, 170, 210]], ["Nube", "var(--tsl-info)", [80, 110, 160, 190]], ["Soporte", "var(--tsl-warning)", [40, 42, 55, 61]]];
        const on = series.map(() => true);
        const q = ["T1", "T2", "T3", "T4"];
        ctx.$("[data-legend]").innerHTML = series.map(([n, c], i) => `<button type="button" class="tsl-chip" aria-pressed="true" data-s="${i}"><span class="tsl-dot" style="--_c:${c}"></span> ${n}</button>`).join("");
        const svg = ctx.$("[data-chart]");
        const box = { x: 46, y: 10, w: 700, h: 210 };
        const render = () => {
          const active = series.filter((_, i) => on[i]);
          const max = C.niceMax(Math.max(1, ...active.flatMap((s) => s[2])));
          const gw = box.w / 4;
          const bw = active.length ? (gw - 30) / active.length : 0;
          let out = C.grid(box, max, 4, (v) => `$${v}k`);
          q.forEach((label, qi) => {
            active.forEach(([n, c, vals], si) => {
              const h = (vals[qi] / max) * box.h;
              out += `<rect x="${box.x + qi * gw + 15 + si * bw}" y="${box.y + box.h - h}" width="${bw - 4}" height="${h}" rx="3" fill="${c}" data-tip-text="${n} ${label}: $${vals[qi]}k"/>`;
            });
            out += `<text x="${box.x + qi * gw + gw / 2}" y="${box.y + box.h + 18}" text-anchor="middle">${label}</text>`;
          });
          svg.innerHTML = out;
        };
        ctx.on(ctx.$("[data-legend]"), "click", (e) => {
          const b = e.target.closest("[data-s]");
          if (!b) return;
          on[b.dataset.s] = !on[b.dataset.s];
          b.setAttribute("aria-pressed", String(on[b.dataset.s]));
          render();
        });
        const tipEl = ctx.$("[data-tip]");
        ctx.on(svg, "pointermove", (e) => {
          const rect = e.target.closest("[data-tip-text]");
          if (!rect) return (tipEl.hidden = true);
          C.tip(tipEl, e, esc(rect.dataset.tipText));
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        render();
      }
    },

    "line-multi": {
      html: `
        ${head("Gráficas · line-multi.tsx", "Líneas de varias series", "Latencia p50 / p95 / p99 con lectura compartida al pasar el cursor. Activa el modo en vivo para recibir un punto nuevo cada segundo.")}
        <div class="tsl-row"><div class="tsl-row" data-legend></div><span class="tsl-spacer"></span><label class="tsl-choice">En vivo <input type="checkbox" role="switch" class="tsl-switch" data-live /></label></div>
        <div class="xp-panel xp-rel">${tip}<svg class="xp-chart" viewBox="0 0 760 260" data-chart></svg></div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const keys = [["p50", "var(--tsl-success)", 40], ["p95", "var(--tsl-warning)", 120], ["p99", "var(--tsl-danger)", 260]];
        const on = { p50: true, p95: true, p99: true };
        const data = { p50: [], p95: [], p99: [] };
        const push = () => keys.forEach(([k, , base]) => (data[k] = data[k].concat(base * (0.8 + Math.random() * 0.5)).slice(-30)));
        for (let i = 0; i < 30; i++) push();
        ctx.$("[data-legend]").innerHTML = keys.map(([k, c]) => `<button type="button" class="tsl-chip" aria-pressed="true" data-k="${k}"><span class="tsl-dot" style="--_c:${c}"></span> ${k}</button>`).join("");
        const svg = ctx.$("[data-chart]");
        const tipEl = ctx.$("[data-tip]");
        const box = { x: 50, y: 10, w: 696, h: 220 };
        let x;
        let y;
        const render = () => {
          const max = C.niceMax(Math.max(...keys.filter(([k]) => on[k]).flatMap(([k]) => data[k]), 1));
          x = C.scale(0, 29, box.x, box.x + box.w);
          y = C.scale(0, max, box.y + box.h, box.y);
          svg.innerHTML = C.grid(box, max, 4, (v) => `${Math.round(v)}ms`) + keys.filter(([k]) => on[k]).map(([k, c]) => `<path d="${C.path(data[k].map((v, i) => [x(i), y(v)]))}" fill="none" stroke="${c}" stroke-width="2"/>`).join("") + `<line data-x y1="${box.y}" y2="${box.y + box.h}" stroke="currentColor" stroke-dasharray="3 3" opacity="0"/>`;
        };
        ctx.on(svg, "pointermove", (e) => {
          const i = C.indexAt(svg, e, 30, box.x, box.x + box.w);
          const line = svg.querySelector("[data-x]");
          line.setAttribute("x1", x(i));
          line.setAttribute("x2", x(i));
          line.setAttribute("opacity", "0.5");
          C.tip(tipEl, e, keys.filter(([k]) => on[k]).map(([k, c]) => `<span style="color:${c}">●</span> ${k} ${data[k][i].toFixed(0)}ms`).join("<br>"));
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-legend]"), "click", (e) => {
          const b = e.target.closest("[data-k]");
          if (!b) return;
          on[b.dataset.k] = !on[b.dataset.k];
          b.setAttribute("aria-pressed", String(on[b.dataset.k]));
          render();
        });
        ctx.every(1000, () => {
          if (!ctx.$("[data-live]").checked) return;
          push();
          render();
        });
        render();
      }
    },

    donut: {
      html: `
        ${head("Gráficas · donut.tsx", "Desglose en dona", "Asignación del presupuesto. Pasa el cursor sobre un segmento o una fila de la leyenda; activa o desactiva categorías para renormalizar.")}
        <div class="tsl-row xp-panel" style="--gap:28px;align-items:center">
          <svg viewBox="0 0 200 200" style="width:220px" data-donut></svg>
          <ul class="tsl-list" style="flex:1;min-width:220px" data-legend></ul>
        </div>`,
      setup(root, ctx) {
        const items = [["Ingeniería", 420, "var(--xp-accent)"], ["Marketing", 180, "var(--tsl-info)"], ["Ventas", 150, "var(--tsl-warning)"], ["Administración", 90, "var(--tsl-success)"], ["I+D", 120, "var(--tsl-danger)"]];
        const on = items.map(() => true);
        let hover = -1;
        const svg = ctx.$("[data-donut]");
        const legend = ctx.$("[data-legend]");
        const render = () => {
          const total = items.reduce((s, it, i) => s + (on[i] ? it[1] : 0), 0);
          let acc = 0;
          const R = 80;
          const circ = 2 * Math.PI * R;
          svg.innerHTML =
            `<circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--tsl-surface-strong)" stroke-width="26"/>` +
            items
              .map(([n, v, c], i) => {
                if (!on[i] || !total) return "";
                const len = (v / total) * circ;
                const seg = `<circle data-i="${i}" cx="100" cy="100" r="${R}" fill="none" stroke="${c}" stroke-width="${hover === i ? 34 : 26}" stroke-dasharray="${len - 2} ${circ - len + 2}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)" style="cursor:pointer;transition:stroke-width .15s"/>`;
                acc += len;
                return seg;
              })
              .join("") +
            `<text x="100" y="96" text-anchor="middle" font-size="12" fill="var(--tsl-fg-muted)">${hover >= 0 ? items[hover][0] : "Total"}</text><text x="100" y="118" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor">$${hover >= 0 ? items[hover][1] : total}k</text>`;
          legend.innerHTML = items.map(([n, v, c], i) => `<li data-i="${i}" style="opacity:${on[i] ? 1 : 0.4};cursor:pointer${hover === i ? ";background:var(--tsl-surface-strong)" : ""}"><span class="tsl-dot" style="--_c:${c}"></span><span style="flex:1">${n}</span><span class="xp-mono">$${v}k</span><span class="tsl-muted xp-mono" style="width:48px;text-align:right">${on[i] && total ? ((v / total) * 100).toFixed(0) + "%" : "—"}</span></li>`).join("");
        };
        const onHover = (e) => {
          const el = e.target.closest("[data-i]");
          const i = el ? Number(el.dataset.i) : -1;
          if (i !== hover) {
            hover = i;
            render();
          }
        };
        ctx.on(svg, "pointermove", onHover);
        ctx.on(legend, "pointermove", onHover);
        ctx.on(svg, "pointerleave", () => ((hover = -1), render()));
        ctx.on(legend, "pointerleave", () => ((hover = -1), render()));
        ctx.on(legend, "click", (e) => {
          const li = e.target.closest("[data-i]");
          if (!li) return;
          on[li.dataset.i] = !on[li.dataset.i];
          render();
        });
        render();
      }
    },

    scatter: {
      html: `
        ${head("Gráficas · scatter.tsx", "Diagrama de dispersión", "Cuentas por uso frente a ingresos con una línea de tendencia ajustada. Filtra un cuadrante; pasa el cursor sobre los puntos para ver el detalle.")}
        <div class="tsl-row"><tsl-segmented value="all" data-q><button class="tsl-segmented__item" value="all">Todas</button><button class="tsl-segmented__item" value="tr">Campeonas</button><button class="tsl-segmented__item" value="br">Venta adicional</button><button class="tsl-segmented__item" value="tl">En riesgo</button></tsl-segmented><span class="tsl-badge" data-r></span></div>
        <div class="xp-panel xp-rel">${tip}<svg class="xp-chart" viewBox="0 0 760 320" data-chart></svg></div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const r = TESELA_XP.rng(21);
        const pts = Array.from({ length: 70 }, (_, i) => {
          const u = r() * 100;
          return { name: `Cuenta ${i + 1}`, u, rev: Math.max(2, u * 0.9 + (r() - 0.5) * 50) };
        });
        const svg = ctx.$("[data-chart]");
        const box = { x: 50, y: 10, w: 690, h: 270 };
        const x = C.scale(0, 100, box.x, box.x + box.w);
        const y = C.scale(0, 120, box.y + box.h, box.y);
        const n = pts.length;
        const mx = pts.reduce((s, p) => s + p.u, 0) / n;
        const my = pts.reduce((s, p) => s + p.rev, 0) / n;
        const slope = pts.reduce((s, p) => s + (p.u - mx) * (p.rev - my), 0) / pts.reduce((s, p) => s + (p.u - mx) ** 2, 0);
        const corr = pts.reduce((s, p) => s + (p.u - mx) * (p.rev - my), 0) / Math.sqrt(pts.reduce((s, p) => s + (p.u - mx) ** 2, 0) * pts.reduce((s, p) => s + (p.rev - my) ** 2, 0));
        ctx.$("[data-r]").textContent = `r = ${corr.toFixed(2)}`;
        const quad = (p) => (p.u >= 50 ? (p.rev >= 60 ? "tr" : "br") : p.rev >= 60 ? "tl" : "bl");
        const render = () => {
          const q = ctx.$("[data-q]").value || "all";
          svg.innerHTML =
            C.grid(box, 120, 4, (v) => `$${v}k`) +
            `<line x1="${x(50)}" x2="${x(50)}" y1="${box.y}" y2="${box.y + box.h}" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4 4"/><line x1="${box.x}" x2="${box.x + box.w}" y1="${y(60)}" y2="${y(60)}" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4 4"/>` +
            `<line x1="${x(0)}" y1="${y(my - slope * mx)}" x2="${x(100)}" y2="${y(my + slope * (100 - mx))}" stroke="var(--tsl-warning)" stroke-width="1.5"/>` +
            pts.map((p, i) => `<circle data-i="${i}" cx="${x(p.u)}" cy="${y(p.rev)}" r="5" fill="var(--xp-accent)" opacity="${q === "all" || quad(p) === q ? 0.85 : 0.12}"/>`).join("") +
            `<text x="${box.x + box.w}" y="${box.y + box.h + 18}" text-anchor="end">uso →</text>`;
        };
        const tipEl = ctx.$("[data-tip]");
        ctx.on(svg, "pointermove", (e) => {
          const c = e.target.closest("[data-i]");
          if (!c) return (tipEl.hidden = true);
          const p = pts[c.dataset.i];
          C.tip(tipEl, e, `<strong>${p.name}</strong><br>uso ${p.u.toFixed(0)} · $${p.rev.toFixed(1)}k`);
        });
        ctx.on(svg, "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-q]"), "tsl-change", render);
        render();
      }
    },

    waterfall: {
      html: `
        ${head("Gráficas · waterfall.tsx", "Cascada", "Puente de efectivo del saldo inicial al final. Edita, agrega o quita pasos y el puente se recalcula.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel tsl-stack" style="--gap:8px"><div data-steps class="tsl-stack" style="--gap:6px"></div><button type="button" class="tsl-btn tsl-btn--sm" data-add>+ Agregar paso</button></div>
          <div class="xp-panel"><svg class="xp-chart" viewBox="0 0 520 300" data-chart></svg></div>
        </div>`,
      setup(root, ctx) {
        const C = TESELA_XP.chart;
        const steps = [["Inicial", 120], ["Ingresos", 85], ["Nómina", -62], ["Nube", -18], ["Marketing", -24], ["Financiamiento", 40]];
        const wrap = ctx.$("[data-steps]");
        const renderInputs = () => {
          wrap.innerHTML = "";
          steps.forEach(([n, v], i) => {
            const row = document.createElement("div");
            row.className = "tsl-row";
            row.style.flexWrap = "nowrap";
            row.innerHTML = `<input class="tsl-input" style="flex:1" aria-label="Nombre del paso" /><input class="tsl-input xp-mono" type="number" style="width:90px" aria-label="Monto" /><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--subtle tsl-btn--sm" aria-label="Quitar"${i === 0 ? " disabled" : ""}>✕</button>`;
            const [name, amt] = row.querySelectorAll("input");
            name.value = n;
            amt.value = v;
            name.addEventListener("input", () => ((steps[i][0] = name.value), renderChart()));
            amt.addEventListener("input", () => ((steps[i][1] = Number(amt.value) || 0), renderChart()));
            row.querySelector("button").addEventListener("click", () => (steps.splice(i, 1), renderInputs(), renderChart()));
            wrap.appendChild(row);
          });
        };
        const renderChart = () => {
          const bars = [];
          let run = 0;
          steps.forEach(([n, v], i) => {
            const start = i === 0 ? 0 : run;
            run = i === 0 ? v : run + v;
            bars.push({ n, from: start, to: run, total: i === 0 });
          });
          bars.push({ n: "Final", from: 0, to: run, total: true });
          const max = C.niceMax(Math.max(...bars.map((b) => Math.max(b.from, b.to)), 1));
          const min = Math.min(0, ...bars.map((b) => Math.min(b.from, b.to)));
          const box = { x: 40, y: 10, w: 470, h: 250 };
          const y = C.scale(min, max, box.y + box.h, box.y);
          const bw = box.w / bars.length;
          svg.innerHTML =
            C.grid(box, max, 4, (v) => `${Math.round(v)}`) +
            bars
              .map((b, i) => {
                const top = y(Math.max(b.from, b.to));
                const h = Math.max(1, Math.abs(y(b.from) - y(b.to)));
                const color = b.total ? "var(--tsl-fg-muted)" : b.to >= b.from ? "var(--tsl-success)" : "var(--tsl-danger)";
                const label = b.total ? b.to : (b.to - b.from >= 0 ? "+" : "") + (b.to - b.from);
                return `<rect x="${box.x + i * bw + 6}" y="${top}" width="${bw - 12}" height="${h}" rx="3" fill="${color}"/><text x="${box.x + i * bw + bw / 2}" y="${top - 5}" text-anchor="middle">${label}</text><text x="${box.x + i * bw + bw / 2}" y="${box.y + box.h + 16}" text-anchor="middle">${esc(b.n).slice(0, 9)}</text>`;
              })
              .join("");
        };
        const svg = ctx.$("[data-chart]");
        const esc = TESELA_XP.esc;
        ctx.on(ctx.$("[data-add]"), "click", () => {
          steps.push([`Paso ${steps.length}`, 10]);
          renderInputs();
          renderChart();
        });
        renderInputs();
        renderChart();
      }
    }
  });
})();
