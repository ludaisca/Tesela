// ============================================================================
// devl.dev v2 — Complete Catalog of 24 Folders & 212 Design Experiments
// Original 18 Folders (158 files) + 6 New Next-Gen Folders (54 files)
// 100% Custom Zero-Dependency Implementation
// ============================================================================

window.DEVL_DATA = {
  meta: {
    title: "ARGON · SCRATCH PAD v2",
    totalFiles: 212,
    totalFolders: 24,
    heading: "Designs.",
    description:
      "212 design experiments across 24 folders. Recreated and expanded from scratch — with raw CSS tokens, WebGL shaders, procedural SVGs, live audio synthesis, and interactive canvases. Zero external libraries."
  },

  heroCards: [
    {
      id: "coss-ui",
      badge: "PRIMITIVES & TOKENS",
      title: "coss-ui v2",
      description:
        "Zero-dependency UI primitives with OKLCH dynamic contrast, tactile spring physics, and copy-paste TSX + Vanilla source.",
      cta: "EXPLORE LAYOUTS",
      targetCat: "layouts",
      accent: "indigo",
      accentHex: "#6366f1"
    },
    {
      id: "orbit",
      badge: "AI & SHADER ENGINE",
      title: "Argon Lab",
      description:
        "54 new experiments added: streaming AI agent traces, interactive WebGL canvases, cubic-bezier editors, and flamegraphs.",
      cta: "JUMP TO AI & SHADERS",
      targetCat: "ai-agents",
      accent: "amber",
      accentHex: "#f59e0b"
    },
    {
      id: "cal",
      badge: "DEVTOOLS & FINTECH",
      title: " Precision HUD",
      description:
        "High-density engineering interfaces — network waterfalls, orderbook depth walls, step sequencers, and temporal grids.",
      cta: "OPEN DEVTOOLS",
      targetCat: "devtools",
      accent: "sky",
      accentHex: "#0ea5e9"
    }
  ],

  categories: [
    {
      id: "layouts",
      title: "Layouts",
      description: "App shells, sidebars, multi-pane splits, focus modes, canvases.",
      accent: "#6366f1",
      isNew: false,
      items: [
        { slug: "workspace-rail", title: "Workspace rail", file: "workspace-rail.tsx", wip: false, tags: ["sidebar", "navigation", "shell", "teams"] },
        { slug: "mini-rail", title: "Mini icon rail", file: "mini-rail.tsx", wip: false, tags: ["compact", "icons", "rail", "tooltips"] },
        { slug: "docs-tree", title: "Docs tree", file: "docs-tree.tsx", wip: false, tags: ["hierarchy", "documentation", "collapsible", "toc"] },
        { slug: "inbox-rail", title: "Inbox rail", file: "inbox-rail.tsx", wip: false, tags: ["mail", "split", "unread", "list"] },
        { slug: "app-shell", title: "App shell", file: "app-shell.tsx", wip: false, tags: ["header", "breadcrumbs", "workspace", "grid"] },
        { slug: "two-pane", title: "Two-pane", file: "two-pane.tsx", wip: false, tags: ["master-detail", "split", "inspector"] },
        { slug: "three-pane", title: "Three-pane", file: "three-pane.tsx", wip: false, tags: ["columns", "triage", "inspector", "ide"] },
        { slug: "split-resizable", title: "Split resizable", file: "split-resizable.tsx", wip: false, tags: ["drag", "handle", "panels", "resizable"] },
        { slug: "focus-mode", title: "Focus mode", file: "focus-mode.tsx", wip: false, tags: ["zen", "writer", "minimal", "distraction-free"] },
        { slug: "floating-toolbar", title: "Floating toolbar", file: "floating-toolbar.tsx", wip: false, tags: ["hud", "dock", "glass", "actions"] },
        { slug: "canvas-tools", title: "Canvas tools", file: "canvas-tools.tsx", wip: false, tags: ["infinite-canvas", "zoom", "nodes", "layers"] },
        { slug: "bottom-nav", title: "Bottom nav", file: "bottom-nav.tsx", wip: false, tags: ["mobile", "dock", "tabs", "responsive"] }
      ]
    },
    {
      id: "ai-agents",
      title: "AI & Agents",
      description: "Streaming traces, tool-call inspectors, context meters, multi-agent graphs.",
      accent: "#a855f7",
      isNew: true,
      items: [
        { slug: "prompt-composer", title: "Prompt composer", file: "prompt-composer.tsx", wip: false, tags: ["attachments", "model-picker", "slash-commands", "tokens"] },
        { slug: "streaming-trace", title: "Streaming trace", file: "streaming-trace.tsx", wip: false, tags: ["cot", "reasoning", "tokens-sec", "collapsible"] },
        { slug: "tool-call-inspector", title: "Tool call inspector", file: "tool-call-inspector.tsx", wip: false, tags: ["json-rpc", "arguments", "stdout", "latency"] },
        { slug: "model-arena-selector", title: "Model arena selector", file: "model-arena-selector.tsx", wip: false, tags: ["side-by-side", "elo", "latency", "cost"] },
        { slug: "token-budget-meter", title: "Token budget meter", file: "token-budget-meter.tsx", wip: false, tags: ["context-window", "cache-hit", "segments", "128k"] },
        { slug: "context-window-stack", title: "Context window stack", file: "context-window-stack.tsx", wip: false, tags: ["files", "rag-chunks", "pinned", "pruning"] },
        { slug: "agent-handoff-graph", title: "Agent handoff graph", file: "agent-handoff-graph.tsx", wip: false, tags: ["orchestrator", "subagents", "dag", "live-edge"] },
        { slug: "citation-popover", title: "Citation popover", file: "citation-popover.tsx", wip: false, tags: ["grounding", "sources", "confidence", "preview"] },
        { slug: "voice-waveform-hud", title: "Voice waveform HUD", file: "voice-waveform-hud.tsx", wip: false, tags: ["vad", "realtime-audio", "orb", "barge-in"] },
        { slug: "diff-apply-review", title: "Diff apply review", file: "diff-apply-review.tsx", wip: false, tags: ["inline-diff", "accept-reject", "hunks", "patch"] }
      ]
    },
    {
      id: "shaders-canvas",
      title: "Shaders & Canvas",
      description: "Procedural fields, magnetic grids, ASCII matrices, bezier synth nodes.",
      accent: "#ec4899",
      isNew: true,
      items: [
        { slug: "magnetic-cursor-grid", title: "Magnetic cursor grid", file: "magnetic-cursor-grid.tsx", wip: false, tags: ["vectors", "dipole", "interactive", "canvas2d"] },
        { slug: "ascii-matrix-field", title: "ASCII matrix field", file: "ascii-matrix-field.tsx", wip: false, tags: ["glyphs", "luminance", "procedural", "monospace"] },
        { slug: "simplex-flow-lines", title: "Simplex flow lines", file: "simplex-flow-lines.tsx", wip: false, tags: ["curl-noise", "streamlines", "particles", "60fps"] },
        { slug: "dither-halftone-shader", title: "Dither halftone shader", file: "dither-halftone-shader.tsx", wip: false, tags: ["bayer-matrix", "1-bit", "ordered-dither", "webgl"] },
        { slug: "interactive-cloth-mesh", title: "Interactive cloth mesh", file: "interactive-cloth-mesh.tsx", wip: false, tags: ["verlet", "springs", "constraints", "tearable"] },
        { slug: "raymarched-sdf-orb", title: "Raymarched SDF orb", file: "raymarched-sdf-orb.tsx", wip: false, tags: ["signed-distance", "smooth-min", "specular", "glsl"] },
        { slug: "audio-fft-spectrum", title: "Audio FFT spectrum", file: "audio-fft-spectrum.tsx", wip: false, tags: ["frequencies", "decibels", "harmonic", "bars"] },
        { slug: "bezier-node-graph", title: "Bezier node graph", file: "bezier-node-graph.tsx", wip: false, tags: ["patch-cables", "ports", "draggable", "signal"] },
        { slug: "voronoi-cell-reactor", title: "Voronoi cell reactor", file: "voronoi-cell-reactor.tsx", wip: false, tags: ["tessellation", "centroids", "relaxation", "mesh"] },
        { slug: "crt-scanline-terminal", title: "CRT scanline terminal", file: "crt-scanline-terminal.tsx", wip: false, tags: ["phosphor", "aberration", "curvature", "retro"] }
      ]
    },
    {
      id: "forms",
      title: "Forms",
      description: "Settings, invites, preferences, API keys.",
      accent: "#10b981",
      isNew: false,
      items: [
        { slug: "workspace-settings", title: "Workspace settings", file: "workspace-settings.tsx", wip: false, tags: ["general", "slug", "avatar", "danger-zone"] },
        { slug: "invite-teammates", title: "Invite teammates", file: "invite-teammates.tsx", wip: false, tags: ["emails", "roles", "multi-row", "seats"] },
        { slug: "notifications", title: "Notification preferences", file: "notifications.tsx", wip: false, tags: ["toggles", "matrix", "channels", "digest"] },
        { slug: "api-key", title: "Create API key", file: "api-key.tsx", wip: false, tags: ["scopes", "permissions", "expiration", "secret"] }
      ]
    },
    {
      id: "auth",
      title: "Auth & Onboarding",
      description: "Sign-in, magic-link, OAuth, waitlist.",
      accent: "#8b5cf6",
      isNew: false,
      items: [
        { slug: "login", title: "Login", file: "login.tsx", wip: false, tags: ["oauth", "password", "session"] },
        { slug: "onboarding", title: "Onboarding", file: "onboarding.tsx", wip: false, tags: ["stepper", "wizard", "setup"] },
        { slug: "waitlist", title: "Waitlist landing", file: "waitlist.tsx", wip: false, tags: ["early-access", "counter", "referral"] },
        { slug: "check-email", title: "Check your email", file: "check-email.tsx", wip: false, tags: ["verification", "inbox", "resend"] },
        { slug: "inset-login", title: "Inset login", file: "inset-login.tsx", wip: false, tags: ["card", "framed", "testimonial"] },
        { slug: "centered-signin", title: "Centered signin", file: "centered-signin.tsx", wip: false, tags: ["minimal", "sso", "centered"] },
        { slug: "centered-signup", title: "Centered signup", file: "centered-signup.tsx", wip: false, tags: ["registration", "strength-meter", "terms"] },
        { slug: "left-signin", title: "Left signin", file: "left-signin.tsx", wip: false, tags: ["split-screen", "artwork", "brand"] },
        { slug: "right-signin", title: "Right signin", file: "right-signin.tsx", wip: false, tags: ["split-screen", "reversed", "preview"] },
        { slug: "glass-signup", title: "Glass signup", file: "glass-signup.tsx", wip: false, tags: ["frosted", "backdrop", "shader"] },
        { slug: "otp-verify", title: "OTP verify", file: "otp-verify.tsx", wip: false, tags: ["6-digit", "pin", "code"] },
        { slug: "reset-password", title: "Reset password", file: "reset-password.tsx", wip: false, tags: ["recovery", "rules", "validation"] },
        { slug: "two-factor", title: "Two-factor", file: "two-factor.tsx", wip: false, tags: ["totp", "authenticator", "backup-codes"] },
        { slug: "magic-link-sent", title: "Magic link sent", file: "magic-link-sent.tsx", wip: false, tags: ["passwordless", "token", "countdown"] }
      ]
    },
    {
      id: "dashboards",
      title: "Dashboards",
      description: "Metric grids, sparklines, activity feeds, plan usage.",
      accent: "#3b82f6",
      isNew: false,
      items: [
        { slug: "metrics-overview", title: "Metrics overview", file: "metrics-overview.tsx", wip: false, tags: ["kpi", "sparklines", "deltas", "executive"] },
        { slug: "usage", title: "Plan usage", file: "usage.tsx", wip: false, tags: ["quotas", "meters", "bandwidth", "compute"] },
        { slug: "analytics", title: "Analytics", file: "analytics.tsx", wip: false, tags: ["traffic", "referrers", "countries", "visitors"] },
        { slug: "home", title: "Personal home", file: "home.tsx", wip: false, tags: ["greeting", "recents", "tasks", "inbox"] },
        { slug: "revenue", title: "Revenue", file: "revenue.tsx", wip: false, tags: ["mrr", "arr", "churn", "net-retention"] },
        { slug: "services", title: "Service health", file: "services.tsx", wip: false, tags: ["uptime", "latency", "clusters", "incidents"] },
        { slug: "engineering", title: "Engineering velocity", file: "engineering.tsx", wip: false, tags: ["cycle-time", "throughput", "deploys", "prs"] },
        { slug: "support", title: "Support queue", file: "support.tsx", wip: false, tags: ["sla", "tickets", "csat", "response-time"] },
        { slug: "market", title: "Markets", file: "market.tsx", wip: false, tags: ["tickers", "orderbook", "candlesticks", "portfolio"] }
      ]
    },
    {
      id: "devtools",
      title: "DevTools & Logs",
      description: "Network waterfalls, flamegraphs, JSON AST explorers, SQL workbenches.",
      accent: "#06b6d4",
      isNew: true,
      items: [
        { slug: "network-waterfall", title: "Network waterfall", file: "network-waterfall.tsx", wip: false, tags: ["har", "dns-tls-ttfb", "timing", "headers"] },
        { slug: "flamegraph-profiler", title: "Flamegraph profiler", file: "flamegraph-profiler.tsx", wip: false, tags: ["cpu-stack", "self-time", "hot-paths", "zoom"] },
        { slug: "json-tree-explorer", title: "JSON tree explorer", file: "json-tree-explorer.tsx", wip: false, tags: ["collapsible", "path-copy", "schema", "types"] },
        { slug: "sql-query-workbench", title: "SQL query workbench", file: "sql-query-workbench.tsx", wip: false, tags: ["explain-analyze", "rows", "schema-browser", "cte"] },
        { slug: "env-secrets-vault", title: "Env secrets vault", file: "env-secrets-vault.tsx", wip: false, tags: ["encrypted", "environments", "reveal", "dotenv"] },
        { slug: "webhook-payload-diff", title: "Webhook payload diff", file: "webhook-payload-diff.tsx", wip: false, tags: ["hmac", "redeliver", "status-200", "headers"] },
        { slug: "cron-schedule-visualizer", title: "Cron visualizer", file: "cron-schedule-visualizer.tsx", wip: false, tags: ["crontab", "next-runs", "utc", "syntax"] },
        { slug: "memory-heap-map", title: "Memory heap map", file: "memory-heap-map.tsx", wip: false, tags: ["retainers", "allocations", "treemap", "gc"] },
        { slug: "regex-ast-tester", title: "Regex AST tester", file: "regex-ast-tester.tsx", wip: false, tags: ["capture-groups", "lookahead", "matches", "railroad"] }
      ]
    },
    {
      id: "tables",
      title: "Tables",
      description: "Sortable rows, density, bulk actions.",
      accent: "#06b6d4",
      isNew: false,
      items: [
        { slug: "invoices", title: "Invoices", file: "invoices.tsx", wip: false, tags: ["billing", "status", "pdf", "sortable"] },
        { slug: "members", title: "Team members", file: "members.tsx", wip: false, tags: ["avatars", "roles", "2fa-status", "last-seen"] },
        { slug: "orders", title: "Orders", file: "orders.tsx", wip: false, tags: ["ecommerce", "fulfillment", "customer", "total"] },
        { slug: "logs", title: "Server logs", file: "logs.tsx", wip: false, tags: ["monospace", "tail", "severity", "latency"] },
        { slug: "api-keys", title: "API keys", file: "api-keys.tsx", wip: false, tags: ["tokens", "masked", "usage", "revoke"] },
        { slug: "inventory", title: "Inventory", file: "inventory.tsx", wip: false, tags: ["sku", "stock-level", "warehouse", "reorder"] },
        { slug: "issues", title: "Issue tracker", file: "issues.tsx", wip: false, tags: ["priority", "assignee", "labels", "linear-style"] },
        { slug: "transactions", title: "Transactions", file: "transactions.tsx", wip: false, tags: ["ledger", "merchant", "category", "amount"] },
        { slug: "audit-log", title: "Audit log", file: "audit-log.tsx", wip: false, tags: ["security", "actor", "ip-address", "diff"] }
      ]
    },
    {
      id: "filters",
      title: "Filters",
      description: "Toolbars, faceted popovers, chips, and sidebar filter rails.",
      accent: "#f59e0b",
      isNew: false,
      items: [
        { slug: "toolbar", title: "Filter toolbar", file: "toolbar.tsx", wip: false, tags: ["search", "sort", "group-by", "display"] },
        { slug: "faceted", title: "Faceted popover", file: "faceted.tsx", wip: false, tags: ["multi-select", "counts", "checkboxes", "combobox"] },
        { slug: "chips", title: "Active filter chips", file: "chips.tsx", wip: false, tags: ["operators", "is-any-of", "removable", "tokens"] },
        { slug: "sidebar", title: "Filter sidebar", file: "sidebar.tsx", wip: false, tags: ["accordions", "price-range", "facets", "attributes"] }
      ]
    },
    {
      id: "command-menus",
      title: "Command & Menus",
      description: "Radial pie menus, Raycast action bars, slash editors, chord HUDs.",
      accent: "#f97316",
      isNew: true,
      items: [
        { slug: "radial-pie-menu", title: "Radial pie menu", file: "radial-pie-menu.tsx", wip: false, tags: ["gesture", "polar-sectors", "cursor", "svg"] },
        { slug: "raycast-action-bar", title: "Raycast action bar", file: "raycast-action-bar.tsx", wip: false, tags: ["launcher", "sub-actions", "fuzzy", "hotkeys"] },
        { slug: "breadcrumb-dropdown-tree", title: "Breadcrumb tree menu", file: "breadcrumb-dropdown-tree.tsx", wip: false, tags: ["hierarchy", "siblings", "path-switcher"] },
        { slug: "context-menu-nested", title: "Nested context menu", file: "context-menu-nested.tsx", wip: false, tags: ["right-click", "submenus", "check-items", "kbd"] },
        { slug: "floating-slash-menu", title: "Floating slash menu", file: "floating-slash-menu.tsx", wip: false, tags: ["editor", "blocks", "typeahead", "notion-style"] },
        { slug: "multi-step-omni-search", title: "Multi-step omni search", file: "multi-step-omni-search.tsx", wip: false, tags: ["parameterized", "tokens", "scopes", "preview"] },
        { slug: "keyboard-chord-hud", title: "Keyboard chord HUD", file: "keyboard-chord-hud.tsx", wip: false, tags: ["leader-key", "vim-chords", "cheatsheet", "overlay"] },
        { slug: "dock-magnifier-bar", title: "Dock magnifier bar", file: "dock-magnifier-bar.tsx", wip: false, tags: ["gaussian-scale", "spring", "launch-indicators"] },
        { slug: "tab-switcher-expose", title: "Tab switcher exposé", file: "tab-switcher-expose.tsx", wip: false, tags: ["thumbnails", "mru-order", "alt-tab", "grid"] }
      ]
    },
    {
      id: "empty-states",
      title: "Empty states",
      description: "First-run, zero-data, end-of-list.",
      accent: "#a855f7",
      isNew: false,
      items: [
        { slug: "inbox-zero", title: "Inbox zero", file: "inbox-zero.tsx", wip: false, tags: ["zen", "all-caught-up", "shortcut"] },
        { slug: "no-results", title: "No results", file: "no-results.tsx", wip: false, tags: ["search", "clear-filters", "suggestions"] },
        { slug: "first-project", title: "First project", file: "first-project.tsx", wip: false, tags: ["onboarding", "templates", "cta"] },
        { slug: "end-of-feed", title: "End of feed", file: "end-of-feed.tsx", wip: false, tags: ["pagination", "archive", "milestone"] },
        { slug: "no-team", title: "No teammates", file: "no-team.tsx", wip: false, tags: ["collaboration", "invite", "avatars"] },
        { slug: "trash", title: "Empty trash", file: "trash.tsx", wip: false, tags: ["deleted", "retention", "clean"] },
        { slug: "404", title: "404", file: "404.tsx", wip: false, tags: ["not-found", "broken-link", "compass"] },
        { slug: "maintenance", title: "Maintenance", file: "maintenance.tsx", wip: false, tags: ["scheduled", "status", "eta"] },
        { slug: "no-files", title: "No files", file: "no-files.tsx", wip: false, tags: ["dropzone", "upload", "folder"] },
        { slug: "offline", title: "Offline", file: "offline.tsx", wip: false, tags: ["network", "reconnect", "cached"] }
      ]
    },
    {
      id: "settings",
      title: "Settings",
      description: "Profile, appearance, billing, integrations.",
      accent: "#ec4899",
      isNew: false,
      items: [
        { slug: "profile", title: "Profile", file: "profile.tsx", wip: false, tags: ["avatar", "bio", "handle", "timezone"] },
        { slug: "appearance", title: "Appearance", file: "appearance.tsx", wip: false, tags: ["theme", "density", "accent-color", "font"] },
        { slug: "billing", title: "Billing", file: "billing.tsx", wip: false, tags: ["plan", "payment-method", "invoices", "seats"] },
        { slug: "integrations", title: "Integrations", file: "integrations.tsx", wip: false, tags: ["github", "slack", "linear", "oauth"] },
        { slug: "security", title: "Security", file: "security.tsx", wip: false, tags: ["sessions", "devices", "passkeys", "2fa"] },
        { slug: "permissions", title: "Roles & permissions", file: "permissions.tsx", wip: false, tags: ["rbac", "matrix", "admin", "scopes"] },
        { slug: "branding", title: "Workspace branding", file: "branding.tsx", wip: false, tags: ["logo", "custom-domain", "colors", "whitelabel"] },
        { slug: "localization", title: "Localization", file: "localization.tsx", wip: false, tags: ["language", "date-format", "currency", "region"] },
        { slug: "webhooks", title: "Webhooks", file: "webhooks.tsx", wip: false, tags: ["endpoints", "events", "signing-secret", "deliveries"] },
        { slug: "privacy", title: "Privacy & data", file: "privacy.tsx", wip: false, tags: ["gdpr", "export", "retention", "telemetry"] },
        { slug: "developer", title: "Developer", file: "developer.tsx", wip: false, tags: ["sdk", "sandbox-mode", "rate-limits", "logs"] },
        { slug: "sso", title: "Single sign-on", file: "sso.tsx", wip: false, tags: ["saml", "oidc", "scim", "domain-verification"] }
      ]
    },
    {
      id: "cards",
      title: "Cards",
      description: "Stat tiles, list items, surface containers.",
      accent: "#14b8a6",
      isNew: false,
      items: [
        { slug: "stat-tile", title: "Stat tile", file: "stat-tile.tsx", wip: false, tags: ["metric", "delta", "sparkline"] },
        { slug: "profile", title: "Profile card", file: "profile.tsx", wip: false, tags: ["user", "badges", "follow", "stats"] },
        { slug: "pricing", title: "Pricing tiers", file: "pricing.tsx", wip: false, tags: ["pro", "features", "cta"] },
        { slug: "product", title: "Product card", file: "product.tsx", wip: false, tags: ["commerce", "variants", "price"] },
        { slug: "invoice", title: "Invoice line", file: "invoice.tsx", wip: false, tags: ["receipt", "breakdown", "paid"] },
        { slug: "task", title: "Kanban task", file: "task.tsx", wip: false, tags: ["subtasks", "priority", "due-date"] },
        { slug: "event", title: "Calendar event", file: "event.tsx", wip: false, tags: ["meeting", "attendees", "join-call"] },
        { slug: "integration", title: "Integration", file: "integration.tsx", wip: false, tags: ["connected", "sync", "webhook"] },
        { slug: "media", title: "Article preview", file: "media.tsx", wip: false, tags: ["editorial", "reading-time", "author"] },
        { slug: "payment-method", title: "Payment method", file: "payment-method.tsx", wip: false, tags: ["credit-card", "expiry", "default"] }
      ]
    },
    {
      id: "modals",
      title: "Modals",
      description: "Dialogs, drawers, command palettes, confirmations.",
      accent: "#f43f5e",
      isNew: false,
      items: [
        { slug: "confirm-delete", title: "Confirm delete", file: "confirm-delete.tsx", wip: false, tags: ["destructive", "type-to-confirm", "warning"] },
        { slug: "share-link", title: "Share link", file: "share-link.tsx", wip: false, tags: ["permissions", "copy-link", "invite"] },
        { slug: "upload-files", title: "Upload files", file: "upload-files.tsx", wip: false, tags: ["drag-drop", "progress", "queue"] },
        { slug: "command-palette", title: "Command palette", file: "command-palette.tsx", wip: false, tags: ["cmdk", "fuzzy", "shortcuts"] },
        { slug: "feedback", title: "Feedback", file: "feedback.tsx", wip: false, tags: ["sentiment", "screenshot", "bug-report"] },
        { slug: "shortcuts", title: "Keyboard shortcuts", file: "shortcuts.tsx", wip: false, tags: ["hotkeys", "cheatsheet", "keycaps"] },
        { slug: "upgrade", title: "Upgrade plan", file: "upgrade.tsx", wip: false, tags: ["upsell", "unlock", "comparison"] },
        { slug: "export", title: "Export data", file: "export.tsx", wip: false, tags: ["csv", "json", "date-range", "columns"] },
        { slug: "create-workspace", title: "Create workspace", file: "create-workspace.tsx", wip: false, tags: ["region", "slug", "icon"] },
        { slug: "two-factor", title: "Two-factor setup", file: "two-factor.tsx", wip: false, tags: ["qr-code", "secret", "verify"] }
      ]
    },
    {
      id: "charts",
      title: "Charts",
      description: "Area, bar, donut, funnel, heatmap, gauge — pure SVG.",
      accent: "#22c55e",
      isNew: false,
      items: [
        { slug: "revenue-area", title: "Revenue area", file: "revenue-area.tsx", wip: false, tags: ["gradient", "crosshair", "mrr", "svg"] },
        { slug: "cohort-heatmap", title: "Cohort heatmap", file: "cohort-heatmap.tsx", wip: false, tags: ["retention", "matrix", "cells", "percentage"] },
        { slug: "funnel", title: "Funnel", file: "funnel.tsx", wip: false, tags: ["conversion", "dropoff", "stages"] },
        { slug: "gauges", title: "Radial gauges", file: "gauges.tsx", wip: false, tags: ["arc", "cpu", "memory", "apdex"] },
        { slug: "bar-grouped", title: "Grouped bars", file: "bar-grouped.tsx", wip: false, tags: ["comparison", "quarters", "legend"] },
        { slug: "line-multi", title: "Multi-series line", file: "line-multi.tsx", wip: false, tags: ["latency", "p50-p95-p99", "interpolation"] },
        { slug: "donut", title: "Donut breakdown", file: "donut.tsx", wip: false, tags: ["segments", "allocation", "ring"] },
        { slug: "scatter", title: "Scatter plot", file: "scatter.tsx", wip: false, tags: ["clusters", "correlation", "quadrants"] },
        { slug: "waterfall", title: "Waterfall", file: "waterfall.tsx", wip: false, tags: ["cashflow", "bridge", "variance"] }
      ]
    },
    {
      id: "media-audio",
      title: "Media & Creative Tools",
      description: "Bezier easing editors, step sequencers, waveform scrubbers, OKLCH pickers.",
      accent: "#10b981",
      isNew: true,
      items: [
        { slug: "bezier-easing-editor", title: "Cubic-bezier editor", file: "bezier-easing-editor.tsx", wip: false, tags: ["control-points", "spring", "curve", "animation"] },
        { slug: "synth-step-sequencer", title: "8-step synth sequencer", file: "synth-step-sequencer.tsx", wip: false, tags: ["webaudio", "bpm", "oscillator", "matrix"] },
        { slug: "waveform-scrubber", title: "Waveform scrubber", file: "waveform-scrubber.tsx", wip: false, tags: ["peaks", "playhead", "regions", "markers"] },
        { slug: "color-oklch-picker", title: "OKLCH color space", file: "color-oklch-picker.tsx", wip: false, tags: ["perceptual", "chroma", "lightness", "gamut"] },
        { slug: "video-timeline-trimmer", title: "Video timeline trimmer", file: "video-timeline-trimmer.tsx", wip: false, tags: ["keyframes", "tracks", "handles", "timecode"] },
        { slug: "spatial-eq-parametric", title: "Parametric EQ curve", file: "spatial-eq-parametric.tsx", wip: false, tags: ["bands", "q-factor", "biquad", "frequency"] },
        { slug: "sprite-frame-inspector", title: "Sprite frame inspector", file: "sprite-frame-inspector.tsx", wip: false, tags: ["onion-skin", "fps", "grid-slice", "hitbox"] },
        { slug: "camera-pip-controller", title: "Camera PiP HUD", file: "camera-pip-controller.tsx", wip: false, tags: ["recording", "mic-gain", "teleprompter", "floating"] }
      ]
    },
    {
      id: "timelines",
      title: "Timelines",
      description: "Audit trails, changelogs, deploys, status, mentions.",
      accent: "#eab308",
      isNew: false,
      items: [
        { slug: "audit", title: "Audit trail", file: "audit.tsx", wip: false, tags: ["events", "actors", "chronological"] },
        { slug: "notifications", title: "Notifications panel", file: "notifications.tsx", wip: false, tags: ["unread", "mentions", "tabs"] },
        { slug: "changelog", title: "Changelog", file: "changelog.tsx", wip: false, tags: ["releases", "semver", "badges"] },
        { slug: "commits", title: "Commit history", file: "commits.tsx", wip: false, tags: ["git", "sha", "branch", "verified"] },
        { slug: "approvals", title: "Approvals", file: "approvals.tsx", wip: false, tags: ["workflow", "reviewers", "sign-off"] },
        { slug: "pull-request", title: "Pull request", file: "pull-request.tsx", wip: false, tags: ["checks", "diff", "merge", "conversation"] },
        { slug: "pr-ops-console", title: "PR ops console", file: "pr-ops-console.tsx", wip: false, tags: ["ci-cd", "pipeline", "bot", "deployment"] },
        { slug: "releases", title: "Release timeline", file: "releases.tsx", wip: false, tags: ["tags", "artifacts", "rollback"] },
        { slug: "status-page", title: "Status page", file: "status-page.tsx", wip: false, tags: ["90-day-bars", "uptime", "incidents"] },
        { slug: "deploys", title: "Deploy history", file: "deploys.tsx", wip: false, tags: ["production", "preview", "duration", "commit"] },
        { slug: "inbox-thread", title: "Inbox thread", file: "inbox-thread.tsx", wip: false, tags: ["messages", "replies", "attachments"] },
        { slug: "activity-feed", title: "Activity feed", file: "activity-feed.tsx", wip: false, tags: ["realtime", "stream", "team"] }
      ]
    },
    {
      id: "calendars",
      title: "Calendars",
      description: "Month grids, week schedules, agenda lists, heatmaps.",
      accent: "#0ea5e9",
      isNew: false,
      items: [
        { slug: "month", title: "Month view", file: "month.tsx", wip: false, tags: ["grid", "events", "pills"] },
        { slug: "week", title: "Week schedule", file: "week.tsx", wip: false, tags: ["time-blocks", "current-time", "slots"] },
        { slug: "agenda", title: "Agenda list", file: "agenda.tsx", wip: false, tags: ["upcoming", "grouped", "chronological"] },
        { slug: "date-range", title: "Date range picker", file: "date-range.tsx", wip: false, tags: ["dual-month", "presets", "selection"] },
        { slug: "timezone", title: "Timezone planner", file: "timezone.tsx", wip: false, tags: ["world-clock", "overlap", "slider"] },
        { slug: "mini", title: "Mini calendar", file: "mini.tsx", wip: false, tags: ["compact", "popover", "date-picker"] },
        { slug: "year-heatmap", title: "Contribution heatmap", file: "year-heatmap.tsx", wip: false, tags: ["52-weeks", "streaks", "activity"] },
        { slug: "recurring", title: "Recurring event", file: "recurring.tsx", wip: false, tags: ["rrule", "cadence", "exceptions"] },
        { slug: "holidays", title: "Holidays & PTO", file: "holidays.tsx", wip: false, tags: ["time-off", "team-availability", "balances"] }
      ]
    },
    {
      id: "profile",
      title: "Profile",
      description: "User pages, hover cards, team grids, presence rails.",
      accent: "#d946ef",
      isNew: false,
      items: [
        { slug: "hero", title: "Profile hero", file: "hero.tsx", wip: false, tags: ["banner", "avatar", "contributions", "links"] },
        { slug: "hover-card", title: "Hover card", file: "hover-card.tsx", wip: false, tags: ["popover", "mutuals", "quick-follow"] },
        { slug: "team-grid", title: "Team grid", file: "team-grid.tsx", wip: false, tags: ["departments", "cards", "org"] },
        { slug: "directory", title: "Contact directory", file: "directory.tsx", wip: false, tags: ["alphabetical", "search", "split"] },
        { slug: "compact-card", title: "Compact user card", file: "compact-card.tsx", wip: false, tags: ["inline", "status", "role"] },
        { slug: "org-chart", title: "Org chart", file: "org-chart.tsx", wip: false, tags: ["tree", "reporting-lines", "nodes"] },
        { slug: "skills", title: "Skills matrix", file: "skills.tsx", wip: false, tags: ["proficiency", "endorsements", "radar"] },
        { slug: "presence-rail", title: "Presence rail", file: "presence-rail.tsx", wip: false, tags: ["online", "voice-room", "status"] },
        { slug: "introductions", title: "Suggested intros", file: "introductions.tsx", wip: false, tags: ["network", "connect", "mutual"] },
        { slug: "credentials", title: "Security credentials", file: "credentials.tsx", wip: false, tags: ["gpg", "ssh-keys", "certificates"] }
      ]
    },
    {
      id: "crypto-fintech",
      title: "Fintech & Treasury",
      description: "Orderbook depth walls, FX swap routers, virtual cards, runway simulators.",
      accent: "#14b8a6",
      isNew: true,
      items: [
        { slug: "orderbook-depth-wall", title: "Orderbook depth wall", file: "orderbook-depth-wall.tsx", wip: false, tags: ["bids-asks", "spread", "cumulative", "realtime"] },
        { slug: "virtual-card-vault", title: "Virtual card vault", file: "virtual-card-vault.tsx", wip: false, tags: ["spend-limits", "cvv-reveal", "freeze", "merchant-lock"] },
        { slug: "fx-currency-swap", title: "FX currency swap", file: "fx-currency-swap.tsx", wip: false, tags: ["slippage", "rate-lock", "multi-hop", "quote"] },
        { slug: "treasury-runway-burn", title: "Treasury runway burn", file: "treasury-runway-burn.tsx", wip: false, tags: ["zero-cash-date", "net-burn", "scenarios", "arr"] },
        { slug: "liquidity-pool-range", title: "Liquidity range concentrated", file: "liquidity-pool-range.tsx", wip: false, tags: ["ticks", "apr", "price-bounds", "histogram"] },
        { slug: "wire-transfer-stepper", title: "Wire transfer stepper", file: "wire-transfer-stepper.tsx", wip: false, tags: ["swift-iban", "routing", "compliance", "approval"] },
        { slug: "tax-lot-harvester", title: "Tax lot harvester", file: "tax-lot-harvester.tsx", wip: false, tags: ["fifo-lifo", "short-long", "unrealized", "cost-basis"] },
        { slug: "multi-sig-quorum", title: "Multi-sig quorum", file: "multi-sig-quorum.tsx", wip: false, tags: ["3-of-5", "hardware-signers", "threshold", "nonce"] }
      ]
    },
    {
      id: "toasts",
      title: "Toasts & banners",
      description: "Ephemeral feedback — confirmation, errors, undos, progress.",
      accent: "#f97316",
      isNew: false,
      items: [
        { slug: "success", title: "Success toast", file: "success.tsx", wip: false, tags: ["check", "dismiss", "stack"] },
        { slug: "error-retry", title: "Error with retry", file: "error-retry.tsx", wip: false, tags: ["alert", "retry-button", "trace"] },
        { slug: "info-banner", title: "System banner", file: "info-banner.tsx", wip: false, tags: ["announcement", "top-bar", "cta"] },
        { slug: "progress", title: "Progress toast", file: "progress.tsx", wip: false, tags: ["uploading", "percentage", "cancel"] },
        { slug: "undo", title: "Undo toast", file: "undo.tsx", wip: false, tags: ["countdown", "revert", "keyboard-z"] },
        { slug: "rich", title: "Rich toast", file: "rich.tsx", wip: false, tags: ["avatar", "reply-inline", "preview"] }
      ]
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Tier comparisons, sliders, contact-sales, billing toggles.",
      accent: "#84cc16",
      isNew: false,
      items: [
        { slug: "three-tier", title: "Three-tier", file: "three-tier.tsx", wip: false, tags: ["hobby-pro-enterprise", "popular", "cards"] },
        { slug: "comparison-table", title: "Feature matrix", file: "comparison-table.tsx", wip: false, tags: ["sticky-header", "checkmarks", "tiers"] },
        { slug: "slider-seats", title: "Seat slider", file: "slider-seats.tsx", wip: false, tags: ["calculator", "volume-discount", "interactive"] },
        { slug: "simple-card", title: "Single plan", file: "simple-card.tsx", wip: false, tags: ["all-in-one", "flat-rate", "guarantee"] },
        { slug: "contact-sales", title: "Contact sales", file: "contact-sales.tsx", wip: false, tags: ["enterprise", "custom-quote", "sla"] },
        { slug: "monthly-yearly", title: "Billing toggle", file: "monthly-yearly.tsx", wip: false, tags: ["annual-discount", "pill-switch", "savings"] }
      ]
    },
    {
      id: "tours",
      title: "Tours & coachmarks",
      description: "Welcome modals, spotlights, beacons, onboarding checklists.",
      accent: "#38bdf8",
      isNew: false,
      items: [
        { slug: "welcome-carousel", title: "Welcome carousel", file: "welcome-carousel.tsx", wip: false, tags: ["slides", "dots", "whats-new"] },
        { slug: "spotlight", title: "Spotlight tour", file: "spotlight.tsx", wip: false, tags: ["mask", "cutout", "step-counter"] },
        { slug: "arrow-tooltip", title: "Arrow tooltip", file: "arrow-tooltip.tsx", wip: false, tags: ["coachmark", "pointer", "dismiss"] },
        { slug: "beacon", title: "Beacon hint", file: "beacon.tsx", wip: false, tags: ["pulse", "hotspot", "feature-discovery"] },
        { slug: "inline-hint", title: "Inline hint", file: "inline-hint.tsx", wip: false, tags: ["callout", "pro-tip", "contextual"] },
        { slug: "checklist", title: "Onboarding checklist", file: "checklist.tsx", wip: false, tags: ["progress-ring", "steps", "reward"] }
      ]
    },
    {
      id: "threads",
      title: "Threads & comments",
      description: "Inline threads, side panels, reactions, mention popovers.",
      accent: "#fb7185",
      isNew: false,
      items: [
        { slug: "inline-thread", title: "Inline thread", file: "inline-thread.tsx", wip: false, tags: ["nested", "connectors", "collapse"] },
        { slug: "side-panel", title: "Side panel", file: "side-panel.tsx", wip: false, tags: ["document-comments", "anchors", "drawer"] },
        { slug: "comment-row", title: "Comment row", file: "comment-row.tsx", wip: false, tags: ["reactions", "timestamp", "markdown"] },
        { slug: "mention-popover", title: "@mention popover", file: "mention-popover.tsx", wip: false, tags: ["autocomplete", "users", "caret"] },
        { slug: "resolved", title: "Resolved thread", file: "resolved.tsx", wip: false, tags: ["summary", "reopen", "audit"] },
        { slug: "compose-rich", title: "Rich composer", file: "compose-rich.tsx", wip: false, tags: ["formatting", "attachments", "preview-tab"] }
      ]
    }
  ]
};

window.DEVL_FLAT_ITEMS = [];
window.DEVL_DATA.categories.forEach((cat, catIdx) => {
  cat.items.forEach((item, itemIdx) => {
    const flatItem = {
      ...item,
      isNewCategory: Boolean(cat.isNew),
      categoryId: cat.id,
      categoryTitle: cat.title,
      categoryDescription: cat.description,
      categoryAccent: cat.accent,
      categoryIndex: catIdx,
      itemIndex: itemIdx,
      globalIndex: window.DEVL_FLAT_ITEMS.length,
      path: `/c/${cat.id}/${item.slug}`
    };
    window.DEVL_FLAT_ITEMS.push(flatItem);
  });
});
