// ============================================================================
// Tesela — Controlador principal, router, paleta de comandos y UI
// JS puro, sin librerías externas
// ============================================================================

(function () {
  const DATA = window.TESELA_DATA;
  const FLAT = window.TESELA_FLAT_ITEMS;
  const PREVIEWS = window.TESELA_PREVIEWS;
  const AUDIO = window.TESELA_AUDIO;
  const XP = window.TESELA_XP;
  const HL = window.TESELA_HIGHLIGHT;
  const FAV_KEY = "tesela-favorites";

  function loadFavorites(fallback) {
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch (_) {}
    return new Set(fallback);
  }

  function saveFavorites() {
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]));
    } catch (_) {}
  }

  const state = {
    viewMode: "grid", // "grid" | "stack" | "compact"
    filterMode: "all", // "all" | "ready" | "wip" | "favs"
    theme: window.TeselaUI ? window.TeselaUI.getTheme() : "dark", // "dark" | "light"
    blueprint: false,
    // Indexado por ruta completa: los slugs se repiten entre carpetas (p. ej. "profile", "two-factor")
    favorites: loadFavorites([
      "/c/layouts/workspace-rail",
      "/c/charts/revenue-area",
      "/c/modals/command-palette",
      "/c/pricing/three-tier"
    ]),
    cmdkOpen: false,
    cmdkQuery: "",
    cmdkIndex: 0,
    cmdkResults: [...FLAT],
    activeItem: null, // flatItem cuando se está en la vista Sandbox (/c/:cat/:slug)
    codeDrawerOpen: false,
    codeMode: "html", // "html" | "js"
    unmountXp: null, // función de desmontaje del experimento funcional montado
    viewportSize: "100%" // "100%" | "1024px" | "768px" | "420px"
  };

  // --------------------------------------------------------------------------
  // 1. Inicialización
  // --------------------------------------------------------------------------
  function init() {
    syncCatalogCounts();
    new window.TESELA_SHADER("ambient-canvas");
    renderHeroCards();
    renderFolderRail();
    renderGallery();
    bindGlobalEvents();
    setupScrollSpy();
    handleHashRoute();
  }

  // Mantener sincronizado el texto estático de index.html con el catálogo de data.js
  function syncCatalogCounts() {
    const files = FLAT.length;
    const cmdkInput = document.getElementById("cmdk-input");
    if (cmdkInput) cmdkInput.placeholder = `Buscar entre ${files} experimentos, carpetas, archivos o etiquetas…`;
    const cmdkCount = document.getElementById("cmdk-result-count");
    if (cmdkCount) cmdkCount.textContent = `${files} resultados`;
  }

  // --------------------------------------------------------------------------
  // 2. Renderizar las tarjetas interactivas del hero (primitivos, IA, HUD + widgets en vivo)
  // --------------------------------------------------------------------------
  function renderHeroCards() {
    const container = document.getElementById("hero-cards-grid");
    if (!container) return;

    container.innerHTML = DATA.heroCards
      .map((card) => {
        let microWidget = "";
        if (card.id === "primitivos") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Vista previa interactiva">
              <button type="button" class="hero-pill-toggle is-on" data-hero-toggle title="Alternar">
                <span class="hero-pill-dot"></span><span>tesela-ui</span>
              </button>
              <button type="button" class="hero-pill-toggle" data-hero-toggle title="Alternar">
                <span class="hero-pill-dot"></span><span>OKLCH</span>
              </button>
              <span class="hero-micro-badge">v4.2</span>
            </div>`;
        } else if (card.id === "ia") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Estado de servicios">
              <span class="hero-status-chip"><i class="dot-emerald"></i> Acceso</span>
              <span class="hero-status-chip"><i class="dot-amber"></i> Pagos</span>
              <span class="hero-status-chip"><i class="dot-sky"></i> Correo</span>
            </div>`;
        } else if (card.id === "hud") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Selector de horario">
              <button type="button" class="hero-slot-btn is-selected" data-hero-slot>09:30</button>
              <button type="button" class="hero-slot-btn" data-hero-slot>11:00</button>
              <button type="button" class="hero-slot-btn" data-hero-slot>14:30</button>
            </div>`;
        }

        return `
          <div class="hero-promo-card accent-${card.accent}" data-hero-card="${card.id}">
            <div class="hero-promo-glow"></div>
            <div class="hero-promo-inner">
              <div class="hero-promo-top">
                <div class="hero-promo-eyebrow">
                  <span class="hero-promo-dot"></span>
                  <span>${card.badge}</span>
                </div>
                ${microWidget}
              </div>
              <h2 class="hero-promo-title">${card.title}</h2>
              <p class="hero-promo-desc">${card.description}</p>
              <a href="#cat-${card.targetCat || (card.id === "primitivos" ? "layouts" : card.id === "ia" ? "ai-agents" : "devtools")}" class="hero-promo-cta">
                <span>${card.cta}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
              </a>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // --------------------------------------------------------------------------
  // 3. Renderizar el minimapa flotante de carpetas (salto rápido a carpeta)
  // --------------------------------------------------------------------------
  function renderFolderRail() {
    const rail = document.getElementById("folder-minimap-list");
    if (!rail) return;

    rail.innerHTML = DATA.categories
      .map(
        (cat, i) => `
        <li>
          <a href="#cat-${cat.id}" class="minimap-item ${i === 0 ? "is-active" : ""}" data-minimap-cat="${cat.id}" title="${cat.title} (${cat.items.length} files)">
            <span class="minimap-idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="minimap-label">${cat.title}</span>
            <span class="minimap-count">${String(cat.items.length).padStart(2, "0")}</span>
          </a>
        </li>`
      )
      .join("");
  }

  // --------------------------------------------------------------------------
  // 4. Renderizar todas las categorías y tarjetas de experimentos
  // --------------------------------------------------------------------------
  function renderGallery() {
    const main = document.getElementById("gallery-root");
    if (!main) return;

    main.setAttribute("data-view", state.viewMode);

    let totalRendered = 0;
    const html = DATA.categories
      .map((cat, catIdx) => {
        const filteredItems = cat.items.filter((item) => {
          if (state.filterMode === "new") return Boolean(cat.isNew);
          if (state.filterMode === "ready") return !item.wip;
          if (state.filterMode === "wip") return item.wip;
          if (state.filterMode === "favs") return state.favorites.has(`/c/${cat.id}/${item.slug}`);
          return true;
        });

        if (filteredItems.length === 0) return "";
        totalRendered += filteredItems.length;

        const fileCountStr = String(filteredItems.length).padStart(2, "0");
        const iconMarkup = PREVIEWS.getCategoryIcon(cat.id);

        const cardsHtml = filteredItems
          .map((item, idx) => {
            const path = `/c/${cat.id}/${item.slug}`;
            const isFav = state.favorites.has(path);
            const svgPreview = PREVIEWS.generatePreviewSVG(cat.id, item, idx);

            return `
              <li class="exp-card-item" data-cat="${cat.id}" data-slug="${item.slug}">
                <a href="#${path}" class="exp-card-link" data-open-path="${path}">
                  <div class="exp-card-frame">
                    ${svgPreview}
                    <div class="exp-card-overlay">
                      <span class="exp-hover-pill" data-quick-code="${path}" title="Ver código HTML y JS">&lt;/&gt; Código</span>
                      <span class="exp-hover-pill">Abrir en vivo ↗</span>
                    </div>
                    <div class="exp-blueprint-coords" aria-hidden="true">320×200 · ${cat.id}/${item.slug}</div>
                  </div>
                  <div class="exp-card-meta">
                    <div class="exp-card-title-row">
                      <span class="exp-card-title">${item.title}</span>
                      ${cat.isNew ? `<span class="exp-new-badge">NEW</span>` : item.wip ? `<span class="exp-wip-badge">WIP</span>` : ""}
                    </div>
                    <div class="exp-card-file-row">
                      <span class="exp-card-filename">${item.file}</span>
                      <button type="button" class="exp-fav-btn ${isFav ? "is-fav" : ""}" data-toggle-fav="${path}" title="Marcar favorito">
                        ★
                      </button>
                    </div>
                    ${
                      state.viewMode === "stack"
                        ? `<p class="exp-stack-desc">${cat.description} Implementación interactiva sin dependencias, con atajos de teclado e inspector de código en vivo.</p>
                           <div class="exp-stack-tags">${item.tags.map((t) => `<span>#${t}</span>`).join("")}</div>`
                        : ""
                    }
                  </div>
                </a>
              </li>
            `;
          })
          .join("");

        return `
          <section class="cat-section" id="cat-${cat.id}" data-category-section="${cat.id}">
            <div class="cat-divider" aria-hidden="true"></div>
            <header class="cat-header">
              <div class="cat-header-left">
                <div class="cat-icon-box" style="--cat-accent:${cat.accent}">
                  ${iconMarkup}
                </div>
                <div class="cat-title-group">
                  <div class="cat-title-line">
                    <h2 class="cat-title">${cat.title}</h2>
                    <span class="cat-index-pill">FOLDER ${String(catIdx + 1).padStart(2, "0")}</span>
                    ${cat.isNew ? `<span class="cat-new-pill">NEW v2</span>` : ""}
                  </div>
                  <p class="cat-subtitle">
                    ${cat.description}
                    <span class="cat-file-count">· ${fileCountStr} ${filteredItems.length === 1 ? "file" : "files"}</span>
                  </p>
                </div>
              </div>
              <button type="button" class="cat-open-first-btn" data-open-path="/c/${cat.id}/${filteredItems[0].slug}">
                <span>Abrir carpeta</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </header>
            <ul class="exp-grid">
              ${cardsHtml}
            </ul>
          </section>
        `;
      })
      .join("");

    main.innerHTML =
      html ||
      `<div class="empty-filter-state">
        <p>Ningún diseño coincide con el filtro.</p>
        <button type="button" class="sb-btn-primary" id="reset-filter-btn">Mostrar los ${FLAT.length} archivos</button>
      </div>`;

    const counterEl = document.getElementById("header-count-text");
    if (counterEl) {
      counterEl.textContent = `${totalRendered} FILES · ${DATA.categories.length} FOLDERS`;
    }

    bindCardSpotlightEffects();
  }

  // --------------------------------------------------------------------------
  // 5. Foco radial que sigue al mouse e inclinación 3D sutil en las tarjetas
  // --------------------------------------------------------------------------
  function bindCardSpotlightEffects() {
    const cards = document.querySelectorAll(".hero-promo-card, .exp-card-frame");
    cards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty("--mx", `${x}px`);
          card.style.setProperty("--my", `${y}px`);
        },
        { passive: true }
      );
      card.addEventListener(
        "pointerenter",
        () => {
          AUDIO.play("tick");
        },
        { passive: true }
      );
    });
  }

  // --------------------------------------------------------------------------
  // 6. Vista Sandbox a pantalla completa (/c/:category/:slug) y HUD de teclado
  // --------------------------------------------------------------------------
  function openSandbox(path, pushHash = true) {
    const item = FLAT.find((it) => it.path === path);
    if (!item) return;

    state.activeItem = item;
    if (pushHash && window.location.hash !== `#${path}`) {
      history.pushState(null, "", `#${path}`);
    }

    const overlay = document.getElementById("sandbox-overlay");
    const stage = document.getElementById("sandbox-stage");
    const breadcrumb = document.getElementById("sandbox-breadcrumb");
    const codeContent = document.getElementById("sandbox-code-pre");

    if (!overlay || !stage) return;

    AUDIO.play("open");
    document.body.classList.add("is-sandbox-open");
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");

    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <span class="sb-bc-dot" style="background:${item.categoryAccent}"></span>
        <span class="sb-bc-cat">${item.categoryTitle}</span>
        <span class="sb-bc-sep">/</span>
        <strong class="sb-bc-title">${item.title}</strong>
        <span class="sb-bc-file">${item.file}</span>
        <span class="sb-bc-index">(${item.globalIndex + 1} of ${FLAT.length})</span>
      `;
    }

    stage.style.maxWidth = state.viewportSize;
    unmountExperiment();
    state.unmountXp = XP.mount(stage, item);
    fitColumn(stage);
    const wrap = stage.closest(".sandbox-viewport-wrap");
    if (wrap) wrap.scrollTop = 0;

    updateCodeDrawer();
  }

  // Si todas las muestras declaran un ancho máximo en px, la composición se estrecha a esa columna (y se centra)
  function fitColumn(stage) {
    const xp = stage.querySelector(".xp");
    if (!xp) return;
    xp.style.removeProperty("--xp-col");
    let col = 0;
    for (const k of xp.children) {
      if (k.matches(".xp-head, template") || getComputedStyle(k).display === "none") continue;
      if (k.matches(".xp-center")) {
        col = Math.max(col, 560); // lanzadores de diálogos: un botón centrado bajo la cabecera
        continue;
      }
      const mw = getComputedStyle(k).maxWidth;
      if (!mw.endsWith("px")) return;
      col = Math.max(col, parseFloat(mw));
    }
    if (col) xp.style.setProperty("--xp-col", `${col}px`);
  }

  function unmountExperiment() {
    if (state.unmountXp) {
      state.unmountXp();
      state.unmountXp = null;
    }
  }

  function closeSandbox(pushHash = true) {
    if (!state.activeItem) return;
    state.activeItem = null;
    state.codeDrawerOpen = false;
    unmountExperiment();
    const stageEl = document.getElementById("sandbox-stage");
    if (stageEl) stageEl.innerHTML = "";
    const overlay = document.getElementById("sandbox-overlay");
    const drawer = document.getElementById("sandbox-code-drawer");
    if (drawer) drawer.hidden = true;
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("is-sandbox-open");
    AUDIO.play("close");

    if (pushHash && window.location.hash.startsWith("#/c/")) {
      history.pushState(null, "", window.location.pathname);
    }
  }

  function updateCodeDrawer() {
    const drawer = document.getElementById("sandbox-code-drawer");
    const codePre = document.getElementById("sandbox-code-pre");
    if (!drawer || !codePre || !state.activeItem) return;

    drawer.hidden = !state.codeDrawerOpen;
    if (state.codeDrawerOpen) {
      const raw = getSource(state.activeItem, state.codeMode);
      codePre.innerHTML = state.codeMode === "js" ? HL.js(raw) : HL.html(raw);
    }
  }

  function getSource(item, mode) {
    return XP.source(item)[mode];
  }

  function navigateSandboxRel(delta) {
    if (!state.activeItem) return;
    const nextIdx = (state.activeItem.globalIndex + delta + FLAT.length) % FLAT.length;
    openSandbox(FLAT[nextIdx].path);
  }

  function navigateSandboxGroup(deltaCat) {
    if (!state.activeItem) return;
    const totalCats = DATA.categories.length;
    const nextCatIdx = (state.activeItem.categoryIndex + deltaCat + totalCats) % totalCats;
    const targetCat = DATA.categories[nextCatIdx];
    if (targetCat && targetCat.items[0]) {
      openSandbox(`/c/${targetCat.id}/${targetCat.items[0].slug}`);
    }
  }

  function openRandomDesign() {
    const randIdx = Math.floor(Math.random() * FLAT.length);
    AUDIO.play("chime");
    openSandbox(FLAT[randIdx].path);
    showToast(`Salto aleatorio a ${FLAT[randIdx].title} (${FLAT[randIdx].categoryTitle})`);
  }

  // --------------------------------------------------------------------------
  // 7. Paleta de comandos (⌘K) con búsqueda difusa propia y vista previa instantánea
  // --------------------------------------------------------------------------
  function fuzzyMatch(text, query) {
    if (!query) return { score: 1, matched: true };
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (t.includes(q)) {
      return { score: 100 - t.indexOf(q), matched: true };
    }
    let qi = 0;
    let score = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        score += 10;
        qi++;
      }
    }
    return { score, matched: qi === q.length };
  }

  function openCmdK() {
    state.cmdkOpen = true;
    state.cmdkQuery = "";
    state.cmdkIndex = 0;
    const modal = document.getElementById("cmdk-modal");
    const input = document.getElementById("cmdk-input");
    if (!modal) return;
    AUDIO.play("open");
    modal.hidden = false;
    updateCmdKResults();
    setTimeout(() => input?.focus(), 10);
  }

  function closeCmdK() {
    if (!state.cmdkOpen) return;
    state.cmdkOpen = false;
    const modal = document.getElementById("cmdk-modal");
    if (modal) modal.hidden = true;
    AUDIO.play("close");
  }

  function updateCmdKResults() {
    const q = state.cmdkQuery;
    const scored = [];
    FLAT.forEach((item) => {
      const target = `${item.title} ${item.categoryTitle} ${item.file} ${item.tags.join(" ")}`;
      const res = fuzzyMatch(target, q);
      if (res.matched) {
        scored.push({ item, score: res.score });
      }
    });
    scored.sort((a, b) => b.score - a.score);
    state.cmdkResults = scored.map((s) => s.item);
    state.cmdkIndex = Math.min(state.cmdkIndex, Math.max(0, state.cmdkResults.length - 1));
    renderCmdKList();
  }

  function renderCmdKList() {
    const listEl = document.getElementById("cmdk-results-list");
    const previewEl = document.getElementById("cmdk-live-preview");
    const countEl = document.getElementById("cmdk-result-count");
    if (!listEl) return;

    if (countEl) {
      countEl.textContent = `${state.cmdkResults.length} results`;
    }

    if (state.cmdkResults.length === 0) {
      listEl.innerHTML = `<div class="cmdk-empty"></div>`;
      listEl.firstElementChild.textContent = `Sin experimentos para "${state.cmdkQuery}"`;
      if (previewEl) previewEl.innerHTML = "";
      return;
    }

    listEl.innerHTML = state.cmdkResults
      .slice(0, 60)
      .map((item, idx) => {
        const active = idx === state.cmdkIndex;
        return `
          <button type="button" class="cmdk-row ${active ? "is-selected" : ""}" data-cmdk-idx="${idx}" data-cmdk-path="${item.path}">
            <div class="cmdk-row-left">
              <span class="cmdk-dot" style="background:${item.categoryAccent}"></span>
              <span class="cmdk-title">${item.title}</span>
              ${item.wip ? `<span class="exp-wip-badge">WIP</span>` : ""}
            </div>
            <div class="cmdk-row-right">
              <span class="cmdk-cat">${item.categoryTitle}</span>
              <span class="cmdk-file">${item.file}</span>
            </div>
          </button>
        `;
      })
      .join("");

    const activeRow = listEl.querySelector(".cmdk-row.is-selected");
    if (activeRow) {
      activeRow.scrollIntoView({ block: "nearest" });
    }

    const activeItem = state.cmdkResults[state.cmdkIndex];
    if (previewEl && activeItem) {
      previewEl.innerHTML = `
        <div class="cmdk-preview-card">
          <div class="cmdk-preview-svg-wrap">
            ${PREVIEWS.generatePreviewSVG(activeItem.categoryId, activeItem, activeItem.itemIndex)}
          </div>
          <div class="cmdk-preview-info">
            <span class="sb-eyebrow" style="color:${activeItem.categoryAccent}">${activeItem.categoryTitle.toUpperCase()}</span>
            <h4>${activeItem.title}</h4>
            <p>${activeItem.categoryDescription}</p>
            <div class="cmdk-preview-tags">
              ${activeItem.tags.map((t) => `<span>#${t}</span>`).join("")}
            </div>
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 8. Tema, rayos X blueprint y notificaciones toast
  // --------------------------------------------------------------------------
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    if (window.TeselaUI) window.TeselaUI.setTheme(state.theme);
    else document.documentElement.setAttribute("data-theme", state.theme);
    AUDIO.play("click");
    showToast(`Modo ${state.theme === "dark" ? "oscuro" : "claro"} activado`);
  }

  function toggleBlueprint() {
    state.blueprint = !state.blueprint;
    if (state.blueprint) {
      document.documentElement.setAttribute("data-blueprint", "true");
    } else {
      document.documentElement.removeAttribute("data-blueprint");
    }
    const btn = document.getElementById("btn-blueprint");
    if (btn) btn.setAttribute("aria-pressed", String(state.blueprint));
    AUDIO.play("click");
    showToast(state.blueprint ? "Cuadrícula Blueprint activada" : "Cuadrícula Blueprint desactivada");
  }

  function showToast(message) {
    if (window.TeselaUI) {
      window.TeselaUI.toast({ title: message, variant: "neutral", duration: 2600 });
      return;
    }
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = "live-toast";
    toast.innerHTML = `
      <span class="live-toast-dot"></span>
      <span class="live-toast-msg"></span>
    `;
    toast.querySelector(".live-toast-msg").textContent = message;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 260);
    }, 2600);
  }

  // --------------------------------------------------------------------------
  // 9. Scroll-spy del minimapa de carpetas
  // --------------------------------------------------------------------------
  function setupScrollSpy() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const catId = entry.target.getAttribute("data-category-section");
            document.querySelectorAll(".minimap-item").forEach((el) => {
              el.classList.toggle("is-active", el.getAttribute("data-minimap-cat") === catId);
            });
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    document.querySelectorAll("[data-category-section]").forEach((sec) => observer.observe(sec));
  }

  // --------------------------------------------------------------------------
  // 10. Listeners globales y atajos de teclado
  // --------------------------------------------------------------------------
  function handleHashRoute() {
    const hash = window.location.hash;
    if (hash.startsWith("#/c/")) {
      const path = hash.slice(1);
      openSandbox(path, false);
    } else if (state.activeItem) {
      closeSandbox(false);
    }
  }

  function bindGlobalEvents() {
    window.addEventListener("popstate", handleHashRoute);

    // Clics delegados
    document.addEventListener("click", (e) => {
      const target = e.target;

      // Botón de estrella de favorito dentro de la tarjeta
      const favBtn = target.closest("[data-toggle-fav]");
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const favPath = favBtn.getAttribute("data-toggle-fav");
        const favItem = FLAT.find((it) => it.path === favPath);
        const label = favItem ? `${favItem.title} (${favItem.categoryTitle})` : favPath;
        if (state.favorites.has(favPath)) {
          state.favorites.delete(favPath);
          favBtn.classList.remove("is-fav");
          showToast(`${label} quitado de favoritos`);
          saveFavorites();
        } else {
          state.favorites.add(favPath);
          favBtn.classList.add("is-fav");
          showToast(`${label} guardado en favoritos ★`);
          saveFavorites();
        }
        AUDIO.play("click");
        return;
      }

      // Botón de código rápido en la capa de la tarjeta
      const quickCodeBtn = target.closest("[data-quick-code]");
      if (quickCodeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const path = quickCodeBtn.getAttribute("data-quick-code");
        state.codeDrawerOpen = true;
        openSandbox(path);
        return;
      }

      // Muestras de color y botones de radio de Token Studio
      const accentSwatch = target.closest("[data-token-accent]");
      if (accentSwatch) {
        const hex = accentSwatch.getAttribute("data-token-accent");
        document.documentElement.style.setProperty("--accent-indigo", hex);
        TeselaUI.setAccent(hex); // fija --tsl-accent y elige un texto legible para él
        document.querySelectorAll("[data-token-accent]").forEach((b) => b.classList.remove("is-active"));
        accentSwatch.classList.add("is-active");
        AUDIO.play("click");
        showToast(`Token --accent-indigo actualizado a ${hex}`);
        return;
      }

      const radiusBtn = target.closest("[data-token-radius]");
      if (radiusBtn) {
        const r = radiusBtn.getAttribute("data-token-radius");
        document.documentElement.style.setProperty("--card-radius", r);
        document.documentElement.style.setProperty("--tsl-radius", r);
        document.documentElement.style.setProperty("--tsl-radius-sm", `${Math.max(0, parseInt(r, 10) - 2)}px`);
        document.querySelectorAll("[data-token-radius]").forEach((b) => b.classList.remove("is-active"));
        radiusBtn.classList.add("is-active");
        AUDIO.play("click");
        showToast(`Radio de superficie actualizado a ${r}`);
        return;
      }

      // Abrir el experimento en el Sandbox
      const openLink = target.closest("[data-open-path]");
      if (openLink) {
        e.preventDefault();
        openSandbox(openLink.getAttribute("data-open-path"));
        return;
      }

      // Interruptores interactivos del hero y franjas horarias
      const heroToggle = target.closest("[data-hero-toggle]");
      if (heroToggle) {
        e.preventDefault();
        heroToggle.classList.toggle("is-on");
        AUDIO.play("click");
        return;
      }
      const heroSlot = target.closest("[data-hero-slot]");
      if (heroSlot) {
        e.preventDefault();
        heroSlot.parentElement.querySelectorAll("[data-hero-slot]").forEach((b) => b.classList.remove("is-selected"));
        heroSlot.classList.add("is-selected");
        AUDIO.play("click");
        showToast(`Horario seleccionado: ${heroSlot.textContent}`);
        return;
      }

      // Botón para restablecer filtros
      if (target.closest("#reset-filter-btn")) {
        setFilterMode("all");
        return;
      }

      // Clic en una fila de CmdK
      const cmdkRow = target.closest("[data-cmdk-path]");
      if (cmdkRow) {
        const path = cmdkRow.getAttribute("data-cmdk-path");
        closeCmdK();
        openSandbox(path);
        return;
      }

      // Acciones del HUD del Sandbox
      const hudBtn = target.closest("[data-hud-action]");
      if (hudBtn) {
        const act = hudBtn.getAttribute("data-hud-action");
        if (act === "back") closeSandbox();
        if (act === "prev") navigateSandboxRel(-1);
        if (act === "next") navigateSandboxRel(1);
        if (act === "prev-group") navigateSandboxGroup(-1);
        if (act === "next-group") navigateSandboxGroup(1);
        if (act === "random") openRandomDesign();
        if (act === "theme") toggleTheme();
        if (act === "blueprint") toggleBlueprint();
        if (act === "code") {
          state.codeDrawerOpen = !state.codeDrawerOpen;
          updateCodeDrawer();
          AUDIO.play("click");
        }
        return;
      }

      // Botones de tamaño de viewport en el encabezado del Sandbox
      const vpBtn = target.closest("[data-vp-size]");
      if (vpBtn) {
        state.viewportSize = vpBtn.getAttribute("data-vp-size");
        document.querySelectorAll("[data-vp-size]").forEach((b) => b.classList.remove("is-active"));
        vpBtn.classList.add("is-active");
        const stage = document.getElementById("sandbox-stage");
        if (stage) stage.style.maxWidth = state.viewportSize;
        AUDIO.play("click");
        return;
      }

      // Selector de modo de código (TSX vs Vanilla)
      const codeTab = target.closest("[data-code-tab]");
      if (codeTab) {
        state.codeMode = codeTab.getAttribute("data-code-tab");
        document.querySelectorAll("[data-code-tab]").forEach((b) => b.classList.remove("is-active"));
        codeTab.classList.add("is-active");
        updateCodeDrawer();
        AUDIO.play("click");
        return;
      }
    });

    // Botones del encabezado
    document.querySelectorAll("[data-view-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.viewMode = btn.getAttribute("data-view-btn");
        document.querySelectorAll("[data-view-btn]").forEach((b) => {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        AUDIO.play("click");
        renderGallery();
        setupScrollSpy();
      });
    });

    document.querySelectorAll("[data-filter-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setFilterMode(btn.getAttribute("data-filter-btn"));
      });
    });

    document.getElementById("btn-cmdk")?.addEventListener("click", openCmdK);
    document.getElementById("hero-cmdk-trigger")?.addEventListener("click", openCmdK);
    document.getElementById("btn-random")?.addEventListener("click", openRandomDesign);
    document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
    document.getElementById("btn-blueprint")?.addEventListener("click", toggleBlueprint);
    document.getElementById("btn-tokens")?.addEventListener("click", () => {
      const pop = document.getElementById("token-studio-popover");
      if (!pop) return;
      pop.hidden = !pop.hidden;
      AUDIO.play("click");
    });
    document.getElementById("btn-close-tokens")?.addEventListener("click", () => {
      const pop = document.getElementById("token-studio-popover");
      if (pop) pop.hidden = true;
    });
    document.getElementById("btn-export-tokens")?.addEventListener("click", () => {
      const cssTokens = `:root {\n  --bg: ${getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()};\n  --fg: ${getComputedStyle(document.documentElement).getPropertyValue("--fg").trim()};\n  --accent-indigo: ${getComputedStyle(document.documentElement).getPropertyValue("--accent-indigo").trim()};\n  --card-radius: ${getComputedStyle(document.documentElement).getPropertyValue("--card-radius").trim() || "9px"};\n}`;
      navigator.clipboard?.writeText(cssTokens).catch(() => {});
      AUDIO.play("chime");
      showToast("Variables CSS copiadas al portapapeles");
    });
    document.getElementById("btn-sound")?.addEventListener("click", (e) => {
      const on = AUDIO.toggle();
      e.currentTarget.setAttribute("aria-pressed", String(on));
      showToast(on ? "Sonidos de interfaz activados" : "Sonidos de interfaz silenciados");
    });

    // Botón para copiar código dentro del panel de código
    document.getElementById("btn-copy-source")?.addEventListener("click", () => {
      if (!state.activeItem) return;
      const raw = getSource(state.activeItem, state.codeMode);
      if (window.TeselaUI) window.TeselaUI.copy(raw);
      else navigator.clipboard?.writeText(raw).catch(() => {});
      AUDIO.play("chime");
      showToast(`${state.activeItem.file} (${state.codeMode.toUpperCase()}) copiado al portapapeles`);
    });

    document.getElementById("btn-close-code")?.addEventListener("click", () => {
      state.codeDrawerOpen = false;
      updateCodeDrawer();
    });

    // Campo de CmdK y fondo
    const cmdkInput = document.getElementById("cmdk-input");
    cmdkInput?.addEventListener("input", () => {
      state.cmdkQuery = cmdkInput.value;
      state.cmdkIndex = 0;
      updateCmdKResults();
    });
    document.getElementById("cmdk-backdrop")?.addEventListener("click", closeCmdK);

    // Atajos de teclado globales
    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;

      // ⌘K o Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (state.cmdkOpen) closeCmdK();
        else openCmdK();
        return;
      }

      // Dentro del modal de CmdK
      if (state.cmdkOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeCmdK();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          state.cmdkIndex = Math.min(state.cmdkResults.length - 1, state.cmdkIndex + 1);
          AUDIO.play("tick");
          renderCmdKList();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          state.cmdkIndex = Math.max(0, state.cmdkIndex - 1);
          AUDIO.play("tick");
          renderCmdKList();
        } else if (e.key === "Enter" && state.cmdkResults[state.cmdkIndex]) {
          e.preventDefault();
          const chosen = state.cmdkResults[state.cmdkIndex];
          closeCmdK();
          openSandbox(chosen.path);
        }
        return;
      }

      if (isInput) return;

      // Los experimentos controlan el teclado mientras el foco esté dentro de ellos o haya un diálogo abierto
      const stageEl = document.getElementById("sandbox-stage");
      if (state.activeItem && e.key === "Escape" && (e.defaultPrevented || document.querySelector("dialog[open]"))) return;
      if (state.activeItem && stageEl && e.key !== "Escape" && (stageEl.contains(e.target) || stageEl.querySelector("[data-xp-keys]"))) return;

      // Atajos globales cuando no se está escribiendo en un campo
      if (e.key === "Escape" && state.activeItem) {
        e.preventDefault();
        if (state.codeDrawerOpen) {
          state.codeDrawerOpen = false;
          updateCodeDrawer();
        } else {
          closeSandbox();
        }
        return;
      }

      if (state.activeItem) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateSandboxRel(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateSandboxRel(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          navigateSandboxGroup(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          navigateSandboxGroup(1);
        } else if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          state.codeDrawerOpen = !state.codeDrawerOpen;
          updateCodeDrawer();
          AUDIO.play("click");
        }
      }

      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        openRandomDesign();
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleBlueprint();
      }
    });
  }

  function setFilterMode(mode) {
    state.filterMode = mode;
    document.querySelectorAll("[data-filter-btn]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-filter-btn") === mode);
    });
    AUDIO.play("click");
    renderGallery();
    setupScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
