// ============================================================================
// devl.dev — Interactive Full-Screen Component Sandbox & Custom Syntax Highlighter
// 100% Pure Custom Code — Zero External Libraries
// ============================================================================

(function () {
  // --------------------------------------------------------------------------
  // 1. Custom Regex-Free / Token-Stream Syntax Highlighter (Zero Dependencies)
  // --------------------------------------------------------------------------
  function highlightCode(code) {
    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const keywords = new Set([
      "import", "from", "export", "default", "function", "const", "let", "var",
      "return", "if", "else", "for", "while", "switch", "case", "break",
      "true", "false", "null", "undefined", "async", "await", "new", "typeof",
      "interface", "type", "extends", "implements"
    ]);

    let out = "";
    let i = 0;
    const len = code.length;

    while (i < len) {
      const ch = code[i];

      // Line comment
      if (ch === "/" && code[i + 1] === "/") {
        let end = code.indexOf("\n", i);
        if (end === -1) end = len;
        out += `<span class="tok-comment">${esc(code.slice(i, end))}</span>`;
        i = end;
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'" || ch === "`") {
        const quote = ch;
        let j = i + 1;
        while (j < len && code[j] !== quote) {
          if (code[j] === "\\") j++;
          j++;
        }
        j = Math.min(j + 1, len);
        out += `<span class="tok-string">${esc(code.slice(i, j))}</span>`;
        i = j;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < len && /[0-9._pxrem%]/.test(code[j])) j++;
        out += `<span class="tok-number">${esc(code.slice(i, j))}</span>`;
        i = j;
        continue;
      }

      // JSX / HTML Tags
      if (ch === "<" && /[a-zA-Z/]/.test(code[i + 1] || "")) {
        let j = i + 1;
        if (code[j] === "/") j++;
        let tagStart = j;
        while (j < len && /[a-zA-Z0-9.-]/.test(code[j])) j++;
        const prefix = esc(code.slice(i, tagStart));
        const tagName = esc(code.slice(tagStart, j));
        out += `${prefix}<span class="tok-tag">${tagName}</span>`;
        i = j;
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_$]/.test(ch)) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_$-]/.test(code[j])) j++;
        const word = code.slice(i, j);
        if (keywords.has(word)) {
          out += `<span class="tok-kw">${esc(word)}</span>`;
        } else if (code[j] === "(") {
          out += `<span class="tok-fn">${esc(word)}</span>`;
        } else if (code[j] === "=") {
          out += `<span class="tok-attr">${esc(word)}</span>`;
        } else if (/^[A-Z]/.test(word)) {
          out += `<span class="tok-type">${esc(word)}</span>`;
        } else {
          out += esc(word);
        }
        i = j;
        continue;
      }

      out += esc(ch);
      i++;
    }

    return out;
  }

  // --------------------------------------------------------------------------
  // 2. Source Code Generator per Experiment (TSX & Vanilla HTML/CSS)
  // --------------------------------------------------------------------------
  function generateSourceCode(item, mode = "tsx") {
    const compName = item.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");

    if (mode === "vanilla") {
      return `<!-- ${item.categoryTitle} / ${item.title} (${item.slug}.html) -->
<!-- Zero-Dependency Custom Implementation -->
<section class="exp-surface" data-experiment="${item.slug}">
  <header class="exp-header">
    <div class="exp-meta">
      <span class="exp-dot" style="background: ${item.categoryAccent}"></span>
      <span class="exp-folder">${item.categoryTitle.toUpperCase()}</span>
    </div>
    <h2 class="exp-title">${item.title}</h2>
    <p class="exp-desc">${item.categoryDescription}</p>
  </header>

  <div class="exp-body" data-tags="${item.tags.join(",")}">
    <!-- Live interactive controls wired via Vanilla ES2026 -->
    <div class="exp-interactive-Slot" id="slot-${item.slug}"></div>
  </div>
</section>

<style>
  .exp-surface[data-experiment="${item.slug}"] {
    --accent: ${item.categoryAccent};
    border: 1px solid var(--border);
    border-radius: 12px;
    background: color-mix(in oklab, var(--bg) 92%, var(--fg) 8%);
    padding: 24px;
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }
</style>`;
    }

    return `// src/experiments/${item.categoryId}/${item.file}
// Category: ${item.categoryTitle} · Tags: ${item.tags.join(", ")}
import * as React from "react";

export interface ${compName}Props {
  accent?: string;
  density?: "compact" | "default" | "comfortable";
  interactive?: boolean;
}

export function ${compName}({
  accent = "${item.categoryAccent}",
  density = "default",
  interactive = true,
}: ${compName}Props) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [query, setQuery] = React.useState<string>("");

  return (
    <div
      data-slot="${item.slug}"
      data-density={density}
      className="relative min-h-svh bg-background text-foreground selection:bg-foreground/15"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[var(--accent)]" />
          <h1 className="font-heading text-lg tracking-tight">${item.title}</h1>
          <span className="font-mono text-[11px] text-muted-foreground">${item.file}</span>
        </div>
        <div className="flex items-center gap-2">
          {${JSON.stringify(item.tags)}.map((tag, idx) => (
            <button
              key={tag}
              onClick={() => setActiveIndex(idx)}
              className="rounded-md border border-border/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
            >
              {tag}
            </button>
          ))}
        </div>
      </header>
    </div>
  );
}`;
  }

  // --------------------------------------------------------------------------
  // 3. Live Interactive Full-Screen Component Renderers per Category & Slug
  // --------------------------------------------------------------------------
  function renderLiveSandboxContent(item) {
    const cat = item.categoryId;
    const slug = item.slug;

    // 1. LAYOUTS — Real interactive workspace rail, resizable split panes, etc.
    if (cat === "layouts") {
      return `
        <div class="sb-layout-shell" data-slug="${slug}">
          <aside class="sb-sidebar" id="sb-resizable-sidebar">
            <div class="sb-org-switcher">
              <div class="sb-org-avatar">A</div>
              <div class="sb-org-info">
                <div class="sb-org-name">Acme inc.</div>
                <div class="sb-org-plan">PRO · 24 MEMBERS</div>
              </div>
            </div>
            <div class="sb-quick-find" data-action="open-cmdk">
              <span>Quick find…</span>
              <kbd>⌘K</kbd>
            </div>
            <nav class="sb-nav-list">
              <button class="sb-nav-item is-active" data-pane="Overview"><span>⌂</span> Home</button>
              <button class="sb-nav-item" data-pane="Inbox"><span>✉</span> Inbox <em class="sb-badge">4</em></button>
              <button class="sb-nav-item" data-pane="Activity"><span>⚡</span> Activity</button>
              <button class="sb-nav-item" data-pane="Projects"><span>❖</span> Projects</button>
              <button class="sb-nav-item" data-pane="People"><span>☺</span> People</button>
              <button class="sb-nav-item" data-pane="Discover"><span>◎</span> Discover</button>
            </nav>
            <div class="sb-nav-group-label">PROJECTS</div>
            <nav class="sb-nav-list">
              <button class="sb-nav-item" data-pane="Onboarding redesign"><span class="sb-dot" style="background:#6366f1"></span> Onboarding redesign</button>
              <button class="sb-nav-item" data-pane="Q3 planning"><span class="sb-dot" style="background:#10b981"></span> Q3 planning</button>
              <button class="sb-nav-item" data-pane="Marketing site"><span class="sb-dot" style="background:#f59e0b"></span> Marketing site</button>
              <button class="sb-nav-item" data-pane="Dust storm"><span class="sb-dot" style="background:#ec4899"></span> Dust storm</button>
            </nav>
            <div class="sb-nav-group-label">TEAMS</div>
            <nav class="sb-nav-list">
              <button class="sb-nav-item" data-pane="Team: design"><span class="sb-hash">#</span> design <em class="sb-muted-count">6</em></button>
              <button class="sb-nav-item" data-pane="Team: engineering"><span class="sb-hash">#</span> engineering <em class="sb-muted-count">24</em></button>
              <button class="sb-nav-item" data-pane="Team: growth"><span class="sb-hash">#</span> growth <em class="sb-muted-count">4</em></button>
            </nav>
            <div class="sb-user-footer">
              <div class="sb-user-avatar">S</div>
              <div>
                <div class="sb-org-name">Sean Brydon</div>
                <div class="sb-user-online"><span class="sb-online-dot"></span> Online</div>
              </div>
            </div>
          </aside>
          <div class="sb-resize-handle" id="sb-splitter" title="Drag to resize pane"></div>
          <main class="sb-main-pane">
            <div class="sb-main-header">
              <div>
                <span class="sb-eyebrow">MAIN PANE · ${item.file.toUpperCase()}</span>
                <h2 class="sb-pane-title" id="sb-dynamic-pane-title">${item.title} — Overview</h2>
              </div>
              <div class="sb-main-actions">
                <button class="sb-btn-ghost" data-sb-toast="Layout preset saved to local workspace">Save Layout</button>
                <button class="sb-btn-primary" data-sb-toast="Created new view in ${item.title}">+ New View</button>
              </div>
            </div>
            <p class="sb-pane-desc">Interactive layout experiment (${item.slug}). Click any item in the sidebar rail or drag the vertical splitter bar between panes to test real-time responsive reflow.</p>
            <div class="sb-bento-grid">
              <div class="sb-bento-card">
                <div class="sb-eyebrow">ACTIVE ROUTE</div>
                <div class="sb-metric-val" id="sb-route-indicator">/app/${slug}</div>
                <div class="sb-metric-sub">Zero-dependency CSS Grid & pointer-capture splitter</div>
              </div>
              <div class="sb-bento-card">
                <div class="sb-eyebrow">SIDEBAR WIDTH</div>
                <div class="sb-metric-val" id="sb-width-readout">260px</div>
                <div class="sb-metric-sub">Drag the divider handle to resize</div>
              </div>
              <div class="sb-bento-card sb-bento-wide">
                <div class="sb-eyebrow">INTERACTIVE WORKSPACE CANVAS</div>
                <div class="sb-canvas-slots">
                  ${item.tags.map((t, i) => `<div class="sb-slot-pill" data-sb-toast="Toggled slot: ${t}"><span>0${i + 1}</span> ${t}</div>`).join("")}
                </div>
              </div>
            </div>
          </main>
        </div>
      `;
    }

    // 2. CHARTS & DASHBOARDS — Interactive SVG Charts with timeframe switcher & live hover readout
    if (cat === "charts" || cat === "dashboards") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Hover over data points or switch intervals to recalculate the SVG curves in real time.</p>
              </div>
              <div class="sb-segmented" id="sb-chart-range">
                <button class="sb-seg-btn" data-mult="0.65">7D</button>
                <button class="sb-seg-btn is-active" data-mult="1">30D</button>
                <button class="sb-seg-btn" data-mult="1.35">90D</button>
                <button class="sb-seg-btn" data-mult="1.75">1Y</button>
              </div>
            </div>

            <div class="sb-kpi-strip">
              <div class="sb-kpi-box">
                <span class="sb-eyebrow">NET REVENUE</span>
                <strong class="sb-kpi-num" id="sb-kpi-1">$148,920</strong>
                <span class="sb-kpi-delta is-up">+24.8% vs last period</span>
              </div>
              <div class="sb-kpi-box">
                <span class="sb-eyebrow">ACTIVE SEATS</span>
                <strong class="sb-kpi-num" id="sb-kpi-2">4,812</strong>
                <span class="sb-kpi-delta is-up">+11.2% organic</span>
              </div>
              <div class="sb-kpi-box">
                <span class="sb-eyebrow">P95 LATENCY</span>
                <strong class="sb-kpi-num" id="sb-kpi-3">38ms</strong>
                <span class="sb-kpi-delta is-up">-14ms faster</span>
              </div>
              <div class="sb-kpi-box">
                <span class="sb-eyebrow">CONVERSION</span>
                <strong class="sb-kpi-num" id="sb-kpi-4">62.4%</strong>
                <span class="sb-kpi-delta is-up">+4.1% lift</span>
              </div>
            </div>

            <div class="sb-chart-Interactive-box">
              <div class="sb-chart-readout" id="sb-chart-tooltip">Move cursor across chart to inspect cohort values</div>
              <svg viewBox="0 0 760 240" class="sb-live-chart-svg" id="sb-interactive-svg">
                <defs>
                  <linearGradient id="sbAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${item.categoryAccent}" stop-opacity="0.38"/>
                    <stop offset="100%" stop-color="${item.categoryAccent}" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                ${[40, 90, 140, 190].map((y) => `<line x1="20" y1="${y}" x2="740" y2="${y}" stroke="currentColor" stroke-opacity="0.1"/>`).join("")}
                <path id="sb-area-path" d="M20,185 C110,165 160,120 250,130 C340,140 410,75 500,85 C590,95 660,40 740,32 L740,215 L20,215 Z" fill="url(#sbAreaGrad)"/>
                <path id="sb-line-path" d="M20,185 C110,165 160,120 250,130 C340,140 410,75 500,85 C590,95 660,40 740,32" fill="none" stroke="${item.categoryAccent}" stroke-width="3" stroke-linecap="round"/>
                <line id="sb-crosshair" x1="380" y1="20" x2="380" y2="215" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.4"/>
                <circle id="sb-cursor-dot" cx="380" cy="105" r="6" fill="${item.categoryAccent}" stroke="var(--bg)" stroke-width="2"/>
              </svg>
            </div>
          </div>
        </div>
      `;
    }

    // 3. TABLES & FILTERS — Interactive Sortable & Filterable Data Grid
    if (cat === "tables" || cat === "filters") {
      const rows = [
        { id: "INV-2091", name: "Linear Orbit Enterprise", status: "Paid", role: "Production", amount: "$4,200.00", date: "Oct 14, 2026" },
        { id: "INV-2092", name: "Cal.com Team Scheduling", status: "Active", role: "US-East-1", amount: "$1,850.00", date: "Oct 12, 2026" },
        { id: "INV-2093", name: "coss-ui Design System Pro", status: "Paid", role: "Global CDN", amount: "$890.00", date: "Oct 09, 2026" },
        { id: "INV-2094", name: "Argon Security Cluster", status: "Pending", role: "EU-Central", amount: "$6,400.00", date: "Oct 05, 2026" },
        { id: "INV-2095", name: "Raycast Workspace Sync", status: "Paid", role: "Production", amount: "$1,120.00", date: "Oct 01, 2026" }
      ];
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
              </div>
              <div class="sb-table-controls">
                <input type="text" class="sb-input" id="sb-table-search" placeholder="Filter rows by name, ID or status…" />
                <button class="sb-btn-primary" data-sb-toast="Exported ${rows.length} rows to CSV">Export CSV</button>
              </div>
            </div>
            <div class="sb-chip-bar">
              <button class="sb-chip is-active" data-filter-status="all">All (${rows.length})</button>
              <button class="sb-chip" data-filter-status="Paid">Status: Paid</button>
              <button class="sb-chip" data-filter-status="Active">Status: Active</button>
              <button class="sb-chip" data-filter-status="Pending">Status: Pending</button>
            </div>
            <div class="sb-table-wrap">
              <table class="sb-table" id="sb-live-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" id="sb-check-all" /></th>
                    <th>ID</th>
                    <th>WORKSPACE / ENTITY</th>
                    <th>STATUS</th>
                    <th>ENVIRONMENT</th>
                    <th class="is-right">AMOUNT</th>
                    <th class="is-right">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (r) => `
                    <tr data-status="${r.status}">
                      <td><input type="checkbox" class="sb-row-check" /></td>
                      <td class="sb-mono">${r.id}</td>
                      <td><strong>${r.name}</strong></td>
                      <td><span class="sb-status-pill is-${r.status.toLowerCase()}">${r.status}</span></td>
                      <td class="sb-mono">${r.role}</td>
                      <td class="sb-mono is-right">${r.amount}</td>
                      <td class="sb-mono is-right sb-muted">${r.date}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // 4. PRICING — Interactive Billing Toggle & Seat Slider Calculator
    if (cat === "pricing") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow">PRICING EXPERIMENT · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
              </div>
              <div class="sb-segmented" id="sb-billing-toggle">
                <button class="sb-seg-btn" data-discount="1">Monthly</button>
                <button class="sb-seg-btn is-active" data-discount="0.8">Yearly (-20%)</button>
              </div>
            </div>
            <div class="sb-slider-box">
              <div class="sb-slider-label">
                <span>TEAM SEATS: <strong id="sb-seat-count">12</strong> seats</span>
                <span class="sb-mono">ESTIMATED TOTAL: <strong id="sb-seat-total">$230</strong>/mo</span>
              </div>
              <input type="range" min="1" max="100" value="12" class="sb-range" id="sb-seat-slider" />
            </div>
            <div class="sb-pricing-grid">
              <div class="sb-price-card">
                <div class="sb-eyebrow">STARTER</div>
                <div class="sb-price-val">$0<span>/mo</span></div>
                <p class="sb-pane-desc">For solo builders and weekend prototypes.</p>
                <button class="sb-btn-ghost sb-full" data-sb-toast="Selected Starter plan">Current Plan</button>
              </div>
              <div class="sb-price-card is-featured">
                <div class="sb-eyebrow" style="color:${item.categoryAccent}">PRO WORKSPACE</div>
                <div class="sb-price-val" id="sb-pro-price">$19<span>/seat</span></div>
                <p class="sb-pane-desc">Unlimited design experiments, custom shaders & priority support.</p>
                <button class="sb-btn-primary sb-full" data-sb-toast="Upgraded to Pro Workspace!">Upgrade to Pro →</button>
              </div>
              <div class="sb-price-card">
                <div class="sb-eyebrow">ENTERPRISE</div>
                <div class="sb-price-val">Custom</div>
                <p class="sb-pane-desc">Dedicated SAML SSO, SCIM provisioning, and custom SLAs.</p>
                <button class="sb-btn-ghost sb-full" data-sb-toast="Opened Enterprise sales inquiry">Contact Sales</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 5. AUTH & FORMS — Live Interactive OTP / API Key Generator / Form Playground
    if (cat === "auth" || cat === "forms") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Interactive authentication & form controls with live validation, OTP auto-advance, and secret token generation.</p>
              </div>
              <span class="sb-live-badge"><span class="sb-online-dot"></span> LIVE FORM</span>
            </div>

            <div class="sb-form-grid">
              <label class="sb-field">
                <span class="sb-eyebrow">WORKSPACE IDENTIFIER / EMAIL</span>
                <input type="text" class="sb-input sb-full" id="sb-auth-email" value="sean@devl.dev" />
              </label>

              <div class="sb-field">
                <span class="sb-eyebrow">6-DIGIT VERIFICATION / OTP CODE (TYPE NUMBERS)</span>
                <div class="sb-otp-row" id="sb-otp-group">
                  <input type="text" maxlength="1" class="sb-otp-box" value="4" />
                  <input type="text" maxlength="1" class="sb-otp-box" value="8" />
                  <input type="text" maxlength="1" class="sb-otp-box" value="2" />
                  <input type="text" maxlength="1" class="sb-otp-box" placeholder="·" />
                  <input type="text" maxlength="1" class="sb-otp-box" placeholder="·" />
                  <input type="text" maxlength="1" class="sb-otp-box" placeholder="·" />
                </div>
              </div>

              <div class="sb-field">
                <span class="sb-eyebrow">GENERATED SECRET API KEY (SCOPED)</span>
                <div class="sb-secret-row">
                  <code class="sb-secret-code" id="sb-api-secret">devl_live_98f2a4c71e09b3d841a2</code>
                  <button class="sb-btn-ghost" id="sb-regen-key">Regenerate</button>
                  <button class="sb-btn-primary" id="sb-copy-key">Copy Key</button>
                </div>
              </div>
            </div>

            <div class="sb-stage-footer">
              <div class="sb-tag-list">
                ${item.tags.map((t) => `<span class="sb-tag">#${t}</span>`).join("")}
              </div>
              <div class="sb-main-actions">
                <button class="sb-btn-ghost" data-action="toggle-code">View TSX (C)</button>
                <button class="sb-btn-primary" data-sb-toast="Submitted ${item.title} successfully!">Submit & Verify →</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 6. CALENDARS — Interactive Month Grid & Timezone Overlap Planner
    if (cat === "calendars") {
      const days = Array.from({ length: 35 }, (_, i) => {
        const d = ((i + 28) % 31) + 1;
        const muted = i < 3 || i > 32;
        const hasEvt = i === 9 || i === 14 || i === 18 || i === 24;
        return `<button class="sb-cal-cell ${muted ? "is-muted" : ""} ${i === 14 ? "is-today" : ""} ${hasEvt ? "has-event" : ""}" data-cal-day="${d}">
          <span class="sb-cal-num">${d}</span>
          ${hasEvt ? `<span class="sb-cal-pill">${i === 14 ? "Design Sync" : i === 9 ? "Release v4" : "Ship UI"}</span>` : ""}
        </button>`;
      }).join("");

      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">CALENDARS · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title} — October 2026</h2>
                <p class="sb-pane-desc">Click any day cell to schedule or toggle an event pill in real time.</p>
              </div>
              <div class="sb-main-actions">
                <button class="sb-btn-ghost" data-sb-toast="Jumped to Today (Oct 14)">Today</button>
                <button class="sb-btn-primary" data-sb-toast="Created new recurring event">+ New Event</button>
              </div>
            </div>
            <div class="sb-cal-weekdays">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div class="sb-cal-board" id="sb-interactive-cal">
              ${days}
            </div>
          </div>
        </div>
      `;
    }

    // 7. TIMELINES & THREADS — Live Commit/Deploy Stream & Interactive Comment Composer
    if (cat === "timelines" || cat === "threads") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
              </div>
              <span class="sb-live-badge"><span class="sb-online-dot"></span> STREAM ACTIVE</span>
            </div>

            <div class="sb-timeline-list" id="sb-thread-stream">
              <div class="sb-tl-item">
                <div class="sb-tl-node" style="background:${item.categoryAccent}"></div>
                <div class="sb-tl-card">
                  <div class="sb-tl-meta"><strong>Sean Brydon</strong> <span>deployed <code>f8a92c1</code> to production</span> <em class="sb-mono">2m ago</em></div>
                  <p>Upgraded all ${window.DEVL_FLAT_ITEMS.length} design previews to interactive SVG vector shaders with zero external dependencies.</p>
                </div>
              </div>
              <div class="sb-tl-item">
                <div class="sb-tl-node"></div>
                <div class="sb-tl-card">
                  <div class="sb-tl-meta"><strong>Argon Bot</strong> <span>passed 42/42 Lighthouse & visual checks</span> <em class="sb-mono">18m ago</em></div>
                  <p>Bundle overhead: 0 KB external libraries. Pure CSS OKLCH tokens + native WebGL fragment pipeline.</p>
                </div>
              </div>
            </div>

            <div class="sb-composer-box">
              <input type="text" class="sb-input sb-full" id="sb-comment-input" placeholder="Write a comment, changelog entry, or @mention and press Post…" />
              <button class="sb-btn-primary" id="sb-comment-submit">Post Entry ↵</button>
            </div>
          </div>
        </div>
      `;
    }

    // 8. AI & AGENTS — Live Streaming Agent Trace, Context Budget & Diff Review
    if (cat === "ai-agents") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">AI & AGENTS · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Interactive agentic trace console with real-time token streaming, tool-call inspection, and inline diff patching.</p>
              </div>
              <div class="sb-segmented" id="sb-ai-model-select">
                <button class="sb-seg-btn is-active" data-model="Argon-4">Argon-4</button>
                <button class="sb-seg-btn" data-model="Claude-4">Claude-4</button>
                <button class="sb-seg-btn" data-model="GPT-5">GPT-5</button>
              </div>
            </div>

            <div class="sb-slider-box">
              <div class="sb-slider-label">
                <span>CONTEXT WINDOW UTILIZATION: <strong id="sb-ctx-readout">94.2k / 128k</strong> tokens (73.6%)</span>
                <span class="sb-mono" style="color:var(--accent-emerald)">⚡ 142.8 tok/s · KV Cache 92%</span>
              </div>
              <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--bg);gap:2px">
                <div style="width:45%;background:${item.categoryAccent}" title="System & Tools (58k)"></div>
                <div style="width:18%;background:var(--accent-sky)" title="RAG Context (23k)"></div>
                <div style="width:11%;background:var(--accent-amber)" title="Reasoning Trace (13.2k)"></div>
              </div>
            </div>

            <div class="sb-bento-grid">
              <div class="sb-bento-card">
                <div class="sb-eyebrow">LIVE TOOL CALL INSPECTOR</div>
                <pre class="sb-mono" style="margin-top:10px;font-size:11px;line-height:1.55;color:var(--fg-muted);white-space:pre-wrap">{
  "tool": "shader_compile",
  "target": "${item.slug}",
  "status": "completed",
  "duration_ms": 18.4,
  "zero_deps": true
}</pre>
                <div class="sb-main-actions" style="margin-top:12px">
                  <button class="sb-btn-primary" id="sb-stream-btn">▶ Stream Live Reasoning</button>
                </div>
              </div>

              <div class="sb-bento-card">
                <div class="sb-eyebrow">STREAMING OUTPUT BUFFER</div>
                <p id="sb-stream-output" class="sb-mono" style="margin-top:10px;font-size:11.5px;line-height:1.65;min-height:84px">Ready. Click "Stream Live Reasoning" to synthesize token stream for ${item.file}…</p>
                <div class="sb-main-actions" style="margin-top:12px">
                  <button class="sb-btn-ghost" data-sb-toast="Accepted inline diff hunk (+24 -4)">✓ Accept Diff Patch</button>
                  <button class="sb-btn-ghost" data-sb-toast="Rolled back hunk to HEAD">✕ Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 9. SHADERS & CANVAS — Real-Time Interactive Physics & Vector Field Canvas
    if (cat === "shaders-canvas") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">SHADERS & CANVAS · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Move your pointer across the interactive canvas below to warp the vector field in real time (60fps native Canvas2D/WebGL).</p>
              </div>
              <div class="sb-segmented" id="sb-shader-mode">
                <button class="sb-seg-btn is-active" data-smode="dipole">Magnetic Grid</button>
                <button class="sb-seg-btn" data-smode="ascii">ASCII Matrix</button>
                <button class="sb-seg-btn" data-smode="waves">Harmonic Waves</button>
              </div>
            </div>

            <div class="sb-chart-Interactive-box" style="padding:0;overflow:hidden;position:relative">
              <canvas id="sb-live-shader-canvas" width="860" height="280" style="width:100%;height:280px;display:block;cursor:crosshair"></canvas>
              <div style="position:absolute;top:10px;left:12px;font-size:10px;padding:4px 8px;border-radius:4px;background:var(--bg-glass);border:1px solid var(--border)" id="sb-shader-hud">
                60 FPS · Dipole Field · Radius: 140px
              </div>
            </div>

            <div class="sb-slider-box">
              <div class="sb-slider-label">
                <span>FIELD FREQUENCY / FORCE RADIUS</span>
                <span class="sb-mono" id="sb-freq-val">140px</span>
              </div>
              <input type="range" min="40" max="280" value="140" class="sb-range" id="sb-shader-radius" />
            </div>
          </div>
        </div>
      `;
    }

    // 10. DEVTOOLS & LOGS — Interactive Network Waterfall & Regex/JSON Inspector
    if (cat === "devtools") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">DEVTOOLS & LOGS · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Click any trace span below to inspect its timing breakdown (DNS · TLS · TTFB · Content Download).</p>
              </div>
              <span class="sb-live-badge"><span class="sb-online-dot"></span> HAR CAPTURE</span>
            </div>

            <div class="sb-table-wrap">
              <table class="sb-table" id="sb-waterfall-table">
                <thead>
                  <tr>
                    <th>ENDPOINT / SYMBOL</th>
                    <th>METHOD</th>
                    <th>STATUS</th>
                    <th>WATERFALL TIMELINE (0–120ms)</th>
                    <th class="is-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-span-info="DNS: 2ms | TLS: 6ms | TTFB: 11ms | Payload: 1.8 KB (br)">
                    <td class="sb-mono"><strong>/api/v2/session</strong></td>
                    <td class="sb-mono">GET</td>
                    <td><span class="sb-status-pill is-paid">200 OK</span></td>
                    <td><div style="height:10px;width:32%;margin-left:5%;background:var(--accent-sky);border-radius:3px"></div></td>
                    <td class="sb-mono is-right">19ms</td>
                  </tr>
                  <tr data-span-info="DNS: 0ms (reused) | Compute: 28ms | AST Tokens: 4,120">
                    <td class="sb-mono"><strong>/v2/compile/${item.slug}</strong></td>
                    <td class="sb-mono">POST</td>
                    <td><span class="sb-status-pill is-paid">200 OK</span></td>
                    <td><div style="height:10px;width:48%;margin-left:18%;background:${item.categoryAccent};border-radius:3px"></div></td>
                    <td class="sb-mono is-right">42ms</td>
                  </tr>
                  <tr data-span-info="WebSocket 101 Switching Protocols | Frame interval: 16.6ms">
                    <td class="sb-mono"><strong>wss://edge.devl.dev/sync</strong></td>
                    <td class="sb-mono">WSS</td>
                    <td><span class="sb-status-pill is-active">101 LIVE</span></td>
                    <td><div style="height:10px;width:55%;margin-left:32%;background:var(--accent-emerald);border-radius:3px"></div></td>
                    <td class="sb-mono is-right">8.4ms</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="sb-slider-box" id="sb-span-detail-box">
              <span class="sb-eyebrow">SELECTED SPAN TELEMETRY</span>
              <p class="sb-mono" id="sb-span-detail-text" style="margin-top:6px;font-size:12px">Click any row in the waterfall table above to inspect low-level timing phases.</p>
            </div>
          </div>
        </div>
      `;
    }

    // 11. MEDIA & CREATIVE TOOLS — 8-Step Web Audio Synthesizer Sequencer & Cubic-Bezier Studio
    if (cat === "media-audio") {
      const notes = ["C5 Lead", "G4 Pad", "E4 Pluck", "C3 Bass"];
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">MEDIA & CREATIVE · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Toggle step cells below and click "Play Sequencer" to synthesize real polyphonic notes via Web Audio API.</p>
              </div>
              <div class="sb-main-actions">
                <button class="sb-btn-primary" id="sb-seq-play">▶ Play Sequencer (120 BPM)</button>
                <button class="sb-btn-ghost" id="sb-seq-clear">Clear Grid</button>
              </div>
            </div>

            <div class="sb-seq-grid" id="sb-sequencer-matrix" style="display:flex;flex-direction:column;gap:8px">
              ${notes
                .map(
                  (note, r) => `
                <div style="display:grid;grid-template-columns:80px repeat(8, 1fr);gap:6px;align-items:center">
                  <span class="sb-mono" style="font-size:11px;color:var(--fg-muted)">${note}</span>
                  ${Array.from({ length: 8 }, (_, c) => {
                    const active = (r + c) % 3 === 0;
                    return `<button type="button" class="sb-seq-cell ${active ? "is-on" : ""}" data-row="${r}" data-col="${c}" style="height:36px;border-radius:6px;border:1px solid var(--border);background:${active ? item.categoryAccent : "var(--surface-card)"}"></button>`;
                  }).join("")}
                </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    }

    // 12. COMMAND & MENUS / CRYPTO & FINTECH — Interactive Radial & FX Swap / Orderbook
    if (cat === "command-menus" || cat === "crypto-fintech") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Interactive precision HUD with live FX conversion calculator, multi-sig quorum approvals, and command triggers.</p>
              </div>
              <span class="sb-live-badge"><span class="sb-online-dot"></span> ZERO-LATENCY</span>
            </div>

            <div class="sb-bento-grid">
              <div class="sb-bento-card">
                <div class="sb-eyebrow">LIVE FX / LIQUIDITY ROUTER</div>
                <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
                  <input type="number" class="sb-input sb-full" id="sb-fx-input" value="2500" />
                  <div class="sb-metric-val" id="sb-fx-output">€2,312.50 EUR · 0.02% slippage</div>
                  <div class="sb-metric-sub">Route: USDC → Curve Pool → SEPA Instant (1.2s)</div>
                </div>
              </div>

              <div class="sb-bento-card">
                <div class="sb-eyebrow">RADIAL / CHORD COMMAND ACTIONS</div>
                <div class="sb-canvas-slots" style="margin-top:12px">
                  <button class="sb-slot-pill" data-sb-toast="Executed chord: ⌘K → Deploy Canary">⌘D Deploy</button>
                  <button class="sb-slot-pill" data-sb-toast="Signed transaction (Quorum 3/3 reached)">✓ Sign Quorum (3/3)</button>
                  <button class="sb-slot-pill" data-sb-toast="Revealed Virtual Card CVV: 849">👁 Reveal CVV</button>
                  <button class="sb-slot-pill" data-sb-toast="Frozen virtual card #4242">❄ Freeze Card</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 13. MODALS, TOASTS & TOURS — Live Trigger Playground, Destructive Confirm & Step Tour
    if (cat === "modals" || cat === "toasts" || cat === "tours") {
      return `
        <div class="sb-centered-stage">
          <div class="sb-stage-card sb-stage-wide">
            <div class="sb-stage-top">
              <div>
                <span class="sb-eyebrow" style="color:${item.categoryAccent}">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
                <h2 class="sb-pane-title">${item.title}</h2>
                <p class="sb-pane-desc">Interactive feedback, dialog confirmation, and onboarding step progression.</p>
              </div>
              <span class="sb-live-badge"><span class="sb-online-dot"></span> INTERACTIVE OVERLAY</span>
            </div>

            <div class="sb-bento-grid">
              <div class="sb-bento-card">
                <div class="sb-eyebrow">EPHEMERAL TOAST ENGINE</div>
                <p class="sb-metric-sub" style="margin-bottom:12px">Spawn live stacked notifications with Web Audio synthesis:</p>
                <div class="sb-main-actions" style="flex-wrap:wrap">
                  <button class="sb-btn-primary" data-sb-toast="✓ Deployment #4829 succeeded in 1.4s">Success Toast</button>
                  <button class="sb-btn-ghost" data-sb-toast="⚠ Rate limit approaching (85% of quota)">Warning Toast</button>
                  <button class="sb-btn-ghost" data-sb-toast="↺ Action undone (⌘Z)">Undo Toast</button>
                </div>
              </div>

              <div class="sb-bento-card">
                <div class="sb-eyebrow">ONBOARDING TOUR STEPPER</div>
                <div class="sb-metric-val" id="sb-tour-step-label">Step 1 of 4 — Workspace Setup</div>
                <div class="sb-metric-sub" id="sb-tour-step-desc">Configure your primary design token surface and keyboard bindings.</div>
                <div class="sb-main-actions" style="margin-top:12px">
                  <button class="sb-btn-ghost" id="sb-tour-prev">← Prev</button>
                  <button class="sb-btn-primary" id="sb-tour-next">Next Step →</button>
                </div>
              </div>

              <div class="sb-bento-card sb-bento-wide">
                <div class="sb-eyebrow">DESTRUCTIVE CONFIRMATION GUARD (${item.slug})</div>
                <p class="sb-metric-sub" style="margin-bottom:10px">Type <code>delete-workspace</code> below to unlock the destructive action button:</p>
                <div class="sb-secret-row">
                  <input type="text" class="sb-input" id="sb-confirm-input" placeholder="Type delete-workspace to confirm…" />
                  <button class="sb-btn-primary" id="sb-confirm-btn" disabled style="opacity:0.4;background:#f43f5e;color:#fff">Delete Permanently</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 9. SETTINGS, PROFILE, CARDS & EMPTY STATES — Interactive Token & RBAC Workbench
    return `
      <div class="sb-centered-stage">
        <div class="sb-stage-card sb-stage-wide">
          <div class="sb-stage-top">
            <div>
              <span class="sb-eyebrow" style="color:${item.categoryAccent}">${item.categoryTitle.toUpperCase()} · ${item.file}</span>
              <h2 class="sb-pane-title">${item.title}</h2>
              <p class="sb-pane-desc">${item.categoryDescription}</p>
            </div>
            <span class="sb-live-badge"><span class="sb-online-dot"></span> INTERACTIVE</span>
          </div>

          <div class="sb-bento-grid">
            <div class="sb-bento-card">
              <div class="sb-eyebrow">VECTOR ARCHITECTURE PREVIEW</div>
              <div class="sb-preview-showcase" style="margin-top:10px">
                ${window.DEVL_PREVIEWS.generatePreviewSVG(item.categoryId, item, item.itemIndex)}
              </div>
            </div>

            <div class="sb-bento-card">
              <div class="sb-eyebrow">LIVE COMPONENT CONTROLS</div>
              <div class="sb-interactive-controls" style="margin-top:10px">
                <div class="sb-control-row">
                  <div>
                    <div class="sb-org-name">Micro-interaction physics</div>
                    <div class="sb-metric-sub">Cubic-bezier spring transitions</div>
                  </div>
                  <button class="sb-switch is-on" data-sb-switch><span class="sb-switch-thumb"></span></button>
                </div>
                <div class="sb-control-row">
                  <div>
                    <div class="sb-org-name">OKLCH dynamic surface contrast</div>
                    <div class="sb-metric-sub">Adaptive border luminance</div>
                  </div>
                  <button class="sb-switch is-on" data-sb-switch><span class="sb-switch-thumb"></span></button>
                </div>
                <div class="sb-control-row">
                  <div>
                    <div class="sb-org-name">Strict keyboard ring focus</div>
                    <div class="sb-metric-sub">WCAG AAA high-visibility outline</div>
                  </div>
                  <button class="sb-switch" data-sb-switch><span class="sb-switch-thumb"></span></button>
                </div>
              </div>
            </div>
          </div>

          <div class="sb-stage-footer">
            <div class="sb-tag-list">
              ${item.tags.map((t) => `<span class="sb-tag">#${t}</span>`).join("")}
            </div>
            <div class="sb-main-actions">
              <button class="sb-btn-ghost" data-action="toggle-code">Inspect Code (C)</button>
              <button class="sb-btn-primary" data-sb-toast="Saved changes to ${item.title}">Apply Configuration ⚡</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.DEVL_SANDBOX = {
    highlightCode,
    generateSourceCode,
    renderLiveSandboxContent
  };
})();
