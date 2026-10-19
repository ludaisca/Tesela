// Tesela UI — preset de Tailwind (generado por scripts/build-tokens.js; no editar a mano).
// Uso: presets: [require("tesela-ui/tokens/tailwind.preset.cjs")]  →  bg-tsl-bg, text-tsl-fg, rounded-tsl, shadow-tsl-lg…
// Los colores usan variables CSS, así que cambian solos con el modo (data-theme) y el preset (data-preset).
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "tsl": {
          "bg": "var(--tsl-bg)",
          "bg-elevated": "var(--tsl-bg-elevated)",
          "bg-glass": "var(--tsl-bg-glass)",
          "surface": "var(--tsl-surface)",
          "surface-hover": "var(--tsl-surface-hover)",
          "surface-strong": "var(--tsl-surface-strong)",
          "fg": "var(--tsl-fg)",
          "fg-muted": "var(--tsl-fg-muted)",
          "fg-subtle": "var(--tsl-fg-subtle)",
          "border": "var(--tsl-border)",
          "border-strong": "var(--tsl-border-strong)",
          "backdrop": "var(--tsl-backdrop)",
          "accent": "var(--tsl-accent)",
          "accent-fg": "var(--tsl-accent-fg)",
          "success": "var(--tsl-success)",
          "warning": "var(--tsl-warning)",
          "danger": "var(--tsl-danger)",
          "danger-fg": "var(--tsl-danger-fg)",
          "info": "var(--tsl-info)",
          "chart-1": "var(--tsl-chart-1)",
          "chart-2": "var(--tsl-chart-2)",
          "chart-3": "var(--tsl-chart-3)",
          "chart-4": "var(--tsl-chart-4)",
          "chart-5": "var(--tsl-chart-5)",
          "chart-6": "var(--tsl-chart-6)",
          "chart-7": "var(--tsl-chart-7)",
          "chart-8": "var(--tsl-chart-8)"
        }
      },
      "borderRadius": {
        "tsl": "var(--tsl-radius)",
        "tsl-sm": "var(--tsl-radius-sm)",
        "tsl-xs": "var(--tsl-radius-xs)"
      },
      "boxShadow": {
        "tsl": "var(--tsl-shadow)",
        "tsl-lg": "var(--tsl-shadow-lg)",
        "tsl-ring": "var(--tsl-ring)"
      },
      "fontFamily": {
        "tsl-mono": [
          "var(--tsl-font-mono)"
        ],
        "tsl-sans": [
          "var(--tsl-font-sans)"
        ],
        "tsl-heading": [
          "var(--tsl-font-heading)"
        ]
      },
      "transitionTimingFunction": {
        "tsl": "var(--tsl-ease)"
      }
    }
  }
};
