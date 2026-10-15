// ============================================================================
// Functional experiments — Layouts (12), Forms (4), Auth & Onboarding (14)
// ============================================================================

(function () {
  "use strict";
  const X = window.DEVL_XP;
  const { head, field, esc } = X;

  // ==========================================================================
  // LAYOUTS
  // ==========================================================================
  X.addMany("layouts", {
    "workspace-rail": {
      html: `
        ${head("Layouts · workspace-rail.tsx", "Workspace rail", "Switch organisation, navigate views and add projects. Everything updates the main pane.")}
        <div class="xp-split" style="--cols:250px minmax(0,1fr)">
          <aside class="xp-pane dv-stack" style="--gap:10px">
            <dv-menu id="org-menu">
              <button type="button" class="dv-btn dv-btn--block" style="justify-content:space-between" data-dv-trigger>
                <span class="dv-row" style="--gap:8px"><span class="dv-avatar dv-avatar--sm dv-avatar--square" data-org-avatar>A</span><span data-org-name>Acme inc.</span></span><span>▾</span>
              </button>
              <div class="dv-menu__list">
                <div class="dv-menu__label">Organisations</div>
                <button type="button" class="dv-menu__item" data-value="Acme inc.">Acme inc.</button>
                <button type="button" class="dv-menu__item" data-value="Globex">Globex</button>
                <button type="button" class="dv-menu__item" data-value="Initech">Initech</button>
              </div>
            </dv-menu>
            <nav class="dv-nav" data-nav>
              <button type="button" class="dv-nav__item" data-view="Home" aria-current="page">⌂ Home</button>
              <button type="button" class="dv-nav__item" data-view="Inbox">✉ Inbox <span class="dv-badge dv-badge--accent">4</span></button>
              <button type="button" class="dv-nav__item" data-view="Activity">⚡ Activity</button>
              <div class="dv-nav__label">Projects</div>
              <div class="dv-nav" data-projects>
                <button type="button" class="dv-nav__item" data-view="Onboarding redesign"><span class="dv-dot dv-dot--accent"></span> Onboarding redesign</button>
                <button type="button" class="dv-nav__item" data-view="Q3 planning"><span class="dv-dot dv-dot--success"></span> Q3 planning</button>
              </div>
            </nav>
            <form data-new-project class="dv-input-group">
              <input class="dv-input" placeholder="New project…" aria-label="New project name" maxlength="32" />
              <button type="submit" class="dv-btn dv-btn--subtle dv-btn--sm" style="margin:3px">Add</button>
            </form>
          </aside>
          <main class="xp-pane dv-stack">
            <span class="dv-eyebrow" data-org-label>Acme inc.</span>
            <h3 class="xp-title" style="margin:0" data-title>Home</h3>
            <p class="dv-muted" data-desc>Overview of everything happening in your workspace.</p>
            <div class="dv-grid" style="--min:160px">
              <div class="dv-stat"><span class="dv-eyebrow">Open tasks</span><span class="dv-stat__value" data-stat="tasks">12</span></div>
              <div class="dv-stat"><span class="dv-eyebrow">Members</span><span class="dv-stat__value" data-stat="members">24</span></div>
              <div class="dv-stat"><span class="dv-eyebrow">Projects</span><span class="dv-stat__value" data-stat="projects">2</span></div>
            </div>
          </main>
        </div>`,
      setup(root, ctx) {
        const nav = ctx.$("[data-nav]");
        const select = (btn) => {
          nav.querySelectorAll("[data-view]").forEach((b) => b.removeAttribute("aria-current"));
          btn.setAttribute("aria-current", "page");
          ctx.$("[data-title]").textContent = btn.dataset.view;
          ctx.$("[data-desc]").textContent = `You are viewing “${btn.dataset.view}”.`;
        };
        ctx.on(nav, "click", (e) => {
          const btn = e.target.closest("[data-view]");
          if (btn) select(btn);
        });
        ctx.on(ctx.$("#org-menu"), "dv-select", (e) => {
          const name = e.detail.value;
          ctx.$("[data-org-name]").textContent = name;
          ctx.$("[data-org-label]").textContent = name;
          ctx.$("[data-org-avatar]").textContent = name[0];
          ctx.$('[data-stat="members"]').textContent = String(8 + name.length * 3);
          ctx.toast({ title: `Switched to ${name}`, variant: "info" });
        });
        const form = ctx.$("[data-new-project]");
        ctx.on(form, "submit", (e) => {
          e.preventDefault();
          const input = form.querySelector("input");
          const name = input.value.trim();
          if (!name) return;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "dv-nav__item";
          btn.dataset.view = name;
          btn.innerHTML = '<span class="dv-dot dv-dot--warning"></span> ';
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
        ${head("Layouts · mini-rail.tsx", "Mini icon rail", "Compact rail with tooltips. Expand it to reveal labels; selection drives the content.")}
        <div class="xp-split" data-shell style="--cols:64px minmax(0,1fr)">
          <aside class="xp-pane dv-stack" style="--gap:6px;align-items:stretch;padding:10px">
            <button type="button" class="dv-btn dv-btn--subtle" data-expand aria-expanded="false" data-dv-tooltip="Expand" data-dv-placement="bottom">☰</button>
            <div class="dv-divider"></div>
            ${[["◎", "Discover"], ["✉", "Messages"], ["▦", "Projects"], ["☺", "People"], ["⚙", "Settings"]]
              .map(([i, l], n) => `<button type="button" class="dv-nav__item" data-item="${l}"${n === 0 ? ' aria-current="page"' : ""} data-dv-tooltip="${l}" data-dv-placement="bottom" style="justify-content:flex-start"><span style="width:20px;text-align:center">${i}</span><span data-label hidden>${l}</span></button>`)
              .join("")}
          </aside>
          <main class="xp-pane dv-stack">
            <span class="dv-eyebrow">Section</span>
            <h3 class="xp-title" style="margin:0" data-title>Discover</h3>
            <ul class="dv-list" data-list></ul>
          </main>
        </div>`,
      setup(root, ctx) {
        const content = {
          Discover: ["Trending templates", "Design systems", "Shader packs"],
          Messages: ["Ana: review the PR?", "Bot: deploy finished", "Leo: lunch at 1?"],
          Projects: ["Onboarding redesign", "Q3 planning", "Marketing site"],
          People: ["Ana López · Design", "Leo Kim · Eng", "Sara Ruiz · PM"],
          Settings: ["Profile", "Notifications", "Billing"]
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
          ctx.$$("[data-item]").forEach((b) => (open ? b.removeAttribute("data-dv-tooltip") : b.setAttribute("data-dv-tooltip", b.dataset.item)));
        });
        render("Discover");
      }
    },

    "docs-tree": {
      html: `
        ${head("Layouts · docs-tree.tsx", "Docs tree", "Collapsible documentation tree with live search and previous / next navigation.")}
        <div class="xp-split" style="--cols:260px minmax(0,1fr)">
          <aside class="xp-pane dv-stack" style="--gap:8px">
            <input class="dv-input" data-search placeholder="Search docs…" aria-label="Search docs" />
            <div data-tree class="dv-stack" style="--gap:4px">
              ${[
                ["Getting started", ["Introduction", "Installation", "Theming"]],
                ["Components", ["Button", "Dialog", "Command palette", "Table"]],
                ["Guides", ["Accessibility", "Dark mode", "Deploying"]]
              ]
                .map(
                  ([g, pages]) => `<details open><summary class="dv-eyebrow" style="cursor:pointer;padding:6px 4px">${g}</summary>
                  <nav class="dv-nav">${pages.map((p) => `<button type="button" class="dv-nav__item" data-page="${p}">${p}</button>`).join("")}</nav></details>`
                )
                .join("")}
            </div>
          </aside>
          <article class="xp-pane dv-stack">
            <nav aria-label="Breadcrumb"><ol class="dv-breadcrumb"><li>Docs</li><li data-crumb-group></li><li><span aria-current="page" data-crumb></span></li></ol></nav>
            <h3 class="xp-title" style="margin:0" data-title></h3>
            <p class="dv-muted" data-body style="max-width:560px;line-height:1.7"></p>
            <div class="dv-row" style="margin-top:auto">
              <button type="button" class="dv-btn" data-step="-1">← Previous</button>
              <span class="dv-spacer"></span>
              <button type="button" class="dv-btn" data-step="1">Next →</button>
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
          ctx.$("[data-body]").textContent = `${btn.dataset.page} — part of “${group}”. This page explains the concept, shows a live example and lists the API surface. Use the tree, search or the arrows below to move around.`;
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
        ${head("Layouts · inbox-rail.tsx", "Inbox rail", "Message list with reading pane. Opening marks as read; archive or mark unread from the pane.")}
        <div class="dv-row"><dv-segmented value="all" data-filter><button class="dv-segmented__item" value="all">All</button><button class="dv-segmented__item" value="unread">Unread</button></dv-segmented><span class="dv-badge dv-badge--accent" data-unread></span></div>
        <div class="xp-split" style="--cols:320px minmax(0,1fr)">
          <ul class="dv-list xp-pane--flush" data-list style="border:0;border-radius:0">
            ${[
              ["Ana López", "Design review at 3pm", "Can you bring the new token sheet?", 1],
              ["GitHub", "PR #482 approved", "Leo approved your pull request.", 1],
              ["Stripe", "Invoice paid", "Acme paid INV-2091 ($4,200).", 0],
              ["Sara Ruiz", "Q3 roadmap draft", "First pass is ready for comments.", 1],
              ["Vercel", "Deployment ready", "production · f8a92c1 · 41s", 0]
            ]
              .map(
                ([from, subj, prev, unread], i) => `<li class="xp-select-item${unread ? " xp-unread" : ""}" data-msg="${i}" data-from="${from}" data-subject="${subj}" data-preview="${prev}" tabindex="0">
                <span class="dv-avatar dv-avatar--sm">${from.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <div style="min-width:0"><div class="dv-list__title">${from}</div><div class="dv-list__desc">${subj}</div></div>
                <span class="dv-list__end">${unread ? '<span class="dv-dot dv-dot--accent"></span>' : ""}</span></li>`
              )
              .join("")}
          </ul>
          <article class="xp-pane dv-stack" data-pane>
            <div class="dv-empty" data-empty><div class="dv-empty__title">Select a message</div><p class="dv-empty__desc">Choose a conversation from the list.</p></div>
            <div data-reader hidden class="dv-stack">
              <span class="dv-eyebrow" data-r-from></span>
              <h3 class="xp-title" style="margin:0" data-r-subject></h3>
              <p class="dv-muted" data-r-body></p>
              <div class="dv-row"><button type="button" class="dv-btn" data-unread-btn>Mark unread</button><button type="button" class="dv-btn dv-btn--danger" data-archive>Archive</button></div>
            </div>
          </article>
        </div>`,
      setup(root, ctx) {
        let current = null;
        let filter = "all";
        const items = () => ctx.$$("[data-msg]");
        const sync = () => {
          const unread = items().filter((li) => li.classList.contains("xp-unread")).length;
          ctx.$("[data-unread]").textContent = `${unread} unread`;
          items().forEach((li) => {
            li.hidden = filter === "unread" && !li.classList.contains("xp-unread") && li !== current;
            li.querySelector(".dv-list__end").innerHTML = li.classList.contains("xp-unread") ? '<span class="dv-dot dv-dot--accent"></span>' : "";
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
          ctx.$("[data-r-body]").textContent = `${li.dataset.preview} — Sent today. Reply inline or archive when done.`;
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
          ctx.toast({ title: `Archived “${subject}”` });
          sync();
        });
        ctx.on(ctx.$("[data-filter]"), "dv-change", (e) => {
          filter = e.detail.value;
          sync();
        });
        sync();
      }
    },

    "app-shell": {
      html: `
        ${head("Layouts · app-shell.tsx", "App shell", "Header with breadcrumbs, collapsible sidebar, search and account menu.")}
        <div class="xp-panel" style="padding:0;overflow:hidden">
          <header class="dv-row" style="padding:10px 14px;border-bottom:1px solid var(--dv-border)">
            <button type="button" class="dv-btn dv-btn--icon dv-btn--subtle" data-collapse aria-label="Toggle sidebar" aria-expanded="true">☰</button>
            <ol class="dv-breadcrumb"><li>Acme</li><li><span aria-current="page" data-crumb>Dashboard</span></li></ol>
            <span class="dv-spacer"></span>
            <input class="dv-input" style="max-width:200px" placeholder="Search pages…" data-search aria-label="Search pages" />
            <dv-menu align="end" data-account>
              <button type="button" class="dv-avatar" style="border:0;cursor:pointer" data-dv-trigger aria-label="Account">LI</button>
              <div class="dv-menu__list"><div class="dv-menu__label">luis@acme.dev</div><button type="button" class="dv-menu__item" data-value="Profile">Profile</button><button type="button" class="dv-menu__item" data-value="Settings">Settings</button><div class="dv-menu__sep"></div><button type="button" class="dv-menu__item dv-menu__item--danger" data-value="Sign out">Sign out</button></div>
            </dv-menu>
          </header>
          <div class="xp-split" data-shell style="--cols:200px minmax(0,1fr);border:0;border-radius:0;--h:360px">
            <aside class="xp-pane" data-aside><nav class="dv-nav" data-nav>
              ${["Dashboard", "Projects", "Reports", "Team", "Billing"].map((p, i) => `<button type="button" class="dv-nav__item" data-page="${p}"${i ? "" : ' aria-current="page"'}>${p}</button>`).join("")}
            </nav></aside>
            <main class="xp-pane dv-stack"><h3 class="xp-title" style="margin:0" data-title>Dashboard</h3><p class="dv-muted" data-body>Welcome back. Pick a page from the sidebar or search.</p></main>
          </div>
        </div>`,
      setup(root, ctx) {
        const go = (page) => {
          ctx.$$("[data-page]").forEach((b) => (b.dataset.page === page ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
          ctx.$("[data-crumb]").textContent = page;
          ctx.$("[data-title]").textContent = page;
          ctx.$("[data-body]").textContent = `${page} content loads here. The breadcrumb and sidebar stay in sync.`;
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
          else ctx.toast({ title: `No page matches “${e.target.value}”`, variant: "warning" });
        });
        ctx.on(ctx.$("[data-account]"), "dv-select", (e) => ctx.toast({ title: e.detail.value, variant: "info" }));
      }
    },

    "two-pane": {
      html: `
        ${head("Layouts · two-pane.tsx", "Two-pane", "Master–detail: pick a contact, edit it on the right and save back to the list.")}
        <div class="xp-split" style="--cols:280px minmax(0,1fr)">
          <aside class="xp-pane dv-stack" style="--gap:8px">
            <input class="dv-input" placeholder="Filter contacts…" data-filter aria-label="Filter contacts" />
            <ul class="dv-list" data-list>
              ${[["Ana López", "ana@acme.dev", "Designer"], ["Leo Kim", "leo@acme.dev", "Engineer"], ["Sara Ruiz", "sara@acme.dev", "PM"], ["Tom Weber", "tom@acme.dev", "Engineer"]]
                .map(([n, e, r], i) => `<li class="xp-select-item" data-i="${i}" data-name="${n}" data-email="${e}" data-role="${r}"><span class="dv-avatar dv-avatar--sm">${n[0]}</span><div><div class="dv-list__title" data-n>${n}</div><div class="dv-list__desc" data-r>${r}</div></div></li>`)
                .join("")}
            </ul>
          </aside>
          <form class="xp-pane dv-stack" data-detail>
            <span class="dv-eyebrow">Contact</span>
            <label class="dv-field"><span class="dv-label">Name</span><input class="dv-input" name="name" required /></label>
            <label class="dv-field"><span class="dv-label">Email</span><input class="dv-input" name="email" type="email" required /></label>
            <label class="dv-field"><span class="dv-label">Role</span><select class="dv-select" name="role"><option>Designer</option><option>Engineer</option><option>PM</option></select></label>
            <div class="dv-row"><button type="submit" class="dv-btn dv-btn--primary">Save</button><button type="reset" class="dv-btn" data-revert>Revert</button><span class="dv-muted" data-dirty></span></div>
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
        ctx.on(form, "input", () => (ctx.$("[data-dirty]").textContent = "Unsaved changes"));
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
          current.querySelector(".dv-avatar").textContent = form.name.value[0] || "?";
          ctx.$("[data-dirty]").textContent = "";
          ctx.toast({ title: `Saved ${form.name.value}` });
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
        ${head("Layouts · three-pane.tsx", "Three-pane", "Folders → issues → detail. Changing status moves the issue and updates counts.")}
        <div class="xp-split" style="--cols:170px 260px minmax(0,1fr)">
          <nav class="xp-pane dv-nav" data-folders>
            ${["Todo", "In progress", "Done"].map((f, i) => `<button type="button" class="dv-nav__item" data-folder="${f}"${i ? "" : ' aria-current="page"'}>${f}<span class="dv-nav__meta" data-count="${f}"></span></button>`).join("")}
          </nav>
          <ul class="dv-list" data-issues style="border:0;border-radius:0"></ul>
          <section class="xp-pane dv-stack" data-detail>
            <div class="dv-empty"><div class="dv-empty__title">No issue selected</div></div>
          </section>
        </div>`,
      setup(root, ctx) {
        const issues = [
          { id: "DEV-101", title: "Command palette fuzzy ranking", status: "Todo", owner: "Leo" },
          { id: "DEV-102", title: "Dark mode contrast on badges", status: "Todo", owner: "Ana" },
          { id: "DEV-103", title: "Table pagination edge case", status: "In progress", owner: "Sara" },
          { id: "DEV-104", title: "Drawer focus return", status: "In progress", owner: "Leo" },
          { id: "DEV-105", title: "Ship devl-ui 1.0", status: "Done", owner: "Luis" }
        ];
        let folder = "Todo";
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
              li.innerHTML = `<div><div class="dv-list__desc xp-mono"></div><div class="dv-list__title"></div></div>`;
              li.querySelector(".xp-mono").textContent = i.id;
              li.querySelector(".dv-list__title").textContent = i.title;
              li.addEventListener("click", () => {
                selected = i;
                renderList();
                renderDetail();
              });
              list.appendChild(li);
            });
          if (!list.children.length) list.innerHTML = '<li class="dv-muted">Nothing here 🎉</li>';
          counts();
        };
        const renderDetail = () => {
          const d = ctx.$("[data-detail]");
          if (!selected) {
            d.innerHTML = '<div class="dv-empty"><div class="dv-empty__title">No issue selected</div></div>';
            return;
          }
          d.innerHTML = `<span class="dv-eyebrow"></span><h3 class="xp-title" style="margin:0"></h3>
            <dl class="xp-kv"><dt>Owner</dt><dd data-owner></dd><dt>Status</dt><dd><select class="dv-select" style="max-width:180px" data-status><option>Todo</option><option>In progress</option><option>Done</option></select></dd></dl>`;
          d.querySelector(".dv-eyebrow").textContent = selected.id;
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
        ${head("Layouts · split-resizable.tsx", "Split resizable", "Drag the handle, use the arrow keys on it, or pick a preset. Switch orientation any time.")}
        <div class="dv-row">
          <dv-segmented value="row" data-orient><button class="dv-segmented__item" value="row">Horizontal</button><button class="dv-segmented__item" value="column">Vertical</button></dv-segmented>
          <div class="dv-btn-group">${[30, 50, 70].map((p) => `<button type="button" class="dv-btn dv-btn--sm" data-preset="${p}">${p}%</button>`).join("")}</div>
          <span class="dv-badge dv-badge--outline xp-mono" data-readout>50% / 50%</span>
        </div>
        <div data-split style="display:flex;height:360px;border:1px solid var(--dv-border);border-radius:var(--dv-radius);overflow:hidden">
          <section data-a class="xp-pane" style="flex:0 0 50%;background:var(--dv-surface)"><span class="dv-eyebrow">Pane A</span><p class="dv-muted">Editor</p></section>
          <div data-handle role="separator" tabindex="0" aria-valuemin="10" aria-valuemax="90" aria-valuenow="50" aria-label="Resize panes" style="flex:0 0 6px;background:var(--dv-border-strong);cursor:col-resize"></div>
          <section class="xp-pane" style="flex:1"><span class="dv-eyebrow">Pane B</span><p class="dv-muted">Preview</p></section>
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
        ctx.on(ctx.$("[data-orient]"), "dv-change", (e) => {
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
        ${head("Layouts · focus-mode.tsx", "Focus mode", "Distraction-free writing with live word count, goal progress and autosave.")}
        <div class="dv-row" data-chrome>
          <span class="dv-badge dv-badge--outline" data-saved>Not saved yet</span>
          <span class="dv-spacer"></span>
          <label class="dv-choice">Goal <select class="dv-select" style="width:auto;height:28px" data-goal><option value="100">100 words</option><option value="250" selected>250 words</option><option value="500">500 words</option></select></label>
          <button type="button" class="dv-btn dv-btn--primary" data-focus aria-pressed="false">Enter focus</button>
        </div>
        <textarea class="dv-textarea xp-editor" data-editor style="min-height:300px" placeholder="Start writing… press Esc inside the editor to leave focus mode.">The best interfaces disappear. They let you think about the work, not the tool.</textarea>
        <div class="dv-stack" style="--gap:6px">
          <progress class="dv-progress" max="250" value="0" data-progress></progress>
          <div class="dv-row xp-mono dv-muted" style="font-size:11px"><span data-words></span><span>·</span><span data-chars></span><span>·</span><span data-read></span></div>
        </div>`,
      setup(root, ctx) {
        const editor = ctx.$("[data-editor]");
        const btn = ctx.$("[data-focus]");
        let saveTimer = 0;
        const stats = () => {
          const words = (editor.value.trim().match(/\S+/g) || []).length;
          const goal = Number(ctx.$("[data-goal]").value);
          ctx.$("[data-words]").textContent = `${words} words`;
          ctx.$("[data-chars]").textContent = `${editor.value.length} chars`;
          ctx.$("[data-read]").textContent = `${Math.max(1, Math.round(words / 230))} min read`;
          const bar = ctx.$("[data-progress]");
          bar.max = goal;
          bar.value = Math.min(goal, words);
          if (words >= goal && !editor.dataset.done) {
            editor.dataset.done = "1";
            ctx.toast({ title: "Goal reached 🎉", description: `${goal} words` });
          }
        };
        const setFocus = (on) => {
          btn.setAttribute("aria-pressed", String(on));
          btn.textContent = on ? "Exit focus" : "Enter focus";
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
          ctx.$("[data-saved]").textContent = "Saving…";
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            ctx.$("[data-saved]").textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
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
        ${head("Layouts · floating-toolbar.tsx", "Floating toolbar", "Select any text in the article: a formatting toolbar appears right above the selection.")}
        <div class="xp-rel">
          <div class="dv-row xp-panel" data-toolbar hidden style="position:absolute;z-index:5;padding:4px;--gap:2px;box-shadow:var(--dv-shadow-lg);background:var(--dv-bg-elevated)">
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="bold" style="font-weight:700">B</button>
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="italic" style="font-style:italic">I</button>
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="underline" style="text-decoration:underline">U</button>
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="strikeThrough" style="text-decoration:line-through">S</button>
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="hiliteColor">Highlight</button>
            <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cmd="removeFormat">Clear</button>
          </div>
          <div class="xp-editor" contenteditable="true" data-editor spellcheck="false">
            <p>Interfaces should feel <b>calm</b>. Select a phrase in this paragraph and the toolbar floats above it, exactly where your attention already is.</p>
            <p>Try making something italic, underline a key idea, or highlight the sentence you want to remember later.</p>
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
        ${head("Layouts · canvas-tools.tsx", "Canvas tools", "Infinite-canvas basics: drag nodes, add notes, zoom, and delete the selection with ⌫.")}
        <div class="dv-row">
          <div class="dv-btn-group"><button type="button" class="dv-btn dv-btn--sm" data-add>+ Note</button><button type="button" class="dv-btn dv-btn--sm" data-zoom="-0.1">−</button><button type="button" class="dv-btn dv-btn--sm" data-zoom="0">Reset</button><button type="button" class="dv-btn dv-btn--sm" data-zoom="0.1">+</button></div>
          <span class="dv-badge dv-badge--outline xp-mono" data-zoom-label>100%</span>
          <span class="dv-spacer"></span><span class="dv-muted" data-sel>Nothing selected</span>
          <button type="button" class="dv-btn dv-btn--sm dv-btn--danger" data-del disabled>Delete</button>
        </div>
        <div class="xp-board" data-board tabindex="0" aria-label="Canvas">
          <div data-layer style="position:absolute;inset:0;transform-origin:0 0">
            <div class="xp-node" style="left:60px;top:60px">💡 Idea</div>
            <div class="xp-node" style="left:260px;top:140px">🧪 Prototype</div>
            <div class="xp-node" style="left:480px;top:70px">🚀 Ship</div>
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
          ctx.$("[data-sel]").textContent = node ? `Selected: ${node.textContent}` : "Nothing selected";
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
          node.textContent = `📝 Note ${++n}`;
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
        ${head("Layouts · bottom-nav.tsx", "Bottom nav", "Mobile tab bar: switch screens, search filters live, inbox badge clears on visit.")}
        <div class="xp-center" style="min-height:0">
          <div class="xp-phone">
            <div style="flex:1;overflow:auto;padding:22px 18px" data-screen></div>
            <nav class="dv-row" style="--gap:0;border-top:1px solid var(--dv-border);flex-wrap:nowrap" data-tabs>
              ${[["home", "⌂", "Home"], ["search", "⌕", "Search"], ["inbox", "✉", "Inbox"], ["me", "☺", "Profile"]]
                .map(([k, i, l], n) => `<button type="button" class="dv-btn dv-btn--subtle" data-tab="${k}" style="flex:1;flex-direction:column;height:62px;border-radius:0;gap:2px"${n ? "" : ' aria-current="page"'}><span style="font-size:17px">${i}</span><span style="font-size:10px">${l}</span>${k === "inbox" ? '<span class="dv-badge dv-badge--danger" data-badge style="position:absolute;top:6px;right:20px;padding:0 5px">3</span>' : ""}</button>`)
                .join("")}
            </nav>
          </div>
        </div>`,
      setup(root, ctx) {
        const screen = ctx.$("[data-screen]");
        const people = ["Ana López", "Leo Kim", "Sara Ruiz", "Tom Weber", "Mia Chen", "Noah Patel"];
        const views = {
          home: () => `<span class="dv-eyebrow">Today</span><h3 class="xp-title">Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}</h3><div class="dv-stack" style="margin-top:14px"><div class="dv-stat"><span class="dv-eyebrow">Steps</span><span class="dv-stat__value">8,214</span><progress class="dv-progress" max="10000" value="8214"></progress></div><div class="dv-stat"><span class="dv-eyebrow">Focus</span><span class="dv-stat__value">2h 40m</span></div></div>`,
          search: () => `<input class="dv-input" placeholder="Search people…" data-q aria-label="Search people" /><ul class="dv-list" style="margin-top:12px" data-results>${people.map((p) => `<li>${p}</li>`).join("")}</ul>`,
          inbox: () => `<span class="dv-eyebrow">Inbox</span><ul class="dv-list" style="margin-top:10px"><li>Ana: lunch?</li><li>Leo: PR approved</li><li>Sara: roadmap v2</li></ul>`,
          me: () => `<div class="dv-stack" style="align-items:center;text-align:center"><span class="dv-avatar dv-avatar--lg" data-status="online">LI</span><strong>Luis Islas</strong><span class="dv-muted">Product designer</span><label class="dv-choice" style="margin-top:12px">Notifications <input type="checkbox" role="switch" class="dv-switch" checked /></label></div>`
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
        ${head("Forms · workspace-settings.tsx", "Workspace settings", "The URL slug follows the name until you edit it. Validation runs on save; the danger zone needs confirmation.")}
        <form class="xp-panel dv-stack" data-xp-form data-success="Workspace “{name}” saved" style="max-width:620px">
          <div class="dv-row" style="--gap:14px"><span class="dv-avatar dv-avatar--lg dv-avatar--square" data-logo>A</span><div><strong data-preview-name>Acme inc.</strong><div class="dv-muted xp-mono" data-preview-url>devl.dev/acme-inc</div></div></div>
          ${field({ name: "name", label: "Workspace name", value: "Acme inc.", minlength: 2 })}
          <div class="dv-field"><label class="dv-label" for="ws-slug">URL</label><div class="dv-input-group"><span class="dv-input-group__addon">devl.dev/</span><input class="dv-input" id="ws-slug" name="slug" value="acme-inc" required pattern="[a-z0-9\\-]{2,32}" data-pattern-msg="Lowercase letters, numbers and dashes only." /></div></div>
          <div class="dv-field"><label class="dv-label" for="ws-tz">Timezone</label><select class="dv-select" id="ws-tz" name="tz"><option>America/Mexico_City</option><option>Europe/Madrid</option><option>UTC</option></select></div>
          <div class="dv-row"><button type="submit" class="dv-btn dv-btn--primary">Save changes</button></div>
        </form>
        <div class="dv-alert dv-alert--danger" style="max-width:620px"><div style="flex:1"><div class="dv-alert__title">Danger zone</div><div class="dv-alert__desc">Deleting the workspace removes all projects and members.</div></div><button type="button" class="dv-btn dv-btn--danger dv-btn--sm" data-dv-open="ws-delete">Delete…</button></div>
        <dialog class="dv-dialog" id="ws-delete" aria-labelledby="ws-delete-t">
          <div class="dv-dialog__header"><h3 class="dv-dialog__title" id="ws-delete-t">Delete workspace</h3><p class="dv-dialog__desc">Type the slug <code data-slug-echo>acme-inc</code> to confirm.</p></div>
          <div class="dv-dialog__body"><input class="dv-input" data-confirm aria-label="Confirm slug" /></div>
          <div class="dv-dialog__footer"><button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="button" class="dv-btn dv-btn--danger" data-delete disabled data-dv-close="delete">Delete forever</button></div>
        </dialog>`,
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        const name = ctx.$('[name="name"]');
        const slug = ctx.$('[name="slug"]');
        let manual = false;
        const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
        const preview = () => {
          ctx.$("[data-preview-name]").textContent = name.value || "Untitled";
          ctx.$("[data-logo]").textContent = (name.value || "?")[0].toUpperCase();
          ctx.$("[data-preview-url]").textContent = `devl.dev/${slug.value}`;
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
          if (e.target.returnValue === "delete") ctx.toast({ title: "Workspace scheduled for deletion", variant: "danger" });
          confirm.value = "";
          ctx.$("[data-delete]").disabled = true;
        });
      }
    },

    "invite-teammates": {
      html: `
        ${head("Forms · invite-teammates.tsx", "Invite teammates", "Add rows, pick roles and send. Seats update live and pending invites can be revoked.")}
        <div class="xp-panel dv-stack" style="max-width:640px">
          <div class="dv-row"><strong>Invite by email</strong><span class="dv-spacer"></span><span class="dv-badge dv-badge--outline" data-seats></span></div>
          <div class="dv-stack" data-rows style="--gap:8px"></div>
          <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-add>+ Add another</button><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary" data-send>Send invites</button></div>
        </div>
        <div class="dv-stack" style="max-width:640px"><span class="dv-eyebrow">Pending invites</span><ul class="dv-list" data-pending><li class="dv-muted" data-none>No pending invites.</li></ul></div>`,
      setup(root, ctx) {
        const TOTAL = 10;
        let used = 4;
        const rows = ctx.$("[data-rows]");
        const addRow = (email = "") => {
          const row = document.createElement("div");
          row.className = "dv-row";
          row.style.flexWrap = "nowrap";
          row.innerHTML = `<input class="dv-input" type="email" placeholder="name@company.com" aria-label="Email" style="flex:1" /><select class="dv-select" style="width:130px" aria-label="Role"><option>Member</option><option>Admin</option><option>Viewer</option></select><button type="button" class="dv-btn dv-btn--icon dv-btn--subtle" aria-label="Remove row">✕</button>`;
          row.querySelector("input").value = email;
          row.querySelector("button").addEventListener("click", () => {
            if (rows.children.length > 1) row.remove();
          });
          rows.appendChild(row);
        };
        const seats = () => (ctx.$("[data-seats]").textContent = `${used} of ${TOTAL} seats used`);
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
          if (bad) return ctx.toast({ title: `${bad} invalid email${bad > 1 ? "s" : ""}`, variant: "danger" });
          if (!valid.length) return ctx.toast({ title: "Add at least one email", variant: "warning" });
          if (used + valid.length > TOTAL) return ctx.toast({ title: "Not enough seats", description: "Upgrade your plan to invite more.", variant: "warning" });
          const list = ctx.$("[data-pending]");
          const none = ctx.$("[data-none]");
          if (none) none.remove();
          valid.forEach(([email, role]) => {
            used++;
            const li = document.createElement("li");
            li.innerHTML = `<span class="dv-avatar dv-avatar--sm"></span><div><div class="dv-list__title"></div><div class="dv-list__desc"></div></div><div class="dv-list__end"><span class="dv-badge dv-badge--warning">Pending</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle">Revoke</button></div>`;
            li.querySelector(".dv-avatar").textContent = email[0].toUpperCase();
            li.querySelector(".dv-list__title").textContent = email;
            li.querySelector(".dv-list__desc").textContent = role;
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
          ctx.toast({ title: `Sent ${valid.length} invite${valid.length > 1 ? "s" : ""}` });
        });
        addRow("ana@acme.dev");
        addRow();
        seats();
      }
    },

    notifications: {
      html: `
        ${head("Forms · notifications.tsx", "Notification preferences", "Event × channel matrix with column toggles, digest frequency and quiet hours.")}
        <form class="dv-stack" data-form style="max-width:720px">
          <div class="dv-table-wrap"><table class="dv-table">
            <thead><tr><th>Event</th>${["Email", "Push", "Slack"].map((c) => `<th style="text-align:center"><label class="dv-choice" style="justify-content:center">${c} <input type="checkbox" class="dv-check" data-col="${c}" aria-label="Toggle all ${c}" /></label></th>`).join("")}</tr></thead>
            <tbody>${["Mentions", "Comments", "Assigned to me", "Deploy failed", "Weekly report"]
              .map((ev, r) => `<tr><td>${ev}</td>${["Email", "Push", "Slack"].map((c, ci) => `<td style="text-align:center"><input type="checkbox" class="dv-check" data-ch="${c}" aria-label="${ev} via ${c}"${(r + ci) % 2 === 0 ? " checked" : ""} /></td>`).join("")}</tr>`)
              .join("")}</tbody>
          </table></div>
          <div class="xp-panel dv-row" style="--gap:16px">
            <span class="dv-label">Digest</span>
            <dv-segmented value="daily" data-digest><button class="dv-segmented__item" value="off">Off</button><button class="dv-segmented__item" value="daily">Daily</button><button class="dv-segmented__item" value="weekly">Weekly</button></dv-segmented>
            <span class="dv-spacer"></span>
            <label class="dv-choice">Quiet hours <input type="checkbox" role="switch" class="dv-switch" data-quiet /></label>
            <input class="dv-input" type="time" value="22:00" style="width:110px" data-q1 disabled aria-label="From" /> → <input class="dv-input" type="time" value="08:00" style="width:110px" data-q2 disabled aria-label="To" />
          </div>
          <div class="dv-row"><button type="submit" class="dv-btn dv-btn--primary">Save preferences</button><span class="dv-muted" data-summary></span></div>
        </form>`,
      setup(root, ctx) {
        const summary = () => {
          const on = ctx.$$("[data-ch]:checked").length;
          ctx.$("[data-summary]").textContent = `${on} of ${ctx.$$("[data-ch]").length} notifications on`;
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
          const quiet = ctx.$("[data-quiet]").checked ? ` · quiet ${ctx.$("[data-q1]").value}–${ctx.$("[data-q2]").value}` : "";
          ctx.toast({ title: "Preferences saved", description: `${ctx.$$("[data-ch]:checked").length} channels on · digest ${ctx.$("[data-digest]").value}${quiet}` });
        });
        summary();
      }
    },

    "api-key": {
      html: `
        ${head("Forms · api-key.tsx", "Create API key", "Pick scopes and expiry; the secret is shown once with a copy button, then masked in the list.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <form class="xp-panel dv-stack" data-form>
            <label class="dv-field"><span class="dv-label">Key name</span><input class="dv-input" name="name" required placeholder="CI deploy key" /></label>
            <fieldset class="dv-stack" style="border:0;padding:0;margin:0;--gap:8px"><legend class="dv-label" style="margin-bottom:8px">Scopes</legend>
              <label class="dv-choice"><input type="checkbox" class="dv-check" value="read" checked /> read — list and fetch resources</label>
              <label class="dv-choice"><input type="checkbox" class="dv-check" value="write" /> write — create and update</label>
              <label class="dv-choice"><input type="checkbox" class="dv-check" value="admin" /> admin — includes read + write</label>
            </fieldset>
            <label class="dv-field"><span class="dv-label">Expires</span><select class="dv-select" name="exp"><option value="30">30 days</option><option value="90" selected>90 days</option><option value="0">Never</option></select></label>
            <button type="submit" class="dv-btn dv-btn--primary">Create key</button>
          </form>
          <div class="dv-stack">
            <div class="dv-alert dv-alert--warning" data-secret-box hidden><div style="flex:1;min-width:0"><div class="dv-alert__title">Copy your secret now</div><div class="dv-alert__desc">It won’t be shown again.</div>
              <div class="dv-input-group" style="margin-top:8px"><input class="dv-input xp-mono" readonly data-secret aria-label="Secret" id="api-secret" /><button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" style="margin:3px" data-dv-copy data-dv-copy-target="#api-secret">Copy</button></div></div></div>
            <ul class="dv-list" data-keys><li><div><div class="dv-list__title">Production</div><div class="dv-list__desc xp-mono">devl_live_••••a2f1 · read, write</div></div><div class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-revoke>Revoke</button></div></li></ul>
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
          ctx.toast({ title: `Revoked ${li.querySelector(".dv-list__title").textContent}`, variant: "danger" });
          li.remove();
        });
        ctx.on(form, "submit", (e) => {
          e.preventDefault();
          if (!form.reportValidity()) return;
          const scopes = boxes.filter((b) => b.checked).map((b) => b.value);
          if (!scopes.length) return ctx.toast({ title: "Select at least one scope", variant: "warning" });
          const bytes = crypto.getRandomValues(new Uint8Array(16));
          const secret = `devl_live_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
          ctx.$("[data-secret]").value = secret;
          ctx.$("[data-secret-box]").hidden = false;
          const li = document.createElement("li");
          li.innerHTML = `<div><div class="dv-list__title"></div><div class="dv-list__desc xp-mono"></div></div><div class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-revoke>Revoke</button></div>`;
          li.querySelector(".dv-list__title").textContent = form.name.value;
          const exp = form.exp.value === "0" ? "never expires" : `expires in ${form.exp.value}d`;
          li.querySelector(".dv-list__desc").textContent = `devl_live_••••${secret.slice(-4)} · ${scopes.join(", ")} · ${exp}`;
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
  const social = `<div class="dv-grid" style="--min:120px;--gap:8px"><button type="button" class="dv-btn" data-social="GitHub">GitHub</button><button type="button" class="dv-btn" data-social="Google">Google</button></div><div class="dv-divider">or</div>`;
  const forgot = `<a href="#" class="dv-hint" data-forgot>Forgot?</a>`;

  function authForm({ title, sub, fields, submit, success, withSocial = true, extra = "", foot = "", brand = "Acme" }) {
    return `
      <form class="dv-stack" data-xp-form data-success="${esc(success)}" style="width:100%;max-width:360px;--gap:14px" novalidate>
        <div><span class="dv-eyebrow">${brand}</span><h3 class="xp-title" style="font-size:22px">${title}</h3>${sub ? `<p class="dv-muted" style="margin-top:4px">${sub}</p>` : ""}</div>
        ${withSocial ? social : ""}
        ${fields.map(field).join("")}
        ${extra}
        <button type="submit" class="dv-btn dv-btn--primary dv-btn--block">${submit}</button>
        ${foot ? `<p class="dv-hint" style="text-align:center">${foot}</p>` : ""}
      </form>`;
  }

  function authSetup(root, ctx) {
    DEVL_XP.formSetup(root, ctx);
    root.querySelectorAll("[data-social]").forEach((b) =>
      ctx.on(b, "click", () => {
        b.setAttribute("aria-busy", "true");
        ctx.timeout(700, () => {
          b.removeAttribute("aria-busy");
          ctx.toast({ title: `Continued with ${b.dataset.social}` });
        });
      })
    );
    root.querySelectorAll("[data-forgot]").forEach((a) =>
      ctx.on(a, "click", (e) => {
        e.preventDefault();
        const email = root.querySelector('[name="email"]');
        ctx.toast({ title: "Reset link sent", description: email && email.value ? email.value : "Check your inbox", variant: "info" });
      })
    );
  }

  const emailF = { name: "email", label: "Email", type: "email", placeholder: "you@company.com", autocomplete: "email" };
  const pwF = { name: "password", label: "Password", type: "password", minlength: 8, autocomplete: "current-password" };
  const art = (quote) => `<div class="xp-auth-art"><span class="dv-eyebrow" style="color:var(--dv-fg)">✦ Acme</span><blockquote>“${quote}”<br /><span class="dv-muted">— Ana López, Design lead</span></blockquote></div>`;
  const remember = `<label class="dv-choice"><input type="checkbox" class="dv-check" name="remember" /> Remember me for 30 days</label>`;

  X.addMany("auth", {
    login: {
      html: () => `${head("Auth · login.tsx", "Login", "Validates email and password (8+ chars), reveal password, social sign-in and reset link.")}
        <div class="xp-center"><div class="dv-card xp-auth-card"><div class="dv-card__body">${authForm({ title: "Welcome back", sub: "Sign in to continue.", fields: [emailF, { ...pwF, aside: forgot }], submit: "Sign in", success: "Signed in as {email}", extra: remember, foot: "No account? Sign up" })}</div></div></div>`,
      setup: authSetup
    },
    "inset-login": {
      html: () => `${head("Auth · inset-login.tsx", "Inset login", "Framed card inside a testimonial surface.")}
        <div class="xp-panel" style="padding:40px 16px"><div class="xp-center" style="min-height:0"><div class="dv-card xp-auth-card" style="box-shadow:var(--dv-shadow-lg)"><div class="dv-card__body">${authForm({ title: "Sign in", fields: [emailF, pwF], submit: "Continue", success: "Welcome back, {email}", withSocial: false, extra: remember })}</div><div class="dv-card__footer" style="justify-content:center"><span class="dv-hint">Protected by 2FA · SOC 2</span></div></div></div></div>`,
      setup: authSetup
    },
    "centered-signin": {
      html: () => `${head("Auth · centered-signin.tsx", "Centered signin", "Two-step: email first, then password or SSO for verified company domains.")}
        <div class="xp-center">
          <form class="dv-stack" data-step-email style="width:100%;max-width:340px" novalidate>
            <span class="dv-eyebrow" style="text-align:center">Acme</span><h3 class="xp-title" style="text-align:center">Sign in</h3>
            ${field(emailF)}
            <button type="submit" class="dv-btn dv-btn--primary dv-btn--block">Continue</button>
            <p class="dv-hint" style="text-align:center">Tip: use an @acme.dev address to see SSO.</p>
          </form>
          <form class="dv-stack" data-xp-form data-success="Signed in" data-step-pw hidden style="width:100%;max-width:340px" novalidate>
            <button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" data-change style="align-self:flex-start">← <span data-email-echo></span></button>
            <div data-sso hidden class="dv-alert dv-alert--info"><div><div class="dv-alert__title">SSO available</div><div class="dv-alert__desc">acme.dev uses Okta.</div><button type="button" class="dv-btn dv-btn--sm" style="margin-top:8px" data-social="Okta SSO">Continue with SSO</button></div></div>
            ${field({ ...pwF, aside: forgot })}
            <button type="submit" class="dv-btn dv-btn--primary dv-btn--block">Sign in</button>
          </form>
        </div>`,
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
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
        ctx.$$("[data-social]").forEach((b) => ctx.on(b, "click", () => ctx.toast({ title: "Redirecting to Okta…", variant: "info" })));
        ctx.$$("[data-forgot]").forEach((a) => ctx.on(a, "click", (e) => (e.preventDefault(), ctx.toast({ title: "Reset link sent", variant: "info" }))));
      }
    },
    "centered-signup": {
      html: () => `${head("Auth · centered-signup.tsx", "Centered signup", "Strength meter, password confirmation and required terms checkbox.")}
        <div class="xp-center">${authForm({
          title: "Create your account",
          sub: "Free for 14 days. No card required.",
          fields: [{ name: "fullname", label: "Full name", placeholder: "Ana López" }, emailF, { ...pwF, autocomplete: "new-password", strength: true }, { name: "confirm", label: "Confirm password", type: "password", match: "password" }],
          extra: `<label class="dv-choice"><input type="checkbox" class="dv-check" name="terms" required data-required-msg="Please accept the terms." /> I agree to the Terms and Privacy Policy</label>`,
          submit: "Create account",
          success: "Welcome, {fullname}!"
        })}</div>`,
      setup: authSetup
    },
    "left-signin": {
      html: () => `${head("Auth · left-signin.tsx", "Left signin", "Split screen with brand artwork on the left.")}
        <div class="xp-center"><div class="xp-auth-split">${art("devl-ui cut our design-to-ship time in half.")}<div class="xp-auth-form">${authForm({ title: "Sign in", fields: [emailF, { ...pwF, aside: forgot }], submit: "Sign in", success: "Signed in as {email}" })}</div></div></div>`,
      setup: authSetup
    },
    "right-signin": {
      html: () => `${head("Auth · right-signin.tsx", "Right signin", "Reversed split: form first, product preview on the right.")}
        <div class="xp-center"><div class="xp-auth-split"><div class="xp-auth-form">${authForm({ title: "Welcome back", fields: [emailF, pwF], submit: "Sign in", success: "Signed in as {email}", extra: remember })}</div>${art("The calmest dashboard our team has ever used.")}</div></div>`,
      setup: authSetup
    },
    "glass-signup": {
      html: () => `${head("Auth · glass-signup.tsx", "Glass signup", "Frosted card over a shader-like gradient.")}
        <div class="xp-glass-bg"><div class="xp-center" style="min-height:0"><div class="dv-card xp-auth-card xp-glass"><div class="dv-card__body">${authForm({ title: "Join the beta", fields: [{ name: "fullname", label: "Name" }, emailF, { ...pwF, strength: true, autocomplete: "new-password" }], submit: "Request access", success: "You're in, {fullname}!", withSocial: false })}</div></div></div></div>`,
      setup: authSetup
    },

    onboarding: {
      html: `${head("Auth · onboarding.tsx", "Onboarding", "Three-step wizard with validation per step, back navigation and a final summary.")}
        <div class="xp-panel dv-stack" style="max-width:560px;margin:0 auto;width:100%;--gap:18px">
          <ol class="dv-steps" data-steps><li aria-current="step">Profile</li><li>Workspace</li><li>Invite</li><li>Done</li></ol>
          <section data-step="0" class="dv-stack"><label class="dv-field"><span class="dv-label">Your name</span><input class="dv-input" data-req name="name" placeholder="Ana López" /></label><label class="dv-field"><span class="dv-label">Role</span><select class="dv-select" name="role"><option>Designer</option><option>Engineer</option><option>Founder</option></select></label></section>
          <section data-step="1" class="dv-stack" hidden><label class="dv-field"><span class="dv-label">Workspace name</span><input class="dv-input" data-req name="ws" placeholder="Acme" /></label><span class="dv-label">Team size</span><dv-segmented value="2-10" data-size><button class="dv-segmented__item" value="1">Just me</button><button class="dv-segmented__item" value="2-10">2–10</button><button class="dv-segmented__item" value="11+">11+</button></dv-segmented></section>
          <section data-step="2" class="dv-stack" hidden><span class="dv-label">Invite teammates (optional)</span><dv-tags name="invites" placeholder="email + Enter"></dv-tags></section>
          <section data-step="3" class="dv-stack" hidden><div class="dv-empty"><div class="dv-empty__title">All set 🎉</div><p class="dv-empty__desc" data-summary></p></div></section>
          <div class="dv-row"><button type="button" class="dv-btn" data-back disabled>Back</button><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary" data-next>Continue</button></div>
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
          ctx.$("[data-next]").textContent = step === 2 ? "Finish" : step === 3 ? "Start over" : "Continue";
          if (step === 3) {
            const tags = ctx.$("dv-tags").value;
            ctx.$("[data-summary]").textContent = `${ctx.$('[name="name"]').value} (${ctx.$('[name="role"]').value}) created “${ctx.$('[name="ws"]').value}” for ${ctx.$("[data-size]").value} people and invited ${tags.length} teammate${tags.length === 1 ? "" : "s"}.`;
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
          if (!ok) return ctx.toast({ title: "Please complete this step", variant: "warning" });
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
      html: `${head("Auth · waitlist.tsx", "Waitlist landing", "Join with an email, get a live queue position and a referral link that moves you up.")}
        <div class="xp-center"><div class="dv-stack" style="max-width:460px;text-align:center;align-items:center">
          <span class="dv-badge dv-badge--accent dv-badge--upper">Early access</span>
          <h3 class="xp-title" style="font-size:32px">The calm way to ship UI.</h3>
          <p class="dv-muted"><strong class="xp-mono" data-count>2,481</strong> people are already waiting.</p>
          <form class="dv-input-group" data-join style="width:100%"><input class="dv-input" type="email" required placeholder="you@company.com" aria-label="Email" /><button type="submit" class="dv-btn dv-btn--primary dv-btn--sm" style="margin:3px">Join waitlist</button></form>
          <div class="dv-stack xp-panel" data-joined hidden style="width:100%;text-align:left">
            <span class="dv-eyebrow">You're in</span><div class="xp-num">#<span data-pos></span></div>
            <span class="dv-muted">Share your link — every signup moves you up 50 spots.</span>
            <div class="dv-input-group"><input class="dv-input xp-mono" readonly id="wl-ref" aria-label="Referral link" /><button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" style="margin:3px" data-dv-copy data-dv-copy-target="#wl-ref">Copy</button></div>
            <button type="button" class="dv-btn dv-btn--sm" data-sim>Simulate a referral</button>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let count = 2481;
        let pos = 0;
        const fmt = (n) => n.toLocaleString("en-US");
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
          ctx.toast({ title: "A friend joined!", description: `You moved up to #${fmt(pos)}` });
        });
      }
    },

    "check-email": {
      html: `${head("Auth · check-email.tsx", "Check your email", "Resend with a cooldown timer, or fix a typo in the address.")}
        <div class="xp-center"><div class="dv-card xp-auth-card" style="text-align:center"><div class="dv-card__body dv-stack" style="align-items:center">
          <div class="dv-empty__icon">✉</div><h3 class="xp-title">Check your inbox</h3>
          <p class="dv-muted">We sent a verification link to <strong data-email>ana@acme.dev</strong>.</p>
          <button type="button" class="dv-btn dv-btn--primary dv-btn--block" data-resend>Resend email</button>
          <button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" data-edit>Wrong address?</button>
          <form class="dv-input-group" data-change hidden style="width:100%"><input class="dv-input" type="email" required aria-label="New email" /><button type="submit" class="dv-btn dv-btn--sm" style="margin:3px">Update</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        const btn = ctx.$("[data-resend]");
        let left = 0;
        const tick = () => {
          btn.disabled = left > 0;
          btn.textContent = left > 0 ? `Resend in ${left}s` : "Resend email";
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
          ctx.toast({ title: "Email sent", description: ctx.$("[data-email]").textContent });
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
          ctx.toast({ title: "Address updated & email resent" });
        });
      }
    },

    "otp-verify": {
      html: `${head("Auth · otp-verify.tsx", "OTP verify", "Auto-advancing 6-digit code. The demo code is 424242; wrong codes shake and clear.")}
        <div class="xp-center"><div class="dv-card xp-auth-card" style="text-align:center"><div class="dv-card__body dv-stack" style="align-items:center">
          <h3 class="xp-title">Enter verification code</h3><p class="dv-muted">Sent to •••• 4821 · demo code <code>424242</code></p>
          <dv-otp length="6" data-otp></dv-otp>
          <span class="dv-error" data-err></span>
          <button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" data-resend>Resend code</button>
        </div></div></div>`,
      setup(root, ctx) {
        const otp = ctx.$("[data-otp]");
        ctx.on(otp, "dv-complete", (e) => {
          if (e.detail.value === "424242") {
            ctx.$("[data-err]").textContent = "";
            otp.querySelectorAll("input").forEach((i) => (i.style.borderColor = "var(--dv-success)"));
            ctx.toast({ title: "Verified ✓" });
          } else {
            ctx.$("[data-err]").textContent = "That code is incorrect. Try again.";
            otp.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 300 });
            ctx.timeout(350, () => otp.clear());
          }
        });
        ctx.on(ctx.$("[data-resend]"), "click", () => ctx.toast({ title: "New code sent", variant: "info" }));
      }
    },

    "reset-password": {
      html: `${head("Auth · reset-password.tsx", "Reset password", "Live rule checklist; submit unlocks only when every rule passes and both fields match.")}
        <div class="xp-center"><form class="dv-card xp-auth-card" data-form><div class="dv-card__body dv-stack">
          <h3 class="xp-title">Choose a new password</h3>
          <label class="dv-field"><span class="dv-label">New password</span><input class="dv-input" type="password" data-pw autocomplete="new-password" /></label>
          <ul class="dv-stack" style="--gap:4px;list-style:none;padding:0;margin:0;font-size:12px" data-rules>
            <li data-rule="len">8+ characters</li><li data-rule="upper">One uppercase letter</li><li data-rule="num">One number</li><li data-rule="sym">One symbol</li>
          </ul>
          <label class="dv-field"><span class="dv-label">Confirm</span><input class="dv-input" type="password" data-pw2 autocomplete="new-password" /></label>
          <button type="submit" class="dv-btn dv-btn--primary dv-btn--block" disabled data-submit>Update password</button>
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
            li.style.color = ok ? "var(--dv-success)" : "var(--dv-fg-muted)";
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
          ctx.toast({ title: "Password updated", description: "Sign in with your new password." });
          e.target.reset();
          check();
        });
        check();
      }
    },

    "two-factor": {
      html: `${head("Auth · two-factor.tsx", "Two-factor", "Scan the QR, confirm a code (any 6 digits) and save generated backup codes.")}
        <div class="xp-panel dv-stack" style="max-width:520px;margin:0 auto;width:100%">
          <ol class="dv-steps"><li aria-current="step" data-s="0">Scan</li><li data-s="1">Verify</li><li data-s="2">Backup</li></ol>
          <section data-p="0" class="dv-row" style="--gap:18px;align-items:flex-start"><svg data-qr width="132" height="132" viewBox="0 0 21 21" style="background:#fff;border-radius:8px;padding:6px" shape-rendering="crispEdges"></svg><div class="dv-stack" style="flex:1;min-width:180px"><span class="dv-muted">Scan with your authenticator app or enter the key:</span><code class="xp-mono" data-key></code><button type="button" class="dv-btn dv-btn--primary" data-go="1">I've scanned it</button></div></section>
          <section data-p="1" class="dv-stack" hidden><span class="dv-muted">Enter the 6-digit code from your app.</span><dv-otp length="6" data-otp></dv-otp></section>
          <section data-p="2" class="dv-stack" hidden><div class="dv-alert dv-alert--success"><div><div class="dv-alert__title">2FA enabled</div><div class="dv-alert__desc">Store these one-time backup codes somewhere safe.</div></div></div><pre class="dv-code" data-codes></pre><div class="dv-row"><button type="button" class="dv-btn" data-copy>Copy codes</button><button type="button" class="dv-btn" data-download>Download .txt</button></div></section>
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
        // Decorative QR-style matrix derived from the key (finder squares + data bits)
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
        ctx.on(ctx.$("[data-otp]"), "dv-complete", () => go(2));
        ctx.on(ctx.$("[data-copy]"), "click", () => DevlUI.copy(codes.join("\n")).then(() => ctx.toast({ title: "Backup codes copied" })));
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
      html: `${head("Auth · magic-link-sent.tsx", "Magic link sent", "Expiry countdown, resend that resets the timer and a password fallback.")}
        <div class="xp-center"><div class="dv-card xp-auth-card" style="text-align:center"><div class="dv-card__body dv-stack" style="align-items:center">
          <div class="dv-empty__icon">✦</div><h3 class="xp-title">Magic link sent</h3>
          <p class="dv-muted">Click the link we emailed to sign in. It expires in</p>
          <div class="xp-num xp-mono" data-timer>10:00</div>
          <progress class="dv-progress" max="600" value="600" data-bar></progress>
          <div class="dv-row"><button type="button" class="dv-btn" data-resend>Resend link</button><button type="button" class="dv-btn dv-btn--subtle" data-pw>Use password instead</button></div>
          <form class="dv-stack" data-xp-form data-success="Signed in with password" hidden style="width:100%;text-align:left" novalidate>${field(pwF)}<button type="submit" class="dv-btn dv-btn--primary dv-btn--block">Sign in</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        let left = 600;
        const render = () => {
          ctx.$("[data-timer]").textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
          ctx.$("[data-bar]").value = left;
          ctx.$("[data-timer]").style.color = left < 60 ? "var(--dv-danger)" : "";
        };
        ctx.every(1000, () => {
          if (left > 0) left--;
          if (left === 0) ctx.$("[data-timer]").textContent = "Expired";
          else render();
        });
        ctx.on(ctx.$("[data-resend]"), "click", () => {
          left = 600;
          render();
          ctx.toast({ title: "New magic link sent" });
        });
        ctx.on(ctx.$("[data-pw]"), "click", () => (ctx.$("[data-xp-form]").hidden = false));
        render();
      }
    }
  });
})();
