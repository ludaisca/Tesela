// ============================================================================
// Functional experiments — Command & Menus (9), Empty states (10), Settings (12),
// Cards (10), Modals (10)
// ============================================================================

(function () {
  "use strict";
  const X = window.DEVL_XP;
  const { head, esc, field } = X;

  const download = (name, text, type = "text/plain") => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  X.download = download;

  // ==========================================================================
  // COMMAND & MENUS
  // ==========================================================================
  X.addMany("command-menus", {
    "radial-pie-menu": {
      html: `
        ${head("Command & Menus · radial-pie-menu.tsx", "Radial pie menu", "Press and hold (or right-click) anywhere in the area, move toward a slice and release to pick it.")}
        <div class="xp-board" data-area style="cursor:crosshair;display:grid;place-items:center"><span class="dv-muted" data-hint>Hold anywhere here</span><svg data-pie width="220" height="220" viewBox="-110 -110 220 220" style="position:absolute;display:none;pointer-events:none;overflow:visible"></svg></div>
        <div class="dv-row"><span class="dv-eyebrow">Last action</span><strong data-last>—</strong></div>`,
      setup(root, ctx) {
        const area = ctx.$("[data-area]");
        const pie = ctx.$("[data-pie]");
        const items = ["Copy", "Paste", "Share", "Delete", "Rename", "Star"];
        const icons = ["⧉", "⎘", "↗", "🗑", "✎", "★"];
        let open = null;
        let active = -1;
        const draw = () => {
          const n = items.length;
          pie.innerHTML =
            items
              .map((label, i) => {
                const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
                const a1 = a0 + (Math.PI * 2) / n;
                const R = 100;
                const r = 34;
                const p = (a, rad) => `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
                const mid = (a0 + a1) / 2;
                return `<path d="M${p(a0, r)} L${p(a0, R)} A${R},${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 0 0 ${p(a0, r)} Z" fill="${i === active ? "var(--xp-accent)" : "var(--dv-bg-elevated)"}" stroke="var(--dv-border-strong)"/><text x="${Math.cos(mid) * 67}" y="${Math.sin(mid) * 67 - 2}" text-anchor="middle" font-size="16" fill="currentColor" style="fill:var(--dv-fg)">${icons[i]}</text><text x="${Math.cos(mid) * 67}" y="${Math.sin(mid) * 67 + 14}" text-anchor="middle" font-size="9" style="fill:var(--dv-fg-muted)">${label}</text>`;
              })
              .join("") + `<circle r="30" fill="var(--dv-bg)" stroke="var(--dv-border-strong)"/><text y="4" text-anchor="middle" font-size="10" style="fill:var(--dv-fg-muted)">${active >= 0 ? items[active] : "cancel"}</text>`;
        };
        const openAt = (e) => {
          const p = DEVL_XP.pointer(area, e);
          open = p;
          active = -1;
          pie.style.display = "block";
          pie.style.left = `${p.x - 110}px`;
          pie.style.top = `${p.y - 110}px`;
          ctx.$("[data-hint]").hidden = true;
          draw();
        };
        const close = () => {
          if (!open) return;
          pie.style.display = "none";
          ctx.$("[data-hint]").hidden = false;
          if (active >= 0) {
            ctx.$("[data-last]").textContent = `${icons[active]} ${items[active]}`;
            ctx.toast({ title: items[active], variant: "info", duration: 1400 });
          }
          open = null;
        };
        ctx.on(area, "pointerdown", (e) => {
          area.setPointerCapture(e.pointerId);
          openAt(e);
        });
        ctx.on(area, "contextmenu", (e) => e.preventDefault());
        ctx.on(area, "pointermove", (e) => {
          if (!open) return;
          const p = DEVL_XP.pointer(area, e);
          const dx = p.x - open.x;
          const dy = p.y - open.y;
          const n = items.length;
          const next = Math.hypot(dx, dy) < 30 ? -1 : Math.round(((Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / ((Math.PI * 2) / n)) % n;
          if (next !== active) {
            active = next;
            draw();
          }
        });
        ctx.on(area, "pointerup", close);
      }
    },

    "raycast-action-bar": {
      html: `
        ${head("Command & Menus · raycast-action-bar.tsx", "Raycast action bar", "Launcher with fuzzy search. Enter opens the selected item's sub-actions; Esc goes back. Fully keyboard driven.")}
        <div class="dv-card" style="max-width:640px;width:100%;margin:0 auto">
          <div class="dv-command__search"><span data-crumb class="dv-badge dv-badge--accent" hidden></span><input class="dv-command__input" data-q placeholder="Search apps and commands…" aria-label="Search" /></div>
          <div class="dv-command__list" data-list role="listbox" style="max-height:300px"></div>
          <div class="dv-command__footer"><span data-sel></span><span><kbd class="dv-kbd">↵</kbd> actions · <kbd class="dv-kbd">esc</kbd> back</span></div>
        </div>`,
      setup(root, ctx) {
        const items = [
          { name: "Create issue", kind: "Linear", actions: ["Create in Engineering", "Create in Design", "Copy template"] },
          { name: "Search docs", kind: "Command", actions: ["Open devl-ui docs", "Search MDN", "Search GitHub"] },
          { name: "Toggle dark mode", kind: "System", actions: ["Toggle now", "Schedule at sunset"] },
          { name: "Clipboard history", kind: "Extension", actions: ["Open", "Clear history"] },
          { name: "Figma", kind: "Application", actions: ["Open", "Open recent file", "Quit"] },
          { name: "Calculator", kind: "Extension", actions: ["Open", "Convert currency"] }
        ];
        let mode = null;
        let idx = 0;
        let rows = [];
        const input = ctx.$("[data-q]");
        const render = () => {
          const q = input.value.toLowerCase();
          rows = mode ? mode.actions.filter((a) => a.toLowerCase().includes(q)) : items.filter((i) => `${i.name} ${i.kind}`.toLowerCase().includes(q));
          idx = Math.min(idx, Math.max(0, rows.length - 1));
          ctx.$("[data-list]").innerHTML = rows.length
            ? rows.map((r, i) => `<button type="button" class="dv-command__item" role="option" aria-selected="${i === idx}" data-i="${i}">${mode ? `<span>⚡</span>${esc(r)}` : `<span class="dv-avatar dv-avatar--sm dv-avatar--square">${r.name[0]}</span>${esc(r.name)}<span class="dv-nav__meta">${r.kind}</span>`}</button>`).join("")
            : '<div class="dv-command__empty">No results</div>';
          ctx.$("[data-crumb]").hidden = !mode;
          ctx.$("[data-crumb]").textContent = mode ? mode.name : "";
          ctx.$("[data-sel]").textContent = rows[idx] ? (mode ? rows[idx] : rows[idx].name) : "";
          const sel = ctx.$('[aria-selected="true"]');
          if (sel) sel.scrollIntoView({ block: "nearest" });
        };
        const choose = () => {
          const r = rows[idx];
          if (!r) return;
          if (!mode) {
            mode = r;
            input.value = "";
            idx = 0;
            input.placeholder = `Actions for ${r.name}…`;
          } else {
            ctx.toast({ title: r, description: mode.name });
            mode = null;
            input.value = "";
            input.placeholder = "Search apps and commands…";
          }
          render();
        };
        ctx.on(input, "input", () => ((idx = 0), render()));
        ctx.on(input, "keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % Math.max(1, rows.length);
            render();
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose();
          } else if (e.key === "Escape" && mode) {
            e.preventDefault();
            mode = null;
            input.placeholder = "Search apps and commands…";
            render();
          } else if (e.key === "Backspace" && !input.value && mode) {
            mode = null;
            render();
          }
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          idx = Number(b.dataset.i);
          choose();
          input.focus();
        });
        render();
      }
    },

    "breadcrumb-dropdown-tree": {
      html: `
        ${head("Command & Menus · breadcrumb-dropdown-tree.tsx", "Breadcrumb tree menu", "Each crumb is a menu of its siblings. Jump sideways from any level or drill down from the folder view.")}
        <nav class="dv-row xp-panel" style="padding:8px;--gap:2px" data-crumbs aria-label="Path"></nav>
        <ul class="dv-list" data-children></ul>`,
      setup(root, ctx) {
        const tree = { Acme: { Engineering: { Web: { "devl-ui": {}, Gallery: {} }, API: { Auth: {}, Billing: {} } }, Design: { Tokens: {}, Icons: {} }, Marketing: { Site: {}, Blog: {} } } };
        let path = ["Acme", "Engineering", "Web"];
        const nodeAt = (p) => p.reduce((n, k) => n[k], tree);
        const render = () => {
          const crumbs = ctx.$("[data-crumbs]");
          crumbs.innerHTML = "";
          path.forEach((seg, i) => {
            const siblings = Object.keys(i === 0 ? tree : nodeAt(path.slice(0, i)));
            if (i) crumbs.insertAdjacentHTML("beforeend", '<span class="dv-muted">/</span>');
            const menu = document.createElement("dv-menu");
            menu.innerHTML = `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-dv-trigger${i === path.length - 1 ? ' aria-current="page"' : ""}>${esc(seg)} ▾</button><div class="dv-menu__list">${siblings.map((s) => `<button type="button" class="dv-menu__item" data-value="${esc(s)}">${s === seg ? "✓ " : ""}${esc(s)}</button>`).join("")}</div>`;
            menu.addEventListener("dv-select", (e) => {
              const next = path.slice(0, i).concat(e.detail.value);
              let n = nodeAt(next);
              while (Object.keys(n).length && next.length < i + 1) next.push(Object.keys(n)[0]);
              path = next;
              render();
            });
            crumbs.appendChild(menu);
          });
          const kids = Object.keys(nodeAt(path));
          ctx.$("[data-children]").innerHTML = kids.length ? kids.map((k) => `<li class="xp-select-item" data-k="${esc(k)}"><span>📁</span><span style="flex:1">${esc(k)}</span><span class="dv-muted">${Object.keys(nodeAt(path)[k]).length} items ›</span></li>`).join("") : '<li class="dv-muted">📄 Empty folder — leaf reached</li>';
        };
        ctx.on(ctx.$("[data-children]"), "click", (e) => {
          const li = e.target.closest("[data-k]");
          if (!li) return;
          path = path.concat(li.dataset.k);
          render();
        });
        render();
      }
    },

    "context-menu-nested": {
      html: `
        ${head("Command & Menus · context-menu-nested.tsx", "Nested context menu", "Right-click a file (or press Shift+F10 on it). Submenus open on hover or →; check items toggle view options.")}
        <div class="xp-panel xp-rel" data-area style="min-height:320px">
          <div class="dv-grid" style="--min:140px" data-files></div>
          <div class="dv-menu__list" data-menu hidden style="position:absolute;min-width:210px"></div>
          <div class="dv-menu__list" data-sub hidden style="position:absolute;min-width:160px"></div>
        </div>`,
      setup(root, ctx) {
        const area = ctx.$("[data-area]");
        const menu = ctx.$("[data-menu]");
        const sub = ctx.$("[data-sub]");
        const folders = ["Inbox", "Archive", "Design", "Clients"];
        let files = [["Brief.pdf", "Inbox"], ["Logo.svg", "Design"], ["Q3.xlsx", "Inbox"], ["Contract.docx", "Clients"], ["Moodboard.png", "Design"]];
        const view = { grid: true, ext: true };
        let target = null;
        const renderFiles = () => {
          ctx.$("[data-files]").innerHTML = files.map(([n, f], i) => `<button type="button" class="dv-card dv-card--flat" data-f="${i}" style="padding:14px;text-align:left;cursor:context-menu;color:inherit;font:inherit"><div style="font-size:22px">📄</div><strong>${esc(view.ext ? n : n.replace(/\.\w+$/, ""))}</strong><div class="dv-muted" style="font-size:11px">${esc(f)}</div></button>`).join("");
          ctx.$("[data-files]").style.setProperty("--min", view.grid ? "140px" : "100%");
        };
        const close = () => {
          menu.hidden = true;
          sub.hidden = true;
        };
        const openAt = (x, y, i) => {
          target = i;
          menu.innerHTML = `<div class="dv-menu__label">${esc(files[i][0])}</div><button type="button" class="dv-menu__item" data-a="open">Open <kbd class="dv-kbd">↵</kbd></button><button type="button" class="dv-menu__item" data-a="dup">Duplicate <kbd class="dv-kbd">⌘D</kbd></button><button type="button" class="dv-menu__item" data-a="move">Move to <span style="margin-left:auto">▸</span></button><div class="dv-menu__sep"></div><button type="button" class="dv-menu__item" data-a="grid">${view.grid ? "✓" : "  "} Grid view</button><button type="button" class="dv-menu__item" data-a="ext">${view.ext ? "✓" : "  "} Show extensions</button><div class="dv-menu__sep"></div><button type="button" class="dv-menu__item dv-menu__item--danger" data-a="del">Delete <kbd class="dv-kbd">⌫</kbd></button>`;
          const r = area.getBoundingClientRect();
          menu.hidden = false;
          menu.style.left = `${Math.min(x, r.width - 220)}px`;
          menu.style.top = `${Math.min(y, r.height - 240)}px`;
          menu.querySelector(".dv-menu__item").focus();
        };
        const openSub = (btn) => {
          sub.innerHTML = folders.map((f) => `<button type="button" class="dv-menu__item" data-to="${f}">${f === files[target][1] ? "✓ " : ""}${f}</button>`).join("");
          sub.hidden = false;
          sub.style.left = `${menu.offsetLeft + menu.offsetWidth - 4}px`;
          sub.style.top = `${menu.offsetTop + btn.offsetTop - 5}px`;
        };
        ctx.on(area, "contextmenu", (e) => {
          const card = e.target.closest("[data-f]");
          if (!card) return close();
          e.preventDefault();
          const p = DEVL_XP.pointer(area, e);
          openAt(p.x, p.y, Number(card.dataset.f));
        });
        ctx.on(ctx.$("[data-files]"), "keydown", (e) => {
          const card = e.target.closest("[data-f]");
          if (card && ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu")) {
            e.preventDefault();
            openAt(card.offsetLeft + 20, card.offsetTop + 20, Number(card.dataset.f));
          }
        });
        ctx.on(menu, "pointerover", (e) => {
          const b = e.target.closest("[data-a]");
          if (b && b.dataset.a === "move") openSub(b);
          else if (b) sub.hidden = true;
        });
        ctx.on(menu, "keydown", (e) => {
          const items = Array.from(menu.querySelectorAll(".dv-menu__item"));
          const i = items.indexOf(document.activeElement);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
          } else if (e.key === "ArrowRight" && document.activeElement.dataset.a === "move") {
            openSub(document.activeElement);
            sub.querySelector(".dv-menu__item").focus();
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        });
        ctx.on(sub, "keydown", (e) => {
          const items = Array.from(sub.querySelectorAll(".dv-menu__item"));
          const i = items.indexOf(document.activeElement);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
          } else if (e.key === "ArrowLeft" || e.key === "Escape") {
            e.preventDefault();
            sub.hidden = true;
            menu.querySelector('[data-a="move"]').focus();
          }
        });
        ctx.on(menu, "click", (e) => {
          const b = e.target.closest("[data-a]");
          if (!b) return;
          const a = b.dataset.a;
          if (a === "move") return openSub(b);
          if (a === "open") ctx.toast({ title: `Opened ${files[target][0]}`, variant: "info" });
          if (a === "dup") files.splice(target + 1, 0, [files[target][0].replace(/(\.\w+)$/, " copy$1"), files[target][1]]);
          if (a === "del") files.splice(target, 1);
          if (a === "grid" || a === "ext") view[a] = !view[a];
          close();
          renderFiles();
        });
        ctx.on(sub, "click", (e) => {
          const b = e.target.closest("[data-to]");
          if (!b) return;
          files[target][1] = b.dataset.to;
          ctx.toast({ title: `Moved to ${b.dataset.to}` });
          close();
          renderFiles();
        });
        ctx.on(document, "pointerdown", (e) => {
          if (!menu.contains(e.target) && !sub.contains(e.target)) close();
        });
        renderFiles();
      }
    },

    "floating-slash-menu": {
      html: `
        ${head("Command & Menus · floating-slash-menu.tsx", "Floating slash menu", "Block editor: type “/” in an empty block to turn it into a heading, to-do, quote, code or divider. Enter creates a new block.")}
        <div class="xp-panel xp-rel" style="max-width:760px;width:100%;margin:0 auto">
          <div data-blocks class="dv-stack" style="--gap:4px"></div>
          <div class="dv-menu__list" data-menu hidden style="position:absolute;min-width:240px"></div>
        </div>`,
      setup(root, ctx) {
        const types = [["h1", "Heading", "Big section title"], ["todo", "To-do", "Track a task"], ["quote", "Quote", "Capture a quote"], ["code", "Code", "Monospace snippet"], ["divider", "Divider", "Visual break"], ["p", "Text", "Plain paragraph"]];
        const wrap = ctx.$("[data-blocks]");
        const menu = ctx.$("[data-menu]");
        let current = null;
        let sel = 0;
        const style = { h1: "font-family:var(--dv-font-heading);font-size:24px;font-weight:600", quote: "border-left:3px solid var(--xp-accent);padding-left:12px;font-style:italic", code: "font-family:var(--dv-font-mono);background:var(--dv-bg-elevated);padding:8px 10px;border-radius:6px", p: "", todo: "" };
        const make = (type = "p", text = "") => {
          const row = document.createElement("div");
          row.className = "dv-row";
          row.style.flexWrap = "nowrap";
          row.dataset.type = type;
          if (type === "divider") {
            row.innerHTML = '<div class="dv-divider" style="flex:1;margin:10px 0"></div>';
            return row;
          }
          row.innerHTML = `${type === "todo" ? '<input type="checkbox" class="dv-check" aria-label="Done" />' : ""}<div contenteditable="true" data-ph="Type “/” for commands" style="flex:1;outline:none;min-height:24px;padding:3px 0;${style[type]}"></div>`;
          row.lastChild.textContent = text;
          return row;
        };
        const showMenu = (edit) => {
          const q = edit.textContent.slice(1).toLowerCase();
          const hits = types.filter(([, n]) => n.toLowerCase().includes(q));
          if (!hits.length) return (menu.hidden = true);
          sel = Math.min(sel, hits.length - 1);
          menu.innerHTML = hits.map(([t, n, d], i) => `<button type="button" class="dv-menu__item" data-t="${t}" style="${i === sel ? "background:var(--dv-surface-strong)" : ""}"><strong style="width:70px">${n}</strong><span class="dv-nav__meta">${d}</span></button>`).join("");
          menu.hidden = false;
          menu.style.left = `${edit.offsetLeft}px`;
          menu.style.top = `${edit.closest(".dv-row").offsetTop + edit.offsetHeight + 24}px`;
        };
        const convert = (t) => {
          if (!current) return;
          const row = current.closest("[data-type]");
          const next = make(t);
          row.replaceWith(next);
          menu.hidden = true;
          if (t === "divider") {
            const p = make("p");
            next.after(p);
            p.lastChild.focus();
          } else next.lastChild.focus();
        };
        ctx.on(wrap, "input", (e) => {
          current = e.target.closest("[contenteditable]");
          if (current && current.textContent.startsWith("/")) showMenu(current);
          else menu.hidden = true;
        });
        ctx.on(wrap, "keydown", (e) => {
          const edit = e.target.closest("[contenteditable]");
          if (!edit) return;
          if (!menu.hidden) {
            const items = menu.querySelectorAll("[data-t]");
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
              showMenu(edit);
            } else if (e.key === "Enter") {
              e.preventDefault();
              convert(items[sel].dataset.t);
            } else if (e.key === "Escape") {
              e.preventDefault();
              menu.hidden = true;
            }
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const row = edit.closest("[data-type]");
            const next = make(row.dataset.type === "todo" ? "todo" : "p");
            row.after(next);
            next.lastChild.focus();
          } else if (e.key === "Backspace" && !edit.textContent && wrap.children.length > 1) {
            e.preventDefault();
            const row = edit.closest("[data-type]");
            const prev = row.previousElementSibling;
            row.remove();
            const target = prev && prev.querySelector("[contenteditable]");
            if (target) target.focus();
          }
        });
        ctx.on(menu, "mousedown", (e) => {
          const b = e.target.closest("[data-t]");
          if (!b) return;
          e.preventDefault();
          convert(b.dataset.t);
        });
        wrap.append(make("h1", "Launch plan"), make("p", "Type / in the empty line below."), make("todo", "Ship devl-ui gallery"), make("p"));
      }
    },

    "multi-step-omni-search": {
      html: `
        ${head("Command & Menus · multi-step-omni-search.tsx", "Multi-step omni search", "Pick a scope first (it becomes a token), then search inside it. Backspace on an empty query removes the scope.")}
        <div class="dv-card" style="max-width:720px;width:100%;margin:0 auto">
          <div class="dv-command__search"><span class="dv-chip" data-token hidden style="color:var(--dv-fg)"></span><input class="dv-command__input" data-q placeholder="Search everything, or pick a scope…" aria-label="Search" /></div>
          <div class="xp-split" style="--cols:minmax(0,1fr) 260px;border:0;border-radius:0;--h:300px"><div class="dv-command__list" data-list style="max-height:300px"></div><div class="xp-pane" data-preview><span class="dv-muted">Preview</span></div></div>
        </div>`,
      setup(root, ctx) {
        const data = {
          Issues: [["DEV-120", "Palette ranking"], ["DEV-121", "Drawer focus"], ["DEV-125", "Calendar locale"]],
          People: [["Ana López", "Design lead"], ["Leo Kim", "Engineer"], ["Sara Ruiz", "PM"]],
          Docs: [["Dialog", "Native dialog guide"], ["Tokens", "Theming with --dv-*"], ["Tables", "Sortable data tables"]]
        };
        let scope = null;
        let idx = 0;
        let rows = [];
        const input = ctx.$("[data-q]");
        const render = () => {
          const q = input.value.toLowerCase();
          if (!scope && !q) rows = Object.keys(data).map((s) => ({ scope: true, title: s, sub: `${data[s].length} items` }));
          else {
            const pools = scope ? [[scope, data[scope]]] : Object.entries(data);
            rows = pools.flatMap(([s, list]) => list.filter(([t, d]) => `${t} ${d}`.toLowerCase().includes(q)).map(([t, d]) => ({ title: t, sub: d, group: s })));
          }
          idx = Math.min(idx, Math.max(0, rows.length - 1));
          ctx.$("[data-list]").innerHTML = rows.map((r, i) => `<button type="button" class="dv-command__item" aria-selected="${i === idx}" data-i="${i}">${r.scope ? "⌕ Search in" : ""} <strong>${esc(r.title)}</strong><span class="dv-nav__meta">${esc(r.group || r.sub)}</span></button>`).join("") || '<div class="dv-command__empty">No results</div>';
          const cur = rows[idx];
          ctx.$("[data-preview]").innerHTML = cur ? `<span class="dv-eyebrow">${esc(cur.group || "Scope")}</span><h3 class="xp-title" style="font-size:18px"></h3><p class="dv-muted"></p>` : '<span class="dv-muted">No selection</span>';
          if (cur) {
            ctx.$("[data-preview] h3").textContent = cur.title;
            ctx.$("[data-preview] p").textContent = cur.sub;
          }
          ctx.$("[data-token]").hidden = !scope;
          ctx.$("[data-token]").textContent = scope ? `in: ${scope}` : "";
        };
        const choose = () => {
          const r = rows[idx];
          if (!r) return;
          if (r.scope) {
            scope = r.title;
            input.value = "";
            idx = 0;
            input.placeholder = `Search ${scope}…`;
            render();
          } else ctx.toast({ title: `Open ${r.title}`, description: r.group });
        };
        ctx.on(input, "input", () => ((idx = 0), render()));
        ctx.on(input, "keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % Math.max(1, rows.length);
            render();
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose();
          } else if (e.key === "Backspace" && !input.value && scope) {
            scope = null;
            input.placeholder = "Search everything, or pick a scope…";
            render();
          }
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          idx = Number(b.dataset.i);
          choose();
          input.focus();
        });
        render();
      }
    },

    "keyboard-chord-hud": {
      html: `
        ${head("Command & Menus · keyboard-chord-hud.tsx", "Keyboard chord HUD", "Vim-style leader chords. Press g then h / i / s, or n then i / p. The HUD shows what can follow. Press ? for the cheatsheet.")}
        <div class="xp-panel dv-stack" data-xp-keys style="align-items:center;min-height:200px;justify-content:center" tabindex="0">
          <div class="dv-row" data-hud style="min-height:40px"><span class="dv-muted">Waiting for a chord…</span></div>
          <div class="dv-row" data-next></div>
        </div>
        <div class="dv-grid" style="--min:280px;align-items:start"><div><span class="dv-eyebrow">Executed</span><ol class="dv-timeline" style="margin-top:10px" data-log></ol></div><div class="xp-panel" data-sheet hidden></div></div>`,
      setup(root, ctx) {
        const chords = { g: { h: "Go home", i: "Go to inbox", s: "Go to settings" }, n: { i: "New issue", p: "New project" }, t: { t: "Toggle theme preview" } };
        let leader = null;
        let timer = 0;
        const kbd = (k) => `<kbd class="dv-kbd" style="font-size:16px;padding:6px 10px">${k}</kbd>`;
        const reset = () => {
          leader = null;
          ctx.$("[data-hud]").innerHTML = '<span class="dv-muted">Waiting for a chord…</span>';
          ctx.$("[data-next]").innerHTML = "";
        };
        ctx.$("[data-sheet]").innerHTML = `<span class="dv-eyebrow">Cheatsheet</span><ul class="dv-list" style="margin-top:8px">${Object.entries(chords).flatMap(([l, m]) => Object.entries(m).map(([k, a]) => `<li>${kbd(l)} ${kbd(k)}<span class="dv-list__end">${a}</span></li>`)).join("")}</ul>`;
        ctx.on(document, "keydown", (e) => {
          if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
          const k = e.key.toLowerCase();
          if (k === "?") {
            ctx.$("[data-sheet]").hidden = !ctx.$("[data-sheet]").hidden;
            return;
          }
          if (!leader && chords[k]) {
            leader = k;
            ctx.$("[data-hud]").innerHTML = `${kbd(k)} <span class="dv-muted">then…</span>`;
            ctx.$("[data-next]").innerHTML = Object.entries(chords[k]).map(([n, a]) => `<span class="dv-badge dv-badge--outline">${n} · ${a}</span>`).join("");
            clearTimeout(timer);
            timer = setTimeout(reset, 1800);
          } else if (leader) {
            const action = chords[leader][k];
            clearTimeout(timer);
            if (action) {
              ctx.$("[data-hud]").innerHTML = `${kbd(leader)} ${kbd(k)} <strong style="margin-left:8px">${action}</strong>`;
              const li = document.createElement("li");
              li.style.setProperty("--c", "var(--xp-accent)");
              li.textContent = `${leader} ${k} → ${action}`;
              ctx.$("[data-log]").prepend(li);
              if (action.includes("theme")) root.style.setProperty("--xp-accent", `hsl(${Math.random() * 360} 80% 60%)`);
            } else ctx.$("[data-hud]").innerHTML = `${kbd(leader)} ${kbd(k)} <span class="dv-error" style="margin-left:8px">Unknown chord</span>`;
            leader = null;
            ctx.$("[data-next]").innerHTML = "";
            timer = setTimeout(reset, 1400);
          }
        });
        ctx.onCleanup(() => clearTimeout(timer));
      }
    },

    "dock-magnifier-bar": {
      html: `
        ${head("Command & Menus · dock-magnifier-bar.tsx", "Dock magnifier bar", "Icons scale with a gaussian falloff around the pointer. Click to launch: it bounces and gets a running indicator.")}
        <div class="xp-board" style="display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:16px">
          <div class="dv-row" data-windows style="position:absolute;top:16px;left:16px"></div>
          <div data-dock style="display:flex;align-items:flex-end;gap:8px;padding:8px 12px;border-radius:18px;border:1px solid var(--dv-border-strong);background:var(--dv-bg-glass);backdrop-filter:blur(12px);height:72px"></div>
        </div>`,
      setup(root, ctx) {
        const apps = [["Finder", "🗂"], ["Mail", "✉️"], ["Music", "🎵"], ["Photos", "🖼"], ["Notes", "📝"], ["Terminal", "⌨️"], ["Settings", "⚙️"]];
        const dock = ctx.$("[data-dock]");
        dock.innerHTML = apps.map(([n, i]) => `<button type="button" data-app="${n}" aria-label="${n}" data-dv-tooltip="${n}" style="position:relative;width:48px;height:48px;border:0;border-radius:12px;background:var(--dv-surface-strong);font-size:26px;cursor:pointer;transform-origin:bottom center;transition:transform .08s">${i}<span data-dot hidden style="position:absolute;bottom:-8px;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:var(--dv-fg)"></span></button>`).join("");
        const btns = ctx.$$("[data-app]");
        const running = new Set();
        ctx.on(dock, "pointermove", (e) => {
          btns.forEach((b) => {
            const r = b.getBoundingClientRect();
            const d = Math.abs(e.clientX - (r.left + r.width / 2));
            b.style.transform = `scale(${1 + 0.7 * Math.exp(-(d * d) / (2 * 50 * 50))})`;
          });
        });
        ctx.on(dock, "pointerleave", () => btns.forEach((b) => (b.style.transform = "")));
        ctx.on(dock, "click", (e) => {
          const b = e.target.closest("[data-app]");
          if (!b) return;
          const name = b.dataset.app;
          b.animate([{ translate: "0 0" }, { translate: "0 -22px" }, { translate: "0 0" }, { translate: "0 -10px" }, { translate: "0 0" }], { duration: 700 });
          if (running.has(name)) {
            ctx.toast({ title: `${name} focused`, variant: "neutral", duration: 1000 });
            return;
          }
          running.add(name);
          b.querySelector("[data-dot]").hidden = false;
          const w = document.createElement("span");
          w.className = "dv-chip";
          w.style.color = "var(--dv-fg)";
          w.innerHTML = `<span></span><button type="button" class="dv-chip__remove" aria-label="Quit">✕</button>`;
          w.firstChild.textContent = `${b.textContent.trim()} ${name}`;
          w.lastChild.addEventListener("click", () => {
            running.delete(name);
            b.querySelector("[data-dot]").hidden = true;
            w.remove();
          });
          ctx.$("[data-windows]").appendChild(w);
        });
      }
    },

    "tab-switcher-expose": {
      html: `
        ${head("Command & Menus · tab-switcher-expose.tsx", "Tab switcher exposé", "Open the exposé grid (button or Ctrl+.), move with arrows, Enter to switch, ✕ to close. Tabs keep most-recently-used order.")}
        <div class="xp-panel" style="padding:0;overflow:hidden" data-xp-keys>
          <div class="dv-row" style="padding:8px;border-bottom:1px solid var(--dv-border);--gap:4px;flex-wrap:nowrap;overflow:auto" data-strip></div>
          <div class="xp-pane" style="min-height:240px" data-page></div>
        </div>
        <div class="dv-row"><button type="button" class="dv-btn" data-open>⊞ Exposé</button><button type="button" class="dv-btn dv-btn--subtle" data-new>+ New tab</button></div>
        <div class="dv-grid" data-grid hidden style="--min:200px"></div>`,
      setup(root, ctx) {
        let tabs = [{ t: "devl-ui docs", c: "#6366f1" }, { t: "Pull request #482", c: "#10b981" }, { t: "Figma — Tokens", c: "#f59e0b" }, { t: "Analytics", c: "#0ea5e9" }];
        let active = 0;
        let mru = tabs.map((_, i) => i);
        let sel = 0;
        let n = 0;
        const grid = ctx.$("[data-grid]");
        const render = () => {
          ctx.$("[data-strip]").innerHTML = tabs.map((tb, i) => `<button type="button" class="dv-btn dv-btn--sm ${i === active ? "" : "dv-btn--subtle"}" data-tab="${i}" style="max-width:180px;overflow:hidden;text-overflow:ellipsis"><span class="dv-dot" style="--_c:${tb.c}"></span> ${esc(tb.t)}</button>`).join("");
          const tab = tabs[active];
          ctx.$("[data-page]").innerHTML = tab ? `<div style="height:8px;border-radius:4px;background:${tab.c};width:40%"></div><h3 class="xp-title" style="font-size:20px;margin-top:14px"></h3><p class="dv-muted">This is the content of the active tab.</p>` : '<div class="dv-empty"><div class="dv-empty__title">No tabs open</div></div>';
          if (tab) ctx.$("[data-page] h3").textContent = tab.t;
          grid.innerHTML = mru.map((i, k) => `<div class="dv-card dv-card--flat" data-pick="${i}" style="cursor:pointer;outline:${k === sel ? "2px solid var(--xp-accent)" : "none"}"><div style="height:70px;background:linear-gradient(135deg, ${tabs[i].c}, transparent)"></div><div class="dv-row" style="padding:8px 10px"><span style="flex:1;font-size:12px">${esc(tabs[i].t)}</span><button type="button" class="dv-chip__remove" data-close="${i}" aria-label="Close tab">✕</button></div></div>`).join("");
        };
        const activate = (i) => {
          active = i;
          mru = [i].concat(mru.filter((x) => x !== i));
          grid.hidden = true;
          render();
        };
        const closeTab = (i) => {
          tabs.splice(i, 1);
          mru = mru.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x));
          active = mru[0] ?? 0;
          sel = Math.min(sel, mru.length - 1);
          render();
        };
        const openExpose = () => {
          sel = mru.length > 1 ? 1 : 0;
          grid.hidden = false;
          render();
        };
        ctx.on(ctx.$("[data-strip]"), "click", (e) => {
          const b = e.target.closest("[data-tab]");
          if (b) activate(Number(b.dataset.tab));
        });
        ctx.on(grid, "click", (e) => {
          const c = e.target.closest("[data-close]");
          if (c) return closeTab(Number(c.dataset.close));
          const p = e.target.closest("[data-pick]");
          if (p) activate(Number(p.dataset.pick));
        });
        ctx.on(ctx.$("[data-open]"), "click", openExpose);
        ctx.on(ctx.$("[data-new]"), "click", () => {
          tabs.push({ t: `New tab ${++n}`, c: `hsl(${(n * 67) % 360} 70% 55%)` });
          activate(tabs.length - 1);
        });
        ctx.on(document, "keydown", (e) => {
          if (e.ctrlKey && e.key === ".") {
            e.preventDefault();
            grid.hidden ? openExpose() : (grid.hidden = true);
            return;
          }
          if (grid.hidden) return;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") sel = (sel + 1) % mru.length;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") sel = (sel - 1 + mru.length) % mru.length;
          else if (e.key === "Enter") return activate(mru[sel]);
          else return;
          e.preventDefault();
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // EMPTY STATES
  // ==========================================================================
  const empty = (icon, title, desc, actions = "") => `<div class="dv-empty"><div class="dv-empty__icon" style="font-size:20px">${icon}</div><div class="dv-empty__title">${title}</div><p class="dv-empty__desc">${desc}</p>${actions ? `<div class="dv-row" style="justify-content:center;margin-top:6px">${actions}</div>` : ""}</div>`;

  X.addMany("empty-states", {
    "inbox-zero": {
      html: `
        ${head("Empty states · inbox-zero.tsx", "Inbox zero", "Archive the remaining messages to reach inbox zero — then undo if you were too fast.")}
        <ul class="dv-list" data-list></ul>
        <div data-empty hidden>${empty("🧘", "All caught up", "Inbox zero. Enjoy the quiet — new mail will land here.", '<button type="button" class="dv-btn" data-undo>Undo last archive</button>')}</div>`,
      setup(root, ctx) {
        const msgs = ["Ana — Design review notes", "GitHub — 2 new reviews", "Stripe — Payout sent", "Leo — Lunch?"];
        const archived = [];
        const render = () => {
          ctx.$("[data-list]").innerHTML = msgs.map((m, i) => `<li><span style="flex:1">${esc(m)}</span><button type="button" class="dv-btn dv-btn--sm" data-a="${i}">Archive</button></li>`).join("");
          ctx.$("[data-list]").hidden = !msgs.length;
          ctx.$("[data-empty]").hidden = !!msgs.length;
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-a]");
          if (!b) return;
          archived.push(msgs.splice(Number(b.dataset.a), 1)[0]);
          render();
        });
        ctx.on(ctx.$("[data-undo]"), "click", () => {
          if (archived.length) msgs.push(archived.pop());
          render();
        });
        render();
      }
    },

    "no-results": {
      html: `
        ${head("Empty states · no-results.tsx", "No results", "Search the component list. When nothing matches, you get “did you mean” suggestions and a clear button.")}
        <input class="dv-input xp-search" style="max-width:360px" data-q placeholder="Try “buton” or “calender”" aria-label="Search" />
        <ul class="dv-list" data-list></ul>
        <div data-empty hidden></div>`,
      setup(root, ctx) {
        const words = ["Button", "Calendar", "Dialog", "Drawer", "Table", "Tabs", "Toast", "Tooltip", "Avatar", "Badge", "Command palette", "Dropzone"];
        const lev = (a, b) => {
          const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
          for (let j = 1; j <= b.length; j++) m[0][j] = j;
          for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          return m[a.length][b.length];
        };
        const q = ctx.$("[data-q]");
        const render = () => {
          const v = q.value.trim().toLowerCase();
          const hits = words.filter((w) => w.toLowerCase().includes(v));
          ctx.$("[data-list]").innerHTML = hits.map((w) => `<li>${esc(w)}</li>`).join("");
          ctx.$("[data-list]").hidden = !hits.length;
          const box = ctx.$("[data-empty]");
          box.hidden = !!hits.length;
          if (!hits.length) {
            const sugg = words.map((w) => [w, lev(v, w.toLowerCase())]).sort((a, b) => a[1] - b[1]).slice(0, 3);
            box.innerHTML = `<div class="dv-empty"><div class="dv-empty__icon">⌕</div><div class="dv-empty__title">No results for “<span data-term></span>”</div><p class="dv-empty__desc">Did you mean:</p><div class="dv-row" style="justify-content:center">${sugg.map(([w]) => `<button type="button" class="dv-chip" data-s="${esc(w)}">${esc(w)}</button>`).join("")}<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-clear>Clear search</button></div></div>`;
            box.querySelector("[data-term]").textContent = q.value;
          }
        };
        ctx.on(q, "input", render);
        ctx.on(ctx.$("[data-empty]"), "click", (e) => {
          const s = e.target.closest("[data-s]");
          if (s) q.value = s.dataset.s;
          if (e.target.closest("[data-clear]")) q.value = "";
          render();
          q.focus();
        });
        render();
      }
    },

    "first-project": {
      html: `
        ${head("Empty states · first-project.tsx", "First project", "Start from a template; projects appear in a grid. Delete them all to return to the first-run state.")}
        <div data-empty>${empty("✦", "Create your first project", "Projects hold designs, docs and tasks. Start blank or from a template.")}
          <div class="dv-grid" style="--min:180px;margin-top:16px" data-templates>
            ${[["Blank", "⬜"], ["Landing page", "🚀"], ["Dashboard", "📊"], ["Mobile app", "📱"]].map(([n, i]) => `<button type="button" class="dv-card dv-card--interactive" data-t="${n}" style="padding:18px;text-align:left;color:inherit;font:inherit;cursor:pointer"><div style="font-size:24px">${i}</div><strong>${n}</strong></button>`).join("")}
          </div>
        </div>
        <div data-full hidden class="dv-stack"><div class="dv-row"><strong data-count></strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-new>+ New</button></div><div class="dv-grid" style="--min:200px" data-projects></div></div>`,
      setup(root, ctx) {
        const projects = [];
        const render = () => {
          ctx.$("[data-empty]").hidden = !!projects.length;
          ctx.$("[data-full]").hidden = !projects.length;
          ctx.$("[data-count]").textContent = `${projects.length} project${projects.length === 1 ? "" : "s"}`;
          ctx.$("[data-projects]").innerHTML = projects.map((p, i) => `<div class="dv-card"><div class="dv-card__body"><span class="dv-eyebrow">${esc(p.t)}</span><strong style="display:block;margin-top:6px">${esc(p.n)}</strong><span class="dv-muted" style="font-size:11px">Created ${p.d}</span></div><div class="dv-card__footer"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-del="${i}">Delete</button></div></div>`).join("");
        };
        const create = (t) => {
          projects.push({ t, n: `${t} ${projects.length + 1}`, d: new Date().toLocaleTimeString() });
          ctx.toast({ title: `Created from “${t}”` });
          render();
        };
        ctx.on(ctx.$("[data-templates]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (b) create(b.dataset.t);
        });
        ctx.on(ctx.$("[data-new]"), "click", () => create("Blank"));
        ctx.on(ctx.$("[data-projects]"), "click", (e) => {
          const b = e.target.closest("[data-del]");
          if (!b) return;
          projects.splice(Number(b.dataset.del), 1);
          render();
        });
        render();
      }
    },

    "end-of-feed": {
      html: `
        ${head("Empty states · end-of-feed.tsx", "End of feed", "Infinite list: load more (or scroll to the sentinel) until the feed is exhausted and the end marker appears.")}
        <div class="xp-scroll xp-panel" style="--max:420px" data-scroll><ul class="dv-list" data-list></ul><div data-sentinel style="padding:16px;text-align:center"></div></div>`,
      setup(root, ctx) {
        let page = 0;
        const PAGES = 4;
        let loading = false;
        const list = ctx.$("[data-list]");
        const sentinel = ctx.$("[data-sentinel]");
        const load = () => {
          if (loading || page >= PAGES) return;
          loading = true;
          sentinel.innerHTML = '<span class="dv-spinner" role="status" aria-label="Loading"></span>';
          ctx.timeout(600, () => {
            for (let i = 0; i < 6; i++) list.insertAdjacentHTML("beforeend", `<li><span class="dv-avatar dv-avatar--sm">${"ALSM"[(page + i) % 4]}</span><div><div class="dv-list__title">Update #${page * 6 + i + 1}</div><div class="dv-list__desc">Posted ${page * 6 + i + 1}h ago</div></div></li>`);
            page++;
            loading = false;
            sentinel.innerHTML = page >= PAGES ? `<div class="dv-divider">You're all caught up · ${page * 6} updates</div><button type="button" class="dv-btn dv-btn--sm" data-top>Back to top ↑</button>` : '<button type="button" class="dv-btn dv-btn--sm" data-more>Load more</button>';
          });
        };
        ctx.on(sentinel, "click", (e) => {
          if (e.target.closest("[data-more]")) load();
          if (e.target.closest("[data-top]")) ctx.$("[data-scroll]").scrollTo({ top: 0, behavior: "smooth" });
        });
        const io = new IntersectionObserver((entries) => entries[0].isIntersecting && load(), { root: ctx.$("[data-scroll]") });
        io.observe(sentinel);
        ctx.onCleanup(() => io.disconnect());
      }
    },

    "no-team": {
      html: `
        ${head("Empty states · no-team.tsx", "No teammates", "Invite people from the empty state; the avatar stack and member list fill in. Remove everyone to see it again.")}
        <div data-empty>${empty("👥", "It's quiet in here", "Invite your team to collaborate in real time.")}</div>
        <div data-full hidden class="dv-row"><div class="dv-avatar-group" data-stack></div><span class="dv-muted" data-count></span></div>
        <form class="dv-input-group" data-form style="max-width:420px;margin:0 auto;width:100%"><input class="dv-input" type="email" required placeholder="teammate@company.com" aria-label="Email" /><button type="submit" class="dv-btn dv-btn--primary dv-btn--sm" style="margin:3px">Invite</button></form>
        <ul class="dv-list" data-list style="max-width:420px;margin:0 auto;width:100%"></ul>`,
      setup(root, ctx) {
        const team = [];
        const render = () => {
          ctx.$("[data-empty]").hidden = !!team.length;
          ctx.$("[data-full]").hidden = !team.length;
          ctx.$("[data-stack]").innerHTML = team.slice(0, 5).map((e, i) => `<span class="dv-avatar" style="--dv-accent:hsl(${i * 70} 70% 55%)">${esc(e[0].toUpperCase())}</span>`).join("");
          ctx.$("[data-count]").textContent = `${team.length} member${team.length === 1 ? "" : "s"}`;
          ctx.$("[data-list]").innerHTML = team.map((e, i) => `<li><span style="flex:1">${esc(e)}</span><span class="dv-badge dv-badge--warning">Invited</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-rm="${i}">Remove</button></li>`).join("");
        };
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const input = e.target.querySelector("input");
          if (team.includes(input.value)) return ctx.toast({ title: "Already invited", variant: "warning" });
          team.push(input.value);
          input.value = "";
          render();
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          team.splice(Number(b.dataset.rm), 1);
          render();
        });
        render();
      }
    },

    trash: {
      html: `
        ${head("Empty states · trash.tsx", "Empty trash", "Restore or permanently delete items, or empty the whole trash after confirming.")}
        <div class="dv-row"><span class="dv-muted">Items are deleted forever after 30 days.</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--danger dv-btn--sm" data-dv-open="trash-confirm" data-empty-btn>Empty trash</button></div>
        <ul class="dv-list" data-list></ul>
        <div data-empty hidden>${empty("🗑", "Trash is empty", "Deleted items will show up here for 30 days.")}</div>
        <dialog class="dv-dialog" id="trash-confirm"><div class="dv-dialog__header"><h3 class="dv-dialog__title">Empty trash?</h3><p class="dv-dialog__desc">All items will be permanently deleted.</p></div><div class="dv-dialog__footer"><button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="button" class="dv-btn dv-btn--danger" data-dv-close="yes">Delete forever</button></div></dialog>`,
      setup(root, ctx) {
        let items = [["Old logo.svg", 3], ["Q1 report.pdf", 12], ["Draft — pricing.md", 21], ["Screenshot 12.png", 28]];
        const render = () => {
          ctx.$("[data-list]").innerHTML = items.map(([n, d], i) => `<li><span style="flex:1">${esc(n)}</span><span class="dv-badge ${30 - d < 5 ? "dv-badge--danger" : ""}">${30 - d}d left</span><button type="button" class="dv-btn dv-btn--sm" data-restore="${i}">Restore</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-kill="${i}">Delete</button></li>`).join("");
          ctx.$("[data-list]").hidden = !items.length;
          ctx.$("[data-empty]").hidden = !!items.length;
          ctx.$("[data-empty-btn]").disabled = !items.length;
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const r = e.target.closest("[data-restore]");
          const k = e.target.closest("[data-kill]");
          if (r) ctx.toast({ title: `Restored ${items.splice(Number(r.dataset.restore), 1)[0][0]}` });
          if (k) items.splice(Number(k.dataset.kill), 1);
          render();
        });
        ctx.on(ctx.$("#trash-confirm"), "close", (e) => {
          if (e.target.returnValue === "yes") {
            items = [];
            render();
          }
        });
        render();
      }
    },

    404: {
      html: `
        ${head("Empty states · 404.tsx", "404", "Lost page with live page search, history back and a broken-link report form.")}
        <div class="xp-center" style="min-height:0"><div class="dv-stack" style="align-items:center;text-align:center;max-width:460px;width:100%">
          <div class="xp-num" style="font-size:96px;line-height:1;background:linear-gradient(135deg,var(--xp-accent),var(--dv-info));-webkit-background-clip:text;background-clip:text;color:transparent">404</div>
          <h3 class="xp-title">This page wandered off</h3>
          <input class="dv-input" data-q placeholder="Search pages…" aria-label="Search pages" />
          <ul class="dv-list" style="width:100%;text-align:left" data-list></ul>
          <div class="dv-row"><button type="button" class="dv-btn" data-back>← Go back</button><button type="button" class="dv-btn dv-btn--subtle" data-report>Report broken link</button></div>
          <form class="dv-stack" data-form hidden style="width:100%;text-align:left"><textarea class="dv-textarea" required placeholder="Where did you find this link?" aria-label="Details"></textarea><button type="submit" class="dv-btn dv-btn--primary">Send report</button></form>
        </div></div>`,
      setup(root, ctx) {
        const pages = ["/", "/pricing", "/docs", "/docs/components", "/blog", "/changelog", "/careers", "/contact"];
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = pages.filter((p) => p.includes(q)).slice(0, 4).map((p) => `<li class="xp-select-item" data-p="${p}"><span class="xp-mono">${p}</span><span class="dv-list__end dv-muted">→</span></li>`).join("") || '<li class="dv-muted">No pages match</li>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const li = e.target.closest("[data-p]");
          if (li) ctx.toast({ title: `Navigating to ${li.dataset.p}`, variant: "info" });
        });
        ctx.on(ctx.$("[data-back]"), "click", () => ctx.toast({ title: "history.back()", description: "Returned to the previous page", variant: "neutral" }));
        ctx.on(ctx.$("[data-report]"), "click", () => (ctx.$("[data-form]").hidden = false));
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          e.target.hidden = true;
          e.target.reset();
          ctx.toast({ title: "Thanks! We'll fix that link." });
        });
        render();
      }
    },

    maintenance: {
      html: `
        ${head("Empty states · maintenance.tsx", "Maintenance", "Live countdown to the end of the window, status updates and a notify-me subscription.")}
        <div class="xp-center" style="min-height:0"><div class="xp-panel dv-stack" style="max-width:520px;width:100%;align-items:center;text-align:center">
          <span class="dv-badge dv-badge--warning dv-badge--upper"><span class="dv-dot dv-dot--warning dv-dot--pulse"></span> Scheduled maintenance</span>
          <h3 class="xp-title">We're upgrading the database</h3>
          <div class="xp-num xp-mono" data-left>25:00</div>
          <progress class="dv-progress" max="1500" value="0" data-bar></progress>
          <ol class="dv-timeline" style="text-align:left;width:100%" data-log></ol>
          <form class="dv-input-group" data-form style="width:100%"><input class="dv-input" type="email" required placeholder="Email me when it's back" aria-label="Email" /><button type="submit" class="dv-btn dv-btn--sm" style="margin:3px">Notify me</button></form>
        </div></div>`,
      setup(root, ctx) {
        let left = 1500;
        const steps = [[1490, "Snapshot taken"], [1400, "Migrating tables (1/3)"], [1200, "Migrating tables (2/3)"], [900, "Rebuilding indexes"], [300, "Running health checks"]];
        const log = (t) => {
          const li = document.createElement("li");
          li.style.setProperty("--c", "var(--dv-success)");
          li.innerHTML = `<span></span><div class="dv-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.firstChild.textContent = t;
          ctx.$("[data-log]").prepend(li);
        };
        log("Maintenance started");
        ctx.every(100, () => {
          left = Math.max(0, left - 1);
          ctx.$("[data-left]").textContent = left ? `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}` : "Back online";
          ctx.$("[data-bar]").value = 1500 - left;
          steps.forEach((s) => {
            if (left === s[0]) log(s[1]);
          });
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "You'll be notified", description: e.target.querySelector("input").value });
          e.target.reset();
        });
      }
    },

    "no-files": {
      html: `
        ${head("Empty states · no-files.tsx", "No files", "The empty state is the dropzone. Add files (drag or click) and they're listed with sizes; remove them all to go back.")}
        <dv-dropzone multiple data-drop style="min-height:220px"><div style="font-size:28px">📂</div><strong>No files yet</strong><span>Drop files here or click to browse</span></dv-dropzone>
        <div class="dv-table-wrap" data-tablewrap hidden><table class="dv-table"><thead><tr><th>Name</th><th>Type</th><th class="is-num">Size</th><th></th></tr></thead><tbody data-rows></tbody></table></div>`,
      setup(root, ctx) {
        let files = [];
        const drop = ctx.$("[data-drop]");
        const render = () => {
          ctx.$("[data-tablewrap]").hidden = !files.length;
          drop.style.minHeight = files.length ? "90px" : "220px";
          ctx.$("[data-rows]").innerHTML = files.map((f, i) => `<tr><td>${esc(f.name)}</td><td class="dv-muted">${esc(f.type || "—")}</td><td class="is-num">${(f.size / 1024).toFixed(1)} KB</td><td class="is-num"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-rm="${i}">Remove</button></td></tr>`).join("");
          const list = drop.querySelector(".dv-dropzone__files");
          if (list) list.hidden = true;
        };
        ctx.on(drop, "dv-change", (e) => {
          files = files.concat(e.detail.files.filter((f) => !files.includes(f)));
          drop.files = [];
          render();
        });
        ctx.on(ctx.$("[data-rows]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          files.splice(Number(b.dataset.rm), 1);
          render();
        });
      }
    },

    offline: {
      html: `
        ${head("Empty states · offline.tsx", "Offline", "Toggle the simulated network (real online/offline events are honoured too). Actions queue while offline; retries back off exponentially and flush on reconnect.")}
        <div class="dv-row"><label class="dv-choice">Simulate offline <input type="checkbox" role="switch" class="dv-switch" data-off /></label><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-action>Send message</button><span class="dv-badge" data-queue>0 queued</span></div>
        <div data-online class="dv-alert dv-alert--success"><div><div class="dv-alert__title">Connected</div><div class="dv-alert__desc">All changes are synced.</div></div></div>
        <div data-offline hidden>${empty("📡", "You're offline", 'Changes are saved locally and will sync when you reconnect.', '<button type="button" class="dv-btn dv-btn--primary" data-retry>Retry now</button>')}<p class="dv-muted" style="text-align:center;margin-top:8px" data-next></p></div>`,
      setup(root, ctx) {
        let offline = !navigator.onLine;
        let queue = 0;
        let attempt = 0;
        let nextAt = 0;
        const render = () => {
          ctx.$("[data-off]").checked = offline;
          ctx.$("[data-online]").hidden = offline;
          ctx.$("[data-offline]").hidden = !offline;
          ctx.$("[data-queue]").textContent = `${queue} queued`;
        };
        const set = (v) => {
          offline = v;
          if (!offline && queue) {
            ctx.toast({ title: `Synced ${queue} queued action${queue > 1 ? "s" : ""}` });
            queue = 0;
          }
          attempt = 0;
          nextAt = Date.now() + 2000;
          render();
        };
        ctx.on(ctx.$("[data-off]"), "change", (e) => set(e.target.checked));
        ctx.on(window, "online", () => set(false));
        ctx.on(window, "offline", () => set(true));
        ctx.on(ctx.$("[data-action]"), "click", () => {
          if (offline) {
            queue++;
            ctx.toast({ title: "Queued — will send when online", variant: "warning" });
          } else ctx.toast({ title: "Message sent" });
          render();
        });
        ctx.on(ctx.$("[data-retry]"), "click", () => (nextAt = Date.now()));
        ctx.every(250, () => {
          if (!offline) return;
          const s = Math.max(0, Math.ceil((nextAt - Date.now()) / 1000));
          ctx.$("[data-next]").textContent = `Retrying in ${s}s (attempt ${attempt + 1})`;
          if (Date.now() >= nextAt) {
            attempt++;
            nextAt = Date.now() + Math.min(30000, 1000 * 2 ** attempt);
          }
        });
        render();
      }
    }
  });

  // ==========================================================================
  // SETTINGS
  // ==========================================================================
  const settingsShell = (eyebrow, title, desc, body) => `${head(`Settings · ${eyebrow}`, title, desc)}<div class="dv-stack" style="max-width:760px;width:100%">${body}</div>`;

  X.addMany("settings", {
    profile: {
      html: () => settingsShell("profile.tsx", "Profile", "Live avatar initials, username availability check and a bio character counter.", `
        <form class="xp-panel dv-stack" data-xp-form data-success="Profile saved" novalidate>
          <div class="dv-row" style="--gap:14px"><span class="dv-avatar dv-avatar--lg" data-avatar data-status="online">LI</span><div><strong data-name-echo>Luis Islas</strong><div class="dv-muted xp-mono" data-handle-echo>@luis</div></div></div>
          ${field({ name: "fullname", label: "Full name", value: "Luis Islas" })}
          <div class="dv-field"><label class="dv-label" for="pf-handle">Username</label><div class="dv-input-group"><span class="dv-input-group__addon">@</span><input class="dv-input" id="pf-handle" name="handle" value="luis" required pattern="[a-z0-9_]{3,20}" data-pattern-msg="3–20 lowercase letters, numbers or _" /><span class="dv-input-group__addon" data-avail></span></div></div>
          <div class="dv-field"><div class="dv-row" style="justify-content:space-between"><label class="dv-label" for="pf-bio">Bio</label><span class="dv-hint" data-count></span></div><textarea class="dv-textarea" id="pf-bio" name="bio" maxlength="160">Designing calm interfaces.</textarea></div>
          <div class="dv-field"><label class="dv-label" for="pf-tz">Timezone</label><select class="dv-select" id="pf-tz" name="tz"><option>America/Mexico_City</option><option>Europe/Madrid</option><option>America/New_York</option></select></div>
          <button type="submit" class="dv-btn dv-btn--primary" style="align-self:flex-start">Save profile</button>
        </form>`),
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        const taken = ["admin", "ana", "leo", "devl", "root"];
        const name = ctx.$('[name="fullname"]');
        const handle = ctx.$('[name="handle"]');
        const bio = ctx.$('[name="bio"]');
        let t = 0;
        const sync = () => {
          ctx.$("[data-avatar]").textContent = name.value.split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase() || "?";
          ctx.$("[data-name-echo]").textContent = name.value || "Unnamed";
          ctx.$("[data-handle-echo]").textContent = `@${handle.value}`;
          ctx.$("[data-count]").textContent = `${bio.value.length}/160`;
        };
        const check = () => {
          const avail = ctx.$("[data-avail]");
          avail.innerHTML = '<span class="dv-spinner" style="--size:12px"></span>';
          clearTimeout(t);
          t = setTimeout(() => {
            const ok = !taken.includes(handle.value.toLowerCase()) && /^[a-z0-9_]{3,20}$/.test(handle.value);
            avail.innerHTML = ok ? '<span style="color:var(--dv-success)">✓ available</span>' : '<span style="color:var(--dv-danger)">✕ taken</span>';
          }, 400);
        };
        ctx.onCleanup(() => clearTimeout(t));
        ctx.on(name, "input", sync);
        ctx.on(bio, "input", sync);
        ctx.on(handle, "input", () => (sync(), check()));
        sync();
        check();
      }
    },

    appearance: {
      html: settingsShell("appearance.tsx", "Appearance", "Theme applies for real; accent, density and font size update the preview card instantly.", `
        <div class="xp-panel dv-stack">
          <span class="dv-label">Theme</span><dv-segmented data-theme-ctl><button class="dv-segmented__item" value="dark">Dark</button><button class="dv-segmented__item" value="light">Light</button><button class="dv-segmented__item" value="system">System</button></dv-segmented>
          <span class="dv-label">Accent</span><div class="dv-row" data-accents>${["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#a855f7"].map((c) => `<button type="button" aria-label="${c}" data-c="${c}" style="width:26px;height:26px;border-radius:50%;border:2px solid transparent;background:${c};cursor:pointer"></button>`).join("")}<input type="color" value="#6366f1" data-custom aria-label="Custom accent" style="width:34px;height:28px;border:0;background:none" /></div>
          <span class="dv-label">Density</span><dv-segmented value="default" data-density><button class="dv-segmented__item" value="compact">Compact</button><button class="dv-segmented__item" value="default">Default</button><button class="dv-segmented__item" value="comfortable">Comfortable</button></dv-segmented>
          <span class="dv-label">Font size <strong class="xp-mono" id="ap-fs">13px</strong></span><input type="range" class="dv-range" min="11" max="17" value="13" data-fs data-dv-output="#ap-fs" data-dv-suffix="px" aria-label="Font size" />
        </div>
        <div class="dv-card" data-preview><div class="dv-card__header"><h3 class="dv-card__title">Preview</h3><p class="dv-card__desc">This card reflects your settings.</p></div><div class="dv-card__body dv-row"><button type="button" class="dv-btn dv-btn--accent">Accent button</button><span class="dv-badge dv-badge--accent">Badge</span><input type="checkbox" role="switch" class="dv-switch" checked aria-label="Switch" /></div></div>`),
      setup(root, ctx) {
        const preview = ctx.$("[data-preview]");
        const theme = ctx.$("[data-theme-ctl]");
        theme.value = DevlUI.getTheme();
        ctx.on(theme, "dv-change", (e) => {
          const v = e.detail.value;
          DevlUI.setTheme(v === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : v);
          ctx.toast({ title: `Theme: ${v}`, variant: "neutral", duration: 1200 });
        });
        const setAccent = (c) => {
          preview.style.setProperty("--dv-accent", c);
          ctx.$$("[data-c]").forEach((b) => (b.style.borderColor = b.dataset.c === c ? "var(--dv-fg)" : "transparent"));
        };
        ctx.on(ctx.$("[data-accents]"), "click", (e) => {
          const b = e.target.closest("[data-c]");
          if (b) setAccent(b.dataset.c);
        });
        ctx.on(ctx.$("[data-custom]"), "input", (e) => setAccent(e.target.value));
        ctx.on(ctx.$("[data-density]"), "dv-change", (e) => {
          const pad = { compact: "10px 14px", default: "", comfortable: "26px 28px" }[e.detail.value];
          preview.querySelectorAll(".dv-card__header, .dv-card__body").forEach((el) => (el.style.padding = pad));
        });
        ctx.on(ctx.$("[data-fs]"), "input", (e) => (preview.style.fontSize = `${e.target.value}px`));
        setAccent("#6366f1");
      }
    },

    billing: {
      html: settingsShell("billing.tsx", "Billing", "Switch plans and seats to recompute the next invoice; download past invoices as files.", `
        <div class="dv-grid" style="--min:180px" data-plans>
          ${[["Starter", 0], ["Pro", 19], ["Business", 49]].map(([n, p]) => `<label class="dv-card dv-card--flat" style="padding:14px;cursor:pointer"><div class="dv-row"><input type="radio" class="dv-check" name="plan" value="${n}" data-price="${p}"${n === "Pro" ? " checked" : ""} /><strong>${n}</strong></div><div class="xp-num" style="font-size:22px;margin-top:6px">$${p}<span class="dv-muted" style="font-size:12px">/seat/mo</span></div></label>`).join("")}
        </div>
        <div class="xp-panel dv-row"><span class="dv-label">Seats</span><div class="dv-number"><button type="button" data-step="-1" aria-label="Fewer">−</button><input type="number" min="1" max="200" value="8" data-seats aria-label="Seats" /><button type="button" data-step="1" aria-label="More">+</button></div><span class="dv-spacer"></span><span class="dv-muted">Next invoice</span><strong class="xp-num" style="font-size:22px" data-total></strong></div>
        <div class="xp-panel dv-row"><span style="font-size:22px">💳</span><div><strong>Visa •••• 4242</strong><div class="dv-muted">Expires 08/28</div></div><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm" data-update-card>Update</button></div>
        <ul class="dv-list" data-invoices></ul>`),
      setup(root, ctx) {
        const total = () => {
          const plan = ctx.$('[name="plan"]:checked');
          const seats = Math.max(1, Number(ctx.$("[data-seats]").value) || 1);
          ctx.$("[data-total]").textContent = ctx.fmt.money(Number(plan.dataset.price) * seats);
        };
        ctx.on(ctx.$("[data-plans]"), "change", () => {
          total();
          ctx.toast({ title: `Plan changed to ${ctx.$('[name="plan"]:checked').value}`, description: "Prorated on next invoice" });
        });
        ctx.on(ctx.$("[data-seats]"), "input", total);
        ctx.on(ctx.$("[data-update-card]"), "click", () => ctx.toast({ title: "Card update form would open here (PCI-safe iframe)", variant: "info" }));
        const invoices = [["INV-0091", "Sep 2026", 152], ["INV-0084", "Aug 2026", 152], ["INV-0077", "Jul 2026", 133]];
        ctx.$("[data-invoices]").innerHTML = invoices.map(([id, m, a]) => `<li><span class="xp-mono">${id}</span><span>${m}</span><span class="dv-badge dv-badge--success">Paid</span><span class="dv-list__end"><span class="xp-mono">$${a}.00</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-dl="${id}">Download</button></span></li>`).join("");
        ctx.on(ctx.$("[data-invoices]"), "click", (e) => {
          const b = e.target.closest("[data-dl]");
          if (!b) return;
          const inv = invoices.find((i) => i[0] === b.dataset.dl);
          DEVL_XP.download(`${inv[0]}.txt`, `ACME INC.\nInvoice ${inv[0]} — ${inv[1]}\nPro plan × 8 seats\nTotal: $${inv[2]}.00\nStatus: PAID\n`);
        });
        total();
      }
    },

    integrations: {
      html: settingsShell("integrations.tsx", "Integrations", "Connect (with a short handshake), disconnect and filter third-party apps.", `
        <div class="dv-row"><input class="dv-input xp-search" data-q placeholder="Filter integrations…" aria-label="Filter" /><span class="dv-spacer"></span><span class="dv-badge dv-badge--accent" data-count></span></div>
        <div class="dv-grid" style="--min:220px" data-grid></div>`),
      setup(root, ctx) {
        const apps = [["GitHub", "Sync issues & PRs", true], ["Slack", "Post notifications", true], ["Linear", "Two-way issue sync", false], ["Figma", "Embed frames", false], ["Stripe", "Billing events", false], ["Sentry", "Error alerts", false]];
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-grid]").innerHTML = apps
            .map(([n, d, on], i) => (n.toLowerCase().includes(q) ? `<div class="dv-card dv-card--flat"><div class="dv-card__body dv-stack" style="--gap:6px"><div class="dv-row"><span class="dv-avatar dv-avatar--square dv-avatar--sm">${n[0]}</span><strong>${n}</strong>${on ? '<span class="dv-badge dv-badge--success">Connected</span>' : ""}</div><span class="dv-muted" style="font-size:12px">${d}</span></div><div class="dv-card__footer">${on ? `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-off="${i}">Disconnect</button><button type="button" class="dv-btn dv-btn--sm" data-cfg="${i}">Configure</button>` : `<button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-on="${i}">Connect</button>`}</div></div>` : ""))
            .join("");
          ctx.$("[data-count]").textContent = `${apps.filter((a) => a[2]).length} connected`;
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const on = e.target.closest("[data-on]");
          const off = e.target.closest("[data-off]");
          const cfg = e.target.closest("[data-cfg]");
          if (on) {
            on.setAttribute("aria-busy", "true");
            ctx.timeout(800, () => {
              apps[on.dataset.on][2] = true;
              ctx.toast({ title: `${apps[on.dataset.on][0]} connected` });
              render();
            });
          }
          if (off) {
            apps[off.dataset.off][2] = false;
            render();
          }
          if (cfg) ctx.toast({ title: `${apps[cfg.dataset.cfg][0]} settings`, variant: "info" });
        });
        render();
      }
    },

    security: {
      html: () => settingsShell("security.tsx", "Security", "Change password, enable 2FA (confirm with any 6 digits) and revoke sessions.", `
        <form class="xp-panel dv-stack" data-xp-form data-success="Password changed" data-reset novalidate>
          <strong>Change password</strong>
          ${field({ name: "current", label: "Current password", type: "password", minlength: 8 })}
          ${field({ name: "next", label: "New password", type: "password", minlength: 8, strength: true })}
          <button type="submit" class="dv-btn dv-btn--primary" style="align-self:flex-start">Update password</button>
        </form>
        <div class="xp-panel dv-stack"><div class="dv-row"><div><strong>Two-factor authentication</strong><div class="dv-muted" data-2fa-state>Off</div></div><span class="dv-spacer"></span><input type="checkbox" role="switch" class="dv-switch" data-2fa aria-label="Two-factor" /></div><div data-2fa-setup hidden class="dv-stack"><span class="dv-muted">Enter the code from your authenticator:</span><dv-otp length="6" data-otp></dv-otp></div></div>
        <div class="dv-stack"><div class="dv-row"><strong>Active sessions</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--danger" data-all>Sign out all others</button></div><ul class="dv-list" data-sessions></ul></div>`),
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        const sw = ctx.$("[data-2fa]");
        ctx.on(sw, "change", () => {
          if (sw.checked) {
            sw.checked = false;
            ctx.$("[data-2fa-setup]").hidden = false;
            ctx.$("[data-otp] input").focus();
          } else {
            ctx.$("[data-2fa-state]").textContent = "Off";
            ctx.toast({ title: "2FA disabled", variant: "warning" });
          }
        });
        ctx.on(ctx.$("[data-otp]"), "dv-complete", () => {
          sw.checked = true;
          ctx.$("[data-2fa-setup]").hidden = true;
          ctx.$("[data-2fa-state]").textContent = "On · authenticator app";
          ctx.toast({ title: "2FA enabled" });
        });
        let sessions = [["MacBook Pro · Safari", "CDMX · now", true], ["iPhone 16 · App", "CDMX · 2h ago", false], ["Windows · Chrome", "Madrid · 3d ago", false]];
        const render = () =>
          (ctx.$("[data-sessions]").innerHTML = sessions.map(([d, w, cur], i) => `<li><div><div class="dv-list__title">${d}</div><div class="dv-list__desc">${w}</div></div><span class="dv-list__end">${cur ? '<span class="dv-badge dv-badge--success">This device</span>' : `<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-rv="${i}">Revoke</button>`}</span></li>`).join(""));
        ctx.on(ctx.$("[data-sessions]"), "click", (e) => {
          const b = e.target.closest("[data-rv]");
          if (!b) return;
          sessions.splice(Number(b.dataset.rv), 1);
          render();
        });
        ctx.on(ctx.$("[data-all]"), "click", () => {
          sessions = sessions.filter((s) => s[2]);
          ctx.toast({ title: "Signed out of all other sessions" });
          render();
        });
        render();
      }
    },

    permissions: {
      html: settingsShell("permissions.tsx", "Roles & permissions", "RBAC matrix: tick permissions per role (Owner is locked), add custom roles, then save or discard.", `
        <div class="dv-row"><form class="dv-input-group" data-add style="max-width:280px"><input class="dv-input" placeholder="New role name" required aria-label="Role name" /><button type="submit" class="dv-btn dv-btn--sm" style="margin:3px">Add role</button></form><span class="dv-spacer"></span><span class="dv-badge dv-badge--warning" data-dirty hidden></span><button type="button" class="dv-btn dv-btn--sm" data-discard>Discard</button><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-save>Save</button></div>
        <div class="dv-table-wrap"><table class="dv-table" data-matrix></table></div>`),
      setup(root, ctx) {
        const perms = ["View projects", "Edit projects", "Manage members", "Billing", "Delete workspace"];
        let saved = { Owner: [1, 1, 1, 1, 1], Admin: [1, 1, 1, 1, 0], Member: [1, 1, 0, 0, 0], Viewer: [1, 0, 0, 0, 0] };
        let draft = JSON.parse(JSON.stringify(saved));
        const render = () => {
          const roles = Object.keys(draft);
          ctx.$("[data-matrix]").innerHTML = `<thead><tr><th>Permission</th>${roles.map((r) => `<th style="text-align:center">${esc(r)}</th>`).join("")}</tr></thead><tbody>${perms.map((p, pi) => `<tr><td>${p}</td>${roles.map((r) => `<td style="text-align:center"><input type="checkbox" class="dv-check" data-r="${esc(r)}" data-p="${pi}"${draft[r][pi] ? " checked" : ""}${r === "Owner" ? " disabled" : ""} aria-label="${esc(r)} ${p}" /></td>`).join("")}</tr>`).join("")}</tbody>`;
          let changes = 0;
          roles.forEach((r) => draft[r].forEach((v, i) => (changes += !saved[r] || saved[r][i] !== v ? 1 : 0)));
          const d = ctx.$("[data-dirty]");
          d.hidden = !changes;
          d.textContent = `${changes} unsaved change${changes === 1 ? "" : "s"}`;
        };
        ctx.on(ctx.$("[data-matrix]"), "change", (e) => {
          const c = e.target;
          draft[c.dataset.r][c.dataset.p] = c.checked ? 1 : 0;
          render();
        });
        ctx.on(ctx.$("[data-add]"), "submit", (e) => {
          e.preventDefault();
          const input = e.target.querySelector("input");
          if (!draft[input.value]) draft[input.value] = [1, 0, 0, 0, 0];
          input.value = "";
          render();
        });
        ctx.on(ctx.$("[data-save]"), "click", () => {
          saved = JSON.parse(JSON.stringify(draft));
          ctx.toast({ title: "Permissions saved" });
          render();
        });
        ctx.on(ctx.$("[data-discard]"), "click", () => {
          draft = JSON.parse(JSON.stringify(saved));
          render();
        });
        render();
      }
    },

    branding: {
      html: settingsShell("branding.tsx", "Workspace branding", "Upload a logo (previewed locally), pick a brand colour and verify a custom domain via DNS.", `
        <div class="dv-grid" style="--min:280px;align-items:start">
          <div class="xp-panel dv-stack">
            <label class="dv-field"><span class="dv-label">Workspace name</span><input class="dv-input" data-name value="Acme" /></label>
            <span class="dv-label">Logo</span><div class="dv-row"><label class="dv-btn dv-btn--sm" style="cursor:pointer">Upload image<input type="file" accept="image/*" hidden data-logo /></label><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-clear>Use initials</button></div>
            <label class="dv-field"><span class="dv-label">Brand colour</span><input type="color" value="#6366f1" data-color style="width:60px;height:34px;border:0;background:none" /></label>
          </div>
          <div class="dv-card" data-preview><div class="dv-row" style="padding:12px 16px;border-bottom:1px solid var(--dv-border)" data-bar><span class="dv-avatar dv-avatar--square" data-mark>A</span><strong data-label>Acme</strong><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--accent">Sign up</button></div><div class="dv-card__body"><span class="dv-muted">Your branded login and emails use this look.</span></div></div>
        </div>
        <div class="xp-panel dv-stack"><strong>Custom domain</strong><div class="dv-row"><input class="dv-input" style="max-width:280px" data-domain value="app.acme.com" aria-label="Domain" /><button type="button" class="dv-btn dv-btn--sm" data-verify>Verify DNS</button><span data-dns></span></div><code class="xp-mono dv-muted" data-record></code></div>`),
      setup(root, ctx) {
        const preview = ctx.$("[data-preview]");
        const name = ctx.$("[data-name]");
        const mark = ctx.$("[data-mark]");
        const sync = () => {
          ctx.$("[data-label]").textContent = name.value || "Workspace";
          if (!mark.querySelector("img")) mark.textContent = (name.value || "?")[0].toUpperCase();
          ctx.$("[data-record]").textContent = `TXT _devl-verify.${ctx.$("[data-domain]").value}  "devl=${btoa(name.value || "x").slice(0, 12)}"`;
        };
        ctx.on(name, "input", sync);
        ctx.on(ctx.$("[data-domain]"), "input", sync);
        ctx.on(ctx.$("[data-color]"), "input", (e) => preview.style.setProperty("--dv-accent", e.target.value));
        ctx.on(ctx.$("[data-logo]"), "change", (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            mark.innerHTML = "";
            const img = document.createElement("img");
            img.src = reader.result;
            img.alt = "Logo";
            mark.appendChild(img);
          };
          reader.readAsDataURL(f);
        });
        ctx.on(ctx.$("[data-clear]"), "click", () => {
          mark.innerHTML = "";
          sync();
        });
        ctx.on(ctx.$("[data-verify]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(1000, () => {
            e.target.removeAttribute("aria-busy");
            const ok = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(ctx.$("[data-domain]").value) && Math.random() > 0.3;
            ctx.$("[data-dns]").innerHTML = ok ? '<span class="dv-badge dv-badge--success">Verified</span>' : '<span class="dv-badge dv-badge--warning">Record not found yet</span>';
          });
        });
        sync();
      }
    },

    localization: {
      html: settingsShell("localization.tsx", "Localization", "Language, region, currency and date style feed the real Intl APIs — the preview is exactly what users would see.", `
        <div class="dv-grid" style="--min:200px">
          <label class="dv-field"><span class="dv-label">Locale</span><select class="dv-select" data-locale><option value="en-US">English (US)</option><option value="es-MX" selected>Español (México)</option><option value="de-DE">Deutsch</option><option value="ja-JP">日本語</option><option value="ar-EG">العربية</option></select></label>
          <label class="dv-field"><span class="dv-label">Currency</span><select class="dv-select" data-cur><option>USD</option><option selected>MXN</option><option>EUR</option><option>JPY</option></select></label>
          <label class="dv-field"><span class="dv-label">Date style</span><select class="dv-select" data-date><option value="short">Short</option><option value="medium">Medium</option><option value="long" selected>Long</option><option value="full">Full</option></select></label>
          <label class="dv-field"><span class="dv-label">Time zone</span><select class="dv-select" data-tz><option>America/Mexico_City</option><option>Europe/Berlin</option><option>Asia/Tokyo</option><option>UTC</option></select></label>
        </div>
        <dl class="xp-panel xp-kv" data-out style="font-size:14px"></dl>`),
      setup(root, ctx) {
        const render = () => {
          const loc = ctx.$("[data-locale]").value;
          const cur = ctx.$("[data-cur]").value;
          const tz = ctx.$("[data-tz]").value;
          const now = new Date();
          const rows = [
            ["Date", new Intl.DateTimeFormat(loc, { dateStyle: ctx.$("[data-date]").value, timeZone: tz }).format(now)],
            ["Time", new Intl.DateTimeFormat(loc, { timeStyle: "short", timeZone: tz }).format(now)],
            ["Price", new Intl.NumberFormat(loc, { style: "currency", currency: cur }).format(1234567.891)],
            ["Number", new Intl.NumberFormat(loc).format(9876543.21)],
            ["Percent", new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 1 }).format(0.427)],
            ["Relative", new Intl.RelativeTimeFormat(loc, { numeric: "auto" }).format(-1, "day")],
            ["List", new Intl.ListFormat(loc, { type: "conjunction" }).format(["Ana", "Leo", "Sara"])],
            ["Plural", `${new Intl.PluralRules(loc).select(2)} (2 items)`]
          ];
          const out = ctx.$("[data-out]");
          out.innerHTML = "";
          out.dir = loc.startsWith("ar") ? "rtl" : "ltr";
          rows.forEach(([k, v]) => {
            const dt = document.createElement("dt");
            dt.textContent = k;
            const dd = document.createElement("dd");
            dd.textContent = v;
            out.append(dt, dd);
          });
        };
        ctx.$$("select").forEach((s) => ctx.on(s, "change", render));
        render();
      }
    },

    webhooks: {
      html: settingsShell("webhooks.tsx", "Webhooks", "Add HTTPS endpoints with event subscriptions, toggle them, reveal the signing secret and send test deliveries.", `
        <form class="xp-panel dv-stack" data-add novalidate>
          <label class="dv-field"><span class="dv-label">Endpoint URL</span><input class="dv-input xp-mono" name="url" placeholder="https://api.example.com/hooks" /><span class="dv-error" data-err></span></label>
          <div class="dv-row">${["invoice.paid", "member.added", "deploy.failed", "issue.created"].map((ev) => `<label class="dv-choice"><input type="checkbox" class="dv-check" name="ev" value="${ev}"${ev === "invoice.paid" ? " checked" : ""} /> <code>${ev}</code></label>`).join("")}</div>
          <button type="submit" class="dv-btn dv-btn--primary" style="align-self:flex-start">Add endpoint</button>
        </form>
        <ul class="dv-list" data-list></ul>
        <div><span class="dv-eyebrow">Recent deliveries</span><ul class="dv-list xp-mono" style="margin-top:8px;font-size:12px" data-log><li class="dv-muted">No deliveries yet.</li></ul></div>`),
      setup(root, ctx) {
        const hooks = [{ url: "https://api.acme.dev/hooks/devl", ev: ["invoice.paid", "deploy.failed"], on: true, secret: "whsec_9f2a…71e0", show: false }];
        const render = () => {
          ctx.$("[data-list]").innerHTML = hooks
            .map((h, i) => `<li style="flex-wrap:wrap"><input type="checkbox" role="switch" class="dv-switch" data-tg="${i}"${h.on ? " checked" : ""} aria-label="Enabled" /><div style="flex:1;min-width:200px"><div class="dv-list__title xp-mono">${esc(h.url)}</div><div class="dv-list__desc">${h.ev.map(esc).join(", ")} · secret <code>${h.show ? esc(h.secret) : "whsec_••••••"}</code></div></div><span class="dv-list__end"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-sh="${i}">${h.show ? "Hide" : "Reveal"}</button><button type="button" class="dv-btn dv-btn--sm" data-test="${i}"${h.on ? "" : " disabled"}>Send test</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-rm="${i}" aria-label="Delete">✕</button></span></li>`)
            .join("");
        };
        ctx.on(ctx.$("[data-add]"), "submit", (e) => {
          e.preventDefault();
          const f = e.target;
          const url = f.url.value.trim();
          let err = "";
          try {
            if (new URL(url).protocol !== "https:") err = "Endpoint must use https://";
          } catch (_) {
            err = "Enter a valid URL";
          }
          const ev = Array.from(f.querySelectorAll('[name="ev"]:checked'), (c) => c.value);
          if (!err && !ev.length) err = "Pick at least one event";
          ctx.$("[data-err]").textContent = err;
          f.url.setAttribute("aria-invalid", String(Boolean(err)));
          if (err) return;
          hooks.push({ url, ev, on: true, secret: `whsec_${Math.random().toString(16).slice(2, 10)}…`, show: false });
          f.reset();
          render();
        });
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const t = e.target.closest("[data-test]");
          const s = e.target.closest("[data-sh]");
          const r = e.target.closest("[data-rm]");
          if (s) hooks[s.dataset.sh].show = !hooks[s.dataset.sh].show;
          if (r) hooks.splice(Number(r.dataset.rm), 1);
          if (t) {
            const h = hooks[t.dataset.test];
            const ok = Math.random() > 0.2;
            const log = ctx.$("[data-log]");
            if (log.querySelector(".dv-muted")) log.innerHTML = "";
            log.insertAdjacentHTML("afterbegin", `<li><span class="dv-badge dv-badge--${ok ? "success" : "danger"}">${ok ? 200 : 502}</span><span>${esc(h.ev[0])}</span><span class="dv-muted">${esc(new URL(h.url).host)}</span><span class="dv-list__end dv-muted">${new Date().toLocaleTimeString()}</span></li>`);
          }
          if (s || r) render();
        });
        ctx.on(ctx.$("[data-list]"), "change", (e) => {
          const t = e.target.closest("[data-tg]");
          if (!t) return;
          hooks[t.dataset.tg].on = t.checked;
          render();
        });
        render();
      }
    },

    privacy: {
      html: settingsShell("privacy.tsx", "Privacy & data", "Consent toggles, data export (real JSON download after a progress bar) and account deletion with confirmation.", `
        <div class="xp-panel dv-stack">${[["analytics", "Product analytics", "Anonymous usage to improve the product", true], ["personal", "Personalisation", "Recommendations based on your activity", false], ["crash", "Crash reports", "Send diagnostics when something breaks", true]].map(([k, t, d, on]) => `<label class="dv-row" style="justify-content:space-between;cursor:pointer"><div><div>${t}</div><div class="dv-muted" style="font-size:11px">${d}</div></div><input type="checkbox" role="switch" class="dv-switch" data-k="${k}"${on ? " checked" : ""} /></label>`).join("")}</div>
        <div class="xp-panel dv-stack"><div class="dv-row"><div><strong>Export your data</strong><div class="dv-muted">Profile, projects and activity as JSON.</div></div><span class="dv-spacer"></span><button type="button" class="dv-btn" data-export>Request export</button></div><progress class="dv-progress" max="100" value="0" data-bar hidden></progress></div>
        <div class="dv-alert dv-alert--danger"><div style="flex:1"><div class="dv-alert__title">Delete account</div><div class="dv-alert__desc">This permanently removes your data after 14 days.</div></div><button type="button" class="dv-btn dv-btn--danger dv-btn--sm" data-dv-open="priv-del">Delete…</button></div>
        <dialog class="dv-dialog" id="priv-del"><div class="dv-dialog__header"><h3 class="dv-dialog__title">Delete your account?</h3><p class="dv-dialog__desc">Type DELETE to confirm.</p></div><div class="dv-dialog__body"><input class="dv-input" data-confirm aria-label="Type DELETE" /></div><div class="dv-dialog__footer"><button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="button" class="dv-btn dv-btn--danger" disabled data-go data-dv-close="yes">Delete account</button></div></dialog>`),
      setup(root, ctx) {
        ctx.$$("[data-k]").forEach((s) => ctx.on(s, "change", () => ctx.toast({ title: `${s.closest("label").querySelector("div div").textContent} ${s.checked ? "on" : "off"}`, variant: "neutral", duration: 1200 })));
        ctx.on(ctx.$("[data-export]"), "click", (e) => {
          const bar = ctx.$("[data-bar]");
          bar.hidden = false;
          bar.value = 0;
          e.target.disabled = true;
          const id = ctx.every(80, () => {
            bar.value += 4;
            if (bar.value >= 100) {
              clearInterval(id);
              e.target.disabled = false;
              const consent = Object.fromEntries(ctx.$$("[data-k]").map((s) => [s.dataset.k, s.checked]));
              DEVL_XP.download("my-data.json", JSON.stringify({ user: "luis@acme.dev", exportedAt: new Date().toISOString(), consent, projects: ["Onboarding redesign", "Q3 planning"] }, null, 2), "application/json");
              ctx.toast({ title: "Export ready", description: "my-data.json downloaded" });
            }
          });
        });
        const c = ctx.$("[data-confirm]");
        ctx.on(c, "input", () => (ctx.$("[data-go]").disabled = c.value !== "DELETE"));
        ctx.on(ctx.$("#priv-del"), "close", (e) => {
          if (e.target.returnValue === "yes") ctx.toast({ title: "Account scheduled for deletion", description: "You have 14 days to cancel.", variant: "danger" });
          c.value = "";
          ctx.$("[data-go]").disabled = true;
        });
      }
    },

    developer: {
      html: settingsShell("developer.tsx", "Developer", "Sandbox mode, a token-bucket rate limiter you can exhaust (429s!) and a live request log.", `
        <div class="dv-alert dv-alert--warning" data-banner hidden><div><div class="dv-alert__title">Sandbox mode</div><div class="dv-alert__desc">Requests hit test data only. No real charges.</div></div></div>
        <div class="xp-panel dv-row"><div><strong>Sandbox mode</strong><div class="dv-muted">Use test keys and fixtures.</div></div><span class="dv-spacer"></span><input type="checkbox" role="switch" class="dv-switch" data-sandbox aria-label="Sandbox mode" /></div>
        <div class="xp-panel dv-stack"><div class="dv-row"><strong>Rate limit</strong><span class="dv-spacer"></span><span class="xp-mono" data-tokens></span></div><div class="dv-meter" style="height:8px"><span data-bucket></span></div><div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-one>Send request</button><button type="button" class="dv-btn dv-btn--sm" data-burst>Burst ×15</button><span class="dv-spacer"></span><div class="dv-input-group" style="max-width:300px"><input class="dv-input xp-mono" readonly id="dev-base" data-base aria-label="API base URL" /><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" style="margin:3px" data-dv-copy data-dv-copy-target="#dev-base">Copy</button></div></div></div>
        <ul class="dv-list xp-mono" style="font-size:12px" data-log></ul>`),
      setup(root, ctx) {
        const CAP = 20;
        let tokens = CAP;
        const render = () => {
          ctx.$("[data-tokens]").textContent = `${Math.floor(tokens)} / ${CAP} requests available · refills 2/s`;
          const b = ctx.$("[data-bucket]");
          b.style.setProperty("--w", `${(tokens / CAP) * 100}%`);
          b.style.setProperty("--c", tokens < 4 ? "var(--dv-danger)" : "var(--xp-accent)");
          const sb = ctx.$("[data-sandbox]").checked;
          ctx.$("[data-banner]").hidden = !sb;
          ctx.$("[data-base]").value = sb ? "https://sandbox.api.devl.dev/v2" : "https://api.devl.dev/v2";
        };
        const send = () => {
          const ok = tokens >= 1;
          if (ok) tokens--;
          const li = document.createElement("li");
          li.innerHTML = `<span class="dv-badge dv-badge--${ok ? "success" : "danger"}">${ok ? 200 : 429}</span><span>GET /v2/projects</span><span class="dv-list__end dv-muted">${ok ? `${Math.round(20 + Math.random() * 80)}ms` : "retry-after 1s"}</span>`;
          const log = ctx.$("[data-log]");
          log.prepend(li);
          while (log.children.length > 12) log.lastElementChild.remove();
          render();
        };
        ctx.every(500, () => {
          tokens = Math.min(CAP, tokens + 1);
          render();
        });
        ctx.on(ctx.$("[data-one]"), "click", send);
        ctx.on(ctx.$("[data-burst]"), "click", () => {
          for (let i = 0; i < 15; i++) send();
        });
        ctx.on(ctx.$("[data-sandbox]"), "change", render);
        render();
      }
    },

    sso: {
      html: settingsShell("sso.tsx", "Single sign-on", "Verify your domain, configure SAML, test the connection, then enforce SSO — each step unlocks the next.", `
        <ol class="dv-steps" data-steps><li aria-current="step">Domain</li><li>SAML</li><li>Test</li><li>Enforce</li></ol>
        <section class="xp-panel dv-stack" data-s="0"><strong>1 · Verify domain</strong><div class="dv-row"><input class="dv-input" style="max-width:240px" value="acme.dev" data-domain aria-label="Domain" /><button type="button" class="dv-btn dv-btn--sm" data-verify>Verify</button></div><code class="xp-mono dv-muted" data-txt></code></section>
        <section class="xp-panel dv-stack" data-s="1" hidden><strong>2 · SAML configuration</strong><label class="dv-field"><span class="dv-label">IdP SSO URL</span><input class="dv-input xp-mono" data-sso-url placeholder="https://acme.okta.com/app/…/sso/saml" /></label><label class="dv-field"><span class="dv-label">X.509 certificate</span><textarea class="dv-textarea xp-mono" data-cert placeholder="-----BEGIN CERTIFICATE-----"></textarea></label><span class="dv-error" data-saml-err></span><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-save style="align-self:flex-start">Save configuration</button></section>
        <section class="xp-panel dv-stack" data-s="2" hidden><strong>3 · Test connection</strong><button type="button" class="dv-btn dv-btn--sm" data-test style="align-self:flex-start">Run test login</button><span data-test-out></span></section>
        <section class="xp-panel dv-row" data-s="3" hidden><div><strong>4 · Enforce SSO</strong><div class="dv-muted">Members must sign in through your IdP.</div></div><span class="dv-spacer"></span><input type="checkbox" role="switch" class="dv-switch" data-enforce aria-label="Enforce SSO" /></section>`),
      setup(root, ctx) {
        let step = 0;
        const go = (n) => {
          step = Math.max(step, n);
          ctx.$$("[data-s]").forEach((s) => (s.hidden = Number(s.dataset.s) > step));
          ctx.$$("[data-steps] li").forEach((li, i) => {
            li.removeAttribute("aria-current");
            li.removeAttribute("data-state");
            if (i < step) li.dataset.state = "done";
            if (i === step) li.setAttribute("aria-current", "step");
          });
        };
        const txt = () => (ctx.$("[data-txt]").textContent = `Add TXT record: devl-site-verification=${btoa(ctx.$("[data-domain]").value).slice(0, 16)}`);
        ctx.on(ctx.$("[data-domain]"), "input", txt);
        ctx.on(ctx.$("[data-verify]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(800, () => {
            e.target.removeAttribute("aria-busy");
            e.target.textContent = "✓ Verified";
            go(1);
          });
        });
        ctx.on(ctx.$("[data-save]"), "click", () => {
          const url = ctx.$("[data-sso-url]").value.trim();
          const cert = ctx.$("[data-cert]").value.trim();
          let err = "";
          if (!/^https:\/\/\S+$/.test(url)) err = "SSO URL must be an https:// URL.";
          else if (!cert.includes("BEGIN CERTIFICATE")) err = "Paste a PEM certificate (-----BEGIN CERTIFICATE-----).";
          ctx.$("[data-saml-err]").textContent = err;
          if (!err) {
            ctx.toast({ title: "SAML configuration saved" });
            go(2);
          }
        });
        ctx.on(ctx.$("[data-test]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(1200, () => {
            e.target.removeAttribute("aria-busy");
            ctx.$("[data-test-out]").innerHTML = '<span class="dv-badge dv-badge--success">Assertion valid · luis@acme.dev</span>';
            go(3);
          });
        });
        ctx.on(ctx.$("[data-enforce]"), "change", (e) => ctx.toast({ title: e.target.checked ? "SSO enforced for acme.dev" : "SSO optional", variant: e.target.checked ? "success" : "warning" }));
        txt();
        go(0);
      }
    }
  });

  // ==========================================================================
  // CARDS
  // ==========================================================================
  X.addMany("cards", {
    "stat-tile": {
      html: `
        ${head("Cards · stat-tile.tsx", "Stat tile", "Click a tile to cycle its period; refresh animates the counters to new values.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-refresh>⟳ Refresh</button></div>
        <div class="dv-grid" style="--min:220px" data-tiles></div>`,
      setup(root, ctx) {
        const tiles = [["Revenue", 48210, "$"], ["Signups", 1284, ""], ["Active users", 9312, ""], ["Churn", 2.1, "%"]].map(([n, v, u], i) => ({ n, v, u, period: 0, hist: Array.from({ length: 14 }, (_, k) => v * (0.8 + 0.4 * Math.abs(Math.sin(k + i)))) }));
        const periods = ["7d", "30d", "90d"];
        const fmt = (t, v) => (t.u === "$" ? ctx.fmt.money(v, "USD", 0) : t.u === "%" ? `${v.toFixed(1)}%` : ctx.fmt.num(v));
        const render = () =>
          (ctx.$("[data-tiles]").innerHTML = tiles.map((t, i) => `<button type="button" class="dv-stat" data-i="${i}" style="text-align:left;cursor:pointer;color:inherit;font:inherit"><div class="dv-row"><span class="dv-eyebrow">${t.n}</span><span class="dv-spacer"></span><span class="dv-badge dv-badge--outline">${periods[t.period]}</span></div><span class="dv-stat__value" data-v="${i}">${fmt(t, t.v)}</span><dv-sparkline values="${t.hist.map((x) => x.toFixed(1)).join(",")}" fill style="--w:100%;--h:34px"></dv-sparkline></button>`).join(""));
        const animate = (i, to) => {
          const t = tiles[i];
          const from = t.v;
          const t0 = performance.now();
          ctx.raf((now) => {
            const k = Math.min(1, (now - t0) / 700);
            const v = from + (to - from) * (1 - (1 - k) ** 3);
            const el = ctx.$(`[data-v="${i}"]`);
            if (el) el.textContent = fmt(t, v);
            if (k === 1) {
              t.v = to;
              return false;
            }
          });
        };
        ctx.on(ctx.$("[data-tiles]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          const t = tiles[b.dataset.i];
          t.period = (t.period + 1) % 3;
          const mult = [1, 3.9, 11.2][t.period];
          const base = t.u === "%" ? 2.1 + t.period * 0.3 : t.hist[0] * mult;
          render();
          animate(Number(b.dataset.i), base);
        });
        ctx.on(ctx.$("[data-refresh]"), "click", () => tiles.forEach((t, i) => {
          const next = t.v * (0.9 + Math.random() * 0.2);
          t.hist = t.hist.slice(1).concat(next);
          render();
          animate(i, next);
        }));
        render();
      }
    },

    profile: {
      html: `
        ${head("Cards · profile.tsx", "Profile card", "Follow / unfollow updates the follower count; message opens an inline composer.")}
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(340px,100%)">
          <div style="height:84px;background:linear-gradient(135deg,var(--xp-accent),var(--dv-info))"></div>
          <div class="dv-card__body dv-stack" style="margin-top:-46px;align-items:center;text-align:center">
            <span class="dv-avatar dv-avatar--lg" data-status="online" style="--_s:72px;box-shadow:0 0 0 4px var(--dv-bg-elevated)">AL</span>
            <strong style="font-size:16px">Ana López</strong><span class="dv-muted">Design lead · CDMX</span>
            <div class="dv-row" style="justify-content:center;--gap:18px"><div><strong data-followers>1,284</strong><div class="dv-muted" style="font-size:11px">followers</div></div><div><strong>312</strong><div class="dv-muted" style="font-size:11px">following</div></div><div><strong>48</strong><div class="dv-muted" style="font-size:11px">shots</div></div></div>
            <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-follow aria-pressed="false">Follow</button><button type="button" class="dv-btn" data-msg>Message</button></div>
            <form class="dv-input-group" data-compose hidden style="width:100%"><input class="dv-input" placeholder="Say hi…" required aria-label="Message" /><button type="submit" class="dv-btn dv-btn--sm" style="margin:3px">Send</button></form>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let followers = 1284;
        const btn = ctx.$("[data-follow]");
        ctx.on(btn, "click", () => {
          const on = btn.getAttribute("aria-pressed") !== "true";
          btn.setAttribute("aria-pressed", String(on));
          followers += on ? 1 : -1;
          btn.textContent = on ? "Following ✓" : "Follow";
          btn.className = `dv-btn ${on ? "" : "dv-btn--primary"}`;
          ctx.$("[data-followers]").textContent = followers.toLocaleString("en-US");
        });
        ctx.on(ctx.$("[data-msg]"), "click", () => {
          const f = ctx.$("[data-compose]");
          f.hidden = !f.hidden;
          if (!f.hidden) f.querySelector("input").focus();
        });
        ctx.on(ctx.$("[data-compose]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "Message sent to Ana" });
          e.target.reset();
          e.target.hidden = true;
        });
      }
    },

    pricing: {
      html: `
        ${head("Cards · pricing.tsx", "Pricing tiers", "Billing period toggle recomputes prices and savings; selecting a tier highlights it.")}
        <div class="dv-row" style="justify-content:center"><dv-segmented value="year" data-period><button class="dv-segmented__item" value="month">Monthly</button><button class="dv-segmented__item" value="year">Yearly · save 20%</button></dv-segmented></div>
        <div class="dv-grid" style="--min:220px" data-tiers></div>`,
      setup(root, ctx) {
        const tiers = [["Hobby", 0, ["1 project", "Community support"]], ["Pro", 24, ["Unlimited projects", "Custom domains", "Priority support"]], ["Team", 59, ["Everything in Pro", "SSO & audit log", "99.9% SLA"]]];
        let sel = 1;
        const render = () => {
          const yearly = (ctx.$("[data-period]").value || "year") === "year";
          ctx.$("[data-tiers]").innerHTML = tiers
            .map(([n, p, feats], i) => {
              const price = yearly ? Math.round(p * 0.8) : p;
              return `<div class="dv-card ${i === sel ? "" : "dv-card--flat"}" style="${i === sel ? "border-color:var(--xp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--xp-accent) 20%,transparent)" : ""}"><div class="dv-card__body dv-stack"><div class="dv-row"><span class="dv-eyebrow">${n}</span>${i === 1 ? '<span class="dv-badge dv-badge--accent">Popular</span>' : ""}</div><div class="xp-num">$${price}<span class="dv-muted" style="font-size:12px">/mo</span></div><span class="dv-hint">${yearly && p ? `$${price * 12} billed yearly · save $${(p - price) * 12}` : p ? "Billed monthly" : "Free forever"}</span><ul class="dv-stack" style="--gap:6px;padding:0;list-style:none;font-size:12px">${feats.map((f) => `<li>✓ ${f}</li>`).join("")}</ul><button type="button" class="dv-btn dv-btn--block ${i === sel ? "dv-btn--primary" : ""}" data-sel="${i}">${i === sel ? "Selected" : `Choose ${n}`}</button></div></div>`;
            })
            .join("");
        };
        ctx.on(ctx.$("[data-period]"), "dv-change", render);
        ctx.on(ctx.$("[data-tiers]"), "click", (e) => {
          const b = e.target.closest("[data-sel]");
          if (!b) return;
          sel = Number(b.dataset.sel);
          ctx.toast({ title: `${tiers[sel][0]} selected` });
          render();
        });
        render();
      }
    },

    product: {
      html: `
        ${head("Cards · product.tsx", "Product card", "Pick colour and size, set quantity and add to cart — the cart badge and subtotal update.")}
        <div class="dv-row"><span class="dv-spacer"></span><span class="dv-badge dv-badge--accent" data-cart>Cart · 0</span></div>
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(340px,100%)">
          <div data-img style="height:200px;display:grid;place-items:center;font-size:64px;transition:background .3s">🎧</div>
          <div class="dv-card__body dv-stack">
            <div class="dv-row"><strong style="font-size:16px">Studio headphones</strong><span class="dv-spacer"></span><span class="xp-num" style="font-size:20px">$199</span></div>
            <span class="dv-muted">★ 4.7 · 1,204 reviews</span>
            <div class="dv-row" data-colors>${[["Midnight", "#1e1b4b"], ["Sand", "#d6c4a8"], ["Sage", "#7c9a80"]].map(([n, c], i) => `<button type="button" aria-label="${n}" data-c="${c}" data-n="${n}" style="width:24px;height:24px;border-radius:50%;background:${c};border:2px solid ${i ? "transparent" : "var(--dv-fg)"};cursor:pointer"></button>`).join("")}<span class="dv-muted" data-cname>Midnight</span></div>
            <div class="dv-row"><select class="dv-select" style="width:auto" data-size aria-label="Size"><option>Standard</option><option>Large (+$20)</option></select><div class="dv-number"><button type="button" data-step="-1" aria-label="Less">−</button><input type="number" min="1" max="9" value="1" data-qty aria-label="Quantity" /><button type="button" data-step="1" aria-label="More">+</button></div></div>
            <button type="button" class="dv-btn dv-btn--primary dv-btn--block" data-add>Add to cart</button>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let items = 0;
        let subtotal = 0;
        const img = ctx.$("[data-img]");
        const setColor = (b) => {
          ctx.$$("[data-c]").forEach((x) => (x.style.borderColor = x === b ? "var(--dv-fg)" : "transparent"));
          img.style.background = `linear-gradient(160deg, ${b.dataset.c}, transparent)`;
          ctx.$("[data-cname]").textContent = b.dataset.n;
        };
        ctx.on(ctx.$("[data-colors]"), "click", (e) => {
          const b = e.target.closest("[data-c]");
          if (b) setColor(b);
        });
        ctx.on(ctx.$("[data-add]"), "click", (e) => {
          const qty = Math.max(1, Number(ctx.$("[data-qty]").value) || 1);
          const price = 199 + (ctx.$("[data-size]").selectedIndex ? 20 : 0);
          items += qty;
          subtotal += qty * price;
          ctx.$("[data-cart]").textContent = `Cart · ${items} · ${ctx.fmt.money(subtotal, "USD", 0)}`;
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(400, () => e.target.removeAttribute("aria-busy"));
          ctx.toast({ title: `Added ${qty} × ${ctx.$("[data-cname]").textContent}`, action: { label: "Undo", onClick: () => {
            items -= qty;
            subtotal -= qty * price;
            ctx.$("[data-cart]").textContent = `Cart · ${items} · ${ctx.fmt.money(subtotal, "USD", 0)}`;
          } } });
        });
        setColor(ctx.$("[data-c]"));
      }
    },

    invoice: {
      html: `
        ${head("Cards · invoice.tsx", "Invoice line", "Edit quantities and prices, add lines and pick a tax rate — subtotal, tax and total recompute. Mark as paid to stamp it.")}
        <div class="dv-card xp-rel" style="max-width:680px;width:100%;margin:0 auto">
          <div class="dv-card__header dv-row"><div><span class="dv-eyebrow">Invoice</span><h3 class="dv-card__title xp-mono">INV-2094</h3></div><span class="dv-spacer"></span><span class="dv-badge dv-badge--warning" data-status>Due Oct 31</span></div>
          <div class="dv-card__body"><table class="dv-table dv-table--compact"><thead><tr><th>Item</th><th class="is-num">Qty</th><th class="is-num">Price</th><th class="is-num">Amount</th><th></th></tr></thead><tbody data-lines></tbody></table><button type="button" class="dv-btn dv-btn--sm" style="margin-top:10px" data-add>+ Add line</button></div>
          <div class="dv-card__footer" style="justify-content:space-between;flex-wrap:wrap"><label class="dv-choice">Tax <select class="dv-select" style="width:auto;height:28px" data-tax><option value="0">0%</option><option value="0.16" selected>16% IVA</option><option value="0.21">21% VAT</option></select></label><div class="xp-kv xp-mono" style="grid-template-columns:auto auto;text-align:right" data-totals></div><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-paid>Mark as paid</button></div>
          <div data-stamp hidden style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%) rotate(-12deg);border:3px solid var(--dv-success);color:var(--dv-success);font-size:34px;font-weight:800;padding:6px 18px;border-radius:8px;opacity:.8;pointer-events:none">PAID</div>
        </div>`,
      setup(root, ctx) {
        const lines = [["Design system audit", 1, 2400], ["Component build (hours)", 12, 95], ["Hosting (annual)", 1, 240]];
        const render = () => {
          ctx.$("[data-lines]").innerHTML = lines.map(([n, q, p], i) => `<tr><td><input class="dv-input" style="height:28px" value="${esc(n)}" data-i="${i}" data-k="0" aria-label="Item" /></td><td class="is-num"><input class="dv-input xp-mono" type="number" min="0" style="height:28px;width:70px;text-align:right" value="${q}" data-i="${i}" data-k="1" aria-label="Quantity" /></td><td class="is-num"><input class="dv-input xp-mono" type="number" min="0" style="height:28px;width:90px;text-align:right" value="${p}" data-i="${i}" data-k="2" aria-label="Price" /></td><td class="is-num xp-mono" data-amt="${i}">${ctx.fmt.money(q * p)}</td><td><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-rm="${i}" aria-label="Remove">✕</button></td></tr>`).join("");
          totals();
        };
        const totals = () => {
          const sub = lines.reduce((s, [, q, p]) => s + q * p, 0);
          const rate = Number(ctx.$("[data-tax]").value);
          lines.forEach(([, q, p], i) => {
            const c = ctx.$(`[data-amt="${i}"]`);
            if (c) c.textContent = ctx.fmt.money(q * p);
          });
          ctx.$("[data-totals]").innerHTML = `<dt>Subtotal</dt><dd>${ctx.fmt.money(sub)}</dd><dt>Tax</dt><dd>${ctx.fmt.money(sub * rate)}</dd><dt><strong>Total</strong></dt><dd><strong>${ctx.fmt.money(sub * (1 + rate))}</strong></dd>`;
        };
        ctx.on(ctx.$("[data-lines]"), "input", (e) => {
          const t = e.target;
          if (!t.dataset.k) return;
          lines[t.dataset.i][t.dataset.k] = t.dataset.k === "0" ? t.value : Math.max(0, Number(t.value) || 0);
          totals();
        });
        ctx.on(ctx.$("[data-lines]"), "click", (e) => {
          const b = e.target.closest("[data-rm]");
          if (!b) return;
          lines.splice(Number(b.dataset.rm), 1);
          render();
        });
        ctx.on(ctx.$("[data-add]"), "click", () => {
          lines.push(["New item", 1, 100]);
          render();
        });
        ctx.on(ctx.$("[data-tax]"), "change", totals);
        ctx.on(ctx.$("[data-paid]"), "click", (e) => {
          const paid = ctx.$("[data-stamp]").hidden;
          ctx.$("[data-stamp]").hidden = !paid;
          ctx.$("[data-status]").className = `dv-badge dv-badge--${paid ? "success" : "warning"}`;
          ctx.$("[data-status]").textContent = paid ? "Paid" : "Due Oct 31";
          e.target.textContent = paid ? "Mark as unpaid" : "Mark as paid";
        });
        render();
      }
    },

    task: {
      html: `
        ${head("Cards · task.tsx", "Kanban task", "Drag cards between columns (or use the arrow buttons). Tick subtasks to fill the progress bar.")}
        <div class="xp-kanban" data-board>${["Todo", "Doing", "Done"].map((c) => `<div class="xp-col" data-col="${c}"><div class="dv-row"><span class="dv-eyebrow">${c}</span><span class="dv-badge" data-n="${c}"></span></div></div>`).join("")}</div>`,
      setup(root, ctx) {
        const cards = [
          { id: 1, t: "Design token audit", col: "Todo", pri: "High", subs: [["Colours", true], ["Radii", false], ["Spacing", false]] },
          { id: 2, t: "Command palette polish", col: "Doing", pri: "Urgent", subs: [["Ranking", true], ["Groups", true], ["Footer", false]] },
          { id: 3, t: "Write release notes", col: "Done", pri: "Low", subs: [["Draft", true], ["Review", true]] }
        ];
        const cols = ["Todo", "Doing", "Done"];
        const render = () => {
          cols.forEach((c) => {
            const col = ctx.$(`[data-col="${c}"]`);
            col.querySelectorAll(".dv-card").forEach((x) => x.remove());
            cards.filter((k) => k.col === c).forEach((k) => {
              const done = k.subs.filter((s) => s[1]).length;
              const el = document.createElement("div");
              el.className = "dv-card dv-card--flat";
              el.draggable = true;
              el.dataset.id = k.id;
              el.style.cursor = "grab";
              el.innerHTML = `<div class="dv-card__body dv-stack" style="--gap:8px;padding:12px"><div class="dv-row"><strong style="flex:1"></strong><span class="dv-badge dv-badge--${k.pri === "Urgent" ? "danger" : k.pri === "High" ? "warning" : "info"}">${k.pri}</span></div><progress class="dv-progress" max="${k.subs.length}" value="${done}"></progress>${k.subs.map((s, i) => `<label class="dv-choice" style="font-size:12px"><input type="checkbox" class="dv-check" data-sub="${i}"${s[1] ? " checked" : ""} /> ${esc(s[0])}</label>`).join("")}<div class="dv-row"><span class="dv-muted" style="font-size:11px">${done}/${k.subs.length}</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-mv="-1" aria-label="Move left"${c === "Todo" ? " disabled" : ""}>←</button><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-mv="1" aria-label="Move right"${c === "Done" ? " disabled" : ""}>→</button></div></div>`;
              el.querySelector("strong").textContent = k.t;
              col.appendChild(el);
            });
            ctx.$(`[data-n="${c}"]`).textContent = String(cards.filter((k) => k.col === c).length);
          });
        };
        const board = ctx.$("[data-board]");
        let dragId = null;
        ctx.on(board, "dragstart", (e) => {
          const card = e.target.closest("[data-id]");
          if (!card) return;
          dragId = Number(card.dataset.id);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(dragId));
        });
        ctx.on(board, "dragover", (e) => {
          const col = e.target.closest("[data-col]");
          if (!col) return;
          e.preventDefault();
          ctx.$$("[data-col]").forEach((c) => c.classList.toggle("is-over", c === col));
        });
        ctx.on(board, "drop", (e) => {
          const col = e.target.closest("[data-col]");
          ctx.$$("[data-col]").forEach((c) => c.classList.remove("is-over"));
          if (!col || dragId === null) return;
          e.preventDefault();
          cards.find((k) => k.id === dragId).col = col.dataset.col;
          dragId = null;
          render();
        });
        ctx.on(board, "dragend", () => ctx.$$("[data-col]").forEach((c) => c.classList.remove("is-over")));
        ctx.on(board, "change", (e) => {
          const box = e.target.closest("[data-sub]");
          if (!box) return;
          const k = cards.find((c) => c.id === Number(box.closest("[data-id]").dataset.id));
          k.subs[box.dataset.sub][1] = box.checked;
          if (k.subs.every((s) => s[1]) && k.col !== "Done") {
            k.col = "Done";
            ctx.toast({ title: `“${k.t}” completed` });
          }
          render();
        });
        ctx.on(board, "click", (e) => {
          const b = e.target.closest("[data-mv]");
          if (!b) return;
          const k = cards.find((c) => c.id === Number(b.closest("[data-id]").dataset.id));
          k.col = cols[Math.max(0, Math.min(2, cols.indexOf(k.col) + Number(b.dataset.mv)))];
          render();
        });
        render();
      }
    },

    event: {
      html: `
        ${head("Cards · event.tsx", "Calendar event", "RSVP updates the attendee list; “Add to calendar” downloads a real .ics file.")}
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(380px,100%)">
          <div class="dv-card__body dv-stack">
            <div class="dv-row"><div style="text-align:center;padding:6px 10px;border-radius:8px;background:var(--dv-surface-strong)"><div class="dv-eyebrow" style="color:var(--dv-danger)">OCT</div><div class="xp-num" style="font-size:22px">23</div></div><div><strong>Design sync</strong><div class="dv-muted">Thu · 15:00–15:45 · Zoom</div></div></div>
            <div class="dv-row"><div class="dv-avatar-group" data-avatars></div><span class="dv-muted" data-going></span></div>
            <dv-segmented data-rsvp><button class="dv-segmented__item" value="yes">Going</button><button class="dv-segmented__item" value="maybe">Maybe</button><button class="dv-segmented__item" value="no">Decline</button></dv-segmented>
          </div>
          <div class="dv-card__footer"><button type="button" class="dv-btn dv-btn--sm" data-ics>Add to calendar</button><button type="button" class="dv-btn dv-btn--sm dv-btn--primary" data-join>Join call</button></div>
        </div></div>`,
      setup(root, ctx) {
        const base = ["AL", "LK", "SR"];
        let mine = null;
        const render = () => {
          const list = mine === "yes" ? base.concat("LI") : base;
          ctx.$("[data-avatars]").innerHTML = list.map((a, i) => `<span class="dv-avatar dv-avatar--sm" style="--dv-accent:hsl(${i * 80} 70% 55%)">${a}</span>`).join("");
          ctx.$("[data-going]").textContent = `${list.length} going${mine === "maybe" ? " · you: maybe" : mine === "no" ? " · you declined" : ""}`;
        };
        ctx.on(ctx.$("[data-rsvp]"), "dv-change", (e) => {
          mine = e.detail.value;
          render();
        });
        ctx.on(ctx.$("[data-ics]"), "click", () => {
          const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//devl//gallery//EN", "BEGIN:VEVENT", `UID:${Date.now()}@devl.dev`, "DTSTAMP:20261015T000000Z", "DTSTART:20261023T210000Z", "DTEND:20261023T214500Z", "SUMMARY:Design sync", "LOCATION:Zoom", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
          DEVL_XP.download("design-sync.ics", ics, "text/calendar");
        });
        ctx.on(ctx.$("[data-join]"), "click", () => ctx.toast({ title: "Joining call…", variant: "info" }));
        render();
      }
    },

    integration: {
      html: `
        ${head("Cards · integration.tsx", "Integration", "Connect toggle, manual sync with spinner and a relative “last synced” clock that keeps ticking.")}
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(380px,100%)">
          <div class="dv-card__body dv-stack">
            <div class="dv-row"><span class="dv-avatar dv-avatar--square" style="--dv-accent:#24292f">GH</span><div><strong>GitHub</strong><div class="dv-muted">acme/devl-scratchpad</div></div><span class="dv-spacer"></span><input type="checkbox" role="switch" class="dv-switch" data-on checked aria-label="Connected" /></div>
            <dl class="xp-kv"><dt>Status</dt><dd data-status></dd><dt>Last sync</dt><dd data-last></dd><dt>Synced items</dt><dd data-items>1,204</dd></dl>
          </div>
          <div class="dv-card__footer"><button type="button" class="dv-btn dv-btn--sm" data-sync>⟳ Sync now</button></div>
        </div></div>`,
      setup(root, ctx) {
        let last = Date.now() - 4 * 60000;
        let items = 1204;
        const render = () => {
          const on = ctx.$("[data-on]").checked;
          ctx.$("[data-status]").innerHTML = on ? '<span class="dv-badge dv-badge--success">Connected</span>' : '<span class="dv-badge">Paused</span>';
          const s = Math.round((Date.now() - last) / 1000);
          ctx.$("[data-last]").textContent = s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
          ctx.$("[data-sync]").disabled = !on;
          ctx.$("[data-items]").textContent = items.toLocaleString("en-US");
        };
        ctx.on(ctx.$("[data-on]"), "change", render);
        ctx.on(ctx.$("[data-sync]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(1100, () => {
            e.target.removeAttribute("aria-busy");
            const n = Math.round(Math.random() * 30);
            items += n;
            last = Date.now();
            ctx.toast({ title: `Synced ${n} new items` });
            render();
          });
        });
        ctx.every(1000, render);
        render();
      }
    },

    media: {
      html: `
        ${head("Cards · media.tsx", "Article preview", "Bookmark, like (with count) and copy a share link; reading time is computed from the excerpt.")}
        <div class="xp-center" style="min-height:0"><article class="dv-card" style="width:min(420px,100%)">
          <div style="height:160px;background:radial-gradient(circle at 30% 30%,var(--xp-accent),transparent 60%),radial-gradient(circle at 80% 70%,var(--dv-warning),transparent 50%),var(--dv-bg-elevated)"></div>
          <div class="dv-card__body dv-stack">
            <span class="dv-eyebrow">Engineering · <span data-read></span></span>
            <h3 class="dv-card__title" style="font-size:18px">Building a zero-dependency component library</h3>
            <p class="dv-muted" data-excerpt>Custom elements in light DOM, tokens in CSS and a few hundred lines of JavaScript get you surprisingly far. Here is how we built devl-ui and what we would do differently next time, from focus management to theming and testing.</p>
            <div class="dv-row"><span class="dv-avatar dv-avatar--sm">LI</span><span class="dv-muted">Luis · Oct 14</span><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-like aria-pressed="false">♡ <span data-likes>128</span></button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-save aria-pressed="false" aria-label="Bookmark">☆</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-share aria-label="Share">↗</button></div>
          </div>
        </article></div>`,
      setup(root, ctx) {
        const words = ctx.$("[data-excerpt]").textContent.trim().split(/\s+/).length * 18;
        ctx.$("[data-read]").textContent = `${Math.max(1, Math.round(words / 230))} min read`;
        let likes = 128;
        const like = ctx.$("[data-like]");
        ctx.on(like, "click", () => {
          const on = like.getAttribute("aria-pressed") !== "true";
          like.setAttribute("aria-pressed", String(on));
          likes += on ? 1 : -1;
          like.firstChild.textContent = on ? "♥ " : "♡ ";
          like.style.color = on ? "var(--dv-danger)" : "";
          ctx.$("[data-likes]").textContent = String(likes);
        });
        const save = ctx.$("[data-save]");
        ctx.on(save, "click", () => {
          const on = save.getAttribute("aria-pressed") !== "true";
          save.setAttribute("aria-pressed", String(on));
          save.textContent = on ? "★" : "☆";
          ctx.toast({ title: on ? "Saved to reading list" : "Removed from reading list", variant: "neutral", duration: 1400 });
        });
        ctx.on(ctx.$("[data-share]"), "click", () => DevlUI.copy("https://devl.dev/blog/zero-dependency-ui").then(() => ctx.toast({ title: "Link copied" })));
      }
    },

    "payment-method": {
      html: `
        ${head("Cards · payment-method.tsx", "Payment method", "Set a default, remove cards and add new ones — numbers are validated with the Luhn checksum and the brand is detected as you type. Try 4242 4242 4242 4242.")}
        <ul class="dv-list" data-cards style="max-width:560px;width:100%"></ul>
        <form class="xp-panel dv-stack" data-form style="max-width:560px;width:100%" novalidate>
          <div class="dv-field"><label class="dv-label" for="pm-num">Card number</label><div class="dv-input-group"><input class="dv-input xp-mono" id="pm-num" data-num inputmode="numeric" placeholder="1234 1234 1234 1234" autocomplete="cc-number" /><span class="dv-input-group__addon" data-brand>—</span></div><span class="dv-error" data-err></span></div>
          <div class="dv-row"><input class="dv-input xp-mono" style="width:100px" data-exp placeholder="MM/YY" autocomplete="cc-exp" aria-label="Expiry" /><input class="dv-input xp-mono" style="width:80px" data-cvc placeholder="CVC" autocomplete="cc-csc" aria-label="CVC" /><span class="dv-spacer"></span><button type="submit" class="dv-btn dv-btn--primary">Add card</button></div>
        </form>`,
      setup(root, ctx) {
        let cards = [{ brand: "Visa", last4: "4242", exp: "08/28", def: true }, { brand: "Mastercard", last4: "4444", exp: "02/27", def: false }];
        const brandOf = (n) => (/^4/.test(n) ? "Visa" : /^(5[1-5]|2[2-7])/.test(n) ? "Mastercard" : /^3[47]/.test(n) ? "Amex" : /^6(011|5)/.test(n) ? "Discover" : "—");
        const luhn = (n) => {
          let sum = 0;
          let alt = false;
          for (let i = n.length - 1; i >= 0; i--) {
            let d = Number(n[i]);
            if (alt) {
              d *= 2;
              if (d > 9) d -= 9;
            }
            sum += d;
            alt = !alt;
          }
          return n.length >= 12 && sum % 10 === 0;
        };
        const render = () =>
          (ctx.$("[data-cards]").innerHTML = cards.map((c, i) => `<li><span style="font-size:20px">💳</span><div><div class="dv-list__title">${c.brand} •••• ${c.last4}</div><div class="dv-list__desc">Expires ${c.exp}</div></div><span class="dv-list__end">${c.def ? '<span class="dv-badge dv-badge--accent">Default</span>' : `<button type="button" class="dv-btn dv-btn--sm" data-def="${i}">Make default</button>`}<button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-rm="${i}"${c.def ? " disabled" : ""}>Remove</button></span></li>`).join(""));
        const num = ctx.$("[data-num]");
        ctx.on(num, "input", () => {
          const digits = num.value.replace(/\D/g, "").slice(0, 19);
          num.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
          ctx.$("[data-brand]").textContent = brandOf(digits);
        });
        ctx.on(ctx.$("[data-exp]"), "input", (e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
          e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
        });
        ctx.on(ctx.$("[data-cards]"), "click", (e) => {
          const d = e.target.closest("[data-def]");
          const r = e.target.closest("[data-rm]");
          if (d) cards.forEach((c, i) => (c.def = i === Number(d.dataset.def)));
          if (r) cards.splice(Number(r.dataset.rm), 1);
          render();
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const digits = num.value.replace(/\D/g, "");
          const exp = ctx.$("[data-exp]").value;
          const [mm, yy] = exp.split("/").map(Number);
          let err = "";
          if (!luhn(digits)) err = "Card number is invalid (Luhn check failed).";
          else if (!(mm >= 1 && mm <= 12 && yy >= 26)) err = "Expiry must be a future MM/YY.";
          else if (!/^\d{3,4}$/.test(ctx.$("[data-cvc]").value)) err = "CVC must be 3–4 digits.";
          ctx.$("[data-err]").textContent = err;
          num.setAttribute("aria-invalid", String(Boolean(err)));
          if (err) return;
          cards.push({ brand: brandOf(digits), last4: digits.slice(-4), exp, def: false });
          e.target.reset();
          ctx.$("[data-brand]").textContent = "—";
          ctx.toast({ title: "Card added" });
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // MODALS
  // ==========================================================================
  const dialog = (id, title, desc, body, footer, extra = "") => `<dialog class="dv-dialog" id="${id}" aria-labelledby="${id}-t"${extra}><div class="dv-dialog__header"><h3 class="dv-dialog__title" id="${id}-t">${title}</h3>${desc ? `<p class="dv-dialog__desc">${desc}</p>` : ""}</div><div class="dv-dialog__body">${body}</div>${footer ? `<div class="dv-dialog__footer">${footer}</div>` : ""}</dialog>`;
  const trigger = (id, label, cls = "dv-btn--primary") => `<div class="xp-center" style="min-height:240px"><button type="button" class="dv-btn ${cls}" data-dv-open="${id}">${label}</button></div>`;

  X.addMany("modals", {
    "confirm-delete": {
      html: `
        ${head("Modals · confirm-delete.tsx", "Confirm delete", "Destructive dialog: the button unlocks only when you type the project name. Escape or backdrop click cancels.")}
        <ul class="dv-list" data-list style="max-width:520px;width:100%;margin:0 auto"></ul>
        ${dialog("cd-dlg", "Delete project?", 'This permanently deletes <strong data-name></strong> and all of its files.', '<label class="dv-field"><span class="dv-label">Type <code data-name2></code> to confirm</span><input class="dv-input" data-confirm autocomplete="off" /></label>', '<button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="button" class="dv-btn dv-btn--danger" data-go disabled data-dv-close="delete">Delete project</button>')}`,
      setup(root, ctx) {
        let projects = ["marketing-site", "devl-ui", "q3-planning"];
        let target = null;
        const dlg = ctx.$("#cd-dlg");
        const input = ctx.$("[data-confirm]");
        const render = () =>
          (ctx.$("[data-list]").innerHTML = projects.map((p) => `<li><span class="xp-mono" style="flex:1">${p}</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-del="${p}">Delete…</button></li>`).join("") || '<li class="dv-muted">No projects left.</li>');
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-del]");
          if (!b) return;
          target = b.dataset.del;
          ctx.$("[data-name]").textContent = target;
          ctx.$("[data-name2]").textContent = target;
          dlg.showModal();
          input.focus();
        });
        ctx.on(input, "input", () => (ctx.$("[data-go]").disabled = input.value !== target));
        ctx.on(dlg, "close", () => {
          if (dlg.returnValue === "delete") {
            projects = projects.filter((p) => p !== target);
            ctx.toast({ title: `Deleted ${target}`, variant: "danger" });
            render();
          }
          dlg.returnValue = "";
          input.value = "";
          ctx.$("[data-go]").disabled = true;
        });
        render();
      }
    },

    "share-link": {
      html: `
        ${head("Modals · share-link.tsx", "Share link", "Copy the link, change general access, invite by email and adjust each person's role.")}
        ${trigger("sl-dlg", "Share…")}
        ${dialog("sl-dlg", "Share “Q3 roadmap”", "", `<div class="dv-stack">
          <div class="dv-row" style="flex-wrap:nowrap"><dv-tags style="flex:1" data-tags placeholder="Add emails…"></dv-tags><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-invite>Invite</button></div>
          <ul class="dv-list" data-people></ul>
          <div class="dv-row"><span class="dv-label">General access</span><span class="dv-spacer"></span><select class="dv-select" style="width:auto" data-access aria-label="General access"><option value="restricted">Restricted</option><option value="org">Anyone at Acme</option><option value="public">Anyone with the link</option></select></div>
          <div class="dv-input-group"><input class="dv-input xp-mono" readonly id="sl-link" value="https://devl.dev/s/q3-roadmap" aria-label="Link" /><button type="button" class="dv-btn dv-btn--sm" style="margin:3px" data-dv-copy data-dv-copy-target="#sl-link">Copy link</button></div></div>`, '<button type="button" class="dv-btn" data-dv-close>Done</button>')}`,
      setup(root, ctx) {
        const people = [["Luis Islas", "Owner"], ["Ana López", "Editor"]];
        const render = () =>
          (ctx.$("[data-people]").innerHTML = people.map(([n, r], i) => `<li><span class="dv-avatar dv-avatar--sm">${esc(n[0].toUpperCase())}</span><span style="flex:1">${esc(n)}</span>${r === "Owner" ? '<span class="dv-muted">Owner</span>' : `<select class="dv-select" style="width:auto;height:28px" data-role="${i}" aria-label="Role"><option${r === "Editor" ? " selected" : ""}>Editor</option><option${r === "Viewer" ? " selected" : ""}>Viewer</option><option>Remove</option></select>`}</li>`).join(""));
        ctx.on(ctx.$("[data-people]"), "change", (e) => {
          const s = e.target.closest("[data-role]");
          if (!s) return;
          if (s.value === "Remove") people.splice(Number(s.dataset.role), 1);
          else people[s.dataset.role][1] = s.value;
          render();
        });
        ctx.on(ctx.$("[data-invite]"), "click", () => {
          const tags = ctx.$("[data-tags]");
          const emails = tags.value.filter((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          if (!emails.length) return ctx.toast({ title: "Add a valid email", variant: "warning" });
          emails.forEach((e) => people.push([e, "Viewer"]));
          tags.value.forEach((v) => tags.remove(v, false));
          ctx.toast({ title: `Invited ${emails.length}` });
          render();
        });
        ctx.on(ctx.$("[data-access]"), "change", (e) => ctx.toast({ title: `Access: ${e.target.selectedOptions[0].text}`, variant: "info", duration: 1400 }));
        render();
      }
    },

    "upload-files": {
      html: `
        ${head("Modals · upload-files.tsx", "Upload files", "Drop files into the dialog: each gets its own progress bar and can be cancelled individually.")}
        ${trigger("uf-dlg", "Upload files")}
        ${dialog("uf-dlg", "Upload files", "PNG, PDF or ZIP up to 50 MB.", '<dv-dropzone multiple data-drop><strong>Drop files here</strong><span>or click to browse</span></dv-dropzone><ul class="dv-list" data-queue style="margin-top:12px"></ul>', '<button type="button" class="dv-btn" data-dv-close>Close</button>')}`,
      setup(root, ctx) {
        const queue = ctx.$("[data-queue]");
        let seen = 0;
        const enqueue = (f) => {
          const li = document.createElement("li");
          li.style.flexWrap = "wrap";
          li.innerHTML = `<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis"></span><span class="xp-mono dv-muted" data-pct>0%</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cancel>Cancel</button><progress class="dv-progress" max="100" value="0" style="flex-basis:100%"></progress>`;
          li.firstChild.textContent = f.name;
          queue.appendChild(li);
          const bar = li.querySelector("progress");
          const id = ctx.every(120, () => {
            bar.value = Math.min(100, bar.value + 5 + Math.random() * 12);
            li.querySelector("[data-pct]").textContent = `${Math.round(bar.value)}%`;
            if (bar.value >= 100) {
              clearInterval(id);
              li.querySelector("[data-cancel]").outerHTML = '<span class="dv-badge dv-badge--success">Done</span>';
            }
          });
          li.querySelector("[data-cancel]").addEventListener("click", () => {
            clearInterval(id);
            li.remove();
          });
        };
        ctx.on(ctx.$("[data-drop]"), "dv-change", (e) => {
          e.detail.files.slice(seen).forEach(enqueue);
          seen = e.detail.files.length;
          ctx.$("[data-drop] .dv-dropzone__files").hidden = true;
        });
      }
    },

    "command-palette": {
      html: `
        ${head("Modals · command-palette.tsx", "Command palette", "A real <dv-command>: grouped, fuzzy-ranked commands that actually do things on this page.")}
        <div class="xp-center" style="min-height:200px"><div class="dv-stack" style="align-items:center"><button type="button" class="dv-btn dv-btn--primary" data-dv-open="cp-cmd">Open command palette</button><div class="dv-row"><span class="dv-badge" data-count>Counter: 0</span><span class="dv-badge" data-mode>Mode: calm</span></div></div></div>
        <dv-command id="cp-cmd" placeholder="Type a command…">
          <button class="dv-command__item" data-group="Counter" data-value="inc">Increment counter <kbd class="dv-kbd">+</kbd></button>
          <button class="dv-command__item" data-group="Counter" data-value="dec">Decrement counter <kbd class="dv-kbd">−</kbd></button>
          <button class="dv-command__item" data-group="Counter" data-value="reset">Reset counter</button>
          <button class="dv-command__item" data-group="Appearance" data-value="theme" data-keywords="dark light">Toggle theme</button>
          <button class="dv-command__item" data-group="Appearance" data-value="mode" data-keywords="focus loud">Switch mode</button>
          <button class="dv-command__item" data-group="Help" data-value="toast" data-keywords="hello">Say hello</button>
        </dv-command>`,
      setup(root, ctx) {
        let n = 0;
        let loud = false;
        ctx.on(ctx.$("#cp-cmd"), "dv-select", (e) => {
          const v = e.detail.value;
          if (v === "inc") n++;
          if (v === "dec") n--;
          if (v === "reset") n = 0;
          if (v === "theme") DevlUI.setTheme(DevlUI.getTheme() === "dark" ? "light" : "dark");
          if (v === "mode") loud = !loud;
          if (v === "toast") ctx.toast({ title: "Hello from the palette 👋" });
          ctx.$("[data-count]").textContent = `Counter: ${n}`;
          ctx.$("[data-mode]").textContent = `Mode: ${loud ? "loud" : "calm"}`;
          ctx.$("[data-mode]").className = `dv-badge${loud ? " dv-badge--warning" : ""}`;
        });
      }
    },

    feedback: {
      html: `
        ${head("Modals · feedback.tsx", "Feedback", "Pick a sentiment, write a message (required) and optionally attach a screenshot — then see the thank-you state.")}
        ${trigger("fb-dlg", "Send feedback", "")}
        ${dialog("fb-dlg", "How's it going?", "", `<form class="dv-stack" data-form novalidate><dv-segmented value="good" data-mood><button class="dv-segmented__item" value="bad">😞</button><button class="dv-segmented__item" value="ok">😐</button><button class="dv-segmented__item" value="good">🙂</button><button class="dv-segmented__item" value="great">🤩</button></dv-segmented><textarea class="dv-textarea" data-msg placeholder="Tell us more…" aria-label="Message"></textarea><span class="dv-error" data-err></span><label class="dv-choice"><input type="checkbox" class="dv-check" data-shot checked /> Include a screenshot</label><div class="dv-row" style="justify-content:flex-end"><button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="submit" class="dv-btn dv-btn--primary">Send</button></div></form><div data-thanks hidden class="dv-empty" style="border:0"><div class="dv-empty__title">Thank you! 💌</div><p class="dv-empty__desc">We read every message.</p><button type="button" class="dv-btn" data-dv-close>Close</button></div>`, "")}`,
      setup(root, ctx) {
        const dlg = ctx.$("#fb-dlg");
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const msg = ctx.$("[data-msg]");
          if (msg.value.trim().length < 5) {
            ctx.$("[data-err]").textContent = "Please write at least 5 characters.";
            msg.setAttribute("aria-invalid", "true");
            return;
          }
          e.target.hidden = true;
          ctx.$("[data-thanks]").hidden = false;
        });
        ctx.on(dlg, "close", () => {
          ctx.$("[data-form]").hidden = false;
          ctx.$("[data-form]").reset();
          ctx.$("[data-thanks]").hidden = true;
          ctx.$("[data-err]").textContent = "";
        });
      }
    },

    shortcuts: {
      html: `
        ${head("Modals · shortcuts.tsx", "Keyboard shortcuts", "Searchable cheatsheet. While it's open, pressing a key highlights every shortcut that uses it.")}
        ${trigger("sc-dlg", "Show shortcuts", "")}
        ${dialog("sc-dlg", "Keyboard shortcuts", "Press any key to highlight it.", '<input class="dv-input" data-q placeholder="Filter…" aria-label="Filter shortcuts" /><ul class="dv-list" data-list style="margin-top:10px;max-height:300px;overflow:auto"></ul>', '<button type="button" class="dv-btn" data-dv-close>Close</button>')}`,
      setup(root, ctx) {
        const list = [["Open command palette", ["⌘", "K"]], ["Search", ["/"]], ["New issue", ["C"]], ["Go to inbox", ["G", "I"]], ["Toggle sidebar", ["⌘", "B"]], ["Toggle theme", ["T"]], ["Save", ["⌘", "S"]], ["Undo", ["⌘", "Z"]], ["Close dialog", ["Esc"]]];
        let hot = "";
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = list
            .filter(([n, k]) => `${n} ${k.join(" ")}`.toLowerCase().includes(q))
            .map(([n, keys]) => `<li><span style="flex:1">${n}</span>${keys.map((k) => `<kbd class="dv-kbd" style="${k.toLowerCase() === hot ? "background:var(--xp-accent);color:#fff;border-color:transparent" : ""}">${k}</kbd>`).join(" ")}</li>`)
            .join("");
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("#sc-dlg"), "keydown", (e) => {
          if (e.target.matches("input")) return;
          hot = e.key === "Meta" ? "⌘" : e.key === "Escape" ? "esc" : e.key.toLowerCase();
          render();
        });
        render();
      }
    },

    upgrade: {
      html: `
        ${head("Modals · upgrade.tsx", "Upgrade plan", "Compare plans inside the dialog, toggle billing period and confirm — your current plan badge updates.")}
        <div class="xp-center" style="min-height:220px"><div class="dv-stack" style="align-items:center"><span class="dv-badge dv-badge--outline" data-current>Current plan: Free</span><button type="button" class="dv-btn dv-btn--accent" data-dv-open="up-dlg">✦ Upgrade</button></div></div>
        ${dialog("up-dlg", "Unlock more with Pro", "", `<div class="dv-stack"><dv-segmented value="year" data-period><button class="dv-segmented__item" value="month">Monthly</button><button class="dv-segmented__item" value="year">Yearly −20%</button></dv-segmented><table class="dv-table dv-table--compact"><thead><tr><th></th><th>Free</th><th>Pro</th></tr></thead><tbody><tr><td>Projects</td><td>3</td><td>Unlimited</td></tr><tr><td>Members</td><td>2</td><td>25</td></tr><tr><td>Custom domain</td><td>—</td><td>✓</td></tr><tr><td>Priority support</td><td>—</td><td>✓</td></tr></tbody></table><div class="dv-row"><span class="dv-muted">Total</span><span class="dv-spacer"></span><strong class="xp-num" style="font-size:22px" data-price></strong></div></div>`, '<button type="button" class="dv-btn" data-dv-close>Maybe later</button><button type="button" class="dv-btn dv-btn--accent" data-dv-close="go">Upgrade now</button>', ' style="width:min(520px,calc(100vw - 32px))"')}`,
      setup(root, ctx) {
        const price = () => {
          const y = (ctx.$("[data-period]").value || "year") === "year";
          ctx.$("[data-price]").textContent = y ? "$230 / year" : "$24 / month";
        };
        ctx.on(ctx.$("[data-period]"), "dv-change", price);
        ctx.on(ctx.$("#up-dlg"), "close", (e) => {
          if (e.target.returnValue !== "go") return;
          ctx.$("[data-current]").textContent = `Current plan: Pro (${(ctx.$("[data-period]").value || "year") === "year" ? "yearly" : "monthly"})`;
          ctx.$("[data-current]").className = "dv-badge dv-badge--accent";
          ctx.toast({ title: "Welcome to Pro ✦" });
          e.target.returnValue = "";
        });
        price();
      }
    },

    export: {
      html: `
        ${head("Modals · export.tsx", "Export data", "Pick a format, date range and columns; the export runs with progress and downloads a real CSV or JSON file.")}
        ${trigger("ex-dlg", "Export…", "")}
        ${dialog("ex-dlg", "Export orders", "", `<div class="dv-stack"><div class="dv-row"><label class="dv-choice"><input type="radio" class="dv-check" name="ex-fmt" value="csv" checked /> CSV</label><label class="dv-choice"><input type="radio" class="dv-check" name="ex-fmt" value="json" /> JSON</label></div><div class="dv-row"><label class="dv-field" style="flex:1"><span class="dv-label">From</span><input type="date" class="dv-input" data-from value="2026-09-01" /></label><label class="dv-field" style="flex:1"><span class="dv-label">To</span><input type="date" class="dv-input" data-to value="2026-10-14" /></label></div><span class="dv-label">Columns</span><div class="dv-row">${["id", "customer", "total", "status", "date"].map((c) => `<label class="dv-choice"><input type="checkbox" class="dv-check" data-col value="${c}" checked /> ${c}</label>`).join("")}</div><progress class="dv-progress" max="100" value="0" data-bar hidden></progress><span class="dv-error" data-err></span></div>`, '<button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="button" class="dv-btn dv-btn--primary" data-go>Export</button>')}`,
      setup(root, ctx) {
        const rows = Array.from({ length: 40 }, (_, i) => ({ id: `#${1040 + i}`, customer: ["Acme", "Globex", "Initech", "Hooli"][i % 4], total: (20 + ((i * 37) % 380)).toFixed(2), status: ["paid", "shipped", "pending"][i % 3], date: new Date(Date.UTC(2026, 8, 1) + i * 864e5).toISOString().slice(0, 10) }));
        ctx.on(ctx.$("[data-go]"), "click", (e) => {
          const cols = ctx.$$("[data-col]:checked").map((c) => c.value);
          const from = ctx.$("[data-from]").value;
          const to = ctx.$("[data-to]").value;
          const err = !cols.length ? "Select at least one column." : from > to ? "“From” must be before “To”." : "";
          ctx.$("[data-err]").textContent = err;
          if (err) return;
          const fmt = ctx.$('[name="ex-fmt"]:checked').value;
          const data = rows.filter((r) => r.date >= from && r.date <= to).map((r) => Object.fromEntries(cols.map((c) => [c, r[c]])));
          const bar = ctx.$("[data-bar]");
          bar.hidden = false;
          bar.value = 0;
          e.target.disabled = true;
          const id = ctx.every(60, () => {
            bar.value += 10;
            if (bar.value < 100) return;
            clearInterval(id);
            e.target.disabled = false;
            const text = fmt === "json" ? JSON.stringify(data, null, 2) : [cols.join(",")].concat(data.map((r) => cols.map((c) => r[c]).join(","))).join("\n");
            DEVL_XP.download(`orders.${fmt}`, text, fmt === "json" ? "application/json" : "text/csv");
            ctx.toast({ title: `Exported ${data.length} rows`, description: `orders.${fmt}` });
            ctx.$("#ex-dlg").close();
            bar.hidden = true;
          });
        });
      }
    },

    "create-workspace": {
      html: () => `
        ${head("Modals · create-workspace.tsx", "Create workspace", "Name → slug, region and icon, validated in the dialog. New workspaces appear in the switcher behind it.")}
        <div class="dv-row"><div class="dv-row" data-list style="--gap:6px"></div><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary" data-dv-open="cw-dlg">+ New workspace</button></div>
        ${dialog("cw-dlg", "Create a workspace", "", `<form class="dv-stack" data-xp-form data-success="Workspace “{name}” created" data-reset novalidate>
          <div class="dv-row" data-icons>${["🚀", "🎨", "🧪", "📦", "🌿"].map((i, k) => `<button type="button" class="dv-btn dv-btn--icon" data-i="${i}" aria-pressed="${k === 0}">${i}</button>`).join("")}</div>
          ${field({ name: "name", label: "Name", placeholder: "Acme design", minlength: 2 })}
          <span class="dv-hint xp-mono" data-slug>devl.dev/…</span>
          <label class="dv-field"><span class="dv-label">Region</span><select class="dv-select" name="region"><option>us-east-1</option><option>eu-central-1</option><option>ap-south-1</option></select></label>
          <div class="dv-row" style="justify-content:flex-end"><button type="button" class="dv-btn" data-dv-close>Cancel</button><button type="submit" class="dv-btn dv-btn--primary">Create</button></div>
        </form>`, "")}`,
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        let icon = "🚀";
        const list = [["🏢", "Acme"]];
        const render = () => (ctx.$("[data-list]").innerHTML = list.map(([i, n]) => `<span class="dv-chip" style="color:var(--dv-fg)">${i} ${esc(n)}</span>`).join(""));
        const name = ctx.$('[name="name"]');
        ctx.on(name, "input", () => (ctx.$("[data-slug]").textContent = `devl.dev/${name.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "…"}`));
        ctx.on(ctx.$("[data-icons]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          icon = b.dataset.i;
          ctx.$$("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        });
        ctx.on(ctx.$("form"), "xp-submit", (e) => {
          list.push([icon, e.detail.name]);
          render();
          ctx.$("#cw-dlg").close();
          ctx.$("[data-slug]").textContent = "devl.dev/…";
        });
        render();
      }
    },

    "two-factor": {
      html: `
        ${head("Modals · two-factor.tsx", "Two-factor setup", "Three-step modal: confirm your password (any 8+ chars), enter a code (any 6 digits), save recovery codes.")}
        <div class="xp-center" style="min-height:220px"><div class="dv-stack" style="align-items:center"><span class="dv-badge" data-state>2FA: off</span><button type="button" class="dv-btn dv-btn--primary" data-dv-open="tf-dlg">Enable two-factor</button></div></div>
        ${dialog("tf-dlg", "Enable two-factor authentication", "", `<ol class="dv-steps" style="margin-bottom:14px" data-steps><li aria-current="step">Password</li><li>Code</li><li>Recovery</li></ol>
          <form data-p="0" class="dv-stack" novalidate><input class="dv-input" type="password" data-pw placeholder="Current password" aria-label="Current password" autocomplete="current-password" /><span class="dv-error" data-err></span><button type="submit" class="dv-btn dv-btn--primary">Continue</button></form>
          <div data-p="1" hidden class="dv-stack" style="align-items:center"><span class="dv-muted">Enter the 6-digit code from your app</span><dv-otp length="6" data-otp></dv-otp></div>
          <div data-p="2" hidden class="dv-stack"><pre class="dv-code" data-codes></pre><button type="button" class="dv-btn dv-btn--primary" data-dv-close="done">I've saved them</button></div>`, "")}`,
      setup(root, ctx) {
        const dlg = ctx.$("#tf-dlg");
        const go = (i) => {
          ctx.$$("[data-p]").forEach((p) => (p.hidden = Number(p.dataset.p) !== i));
          ctx.$$("[data-steps] li").forEach((li, k) => {
            li.removeAttribute("aria-current");
            li.removeAttribute("data-state");
            if (k < i) li.dataset.state = "done";
            if (k === i) li.setAttribute("aria-current", "step");
          });
          if (i === 1) ctx.$("[data-otp] input").focus();
        };
        ctx.on(ctx.$('[data-p="0"]'), "submit", (e) => {
          e.preventDefault();
          const ok = ctx.$("[data-pw]").value.length >= 8;
          ctx.$("[data-err]").textContent = ok ? "" : "Password must be at least 8 characters.";
          if (ok) go(1);
        });
        ctx.on(ctx.$("[data-otp]"), "dv-complete", () => {
          ctx.$("[data-codes]").textContent = Array.from({ length: 6 }, () => Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 7)).join("\n");
          go(2);
        });
        ctx.on(dlg, "close", () => {
          if (dlg.returnValue === "done") {
            ctx.$("[data-state]").textContent = "2FA: on";
            ctx.$("[data-state]").className = "dv-badge dv-badge--success";
            ctx.toast({ title: "Two-factor enabled" });
          }
          dlg.returnValue = "";
          ctx.$("[data-pw]").value = "";
          ctx.$("[data-otp]").clear();
          go(0);
        });
      }
    }
  });
})();
