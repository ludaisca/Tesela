// ============================================================================
// Functional experiments — Timelines (12), Calendars (9), Profile (10),
// Threads & comments (6), Tours & coachmarks (6)
// ============================================================================

(function () {
  "use strict";
  const X = window.DEVL_XP;
  const { head, esc } = X;

  const ago = (ms) => {
    const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
    if (s < 10) return "just now";
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };
  X.ago = ago;

  // ==========================================================================
  // TIMELINES
  // ==========================================================================
  X.addMany("timelines", {
    audit: {
      html: `
        ${head("Timelines · audit.tsx", "Audit trail", "Filter by actor and event type, expand any event to see its before/after diff, load older history.")}
        <div class="dv-row"><select class="dv-select" style="width:auto" data-actor aria-label="Actor"><option value="">All actors</option><option>Ana</option><option>Leo</option><option>Sara</option><option>system</option></select><div class="dv-row" style="--gap:6px" data-types></div></div>
        <ol class="dv-timeline" data-list></ol>
        <button type="button" class="dv-btn dv-btn--sm" data-more style="align-self:flex-start">Load older</button>`,
      setup(root, ctx) {
        const types = { "role.update": "warning", "key.create": "info", "member.remove": "danger", "settings.update": "accent" };
        const actors = ["Ana", "Leo", "Sara", "system"];
        let events = [];
        let t = Date.now();
        const more = (n) => {
          for (let i = 0; i < n; i++) {
            const type = Object.keys(types)[(events.length * 7) % 4];
            t -= (15 + ((events.length * 13) % 50)) * 60000;
            events.push({ type, actor: actors[(events.length * 3) % 4], at: t, target: ["Leo Kim", "CI deploy key", "Tom Weber", "Workspace name"][(events.length * 5) % 4], before: { role: "Member", name: "Acme" }, after: { role: "Admin", name: "Acme inc." } });
          }
        };
        const on = new Set(Object.keys(types));
        ctx.$("[data-types]").innerHTML = Object.keys(types).map((k) => `<button type="button" class="dv-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const render = () => {
          const actor = ctx.$("[data-actor]").value;
          ctx.$("[data-list]").innerHTML = events
            .filter((e) => on.has(e.type) && (!actor || e.actor === actor))
            .map((e) => `<li style="--c:var(--dv-${types[e.type] === "accent" ? "accent" : types[e.type]})"><details><summary style="cursor:pointer;list-style:none"><strong>${e.actor}</strong> <span class="dv-badge dv-badge--${types[e.type]}">${e.type}</span> ${esc(e.target)} <span class="dv-timeline__meta">· ${ago(e.at)}</span></summary><pre class="dv-code" style="margin-top:6px;font-size:11px"><span class="xp-diff-del">- ${esc(JSON.stringify(e.before))}</span>\n<span class="xp-diff-add">+ ${esc(JSON.stringify(e.after))}</span></pre></details></li>`)
            .join("") || '<li class="dv-muted">No events match.</li>';
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
        ${head("Timelines · notifications.tsx", "Notifications panel", "Tabs for all / unread / mentions, mark read individually or all at once. A new notification arrives every few seconds.")}
        <div class="dv-card" style="max-width:520px;width:100%;margin:0 auto">
          <div class="dv-card__header dv-row"><strong>Notifications</strong><span class="dv-badge dv-badge--danger" data-badge></span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-all>Mark all read</button></div>
          <div class="dv-card__body"><dv-segmented value="all" data-tab><button class="dv-segmented__item" value="all">All</button><button class="dv-segmented__item" value="unread">Unread</button><button class="dv-segmented__item" value="mention">Mentions</button></dv-segmented><ul class="dv-list" style="margin-top:12px;max-height:340px;overflow:auto" data-list></ul></div>
        </div>`,
      setup(root, ctx) {
        const seed = [["Ana", "mentioned you in “Tokens v2”", true], ["GitHub", "PR #482 was approved", false], ["Leo", "assigned you DEV-124", false], ["Sara", "mentioned you in Q3 roadmap", true]];
        let items = seed.map(([who, what, mention], i) => ({ id: i, who, what, mention, read: i > 1, at: Date.now() - (i + 1) * 900000 }));
        let id = items.length;
        const render = () => {
          const tab = ctx.$("[data-tab]").value || "all";
          const list = items.filter((n) => tab === "all" || (tab === "unread" ? !n.read : n.mention));
          ctx.$("[data-list]").innerHTML = list.map((n) => `<li data-id="${n.id}" class="${n.read ? "" : "xp-unread"}" style="cursor:pointer"><span class="dv-avatar dv-avatar--sm">${n.who[0]}</span><div style="flex:1"><div><strong>${esc(n.who)}</strong> ${esc(n.what)}</div><div class="dv-list__desc">${ago(n.at)}</div></div>${n.read ? "" : '<span class="dv-dot dv-dot--accent"></span>'}</li>`).join("") || '<li class="dv-muted">Nothing here.</li>';
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
        ctx.on(ctx.$("[data-tab]"), "dv-change", render);
        const pool = [["Tom", "commented on DEV-120", false], ["Mia", "mentioned you in standup notes", true], ["Vercel", "Deployment ready", false]];
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
        ${head("Timelines · changelog.tsx", "Changelog", "Filter releases by change type, search entries and subscribe to updates.")}
        <div class="dv-row"><input class="dv-input xp-search" data-q placeholder="Search changes…" aria-label="Search" /><div class="dv-row" style="--gap:6px" data-types></div><span class="dv-spacer"></span><form class="dv-input-group" data-sub style="max-width:280px"><input class="dv-input" type="email" required placeholder="Email for updates" aria-label="Email" /><button type="submit" class="dv-btn dv-btn--sm" style="margin:3px">Subscribe</button></form></div>
        <ol class="dv-timeline" data-list></ol>`,
      setup(root, ctx) {
        const releases = [
          ["1.3.0", "2026-10-14", [["feature", "Functional gallery: every experiment is a real component"], ["fix", "Sparkline end dot no longer stretches"], ["improvement", "Command palette ranks by relevance"]]],
          ["1.2.0", "2026-10-02", [["feature", "OTP input with paste support"], ["feature", "Calendar component with locale support"], ["fix", "Hidden attribute respected by dv-* elements"]]],
          ["1.1.0", "2026-09-20", [["improvement", "Reduced-motion support everywhere"], ["fix", "Favorites keyed by full path"]]],
          ["1.0.0", "2026-09-01", [["feature", "Initial release of devl-ui"]]]
        ];
        const colors = { feature: "success", fix: "danger", improvement: "info" };
        const on = new Set(Object.keys(colors));
        ctx.$("[data-types]").innerHTML = Object.keys(colors).map((k) => `<button type="button" class="dv-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = releases
            .map(([v, d, changes]) => {
              const rows = changes.filter(([t, text]) => on.has(t) && text.toLowerCase().includes(q));
              return rows.length ? `<li style="--c:var(--xp-accent)"><div class="dv-row"><strong class="xp-mono">v${v}</strong><span class="dv-timeline__meta">${d}</span></div><ul class="dv-stack" style="--gap:4px;list-style:none;padding:0;margin:8px 0 0">${rows.map(([t, text]) => `<li class="dv-row" style="--gap:8px;flex-wrap:nowrap"><span class="dv-badge dv-badge--${colors[t]}" style="min-width:90px;justify-content:center">${t}</span>${esc(text)}</li>`).join("")}</ul></li>` : "";
            })
            .join("") || '<li class="dv-muted">No changes match.</li>';
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
          ctx.toast({ title: "Subscribed to release notes" });
          e.target.reset();
        });
        render();
      }
    },

    commits: {
      html: `
        ${head("Timelines · commits.tsx", "Commit history", "Switch branches, copy SHAs and expand a commit to see the files it touched.")}
        <div class="dv-row"><dv-menu data-branch><button type="button" class="dv-btn dv-btn--sm" data-dv-trigger>⎇ <span data-b>main</span> ▾</button><div class="dv-menu__list"><button type="button" class="dv-menu__item" data-value="main">main</button><button type="button" class="dv-menu__item" data-value="feat/gallery">feat/gallery</button><button type="button" class="dv-menu__item" data-value="fix/sparkline">fix/sparkline</button></div></dv-menu><span class="dv-muted" data-count></span></div>
        <div data-list class="dv-stack"></div>`,
      setup(root, ctx) {
        const msgs = ["feat: functional experiments runtime", "fix: premultiplied alpha in ambient shader", "chore: bump docs", "feat(ui): dv-calendar keyboard nav", "refactor: share highlighter", "test: smoke all experiments", "fix: sparkline aspect ratio", "docs: README usage"];
        const files = ["js/experiments/core.js", "lib/devl-ui.js", "lib/devl-ui.css", "README.md", "index.html", "css/experiments.css"];
        const render = (branch) => {
          ctx.$("[data-b]").textContent = branch;
          const seed = branch.length * 31;
          const r = DEVL_XP.rng(seed);
          const commits = Array.from({ length: 7 }, (_, i) => ({ sha: Math.floor(r() * 0xfffffff).toString(16).padStart(7, "0"), msg: msgs[(i + seed) % msgs.length], who: ["Luis", "Ana", "Leo"][i % 3], verified: r() > 0.3, day: Math.floor(i / 3), files: files.filter(() => r() > 0.5).slice(0, 4) }));
          ctx.$("[data-count]").textContent = `${commits.length} commits`;
          const days = [...new Set(commits.map((c) => c.day))];
          ctx.$("[data-list]").innerHTML = days
            .map((d) => `<div><span class="dv-eyebrow">${d === 0 ? "Today" : `${d} day${d > 1 ? "s" : ""} ago`}</span><ul class="dv-list" style="margin-top:6px">${commits.filter((c) => c.day === d).map((c) => `<li style="flex-wrap:wrap"><span class="dv-avatar dv-avatar--sm">${c.who[0]}</span><div style="flex:1;min-width:200px"><div class="dv-list__title">${esc(c.msg)}</div><div class="dv-list__desc">${c.who} committed${c.verified ? ' · <span style="color:var(--dv-success)">✓ Verified</span>' : ""}</div></div><span class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm xp-mono" data-dv-copy="${c.sha}" data-dv-tooltip="Copy SHA">${c.sha}</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-x aria-expanded="false">Files</button></span><div data-files hidden style="flex-basis:100%;padding-left:36px" class="xp-mono dv-muted">${c.files.map((f) => `<div>M ${f}</div>`).join("") || "<div>(empty commit)</div>"}</div></li>`).join("")}</ul></div>`)
            .join("");
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-x]");
          if (!b) return;
          const f = b.closest("li").querySelector("[data-files]");
          f.hidden = !f.hidden;
          b.setAttribute("aria-expanded", String(!f.hidden));
        });
        ctx.on(ctx.$("[data-branch]"), "dv-select", (e) => render(e.detail.value));
        render("main");
      }
    },

    approvals: {
      html: `
        ${head("Timelines · approvals.tsx", "Approvals", "Sequential sign-off: each reviewer approves or rejects (with a reason). When every step passes, the request is ready to ship.")}
        <div class="dv-row"><strong>Launch: pricing page v2</strong><span class="dv-badge" data-status></span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-reset>Reset</button></div>
        <ol class="dv-timeline" data-steps></ol>`,
      setup(root, ctx) {
        let steps;
        const reset = () => (steps = [["Design", "Ana López"], ["Engineering", "Leo Kim"], ["Legal", "Sara Ruiz"]].map(([team, who]) => ({ team, who, state: "pending", note: "" })));
        const render = () => {
          const cur = steps.findIndex((s) => s.state === "pending");
          const rejected = steps.some((s) => s.state === "rejected");
          ctx.$("[data-status]").className = `dv-badge dv-badge--${rejected ? "danger" : cur === -1 ? "success" : "warning"}`;
          ctx.$("[data-status]").textContent = rejected ? "Changes requested" : cur === -1 ? "Ready to ship 🚀" : `Waiting on ${steps[cur].team}`;
          ctx.$("[data-steps]").innerHTML = steps
            .map((s, i) => `<li style="--c:var(--dv-${s.state === "approved" ? "success" : s.state === "rejected" ? "danger" : i === cur && !rejected ? "warning" : "fg-subtle"})"><div class="dv-row"><strong>${s.team}</strong><span class="dv-muted">${s.who}</span><span class="dv-badge${s.state === "approved" ? " dv-badge--success" : s.state === "rejected" ? " dv-badge--danger" : ""}">${s.state}</span></div>${s.note ? `<div class="dv-muted" style="margin-top:4px">“${esc(s.note)}”</div>` : ""}${i === cur && !rejected ? `<div class="dv-stack" style="margin-top:8px;--gap:6px"><textarea class="dv-textarea" data-note placeholder="Optional note (required to reject)" style="min-height:60px"></textarea><div class="dv-row"><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-ok>Approve</button><button type="button" class="dv-btn dv-btn--sm dv-btn--danger" data-no>Request changes</button></div><span class="dv-error" data-err></span></div>` : ""}</li>`)
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
            if (!note.value.trim()) return (ctx.$("[data-err]").textContent = "Please explain what needs to change.");
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
        ${head("Timelines · pull-request.tsx", "Pull request", "Checks run live (and can fail — re-run them). Approve, comment and merge once everything is green.")}
        <div class="dv-row"><span class="dv-badge dv-badge--success" data-state>Open</span><strong>#482 Command palette ranking</strong><span class="dv-muted">feat/palette → main</span></div>
        <div class="dv-grid" style="--min:320px;align-items:start">
          <div class="dv-stack">
            <div class="xp-panel dv-stack" style="--gap:8px"><div class="dv-row"><strong>Checks</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-rerun>Re-run</button></div><ul class="dv-list" data-checks></ul></div>
            <ol class="dv-timeline" data-conv></ol>
            <form class="dv-stack" data-comment><textarea class="dv-textarea" placeholder="Leave a comment" required aria-label="Comment"></textarea><button type="submit" class="dv-btn dv-btn--sm" style="align-self:flex-end">Comment</button></form>
          </div>
          <div class="xp-panel dv-stack"><div class="dv-row"><strong>Reviews</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-approve>Approve</button></div><span class="dv-muted" data-reviews>No reviews yet</span><div class="dv-divider"></div><select class="dv-select" data-method aria-label="Merge method"><option>Create a merge commit</option><option>Squash and merge</option><option>Rebase and merge</option></select><button type="button" class="dv-btn dv-btn--primary" data-merge disabled>Merge pull request</button><span class="dv-hint" data-why></span></div>
        </div>`,
      setup(root, ctx) {
        const names = ["lint", "unit tests", "e2e (chromium)", "build"];
        let checks = [];
        let approved = false;
        let merged = false;
        const conv = (who, text, c = "var(--dv-fg-subtle)") => {
          const li = document.createElement("li");
          li.style.setProperty("--c", c);
          li.innerHTML = `<strong></strong> <span></span><div class="dv-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.children[0].textContent = who;
          li.children[1].textContent = text;
          ctx.$("[data-conv]").appendChild(li);
        };
        const sync = () => {
          ctx.$("[data-checks]").innerHTML = checks.map((c) => `<li><span>${c.state === "running" ? '<span class="dv-spinner" style="--size:12px"></span>' : c.state === "pass" ? '<span style="color:var(--dv-success)">✓</span>' : '<span style="color:var(--dv-danger)">✕</span>'}</span><span style="flex:1">${c.name}</span><span class="dv-muted xp-mono">${c.state === "running" ? "running…" : `${c.s}s`}</span></li>`).join("");
          const green = checks.every((c) => c.state === "pass");
          const btn = ctx.$("[data-merge]");
          btn.disabled = merged || !green || !approved;
          ctx.$("[data-why]").textContent = merged ? "" : !green ? "Waiting for checks to pass" : !approved ? "Needs 1 approving review" : "Ready to merge";
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
          ctx.$("[data-reviews]").innerHTML = '<span class="dv-badge dv-badge--success">✓ Luis approved</span>';
          conv("Luis", "approved these changes", "var(--dv-success)");
          sync();
        });
        ctx.on(ctx.$("[data-comment]"), "submit", (e) => {
          e.preventDefault();
          conv("Luis", e.target.querySelector("textarea").value);
          e.target.reset();
        });
        ctx.on(ctx.$("[data-merge]"), "click", () => {
          merged = true;
          ctx.$("[data-state]").className = "dv-badge dv-badge--accent";
          ctx.$("[data-state]").textContent = "Merged";
          conv("Luis", `merged via “${ctx.$("[data-method]").value}”`, "var(--xp-accent)");
          ctx.toast({ title: "Pull request merged" });
          sync();
        });
        conv("Leo", "opened this pull request");
        run();
      }
    },

    "pr-ops-console": {
      html: `
        ${head("Timelines · pr-ops-console.tsx", "PR ops console", "A CI/CD pipeline you can run: stages execute in order with streaming logs, staging needs manual approval, cancel or roll back any time.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-run>▶ Run pipeline</button><button type="button" class="dv-btn" data-cancel disabled>Cancel</button><button type="button" class="dv-btn dv-btn--subtle" data-rollback disabled>Roll back prod</button><span class="dv-spacer"></span><span class="dv-badge" data-state>idle</span></div>
        <div class="dv-row" style="--gap:6px;flex-wrap:nowrap;overflow:auto" data-stages></div>
        <div class="dv-alert dv-alert--warning" data-gate hidden><div style="flex:1"><div class="dv-alert__title">Staging deployed — promote to production?</div></div><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-approve>Approve</button></div>
        <pre class="xp-terminal" data-log style="min-height:220px;max-height:260px;overflow:auto;margin:0"></pre>`,
      setup(root, ctx) {
        const stages = ["Install", "Lint", "Test", "Build", "Deploy staging", "Deploy prod"];
        let state = [];
        let token = 0;
        const log = (line) => {
          const el = ctx.$("[data-log]");
          el.textContent += `${new Date().toLocaleTimeString()}  ${line}\n`;
          el.scrollTop = el.scrollHeight;
        };
        const render = () => {
          ctx.$("[data-stages]").innerHTML = stages.map((s, i) => `<div class="dv-stat" style="min-width:120px;padding:10px;border-color:${state[i] === "running" ? "var(--xp-accent)" : "var(--dv-border)"}"><span class="dv-eyebrow">${i + 1}. ${s}</span><span>${{ running: '<span class="dv-spinner" style="--size:12px"></span> running', done: '<span style="color:var(--dv-success)">✓ passed</span>', failed: '<span style="color:var(--dv-danger)">✕ failed</span>', waiting: "⏸ waiting", cancelled: "⊘ cancelled" }[state[i]] || '<span class="dv-muted">queued</span>'}</span></div>`).join("");
        };
        const setState = (s) => {
          ctx.$("[data-state]").textContent = s;
          ctx.$("[data-state]").className = `dv-badge${s === "success" ? " dv-badge--success" : s === "failed" || s === "cancelled" ? " dv-badge--danger" : s === "running" ? " dv-badge--info" : ""}`;
          ctx.$("[data-run]").disabled = s === "running" || s === "awaiting approval";
          ctx.$("[data-cancel]").disabled = !(s === "running" || s === "awaiting approval");
        };
        const runStage = (i, my) => {
          if (my !== token) return;
          if (i === 5 && state[4] === "done" && state[5] !== "approved") {
            state[5] = "waiting";
            ctx.$("[data-gate]").hidden = false;
            setState("awaiting approval");
            log("⏸ waiting for manual approval");
            return render();
          }
          if (i >= stages.length) {
            setState("success");
            ctx.$("[data-rollback]").disabled = false;
            log("✓ pipeline succeeded — v1.3.0 live");
            return;
          }
          state[i] = "running";
          render();
          log(`▶ ${stages[i]}…`);
          const steps = [`  $ ${["npm ci", "npm run lint", "npm test", "npm run build", "deploy --env staging", "deploy --env production"][i]}`, `  ${["added 0 packages (zero deps!)", "0 problems", "212 passed", "dist/ 148 kB", "https://staging.devl.dev", "https://devl.dev"][i]}`];
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
          log("✓ approved by Luis");
          runStage(5, token);
        });
        ctx.on(ctx.$("[data-cancel]"), "click", () => {
          token++;
          state = state.map((s) => (s === "running" || s === "waiting" ? "cancelled" : s));
          ctx.$("[data-gate]").hidden = true;
          setState("cancelled");
          log("⊘ cancelled by user");
          render();
        });
        ctx.on(ctx.$("[data-rollback]"), "click", (e) => {
          e.target.disabled = true;
          log("↺ rolling back production to v1.2.0…");
          ctx.timeout(900, () => {
            log("✓ rollback complete");
            ctx.toast({ title: "Production rolled back to v1.2.0", variant: "warning" });
          });
        });
        render();
      }
    },

    releases: {
      html: `
        ${head("Timelines · releases.tsx", "Release timeline", "Promote any release to production or roll back; the live marker moves and the history records it.")}
        <ol class="dv-timeline" data-list></ol>
        <div><span class="dv-eyebrow">History</span><ul class="dv-list" style="margin-top:8px" data-hist></ul></div>`,
      setup(root, ctx) {
        const rel = [["v1.3.0", "Functional gallery", "2026-10-14", 3], ["v1.2.0", "Calendar & OTP", "2026-10-02", 4], ["v1.1.0", "Reduced motion", "2026-09-20", 2], ["v1.0.0", "Initial release", "2026-09-01", 5]];
        let live = 1;
        const hist = [];
        const render = () => {
          ctx.$("[data-list]").innerHTML = rel.map(([v, t, d, a], i) => `<li style="--c:${i === live ? "var(--dv-success)" : "var(--dv-fg-subtle)"}"><div class="dv-row"><strong class="xp-mono">${v}</strong><span>${t}</span>${i === live ? '<span class="dv-badge dv-badge--success"><span class="dv-dot dv-dot--success dv-dot--pulse"></span> Production</span>' : ""}<span class="dv-spacer"></span>${i === live ? "" : `<button type="button" class="dv-btn dv-btn--sm" data-p="${i}">${i < live ? "Promote" : "Roll back to"}</button>`}</div><div class="dv-timeline__meta">${d} · ${a} artifacts · tag ${v}</div></li>`).join("");
          ctx.$("[data-hist]").innerHTML = hist.map((h) => `<li>${h}</li>`).join("") || '<li class="dv-muted">No deployments this session.</li>';
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-p]");
          if (!b) return;
          const i = Number(b.dataset.p);
          b.setAttribute("aria-busy", "true");
          ctx.timeout(700, () => {
            hist.unshift(`${new Date().toLocaleTimeString()} · ${i < live ? "promoted" : "rolled back"} ${rel[live][0]} → <strong>${rel[i][0]}</strong>`);
            live = i;
            ctx.toast({ title: `${rel[i][0]} is live` });
            render();
          });
        });
        render();
      }
    },

    "status-page": {
      html: `
        ${head("Timelines · status-page.tsx", "Status page", "90-day uptime bars per component with hover detail, computed uptime percentages and incident history.")}
        <div class="dv-alert dv-alert--success"><div><div class="dv-alert__title">All systems operational</div></div></div>
        <div class="xp-panel xp-rel dv-stack" data-comps><div class="xp-tip" data-tip hidden></div></div>
        <div><span class="dv-eyebrow">Past incidents</span><ol class="dv-timeline" style="margin-top:10px" data-inc></ol></div>`,
      setup(root, ctx) {
        const comps = ["API", "Dashboard", "Webhooks", "CDN"];
        const r = DEVL_XP.rng(77);
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
              return `<div class="dv-stack" style="--gap:6px"><div class="dv-row"><strong>${c}</strong><span class="dv-spacer"></span><span class="dv-muted xp-mono">${up.toFixed(2)}% uptime</span></div><div style="display:flex;gap:2px;height:30px">${days[ci].map((s, i) => `<span data-c="${ci}" data-i="${i}" style="flex:1;border-radius:2px;background:var(--dv-${s === "ok" ? "success" : s === "minor" ? "warning" : "danger"});opacity:${s === "ok" ? 0.7 : 1}"></span>`).join("")}</div></div>`;
            })
            .join("")
        );
        const tipEl = ctx.$("[data-tip]");
        ctx.on(box, "pointermove", (e) => {
          const s = e.target.closest("[data-i]");
          if (!s) return (tipEl.hidden = true);
          const st = days[s.dataset.c][s.dataset.i];
          const d = new Date(Date.now() - (89 - s.dataset.i) * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          DEVL_XP.chart.tip(tipEl, e, `<strong>${comps[s.dataset.c]} · ${d}</strong><br>${st === "ok" ? "No downtime" : st === "minor" ? "Degraded performance (~2h)" : "Major outage (~12h)"}`);
        });
        ctx.on(box, "pointerleave", () => (tipEl.hidden = true));
        ctx.$("[data-inc]").innerHTML = incidents.sort((a, b) => b.i - a.i).slice(0, 5).map((x) => `<li style="--c:var(--dv-${x.s === "major" ? "danger" : "warning"})"><strong>${x.c}</strong> ${x.s === "major" ? "outage" : "degraded performance"}<div class="dv-timeline__meta">${new Date(Date.now() - (89 - x.i) * 864e5).toLocaleDateString()} · resolved</div></li>`).join("");
      }
    },

    deploys: {
      html: `
        ${head("Timelines · deploys.tsx", "Deploy history", "Filter by environment, redeploy any commit and watch it build with a live duration until it's ready (or errors).")}
        <div class="dv-row"><dv-segmented value="all" data-env><button class="dv-segmented__item" value="all">All</button><button class="dv-segmented__item" value="production">Production</button><button class="dv-segmented__item" value="preview">Preview</button></dv-segmented></div>
        <ul class="dv-list" data-list></ul>`,
      setup(root, ctx) {
        let n = 0;
        const deploys = [
          { id: ++n, sha: "f8a92c1", msg: "feat: functional gallery", env: "production", state: "ready", start: Date.now() - 3600e3, dur: 41 },
          { id: ++n, sha: "1c0de42", msg: "fix: sparkline aspect", env: "preview", state: "ready", start: Date.now() - 7200e3, dur: 38 },
          { id: ++n, sha: "9b7e3d0", msg: "chore: deps", env: "preview", state: "error", start: Date.now() - 9000e3, dur: 12 }
        ];
        const render = () => {
          const env = ctx.$("[data-env]").value || "all";
          ctx.$("[data-list]").innerHTML = deploys
            .filter((d) => env === "all" || d.env === env)
            .map((d) => {
              const dur = d.state === "building" ? Math.round((Date.now() - d.start) / 1000) : d.dur;
              const badge = { ready: "success", error: "danger", building: "info" }[d.state];
              return `<li><span class="dv-badge dv-badge--${badge}">${d.state === "building" ? '<span class="dv-spinner" style="--size:10px;margin-right:4px"></span>' : ""}${d.state}</span><div style="flex:1"><div class="dv-list__title">${esc(d.msg)}</div><div class="dv-list__desc"><span class="xp-mono">${d.sha}</span> · ${d.env} · ${ago(d.start)} · ${dur}s</div></div><span class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm" data-re="${d.id}"${d.state === "building" ? " disabled" : ""}>Redeploy</button></span></li>`;
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
            ctx.toast({ title: `Deploy ${d.state === "ready" ? "ready" : "failed"}`, description: `${d.sha} → ${d.env}`, variant: d.state === "ready" ? "success" : "danger" });
            render();
          });
          render();
        });
        ctx.on(ctx.$("[data-env]"), "dv-change", render);
        ctx.every(1000, render);
        render();
      }
    },

    "inbox-thread": {
      html: `
        ${head("Timelines · inbox-thread.tsx", "Inbox thread", "Send a reply (Enter), attach files, and watch the other side type and answer.")}
        <div class="dv-card" style="max-width:640px;width:100%;margin:0 auto;display:flex;flex-direction:column;height:480px">
          <div class="dv-card__header dv-row" style="border-bottom:1px solid var(--dv-border);padding-bottom:12px"><span class="dv-avatar" data-status="online">AL</span><div><strong>Ana López</strong><div class="dv-muted" style="font-size:11px">Design lead</div></div></div>
          <div data-msgs style="flex:1;overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px"></div>
          <div class="dv-muted" data-typing hidden style="padding:0 18px 6px;font-size:11px">Ana is typing…</div>
          <form class="dv-row" data-form style="padding:10px 12px;border-top:1px solid var(--dv-border);flex-wrap:nowrap"><label class="dv-btn dv-btn--icon dv-btn--subtle" style="cursor:pointer" aria-label="Attach">📎<input type="file" hidden data-file /></label><input class="dv-input" data-text placeholder="Write a reply…" aria-label="Reply" autocomplete="off" /><button type="submit" class="dv-btn dv-btn--primary">Send</button></form>
        </div>`,
      setup(root, ctx) {
        const box = ctx.$("[data-msgs]");
        const bubble = (mine, text, file) => {
          const d = document.createElement("div");
          d.style.cssText = `align-self:${mine ? "flex-end" : "flex-start"};max-width:75%;padding:8px 12px;border-radius:12px;font-size:12.5px;line-height:1.5;background:${mine ? "var(--xp-accent)" : "var(--dv-surface-strong)"};color:${mine ? "#fff" : "var(--dv-fg)"}`;
          d.textContent = text;
          if (file) d.insertAdjacentHTML("beforeend", `<div style="margin-top:6px;opacity:.85">📄 <span></span></div>`), (d.querySelector("span").textContent = file);
          const t = document.createElement("div");
          t.style.cssText = `font-size:10px;opacity:.7;margin-top:2px;text-align:${mine ? "right" : "left"}`;
          t.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          d.appendChild(t);
          box.appendChild(d);
          box.scrollTop = box.scrollHeight;
        };
        const replies = ["Love it — can we tighten the spacing on mobile?", "Sounds good, ship it 🚀", "Can you send the Figma link?", "Perfect, thanks!"];
        let k = 0;
        let pendingFile = "";
        ctx.on(ctx.$("[data-file]"), "change", (e) => {
          pendingFile = e.target.files[0] ? e.target.files[0].name : "";
          if (pendingFile) ctx.toast({ title: `Attached ${pendingFile}`, variant: "neutral", duration: 1200 });
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
        bubble(false, "Hey! Did you get a chance to look at the new gallery?");
        bubble(true, "Yes — every experiment is functional now.");
      }
    },

    "activity-feed": {
      html: `
        ${head("Timelines · activity-feed.tsx", "Activity feed", "Realtime stream with pause/resume, type filters and relative timestamps that keep updating.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-pause aria-pressed="false">❚❚ Pause</button><div class="dv-row" style="--gap:6px" data-types></div><span class="dv-spacer"></span><span class="dv-badge" data-count></span></div>
        <ol class="dv-timeline" data-list style="max-height:460px;overflow:auto"></ol>`,
      setup(root, ctx) {
        const kinds = { deploy: "success", comment: "info", issue: "warning", member: "accent" };
        const templates = { deploy: ["deployed f8a92c1 to production", "deployed preview for #483"], comment: ["commented on DEV-120", "replied in Tokens v2"], issue: ["opened DEV-131", "closed DEV-118"], member: ["joined the workspace", "was promoted to Admin"] };
        const people = ["Ana", "Leo", "Sara", "Tom", "Mia"];
        const feed = [];
        const on = new Set(Object.keys(kinds));
        let paused = false;
        let n = 0;
        ctx.$("[data-types]").innerHTML = Object.keys(kinds).map((k) => `<button type="button" class="dv-chip" data-t="${k}" aria-pressed="true">${k}</button>`).join("");
        const add = () => {
          const k = Object.keys(kinds)[n % 4];
          feed.unshift({ k, who: people[n % 5], what: templates[k][n % 2], at: Date.now() });
          n++;
          if (feed.length > 60) feed.pop();
        };
        const render = () => {
          const rows = feed.filter((f) => on.has(f.k));
          ctx.$("[data-count]").textContent = `${rows.length} events`;
          ctx.$("[data-list]").innerHTML = rows.map((f) => `<li style="--c:var(--dv-${kinds[f.k] === "accent" ? "accent" : kinds[f.k]})"><strong>${f.who}</strong> ${f.what}<div class="dv-timeline__meta">${ago(f.at)}</div></li>`).join("");
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
          e.target.textContent = paused ? "▶ Resume" : "❚❚ Pause";
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
  // CALENDARS
  // ==========================================================================
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  X.iso = iso;

  X.addMany("calendars", {
    month: {
      html: `
        ${head("Calendars · month.tsx", "Month view", "Navigate months, click a day to add an event, click an event to remove it. Today is outlined.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-nav="-1">‹</button><button type="button" class="dv-btn dv-btn--sm" data-today>Today</button><button type="button" class="dv-btn dv-btn--sm" data-nav="1">›</button><h3 class="xp-title" style="margin:0;font-size:18px" data-title></h3></div>
        <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px" data-grid></div>
        <form class="dv-row xp-panel" data-form hidden style="padding:10px"><span class="dv-badge" data-day></span><input class="dv-input" style="flex:1" placeholder="Event title" required data-title-in aria-label="Event title" /><button type="submit" class="dv-btn dv-btn--primary dv-btn--sm">Add</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cancel>Cancel</button></form>`,
      setup(root, ctx) {
        const today = new Date();
        let view = new Date(today.getFullYear(), today.getMonth(), 1);
        const events = { [DEVL_XP.iso(today)]: ["Design sync"], [DEVL_XP.iso(new Date(today.getFullYear(), today.getMonth(), 3))]: ["Release v1.2"] };
        let picked = null;
        const render = () => {
          ctx.$("[data-title]").textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const offset = (view.getDay() + 6) % 7;
          const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
          let html = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div class="dv-eyebrow" style="padding:4px;overflow:hidden">${d}</div>`).join("");
          for (let i = 0; i < 42; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const key = DEVL_XP.iso(d);
            const out = d.getMonth() !== view.getMonth();
            html += `<div data-d="${key}" style="min-height:84px;min-width:0;overflow:hidden;padding:6px;border-radius:8px;border:1px solid ${key === DEVL_XP.iso(today) ? "var(--xp-accent)" : "var(--dv-border)"};background:var(--dv-surface);cursor:pointer;opacity:${out ? 0.45 : 1}"><div class="xp-mono" style="font-size:11px">${d.getDate()}</div>${(events[key] || []).map((t, k) => `<button type="button" class="dv-badge dv-badge--accent" data-ev="${k}" style="border:0;margin-top:3px;max-width:100%;overflow:hidden;cursor:pointer;display:flex">${esc(t)}</button>`).join("")}</div>`;
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
        ${head("Calendars · week.tsx", "Week schedule", "Click an empty slot to block an hour, click a block to remove it. The red line is the current time.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-nav="-7">‹ Prev</button><button type="button" class="dv-btn dv-btn--sm" data-nav="7">Next ›</button><strong data-range></strong><span class="dv-spacer"></span><span class="dv-badge" data-busy></span></div>
        <div class="xp-panel" style="padding:0;overflow:auto"><div data-grid style="position:relative;display:grid;grid-template-columns:52px repeat(7,minmax(90px,1fr));min-width:720px"></div></div>`,
      setup(root, ctx) {
        const H0 = 8;
        const H1 = 19;
        const ROW = 40;
        const now = new Date();
        let monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
        const blocks = new Map([[`${DEVL_XP.iso(monday)}|10`, "Standup"], [`${DEVL_XP.iso(new Date(monday.getTime() + 2 * 864e5))}|14`, "Design review"]]);
        const grid = ctx.$("[data-grid]");
        const render = () => {
          const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
          ctx.$("[data-range]").textContent = `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
          let html = '<div style="height:36px"></div>' + days.map((d) => `<div class="dv-eyebrow" style="height:36px;display:grid;place-items:center;border-left:1px solid var(--dv-border);${DEVL_XP.iso(d) === DEVL_XP.iso(now) ? "color:var(--xp-accent)" : ""}">${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</div>`).join("");
          for (let h = H0; h < H1; h++) {
            html += `<div class="xp-mono dv-muted" style="height:${ROW}px;font-size:10px;padding:2px 6px;border-top:1px solid var(--dv-border)">${String(h).padStart(2, "0")}:00</div>`;
            days.forEach((d) => {
              const key = `${DEVL_XP.iso(d)}|${h}`;
              const title = blocks.get(key);
              html += `<div data-k="${key}" style="height:${ROW}px;border-top:1px solid var(--dv-border);border-left:1px solid var(--dv-border);padding:2px;cursor:pointer">${title ? `<div style="height:100%;border-radius:6px;background:color-mix(in srgb,var(--xp-accent) 25%,transparent);border-left:3px solid var(--xp-accent);font-size:11px;padding:3px 6px">${esc(title)}</div>` : ""}</div>`;
            });
          }
          grid.innerHTML = html;
          const todayIdx = days.findIndex((d) => DEVL_XP.iso(d) === DEVL_XP.iso(now));
          const mins = now.getHours() * 60 + now.getMinutes();
          if (todayIdx >= 0 && mins >= H0 * 60 && mins < H1 * 60) grid.insertAdjacentHTML("beforeend", `<div style="position:absolute;left:52px;right:0;top:${36 + ((mins - H0 * 60) / 60) * ROW}px;height:2px;background:var(--dv-danger);pointer-events:none"></div>`);
          ctx.$("[data-busy]").textContent = `${[...blocks.keys()].filter((k) => days.some((d) => k.startsWith(DEVL_XP.iso(d)))).length}h booked this week`;
        };
        ctx.on(grid, "click", (e) => {
          const c = e.target.closest("[data-k]");
          if (!c) return;
          if (blocks.has(c.dataset.k)) blocks.delete(c.dataset.k);
          else blocks.set(c.dataset.k, "Focus block");
          render();
        });
        ctx.$$("[data-nav]").forEach((b) => ctx.on(b, "click", () => ((monday = new Date(monday.getTime() + Number(b.dataset.nav) * 864e5)), render())));
        ctx.every(60000, render);
        render();
      }
    },

    agenda: {
      html: `
        ${head("Calendars · agenda.tsx", "Agenda list", "Upcoming events grouped by day, filterable by calendar and searchable; join buttons light up for events starting soon.")}
        <div class="dv-row"><input class="dv-input xp-search" data-q placeholder="Search events…" aria-label="Search" /><label class="dv-choice"><input type="checkbox" class="dv-check" data-cal value="Work" checked /> <span class="dv-dot dv-dot--accent"></span> Work</label><label class="dv-choice"><input type="checkbox" class="dv-check" data-cal value="Personal" checked /> <span class="dv-dot dv-dot--success"></span> Personal</label></div>
        <div data-list class="dv-stack"></div>`,
      setup(root, ctx) {
        const now = Date.now();
        const evs = [[0.01, "Standup", "Work"], [0.2, "Design review", "Work"], [0.4, "Gym", "Personal"], [1.1, "1:1 with Ana", "Work"], [1.5, "Dinner with Leo", "Personal"], [2.2, "Sprint planning", "Work"], [4.3, "Dentist", "Personal"], [6.1, "Quarterly review", "Work"]].map(([d, t, c]) => ({ at: now + d * 864e5, t, c }));
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          const cals = ctx.$$("[data-cal]:checked").map((c) => c.value);
          const rows = evs.filter((e) => cals.includes(e.c) && e.t.toLowerCase().includes(q));
          const groups = {};
          rows.forEach((e) => (groups[DEVL_XP.iso(new Date(e.at))] = groups[DEVL_XP.iso(new Date(e.at))] || []).push(e));
          ctx.$("[data-list]").innerHTML = Object.entries(groups)
            .map(([day, list]) => `<div><span class="dv-eyebrow">${new Date(day + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span><ul class="dv-list" style="margin-top:6px">${list.map((e) => {
              const soon = e.at - Date.now() < 30 * 60000;
              return `<li><span class="dv-dot dv-dot--${e.c === "Work" ? "accent" : "success"}"></span><span class="xp-mono dv-muted">${new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span style="flex:1">${esc(e.t)}</span>${e.c === "Work" ? `<button type="button" class="dv-btn dv-btn--sm${soon ? " dv-btn--primary" : ""}" data-join="${esc(e.t)}">${soon ? "Join now" : "Join"}</button>` : ""}</li>`;
            }).join("")}</ul></div>`)
            .join("") || '<div class="dv-empty"><div class="dv-empty__title">Nothing scheduled</div></div>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.$$("[data-cal]").forEach((c) => ctx.on(c, "change", render));
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-join]");
          if (b) ctx.toast({ title: `Joining “${b.dataset.join}”`, variant: "info" });
        });
        render();
      }
    },

    "date-range": {
      html: `
        ${head("Calendars · date-range.tsx", "Date range picker", "Two months side by side: click a start and an end (hover previews the range), or use a preset.")}
        <div class="dv-row"><span class="dv-badge dv-badge--outline xp-mono" data-out>Pick a start date</span><span class="dv-spacer"></span>${[["7", "Last 7 days"], ["30", "Last 30 days"], ["month", "This month"]].map(([v, l]) => `<button type="button" class="dv-chip" data-preset="${v}">${l}</button>`).join("")}</div>
        <div class="xp-panel dv-row" style="align-items:flex-start;--gap:28px"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-nav="-1" aria-label="Previous">‹</button><div class="dv-row" style="align-items:flex-start;--gap:28px;flex:1;justify-content:center" data-months></div><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-nav="1" aria-label="Next">›</button></div>`,
      setup(root, ctx) {
        const today = new Date();
        let view = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let a = null;
        let b = null;
        let hover = null;
        const key = (d) => DEVL_XP.iso(d);
        const month = (base) => {
          const offset = (base.getDay() + 6) % 7;
          let cells = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span class="dv-cal__dow">${d}</span>`).join("");
          for (let i = 0; i < offset; i++) cells += "<span></span>";
          const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
          const end = b || hover;
          for (let d = 1; d <= days; d++) {
            const k = key(new Date(base.getFullYear(), base.getMonth(), d));
            const lo = a && end ? (a < end ? a : end) : a;
            const hi = a && end ? (a < end ? end : a) : a;
            const inRange = lo && hi && k >= lo && k <= hi;
            const edge = k === lo || k === hi;
            cells += `<button type="button" class="dv-cal__day" data-k="${k}" aria-pressed="${edge}" style="${inRange && !edge ? "background:color-mix(in srgb,var(--xp-accent) 20%,transparent);border-radius:0" : ""}">${d}</button>`;
          }
          return `<div><div class="dv-eyebrow" style="text-align:center;margin-bottom:8px">${base.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div><div class="dv-cal__grid">${cells}</div></div>`;
        };
        const render = () => {
          ctx.$("[data-months]").innerHTML = month(view) + month(new Date(view.getFullYear(), view.getMonth() + 1, 1));
          const out = ctx.$("[data-out]");
          if (a && b) {
            const [lo, hi] = a < b ? [a, b] : [b, a];
            const nights = Math.round((new Date(hi) - new Date(lo)) / 864e5);
            out.textContent = `${lo} → ${hi} · ${nights + 1} days`;
          } else out.textContent = a ? `${a} → pick an end date` : "Pick a start date";
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
        ${head("Calendars · timezone.tsx", "Timezone planner", "Real Intl time zones. Slide to shift the meeting time; working hours (9–18) light up green so you can find the overlap.")}
        <div class="dv-row"><span class="dv-label">Offset</span><input type="range" class="dv-range" min="-12" max="12" value="0" step="0.5" data-shift style="flex:1;max-width:420px" aria-label="Shift hours" /><strong class="xp-mono" data-shift-out>now</strong><select class="dv-select" style="width:auto" data-add aria-label="Add city"><option value="">+ Add city</option><option>Asia/Tokyo</option><option>Australia/Sydney</option><option>Asia/Kolkata</option><option>America/Sao_Paulo</option></select></div>
        <ul class="dv-list" data-list></ul>
        <div class="dv-alert" data-overlap><div><div class="dv-alert__title" data-overlap-t></div></div></div>`,
      setup(root, ctx) {
        const zones = ["America/Mexico_City", "America/New_York", "Europe/Madrid", "Europe/Berlin"];
        const hourIn = (date, tz) => Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tz }).format(date)) % 24;
        const render = () => {
          const shift = Number(ctx.$("[data-shift]").value);
          const t = new Date(Date.now() + shift * 3600e3);
          ctx.$("[data-shift-out]").textContent = shift === 0 ? "now" : `${shift > 0 ? "+" : ""}${shift}h`;
          let all = true;
          ctx.$("[data-list]").innerHTML = zones
            .map((tz, i) => {
              const h = hourIn(t, tz);
              const work = h >= 9 && h < 18;
              if (!work) all = false;
              return `<li><span class="dv-dot dv-dot--${work ? "success" : "danger"}"></span><div style="flex:1"><div class="dv-list__title">${tz.split("/").pop().replace("_", " ")}</div><div class="dv-list__desc">${tz}</div></div><span class="xp-num xp-mono" style="font-size:20px">${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(t)}</span><span class="dv-muted" style="width:70px;text-align:right">${new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(t)}</span>${i ? `<button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-rm="${i}" aria-label="Remove">✕</button>` : '<span style="width:26px"></span>'}</li>`;
            })
            .join("");
          ctx.$("[data-overlap]").className = `dv-alert dv-alert--${all ? "success" : "warning"}`;
          ctx.$("[data-overlap-t]").textContent = all ? "✓ Everyone is within working hours" : "Someone is outside working hours — slide to find overlap";
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
        ${head("Calendars · mini.tsx", "Mini calendar", "A date input with a popover <dv-calendar>: type a date or pick one; Escape closes the popover.")}
        <div class="xp-rel" style="max-width:300px">
          <div class="dv-input-group"><input class="dv-input xp-mono" data-in placeholder="YYYY-MM-DD" aria-label="Date" /><button type="button" class="dv-btn dv-btn--subtle dv-btn--sm" style="margin:3px" data-open aria-expanded="false" aria-label="Open calendar">📅</button></div>
          <div data-pop hidden style="position:absolute;z-index:5;top:calc(100% + 6px);left:0;box-shadow:var(--dv-shadow-lg);border-radius:var(--dv-radius);background:var(--dv-bg-elevated)"><dv-calendar data-cal locale="en-US"></dv-calendar></div>
        </div>
        <p class="dv-muted" data-out></p>`,
      setup(root, ctx) {
        const input = ctx.$("[data-in]");
        const pop = ctx.$("[data-pop]");
        const cal = ctx.$("[data-cal]");
        const btn = ctx.$("[data-open]");
        const describe = (v) => (ctx.$("[data-out]").textContent = v ? `Selected: ${new Date(v + "T00:00").toLocaleDateString("en-US", { dateStyle: "full" })}` : "");
        const toggle = (open) => {
          pop.hidden = !open;
          btn.setAttribute("aria-expanded", String(open));
          if (open && /^\d{4}-\d{2}-\d{2}$/.test(input.value)) cal.value = input.value;
        };
        ctx.on(btn, "click", () => toggle(pop.hidden));
        ctx.on(input, "focus", () => toggle(true));
        ctx.on(cal, "dv-change", (e) => {
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
        ${head("Calendars · year-heatmap.tsx", "Contribution heatmap", "53 weeks of activity with hover counts, totals and computed current / longest streaks. Switch years to regenerate.")}
        <div class="dv-row"><dv-segmented value="2026" data-year><button class="dv-segmented__item" value="2024">2024</button><button class="dv-segmented__item" value="2025">2025</button><button class="dv-segmented__item" value="2026">2026</button></dv-segmented><span class="dv-spacer"></span><span class="dv-badge" data-total></span><span class="dv-badge dv-badge--success" data-streak></span><span class="dv-badge dv-badge--accent" data-longest></span></div>
        <div class="xp-panel xp-rel" style="overflow:auto"><div class="xp-tip" data-tip hidden></div><div data-grid style="display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,12px);gap:3px;width:max-content"></div><div class="dv-row" style="margin-top:10px;font-size:11px;--gap:4px"><span class="dv-muted">Less</span>${[0, 1, 2, 3, 4].map((l) => `<span style="width:12px;height:12px;border-radius:2px;background:${l ? `color-mix(in srgb,var(--dv-success) ${l * 25}%,var(--dv-surface-strong))` : "var(--dv-surface-strong)"}"></span>`).join("")}<span class="dv-muted">More</span></div></div>`,
      setup(root, ctx) {
        const render = () => {
          const year = Number(ctx.$("[data-year]").value || 2026);
          const r = DEVL_XP.rng(year);
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
          ctx.$("[data-total]").textContent = `${valid.reduce((s, x) => s + x.n, 0)} contributions`;
          ctx.$("[data-streak]").textContent = `Current streak ${current}d`;
          ctx.$("[data-longest]").textContent = `Longest ${longest}d`;
          ctx.$("[data-grid]").innerHTML = days.map((x, i) => {
            const lvl = !x.in ? -1 : x.n === 0 ? 0 : x.n < 3 ? 1 : x.n < 6 ? 2 : x.n < 9 ? 3 : 4;
            return `<span data-i="${i}" data-n="${x.n}" data-d="${DEVL_XP.iso(x.d)}" style="width:12px;height:12px;border-radius:2px;background:${lvl < 0 ? "transparent" : lvl ? `color-mix(in srgb,var(--dv-success) ${lvl * 25}%,var(--dv-surface-strong))` : "var(--dv-surface-strong)"}"></span>`;
          }).join("");
        };
        const tipEl = ctx.$("[data-tip]");
        ctx.on(ctx.$("[data-grid]"), "pointermove", (e) => {
          const s = e.target.closest("[data-i]");
          if (!s || s.style.background === "transparent") return (tipEl.hidden = true);
          DEVL_XP.chart.tip(tipEl, e, `<strong>${s.dataset.n} contributions</strong> on ${new Date(s.dataset.d + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        });
        ctx.on(ctx.$("[data-grid]"), "pointerleave", () => (tipEl.hidden = true));
        ctx.on(ctx.$("[data-year]"), "dv-change", render);
        render();
      }
    },

    recurring: {
      html: `
        ${head("Calendars · recurring.tsx", "Recurring event", "Build a recurrence rule (frequency, interval, weekdays, end condition) and see a plain-English summary plus the next occurrences.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div class="xp-panel dv-stack" data-form>
            <label class="dv-field"><span class="dv-label">Starts</span><input type="date" class="dv-input" data-start /></label>
            <div class="dv-row"><span class="dv-label">Every</span><div class="dv-number"><button type="button" data-step="-1" aria-label="Less">−</button><input type="number" min="1" max="30" value="1" data-int aria-label="Interval" /><button type="button" data-step="1" aria-label="More">+</button></div><select class="dv-select" style="width:auto" data-freq aria-label="Frequency"><option value="day">day(s)</option><option value="week" selected>week(s)</option><option value="month">month(s)</option></select></div>
            <div class="dv-row" style="--gap:4px" data-days>${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => `<button type="button" class="dv-chip" data-wd="${(i + 1) % 7}" aria-pressed="${i === 0 || i === 2}">${d}</button>`).join("")}</div>
            <span class="dv-label">Ends</span>
            <label class="dv-choice"><input type="radio" class="dv-check" name="rr-end" value="never" checked /> Never</label>
            <label class="dv-choice"><input type="radio" class="dv-check" name="rr-end" value="count" /> After <input type="number" class="dv-input" style="width:70px;height:28px" min="1" value="10" data-count /> occurrences</label>
            <label class="dv-choice"><input type="radio" class="dv-check" name="rr-end" value="until" /> On <input type="date" class="dv-input" style="width:auto;height:28px" data-until /></label>
          </div>
          <div class="dv-stack"><div class="dv-alert dv-alert--info"><div><div class="dv-alert__title" data-text></div><code class="xp-mono dv-muted" style="font-size:11px" data-rrule></code></div></div><ol class="dv-timeline" data-next></ol></div>
        </div>`,
      setup(root, ctx) {
        const start = ctx.$("[data-start]");
        start.value = DEVL_XP.iso(new Date());
        ctx.$("[data-until]").value = DEVL_XP.iso(new Date(Date.now() + 60 * 864e5));
        const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
                if (end === "until" && DEVL_XP.iso(d) > until) break;
                if (end === "count" && out.length >= count) break;
                out.push(new Date(d));
              }
              d.setDate(d.getDate() + 1);
            }
          }
          const unit = n === 1 ? freq : `${n} ${freq}s`;
          const on = freq === "week" && wds.length ? ` on ${wds.sort().map((w) => names[w]).join(", ")}` : freq === "month" ? ` on day ${s.getDate()}` : "";
          const ends = end === "count" ? `, ${count} times` : end === "until" ? `, until ${until}` : "";
          ctx.$("[data-text]").textContent = `Every ${unit}${on}${ends}`;
          ctx.$("[data-rrule]").textContent = `RRULE:FREQ=${{ day: "DAILY", week: "WEEKLY", month: "MONTHLY" }[freq]};INTERVAL=${n}${freq === "week" && wds.length ? `;BYDAY=${wds.map((w) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][w]).join(",")}` : ""}${end === "count" ? `;COUNT=${count}` : end === "until" ? `;UNTIL=${until.replace(/-/g, "")}` : ""}`;
          ctx.$("[data-next]").innerHTML = out.map((d, i) => `<li style="--c:${i ? "var(--dv-fg-subtle)" : "var(--xp-accent)"}">${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>`).join("") || '<li class="dv-muted">No occurrences.</li>';
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
        ${head("Calendars · holidays.tsx", "Holidays & PTO", "Request time off: business days are counted (weekends excluded), deducted from your balance and shown on the team strip.")}
        <div class="dv-grid" style="--min:180px"><div class="dv-stat"><span class="dv-eyebrow">Vacation balance</span><span class="dv-stat__value" data-bal></span></div><div class="dv-stat"><span class="dv-eyebrow">Pending</span><span class="dv-stat__value" data-pend></span></div></div>
        <form class="xp-panel dv-row" data-form><label class="dv-field"><span class="dv-label">From</span><input type="date" class="dv-input" data-from required /></label><label class="dv-field"><span class="dv-label">To</span><input type="date" class="dv-input" data-to required /></label><label class="dv-field"><span class="dv-label">Type</span><select class="dv-select" data-type><option>Vacation</option><option>Sick</option><option>Personal</option></select></label><span class="dv-muted" data-days style="align-self:flex-end;padding-bottom:8px"></span><button type="submit" class="dv-btn dv-btn--primary" style="align-self:flex-end">Request</button></form>
        <ul class="dv-list" data-list></ul>
        <div class="xp-panel"><span class="dv-eyebrow">Team availability · next 14 days</span><div data-strip class="dv-stack" style="margin-top:10px;--gap:4px"></div></div>`,
      setup(root, ctx) {
        let balance = 15;
        const reqs = [{ who: "Ana", from: DEVL_XP.iso(new Date(Date.now() + 3 * 864e5)), to: DEVL_XP.iso(new Date(Date.now() + 5 * 864e5)), type: "Vacation", days: 3, state: "Approved" }];
        const bizDays = (a, b) => {
          let n = 0;
          for (let d = new Date(a + "T00:00"); d <= new Date(b + "T00:00"); d.setDate(d.getDate() + 1)) if (d.getDay() % 6) n++;
          return n;
        };
        const from = ctx.$("[data-from]");
        const to = ctx.$("[data-to]");
        from.value = DEVL_XP.iso(new Date(Date.now() + 7 * 864e5));
        to.value = DEVL_XP.iso(new Date(Date.now() + 9 * 864e5));
        const render = () => {
          const mine = reqs.filter((r) => r.who === "You");
          ctx.$("[data-bal]").textContent = `${balance - mine.filter((r) => r.type === "Vacation" && r.state !== "Rejected").reduce((s, r) => s + r.days, 0)} days`;
          ctx.$("[data-pend]").textContent = String(mine.filter((r) => r.state === "Pending").length);
          ctx.$("[data-days]").textContent = from.value && to.value && from.value <= to.value ? `${bizDays(from.value, to.value)} business days` : "";
          ctx.$("[data-list]").innerHTML = reqs.map((r, i) => `<li><span class="dv-avatar dv-avatar--sm">${r.who[0]}</span><div style="flex:1"><div class="dv-list__title">${r.who} · ${r.type}</div><div class="dv-list__desc">${r.from} → ${r.to} · ${r.days} days</div></div><span class="dv-badge dv-badge--${r.state === "Approved" ? "success" : r.state === "Pending" ? "warning" : "danger"}">${r.state}</span>${r.who === "You" && r.state === "Pending" ? `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cancel="${i}">Cancel</button>` : ""}</li>`).join("");
          const people = ["You", "Ana", "Leo", "Sara"];
          ctx.$("[data-strip]").innerHTML = people.map((p) => `<div class="dv-row" style="flex-wrap:nowrap;--gap:3px"><span style="width:44px;font-size:11px">${p}</span>${Array.from({ length: 14 }, (_, k) => {
            const d = new Date(Date.now() + k * 864e5);
            const day = DEVL_XP.iso(d);
            const off = reqs.some((r) => r.who === p && r.state !== "Rejected" && day >= r.from && day <= r.to);
            return `<span title="${day}" style="flex:1;height:14px;border-radius:3px;background:${off ? "var(--dv-warning)" : d.getDay() % 6 ? "var(--dv-surface-strong)" : "transparent"}"></span>`;
          }).join("")}</div>`).join("");
        };
        ctx.on(ctx.$("[data-form]"), "input", render);
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          if (from.value > to.value) return ctx.toast({ title: "End date must be after start", variant: "warning" });
          const days = bizDays(from.value, to.value);
          if (!days) return ctx.toast({ title: "That range has no business days", variant: "warning" });
          const req = { who: "You", from: from.value, to: to.value, type: ctx.$("[data-type]").value, days, state: "Pending" };
          reqs.push(req);
          ctx.timeout(2500, () => {
            req.state = "Approved";
            ctx.toast({ title: "Time off approved 🌴", description: `${req.from} → ${req.to}` });
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
  // PROFILE
  // ==========================================================================
  const team = [["Ana López", "Design", "Design lead", "online"], ["Leo Kim", "Engineering", "Staff engineer", "busy"], ["Sara Ruiz", "Product", "PM", "away"], ["Tom Weber", "Engineering", "Frontend", "online"], ["Mia Chen", "Design", "Brand designer", "offline"], ["Noah Patel", "Engineering", "SRE", "online"], ["Lucía Gómez", "Marketing", "Growth", "away"], ["Omar Haddad", "Product", "Designer-PM", "online"], ["Eva Novak", "Marketing", "Content", "offline"], ["Kai Tanaka", "Engineering", "Backend", "busy"]];
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

  X.addMany("profile", {
    hero: {
      html: `
        ${head("Profile · hero.tsx", "Profile hero", "Banner, avatar and tabs. Follow toggles; “Edit bio” makes it editable in place.")}
        <div class="dv-card"><div style="height:140px;background:radial-gradient(circle at 20% 30%,var(--xp-accent),transparent 50%),radial-gradient(circle at 80% 60%,var(--dv-info),transparent 50%),var(--dv-bg-elevated)"></div>
          <div class="dv-card__body dv-stack" style="margin-top:-56px">
            <div class="dv-row" style="align-items:flex-end"><span class="dv-avatar" data-status="online" style="--_s:96px;box-shadow:0 0 0 4px var(--dv-bg-elevated)">LI</span><span class="dv-spacer"></span><button type="button" class="dv-btn" data-edit>Edit bio</button><button type="button" class="dv-btn dv-btn--primary" data-follow aria-pressed="false">Follow</button></div>
            <div><h3 class="xp-title" style="margin:0">Luis Islas</h3><span class="dv-muted">@luis · CDMX · <span data-f>842</span> followers</span></div>
            <p data-bio style="max-width:620px;line-height:1.6">Building calm, zero-dependency interfaces. Currently: devl-ui.</p>
            <dv-tabs><div class="dv-tabs__list"><button class="dv-tabs__tab" data-tab="o">Overview</button><button class="dv-tabs__tab" data-tab="p">Projects</button><button class="dv-tabs__tab" data-tab="a">Activity</button></div>
              <div class="dv-tabs__panel" data-panel="o"><div class="dv-grid" style="--min:150px"><div class="dv-stat"><span class="dv-eyebrow">Projects</span><span class="dv-stat__value">12</span></div><div class="dv-stat"><span class="dv-eyebrow">Stars</span><span class="dv-stat__value">3.4k</span></div><div class="dv-stat"><span class="dv-eyebrow">Streak</span><span class="dv-stat__value">41d</span></div></div></div>
              <div class="dv-tabs__panel" data-panel="p"><ul class="dv-list"><li>devl-ui <span class="dv-list__end dv-badge">★ 2.1k</span></li><li>devl-scratchpad <span class="dv-list__end dv-badge">★ 1.3k</span></li></ul></div>
              <div class="dv-tabs__panel" data-panel="a"><ol class="dv-timeline"><li>Merged #482<div class="dv-timeline__meta">2h ago</div></li><li>Released v1.3.0<div class="dv-timeline__meta">1d ago</div></li></ol></div>
            </dv-tabs>
          </div></div>`,
      setup(root, ctx) {
        let f = 842;
        ctx.on(ctx.$("[data-follow]"), "click", (e) => {
          const on = e.target.getAttribute("aria-pressed") !== "true";
          e.target.setAttribute("aria-pressed", String(on));
          e.target.textContent = on ? "Following" : "Follow";
          e.target.className = `dv-btn ${on ? "" : "dv-btn--primary"}`;
          ctx.$("[data-f]").textContent = String((f += on ? 1 : -1));
        });
        const bio = ctx.$("[data-bio]");
        ctx.on(ctx.$("[data-edit]"), "click", (e) => {
          const editing = bio.isContentEditable;
          bio.contentEditable = String(!editing);
          bio.className = editing ? "" : "xp-editor";
          e.target.textContent = editing ? "Edit bio" : "Save bio";
          if (editing) ctx.toast({ title: "Bio saved" });
          else bio.focus();
        });
      }
    },

    "hover-card": {
      html: `
        ${head("Profile · hover-card.tsx", "Hover card", "Hover (or focus) a mention: after a short delay a card appears with mutuals and a quick follow button.")}
        <div class="xp-panel xp-rel" style="line-height:2;font-size:14px" data-text>
          Thanks to ${team.slice(0, 4).map((p, i) => `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-p="${i}" style="color:var(--xp-accent);padding:0 4px;height:auto">@${p[0].split(" ")[0].toLowerCase()}</button>`).join(", ")} for reviewing the new gallery.
          <div class="dv-card" data-card hidden style="position:absolute;z-index:5;width:280px;box-shadow:var(--dv-shadow-lg);background:var(--dv-bg-elevated)"><div class="dv-card__body dv-stack" style="--gap:8px;line-height:1.5;font-size:12px"></div></div>
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
          body.innerHTML = `<div class="dv-row"><span class="dv-avatar" data-status="${status}">${initials(name)}</span><div><strong></strong><div class="dv-muted"></div></div></div><div class="dv-muted">${3 + Number(btn.dataset.p) * 4} mutual connections</div><button type="button" class="dv-btn dv-btn--sm ${following.has(name) ? "" : "dv-btn--primary"}" data-follow>${following.has(name) ? "Following" : "Follow"}</button>`;
          body.querySelector("strong").textContent = name;
          body.querySelector(".dv-muted").textContent = `${role} · ${dept}`;
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
        ${head("Profile · team-grid.tsx", "Team grid", "Filter by department or name; click a person to open their details in a drawer.")}
        <div class="dv-row"><input class="dv-input xp-search" data-q placeholder="Search people…" aria-label="Search" /><div class="dv-row" style="--gap:6px" data-deps></div></div>
        <div class="dv-grid" style="--min:180px" data-grid></div>
        <dialog class="dv-dialog dv-dialog--drawer" id="tg-drawer"><button type="button" class="dv-btn dv-btn--subtle dv-btn--icon dv-btn--sm dv-dialog__close" data-dv-close aria-label="Close">✕</button><div class="dv-dialog__body dv-stack" data-detail style="padding-top:28px"></div></dialog>`,
      setup(root, ctx) {
        const deps = ["All", ...new Set(team.map((t) => t[1]))];
        let dep = "All";
        ctx.$("[data-deps]").innerHTML = deps.map((d) => `<button type="button" class="dv-chip" data-d="${d}" aria-pressed="${d === "All"}">${d}</button>`).join("");
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-grid]").innerHTML = team
            .map((p, i) => [p, i])
            .filter(([p]) => (dep === "All" || p[1] === dep) && p[0].toLowerCase().includes(q))
            .map(([p, i]) => `<button type="button" class="dv-card dv-card--interactive" data-i="${i}" style="padding:18px;text-align:center;color:inherit;font:inherit;cursor:pointer"><span class="dv-avatar dv-avatar--lg" data-status="${p[3]}" style="margin:0 auto">${initials(p[0])}</span><div style="margin-top:10px"><strong>${p[0]}</strong></div><div class="dv-muted" style="font-size:11px">${p[2]}</div><span class="dv-badge" style="margin-top:8px">${p[1]}</span></button>`)
            .join("") || '<div class="dv-empty"><div class="dv-empty__title">No one matches</div></div>';
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
          ctx.$("[data-detail]").innerHTML = `<span class="dv-avatar" data-status="${status}" style="--_s:72px">${initials(name)}</span><h3 class="xp-title" style="margin:0">${name}</h3><span class="dv-muted">${role} · ${d}</span><dl class="xp-kv"><dt>Email</dt><dd>${name.split(" ")[0].toLowerCase()}@acme.dev</dd><dt>Status</dt><dd>${status}</dd><dt>Local time</dt><dd>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd></dl><div class="dv-row"><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-dv-close>Message</button><button type="button" class="dv-btn dv-btn--sm" data-dv-close>Close</button></div>`;
          ctx.$("#tg-drawer").showModal();
        });
        render();
      }
    },

    directory: {
      html: `
        ${head("Profile · directory.tsx", "Contact directory", "Alphabetical list with a letter index, search and favourites; select a contact to see details.")}
        <div class="xp-split" style="--cols:320px minmax(0,1fr)">
          <div class="xp-pane dv-stack" style="--gap:8px"><input class="dv-input" data-q placeholder="Search contacts…" aria-label="Search" /><div class="dv-row" style="--gap:2px" data-letters></div><div class="xp-scroll" style="--max:360px" data-list></div></div>
          <div class="xp-pane" data-detail><div class="dv-empty"><div class="dv-empty__title">Select a contact</div></div></div>
        </div>`,
      setup(root, ctx) {
        const people = team.map((t) => t[0]).concat(["Ben Carter", "Iris Moreau", "Zoe Adams", "Hugo Silva", "Pablo Ortiz"]).sort((a, b) => a.split(" ")[1].localeCompare(b.split(" ")[1]));
        const favs = new Set(["Ana López"]);
        let sel = null;
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          const rows = people.filter((p) => p.toLowerCase().includes(q));
          const letters = [...new Set(rows.map((p) => p.split(" ")[1][0]))];
          ctx.$("[data-letters]").innerHTML = letters.map((l) => `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-l="${l}" style="padding:0 6px">${l}</button>`).join("");
          ctx.$("[data-list]").innerHTML = letters.map((l) => `<div class="dv-eyebrow" id="dir-${l}" style="margin:10px 0 4px">${l}</div><ul class="dv-list">${rows.filter((p) => p.split(" ")[1][0] === l).map((p) => `<li class="xp-select-item" data-p="${p}" aria-selected="${p === sel}"><span class="dv-avatar dv-avatar--sm">${initials(p)}</span><span style="flex:1">${p}</span><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-fav="${p}" aria-label="Favourite" aria-pressed="${favs.has(p)}">${favs.has(p) ? "★" : "☆"}</button></li>`).join("")}</ul>`).join("") || '<p class="dv-muted">No contacts.</p>';
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
          const info = team.find((t) => t[0] === sel) || [sel, "External", "Partner", "offline"];
          ctx.$("[data-detail]").innerHTML = `<div class="dv-stack"><span class="dv-avatar dv-avatar--lg" data-status="${info[3]}">${initials(sel)}</span><h3 class="xp-title" style="margin:0">${sel}${favs.has(sel) ? " ★" : ""}</h3><span class="dv-muted">${info[2]} · ${info[1]}</span><dl class="xp-kv"><dt>Email</dt><dd>${sel.split(" ")[0].toLowerCase()}@acme.dev</dd><dt>Phone</dt><dd>+52 55 ${String(sel.length * 731).padStart(4, "0")} 1200</dd></dl><div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-dv-copy="${sel.split(" ")[0].toLowerCase()}@acme.dev">Copy email</button></div></div>`;
          render();
        });
        render();
      }
    },

    "compact-card": {
      html: `
        ${head("Profile · compact-card.tsx", "Compact user card", "Set your status from the menu and add a custom message with an emoji and an auto-clear time.")}
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(360px,100%)"><div class="dv-card__body dv-stack">
          <div class="dv-row"><span class="dv-avatar" data-avatar data-status="online">LI</span><div style="flex:1"><strong>Luis Islas</strong><div class="dv-muted" style="font-size:11px" data-msg>No status message</div></div>
            <dv-menu align="end" data-menu><button type="button" class="dv-btn dv-btn--sm" data-dv-trigger><span data-label>Online</span> ▾</button><div class="dv-menu__list"><button type="button" class="dv-menu__item" data-value="online"><span class="dv-dot dv-dot--success"></span> Online</button><button type="button" class="dv-menu__item" data-value="away"><span class="dv-dot dv-dot--warning"></span> Away</button><button type="button" class="dv-menu__item" data-value="busy"><span class="dv-dot dv-dot--danger"></span> Do not disturb</button><button type="button" class="dv-menu__item" data-value="offline"><span class="dv-dot"></span> Invisible</button></div></dv-menu></div>
          <form class="dv-row" data-form style="flex-wrap:nowrap"><select class="dv-select" style="width:64px" data-emoji aria-label="Emoji"><option>💬</option><option>🌴</option><option>🎧</option><option>🍕</option><option>🤒</option></select><input class="dv-input" data-text placeholder="What's your status?" maxlength="40" aria-label="Status message" /><select class="dv-select" style="width:auto" data-clear aria-label="Clear after"><option value="0">Don't clear</option><option value="10">10 s</option><option value="60">1 min</option></select><button type="submit" class="dv-btn dv-btn--sm">Set</button></form>
        </div></div></div>`,
      setup(root, ctx) {
        const labels = { online: "Online", away: "Away", busy: "Do not disturb", offline: "Invisible" };
        let clearTimer = 0;
        ctx.on(ctx.$("[data-menu]"), "dv-select", (e) => {
          ctx.$("[data-avatar]").dataset.status = e.detail.value;
          ctx.$("[data-label]").textContent = labels[e.detail.value];
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const text = ctx.$("[data-text]").value.trim();
          ctx.$("[data-msg]").textContent = text ? `${ctx.$("[data-emoji]").value} ${text}` : "No status message";
          clearTimeout(clearTimer);
          const secs = Number(ctx.$("[data-clear]").value);
          if (secs && text) clearTimer = setTimeout(() => (ctx.$("[data-msg]").textContent = "No status message"), secs * 1000);
        });
        ctx.onCleanup(() => clearTimeout(clearTimer));
      }
    },

    "org-chart": {
      html: `
        ${head("Profile · org-chart.tsx", "Org chart", "Collapsible reporting tree with report counts. Search highlights a person and expands their chain of command.")}
        <input class="dv-input xp-search" data-q placeholder="Find someone…" aria-label="Find someone" />
        <div class="xp-panel" data-tree style="overflow:auto"></div>`,
      setup(root, ctx) {
        const org = ["Luis Islas · CEO", [["Ana López · Design lead", [["Mia Chen · Brand", []], ["Omar Haddad · Product design", []]]], ["Leo Kim · CTO", [["Tom Weber · Frontend", []], ["Noah Patel · SRE", []], ["Kai Tanaka · Backend", []]]], ["Sara Ruiz · Head of Product", [["Lucía Gómez · Growth", [["Eva Novak · Content", []]]]]]]];
        const count = ([, kids]) => kids.reduce((s, k) => s + 1 + count(k), 0);
        const node = (n, q) => {
          const [label, kids] = n;
          const hit = q && label.toLowerCase().includes(q);
          const has = (x) => x[0].toLowerCase().includes(q) || x[1].some(has);
          const open = !q || kids.some(has);
          const tag = `<span class="dv-chip" style="color:var(--dv-fg);${hit ? "background:var(--xp-accent);color:#fff;border-color:transparent" : ""}"><span class="dv-avatar dv-avatar--sm">${initials(label)}</span> ${esc(label)}${kids.length ? ` <span class="dv-badge">${count(n)}</span>` : ""}</span>`;
          return kids.length ? `<details${open ? " open" : ""} style="margin-left:14px"><summary style="cursor:pointer;margin:4px 0">${tag}</summary><div style="border-left:1px dashed var(--dv-border-strong);margin-left:10px">${kids.map((k) => node(k, q)).join("")}</div></details>` : `<div style="margin:4px 0 4px 28px">${tag}</div>`;
        };
        const render = () => (ctx.$("[data-tree]").innerHTML = node(org, ctx.$("[data-q]").value.trim().toLowerCase()));
        ctx.on(ctx.$("[data-q]"), "input", render);
        render();
      }
    },

    skills: {
      html: `
        ${head("Profile · skills.tsx", "Skills matrix", "Radar chart driven by the sliders; overlay the team average to compare.")}
        <div class="dv-grid" style="--min:300px;align-items:center">
          <svg viewBox="-130 -130 260 260" style="max-width:340px;margin:0 auto" data-radar></svg>
          <div class="dv-stack" data-sliders><label class="dv-choice"><input type="checkbox" role="switch" class="dv-switch" data-team /> Show team average</label></div>
        </div>`,
      setup(root, ctx) {
        const skills = [["Design", 8], ["Frontend", 9], ["Backend", 5], ["Writing", 7], ["Leadership", 6], ["Data", 4]];
        const avg = [6, 7, 7, 5, 6, 6];
        ctx.$("[data-sliders]").insertAdjacentHTML("afterbegin", skills.map(([s, v], i) => `<label class="dv-row" style="flex-wrap:nowrap"><span style="width:90px">${s}</span><input type="range" class="dv-range" min="0" max="10" value="${v}" data-i="${i}" aria-label="${s}" /><strong class="xp-mono" data-v="${i}">${v}</strong></label>`).join(""));
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
              return `<line x1="0" y1="0" x2="${lx}" y2="${ly}" stroke="currentColor" stroke-opacity="0.12"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="9" style="fill:var(--dv-fg-muted)">${s[0]}</text>`;
            }).join("") +
            (ctx.$("[data-team]").checked ? `<polygon points="${poly(avg)}" fill="var(--dv-warning)" fill-opacity="0.15" stroke="var(--dv-warning)" stroke-dasharray="4 3"/>` : "") +
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
        ${head("Profile · presence-rail.tsx", "Presence rail", "Who's online and in which voice room. Join or leave rooms, mute yourself and watch speaking indicators pulse.")}
        <div class="xp-split" style="--cols:260px minmax(0,1fr)">
          <aside class="xp-pane dv-stack" style="--gap:6px"><span class="dv-eyebrow">Online · <span data-online></span></span><div data-people class="dv-stack" style="--gap:4px"></div></aside>
          <div class="xp-pane dv-stack" data-rooms></div>
        </div>`,
      setup(root, ctx) {
        const rooms = { "Design huddle": ["Ana López", "Mia Chen"], "Eng standup": ["Leo Kim", "Noah Patel", "Tom Weber"], Lounge: [] };
        let me = null;
        let muted = false;
        let speaking = new Set();
        const render = () => {
          const online = team.filter((t) => t[3] !== "offline");
          ctx.$("[data-online]").textContent = String(online.length + 1);
          ctx.$("[data-people]").innerHTML = [["Luis Islas (you)", "", "", "online"]].concat(online).map(([n, , , s]) => `<div class="dv-row" style="--gap:8px"><span class="dv-avatar dv-avatar--sm" data-status="${s}">${initials(n)}</span><span style="font-size:12px">${n}</span></div>`).join("");
          ctx.$("[data-rooms]").innerHTML = Object.entries(rooms)
            .map(([room, ppl]) => {
              const inside = me === room;
              const list = inside ? ppl.concat("Luis Islas") : ppl;
              return `<div class="dv-card dv-card--flat" style="${inside ? "border-color:var(--xp-accent)" : ""}"><div class="dv-card__body dv-stack" style="--gap:8px;padding:14px"><div class="dv-row"><strong>🔊 ${room}</strong><span class="dv-muted">${list.length}</span><span class="dv-spacer"></span>${inside ? `<button type="button" class="dv-btn dv-btn--sm" data-mute>${muted ? "🔇 Unmute" : "🎙 Mute"}</button><button type="button" class="dv-btn dv-btn--sm dv-btn--danger" data-leave>Leave</button>` : `<button type="button" class="dv-btn dv-btn--sm" data-join="${room}">Join</button>`}</div><div class="dv-row">${list.map((p) => `<span class="dv-avatar dv-avatar--sm" style="${speaking.has(p) ? "box-shadow:0 0 0 2px var(--dv-success)" : ""}" title="${p}">${initials(p)}</span>`).join("") || '<span class="dv-muted">Empty — be the first</span>'}</div></div></div>`;
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
        ${head("Profile · introductions.tsx", "Suggested intros", "Connect sends a request (pending → connected); skip pulls in the next suggestion.")}
        <div class="dv-row"><span class="dv-badge dv-badge--accent" data-count>0 connections</span></div>
        <div class="dv-grid" style="--min:220px" data-grid></div>`,
      setup(root, ctx) {
        const pool = team.slice().reverse().map((t, i) => ({ name: t[0], role: t[2], mutual: 2 + ((i * 3) % 9), state: "new" }));
        let shown = pool.splice(0, 3);
        let connected = 0;
        const render = () => {
          ctx.$("[data-count]").textContent = `${connected} connections`;
          ctx.$("[data-grid]").innerHTML = shown.map((p, i) => `<div class="dv-card dv-card--flat"><div class="dv-card__body dv-stack" style="align-items:center;text-align:center"><span class="dv-avatar dv-avatar--lg">${initials(p.name)}</span><strong>${p.name}</strong><span class="dv-muted" style="font-size:11px">${p.role} · ${p.mutual} mutual</span><div class="dv-row">${p.state === "new" ? `<button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-c="${i}">Connect</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-s="${i}">Skip</button>` : p.state === "pending" ? '<span class="dv-badge dv-badge--warning">Pending…</span>' : '<span class="dv-badge dv-badge--success">✓ Connected</span>'}</div></div></div>`).join("") || '<div class="dv-empty"><div class="dv-empty__title">No more suggestions</div></div>';
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
        ${head("Profile · credentials.tsx", "Security credentials", "Add SSH public keys: the format is validated and a real SHA-256 fingerprint is computed in the browser.")}
        <ul class="dv-list" data-list></ul>
        <form class="xp-panel dv-stack" data-form novalidate><label class="dv-field"><span class="dv-label">Title</span><input class="dv-input" data-title-in placeholder="Work laptop" /></label><label class="dv-field"><span class="dv-label">Public key</span><textarea class="dv-textarea xp-mono" data-key placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA… you@host" style="font-size:11.5px"></textarea></label><span class="dv-error" data-err></span><button type="submit" class="dv-btn dv-btn--primary" style="align-self:flex-start">Add SSH key</button></form>`,
      setup(root, ctx) {
        const keys = [{ title: "MacBook Pro", type: "ED25519", fp: "SHA256:3Fq8o0vC1y6m1rGqk3c9lJxW0yZ2tq7e7mR9pLk4d2A", added: "2026-08-12" }];
        const render = () => (ctx.$("[data-list]").innerHTML = keys.map((k, i) => `<li><span style="font-size:20px">🔑</span><div style="flex:1;min-width:0"><div class="dv-list__title">${esc(k.title)} <span class="dv-badge">${k.type}</span></div><div class="dv-list__desc xp-mono" style="overflow:hidden;text-overflow:ellipsis">${k.fp}</div><div class="dv-list__desc">Added ${k.added}</div></div><button type="button" class="dv-btn dv-btn--sm dv-btn--danger" data-rm="${i}">Delete</button></li>`).join("") || '<li class="dv-muted">No keys.</li>');
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
          if (!m) err = "Expected “ssh-ed25519 | ssh-rsa | ecdsa-sha2-nistp256 <base64> [comment]”.";
          else {
            try {
              bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
              if (bytes.length < 32) err = "Key material is too short.";
            } catch (_) {
              err = "Key body is not valid base64.";
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
            fp = "SHA256:(needs https or localhost)";
          }
          keys.push({ title: ctx.$("[data-title-in]").value || (m[3] || "").trim() || "Untitled key", type: { "ssh-ed25519": "ED25519", "ssh-rsa": "RSA", "ecdsa-sha2-nistp256": "ECDSA" }[m[1]], fp, added: DEVL_XP.iso(new Date()) });
          e.target.reset();
          ctx.toast({ title: "SSH key added", description: fp.slice(0, 24) + "…" });
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // THREADS & COMMENTS
  // ==========================================================================
  X.addMany("threads", {
    "inline-thread": {
      html: `
        ${head("Threads · inline-thread.tsx", "Inline thread", "Nested replies to any depth, collapsible branches and live reply counts.")}
        <div class="dv-stack" data-root style="max-width:720px;width:100%"></div>
        <form class="dv-row" data-new style="max-width:720px;width:100%;flex-wrap:nowrap"><input class="dv-input" placeholder="Start a new thread…" required aria-label="New comment" /><button type="submit" class="dv-btn dv-btn--primary">Comment</button></form>`,
      setup(root, ctx) {
        let id = 0;
        const make = (who, text, replies = []) => ({ id: ++id, who, text, replies, open: true });
        const data = [make("Ana", "Should the gallery default to dark mode?", [make("Leo", "Yes — it matches the docs.", [make("Ana", "Agreed, shipping it.")]), make("Sara", "Let's respect the OS setting too.")])];
        const count = (c) => c.replies.reduce((s, r) => s + 1 + count(r), 0);
        const find = (list, n) => list.reduce((f, c) => f || (c.id === n ? c : find(c.replies, n)), null);
        const node = (c, depth) => `<div style="margin-left:${depth ? 18 : 0}px;${depth ? "border-left:1px solid var(--dv-border-strong);padding-left:12px" : ""}"><div class="dv-row" style="--gap:8px;padding:6px 0"><span class="dv-avatar dv-avatar--sm">${c.who[0]}</span><strong>${esc(c.who)}</strong><span style="flex:1">${esc(c.text)}</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-reply="${c.id}">Reply</button>${c.replies.length ? `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-toggle="${c.id}">${c.open ? "Hide" : `Show ${count(c)}`}</button>` : ""}</div><form class="dv-row" data-form="${c.id}" hidden style="flex-wrap:nowrap;margin:4px 0 8px 32px"><input class="dv-input" placeholder="Reply to ${esc(c.who)}…" required aria-label="Reply" /><button type="submit" class="dv-btn dv-btn--sm">Reply</button></form>${c.open ? c.replies.map((r) => node(r, depth + 1)).join("") : ""}</div>`;
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
          c.replies.push(make("You", e.target.querySelector("input").value));
          c.open = true;
          render();
        });
        ctx.on(ctx.$("[data-new]"), "submit", (e) => {
          e.preventDefault();
          data.push(make("You", e.target.querySelector("input").value));
          e.target.reset();
          render();
        });
        render();
      }
    },

    "side-panel": {
      html: `
        ${head("Threads · side-panel.tsx", "Side panel comments", "Select text in the document and click “Comment” to anchor a note. Clicking a highlight focuses its comment and vice versa.")}
        <div class="xp-split" style="--cols:minmax(0,1fr) 300px">
          <div class="xp-pane xp-rel"><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-add hidden style="position:absolute;z-index:3">💬 Comment</button><article data-doc style="line-height:1.9;font-size:14px;max-width:620px">
            <p>devl-ui is a <mark class="xp-mark" data-c="1">zero-dependency</mark> component library. Every component is plain HTML, CSS tokens and a light layer of custom elements.</p>
            <p>The gallery now renders functional experiments instead of static previews, and each one exposes its real source in the code drawer.</p>
          </article></div>
          <aside class="xp-pane dv-stack" data-side></aside>
        </div>`,
      setup(root, ctx) {
        const doc = ctx.$("[data-doc]");
        const add = ctx.$("[data-add]");
        let n = 1;
        const comments = { 1: { who: "Ana", text: "Let's say “no runtime dependencies” to be precise." } };
        let active = null;
        let range = null;
        const render = () => {
          ctx.$("[data-side]").innerHTML = Object.entries(comments).map(([id, c]) => `<div class="dv-card dv-card--flat" data-cid="${id}" style="padding:12px;cursor:pointer;${Number(id) === active ? "border-color:var(--xp-accent)" : ""}"><div class="dv-row" style="--gap:6px"><span class="dv-avatar dv-avatar--sm">${c.who[0]}</span><strong>${esc(c.who)}</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-resolve="${id}">Resolve</button></div><p style="margin-top:6px;font-size:12px">${esc(c.text)}</p></div>`).join("") || '<p class="dv-muted">No comments. Select text to add one.</p>';
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
            return ctx.toast({ title: "Select text within one paragraph", variant: "warning" });
          }
          comments[id] = { who: "You", text: `Comment on “${mark.textContent.slice(0, 40)}”` };
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
        ${head("Threads · comment-row.tsx", "Comment row", "Toggle reactions (counts update), add new ones from the picker, edit in place or delete with undo.")}
        <div data-list class="dv-stack" style="max-width:640px;width:100%"></div>`,
      setup(root, ctx) {
        const picker = ["👍", "🎉", "❤️", "🚀", "👀", "😂"];
        let comments = [{ who: "Ana", at: "2h", text: "The new **gallery** feels so much faster.", reacts: { "👍": [3, false], "🚀": [1, true] }, editing: false }, { who: "Leo", at: "1h", text: "Agreed. Let's ship this week.", reacts: { "🎉": [2, false] }, editing: false }];
        const render = () => {
          ctx.$("[data-list]").innerHTML = comments
            .map((c, i) => `<div class="xp-panel dv-stack" style="--gap:8px;padding:12px 14px"><div class="dv-row" style="--gap:8px"><span class="dv-avatar dv-avatar--sm">${c.who[0]}</span><strong>${c.who}</strong><span class="dv-muted">${c.at} ago</span><span class="dv-spacer"></span>${c.who === "You" || i < 2 ? `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-edit="${i}">${c.editing ? "Cancel" : "Edit"}</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-del="${i}">Delete</button>` : ""}</div>${c.editing ? `<form class="dv-stack" data-save="${i}"><textarea class="dv-textarea" style="min-height:60px">${esc(c.text)}</textarea><button type="submit" class="dv-btn dv-btn--sm dv-btn--primary" style="align-self:flex-start">Save</button></form>` : `<p data-text style="line-height:1.6"></p>`}<div class="dv-row" style="--gap:4px">${Object.entries(c.reacts).filter(([, [n]]) => n > 0).map(([e, [n, mine]]) => `<button type="button" class="dv-chip" data-r="${i}" data-e="${e}" aria-pressed="${mine}">${e} ${n}</button>`).join("")}<dv-menu><button type="button" class="dv-chip" data-dv-trigger aria-label="Add reaction">＋☺</button><div class="dv-menu__list" style="min-width:0;display:flex;gap:2px">${picker.map((e) => `<button type="button" class="dv-menu__item" data-value="${e}" style="width:auto">${e}</button>`).join("")}</div></dv-menu></div></div>`)
            .join("");
          ctx.$$("[data-text]").forEach((p, i) => {
            const c = comments.filter((x) => !x.editing)[i];
            p.innerHTML = esc(c.text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          });
          ctx.$$("[data-list] dv-menu").forEach((m, i) => m.addEventListener("dv-select", (e) => react(i, e.detail.value)));
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
            ctx.toast({ title: "Comment deleted", variant: "neutral", action: { label: "Undo", onClick: () => (comments.splice(i, 0, removed), render()) } });
          }
        });
        ctx.on(ctx.$("[data-list]"), "submit", (e) => {
          e.preventDefault();
          const c = comments[e.target.dataset.save];
          c.text = e.target.querySelector("textarea").value;
          c.editing = false;
          c.at = "just now —";
          render();
        });
        render();
      }
    },

    "mention-popover": {
      html: `
        ${head("Threads · mention-popover.tsx", "@mention popover", "Type @ followed by a name: arrow keys move, Enter or Tab inserts. Mentioned people are listed below.")}
        <div class="xp-rel" style="max-width:640px;width:100%">
          <textarea class="dv-textarea" data-text placeholder="Write a comment and @mention someone…" style="min-height:120px" aria-label="Comment"></textarea>
          <div class="dv-menu__list" data-pop hidden style="top:auto;left:12px"></div>
        </div>
        <div class="dv-row" data-mentioned><span class="dv-muted">No mentions yet.</span></div>`,
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
          pop.innerHTML = hits.map((u, i) => `<button type="button" class="dv-menu__item" data-i="${i}" style="${i === sel ? "background:var(--dv-surface-strong)" : ""}"><span class="dv-avatar dv-avatar--sm" data-status="${u.status}">${initials(u.name)}</span>${u.name}<span class="dv-nav__meta">@${u.handle}</span></button>`).join("");
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
          ctx.$("[data-mentioned]").innerHTML = found.length ? found.map((u) => `<span class="dv-chip" style="color:var(--dv-fg)"><span class="dv-avatar dv-avatar--sm" style="--_s:18px">${initials(u.name)}</span> ${u.name}</span>`).join("") : '<span class="dv-muted">No mentions yet.</span>';
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
        ${head("Threads · resolved.tsx", "Resolved thread", "Resolve collapses a thread into a one-line summary; reopen restores it. Toggle whether resolved threads are shown.")}
        <div class="dv-row"><label class="dv-choice">Show resolved <input type="checkbox" role="switch" class="dv-switch" data-show checked /></label><span class="dv-badge" data-count></span></div>
        <div class="dv-stack" data-list style="max-width:700px;width:100%"></div>`,
      setup(root, ctx) {
        const threads = [
          { title: "Button radius on mobile", msgs: [["Ana", "Should we go 10px?"], ["Leo", "9px matches tokens."], ["Ana", "OK, 9px it is."]], resolved: false },
          { title: "Toast position", msgs: [["Sara", "Bottom-right?"], ["Tom", "Yes, consistent with OS."]], resolved: true },
          { title: "Empty state copy", msgs: [["Mia", "“All caught up” feels friendlier."]], resolved: false }
        ];
        const render = () => {
          const show = ctx.$("[data-show]").checked;
          ctx.$("[data-count]").textContent = `${threads.filter((t) => !t.resolved).length} open · ${threads.filter((t) => t.resolved).length} resolved`;
          ctx.$("[data-list]").innerHTML = threads
            .map((t, i) => (t.resolved && !show ? "" : t.resolved
              ? `<div class="xp-panel dv-row" style="padding:10px 14px;opacity:.75"><span style="color:var(--dv-success)">✓</span><span style="flex:1"><strong>${esc(t.title)}</strong> <span class="dv-muted">· resolved · ${t.msgs.length} messages · last: “${esc(t.msgs[t.msgs.length - 1][1])}”</span></span><button type="button" class="dv-btn dv-btn--sm" data-reopen="${i}">Reopen</button></div>`
              : `<div class="xp-panel dv-stack" style="--gap:8px"><div class="dv-row"><strong>${esc(t.title)}</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-resolve="${i}">✓ Resolve</button></div>${t.msgs.map(([w, m]) => `<div class="dv-row" style="--gap:8px"><span class="dv-avatar dv-avatar--sm">${w[0]}</span><strong style="font-size:12px">${w}</strong><span style="font-size:12px">${esc(m)}</span></div>`).join("")}<form class="dv-row" data-reply="${i}" style="flex-wrap:nowrap"><input class="dv-input" placeholder="Reply…" required aria-label="Reply" /><button type="submit" class="dv-btn dv-btn--sm">Send</button></form></div>`))
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
          threads[e.target.dataset.reply].msgs.push(["You", e.target.querySelector("input").value]);
          render();
        });
        ctx.on(ctx.$("[data-show]"), "change", render);
        render();
      }
    },

    "compose-rich": {
      html: `
        ${head("Threads · compose-rich.tsx", "Rich composer", "Markdown toolbar wraps your selection; the Preview tab renders it safely. ⌘/Ctrl+Enter posts.")}
        <div class="dv-card" style="max-width:720px;width:100%">
          <div class="dv-card__body dv-stack">
            <div class="dv-row" style="--gap:2px">${[["b", "B", "**", "**"], ["i", "I", "_", "_"], ["c", "</>", "`", "`"], ["l", "🔗", "[", "](https://)"], ["q", "❝", "> ", ""], ["u", "• List", "- ", ""]].map(([k, l]) => `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-fmt="${k}">${esc(l)}</button>`).join("")}<span class="dv-spacer"></span><dv-segmented value="write" data-mode><button class="dv-segmented__item" value="write">Write</button><button class="dv-segmented__item" value="preview">Preview</button></dv-segmented></div>
            <textarea class="dv-textarea" data-text style="min-height:150px" aria-label="Message">**Release notes** for _v1.3_:\n- Functional gallery\n- \`dv-sparkline\` fix\n> Zero dependencies, as always.</textarea>
            <div data-preview hidden class="xp-panel" style="min-height:150px;line-height:1.7"></div>
            <div class="dv-row"><span class="dv-muted xp-mono" data-count></span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary" data-post>Post</button></div>
          </div>
        </div>
        <div class="dv-stack" data-posts style="max-width:720px;width:100%"></div>`,
      setup(root, ctx) {
        const ta = ctx.$("[data-text]");
        const fmts = { b: ["**", "**"], i: ["_", "_"], c: ["`", "`"], l: ["[", "](https://)"], q: ["> ", ""], u: ["- ", ""] };
        const md = (src) =>
          DEVL_XP.esc(src)
            .split("\n")
            .map((line) => {
              let l = line
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/_(.+?)_/g, "<em>$1</em>")
                .replace(/`(.+?)`/g, "<code>$1</code>")
                .replace(/\[(.+?)\]\((https?:\/\/[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--xp-accent)">$1</a>');
              if (/^&gt; /.test(l)) return `<blockquote style="margin:4px 0;padding-left:10px;border-left:3px solid var(--xp-accent);color:var(--dv-fg-muted)">${l.slice(5)}</blockquote>`;
              if (/^- /.test(l)) return `<div>• ${l.slice(2)}</div>`;
              return `<div>${l || "&nbsp;"}</div>`;
            })
            .join("");
        const count = () => (ctx.$("[data-count]").textContent = `${ta.value.length} chars`);
        ctx.on(ctx.$(".dv-card"), "click", (e) => {
          const b = e.target.closest("[data-fmt]");
          if (!b) return;
          const [pre, post] = fmts[b.dataset.fmt];
          const { selectionStart: s, selectionEnd: en, value } = ta;
          const lineStart = value.lastIndexOf("\n", s - 1) + 1;
          if (!post) ta.value = value.slice(0, lineStart) + pre + value.slice(lineStart);
          else ta.value = value.slice(0, s) + pre + (value.slice(s, en) || "text") + post + value.slice(en);
          ta.focus();
          ta.setSelectionRange(s + pre.length, (en === s ? s + 4 : en) + pre.length);
          count();
        });
        ctx.on(ctx.$("[data-mode]"), "dv-change", (e) => {
          const preview = e.detail.value === "preview";
          ta.hidden = preview;
          ctx.$("[data-preview]").hidden = !preview;
          if (preview) ctx.$("[data-preview]").innerHTML = md(ta.value);
        });
        const post = () => {
          if (!ta.value.trim()) return;
          ctx.$("[data-posts]").insertAdjacentHTML("afterbegin", `<div class="xp-panel"><div class="dv-row" style="--gap:8px;margin-bottom:6px"><span class="dv-avatar dv-avatar--sm">LI</span><strong>You</strong><span class="dv-muted">just now</span></div><div style="line-height:1.7">${md(ta.value)}</div></div>`);
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
  // TOURS & COACHMARKS
  // ==========================================================================
  const mockApp = `
    <div class="xp-panel xp-rel" data-app style="padding:0;overflow:hidden;min-height:340px">
      <div class="dv-row" style="padding:10px 14px;border-bottom:1px solid var(--dv-border)"><strong data-t="logo">◆ Acme</strong><input class="dv-input" style="max-width:220px" placeholder="Search…" data-t="search" aria-label="Search" /><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-t="new">+ New</button><span class="dv-avatar dv-avatar--sm" data-t="avatar">LI</span></div>
      <div class="dv-row" style="align-items:stretch;--gap:0;min-height:290px"><nav class="dv-nav" style="width:180px;padding:10px;border-right:1px solid var(--dv-border)" data-t="nav"><span class="dv-nav__item" aria-current="page">Home</span><span class="dv-nav__item">Projects</span><span class="dv-nav__item">Reports</span></nav><div style="flex:1;padding:16px" class="dv-grid"><div class="dv-stat" data-t="stat"><span class="dv-eyebrow">Revenue</span><span class="dv-stat__value">$48k</span></div><div class="dv-stat"><span class="dv-eyebrow">Users</span><span class="dv-stat__value">1.2k</span></div></div></div>
    </div>`;

  X.addMany("tours", {
    "welcome-carousel": {
      html: `
        ${head("Tours · welcome-carousel.tsx", "Welcome carousel", "What's-new slides with dots, arrows (also ←/→ when focused) and an autoplay toggle that pauses on hover.")}
        <div class="dv-card" data-car tabindex="0" style="max-width:560px;width:100%;margin:0 auto;outline:none" aria-roledescription="carousel">
          <div style="overflow:hidden"><div data-track style="display:flex;transition:transform .45s var(--dv-ease)"></div></div>
          <div class="dv-card__footer" style="justify-content:space-between"><button type="button" class="dv-btn dv-btn--sm" data-prev>←</button><div class="dv-row" style="--gap:6px" data-dots></div><button type="button" class="dv-btn dv-btn--sm" data-next>→</button></div>
        </div>
        <div class="dv-row" style="justify-content:center"><label class="dv-choice">Autoplay <input type="checkbox" role="switch" class="dv-switch" data-auto checked /></label></div>`,
      setup(root, ctx) {
        const slides = [["✦", "Welcome to devl-ui", "43 components, zero dependencies."], ["⚡", "Functional gallery", "Every experiment is real, with copyable source."], ["🎨", "Your tokens", "Change --dv-accent and everything follows."], ["⌘K", "Keyboard first", "Palettes, menus and tabs are fully keyboard driven."]];
        let i = 0;
        let hover = false;
        ctx.$("[data-track]").innerHTML = slides.map(([ic, t, d]) => `<div style="flex:0 0 100%;padding:42px 28px;text-align:center"><div style="font-size:42px">${ic}</div><h3 class="xp-title">${t}</h3><p class="dv-muted">${d}</p></div>`).join("");
        const go = (n) => {
          i = (n + slides.length) % slides.length;
          ctx.$("[data-track]").style.transform = `translateX(-${i * 100}%)`;
          ctx.$("[data-dots]").innerHTML = slides.map((_, k) => `<button type="button" data-d="${k}" aria-label="Slide ${k + 1}" aria-current="${k === i}" style="width:${k === i ? 20 : 8}px;height:8px;border-radius:4px;border:0;background:${k === i ? "var(--xp-accent)" : "var(--dv-border-strong)"};cursor:pointer;transition:width .2s"></button>`).join("");
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
        ${head("Tours · spotlight.tsx", "Spotlight tour", "A dimming mask with a cut-out moves between real UI targets; the step card follows. Esc or Skip ends the tour.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-start>▶ Start tour</button></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const steps = [["logo", "Your workspace", "Switch organisations from the logo."], ["search", "Search everything", "Find projects, people and docs instantly."], ["new", "Create", "Start a new project from here."], ["nav", "Navigate", "All sections live in the sidebar."], ["stat", "Your metrics", "Key numbers update in real time."]];
        let i = -1;
        const hole = document.createElement("div");
        hole.style.cssText = "position:absolute;z-index:6;border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.6);transition:all .35s var(--dv-ease);pointer-events:none";
        const card = document.createElement("div");
        card.className = "dv-card";
        card.style.cssText = "position:absolute;z-index:7;width:260px;box-shadow:var(--dv-shadow-lg);background:var(--dv-bg-elevated);transition:all .35s var(--dv-ease)";
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
          card.innerHTML = `<div class="dv-card__body dv-stack" style="--gap:6px;padding:14px"><span class="dv-eyebrow">Step ${i + 1} of ${steps.length}</span><strong>${title}</strong><span class="dv-muted" style="font-size:12px">${desc}</span><div class="dv-row"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-skip>Skip</button><span class="dv-spacer"></span>${i ? '<button type="button" class="dv-btn dv-btn--sm" data-back>Back</button>' : ""}<button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-go>${i === steps.length - 1 ? "Finish" : "Next"}</button></div></div>`;
          const below = r.bottom - a.top + 14;
          Object.assign(card.style, { left: `${Math.max(8, Math.min(a.width - 270, r.left - a.left))}px`, top: `${below + 170 > a.height ? r.top - a.top - 170 : below}px` });
          app.append(hole, card);
        };
        ctx.on(card, "click", (e) => {
          if (e.target.closest("[data-skip]")) return end();
          if (e.target.closest("[data-back]")) i--;
          if (e.target.closest("[data-go]")) {
            i++;
            if (i >= steps.length) ctx.toast({ title: "Tour complete 🎉" });
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
        ${head("Tours · arrow-tooltip.tsx", "Arrow tooltip", "Coachmarks with an arrow pointing at their target, shown one at a time. “Got it” moves on; reset brings them back.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-reset>Reset coachmarks</button><span class="dv-muted" data-left></span></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const marks = [["new", "Create your first project here."], ["avatar", "Your profile and settings live here."], ["stat", "Click any metric for details."]];
        let i = 0;
        const tip = document.createElement("div");
        tip.style.cssText = "position:absolute;z-index:6;width:220px;padding:12px;border-radius:10px;background:var(--xp-accent);color:#fff;font-size:12px;box-shadow:var(--dv-shadow-lg)";
        const show = () => {
          ctx.$("[data-left]").textContent = i < marks.length ? `${marks.length - i} tip${marks.length - i > 1 ? "s" : ""} left` : "All tips seen";
          if (i >= marks.length) return tip.remove();
          const [t, text] = marks[i];
          const el = app.querySelector(`[data-t="${t}"]`);
          const a = app.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          tip.innerHTML = `<span data-arrow style="position:absolute;top:-6px;width:12px;height:12px;background:var(--xp-accent);transform:rotate(45deg)"></span><div></div><div class="dv-row" style="margin-top:8px"><span style="opacity:.8">${i + 1}/${marks.length}</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-ok style="background:#fff;color:#111;border:0">Got it</button></div>`;
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
        ${head("Tours · beacon.tsx", "Beacon hint", "Pulsing hotspots mark new features. Click one to learn about it — seen beacons stop pulsing.")}
        <div class="dv-row"><span class="dv-badge dv-badge--accent" data-count></span><button type="button" class="dv-btn dv-btn--sm" data-reset>Reset</button></div>
        ${mockApp}`,
      setup(root, ctx) {
        const app = ctx.$("[data-app]");
        const beacons = [["search", "Search now understands natural language: “invoices last week”."], ["new", "New: start from 20+ templates."], ["stat", "Metrics now support custom ranges."]];
        const seen = new Set();
        const pop = document.createElement("div");
        pop.className = "dv-card";
        pop.style.cssText = "position:absolute;z-index:7;width:240px;box-shadow:var(--dv-shadow-lg);background:var(--dv-bg-elevated)";
        const render = () => {
          app.querySelectorAll("[data-beacon]").forEach((b) => b.remove());
          const a = app.getBoundingClientRect();
          beacons.forEach(([t], i) => {
            const r = app.querySelector(`[data-t="${t}"]`).getBoundingClientRect();
            const b = document.createElement("button");
            b.type = "button";
            b.dataset.beacon = String(i);
            b.setAttribute("aria-label", "What's new");
            b.className = `dv-dot dv-dot--accent${seen.has(i) ? "" : " dv-dot--pulse"}`;
            b.style.cssText = `position:absolute;z-index:5;width:14px;height:14px;border:2px solid var(--dv-bg);cursor:pointer;left:${r.right - a.left - 6}px;top:${r.top - a.top - 6}px;opacity:${seen.has(i) ? 0.45 : 1}`;
            app.appendChild(b);
          });
          ctx.$("[data-count]").textContent = `${beacons.length - seen.size} new`;
        };
        ctx.on(app, "click", (e) => {
          const b = e.target.closest("[data-beacon]");
          if (!b) {
            if (!pop.contains(e.target)) pop.remove();
            return;
          }
          const i = Number(b.dataset.beacon);
          seen.add(i);
          pop.innerHTML = `<div class="dv-card__body dv-stack" style="--gap:6px;padding:12px"><span class="dv-badge dv-badge--accent dv-badge--upper" style="align-self:flex-start">New</span><span style="font-size:12px"></span><button type="button" class="dv-btn dv-btn--sm" style="align-self:flex-end" data-close>Close</button></div>`;
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
        ${head("Tours · inline-hint.tsx", "Inline hint", "Contextual callouts with “don't show again” persisted in localStorage. Reset brings them all back.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-reset>Reset hints</button><span class="dv-muted" data-count></span></div>
        <div class="dv-stack" data-hints style="max-width:680px;width:100%"></div>`,
      setup(root, ctx) {
        const KEY = "devl-xp-hints";
        const hints = [["kbd", "info", "Pro tip", "Press ⌘K anywhere to open the command palette."], ["tokens", "accent", "Theming", "Override --dv-accent once and every component follows."], ["code", "success", "Copy code", "Every experiment has an HTML/JS tab in the code drawer (press C)."]];
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
          ctx.$("[data-count]").textContent = `${visible.length} of ${hints.length} visible`;
          ctx.$("[data-hints]").innerHTML = visible.map(([k, v, t, d]) => `<div class="dv-alert dv-alert--${v}"><div style="flex:1"><div class="dv-alert__title">${t}</div><div class="dv-alert__desc">${d}</div><label class="dv-choice" style="margin-top:8px;font-size:11px"><input type="checkbox" class="dv-check" data-forever="${k}" /> Don't show again</label></div><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-dismiss="${k}" aria-label="Dismiss">✕</button></div>`).join("") || '<div class="dv-empty"><div class="dv-empty__title">No hints</div><p class="dv-empty__desc">You dismissed them all.</p></div>';
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
        ${head("Tours · checklist.tsx", "Onboarding checklist", "Complete tasks via their actions; the progress ring fills and you get a celebration at 100%.")}
        <div class="dv-card" style="max-width:520px;width:100%;margin:0 auto"><div class="dv-card__body dv-stack">
          <div class="dv-row"><svg viewBox="0 0 44 44" width="64" height="64" data-ring><circle cx="22" cy="22" r="18" fill="none" stroke="var(--dv-surface-strong)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--xp-accent)" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 22 22)" data-arc style="transition:stroke-dasharray .4s"/><text x="22" y="26" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" style="fill:var(--dv-fg)" data-pct>0%</text></svg><div><strong>Get started with Acme</strong><div class="dv-muted" data-left></div></div></div>
          <ul class="dv-list" data-list></ul>
          <div data-done hidden class="dv-alert dv-alert--success"><div><div class="dv-alert__title">🎉 You're all set!</div><div class="dv-alert__desc">You earned the “Fast starter” badge.</div></div></div>
        </div></div>`,
      setup(root, ctx) {
        const tasks = [["Create a workspace", "Create", true], ["Invite a teammate", "Invite"], ["Connect GitHub", "Connect"], ["Create your first project", "Create"], ["Customize your theme", "Open"]].map(([t, a, d]) => ({ t, a, done: !!d }));
        const render = () => {
          const n = tasks.filter((t) => t.done).length;
          const pct = Math.round((n / tasks.length) * 100);
          ctx.$("[data-arc]").setAttribute("stroke-dasharray", `${pct} 100`);
          ctx.$("[data-pct]").textContent = `${pct}%`;
          ctx.$("[data-left]").textContent = `${tasks.length - n} of ${tasks.length} steps left`;
          ctx.$("[data-list]").innerHTML = tasks.map((t, i) => `<li><span style="width:20px;color:${t.done ? "var(--dv-success)" : "var(--dv-fg-subtle)"}">${t.done ? "✓" : "○"}</span><span style="flex:1;${t.done ? "text-decoration:line-through;color:var(--dv-fg-muted)" : ""}">${t.t}</span>${t.done ? "" : `<button type="button" class="dv-btn dv-btn--sm" data-i="${i}">${t.a}</button>`}</li>`).join("");
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
              ctx.toast({ title: "Onboarding complete 🎉" });
              const card = ctx.$(".dv-card");
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
