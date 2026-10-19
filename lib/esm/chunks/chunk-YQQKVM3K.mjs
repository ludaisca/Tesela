/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  contrast,
  parseHex,
  toHex
} from "./chunk-HP2KEPMO.mjs";
import {
  emit,
  storage
} from "./chunk-KUBYC2WE.mjs";

// src/tokens/presets.json
var presets_default = {
  $description: "Presets de tema de Tesela UI. Cada preset sobrescribe tokens de tokens.json: «common» en ambos modos, «dark» y «light» solo en ese modo. Las claves son rutas de token (color.accent → --tsl-accent).",
  presets: {
    tesela: {
      label: "Tesela",
      description: "El tema por defecto: neutro y sobrio, con acento índigo."
    },
    esmeralda: {
      label: "Esmeralda",
      description: "Acento verde esmeralda.",
      dark: {
        "color.accent": "#10b981",
        "color.accent-fg": "#04130d"
      },
      light: {
        "color.accent": "#047857",
        "color.accent-fg": "#ffffff"
      }
    },
    ambar: {
      label: "Ámbar",
      description: "Acento ámbar cálido.",
      dark: {
        "color.accent": "#f59e0b",
        "color.accent-fg": "#1a1103"
      },
      light: {
        "color.accent": "#b45309",
        "color.accent-fg": "#ffffff"
      }
    },
    cielo: {
      label: "Cielo",
      description: "Acento azul cielo.",
      dark: {
        "color.accent": "#0ea5e9",
        "color.accent-fg": "#031a28"
      },
      light: {
        "color.accent": "#0369a1",
        "color.accent-fg": "#ffffff"
      }
    },
    rosa: {
      label: "Rosa",
      description: "Acento rosa.",
      dark: {
        "color.accent": "#f472b6",
        "color.accent-fg": "#2b0617"
      },
      light: {
        "color.accent": "#be185d",
        "color.accent-fg": "#ffffff"
      }
    },
    violeta: {
      label: "Violeta",
      description: "Acento violeta.",
      dark: {
        "color.accent": "#a78bfa",
        "color.accent-fg": "#1b1040"
      },
      light: {
        "color.accent": "#6d28d9",
        "color.accent-fg": "#ffffff"
      }
    },
    medianoche: {
      label: "Medianoche",
      description: "Azul profundo de noche; en claro, un azul hielo.",
      dark: {
        "color.bg": "#0b1020",
        "color.bg-elevated": "#121a30",
        "color.bg-glass": "rgba(11, 16, 32, 0.84)",
        "color.surface": "rgba(148, 163, 255, 0.05)",
        "color.surface-hover": "rgba(148, 163, 255, 0.085)",
        "color.surface-strong": "rgba(148, 163, 255, 0.13)",
        "color.fg": "#e8edff",
        "color.fg-muted": "#9aa8cc",
        "color.fg-subtle": "#7482aa",
        "color.border": "rgba(148, 163, 255, 0.14)",
        "color.border-strong": "rgba(148, 163, 255, 0.32)",
        "color.backdrop": "rgba(3, 6, 16, 0.66)",
        "color.accent": "#7c9cff",
        "color.accent-fg": "#07102a",
        "shadow.default": "0 1px 2px rgba(2, 5, 18, 0.6), 0 10px 26px -12px rgba(2, 5, 18, 0.8)",
        "shadow.lg": "0 4px 12px rgba(2, 5, 18, 0.65), 0 20px 38px -12px rgba(2, 5, 18, 0.9)"
      },
      light: {
        "color.bg": "#f3f6fd",
        "color.bg-elevated": "#ffffff",
        "color.bg-glass": "rgba(243, 246, 253, 0.86)",
        "color.surface": "rgba(15, 27, 61, 0.03)",
        "color.surface-hover": "rgba(15, 27, 61, 0.055)",
        "color.surface-strong": "rgba(15, 27, 61, 0.085)",
        "color.fg": "#0f1b3d",
        "color.fg-muted": "#4a5b86",
        "color.fg-subtle": "#7482aa",
        "color.border": "rgba(15, 27, 61, 0.12)",
        "color.border-strong": "rgba(15, 27, 61, 0.3)",
        "color.backdrop": "rgba(15, 27, 61, 0.3)",
        "color.accent": "#2f54eb",
        "color.accent-fg": "#ffffff",
        "color.success": "#047052",
        "color.warning": "#9f4908",
        "color.danger": "#bd123c",
        "color.info": "#03679f"
      }
    },
    papel: {
      label: "Papel",
      description: "Tonos de papel y tinta, con títulos en serif y esquinas casi rectas.",
      common: {
        "radius.default": "4px",
        "radius.sm": "3px",
        "radius.xs": "2px",
        "font.heading": 'Georgia, "Times New Roman", serif'
      },
      dark: {
        "color.bg": "#1b1713",
        "color.bg-elevated": "#241f19",
        "color.bg-glass": "rgba(27, 23, 19, 0.86)",
        "color.surface": "rgba(255, 244, 224, 0.035)",
        "color.surface-hover": "rgba(255, 244, 224, 0.06)",
        "color.surface-strong": "rgba(255, 244, 224, 0.09)",
        "color.fg": "#f1e9d8",
        "color.fg-muted": "#a89c88",
        "color.fg-subtle": "#7d7261",
        "color.border": "rgba(255, 244, 224, 0.11)",
        "color.border-strong": "rgba(255, 244, 224, 0.26)",
        "color.backdrop": "rgba(10, 8, 5, 0.62)",
        "color.accent": "#e0a458",
        "color.accent-fg": "#1d1306",
        "color.danger": "#f6546f"
      },
      light: {
        "color.bg": "#f5efe4",
        "color.bg-elevated": "#fffaf0",
        "color.bg-glass": "rgba(245, 239, 228, 0.88)",
        "color.surface": "rgba(43, 36, 27, 0.03)",
        "color.surface-hover": "rgba(43, 36, 27, 0.055)",
        "color.surface-strong": "rgba(43, 36, 27, 0.085)",
        "color.fg": "#2b241b",
        "color.fg-muted": "#665a49",
        "color.fg-subtle": "#85796a",
        "color.border": "rgba(43, 36, 27, 0.14)",
        "color.border-strong": "rgba(43, 36, 27, 0.34)",
        "color.backdrop": "rgba(43, 36, 27, 0.3)",
        "color.accent": "#a4470a",
        "color.accent-fg": "#ffffff",
        "color.success": "#046c4f",
        "color.warning": "#9a4708",
        "color.danger": "#b7113a",
        "color.info": "#036399"
      }
    },
    "alto-contraste": {
      label: "Alto contraste",
      description: "Máximo contraste (AAA) y bordes marcados, para baja visión y luz intensa.",
      dark: {
        "color.bg": "#000000",
        "color.bg-elevated": "#0a0a0a",
        "color.bg-glass": "rgba(0, 0, 0, 0.92)",
        "color.surface": "rgba(255, 255, 255, 0.08)",
        "color.surface-hover": "rgba(255, 255, 255, 0.16)",
        "color.surface-strong": "rgba(255, 255, 255, 0.24)",
        "color.fg": "#ffffff",
        "color.fg-muted": "#d4d4d4",
        "color.fg-subtle": "#a8a8a8",
        "color.border": "rgba(255, 255, 255, 0.55)",
        "color.border-strong": "#ffffff",
        "color.backdrop": "rgba(0, 0, 0, 0.8)",
        "color.accent": "#ffd60a",
        "color.accent-fg": "#000000",
        "color.success": "#4ade80",
        "color.warning": "#fde047",
        "color.danger": "#ff7b7b",
        "color.info": "#7dd3fc"
      },
      light: {
        "color.bg": "#ffffff",
        "color.bg-elevated": "#ffffff",
        "color.bg-glass": "rgba(255, 255, 255, 0.94)",
        "color.surface": "rgba(0, 0, 0, 0.06)",
        "color.surface-hover": "rgba(0, 0, 0, 0.12)",
        "color.surface-strong": "rgba(0, 0, 0, 0.2)",
        "color.fg": "#000000",
        "color.fg-muted": "#383838",
        "color.fg-subtle": "#595959",
        "color.border": "rgba(0, 0, 0, 0.6)",
        "color.border-strong": "#000000",
        "color.backdrop": "rgba(0, 0, 0, 0.6)",
        "color.accent": "#0000cc",
        "color.accent-fg": "#ffffff",
        "color.success": "#005500",
        "color.warning": "#694000",
        "color.danger": "#91001a",
        "color.info": "#00478f"
      }
    },
    brutalista: {
      label: "Brutalista",
      description: "Esquinas rectas, bordes duros y sombras sin desenfoque.",
      common: {
        "radius.default": "0px",
        "radius.sm": "0px",
        "radius.xs": "0px",
        "shadow.default": "4px 4px 0 var(--tsl-border-strong)",
        "shadow.lg": "6px 6px 0 var(--tsl-border-strong)",
        "font.heading": 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
      },
      dark: {
        "color.border": "rgba(255, 255, 255, 0.4)",
        "color.border-strong": "#ffffff",
        "color.accent": "#ff6b3d",
        "color.accent-fg": "#150500"
      },
      light: {
        "color.border": "rgba(0, 0, 0, 0.55)",
        "color.border-strong": "#000000",
        "color.accent": "#c2410c",
        "color.accent-fg": "#ffffff"
      }
    },
    suave: {
      label: "Suave",
      description: "Esquinas muy redondeadas y sombras difusas.",
      common: {
        "radius.default": "16px",
        "radius.sm": "12px",
        "radius.xs": "8px"
      },
      dark: {
        "color.accent": "#8b8dfb",
        "color.accent-fg": "#0d0e33",
        "shadow.default": "0 2px 6px rgba(0, 0, 0, 0.3), 0 14px 32px -14px rgba(0, 0, 0, 0.55)",
        "shadow.lg": "0 6px 16px rgba(0, 0, 0, 0.35), 0 26px 50px -16px rgba(0, 0, 0, 0.65)"
      },
      light: {
        "color.bg": "#f4f4f9",
        "color.accent": "#5b5bd6",
        "color.accent-fg": "#ffffff",
        "shadow.default": "0 2px 6px rgba(30, 30, 80, 0.06), 0 14px 32px -14px rgba(30, 30, 80, 0.18)",
        "shadow.lg": "0 6px 16px rgba(30, 30, 80, 0.1), 0 26px 50px -16px rgba(30, 30, 80, 0.28)",
        "color.success": "#046f51",
        "color.warning": "#9e4908",
        "color.danger": "#bc123b",
        "color.info": "#03669e"
      }
    }
  }
};

