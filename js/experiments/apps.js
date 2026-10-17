// ============================================================================
// Experimentos funcionales — Comandos y menús (9), Estados vacíos (10), Ajustes (12),
// Tarjetas (10), Modales (10)
// ============================================================================

(function () {
  "use strict";
  const X = window.TESELA_XP;
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
  // COMANDOS Y MENÚS
  // ==========================================================================
  X.addMany("command-menus", {
    "radial-pie-menu": {
      html: `
        ${head("Command & Menus · radial-pie-menu.tsx", "Menú radial circular", "Mantén presionado (o haz clic derecho) en cualquier parte del área, muévete hacia una porción y suelta para elegirla.")}
        <div class="xp-board" data-area style="cursor:crosshair;display:grid;place-items:center"><span class="tsl-muted" data-hint>Mantén presionado en cualquier parte</span><svg data-pie width="220" height="220" viewBox="-110 -110 220 220" style="position:absolute;display:none;pointer-events:none;overflow:visible"></svg></div>
        <div class="tsl-row"><span class="tsl-eyebrow">Última acción</span><strong data-last>—</strong></div>`,
      setup(root, ctx) {
        const area = ctx.$("[data-area]");
        const pie = ctx.$("[data-pie]");
        const items = ["Copiar", "Pegar", "Compartir", "Eliminar", "Renombrar", "Destacar"];
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
                return `<path d="M${p(a0, r)} L${p(a0, R)} A${R},${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 0 0 ${p(a0, r)} Z" fill="${i === active ? "var(--xp-accent)" : "var(--tsl-bg-elevated)"}" stroke="var(--tsl-border-strong)"/><text x="${Math.cos(mid) * 67}" y="${Math.sin(mid) * 67 - 2}" text-anchor="middle" font-size="16" fill="currentColor" style="fill:var(--tsl-fg)">${icons[i]}</text><text x="${Math.cos(mid) * 67}" y="${Math.sin(mid) * 67 + 14}" text-anchor="middle" font-size="9" style="fill:var(--tsl-fg-muted)">${label}</text>`;
              })
              .join("") + `<circle r="30" fill="var(--tsl-bg)" stroke="var(--tsl-border-strong)"/><text y="4" text-anchor="middle" font-size="10" style="fill:var(--tsl-fg-muted)">${active >= 0 ? items[active] : "cancelar"}</text>`;
        };
        const openAt = (e) => {
          const p = TESELA_XP.pointer(area, e);
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
          const p = TESELA_XP.pointer(area, e);
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
        ${head("Command & Menus · raycast-action-bar.tsx", "Barra de acciones tipo Raycast", "Lanzador con búsqueda aproximada. Enter abre las subacciones del elemento seleccionado; Esc regresa. Se controla por completo con el teclado.")}
        <div class="tsl-card" style="max-width:640px;width:100%;margin:0 auto">
          <div class="tsl-command__search"><span data-crumb class="tsl-badge tsl-badge--accent" hidden></span><input class="tsl-command__input" data-q placeholder="Busca apps y comandos…" aria-label="Buscar" /></div>
          <div class="tsl-command__list" data-list role="listbox" style="max-height:300px"></div>
          <div class="tsl-command__footer"><span data-sel></span><span><kbd class="tsl-kbd">↵</kbd> acciones · <kbd class="tsl-kbd">esc</kbd> atrás</span></div>
        </div>`,
      setup(root, ctx) {
        const items = [
          { name: "Crear incidencia", kind: "Linear", actions: ["Crear en Ingeniería", "Crear en Diseño", "Copiar plantilla"] },
          { name: "Buscar documentación", kind: "Comando", actions: ["Abrir documentación de tesela-ui", "Buscar en MDN", "Buscar en GitHub"] },
          { name: "Alternar modo oscuro", kind: "Sistema", actions: ["Alternar ahora", "Programar al atardecer"] },
          { name: "Historial del portapapeles", kind: "Extensión", actions: ["Abrir", "Borrar historial"] },
          { name: "Figma", kind: "Aplicación", actions: ["Abrir", "Abrir archivo reciente", "Salir"] },
          { name: "Calculadora", kind: "Extensión", actions: ["Abrir", "Convertir moneda"] }
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
            ? rows.map((r, i) => `<button type="button" class="tsl-command__item" role="option" aria-selected="${i === idx}" data-i="${i}">${mode ? `<span>⚡</span>${esc(r)}` : `<span class="tsl-avatar tsl-avatar--sm tsl-avatar--square">${r.name[0]}</span>${esc(r.name)}<span class="tsl-nav__meta">${r.kind}</span>`}</button>`).join("")
            : '<div class="tsl-command__empty">Sin resultados</div>';
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
            input.placeholder = `Acciones para ${r.name}…`;
          } else {
            ctx.toast({ title: r, description: mode.name });
            mode = null;
            input.value = "";
            input.placeholder = "Busca apps y comandos…";
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
            input.placeholder = "Busca apps y comandos…";
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
        ${head("Command & Menus · breadcrumb-dropdown-tree.tsx", "Menú de árbol en migas de pan", "Cada miga es un menú con sus elementos hermanos. Salta de lado desde cualquier nivel o profundiza desde la vista de carpetas.")}
        <nav class="tsl-row xp-panel" style="padding:8px;--gap:2px" data-crumbs aria-label="Ruta"></nav>
        <ul class="tsl-list" data-children></ul>`,
      setup(root, ctx) {
        const tree = { Acme: { Ingeniería: { Web: { "tesela-ui": {}, Galería: {} }, API: { Autenticación: {}, Facturación: {} } }, Diseño: { Tokens: {}, Iconos: {} }, Marketing: { Sitio: {}, Blog: {} } } };
        let path = ["Acme", "Ingeniería", "Web"];
        const nodeAt = (p) => p.reduce((n, k) => n[k], tree);
        const render = () => {
          const crumbs = ctx.$("[data-crumbs]");
          crumbs.innerHTML = "";
          path.forEach((seg, i) => {
            const siblings = Object.keys(i === 0 ? tree : nodeAt(path.slice(0, i)));
            if (i) crumbs.insertAdjacentHTML("beforeend", '<span class="tsl-muted">/</span>');
            const menu = document.createElement("tsl-menu");
            menu.innerHTML = `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-tsl-trigger${i === path.length - 1 ? ' aria-current="page"' : ""}>${esc(seg)} ▾</button><div class="tsl-menu__list">${siblings.map((s) => `<button type="button" class="tsl-menu__item" data-value="${esc(s)}">${s === seg ? "✓ " : ""}${esc(s)}</button>`).join("")}</div>`;
            menu.addEventListener("tsl-select", (e) => {
              const next = path.slice(0, i).concat(e.detail.value);
              let n = nodeAt(next);
              while (Object.keys(n).length && next.length < i + 1) next.push(Object.keys(n)[0]);
              path = next;
              render();
            });
            crumbs.appendChild(menu);
          });
          const kids = Object.keys(nodeAt(path));
          ctx.$("[data-children]").innerHTML = kids.length ? kids.map((k) => `<li class="xp-select-item" data-k="${esc(k)}"><span>📁</span><span style="flex:1">${esc(k)}</span><span class="tsl-muted">${Object.keys(nodeAt(path)[k]).length} elementos ›</span></li>`).join("") : '<li class="tsl-muted">📄 Carpeta vacía — llegaste al final</li>';
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
        ${head("Command & Menus · context-menu-nested.tsx", "Menú contextual anidado", "Haz clic derecho en un archivo (o presiona Shift+F10 sobre él). Los submenús se abren al pasar el cursor o con →; los elementos con marca alternan opciones de vista.")}
        <div class="xp-panel xp-rel" data-area style="min-height:320px">
          <div class="tsl-grid" style="--min:140px" data-files></div>
          <div class="tsl-menu__list" data-menu hidden style="position:absolute;min-width:210px"></div>
          <div class="tsl-menu__list" data-sub hidden style="position:absolute;min-width:160px"></div>
        </div>`,
      setup(root, ctx) {
        const area = ctx.$("[data-area]");
        const menu = ctx.$("[data-menu]");
        const sub = ctx.$("[data-sub]");
        const folders = ["Entrada", "Archivo", "Diseño", "Clientes"];
        let files = [["Brief.pdf", "Entrada"], ["Logo.svg", "Diseño"], ["T3.xlsx", "Entrada"], ["Contrato.docx", "Clientes"], ["Moodboard.png", "Diseño"]];
        const view = { grid: true, ext: true };
        let target = null;
        const renderFiles = () => {
          ctx.$("[data-files]").innerHTML = files.map(([n, f], i) => `<button type="button" class="tsl-card tsl-card--flat" data-f="${i}" style="padding:14px;text-align:left;cursor:context-menu;color:inherit;font:inherit"><div style="font-size:22px">📄</div><strong>${esc(view.ext ? n : n.replace(/\.\w+$/, ""))}</strong><div class="tsl-muted" style="font-size:11px">${esc(f)}</div></button>`).join("");
          ctx.$("[data-files]").style.setProperty("--min", view.grid ? "140px" : "100%");
        };
        const close = () => {
          menu.hidden = true;
          sub.hidden = true;
        };
        const openAt = (x, y, i) => {
          target = i;
          menu.innerHTML = `<div class="tsl-menu__label">${esc(files[i][0])}</div><button type="button" class="tsl-menu__item" data-a="open">Abrir <kbd class="tsl-kbd">↵</kbd></button><button type="button" class="tsl-menu__item" data-a="dup">Duplicar <kbd class="tsl-kbd">⌘D</kbd></button><button type="button" class="tsl-menu__item" data-a="move">Mover a <span style="margin-left:auto">▸</span></button><div class="tsl-menu__sep"></div><button type="button" class="tsl-menu__item" data-a="grid">${view.grid ? "✓" : "  "} Vista de cuadrícula</button><button type="button" class="tsl-menu__item" data-a="ext">${view.ext ? "✓" : "  "} Mostrar extensiones</button><div class="tsl-menu__sep"></div><button type="button" class="tsl-menu__item tsl-menu__item--danger" data-a="del">Eliminar <kbd class="tsl-kbd">⌫</kbd></button>`;
          const r = area.getBoundingClientRect();
          menu.hidden = false;
          menu.style.left = `${Math.min(x, r.width - 220)}px`;
          menu.style.top = `${Math.min(y, r.height - 240)}px`;
          menu.querySelector(".tsl-menu__item").focus();
        };
        const openSub = (btn) => {
          sub.innerHTML = folders.map((f) => `<button type="button" class="tsl-menu__item" data-to="${f}">${f === files[target][1] ? "✓ " : ""}${f}</button>`).join("");
          sub.hidden = false;
          sub.style.left = `${menu.offsetLeft + menu.offsetWidth - 4}px`;
          sub.style.top = `${menu.offsetTop + btn.offsetTop - 5}px`;
        };
        ctx.on(area, "contextmenu", (e) => {
          const card = e.target.closest("[data-f]");
          if (!card) return close();
          e.preventDefault();
          const p = TESELA_XP.pointer(area, e);
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
          const items = Array.from(menu.querySelectorAll(".tsl-menu__item"));
          const i = items.indexOf(document.activeElement);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
          } else if (e.key === "ArrowRight" && document.activeElement.dataset.a === "move") {
            openSub(document.activeElement);
            sub.querySelector(".tsl-menu__item").focus();
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        });
        ctx.on(sub, "keydown", (e) => {
          const items = Array.from(sub.querySelectorAll(".tsl-menu__item"));
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
          if (a === "open") ctx.toast({ title: `Se abrió ${files[target][0]}`, variant: "info" });
          if (a === "dup") files.splice(target + 1, 0, [files[target][0].replace(/(\.\w+)$/, " copia$1"), files[target][1]]);
          if (a === "del") files.splice(target, 1);
          if (a === "grid" || a === "ext") view[a] = !view[a];
          close();
          renderFiles();
        });
        ctx.on(sub, "click", (e) => {
          const b = e.target.closest("[data-to]");
          if (!b) return;
          files[target][1] = b.dataset.to;
          ctx.toast({ title: `Movido a ${b.dataset.to}` });
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
        ${head("Command & Menus · floating-slash-menu.tsx", "Menú flotante con barra diagonal", "Editor de bloques: escribe “/” en un bloque vacío para convertirlo en título, tarea, cita, código o separador. Enter crea un bloque nuevo.")}
        <div class="xp-panel xp-rel" style="max-width:760px;width:100%;margin:0 auto">
          <div data-blocks class="tsl-stack" style="--gap:4px"></div>
          <div class="tsl-menu__list" data-menu hidden style="position:absolute;min-width:240px"></div>
        </div>`,
      setup(root, ctx) {
        const types = [["h1", "Título", "Título de sección grande"], ["todo", "Tarea", "Da seguimiento a una tarea"], ["quote", "Cita", "Captura una cita"], ["code", "Código", "Fragmento monoespaciado"], ["divider", "Separador", "Pausa visual"], ["p", "Texto", "Párrafo simple"]];
        const wrap = ctx.$("[data-blocks]");
        const menu = ctx.$("[data-menu]");
        let current = null;
        let sel = 0;
        const style = { h1: "font-family:var(--tsl-font-heading);font-size:24px;font-weight:600", quote: "border-left:3px solid var(--xp-accent);padding-left:12px;font-style:italic", code: "font-family:var(--tsl-font-mono);background:var(--tsl-bg-elevated);padding:8px 10px;border-radius:6px", p: "", todo: "" };
        const make = (type = "p", text = "") => {
          const row = document.createElement("div");
          row.className = "tsl-row";
          row.style.flexWrap = "nowrap";
          row.dataset.type = type;
          if (type === "divider") {
            row.innerHTML = '<div class="tsl-divider" style="flex:1;margin:10px 0"></div>';
            return row;
          }
          row.innerHTML = `${type === "todo" ? '<input type="checkbox" class="tsl-check" aria-label="Hecho" />' : ""}<div contenteditable="true" data-ph="Escribe “/” para ver los comandos" style="flex:1;outline:none;min-height:24px;padding:3px 0;${style[type]}"></div>`;
          row.lastChild.textContent = text;
          return row;
        };
        const showMenu = (edit) => {
          const q = edit.textContent.slice(1).toLowerCase();
          const hits = types.filter(([, n]) => n.toLowerCase().includes(q));
          if (!hits.length) return (menu.hidden = true);
          sel = Math.min(sel, hits.length - 1);
          menu.innerHTML = hits.map(([t, n, d], i) => `<button type="button" class="tsl-menu__item" data-t="${t}" style="${i === sel ? "background:var(--tsl-surface-strong)" : ""}"><strong style="width:70px">${n}</strong><span class="tsl-nav__meta">${d}</span></button>`).join("");
          menu.hidden = false;
          menu.style.left = `${edit.offsetLeft}px`;
          menu.style.top = `${edit.closest(".tsl-row").offsetTop + edit.offsetHeight + 24}px`;
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
        wrap.append(make("h1", "Plan de lanzamiento"), make("p", "Escribe / en la línea vacía de abajo."), make("todo", "Publicar la galería de tesela-ui"), make("p"));
      }
    },

    "multi-step-omni-search": {
      html: `
        ${head("Command & Menus · multi-step-omni-search.tsx", "Búsqueda universal por pasos", "Elige primero un ámbito (se convierte en una ficha) y luego busca dentro de él. Retroceso con la consulta vacía quita el ámbito.")}
        <div class="tsl-card" style="max-width:720px;width:100%;margin:0 auto">
          <div class="tsl-command__search"><span class="tsl-chip" data-token hidden style="color:var(--tsl-fg)"></span><input class="tsl-command__input" data-q placeholder="Busca en todo o elige un ámbito…" aria-label="Buscar" /></div>
          <div class="xp-split" style="--cols:minmax(0,1fr) 260px;border:0;border-radius:0;--h:300px"><div class="tsl-command__list" data-list style="max-height:300px"></div><div class="xp-pane" data-preview><span class="tsl-muted">Vista previa</span></div></div>
        </div>`,
      setup(root, ctx) {
        const data = {
          Incidencias: [["DEV-120", "Orden de resultados de la paleta"], ["DEV-121", "Foco del panel lateral"], ["DEV-125", "Idioma del calendario"]],
          Personas: [["Ana López", "Líder de diseño"], ["Leo Kim", "Ingeniero"], ["Sara Ruiz", "PM"]],
          Documentos: [["Diálogo", "Guía del diálogo nativo"], ["Tokens", "Temas con --tsl-*"], ["Tablas", "Tablas de datos ordenables"]]
        };
        let scope = null;
        let idx = 0;
        let rows = [];
        const input = ctx.$("[data-q]");
        const render = () => {
          const q = input.value.toLowerCase();
          if (!scope && !q) rows = Object.keys(data).map((s) => ({ scope: true, title: s, sub: `${data[s].length} elementos` }));
          else {
            const pools = scope ? [[scope, data[scope]]] : Object.entries(data);
            rows = pools.flatMap(([s, list]) => list.filter(([t, d]) => `${t} ${d}`.toLowerCase().includes(q)).map(([t, d]) => ({ title: t, sub: d, group: s })));
          }
          idx = Math.min(idx, Math.max(0, rows.length - 1));
          ctx.$("[data-list]").innerHTML = rows.map((r, i) => `<button type="button" class="tsl-command__item" aria-selected="${i === idx}" data-i="${i}">${r.scope ? "⌕ Buscar en" : ""} <strong>${esc(r.title)}</strong><span class="tsl-nav__meta">${esc(r.group || r.sub)}</span></button>`).join("") || '<div class="tsl-command__empty">Sin resultados</div>';
          const cur = rows[idx];
          ctx.$("[data-preview]").innerHTML = cur ? `<span class="tsl-eyebrow">${esc(cur.group || "Ámbito")}</span><h3 class="xp-title" style="font-size:18px"></h3><p class="tsl-muted"></p>` : '<span class="tsl-muted">Sin selección</span>';
          if (cur) {
            ctx.$("[data-preview] h3").textContent = cur.title;
            ctx.$("[data-preview] p").textContent = cur.sub;
          }
          ctx.$("[data-token]").hidden = !scope;
          ctx.$("[data-token]").textContent = scope ? `en: ${scope}` : "";
        };
        const choose = () => {
          const r = rows[idx];
          if (!r) return;
          if (r.scope) {
            scope = r.title;
            input.value = "";
            idx = 0;
            input.placeholder = `Buscar en ${scope}…`;
            render();
          } else ctx.toast({ title: `Abrir ${r.title}`, description: r.group });
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
            input.placeholder = "Busca en todo o elige un ámbito…";
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
        ${head("Command & Menus · keyboard-chord-hud.tsx", "HUD de combinaciones de teclas", "Combinaciones con tecla líder al estilo Vim. Presiona g y luego h / i / s, o n y luego i / p. El HUD muestra lo que puede seguir. Presiona ? para ver la guía rápida.")}
        <div class="xp-panel tsl-stack" data-xp-keys style="align-items:center;min-height:200px;justify-content:center" tabindex="0">
          <div class="tsl-row" data-hud style="min-height:40px"><span class="tsl-muted">Esperando una combinación…</span></div>
          <div class="tsl-row" data-next></div>
        </div>
        <div class="tsl-grid" style="--min:280px;align-items:start"><div><span class="tsl-eyebrow">Ejecutadas</span><ol class="tsl-timeline" style="margin-top:10px" data-log></ol></div><div class="xp-panel" data-sheet hidden></div></div>`,
      setup(root, ctx) {
        const chords = { g: { h: "Ir al inicio", i: "Ir a la bandeja de entrada", s: "Ir a ajustes" }, n: { i: "Nueva incidencia", p: "Nuevo proyecto" }, t: { t: "Alternar vista previa del tema" } };
        let leader = null;
        let timer = 0;
        const kbd = (k) => `<kbd class="tsl-kbd" style="font-size:16px;padding:6px 10px">${k}</kbd>`;
        const reset = () => {
          leader = null;
          ctx.$("[data-hud]").innerHTML = '<span class="tsl-muted">Esperando una combinación…</span>';
          ctx.$("[data-next]").innerHTML = "";
        };
        ctx.$("[data-sheet]").innerHTML = `<span class="tsl-eyebrow">Guía rápida</span><ul class="tsl-list" style="margin-top:8px">${Object.entries(chords).flatMap(([l, m]) => Object.entries(m).map(([k, a]) => `<li>${kbd(l)} ${kbd(k)}<span class="tsl-list__end">${a}</span></li>`)).join("")}</ul>`;
        ctx.on(document, "keydown", (e) => {
          if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
          const k = e.key.toLowerCase();
          if (k === "?") {
            ctx.$("[data-sheet]").hidden = !ctx.$("[data-sheet]").hidden;
            return;
          }
          if (!leader && chords[k]) {
            leader = k;
            ctx.$("[data-hud]").innerHTML = `${kbd(k)} <span class="tsl-muted">luego…</span>`;
            ctx.$("[data-next]").innerHTML = Object.entries(chords[k]).map(([n, a]) => `<span class="tsl-badge tsl-badge--outline">${n} · ${a}</span>`).join("");
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
              if (action.includes("tema")) root.style.setProperty("--xp-accent", `hsl(${Math.random() * 360} 80% 60%)`);
            } else ctx.$("[data-hud]").innerHTML = `${kbd(leader)} ${kbd(k)} <span class="tsl-error" style="margin-left:8px">Combinación desconocida</span>`;
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
        ${head("Command & Menus · dock-magnifier-bar.tsx", "Barra dock con lupa", "Los íconos se escalan con una caída gaussiana alrededor del puntero. Haz clic para abrir: rebota y muestra un indicador de ejecución.")}
        <div class="xp-board" style="display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:16px">
          <div class="tsl-row" data-windows style="position:absolute;top:16px;left:16px"></div>
          <div data-dock style="display:flex;align-items:flex-end;gap:8px;padding:8px 12px;border-radius:18px;border:1px solid var(--tsl-border-strong);background:var(--tsl-bg-glass);backdrop-filter:blur(12px);height:72px"></div>
        </div>`,
      setup(root, ctx) {
        const apps = [["Finder", "🗂"], ["Correo", "✉️"], ["Música", "🎵"], ["Fotos", "🖼"], ["Notas", "📝"], ["Terminal", "⌨️"], ["Ajustes", "⚙️"]];
        const dock = ctx.$("[data-dock]");
        dock.innerHTML = apps.map(([n, i]) => `<button type="button" data-app="${n}" aria-label="${n}" data-tsl-tooltip="${n}" style="position:relative;width:48px;height:48px;border:0;border-radius:12px;background:var(--tsl-surface-strong);font-size:26px;cursor:pointer;transform-origin:bottom center;transition:transform .08s">${i}<span data-dot hidden style="position:absolute;bottom:-8px;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:var(--tsl-fg)"></span></button>`).join("");
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
            ctx.toast({ title: `${name} en primer plano`, variant: "neutral", duration: 1000 });
            return;
          }
          running.add(name);
          b.querySelector("[data-dot]").hidden = false;
          const w = document.createElement("span");
          w.className = "tsl-chip";
          w.style.color = "var(--tsl-fg)";
          w.innerHTML = `<span></span><button type="button" class="tsl-chip__remove" aria-label="Salir">✕</button>`;
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
        ${head("Command & Menus · tab-switcher-expose.tsx", "Selector de pestañas tipo exposé", "Abre la cuadrícula (botón o Ctrl+.), muévete con las flechas, Enter para cambiar y ✕ para cerrar. Las pestañas conservan el orden de uso más reciente.")}
        <div class="xp-panel" style="padding:0;overflow:hidden" data-xp-keys>
          <div class="tsl-row" style="padding:8px;border-bottom:1px solid var(--tsl-border);--gap:4px;flex-wrap:nowrap;overflow:auto" data-strip></div>
          <div class="xp-pane" style="min-height:240px" data-page></div>
        </div>
        <div class="tsl-row"><button type="button" class="tsl-btn" data-open>⊞ Exposé</button><button type="button" class="tsl-btn tsl-btn--subtle" data-new>+ Nueva pestaña</button></div>
        <div class="tsl-grid" data-grid hidden style="--min:200px"></div>`,
      setup(root, ctx) {
        let tabs = [{ t: "Documentación de tesela-ui", c: "#6366f1" }, { t: "Pull request #482", c: "#10b981" }, { t: "Figma — Tokens", c: "#f59e0b" }, { t: "Analítica", c: "#0ea5e9" }];
        let active = 0;
        let mru = tabs.map((_, i) => i);
        let sel = 0;
        let n = 0;
        const grid = ctx.$("[data-grid]");
        const render = () => {
          ctx.$("[data-strip]").innerHTML = tabs.map((tb, i) => `<button type="button" class="tsl-btn tsl-btn--sm ${i === active ? "" : "tsl-btn--subtle"}" data-tab="${i}" style="max-width:180px;overflow:hidden;text-overflow:ellipsis"><span class="tsl-dot" style="--_c:${tb.c}"></span> ${esc(tb.t)}</button>`).join("");
          const tab = tabs[active];
          ctx.$("[data-page]").innerHTML = tab ? `<div style="height:8px;border-radius:4px;background:${tab.c};width:40%"></div><h3 class="xp-title" style="font-size:20px;margin-top:14px"></h3><p class="tsl-muted">Este es el contenido de la pestaña activa.</p>` : '<div class="tsl-empty"><div class="tsl-empty__title">No hay pestañas abiertas</div></div>';
          if (tab) ctx.$("[data-page] h3").textContent = tab.t;
          grid.innerHTML = mru.map((i, k) => `<div class="tsl-card tsl-card--flat" data-pick="${i}" style="cursor:pointer;outline:${k === sel ? "2px solid var(--xp-accent)" : "none"}"><div style="height:70px;background:linear-gradient(135deg, ${tabs[i].c}, transparent)"></div><div class="tsl-row" style="padding:8px 10px"><span style="flex:1;font-size:12px">${esc(tabs[i].t)}</span><button type="button" class="tsl-chip__remove" data-close="${i}" aria-label="Cerrar pestaña">✕</button></div></div>`).join("");
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
          tabs.push({ t: `Pestaña nueva ${++n}`, c: `hsl(${(n * 67) % 360} 70% 55%)` });
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
  // ESTADOS VACÍOS
  // ==========================================================================
  const empty = (icon, title, desc, actions = "") => `<div class="tsl-empty"><div class="tsl-empty__icon" style="font-size:20px">${icon}</div><div class="tsl-empty__title">${title}</div><p class="tsl-empty__desc">${desc}</p>${actions ? `<div class="tsl-row" style="justify-content:center;margin-top:6px">${actions}</div>` : ""}</div>`;

  X.addMany("empty-states", {
    "inbox-zero": {
      html: `
        ${head("Empty states · inbox-zero.tsx", "Bandeja vacía", "Archiva los mensajes restantes para vaciar la bandeja y deshaz la acción si fuiste demasiado rápido.")}
        <ul class="tsl-list" data-list></ul>
        <div data-empty hidden>${empty("🧘", "Todo al día", "Bandeja vacía. Disfruta la calma: el correo nuevo llegará aquí.", '<button type="button" class="tsl-btn" data-undo>Deshacer último archivado</button>')}</div>`,
      setup(root, ctx) {
        const msgs = ["Ana — Notas de la revisión de diseño", "GitHub — 2 revisiones nuevas", "Stripe — Pago enviado", "Leo — ¿Comemos?"];
        const archived = [];
        const render = () => {
          ctx.$("[data-list]").innerHTML = msgs.map((m, i) => `<li><span style="flex:1">${esc(m)}</span><button type="button" class="tsl-btn tsl-btn--sm" data-a="${i}">Archivar</button></li>`).join("");
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
        ${head("Empty states · no-results.tsx", "Sin resultados", "Busca en la lista de componentes. Cuando nada coincide, aparecen sugerencias de “quisiste decir” y un botón para limpiar.")}
        <input class="tsl-input xp-search" style="max-width:360px" data-q placeholder="Prueba “botn” o “calendaro”" aria-label="Buscar" />
        <ul class="tsl-list" data-list></ul>
        <div data-empty hidden></div>`,
      setup(root, ctx) {
        const words = ["Botón", "Calendario", "Diálogo", "Panel lateral", "Tabla", "Pestañas", "Notificación", "Tooltip", "Avatar", "Insignia", "Paleta de comandos", "Zona de carga"];
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
            box.innerHTML = `<div class="tsl-empty"><div class="tsl-empty__icon">⌕</div><div class="tsl-empty__title">Sin resultados para “<span data-term></span>”</div><p class="tsl-empty__desc">¿Quisiste decir?</p><div class="tsl-row" style="justify-content:center">${sugg.map(([w]) => `<button type="button" class="tsl-chip" data-s="${esc(w)}">${esc(w)}</button>`).join("")}<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-clear>Limpiar búsqueda</button></div></div>`;
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
        ${head("Empty states · first-project.tsx", "Primer proyecto", "Empieza desde una plantilla; los proyectos aparecen en una cuadrícula. Elimínalos todos para volver al estado inicial.")}
        <div data-empty>${empty("✦", "Crea tu primer proyecto", "Los proyectos reúnen diseños, documentos y tareas. Empieza en blanco o desde una plantilla.")}
          <div class="tsl-grid" style="--min:180px;margin-top:16px" data-templates>
            ${[["En blanco", "⬜"], ["Página de aterrizaje", "🚀"], ["Panel de control", "📊"], ["App móvil", "📱"]].map(([n, i]) => `<button type="button" class="tsl-card tsl-card--interactive" data-t="${n}" style="padding:18px;text-align:left;color:inherit;font:inherit;cursor:pointer"><div style="font-size:24px">${i}</div><strong>${n}</strong></button>`).join("")}
          </div>
        </div>
        <div data-full hidden class="tsl-stack"><div class="tsl-row"><strong data-count></strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-new>+ Nuevo</button></div><div class="tsl-grid" style="--min:200px" data-projects></div></div>`,
      setup(root, ctx) {
        const projects = [];
        const render = () => {
          ctx.$("[data-empty]").hidden = !!projects.length;
          ctx.$("[data-full]").hidden = !projects.length;
          ctx.$("[data-count]").textContent = `${projects.length} proyecto${projects.length === 1 ? "" : "s"}`;
          ctx.$("[data-projects]").innerHTML = projects.map((p, i) => `<div class="tsl-card"><div class="tsl-card__body"><span class="tsl-eyebrow">${esc(p.t)}</span><strong style="display:block;margin-top:6px">${esc(p.n)}</strong><span class="tsl-muted" style="font-size:11px">Creado ${p.d}</span></div><div class="tsl-card__footer"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-del="${i}">Eliminar</button></div></div>`).join("");
        };
        const create = (t) => {
          projects.push({ t, n: `${t} ${projects.length + 1}`, d: new Date().toLocaleTimeString() });
          ctx.toast({ title: `Creado desde “${t}”` });
          render();
        };
        ctx.on(ctx.$("[data-templates]"), "click", (e) => {
          const b = e.target.closest("[data-t]");
          if (b) create(b.dataset.t);
        });
        ctx.on(ctx.$("[data-new]"), "click", () => create("En blanco"));
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
        ${head("Empty states · end-of-feed.tsx", "Fin del feed", "Lista infinita: carga más (o desplázate hasta el centinela) hasta que el feed se agote y aparezca el marcador de final.")}
        <div class="xp-scroll xp-panel" style="--max:420px" data-scroll><ul class="tsl-list" data-list></ul><div data-sentinel style="padding:16px;text-align:center"></div></div>`,
      setup(root, ctx) {
        let page = 0;
        const PAGES = 4;
        let loading = false;
        const list = ctx.$("[data-list]");
        const sentinel = ctx.$("[data-sentinel]");
        const load = () => {
          if (loading || page >= PAGES) return;
          loading = true;
          sentinel.innerHTML = '<span class="tsl-spinner" role="status" aria-label="Cargando"></span>';
          ctx.timeout(600, () => {
            for (let i = 0; i < 6; i++) list.insertAdjacentHTML("beforeend", `<li><span class="tsl-avatar tsl-avatar--sm">${"ALSM"[(page + i) % 4]}</span><div><div class="tsl-list__title">Actualización #${page * 6 + i + 1}</div><div class="tsl-list__desc">Publicado hace ${page * 6 + i + 1} h</div></div></li>`);
            page++;
            loading = false;
            sentinel.innerHTML = page >= PAGES ? `<div class="tsl-divider">Estás al día · ${page * 6} actualizaciones</div><button type="button" class="tsl-btn tsl-btn--sm" data-top>Volver arriba ↑</button>` : '<button type="button" class="tsl-btn tsl-btn--sm" data-more>Cargar más</button>';
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
        ${head("Empty states · no-team.tsx", "Sin compañeros", "Invita personas desde el estado vacío; la pila de avatares y la lista de miembros se llenan. Quita a todos para verlo de nuevo.")}
        <div data-empty>${empty("👥", "Aquí hay mucha calma", "Invita a tu equipo para colaborar en tiempo real.")}</div>
        <div data-full hidden class="tsl-row"><div class="tsl-avatar-group" data-stack></div><span class="tsl-muted" data-count></span></div>
        <form class="tsl-input-group" data-form style="max-width:420px;margin:0 auto;width:100%"><input class="tsl-input" type="email" required placeholder="companero@empresa.com" aria-label="Correo electrónico" /><button type="submit" class="tsl-btn tsl-btn--primary tsl-btn--sm" style="margin:3px">Invitar</button></form>
        <ul class="tsl-list" data-list style="max-width:420px;margin:0 auto;width:100%"></ul>`,
      setup(root, ctx) {
        const team = [];
        const render = () => {
          ctx.$("[data-empty]").hidden = !!team.length;
          ctx.$("[data-full]").hidden = !team.length;
          ctx.$("[data-stack]").innerHTML = team.slice(0, 5).map((e, i) => `<span class="tsl-avatar" style="--tsl-accent:hsl(${i * 70} 70% 55%)">${esc(e[0].toUpperCase())}</span>`).join("");
          ctx.$("[data-count]").textContent = `${team.length} miembro${team.length === 1 ? "" : "s"}`;
          ctx.$("[data-list]").innerHTML = team.map((e, i) => `<li><span style="flex:1">${esc(e)}</span><span class="tsl-badge tsl-badge--warning">Invitado</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-rm="${i}">Quitar</button></li>`).join("");
        };
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const input = e.target.querySelector("input");
          if (team.includes(input.value)) return ctx.toast({ title: "Ya fue invitado", variant: "warning" });
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
        ${head("Empty states · trash.tsx", "Vaciar papelera", "Restaura o elimina de forma permanente los elementos, o vacía toda la papelera después de confirmar.")}
        <div class="tsl-row"><span class="tsl-muted">Los elementos se eliminan para siempre después de 30 días.</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--danger tsl-btn--sm" data-tsl-open="trash-confirm" data-empty-btn>Vaciar papelera</button></div>
        <ul class="tsl-list" data-list></ul>
        <div data-empty hidden>${empty("🗑", "La papelera está vacía", "Los elementos eliminados aparecerán aquí durante 30 días.")}</div>
        <dialog class="tsl-dialog" id="trash-confirm"><div class="tsl-dialog__header"><h3 class="tsl-dialog__title">¿Vaciar la papelera?</h3><p class="tsl-dialog__desc">Todos los elementos se eliminarán de forma permanente.</p></div><div class="tsl-dialog__footer"><button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="button" class="tsl-btn tsl-btn--danger" data-tsl-close="yes">Eliminar para siempre</button></div></dialog>`,
      setup(root, ctx) {
        let items = [["Logo anterior.svg", 3], ["Informe T1.pdf", 12], ["Borrador — precios.md", 21], ["Captura 12.png", 28]];
        const render = () => {
          ctx.$("[data-list]").innerHTML = items.map(([n, d], i) => `<li><span style="flex:1">${esc(n)}</span><span class="tsl-badge ${30 - d < 5 ? "tsl-badge--danger" : ""}">${30 - d} d restantes</span><button type="button" class="tsl-btn tsl-btn--sm" data-restore="${i}">Restaurar</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-kill="${i}">Eliminar</button></li>`).join("");
          ctx.$("[data-list]").hidden = !items.length;
          ctx.$("[data-empty]").hidden = !!items.length;
          ctx.$("[data-empty-btn]").disabled = !items.length;
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const r = e.target.closest("[data-restore]");
          const k = e.target.closest("[data-kill]");
          if (r) ctx.toast({ title: `Se restauró ${items.splice(Number(r.dataset.restore), 1)[0][0]}` });
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
        ${head("Empty states · 404.tsx", "404", "Página perdida con búsqueda de páginas en vivo, botón para regresar y formulario para reportar enlaces rotos.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-stack" style="align-items:center;text-align:center;max-width:460px;width:100%">
          <div class="xp-num" style="font-size:96px;line-height:1;background:linear-gradient(135deg,var(--xp-accent),var(--tsl-info));-webkit-background-clip:text;background-clip:text;color:transparent">404</div>
          <h3 class="xp-title">Esta página se perdió por el camino</h3>
          <input class="tsl-input" data-q placeholder="Buscar páginas…" aria-label="Buscar páginas" />
          <ul class="tsl-list" style="width:100%;text-align:left" data-list></ul>
          <div class="tsl-row"><button type="button" class="tsl-btn" data-back>← Regresar</button><button type="button" class="tsl-btn tsl-btn--subtle" data-report>Reportar enlace roto</button></div>
          <form class="tsl-stack" data-form hidden style="width:100%;text-align:left"><textarea class="tsl-textarea" required placeholder="¿Dónde encontraste este enlace?" aria-label="Detalles"></textarea><button type="submit" class="tsl-btn tsl-btn--primary">Enviar reporte</button></form>
        </div></div>`,
      setup(root, ctx) {
        const pages = ["/", "/pricing", "/docs", "/docs/components", "/blog", "/changelog", "/careers", "/contact"];
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = pages.filter((p) => p.includes(q)).slice(0, 4).map((p) => `<li class="xp-select-item" data-p="${p}"><span class="xp-mono">${p}</span><span class="tsl-list__end tsl-muted">→</span></li>`).join("") || '<li class="tsl-muted">Ninguna página coincide</li>';
        };
        ctx.on(ctx.$("[data-q]"), "input", render);
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const li = e.target.closest("[data-p]");
          if (li) ctx.toast({ title: `Navegando a ${li.dataset.p}`, variant: "info" });
        });
        ctx.on(ctx.$("[data-back]"), "click", () => ctx.toast({ title: "history.back()", description: "Regresaste a la página anterior", variant: "neutral" }));
        ctx.on(ctx.$("[data-report]"), "click", () => (ctx.$("[data-form]").hidden = false));
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          e.target.hidden = true;
          e.target.reset();
          ctx.toast({ title: "¡Gracias! Corregiremos ese enlace." });
        });
        render();
      }
    },

    maintenance: {
      html: `
        ${head("Empty states · maintenance.tsx", "Mantenimiento", "Cuenta regresiva en vivo hasta el fin de la ventana, actualizaciones de estado y suscripción para recibir un aviso.")}
        <div class="xp-center" style="min-height:0"><div class="xp-panel tsl-stack" style="max-width:520px;width:100%;align-items:center;text-align:center">
          <span class="tsl-badge tsl-badge--warning tsl-badge--upper"><span class="tsl-dot tsl-dot--warning tsl-dot--pulse"></span> Mantenimiento programado</span>
          <h3 class="xp-title">Estamos actualizando la base de datos</h3>
          <div class="xp-num xp-mono" data-left>25:00</div>
          <progress class="tsl-progress" max="1500" value="0" data-bar></progress>
          <ol class="tsl-timeline" style="text-align:left;width:100%" data-log></ol>
          <form class="tsl-input-group" data-form style="width:100%"><input class="tsl-input" type="email" required placeholder="Avísame por correo cuando regrese" aria-label="Correo electrónico" /><button type="submit" class="tsl-btn tsl-btn--sm" style="margin:3px">Avísame</button></form>
        </div></div>`,
      setup(root, ctx) {
        let left = 1500;
        const steps = [[1490, "Instantánea creada"], [1400, "Migrando tablas (1/3)"], [1200, "Migrando tablas (2/3)"], [900, "Reconstruyendo índices"], [300, "Ejecutando verificaciones de estado"]];
        const log = (t) => {
          const li = document.createElement("li");
          li.style.setProperty("--c", "var(--tsl-success)");
          li.innerHTML = `<span></span><div class="tsl-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.firstChild.textContent = t;
          ctx.$("[data-log]").prepend(li);
        };
        log("Mantenimiento iniciado");
        ctx.every(100, () => {
          left = Math.max(0, left - 1);
          ctx.$("[data-left]").textContent = left ? `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}` : "De vuelta en línea";
          ctx.$("[data-bar]").value = 1500 - left;
          steps.forEach((s) => {
            if (left === s[0]) log(s[1]);
          });
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "Te avisaremos", description: e.target.querySelector("input").value });
          e.target.reset();
        });
      }
    },

    "no-files": {
      html: `
        ${head("Empty states · no-files.tsx", "Sin archivos", "El estado vacío es la zona de carga. Agrega archivos (arrastra o haz clic) y se listan con su tamaño; quítalos todos para volver.")}
        <tsl-dropzone multiple data-drop style="min-height:220px"><div style="font-size:28px">📂</div><strong>Aún no hay archivos</strong><span>Suelta archivos aquí o haz clic para explorar</span></tsl-dropzone>
        <div class="tsl-table-wrap" data-tablewrap hidden><table class="tsl-table"><thead><tr><th>Nombre</th><th>Tipo</th><th class="is-num">Tamaño</th><th></th></tr></thead><tbody data-rows></tbody></table></div>`,
      setup(root, ctx) {
        let files = [];
        const drop = ctx.$("[data-drop]");
        const render = () => {
          ctx.$("[data-tablewrap]").hidden = !files.length;
          drop.style.minHeight = files.length ? "90px" : "220px";
          ctx.$("[data-rows]").innerHTML = files.map((f, i) => `<tr><td>${esc(f.name)}</td><td class="tsl-muted">${esc(f.type || "—")}</td><td class="is-num">${(f.size / 1024).toFixed(1)} KB</td><td class="is-num"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-rm="${i}">Quitar</button></td></tr>`).join("");
          const list = drop.querySelector(".tsl-dropzone__files");
          if (list) list.hidden = true;
        };
        ctx.on(drop, "tsl-change", (e) => {
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
        ${head("Empty states · offline.tsx", "Sin conexión", "Alterna la red simulada (los eventos reales de conexión y desconexión también se respetan). Las acciones se encolan sin conexión; los reintentos se espacian de forma exponencial y se envían al reconectar.")}
        <div class="tsl-row"><label class="tsl-choice">Simular sin conexión <input type="checkbox" role="switch" class="tsl-switch" data-off /></label><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-action>Enviar mensaje</button><span class="tsl-badge" data-queue>0 en cola</span></div>
        <div data-online class="tsl-alert tsl-alert--success"><div><div class="tsl-alert__title">Conectado</div><div class="tsl-alert__desc">Todos los cambios están sincronizados.</div></div></div>
        <div data-offline hidden>${empty("📡", "Sin conexión", 'Los cambios se guardan localmente y se sincronizarán cuando te reconectes.', '<button type="button" class="tsl-btn tsl-btn--primary" data-retry>Reintentar ahora</button>')}<p class="tsl-muted" style="text-align:center;margin-top:8px" data-next></p></div>`,
      setup(root, ctx) {
        let offline = !navigator.onLine;
        let queue = 0;
        let attempt = 0;
        let nextAt = 0;
        const render = () => {
          ctx.$("[data-off]").checked = offline;
          ctx.$("[data-online]").hidden = offline;
          ctx.$("[data-offline]").hidden = !offline;
          ctx.$("[data-queue]").textContent = `${queue} en cola`;
        };
        const set = (v) => {
          offline = v;
          if (!offline && queue) {
            ctx.toast({ title: `Se sincronizó ${queue} acción${queue > 1 ? "es" : ""} en cola` });
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
            ctx.toast({ title: "En cola: se enviará al recuperar la conexión", variant: "warning" });
          } else ctx.toast({ title: "Mensaje enviado" });
          render();
        });
        ctx.on(ctx.$("[data-retry]"), "click", () => (nextAt = Date.now()));
        ctx.every(250, () => {
          if (!offline) return;
          const s = Math.max(0, Math.ceil((nextAt - Date.now()) / 1000));
          ctx.$("[data-next]").textContent = `Reintentando en ${s} s (intento ${attempt + 1})`;
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
  // AJUSTES
  // ==========================================================================
  const settingsShell = (eyebrow, title, desc, body) => `${head(`Settings · ${eyebrow}`, title, desc)}<div class="tsl-stack" style="max-width:760px;width:100%">${body}</div>`;

  X.addMany("settings", {
    profile: {
      html: () => settingsShell("profile.tsx", "Perfil", "Iniciales del avatar en vivo, verificación de disponibilidad del nombre de usuario y contador de caracteres de la biografía.", `
        <form class="xp-panel tsl-stack" data-xp-form data-success="Perfil guardado" novalidate>
          <div class="tsl-row" style="--gap:14px"><span class="tsl-avatar tsl-avatar--lg" data-avatar data-status="online">LI</span><div><strong data-name-echo>Luis Islas</strong><div class="tsl-muted xp-mono" data-handle-echo>@luis</div></div></div>
          ${field({ name: "fullname", label: "Nombre completo", value: "Luis Islas" })}
          <div class="tsl-field"><label class="tsl-label" for="pf-handle">Nombre de usuario</label><div class="tsl-input-group"><span class="tsl-input-group__addon">@</span><input class="tsl-input" id="pf-handle" name="handle" value="luis" required pattern="[a-z0-9_]{3,20}" data-pattern-msg="De 3 a 20 letras minúsculas, números o _" /><span class="tsl-input-group__addon" data-avail></span></div></div>
          <div class="tsl-field"><div class="tsl-row" style="justify-content:space-between"><label class="tsl-label" for="pf-bio">Biografía</label><span class="tsl-hint" data-count></span></div><textarea class="tsl-textarea" id="pf-bio" name="bio" maxlength="160">Diseñando interfaces tranquilas.</textarea></div>
          <div class="tsl-field"><label class="tsl-label" for="pf-tz">Zona horaria</label><select class="tsl-select" id="pf-tz" name="tz"><option>America/Mexico_City</option><option>Europe/Madrid</option><option>America/New_York</option></select></div>
          <button type="submit" class="tsl-btn tsl-btn--primary" style="align-self:flex-start">Guardar perfil</button>
        </form>`),
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        const taken = ["admin", "ana", "leo", "tesela", "root"];
        const name = ctx.$('[name="fullname"]');
        const handle = ctx.$('[name="handle"]');
        const bio = ctx.$('[name="bio"]');
        let t = 0;
        const sync = () => {
          ctx.$("[data-avatar]").textContent = name.value.split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase() || "?";
          ctx.$("[data-name-echo]").textContent = name.value || "Sin nombre";
          ctx.$("[data-handle-echo]").textContent = `@${handle.value}`;
          ctx.$("[data-count]").textContent = `${bio.value.length}/160`;
        };
        const check = () => {
          const avail = ctx.$("[data-avail]");
          avail.innerHTML = '<span class="tsl-spinner" style="--size:12px"></span>';
          clearTimeout(t);
          t = setTimeout(() => {
            const ok = !taken.includes(handle.value.toLowerCase()) && /^[a-z0-9_]{3,20}$/.test(handle.value);
            avail.innerHTML = ok ? '<span style="color:var(--tsl-success)">✓ disponible</span>' : '<span style="color:var(--tsl-danger)">✕ en uso</span>';
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
      html: settingsShell("appearance.tsx", "Apariencia", "El tema se aplica de verdad; el acento, la densidad y el tamaño de fuente actualizan al instante la tarjeta de vista previa.", `
        <div class="xp-panel tsl-stack">
          <span class="tsl-label">Tema</span><tsl-segmented data-theme-ctl><button class="tsl-segmented__item" value="dark">Oscuro</button><button class="tsl-segmented__item" value="light">Claro</button><button class="tsl-segmented__item" value="system">Sistema</button></tsl-segmented>
          <span class="tsl-label">Acento</span><div class="tsl-row" data-accents>${["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#a855f7"].map((c) => `<button type="button" aria-label="${c}" data-c="${c}" style="width:26px;height:26px;border-radius:50%;border:2px solid transparent;background:${c};cursor:pointer"></button>`).join("")}<input type="color" value="#6366f1" data-custom aria-label="Acento personalizado" style="width:34px;height:28px;border:0;background:none" /></div>
          <span class="tsl-label">Densidad</span><tsl-segmented value="default" data-density><button class="tsl-segmented__item" value="compact">Compacta</button><button class="tsl-segmented__item" value="default">Predeterminada</button><button class="tsl-segmented__item" value="comfortable">Cómoda</button></tsl-segmented>
          <span class="tsl-label">Tamaño de fuente <strong class="xp-mono" id="ap-fs">13px</strong></span><input type="range" class="tsl-range" min="11" max="17" value="13" data-fs data-tsl-output="#ap-fs" data-tsl-suffix="px" aria-label="Tamaño de fuente" />
        </div>
        <div class="tsl-card" data-preview><div class="tsl-card__header"><h3 class="tsl-card__title">Vista previa</h3><p class="tsl-card__desc">Esta tarjeta refleja tus ajustes.</p></div><div class="tsl-card__body tsl-row"><button type="button" class="tsl-btn tsl-btn--accent">Botón de acento</button><span class="tsl-badge tsl-badge--accent">Insignia</span><input type="checkbox" role="switch" class="tsl-switch" checked aria-label="Interruptor" /></div></div>`),
      setup(root, ctx) {
        const preview = ctx.$("[data-preview]");
        const theme = ctx.$("[data-theme-ctl]");
        theme.value = TeselaUI.getTheme();
        ctx.on(theme, "tsl-change", (e) => {
          const v = e.detail.value;
          TeselaUI.setTheme(v === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : v);
          ctx.toast({ title: `Tema: ${{ dark: "oscuro", light: "claro", system: "del sistema" }[v] || v}`, variant: "neutral", duration: 1200 });
        });
        const setAccent = (c) => {
          preview.style.setProperty("--tsl-accent", c);
          ctx.$$("[data-c]").forEach((b) => (b.style.borderColor = b.dataset.c === c ? "var(--tsl-fg)" : "transparent"));
        };
        ctx.on(ctx.$("[data-accents]"), "click", (e) => {
          const b = e.target.closest("[data-c]");
          if (b) setAccent(b.dataset.c);
        });
        ctx.on(ctx.$("[data-custom]"), "input", (e) => setAccent(e.target.value));
        ctx.on(ctx.$("[data-density]"), "tsl-change", (e) => {
          const pad = { compact: "10px 14px", default: "", comfortable: "26px 28px" }[e.detail.value];
          preview.querySelectorAll(".tsl-card__header, .tsl-card__body").forEach((el) => (el.style.padding = pad));
        });
        ctx.on(ctx.$("[data-fs]"), "input", (e) => (preview.style.fontSize = `${e.target.value}px`));
        setAccent("#6366f1");
      }
    },

    billing: {
      html: settingsShell("billing.tsx", "Facturación", "Cambia de plan y de asientos para recalcular la próxima factura; descarga facturas anteriores como archivos.", `
        <div class="tsl-grid" style="--min:180px" data-plans>
          ${[["Inicial", 0], ["Pro", 19], ["Empresarial", 49]].map(([n, p]) => `<label class="tsl-card tsl-card--flat" style="padding:14px;cursor:pointer"><div class="tsl-row"><input type="radio" class="tsl-check" name="plan" value="${n}" data-price="${p}"${n === "Pro" ? " checked" : ""} /><strong>${n}</strong></div><div class="xp-num" style="font-size:22px;margin-top:6px">$${p}<span class="tsl-muted" style="font-size:12px">/asiento/mes</span></div></label>`).join("")}
        </div>
        <div class="xp-panel tsl-row"><span class="tsl-label">Asientos</span><div class="tsl-number"><button type="button" data-step="-1" aria-label="Menos">−</button><input type="number" min="1" max="200" value="8" data-seats aria-label="Asientos" /><button type="button" data-step="1" aria-label="Más">+</button></div><span class="tsl-spacer"></span><span class="tsl-muted">Próxima factura</span><strong class="xp-num" style="font-size:22px" data-total></strong></div>
        <div class="xp-panel tsl-row"><span style="font-size:22px">💳</span><div><strong>Visa •••• 4242</strong><div class="tsl-muted">Vence 08/28</div></div><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm" data-update-card>Actualizar</button></div>
        <ul class="tsl-list" data-invoices></ul>`),
      setup(root, ctx) {
        const total = () => {
          const plan = ctx.$('[name="plan"]:checked');
          const seats = Math.max(1, Number(ctx.$("[data-seats]").value) || 1);
          ctx.$("[data-total]").textContent = ctx.fmt.money(Number(plan.dataset.price) * seats);
        };
        ctx.on(ctx.$("[data-plans]"), "change", () => {
          total();
          ctx.toast({ title: `Plan cambiado a ${ctx.$('[name="plan"]:checked').value}`, description: "Se prorrateará en la próxima factura" });
        });
        ctx.on(ctx.$("[data-seats]"), "input", total);
        ctx.on(ctx.$("[data-update-card]"), "click", () => ctx.toast({ title: "Aquí se abriría el formulario para actualizar la tarjeta (iframe seguro PCI)", variant: "info" }));
        const invoices = [["INV-0091", "Sep 2026", 152], ["INV-0084", "Ago 2026", 152], ["INV-0077", "Jul 2026", 133]];
        ctx.$("[data-invoices]").innerHTML = invoices.map(([id, m, a]) => `<li><span class="xp-mono">${id}</span><span>${m}</span><span class="tsl-badge tsl-badge--success">Pagada</span><span class="tsl-list__end"><span class="xp-mono">$${a}.00</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-dl="${id}">Descargar</button></span></li>`).join("");
        ctx.on(ctx.$("[data-invoices]"), "click", (e) => {
          const b = e.target.closest("[data-dl]");
          if (!b) return;
          const inv = invoices.find((i) => i[0] === b.dataset.dl);
          TESELA_XP.download(`${inv[0]}.txt`, `ACME INC.\nFactura ${inv[0]} — ${inv[1]}\nPlan Pro × 8 asientos\nTotal: $${inv[2]}.00\nEstado: PAGADA\n`);
        });
        total();
      }
    },

    integrations: {
      html: settingsShell("integrations.tsx", "Integraciones", "Conecta (con un breve protocolo de enlace), desconecta y filtra apps de terceros.", `
        <div class="tsl-row"><input class="tsl-input xp-search" data-q placeholder="Filtrar integraciones…" aria-label="Filtrar" /><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--accent" data-count></span></div>
        <div class="tsl-grid" style="--min:220px" data-grid></div>`),
      setup(root, ctx) {
        const apps = [["GitHub", "Sincroniza incidencias y PRs", true], ["Slack", "Publica notificaciones", true], ["Linear", "Sincronización bidireccional de incidencias", false], ["Figma", "Inserta marcos", false], ["Stripe", "Eventos de facturación", false], ["Sentry", "Alertas de errores", false]];
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-grid]").innerHTML = apps
            .map(([n, d, on], i) => (n.toLowerCase().includes(q) ? `<div class="tsl-card tsl-card--flat"><div class="tsl-card__body tsl-stack" style="--gap:6px"><div class="tsl-row"><span class="tsl-avatar tsl-avatar--square tsl-avatar--sm">${n[0]}</span><strong>${n}</strong>${on ? '<span class="tsl-badge tsl-badge--success">Conectado</span>' : ""}</div><span class="tsl-muted" style="font-size:12px">${d}</span></div><div class="tsl-card__footer">${on ? `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-off="${i}">Desconectar</button><button type="button" class="tsl-btn tsl-btn--sm" data-cfg="${i}">Configurar</button>` : `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-on="${i}">Conectar</button>`}</div></div>` : ""))
            .join("");
          ctx.$("[data-count]").textContent = `${apps.filter((a) => a[2]).length} conectadas`;
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
              ctx.toast({ title: `${apps[on.dataset.on][0]} conectado` });
              render();
            });
          }
          if (off) {
            apps[off.dataset.off][2] = false;
            render();
          }
          if (cfg) ctx.toast({ title: `Ajustes de ${apps[cfg.dataset.cfg][0]}`, variant: "info" });
        });
        render();
      }
    },

    security: {
      html: () => settingsShell("security.tsx", "Seguridad", "Cambia la contraseña, activa la verificación en dos pasos (confirma con cualquier código de 6 dígitos) y revoca sesiones.", `
        <form class="xp-panel tsl-stack" data-xp-form data-success="Contraseña cambiada" data-reset novalidate>
          <strong>Cambiar contraseña</strong>
          ${field({ name: "current", label: "Contraseña actual", type: "password", minlength: 8 })}
          ${field({ name: "next", label: "Contraseña nueva", type: "password", minlength: 8, strength: true })}
          <button type="submit" class="tsl-btn tsl-btn--primary" style="align-self:flex-start">Actualizar contraseña</button>
        </form>
        <div class="xp-panel tsl-stack"><div class="tsl-row"><div><strong>Autenticación en dos pasos</strong><div class="tsl-muted" data-2fa-state>Desactivada</div></div><span class="tsl-spacer"></span><input type="checkbox" role="switch" class="tsl-switch" data-2fa aria-label="Dos pasos" /></div><div data-2fa-setup hidden class="tsl-stack"><span class="tsl-muted">Ingresa el código de tu app de autenticación:</span><tsl-otp length="6" data-otp></tsl-otp></div></div>
        <div class="tsl-stack"><div class="tsl-row"><strong>Sesiones activas</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--danger" data-all>Cerrar las demás sesiones</button></div><ul class="tsl-list" data-sessions></ul></div>`),
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        const sw = ctx.$("[data-2fa]");
        ctx.on(sw, "change", () => {
          if (sw.checked) {
            sw.checked = false;
            ctx.$("[data-2fa-setup]").hidden = false;
            ctx.$("[data-otp] input").focus();
          } else {
            ctx.$("[data-2fa-state]").textContent = "Desactivada";
            ctx.toast({ title: "2FA desactivada", variant: "warning" });
          }
        });
        ctx.on(ctx.$("[data-otp]"), "tsl-complete", () => {
          sw.checked = true;
          ctx.$("[data-2fa-setup]").hidden = true;
          ctx.$("[data-2fa-state]").textContent = "Activada · app de autenticación";
          ctx.toast({ title: "2FA activada" });
        });
        let sessions = [["MacBook Pro · Safari", "CDMX · ahora", true], ["iPhone 16 · App", "CDMX · hace 2 h", false], ["Windows · Chrome", "Madrid · hace 3 d", false]];
        const render = () =>
          (ctx.$("[data-sessions]").innerHTML = sessions.map(([d, w, cur], i) => `<li><div><div class="tsl-list__title">${d}</div><div class="tsl-list__desc">${w}</div></div><span class="tsl-list__end">${cur ? '<span class="tsl-badge tsl-badge--success">Este dispositivo</span>' : `<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-rv="${i}">Revocar</button>`}</span></li>`).join(""));
        ctx.on(ctx.$("[data-sessions]"), "click", (e) => {
          const b = e.target.closest("[data-rv]");
          if (!b) return;
          sessions.splice(Number(b.dataset.rv), 1);
          render();
        });
        ctx.on(ctx.$("[data-all]"), "click", () => {
          sessions = sessions.filter((s) => s[2]);
          ctx.toast({ title: "Se cerraron todas las demás sesiones" });
          render();
        });
        render();
      }
    },

    permissions: {
      html: settingsShell("permissions.tsx", "Roles y permisos", "Matriz RBAC: marca los permisos de cada rol (Propietario está bloqueado), agrega roles personalizados y luego guarda o descarta.", `
        <div class="tsl-row"><form class="tsl-input-group" data-add style="max-width:280px"><input class="tsl-input" placeholder="Nombre del nuevo rol" required aria-label="Nombre del rol" /><button type="submit" class="tsl-btn tsl-btn--sm" style="margin:3px">Agregar rol</button></form><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--warning" data-dirty hidden></span><button type="button" class="tsl-btn tsl-btn--sm" data-discard>Descartar</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-save>Guardar</button></div>
        <div class="tsl-table-wrap"><table class="tsl-table" data-matrix></table></div>`),
      setup(root, ctx) {
        const perms = ["Ver proyectos", "Editar proyectos", "Gestionar miembros", "Facturación", "Eliminar espacio de trabajo"];
        let saved = { Propietario: [1, 1, 1, 1, 1], Administrador: [1, 1, 1, 1, 0], Miembro: [1, 1, 0, 0, 0], Lector: [1, 0, 0, 0, 0] };
        let draft = JSON.parse(JSON.stringify(saved));
        const render = () => {
          const roles = Object.keys(draft);
          ctx.$("[data-matrix]").innerHTML = `<thead><tr><th>Permiso</th>${roles.map((r) => `<th style="text-align:center">${esc(r)}</th>`).join("")}</tr></thead><tbody>${perms.map((p, pi) => `<tr><td>${p}</td>${roles.map((r) => `<td style="text-align:center"><input type="checkbox" class="tsl-check" data-r="${esc(r)}" data-p="${pi}"${draft[r][pi] ? " checked" : ""}${r === "Propietario" ? " disabled" : ""} aria-label="${esc(r)} ${p}" /></td>`).join("")}</tr>`).join("")}</tbody>`;
          let changes = 0;
          roles.forEach((r) => draft[r].forEach((v, i) => (changes += !saved[r] || saved[r][i] !== v ? 1 : 0)));
          const d = ctx.$("[data-dirty]");
          d.hidden = !changes;
          d.textContent = `${changes} cambio${changes === 1 ? "" : "s"} sin guardar`;
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
          ctx.toast({ title: "Permisos guardados" });
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
      html: settingsShell("branding.tsx", "Marca del espacio de trabajo", "Sube un logotipo (con vista previa local), elige un color de marca y verifica un dominio personalizado mediante DNS.", `
        <div class="tsl-grid" style="--min:280px;align-items:start">
          <div class="xp-panel tsl-stack">
            <label class="tsl-field"><span class="tsl-label">Nombre del espacio de trabajo</span><input class="tsl-input" data-name value="Acme" /></label>
            <span class="tsl-label">Logo</span><div class="tsl-row"><label class="tsl-btn tsl-btn--sm" style="cursor:pointer">Subir imagen<input type="file" accept="image/*" hidden data-logo /></label><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-clear>Usar iniciales</button></div>
            <label class="tsl-field"><span class="tsl-label">Color de marca</span><input type="color" value="#6366f1" data-color style="width:60px;height:34px;border:0;background:none" /></label>
          </div>
          <div class="tsl-card" data-preview><div class="tsl-row" style="padding:12px 16px;border-bottom:1px solid var(--tsl-border)" data-bar><span class="tsl-avatar tsl-avatar--square" data-mark>A</span><strong data-label>Acme</strong><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--accent">Registrarse</button></div><div class="tsl-card__body"><span class="tsl-muted">Tu inicio de sesión y tus correos con tu marca usan este aspecto.</span></div></div>
        </div>
        <div class="xp-panel tsl-stack"><strong>Dominio personalizado</strong><div class="tsl-row"><input class="tsl-input" style="max-width:280px" data-domain value="app.acme.com" aria-label="Dominio" /><button type="button" class="tsl-btn tsl-btn--sm" data-verify>Verificar DNS</button><span data-dns></span></div><code class="xp-mono tsl-muted" data-record></code></div>`),
      setup(root, ctx) {
        const preview = ctx.$("[data-preview]");
        const name = ctx.$("[data-name]");
        const mark = ctx.$("[data-mark]");
        const sync = () => {
          ctx.$("[data-label]").textContent = name.value || "Espacio de trabajo";
          if (!mark.querySelector("img")) mark.textContent = (name.value || "?")[0].toUpperCase();
          ctx.$("[data-record]").textContent = `TXT _tesela-verify.${ctx.$("[data-domain]").value}  "tesela=${btoa(name.value || "x").slice(0, 12)}"`;
        };
        ctx.on(name, "input", sync);
        ctx.on(ctx.$("[data-domain]"), "input", sync);
        ctx.on(ctx.$("[data-color]"), "input", (e) => preview.style.setProperty("--tsl-accent", e.target.value));
        ctx.on(ctx.$("[data-logo]"), "change", (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            mark.innerHTML = "";
            const img = document.createElement("img");
            img.src = reader.result;
            img.alt = "Logotipo";
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
            ctx.$("[data-dns]").innerHTML = ok ? '<span class="tsl-badge tsl-badge--success">Verificado</span>' : '<span class="tsl-badge tsl-badge--warning">Aún no se encuentra el registro</span>';
          });
        });
        sync();
      }
    },

    localization: {
      html: settingsShell("localization.tsx", "Localización", "El idioma, la región, la moneda y el estilo de fecha alimentan las APIs Intl reales: la vista previa es exactamente lo que verían los usuarios.", `
        <div class="tsl-grid" style="--min:200px">
          <label class="tsl-field"><span class="tsl-label">Configuración regional</span><select class="tsl-select" data-locale><option value="en-US">English (US)</option><option value="es-MX" selected>Español (México)</option><option value="de-DE">Deutsch</option><option value="ja-JP">日本語</option><option value="ar-EG">العربية</option></select></label>
          <label class="tsl-field"><span class="tsl-label">Moneda</span><select class="tsl-select" data-cur><option>USD</option><option selected>MXN</option><option>EUR</option><option>JPY</option></select></label>
          <label class="tsl-field"><span class="tsl-label">Estilo de fecha</span><select class="tsl-select" data-date><option value="short">Corto</option><option value="medium">Medio</option><option value="long" selected>Largo</option><option value="full">Completo</option></select></label>
          <label class="tsl-field"><span class="tsl-label">Zona horaria</span><select class="tsl-select" data-tz><option>America/Mexico_City</option><option>Europe/Berlin</option><option>Asia/Tokyo</option><option>UTC</option></select></label>
        </div>
        <dl class="xp-panel xp-kv" data-out style="font-size:14px"></dl>`),
      setup(root, ctx) {
        const render = () => {
          const loc = ctx.$("[data-locale]").value;
          const cur = ctx.$("[data-cur]").value;
          const tz = ctx.$("[data-tz]").value;
          const now = new Date();
          const rows = [
            ["Fecha", new Intl.DateTimeFormat(loc, { dateStyle: ctx.$("[data-date]").value, timeZone: tz }).format(now)],
            ["Hora", new Intl.DateTimeFormat(loc, { timeStyle: "short", timeZone: tz }).format(now)],
            ["Precio", new Intl.NumberFormat(loc, { style: "currency", currency: cur }).format(1234567.891)],
            ["Número", new Intl.NumberFormat(loc).format(9876543.21)],
            ["Porcentaje", new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 1 }).format(0.427)],
            ["Relativo", new Intl.RelativeTimeFormat(loc, { numeric: "auto" }).format(-1, "day")],
            ["Lista", new Intl.ListFormat(loc, { type: "conjunction" }).format(["Ana", "Leo", "Sara"])],
            ["Plural", `${new Intl.PluralRules(loc).select(2)} (2 elementos)`]
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
      html: settingsShell("webhooks.tsx", "Webhooks", "Agrega endpoints HTTPS con suscripciones a eventos, actívalos o desactívalos, revela el secreto de firma y envía entregas de prueba.", `
        <form class="xp-panel tsl-stack" data-add novalidate>
          <label class="tsl-field"><span class="tsl-label">URL del endpoint</span><input class="tsl-input xp-mono" name="url" placeholder="https://api.example.com/hooks" /><span class="tsl-error" data-err></span></label>
          <div class="tsl-row">${["invoice.paid", "member.added", "deploy.failed", "issue.created"].map((ev) => `<label class="tsl-choice"><input type="checkbox" class="tsl-check" name="ev" value="${ev}"${ev === "invoice.paid" ? " checked" : ""} /> <code>${ev}</code></label>`).join("")}</div>
          <button type="submit" class="tsl-btn tsl-btn--primary" style="align-self:flex-start">Agregar endpoint</button>
        </form>
        <ul class="tsl-list" data-list></ul>
        <div><span class="tsl-eyebrow">Entregas recientes</span><ul class="tsl-list xp-mono" style="margin-top:8px;font-size:12px" data-log><li class="tsl-muted">Aún no hay entregas.</li></ul></div>`),
      setup(root, ctx) {
        const hooks = [{ url: "https://api.acme.dev/hooks/tesela", ev: ["invoice.paid", "deploy.failed"], on: true, secret: "whsec_9f2a…71e0", show: false }];
        const render = () => {
          ctx.$("[data-list]").innerHTML = hooks
            .map((h, i) => `<li style="flex-wrap:wrap"><input type="checkbox" role="switch" class="tsl-switch" data-tg="${i}"${h.on ? " checked" : ""} aria-label="Activado" /><div style="flex:1;min-width:200px"><div class="tsl-list__title xp-mono">${esc(h.url)}</div><div class="tsl-list__desc">${h.ev.map(esc).join(", ")} · secreto <code>${h.show ? esc(h.secret) : "whsec_••••••"}</code></div></div><span class="tsl-list__end"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-sh="${i}">${h.show ? "Ocultar" : "Mostrar"}</button><button type="button" class="tsl-btn tsl-btn--sm" data-test="${i}"${h.on ? "" : " disabled"}>Enviar prueba</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-rm="${i}" aria-label="Eliminar">✕</button></span></li>`)
            .join("");
        };
        ctx.on(ctx.$("[data-add]"), "submit", (e) => {
          e.preventDefault();
          const f = e.target;
          const url = f.url.value.trim();
          let err = "";
          try {
            if (new URL(url).protocol !== "https:") err = "El endpoint debe usar https://";
          } catch (_) {
            err = "Ingresa una URL válida";
          }
          const ev = Array.from(f.querySelectorAll('[name="ev"]:checked'), (c) => c.value);
          if (!err && !ev.length) err = "Elige al menos un evento";
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
            if (log.querySelector(".tsl-muted")) log.innerHTML = "";
            log.insertAdjacentHTML("afterbegin", `<li><span class="tsl-badge tsl-badge--${ok ? "success" : "danger"}">${ok ? 200 : 502}</span><span>${esc(h.ev[0])}</span><span class="tsl-muted">${esc(new URL(h.url).host)}</span><span class="tsl-list__end tsl-muted">${new Date().toLocaleTimeString()}</span></li>`);
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
      html: settingsShell("privacy.tsx", "Privacidad y datos", "Interruptores de consentimiento, exportación de datos (descarga JSON real tras una barra de progreso) y eliminación de la cuenta con confirmación.", `
        <div class="xp-panel tsl-stack">${[["analytics", "Analítica del producto", "Uso anónimo para mejorar el producto", true], ["personal", "Personalización", "Recomendaciones basadas en tu actividad", false], ["crash", "Informes de fallos", "Envía diagnósticos cuando algo falla", true]].map(([k, t, d, on]) => `<label class="tsl-row" style="justify-content:space-between;cursor:pointer"><div><div>${t}</div><div class="tsl-muted" style="font-size:11px">${d}</div></div><input type="checkbox" role="switch" class="tsl-switch" data-k="${k}"${on ? " checked" : ""} /></label>`).join("")}</div>
        <div class="xp-panel tsl-stack"><div class="tsl-row"><div><strong>Exporta tus datos</strong><div class="tsl-muted">Perfil, proyectos y actividad en JSON.</div></div><span class="tsl-spacer"></span><button type="button" class="tsl-btn" data-export>Solicitar exportación</button></div><progress class="tsl-progress" max="100" value="0" data-bar hidden></progress></div>
        <div class="tsl-alert tsl-alert--danger"><div style="flex:1"><div class="tsl-alert__title">Eliminar cuenta</div><div class="tsl-alert__desc">Tus datos se eliminan de forma permanente después de 14 días.</div></div><button type="button" class="tsl-btn tsl-btn--danger tsl-btn--sm" data-tsl-open="priv-del">Eliminar…</button></div>
        <dialog class="tsl-dialog" id="priv-del"><div class="tsl-dialog__header"><h3 class="tsl-dialog__title">¿Eliminar tu cuenta?</h3><p class="tsl-dialog__desc">Escribe ELIMINAR para confirmar.</p></div><div class="tsl-dialog__body"><input class="tsl-input" data-confirm aria-label="Escribe ELIMINAR" /></div><div class="tsl-dialog__footer"><button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="button" class="tsl-btn tsl-btn--danger" disabled data-go data-tsl-close="yes">Eliminar cuenta</button></div></dialog>`),
      setup(root, ctx) {
        ctx.$$("[data-k]").forEach((s) => ctx.on(s, "change", () => ctx.toast({ title: `${s.closest("label").querySelector("div div").textContent} ${s.checked ? "activado" : "desactivado"}`, variant: "neutral", duration: 1200 })));
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
              TESELA_XP.download("mis-datos.json", JSON.stringify({ user: "luis@acme.dev", exportedAt: new Date().toISOString(), consent, projects: ["Rediseño del onboarding", "Planeación del T3"] }, null, 2), "application/json");
              ctx.toast({ title: "Exportación lista", description: "Se descargó mis-datos.json" });
            }
          });
        });
        const c = ctx.$("[data-confirm]");
        ctx.on(c, "input", () => (ctx.$("[data-go]").disabled = c.value !== "ELIMINAR"));
        ctx.on(ctx.$("#priv-del"), "close", (e) => {
          if (e.target.returnValue === "yes") ctx.toast({ title: "Cuenta programada para eliminación", description: "Tienes 14 días para cancelar.", variant: "danger" });
          c.value = "";
          ctx.$("[data-go]").disabled = true;
        });
      }
    },

    developer: {
      html: settingsShell("developer.tsx", "Desarrolladores", "Modo sandbox, un limitador de tasa tipo token bucket que puedes agotar (¡errores 429!) y un registro de solicitudes en vivo.", `
        <div class="tsl-alert tsl-alert--warning" data-banner hidden><div><div class="tsl-alert__title">Sandbox mode</div><div class="tsl-alert__desc">Las solicitudes solo usan datos de prueba. Sin cargos reales.</div></div></div>
        <div class="xp-panel tsl-row"><div><strong>Modo sandbox</strong><div class="tsl-muted">Usa claves y datos de prueba.</div></div><span class="tsl-spacer"></span><input type="checkbox" role="switch" class="tsl-switch" data-sandbox aria-label="Modo sandbox" /></div>
        <div class="xp-panel tsl-stack"><div class="tsl-row"><strong>Límite de tasa</strong><span class="tsl-spacer"></span><span class="xp-mono" data-tokens></span></div><div class="tsl-meter" style="height:8px"><span data-bucket></span></div><div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-one>Enviar solicitud</button><button type="button" class="tsl-btn tsl-btn--sm" data-burst>Ráfaga ×15</button><span class="tsl-spacer"></span><div class="tsl-input-group" style="max-width:300px"><input class="tsl-input xp-mono" readonly id="dev-base" data-base aria-label="URL base de la API" /><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" style="margin:3px" data-tsl-copy data-tsl-copy-target="#dev-base">Copiar</button></div></div></div>
        <ul class="tsl-list xp-mono" style="font-size:12px" data-log></ul>`),
      setup(root, ctx) {
        const CAP = 20;
        let tokens = CAP;
        const render = () => {
          ctx.$("[data-tokens]").textContent = `${Math.floor(tokens)} / ${CAP} solicitudes disponibles · se recarga 2/s`;
          const b = ctx.$("[data-bucket]");
          b.style.setProperty("--w", `${(tokens / CAP) * 100}%`);
          b.style.setProperty("--c", tokens < 4 ? "var(--tsl-danger)" : "var(--xp-accent)");
          const sb = ctx.$("[data-sandbox]").checked;
          ctx.$("[data-banner]").hidden = !sb;
          ctx.$("[data-base]").value = sb ? "https://sandbox.api.tesela.example/v2" : "https://api.tesela.example/v2";
        };
        const send = () => {
          const ok = tokens >= 1;
          if (ok) tokens--;
          const li = document.createElement("li");
          li.innerHTML = `<span class="tsl-badge tsl-badge--${ok ? "success" : "danger"}">${ok ? 200 : 429}</span><span>GET /v2/projects</span><span class="tsl-list__end tsl-muted">${ok ? `${Math.round(20 + Math.random() * 80)}ms` : "retry-after 1s"}</span>`;
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
      html: settingsShell("sso.tsx", "Inicio de sesión único", "Verifica tu dominio, configura SAML, prueba la conexión y luego exige SSO: cada paso desbloquea el siguiente.", `
        <ol class="tsl-steps" data-steps><li aria-current="step">Dominio</li><li>SAML</li><li>Prueba</li><li>Exigir</li></ol>
        <section class="xp-panel tsl-stack" data-s="0"><strong>1 · Verificar dominio</strong><div class="tsl-row"><input class="tsl-input" style="max-width:240px" value="acme.dev" data-domain aria-label="Dominio" /><button type="button" class="tsl-btn tsl-btn--sm" data-verify>Verificar</button></div><code class="xp-mono tsl-muted" data-txt></code></section>
        <section class="xp-panel tsl-stack" data-s="1" hidden><strong>2 · Configuración de SAML</strong><label class="tsl-field"><span class="tsl-label">URL de SSO del IdP</span><input class="tsl-input xp-mono" data-sso-url placeholder="https://acme.okta.com/app/…/sso/saml" /></label><label class="tsl-field"><span class="tsl-label">Certificado X.509</span><textarea class="tsl-textarea xp-mono" data-cert placeholder="-----BEGIN CERTIFICATE-----"></textarea></label><span class="tsl-error" data-saml-err></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-save style="align-self:flex-start">Guardar configuración</button></section>
        <section class="xp-panel tsl-stack" data-s="2" hidden><strong>3 · Probar conexión</strong><button type="button" class="tsl-btn tsl-btn--sm" data-test style="align-self:flex-start">Ejecutar inicio de sesión de prueba</button><span data-test-out></span></section>
        <section class="xp-panel tsl-row" data-s="3" hidden><div><strong>4 · Exigir SSO</strong><div class="tsl-muted">Los miembros deben iniciar sesión mediante tu IdP.</div></div><span class="tsl-spacer"></span><input type="checkbox" role="switch" class="tsl-switch" data-enforce aria-label="Exigir SSO" /></section>`),
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
        const txt = () => (ctx.$("[data-txt]").textContent = `Agrega el registro TXT: tesela-site-verification=${btoa(ctx.$("[data-domain]").value).slice(0, 16)}`);
        ctx.on(ctx.$("[data-domain]"), "input", txt);
        ctx.on(ctx.$("[data-verify]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(800, () => {
            e.target.removeAttribute("aria-busy");
            e.target.textContent = "✓ Verificado";
            go(1);
          });
        });
        ctx.on(ctx.$("[data-save]"), "click", () => {
          const url = ctx.$("[data-sso-url]").value.trim();
          const cert = ctx.$("[data-cert]").value.trim();
          let err = "";
          if (!/^https:\/\/\S+$/.test(url)) err = "La URL de SSO debe ser una URL https://.";
          else if (!cert.includes("BEGIN CERTIFICATE")) err = "Pega un certificado PEM (-----BEGIN CERTIFICATE-----).";
          ctx.$("[data-saml-err]").textContent = err;
          if (!err) {
            ctx.toast({ title: "Configuración de SAML guardada" });
            go(2);
          }
        });
        ctx.on(ctx.$("[data-test]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(1200, () => {
            e.target.removeAttribute("aria-busy");
            ctx.$("[data-test-out]").innerHTML = '<span class="tsl-badge tsl-badge--success">Aserción válida · luis@acme.dev</span>';
            go(3);
          });
        });
        ctx.on(ctx.$("[data-enforce]"), "change", (e) => ctx.toast({ title: e.target.checked ? "SSO exigido para acme.dev" : "SSO opcional", variant: e.target.checked ? "success" : "warning" }));
        txt();
        go(0);
      }
    }
  });

  // ==========================================================================
  // TARJETAS
  // ==========================================================================
  X.addMany("cards", {
    "stat-tile": {
      html: `
        ${head("Cards · stat-tile.tsx", "Tarjeta de métrica", "Haz clic en una tarjeta para cambiar su periodo; actualizar anima los contadores hacia nuevos valores.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-refresh>⟳ Actualizar</button></div>
        <div class="tsl-grid" style="--min:220px" data-tiles></div>`,
      setup(root, ctx) {
        const tiles = [["Ingresos", 48210, "$"], ["Registros", 1284, ""], ["Usuarios activos", 9312, ""], ["Cancelaciones", 2.1, "%"]].map(([n, v, u], i) => ({ n, v, u, period: 0, hist: Array.from({ length: 14 }, (_, k) => v * (0.8 + 0.4 * Math.abs(Math.sin(k + i)))) }));
        const periods = ["7 d", "30 d", "90 d"];
        const fmt = (t, v) => (t.u === "$" ? ctx.fmt.money(v, "USD", 0) : t.u === "%" ? `${v.toFixed(1)}%` : ctx.fmt.num(v));
        const render = () =>
          (ctx.$("[data-tiles]").innerHTML = tiles.map((t, i) => `<button type="button" class="tsl-stat" data-i="${i}" style="text-align:left;cursor:pointer;color:inherit;font:inherit"><div class="tsl-row"><span class="tsl-eyebrow">${t.n}</span><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--outline">${periods[t.period]}</span></div><span class="tsl-stat__value" data-v="${i}">${fmt(t, t.v)}</span><tsl-sparkline values="${t.hist.map((x) => x.toFixed(1)).join(",")}" fill style="--w:100%;--h:34px"></tsl-sparkline></button>`).join(""));
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
        ${head("Cards · profile.tsx", "Tarjeta de perfil", "Seguir y dejar de seguir actualiza el conteo de seguidores; mensaje abre un redactor en línea.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(340px,100%)">
          <div style="height:84px;background:linear-gradient(135deg,var(--xp-accent),var(--tsl-info))"></div>
          <div class="tsl-card__body tsl-stack" style="margin-top:-46px;align-items:center;text-align:center">
            <span class="tsl-avatar tsl-avatar--lg" data-status="online" style="--_s:72px;box-shadow:0 0 0 4px var(--tsl-bg-elevated)">AL</span>
            <strong style="font-size:16px">Ana López</strong><span class="tsl-muted">Líder de diseño · CDMX</span>
            <div class="tsl-row" style="justify-content:center;--gap:18px"><div><strong data-followers>1,284</strong><div class="tsl-muted" style="font-size:11px">seguidores</div></div><div><strong>312</strong><div class="tsl-muted" style="font-size:11px">siguiendo</div></div><div><strong>48</strong><div class="tsl-muted" style="font-size:11px">publicaciones</div></div></div>
            <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-follow aria-pressed="false">Seguir</button><button type="button" class="tsl-btn" data-msg>Mensaje</button></div>
            <form class="tsl-input-group" data-compose hidden style="width:100%"><input class="tsl-input" placeholder="Saluda…" required aria-label="Mensaje" /><button type="submit" class="tsl-btn tsl-btn--sm" style="margin:3px">Enviar</button></form>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let followers = 1284;
        const btn = ctx.$("[data-follow]");
        ctx.on(btn, "click", () => {
          const on = btn.getAttribute("aria-pressed") !== "true";
          btn.setAttribute("aria-pressed", String(on));
          followers += on ? 1 : -1;
          btn.textContent = on ? "Siguiendo ✓" : "Seguir";
          btn.className = `tsl-btn ${on ? "" : "tsl-btn--primary"}`;
          ctx.$("[data-followers]").textContent = followers.toLocaleString("es-MX");
        });
        ctx.on(ctx.$("[data-msg]"), "click", () => {
          const f = ctx.$("[data-compose]");
          f.hidden = !f.hidden;
          if (!f.hidden) f.querySelector("input").focus();
        });
        ctx.on(ctx.$("[data-compose]"), "submit", (e) => {
          e.preventDefault();
          ctx.toast({ title: "Mensaje enviado a Ana" });
          e.target.reset();
          e.target.hidden = true;
        });
      }
    },

    pricing: {
      html: `
        ${head("Cards · pricing.tsx", "Planes de precios", "El selector de periodo de facturación recalcula precios y ahorros; al elegir un plan se resalta.")}
        <div class="tsl-row" style="justify-content:center"><tsl-segmented value="year" data-period><button class="tsl-segmented__item" value="month">Mensual</button><button class="tsl-segmented__item" value="year">Anual · ahorra 20%</button></tsl-segmented></div>
        <div class="tsl-grid" style="--min:220px" data-tiers></div>`,
      setup(root, ctx) {
        const tiers = [["Personal", 0, ["1 proyecto", "Soporte de la comunidad"]], ["Pro", 24, ["Proyectos ilimitados", "Dominios personalizados", "Soporte prioritario"]], ["Equipo", 59, ["Todo lo de Pro", "SSO y registro de auditoría", "SLA de 99.9%"]]];
        let sel = 1;
        const render = () => {
          const yearly = (ctx.$("[data-period]").value || "year") === "year";
          ctx.$("[data-tiers]").innerHTML = tiers
            .map(([n, p, feats], i) => {
              const price = yearly ? Math.round(p * 0.8) : p;
              return `<div class="tsl-card ${i === sel ? "" : "tsl-card--flat"}" style="${i === sel ? "border-color:var(--xp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--xp-accent) 20%,transparent)" : ""}"><div class="tsl-card__body tsl-stack"><div class="tsl-row"><span class="tsl-eyebrow">${n}</span>${i === 1 ? '<span class="tsl-badge tsl-badge--accent">Popular</span>' : ""}</div><div class="xp-num">$${price}<span class="tsl-muted" style="font-size:12px">/mes</span></div><span class="tsl-hint">${yearly && p ? `$${price * 12} facturados al año · ahorras $${(p - price) * 12}` : p ? "Facturación mensual" : "Gratis para siempre"}</span><ul class="tsl-stack" style="--gap:6px;padding:0;list-style:none;font-size:12px">${feats.map((f) => `<li>✓ ${f}</li>`).join("")}</ul><button type="button" class="tsl-btn tsl-btn--block ${i === sel ? "tsl-btn--primary" : ""}" data-sel="${i}">${i === sel ? "Seleccionado" : `Elegir ${n}`}</button></div></div>`;
            })
            .join("");
        };
        ctx.on(ctx.$("[data-period]"), "tsl-change", render);
        ctx.on(ctx.$("[data-tiers]"), "click", (e) => {
          const b = e.target.closest("[data-sel]");
          if (!b) return;
          sel = Number(b.dataset.sel);
          ctx.toast({ title: `${tiers[sel][0]} seleccionado` });
          render();
        });
        render();
      }
    },

    product: {
      html: `
        ${head("Cards · product.tsx", "Tarjeta de producto", "Elige color y tamaño, define la cantidad y agrégalo al carrito: la insignia del carrito y el subtotal se actualizan.")}
        <div class="tsl-row"><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--accent" data-cart>Carrito · 0</span></div>
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(340px,100%)">
          <div data-img style="height:200px;display:grid;place-items:center;font-size:64px;transition:background .3s">🎧</div>
          <div class="tsl-card__body tsl-stack">
            <div class="tsl-row"><strong style="font-size:16px">Audífonos de estudio</strong><span class="tsl-spacer"></span><span class="xp-num" style="font-size:20px">$199</span></div>
            <span class="tsl-muted">★ 4.7 · 1,204 reseñas</span>
            <div class="tsl-row" data-colors>${[["Medianoche", "#1e1b4b"], ["Arena", "#d6c4a8"], ["Salvia", "#7c9a80"]].map(([n, c], i) => `<button type="button" aria-label="${n}" data-c="${c}" data-n="${n}" style="width:24px;height:24px;border-radius:50%;background:${c};border:2px solid ${i ? "transparent" : "var(--tsl-fg)"};cursor:pointer"></button>`).join("")}<span class="tsl-muted" data-cname>Medianoche</span></div>
            <div class="tsl-row"><select class="tsl-select" style="width:auto" data-size aria-label="Tamaño"><option>Estándar</option><option>Grande (+$20)</option></select><div class="tsl-number"><button type="button" data-step="-1" aria-label="Menos">−</button><input type="number" min="1" max="9" value="1" data-qty aria-label="Cantidad" /><button type="button" data-step="1" aria-label="Más">+</button></div></div>
            <button type="button" class="tsl-btn tsl-btn--primary tsl-btn--block" data-add>Agregar al carrito</button>
          </div>
        </div></div>`,
      setup(root, ctx) {
        let items = 0;
        let subtotal = 0;
        const img = ctx.$("[data-img]");
        const setColor = (b) => {
          ctx.$$("[data-c]").forEach((x) => (x.style.borderColor = x === b ? "var(--tsl-fg)" : "transparent"));
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
          ctx.$("[data-cart]").textContent = `Carrito · ${items} · ${ctx.fmt.money(subtotal, "USD", 0)}`;
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(400, () => e.target.removeAttribute("aria-busy"));
          ctx.toast({ title: `Se agregó ${qty} × ${ctx.$("[data-cname]").textContent}`, action: { label: "Deshacer", onClick: () => {
            items -= qty;
            subtotal -= qty * price;
            ctx.$("[data-cart]").textContent = `Carrito · ${items} · ${ctx.fmt.money(subtotal, "USD", 0)}`;
          } } });
        });
        setColor(ctx.$("[data-c]"));
      }
    },

    invoice: {
      html: `
        ${head("Cards · invoice.tsx", "Línea de factura", "Edita cantidades y precios, agrega líneas y elige una tasa de impuesto: el subtotal, el impuesto y el total se recalculan. Márcala como pagada para sellarla.")}
        <div class="tsl-card xp-rel" style="max-width:680px;width:100%;margin:0 auto">
          <div class="tsl-card__header tsl-row"><div><span class="tsl-eyebrow">Factura</span><h3 class="tsl-card__title xp-mono">INV-2094</h3></div><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--warning" data-status>Vence el 31 oct</span></div>
          <div class="tsl-card__body"><table class="tsl-table tsl-table--compact"><thead><tr><th>Concepto</th><th class="is-num">Cant.</th><th class="is-num">Precio</th><th class="is-num">Importe</th><th></th></tr></thead><tbody data-lines></tbody></table><button type="button" class="tsl-btn tsl-btn--sm" style="margin-top:10px" data-add>+ Agregar línea</button></div>
          <div class="tsl-card__footer" style="justify-content:space-between;flex-wrap:wrap"><label class="tsl-choice">Impuesto <select class="tsl-select" style="width:auto;height:28px" data-tax><option value="0">0%</option><option value="0.16" selected>16% IVA</option><option value="0.21">21% IVA</option></select></label><div class="xp-kv xp-mono" style="grid-template-columns:auto auto;text-align:right" data-totals></div><button type="button" class="tsl-btn tsl-btn--primary tsl-btn--sm" data-paid>Marcar como pagada</button></div>
          <div data-stamp hidden style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%) rotate(-12deg);border:3px solid var(--tsl-success);color:var(--tsl-success);font-size:34px;font-weight:800;padding:6px 18px;border-radius:8px;opacity:.8;pointer-events:none">PAGADA</div>
        </div>`,
      setup(root, ctx) {
        const lines = [["Auditoría del sistema de diseño", 1, 2400], ["Desarrollo de componentes (horas)", 12, 95], ["Hosting (anual)", 1, 240]];
        const render = () => {
          ctx.$("[data-lines]").innerHTML = lines.map(([n, q, p], i) => `<tr><td><input class="tsl-input" style="height:28px" value="${esc(n)}" data-i="${i}" data-k="0" aria-label="Concepto" /></td><td class="is-num"><input class="tsl-input xp-mono" type="number" min="0" style="height:28px;width:70px;text-align:right" value="${q}" data-i="${i}" data-k="1" aria-label="Cantidad" /></td><td class="is-num"><input class="tsl-input xp-mono" type="number" min="0" style="height:28px;width:90px;text-align:right" value="${p}" data-i="${i}" data-k="2" aria-label="Precio" /></td><td class="is-num xp-mono" data-amt="${i}">${ctx.fmt.money(q * p)}</td><td><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-rm="${i}" aria-label="Quitar">✕</button></td></tr>`).join("");
          totals();
        };
        const totals = () => {
          const sub = lines.reduce((s, [, q, p]) => s + q * p, 0);
          const rate = Number(ctx.$("[data-tax]").value);
          lines.forEach(([, q, p], i) => {
            const c = ctx.$(`[data-amt="${i}"]`);
            if (c) c.textContent = ctx.fmt.money(q * p);
          });
          ctx.$("[data-totals]").innerHTML = `<dt>Subtotal</dt><dd>${ctx.fmt.money(sub)}</dd><dt>Impuesto</dt><dd>${ctx.fmt.money(sub * rate)}</dd><dt><strong>Total</strong></dt><dd><strong>${ctx.fmt.money(sub * (1 + rate))}</strong></dd>`;
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
          lines.push(["Concepto nuevo", 1, 100]);
          render();
        });
        ctx.on(ctx.$("[data-tax]"), "change", totals);
        ctx.on(ctx.$("[data-paid]"), "click", (e) => {
          const paid = ctx.$("[data-stamp]").hidden;
          ctx.$("[data-stamp]").hidden = !paid;
          ctx.$("[data-status]").className = `tsl-badge tsl-badge--${paid ? "success" : "warning"}`;
          ctx.$("[data-status]").textContent = paid ? "Pagada" : "Vence el 31 oct";
          e.target.textContent = paid ? "Marcar como no pagada" : "Marcar como pagada";
        });
        render();
      }
    },

    task: {
      html: `
        ${head("Cards · task.tsx", "Tarea Kanban", "Arrastra las tarjetas entre columnas (o usa los botones de flecha). Marca las subtareas para llenar la barra de progreso.")}
        <div class="xp-kanban" data-board>${["Por hacer", "En curso", "Hecho"].map((c) => `<div class="xp-col" data-col="${c}"><div class="tsl-row"><span class="tsl-eyebrow">${c}</span><span class="tsl-badge" data-n="${c}"></span></div></div>`).join("")}</div>`,
      setup(root, ctx) {
        const cards = [
          { id: 1, t: "Auditoría de design tokens", col: "Por hacer", pri: "Alta", subs: [["Colores", true], ["Radios", false], ["Espaciado", false]] },
          { id: 2, t: "Pulido de la paleta de comandos", col: "En curso", pri: "Urgente", subs: [["Orden de resultados", true], ["Grupos", true], ["Pie", false]] },
          { id: 3, t: "Redactar las notas de la versión", col: "Hecho", pri: "Baja", subs: [["Borrador", true], ["Revisión", true]] }
        ];
        const cols = ["Por hacer", "En curso", "Hecho"];
        const render = () => {
          cols.forEach((c) => {
            const col = ctx.$(`[data-col="${c}"]`);
            col.querySelectorAll(".tsl-card").forEach((x) => x.remove());
            cards.filter((k) => k.col === c).forEach((k) => {
              const done = k.subs.filter((s) => s[1]).length;
              const el = document.createElement("div");
              el.className = "tsl-card tsl-card--flat";
              el.draggable = true;
              el.dataset.id = k.id;
              el.style.cursor = "grab";
              el.innerHTML = `<div class="tsl-card__body tsl-stack" style="--gap:8px;padding:12px"><div class="tsl-row"><strong style="flex:1"></strong><span class="tsl-badge tsl-badge--${k.pri === "Urgente" ? "danger" : k.pri === "Alta" ? "warning" : "info"}">${k.pri}</span></div><progress class="tsl-progress" max="${k.subs.length}" value="${done}"></progress>${k.subs.map((s, i) => `<label class="tsl-choice" style="font-size:12px"><input type="checkbox" class="tsl-check" data-sub="${i}"${s[1] ? " checked" : ""} /> ${esc(s[0])}</label>`).join("")}<div class="tsl-row"><span class="tsl-muted" style="font-size:11px">${done}/${k.subs.length}</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-mv="-1" aria-label="Mover a la izquierda"${c === "Por hacer" ? " disabled" : ""}>←</button><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-mv="1" aria-label="Mover a la derecha"${c === "Hecho" ? " disabled" : ""}>→</button></div></div>`;
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
          if (k.subs.every((s) => s[1]) && k.col !== "Hecho") {
            k.col = "Hecho";
            ctx.toast({ title: `“${k.t}” completada` });
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
        ${head("Cards · event.tsx", "Evento de calendario", "Confirmar asistencia actualiza la lista de asistentes; “Agregar al calendario” descarga un archivo .ics real.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(380px,100%)">
          <div class="tsl-card__body tsl-stack">
            <div class="tsl-row"><div style="text-align:center;padding:6px 10px;border-radius:8px;background:var(--tsl-surface-strong)"><div class="tsl-eyebrow" style="color:var(--tsl-danger)">OCT</div><div class="xp-num" style="font-size:22px">23</div></div><div><strong>Sincronización de diseño</strong><div class="tsl-muted">Jue · 15:00–15:45 · Zoom</div></div></div>
            <div class="tsl-row"><div class="tsl-avatar-group" data-avatars></div><span class="tsl-muted" data-going></span></div>
            <tsl-segmented data-rsvp><button class="tsl-segmented__item" value="yes">Asistiré</button><button class="tsl-segmented__item" value="maybe">Tal vez</button><button class="tsl-segmented__item" value="no">No asistiré</button></tsl-segmented>
          </div>
          <div class="tsl-card__footer"><button type="button" class="tsl-btn tsl-btn--sm" data-ics>Agregar al calendario</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--primary" data-join>Unirse a la llamada</button></div>
        </div></div>`,
      setup(root, ctx) {
        const base = ["AL", "LK", "SR"];
        let mine = null;
        const render = () => {
          const list = mine === "yes" ? base.concat("LI") : base;
          ctx.$("[data-avatars]").innerHTML = list.map((a, i) => `<span class="tsl-avatar tsl-avatar--sm" style="--tsl-accent:hsl(${i * 80} 70% 55%)">${a}</span>`).join("");
          ctx.$("[data-going]").textContent = `${list.length} asistirán${mine === "maybe" ? " · tú: tal vez" : mine === "no" ? " · tú no asistirás" : ""}`;
        };
        ctx.on(ctx.$("[data-rsvp]"), "tsl-change", (e) => {
          mine = e.detail.value;
          render();
        });
        ctx.on(ctx.$("[data-ics]"), "click", () => {
          const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//tesela//gallery//EN", "BEGIN:VEVENT", `UID:${Date.now()}@tesela.example`, "DTSTAMP:20261015T000000Z", "DTSTART:20261023T210000Z", "DTEND:20261023T214500Z", "SUMMARY:Sincronización de diseño", "LOCATION:Zoom", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
          TESELA_XP.download("sincronizacion-diseno.ics", ics, "text/calendar");
        });
        ctx.on(ctx.$("[data-join]"), "click", () => ctx.toast({ title: "Uniéndote a la llamada…", variant: "info" }));
        render();
      }
    },

    integration: {
      html: `
        ${head("Cards · integration.tsx", "Integración", "Interruptor de conexión, sincronización manual con indicador de carga y un reloj relativo de “última sincronización” que sigue avanzando.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(380px,100%)">
          <div class="tsl-card__body tsl-stack">
            <div class="tsl-row"><span class="tsl-avatar tsl-avatar--square" style="--tsl-accent:#24292f">GH</span><div><strong>GitHub</strong><div class="tsl-muted">acme/tesela</div></div><span class="tsl-spacer"></span><input type="checkbox" role="switch" class="tsl-switch" data-on checked aria-label="Conectado" /></div>
            <dl class="xp-kv"><dt>Estado</dt><dd data-status></dd><dt>Última sincronización</dt><dd data-last></dd><dt>Elementos sincronizados</dt><dd data-items>1,204</dd></dl>
          </div>
          <div class="tsl-card__footer"><button type="button" class="tsl-btn tsl-btn--sm" data-sync>⟳ Sincronizar ahora</button></div>
        </div></div>`,
      setup(root, ctx) {
        let last = Date.now() - 4 * 60000;
        let items = 1204;
        const render = () => {
          const on = ctx.$("[data-on]").checked;
          ctx.$("[data-status]").innerHTML = on ? '<span class="tsl-badge tsl-badge--success">Conectado</span>' : '<span class="tsl-badge">En pausa</span>';
          const s = Math.round((Date.now() - last) / 1000);
          ctx.$("[data-last]").textContent = s < 60 ? `hace ${s} s` : `hace ${Math.floor(s / 60)} min`;
          ctx.$("[data-sync]").disabled = !on;
          ctx.$("[data-items]").textContent = items.toLocaleString("es-MX");
        };
        ctx.on(ctx.$("[data-on]"), "change", render);
        ctx.on(ctx.$("[data-sync]"), "click", (e) => {
          e.target.setAttribute("aria-busy", "true");
          ctx.timeout(1100, () => {
            e.target.removeAttribute("aria-busy");
            const n = Math.round(Math.random() * 30);
            items += n;
            last = Date.now();
            ctx.toast({ title: `Se sincronizaron ${n} elementos nuevos` });
            render();
          });
        });
        ctx.every(1000, render);
        render();
      }
    },

    media: {
      html: `
        ${head("Cards · media.tsx", "Vista previa de artículo", "Guarda, da me gusta (con contador) y copia un enlace para compartir; el tiempo de lectura se calcula a partir del extracto.")}
        <div class="xp-center" style="min-height:0"><article class="tsl-card" style="width:min(420px,100%)">
          <div style="height:160px;background:radial-gradient(circle at 30% 30%,var(--xp-accent),transparent 60%),radial-gradient(circle at 80% 70%,var(--tsl-warning),transparent 50%),var(--tsl-bg-elevated)"></div>
          <div class="tsl-card__body tsl-stack">
            <span class="tsl-eyebrow">Ingeniería · <span data-read></span></span>
            <h3 class="tsl-card__title" style="font-size:18px">Cómo construir una biblioteca de componentes sin dependencias</h3>
            <p class="tsl-muted" data-excerpt>Los elementos personalizados en light DOM, los tokens en CSS y unos cientos de líneas de JavaScript te llevan sorprendentemente lejos. Así construimos tesela-ui y lo que haríamos distinto la próxima vez, desde el manejo del foco hasta los temas y las pruebas.</p>
            <div class="tsl-row"><span class="tsl-avatar tsl-avatar--sm">LI</span><span class="tsl-muted">Luis · 14 oct</span><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-like aria-pressed="false">♡ <span data-likes>128</span></button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-save aria-pressed="false" aria-label="Guardar en marcadores">☆</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-share aria-label="Compartir">↗</button></div>
          </div>
        </article></div>`,
      setup(root, ctx) {
        const words = ctx.$("[data-excerpt]").textContent.trim().split(/\s+/).length * 18;
        ctx.$("[data-read]").textContent = `${Math.max(1, Math.round(words / 230))} min de lectura`;
        let likes = 128;
        const like = ctx.$("[data-like]");
        ctx.on(like, "click", () => {
          const on = like.getAttribute("aria-pressed") !== "true";
          like.setAttribute("aria-pressed", String(on));
          likes += on ? 1 : -1;
          like.firstChild.textContent = on ? "♥ " : "♡ ";
          like.style.color = on ? "var(--tsl-danger)" : "";
          ctx.$("[data-likes]").textContent = String(likes);
        });
        const save = ctx.$("[data-save]");
        ctx.on(save, "click", () => {
          const on = save.getAttribute("aria-pressed") !== "true";
          save.setAttribute("aria-pressed", String(on));
          save.textContent = on ? "★" : "☆";
          ctx.toast({ title: on ? "Guardado en la lista de lectura" : "Quitado de la lista de lectura", variant: "neutral", duration: 1400 });
        });
        ctx.on(ctx.$("[data-share]"), "click", () => TeselaUI.copy("https://tesela.example/blog/ui-sin-dependencias").then(() => ctx.toast({ title: "Enlace copiado" })));
      }
    },

    "payment-method": {
      html: `
        ${head("Cards · payment-method.tsx", "Método de pago", "Define uno predeterminado, quita tarjetas y agrega nuevas: los números se validan con el algoritmo de Luhn y la marca se detecta mientras escribes. Prueba 4242 4242 4242 4242.")}
        <ul class="tsl-list" data-cards style="max-width:560px;width:100%"></ul>
        <form class="xp-panel tsl-stack" data-form style="max-width:560px;width:100%" novalidate>
          <div class="tsl-field"><label class="tsl-label" for="pm-num">Número de tarjeta</label><div class="tsl-input-group"><input class="tsl-input xp-mono" id="pm-num" data-num inputmode="numeric" placeholder="1234 1234 1234 1234" autocomplete="cc-number" /><span class="tsl-input-group__addon" data-brand>—</span></div><span class="tsl-error" data-err></span></div>
          <div class="tsl-row"><input class="tsl-input xp-mono" style="width:100px" data-exp placeholder="MM/AA" autocomplete="cc-exp" aria-label="Vencimiento" /><input class="tsl-input xp-mono" style="width:80px" data-cvc placeholder="CVC" autocomplete="cc-csc" aria-label="CVC" /><span class="tsl-spacer"></span><button type="submit" class="tsl-btn tsl-btn--primary">Agregar tarjeta</button></div>
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
          (ctx.$("[data-cards]").innerHTML = cards.map((c, i) => `<li><span style="font-size:20px">💳</span><div><div class="tsl-list__title">${c.brand} •••• ${c.last4}</div><div class="tsl-list__desc">Vence ${c.exp}</div></div><span class="tsl-list__end">${c.def ? '<span class="tsl-badge tsl-badge--accent">Predeterminada</span>' : `<button type="button" class="tsl-btn tsl-btn--sm" data-def="${i}">Hacer predeterminada</button>`}<button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-rm="${i}"${c.def ? " disabled" : ""}>Quitar</button></span></li>`).join(""));
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
          if (!luhn(digits)) err = "El número de tarjeta no es válido (falló la verificación de Luhn).";
          else if (!(mm >= 1 && mm <= 12 && yy >= 26)) err = "El vencimiento debe ser un MM/AA futuro.";
          else if (!/^\d{3,4}$/.test(ctx.$("[data-cvc]").value)) err = "El CVC debe tener de 3 a 4 dígitos.";
          ctx.$("[data-err]").textContent = err;
          num.setAttribute("aria-invalid", String(Boolean(err)));
          if (err) return;
          cards.push({ brand: brandOf(digits), last4: digits.slice(-4), exp, def: false });
          e.target.reset();
          ctx.$("[data-brand]").textContent = "—";
          ctx.toast({ title: "Tarjeta agregada" });
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // MODALES
  // ==========================================================================
  const dialog = (id, title, desc, body, footer, extra = "") => `<dialog class="tsl-dialog" id="${id}" aria-labelledby="${id}-t"${extra}><div class="tsl-dialog__header"><h3 class="tsl-dialog__title" id="${id}-t">${title}</h3>${desc ? `<p class="tsl-dialog__desc">${desc}</p>` : ""}</div><div class="tsl-dialog__body">${body}</div>${footer ? `<div class="tsl-dialog__footer">${footer}</div>` : ""}</dialog>`;
  const trigger = (id, label, cls = "tsl-btn--primary") => `<div class="xp-center" style="min-height:240px"><button type="button" class="tsl-btn ${cls}" data-tsl-open="${id}">${label}</button></div>`;

  X.addMany("modals", {
    "confirm-delete": {
      html: `
        ${head("Modals · confirm-delete.tsx", "Confirmar eliminación", "Diálogo destructivo: el botón se desbloquea solo cuando escribes el nombre del proyecto. Escape o un clic en el fondo cancelan.")}
        <ul class="tsl-list" data-list style="max-width:520px;width:100%;margin:0 auto"></ul>
        ${dialog("cd-dlg", "¿Eliminar el proyecto?", 'Esto elimina de forma permanente <strong data-name></strong> y todos sus archivos.', '<label class="tsl-field"><span class="tsl-label">Escribe <code data-name2></code> para confirmar</span><input class="tsl-input" data-confirm autocomplete="off" /></label>', '<button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="button" class="tsl-btn tsl-btn--danger" data-go disabled data-tsl-close="delete">Eliminar proyecto</button>')}`,
      setup(root, ctx) {
        let projects = ["sitio-marketing", "tesela-ui", "planeacion-t3"];
        let target = null;
        const dlg = ctx.$("#cd-dlg");
        const input = ctx.$("[data-confirm]");
        const render = () =>
          (ctx.$("[data-list]").innerHTML = projects.map((p) => `<li><span class="xp-mono" style="flex:1">${p}</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-del="${p}">Eliminar…</button></li>`).join("") || '<li class="tsl-muted">No quedan proyectos.</li>');
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
            ctx.toast({ title: `Se eliminó ${target}`, variant: "danger" });
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
        ${head("Modals · share-link.tsx", "Compartir enlace", "Copia el enlace, cambia el acceso general, invita por correo y ajusta el rol de cada persona.")}
        ${trigger("sl-dlg", "Compartir…")}
        ${dialog("sl-dlg", "Compartir “Hoja de ruta T3”", "", `<div class="tsl-stack">
          <div class="tsl-row" style="flex-wrap:nowrap"><tsl-tags style="flex:1" data-tags placeholder="Agrega correos…"></tsl-tags><button type="button" class="tsl-btn tsl-btn--primary tsl-btn--sm" data-invite>Invitar</button></div>
          <ul class="tsl-list" data-people></ul>
          <div class="tsl-row"><span class="tsl-label">Acceso general</span><span class="tsl-spacer"></span><select class="tsl-select" style="width:auto" data-access aria-label="Acceso general"><option value="restricted">Restringido</option><option value="org">Cualquiera en Acme</option><option value="public">Cualquiera con el enlace</option></select></div>
          <div class="tsl-input-group"><input class="tsl-input xp-mono" readonly id="sl-link" value="https://tesela.example/s/q3-roadmap" aria-label="Enlace" /><button type="button" class="tsl-btn tsl-btn--sm" style="margin:3px" data-tsl-copy data-tsl-copy-target="#sl-link">Copiar enlace</button></div></div>`, '<button type="button" class="tsl-btn" data-tsl-close>Listo</button>')}`,
      setup(root, ctx) {
        const people = [["Luis Islas", "Propietario"], ["Ana López", "Editor"]];
        const render = () =>
          (ctx.$("[data-people]").innerHTML = people.map(([n, r], i) => `<li><span class="tsl-avatar tsl-avatar--sm">${esc(n[0].toUpperCase())}</span><span style="flex:1">${esc(n)}</span>${r === "Propietario" ? '<span class="tsl-muted">Propietario</span>' : `<select class="tsl-select" style="width:auto;height:28px" data-role="${i}" aria-label="Rol"><option${r === "Editor" ? " selected" : ""}>Editor</option><option${r === "Lector" ? " selected" : ""}>Lector</option><option>Quitar</option></select>`}</li>`).join(""));
        ctx.on(ctx.$("[data-people]"), "change", (e) => {
          const s = e.target.closest("[data-role]");
          if (!s) return;
          if (s.value === "Quitar") people.splice(Number(s.dataset.role), 1);
          else people[s.dataset.role][1] = s.value;
          render();
        });
        ctx.on(ctx.$("[data-invite]"), "click", () => {
          const tags = ctx.$("[data-tags]");
          const emails = tags.value.filter((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          if (!emails.length) return ctx.toast({ title: "Agrega un correo válido", variant: "warning" });
          emails.forEach((e) => people.push([e, "Lector"]));
          tags.value.forEach((v) => tags.removeTag(v, false));
          ctx.toast({ title: `Invitados: ${emails.length}` });
          render();
        });
        ctx.on(ctx.$("[data-access]"), "change", (e) => ctx.toast({ title: `Acceso: ${e.target.selectedOptions[0].text}`, variant: "info", duration: 1400 }));
        render();
      }
    },

    "upload-files": {
      html: `
        ${head("Modals · upload-files.tsx", "Subir archivos", "Suelta archivos en el diálogo: cada uno tiene su propia barra de progreso y se puede cancelar de forma individual.")}
        ${trigger("uf-dlg", "Subir archivos")}
        ${dialog("uf-dlg", "Subir archivos", "PNG, PDF o ZIP de hasta 50 MB.", '<tsl-dropzone multiple data-drop><strong>Suelta los archivos aquí</strong><span>o haz clic para explorar</span></tsl-dropzone><ul class="tsl-list" data-queue style="margin-top:12px"></ul>', '<button type="button" class="tsl-btn" data-tsl-close>Cerrar</button>')}`,
      setup(root, ctx) {
        const queue = ctx.$("[data-queue]");
        let seen = 0;
        const enqueue = (f) => {
          const li = document.createElement("li");
          li.style.flexWrap = "wrap";
          li.innerHTML = `<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis"></span><span class="xp-mono tsl-muted" data-pct>0%</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cancel>Cancelar</button><progress class="tsl-progress" max="100" value="0" style="flex-basis:100%"></progress>`;
          li.firstChild.textContent = f.name;
          queue.appendChild(li);
          const bar = li.querySelector("progress");
          const id = ctx.every(120, () => {
            bar.value = Math.min(100, bar.value + 5 + Math.random() * 12);
            li.querySelector("[data-pct]").textContent = `${Math.round(bar.value)}%`;
            if (bar.value >= 100) {
              clearInterval(id);
              li.querySelector("[data-cancel]").outerHTML = '<span class="tsl-badge tsl-badge--success">Listo</span>';
            }
          });
          li.querySelector("[data-cancel]").addEventListener("click", () => {
            clearInterval(id);
            li.remove();
          });
        };
        ctx.on(ctx.$("[data-drop]"), "tsl-change", (e) => {
          e.detail.files.slice(seen).forEach(enqueue);
          seen = e.detail.files.length;
          ctx.$("[data-drop] .tsl-dropzone__files").hidden = true;
        });
      }
    },

    "command-palette": {
      html: `
        ${head("Modals · command-palette.tsx", "Paleta de comandos", "Un <tsl-command> real: comandos agrupados y ordenados por coincidencia aproximada que hacen cosas de verdad en esta página.")}
        <div class="xp-center" style="min-height:200px"><div class="tsl-stack" style="align-items:center"><button type="button" class="tsl-btn tsl-btn--primary" data-tsl-open="cp-cmd">Abrir paleta de comandos</button><div class="tsl-row"><span class="tsl-badge" data-count>Contador: 0</span><span class="tsl-badge" data-mode>Modo: calmado</span></div></div></div>
        <tsl-command id="cp-cmd" placeholder="Escribe un comando…">
          <button class="tsl-command__item" data-group="Contador" data-value="inc">Aumentar contador <kbd class="tsl-kbd">+</kbd></button>
          <button class="tsl-command__item" data-group="Contador" data-value="dec">Disminuir contador <kbd class="tsl-kbd">−</kbd></button>
          <button class="tsl-command__item" data-group="Contador" data-value="reset">Reiniciar contador</button>
          <button class="tsl-command__item" data-group="Apariencia" data-value="theme" data-keywords="oscuro claro dark light">Alternar tema</button>
          <button class="tsl-command__item" data-group="Apariencia" data-value="mode" data-keywords="enfoque ruidoso focus loud">Cambiar modo</button>
          <button class="tsl-command__item" data-group="Ayuda" data-value="toast" data-keywords="hola hello">Saludar</button>
        </tsl-command>`,
      setup(root, ctx) {
        let n = 0;
        let loud = false;
        ctx.on(ctx.$("#cp-cmd"), "tsl-select", (e) => {
          const v = e.detail.value;
          if (v === "inc") n++;
          if (v === "dec") n--;
          if (v === "reset") n = 0;
          if (v === "theme") TeselaUI.setTheme(TeselaUI.getTheme() === "dark" ? "light" : "dark");
          if (v === "mode") loud = !loud;
          if (v === "toast") ctx.toast({ title: "Hola desde la paleta 👋" });
          ctx.$("[data-count]").textContent = `Contador: ${n}`;
          ctx.$("[data-mode]").textContent = `Modo: ${loud ? "ruidoso" : "calmado"}`;
          ctx.$("[data-mode]").className = `tsl-badge${loud ? " tsl-badge--warning" : ""}`;
        });
      }
    },

    feedback: {
      html: `
        ${head("Modals · feedback.tsx", "Comentarios", "Elige un estado de ánimo, escribe un mensaje (obligatorio) y adjunta una captura de pantalla si quieres; luego verás el mensaje de agradecimiento.")}
        ${trigger("fb-dlg", "Enviar comentarios", "")}
        ${dialog("fb-dlg", "¿Qué tal te va?", "", `<form class="tsl-stack" data-form novalidate><tsl-segmented value="good" data-mood><button class="tsl-segmented__item" value="bad">😞</button><button class="tsl-segmented__item" value="ok">😐</button><button class="tsl-segmented__item" value="good">🙂</button><button class="tsl-segmented__item" value="great">🤩</button></tsl-segmented><textarea class="tsl-textarea" data-msg placeholder="Cuéntanos más…" aria-label="Mensaje"></textarea><span class="tsl-error" data-err></span><label class="tsl-choice"><input type="checkbox" class="tsl-check" data-shot checked /> Incluir una captura de pantalla</label><div class="tsl-row" style="justify-content:flex-end"><button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="submit" class="tsl-btn tsl-btn--primary">Enviar</button></div></form><div data-thanks hidden class="tsl-empty" style="border:0"><div class="tsl-empty__title">¡Gracias! 💌</div><p class="tsl-empty__desc">Leemos todos los mensajes.</p><button type="button" class="tsl-btn" data-tsl-close>Cerrar</button></div>`, "")}`,
      setup(root, ctx) {
        const dlg = ctx.$("#fb-dlg");
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const msg = ctx.$("[data-msg]");
          if (msg.value.trim().length < 5) {
            ctx.$("[data-err]").textContent = "Escribe al menos 5 caracteres.";
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
        ${head("Modals · shortcuts.tsx", "Atajos de teclado", "Guía rápida con búsqueda. Mientras está abierta, al presionar una tecla se resaltan todos los atajos que la usan.")}
        ${trigger("sc-dlg", "Mostrar atajos", "")}
        ${dialog("sc-dlg", "Atajos de teclado", "Presiona cualquier tecla para resaltarla.", '<input class="tsl-input" data-q placeholder="Filtrar…" aria-label="Filtrar atajos" /><ul class="tsl-list" data-list style="margin-top:10px;max-height:300px;overflow:auto"></ul>', '<button type="button" class="tsl-btn" data-tsl-close>Cerrar</button>')}`,
      setup(root, ctx) {
        const list = [["Abrir paleta de comandos", ["⌘", "K"]], ["Buscar", ["/"]], ["Nueva incidencia", ["C"]], ["Ir a la bandeja de entrada", ["G", "I"]], ["Alternar barra lateral", ["⌘", "B"]], ["Alternar tema", ["T"]], ["Guardar", ["⌘", "S"]], ["Deshacer", ["⌘", "Z"]], ["Cerrar diálogo", ["Esc"]]];
        let hot = "";
        const render = () => {
          const q = ctx.$("[data-q]").value.toLowerCase();
          ctx.$("[data-list]").innerHTML = list
            .filter(([n, k]) => `${n} ${k.join(" ")}`.toLowerCase().includes(q))
            .map(([n, keys]) => `<li><span style="flex:1">${n}</span>${keys.map((k) => `<kbd class="tsl-kbd" style="${k.toLowerCase() === hot ? "background:var(--xp-accent);color:#fff;border-color:transparent" : ""}">${k}</kbd>`).join(" ")}</li>`)
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
        ${head("Modals · upgrade.tsx", "Mejorar plan", "Compara planes dentro del diálogo, alterna el periodo de facturación y confirma: la insignia de tu plan actual se actualiza.")}
        <div class="xp-center" style="min-height:220px"><div class="tsl-stack" style="align-items:center"><span class="tsl-badge tsl-badge--outline" data-current>Plan actual: Gratis</span><button type="button" class="tsl-btn tsl-btn--accent" data-tsl-open="up-dlg">✦ Mejorar plan</button></div></div>
        ${dialog("up-dlg", "Desbloquea más con Pro", "", `<div class="tsl-stack"><tsl-segmented value="year" data-period><button class="tsl-segmented__item" value="month">Mensual</button><button class="tsl-segmented__item" value="year">Anual −20%</button></tsl-segmented><table class="tsl-table tsl-table--compact"><thead><tr><th></th><th>Gratis</th><th>Pro</th></tr></thead><tbody><tr><td>Proyectos</td><td>3</td><td>Ilimitados</td></tr><tr><td>Miembros</td><td>2</td><td>25</td></tr><tr><td>Dominio personalizado</td><td>—</td><td>✓</td></tr><tr><td>Soporte prioritario</td><td>—</td><td>✓</td></tr></tbody></table><div class="tsl-row"><span class="tsl-muted">Total</span><span class="tsl-spacer"></span><strong class="xp-num" style="font-size:22px" data-price></strong></div></div>`, '<button type="button" class="tsl-btn" data-tsl-close>Quizá después</button><button type="button" class="tsl-btn tsl-btn--accent" data-tsl-close="go">Mejorar ahora</button>', ' style="width:min(520px,calc(100vw - 32px))"')}`,
      setup(root, ctx) {
        const price = () => {
          const y = (ctx.$("[data-period]").value || "year") === "year";
          ctx.$("[data-price]").textContent = y ? "$230 / año" : "$24 / mes";
        };
        ctx.on(ctx.$("[data-period]"), "tsl-change", price);
        ctx.on(ctx.$("#up-dlg"), "close", (e) => {
          if (e.target.returnValue !== "go") return;
          ctx.$("[data-current]").textContent = `Plan actual: Pro (${(ctx.$("[data-period]").value || "year") === "year" ? "anual" : "mensual"})`;
          ctx.$("[data-current]").className = "tsl-badge tsl-badge--accent";
          ctx.toast({ title: "Te damos la bienvenida a Pro ✦" });
          e.target.returnValue = "";
        });
        price();
      }
    },

    export: {
      html: `
        ${head("Modals · export.tsx", "Exportar datos", "Elige un formato, un rango de fechas y las columnas; la exportación avanza con progreso y descarga un archivo CSV o JSON real.")}
        ${trigger("ex-dlg", "Exportar…", "")}
        ${dialog("ex-dlg", "Exportar pedidos", "", `<div class="tsl-stack"><div class="tsl-row"><label class="tsl-choice"><input type="radio" class="tsl-check" name="ex-fmt" value="csv" checked /> CSV</label><label class="tsl-choice"><input type="radio" class="tsl-check" name="ex-fmt" value="json" /> JSON</label></div><div class="tsl-row"><label class="tsl-field" style="flex:1"><span class="tsl-label">Desde</span><input type="date" class="tsl-input" data-from value="2026-09-01" /></label><label class="tsl-field" style="flex:1"><span class="tsl-label">Hasta</span><input type="date" class="tsl-input" data-to value="2026-10-14" /></label></div><span class="tsl-label">Columnas</span><div class="tsl-row">${[["id", "id"], ["customer", "cliente"], ["total", "total"], ["status", "estado"], ["date", "fecha"]].map(([c, l]) => `<label class="tsl-choice"><input type="checkbox" class="tsl-check" data-col value="${c}" checked /> ${l}</label>`).join("")}</div><progress class="tsl-progress" max="100" value="0" data-bar hidden></progress><span class="tsl-error" data-err></span></div>`, '<button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="button" class="tsl-btn tsl-btn--primary" data-go>Exportar</button>')}`,
      setup(root, ctx) {
        const rows = Array.from({ length: 40 }, (_, i) => ({ id: `#${1040 + i}`, customer: ["Acme", "Globex", "Initech", "Hooli"][i % 4], total: (20 + ((i * 37) % 380)).toFixed(2), status: ["pagado", "enviado", "pendiente"][i % 3], date: new Date(Date.UTC(2026, 8, 1) + i * 864e5).toISOString().slice(0, 10) }));
        ctx.on(ctx.$("[data-go]"), "click", (e) => {
          const cols = ctx.$$("[data-col]:checked").map((c) => c.value);
          const from = ctx.$("[data-from]").value;
          const to = ctx.$("[data-to]").value;
          const err = !cols.length ? "Selecciona al menos una columna." : from > to ? "“Desde” debe ser anterior a “Hasta”." : "";
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
            TESELA_XP.download(`pedidos.${fmt}`, text, fmt === "json" ? "application/json" : "text/csv");
            ctx.toast({ title: `Se exportaron ${data.length} filas`, description: `pedidos.${fmt}` });
            ctx.$("#ex-dlg").close();
            bar.hidden = true;
          });
        });
      }
    },

    "create-workspace": {
      html: () => `
        ${head("Modals · create-workspace.tsx", "Crear espacio de trabajo", "Nombre → slug, región e ícono, validados en el diálogo. Los espacios nuevos aparecen en el selector de fondo.")}
        <div class="tsl-row"><div class="tsl-row" data-list style="--gap:6px"></div><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--primary" data-tsl-open="cw-dlg">+ Nuevo espacio de trabajo</button></div>
        ${dialog("cw-dlg", "Crea un espacio de trabajo", "", `<form class="tsl-stack" data-xp-form data-success="Espacio de trabajo “{name}” creado" data-reset novalidate>
          <div class="tsl-row" data-icons>${["🚀", "🎨", "🧪", "📦", "🌿"].map((i, k) => `<button type="button" class="tsl-btn tsl-btn--icon" data-i="${i}" aria-pressed="${k === 0}">${i}</button>`).join("")}</div>
          ${field({ name: "name", label: "Nombre", placeholder: "Diseño Acme", minlength: 2 })}
          <span class="tsl-hint xp-mono" data-slug>tesela.example/…</span>
          <label class="tsl-field"><span class="tsl-label">Región</span><select class="tsl-select" name="region"><option>us-east-1</option><option>eu-central-1</option><option>ap-south-1</option></select></label>
          <div class="tsl-row" style="justify-content:flex-end"><button type="button" class="tsl-btn" data-tsl-close>Cancelar</button><button type="submit" class="tsl-btn tsl-btn--primary">Crear</button></div>
        </form>`, "")}`,
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        let icon = "🚀";
        const list = [["🏢", "Acme"]];
        const render = () => (ctx.$("[data-list]").innerHTML = list.map(([i, n]) => `<span class="tsl-chip" style="color:var(--tsl-fg)">${i} ${esc(n)}</span>`).join(""));
        const name = ctx.$('[name="name"]');
        ctx.on(name, "input", () => (ctx.$("[data-slug]").textContent = `tesela.example/${name.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "…"}`));
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
          ctx.$("[data-slug]").textContent = "tesela.example/…";
        });
        render();
      }
    },

    "two-factor": {
      html: `
        ${head("Modals · two-factor.tsx", "Configuración de dos pasos", "Modal de tres pasos: confirma tu contraseña (cualquiera de 8 o más caracteres), ingresa un código (cualquier código de 6 dígitos) y guarda los códigos de recuperación.")}
        <div class="xp-center" style="min-height:220px"><div class="tsl-stack" style="align-items:center"><span class="tsl-badge" data-state>2FA: desactivada</span><button type="button" class="tsl-btn tsl-btn--primary" data-tsl-open="tf-dlg">Activar verificación en dos pasos</button></div></div>
        ${dialog("tf-dlg", "Activar la autenticación en dos pasos", "", `<ol class="tsl-steps" style="margin-bottom:14px" data-steps><li aria-current="step">Contraseña</li><li>Código</li><li>Recuperación</li></ol>
          <form data-p="0" class="tsl-stack" novalidate><input class="tsl-input" type="password" data-pw placeholder="Contraseña actual" aria-label="Contraseña actual" autocomplete="current-password" /><span class="tsl-error" data-err></span><button type="submit" class="tsl-btn tsl-btn--primary">Continuar</button></form>
          <div data-p="1" hidden class="tsl-stack" style="align-items:center"><span class="tsl-muted">Ingresa el código de 6 dígitos de tu app</span><tsl-otp length="6" data-otp></tsl-otp></div>
          <div data-p="2" hidden class="tsl-stack"><pre class="tsl-code" data-codes></pre><button type="button" class="tsl-btn tsl-btn--primary" data-tsl-close="done">Ya los guardé</button></div>`, "")}`,
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
          ctx.$("[data-err]").textContent = ok ? "" : "La contraseña debe tener al menos 8 caracteres.";
          if (ok) go(1);
        });
        ctx.on(ctx.$("[data-otp]"), "tsl-complete", () => {
          ctx.$("[data-codes]").textContent = Array.from({ length: 6 }, () => Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 7)).join("\n");
          go(2);
        });
        ctx.on(dlg, "close", () => {
          if (dlg.returnValue === "done") {
            ctx.$("[data-state]").textContent = "2FA: activada";
            ctx.$("[data-state]").className = "tsl-badge tsl-badge--success";
            ctx.toast({ title: "Verificación en dos pasos activada" });
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
