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
    const applyAccent = (hex) => {
      root.style.setProperty("--tsl-accent", hex);
      document.querySelectorAll("[data-accent]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.accent === hex)));
    };
    const applyRadius = (r) => {
      root.style.setProperty("--tsl-radius", `${r}px`);
      root.style.setProperty("--tsl-radius-sm", `${Math.max(0, r - 2)}px`);
      root.style.setProperty("--tsl-radius-xs", `${Math.max(0, r - 4)}px`);
    };

    applyAccent(storageGet("tsl-docs-accent") || "#6366f1");
    const savedRadius = storageGet("tsl-docs-radius");
    if (savedRadius) applyRadius(parseInt(savedRadius, 10));

    document.querySelectorAll("[data-accent]").forEach((b) =>
      b.addEventListener("click", () => {
        applyAccent(b.dataset.accent);
        storageSet("tsl-docs-accent", b.dataset.accent);
      })
    );

    const radius = document.getElementById("docs-radius");
    if (radius) {
      if (savedRadius) radius.value = savedRadius;
      radius.addEventListener("tsl-change", (e) => {
        applyRadius(parseInt(e.detail.value, 10));
        storageSet("tsl-docs-radius", e.detail.value);
      });
    }

    document.getElementById("docs-export")?.addEventListener("click", () => {
      const cs = getComputedStyle(root);
      const names = ["--tsl-accent", "--tsl-radius", "--tsl-radius-sm", "--tsl-radius-xs"];
      const css = `:root {\n${names.map((n) => `  ${n}: ${cs.getPropertyValue(n).trim()};`).join("\n")}\n}`;
      TeselaUI.copy(css).then(() => TeselaUI.toast({ title: "Tokens copiados", description: "Pégalos después de tesela-ui.css" }));
    });
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

    document.querySelector(".docs-menu-btn")?.addEventListener("click", () => {
      document.querySelector(".docs-sidebar").classList.toggle("is-open");
    });
  });
})();
