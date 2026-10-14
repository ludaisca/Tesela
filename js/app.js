// ============================================================================
// devl.dev — Main Application Controller, Router, Command Palette & Live UI
// 100% Pure Custom Vanilla JS — Zero External Libraries
// ============================================================================

(function () {
  const DATA = window.DEVL_DATA;
  const FLAT = window.DEVL_FLAT_ITEMS;
  const PREVIEWS = window.DEVL_PREVIEWS;
  const SANDBOX = window.DEVL_SANDBOX;
  const AUDIO = window.DEVL_AUDIO;

  const state = {
    viewMode: "grid", // "grid" | "stack" | "compact"
    filterMode: "all", // "all" | "ready" | "wip" | "favs"
    theme: "dark", // "dark" | "light"
    blueprint: false,
    // Keyed by full path: slugs repeat across folders (e.g. "profile", "two-factor")
    favorites: new Set([
      "/c/layouts/workspace-rail",
      "/c/charts/revenue-area",
      "/c/modals/command-palette",
      "/c/pricing/three-tier"
    ]),
    cmdkOpen: false,
    cmdkQuery: "",
    cmdkIndex: 0,
    cmdkResults: [...FLAT],
    activeItem: null, // flatItem when in Sandbox view (/c/:cat/:slug)
    codeDrawerOpen: false,
    codeMode: "tsx", // "tsx" | "vanilla"
    viewportSize: "100%" // "100%" | "1024px" | "768px" | "420px"
  };

  // --------------------------------------------------------------------------
  // 1. Initialization
  // --------------------------------------------------------------------------
  function init() {
    syncCatalogCounts();
    new window.DEVL_SHADER("ambient-canvas");
    renderHeroCards();
    renderFolderRail();
    renderGallery();
    bindGlobalEvents();
    setupScrollSpy();
    handleHashRoute();
  }

  // Keep static copy in index.html in sync with the catalog in data.js
  function syncCatalogCounts() {
    const files = FLAT.length;
    const cmdkInput = document.getElementById("cmdk-input");
    if (cmdkInput) cmdkInput.placeholder = `Search ${files} design experiments, folders, filenames, or tags…`;
    const cmdkCount = document.getElementById("cmdk-result-count");
    if (cmdkCount) cmdkCount.textContent = `${files} results`;
  }

  // --------------------------------------------------------------------------
  // 2. Render Hero Interactive Cards (coss-ui, Orbit, Cal.com + Live Widgets)
  // --------------------------------------------------------------------------
  function renderHeroCards() {
    const container = document.getElementById("hero-cards-grid");
    if (!container) return;

    container.innerHTML = DATA.heroCards
      .map((card) => {
        let microWidget = "";
        if (card.id === "coss-ui") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Interactive component preview">
              <button type="button" class="hero-pill-toggle is-on" data-hero-toggle title="Toggle switch">
                <span class="hero-pill-dot"></span><span>Base UI</span>
              </button>
              <button type="button" class="hero-pill-toggle" data-hero-toggle title="Toggle switch">
                <span class="hero-pill-dot"></span><span>OKLCH</span>
              </button>
              <span class="hero-micro-badge">v4.2</span>
            </div>`;
        } else if (card.id === "orbit") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Orbit telemetry">
              <span class="hero-status-chip"><i class="dot-emerald"></i> Auth</span>
              <span class="hero-status-chip"><i class="dot-amber"></i> Billing</span>
              <span class="hero-status-chip"><i class="dot-sky"></i> SMTP</span>
            </div>`;
        } else if (card.id === "cal") {
          microWidget = `
            <div class="hero-micro-ui" aria-label="Quick time slot selector">
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
              <a href="#cat-${card.targetCat || (card.id === "coss-ui" ? "layouts" : card.id === "orbit" ? "ai-agents" : "devtools")}" class="hero-promo-cta">
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
  // 3. Render Floating Folder Minimap Rail (Folder Quick Jump)
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
  // 4. Render All Categories & Experiment Cards
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
                      <span class="exp-hover-pill" data-quick-code="${path}" title="Inspect TSX & HTML source">&lt;/&gt; Code</span>
                      <span class="exp-hover-pill">Inspect live ↗</span>
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
                      <button type="button" class="exp-fav-btn ${isFav ? "is-fav" : ""}" data-toggle-fav="${path}" title="Bookmark design">
                        ★
                      </button>
                    </div>
                    ${
                      state.viewMode === "stack"
                        ? `<p class="exp-stack-desc">${cat.description} Interactive zero-dependency implementation with keyboard HUD & live source inspector.</p>
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
                <span>Open folder</span>
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
        <p>No designs match the current filter.</p>
        <button type="button" class="sb-btn-primary" id="reset-filter-btn">Reset to All ${FLAT.length} Files</button>
      </div>`;

    const counterEl = document.getElementById("header-count-text");
    if (counterEl) {
      counterEl.textContent = `${totalRendered} FILES · ${DATA.categories.length} FOLDERS`;
    }

    bindCardSpotlightEffects();
  }

  // --------------------------------------------------------------------------
  // 5. Mouse-Tracking Radial Spotlight & Subtle 3D Tilt on Cards
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
  // 6. Full-Screen Sandbox View (/c/:category/:slug) & Keyboard HUD
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
    stage.innerHTML = SANDBOX.renderLiveSandboxContent(item);

    updateCodeDrawer();
    bindSandboxLiveInteractions(stage, item);
  }

  function closeSandbox(pushHash = true) {
    if (!state.activeItem) return;
    state.activeItem = null;
    state.codeDrawerOpen = false;
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
      const raw = SANDBOX.generateSourceCode(state.activeItem, state.codeMode);
      codePre.innerHTML = SANDBOX.highlightCode(raw);
    }
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
    showToast(`Randomly jumped to ${FLAT[randIdx].title} (${FLAT[randIdx].categoryTitle})`);
  }

  // --------------------------------------------------------------------------
  // 7. Wire Interactive Controls Inside Sandbox Stage
  // --------------------------------------------------------------------------
  function bindSandboxLiveInteractions(stage, item) {
    // 1. Toast triggers
    stage.querySelectorAll("[data-sb-toast]").forEach((btn) => {
      btn.addEventListener("click", () => {
        AUDIO.play("click");
        showToast(btn.getAttribute("data-sb-toast"));
      });
    });

    // 2. Open CmdK or Code from inside sandbox
    stage.querySelectorAll('[data-action="open-cmdk"]').forEach((el) => {
      el.addEventListener("click", () => openCmdK());
    });
    stage.querySelectorAll('[data-action="toggle-code"]').forEach((el) => {
      el.addEventListener("click", () => {
        state.codeDrawerOpen = !state.codeDrawerOpen;
        updateCodeDrawer();
      });
    });

    // 3. Layout sidebar navigation & resizable splitter
    stage.querySelectorAll(".sb-nav-item").forEach((navBtn) => {
      navBtn.addEventListener("click", () => {
        AUDIO.play("click");
        stage.querySelectorAll(".sb-nav-item").forEach((b) => b.classList.remove("is-active"));
        navBtn.classList.add("is-active");
        const paneName = navBtn.getAttribute("data-pane") || "View";
        const titleEl = stage.querySelector("#sb-dynamic-pane-title");
        const routeEl = stage.querySelector("#sb-route-indicator");
        if (titleEl) titleEl.textContent = `${item.title} — ${paneName}`;
        if (routeEl) routeEl.textContent = `/app/${item.slug}/${paneName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      });
    });

    const splitter = stage.querySelector("#sb-splitter");
    const sidebar = stage.querySelector("#sb-resizable-sidebar");
    const widthReadout = stage.querySelector("#sb-width-readout");
    if (splitter && sidebar) {
      let dragging = false;
      splitter.addEventListener("pointerdown", (e) => {
        dragging = true;
        splitter.setPointerCapture(e.pointerId);
      });
      splitter.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const rect = sidebar.parentElement.getBoundingClientRect();
        const newW = Math.max(170, Math.min(420, Math.round(e.clientX - rect.left)));
        sidebar.style.width = `${newW}px`;
        if (widthReadout) widthReadout.textContent = `${newW}px`;
      });
      splitter.addEventListener("pointerup", () => {
        dragging = false;
      });
    }

    // 4. Interactive Chart crosshair & timeframe multiplier
    const svgChart = stage.querySelector("#sb-interactive-svg");
    const crosshair = stage.querySelector("#sb-crosshair");
    const cursorDot = stage.querySelector("#sb-cursor-dot");
    const tooltip = stage.querySelector("#sb-chart-tooltip");
    if (svgChart && crosshair && cursorDot) {
      svgChart.addEventListener("pointermove", (e) => {
        const rect = svgChart.getBoundingClientRect();
        const relX = Math.max(20, Math.min(740, ((e.clientX - rect.left) / rect.width) * 760));
        const progress = (relX - 20) / 720;
        const y = 185 - progress * 145 + Math.sin(progress * Math.PI * 4) * 18;
        crosshair.setAttribute("x1", relX.toFixed(1));
        crosshair.setAttribute("x2", relX.toFixed(1));
        cursorDot.setAttribute("cx", relX.toFixed(1));
        cursorDot.setAttribute("cy", y.toFixed(1));
        if (tooltip) {
          const val = Math.round(84000 + progress * 92000 + Math.sin(progress * 8) * 6500);
          tooltip.textContent = `Day ${Math.max(1, Math.round(progress * 30))} · MRR $${val.toLocaleString()} · Conversion ${(54 + progress * 14).toFixed(1)}%`;
        }
      });
    }

    stage.querySelectorAll("#sb-chart-range .sb-seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        AUDIO.play("click");
        stage.querySelectorAll("#sb-chart-range .sb-seg-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const mult = parseFloat(btn.getAttribute("data-mult") || "1");
        const k1 = stage.querySelector("#sb-kpi-1");
        const k2 = stage.querySelector("#sb-kpi-2");
        if (k1) k1.textContent = `$${Math.round(148920 * mult).toLocaleString()}`;
        if (k2) k2.textContent = Math.round(4812 * mult).toLocaleString();
      });
    });

    // 5. Interactive Table filtering & status chips
    const searchInput = stage.querySelector("#sb-table-search");
    const tableRows = stage.querySelectorAll("#sb-live-table tbody tr");
    if (searchInput && tableRows.length) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        tableRows.forEach((tr) => {
          tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
        });
      });
    }
    stage.querySelectorAll("[data-filter-status]").forEach((chip) => {
      chip.addEventListener("click", () => {
        AUDIO.play("click");
        stage.querySelectorAll("[data-filter-status]").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const st = chip.getAttribute("data-filter-status");
        tableRows.forEach((tr) => {
          tr.style.display = st === "all" || tr.getAttribute("data-status") === st ? "" : "none";
        });
      });
    });

    // 6. Pricing slider & billing toggle
    const seatSlider = stage.querySelector("#sb-seat-slider");
    const seatCount = stage.querySelector("#sb-seat-count");
    const seatTotal = stage.querySelector("#sb-seat-total");
    let discount = 0.8;
    const updatePricing = () => {
      if (!seatSlider) return;
      const seats = parseInt(seatSlider.value, 10);
      const unit = Math.round(24 * discount);
      if (seatCount) seatCount.textContent = String(seats);
      if (seatTotal) seatTotal.textContent = `$${(seats * unit).toLocaleString()}`;
      const proPrice = stage.querySelector("#sb-pro-price");
      if (proPrice) proPrice.innerHTML = `$${unit}<span>/seat</span>`;
    };
    if (seatSlider) {
      seatSlider.addEventListener("input", updatePricing);
    }
    stage.querySelectorAll("#sb-billing-toggle .sb-seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        AUDIO.play("click");
        stage.querySelectorAll("#sb-billing-toggle .sb-seg-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        discount = parseFloat(btn.getAttribute("data-discount") || "1");
        updatePricing();
      });
    });

    // 7. Auth OTP boxes & API Key generator
    const otpBoxes = Array.from(stage.querySelectorAll(".sb-otp-box"));
    otpBoxes.forEach((box, idx) => {
      box.addEventListener("input", () => {
        if (box.value && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });
    });
    const regenBtn = stage.querySelector("#sb-regen-key");
    const secretEl = stage.querySelector("#sb-api-secret");
    if (regenBtn && secretEl) {
      regenBtn.addEventListener("click", () => {
        AUDIO.play("click");
        const hex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        secretEl.textContent = `devl_live_${hex}`;
        showToast("Generated new cryptographic API key");
      });
    }
    const copyKeyBtn = stage.querySelector("#sb-copy-key");
    if (copyKeyBtn && secretEl) {
      copyKeyBtn.addEventListener("click", () => {
        navigator.clipboard?.writeText(secretEl.textContent || "").catch(() => {});
        showToast("Copied API key to clipboard");
      });
    }

    // 8. Interactive Calendar cells
    stage.querySelectorAll("[data-cal-day]").forEach((cell) => {
      cell.addEventListener("click", () => {
        AUDIO.play("click");
        const existing = cell.querySelector(".sb-cal-pill");
        if (existing) {
          existing.remove();
          cell.classList.remove("has-event");
        } else {
          cell.classList.add("has-event");
          const pill = document.createElement("span");
          pill.className = "sb-cal-pill";
          pill.textContent = "Booked Slot";
          cell.appendChild(pill);
          showToast(`Scheduled slot on Oct ${cell.getAttribute("data-cal-day")}`);
        }
      });
    });

    // 9. Timeline / Thread comment composer
    const commentInput = stage.querySelector("#sb-comment-input");
    const commentSubmit = stage.querySelector("#sb-comment-submit");
    const stream = stage.querySelector("#sb-thread-stream");
    if (commentInput && commentSubmit && stream) {
      const postEntry = () => {
        const txt = commentInput.value.trim();
        if (!txt) return;
        AUDIO.play("click");
        const div = document.createElement("div");
        div.className = "sb-tl-item";
        div.innerHTML = `
          <div class="sb-tl-node" style="background:${item.categoryAccent}"></div>
          <div class="sb-tl-card">
            <div class="sb-tl-meta"><strong>You (Operator)</strong> <span>posted an update</span> <em class="sb-mono">just now</em></div>
            <p></p>
          </div>
        `;
        div.querySelector("p").textContent = txt;
        stream.prepend(div);
        commentInput.value = "";
        showToast("Added entry to live timeline");
      };
      commentSubmit.addEventListener("click", postEntry);
      commentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") postEntry();
      });
    }

    // 10. Toggle switches
    stage.querySelectorAll("[data-sb-switch]").forEach((sw) => {
      sw.addEventListener("click", () => {
        AUDIO.play("click");
        sw.classList.toggle("is-on");
      });
    });

    // 11. Tour Stepper & Destructive Confirm Guard
    const tourSteps = [
      { title: "Step 1 of 4 — Workspace Setup", desc: "Configure your primary design token surface and keyboard bindings." },
      { title: "Step 2 of 4 — Shader Pipeline", desc: "Calibrate the WebGL fragment noise field and mouse spotlight radius." },
      { title: "Step 3 of 4 — Vector Micro-UIs", desc: `Inspect all ${FLAT.length} live SVG component wireframes across ${DATA.categories.length} folders.` },
      { title: "Step 4 of 4 — Ready to Ship", desc: "Zero external dependencies. Copy TSX or Vanilla code with one keypress." }
    ];
    let curStep = 0;
    const stepLabel = stage.querySelector("#sb-tour-step-label");
    const stepDesc = stage.querySelector("#sb-tour-step-desc");
    stage.querySelector("#sb-tour-next")?.addEventListener("click", () => {
      curStep = (curStep + 1) % tourSteps.length;
      if (stepLabel) stepLabel.textContent = tourSteps[curStep].title;
      if (stepDesc) stepDesc.textContent = tourSteps[curStep].desc;
      AUDIO.play("click");
    });
    stage.querySelector("#sb-tour-prev")?.addEventListener("click", () => {
      curStep = (curStep - 1 + tourSteps.length) % tourSteps.length;
      if (stepLabel) stepLabel.textContent = tourSteps[curStep].title;
      if (stepDesc) stepDesc.textContent = tourSteps[curStep].desc;
      AUDIO.play("click");
    });

    const confirmInput = stage.querySelector("#sb-confirm-input");
    const confirmBtn = stage.querySelector("#sb-confirm-btn");
    if (confirmInput && confirmBtn) {
      confirmInput.addEventListener("input", () => {
        const match = confirmInput.value.trim() === "delete-workspace";
        confirmBtn.disabled = !match;
        confirmBtn.style.opacity = match ? "1" : "0.4";
      });
      confirmBtn.addEventListener("click", () => {
        if (confirmBtn.disabled) return;
        AUDIO.play("chime");
        confirmInput.value = "";
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.4";
        showToast("Destructive action confirmed and executed");
      });
    }

    // 12. AI & Agents Live Token Streamer
    const streamBtn = stage.querySelector("#sb-stream-btn");
    const streamOut = stage.querySelector("#sb-stream-output");
    if (streamBtn && streamOut) {
      streamBtn.addEventListener("click", () => {
        AUDIO.play("click");
        const tokens = [
          "[reasoning]", "Analyzing", "AST", "surface", "hierarchy", "for", `${item.file}...`,
          "\n→", "Verified", "0", "external", "imports.",
          "\n→", "Compiled", "OKLCH", "border", "tokens", "and", "hardware-accelerated", "SVG", "layers", "in", "14.2ms.",
          "\n✓", "Ready", "to", "ship", "production", "component."
        ];
        streamOut.textContent = "";
        let idx = 0;
        const timer = setInterval(() => {
          if (idx >= tokens.length) {
            clearInterval(timer);
            AUDIO.play("chime");
            return;
          }
          streamOut.textContent += (idx === 0 ? "" : " ") + tokens[idx++];
          AUDIO.play("tick");
        }, 48);
      });
    }
    stage.querySelectorAll("#sb-ai-model-select .sb-seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        AUDIO.play("click");
        stage.querySelectorAll("#sb-ai-model-select .sb-seg-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        showToast(`Switched active agent model to ${btn.getAttribute("data-model")}`);
      });
    });

    // 13. Shaders & Canvas Live 60fps Interactive Vector / ASCII Field
    const shaderCanvas = stage.querySelector("#sb-live-shader-canvas");
    if (shaderCanvas) {
      const ctx = shaderCanvas.getContext("2d");
      let mx = 430;
      let my = 140;
      let radius = 140;
      let smode = "dipole";
      let animId = 0;
      let t = 0;

      shaderCanvas.addEventListener("pointermove", (e) => {
        const r = shaderCanvas.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * shaderCanvas.width;
        my = ((e.clientY - r.top) / r.height) * shaderCanvas.height;
      });

      const radSlider = stage.querySelector("#sb-shader-radius");
      const freqVal = stage.querySelector("#sb-freq-val");
      const hud = stage.querySelector("#sb-shader-hud");
      radSlider?.addEventListener("input", () => {
        radius = parseInt(radSlider.value, 10);
        if (freqVal) freqVal.textContent = `${radius}px`;
        if (hud) hud.textContent = `60 FPS · ${smode.toUpperCase()} · Radius: ${radius}px`;
      });

      stage.querySelectorAll("#sb-shader-mode .sb-seg-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          AUDIO.play("click");
          stage.querySelectorAll("#sb-shader-mode .sb-seg-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          smode = btn.getAttribute("data-smode") || "dipole";
          if (hud) hud.textContent = `60 FPS · ${smode.toUpperCase()} · Radius: ${radius}px`;
        });
      });

      const renderShaderLab = () => {
        if (!document.body.contains(shaderCanvas)) {
          cancelAnimationFrame(animId);
          return;
        }
        t += 0.035;
        ctx.clearRect(0, 0, shaderCanvas.width, shaderCanvas.height);

        const cols = 28;
        const rows = 9;
        const cw = shaderCanvas.width / cols;
        const ch = shaderCanvas.height / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (c + 0.5) * cw;
            const y = (r + 0.5) * ch;
            const dx = mx - x;
            const dy = my - y;
            const dist = Math.hypot(dx, dy);
            const influence = Math.max(0, 1 - dist / radius);

            if (smode === "dipole") {
              const angle = Math.atan2(dy, dx) + Math.sin(t + c * 0.2) * 0.25;
              const len = 8 + influence * 10;
              ctx.strokeStyle = influence > 0.15 ? item.categoryAccent : "rgba(150,150,160,0.35)";
              ctx.lineWidth = influence > 0.15 ? 2 : 1.2;
              ctx.beginPath();
              ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
              ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
              ctx.stroke();
            } else if (smode === "ascii") {
              const glyphs = [".", "·", ":", "+", "*", "#", "@"];
              const gIdx = Math.min(glyphs.length - 1, Math.floor((influence + (Math.sin(t + c * 0.3 + r * 0.3) * 0.5 + 0.5) * 0.4) * glyphs.length));
              ctx.fillStyle = influence > 0.2 ? item.categoryAccent : "rgba(150,150,160,0.45)";
              ctx.font = "12px ui-monospace, monospace";
              ctx.fillText(glyphs[gIdx], x - 4, y + 4);
            } else {
              const wy = y + Math.sin(t * 2 + c * 0.35) * (6 + influence * 18);
              ctx.fillStyle = influence > 0.15 ? item.categoryAccent : "rgba(150,150,160,0.4)";
              ctx.beginPath();
              ctx.arc(x, wy, 2.2 + influence * 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        animId = requestAnimationFrame(renderShaderLab);
      };
      renderShaderLab();
    }

    // 14. DevTools Network Waterfall Row Click
    const wfTable = stage.querySelector("#sb-waterfall-table");
    const spanText = stage.querySelector("#sb-span-detail-text");
    if (wfTable && spanText) {
      wfTable.querySelectorAll("tbody tr").forEach((tr) => {
        tr.style.cursor = "pointer";
        tr.addEventListener("click", () => {
          AUDIO.play("click");
          spanText.textContent = tr.getAttribute("data-span-info") || "";
        });
      });
    }

    // 15. Media & Audio 8-Step Polyphonic Synth Sequencer
    const seqMatrix = stage.querySelector("#sb-sequencer-matrix");
    if (seqMatrix) {
      seqMatrix.querySelectorAll(".sb-seq-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          cell.classList.toggle("is-on");
          const on = cell.classList.contains("is-on");
          cell.style.background = on ? item.categoryAccent : "var(--surface-card)";
          AUDIO.play("click");
        });
      });
      stage.querySelector("#sb-seq-clear")?.addEventListener("click", () => {
        seqMatrix.querySelectorAll(".sb-seq-cell").forEach((cell) => {
          cell.classList.remove("is-on");
          cell.style.background = "var(--surface-card)";
        });
        AUDIO.play("close");
      });
      stage.querySelector("#sb-seq-play")?.addEventListener("click", () => {
        const freqs = [523.25, 392.0, 329.63, 130.81];
        let step = 0;
        const seqTimer = setInterval(() => {
          if (step >= 8 || !document.body.contains(seqMatrix)) {
            clearInterval(seqTimer);
            return;
          }
          seqMatrix.querySelectorAll(`.sb-seq-cell[data-col="${step}"]`).forEach((cell) => {
            cell.style.transform = "scale(1.08)";
            setTimeout(() => {
              cell.style.transform = "";
            }, 110);
            if (cell.classList.contains("is-on")) {
              const row = parseInt(cell.getAttribute("data-row") || "0", 10);
              try {
                AUDIO.init();
                if (AUDIO.ctx) {
                  const now = AUDIO.ctx.currentTime;
                  const osc = AUDIO.ctx.createOscillator();
                  const g = AUDIO.ctx.createGain();
                  osc.type = row === 3 ? "triangle" : "sine";
                  osc.frequency.setValueAtTime(freqs[row] || 440, now);
                  g.gain.setValueAtTime(0.035, now);
                  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
                  osc.connect(g);
                  g.connect(AUDIO.ctx.destination);
                  osc.start(now);
                  osc.stop(now + 0.15);
                }
              } catch (_) {}
            }
          });
          step++;
        }, 145);
      });
    }

    // 16. Fintech Live FX Swap Calculator
    const fxIn = stage.querySelector("#sb-fx-input");
    const fxOut = stage.querySelector("#sb-fx-output");
    if (fxIn && fxOut) {
      fxIn.addEventListener("input", () => {
        const v = parseFloat(fxIn.value || "0");
        fxOut.textContent = `€${(v * 0.925).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR · 0.02% slippage`;
      });
    }
  }

  // --------------------------------------------------------------------------
  // 8. Command Palette (⌘K) with Custom Fuzzy Search & Instant Live Preview
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
      listEl.firstElementChild.textContent = `No matching experiments for "${state.cmdkQuery}"`;
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
  // 9. Theme, Blueprint X-Ray & Toast Notifications
  // --------------------------------------------------------------------------
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    AUDIO.play("click");
    showToast(`Switched to ${state.theme} mode`);
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
    showToast(state.blueprint ? "Blueprint X-Ray grid enabled" : "Blueprint X-Ray disabled");
  }

  function showToast(message) {
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
  // 10. Scroll-Spy for Folder Minimap Rail
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
  // 11. Global Event Listeners & Keyboard Shortcuts
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

    // Delegated clicks
    document.addEventListener("click", (e) => {
      const target = e.target;

      // Favorite star button inside card
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
          showToast(`Removed ${label} from favorites`);
        } else {
          state.favorites.add(favPath);
          favBtn.classList.add("is-fav");
          showToast(`Saved ${label} to favorites ★`);
        }
        AUDIO.play("click");
        return;
      }

      // Quick Code button inside card overlay
      const quickCodeBtn = target.closest("[data-quick-code]");
      if (quickCodeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const path = quickCodeBtn.getAttribute("data-quick-code");
        state.codeDrawerOpen = true;
        openSandbox(path);
        return;
      }

      // Token Studio Swatches & Radius buttons
      const accentSwatch = target.closest("[data-token-accent]");
      if (accentSwatch) {
        const hex = accentSwatch.getAttribute("data-token-accent");
        document.documentElement.style.setProperty("--accent-indigo", hex);
        document.querySelectorAll("[data-token-accent]").forEach((b) => b.classList.remove("is-active"));
        accentSwatch.classList.add("is-active");
        AUDIO.play("click");
        showToast(`Updated primary token --accent-indigo to ${hex}`);
        return;
      }

      const radiusBtn = target.closest("[data-token-radius]");
      if (radiusBtn) {
        const r = radiusBtn.getAttribute("data-token-radius");
        document.documentElement.style.setProperty("--card-radius", r);
        document.querySelectorAll("[data-token-radius]").forEach((b) => b.classList.remove("is-active"));
        radiusBtn.classList.add("is-active");
        AUDIO.play("click");
        showToast(`Updated surface card radius to ${r}`);
        return;
      }

      // Open experiment in Sandbox
      const openLink = target.closest("[data-open-path]");
      if (openLink) {
        e.preventDefault();
        openSandbox(openLink.getAttribute("data-open-path"));
        return;
      }

      // Hero interactive toggles & time slots
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
        showToast(`Selected meeting slot ${heroSlot.textContent} on Cal.com`);
        return;
      }

      // Reset filter button
      if (target.closest("#reset-filter-btn")) {
        setFilterMode("all");
        return;
      }

      // CmdK row click
      const cmdkRow = target.closest("[data-cmdk-path]");
      if (cmdkRow) {
        const path = cmdkRow.getAttribute("data-cmdk-path");
        closeCmdK();
        openSandbox(path);
        return;
      }

      // Sandbox HUD actions
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

      // Viewport size buttons in Sandbox header
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

      // Code mode switcher (TSX vs Vanilla)
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

    // Header buttons
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
      showToast("Copied CSS custom properties to clipboard");
    });
    document.getElementById("btn-sound")?.addEventListener("click", (e) => {
      const on = AUDIO.toggle();
      e.currentTarget.setAttribute("aria-pressed", String(on));
      showToast(on ? "Tactile UI audio synth enabled" : "Tactile UI audio muted");
    });

    // Starter kit floating promo card dismiss
    document.getElementById("promo-dismiss")?.addEventListener("click", () => {
      const card = document.getElementById("floating-promo");
      if (card) card.hidden = true;
      AUDIO.play("close");
    });
    document.getElementById("promo-not-now")?.addEventListener("click", () => {
      const card = document.getElementById("floating-promo");
      if (card) card.hidden = true;
      AUDIO.play("close");
    });

    // Copy code button inside code drawer
    document.getElementById("btn-copy-source")?.addEventListener("click", () => {
      if (!state.activeItem) return;
      const raw = SANDBOX.generateSourceCode(state.activeItem, state.codeMode);
      navigator.clipboard?.writeText(raw).catch(() => {});
      AUDIO.play("chime");
      showToast(`Copied ${state.activeItem.file} (${state.codeMode.toUpperCase()}) to clipboard`);
    });

    document.getElementById("btn-close-code")?.addEventListener("click", () => {
      state.codeDrawerOpen = false;
      updateCodeDrawer();
    });

    // CmdK input & backdrop
    const cmdkInput = document.getElementById("cmdk-input");
    cmdkInput?.addEventListener("input", () => {
      state.cmdkQuery = cmdkInput.value;
      state.cmdkIndex = 0;
      updateCmdKResults();
    });
    document.getElementById("cmdk-backdrop")?.addEventListener("click", closeCmdK);

    // Global Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;

      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (state.cmdkOpen) closeCmdK();
        else openCmdK();
        return;
      }

      // Inside CmdK modal
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

      // Global shortcuts when not typing in an input
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
