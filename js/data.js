// ============================================================================
// devl.dev — Complete Catalog of 18 Folders & 158 Design Experiments
// 100% Custom Zero-Dependency Implementation
// ============================================================================

window.DEVL_DATA = {
  meta: {
    title: "SEAN'S SCRATCH PAD",
    totalFiles: 158,
    totalFolders: 18,
    heading: "Designs.",
    description:
      "158 design experiments, two years deep. Built from scratch — with raw CSS, shaders, weird SVGs, and custom interactive canvases thrown in. Scroll, or press ⌘K to jump in."
  },

  heroCards: [
    {
      id: "coss-ui",
      badge: "COMPONENT LIBRARY",
      title: "coss-ui",
      description:
        "The library every design here is built on. Zero-dependency primitives, accessible, tactile, copy-paste.",
      cta: "BROWSE COMPONENTS",
      href: "# layouts",
      accent: "indigo",
      accentHex: "#6366f1"
    },
    {
      id: "orbit",
      badge: "STARTER KIT",
      title: "Orbit",
      description:
        "The full stack wired up — auth, billing, emails, the works. Skip the boring week.",
      cta: "TRY THE STARTER",
      href: "# dashboards",
      accent: "amber",
      accentHex: "#f59e0b"
    },
    {
      id: "cal",
      badge: "SCHEDULING",
      title: "Cal.com",
      description:
        "Scheduling infrastructure for teams. The day job — book meetings without the back-and-forth.",
      cta: "BOOK A TIME",
      href: "# calendars",
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
      id: "forms",
      title: "Forms",
      description: "Settings, invites, preferences, API keys.",
      accent: "#10b981",
      items: [
        { slug: "workspace-settings", title: "Workspace settings", file: "workspace-settings.tsx", wip: false, tags: ["general", "slug", "avatar", "danger-zone"] },
        { slug: "invite-teammates", title: "Invite teammates", file: "invite-teammates.tsx", wip: false, tags: ["emails", "roles", "multi-row", "Seat"] },
        { slug: "notifications", title: "Notification preferences", file: "notifications.tsx", wip: false, tags: ["toggles", "matrix", "channels", "digest"] },
        { slug: "api-key", title: "Create API key", file: "api-key.tsx", wip: false, tags: ["scopes", "permissions", "expiration", "secret"] }
      ]
    },
    {
      id: "auth",
      title: "Auth & Onboarding",
      description: "Sign-in, magic-link, OAuth, waitlist.",
      accent: "#8b5cf6",
      items: [
        { slug: "login", title: "Login", file: "login.tsx", wip: false, tags: ["oauth", "password", "session"] },
        { slug: "onboarding", title: "Onboarding", file: "onboarding.tsx", wip: false, tags: ["stepper", "wizard", "setup"] },
        { slug: "waitlist", title: "Waitlist landing", file: "waitlist.tsx", wip: false, tags: ["early-access", "counter", "referral"] },
        { slug: "check-email", title: "Check your email", file: "check-email.tsx", wip: false, tags: ["verification", "inbox", "resend"] },
        { slug: "inset-login", title: "Inset login", file: "inset-login.tsx", wip: false, tags: ["card", "framed", "testimonial"] },
        { slug: "centered-signin", title: "Centered signin", file: "centered-signin.tsx", wip: false, tags: ["minimal", "sso", "centered"] },
        { slug: "centered-signup", title: "Centered signup", file: "centered-signup.tsx", wip: false, tags: ["registration", "strength-meter", "terms"] },
        { slug: "left-signin", title: "Left signin", file: "left-signin.tsx", wip: false, tags: ["split-screen", "artwork", "brand"] },
        { slug: "right-signin", title: "Right signin", file: "right-signin.tsx", wip: true, tags: ["split-screen", "reversed", "preview"] },
        { slug: "glass-signup", title: "Glass signup", file: "glass-signup.tsx", wip: true, tags: ["frosted", "backdrop", "shader"] },
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
      items: [
        { slug: "metrics-overview", title: "Metrics overview", file: "metrics-overview.tsx", wip: false, tags: ["kpi", "sparklines", "deltas", "executive"] },
        { slug: "usage", title: "Plan usage", file: "usage.tsx", wip: false, tags: ["quotas", "meters", "bandwidth", "compute"] },
        { slug: "analytics", title: "Analytics", file: "analytics.tsx", wip: false, tags: ["traffic", "referrers", "countries", "visitors"] },
        { slug: "home", title: "Personal home", file: "home.tsx", wip: false, tags: ["greeting", "recents", "tasks", "inbox"] },
        { slug: "revenue", title: "Revenue", file: "revenue.tsx", wip: true, tags: ["mrr", "arr", "churn", "net-retention"] },
        { slug: "services", title: "Service health", file: "services.tsx", wip: true, tags: ["uptime", "latency", "clusters", "incidents"] },
        { slug: "engineering", title: "Engineering velocity", file: "engineering.tsx", wip: true, tags: ["cycle-time", "Throughput", "deploys", "prs"] },
        { slug: "support", title: "Support queue", file: "support.tsx", wip: true, tags: ["sla", "tickets", "csat", "response-time"] },
        { slug: "market", title: "Markets", file: "market.tsx", wip: true, tags: ["tickers", "orderbook", "candlesticks", "portfolio"] }
      ]
    },
    {
      id: "tables",
      title: "Tables",
      description: "Sortable rows, density, bulk actions.",
      accent: "#06b6d4",
      items: [
        { slug: "invoices", title: "Invoices", file: "invoices.tsx", wip: false, tags: ["billing", "status", "pdf", "sortable"] },
        { slug: "members", title: "Team members", file: "members.tsx", wip: true, tags: ["avatars", "roles", "2fa-status", "last-seen"] },
        { slug: "orders", title: "Orders", file: "orders.tsx", wip: false, tags: ["ecommerce", "fulfillment", "customer", "total"] },
        { slug: "logs", title: "Server logs", file: "logs.tsx", wip: false, tags: ["monospace", "tail", "severity", "latency"] },
        { slug: "api-keys", title: "API keys", file: "api-keys.tsx", wip: true, tags: ["tokens", "masked", "usage", "revoke"] },
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
      items: [
        { slug: "toolbar", title: "Filter toolbar", file: "toolbar.tsx", wip: false, tags: ["search", "sort", "group-by", "display"] },
        { slug: "faceted", title: "Faceted popover", file: "faceted.tsx", wip: false, tags: ["multi-select", "counts", "checkboxes", "combobox"] },
        { slug: "chips", title: "Active filter chips", file: "chips.tsx", wip: false, tags: ["operators", "is-any-of", "removable", "tokens"] },
        { slug: "sidebar", title: "Filter sidebar", file: "sidebar.tsx", wip: true, tags: ["accordions", "price-range", "facets", "attributes"] }
      ]
    },
    {
      id: "empty-states",
      title: "Empty states",
      description: "First-run, zero-data, end-of-list.",
      accent: "#a855f7",
      items: [
        { slug: "inbox-zero", title: "Inbox zero", file: "inbox-zero.tsx", wip: false, tags: ["zen", "all-caught-up", "shortcut"] },
        { slug: "no-results", title: "No results", file: "no-results.tsx", wip: false, tags: ["search", "clear-filters", "suggestions"] },
        { slug: "first-project", title: "First project", file: "first-project.tsx", wip: false, tags: ["onboarding", "templates", "cta"] },
        { slug: "end-of-feed", title: "End of feed", file: "end-of-feed.tsx", wip: false, tags: ["pagination", "archive", "milestone"] },
        { slug: "no-team", title: "No teammates", file: "no-team.tsx", wip: true, tags: ["collaboration", "invite", "avatars"] },
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
      items: [
        { slug: "profile", title: "Profile", file: "profile.tsx", wip: false, tags: ["avatar", "bio", "handle", "timezone"] },
        { slug: "appearance", title: "Appearance", file: "appearance.tsx", wip: true, tags: ["theme", "density", "accent-color", "font"] },
        { slug: "billing", title: "Billing", file: "billing.tsx", wip: false, tags: ["plan", "payment-method", "invoices", "seats"] },
        { slug: "integrations", title: "Integrations", file: "integrations.tsx", wip: true, tags: ["github", "slack", "linear", "oauth"] },
        { slug: "security", title: "Security", file: "security.tsx", wip: false, tags: ["sessions", "devices", "passkeys", "2fa"] },
        { slug: "permissions", title: "Roles & permissions", file: "permissions.tsx", wip: true, tags: ["rbac", "matrix", "admin", "scopes"] },
        { slug: "branding", title: "Workspace branding", file: "branding.tsx", wip: false, tags: ["logo", "custom-domain", "colors", "whitelabel"] },
        { slug: "localization", title: "Localization", file: "localization.tsx", wip: false, tags: ["language", "date-format", "currency", "region"] },
        { slug: "webhooks", title: "Webhooks", file: "webhooks.tsx", wip: false, tags: ["endpoints", "events", "signing-secret", "deliveries"] },
        { slug: "privacy", title: "Privacy & data", file: "privacy.tsx", wip: false, tags: ["gdpr", "export", "retention", "telemetry"] },
        { slug: "developer", title: "Developer", file: "developer.tsx", wip: false, tags: ["sdk", "sandbox-mode", "rate-limits", "logs"] },
        { slug: "sso", title: "Single sign-on", file: "sso.tsx", wip: true, tags: ["saml", "oidc", "scim", "domain-verification"] }
      ]
    },
    {
      id: "cards",
      title: "Cards",
      description: "Stat tiles, list items, surface containers.",
      accent: "#14b8a6",
      items: [
        { slug: "stat-tile", title: "Stat tile", file: "stat-tile.tsx", wip: false, tags: ["metric", "delta", "sparkline"] },
        { slug: "profile", title: "Profile card", file: "profile.tsx", wip: true, tags: ["user", "badges", "follow", "stats"] },
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
      items: [
        { slug: "confirm-delete", title: "Confirm delete", file: "confirm-delete.tsx", wip: false, tags: ["destructive", "type-to-confirm", "warning"] },
        { slug: "share-link", title: "Share link", file: "share-link.tsx", wip: false, tags: ["permissions", "copy-link", "invite"] },
        { slug: "upload-files", title: "Upload files", file: "upload-files.tsx", wip: false, tags: ["drag-drop", "progress", "queue"] },
        { slug: "command-palette", title: "Command palette", file: "command-palette.tsx", wip: false, tags: ["cmdk", "fuzzy", "shortcuts"] },
        { slug: "feedback", title: "Feedback", file: "feedback.tsx", wip: true, tags: ["sentiment", "screenshot", "bug-report"] },
        { slug: "shortcuts", title: "Keyboard shortcuts", file: "shortcuts.tsx", wip: false, tags: ["hotkeys", "cheatsheet", "keycaps"] },
        { slug: "upgrade", title: "Upgrade plan", file: "upgrade.tsx", wip: false, tags: ["upsell", "Unlock", "comparison"] },
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
      items: [
        { slug: "revenue-area", title: "Revenue area", file: "revenue-area.tsx", wip: false, tags: ["gradient", "crosshair", "mrr", "svg"] },
        { slug: "cohort-heatmap", title: "Cohort heatmap", file: "cohort-heatmap.tsx", wip: false, tags: ["retention", "matrix", "cells", "percentage"] },
        { slug: "funnel", title: "Funnel", file: "funnel.tsx", wip: false, tags: ["conversion", "dropoff", "stages"] },
        { slug: "gauges", title: "Radial gauges", file: "gauges.tsx", wip: false, tags: ["arc", "cpu", "memory", "apdex"] },
        { slug: "bar-grouped", title: "Grouped bars", file: "bar-grouped.tsx", wip: false, tags: ["comparison", "quarters", "legend"] },
        { slug: "line-multi", title: "Multi-series line", file: "line-multi.tsx", wip: false, tags: ["latency", "p50-p95-p99", "interpolation"] },
        { slug: "donut", title: "Donut breakdown", file: "donut.tsx", wip: false, tags: ["segments", " allocation", "ring"] },
        { slug: "scatter", title: "Scatter plot", file: "scatter.tsx", wip: true, tags: ["clusters", "correlation", "quadrants"] },
        { slug: "waterfall", title: "Waterfall", file: "waterfall.tsx", wip: true, tags: ["cashflow", "bridge", "variance"] }
      ]
    },
    {
      id: "timelines",
      title: "Timelines",
      description: "Audit trails, changelogs, deploys, status, mentions.",
      accent: "#eab308",
      items: [
        { slug: "audit", title: "Audit trail", file: "audit.tsx", wip: false, tags: ["events", "actors", "chronological"] },
        { slug: "notifications", title: "Notifications panel", file: "notifications.tsx", wip: false, tags: ["unread", "mentions", "tabs"] },
        { slug: "changelog", title: "Changelog", file: "changelog.tsx", wip: false, tags: ["releases", "semver", "badges"] },
        { slug: "commits", title: "Commit history", file: "commits.tsx", wip: false, tags: ["git", "sha", "branch", "verified"] },
        { slug: "approvals", title: "Approvals", file: "approvals.tsx", wip: false, tags: ["workflow", "reviewers", "sign-off"] },
        { slug: "pull-request", title: "Pull request", file: "pull-request.tsx", wip: true, tags: ["checks", "diff", "merge", "conversation"] },
        { slug: "pr-ops-console", title: "PR ops console", file: "pr-ops-console.tsx", wip: true, tags: ["ci-cd", "pipeline", "bot", "deployment"] },
        { slug: "releases", title: "Release timeline", file: "releases.tsx", wip: true, tags: ["tags", "artifacts", "rollback"] },
        { slug: "status-page", title: "Status page", file: "status-page.tsx", wip: true, tags: ["90-day-bars", "uptime", "incidents"] },
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
      items: [
        { slug: "hero", title: "Profile hero", file: "hero.tsx", wip: false, tags: ["banner", "avatar", "contributions", "links"] },
        { slug: "hover-card", title: "Hover card", file: "hover-card.tsx", wip: true, tags: ["popover", "mutuals", "quick-follow"] },
        { slug: "team-grid", title: "Team grid", file: "team-grid.tsx", wip: false, tags: ["departments", "cards", "org"] },
        { slug: "directory", title: "Contact directory", file: "directory.tsx", wip: false, tags: ["alphabetical", "search", "split"] },
        { slug: "compact-card", title: "Compact user card", file: "compact-card.tsx", wip: false, tags: ["inline", "status", "role"] },
        { slug: "org-chart", title: "Org chart", file: "org-chart.tsx", wip: true, tags: ["tree", "reporting-lines", "nodes"] },
        { slug: "skills", title: "Skills matrix", file: "skills.tsx", wip: false, tags: ["proficiency", "endorsements", "radar"] },
        { slug: "presence-rail", title: "Presence rail", file: "presence-rail.tsx", wip: true, tags: ["online", "voice-room", "status"] },
        { slug: "introductions", title: "Suggested intros", file: "introductions.tsx", wip: false, tags: ["network", "connect", "mutual"] },
        { slug: "credentials", title: "Security credentials", file: "credentials.tsx", wip: false, tags: ["gpg", "ssh-keys", "certificates"] }
      ]
    },
    {
      id: "toasts",
      title: "Toasts & banners",
      description: "Ephemeral feedback — confirmation, errors, undos, progress.",
      accent: "#f97316",
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
      items: [
        { slug: "welcome-carousel", title: "Welcome carousel", file: "welcome-carousel.tsx", wip: false, tags: ["slides", "dots", "whats-new"] },
        { slug: "spotlight", title: "Spotlight tour", file: "spotlight.tsx", wip: true, tags: ["mask", "cutout", "step-counter"] },
        { slug: "arrow-tooltip", title: "Arrow tooltip", file: "arrow-tooltip.tsx", wip: true, tags: ["coachmark", "pointer", "dismiss"] },
        { slug: "beacon", title: "Beacon hint", file: "beacon.tsx", wip: true, tags: ["pulse", "hotspot", "feature-discovery"] },
        { slug: "inline-hint", title: "Inline hint", file: "inline-hint.tsx", wip: false, tags: ["callout", "pro-tip", "contextual"] },
        { slug: "checklist", title: "Onboarding checklist", file: "checklist.tsx", wip: false, tags: ["progress-ring", "steps", "reward"] }
      ]
    },
    {
      id: "threads",
      title: "Threads & comments",
      description: "Inline threads, side panels, reactions, mention popovers.",
      accent: "#fb7185",
      items: [
        { slug: "inline-thread", title: "Inline thread", file: "inline-thread.tsx", wip: false, tags: ["nested", "connectors", "collapse"] },
        { slug: "side-panel", title: "Side panel", file: "side-panel.tsx", wip: false, tags: ["document-comments", "anchors", "drawer"] },
        { slug: "comment-row", title: "Comment row", file: "comment-row.tsx", wip: false, tags: ["reactions", "timestamp", "markdown"] },
        { slug: "mention-popover", title: "@mention popover", file: "mention-popover.tsx", wip: false, tags: ["autocomplete", "users", "Caret"] },
        { slug: "resolved", title: "Resolved thread", file: "resolved.tsx", wip: false, tags: ["summary", "reopen", "audit"] },
        { slug: "compose-rich", title: "Rich composer", file: "compose-rich.tsx", wip: false, tags: ["formatting", "attachments", "preview-tab"] }
      ]
    }
  ]
};

// Flatten helper for O(1) lookup and sequential navigation
window.DEVL_FLAT_ITEMS = [];
window.DEVL_DATA.categories.forEach((cat, catIdx) => {
  cat.items.forEach((item, itemIdx) => {
    const flatItem = {
      ...item,
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
