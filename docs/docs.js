// ============================================================================
// devl-ui docs — builds live demos, code views and navigation for components.html
// Each <section class="doc"> holds a <template> (demo HTML, shown as source)
// and optionally a <script type="text/plain" data-doc-js> (shown and executed).
// ============================================================================

(function () {
  "use strict";

  // ---------------------------------------------------------------- Source utils
  function dedent(src) {
    const lines = src.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indent = Math.min(
      ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
    );
    return lines.map((l) => l.slice(indent)).join("\n");
  }

  // Template serialisation turns boolean attributes into attr="" — restore them
  const BOOLEAN_ATTRS = ["hidden", "disabled", "checked", "open", "multiple", "fill", "selected", "readonly", "required", "indeterminate"];
  function tidyHTML(src) {
    return src.replace(new RegExp(` (${BOOLEAN_ATTRS.join("|")})=""`, "g"), " $1");
  }

  // Shared highlighter (js/highlight.js)
  const highlightHTML = window.DEVL_HIGHLIGHT.html;
  const highlightJS = window.DEVL_HIGHLIGHT.js;

  // ---------------------------------------------------------------- Demo frames
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
    const views = [["preview", "Preview"], ["html", "HTML"]];
    if (js) views.push(["js", "JS"]);
    bar.innerHTML = `
      <dv-segmented class="dv-segmented" value="preview" aria-label="View">
        ${views.map(([v, l]) => `<button class="dv-segmented__item" value="${v}">${l}</button>`).join("")}
      </dv-segmented>
      <button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-doc-copy>Copy</button>`;

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
    bar.querySelector("dv-segmented").addEventListener("dv-change", (e) => {
      view = e.detail.value;
      demo.hidden = view !== "preview";
      codeHTML.hidden = view !== "html";
      codeJS.hidden = view !== "js";
    });
    bar.querySelector("[data-doc-copy]").addEventListener("click", () => {
      const text = view === "js" ? js : html;
      DevlUI.copy(text).then((ok) =>
        DevlUI.toast(ok ? { title: `Copied ${view === "js" ? "JS" : "HTML"}`, description: section.querySelector("h2").textContent } : { title: "Copy failed", variant: "danger" })
      );
    });

    DevlUI.init(demo);
    if (js) {
      try {
        new Function(js)();
      } catch (err) {
        console.error(`[docs] ${section.id}:`, err);
      }
    }
  }

  // ---------------------------------------------------------------- Sidebar nav
  function buildNav(sections) {
    const nav = document.getElementById("docs-nav");
    const groups = [];
    sections.forEach((s) => {
      const g = s.dataset.group || "Other";
      let group = groups.find((x) => x.name === g);
      if (!group) groups.push((group = { name: g, items: [] }));
      group.items.push(s);
    });

    nav.innerHTML = groups
      .map(
        (g) => `
        <div class="dv-nav__label" data-nav-group>${g.name}</div>
        ${g.items
          .map((s) => `<a class="dv-nav__item" href="#${s.id}" data-nav-item data-search="${(s.querySelector("h2").textContent + " " + (s.dataset.keywords || "")).toLowerCase()}">${s.querySelector("h2").textContent}</a>`)
          .join("")}`
      )
      .join("") + `<div class="docs-empty-search" hidden>No matches</div>`;

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

  // ---------------------------------------------------------------- Token controls
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
      root.style.setProperty("--dv-accent", hex);
      document.querySelectorAll("[data-accent]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.accent === hex)));
    };
    const applyRadius = (r) => {
      root.style.setProperty("--dv-radius", `${r}px`);
      root.style.setProperty("--dv-radius-sm", `${Math.max(0, r - 2)}px`);
      root.style.setProperty("--dv-radius-xs", `${Math.max(0, r - 4)}px`);
    };

    applyAccent(storageGet("dv-docs-accent") || "#6366f1");
    const savedRadius = storageGet("dv-docs-radius");
    if (savedRadius) applyRadius(parseInt(savedRadius, 10));

    document.querySelectorAll("[data-accent]").forEach((b) =>
      b.addEventListener("click", () => {
        applyAccent(b.dataset.accent);
        storageSet("dv-docs-accent", b.dataset.accent);
      })
    );

    const radius = document.getElementById("docs-radius");
    if (radius) {
      if (savedRadius) radius.value = savedRadius;
      radius.addEventListener("dv-change", (e) => {
        applyRadius(parseInt(e.detail.value, 10));
        storageSet("dv-docs-radius", e.detail.value);
      });
    }

    document.getElementById("docs-export")?.addEventListener("click", () => {
      const cs = getComputedStyle(root);
      const names = ["--dv-accent", "--dv-radius", "--dv-radius-sm", "--dv-radius-xs"];
      const css = `:root {\n${names.map((n) => `  ${n}: ${cs.getPropertyValue(n).trim()};`).join("\n")}\n}`;
      DevlUI.copy(css).then(() => DevlUI.toast({ title: "Token overrides copied", description: "Paste after devl-ui.css" }));
    });
  }

  // ---------------------------------------------------------------- Boot
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
