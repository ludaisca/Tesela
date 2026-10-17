// ============================================================================
// Experimentos funcionales — Diseños (12), Formularios (4), Autenticación e incorporación (14)
// ============================================================================

(function () {
  "use strict";
  const X = window.TESELA_XP;
  const { head, field, esc } = X;

  // ==========================================================================
  // LAYOUTS
  // ==========================================================================
  X.addMany("layouts", {
    "workspace-rail": {
      html: `
        ${head("Diseños · workspace-rail.tsx", "Riel de espacio de trabajo", "Cambia de organización, navega entre vistas y agrega proyectos. Todo actualiza el panel principal.")}
        <div class="xp-split" style="--cols:250px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" style="--gap:10px">
            <tsl-menu id="org-menu">
              <button type="button" class="tsl-btn tsl-btn--block" style="justify-content:space-between" data-tsl-trigger>
                <span class="tsl-row" style="--gap:8px"><span class="tsl-avatar tsl-avatar--sm tsl-avatar--square" data-org-avatar>A</span><span data-org-name>Acme inc.</span></span><span>▾</span>
              </button>
              <div class="tsl-menu__list">
                <div class="tsl-menu__label">Organizaciones</div>
                <button type="button" class="tsl-menu__item" data-value="Acme inc.">Acme inc.</button>
                <button type="button" class="tsl-menu__item" data-value="Globex">Globex</button>
                <button type="button" class="tsl-menu__item" data-value="Initech">Initech</button>
              </div>
            </tsl-menu>
            <nav class="tsl-nav" data-nav>
              <button type="button" class="tsl-nav__item" data-view="Inicio" aria-current="page">⌂ Inicio</button>
              <button type="button" class="tsl-nav__item" data-view="Bandeja">✉ Bandeja <span class="tsl-badge tsl-badge--accent">4</span></button>
              <button type="button" class="tsl-nav__item" data-view="Actividad">⚡ Actividad</button>
              <div class="tsl-nav__label">Proyectos</div>
              <div class="tsl-nav" data-projects>
                <button type="button" class="tsl-nav__item" data-view="Rediseño del onboarding"><span class="tsl-dot tsl-dot--accent"></span> Rediseño del onboarding</button>
                <button type="button" class="tsl-nav__item" data-view="Planeación T3"><span class="tsl-dot tsl-dot--success"></span> Planeación T3</button>
              </div>
            </nav>
            <form data-new-project class="tsl-input-group">
              <input class="tsl-input" placeholder="Nuevo proyecto…" aria-label="Nombre del nuevo proyecto" maxlength="32" />
              <button type="submit" class="tsl-btn tsl-btn--subtle tsl-btn--sm" style="margin:3px">Agregar</button>
            </form>
          </aside>
          <main class="xp-pane tsl-stack">
            <span class="tsl-eyebrow" data-org-label>Acme inc.</span>
            <h3 class="xp-title" style="margin:0" data-title>Inicio</h3>
            <p class="tsl-muted" data-desc>Resumen de todo lo que ocurre en tu espacio de trabajo.</p>
            <div class="tsl-grid" style="--min:160px">
              <div class="tsl-stat"><span class="tsl-eyebrow">Tareas abiertas</span><span class="tsl-stat__value" data-stat="tasks">12</span></div>
              <div class="tsl-stat"><span class="tsl-eyebrow">Miembros</span><span class="tsl-stat__value" data-stat="members">24</span></div>
              <div class="tsl-stat"><span class="tsl-eyebrow">Proyectos</span><span class="tsl-stat__value" data-stat="projects">2</span></div>
            </div>
          </main>
        </div>`,
      setup(root, ctx) {
        const nav = ctx.$("[data-nav]");
        const select = (btn) => {
          nav.querySelectorAll("[data-view]").forEach((b) => b.removeAttribute("aria-current"));
          btn.setAttribute("aria-current", "page");
          ctx.$("[data-title]").textContent = btn.dataset.view;
          ctx.$("[data-desc]").textContent = `Estás viendo “${btn.dataset.view}”.`;
        };
        ctx.on(nav, "click", (e) => {
          const btn = e.target.closest("[data-view]");
          if (btn) select(btn);
        });
        ctx.on(ctx.$("#org-menu"), "tsl-select", (e) => {
          const name = e.detail.value;
          ctx.$("[data-org-name]").textContent = name;
          ctx.$("[data-org-label]").textContent = name;
          ctx.$("[data-org-avatar]").textContent = name[0];
          ctx.$('[data-stat="members"]').textContent = String(8 + name.length * 3);
          ctx.toast({ title: `Cambiaste a ${name}`, variant: "info" });
        });
        const form = ctx.$("[data-new-project]");
        ctx.on(form, "submit", (e) => {
          e.preventDefault();
          const input = form.querySelector("input");
          const name = input.value.trim();
          if (!name) return;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tsl-nav__item";
          btn.dataset.view = name;
          btn.innerHTML = '<span class="tsl-dot tsl-dot--warning"></span> ';
          btn.append(name);
          ctx.$("[data-projects]").appendChild(btn);
          ctx.$('[data-stat="projects"]').textContent = String(ctx.$$("[data-projects] [data-view]").length);
          input.value = "";
          select(btn);
        });
      }
    },

    "mini-rail": {
      html: `
        ${head("Diseños · mini-rail.tsx", "Mini riel de íconos", "Riel compacto con tooltips. Expándelo para ver las etiquetas; la selección controla el contenido.")}
        <div class="xp-split" data-shell style="--cols:64px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" style="--gap:6px;align-items:stretch;padding:10px">
            <button type="button" class="tsl-btn tsl-btn--subtle" data-expand aria-expanded="false" data-tsl-tooltip="Expandir" data-tsl-placement="bottom">☰</button>
            <div class="tsl-divider"></div>
            ${[["◎", "Descubrir"], ["✉", "Mensajes"], ["▦", "Proyectos"], ["☺", "Personas"], ["⚙", "Ajustes"]]
              .map(([i, l], n) => `<button type="button" class="tsl-nav__item" data-item="${l}"${n === 0 ? ' aria-current="page"' : ""} data-tsl-tooltip="${l}" data-tsl-placement="bottom" style="justify-content:flex-start"><span style="width:20px;text-align:center">${i}</span><span data-label hidden>${l}</span></button>`)
              .join("")}
          </aside>
          <main class="xp-pane tsl-stack">
            <span class="tsl-eyebrow">Sección</span>
            <h3 class="xp-title" style="margin:0" data-title>Descubrir</h3>
            <ul class="tsl-list" data-list></ul>
          </main>
        </div>`,
      setup(root, ctx) {
        const content = {
          Descubrir: ["Plantillas en tendencia", "Sistemas de diseño", "Paquetes de shaders"],
          Mensajes: ["Ana: ¿revisas el PR?", "Bot: deploy terminado", "Leo: ¿comemos a la 1?"],
          Proyectos: ["Rediseño del onboarding", "Planeación T3", "Sitio de marketing"],
          Personas: ["Ana López · Diseño", "Leo Kim · Ingeniería", "Sara Ruiz · PM"],
          Ajustes: ["Perfil", "Notificaciones", "Facturación"]
        };
        const render = (key) => {
          ctx.$("[data-title]").textContent = key;
          const list = ctx.$("[data-list]");
          list.innerHTML = "";
          content[key].forEach((t) => {
            const li = document.createElement("li");
            li.textContent = t;
            list.appendChild(li);
          });
        };
        ctx.$$("[data-item]").forEach((b) =>
          ctx.on(b, "click", () => {
            ctx.$$("[data-item]").forEach((x) => x.removeAttribute("aria-current"));
            b.setAttribute("aria-current", "page");
            render(b.dataset.item);
          })
        );
        const toggle = ctx.$("[data-expand]");
        ctx.on(toggle, "click", () => {
          const open = toggle.getAttribute("aria-expanded") !== "true";
          toggle.setAttribute("aria-expanded", String(open));
          ctx.$("[data-shell]").style.setProperty("--cols", open ? "190px minmax(0,1fr)" : "64px minmax(0,1fr)");
          ctx.$$("[data-label]").forEach((l) => (l.hidden = !open));
          ctx.$$("[data-item]").forEach((b) => (open ? b.removeAttribute("data-tsl-tooltip") : b.setAttribute("data-tsl-tooltip", b.dataset.item)));
        });
        render("Descubrir");
      }
    },

    "docs-tree": {
      html: `
        ${head("Diseños · docs-tree.tsx", "Árbol de documentación", "Árbol de documentación plegable con búsqueda en vivo y navegación anterior / siguiente.")}
        <div class="xp-split" style="--cols:260px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" style="--gap:8px">
            <input class="tsl-input" data-search placeholder="Buscar en la documentación…" aria-label="Buscar en la documentación" />
            <div data-tree class="tsl-stack" style="--gap:4px">
              ${[
                ["Primeros pasos", ["Introducción", "Instalación", "Temas"]],
                ["Componentes", ["Botón", "Diálogo", "Paleta de comandos", "Tabla"]],
                ["Guías", ["Accesibilidad", "Modo oscuro", "Despliegue"]]
              ]
                .map(
                  ([g, pages]) => `<details open><summary class="tsl-eyebrow" style="cursor:pointer;padding:6px 4px">${g}</summary>
                  <nav class="tsl-nav">${pages.map((p) => `<button type="button" class="tsl-nav__item" data-page="${p}">${p}</button>`).join("")}</nav></details>`
                )
                .join("")}
            </div>
          </aside>
          <article class="xp-pane tsl-stack">
            <nav aria-label="Ruta de navegación"><ol class="tsl-breadcrumb"><li>Documentación</li><li data-crumb-group></li><li><span aria-current="page" data-crumb></span></li></ol></nav>
            <h3 class="xp-title" style="margin:0" data-title></h3>
            <p class="tsl-muted" data-body style="max-width:560px;line-height:1.7"></p>
            <div class="tsl-row" style="margin-top:auto">
              <button type="button" class="tsl-btn" data-step="-1">← Anterior</button>
              <span class="tsl-spacer"></span>
              <button type="button" class="tsl-btn" data-step="1">Siguiente →</button>
            </div>
          </article>
        </div>`,
      setup(root, ctx) {
        const pages = ctx.$$("[data-page]");
        let index = 0;
        const show = (i) => {
          index = (i + pages.length) % pages.length;
          const btn = pages[index];
          pages.forEach((p) => p.removeAttribute("aria-current"));
          btn.setAttribute("aria-current", "page");
          btn.closest("details").open = true;
          const group = btn.closest("details").querySelector("summary").textContent;
          ctx.$("[data-title]").textContent = btn.dataset.page;
          ctx.$("[data-crumb]").textContent = btn.dataset.page;
          ctx.$("[data-crumb-group]").textContent = group;
          ctx.$("[data-body]").textContent = `${btn.dataset.page} — parte de “${group}”. Esta página explica el concepto, muestra un ejemplo en vivo y enumera la superficie de la API. Usa el árbol, la búsqueda o las flechas de abajo para moverte.`;
        };
        pages.forEach((p, i) => ctx.on(p, "click", () => show(i)));
        ctx.$$("[data-step]").forEach((b) => ctx.on(b, "click", () => show(index + Number(b.dataset.step))));
        ctx.on(ctx.$("[data-search]"), "input", (e) => {
          const q = e.target.value.trim().toLowerCase();
          ctx.$$("details").forEach((d) => {
            let any = false;
            d.querySelectorAll("[data-page]").forEach((p) => {
              p.hidden = q && !p.dataset.page.toLowerCase().includes(q);
              if (!p.hidden) any = true;
            });
            d.hidden = !any;
            if (q && any) d.open = true;
          });
        });
        show(0);
      }
    },

    "inbox-rail": {
      html: `
        ${head("Diseños · inbox-rail.tsx", "Riel de bandeja de entrada", "Lista de mensajes con panel de lectura. Al abrir se marca como leído; archiva o marca como no leído desde el panel.")}
        <div class="tsl-row"><tsl-segmented value="all" data-filter><button class="tsl-segmented__item" value="all">Todos</button><button class="tsl-segmented__item" value="unread">No leídos</button></tsl-segmented><span class="tsl-badge tsl-badge--accent" data-unread></span></div>
        <div class="xp-split" style="--cols:320px minmax(0,1fr)">
          <ul class="tsl-list xp-pane--flush" data-list style="border:0;border-radius:0">
            ${[
              ["Ana López", "Revisión de diseño a las 3 pm", "¿Puedes traer la nueva hoja de tokens?", 1],
              ["GitHub", "PR #482 aprobado", "Leo aprobó tu pull request.", 1],
              ["Stripe", "Factura pagada", "Acme pagó INV-2091 ($4,200).", 0],
              ["Sara Ruiz", "Borrador del roadmap T3", "La primera versión está lista para comentarios.", 1],
              ["Vercel", "Deploy listo", "producción · f8a92c1 · 41 s", 0]
            ]
              .map(
                ([from, subj, prev, unread], i) => `<li class="xp-select-item${unread ? " xp-unread" : ""}" data-msg="${i}" data-from="${from}" data-subject="${subj}" data-preview="${prev}" tabindex="0">
                <span class="tsl-avatar tsl-avatar--sm">${from.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <div style="min-width:0"><div class="tsl-list__title">${from}</div><div class="tsl-list__desc">${subj}</div></div>
                <span class="tsl-list__end">${unread ? '<span class="tsl-dot tsl-dot--accent"></span>' : ""}</span></li>`
              )
              .join("")}
          </ul>
          <article class="xp-pane tsl-stack" data-pane>
            <div class="tsl-empty" data-empty><div class="tsl-empty__title">Selecciona un mensaje</div><p class="tsl-empty__desc">Elige una conversación de la lista.</p></div>
            <div data-reader hidden class="tsl-stack">
              <span class="tsl-eyebrow" data-r-from></span>
              <h3 class="xp-title" style="margin:0" data-r-subject></h3>
              <p class="tsl-muted" data-r-body></p>
              <div class="tsl-row"><button type="button" class="tsl-btn" data-unread-btn>Marcar como no leído</button><button type="button" class="tsl-btn tsl-btn--danger" data-archive>Archivar</button></div>
            </div>
          </article>
        </div>`,
      setup(root, ctx) {
        let current = null;
        let filter = "all";
        const items = () => ctx.$$("[data-msg]");
        const sync = () => {
          const unread = items().filter((li) => li.classList.contains("xp-unread")).length;
          ctx.$("[data-unread]").textContent = `${unread} sin leer`;
          items().forEach((li) => {
            li.hidden = filter === "unread" && !li.classList.contains("xp-unread") && li !== current;
            li.querySelector(".tsl-list__end").innerHTML = li.classList.contains("xp-unread") ? '<span class="tsl-dot tsl-dot--accent"></span>' : "";
          });
        };
        const open = (li) => {
          current = li;
          items().forEach((x) => x.setAttribute("aria-selected", String(x === li)));
          li.classList.remove("xp-unread");
          ctx.$("[data-empty]").hidden = true;
          ctx.$("[data-reader]").hidden = false;
          ctx.$("[data-r-from]").textContent = li.dataset.from;
          ctx.$("[data-r-subject]").textContent = li.dataset.subject;
          ctx.$("[data-r-body]").textContent = `${li.dataset.preview} — Enviado hoy. Responde aquí mismo o archívalo al terminar.`;
          sync();
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const li = e.target.closest("[data-msg]");
          if (li) open(li);
        });
        ctx.on(ctx.$("[data-list]"), "keydown", (e) => {
          const li = e.target.closest("[data-msg]");
          if (li && e.key === "Enter") open(li);
        });
        ctx.on(ctx.$("[data-unread-btn]"), "click", () => {
          if (!current) return;
          current.classList.add("xp-unread");
          sync();
        });
        ctx.on(ctx.$("[data-archive]"), "click", () => {
          if (!current) return;
          const subject = current.dataset.subject;
          current.remove();
          current = null;
          ctx.$("[data-reader]").hidden = true;
          ctx.$("[data-empty]").hidden = false;
          ctx.toast({ title: `Archivado “${subject}”` });
          sync();
        });
        ctx.on(ctx.$("[data-filter]"), "tsl-change", (e) => {
          filter = e.detail.value;
          sync();
        });
        sync();
      }
    },

    "app-shell": {
      html: `
        ${head("Diseños · app-shell.tsx", "Estructura de aplicación", "Encabezado con ruta de navegación, barra lateral plegable, búsqueda y menú de cuenta.")}
        <div class="xp-panel" style="padding:0;overflow:hidden">
          <header class="tsl-row" style="padding:10px 14px;border-bottom:1px solid var(--tsl-border)">
            <button type="button" class="tsl-btn tsl-btn--icon tsl-btn--subtle" data-collapse aria-label="Alternar barra lateral" aria-expanded="true">☰</button>
            <ol class="tsl-breadcrumb"><li>Acme</li><li><span aria-current="page" data-crumb>Panel</span></li></ol>
            <span class="tsl-spacer"></span>
            <input class="tsl-input" style="max-width:200px" placeholder="Buscar páginas…" data-search aria-label="Buscar páginas" />
            <tsl-menu align="end" data-account>
              <button type="button" class="tsl-avatar" style="border:0;cursor:pointer" data-tsl-trigger aria-label="Cuenta">LI</button>
              <div class="tsl-menu__list"><div class="tsl-menu__label">luis@acme.dev</div><button type="button" class="tsl-menu__item" data-value="Perfil">Perfil</button><button type="button" class="tsl-menu__item" data-value="Ajustes">Ajustes</button><div class="tsl-menu__sep"></div><button type="button" class="tsl-menu__item tsl-menu__item--danger" data-value="Cerrar sesión">Cerrar sesión</button></div>
            </tsl-menu>
          </header>
          <div class="xp-split" data-shell style="--cols:200px minmax(0,1fr);border:0;border-radius:0;--h:360px">
            <aside class="xp-pane" data-aside><nav class="tsl-nav" data-nav>
              ${["Panel", "Proyectos", "Informes", "Equipo", "Facturación"].map((p, i) => `<button type="button" class="tsl-nav__item" data-page="${p}"${i ? "" : ' aria-current="page"'}>${p}</button>`).join("")}
            </nav></aside>
            <main class="xp-pane tsl-stack"><h3 class="xp-title" style="margin:0" data-title>Panel</h3><p class="tsl-muted" data-body>Te damos la bienvenida de nuevo. Elige una página en la barra lateral o usa la búsqueda.</p></main>
          </div>
        </div>`,
      setup(root, ctx) {
        const go = (page) => {
          ctx.$$("[data-page]").forEach((b) => (b.dataset.page === page ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
          ctx.$("[data-crumb]").textContent = page;
          ctx.$("[data-title]").textContent = page;
          ctx.$("[data-body]").textContent = `El contenido de ${page} se carga aquí. La ruta de navegación y la barra lateral se mantienen sincronizadas.`;
        };
        ctx.on(ctx.$("[data-nav]"), "click", (e) => {
          const b = e.target.closest("[data-page]");
          if (b) go(b.dataset.page);
        });
        const btn = ctx.$("[data-collapse]");
        ctx.on(btn, "click", () => {
          const open = btn.getAttribute("aria-expanded") !== "true";
          btn.setAttribute("aria-expanded", String(open));
          ctx.$("[data-aside]").hidden = !open;
          ctx.$("[data-shell]").style.setProperty("--cols", open ? "200px minmax(0,1fr)" : "minmax(0,1fr)");
        });
        ctx.on(ctx.$("[data-search]"), "keydown", (e) => {
          if (e.key !== "Enter") return;
          const q = e.target.value.trim().toLowerCase();
          const hit = ctx.$$("[data-page]").find((b) => b.dataset.page.toLowerCase().startsWith(q));
          if (hit) go(hit.dataset.page);
          else ctx.toast({ title: `Ninguna página coincide con “${e.target.value}”`, variant: "warning" });
        });
        ctx.on(ctx.$("[data-account]"), "tsl-select", (e) => ctx.toast({ title: e.detail.value, variant: "info" }));
      }
    },

    "two-pane": {
      html: `
        ${head("Diseños · two-pane.tsx", "Dos paneles", "Maestro–detalle: elige un contacto, edítalo a la derecha y guárdalo en la lista.")}
        <div class="xp-split" style="--cols:280px minmax(0,1fr)">
          <aside class="xp-pane tsl-stack" style="--gap:8px">
            <input class="tsl-input" placeholder="Filtrar contactos…" data-filter aria-label="Filtrar contactos" />
            <ul class="tsl-list" data-list>
              ${[["Ana López", "ana@acme.dev", "Diseño"], ["Leo Kim", "leo@acme.dev", "Ingeniería"], ["Sara Ruiz", "sara@acme.dev", "Producto"], ["Tom Weber", "tom@acme.dev", "Ingeniería"]]
                .map(([n, e, r], i) => `<li class="xp-select-item" data-i="${i}" data-name="${n}" data-email="${e}" data-role="${r}"><span class="tsl-avatar tsl-avatar--sm">${n[0]}</span><div><div class="tsl-list__title" data-n>${n}</div><div class="tsl-list__desc" data-r>${r}</div></div></li>`)
                .join("")}
            </ul>
          </aside>
          <form class="xp-pane tsl-stack" data-detail>
            <span class="tsl-eyebrow">Contacto</span>
            <label class="tsl-field"><span class="tsl-label">Nombre</span><input class="tsl-input" name="name" required /></label>
            <label class="tsl-field"><span class="tsl-label">Correo electrónico</span><input class="tsl-input" name="email" type="email" required /></label>
            <label class="tsl-field"><span class="tsl-label">Rol</span><select class="tsl-select" name="role"><option>Diseño</option><option>Ingeniería</option><option>Producto</option></select></label>
            <div class="tsl-row"><button type="submit" class="tsl-btn tsl-btn--primary">Guardar</button><button type="reset" class="tsl-btn" data-revert>Revertir</button><span class="tsl-muted" data-dirty></span></div>
          </form>
        </div>`,
      setup(root, ctx) {
        const form = ctx.$("[data-detail]");
        let current = null;
        const load = (li) => {
          current = li;
          ctx.$$("[data-i]").forEach((x) => x.setAttribute("aria-selected", String(x === li)));
          form.name.value = li.dataset.name;
          form.email.value = li.dataset.email;
          form.role.value = li.dataset.role;
          ctx.$("[data-dirty]").textContent = "";
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const li = e.target.closest("[data-i]");
          if (li) load(li);
        });
        ctx.on(form, "input", () => (ctx.$("[data-dirty]").textContent = "Cambios sin guardar"));
        ctx.on(form, "reset", (e) => {
          e.preventDefault();
          if (current) load(current);
        });
        ctx.on(form, "submit", (e) => {
          e.preventDefault();
          if (!form.reportValidity() || !current) return;
          current.dataset.name = form.name.value;
          current.dataset.email = form.email.value;
          current.dataset.role = form.role.value;
          current.querySelector("[data-n]").textContent = form.name.value;
          current.querySelector("[data-r]").textContent = form.role.value;
          current.querySelector(".tsl-avatar").textContent = form.name.value[0] || "?";
          ctx.$("[data-dirty]").textContent = "";
          ctx.toast({ title: `Guardado ${form.name.value}` });
        });
        ctx.on(ctx.$("[data-filter]"), "input", (e) => {
          const q = e.target.value.toLowerCase();
          ctx.$$("[data-i]").forEach((li) => (li.hidden = !li.textContent.toLowerCase().includes(q)));
        });
        load(ctx.$("[data-i]"));
      }
    },

    "three-pane": {
      html: `
        ${head("Diseños · three-pane.tsx", "Tres paneles", "Carpetas → incidencias → detalle. Cambiar el estado mueve la incidencia y actualiza los conteos.")}
        <div class="xp-split" style="--cols:170px 260px minmax(0,1fr)">
          <nav class="xp-pane tsl-nav" data-folders>
            ${["Por hacer", "En curso", "Hecho"].map((f, i) => `<button type="button" class="tsl-nav__item" data-folder="${f}"${i ? "" : ' aria-current="page"'}>${f}<span class="tsl-nav__meta" data-count="${f}"></span></button>`).join("")}
          </nav>
          <ul class="tsl-list" data-issues style="border:0;border-radius:0"></ul>
          <section class="xp-pane tsl-stack" data-detail>
            <div class="tsl-empty"><div class="tsl-empty__title">Ninguna incidencia seleccionada</div></div>
          </section>
        </div>`,
      setup(root, ctx) {
        const issues = [
          { id: "DEV-101", title: "Ranking difuso de la paleta de comandos", status: "Por hacer", owner: "Leo" },
          { id: "DEV-102", title: "Contraste del modo oscuro en las insignias", status: "Por hacer", owner: "Ana" },
          { id: "DEV-103", title: "Caso límite de paginación en la tabla", status: "En curso", owner: "Sara" },
          { id: "DEV-104", title: "Retorno del foco en el panel lateral", status: "En curso", owner: "Leo" },
          { id: "DEV-105", title: "Publicar tesela-ui 1.0", status: "Hecho", owner: "Luis" }
        ];
        let folder = "Por hacer";
        let selected = null;
        const counts = () => ctx.$$("[data-count]").forEach((c) => (c.textContent = issues.filter((i) => i.status === c.dataset.count).length));
        const renderList = () => {
          const list = ctx.$("[data-issues]");
          list.innerHTML = "";
          issues
            .filter((i) => i.status === folder)
            .forEach((i) => {
              const li = document.createElement("li");
              li.className = "xp-select-item";
              li.setAttribute("aria-selected", String(i === selected));
              li.innerHTML = `<div><div class="tsl-list__desc xp-mono"></div><div class="tsl-list__title"></div></div>`;
              li.querySelector(".xp-mono").textContent = i.id;
              li.querySelector(".tsl-list__title").textContent = i.title;
              li.addEventListener("click", () => {
                selected = i;
                renderList();
                renderDetail();
              });
              list.appendChild(li);
            });
          if (!list.children.length) list.innerHTML = '<li class="tsl-muted">Nada por aquí 🎉</li>';
          counts();
        };
        const renderDetail = () => {
          const d = ctx.$("[data-detail]");
          if (!selected) {
            d.innerHTML = '<div class="tsl-empty"><div class="tsl-empty__title">Ninguna incidencia seleccionada</div></div>';
            return;
          }
          d.innerHTML = `<span class="tsl-eyebrow"></span><h3 class="xp-title" style="margin:0"></h3>
            <dl class="xp-kv"><dt>Responsable</dt><dd data-owner></dd><dt>Estado</dt><dd><select class="tsl-select" style="max-width:180px" data-status><option>Por hacer</option><option>En curso</option><option>Hecho</option></select></dd></dl>`;
          d.querySelector(".tsl-eyebrow").textContent = selected.id;
          d.querySelector(".xp-title").textContent = selected.title;
          d.querySelector("[data-owner]").textContent = selected.owner;
          const sel = d.querySelector("[data-status]");
          sel.value = selected.status;
          sel.addEventListener("change", () => {
            selected.status = sel.value;
            ctx.toast({ title: `${selected.id} → ${sel.value}` });
            renderList();
          });
        };
        ctx.on(ctx.$("[data-folders]"), "click", (e) => {
          const b = e.target.closest("[data-folder]");
          if (!b) return;
          folder = b.dataset.folder;
          ctx.$$("[data-folder]").forEach((x) => (x === b ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current")));
          renderList();
        });
        renderList();
      }
    },

    "split-resizable": {
      html: `
        ${head("Diseños · split-resizable.tsx", "División redimensionable", "Arrastra el control, usa las flechas del teclado sobre él o elige un valor preestablecido. Cambia la orientación cuando quieras.")}
        <div class="tsl-row">
          <tsl-segmented value="row" data-orient><button class="tsl-segmented__item" value="row">Horizontal</button><button class="tsl-segmented__item" value="column">Vertical</button></tsl-segmented>
          <div class="tsl-btn-group">${[30, 50, 70].map((p) => `<button type="button" class="tsl-btn tsl-btn--sm" data-preset="${p}">${p}%</button>`).join("")}</div>
          <span class="tsl-badge tsl-badge--outline xp-mono" data-readout>50% / 50%</span>
        </div>
        <div data-split style="display:flex;height:360px;border:1px solid var(--tsl-border);border-radius:var(--tsl-radius);overflow:hidden">
          <section data-a class="xp-pane" style="flex:0 0 50%;background:var(--tsl-surface)"><span class="tsl-eyebrow">Panel A</span><p class="tsl-muted">Editor</p></section>
          <div data-handle role="separator" tabindex="0" aria-valuemin="10" aria-valuemax="90" aria-valuenow="50" aria-label="Redimensionar paneles" style="flex:0 0 6px;background:var(--tsl-border-strong);cursor:col-resize"></div>
          <section class="xp-pane" style="flex:1"><span class="tsl-eyebrow">Panel B</span><p class="tsl-muted">Vista previa</p></section>
        </div>`,
      setup(root, ctx) {
        const split = ctx.$("[data-split]");
        const a = ctx.$("[data-a]");
        const handle = ctx.$("[data-handle]");
        let pct = 50;
        let dir = "row";
        const apply = (p) => {
          pct = Math.max(10, Math.min(90, Math.round(p)));
          a.style.flexBasis = `${pct}%`;
          handle.setAttribute("aria-valuenow", String(pct));
          ctx.$("[data-readout]").textContent = `${pct}% / ${100 - pct}%`;
        };
        let dragging = false;
        ctx.on(handle, "pointerdown", (e) => {
          dragging = true;
          handle.setPointerCapture(e.pointerId);
        });
        ctx.on(handle, "pointermove", (e) => {
          if (!dragging) return;
          const r = split.getBoundingClientRect();
          apply(dir === "row" ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100);
        });
        ctx.on(handle, "pointerup", () => (dragging = false));
        ctx.on(handle, "keydown", (e) => {
          const d = { ArrowLeft: -5, ArrowUp: -5, ArrowRight: 5, ArrowDown: 5, Home: -100, End: 100 }[e.key];
          if (d !== undefined) {
            e.preventDefault();
            apply(pct + d);
          }
        });
        ctx.$$("[data-preset]").forEach((b) => ctx.on(b, "click", () => apply(Number(b.dataset.preset))));
        ctx.on(ctx.$("[data-orient]"), "tsl-change", (e) => {
          dir = e.detail.value;
          split.style.flexDirection = dir;
          handle.style.cursor = dir === "row" ? "col-resize" : "row-resize";
          handle.style.flexBasis = "6px";
          handle.setAttribute("aria-orientation", dir === "row" ? "vertical" : "horizontal");
        });
      }
    },

    "focus-mode": {
      html: `
        ${head("Diseños · focus-mode.tsx", "Modo de enfoque", "Escritura sin distracciones con conteo de palabras en vivo, avance de la meta y guardado automático.")}
        <div class="tsl-row" data-chrome>
          <span class="tsl-badge tsl-badge--outline" data-saved>Aún sin guardar</span>
          <span class="tsl-spacer"></span>
          <label class="tsl-choice">Meta <select class="tsl-select" style="width:auto;height:28px" data-goal><option value="100">100 palabras</option><option value="250" selected>250 palabras</option><option value="500">500 palabras</option></select></label>
          <button type="button" class="tsl-btn tsl-btn--primary" data-focus aria-pressed="false">Entrar en enfoque</button>
        </div>
        <textarea class="tsl-textarea xp-editor" data-editor style="min-height:300px" placeholder="Empieza a escribir… pulsa Esc dentro del editor para salir del modo de enfoque.">Las mejores interfaces desaparecen. Te dejan pensar en el trabajo, no en la herramienta.</textarea>
        <div class="tsl-stack" style="--gap:6px">
          <progress class="tsl-progress" max="250" value="0" data-progress></progress>
          <div class="tsl-row xp-mono tsl-muted" style="font-size:11px"><span data-words></span><span>·</span><span data-chars></span><span>·</span><span data-read></span></div>
        </div>`,
      setup(root, ctx) {
        const editor = ctx.$("[data-editor]");
        const btn = ctx.$("[data-focus]");
        let saveTimer = 0;
        const stats = () => {
          const words = (editor.value.trim().match(/\S+/g) || []).length;
          const goal = Number(ctx.$("[data-goal]").value);
          ctx.$("[data-words]").textContent = `${words} palabras`;
          ctx.$("[data-chars]").textContent = `${editor.value.length} caracteres`;
          ctx.$("[data-read]").textContent = `${Math.max(1, Math.round(words / 230))} min de lectura`;
          const bar = ctx.$("[data-progress]");
          bar.max = goal;
          bar.value = Math.min(goal, words);
          if (words >= goal && !editor.dataset.done) {
            editor.dataset.done = "1";
            ctx.toast({ title: "Meta alcanzada 🎉", description: `${goal} palabras` });
          }
        };
        const setFocus = (on) => {
          btn.setAttribute("aria-pressed", String(on));
          btn.textContent = on ? "Salir del enfoque" : "Entrar en enfoque";
          ctx.$$(".xp-head, [data-chrome] > :not([data-focus])").forEach((el) => (el.style.opacity = on ? "0.08" : ""));
          editor.style.fontSize = on ? "17px" : "";
          if (on) editor.focus();
        };
        ctx.on(btn, "click", () => setFocus(btn.getAttribute("aria-pressed") !== "true"));
        ctx.on(editor, "keydown", (e) => {
          if (e.key === "Escape") setFocus(false);
        });
        ctx.on(editor, "input", () => {
          stats();
          ctx.$("[data-saved]").textContent = "Guardando…";
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            ctx.$("[data-saved]").textContent = `Guardado ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
          }, 800);
        });
        ctx.onCleanup(() => clearTimeout(saveTimer));
        ctx.on(ctx.$("[data-goal]"), "change", () => {
          delete editor.dataset.done;
          stats();
        });
        stats();
      }
    },

    "floating-toolbar": {
      html: `
        ${head("Diseños · floating-toolbar.tsx", "Barra de herramientas flotante", "Selecciona cualquier texto del artículo: aparece una barra de formato justo encima de la selección.")}
        <div class="xp-rel">
          <div class="tsl-row xp-panel" data-toolbar hidden style="position:absolute;z-index:5;padding:4px;--gap:2px;box-shadow:var(--tsl-shadow-lg);background:var(--tsl-bg-elevated)">
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="bold" style="font-weight:700">B</button>
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="italic" style="font-style:italic">I</button>
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="underline" style="text-decoration:underline">U</button>
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="strikeThrough" style="text-decoration:line-through">S</button>
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="hiliteColor">Resaltar</button>
            <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cmd="removeFormat">Limpiar</button>
          </div>
          <div class="xp-editor" contenteditable="true" data-editor spellcheck="false">
            <p>Las interfaces deben transmitir <b>calma</b>. Selecciona una frase de este párrafo y la barra flota encima, justo donde ya está tu atención.</p>
            <p>Prueba a poner algo en cursiva, subrayar una idea clave o resaltar la frase que quieras recordar después.</p>
          </div>
        </div>`,
      setup(root, ctx) {
        const editor = ctx.$("[data-editor]");
        const bar = ctx.$("[data-toolbar]");
        const wrap = editor.parentElement;
        const place = () => {
          const sel = document.getSelection();
          if (!sel.rangeCount || sel.isCollapsed || !editor.contains(sel.anchorNode)) {
            bar.hidden = true;
            return;
          }
          const r = sel.getRangeAt(0).getBoundingClientRect();
          const w = wrap.getBoundingClientRect();
          bar.hidden = false;
          const left = Math.max(0, Math.min(w.width - bar.offsetWidth, r.left - w.left + r.width / 2 - bar.offsetWidth / 2));
          bar.style.left = `${left}px`;
          bar.style.top = `${r.top - w.top - bar.offsetHeight - 8}px`;
        };
        ctx.on(document, "selectionchange", place);
        ctx.on(bar, "mousedown", (e) => e.preventDefault());
        ctx.$$("[data-cmd]").forEach((b) =>
          ctx.on(b, "click", () => {
            const cmd = b.dataset.cmd;
            document.execCommand(cmd, false, cmd === "hiliteColor" ? "rgba(99,102,241,.35)" : null);
            place();
          })
        );
      }
    },

    "canvas-tools": {
      html: `
        ${head("Diseños · canvas-tools.tsx", "Herramientas de lienzo", "Conceptos básicos de un lienzo infinito: arrastra nodos, agrega notas, haz zoom y elimina la selección con ⌫.")}
        <div class="tsl-row">
          <div class="tsl-btn-group"><button type="button" class="tsl-btn tsl-btn--sm" data-add>+ Nota</button><button type="button" class="tsl-btn tsl-btn--sm" data-zoom="-0.1">−</button><button type="button" class="tsl-btn tsl-btn--sm" data-zoom="0">Restablecer</button><button type="button" class="tsl-btn tsl-btn--sm" data-zoom="0.1">+</button></div>
          <span class="tsl-badge tsl-badge--outline xp-mono" data-zoom-label>100%</span>
          <span class="tsl-spacer"></span><span class="tsl-muted" data-sel>Nada seleccionado</span>
          <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--danger" data-del disabled>Eliminar</button>
        </div>
        <div class="xp-board" data-board tabindex="0" aria-label="Lienzo">
          <div data-layer style="position:absolute;inset:0;transform-origin:0 0">
            <div class="xp-node" style="left:60px;top:60px">💡 Idea</div>
            <div class="xp-node" style="left:260px;top:140px">🧪 Prototipo</div>
            <div class="xp-node" style="left:480px;top:70px">🚀 Lanzamiento</div>
          </div>
        </div>`,
      setup(root, ctx) {
        const board = ctx.$("[data-board]");
        const layer = ctx.$("[data-layer]");
        let zoom = 1;
        let selected = null;
        let drag = null;
        let n = 0;
        const select = (node) => {
          ctx.$$(".xp-node").forEach((x) => x.classList.toggle("is-selected", x === node));
          selected = node;
          ctx.$("[data-sel]").textContent = node ? `Seleccionado: ${node.textContent}` : "Nada seleccionado";
          ctx.$("[data-del]").disabled = !node;
        };
        const setZoom = (z) => {
          zoom = Math.max(0.4, Math.min(2, Math.round(z * 10) / 10));
          layer.style.transform = `scale(${zoom})`;
          ctx.$("[data-zoom-label]").textContent = `${Math.round(zoom * 100)}%`;
        };
        ctx.on(board, "pointerdown", (e) => {
          const node = e.target.closest(".xp-node");
          select(node);
          if (!node) return;
          drag = { node, x: e.clientX, y: e.clientY, left: node.offsetLeft, top: node.offsetTop };
          board.setPointerCapture(e.pointerId);
          node.style.cursor = "grabbing";
        });
        ctx.on(board, "pointermove", (e) => {
          if (!drag) return;
          drag.node.style.left = `${drag.left + (e.clientX - drag.x) / zoom}px`;
          drag.node.style.top = `${drag.top + (e.clientY - drag.y) / zoom}px`;
        });
        ctx.on(board, "pointerup", () => {
          if (drag) drag.node.style.cursor = "";
          drag = null;
        });
        ctx.on(board, "wheel", (e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();
          setZoom(zoom - Math.sign(e.deltaY) * 0.1);
        }, { passive: false });
        ctx.$$("[data-zoom]").forEach((b) => ctx.on(b, "click", () => setZoom(Number(b.dataset.zoom) === 0 ? 1 : zoom + Number(b.dataset.zoom))));
        ctx.on(ctx.$("[data-add]"), "click", () => {
          const node = document.createElement("div");
          node.className = "xp-node";
          node.textContent = `📝 Nota ${++n}`;
          node.style.left = `${120 + ((n * 37) % 300)}px`;
          node.style.top = `${200 + ((n * 23) % 120)}px`;
          layer.appendChild(node);
          select(node);
        });
        const del = () => {
          if (!selected) return;
          selected.remove();
          select(null);
        };
        ctx.on(ctx.$("[data-del]"), "click", del);
        ctx.on(board, "keydown", (e) => {
          if (e.key === "Backspace" || e.key === "Delete") del();
        });
      }
    },

    "bottom-nav": {
      html: `
        ${head("Diseños · bottom-nav.tsx", "Navegación inferior", "Barra de pestañas móvil: cambia de pantalla, la búsqueda filtra en vivo y la insignia de la bandeja se borra al visitarla.")}
        <div class="xp-center" style="min-height:0">
          <div class="xp-phone">
            <div style="flex:1;overflow:auto;padding:22px 18px" data-screen></div>
            <nav class="tsl-row" style="--gap:0;border-top:1px solid var(--tsl-border);flex-wrap:nowrap" data-tabs>
              ${[["home", "⌂", "Inicio"], ["search", "⌕", "Buscar"], ["inbox", "✉", "Bandeja"], ["me", "☺", "Perfil"]]
                .map(([k, i, l], n) => `<button type="button" class="tsl-btn tsl-btn--subtle" data-tab="${k}" style="flex:1;flex-direction:column;height:62px;border-radius:0;gap:2px"${n ? "" : ' aria-current="page"'}><span style="font-size:17px">${i}</span><span style="font-size:10px">${l}</span>${k === "inbox" ? '<span class="tsl-badge tsl-badge--danger" data-badge style="position:absolute;top:6px;right:20px;padding:0 5px">3</span>' : ""}</button>`)
                .join("")}
            </nav>
          </div>
        </div>`,
      setup(root, ctx) {
        const screen = ctx.$("[data-screen]");
        const people = ["Ana López", "Leo Kim", "Sara Ruiz", "Tom Weber", "Mia Chen", "Noah Patel"];
        const views = {
          home: () => `<span class="tsl-eyebrow">Hoy</span><h3 class="xp-title">${new Date().getHours() < 12 ? "Buenos días" : "Buenas tardes"}</h3><div class="tsl-stack" style="margin-top:14px"><div class="tsl-stat"><span class="tsl-eyebrow">Pasos</span><span class="tsl-stat__value">8,214</span><progress class="tsl-progress" max="10000" value="8214"></progress></div><div class="tsl-stat"><span class="tsl-eyebrow">Enfoque</span><span class="tsl-stat__value">2 h 40 min</span></div></div>`,
          search: () => `<input class="tsl-input" placeholder="Buscar personas…" data-q aria-label="Buscar personas" /><ul class="tsl-list" style="margin-top:12px" data-results>${people.map((p) => `<li>${p}</li>`).join("")}</ul>`,
          inbox: () => `<span class="tsl-eyebrow">Bandeja</span><ul class="tsl-list" style="margin-top:10px"><li>Ana: ¿comemos?</li><li>Leo: PR aprobado</li><li>Sara: roadmap v2</li></ul>`,
          me: () => `<div class="tsl-stack" style="align-items:center;text-align:center"><span class="tsl-avatar tsl-avatar--lg" data-status="online">LI</span><strong>Luis Islas</strong><span class="tsl-muted">Diseñador de producto</span><label class="tsl-choice" style="margin-top:12px">Notificaciones <input type="checkbox" role="switch" class="tsl-switch" checked /></label></div>`
        };
        const show = (k) => {
          ctx.$$("[data-tab]").forEach((b) => (b.dataset.tab === k ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
          screen.innerHTML = views[k]();
          if (k === "inbox") {
            const badge = ctx.$("[data-badge]");
            if (badge) badge.hidden = true;
          }
          const q = screen.querySelector("[data-q]");
          if (q) {
            q.addEventListener("input", () => {
              screen.querySelectorAll("[data-results] li").forEach((li) => (li.hidden = !li.textContent.toLowerCase().includes(q.value.toLowerCase())));
            });
            q.focus();
          }
        };
        ctx.on(ctx.$("[data-tabs]"), "click", (e) => {
          const b = e.target.closest("[data-tab]");
          if (b) show(b.dataset.tab);
        });
        show("home");
      }
    }
  });

  // ==========================================================================
  // FORMS
  // ==========================================================================
  X.addMany("forms", {
    "workspace-settings": {
      html: () => `
        ${head("Formularios · workspace-settings.tsx", "Ajustes del espacio de trabajo", "El slug de la URL sigue al nombre hasta que lo editas. La validación se ejecuta al guardar; la zona de peligro requiere confirmación.")}
        <form class="xp-panel tsl-stack" data-xp-form data-success="Espacio de trabajo “{name}” guardado" style="max-width:620px">
          <div class="tsl-row" style="--gap:14px"><span class="tsl-avatar tsl-avatar--lg tsl-avatar--square" data-logo>A</span><div><strong data-preview-name>Acme inc.</strong><div class="tsl-muted xp-mono" data-preview-url>tesela.example/acme-inc</div></div></div>
          ${field({ name: "name", label: "Nombre del espacio de trabajo", value: "Acme inc.", minlength: 2 })}
          <div class="tsl-field"><label class="tsl-label" for="ws-slug">URL</label><div class="tsl-input-group"><span class="tsl-input-group__addon">tesela.example/</span><input class="tsl-input" id="ws-slug" name="slug" value="acme-inc" required pattern="[a-z0-9\\-]{2,32}" data-pattern-msg="Solo minúsculas, números y guiones." /></div></div>
          <div class="tsl-field"><label class="tsl-label" for="ws-tz">Zona horaria</label><select class="tsl-select" id="ws-tz" name="tz"><option>America/Mexico_City</option><option>Europe/Madrid</option><option>UTC</option></select></div>
          <div class="tsl-row"><button type="submit" class="tsl-btn tsl-btn--primary">Guardar cambios</button></div>
        </form>
        <div class="tsl-alert tsl-alert--danger" style="max-width:620px"><div style="flex:1"><div class="tsl-alert__title">Zona de peligro</div><div class="tsl-alert__desc">Eliminar el espacio de trabajo borra todos los proyectos y miembros.</div></div><button type="button" class="tsl-btn tsl-btn--danger tsl-btn--sm" data-tsl-open="ws-delete">Eliminar…</button></div>
        <dialog class="tsl-dialog" id="ws-delete" aria-labelledby="ws-delete-t">
          <div class="tsl-dialog__header"><h3 class="tsl-dialog__title" id="ws-delete-t">Eliminar espacio de trabajo</h3><p class="tsl-dialog__desc">Escribe el slug <code data-slug-echo>acme-inc</code> para confirmar.</p></div>
          <div class="tsl-dialog__body"><input class="tsl-input" data-confirm aria-label="Confirmar slug" /></div>
          <div class="tsl-dialog__footer"><button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="button" class="tsl-btn tsl-btn--danger" data-delete disabled data-tsl-close="delete">Eliminar definitivamente</button></div>
        </dialog>`,
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        const name = ctx.$('[name="name"]');
        const slug = ctx.$('[name="slug"]');
        let manual = false;
        const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
        const preview = () => {
          ctx.$("[data-preview-name]").textContent = name.value || "Sin título";
          ctx.$("[data-logo]").textContent = (name.value || "?")[0].toUpperCase();
          ctx.$("[data-preview-url]").textContent = `tesela.example/${slug.value}`;
          ctx.$("[data-slug-echo]").textContent = slug.value;
        };
        ctx.on(name, "input", () => {
          if (!manual) slug.value = slugify(name.value);
          preview();
        });
        ctx.on(slug, "input", () => {
          manual = true;
          preview();
        });
        const confirm = ctx.$("[data-confirm]");
        ctx.on(confirm, "input", () => (ctx.$("[data-delete]").disabled = confirm.value !== slug.value));
        ctx.on(ctx.$("#ws-delete"), "close", (e) => {
          if (e.target.returnValue === "delete") ctx.toast({ title: "Espacio de trabajo programado para eliminación", variant: "danger" });
          confirm.value = "";
          ctx.$("[data-delete]").disabled = true;
        });
      }
    },

    "invite-teammates": {
      html: `
        ${head("Formularios · invite-teammates.tsx", "Invitar al equipo", "Agrega filas, elige roles y envía. Los asientos se actualizan en vivo y las invitaciones pendientes se pueden revocar.")}
        <div class="xp-panel tsl-stack" style="max-width:640px">
          <div class="tsl-row"><strong>Invitar por correo</strong><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--outline" data-seats></span></div>
          <div class="tsl-stack" data-rows style="--gap:8px"></div>
          <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-add>+ Agregar otro</button><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--primary" data-send>Enviar invitaciones</button></div>
        </div>
        <div class="tsl-stack" style="max-width:640px"><span class="tsl-eyebrow">Invitaciones pendientes</span><ul class="tsl-list" data-pending><li class="tsl-muted" data-none>No hay invitaciones pendientes.</li></ul></div>`,
      setup(root, ctx) {
        const TOTAL = 10;
        let used = 4;
        const rows = ctx.$("[data-rows]");
        const addRow = (email = "") => {
          const row = document.createElement("div");
          row.className = "tsl-row";
          row.style.flexWrap = "nowrap";
          row.innerHTML = `<input class="tsl-input" type="email" placeholder="nombre@empresa.com" aria-label="Correo electrónico" style="flex:1" /><select class="tsl-select" style="width:130px" aria-label="Rol"><option>Miembro</option><option>Admin</option><option>Lector</option></select><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--subtle" aria-label="Quitar fila">✕</button>`;
          row.querySelector("input").value = email;
          row.querySelector("button").addEventListener("click", () => {
            if (rows.children.length > 1) row.remove();
          });
          rows.appendChild(row);
        };
        const seats = () => (ctx.$("[data-seats]").textContent = `${used} de ${TOTAL} asientos en uso`);
        ctx.on(ctx.$("[data-add]"), "click", () => addRow());
        ctx.on(ctx.$("[data-send]"), "click", () => {
          const valid = [];
          let bad = 0;
          Array.from(rows.children).forEach((row) => {
            const input = row.querySelector("input");
            const v = input.value.trim();
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            input.setAttribute("aria-invalid", String(Boolean(v) && !ok));
            if (v && !ok) bad++;
            if (ok) valid.push([v, row.querySelector("select").value]);
          });
          if (bad) return ctx.toast({ title: `${bad} ${bad > 1 ? "correos no válidos" : "correo no válido"}`, variant: "danger" });
          if (!valid.length) return ctx.toast({ title: "Agrega al menos un correo", variant: "warning" });
          if (used + valid.length > TOTAL) return ctx.toast({ title: "No hay suficientes asientos", description: "Mejora tu plan para invitar a más personas.", variant: "warning" });
          const list = ctx.$("[data-pending]");
          const none = ctx.$("[data-none]");
          if (none) none.remove();
          valid.forEach(([email, role]) => {
            used++;
            const li = document.createElement("li");
            li.innerHTML = `<span class="tsl-avatar tsl-avatar--sm"></span><div><div class="tsl-list__title"></div><div class="tsl-list__desc"></div></div><div class="tsl-list__end"><span class="tsl-badge tsl-badge--warning">Pendiente</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle">Revocar</button></div>`;
            li.querySelector(".tsl-avatar").textContent = email[0].toUpperCase();
            li.querySelector(".tsl-list__title").textContent = email;
            li.querySelector(".tsl-list__desc").textContent = role;
            li.querySelector("button").addEventListener("click", () => {
              li.remove();
              used--;
              seats();
            });
            list.appendChild(li);
          });
          rows.innerHTML = "";
          addRow();
          seats();
          ctx.toast({ title: `${valid.length > 1 ? "Invitaciones enviadas" : "Invitación enviada"}: ${valid.length}` });
        });
        addRow("ana@acme.dev");
        addRow();
        seats();
      }
    },

    notifications: {
      html: `
        ${head("Formularios · notifications.tsx", "Preferencias de notificaciones", "Matriz de eventos × canales con interruptores por columna, frecuencia del resumen y horas de silencio.")}
        <form class="tsl-stack" data-form style="max-width:720px">
          <div class="tsl-table-wrap"><table class="tsl-table">
            <thead><tr><th>Evento</th>${["Email", "Push", "Slack"].map((c) => `<th style="text-align:center"><label class="tsl-choice" style="justify-content:center">${c} <input type="checkbox" class="tsl-check" data-col="${c}" aria-label="Alternar todo en ${c}" /></label></th>`).join("")}</tr></thead>
            <tbody>${["Menciones", "Comentarios", "Asignado a mí", "Deploy fallido", "Informe semanal"]
              .map((ev, r) => `<tr><td>${ev}</td>${["Email", "Push", "Slack"].map((c, ci) => `<td style="text-align:center"><input type="checkbox" class="tsl-check" data-ch="${c}" aria-label="${ev} por ${c}"${(r + ci) % 2 === 0 ? " checked" : ""} /></td>`).join("")}</tr>`)
              .join("")}</tbody>
          </table></div>
          <div class="xp-panel tsl-row" style="--gap:16px">
            <span class="tsl-label">Resumen</span>
            <tsl-segmented value="daily" data-digest><button class="tsl-segmented__item" value="off">Desactivado</button><button class="tsl-segmented__item" value="daily">Diario</button><button class="tsl-segmented__item" value="weekly">Semanal</button></tsl-segmented>
            <span class="tsl-spacer"></span>
            <label class="tsl-choice">Horas de silencio <input type="checkbox" role="switch" class="tsl-switch" data-quiet /></label>
            <input class="tsl-input" type="time" value="22:00" style="width:110px" data-q1 disabled aria-label="Desde" /> → <input class="tsl-input" type="time" value="08:00" style="width:110px" data-q2 disabled aria-label="Hasta" />
          </div>
          <div class="tsl-row"><button type="submit" class="tsl-btn tsl-btn--primary">Guardar preferencias</button><span class="tsl-muted" data-summary></span></div>
        </form>`,
      setup(root, ctx) {
        const summary = () => {
          const on = ctx.$$("[data-ch]:checked").length;
          ctx.$("[data-summary]").textContent = `${on} de ${ctx.$$("[data-ch]").length} notificaciones activas`;
          ctx.$$("[data-col]").forEach((h) => {
            const boxes = ctx.$$(`[data-ch="${h.dataset.col}"]`);
            const n = boxes.filter((b) => b.checked).length;
            h.checked = n === boxes.length;
            h.indeterminate = n > 0 && n < boxes.length;
          });
        };
        ctx.$$("[data-col]").forEach((h) =>
          ctx.on(h, "change", () => {
            ctx.$$(`[data-ch="${h.dataset.col}"]`).forEach((b) => (b.checked = h.checked));
            summary();
          })
        );
        ctx.on(ctx.$("tbody"), "change", summary);
        ctx.on(ctx.$("[data-quiet]"), "change", (e) => {
          ctx.$("[data-q1]").disabled = !e.target.checked;
          ctx.$("[data-q2]").disabled = !e.target.checked;
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const quiet = ctx.$("[data-quiet]").checked ? ` · silencio ${ctx.$("[data-q1]").value}–${ctx.$("[data-q2]").value}` : "";
          ctx.toast({ title: "Preferencias guardadas", description: `${ctx.$$("[data-ch]:checked").length} canales activos · resumen ${ctx.$("[data-digest]").value}${quiet}` });
        });
        summary();
      }
    },

    "api-key": {
      html: `
        ${head("Formularios · api-key.tsx", "Crear API key", "Elige permisos y vencimiento; el secreto se muestra una sola vez con un botón de copiar y luego se oculta en la lista.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <form class="xp-panel tsl-stack" data-form>
            <label class="tsl-field"><span class="tsl-label">Nombre de la clave</span><input class="tsl-input" name="name" required placeholder="Clave de deploy para CI" /></label>
            <fieldset class="tsl-stack" style="border:0;padding:0;margin:0;--gap:8px"><legend class="tsl-label" style="margin-bottom:8px">Permisos</legend>
              <label class="tsl-choice"><input type="checkbox" class="tsl-check" value="read" checked /> read — listar y consultar recursos</label>
              <label class="tsl-choice"><input type="checkbox" class="tsl-check" value="write" /> write — crear y actualizar</label>
              <label class="tsl-choice"><input type="checkbox" class="tsl-check" value="admin" /> admin — incluye read + write</label>
            </fieldset>
            <label class="tsl-field"><span class="tsl-label">Vence</span><select class="tsl-select" name="exp"><option value="30">30 días</option><option value="90" selected>90 días</option><option value="0">Nunca</option></select></label>
            <button type="submit" class="tsl-btn tsl-btn--primary">Crear clave</button>
          </form>
          <div class="tsl-stack">
            <div class="tsl-alert tsl-alert--warning" data-secret-box hidden><div style="flex:1;min-width:0"><div class="tsl-alert__title">Copia tu secreto ahora</div><div class="tsl-alert__desc">No se volverá a mostrar.</div>
              <div class="tsl-input-group" style="margin-top:8px"><input class="tsl-input xp-mono" readonly data-secret aria-label="Secreto" id="api-secret" /><button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" style="margin:3px" data-tsl-copy data-tsl-copy-target="#api-secret">Copiar</button></div></div></div>
            <ul class="tsl-list" data-keys><li><div><div class="tsl-list__title">Producción</div><div class="tsl-list__desc xp-mono">tsl_live_••••a2f1 · read, write</div></div><div class="tsl-list__end"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-revoke>Revocar</button></div></li></ul>
          </div>
        </div>`,
      setup(root, ctx) {
        const form = ctx.$("[data-form]");
        const boxes = ctx.$$('fieldset input[type="checkbox"]');
        const admin = boxes.find((b) => b.value === "admin");
        ctx.on(admin, "change", () => boxes.forEach((b) => b !== admin && ((b.checked = admin.checked || b.checked), (b.disabled = admin.checked))));
        ctx.on(ctx.$("[data-keys]"), "click", (e) => {
          const b = e.target.closest("[data-revoke]");
          if (!b) return;
          const li = b.closest("li");
          ctx.toast({ title: `Revocada ${li.querySelector(".tsl-list__title").textContent}`, variant: "danger" });
          li.remove();
        });
        ctx.on(form, "submit", (e) => {
          e.preventDefault();
          if (!form.reportValidity()) return;
          const scopes = boxes.filter((b) => b.checked).map((b) => b.value);
          if (!scopes.length) return ctx.toast({ title: "Selecciona al menos un permiso", variant: "warning" });
          const bytes = crypto.getRandomValues(new Uint8Array(16));
          const secret = `tsl_live_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
          ctx.$("[data-secret]").value = secret;
          ctx.$("[data-secret-box]").hidden = false;
          const li = document.createElement("li");
          li.innerHTML = `<div><div class="tsl-list__title"></div><div class="tsl-list__desc xp-mono"></div></div><div class="tsl-list__end"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-revoke>Revocar</button></div>`;
          li.querySelector(".tsl-list__title").textContent = form.name.value;
          const exp = form.exp.value === "0" ? "no vence" : `vence en ${form.exp.value} d`;
          li.querySelector(".tsl-list__desc").textContent = `tsl_live_••••${secret.slice(-4)} · ${scopes.join(", ")} · ${exp}`;
          ctx.$("[data-keys]").prepend(li);
          form.reset();
          boxes.forEach((b) => (b.disabled = false));
        });
      }
    }
  });

  // ==========================================================================
  // AUTH & ONBOARDING
  // ==========================================================================
  const social = `<div class="tsl-grid" style="--min:120px;--gap:8px"><button type="button" class="tsl-btn" data-social="GitHub">GitHub</button><button type="button" class="tsl-btn" data-social="Google">Google</button></div><div class="tsl-divider">o</div>`;
  const forgot = `<a href="#" class="tsl-hint" data-forgot>¿Olvidaste tu contraseña?</a>`;

  function authForm({ title, sub, fields, submit, success, withSocial = true, extra = "", foot = "", brand = "Acme" }) {
    return `
      <form class="tsl-stack" data-xp-form data-success="${esc(success)}" style="width:100%;max-width:360px;--gap:14px" novalidate>
        <div><span class="tsl-eyebrow">${brand}</span><h3 class="xp-title" style="font-size:22px">${title}</h3>${sub ? `<p class="tsl-muted" style="margin-top:4px">${sub}</p>` : ""}</div>
        ${withSocial ? social : ""}
        ${fields.map(field).join("")}
        ${extra}
        <button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--block">${submit}</button>
        ${foot ? `<p class="tsl-hint" style="text-align:center">${foot}</p>` : ""}
      </form>`;
  }

  function authSetup(root, ctx) {
    TESELA_XP.formSetup(root, ctx);
    root.querySelectorAll("[data-social]").forEach((b) =>
      ctx.on(b, "click", () => {
        b.setAttribute("aria-busy", "true");
        ctx.timeout(700, () => {
          b.removeAttribute("aria-busy");
          ctx.toast({ title: `Continuaste con ${b.dataset.social}` });
        });
      })
    );
    root.querySelectorAll("[data-forgot]").forEach((a) =>
      ctx.on(a, "click", (e) => {
        e.preventDefault();
        const email = root.querySelector('[name="email"]');
        ctx.toast({ title: "Enlace de restablecimiento enviado", description: email && email.value ? email.value : "Revisa tu bandeja de entrada", variant: "info" });
      })
    );
  }

  const emailF = { name: "email", label: "Correo electrónico", type: "email", placeholder: "tu@empresa.com", autocomplete: "email" };
  const pwF = { name: "password", label: "Contraseña", type: "password", minlength: 8, autocomplete: "current-password" };
  const art = (quote) => `<div class="xp-auth-art"><span class="tsl-eyebrow" style="color:var(--tsl-fg)">✦ Acme</span><blockquote>“${quote}”<br /><span class="tsl-muted">— Ana López, líder de diseño</span></blockquote></div>`;
  const remember = `<label class="tsl-choice"><input type="checkbox" class="tsl-check" name="remember" /> Recuérdame durante 30 días</label>`;

  X.addMany("auth", {
    login: {
      html: () => `${head("Autenticación · login.tsx", "Inicio de sesión", "Valida correo y contraseña (8+ caracteres), mostrar contraseña, acceso social y enlace de restablecimiento.")}
        <div class="xp-center"><div class="tsl-card xp-auth-card"><div class="tsl-card__body">${authForm({ title: "Te damos la bienvenida", sub: "Inicia sesión para continuar.", fields: [emailF, { ...pwF, aside: forgot }], submit: "Iniciar sesión", success: "Sesión iniciada como {email}", extra: remember, foot: "¿No tienes cuenta? Regístrate" })}</div></div></div>`,
      setup: authSetup
    },
    "inset-login": {
      html: () => `${head("Autenticación · inset-login.tsx", "Inicio de sesión enmarcado", "Tarjeta enmarcada dentro de una superficie de testimonio.")}
        <div class="xp-panel" style="padding:40px 16px"><div class="xp-center" style="min-height:0"><div class="tsl-card xp-auth-card" style="box-shadow:var(--tsl-shadow-lg)"><div class="tsl-card__body">${authForm({ title: "Iniciar sesión", fields: [emailF, pwF], submit: "Continuar", success: "Te damos la bienvenida, {email}", withSocial: false, extra: remember })}</div><div class="tsl-card__footer" style="justify-content:center"><span class="tsl-hint">Protegido con 2FA · SOC 2</span></div></div></div></div>`,
      setup: authSetup
    },
    "centered-signin": {
      html: () => `${head("Autenticación · centered-signin.tsx", "Inicio de sesión centrado", "Dos pasos: primero el correo y luego la contraseña o SSO para dominios de empresa verificados.")}
        <div class="xp-center">
          <form class="tsl-stack" data-step-email style="width:100%;max-width:340px" novalidate>
            <span class="tsl-eyebrow" style="text-align:center">Acme</span><h3 class="xp-title" style="text-align:center">Iniciar sesión</h3>
            ${field(emailF)}
            <button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--block">Continuar</button>
            <p class="tsl-hint" style="text-align:center">Consejo: usa una dirección @acme.dev para ver SSO.</p>
          </form>
          <form class="tsl-stack" data-xp-form data-success="Sesión iniciada" data-step-pw hidden style="width:100%;max-width:340px" novalidate>
            <button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" data-change style="align-self:flex-start">← <span data-email-echo></span></button>
            <div data-sso hidden class="tsl-alert tsl-alert--info"><div><div class="tsl-alert__title">SSO disponible</div><div class="tsl-alert__desc">acme.dev usa Okta.</div><button type="button" class="tsl-btn tsl-btn--sm" style="margin-top:8px" data-social="Okta SSO">Continuar con SSO</button></div></div>
            ${field({ ...pwF, aside: forgot })}
            <button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--block">Iniciar sesión</button>
          </form>
        </div>`,
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        const step1 = ctx.$("[data-step-email]");
        const step2 = ctx.$("[data-step-pw]");
        const email = step1.querySelector('[name="email"]');
        ctx.on(step1, "submit", (e) => {
          e.preventDefault();
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
          email.setAttribute("aria-invalid", String(!ok));
          if (!ok) return email.focus();
          ctx.$("[data-email-echo]").textContent = email.value;
          ctx.$("[data-sso]").hidden = !email.value.toLowerCase().endsWith("@acme.dev");
          step1.hidden = true;
          step2.hidden = false;
          step2.querySelector("input").focus();
        });
        ctx.on(ctx.$("[data-change]"), "click", () => {
          step2.hidden = true;
          step1.hidden = false;
        });
        ctx.$$("[data-social]").forEach((b) => ctx.on(b, "click", () => ctx.toast({ title: "Redirigiendo a Okta…", variant: "info" })));
        ctx.$$("[data-forgot]").forEach((a) => ctx.on(a, "click", (e) => (e.preventDefault(), ctx.toast({ title: "Enlace de restablecimiento enviado", variant: "info" }))));
      }
    },
    "centered-signup": {
      html: () => `${head("Autenticación · centered-signup.tsx", "Registro centrado", "Medidor de seguridad, confirmación de contraseña y casilla obligatoria de términos.")}
        <div class="xp-center">${authForm({
          title: "Crea tu cuenta",
          sub: "Gratis por 14 días. No se requiere tarjeta.",
          fields: [{ name: "fullname", label: "Nombre completo", placeholder: "Ana López" }, emailF, { ...pwF, autocomplete: "new-password", strength: true }, { name: "confirm", label: "Confirmar contraseña", type: "password", match: "password" }],
          extra: `<label class="tsl-choice"><input type="checkbox" class="tsl-check" name="terms" required data-required-msg="Acepta los términos para continuar." /> Acepto los Términos y la Política de privacidad</label>`,
          submit: "Crear cuenta",
          success: "¡Te damos la bienvenida, {fullname}!"
        })}</div>`,
      setup: authSetup
    },
    "left-signin": {
      html: () => `${head("Autenticación · left-signin.tsx", "Inicio de sesión a la izquierda", "Pantalla dividida con el arte de la marca a la izquierda.")}
        <div class="xp-center"><div class="xp-auth-split">${art("tesela-ui redujo a la mitad nuestro tiempo del diseño al lanzamiento.")}<div class="xp-auth-form">${authForm({ title: "Iniciar sesión", fields: [emailF, { ...pwF, aside: forgot }], submit: "Iniciar sesión", success: "Sesión iniciada como {email}" })}</div></div></div>`,
      setup: authSetup
    },
    "right-signin": {
      html: () => `${head("Autenticación · right-signin.tsx", "Inicio de sesión a la derecha", "División invertida: primero el formulario y la vista previa del producto a la derecha.")}
        <div class="xp-center"><div class="xp-auth-split"><div class="xp-auth-form">${authForm({ title: "Te damos la bienvenida", fields: [emailF, pwF], submit: "Iniciar sesión", success: "Sesión iniciada como {email}", extra: remember })}</div>${art("El panel más tranquilo que nuestro equipo ha usado.")}</div></div>`,
      setup: authSetup
    },
    "glass-signup": {
      html: () => `${head("Autenticación · glass-signup.tsx", "Registro de vidrio", "Tarjeta esmerilada sobre un degradado tipo shader.")}
        <div class="xp-glass-bg"><div class="xp-center" style="min-height:0"><div class="tsl-card xp-auth-card xp-glass"><div class="tsl-card__body">${authForm({ title: "Únete a la beta", fields: [{ name: "fullname", label: "Nombre" }, emailF, { ...pwF, strength: true, autocomplete: "new-password" }], submit: "Solicitar acceso", success: "¡Ya estás dentro, {fullname}!", withSocial: false })}</div></div></div></div>`,
      setup: authSetup
    },

    onboarding: {
      html: `${head("Autenticación · onboarding.tsx", "Onboarding", "Asistente de tres pasos con validación por paso, navegación hacia atrás y un resumen final.")}
        <div class="xp-panel tsl-stack" style="max-width:560px;margin:0 auto;width:100%;--gap:18px">
          <ol class="tsl-steps" data-steps><li aria-current="step">Perfil</li><li>Espacio</li><li>Invitar</li><li>Listo</li></ol>
          <section data-step="0" class="tsl-stack"><label class="tsl-field"><span class="tsl-label">Tu nombre</span><input class="tsl-input" data-req name="name" placeholder="Ana López" /></label><label class="tsl-field"><span class="tsl-label">Rol</span><select class="tsl-select" name="role"><option>Diseño</option><option>Ingeniería</option><option>Fundación</option></select></label></section>
          <section data-step="1" class="tsl-stack" hidden><label class="tsl-field"><span class="tsl-label">Nombre del espacio de trabajo</span><input class="tsl-input" data-req name="ws" placeholder="Acme" /></label><span class="tsl-label">Tamaño del equipo</span><tsl-segmented value="2-10" data-size><button class="tsl-segmented__item" value="1">Solo yo</button><button class="tsl-segmented__item" value="2-10">2–10</button><button class="tsl-segmented__item" value="11+">11+</button></tsl-segmented></section>
          <section data-step="2" class="tsl-stack" hidden><span class="tsl-label">Invita a tu equipo (opcional)</span><tsl-tags name="invites" placeholder="correo + Enter"></tsl-tags></section>
          <section data-step="3" class="tsl-stack" hidden><div class="tsl-empty"><div class="tsl-empty__title">Todo listo 🎉</div><p class="tsl-empty__desc" data-summary></p></div></section>
          <div class="tsl-row"><button type="button" class="tsl-btn" data-back disabled>Atrás</button><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--primary" data-next>Continuar</button></div>
        </div>`,
      setup(root, ctx) {
        let step = 0;
        const steps = ctx.$$("[data-steps] li");
        const panels = ctx.$$("[data-step]");
        const render = () => {
          panels.forEach((p, i) => (p.hidden = i !== step));
          steps.forEach((li, i) => {
            li.removeAttribute("aria-current");
            li.removeAttribute("data-state");
            if (i < step) li.dataset.state = "done";
            if (i === step) li.setAttribute("aria-current", "step");
          });
          ctx.$("[data-back]").disabled = step === 0 || step === 3;
          ctx.$("[data-next]").textContent = step === 2 ? "Finalizar" : step === 3 ? "Empezar de nuevo" : "Continuar";
          if (step === 3) {
            const tags = ctx.$("tsl-tags").value;
            ctx.$("[data-summary]").textContent = `${ctx.$('[name="name"]').value} (${ctx.$('[name="role"]').value}) creó “${ctx.$('[name="ws"]').value}” para ${ctx.$("[data-size]").value} personas e invitó a ${tags.length} ${tags.length === 1 ? "compañero" : "compañeros"} de equipo.`;
          }
        };
        ctx.on(ctx.$("[data-next]"), "click", () => {
          if (step === 3) {
            step = 0;
            return render();
          }
          const missing = panels[step].querySelectorAll("[data-req]");
          let ok = true;
          missing.forEach((i) => {
            const bad = !i.value.trim();
            i.setAttribute("aria-invalid", String(bad));
            if (bad) ok = false;
          });
          if (!ok) return ctx.toast({ title: "Completa este paso", variant: "warning" });
          step++;
          render();
        });
        ctx.on(ctx.$("[data-back]"), "click", () => {
          step = Math.max(0, step - 1);
          render();
        });
        render();
      }
    },

    waitlist: {
      html: `${head("Autenticación · waitlist.tsx", "Página de lista de espera", "Únete con un correo, obtén tu posición en la fila en vivo y un enlace de referido que te hace avanzar.")}
        <div class="xp-center"><div class="tsl-stack" style="max-width:460px;text-align:center;align-items:center">
          <span class="tsl-badge tsl-badge--accent tsl-badge--upper">Acceso anticipado</span>
          <h3 class="xp-title" style="font-size:32px">La forma tranquila de lanzar UI.</h3>
          <p class="tsl-muted"><strong class="xp-mono" data-count>2,481</strong> personas ya están en espera.</p>
          <form class="tsl-input-group" data-join style="width:100%"><input class="tsl-input" type="email" required placeholder="tu@empresa.com" aria-label="Correo electrónico" /><button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--sm" style="margin:3px">Unirme a la lista</button></form>
          <div class="tsl-stack xp-panel" data-joined hidden style="width:100%;text-align:left">
            <span class="tsl-eyebrow">Ya estás dentro</span><div class="xp-num">#<span data-pos></span></div>
            <span class="tsl-muted">Comparte tu enlace: cada registro te sube 50 lugares.</span>
            <div class="tsl-input-group"><input class="tsl-input xp-mono" readonly id="wl-ref" aria-label="Enlace de referido" /><button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" style="margin:3px" data-tsl-copy data-tsl-copy-target="#wl-ref">Copiar</button></div>
            <button type="button" class="tsl-btn tsl-btn--sm" data-sim>Simular un referido</button>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let count = 2481;
        let pos = 0;
        const fmt = (n) => n.toLocaleString("es-MX");
        ctx.every(2200, () => (ctx.$("[data-count]").textContent = fmt(++count)));
        ctx.on(ctx.$("[data-join]"), "submit", (e) => {
          e.preventDefault();
          const email = e.target.querySelector("input").value;
          pos = ++count;
          ctx.$("[data-pos]").textContent = fmt(pos);
          ctx.$("#wl-ref").value = `https://acme.dev/r/${btoa(email).replace(/=+$/, "").slice(0, 10)}`;
          e.target.hidden = true;
          ctx.$("[data-joined]").hidden = false;
        });
        ctx.on(ctx.$("[data-sim]"), "click", () => {
          pos = Math.max(1, pos - 50);
          ctx.$("[data-pos]").textContent = fmt(pos);
          ctx.toast({ title: "¡Se unió un amigo!", description: `Subiste al lugar #${fmt(pos)}` });
        });
      }
    },

    "check-email": {
      html: `${head("Autenticación · check-email.tsx", "Revisa tu correo", "Reenvía con un temporizador de espera o corrige un error de escritura en la dirección.")}
        <div class="xp-center"><div class="tsl-card xp-auth-card" style="text-align:center"><div class="tsl-card__body tsl-stack" style="align-items:center">
          <div class="tsl-empty__icon">✉</div><h3 class="xp-title">Revisa tu bandeja de entrada</h3>
          <p class="tsl-muted">Enviamos un enlace de verificación a <strong data-email>ana@acme.dev</strong>.</p>
          <button type="button" class="tsl-btn tsl-btn--primary tsl-btn--block" data-resend>Reenviar correo</button>
          <button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" data-edit>¿Dirección incorrecta?</button>
          <form class="tsl-input-group" data-change hidden style="width:100%"><input class="tsl-input" type="email" required aria-label="Nuevo correo" /><button type="submit" class="tsl-btn tsl-btn--sm" style="margin:3px">Actualizar</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        const btn = ctx.$("[data-resend]");
        let left = 0;
        const tick = () => {
          btn.disabled = left > 0;
          btn.textContent = left > 0 ? `Reenviar en ${left} s` : "Reenviar correo";
        };
        ctx.every(1000, () => {
          if (left > 0) {
            left--;
            tick();
          }
        });
        ctx.on(btn, "click", () => {
          left = 30;
          tick();
          ctx.toast({ title: "Correo enviado", description: ctx.$("[data-email]").textContent });
        });
        ctx.on(ctx.$("[data-edit]"), "click", () => {
          const f = ctx.$("[data-change]");
          f.hidden = !f.hidden;
          f.querySelector("input").value = ctx.$("[data-email]").textContent;
        });
        ctx.on(ctx.$("[data-change]"), "submit", (e) => {
          e.preventDefault();
          ctx.$("[data-email]").textContent = e.target.querySelector("input").value;
          e.target.hidden = true;
          left = 30;
          tick();
          ctx.toast({ title: "Dirección actualizada y correo reenviado" });
        });
      }
    },

    "otp-verify": {
      html: `${head("Autenticación · otp-verify.tsx", "Verificación OTP", "Código de 6 dígitos con avance automático. El código de demostración es 424242; los códigos incorrectos vibran y se borran.")}
        <div class="xp-center"><div class="tsl-card xp-auth-card" style="text-align:center"><div class="tsl-card__body tsl-stack" style="align-items:center">
          <h3 class="xp-title">Ingresa el código de verificación</h3><p class="tsl-muted">Enviado a •••• 4821 · código de demostración <code>424242</code></p>
          <tsl-otp length="6" data-otp></tsl-otp>
          <span class="tsl-error" data-err></span>
          <button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm" data-resend>Reenviar código</button>
        </div></div></div>`,
      setup(root, ctx) {
        const otp = ctx.$("[data-otp]");
        ctx.on(otp, "tsl-complete", (e) => {
          if (e.detail.value === "424242") {
            ctx.$("[data-err]").textContent = "";
            otp.querySelectorAll("input").forEach((i) => (i.style.borderColor = "var(--tsl-success)"));
            ctx.toast({ title: "Verificado ✓" });
          } else {
            ctx.$("[data-err]").textContent = "Ese código es incorrecto. Inténtalo de nuevo.";
            otp.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 300 });
            ctx.timeout(350, () => otp.clear());
          }
        });
        ctx.on(ctx.$("[data-resend]"), "click", () => ctx.toast({ title: "Nuevo código enviado", variant: "info" }));
      }
    },

    "reset-password": {
      html: `${head("Autenticación · reset-password.tsx", "Restablecer contraseña", "Lista de reglas en vivo; el envío se habilita solo cuando se cumplen todas las reglas y ambos campos coinciden.")}
        <div class="xp-center"><form class="tsl-card xp-auth-card" data-form><div class="tsl-card__body tsl-stack">
          <h3 class="xp-title">Elige una nueva contraseña</h3>
          <label class="tsl-field"><span class="tsl-label">Nueva contraseña</span><input class="tsl-input" type="password" data-pw autocomplete="new-password" /></label>
          <ul class="tsl-stack" style="--gap:4px;list-style:none;padding:0;margin:0;font-size:12px" data-rules>
            <li data-rule="len">8+ caracteres</li><li data-rule="upper">Una letra mayúscula</li><li data-rule="num">Un número</li><li data-rule="sym">Un símbolo</li>
          </ul>
          <label class="tsl-field"><span class="tsl-label">Confirmar</span><input class="tsl-input" type="password" data-pw2 autocomplete="new-password" /></label>
          <button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--block" disabled data-submit>Actualizar contraseña</button>
        </div></form></div>`,
      setup(root, ctx) {
        const pw = ctx.$("[data-pw]");
        const pw2 = ctx.$("[data-pw2]");
        const rules = { len: (v) => v.length >= 8, upper: (v) => /[A-Z]/.test(v), num: (v) => /\d/.test(v), sym: (v) => /[^A-Za-z0-9]/.test(v) };
        const check = () => {
          let all = true;
          ctx.$$("[data-rule]").forEach((li) => {
            const ok = rules[li.dataset.rule](pw.value);
            if (!ok) all = false;
            li.style.color = ok ? "var(--tsl-success)" : "var(--tsl-fg-muted)";
            li.textContent = `${ok ? "✓" : "○"} ${li.textContent.replace(/^[✓○] /, "")}`;
          });
          const match = pw.value && pw.value === pw2.value;
          pw2.setAttribute("aria-invalid", String(Boolean(pw2.value) && !match));
          ctx.$("[data-submit]").disabled = !(all && match);
        };
        ctx.on(pw, "input", check);
        ctx.on(pw2, "input", check);
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "Contraseña actualizada", description: "Inicia sesión con tu nueva contraseña." });
          e.target.reset();
          check();
        });
        check();
      }
    },

    "two-factor": {
      html: `${head("Autenticación · two-factor.tsx", "Doble factor", "Escanea el QR, confirma un código (cualquier número de 6 dígitos) y guarda los códigos de respaldo generados.")}
        <div class="xp-panel tsl-stack" style="max-width:520px;margin:0 auto;width:100%">
          <ol class="tsl-steps"><li aria-current="step" data-s="0">Escanear</li><li data-s="1">Verificar</li><li data-s="2">Respaldo</li></ol>
          <section data-p="0" class="tsl-row" style="--gap:18px;align-items:flex-start"><svg data-qr width="132" height="132" viewBox="0 0 21 21" style="background:#fff;border-radius:8px;padding:6px" shape-rendering="crispEdges"></svg><div class="tsl-stack" style="flex:1;min-width:180px"><span class="tsl-muted">Escanea con tu app de autenticación o ingresa la clave:</span><code class="xp-mono" data-key></code><button type="button" class="tsl-btn tsl-btn--primary" data-go="1">Ya lo escaneé</button></div></section>
          <section data-p="1" class="tsl-stack" hidden><span class="tsl-muted">Ingresa el código de 6 dígitos de tu app.</span><tsl-otp length="6" data-otp></tsl-otp></section>
          <section data-p="2" class="tsl-stack" hidden><div class="tsl-alert tsl-alert--success"><div><div class="tsl-alert__title">2FA activado</div><div class="tsl-alert__desc">Guarda estos códigos de respaldo de un solo uso en un lugar seguro.</div></div></div><pre class="tsl-code" data-codes></pre><div class="tsl-row"><button type="button" class="tsl-btn" data-copy>Copiar códigos</button><button type="button" class="tsl-btn" data-download>Descargar .txt</button></div></section>
        </div>`,
      setup(root, ctx) {
        const go = (i) => {
          ctx.$$("[data-p]").forEach((p) => (p.hidden = Number(p.dataset.p) !== i));
          ctx.$$("[data-s]").forEach((li) => {
            const n = Number(li.dataset.s);
            li.removeAttribute("aria-current");
            li.removeAttribute("data-state");
            if (n < i) li.dataset.state = "done";
            if (n === i) li.setAttribute("aria-current", "step");
          });
        };
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const key = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => alphabet[b % 32]).join("");
        ctx.$("[data-key]").textContent = key.match(/.{4}/g).join(" ");
        // Matriz decorativa estilo QR derivada de la clave (cuadros de posición + bits de datos)
        let seed = Array.from(key).reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
        const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
        let cells = "";
        const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
        for (let y = 0; y < 21; y++)
          for (let x = 0; x < 21; x++) {
            let on;
            if (finder(x, y)) {
              const lx = x % 14 === x ? x : x - 14;
              const ly = y % 14 === y ? y : y - 14;
              on = lx === 0 || ly === 0 || lx === 6 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
            } else on = rand() > 0.52;
            if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`;
          }
        ctx.$("[data-qr]").innerHTML = cells;
        const codes = Array.from({ length: 8 }, () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, "0")).join("").replace(/(.{4})/, "$1-"));
        ctx.$("[data-codes]").textContent = codes.join("\n");
        ctx.on(ctx.$('[data-go="1"]'), "click", () => go(1));
        ctx.on(ctx.$("[data-otp]"), "tsl-complete", () => go(2));
        ctx.on(ctx.$("[data-copy]"), "click", () => TeselaUI.copy(codes.join("\n")).then(() => ctx.toast({ title: "Códigos de respaldo copiados" })));
        ctx.on(ctx.$("[data-download]"), "click", () => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([codes.join("\n")], { type: "text/plain" }));
          a.download = "backup-codes.txt";
          a.click();
          ctx.timeout(1000, () => URL.revokeObjectURL(a.href));
        });
      }
    },

    "magic-link-sent": {
      html: `${head("Autenticación · magic-link-sent.tsx", "Enlace mágico enviado", "Cuenta regresiva de vencimiento, reenvío que reinicia el temporizador y alternativa con contraseña.")}
        <div class="xp-center"><div class="tsl-card xp-auth-card" style="text-align:center"><div class="tsl-card__body tsl-stack" style="align-items:center">
          <div class="tsl-empty__icon">✦</div><h3 class="xp-title">Enlace mágico enviado</h3>
          <p class="tsl-muted">Haz clic en el enlace que te enviamos por correo para iniciar sesión. Vence en</p>
          <div class="xp-num xp-mono" data-timer>10:00</div>
          <progress class="tsl-progress" max="600" value="600" data-bar></progress>
          <div class="tsl-row"><button type="button" class="tsl-btn" data-resend>Reenviar enlace</button><button type="button" class="tsl-btn tsl-btn--subtle" data-pw>Usar contraseña</button></div>
          <form class="tsl-stack" data-xp-form data-success="Sesión iniciada con contraseña" hidden style="width:100%;text-align:left" novalidate>${field(pwF)}<button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--block">Iniciar sesión</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        let left = 600;
        const render = () => {
          ctx.$("[data-timer]").textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
          ctx.$("[data-bar]").value = left;
          ctx.$("[data-timer]").style.color = left < 60 ? "var(--tsl-danger)" : "";
        };
        ctx.every(1000, () => {
          if (left > 0) left--;
          if (left === 0) ctx.$("[data-timer]").textContent = "Vencido";
          else render();
        });
        ctx.on(ctx.$("[data-resend]"), "click", () => {
          left = 600;
          render();
          ctx.toast({ title: "Nuevo enlace mágico enviado" });
        });
        ctx.on(ctx.$("[data-pw]"), "click", () => (ctx.$("[data-xp-form]").hidden = false));
        render();
      }
    }
  });
})();
