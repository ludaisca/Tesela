// ============================================================================
// Documentación de tesela-ui — genera demos en vivo, vistas de código y navegación para components.html
// Cada <section class="doc"> contiene un <template> (HTML de la demo, mostrado como código)
// y opcionalmente un <script type="text/plain" data-doc-js> (mostrado y ejecutado).
// ============================================================================

(function () {
  "use strict";

  // ---------------------------------------------------------------- Utilidades de código fuente
  function dedent(src) {
    const lines = src.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indent = Math.min(
      ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
    );
    return lines.map((l) => l.slice(indent)).join("\n");
  }

  // La serialización del template convierte los atributos booleanos en attr=""; se restauran
  const BOOLEAN_ATTRS = ["hidden", "disabled", "checked", "open", "multiple", "fill", "selected", "readonly", "required", "indeterminate"];
  function tidyHTML(src) {
    return src.replace(new RegExp(` (${BOOLEAN_ATTRS.join("|")})=""`, "g"), " $1");
  }

  // Resaltador compartido (js/highlight.js)
  const highlightHTML = window.TESELA_HIGHLIGHT.html;
  const highlightJS = window.TESELA_HIGHLIGHT.js;

  // ---------------------------------------------------------------- Pestaña API (desde lib/custom-elements.json)
  let apiBySection = new Map();

  // Texto con `código` en línea, sin interpretar HTML
  function inlineCode(parent, text) {
    String(text).split("`").forEach((part, i) => {
      if (!part) return;
      if (i % 2) {
        const c = document.createElement("code");
        c.textContent = part;
        parent.appendChild(c);
      } else parent.appendChild(document.createTextNode(part));
    });
  }

  function apiTable(title, head, rows) {
    if (!rows.length) return null;
    const box = document.createElement("div");
    box.className = "doc-apipane__group";
    const h = document.createElement("h4");
    h.textContent = title;
    const wrap = document.createElement("div");
    wrap.className = "tsl-table-wrap doc-api";
    const table = document.createElement("table");
    table.className = "tsl-table";
    const tr = document.createElement("tr");
    head.forEach((t) => {
      const th = document.createElement("th");
      th.textContent = t;
      tr.appendChild(th);
    });
    const thead = document.createElement("thead");
    thead.appendChild(tr);
    const tbody = document.createElement("tbody");
    rows.forEach((cells) => {
      const row = document.createElement("tr");
      cells.forEach((c, i) => {
        const td = document.createElement("td");
        if (c && c.code !== undefined) {
          const code = document.createElement("code");
          code.textContent = c.code;
          td.appendChild(code);
          // Los valores cortos (boolean, string…) no se parten; los largos (firmas) sí
          if (c.code.length <= 24) td.classList.add("doc-api__nowrap");
        } else inlineCode(td, c || "");
        if (i === 0) td.className = "doc-api__name";
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.append(thead, tbody);
    wrap.appendChild(table);
    box.append(h, wrap);
    return box;
  }

  function buildApiPane(decls) {
    const pane = document.createElement("div");
    pane.className = "doc-apipane";
    decls.forEach((d) => {
      const head = document.createElement("div");
      head.className = "doc-apipane__head";
      const tag = document.createElement("code");
      tag.className = "doc-apipane__tag";
      tag.textContent = `<${d.tagName}>`;
      head.appendChild(tag);
      if (d["x-formAssociated"]) {
        const b = document.createElement("span");
        b.className = "tsl-badge tsl-badge--accent";
        b.textContent = "campo de formulario";
        head.appendChild(b);
      }
      const p = document.createElement("p");
      p.className = "tsl-muted";
      inlineCode(p, d.description || "");
      pane.append(head, p);
      const fields = (d.members || []).filter((m) => m.kind === "field");
      const methods = (d.members || []).filter((m) => m.kind === "method");
      [
        apiTable("Atributos", ["Atributo", "Tipo", "Por defecto", "Descripción"], (d.attributes || []).map((a) => [{ code: a.name }, { code: a.type.text }, a.default !== undefined ? { code: String(a.default) } : "—", a.description])),
        apiTable("Atributos de los hijos", ["Atributo", "Descripción"], (d["x-itemAttributes"] || []).map((a) => [{ code: a.name }, a.description])),
        apiTable("Propiedades", ["Propiedad", "Tipo", "Descripción"], fields.map((f) => [{ code: f.name }, { code: `${f.readonly ? "readonly " : ""}${f.type.text}` }, f.description])),
        apiTable("Métodos", ["Método", "Descripción"], methods.map((m) => [{ code: `${m.name}(${(m.parameters || []).map((x) => `${x.name}${x.optional ? "?" : ""}: ${x.type.text}`).join(", ")}): ${m.return.type.text}` }, m.description])),
        apiTable("Eventos", ["Evento", "Detalle (event.detail)", "Descripción"], (d.events || []).map((e) => [{ code: e.name }, { code: e.type.text.replace(/^CustomEvent<(.*)>$/, "$1") }, e.description])),
        apiTable("Propiedades CSS", ["Propiedad", "Por defecto", "Descripción"], (d.cssProperties || []).map((c) => [{ code: c.name }, c.default ? { code: c.default } : "—", c.description]))
      ].filter(Boolean).forEach((g) => pane.appendChild(g));
      if (!(d.attributes || []).length && !(d["x-itemAttributes"] || []).length && !fields.length && !methods.length && !(d.events || []).length) {
        const none = document.createElement("p");
        none.className = "tsl-muted";
        none.textContent = "Sin atributos propios: se comporta como el elemento del que hereda.";
        pane.appendChild(none);
      }
    });
    return pane;
  }

  // ---------------------------------------------------------------- Marcos de demo
  const demos = [];

  // Una muestra más estrecha que el marco se centra: se mide lo que ocupa con el ancho completo y se reparte el resto
  // como relleno lateral (--demo-pad). Así lo que ya llena el marco no cambia y lo que no, no queda pegado a la izquierda.
  // Las filas y rejillas sin pintar (solo reparten sus hijos) no cuentan por su ancho de bloque, sino por lo que contienen.
  function paintedExtent(el, depth = 0) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "absolute" || cs.position === "fixed") return null;
    const box = el.getBoundingClientRect();
    if (!box.width && !box.height) return null;
    const painted = /^(svg|canvas|img|video|input|button|select|textarea|hr|table)$/i.test(el.localName) || el.localName.includes("-") && el.children.length === 0 ||
      (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || cs.boxShadow !== "none";
    const kids = Array.from(el.children);
    const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    // Un contenedor con recorte o scroll propio cuenta por su caja: lo que queda fuera de vista no ensancha la muestra
    const clips = cs.overflowX !== "visible";
    if (painted || clips || depth > 5 || !kids.length) return { l: box.left, r: box.right };
    let l = Infinity;
    let r = -Infinity;
    kids.forEach((k) => {
      const e = paintedExtent(k, depth + 1);
      if (e) {
        l = Math.min(l, e.l);
        r = Math.max(r, e.r);
      }
    });
    if (ownText) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const t = range.getBoundingClientRect();
      l = Math.min(l, t.left);
      r = Math.max(r, t.right);
    }
    return isFinite(l) ? { l, r } : null;
  }

  function centerDemo(demo) {
    if (demo.hidden || !demo.isConnected) return;
    demo.style.removeProperty("--demo-pad");
    const base = parseFloat(getComputedStyle(demo).paddingLeft);
    const inner = demo.getBoundingClientRect().width - 2 * base;
    let l = Infinity;
    let r = -Infinity;
    for (const k of demo.children) {
      const e = paintedExtent(k);
      if (e) {
        l = Math.min(l, e.l);
        r = Math.max(r, e.r);
      }
    }
    // Margen de 4 px para que ninguna fila vuelva a partirse por redondeos
    const used = r - l + 4;
    if (!isFinite(l) || used >= inner * 0.9) return;
    // El desplazamiento del contenido respecto al borde izquierdo también se corrige: lo que sobra se reparte a ambos lados
    const lead = l - (demo.getBoundingClientRect().left + base);
    demo.style.setProperty("--demo-pad", `${Math.round((base + (inner - used) / 2 - lead * 0) * 10) / 10}px`);
  }

  function centerDemos() {
    demos.forEach(centerDemo);
  }

  function buildDoc(section) {
    const tpl = section.querySelector(":scope > template");
    if (!tpl) return;
    const jsEl = section.querySelector(":scope > script[data-doc-js]");
    const html = tidyHTML(dedent(tpl.innerHTML));
    const js = jsEl ? dedent(jsEl.textContent) : "";

    const frame = document.createElement("div");
    frame.className = "doc-frame";

    const bar = document.createElement("div");
    bar.className = "doc-frame-bar";
    const decls = apiBySection.get(section.id) || [];
    const views = [["preview", "Vista previa"], ["html", "HTML"]];
    if (js) views.push(["js", "JS"]);
    if (decls.length) views.push(["api", "API"]);
    bar.innerHTML = `
      <tsl-segmented class="tsl-segmented" value="preview" aria-label="View">
        ${views.map(([v, l]) => `<button class="tsl-segmented__item" value="${v}">${l}</button>`).join("")}
      </tsl-segmented>
      <button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-doc-copy>Copiar</button>`;

    const demo = document.createElement("div");
    demo.className = "doc-demo";
    if (section.hasAttribute("data-tall")) demo.style.minHeight = section.dataset.tall || "280px";
    demo.appendChild(tpl.content.cloneNode(true));

    const codeHTML = document.createElement("pre");
    codeHTML.className = "doc-code";
    codeHTML.hidden = true;
    codeHTML.innerHTML = highlightHTML(html);

    const codeJS = document.createElement("pre");
    codeJS.className = "doc-code";
    codeJS.hidden = true;
    codeJS.innerHTML = highlightJS(js);

    const apiPane = decls.length ? buildApiPane(decls) : null;
    if (apiPane) apiPane.hidden = true;

    frame.append(bar, demo, codeHTML);
    if (js) frame.appendChild(codeJS);
    if (apiPane) frame.appendChild(apiPane);
    tpl.replaceWith(frame);

    let view = "preview";
    bar.querySelector("tsl-segmented").addEventListener("tsl-change", (e) => {
      view = e.detail.value;
      demo.hidden = view !== "preview";
      codeHTML.hidden = view !== "html";
      codeJS.hidden = view !== "js";
      if (apiPane) apiPane.hidden = view !== "api";
      bar.querySelector("[data-doc-copy]").hidden = view === "api";
    });
    bar.querySelector("[data-doc-copy]").addEventListener("click", () => {
      const text = view === "js" ? js : html;
      TeselaUI.copy(text).then((ok) =>
        TeselaUI.toast(ok ? { title: `${view === "js" ? "JS" : "HTML"} copiado`, description: section.querySelector("h2").textContent } : { title: "Error al copiar", variant: "danger" })
      );
    });

    TeselaUI.init(demo);
    demos.push(demo);
    if (js) {
      try {
        new Function(js)();
      } catch (err) {
        console.error(`[docs] ${section.id}:`, err);
      }
    }
  }

  // ---------------------------------------------------------------- Navegación lateral
  function buildNav(sections) {
    const nav = document.getElementById("docs-nav");
    const groups = [];
    sections.forEach((s) => {
      const g = s.dataset.group || "Otros";
      let group = groups.find((x) => x.name === g);
      if (!group) groups.push((group = { name: g, items: [] }));
      group.items.push(s);
    });

    nav.innerHTML = groups
      .map(
        (g) => `
        <div class="tsl-nav__label" data-nav-group>${g.name}</div>
        ${g.items
          .map((s) => `<a class="tsl-nav__item" href="#${s.id}" data-nav-item data-search="${(s.querySelector("h2").textContent + " " + (s.dataset.keywords || "")).toLowerCase()}">${s.querySelector("h2").textContent}</a>`)
          .join("")}`
      )
      .join("") + `<div class="docs-empty-search" hidden>Sin coincidencias</div>`;

    const count = document.getElementById("docs-count");
    const NON_COMPONENT_GROUPS = ["Inicio", "Patrones"];
    if (count) count.textContent = String(sections.filter((s) => !NON_COMPONENT_GROUPS.includes(s.dataset.group)).length);

    const search = document.getElementById("docs-search");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      nav.querySelectorAll("[data-nav-item]").forEach((a) => {
        a.hidden = q && !a.dataset.search.includes(q);
        if (!a.hidden) any = true;
      });
      nav.querySelectorAll("[data-nav-group]").forEach((label) => {
        let el = label.nextElementSibling;
        let visible = false;
        while (el && el.hasAttribute("data-nav-item")) {
          if (!el.hidden) visible = true;
          el = el.nextElementSibling;
        }
        label.hidden = !visible;
      });
      nav.querySelector(".docs-empty-search").hidden = any;
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("[data-nav-item]")) document.querySelector(".docs-sidebar").classList.remove("is-open");
    });

    const links = Array.from(nav.querySelectorAll("[data-nav-item]"));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            if (a.getAttribute("href") === `#${entry.target.id}`) a.setAttribute("aria-current", "page");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // ---------------------------------------------------------------- Controles de tokens
  function storageGet(k) {
    try {
      return localStorage.getItem(k);
    } catch (_) {
      return null;
    }
  }
  function storageSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  }

  function setupTokens() {
    const root = document.documentElement;
    const swatches = Array.from(document.querySelectorAll("[data-accent]"));
    const paintAccent = () => {
      const cur = root.style.getPropertyValue("--tsl-accent").trim().toLowerCase();
      swatches.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.accent === cur)));
    };
    const applyRadius = (r) => {
      root.style.setProperty("--tsl-radius", `${r}px`);
      root.style.setProperty("--tsl-radius-sm", `${Math.max(0, r - 2)}px`);
      root.style.setProperty("--tsl-radius-xs", `${Math.max(0, r - 4)}px`);
    };

    // Tema y preset: reflejan siempre el estado real de la biblioteca (también si cambia desde otro sitio)
    const theme = document.getElementById("docs-theme");
    const preset = document.getElementById("docs-preset");
    if (preset) {
      preset.setOptions(TeselaUI.presets.map((p) => ({ value: p.name, label: p.label, hint: p.description })));
      preset.addEventListener("tsl-change", (e) => TeselaUI.setPreset(e.detail.value));
    }
    if (theme) theme.addEventListener("tsl-change", (e) => TeselaUI.setTheme(e.detail.value));
    const sync = () => {
      if (theme) theme.value = TeselaUI.getTheme();
      if (preset) preset.value = TeselaUI.getPreset();
      paintAccent();
    };
    ["tsl-theme", "tsl-preset", "tsl-accent"].forEach((n) => document.addEventListener(n, sync));
    sync();

    // El acento y el radio solo se fuerzan si el usuario los elige; así los presets mandan por defecto
    swatches.forEach((b) => b.addEventListener("click", () => TeselaUI.setAccent(b.dataset.accent)));
    const savedRadius = storageGet("tsl-docs-radius");
    if (savedRadius) applyRadius(parseInt(savedRadius, 10));

    const radius = document.getElementById("docs-radius");
    if (radius) {
      if (savedRadius) radius.value = savedRadius;
      radius.addEventListener("tsl-change", (e) => {
        applyRadius(parseInt(e.detail.value, 10));
        storageSet("tsl-docs-radius", e.detail.value);
      });
    }

    const dir = document.getElementById("docs-dir");
    if (dir) {
      dir.value = TeselaUI.getDirection();
      dir.addEventListener("tsl-change", (e) => TeselaUI.setDirection(e.detail.value));
      document.addEventListener("tsl-direction", (e) => (dir.value = e.detail.direction));
    }

    document.getElementById("docs-reset")?.addEventListener("click", () => {
      TeselaUI.setDirection("ltr");
      TeselaUI.setAccent(null);
      ["--tsl-radius", "--tsl-radius-sm", "--tsl-radius-xs"].forEach((v) => root.style.removeProperty(v));
      storageSet("tsl-docs-radius", "");
      if (radius) radius.value = "";
      TeselaUI.setPreset("tesela");
      TeselaUI.setTheme("dark");
      TeselaUI.toast({ title: "Tokens restablecidos", variant: "info", duration: 1800 });
    });

    document.getElementById("docs-export")?.addEventListener("click", () => {
      const cs = getComputedStyle(root);
      const names = ["--tsl-accent", "--tsl-accent-fg", "--tsl-radius", "--tsl-radius-sm", "--tsl-radius-xs"];
      const css = `:root {\n${names.map((n) => `  ${n}: ${cs.getPropertyValue(n).trim()};`).join("\n")}\n}`;
      TeselaUI.copy(css).then(() => TeselaUI.toast({ title: "Tokens copiados", description: "Pégalos después de tesela-ui.css" }));
    });
  }

  // ---------------------------------------------------------------- Temas y presets
  const rgbOf = (css) => {
    const m = css.match(/[\d.]+/g);
    return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mixOver = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  function setupThemes() {
    const grid = document.getElementById("docs-presets");
    const table = document.querySelector("#docs-contrast tbody");
    const themeInline = document.getElementById("docs-theme-inline");
    const state = document.getElementById("docs-theme-state");
    if (!grid || !table) return;

    // Una tarjeta por preset, con una muestra que lleva su propio data-preset (y el modo efectivo)
    TeselaUI.presets.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "docs-preset";
      b.dataset.tslPreset = p.name;
      b.innerHTML = `<span class="docs-preset__sample" data-preset="${p.name}">
          <span class="sample-row"><span class="sample-btn">Acento</span><span class="sample-dot" style="background:var(--tsl-success)"></span><span class="sample-dot" style="background:var(--tsl-warning)"></span><span class="sample-dot" style="background:var(--tsl-danger)"></span></span>
          <span class="sample-card">Tarjeta con texto atenuado</span>
        </span>
        <span><span class="docs-preset__name"></span><span class="docs-preset__desc" style="display:block"></span></span>`;
      b.querySelector(".docs-preset__name").textContent = p.label;
      b.querySelector(".docs-preset__desc").textContent = p.description;
      grid.appendChild(b);
    });

    // Los pares que se miden: [etiqueta, color del texto, color del fondo, mínimo exigido]
    const pairs = [
      ["Texto / fondo", "--tsl-fg", "--tsl-bg", 7],
      ["Texto / superficie elevada", "--tsl-fg", "--tsl-bg-elevated", 7],
      ["Texto atenuado / fondo", "--tsl-fg-muted", "--tsl-bg", 4.5],
      ["Texto tenue / fondo (decorativo, deshabilitado)", "--tsl-fg-subtle", "--tsl-bg", 3],
      ["Texto del acento / acento (botones)", "--tsl-accent-fg", "--tsl-accent", 4.5],
      ["Texto de peligro / peligro (botón «Eliminar»)", "--tsl-danger-fg", "--tsl-danger", 4.5],
      ["Acento / fondo (foco, selección)", "--tsl-accent", "--tsl-bg", 3],
      ["Éxito / fondo", "--tsl-success", "--tsl-bg", 4.5],
      ["Aviso / fondo", "--tsl-warning", "--tsl-bg", 4.5],
      ["Peligro / fondo", "--tsl-danger", "--tsl-bg", 4.5],
      ["Información / fondo", "--tsl-info", "--tsl-bg", 4.5]
    ];
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const color = (v) => {
      probe.style.color = `var(${v})`;
      return rgbOf(getComputedStyle(probe).color);
    };

    const render = () => {
      const bg = color("--tsl-bg");
      const rows = pairs.map(([label, fgVar, bgVar, min]) => {
        const back = mixOver(color(bgVar), bg);
        const front = mixOver(color(fgVar), back);
        const r = ratio(front, back);
        const level = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA (texto grande)" : "No cumple";
        const pass = r >= min;
        return `<tr><td>${label}</td><td><span class="docs-swatch-pair" style="background:${bgVar === "--tsl-accent" ? "var(--tsl-accent)" : `var(${bgVar})`};color:var(${fgVar})">Aa</span></td><td class="is-num">${r.toFixed(2)} : 1</td><td><span class="tsl-badge tsl-badge--${pass ? "success" : "danger"}">${level}${pass ? "" : ` (mín. ${min})`}</span></td></tr>`;
      });
      table.innerHTML = rows.join("");
    };

    const sync = () => {
      const theme = TeselaUI.getTheme();
      const resolved = TeselaUI.getResolvedTheme();
      if (themeInline) themeInline.value = theme;
      if (state) state.textContent = theme === "system" ? `El sistema usa el modo ${resolved === "dark" ? "oscuro" : "claro"}` : "";
      const preset = TeselaUI.getPreset();
      grid.querySelectorAll(".docs-preset").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.tslPreset === preset));
        b.querySelector(".docs-preset__sample").setAttribute("data-theme", resolved);
      });
      render();
    };
    if (themeInline) themeInline.addEventListener("tsl-change", (e) => TeselaUI.setTheme(e.detail.value));
    ["tsl-theme", "tsl-preset", "tsl-accent"].forEach((n) => document.addEventListener(n, sync));
    sync();
  }

  // ---------------------------------------------------------------- Arranque
  document.addEventListener("DOMContentLoaded", async () => {
    // La API sale del manifiesto generado; si no se puede leer (p. ej. file://) se omite la pestaña
    try {
      const res = await fetch("lib/custom-elements.json");
      const manifest = await res.json();
      manifest.modules.flatMap((m) => m.declarations).filter((d) => d.tagName && d["x-docs"]).forEach((d) => {
        d["x-docs"].forEach((id) => apiBySection.set(id, (apiBySection.get(id) || []).concat(d)));
      });
    } catch (_) {
      apiBySection = new Map();
    }
    const sections = Array.from(document.querySelectorAll("section.doc[id]"));
    sections.forEach(buildDoc);
    buildNav(sections);
    setupTokens();
    setupThemes();

    document.querySelector(".docs-menu-btn")?.addEventListener("click", () => {
      document.querySelector(".docs-sidebar").classList.toggle("is-open");
    });

    // Centrado de las muestras: tras cargar las fuentes y cada vez que cambia el ancho del contenido o la dirección
    const recenter = () => requestAnimationFrame(centerDemos);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(recenter);
    recenter();
    const main = document.querySelector(".docs-main");
    if (main && window.ResizeObserver) {
      let last = main.clientWidth;
      new ResizeObserver(() => {
        if (main.clientWidth !== last) {
          last = main.clientWidth;
          recenter();
        }
      }).observe(main);
    }
    document.addEventListener("tsl-direction", recenter);
  });
})();
