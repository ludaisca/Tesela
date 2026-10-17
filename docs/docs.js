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
    const views = [["preview", "Vista previa"], ["html", "HTML"]];
    if (js) views.push(["js", "JS"]);
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

    frame.append(bar, demo, codeHTML);
    if (js) frame.appendChild(codeJS);
    tpl.replaceWith(frame);

    let view = "preview";
    bar.querySelector("tsl-segmented").addEventListener("tsl-change", (e) => {
      view = e.detail.value;
      demo.hidden = view !== "preview";
      codeHTML.hidden = view !== "html";
      codeJS.hidden = view !== "js";
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
  document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(document.querySelectorAll("section.doc[id]"));
    sections.forEach(buildDoc);
    buildNav(sections);
    setupTokens();

    document.querySelector(".docs-menu-btn")?.addEventListener("click", () => {
      document.querySelector(".docs-sidebar").classList.toggle("is-open");
    });
  });
})();
