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
    favorites: loadFavorites([]),
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
    renderWall();
    renderFolderRail();
    renderGallery();
    bindWall();
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
  // 2. La pared: una tesela por experimento (212), en el orden del catálogo
  // --------------------------------------------------------------------------
  const CATS = new Map(DATA.categories.map((c) => [c.id, c]));
  const pad3 = (n) => String(n).padStart(3, "0");

  // Un experimento cumple el filtro activo (lo usan la pared y la galería)
  function matchesFilter(cat, item) {
    if (state.filterMode === "new") return Boolean(cat.isNew);
    if (state.filterMode === "ready") return !item.wip;
    if (state.filterMode === "wip") return item.wip;
    if (state.filterMode === "favs") return state.favorites.has(`/c/${cat.id}/${item.slug}`);
    return true;
  }

  function renderWall() {
    const wall = document.getElementById("wall");
    if (!wall) return;
    wall.innerHTML = FLAT.map((it, i) => {
      const cat = CATS.get(it.categoryId);
      // Variación de luminosidad fija por pieza (0–8 %): la pared se lee como piedra, no como un píxel repetido
      const jitter = Math.imul(i + 1, 2654435761) >>> 0;
      const n = pad3(i + 1);
      return `<a class="tile" href="#${it.path}" data-open-path="${it.path}" data-n="${n}" data-i="${i}" data-cat="${it.categoryId}" tabindex="${i === 0 ? 0 : -1}" style="--tile:${cat.accent};--j:${jitter % 9};--i:${i}" aria-label="N.º ${n}: ${it.title}, carpeta ${it.categoryTitle}"></a>`;
    }).join("");
    updateWall();
  }

  // Atenúa lo que el filtro excluye y dora los favoritos; también actualiza los contadores de los filtros
  function updateWall() {
    document.querySelectorAll("#wall .tile").forEach((tile) => {
      const it = FLAT[Number(tile.dataset.i)];
      const cat = CATS.get(it.categoryId);
      tile.dataset.match = String(matchesFilter(cat, it));
      tile.classList.toggle("is-fav", state.favorites.has(it.path));
    });
    const set = (id, n) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(n);
    };
    set("count-all", FLAT.length);
    set("count-new", FLAT.filter((it) => CATS.get(it.categoryId).isNew).length);
    set("count-favs", FLAT.filter((it) => state.favorites.has(it.path)).length);
  }

  function markCurrentTile() {
    document.querySelectorAll("#wall .tile.is-current").forEach((t) => t.classList.remove("is-current"));
    if (!state.activeItem) return;
    const t = document.querySelector(`#wall .tile[data-open-path="${state.activeItem.path}"]`);
    if (t) t.classList.add("is-current");
  }

  // Interacción de la pared: rótulo, navegación con flechas (un solo punto de tabulación) y vínculos con el índice y la galería
  function bindWall() {
    const wall = document.getElementById("wall");
    const tip = document.getElementById("wall-tip");
    if (!wall || !tip) return;
    const tiles = () => Array.from(wall.children);

    const hot = (catId, on) => {
      const item = document.querySelector(`.minimap-item[data-minimap-cat="${catId}"]`);
      if (item) item.classList.toggle("is-hot", on);
    };

    const showTip = (tile) => {
      const it = FLAT[Number(tile.dataset.i)];
      tip.innerHTML = `<b><code>${tile.dataset.n}</code>${it.title}</b><span>${it.categoryTitle} · ${it.file}</span>`;
      tip.setAttribute("data-open", "");
      const r = tile.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      const above = r.top - h - 10 >= 8;
      tip.style.left = `${Math.round(x)}px`;
      tip.style.top = `${Math.round(above ? r.top - h - 10 : r.bottom + 10)}px`;
      hot(it.categoryId, true);
    };
    const hideTip = (tile) => {
      tip.removeAttribute("data-open");
      if (tile) hot(tile.dataset.cat, false);
    };

    wall.addEventListener("pointerover", (e) => {
      const t = e.target.closest(".tile");
      if (t) showTip(t);
    });
    wall.addEventListener("pointerout", (e) => {
      const t = e.target.closest(".tile");
      if (t && !t.contains(e.relatedTarget)) hideTip(t);
    });
    wall.addEventListener("focusin", (e) => {
      const t = e.target.closest(".tile");
      if (t) showTip(t);
    });
    wall.addEventListener("focusout", (e) => hideTip(e.target.closest(".tile")));

    wall.addEventListener("keydown", (e) => {
      const t = e.target.closest(".tile");
      if (!t) return;
      const list = tiles();
      const i = Number(t.dataset.i);
      const rows = parseInt(getComputedStyle(document.getElementById("wall-frame")).getPropertyValue("--rows"), 10) || 8;
      const rtl = getComputedStyle(wall).direction === "rtl";
      let next = null;
      if (e.key === "ArrowDown") next = i % rows < rows - 1 ? i + 1 : null;
      else if (e.key === "ArrowUp") next = i % rows > 0 ? i - 1 : null;
      else if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = i + rows < list.length ? i + rows : null;
      else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = i - rows >= 0 ? i - rows : null;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      else if (e.key === " ") {
        e.preventDefault();
        t.click();
        return;
      }
      if (next === null) return;
      e.preventDefault();
      t.tabIndex = -1;
      list[next].tabIndex = 0;
      list[next].focus();
    });

    // La galería de abajo señala su pieza en la pared
    const gallery = document.getElementById("gallery-root");
    const tileOf = (card) => wall.querySelector(`.tile[data-open-path="/c/${card.dataset.cat}/${card.dataset.slug}"]`);
    gallery.addEventListener("pointerover", (e) => {
      const card = e.target.closest(".exp-card-item");
      const t = card && tileOf(card);
      if (t) t.classList.add("is-linked");
    });
    gallery.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".exp-card-item");
      const t = card && tileOf(card);
      if (t && !card.contains(e.relatedTarget)) t.classList.remove("is-linked");
    });
  }

  // --------------------------------------------------------------------------
  // 2b. Dirección numérica: teclear el número (1–212) de una pieza la abre
  // --------------------------------------------------------------------------
  const address = { buf: "", timer: 0 };

  function paintAddress() {
    const hud = document.getElementById("address-hud");
    if (!hud) return;
    if (!address.buf) {
      hud.removeAttribute("data-open");
      return;
    }
    const n = parseInt(address.buf, 10);
    const it = FLAT[n - 1];
    // El nombre solo se muestra cuando el número ya no puede crecer (tres cifras o ninguna ampliación posible)
    const final = address.buf.length === 3 || n * 10 > FLAT.length;
    document.getElementById("address-num").innerHTML = `${address.buf}${"<i>·</i>".repeat(3 - address.buf.length)}`;
    document.getElementById("address-name").innerHTML = it
      ? final ? `<b>${it.title}</b> · ${it.categoryTitle}` : "Sigue tecleando o pulsa Intro"
      : n === 0 && address.buf.length < 3 ? `Teclea un número del 1 al ${FLAT.length}` : `No existe esa pieza: hay ${FLAT.length}`;
    hud.setAttribute("data-open", "");
  }

  function clearAddress() {
    clearTimeout(address.timer);
    address.buf = "";
    paintAddress();
  }

  function commitAddress() {
    const it = FLAT[parseInt(address.buf, 10) - 1];
    clearAddress();
    if (it) openSandbox(it.path);
  }

  // Devuelve true si la tecla se consumió
  function handleAddressKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      if (address.buf.length >= 3) address.buf = "";
      address.buf += e.key;
      clearTimeout(address.timer);
      paintAddress();
      const n = parseInt(address.buf, 10);
      // Una pieza completa se abre enseguida; un número inexistente se queda visible el tiempo de leerlo
      const exists = n >= 1 && n <= FLAT.length;
      if (!exists) address.timer = setTimeout(clearAddress, 1400);
      else if (address.buf.length === 3) address.timer = setTimeout(commitAddress, 160);
      else if (n * 10 > FLAT.length) address.timer = setTimeout(commitAddress, 900);
      else address.timer = setTimeout(commitAddress, 1100);
      return true;
    }
    if (!address.buf) return false;
    if (e.key === "Backspace") {
      e.preventDefault();
      address.buf = address.buf.slice(0, -1);
      clearTimeout(address.timer);
      paintAddress();
      if (address.buf) address.timer = setTimeout(commitAddress, 1100);
      return true;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitAddress();
      return true;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      clearAddress();
      return true;
    }
    return false;
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
          <a href="#cat-${cat.id}" class="minimap-item ${i === 0 ? "is-active" : ""}" data-minimap-cat="${cat.id}" title="${cat.title} (${cat.items.length} experimentos)" aria-label="${cat.title}, ${cat.items.length} experimentos">
            <span class="minimap-tile" style="--tile:${cat.accent}"></span>
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
        const filteredItems = cat.items.filter((item) => matchesFilter(cat, item));

        if (filteredItems.length === 0) return "";
        totalRendered += filteredItems.length;
        const numberOf = (item) => FLAT.findIndex((x) => x.path === `/c/${cat.id}/${item.slug}`) + 1;
        const firstN = numberOf(filteredItems[0]);
        const lastN = numberOf(filteredItems[filteredItems.length - 1]);

        
        const cardsHtml = filteredItems
          .map((item, idx) => {
            const path = `/c/${cat.id}/${item.slug}`;
            const isFav = state.favorites.has(path);
            const svgPreview = PREVIEWS.generatePreviewSVG(cat.id, item, idx);

            const n = pad3(item.globalIndex !== undefined ? item.globalIndex + 1 : FLAT.findIndex((x) => x.path === path) + 1);

            return `
              <li class="exp-card-item" data-cat="${cat.id}" data-slug="${item.slug}">
                <a href="#${path}" class="exp-card-link" data-open-path="${path}">
                  <div class="exp-card-frame">
                    ${svgPreview}
                    <div class="exp-blueprint-coords" aria-hidden="true">320×200 · ${cat.id}/${item.slug}</div>
                  </div>
                  <div class="exp-card-meta">
                    <div class="exp-card-title-row">
                      <span class="exp-card-title">${item.title}</span>
                      ${item.wip ? `<span class="exp-wip-badge">En desarrollo</span>` : ""}
                    </div>
                    <div class="exp-card-file-row">
                      <span class="exp-card-filename">${item.file}</span>
                      <span class="exp-card-addr" title="Número de la pieza: teclea ${Number(n)} para abrirla">N.º ${n}</span>
                    </div>
                    ${state.viewMode === "stack" ? `<div class="exp-stack-tags">${item.tags.map((t) => `<span>#${t}</span>`).join("")}</div>` : ""}
                  </div>
                </a>
                <div class="exp-card-actions">
                  <button type="button" class="exp-code-btn" data-quick-code="${path}" title="Ver código HTML y JS de ${item.title}" aria-label="Ver el código de ${item.title}">&lt;/&gt;</button>
                  <button type="button" class="exp-fav-btn ${isFav ? "is-fav" : ""}" data-toggle-fav="${path}" title="${isFav ? "Quitar de favoritos" : "Marcar como favorito"}" aria-label="${isFav ? "Quitar de favoritos" : "Marcar como favorito"}: ${item.title}" aria-pressed="${isFav}">
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>
                  </button>
                </div>
              </li>
            `;
          })
          .join("");

        return `
          <section class="cat-section" id="cat-${cat.id}" data-category-section="${cat.id}">
            <div class="cat-divider" aria-hidden="true"></div>
            <header class="cat-header">
              <div class="cat-title-group">
                <h2 class="cat-title"><span class="cat-tile" style="--cat-accent:${cat.accent}" aria-hidden="true"></span>${cat.title}${cat.isNew ? `<span class="cat-new-pill">Nueva</span>` : ""}</h2>
                <p class="cat-subtitle">${cat.description}</p>
                <p class="cat-range">N.º ${pad3(firstN)}${filteredItems.length > 1 ? ` – ${pad3(lastN)}` : ""} · ${filteredItems.length} ${filteredItems.length === 1 ? "experimento" : "experimentos"}</p>
              </div>
              <button type="button" class="cat-open-first-btn" data-open-path="/c/${cat.id}/${filteredItems[0].slug}">
                <span>Abrir carpeta</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
        <p>${state.filterMode === "favs" ? "Aún no marcaste favoritos: usa la estrella de cualquier tarjeta y la tesela se dorará en la pared." : "Ningún experimento coincide con el filtro."}</p>
        <button type="button" class="sb-btn-primary" id="reset-filter-btn">Ver los ${FLAT.length} experimentos</button>
      </div>`;

    const counterEl = document.getElementById("header-count-text");
    if (counterEl) {
      const folders = document.querySelectorAll("[data-category-section]").length;
      counterEl.textContent = `${totalRendered} ${totalRendered === 1 ? "experimento" : "experimentos"} · ${folders} ${folders === 1 ? "carpeta" : "carpetas"}`;
    }

    updateWall();
  }

  // --------------------------------------------------------------------------
  // 6. Vista Sandbox a pantalla completa (/c/:category/:slug) y HUD de teclado
  // --------------------------------------------------------------------------
  function openSandbox(path, pushHash = true) {
    const item = FLAT.find((it) => it.path === path);
    if (!item) return;

    if (!state.activeItem) state.returnFocus = document.activeElement;
    state.activeItem = item;
    markCurrentTile();
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
        <span class="sb-bc-index">(${item.globalIndex + 1} de ${FLAT.length})</span>
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
    const closing = state.activeItem;
    state.activeItem = null;
    markCurrentTile();
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

    // El foco vuelve a donde estaba (o a la tesela del experimento) para no perder el sitio con el teclado
    const back = state.returnFocus && state.returnFocus.isConnected && state.returnFocus !== document.body ? state.returnFocus : document.querySelector(`#wall .tile[data-open-path="${closing.path}"]`);
    state.returnFocus = null;
    if (back) {
      if (back.classList.contains("tile")) {
        document.querySelectorAll("#wall .tile").forEach((t) => (t.tabIndex = -1));
        back.tabIndex = 0;
      }
      back.focus({ preventScroll: true });
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
  let spy = null;
  function setupScrollSpy() {
    if (spy) spy.disconnect();
    const observer = (spy = new IntersectionObserver(
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
    ));

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
          favBtn.setAttribute("aria-pressed", "false");
          showToast(`${label} quitado de favoritos`);
          saveFavorites();
        } else {
          state.favorites.add(favPath);
          favBtn.classList.add("is-fav");
          favBtn.setAttribute("aria-pressed", "true");
          showToast(`${label} guardado en favoritos`);
          saveFavorites();
        }
        updateWall();
        if (state.filterMode === "favs") {
          renderGallery();
          setupScrollSpy();
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
    document.getElementById("hero-explore")?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("gallery-root")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
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

      // Dirección numérica en la portada: teclear el número de una pieza la abre
      if (!state.activeItem && handleAddressKey(e)) return;

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
