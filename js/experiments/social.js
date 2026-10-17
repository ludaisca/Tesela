// ============================================================================
// Experimentos funcionales — Líneas de tiempo (12), Calendarios (9), Perfil (10),
// Hilos y comentarios (6), Tours y coachmarks (6)
// ============================================================================

(function () {
  "use strict";
  const X = window.TESELA_XP;
  const { head, esc } = X;

  const ago = (ms) => {
    const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
    if (s < 10) return "ahora";
    if (s < 60) return `hace ${s}s`;
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    return `hace ${Math.floor(s / 86400)} d`;
  };
  X.ago = ago;

  // ==========================================================================
  // LÍNEAS DE TIEMPO
  // ==========================================================================
  X.addMany("timelines", {
    audit: {
      html: `
        ${head("Líneas de tiempo · audit.tsx", "Registro de auditoría", "Filtra por autor y tipo de evento, expande cualquier evento para ver su diff antes/después y carga historial anterior.")}
        <div class="tsl-row"><select class="tsl-select" style="width:auto" data-actor aria-label="Actor"><option value="">Todos los actores</option><option>Ana</option><option>Leo</option><option>Sara</option><option>system</option></select><div class="tsl-row" style="--gap:6px" data-types></div></div>
        <ol class="tsl-timeline" data-list></ol>
        <button type="button" class="tsl-btn tsl-btn--sm" data-more style="align-self:flex-start">Cargar anteriores</button>`,
      setup(root, ctx) {
        const types = { "role.update": "warning", "key.create": "info", "member.remove": "danger", "settings.update": "accent" };
        const actors = ["Ana", "Leo", "Sara", "system"];
        let events = [];
        let t = Date.now();
        const more = (n) => {
          for (let i = 0; i < n; i++) {
            const type = Object.keys(types)[(events.length * 7) % 4];
            t -= (15 + ((events.length * 13) % 50)) * 60000;
            events.push({ type, actor: actors[(events.length * 3) % 4], at: t, target: ["Leo Kim", "Clave de deploy de CI", "Tom Weber", "Nombre del espacio"][(events.length * 5) % 4], before: { role: "Miembro", name: "Acme" }, after: { role: "Admin", name: "Acme S.A." } });
          }
        };
        const on = new Set(Object.keys(types));
        ctx.$("[data-types]").innerHTML = Object.keys(types).map((k) => `<button type="button" class="tsl-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const render = () => {
          const actor = ctx.$("[data-actor]").value;
          ctx.$("[data-list]").innerHTML = events
            .filter((e) => on.has(e.type) && (!actor || e.actor === actor))
            .map((e) => `<li style="--c:var(--tsl-${types[e.type] === "accent" ? "accent" : types[e.type]})"><details><summary style="cursor:pointer;list-style:none"><strong>${e.actor}</strong> <span class="tsl-badge tsl-badge--${types[e.type]}">${e.type}</span> ${esc(e.target)} <span class="tsl-timeline__meta">· ${ago(e.at)}</span></summary><pre class="tsl-code" style="margin-top:6px;font-size:11px"><span class="xp-diff-del">- ${esc(JSON.stringify(e.before))}</span>\n<span class="xp-diff-add">+ ${esc(JSON.stringify(e.after))}</span></pre></details></li>`)
            .join("") || '<li class="tsl-muted">Ningún evento coincide.</li>';
        };
        ctx.on(ctx.$("[data-types]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          on.has(b.dataset.t) ? on.delete(b.dataset.t) : on.add(b.dataset.t);
          b.setAttribute("aria-pressed", String(on.has(b.dataset.t)));
          render();
        });
        ctx.on(ctx.$("[data-actor]"), "change", render);
        ctx.on(ctx.$("[data-more]"), "click", () => (more(6), render()));
        more(8);
        render();
      }
    },

    notifications: {
      html: `
        ${head("Líneas de tiempo · notifications.tsx", "Panel de notificaciones", "Pestañas de todas / no leídas / menciones; marca como leídas una por una o todas a la vez. Llega una notificación nueva cada pocos segundos.")}
        <div class="tsl-card" style="max-width:520px;width:100%;margin:0 auto">
          <div class="tsl-card__header tsl-row"><strong>Notificaciones</strong><span class="tsl-badge tsl-badge--danger" data-badge></span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-all>Marcar todas como leídas</button></div>
          <div class="tsl-card__body"><tsl-segmented value="all" data-tab><button class="tsl-segmented__item" value="all">Todas</button><button class="tsl-segmented__item" value="unread">No leídas</button><button class="tsl-segmented__item" value="mention">Menciones</button></tsl-segmented><ul class="tsl-list" style="margin-top:12px;max-height:340px;overflow:auto" data-list></ul></div>
        </div>`,
      setup(root, ctx) {
        const seed = [["Ana", "te mencionó en “Tokens v2”", true], ["GitHub", "El PR #482 fue aprobado", false], ["Leo", "te asignó DEV-124", false], ["Sara", "te mencionó en el roadmap del T3", true]];
        let items = seed.map(([who, what, mention], i) => ({ id: i, who, what, mention, read: i > 1, at: Date.now() - (i + 1) * 900000 }));
        let id = items.length;
        const render = () => {
          const tab = ctx.$("[data-tab]").value || "all";
          const list = items.filter((n) => tab === "all" || (tab === "unread" ? !n.read : n.mention));
          ctx.$("[data-list]").innerHTML = list.map((n) => `<li data-id="${n.id}" class="${n.read ? "" : "xp-unread"}" style="cursor:pointer"><span class="tsl-avatar tsl-avatar--sm">${n.who[0]}</span><div style="flex:1"><div><strong>${esc(n.who)}</strong> ${esc(n.what)}</div><div class="tsl-list__desc">${ago(n.at)}</div></div>${n.read ? "" : '<span class="tsl-dot tsl-dot--accent"></span>'}</li>`).join("") || '<li class="tsl-muted">Aquí no hay nada.</li>';
          const unread = items.filter((n) => !n.read).length;
          ctx.$("[data-badge]").hidden = !unread;
          ctx.$("[data-badge]").textContent = String(unread);
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const li = e.target.closest("[data-id]");
          if (!li) return;
          const n = items.find((x) => x.id === Number(li.dataset.id));
          n.read = !n.read;
          render();
        });
        ctx.on(ctx.$("[data-all]"), "click", () => (items.forEach((n) => (n.read = true)), render()));
        ctx.on(ctx.$("[data-tab]"), "tsl-change", render);
        const pool = [["Tom", "comentó en DEV-120", false], ["Mia", "te mencionó en las notas del standup", true], ["Vercel", "Deploy listo", false]];
        ctx.every(6000, () => {
          const [who, what, mention] = pool[id % pool.length];
          items.unshift({ id: id++, who, what, mention, read: false, at: Date.now() });
          render();
        });
        ctx.every(10000, render);
        render();
      }
    },

    changelog: {
      html: `
        ${head("Líneas de tiempo · changelog.tsx", "Changelog", "Filtra versiones por tipo de cambio, busca entradas y suscríbete a las novedades.")}
        <div class="tsl-row"><input class="tsl-input xp-search" data-q placeholder="Buscar cambios…" aria-label="Buscar" /><div class="tsl-row" style="--gap:6px" data-types></div><span class="tsl-spacer"></span><form class="tsl-input-group" data-sub style="max-width:280px"><input class="tsl-input" type="email" required placeholder="Correo para novedades" aria-label="Correo electrónico" /><button type="submit" class="tsl-btn tsl-btn--sm" style="margin:3px">Suscribirse</button></form></div>
        <ol class="tsl-timeline" data-list></ol>`,
      setup(root, ctx) {
        const releases = [
          ["1.3.0", "2026-10-14", [["feature", "Galería funcional: cada experimento es un componente real"], ["fix", "El punto final del sparkline ya no se deforma"], ["improvement", "La paleta de comandos ordena por relevancia"]]],
          ["1.2.0", "2026-10-02", [["feature", "Input de OTP con soporte para pegar"], ["feature", "Componente de calendario con soporte de idioma"], ["fix", "Los elementos tsl-* respetan el atributo hidden"]]],
          ["1.1.0", "2026-09-20", [["improvement", "Soporte de movimiento reducido en todas partes"], ["fix", "Favoritos identificados por ruta completa"]]],
          ["1.0.0", "2026-09-01", [["feature", "Lanzamiento inicial de tesela-ui"]]]
        ];
        const colors = { feature: "success", fix: "danger", improvement: "info" };
        const on = new Set(Object.keys(colors));
        ctx.$("[data-types]").innerHTML = Object.keys(colors).map((k) => `<button type="button" class="tsl-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = releases
            .map(([v, d, changes]) => {
              const rows = changes.filter(([t, text]) => on.has(t) && text.toLowerCase().includes(q));
              return rows.length ? `<li style="--c:var(--xp-accent)"><div class="tsl-row"><strong class="xp-mono">v${v}</strong><span class="tsl-timeline__meta">${d}</span></div><ul class="tsl-stack" style="--gap:4px;list-style:none;padding:0;margin:8px 0 0">${rows.map(([t, text]) => `<li class="tsl-row" style="--gap:8px;flex-wrap:nowrap"><span class="tsl-badge tsl-badge--${colors[t]}" style="min-width:90px;justify-content:center">${t}</span>${esc(text)}</li>`).join("")}</ul></li>` : "";
            })
            .join("") || '<li class="tsl-muted">Ningún cambio coincide.</li>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-types]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          on.has(b.dataset.t) ? on.delete(b.dataset.t) : on.add(b.dataset.t);
          b.setAttribute("aria-pressed", String(on.has(b.dataset.t)));
          render();
        });
        ctx.on(ctx.$("[data-sub]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "Suscripción a las notas de versión confirmada" });
          e.target.reset();
        });
        render();
      }
    },

    commits: {
      html: `
        ${head("Líneas de tiempo · commits.tsx", "Historial de commits", "Cambia de rama, copia SHAs y expande un commit para ver los archivos que tocó.")}
        <div class="tsl-row"><tsl-menu data-branch><button type="button" class="tsl-btn tsl-btn--sm" data-tsl-trigger>⎇ <span data-b>main</span> ▾</button><div class="tsl-menu__list"><button type="button" class="tsl-menu__item" data-value="main">main</button><button type="button" class="tsl-menu__item" data-value="feat/gallery">feat/gallery</button><button type="button" class="tsl-menu__item" data-value="fix/sparkline">fix/sparkline</button></div></tsl-menu><span class="tsl-muted" data-count></span></div>
        <div data-list class="tsl-stack"></div>`,
      setup(root, ctx) {
        const msgs = ["feat: runtime de experimentos funcionales", "fix: alfa premultiplicado en el shader ambiental", "chore: actualizar docs", "feat(ui): navegación por teclado en tsl-calendar", "refactor: compartir el resaltador", "test: smoke de todos los experimentos", "fix: relación de aspecto del sparkline", "docs: uso en el README"];
        const files = ["js/experiments/core.js", "lib/tesela-ui.js", "lib/tesela-ui.css", "README.md", "index.html", "css/experiments.css"];
        const render = (branch) => {
          ctx.$("[data-b]").textContent = branch;
          const seed = branch.length * 31;
          const r = TESELA_XP.rng(seed);
          const commits = Array.from({ length: 7 }, (_, i) => ({ sha: Math.floor(r() * 0xfffffff).toString(16).padStart(7, "0"), msg: msgs[(i + seed) % msgs.length], who: ["Luis", "Ana", "Leo"][i % 3], verified: r() > 0.3, day: Math.floor(i / 3), files: files.filter(() => r() > 0.5).slice(0, 4) }));
          ctx.$("[data-count]").textContent = `${commits.length} commits`;
          const days = [...new Set(commits.map((c) => c.day))];
          ctx.$("[data-list]").innerHTML = days
            .map((d) => `<div><span class="tsl-eyebrow">${d === 0 ? "Hoy" : `Hace ${d} ${d > 1 ? "días" : "día"}`}</span><ul class="tsl-list" style="margin-top:6px">${commits.filter((c) => c.day === d).map((c) => `<li style="flex-wrap:wrap"><span class="tsl-avatar tsl-avatar--sm">${c.who[0]}</span><div style="flex:1;min-width:200px"><div class="tsl-list__title">${esc(c.msg)}</div><div class="tsl-list__desc">${c.who} hizo commit${c.verified ? ' · <span style="color:var(--tsl-success)">✓ Verificado</span>' : ""}</div></div><span class="tsl-list__end"><button type="button" class="tsl-btn tsl-btn--sm xp-mono" data-tsl-copy="${c.sha}" data-tsl-tooltip="Copiar SHA">${c.sha}</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-x aria-expanded="false">Archivos</button></span><div data-files hidden style="flex-basis:100%;padding-left:36px" class="xp-mono tsl-muted">${c.files.map((f) => `<div>M ${f}</div>`).join("") || "<div>(commit vacío)</div>"}</div></li>`).join("")}</ul></div>`)
            .join("");
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-x]");
          if (!b) return;
          const f = b.closest("li").querySelector("[data-files]");
          f.hidden = !f.hidden;
          b.setAttribute("aria-expanded", String(!f.hidden));
        });
        ctx.on(ctx.$("[data-branch]"), "tsl-select", (e) => render(e.detail.value));
        render("main");
      }
    },

    approvals: {
      html: `
        ${head("Líneas de tiempo · approvals.tsx", "Aprobaciones", "Visto bueno secuencial: cada revisor aprueba o rechaza (con un motivo). Cuando todos los pasos pasan, la solicitud está lista para salir.")}
        <div class="tsl-row"><strong>Lanzamiento: página de precios v2</strong><span class="tsl-badge" data-status></span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-reset>Restablecer</button></div>
        <ol class="tsl-timeline" data-steps></ol>`,
      setup(root, ctx) {
        let steps;
        const reset = () => (steps = [["Diseño", "Ana López"], ["Ingeniería", "Leo Kim"], ["Legal", "Sara Ruiz"]].map(([team, who]) => ({ team, who, state: "pending", note: "" })));
        const render = () => {
          const cur = steps.findIndex((s) => s.state === "pending");
          const rejected = steps.some((s) => s.state === "rejected");
          ctx.$("[data-status]").className = `tsl-badge tsl-badge--${rejected ? "danger" : cur === -1 ? "success" : "warning"}`;
          ctx.$("[data-status]").textContent = rejected ? "Cambios solicitados" : cur === -1 ? "Listo para salir 🚀" : `Esperando a ${steps[cur].team}`;
          ctx.$("[data-steps]").innerHTML = steps
            .map((s, i) => `<li style="--c:var(--tsl-${s.state === "approved" ? "success" : s.state === "rejected" ? "danger" : i === cur && !rejected ? "warning" : "fg-subtle"})"><div class="tsl-row"><strong>${s.team}</strong><span class="tsl-muted">${s.who}</span><span class="tsl-badge${s.state === "approved" ? " tsl-badge--success" : s.state === "rejected" ? " tsl-badge--danger" : ""}">${{ approved: "aprobado", rejected: "rechazado", pending: "pendiente" }[s.state]}</span></div>${s.note ? `<div class="tsl-muted" style="margin-top:4px">“${esc(s.note)}”</div>` : ""}${i === cur && !rejected ? `<div class="tsl-stack" style="margin-top:8px;--gap:6px"><textarea class="tsl-textarea" data-note placeholder="Nota opcional (obligatoria para rechazar)" style="min-height:60px"></textarea><div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-ok>Aprobar</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--danger" data-no>Solicitar cambios</button></div><span class="tsl-error" data-err></span></div>` : ""}</li>`)
            .join("");
        };
        ctx.on(ctx.$("[data-steps]"), "click", (e) => {
          const cur = steps.findIndex((s) => s.state === "pending");
          const note = ctx.$("[data-note]");
          if (e.target.closest("[data-ok]")) {
            steps[cur].state = "approved";
            steps[cur].note = note.value.trim();
            render();
          } else if (e.target.closest("[data-no]")) {
            if (!note.value.trim()) return (ctx.$("[data-err]").textContent = "Explica qué hay que cambiar.");
            steps[cur].state = "rejected";
            steps[cur].note = note.value.trim();
            render();
          }
        });
        ctx.on(ctx.$("[data-reset]"), "click", () => (reset(), render()));
        reset();
        render();
      }
    },

    "pull-request": {
      html: `
        ${head("Líneas de tiempo · pull-request.tsx", "Pull request", "Los checks corren en vivo (y pueden fallar: vuelve a ejecutarlos). Aprueba, comenta y haz merge cuando todo esté en verde.")}
        <div class="tsl-row"><span class="tsl-badge tsl-badge--success" data-state>Abierto</span><strong>#482 Ranking de la paleta de comandos</strong><span class="tsl-muted">feat/palette → main</span></div>
        <div class="tsl-grid" style="--min:320px;align-items:start">
          <div class="tsl-stack">
            <div class="xp-panel tsl-stack" style="--gap:8px"><div class="tsl-row"><strong>Checks</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-rerun>Volver a ejecutar</button></div><ul class="tsl-list" data-checks></ul></div>
            <ol class="tsl-timeline" data-conv></ol>
            <form class="tsl-stack" data-comment><textarea class="tsl-textarea" placeholder="Deja un comentario" required aria-label="Comentario"></textarea><button type="submit" class="tsl-btn tsl-btn--sm" style="align-self:flex-end">Comentar</button></form>
          </div>
          <div class="xp-panel tsl-stack"><div class="tsl-row"><strong>Revisiones</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-approve>Aprobar</button></div><span class="tsl-muted" data-reviews>Aún no hay revisiones</span><div class="tsl-divider"></div><select class="tsl-select" data-method aria-label="Método de merge"><option>Crear un commit de merge</option><option>Squash y merge</option><option>Rebase y merge</option></select><button type="button" class="tsl-btn tsl-btn--primary" data-merge disabled>Hacer merge del pull request</button><span class="tsl-hint" data-why></span></div>
        </div>`,
      setup(root, ctx) {
        const names = ["lint", "pruebas unitarias", "e2e (chromium)", "build"];
        let checks = [];
        let approved = false;
        let merged = false;
        const conv = (who, text, c = "var(--tsl-fg-subtle)") => {
          const li = document.createElement("li");
          li.style.setProperty("--c", c);
          li.innerHTML = `<strong></strong> <span></span><div class="tsl-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.children[0].textContent = who;
          li.children[1].textContent = text;
          ctx.$("[data-conv]").appendChild(li);
        };
        const sync = () => {
          ctx.$("[data-checks]").innerHTML = checks.map((c) => `<li><span>${c.state === "running" ? '<span class="tsl-spinner" style="--size:12px"></span>' : c.state === "pass" ? '<span style="color:var(--tsl-success)">✓</span>' : '<span style="color:var(--tsl-danger)">✕</span>'}</span><span style="flex:1">${c.name}</span><span class="tsl-muted xp-mono">${c.state === "running" ? "ejecutando…" : `${c.s}s`}</span></li>`).join("");
          const green = checks.every((c) => c.state === "pass");
          const btn = ctx.$("[data-merge]");
          btn.disabled = merged || !green || !approved;
          ctx.$("[data-why]").textContent = merged ? "" : !green ? "Esperando a que pasen los checks" : !approved ? "Requiere 1 revisión aprobatoria" : "Listo para merge";
        };
        const run = () => {
          checks = names.map((name) => ({ name, state: "running", s: 0 }));
          sync();
          checks.forEach((c, i) =>
            ctx.timeout(600 + i * 500 + Math.random() * 500, () => {
              c.state = Math.random() < 0.18 ? "fail" : "pass";
              c.s = (12 + Math.random() * 60).toFixed(0);
              sync();
            })
          );
        };
        ctx.on(ctx.$("[data-rerun]"), "click", run);
        ctx.on(ctx.$("[data-approve]"), "click", (e) => {
          approved = true;
          e.target.disabled = true;
          ctx.$("[data-reviews]").innerHTML = '<span class="tsl-badge tsl-badge--success">✓ Luis aprobó</span>';
          conv("Luis", "aprobó estos cambios", "var(--tsl-success)");
          sync();
        });
        ctx.on(ctx.$("[data-comment]"), "submit", (e) => {
          e.preventDefault();
          conv("Luis", e.target.querySelector("textarea").value);
          e.target.reset();
        });
        ctx.on(ctx.$("[data-merge]"), "click", () => {
          merged = true;
          ctx.$("[data-state]").className = "tsl-badge tsl-badge--accent";
          ctx.$("[data-state]").textContent = "Fusionado";
          conv("Luis", `hizo merge con “${ctx.$("[data-method]").value}”`, "var(--xp-accent)");
          ctx.toast({ title: "Pull request fusionado" });
          sync();
        });
        conv("Leo", "abrió este pull request");
        run();
      }
    },

    "pr-ops-console": {
      html: `
        ${head("Líneas de tiempo · pr-ops-console.tsx", "Consola de operaciones de PR", "Un pipeline de CI/CD que puedes ejecutar: las etapas corren en orden con logs en streaming, staging requiere aprobación manual y puedes cancelar o revertir en cualquier momento.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-run>▶ Ejecutar pipeline</button><button type="button" class="tsl-btn" data-cancel disabled>Cancelar</button><button type="button" class="tsl-btn tsl-btn--subtle" data-rollback disabled>Revertir prod</button><span class="tsl-spacer"></span><span class="tsl-badge" data-state>inactivo</span></div>
        <div class="tsl-row" style="--gap:6px;flex-wrap:nowrap;overflow:auto" data-stages></div>
        <div class="tsl-alert tsl-alert--warning" data-gate hidden><div style="flex:1"><div class="tsl-alert__title">Staging desplegado: ¿promover a producción?</div></div><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-approve>Aprobar</button></div>
        <pre class="xp-terminal" data-log style="min-height:220px;max-height:260px;overflow:auto;margin:0"></pre>`,
      setup(root, ctx) {
        const stages = ["Instalar", "Lint", "Pruebas", "Build", "Deploy a staging", "Deploy a prod"];
        let state = [];
        let token = 0;
        const log = (line) => {
          const el = ctx.$("[data-log]");
          el.textContent += `${new Date().toLocaleTimeString()}  ${line}\n`;
          el.scrollTop = el.scrollHeight;
        };
        const render = () => {
          ctx.$("[data-stages]").innerHTML = stages.map((s, i) => `<div class="tsl-stat" style="min-width:120px;padding:10px;border-color:${state[i] === "running" ? "var(--xp-accent)" : "var(--tsl-border)"}"><span class="tsl-eyebrow">${i + 1}. ${s}</span><span>${{ running: '<span class="tsl-spinner" style="--size:12px"></span> ejecutando', done: '<span style="color:var(--tsl-success)">✓ exitoso</span>', failed: '<span style="color:var(--tsl-danger)">✕ fallido</span>', waiting: "⏸ en espera", cancelled: "⊘ cancelado" }[state[i]] || '<span class="tsl-muted">en cola</span>'}</span></div>`).join("");
        };
        const setState = (s) => {
          ctx.$("[data-state]").textContent = { idle: "inactivo", success: "exitoso", failed: "fallido", cancelled: "cancelado", running: "ejecutando", "awaiting approval": "esperando aprobación" }[s] || s;
          ctx.$("[data-state]").className = `tsl-badge${s === "success" ? " tsl-badge--success" : s === "failed" || s === "cancelled" ? " tsl-badge--danger" : s === "running" ? " tsl-badge--info" : ""}`;
          ctx.$("[data-run]").disabled = s === "running" || s === "awaiting approval";
          ctx.$("[data-cancel]").disabled = !(s === "running" || s === "awaiting approval");
        };
        const runStage = (i, my) => {
          if (my !== token) return;
          if (i === 5 && state[4] === "done" && state[5] !== "approved") {
            state[5] = "waiting";
            ctx.$("[data-gate]").hidden = false;
            setState("awaiting approval");
            log("⏸ esperando aprobación manual");
            return render();
          }
          if (i >= stages.length) {
            setState("success");
            ctx.$("[data-rollback]").disabled = false;
            log("✓ pipeline exitoso: v1.3.0 en vivo");
            return;
          }
          state[i] = "running";
          render();
          log(`▶ ${stages[i]}…`);
          const steps = [`  $ ${["npm ci", "npm run lint", "npm test", "npm run build", "deploy --env staging", "deploy --env production"][i]}`, `  ${["0 paquetes añadidos (¡cero dependencias!)", "0 problemas", "212 exitosas", "dist/ 148 kB", "https://staging.tesela.example", "https://devl.dev"][i]}`];
          steps.forEach((l, k) => ctx.timeout(250 * (k + 1), () => my === token && log(l)));
          ctx.timeout(800 + Math.random() * 500, () => {
            if (my !== token) return;
            state[i] = "done";
            render();
            runStage(i + 1, my);
          });
        };
        ctx.on(ctx.$("[data-run]"), "click", () => {
          token++;
          state = [];
          ctx.$("[data-log]").textContent = "";
          ctx.$("[data-gate]").hidden = true;
          setState("running");
          runStage(0, token);
        });
        ctx.on(ctx.$("[data-approve]"), "click", () => {
          ctx.$("[data-gate]").hidden = true;
          state[5] = "approved";
          setState("running");
          log("✓ aprobado por Luis");
          runStage(5, token);
        });
        ctx.on(ctx.$("[data-cancel]"), "click", () => {
          token++;
          state = state.map((s) => (s === "running" || s === "waiting" ? "cancelled" : s));
          ctx.$("[data-gate]").hidden = true;
          setState("cancelled");
          log("⊘ cancelado por el usuario");
          render();
        });
        ctx.on(ctx.$("[data-rollback]"), "click", (e) => {
          e.target.disabled = true;
          log("↺ revirtiendo producción a v1.2.0…");
          ctx.timeout(900, () => {
            log("✓ reversión completada");
            ctx.toast({ title: "Producción revertida a v1.2.0", variant: "warning" });
          });
        });
        render();
      }
    },

    releases: {
      html: `
        ${head("Líneas de tiempo · releases.tsx", "Línea de tiempo de versiones", "Promueve cualquier versión a producción o revierte; el marcador en vivo se mueve y el historial lo registra.")}
        <ol class="tsl-timeline" data-list></ol>
        <div><span class="tsl-eyebrow">Historial</span><ul class="tsl-list" style="margin-top:8px" data-hist></ul></div>`,
      setup(root, ctx) {
        const rel = [["v1.3.0", "Galería funcional", "2026-10-14", 3], ["v1.2.0", "Calendario y OTP", "2026-10-02", 4], ["v1.1.0", "Movimiento reducido", "2026-09-20", 2], ["v1.0.0", "Lanzamiento inicial", "2026-09-01", 5]];
        let live = 1;
        const hist = [];
        const render = () => {
          ctx.$("[data-list]").innerHTML = rel.map(([v, t, d, a], i) => `<li style="--c:${i === live ? "var(--tsl-success)" : "var(--tsl-fg-subtle)"}"><div class="tsl-row"><strong class="xp-mono">${v}</strong><span>${t}</span>${i === live ? '<span class="tsl-badge tsl-badge--success"><span class="tsl-dot tsl-dot--success tsl-dot--pulse"></span> Producción</span>' : ""}<span class="tsl-spacer"></span>${i === live ? "" : `<button type="button" class="tsl-btn tsl-btn--sm" data-p="${i}">${i < live ? "Promover" : "Revertir a"}</button>`}</div><div class="tsl-timeline__meta">${d} · ${a} artefactos · tag ${v}</div></li>`).join("");
          ctx.$("[data-hist]").innerHTML = hist.map((h) => `<li>${h}</li>`).join("") || '<li class="tsl-muted">No hay deploys en esta sesión.</li>';
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-p]");
          if (!b) return;
          const i = Number(b.dataset.p);
          b.setAttribute("aria-busy", "true");
          ctx.timeout(700, () => {
            hist.unshift(`${new Date().toLocaleTimeString()} · ${i < live ? "promovió" : "revirtió"} ${rel[live][0]} → <strong>${rel[i][0]}</strong>`);
            live = i;
            ctx.toast({ title: `${rel[i][0]} está en vivo` });
            render();
          });
        });
        render();
      }
    },

    "status-page": {
      html: `
        ${head("Líneas de tiempo · status-page.tsx", "Página de estado", "Barras de disponibilidad de 90 días por componente con detalle al pasar el cursor, porcentajes de uptime calculados e historial de incidentes.")}
        <div class="tsl-alert tsl-alert--success"><div><div class="tsl-alert__title">Todos los sistemas operativos</div></div></div>
        <div class="xp-panel xp-rel tsl-stack" data-comps><div class="xp-tip" data-tip hidden></div></div>
        <div><span class="tsl-eyebrow">Incidentes pasados</span><ol class="tsl-timeline" style="margin-top:10px" data-inc></ol></div>`,
      setup(root, ctx) {
        const comps = ["API", "Panel", "Webhooks", "CDN"];
        const r = TESELA_XP.rng(77);
        const incidents = [];
        const days = comps.map((c) =>
          Array.from({ length: 90 }, (_, i) => {
            const x = r();
            const s = x < 0.02 ? "major" : x < 0.06 ? "minor" : "ok";
            if (s !== "ok") incidents.push({ c, i, s });
            return s;
          })
        );
        const box = ctx.$("[data-comps]");
        box.insertAdjacentHTML(
          "beforeend",
          comps
            .map((c, ci) => {
              const down = days[ci].filter((s) => s === "major").length * 0.5 + days[ci].filter((s) => s === "minor").length * 0.08;
              const up = ((90 - down) / 90) * 100;
              return `<div class="tsl-stack" style="--gap:6px"><div class="tsl-row"><strong>${c}</strong><span class="tsl-spacer"></span><span class="tsl-muted xp-mono">${up.toFixed(2)}% de uptime</span></div><div style="display:flex;gap:2px;height:30px">${days[ci].map((s, i) => `<span data-c="${ci}" data-i="${i}" style="flex:1;border-radius:2px;background:var(--tsl-${s === "ok" ? "success" : s === "minor" ? "warning" : "danger"});opacity:${s === "ok" ? 0.7 : 1}"></span>`).join("")}</div></div>`;
            })
            .join("")
        );
        const tipEl = ctx.$("[data-tip]");
        ctx.on(box, "pointermove", (e) => {
          const s = e.target.closest("[data-i]");
          if (!s) return (tipEl.hidden = true);
          const st = days[s.dataset.c][s.dataset.i];
          const d = new Date(Date.now() - (89 - s.dataset.i) * 864e5).toLocaleDateString("es-MX", { month: "short", day: "numeric" });
          TESELA_XP.chart.tip(tipEl, e, `<strong>${comps[s.dataset.c]} · ${d}</strong><br>${st === "ok" ? "Sin caídas" : st === "minor" ? "Rendimiento degradado (~2 h)" : "Caída mayor (~12 h)"}`);
        });
        ctx.on(box, "pointerleave", () => (tipEl.hidden = true));
        ctx.$("[data-inc]").innerHTML = incidents.sort((a, b) => b.i - a.i).slice(0, 5).map((x) => `<li style="--c:var(--tsl-${x.s === "major" ? "danger" : "warning"})"><strong>${x.c}</strong> ${x.s === "major" ? "caída" : "rendimiento degradado"}<div class="tsl-timeline__meta">${new Date(Date.now() - (89 - x.i) * 864e5).toLocaleDateString("es-MX")} · resuelto</div></li>`).join("");
      }
    },

    deploys: {
      html: `
        ${head("Líneas de tiempo · deploys.tsx", "Historial de deploys", "Filtra por entorno, vuelve a desplegar cualquier commit y míralo compilar con duración en vivo hasta que esté listo (o falle).")}
        <div class="tsl-row"><tsl-segmented value="all" data-env><button class="tsl-segmented__item" value="all">Todos</button><button class="tsl-segmented__item" value="production">Producción</button><button class="tsl-segmented__item" value="preview">Preview</button></tsl-segmented></div>
        <ul class="tsl-list" data-list></ul>`,
      setup(root, ctx) {
        let n = 0;
        const deploys = [
          { id: ++n, sha: "f8a92c1", msg: "feat: galería funcional", env: "production", state: "ready", start: Date.now() - 3600e3, dur: 41 },
          { id: ++n, sha: "1c0de42", msg: "fix: aspecto del sparkline", env: "preview", state: "ready", start: Date.now() - 7200e3, dur: 38 },
          { id: ++n, sha: "9b7e3d0", msg: "chore: dependencias", env: "preview", state: "error", start: Date.now() - 9000e3, dur: 12 }
        ];
        const render = () => {
          const env = ctx.$("[data-env]").value || "all";
          ctx.$("[data-list]").innerHTML = deploys
            .filter((d) => env === "all" || d.env === env)
            .map((d) => {
              const dur = d.state === "building" ? Math.round((Date.now() - d.start) / 1000) : d.dur;
              const badge = { ready: "success", error: "danger", building: "info" }[d.state];
              return `<li><span class="tsl-badge tsl-badge--${badge}">${d.state === "building" ? '<span class="tsl-spinner" style="--size:10px;margin-right:4px"></span>' : ""}${{ ready: "listo", error: "error", building: "compilando" }[d.state]}</span><div style="flex:1"><div class="tsl-list__title">${esc(d.msg)}</div><div class="tsl-list__desc"><span class="xp-mono">${d.sha}</span> · ${d.env === "production" ? "producción" : "preview"} · ${ago(d.start)} · ${dur}s</div></div><span class="tsl-list__end"><button type="button" class="tsl-btn tsl-btn--sm" data-re="${d.id}"${d.state === "building" ? " disabled" : ""}>Volver a desplegar</button></span></li>`;
            })
            .join("");
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-re]");
          if (!b) return;
          const src = deploys.find((d) => d.id === Number(b.dataset.re));
          const d = { ...src, id: ++n, state: "building", start: Date.now() };
          deploys.unshift(d);
          const total = 3000 + Math.random() * 3000;
          ctx.timeout(total, () => {
            d.state = Math.random() < 0.2 ? "error" : "ready";
            d.dur = Math.round(total / 1000);
            ctx.toast({ title: `Deploy ${d.state === "ready" ? "listo" : "fallido"}`, description: `${d.sha} → ${d.env}`, variant: d.state === "ready" ? "success" : "danger" });
            render();
          });
          render();
        });
        ctx.on(ctx.$("[data-env]"), "tsl-change", render);
        ctx.every(1000, render);
        render();
      }
    },

    "inbox-thread": {
      html: `
        ${head("Líneas de tiempo · inbox-thread.tsx", "Hilo de bandeja", "Envía una respuesta (Enter), adjunta archivos y mira cómo la otra persona escribe y responde.")}
        <div class="tsl-card" style="max-width:640px;width:100%;margin:0 auto;display:flex;flex-direction:column;height:480px">
          <div class="tsl-card__header tsl-row" style="border-bottom:1px solid var(--tsl-border);padding-bottom:12px"><span class="tsl-avatar" data-status="online">AL</span><div><strong>Ana López</strong><div class="tsl-muted" style="font-size:11px">Líder de diseño</div></div></div>
          <div data-msgs style="flex:1;overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px"></div>
          <div class="tsl-muted" data-typing hidden style="padding:0 18px 6px;font-size:11px">Ana está escribiendo…</div>
          <form class="tsl-row" data-form style="padding:10px 12px;border-top:1px solid var(--tsl-border);flex-wrap:nowrap"><label class="tsl-btn tsl-btn--icon tsl-btn--subtle" style="cursor:pointer" aria-label="Adjuntar">📎<input type="file" hidden data-file /></label><input class="tsl-input" data-text placeholder="Escribe una respuesta…" aria-label="Respuesta" autocomplete="off" /><button type="submit" class="tsl-btn tsl-btn--primary">Enviar</button></form>
        </div>`,
      setup(root, ctx) {
        const box = ctx.$("[data-msgs]");
        const bubble = (mine, text, file) => {
          const d = document.createElement("div");
          d.style.cssText = `align-self:${mine ? "flex-end" : "flex-start"};max-width:75%;padding:8px 12px;border-radius:12px;font-size:12.5px;line-height:1.5;background:${mine ? "var(--xp-accent)" : "var(--tsl-surface-strong)"};color:${mine ? "#fff" : "var(--tsl-fg)"}`;
          d.textContent = text;
          if (file) d.insertAdjacentHTML("beforeend", `<div style="margin-top:6px;opacity:.85">📄 <span></span></div>`), (d.querySelector("span").textContent = file);
          const t = document.createElement("div");
          t.style.cssText = `font-size:10px;opacity:.7;margin-top:2px;text-align:${mine ? "right" : "left"}`;
          t.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          d.appendChild(t);
          box.appendChild(d);
          box.scrollTop = box.scrollHeight;
        };
        const replies = ["Me encanta, ¿podemos ajustar el espaciado en móvil?", "Suena bien, ¡a producción! 🚀", "¿Puedes enviarme el enlace de Figma?", "¡Perfecto, gracias!"];
        let k = 0;
        let pendingFile = "";
        ctx.on(ctx.$("[data-file]"), "change", (e) => {
          pendingFile = e.target.files[0] ? e.target.files[0].name : "";
          if (pendingFile) ctx.toast({ title: `Adjuntaste ${pendingFile}`, variant: "neutral", duration: 1200 });
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const input = ctx.$("[data-text]");
          if (!input.value.trim() && !pendingFile) return;
          bubble(true, input.value.trim(), pendingFile);
          input.value = "";
          pendingFile = "";
          ctx.timeout(500, () => (ctx.$("[data-typing]").hidden = false));
          ctx.timeout(1800, () => {
            ctx.$("[data-typing]").hidden = true;
            bubble(false, replies[k++ % replies.length]);
          });
        });
        bubble(false, "¡Hola! ¿Pudiste ver la nueva galería?");
        bubble(true, "Sí, ahora cada experimento es funcional.");
      }
    },

    "activity-feed": {
      html: `
        ${head("Líneas de tiempo · activity-feed.tsx", "Feed de actividad", "Flujo en tiempo real con pausa/reanudar, filtros por tipo y marcas de tiempo relativas que se actualizan solas.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-pause aria-pressed="false">❚❚ Pausar</button><div class="tsl-row" style="--gap:6px" data-types></div><span class="tsl-spacer"></span><span class="tsl-badge" data-count></span></div>
        <ol class="tsl-timeline" data-list style="max-height:460px;overflow:auto"></ol>`,
      setup(root, ctx) {
        const kinds = { deploy: "success", comment: "info", issue: "warning", member: "accent" };
        const templates = { deploy: ["desplegó f8a92c1 a producción", "desplegó el preview de #483"], comment: ["comentó en DEV-120", "respondió en Tokens v2"], issue: ["abrió DEV-131", "cerró DEV-118"], member: ["se unió al espacio de trabajo", "fue ascendido a Admin"] };
        const people = ["Ana", "Leo", "Sara", "Tom", "Mia"];
        const feed = [];
        const on = new Set(Object.keys(kinds));
        let paused = false;
        let n = 0;
        ctx.$("[data-types]").innerHTML = Object.keys(kinds).map((k) => `<button type="button" class="tsl-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const add = () => {
          const k = Object.keys(kinds)[n % 4];
          feed.unshift({ k, who: people[n % 5], what: templates[k][n % 2], at: Date.now() });
          n++;
          if (feed.length > 60) feed.pop();
        };
        const render = () => {
          const rows = feed.filter((f) => on.has(f.k));
          ctx.$("[data-count]").textContent = `${rows.length} eventos`;
          ctx.$("[data-list]").innerHTML = rows.map((f) => `<li style="--c:var(--tsl-${kinds[f.k] === "accent" ? "accent" : kinds[f.k]})"><strong>${f.who}</strong> ${f.what}<div class="tsl-timeline__meta">${ago(f.at)}</div></li>`).join("");
        };
        for (let i = 0; i < 5; i++) add();
        feed.forEach((f, i) => (f.at -= (i + 1) * 45000));
        ctx.every(2000, () => {
          if (!paused) add();
          render();
        });
        ctx.on(ctx.$("[data-pause]"), "click", (e) => {
          paused = !paused;
          e.target.setAttribute("aria-pressed", String(paused));
          e.target.textContent = paused ? "▶ Reanudar" : "❚❚ Pausar";
        });
        ctx.on(ctx.$("[data-types]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          on.has(b.dataset.t) ? on.delete(b.dataset.t) : on.add(b.dataset.t);
          b.setAttribute("aria-pressed", String(on.has(b.dataset.t)));
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // CALENDARIOS
  // ==========================================================================
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  X.iso = iso;

  X.addMany("calendars", {
    month: {
      html: `
        ${head("Calendarios · month.tsx", "Vista mensual", "Navega por los meses, haz clic en un día para añadir un evento y en un evento para quitarlo. El día de hoy está resaltado.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-nav="-1">‹</button><button type="button" class="tsl-btn tsl-btn--sm" data-today>Hoy</button><button type="button" class="tsl-btn tsl-btn--sm" data-nav="1">›</button><h3 class="xp-title" style="margin:0;font-size:18px" data-title></h3></div>
        <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px" data-grid></div>
        <form class="tsl-row xp-panel" data-form hidden style="padding:10px"><span class="tsl-badge" data-day></span><input class="tsl-input" style="flex:1" placeholder="Título del evento" required data-title-in aria-label="Título del evento" /><button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--sm">Añadir</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cancel>Cancelar</button></form>`,
      setup(root, ctx) {
        const today = new Date();
        let view = new Date(today.getFullYear(), today.getMonth(), 1);
        const events = { [TESELA_XP.iso(today)]: ["Sincronización de diseño"], [TESELA_XP.iso(new Date(today.getFullYear(), today.getMonth(), 3))]: ["Lanzamiento v1.2"] };
        let picked = null;
        const render = () => {
          ctx.$("[data-title]").textContent = view.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
          const offset = (view.getDay() + 6) % 7;
          const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
          let html = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => `<div class="tsl-eyebrow" style="padding:4px;overflow:hidden">${d}</div>`).join("");
          for (let i = 0; i < 42; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const key = TESELA_XP.iso(d);
            const out = d.getMonth() !== view.getMonth();
            html += `<div data-d="${key}" style="min-height:84px;min-width:0;overflow:hidden;padding:6px;border-radius:8px;border:1px solid ${key === TESELA_XP.iso(today) ? "var(--xp-accent)" : "var(--tsl-border)"};background:var(--tsl-surface);cursor:pointer;opacity:${out ? 0.45 : 1}"><div class="xp-mono" style="font-size:11px">${d.getDate()}</div>${(events[key] || []).map((t, k) => `<button type="button" class="tsl-badge tsl-badge--accent" data-ev="${k}" style="border:0;margin-top:3px;max-width:100%;overflow:hidden;cursor:pointer;display:flex">${esc(t)}</button>`).join("")}</div>`;
          }
          ctx.$("[data-grid]").innerHTML = html;
        };
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const cell = e.target.closest("[data-d]");
          if (!cell) return;
          const ev = e.target.closest("[data-ev]");
          if (ev) {
            events[cell.dataset.d].splice(Number(ev.dataset.ev), 1);
            return render();
          }
          picked = cell.dataset.d;
          ctx.$("[data-day]").textContent = picked;
          ctx.$("[data-form]").hidden = false;
          ctx.$("[data-title-in]").focus();
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          (events[picked] = events[picked] || []).push(ctx.$("[data-title-in]").value);
          e.target.reset();
          e.target.hidden = true;
          render();
        });
        ctx.on(ctx.$("[data-cancel]"), "click", () => (ctx.$("[data-form]").hidden = true));
        ctx.$$("[data-nav]").forEach((b) => ctx.on(b, "click", () => ((view = new Date(view.getFullYear(), view.getMonth() + Number(b.dataset.nav), 1)), render())));
        ctx.on(ctx.$("[data-today]"), "click", () => ((view = new Date(today.getFullYear(), today.getMonth(), 1)), render()));
        render();
      }
    },

    week: {
      html: `
        ${head("Calendarios · week.tsx", "Horario semanal", "Haz clic en un espacio vacío para bloquear una hora y en un bloque para quitarlo. La línea roja es la hora actual.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-nav="-7">‹ Anterior</button><button type="button" class="tsl-btn tsl-btn--sm" data-nav="7">Siguiente ›</button><strong data-range></strong><span class="tsl-spacer"></span><span class="tsl-badge" data-busy></span></div>
        <div class="xp-panel" style="padding:0;overflow:auto"><div data-grid style="position:relative;display:grid;grid-template-columns:52px repeat(7,minmax(90px,1fr));min-width:720px"></div></div>`,
      setup(root, ctx) {
        const H0 = 8;
        const H1 = 19;
        const ROW = 40;
        const now = new Date();
        let monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
        const blocks = new Map([[`${TESELA_XP.iso(monday)}|10`, "Standup"], [`${TESELA_XP.iso(new Date(monday.getTime() + 2 * 864e5))}|14`, "Revisión de diseño"]]);
        const grid = ctx.$("[data-grid]");
        const render = () => {
          const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
          ctx.$("[data-range]").textContent = `${days[0].toLocaleDateString("es-MX", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("es-MX", { month: "short", day: "numeric" })}`;
          let html = '<div style="height:36px"></div>' + days.map((d) => `<div class="tsl-eyebrow" style="height:36px;display:grid;place-items:center;border-left:1px solid var(--tsl-border);${TESELA_XP.iso(d) === TESELA_XP.iso(now) ? "color:var(--xp-accent)" : ""}">${d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" })}</div>`).join("");
          for (let h = H0; h < H1; h++) {
            html += `<div class="xp-mono tsl-muted" style="height:${ROW}px;font-size:10px;padding:2px 6px;border-top:1px solid var(--tsl-border)">${String(h).padStart(2, "0")}:00</div>`;
            days.forEach((d) => {
              const key = `${TESELA_XP.iso(d)}|${h}`;
              const title = blocks.get(key);
              html += `<div data-k="${key}" style="height:${ROW}px;border-top:1px solid var(--tsl-border);border-left:1px solid var(--tsl-border);padding:2px;cursor:pointer">${title ? `<div style="height:100%;border-radius:6px;background:color-mix(in srgb,var(--xp-accent) 25%,transparent);border-left:3px solid var(--xp-accent);font-size:11px;padding:3px 6px">${esc(title)}</div>` : ""}</div>`;
            });
          }
          grid.innerHTML = html;
          const todayIdx = days.findIndex((d) => TESELA_XP.iso(d) === TESELA_XP.iso(now));
          const mins = now.getHours() * 60 + now.getMinutes();
          if (todayIdx >= 0 && mins >= H0 * 60 && mins < H1 * 60) grid.insertAdjacentHTML("beforeend", `<div style="position:absolute;left:52px;right:0;top:${36 + ((mins - H0 * 60) / 60) * ROW}px;height:2px;background:var(--tsl-danger);pointer-events:none"></div>`);
          ctx.$("[data-busy]").textContent = `${[...blocks.keys()].filter((k) => days.some((d) => k.startsWith(TESELA_XP.iso(d)))).length}h reservadas esta semana`;
        };
        ctx.on(grid, "click", (e) => {
          const c = e.target.closest("[data-k]");
          if (!c) return;
          if (blocks.has(c.dataset.k)) blocks.delete(c.dataset.k);
          else blocks.set(c.dataset.k, "Bloque de enfoque");
          render();
        });
        ctx.$$("[data-nav]").forEach((b) => ctx.on(b, "click", () => ((monday = new Date(monday.getTime() + Number(b.dataset.nav) * 864e5)), render())));
        ctx.every(60000, render);
        render();
      }
    },

    agenda: {
      html: `
        ${head("Calendarios · agenda.tsx", "Lista de agenda", "Próximos eventos agrupados por día, filtrables por calendario y con búsqueda; los botones de unirse se destacan en los eventos que empiezan pronto.")}
        <div class="tsl-row"><input class="tsl-input xp-search" data-q placeholder="Buscar eventos…" aria-label="Buscar" /><label class="tsl-choice"><input type="checkbox" class="tsl-check" data-cal value="Trabajo" checked /> <span class="tsl-dot tsl-dot--accent"></span> Trabajo</label><label class="tsl-choice"><input type="checkbox" class="tsl-check" data-cal value="Personal" checked /> <span class="tsl-dot tsl-dot--success"></span> Personal</label></div>
        <div data-list class="tsl-stack"></div>`,
      setup(root, ctx) {
        const now = Date.now();
        const evs = [[0.01, "Standup", "Trabajo"], [0.2, "Revisión de diseño", "Trabajo"], [0.4, "Gimnasio", "Personal"], [1.1, "1:1 con Ana", "Trabajo"], [1.5, "Cena con Leo", "Personal"], [2.2, "Planificación del sprint", "Trabajo"], [4.3, "Dentista", "Personal"], [6.1, "Revisión trimestral", "Trabajo"]].map(([d, t, c]) => ({ at: now + d * 864e5, t, c }));
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          const cals = ctx.$$("[data-cal]:checked").map((c) => c.value);
          const rows = evs.filter((e) => cals.includes(e.c) && e.t.toLowerCase().includes(q));
          const groups = {};
          rows.forEach((e) => (groups[TESELA_XP.iso(new Date(e.at))] = groups[TESELA_XP.iso(new Date(e.at))] || []).push(e));
          ctx.$("[data-list]").innerHTML = Object.entries(groups)
            .map(([day, list]) => `<div><span class="tsl-eyebrow">${new Date(day + "T00:00").toLocaleDateString("es-MX", { weekday: "long", month: "short", day: "numeric" })}</span><ul class="tsl-list" style="margin-top:6px">${list.map((e) => {
              const soon = e.at - Date.now() < 30 * 60000;
              return `<li><span class="tsl-dot tsl-dot--${e.c === "Trabajo" ? "accent" : "success"}"></span><span class="xp-mono tsl-muted">${new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span style="flex:1">${esc(e.t)}</span>${e.c === "Trabajo" ? `<button type="button" class="tsl-btn tsl-btn--sm${soon ? " tsl-btn--primary" : ""}" data-join="${esc(e.t)}">${soon ? "Unirse ahora" : "Unirse"}</button>` : ""}</li>`;
            }).join("")}</ul></div>`)
            .join("") || '<div class="tsl-empty"><div class="tsl-empty__title">No hay nada programado</div></div>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.$$("[data-cal]").forEach((c) => ctx.on(c, "change", render));
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-join]");
          if (b) ctx.toast({ title: `Uniéndote a “${b.dataset.join}”`, variant: "info" });
        });
        render();
      }
    },

    "date-range": {
      html: `
        ${head("Calendarios · date-range.tsx", "Selector de rango de fechas", "Dos meses lado a lado: haz clic en un inicio y un fin (al pasar el cursor se previsualiza el rango) o usa un preajuste.")}
        <div class="tsl-row"><span class="tsl-badge tsl-badge--outline xp-mono" data-out>Elige una fecha de inicio</span><span class="tsl-spacer"></span>${[["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["month", "Este mes"]].map(([v, l]) => `<button type="button" class="tsl-chip" data-preset="${v}">${l}</button>`).join("")}</div>
        <div class="xp-panel tsl-row" style="align-items:flex-start;--gap:28px"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-nav="-1" aria-label="Anterior">‹</button><div class="tsl-row" style="align-items:flex-start;--gap:28px;flex:1;justify-content:center" data-months></div><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-nav="1" aria-label="Siguiente">›</button></div>`,
      setup(root, ctx) {
        const today = new Date();
        let view = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let a = null;
        let b = null;
        let hover = null;
        const key = (d) => TESELA_XP.iso(d);
        const month = (base) => {
          const offset = (base.getDay() + 6) % 7;
          let cells = ["L", "M", "X", "J", "V", "S", "D"].map((d) => `<span class="tsl-cal__dow">${d}</span>`).join("");
          for (let i = 0; i < offset; i++) cells += "<span></span>";
          const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
          const end = b || hover;
          for (let d = 1; d <= days; d++) {
            const k = key(new Date(base.getFullYear(), base.getMonth(), d));
            const lo = a && end ? (a < end ? a : end) : a;
            const hi = a && end ? (a < end ? end : a) : a;
            const inRange = lo && hi && k >= lo && k <= hi;
            const edge = k === lo || k === hi;
            cells += `<button type="button" class="tsl-cal__day" data-k="${k}" aria-pressed="${edge}" style="${inRange && !edge ? "background:color-mix(in srgb,var(--xp-accent) 20%,transparent);border-radius:0" : ""}">${d}</button>`;
          }
          return `<div><div class="tsl-eyebrow" style="text-align:center;margin-bottom:8px">${base.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</div><div class="tsl-cal__grid">${cells}</div></div>`;
        };
        const render = () => {
          ctx.$("[data-months]").innerHTML = month(view) + month(new Date(view.getFullYear(), view.getMonth() + 1, 1));
          const out = ctx.$("[data-out]");
          if (a && b) {
            const [lo, hi] = a < b ? [a, b] : [b, a];
            const nights = Math.round((new Date(hi) - new Date(lo)) / 864e5);
            out.textContent = `${lo} → ${hi} · ${nights + 1} días`;
          } else out.textContent = a ? `${a} → elige una fecha de fin` : "Elige una fecha de inicio";
        };
        ctx.on(ctx.$("[data-months]"), "click", (e) => {
          const d = e.target.closest("[data-k]");
          if (!d) return;
          if (!a || b) {
            a = d.dataset.k;
            b = null;
          } else b = d.dataset.k;
          render();
        });
        ctx.on(ctx.$("[data-months]"), "pointerover", (e) => {
          const d = e.target.closest("[data-k]");
          if (a && !b && d && d.dataset.k !== hover) {
            hover = d.dataset.k;
            render();
          }
        });
        ctx.$$("[data-nav]").forEach((btn) => ctx.on(btn, "click", () => ((view = new Date(view.getFullYear(), view.getMonth() + Number(btn.dataset.nav), 1)), render())));
        ctx.$$("[data-preset]").forEach((btn) =>
          ctx.on(btn, "click", () => {
            const p = btn.dataset.preset;
            b = key(today);
            a = p === "month" ? key(new Date(today.getFullYear(), today.getMonth(), 1)) : key(new Date(today.getTime() - (Number(p) - 1) * 864e5));
            view = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            render();
          })
        );
        render();
      }
    },

    timezone: {
      html: `
        ${head("Calendarios · timezone.tsx", "Planificador de zonas horarias", "Zonas horarias reales de Intl. Desliza para mover la hora de la reunión; el horario laboral (9–18) se ilumina en verde para que encuentres el traslape.")}
        <div class="tsl-row"><span class="tsl-label">Desfase</span><input type="range" class="tsl-range" min="-12" max="12" value="0" step="0.5" data-shift style="flex:1;max-width:420px" aria-label="Desplazar horas" /><strong class="xp-mono" data-shift-out>ahora</strong><select class="tsl-select" style="width:auto" data-add aria-label="Añadir ciudad"><option value="">+ Añadir ciudad</option><option>Asia/Tokyo</option><option>Australia/Sydney</option><option>Asia/Kolkata</option><option>America/Sao_Paulo</option></select></div>
        <ul class="tsl-list" data-list></ul>
        <div class="tsl-alert" data-overlap><div><div class="tsl-alert__title" data-overlap-t></div></div></div>`,
      setup(root, ctx) {
        const zones = ["America/Mexico_City", "America/New_York", "Europe/Madrid", "Europe/Berlin"];
        const hourIn = (date, tz) => Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tz }).format(date)) % 24;
        const render = () => {
          const shift = Number(ctx.$("[data-shift]").value);
          const t = new Date(Date.now() + shift * 3600e3);
          ctx.$("[data-shift-out]").textContent = shift === 0 ? "ahora" : `${shift > 0 ? "+" : ""}${shift}h`;
          let all = true;
          ctx.$("[data-list]").innerHTML = zones
            .map((tz, i) => {
              const h = hourIn(t, tz);
              const work = h >= 9 && h < 18;
              if (!work) all = false;
              return `<li><span class="tsl-dot tsl-dot--${work ? "success" : "danger"}"></span><div style="flex:1"><div class="tsl-list__title">${tz.split("/").pop().replace("_", " ")}</div><div class="tsl-list__desc">${tz}</div></div><span class="xp-num xp-mono" style="font-size:20px">${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(t)}</span><span class="tsl-muted" style="width:70px;text-align:right">${new Intl.DateTimeFormat("es-MX", { weekday: "short", timeZone: tz }).format(t)}</span>${i ? `<button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-rm="${i}" aria-label="Quitar">✕</button>` : '<span style="width:26px"></span>'}</li>`;
            })
            .join("");
          ctx.$("[data-overlap]").className = `tsl-alert tsl-alert--${all ? "success" : "warning"}`;
          ctx.$("[data-overlap-t]").textContent = all ? "✓ Todos están dentro del horario laboral" : "Alguien está fuera del horario laboral: desliza para encontrar el traslape";
        };
        ctx.on(ctx.$("[data-shift]"), "input", render);
        ctx.on(ctx.$("[data-add]"), "change", (e) => {
          if (e.target.value && !zones.includes(e.target.value)) zones.push(e.target.value);
          e.target.value = "";
          render();
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          zones.splice(Number(b.dataset.rm), 1);
          render();
        });
        ctx.every(30000, render);
        render();
      }
    },

    mini: {
      html: `
        ${head("Calendarios · mini.tsx", "Mini calendario", "Un campo de fecha con un popover <tsl-calendar>: escribe una fecha o elige una; Escape cierra el popover.")}
        <div class="xp-rel" style="max-width:300px">
          <div class="tsl-input-group"><input class="tsl-input xp-mono" data-in placeholder="AAAA-MM-DD" aria-label="Fecha" /><button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" style="margin:3px" data-open aria-expanded="false" aria-label="Abrir calendario">📅</button></div>
          <div data-pop hidden style="position:absolute;z-index:5;top:calc(100% + 6px);left:0;box-shadow:var(--tsl-shadow-lg);border-radius:var(--tsl-radius);background:var(--tsl-bg-elevated)"><tsl-calendar data-cal locale="es-MX"></tsl-calendar></div>
        </div>
        <p class="tsl-muted" data-out></p>`,
      setup(root, ctx) {
        const input = ctx.$("[data-in]");
        const pop = ctx.$("[data-pop]");
        const cal = ctx.$("[data-cal]");
        const btn = ctx.$("[data-open]");
        const describe = (v) => (ctx.$("[data-out]").textContent = v ? `Seleccionado: ${new Date(v + "T00:00").toLocaleDateString("es-MX", { dateStyle: "full" })}` : "");
        const toggle = (open) => {
          pop.hidden = !open;
          btn.setAttribute("aria-expanded", String(open));
          if (open && /^\d{4}-\d{2}-\d{2}$/.test(input.value)) cal.value = input.value;
        };
        ctx.on(btn, "click", () => toggle(pop.hidden));
        ctx.on(input, "focus", () => toggle(true));
        ctx.on(cal, "tsl-change", (e) => {
          input.value = e.detail.value;
          describe(e.detail.value);
          toggle(false);
        });
        ctx.on(input, "change", () => {
          const ok = /^\d{4}-\d{2}-\d{2}$/.test(input.value) && !isNaN(new Date(input.value));
          input.setAttribute("aria-invalid", String(!ok && Boolean(input.value)));
          if (ok) (cal.value = input.value), describe(input.value);
        });
        ctx.on(root, "keydown", (e) => e.key === "Escape" && !pop.hidden && (e.preventDefault(), toggle(false)));
        ctx.on(document, "pointerdown", (e) => {
          if (!pop.hidden && !pop.contains(e.target) && e.target !== input && !btn.contains(e.target)) toggle(false);
        });
      }
    },

    "year-heatmap": {
      html: `
        ${head("Calendarios · year-heatmap.tsx", "Mapa de calor de contribuciones", "53 semanas de actividad con conteos al pasar el cursor, totales y rachas actual / más larga calculadas. Cambia de año para regenerar.")}
        <div class="tsl-row"><tsl-segmented value="2026" data-year><button class="tsl-segmented__item" value="2024">2024</button><button class="tsl-segmented__item" value="2025">2025</button><button class="tsl-segmented__item" value="2026">2026</button></tsl-segmented><span class="tsl-spacer"></span><span class="tsl-badge" data-total></span><span class="tsl-badge tsl-badge--success" data-streak></span><span class="tsl-badge tsl-badge--accent" data-longest></span></div>
        <div class="xp-panel xp-rel" style="overflow:auto"><div class="xp-tip" data-tip hidden></div><div data-grid style="display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,12px);gap:3px;width:max-content"></div><div class="tsl-row" style="margin-top:10px;font-size:11px;--gap:4px"><span class="tsl-muted">Menos</span>${[0, 1, 2, 3, 4].map((l) => `<span style="width:12px;height:12px;border-radius:2px;background:${l ? `color-mix(in srgb,var(--tsl-success) ${l * 25}%,var(--tsl-surface-strong))` : "var(--tsl-surface-strong)"}"></span>`).join("")}<span class="tsl-muted">Más</span></div></div>`,
      setup(root, ctx) {
        const render = () => {
          const year = Number(ctx.$("[data-year]").value || 2026);
          const r = TESELA_XP.rng(year);
          const start = new Date(year, 0, 1);
          start.setDate(start.getDate() - start.getDay());
          const days = [];
          for (let i = 0; i < 53 * 7; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const weekend = d.getDay() === 0 || d.getDay() === 6;
            const n = r() < (weekend ? 0.55 : 0.18) ? 0 : Math.floor(r() * (weekend ? 4 : 12));
            days.push({ d, n, in: d.getFullYear() === year && d <= new Date() });
          }
          const valid = days.filter((x) => x.in);
          let longest = 0;
          let run = 0;
          valid.forEach((x) => ((run = x.n ? run + 1 : 0), (longest = Math.max(longest, run))));
          let current = 0;
          for (let i = valid.length - 1; i >= 0 && valid[i].n; i--) current++;
          ctx.$("[data-total]").textContent = `${valid.reduce((s, x) => s + x.n, 0)} contribuciones`;
          ctx.$("[data-streak]").textContent = `Racha actual ${current} d`;
          ctx.$("[data-longest]").textContent = `Más larga ${longest} d`;
          ctx.$("[data-grid]").innerHTML = days.map((x, i) => {
            const lvl = !x.in ? -1 : x.n === 0 ? 0 : x.n < 3 ? 1 : x.n < 6 ? 2 : x.n < 9 ? 3 : 4;
            return `<span data-i="${i}" data-n="${x.n}" data-d="${TESELA_XP.iso(x.d)}" style="width:12px;height:12px;border-radius:2px;background:${lvl < 0 ? "transparent" : lvl ? `color-mix(in srgb,var(--tsl-success) ${lvl * 25}%,var(--tsl-surface-strong))` : "var(--tsl-surface-strong)"}"></span>`;
          }).join("");
        };
        const tipEl = ctx.$("[data-tip]");
        ctx.on(ctx.$("[data-grid]"), "pointermove", (e) => {
          const s = e.target.closest("[data-i]");
          if (!s || s.style.background === "transparent") return (tipEl.hidden = true);
          TESELA_XP.chart.tip(tipEl, e, `<strong>${s.dataset.n} contribuciones</strong> el ${new Date(s.dataset.d + "T00:00").toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}`);
        });
        ctx.on(ctx.$("[data-grid]"), "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-year]"), "tsl-change", render);
        render();
      }
    },

    recurring: {
      html: `
        ${head("Calendarios · recurring.tsx", "Evento recurrente", "Crea una regla de recurrencia (frecuencia, intervalo, días de la semana, condición de fin) y mira un resumen en lenguaje natural junto con las próximas ocurrencias.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel tsl-stack" data-form>
            <label class="tsl-field"><span class="tsl-label">Comienza</span><input type="date" class="tsl-input" data-start /></label>
            <div class="tsl-row"><span class="tsl-label">Cada</span><div class="tsl-number"><button type="button" data-step="-1" aria-label="Menos">−</button><input type="number" min="1" max="30" value="1" data-int aria-label="Intervalo" /><button type="button" data-step="1" aria-label="Más">+</button></div><select class="tsl-select" style="width:auto" data-freq aria-label="Frecuencia"><option value="day">día(s)</option><option value="week" selected>semana(s)</option><option value="month">mes(es)</option></select></div>
            <div class="tsl-row" style="--gap:4px" data-days>${["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d, i) => `<button type="button" class="tsl-chip" data-wd="${(i + 1) % 7}" aria-pressed="${i === 0 || i === 2}">${d}</button>`).join("")}</div>
            <span class="tsl-label">Termina</span>
            <label class="tsl-choice"><input type="radio" class="tsl-check" name="rr-end" value="never" checked /> Nunca</label>
            <label class="tsl-choice"><input type="radio" class="tsl-check" name="rr-end" value="count" /> Después de <input type="number" class="tsl-input" style="width:70px;height:28px" min="1" value="10" data-count /> ocurrencias</label>
            <label class="tsl-choice"><input type="radio" class="tsl-check" name="rr-end" value="until" /> El <input type="date" class="tsl-input" style="width:auto;height:28px" data-until /></label>
          </div>
          <div class="tsl-stack"><div class="tsl-alert tsl-alert--info"><div><div class="tsl-alert__title" data-text></div><code class="xp-mono tsl-muted" style="font-size:11px" data-rrule></code></div></div><ol class="tsl-timeline" data-next></ol></div>
        </div>`,
      setup(root, ctx) {
        const start = ctx.$("[data-start]");
        start.value = TESELA_XP.iso(new Date());
        ctx.$("[data-until]").value = TESELA_XP.iso(new Date(Date.now() + 60 * 864e5));
        const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const render = () => {
          const freq = ctx.$("[data-freq]").value;
          const n = Math.max(1, Number(ctx.$("[data-int]").value) || 1);
          const wds = ctx.$$('[data-wd][aria-pressed="true"]').map((b) => Number(b.dataset.wd));
          ctx.$("[data-days]").hidden = freq !== "week";
          const end = ctx.$('[name="rr-end"]:checked').value;
          const count = Math.max(1, Number(ctx.$("[data-count]").value) || 1);
          const until = ctx.$("[data-until]").value;
          const s = new Date(start.value + "T09:00");
          const out = [];
          if (!isNaN(s)) {
            for (let i = 0, d = new Date(s); i < 800 && out.length < 8; i++) {
              let hit = false;
              if (freq === "day") hit = Math.round((d - s) / 864e5) % n === 0;
              else if (freq === "week") hit = wds.includes(d.getDay()) && Math.floor(Math.round((d - s) / 864e5 + ((s.getDay() + 6) % 7)) / 7) % n === 0;
              else hit = d.getDate() === s.getDate() && ((d.getFullYear() - s.getFullYear()) * 12 + d.getMonth() - s.getMonth()) % n === 0;
              if (hit) {
                if (end === "until" && TESELA_XP.iso(d) > until) break;
                if (end === "count" && out.length >= count) break;
                out.push(new Date(d));
              }
              d.setDate(d.getDate() + 1);
            }
          }
          const unit = n === 1 ? { day: "día", week: "semana", month: "mes" }[freq] : `${n} ${{ day: "días", week: "semanas", month: "meses" }[freq]}`;
          const on = freq === "week" && wds.length ? ` el ${wds.sort().map((w) => names[w]).join(", ")}` : freq === "month" ? ` el día ${s.getDate()}` : "";
          const ends = end === "count" ? `, ${count} veces` : end === "until" ? `, hasta ${until}` : "";
          ctx.$("[data-text]").textContent = `Cada ${unit}${on}${ends}`;
          ctx.$("[data-rrule]").textContent = `RRULE:FREQ=${{ day: "DAILY", week: "WEEKLY", month: "MONTHLY" }[freq]};INTERVAL=${n}${freq === "week" && wds.length ? `;BYDAY=${wds.map((w) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][w]).join(",")}` : ""}${end === "count" ? `;COUNT=${count}` : end === "until" ? `;UNTIL=${until.replace(/-/g, "")}` : ""}`;
          ctx.$("[data-next]").innerHTML = out.map((d, i) => `<li style="--c:${i ? "var(--tsl-fg-subtle)" : "var(--xp-accent)"}">${d.toLocaleDateString("es-MX", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>`).join("") || '<li class="tsl-muted">Sin ocurrencias.</li>';
        };
        ctx.on(ctx.$("[data-form]"), "input", render);
        ctx.on(ctx.$("[data-form]"), "change", render);
        ctx.on(ctx.$("[data-days]"), "click", (e) => {
          const b = e.target.closest("[data-wd]");
          if (!b) return;
          b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
          render();
        });
        ctx.on(ctx.$("[data-form]"), "click", (e) => e.target.closest("[data-step]") && ctx.timeout(0, render));
        render();
      }
    },

    holidays: {
      html: `
        ${head("Calendarios · holidays.tsx", "Vacaciones y permisos", "Solicita días libres: se cuentan los días hábiles (sin fines de semana), se descuentan de tu saldo y se muestran en la franja del equipo.")}
        <div class="tsl-grid" style="--min:180px"><div class="tsl-stat"><span class="tsl-eyebrow">Saldo de vacaciones</span><span class="tsl-stat__value" data-bal></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Pendientes</span><span class="tsl-stat__value" data-pend></span></div></div>
        <form class="xp-panel tsl-row" data-form><label class="tsl-field"><span class="tsl-label">Desde</span><input type="date" class="tsl-input" data-from required /></label><label class="tsl-field"><span class="tsl-label">Hasta</span><input type="date" class="tsl-input" data-to required /></label><label class="tsl-field"><span class="tsl-label">Tipo</span><select class="tsl-select" data-type><option>Vacaciones</option><option>Enfermedad</option><option>Personal</option></select></label><span class="tsl-muted" data-days style="align-self:flex-end;padding-bottom:8px"></span><button type="submit" class="tsl-btn tsl-btn--primary" style="align-self:flex-end">Solicitar</button></form>
        <ul class="tsl-list" data-list></ul>
        <div class="xp-panel"><span class="tsl-eyebrow">Disponibilidad del equipo · próximos 14 días</span><div data-strip class="tsl-stack" style="margin-top:10px;--gap:4px"></div></div>`,
      setup(root, ctx) {
        let balance = 15;
        const reqs = [{ who: "Ana", from: TESELA_XP.iso(new Date(Date.now() + 3 * 864e5)), to: TESELA_XP.iso(new Date(Date.now() + 5 * 864e5)), type: "Vacaciones", days: 3, state: "Aprobada" }];
        const bizDays = (a, b) => {
          let n = 0;
          for (let d = new Date(a + "T00:00"); d <= new Date(b + "T00:00"); d.setDate(d.getDate() + 1)) if (d.getDay() % 6) n++;
          return n;
        };
        const from = ctx.$("[data-from]");
        const to = ctx.$("[data-to]");
        from.value = TESELA_XP.iso(new Date(Date.now() + 7 * 864e5));
        to.value = TESELA_XP.iso(new Date(Date.now() + 9 * 864e5));
        const render = () => {
          const mine = reqs.filter((r) => r.who === "Tú");
          ctx.$("[data-bal]").textContent = `${balance - mine.filter((r) => r.type === "Vacaciones" && r.state !== "Rechazada").reduce((s, r) => s + r.days, 0)} días`;
          ctx.$("[data-pend]").textContent = String(mine.filter((r) => r.state === "Pendiente").length);
          ctx.$("[data-days]").textContent = from.value && to.value && from.value <= to.value ? `${bizDays(from.value, to.value)} días hábiles` : "";
          ctx.$("[data-list]").innerHTML = reqs.map((r, i) => `<li><span class="tsl-avatar tsl-avatar--sm">${r.who[0]}</span><div style="flex:1"><div class="tsl-list__title">${r.who} · ${r.type}</div><div class="tsl-list__desc">${r.from} → ${r.to} · ${r.days} días</div></div><span class="tsl-badge tsl-badge--${r.state === "Aprobada" ? "success" : r.state === "Pendiente" ? "warning" : "danger"}">${r.state}</span>${r.who === "Tú" && r.state === "Pendiente" ? `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cancel="${i}">Cancelar</button>` : ""}</li>`).join("");
          const people = ["Tú", "Ana", "Leo", "Sara"];
          ctx.$("[data-strip]").innerHTML = people.map((p) => `<div class="tsl-row" style="flex-wrap:nowrap;--gap:3px"><span style="width:44px;font-size:11px">${p}</span>${Array.from({ length: 14 }, (_, k) => {
            const d = new Date(Date.now() + k * 864e5);
            const day = TESELA_XP.iso(d);
            const off = reqs.some((r) => r.who === p && r.state !== "Rechazada" && day >= r.from && day <= r.to);
            return `<span title="${day}" style="flex:1;height:14px;border-radius:3px;background:${off ? "var(--tsl-warning)" : d.getDay() % 6 ? "var(--tsl-surface-strong)" : "transparent"}"></span>`;
          }).join("")}</div>`).join("");
        };
        ctx.on(ctx.$("[data-form]"), "input", render);
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          if (from.value > to.value) return ctx.toast({ title: "La fecha de fin debe ser posterior al inicio", variant: "warning" });
          const days = bizDays(from.value, to.value);
          if (!days) return ctx.toast({ title: "Ese rango no tiene días hábiles", variant: "warning" });
          const req = { who: "Tú", from: from.value, to: to.value, type: ctx.$("[data-type]").value, days, state: "Pendiente" };
          reqs.push(req);
          ctx.timeout(2500, () => {
            req.state = "Aprobada";
            ctx.toast({ title: "Días libres aprobados 🌴", description: `${req.from} → ${req.to}` });
            render();
          });
          render();
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-cancel]");
          if (!b) return;
          reqs.splice(Number(b.dataset.cancel), 1);
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // PERFIL
  // ==========================================================================
  const team = [["Ana López", "Diseño", "Líder de diseño", "online"], ["Leo Kim", "Ingeniería", "Ingeniero staff", "busy"], ["Sara Ruiz", "Producto", "PM", "away"], ["Tom Weber", "Ingeniería", "Frontend", "online"], ["Mia Chen", "Diseño", "Diseñadora de marca", "offline"], ["Noah Patel", "Ingeniería", "SRE", "online"], ["Lucía Gómez", "Marketing", "Growth", "away"], ["Omar Haddad", "Producto", "Diseñador-PM", "online"], ["Eva Novak", "Marketing", "Contenido", "offline"], ["Kai Tanaka", "Ingeniería", "Backend", "busy"]];
  const statusEs = { online: "en línea", busy: "ocupado", away: "ausente", offline: "desconectado" };
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

  X.addMany("profile", {
    hero: {
      html: `
        ${head("Perfil · hero.tsx", "Portada de perfil", "Banner, avatar y pestañas. Seguir se alterna; “Editar bio” la vuelve editable en el mismo lugar.")}
        <div class="tsl-card"><div style="height:140px;background:radial-gradient(circle at 20% 30%,var(--xp-accent),transparent 50%),radial-gradient(circle at 80% 60%,var(--tsl-info),transparent 50%),var(--tsl-bg-elevated)"></div>
          <div class="tsl-card__body tsl-stack" style="margin-top:-56px">
            <div class="tsl-row" style="align-items:flex-end"><span class="tsl-avatar" data-status="online" style="--_s:96px;box-shadow:0 0 0 4px var(--tsl-bg-elevated)">LI</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn" data-edit>Editar bio</button><button type="button" class="tsl-btn tsl-btn--primary" data-follow aria-pressed="false">Seguir</button></div>
            <div><h3 class="xp-title" style="margin:0">Luis Islas</h3><span class="tsl-muted">@luis · CDMX · <span data-f>842</span> seguidores</span></div>
            <p data-bio style="max-width:620px;line-height:1.6">Construyo interfaces tranquilas y sin dependencias. Ahora mismo: tesela-ui.</p>
            <tsl-tabs><div class="tsl-tabs__list"><button class="tsl-tabs__tab" data-tab="o">Resumen</button><button class="tsl-tabs__tab" data-tab="p">Proyectos</button><button class="tsl-tabs__tab" data-tab="a">Actividad</button></div>
              <div class="tsl-tabs__panel" data-panel="o"><div class="tsl-grid" style="--min:150px"><div class="tsl-stat"><span class="tsl-eyebrow">Proyectos</span><span class="tsl-stat__value">12</span></div><div class="tsl-stat"><span class="tsl-eyebrow">Estrellas</span><span class="tsl-stat__value">3.4k</span></div><div class="tsl-stat"><span class="tsl-eyebrow">Racha</span><span class="tsl-stat__value">41d</span></div></div></div>
              <div class="tsl-tabs__panel" data-panel="p"><ul class="tsl-list"><li>tesela-ui <span class="tsl-list__end tsl-badge">★ 2.1k</span></li><li>tesela <span class="tsl-list__end tsl-badge">★ 1.3k</span></li></ul></div>
              <div class="tsl-tabs__panel" data-panel="a"><ol class="tsl-timeline"><li>Hizo merge de #482<div class="tsl-timeline__meta">hace 2 h</div></li><li>Lanzó v1.3.0<div class="tsl-timeline__meta">hace 1 d</div></li></ol></div>
            </tsl-tabs>
          </div></div>`,
      setup(root, ctx) {
        let f = 842;
        ctx.on(ctx.$("[data-follow]"), "click", (e) => {
          const on = e.target.getAttribute("aria-pressed") !== "true";
          e.target.setAttribute("aria-pressed", String(on));
          e.target.textContent = on ? "Siguiendo" : "Seguir";
          e.target.className = `tsl-btn ${on ? "" : "tsl-btn--primary"}`;
          ctx.$("[data-f]").textContent = String((f += on ? 1 : -1));
        });
        const bio = ctx.$("[data-bio]");
        ctx.on(ctx.$("[data-edit]"), "click", (e) => {
          const editing = bio.isContentEditable;
          bio.contentEditable = String(!editing);
          bio.className = editing ? "" : "xp-editor";
          e.target.textContent = editing ? "Editar bio" : "Guardar bio";
          if (editing) ctx.toast({ title: "Bio guardada" });
          else bio.focus();
        });
      }
    },

    "hover-card": {
      html: `
        ${head("Perfil · hover-card.tsx", "Tarjeta al pasar el cursor", "Pasa el cursor (o enfoca) una mención: tras una breve espera aparece una tarjeta con conexiones en común y un botón rápido de seguir.")}
        <div class="xp-panel xp-rel" style="line-height:2;font-size:14px" data-text>
          Gracias a ${team.slice(0, 4).map((p, i) => `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-p="${i}" style="color:var(--xp-accent);padding:0 4px;height:auto">@${p[0].split(" ")[0].toLowerCase()}</button>`).join(", ")} por revisar la nueva galería.
          <div class="tsl-card" data-card hidden style="position:absolute;z-index:5;width:280px;box-shadow:var(--tsl-shadow-lg);background:var(--tsl-bg-elevated)"><div class="tsl-card__body tsl-stack" style="--gap:8px;line-height:1.5;font-size:12px"></div></div>
        </div>`,
      setup(root, ctx) {
        const card = ctx.$("[data-card]");
        const host = ctx.$("[data-text]");
        const following = new Set();
        let timer = 0;
        let hideTimer = 0;
        const show = (btn) => {
          const [name, dept, role, status] = team[btn.dataset.p];
          const body = card.firstElementChild;
          body.innerHTML = `<div class="tsl-row"><span class="tsl-avatar" data-status="${status}">${initials(name)}</span><div><strong></strong><div class="tsl-muted"></div></div></div><div class="tsl-muted">${3 + Number(btn.dataset.p) * 4} conexiones en común</div><button type="button" class="tsl-btn tsl-btn--sm ${following.has(name) ? "" : "tsl-btn--primary"}" data-follow>${following.has(name) ? "Siguiendo" : "Seguir"}</button>`;
          body.querySelector("strong").textContent = name;
          body.querySelector(".tsl-muted").textContent = `${role} · ${dept}`;
          body.querySelector("[data-follow]").addEventListener("click", () => {
            following.has(name) ? following.delete(name) : following.add(name);
            show(btn);
          });
          const b = btn.getBoundingClientRect();
          const h = host.getBoundingClientRect();
          card.hidden = false;
          card.style.left = `${Math.max(0, Math.min(h.width - 290, b.left - h.left))}px`;
          card.style.top = `${b.bottom - h.top + 6}px`;
        };
        const schedule = (btn) => {
          clearTimeout(hideTimer);
          clearTimeout(timer);
          timer = setTimeout(() => show(btn), 350);
        };
        const hide = () => {
          clearTimeout(timer);
          hideTimer = setTimeout(() => (card.hidden = true), 200);
        };
        ctx.$$("[data-p]").forEach((b) => {
          ctx.on(b, "pointerenter", () => schedule(b));
          ctx.on(b, "focus", () => show(b));
          ctx.on(b, "pointerleave", hide);
        });
        ctx.on(card, "pointerenter", () => clearTimeout(hideTimer));
        ctx.on(card, "pointerleave", hide);
        ctx.onCleanup(() => (clearTimeout(timer), clearTimeout(hideTimer)));
      }
    },

    "team-grid": {
      html: `
        ${head("Perfil · team-grid.tsx", "Cuadrícula del equipo", "Filtra por departamento o nombre; haz clic en una persona para abrir sus detalles en un panel lateral.")}
        <div class="tsl-row"><input class="tsl-input xp-search" data-q placeholder="Buscar personas…" aria-label="Buscar" /><div class="tsl-row" style="--gap:6px" data-deps></div></div>
        <div class="tsl-grid" style="--min:180px" data-grid></div>
        <dialog class="tsl-dialog tsl-dialog--drawer" id="tg-drawer"><button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--icon tsl-btn--sm tsl-dialog__close" data-tsl-close aria-label="Cerrar">✕</button><div class="tsl-dialog__body tsl-stack" data-detail style="padding-top:28px"></div></dialog>`,
      setup(root, ctx) {
        const deps = ["Todos", ...new Set(team.map((t) => t[1]))];
        let dep = "Todos";
        ctx.$("[data-deps]").innerHTML = deps.map((d) => `<button type="button" class="tsl-chip" data-d="${d}" aria-pressed="${d === "Todos"}">${d}</button>`).join("");
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-grid]").innerHTML = team
            .map((p, i) => [p, i])
            .filter(([p]) => (dep === "Todos" || p[1] === dep) && p[0].toLowerCase().includes(q))
            .map(([p, i]) => `<button type="button" class="tsl-card tsl-card--interactive" data-i="${i}" style="padding:18px;text-align:center;color:inherit;font:inherit;cursor:pointer"><span class="tsl-avatar tsl-avatar--lg" data-status="${p[3]}" style="margin:0 auto">${initials(p[0])}</span><div style="margin-top:10px"><strong>${p[0]}</strong></div><div class="tsl-muted" style="font-size:11px">${p[2]}</div><span class="tsl-badge" style="margin-top:8px">${p[1]}</span></button>`)
            .join("") || '<div class="tsl-empty"><div class="tsl-empty__title">Nadie coincide</div></div>';
        };
        ctx.on(ctx.$("[data-deps]"), "click", (e) => {
          const b = e.target.closest("[data-d]");
          if (!b) return;
          dep = b.dataset.d;
          ctx.$$("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          render();
        });
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const c = e.target.closest("[data-i]");
          if (!c) return;
          const [name, d, role, status] = team[c.dataset.i];
          ctx.$("[data-detail]").innerHTML = `<span class="tsl-avatar" data-status="${status}" style="--_s:72px">${initials(name)}</span><h3 class="xp-title" style="margin:0">${name}</h3><span class="tsl-muted">${role} · ${d}</span><dl class="xp-kv"><dt>Correo</dt><dd>${name.split(" ")[0].toLowerCase()}@acme.dev</dd><dt>Estado</dt><dd>${statusEs[status]}</dd><dt>Hora local</dt><dd>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd></dl><div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary tsl-btn--sm" data-tsl-close>Mensaje</button><button type="button" class="tsl-btn tsl-btn--sm" data-tsl-close>Cerrar</button></div>`;
          ctx.$("#tg-drawer").showModal();
        });
        render();
      }
    },

    directory: {
      html: `
        ${head("Perfil · directory.tsx", "Directorio de contactos", "Lista alfabética con índice de letras, búsqueda y favoritos; selecciona un contacto para ver sus detalles.")}
        <div class="xp-split" style="--cols:320px minmax(0,1fr)">
          <div class="xp-pane tsl-stack" style="--gap:8px"><input class="tsl-input" data-q placeholder="Buscar contactos…" aria-label="Buscar" /><div class="tsl-row" style="--gap:2px" data-letters></div><div class="xp-scroll" style="--max:360px" data-list></div></div>
          <div class="xp-pane" data-detail><div class="tsl-empty"><div class="tsl-empty__title">Selecciona un contacto</div></div></div>
        </div>`,
      setup(root, ctx) {
        const people = team.map((t) => t[0]).concat(["Ben Carter", "Iris Moreau", "Zoe Adams", "Hugo Silva", "Pablo Ortiz"]).sort((a, b) => a.split(" ")[1].localeCompare(b.split(" ")[1]));
        const favs = new Set(["Ana López"]);
        let sel = null;
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          const rows = people.filter((p) => p.toLowerCase().includes(q));
          const letters = [...new Set(rows.map((p) => p.split(" ")[1][0]))];
          ctx.$("[data-letters]").innerHTML = letters.map((l) => `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-l="${l}" style="padding:0 6px">${l}</button>`).join("");
          ctx.$("[data-list]").innerHTML = letters.map((l) => `<div class="tsl-eyebrow" id="dir-${l}" style="margin:10px 0 4px">${l}</div><ul class="tsl-list">${rows.filter((p) => p.split(" ")[1][0] === l).map((p) => `<li class="xp-select-item" data-p="${p}" aria-selected="${p === sel}"><span class="tsl-avatar tsl-avatar--sm">${initials(p)}</span><span style="flex:1">${p}</span><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-fav="${p}" aria-label="Favorito" aria-pressed="${favs.has(p)}">${favs.has(p) ? "★" : "☆"}</button></li>`).join("")}</ul>`).join("") || '<p class="tsl-muted">Sin contactos.</p>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-letters]"), "click", (e) => {
          const b = e.target.closest("[data-l]");
          if (b) ctx.$(`#dir-${b.dataset.l}`).scrollIntoView({ block: "start", behavior: "smooth" });
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const f = e.target.closest("[data-fav]");
          if (f) {
            favs.has(f.dataset.fav) ? favs.delete(f.dataset.fav) : favs.add(f.dataset.fav);
            return render();
          }
          const li = e.target.closest("[data-p]");
          if (!li) return;
          sel = li.dataset.p;
          const info = team.find((t) => t[0] === sel) || [sel, "Externo", "Socio", "offline"];
          ctx.$("[data-detail]").innerHTML = `<div class="tsl-stack"><span class="tsl-avatar tsl-avatar--lg" data-status="${info[3]}">${initials(sel)}</span><h3 class="xp-title" style="margin:0">${sel}${favs.has(sel) ? " ★" : ""}</h3><span class="tsl-muted">${info[2]} · ${info[1]}</span><dl class="xp-kv"><dt>Correo</dt><dd>${sel.split(" ")[0].toLowerCase()}@acme.dev</dd><dt>Teléfono</dt><dd>+52 55 ${String(sel.length * 731).padStart(4, "0")} 1200</dd></dl><div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-tsl-copy="${sel.split(" ")[0].toLowerCase()}@acme.dev">Copiar correo</button></div></div>`;
          render();
        });
        render();
      }
    },

    "compact-card": {
      html: `
        ${head("Perfil · compact-card.tsx", "Tarjeta compacta de usuario", "Define tu estado desde el menú y añade un mensaje personalizado con un emoji y un tiempo de borrado automático.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(360px,100%)"><div class="tsl-card__body tsl-stack">
          <div class="tsl-row"><span class="tsl-avatar" data-avatar data-status="online">LI</span><div style="flex:1"><strong>Luis Islas</strong><div class="tsl-muted" style="font-size:11px" data-msg>Sin mensaje de estado</div></div>
            <tsl-menu align="end" data-menu><button type="button" class="tsl-btn tsl-btn--sm" data-tsl-trigger><span data-label>En línea</span> ▾</button><div class="tsl-menu__list"><button type="button" class="tsl-menu__item" data-value="online"><span class="tsl-dot tsl-dot--success"></span> En línea</button><button type="button" class="tsl-menu__item" data-value="away"><span class="tsl-dot tsl-dot--warning"></span> Ausente</button><button type="button" class="tsl-menu__item" data-value="busy"><span class="tsl-dot tsl-dot--danger"></span> No molestar</button><button type="button" class="tsl-menu__item" data-value="offline"><span class="tsl-dot"></span> Invisible</button></div></tsl-menu></div>
          <form class="tsl-row" data-form style="flex-wrap:nowrap"><select class="tsl-select" style="width:64px" data-emoji aria-label="Emoji"><option>💬</option><option>🌴</option><option>🎧</option><option>🍕</option><option>🤒</option></select><input class="tsl-input" data-text placeholder="¿Cuál es tu estado?" maxlength="40" aria-label="Mensaje de estado" /><select class="tsl-select" style="width:auto" data-clear aria-label="Borrar después de"><option value="0">No borrar</option><option value="10">10 s</option><option value="60">1 min</option></select><button type="submit" class="tsl-btn tsl-btn--sm">Definir</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        const labels = { online: "En línea", away: "Ausente", busy: "No molestar", offline: "Invisible" };
        let clearTimer = 0;
        ctx.on(ctx.$("[data-menu]"), "tsl-select", (e) => {
          ctx.$("[data-avatar]").dataset.status = e.detail.value;
          ctx.$("[data-label]").textContent = labels[e.detail.value];
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const text = ctx.$("[data-text]").value.trim();
          ctx.$("[data-msg]").textContent = text ? `${ctx.$("[data-emoji]").value} ${text}` : "Sin mensaje de estado";
          clearTimeout(clearTimer);
          const secs = Number(ctx.$("[data-clear]").value);
          if (secs && text) clearTimer = setTimeout(() => (ctx.$("[data-msg]").textContent = "Sin mensaje de estado"), secs * 1000);
        });
        ctx.onCleanup(() => clearTimeout(clearTimer));
      }
    },

    "org-chart": {
      html: `
        ${head("Perfil · org-chart.tsx", "Organigrama", "Árbol jerárquico plegable con conteo de reportes directos. La búsqueda resalta a una persona y expande su cadena de mando.")}
        <input class="tsl-input xp-search" data-q placeholder="Buscar a alguien…" aria-label="Buscar a alguien" />
        <div class="xp-panel" data-tree style="overflow:auto"></div>`,
      setup(root, ctx) {
        const org = ["Luis Islas · CEO", [["Ana López · Líder de diseño", [["Mia Chen · Marca", []], ["Omar Haddad · Diseño de producto", []]]], ["Leo Kim · CTO", [["Tom Weber · Frontend", []], ["Noah Patel · SRE", []], ["Kai Tanaka · Backend", []]]], ["Sara Ruiz · Directora de Producto", [["Lucía Gómez · Growth", [["Eva Novak · Contenido", []]]]]]]];
        const count = ([, kids]) => kids.reduce((s, k) => s + 1 + count(k), 0);
        const node = (n, q) => {
          const [label, kids] = n;
          const hit = q && label.toLowerCase().includes(q);
          const has = (x) => x[0].toLowerCase().includes(q) || x[1].some(has);
          const open = !q || kids.some(has);
          const tag = `<span class="tsl-chip" style="color:var(--tsl-fg);${hit ? "background:var(--xp-accent);color:#fff;border-color:transparent" : ""}"><span class="tsl-avatar tsl-avatar--sm">${initials(label)}</span> ${esc(label)}${kids.length ? ` <span class="tsl-badge">${count(n)}</span>` : ""}</span>`;
          return kids.length ? `<details${open ? " open" : ""} style="margin-left:14px"><summary style="cursor:pointer;margin:4px 0">${tag}</summary><div style="border-left:1px dashed var(--tsl-border-strong);margin-left:10px">${kids.map((k) => node(k, q)).join("")}</div></details>` : `<div style="margin:4px 0 4px 28px">${tag}</div>`;
        };
        const render = () => (ctx.$("[data-tree]").innerHTML = node(org, ctx.$("[data-q]").value.trim().toLowerCase()));
        ctx.on(ctx.$("[data-q]"), "input", render);
        render();
      }
    },

    skills: {
      html: `
        ${head("Perfil · skills.tsx", "Matriz de habilidades", "Gráfico de radar controlado por los deslizadores; superpón el promedio del equipo para comparar.")}
        <div class="tsl-grid" style="--min:300px;align-items:center">
          <svg viewBox="-130 -130 260 260" style="max-width:340px;margin:0 auto" data-radar></svg>
          <div class="tsl-stack" data-sliders><label class="tsl-choice"><input type="checkbox" role="switch" class="tsl-switch" data-team /> Mostrar promedio del equipo</label></div>
        </div>`,
      setup(root, ctx) {
        const skills = [["Diseño", 8], ["Frontend", 9], ["Backend", 5], ["Redacción", 7], ["Liderazgo", 6], ["Datos", 4]];
        const avg = [6, 7, 7, 5, 6, 6];
        ctx.$("[data-sliders]").insertAdjacentHTML("afterbegin", skills.map(([s, v], i) => `<label class="tsl-row" style="flex-wrap:nowrap"><span style="width:90px">${s}</span><input type="range" class="tsl-range" min="0" max="10" value="${v}" data-i="${i}" aria-label="${s}" /><strong class="xp-mono" data-v="${i}">${v}</strong></label>`).join(""));
        const pt = (i, v) => {
          const a = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
          return [Math.cos(a) * v * 10, Math.sin(a) * v * 10];
        };
        const render = () => {
          const vals = ctx.$$("[data-i]").map((r) => Number(r.value));
          vals.forEach((v, i) => (ctx.$(`[data-v="${i}"]`).textContent = String(v)));
          const poly = (vs) => vs.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
          ctx.$("[data-radar]").innerHTML =
            [2, 4, 6, 8, 10].map((r) => `<polygon points="${poly(skills.map(() => r))}" fill="none" stroke="currentColor" stroke-opacity="0.12"/>`).join("") +
            skills.map((s, i) => {
              const [x, y] = pt(i, 11.8);
              const [lx, ly] = pt(i, 10);
              return `<line x1="0" y1="0" x2="${lx}" y2="${ly}" stroke="currentColor" stroke-opacity="0.12"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="9" style="fill:var(--tsl-fg-muted)">${s[0]}</text>`;
            }).join("") +
            (ctx.$("[data-team]").checked ? `<polygon points="${poly(avg)}" fill="var(--tsl-warning)" fill-opacity="0.15" stroke="var(--tsl-warning)" stroke-dasharray="4 3"/>` : "") +
            `<polygon points="${poly(vals)}" fill="var(--xp-accent)" fill-opacity="0.25" stroke="var(--xp-accent)" stroke-width="2"/>` +
            vals.map((v, i) => `<circle cx="${pt(i, v)[0]}" cy="${pt(i, v)[1]}" r="3" fill="var(--xp-accent)"/>`).join("");
        };
        ctx.on(ctx.$("[data-sliders]"), "input", render);
        ctx.on(ctx.$("[data-team]"), "change", render);
        render();
      }
    },

    "presence-rail": {
      html: `
        ${head("Perfil · presence-rail.tsx", "Barra de presencia", "Quién está en línea y en qué sala de voz. Entra o sal de las salas, silénciate y mira pulsar los indicadores de quien habla.")}
        <div class="xp-split" style="--cols:260px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" style="--gap:6px"><span class="tsl-eyebrow">En línea · <span data-online></span></span><div data-people class="tsl-stack" style="--gap:4px"></div></aside>
          <div class="xp-pane tsl-stack" data-rooms></div>
        </div>`,
      setup(root, ctx) {
        const rooms = { "Sala de diseño": ["Ana López", "Mia Chen"], "Standup de ingeniería": ["Leo Kim", "Noah Patel", "Tom Weber"], "Sala de descanso": [] };
        let me = null;
        let muted = false;
        let speaking = new Set();
        const render = () => {
          const online = team.filter((t) => t[3] !== "offline");
          ctx.$("[data-online]").textContent = String(online.length + 1);
          ctx.$("[data-people]").innerHTML = [["Luis Islas (tú)", "", "", "online"]].concat(online).map(([n, , , s]) => `<div class="tsl-row" style="--gap:8px"><span class="tsl-avatar tsl-avatar--sm" data-status="${s}">${initials(n)}</span><span style="font-size:12px">${n}</span></div>`).join("");
          ctx.$("[data-rooms]").innerHTML = Object.entries(rooms)
            .map(([room, ppl]) => {
              const inside = me === room;
              const list = inside ? ppl.concat("Luis Islas") : ppl;
              return `<div class="tsl-card tsl-card--flat" style="${inside ? "border-color:var(--xp-accent)" : ""}"><div class="tsl-card__body tsl-stack" style="--gap:8px;padding:14px"><div class="tsl-row"><strong>🔊 ${room}</strong><span class="tsl-muted">${list.length}</span><span class="tsl-spacer"></span>${inside ? `<button type="button" class="tsl-btn tsl-btn--sm" data-mute>${muted ? "🔇 Activar micrófono" : "🎙 Silenciar"}</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--danger" data-leave>Salir</button>` : `<button type="button" class="tsl-btn tsl-btn--sm" data-join="${room}">Entrar</button>`}</div><div class="tsl-row">${list.map((p) => `<span class="tsl-avatar tsl-avatar--sm" style="${speaking.has(p) ? "box-shadow:0 0 0 2px var(--tsl-success)" : ""}" title="${p}">${initials(p)}</span>`).join("") || '<span class="tsl-muted">Vacía: sé el primero</span>'}</div></div></div>`;
            })
            .join("");
        };
        ctx.on(ctx.$("[data-rooms]"), "click", (e) => {
          const j = e.target.closest("[data-join]");
          if (j) me = j.dataset.join;
          if (e.target.closest("[data-leave]")) me = null;
          if (e.target.closest("[data-mute]")) muted = !muted;
          render();
        });
        ctx.every(700, () => {
          speaking = new Set();
          Object.values(rooms).forEach((ppl) => ppl.forEach((p) => Math.random() < 0.3 && speaking.add(p)));
          if (me && !muted && Math.random() < 0.4) speaking.add("Luis Islas");
          render();
        });
        render();
      }
    },

    introductions: {
      html: `
        ${head("Perfil · introductions.tsx", "Presentaciones sugeridas", "Conectar envía una solicitud (pendiente → conectado); omitir trae la siguiente sugerencia.")}
        <div class="tsl-row"><span class="tsl-badge tsl-badge--accent" data-count>0 conexiones</span></div>
        <div class="tsl-grid" style="--min:220px" data-grid></div>`,
      setup(root, ctx) {
        const pool = team.slice().reverse().map((t, i) => ({ name: t[0], role: t[2], mutual: 2 + ((i * 3) % 9), state: "new" }));
        let shown = pool.splice(0, 3);
        let connected = 0;
        const render = () => {
          ctx.$("[data-count]").textContent = `${connected} conexiones`;
          ctx.$("[data-grid]").innerHTML = shown.map((p, i) => `<div class="tsl-card tsl-card--flat"><div class="tsl-card__body tsl-stack" style="align-items:center;text-align:center"><span class="tsl-avatar tsl-avatar--lg">${initials(p.name)}</span><strong>${p.name}</strong><span class="tsl-muted" style="font-size:11px">${p.role} · ${p.mutual} en común</span><div class="tsl-row">${p.state === "new" ? `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-c="${i}">Conectar</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-s="${i}">Omitir</button>` : p.state === "pending" ? '<span class="tsl-badge tsl-badge--warning">Pendiente…</span>' : '<span class="tsl-badge tsl-badge--success">✓ Conectado</span>'}</div></div></div>`).join("") || '<div class="tsl-empty"><div class="tsl-empty__title">No hay más sugerencias</div></div>';
        };
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const c = e.target.closest("[data-c]");
          const s = e.target.closest("[data-s]");
          if (c) {
            const p = shown[c.dataset.c];
            p.state = "pending";
            ctx.timeout(1200, () => {
              p.state = "done";
              connected++;
              render();
            });
          }
          if (s) {
            shown.splice(Number(s.dataset.s), 1);
            if (pool.length) shown.push(pool.shift());
          }
          render();
        });
        render();
      }
    },

    credentials: {
      html: `
        ${head("Perfil · credentials.tsx", "Credenciales de seguridad", "Añade claves públicas SSH: se valida el formato y se calcula en el navegador una huella SHA-256 real.")}
        <ul class="tsl-list" data-list></ul>
        <form class="xp-panel tsl-stack" data-form novalidate><label class="tsl-field"><span class="tsl-label">Título</span><input class="tsl-input" data-title-in placeholder="Laptop del trabajo" /></label><label class="tsl-field"><span class="tsl-label">Clave pública</span><textarea class="tsl-textarea xp-mono" data-key placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA… tu@host" style="font-size:11.5px"></textarea></label><span class="tsl-error" data-err></span><button type="submit" class="tsl-btn tsl-btn--primary" style="align-self:flex-start">Añadir clave SSH</button></form>`,
      setup(root, ctx) {
        const keys = [{ title: "MacBook Pro", type: "ED25519", fp: "SHA256:3Fq8o0vC1y6m1rGqk3c9lJxW0yZ2tq7e7mR9pLk4d2A", added: "2026-08-12" }];
        const render = () => (ctx.$("[data-list]").innerHTML = keys.map((k, i) => `<li><span style="font-size:20px">🔑</span><div style="flex:1;min-width:0"><div class="tsl-list__title">${esc(k.title)} <span class="tsl-badge">${k.type}</span></div><div class="tsl-list__desc xp-mono" style="overflow:hidden;text-overflow:ellipsis">${k.fp}</div><div class="tsl-list__desc">Añadida el ${k.added}</div></div><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--danger" data-rm="${i}">Eliminar</button></li>`).join("") || '<li class="tsl-muted">Sin claves.</li>');
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          keys.splice(Number(b.dataset.rm), 1);
          render();
        });
        ctx.on(ctx.$("[data-form]"), "submit", async (e) => {
          e.preventDefault();
          const raw = ctx.$("[data-key]").value.trim();
          const m = /^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp256)\s+([A-Za-z0-9+/]+={0,2})(\s+.*)?$/.exec(raw);
          let err = "";
          let bytes = null;
          if (!m) err = "Se esperaba “ssh-ed25519 | ssh-rsa | ecdsa-sha2-nistp256 <base64> [comentario]”.";
          else {
            try {
              bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
              if (bytes.length < 32) err = "El material de la clave es demasiado corto.";
            } catch (_) {
              err = "El cuerpo de la clave no es base64 válido.";
            }
          }
          ctx.$("[data-err]").textContent = err;
          ctx.$("[data-key]").setAttribute("aria-invalid", String(Boolean(err)));
          if (err) return;
          let fp;
          try {
            const digest = await crypto.subtle.digest("SHA-256", bytes);
            fp = `SHA256:${btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/=+$/, "")}`;
          } catch (_) {
            fp = "SHA256:(requiere https o localhost)";
          }
          keys.push({ title: ctx.$("[data-title-in]").value || (m[3] || "").trim() || "Clave sin título", type: { "ssh-ed25519": "ED25519", "ssh-rsa": "RSA", "ecdsa-sha2-nistp256": "ECDSA" }[m[1]], fp, added: TESELA_XP.iso(new Date()) });
          e.target.reset();
          ctx.toast({ title: "Clave SSH añadida", description: fp.slice(0, 24) + "…" });
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // HILOS Y COMENTARIOS
  // ==========================================================================
  X.addMany("threads", {
    "inline-thread": {
      html: `
        ${head("Hilos · inline-thread.tsx", "Hilo en línea", "Respuestas anidadas a cualquier profundidad, ramas plegables y conteo de respuestas en vivo.")}
        <div class="tsl-stack" data-root style="max-width:720px;width:100%"></div>
        <form class="tsl-row" data-new style="max-width:720px;width:100%;flex-wrap:nowrap"><input class="tsl-input" placeholder="Inicia un hilo nuevo…" required aria-label="Comentario nuevo" /><button type="submit" class="tsl-btn tsl-btn--primary">Comentar</button></form>`,
      setup(root, ctx) {
        let id = 0;
        const make = (who, text, replies = []) => ({ id: ++id, who, text, replies, open: true });
        const data = [make("Ana", "¿La galería debería usar el modo oscuro por defecto?", [make("Leo", "Sí, coincide con la documentación.", [make("Ana", "De acuerdo, lo publicamos.")]), make("Sara", "Respetemos también la configuración del sistema.")])];
        const count = (c) => c.replies.reduce((s, r) => s + 1 + count(r), 0);
        const find = (list, n) => list.reduce((f, c) => f || (c.id === n ? c : find(c.replies, n)), null);
        const node = (c, depth) => `<div style="margin-left:${depth ? 18 : 0}px;${depth ? "border-left:1px solid var(--tsl-border-strong);padding-left:12px" : ""}"><div class="tsl-row" style="--gap:8px;padding:6px 0"><span class="tsl-avatar tsl-avatar--sm">${c.who[0]}</span><strong>${esc(c.who)}</strong><span style="flex:1">${esc(c.text)}</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-reply="${c.id}">Responder</button>${c.replies.length ? `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-toggle="${c.id}">${c.open ? "Ocultar" : `Mostrar ${count(c)}`}</button>` : ""}</div><form class="tsl-row" data-form="${c.id}" hidden style="flex-wrap:nowrap;margin:4px 0 8px 32px"><input class="tsl-input" placeholder="Responder a ${esc(c.who)}…" required aria-label="Respuesta" /><button type="submit" class="tsl-btn tsl-btn--sm">Responder</button></form>${c.open ? c.replies.map((r) => node(r, depth + 1)).join("") : ""}</div>`;
        const render = () => (ctx.$("[data-root]").innerHTML = data.map((c) => `<div class="xp-panel" style="padding:10px 14px">${node(c, 0)}</div>`).join(""));
        ctx.on(ctx.$("[data-root]"), "click", (e) => {
          const r = e.target.closest("[data-reply]");
          const t = e.target.closest("[data-toggle]");
          if (r) {
            const f = ctx.$(`[data-form="${r.dataset.reply}"]`);
            f.hidden = !f.hidden;
            if (!f.hidden) f.querySelector("input").focus();
          }
          if (t) {
            const c = find(data, Number(t.dataset.toggle));
            c.open = !c.open;
            render();
          }
        });
        ctx.on(ctx.$("[data-root]"), "submit", (e) => {
          e.preventDefault();
          const c = find(data, Number(e.target.dataset.form));
          c.replies.push(make("Tú", e.target.querySelector("input").value));
          c.open = true;
          render();
        });
        ctx.on(ctx.$("[data-new]"), "submit", (e) => {
          e.preventDefault();
          data.push(make("Tú", e.target.querySelector("input").value));
          e.target.reset();
          render();
        });
        render();
      }
    },

    "side-panel": {
      html: `
        ${head("Hilos · side-panel.tsx", "Comentarios en panel lateral", "Selecciona texto en el documento y haz clic en “Comentar” para anclar una nota. Al hacer clic en un resaltado se enfoca su comentario y viceversa.")}
        <div class="xp-split" style="--cols:minmax(0,1fr) 300px">
          <div class="xp-pane xp-rel"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-add hidden style="position:absolute;z-index:3">💬 Comentar</button><article data-doc style="line-height:1.9;font-size:14px;max-width:620px">
            <p>tesela-ui es una biblioteca de componentes <mark class="xp-mark" data-c="1">sin dependencias</mark>. Cada componente es HTML puro, tokens de CSS y una capa ligera de elementos personalizados.</p>
            <p>La galería ahora muestra experimentos funcionales en lugar de vistas previas estáticas, y cada uno expone su código fuente real en el panel de código.</p>
          </article></div>
          <aside class="xp-pane tsl-stack" data-side></aside>
        </div>`,
      setup(root, ctx) {
        const doc = ctx.$("[data-doc]");
        const add = ctx.$("[data-add]");
        let n = 1;
        const comments = { 1: { who: "Ana", text: "Digamos “sin dependencias en tiempo de ejecución” para ser precisos." } };
        let active = null;
        let range = null;
        const render = () => {
          ctx.$("[data-side]").innerHTML = Object.entries(comments).map(([id, c]) => `<div class="tsl-card tsl-card--flat" data-cid="${id}" style="padding:12px;cursor:pointer;${Number(id) === active ? "border-color:var(--xp-accent)" : ""}"><div class="tsl-row" style="--gap:6px"><span class="tsl-avatar tsl-avatar--sm">${c.who[0]}</span><strong>${esc(c.who)}</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-resolve="${id}">Resolver</button></div><p style="margin-top:6px;font-size:12px">${esc(c.text)}</p></div>`).join("") || '<p class="tsl-muted">Sin comentarios. Selecciona texto para añadir uno.</p>';
          ctx.$$("[data-doc] mark").forEach((m) => (m.style.outline = Number(m.dataset.c) === active ? "2px solid var(--xp-accent)" : ""));
        };
        ctx.on(document, "selectionchange", () => {
          const sel = document.getSelection();
          if (!sel.rangeCount || sel.isCollapsed || !doc.contains(sel.anchorNode)) return;
          range = sel.getRangeAt(0).cloneRange();
          const r = range.getBoundingClientRect();
          const host = add.parentElement.getBoundingClientRect();
          add.hidden = false;
          add.style.left = `${r.right - host.left + 6}px`;
          add.style.top = `${r.top - host.top - 6}px`;
        });
        ctx.on(add, "mousedown", (e) => e.preventDefault());
        ctx.on(add, "click", () => {
          if (!range) return;
          const id = ++n;
          const mark = document.createElement("mark");
          mark.className = "xp-mark";
          mark.dataset.c = String(id);
          try {
            range.surroundContents(mark);
          } catch (_) {
            return ctx.toast({ title: "Selecciona texto dentro de un solo párrafo", variant: "warning" });
          }
          comments[id] = { who: "Tú", text: `Comentario sobre “${mark.textContent.slice(0, 40)}”` };
          active = id;
          add.hidden = true;
          document.getSelection().removeAllRanges();
          render();
        });
        ctx.on(doc, "click", (e) => {
          const m = e.target.closest("mark[data-c]");
          if (m) {
            active = Number(m.dataset.c);
            render();
          }
        });
        ctx.on(ctx.$("[data-side]"), "click", (e) => {
          const r = e.target.closest("[data-resolve]");
          if (r) {
            const m = ctx.$(`mark[data-c="${r.dataset.resolve}"]`);
            if (m) m.replaceWith(...m.childNodes);
            delete comments[r.dataset.resolve];
            return render();
          }
          const c = e.target.closest("[data-cid]");
          if (c) {
            active = Number(c.dataset.cid);
            render();
          }
        });
        render();
      }
    },

    "comment-row": {
      html: `
        ${head("Hilos · comment-row.tsx", "Fila de comentario", "Alterna reacciones (los conteos se actualizan), añade nuevas desde el selector, edita en el mismo lugar o elimina con opción de deshacer.")}
        <div data-list class="tsl-stack" style="max-width:640px;width:100%"></div>`,
      setup(root, ctx) {
        const picker = ["👍", "🎉", "❤️", "🚀", "👀", "😂"];
        let comments = [{ who: "Ana", at: "hace 2 h", text: "La nueva **galería** se siente mucho más rápida.", reacts: { "👍": [3, false], "🚀": [1, true] }, editing: false }, { who: "Leo", at: "hace 1 h", text: "De acuerdo. Publiquémosla esta semana.", reacts: { "🎉": [2, false] }, editing: false }];
        const render = () => {
          ctx.$("[data-list]").innerHTML = comments
            .map((c, i) => `<div class="xp-panel tsl-stack" style="--gap:8px;padding:12px 14px"><div class="tsl-row" style="--gap:8px"><span class="tsl-avatar tsl-avatar--sm">${c.who[0]}</span><strong>${c.who}</strong><span class="tsl-muted">${c.at}</span><span class="tsl-spacer"></span>${c.who === "Tú" || i < 2 ? `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-edit="${i}">${c.editing ? "Cancelar" : "Editar"}</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-del="${i}">Eliminar</button>` : ""}</div>${c.editing ? `<form class="tsl-stack" data-save="${i}"><textarea class="tsl-textarea" style="min-height:60px">${esc(c.text)}</textarea><button type="submit" class="tsl-btn tsl-btn--sm tsl-btn--primary" style="align-self:flex-start">Guardar</button></form>` : `<p data-text style="line-height:1.6"></p>`}<div class="tsl-row" style="--gap:4px">${Object.entries(c.reacts).filter(([, [n]]) => n > 0).map(([e, [n, mine]]) => `<button type="button" class="tsl-chip" data-r="${i}" data-e="${e}" aria-pressed="${mine}">${e} ${n}</button>`).join("")}<tsl-menu><button type="button" class="tsl-chip" data-tsl-trigger aria-label="Añadir reacción">＋☺</button><div class="tsl-menu__list" style="min-width:0;display:flex;gap:2px">${picker.map((e) => `<button type="button" class="tsl-menu__item" data-value="${e}" style="width:auto">${e}</button>`).join("")}</div></tsl-menu></div></div>`)
            .join("");
          ctx.$$("[data-text]").forEach((p, i) => {
            const c = comments.filter((x) => !x.editing)[i];
            p.innerHTML = esc(c.text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          });
          ctx.$$("[data-list] tsl-menu").forEach((m, i) => m.addEventListener("tsl-select", (e) => react(i, e.detail.value)));
        };
        const react = (i, e) => {
          const r = comments[i].reacts[e] || [0, false];
          r[1] = !r[1];
          r[0] += r[1] ? 1 : -1;
          comments[i].reacts[e] = r;
          render();
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const r = e.target.closest("[data-r]");
          const ed = e.target.closest("[data-edit]");
          const d = e.target.closest("[data-del]");
          if (r) react(Number(r.dataset.r), r.dataset.e);
          if (ed) {
            comments[ed.dataset.edit].editing = !comments[ed.dataset.edit].editing;
            render();
          }
          if (d) {
            const i = Number(d.dataset.del);
            const removed = comments.splice(i, 1)[0];
            render();
            ctx.toast({ title: "Comentario eliminado", variant: "neutral", action: { label: "Deshacer", onClick: () => (comments.splice(i, 0, removed), render()) } });
          }
        });
        ctx.on(ctx.$("[data-list]"), "submit", (e) => {
          e.preventDefault();
          const c = comments[e.target.dataset.save];
          c.text = e.target.querySelector("textarea").value;
          c.editing = false;
          c.at = "editado ahora";
          render();
        });
        render();
      }
    },

    "mention-popover": {
      html: `
        ${head("Hilos · mention-popover.tsx", "Popover de @menciones", "Escribe @ seguido de un nombre: las flechas se mueven, Enter o Tab insertan. Las personas mencionadas se listan abajo.")}
        <div class="xp-rel" style="max-width:640px;width:100%">
          <textarea class="tsl-textarea" data-text placeholder="Escribe un comentario y @menciona a alguien…" style="min-height:120px" aria-label="Comentario"></textarea>
          <div class="tsl-menu__list" data-pop hidden style="top:auto;left:12px"></div>
        </div>
        <div class="tsl-row" data-mentioned><span class="tsl-muted">Aún no hay menciones.</span></div>`,
      setup(root, ctx) {
        const ta = ctx.$("[data-text]");
        const pop = ctx.$("[data-pop]");
        const users = team.map((t) => ({ name: t[0], handle: t[0].split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""), status: t[3] }));
        let hits = [];
        let sel = 0;
        let start = -1;
        const close = () => ((pop.hidden = true), (start = -1));
        const update = () => {
          const pos = ta.selectionStart;
          const before = ta.value.slice(0, pos);
          const m = /(^|\s)@(\w*)$/.exec(before);
          if (!m) return close();
          start = pos - m[2].length - 1;
          hits = users.filter((u) => u.handle.startsWith(m[2].toLowerCase()) || u.name.toLowerCase().includes(m[2].toLowerCase())).slice(0, 6);
          if (!hits.length) return close();
          sel = Math.min(sel, hits.length - 1);
          pop.innerHTML = hits.map((u, i) => `<button type="button" class="tsl-menu__item" data-i="${i}" style="${i === sel ? "background:var(--tsl-surface-strong)" : ""}"><span class="tsl-avatar tsl-avatar--sm" data-status="${u.status}">${initials(u.name)}</span>${u.name}<span class="tsl-nav__meta">@${u.handle}</span></button>`).join("");
          pop.hidden = false;
          const lines = before.split("\n").length;
          pop.style.top = `${Math.min(ta.offsetHeight, 18 + lines * 22)}px`;
        };
        const insert = (u) => {
          const pos = ta.selectionStart;
          ta.value = `${ta.value.slice(0, start)}@${u.handle} ${ta.value.slice(pos)}`;
          const caret = start + u.handle.length + 2;
          ta.setSelectionRange(caret, caret);
          close();
          ta.focus();
          sync();
        };
        const sync = () => {
          const found = [...new Set((ta.value.match(/@(\w+)/g) || []).map((s) => s.slice(1)))].map((h) => users.find((u) => u.handle === h)).filter(Boolean);
          ctx.$("[data-mentioned]").innerHTML = found.length ? found.map((u) => `<span class="tsl-chip" style="color:var(--tsl-fg)"><span class="tsl-avatar tsl-avatar--sm" style="--_s:18px">${initials(u.name)}</span> ${u.name}</span>`).join("") : '<span class="tsl-muted">Aún no hay menciones.</span>';
        };
        ctx.on(ta, "input", () => ((sel = 0), update(), sync()));
        ctx.on(ta, "click", update);
        ctx.on(ta, "keydown", (e) => {
          if (pop.hidden) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length;
            update();
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insert(hits[sel]);
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        });
        ctx.on(pop, "mousedown", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          e.preventDefault();
          insert(hits[Number(b.dataset.i)]);
        });
      }
    },

    resolved: {
      html: `
        ${head("Hilos · resolved.tsx", "Hilo resuelto", "Resolver colapsa un hilo en un resumen de una línea; reabrir lo restaura. Activa o desactiva la vista de hilos resueltos.")}
        <div class="tsl-row"><label class="tsl-choice">Mostrar resueltos <input type="checkbox" role="switch" class="tsl-switch" data-show checked /></label><span class="tsl-badge" data-count></span></div>
        <div class="tsl-stack" data-list style="max-width:700px;width:100%"></div>`,
      setup(root, ctx) {
        const threads = [
          { title: "Radio de los botones en móvil", msgs: [["Ana", "¿Usamos 10px?"], ["Leo", "9px coincide con los tokens."], ["Ana", "Listo, 9px."]], resolved: false },
          { title: "Posición del toast", msgs: [["Sara", "¿Abajo a la derecha?"], ["Tom", "Sí, igual que en el sistema operativo."]], resolved: true },
          { title: "Texto del estado vacío", msgs: [["Mia", "“Todo al día” se siente más amigable."]], resolved: false }
        ];
        const render = () => {
          const show = ctx.$("[data-show]").checked;
          ctx.$("[data-count]").textContent = `${threads.filter((t) => !t.resolved).length} abiertos · ${threads.filter((t) => t.resolved).length} resueltos`;
          ctx.$("[data-list]").innerHTML = threads
            .map((t, i) => (t.resolved && !show ? "" : t.resolved
              ? `<div class="xp-panel tsl-row" style="padding:10px 14px;opacity:.75"><span style="color:var(--tsl-success)">✓</span><span style="flex:1"><strong>${esc(t.title)}</strong> <span class="tsl-muted">· resuelto · ${t.msgs.length} mensajes · último: “${esc(t.msgs[t.msgs.length - 1][1])}”</span></span><button type="button" class="tsl-btn tsl-btn--sm" data-reopen="${i}">Reabrir</button></div>`
              : `<div class="xp-panel tsl-stack" style="--gap:8px"><div class="tsl-row"><strong>${esc(t.title)}</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-resolve="${i}">✓ Resolver</button></div>${t.msgs.map(([w, m]) => `<div class="tsl-row" style="--gap:8px"><span class="tsl-avatar tsl-avatar--sm">${w[0]}</span><strong style="font-size:12px">${w}</strong><span style="font-size:12px">${esc(m)}</span></div>`).join("")}<form class="tsl-row" data-reply="${i}" style="flex-wrap:nowrap"><input class="tsl-input" placeholder="Responder…" required aria-label="Respuesta" /><button type="submit" class="tsl-btn tsl-btn--sm">Enviar</button></form></div>`))
            .join("");
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const r = e.target.closest("[data-resolve]");
          const o = e.target.closest("[data-reopen]");
          if (r) threads[r.dataset.resolve].resolved = true;
          if (o) threads[o.dataset.reopen].resolved = false;
          if (r || o) render();
        });
        ctx.on(ctx.$("[data-list]"), "submit", (e) => {
          e.preventDefault();
          threads[e.target.dataset.reply].msgs.push(["Tú", e.target.querySelector("input").value]);
          render();
        });
        ctx.on(ctx.$("[data-show]"), "change", render);
        render();
      }
    },

    "compose-rich": {
      html: `
        ${head("Hilos · compose-rich.tsx", "Compositor enriquecido", "La barra de Markdown envuelve tu selección; la pestaña Vista previa la renderiza de forma segura. ⌘/Ctrl+Enter publica.")}
        <div class="tsl-card" style="max-width:720px;width:100%">
          <div class="tsl-card__body tsl-stack">
            <div class="tsl-row" style="--gap:2px">${[["b", "B", "**", "**"], ["i", "I", "_", "_"], ["c", "</>", "`", "`"], ["l", "🔗", "[", "](https://)"], ["q", "❝", "> ", ""], ["u", "• Lista", "- ", ""]].map(([k, l]) => `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-fmt="${k}">${esc(l)}</button>`).join("")}<span class="tsl-spacer"></span><tsl-segmented value="write" data-mode><button class="tsl-segmented__item" value="write">Escribir</button><button class="tsl-segmented__item" value="preview">Vista previa</button></tsl-segmented></div>
            <textarea class="tsl-textarea" data-text style="min-height:150px" aria-label="Mensaje">**Notas de versión** de _v1.3_:\n- Galería funcional\n- Corrección de \`tsl-sparkline\`\n> Cero dependencias, como siempre.</textarea>
            <div data-preview hidden class="xp-panel" style="min-height:150px;line-height:1.7"></div>
            <div class="tsl-row"><span class="tsl-muted xp-mono" data-count></span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--primary" data-post>Publicar</button></div>
          </div>
        </div>
        <div class="tsl-stack" data-posts style="max-width:720px;width:100%"></div>`,
      setup(root, ctx) {
        const ta = ctx.$("[data-text]");
        const fmts = { b: ["**", "**"], i: ["_", "_"], c: ["`", "`"], l: ["[", "](https://)"], q: ["> ", ""], u: ["- ", ""] };
        const md = (src) =>
          TESELA_XP.esc(src)
            .split("\n")
            .map((line) => {
              let l = line
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/_(.+?)_/g, "<em>$1</em>")
                .replace(/`(.+?)`/g, "<code>$1</code>")
                .replace(/\[(.+?)\]\((https?:\/\/[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--xp-accent)">$1</a>');
              if (/^&gt; /.test(l)) return `<blockquote style="margin:4px 0;padding-left:10px;border-left:3px solid var(--xp-accent);color:var(--tsl-fg-muted)">${l.slice(5)}</blockquote>`;
              if (/^- /.test(l)) return `<div>• ${l.slice(2)}</div>`;
              return `<div>${l || "&nbsp;"}</div>`;
            })
            .join("");
        const count = () => (ctx.$("[data-count]").textContent = `${ta.value.length} caracteres`);
        ctx.on(ctx.$(".tsl-card"), "click", (e) => {
          const b = e.target.closest("[data-fmt]");
          if (!b) return;
          const [pre, post] = fmts[b.dataset.fmt];
          const { selectionStart: s, selectionEnd: en, value } = ta;
          const lineStart = value.lastIndexOf("\n", s - 1) + 1;
          if (!post) ta.value = value.slice(0, lineStart) + pre + value.slice(lineStart);
          else ta.value = value.slice(0, s) + pre + (value.slice(s, en) || "texto") + post + value.slice(en);
          ta.focus();
          ta.setSelectionRange(s + pre.length, (en === s ? s + 5 : en) + pre.length);
          count();
        });
        ctx.on(ctx.$("[data-mode]"), "tsl-change", (e) => {
          const preview = e.detail.value === "preview";
          ta.hidden = preview;
          ctx.$("[data-preview]").hidden = !preview;
          if (preview) ctx.$("[data-preview]").innerHTML = md(ta.value);
        });
        const post = () => {
          if (!ta.value.trim()) return;
          ctx.$("[data-posts]").insertAdjacentHTML("afterbegin", `<div class="xp-panel"><div class="tsl-row" style="--gap:8px;margin-bottom:6px"><span class="tsl-avatar tsl-avatar--sm">LI</span><strong>Tú</strong><span class="tsl-muted">ahora</span></div><div style="line-height:1.7">${md(ta.value)}</div></div>`);
          ta.value = "";
          count();
        };
        ctx.on(ctx.$("[data-post]"), "click", post);
        ctx.on(ta, "keydown", (e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && post());
        ctx.on(ta, "input", count);
        count();
      }
    }
  });

  // ==========================================================================
  // TOURS Y COACHMARKS
  // ==========================================================================
  const mockApp = `
    <div class="xp-panel xp-rel" data-app style="padding:0;overflow:hidden;min-height:340px">
      <div class="tsl-row" style="padding:10px 14px;border-bottom:1px solid var(--tsl-border)"><strong data-t="logo">◆ Acme</strong><input class="tsl-input" style="max-width:220px" placeholder="Buscar…" data-t="search" aria-label="Buscar" /><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-t="new">+ Nuevo</button><span class="tsl-avatar tsl-avatar--sm" data-t="avatar">LI</span></div>
      <div class="tsl-row" style="align-items:stretch;--gap:0;min-height:290px"><nav class="tsl-nav" style="width:180px;padding:10px;border-right:1px solid var(--tsl-border)" data-t="nav"><span class="tsl-nav__item" aria-current="page">Inicio</span><span class="tsl-nav__item">Proyectos</span><span class="tsl-nav__item">Informes</span></nav><div style="flex:1;padding:16px" class="tsl-grid"><div class="tsl-stat" data-t="stat"><span class="tsl-eyebrow">Ingresos</span><span class="tsl-stat__value">$48k</span></div><div class="tsl-stat"><span class="tsl-eyebrow">Usuarios</span><span class="tsl-stat__value">1.2k</span></div></div></div>
    </div>`;

  X.addMany("tours", {
    "welcome-carousel": {
      html: `
        ${head("Tours · welcome-carousel.tsx", "Carrusel de bienvenida", "Diapositivas de novedades con puntos, flechas (también ←/→ con foco) y un interruptor de reproducción automática que se pausa al pasar el cursor.")}
        <div class="tsl-card" data-car tabindex="0" style="max-width:560px;width:100%;margin:0 auto;outline:none" aria-roledescription="carousel">
          <div style="overflow:hidden"><div data-track style="display:flex;transition:transform .45s var(--tsl-ease)"></div></div>
          <div class="tsl-card__footer" style="justify-content:space-between"><button type="button" class="tsl-btn tsl-btn--sm" data-prev>←</button><div class="tsl-row" style="--gap:6px" data-dots></div><button type="button" class="tsl-btn tsl-btn--sm" data-next>→</button></div>
        </div>
        <div class="tsl-row" style="justify-content:center"><label class="tsl-choice">Reproducción automática <input type="checkbox" role="switch" class="tsl-switch" data-auto checked /></label></div>`,
      setup(root, ctx) {
        const slides = [["✦", "Te damos la bienvenida a tesela-ui", "43 componentes, cero dependencias."], ["⚡", "Galería funcional", "Cada experimento es real, con código copiable."], ["🎨", "Tus tokens", "Cambia --tsl-accent y todo lo demás lo sigue."], ["⌘K", "Teclado primero", "Paletas, menús y pestañas se controlan por completo con el teclado."]];
        let i = 0;
        let hover = false;
        ctx.$("[data-track]").innerHTML = slides.map(([ic, t, d]) => `<div style="flex:0 0 100%;padding:42px 28px;text-align:center"><div style="font-size:42px">${ic}</div><h3 class="xp-title">${t}</h3><p class="tsl-muted">${d}</p></div>`).join("");
        const go = (n) => {
          i = (n + slides.length) % slides.length;
          ctx.$("[data-track]").style.transform = `translateX(-${i * 100}%)`;
          ctx.$("[data-dots]").innerHTML = slides.map((_, k) => `<button type="button" data-d="${k}" aria-label="Diapositiva ${k + 1}" aria-current="${k === i}" style="width:${k === i ? 20 : 8}px;height:8px;border-radius:4px;border:0;background:${k === i ? "var(--xp-accent)" : "var(--tsl-border-strong)"};cursor:pointer;transition:width .2s"></button>`).join("");
        };
        ctx.on(ctx.$("[data-prev]"), "click", () => go(i - 1));
        ctx.on(ctx.$("[data-next]"), "click", () => go(i + 1));
        ctx.on(ctx.$("[data-dots]"), "click", (e) => e.target.closest("[data-d]") && go(Number(e.target.dataset.d)));
        ctx.on(ctx.$("[data-car]"), "keydown", (e) => (e.key === "ArrowRight" ? go(i + 1) : e.key === "ArrowLeft" ? go(i - 1) : null));
        ctx.on(ctx.$("[data-car]"), "pointerenter", () => (hover = true));
        ctx.on(ctx.$("[data-car]"), "pointerleave", () => (hover = false));
        ctx.every(3500, () => ctx.$("[data-auto]").checked && !hover && go(i + 1));
        go(0);
      }
    },

    spotlight: {
      html: `
        ${head("Tours · spotlight.tsx", "Tour con foco", "Una máscara oscura con un recorte se mueve entre elementos reales de la interfaz y la tarjeta del paso lo sigue. Esc u Omitir termina el tour.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-start>▶ Iniciar tour</button></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const steps = [["logo", "Tu espacio de trabajo", "Cambia de organización desde el logo."], ["search", "Busca en todo", "Encuentra proyectos, personas y documentos al instante."], ["new", "Crear", "Inicia un proyecto nuevo desde aquí."], ["nav", "Navegar", "Todas las secciones están en la barra lateral."], ["stat", "Tus métricas", "Las cifras clave se actualizan en tiempo real."]];
        let i = -1;
        const hole = document.createElement("div");
        hole.style.cssText = "position:absolute;z-index:6;border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.6);transition:all .35s var(--tsl-ease);pointer-events:none";
        const card = document.createElement("div");
        card.className = "tsl-card";
        card.style.cssText = "position:absolute;z-index:7;width:260px;box-shadow:var(--tsl-shadow-lg);background:var(--tsl-bg-elevated);transition:all .35s var(--tsl-ease)";
        const end = () => {
          i = -1;
          hole.remove();
          card.remove();
        };
        const show = () => {
          if (i < 0 || i >= steps.length) return end();
          const [t, title, desc] = steps[i];
          const el = app.querySelector(`[data-t="${t}"]`);
          const a = app.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          Object.assign(hole.style, { left: `${r.left - a.left - 6}px`, top: `${r.top - a.top - 6}px`, width: `${r.width + 12}px`, height: `${r.height + 12}px` });
          card.innerHTML = `<div class="tsl-card__body tsl-stack" style="--gap:6px;padding:14px"><span class="tsl-eyebrow">Paso ${i + 1} de ${steps.length}</span><strong>${title}</strong><span class="tsl-muted" style="font-size:12px">${desc}</span><div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-skip>Omitir</button><span class="tsl-spacer"></span>${i ? '<button type="button" class="tsl-btn tsl-btn--sm" data-back>Atrás</button>' : ""}<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-go>${i === steps.length - 1 ? "Finalizar" : "Siguiente"}</button></div></div>`;
          const below = r.bottom - a.top + 14;
          Object.assign(card.style, { left: `${Math.max(8, Math.min(a.width - 270, r.left - a.left))}px`, top: `${below + 170 > a.height ? r.top - a.top - 170 : below}px` });
          app.append(hole, card);
        };
        ctx.on(card, "click", (e) => {
          if (e.target.closest("[data-skip]")) return end();
          if (e.target.closest("[data-back]")) i--;
          if (e.target.closest("[data-go]")) {
            i++;
            if (i >= steps.length) ctx.toast({ title: "Tour completado 🎉" });
          }
          show();
        });
        ctx.on(ctx.$("[data-start]"), "click", () => ((i = 0), show()));
        ctx.on(root, "keydown", (e) => {
          if (i < 0) return;
          if (e.key === "Escape") {
            e.preventDefault();
            end();
          } else if (e.key === "ArrowRight") (i++, show());
          else if (e.key === "ArrowLeft" && i > 0) (i--, show());
        });
        ctx.onCleanup(end);
      }
    },

    "arrow-tooltip": {
      html: `
        ${head("Tours · arrow-tooltip.tsx", "Tooltip con flecha", "Coachmarks con una flecha que apunta a su objetivo, mostrados de uno en uno. “Entendido” avanza; restablecer los trae de vuelta.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-reset>Restablecer coachmarks</button><span class="tsl-muted" data-left></span></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const marks = [["new", "Crea tu primer proyecto aquí."], ["avatar", "Tu perfil y configuración están aquí."], ["stat", "Haz clic en cualquier métrica para ver detalles."]];
        let i = 0;
        const tip = document.createElement("div");
        tip.style.cssText = "position:absolute;z-index:6;width:220px;padding:12px;border-radius:10px;background:var(--xp-accent);color:#fff;font-size:12px;box-shadow:var(--tsl-shadow-lg)";
        const show = () => {
          ctx.$("[data-left]").textContent = i < marks.length ? `${marks.length - i} ${marks.length - i > 1 ? "consejos restantes" : "consejo restante"}` : "Todos los consejos vistos";
          if (i >= marks.length) return tip.remove();
          const [t, text] = marks[i];
          const el = app.querySelector(`[data-t="${t}"]`);
          const a = app.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          tip.innerHTML = `<span data-arrow style="position:absolute;top:-6px;width:12px;height:12px;background:var(--xp-accent);transform:rotate(45deg)"></span><div></div><div class="tsl-row" style="margin-top:8px"><span style="opacity:.8">${i + 1}/${marks.length}</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-ok style="background:#fff;color:#111;border:0">Entendido</button></div>`;
          tip.children[1].textContent = text;
          const left = Math.max(8, Math.min(a.width - 228, r.left - a.left + r.width / 2 - 110));
          tip.style.left = `${left}px`;
          tip.style.top = `${r.bottom - a.top + 12}px`;
          tip.querySelector("[data-arrow]").style.left = `${r.left - a.left + r.width / 2 - left - 6}px`;
          app.appendChild(tip);
        };
        ctx.on(tip, "click", (e) => e.target.closest("[data-ok]") && (i++, show()));
        ctx.on(ctx.$("[data-reset]"), "click", () => ((i = 0), show()));
        ctx.timeout(50, show);
        ctx.onCleanup(() => tip.remove());
      }
    },

    beacon: {
      html: `
        ${head("Tours · beacon.tsx", "Indicador de novedad", "Puntos pulsantes marcan funciones nuevas. Haz clic en uno para conocerla; los ya vistos dejan de pulsar.")}
        <div class="tsl-row"><span class="tsl-badge tsl-badge--accent" data-count></span><button type="button" class="tsl-btn tsl-btn--sm" data-reset>Restablecer</button></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const beacons = [["search", "La búsqueda ahora entiende lenguaje natural: “facturas de la semana pasada”."], ["new", "Novedad: empieza con más de 20 plantillas."], ["stat", "Las métricas ahora admiten rangos personalizados."]];
        const seen = new Set();
        const pop = document.createElement("div");
        pop.className = "tsl-card";
        pop.style.cssText = "position:absolute;z-index:7;width:240px;box-shadow:var(--tsl-shadow-lg);background:var(--tsl-bg-elevated)";
        const render = () => {
          app.querySelectorAll("[data-beacon]").forEach((b) => b.remove());
          const a = app.getBoundingClientRect();
          beacons.forEach(([t], i) => {
            const r = app.querySelector(`[data-t="${t}"]`).getBoundingClientRect();
            const b = document.createElement("button");
            b.type = "button";
            b.dataset.beacon = String(i);
            b.setAttribute("aria-label", "Novedades");
            b.className = `tsl-dot tsl-dot--accent${seen.has(i) ? "" : " tsl-dot--pulse"}`;
            b.style.cssText = `position:absolute;z-index:5;width:14px;height:14px;border:2px solid var(--tsl-bg);cursor:pointer;left:${r.right - a.left - 6}px;top:${r.top - a.top - 6}px;opacity:${seen.has(i) ? 0.45 : 1}`;
            app.appendChild(b);
          });
          ctx.$("[data-count]").textContent = `${beacons.length - seen.size} nuevos`;
        };
        ctx.on(app, "click", (e) => {
          const b = e.target.closest("[data-beacon]");
          if (!b) {
            if (!pop.contains(e.target)) pop.remove();
            return;
          }
          const i = Number(b.dataset.beacon);
          seen.add(i);
          pop.innerHTML = `<div class="tsl-card__body tsl-stack" style="--gap:6px;padding:12px"><span class="tsl-badge tsl-badge--accent tsl-badge--upper" style="align-self:flex-start">Nuevo</span><span style="font-size:12px"></span><button type="button" class="tsl-btn tsl-btn--sm" style="align-self:flex-end" data-close>Cerrar</button></div>`;
          pop.querySelector("span + span").textContent = beacons[i][1];
          pop.style.left = `${Math.min(app.clientWidth - 250, b.offsetLeft)}px`;
          pop.style.top = `${b.offsetTop + 20}px`;
          app.appendChild(pop);
          render();
        });
        ctx.on(pop, "click", (e) => e.target.closest("[data-close]") && pop.remove());
        ctx.on(ctx.$("[data-reset]"), "click", () => (seen.clear(), pop.remove(), render()));
        ctx.timeout(50, render);
      }
    },

    "inline-hint": {
      html: `
        ${head("Tours · inline-hint.tsx", "Aviso en línea", "Avisos contextuales con “no volver a mostrar” guardado en localStorage. Restablecer los trae todos de vuelta.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-reset>Restablecer avisos</button><span class="tsl-muted" data-count></span></div>
        <div class="tsl-stack" data-hints style="max-width:680px;width:100%"></div>`,
      setup(root, ctx) {
        const KEY = "tesela-xp-hints";
        const hints = [["kbd", "info", "Consejo pro", "Pulsa ⌘K en cualquier lugar para abrir la paleta de comandos."], ["tokens", "accent", "Temas", "Sobrescribe --tsl-accent una vez y todos los componentes lo siguen."], ["code", "success", "Copiar código", "Cada experimento tiene una pestaña HTML/JS en el panel de código (pulsa C)."]];
        const load = () => {
          try {
            return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
          } catch (_) {
            return new Set();
          }
        };
        const save = (s) => {
          try {
            localStorage.setItem(KEY, JSON.stringify([...s]));
          } catch (_) {}
        };
        let hidden = load();
        const session = new Set();
        const render = () => {
          const visible = hints.filter(([k]) => !hidden.has(k) && !session.has(k));
          ctx.$("[data-count]").textContent = `${visible.length} de ${hints.length} visibles`;
          ctx.$("[data-hints]").innerHTML = visible.map(([k, v, t, d]) => `<div class="tsl-alert tsl-alert--${v}"><div style="flex:1"><div class="tsl-alert__title">${t}</div><div class="tsl-alert__desc">${d}</div><label class="tsl-choice" style="margin-top:8px;font-size:11px"><input type="checkbox" class="tsl-check" data-forever="${k}" /> No volver a mostrar</label></div><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-dismiss="${k}" aria-label="Descartar">✕</button></div>`).join("") || '<div class="tsl-empty"><div class="tsl-empty__title">No hay avisos</div><p class="tsl-empty__desc">Los descartaste todos.</p></div>';
        };
        ctx.on(ctx.$("[data-hints]"), "click", (e) => {
          const b = e.target.closest("[data-dismiss]");
          if (!b) return;
          const k = b.dataset.dismiss;
          const forever = ctx.$(`[data-forever="${k}"]`).checked;
          if (forever) {
            hidden.add(k);
            save(hidden);
          } else session.add(k);
          render();
        });
        ctx.on(ctx.$("[data-reset]"), "click", () => {
          hidden = new Set();
          session.clear();
          save(hidden);
          render();
        });
        render();
      }
    },

    checklist: {
      html: `
        ${head("Tours · checklist.tsx", "Lista de incorporación", "Completa las tareas con sus acciones; el anillo de progreso se llena y al llegar al 100% hay una celebración.")}
        <div class="tsl-card" style="max-width:520px;width:100%;margin:0 auto"><div class="tsl-card__body tsl-stack">
          <div class="tsl-row"><svg viewBox="0 0 44 44" width="64" height="64" data-ring><circle cx="22" cy="22" r="18" fill="none" stroke="var(--tsl-surface-strong)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--xp-accent)" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 22 22)" data-arc style="transition:stroke-dasharray .4s"/><text x="22" y="26" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" style="fill:var(--tsl-fg)" data-pct>0%</text></svg><div><strong>Empieza con Acme</strong><div class="tsl-muted" data-left></div></div></div>
          <ul class="tsl-list" data-list></ul>
          <div data-done hidden class="tsl-alert tsl-alert--success"><div><div class="tsl-alert__title">🎉 ¡Todo listo!</div><div class="tsl-alert__desc">Ganaste la insignia “Arranque veloz”.</div></div></div>
        </div></div>`,
      setup(root, ctx) {
        const tasks = [["Crear un espacio de trabajo", "Crear", true], ["Invitar a un compañero", "Invitar"], ["Conectar GitHub", "Conectar"], ["Crear tu primer proyecto", "Crear"], ["Personalizar tu tema", "Abrir"]].map(([t, a, d]) => ({ t, a, done: !!d }));
        const render = () => {
          const n = tasks.filter((t) => t.done).length;
          const pct = Math.round((n / tasks.length) * 100);
          ctx.$("[data-arc]").setAttribute("stroke-dasharray", `${pct} 100`);
          ctx.$("[data-pct]").textContent = `${pct}%`;
          ctx.$("[data-left]").textContent = `${tasks.length - n} de ${tasks.length} pasos restantes`;
          ctx.$("[data-list]").innerHTML = tasks.map((t, i) => `<li><span style="width:20px;color:${t.done ? "var(--tsl-success)" : "var(--tsl-fg-subtle)"}">${t.done ? "✓" : "○"}</span><span style="flex:1;${t.done ? "text-decoration:line-through;color:var(--tsl-fg-muted)" : ""}">${t.t}</span>${t.done ? "" : `<button type="button" class="tsl-btn tsl-btn--sm" data-i="${i}">${t.a}</button>`}</li>`).join("");
          ctx.$("[data-done]").hidden = pct < 100;
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          b.setAttribute("aria-busy", "true");
          ctx.timeout(500, () => {
            tasks[b.dataset.i].done = true;
            render();
            if (tasks.every((t) => t.done)) {
              ctx.toast({ title: "Incorporación completada 🎉" });
              const card = ctx.$(".tsl-card");
              for (let k = 0; k < 18; k++) {
                const s = document.createElement("span");
                s.textContent = ["🎉", "✨", "🎊"][k % 3];
                s.style.cssText = `position:fixed;left:${card.getBoundingClientRect().left + card.offsetWidth / 2}px;top:${card.getBoundingClientRect().top + 40}px;pointer-events:none;font-size:20px;z-index:200`;
                document.body.appendChild(s);
                s.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 400}px, ${-80 - Math.random() * 200}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 1200 + Math.random() * 600, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => s.remove();
              }
            }
          });
        });
        render();
      }
    }
  });
})();