// src/api/theme.js
var THEME_KEY = "tsl-theme";
var PRESET_KEY = "tsl-preset";
var ACCENT_KEY = "tsl-accent";
var ACCENT_FG_KEY = "tsl-accent-fg";
var DIR_KEY = "tsl-dir";
var THEMES = ["dark", "light", "system"];
var root = () => document.documentElement;
var lightQuery = () => typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
var presets = Object.entries(presets_default.presets).map(([name, p]) => ({ name, label: p.label, description: p.description }));
function getTheme() {
  const t = root().getAttribute("data-theme");
  return THEMES.includes(t) ? t : "dark";
}
function getResolvedTheme() {
  const t = getTheme();
  if (t !== "system") return t;
  const q = lightQuery();
  return q && q.matches ? "light" : "dark";
}
function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "dark";
  root().setAttribute("data-theme", next);
  storage.set(THEME_KEY, next);
  emit(document, "tsl-theme", { theme: next, resolved: getResolvedTheme() });
  return next;
}
function getPreset() {
  const p = root().getAttribute("data-preset");
  return presets.some((x) => x.name === p) ? p : presets[0].name;
}
function setPreset(name) {
  if (!presets.some((p) => p.name === name)) return getPreset();
  if (name === presets[0].name) root().removeAttribute("data-preset");
  else root().setAttribute("data-preset", name);
  storage.set(PRESET_KEY, name);
  emit(document, "tsl-preset", { preset: name });
  return name;
}
function setAccent(color) {
  const style = root().style;
  if (color === null || color === void 0) {
    style.removeProperty("--tsl-accent");
    style.removeProperty("--tsl-accent-fg");
    storage.set(ACCENT_KEY, "");
    storage.set(ACCENT_FG_KEY, "");
    emit(document, "tsl-accent", { accent: null, fg: null });
    return null;
  }
  const c = parseHex(color);
  if (!c) return null;
  const white = { r: 255, g: 255, b: 255 };
  const ink = { r: 11, g: 11, b: 12 };
  const fg = contrast(c, white) >= contrast(c, ink) ? toHex(255, 255, 255) : toHex(11, 11, 12);
  const accent = toHex(c.r, c.g, c.b);
  style.setProperty("--tsl-accent", accent);
  style.setProperty("--tsl-accent-fg", fg);
  storage.set(ACCENT_KEY, accent);
  storage.set(ACCENT_FG_KEY, fg);
  emit(document, "tsl-accent", { accent, fg });
  return fg;
}
function getDirection() {
  return root().getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}
function setDirection(dir) {
  const next = dir === "rtl" ? "rtl" : "ltr";
  root().setAttribute("dir", next);
  storage.set(DIR_KEY, next);
  emit(document, "tsl-direction", { direction: next });
  return next;
}
var storedDir = storage.get(DIR_KEY);
if (storedDir === "rtl" || storedDir === "ltr") root().setAttribute("dir", storedDir);
var storedTheme = storage.get(THEME_KEY);
if (THEMES.includes(storedTheme)) root().setAttribute("data-theme", storedTheme);
var storedPreset = storage.get(PRESET_KEY);
if (presets.some((p) => p.name === storedPreset) && storedPreset !== presets[0].name) root().setAttribute("data-preset", storedPreset);
var storedAccent = storage.get(ACCENT_KEY);
if (storedAccent) setAccent(storedAccent);
var query = lightQuery();
if (query && query.addEventListener) {
  query.addEventListener("change", () => {
    if (getTheme() === "system") emit(document, "tsl-theme", { theme: "system", resolved: getResolvedTheme() });
  });
}

export {
  presets,
  getTheme,
  getResolvedTheme,
  setTheme,
  getPreset,
  setPreset,
  setAccent,
  getDirection,
  setDirection
};
