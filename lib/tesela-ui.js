/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
(() => {
  // src/core/base.js
  var VERSION = "1.4.0";
  var uid = 0;
  var nextId = (prefix) => `${prefix}-${++uid}`;
  var emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  var storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_) {
      }
    }
  };
  var TslElement = class extends HTMLElement {
    connectedCallback() {
      if (this._tslReady) return;
      const go = () => {
        if (this._tslReady || !this.isConnected) return;
        this._tslReady = true;
        this.setup();
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", go, { once: true });
      } else {
        go();
      }
    }
    setup() {
    }
  };
  var define = (name, ctor) => {
    if (!customElements.get(name)) customElements.define(name, ctor);
  };
  function moveFocus(items, current, key, { horizontal = false } = {}) {
    const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    const idx = items.indexOf(current);
    let next = null;
    if (key === nextKey) next = items[(idx + 1) % items.length];
    else if (key === prevKey) next = items[(idx - 1 + items.length) % items.length];
    else if (key === "Home") next = items[0];
    else if (key === "End") next = items[items.length - 1];
    return next;
  }
  var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  var normalize = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  var pad = (n) => String(n).padStart(2, "0");
  var toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  var fromISO = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  var liveRegion = null;
  function announce(text) {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "tsl-sr-only";
      liveRegion.setAttribute("aria-live", "assertive");
      liveRegion.setAttribute("role", "status");
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = "";
    setTimeout(() => liveRegion.textContent = text, 20);
  }

  // src/core/color.js
  var hsv2rgb = (h, s, v) => {
    const f = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    };
    return [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
  };
  var rgb2hsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const d = max - Math.min(r, g, b);
    let h = 0;
    if (d) {
      if (max === r) h = (g - b) / d % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return [h, max ? d / max : 0, max];
  };
  var toHex = (r, g, b, a = 1) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : ""}`;
  function parseHex(str) {
    const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(String(str).trim());
    if (!m) return null;
    let h = m[1];
    if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  function luminance({ r, g, b }) {
    const lin = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

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
  function setAccent(color2) {
    const style = root().style;
    if (color2 === null || color2 === void 0) {
      style.removeProperty("--tsl-accent");
      style.removeProperty("--tsl-accent-fg");
      storage.set(ACCENT_KEY, "");
      storage.set(ACCENT_FG_KEY, "");
      emit(document, "tsl-accent", { accent: null, fg: null });
      return null;
    }
    const c = parseHex(color2);
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

  // src/api/toast.js
  function toastRegion() {
    let region = document.querySelector(".tsl-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "tsl-toast-region";
      region.setAttribute("role", "region");
      region.setAttribute("aria-label", "Notificaciones");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }
  function toast(options) {
    const opts = typeof options === "string" ? { title: options } : options || {};
    const { title = "", description = "", variant = "success", duration = 3200, action } = opts;
    const el = document.createElement("div");
    el.className = `tsl-toast tsl-toast--${variant}`;
    el.setAttribute("role", variant === "danger" ? "alert" : "status");
    const body = document.createElement("div");
    body.className = "tsl-toast__body";
    if (title) {
      const t = document.createElement("div");
      t.className = "tsl-toast__title";
      t.textContent = title;
      body.appendChild(t);
    }
    if (description) {
      const d = document.createElement("div");
      d.className = "tsl-toast__desc";
      d.textContent = description;
      body.appendChild(d);
    }
    el.appendChild(body);
    let timer = 0;
    const dismiss = () => {
      clearTimeout(timer);
      if (!el.isConnected || el.classList.contains("is-leaving")) return;
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 220);
    };
    if (action && action.label) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tsl-btn tsl-btn--sm tsl-toast__action";
      btn.textContent = action.label;
      btn.addEventListener("click", () => {
        if (typeof action.onClick === "function") action.onClick();
        dismiss();
      });
      el.appendChild(btn);
    }
    const close = document.createElement("button");
    close.type = "button";
    close.className = "tsl-toast__close";
    close.setAttribute("aria-label", "Cerrar");
    close.textContent = "✕";
    close.addEventListener("click", dismiss);
    el.appendChild(close);
    toastRegion().appendChild(el);
    if (duration > 0) {
      const arm = () => timer = setTimeout(dismiss, duration);
      el.addEventListener("pointerenter", () => clearTimeout(timer));
      el.addEventListener("pointerleave", arm);
      arm();
    }
    return dismiss;
  }

  // src/api/clipboard.js
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (_2) {
      }
      ta.remove();
      return ok;
    }
  }

  // src/api/confirm.js
  function confirmDialog(options) {
    const o = typeof options === "string" ? { title: options } : options || {};
    const { title = "¿Estás seguro?", description = "", confirmLabel = "Aceptar", cancelLabel = "Cancelar", variant = "default" } = o;
    return new Promise((resolve) => {
      const dialog = document.createElement("dialog");
      dialog.className = "tsl-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("data-tsl-static", "");
      const titleId = nextId("tsl-alert-title");
      dialog.setAttribute("aria-labelledby", titleId);
      const header = document.createElement("div");
      header.className = "tsl-dialog__header";
      const h = document.createElement("h2");
      h.className = "tsl-dialog__title";
      h.id = titleId;
      h.textContent = title;
      header.appendChild(h);
      if (description) {
        const p = document.createElement("p");
        p.className = "tsl-dialog__desc";
        p.id = nextId("tsl-alert-desc");
        p.textContent = description;
        header.appendChild(p);
        dialog.setAttribute("aria-describedby", p.id);
      }
      const footer = document.createElement("div");
      footer.className = "tsl-dialog__footer";
      let cancelBtn = null;
      if (cancelLabel !== null) {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "tsl-btn";
        cancelBtn.textContent = cancelLabel;
        cancelBtn.addEventListener("click", () => dialog.close("cancel"));
        footer.appendChild(cancelBtn);
      }
      const okBtn = document.createElement("button");
      okBtn.type = "button";
      okBtn.className = `tsl-btn ${variant === "danger" ? "tsl-btn--danger" : "tsl-btn--primary"}`;
      okBtn.textContent = confirmLabel;
      okBtn.addEventListener("click", () => dialog.close("confirm"));
      footer.appendChild(okBtn);
      (variant === "danger" && cancelBtn ? cancelBtn : okBtn).setAttribute("autofocus", "");
      dialog.append(header, footer);
      dialog.addEventListener("close", () => {
        resolve(dialog.returnValue === "confirm");
        dialog.remove();
      });
      document.body.appendChild(dialog);
      dialog.showModal();
    });
  }

  // src/core/position.js
  var OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };
  function position(anchor, el, { placement = "bottom", offset = 6, padding = 8, point } = {}) {
    const a = point ? { left: point.x, right: point.x, top: point.y, bottom: point.y, width: 0, height: 0 } : anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    let [side, align = "center"] = placement.split("-");
    const fits = {
      top: a.top - offset - h >= padding,
      bottom: a.bottom + offset + h <= vh - padding,
      left: a.left - offset - w >= padding,
      right: a.right + offset + w <= vw - padding
    };
    if (!fits[side] && fits[OPPOSITE[side]]) side = OPPOSITE[side];
    let x;
    let y;
    if (side === "top" || side === "bottom") {
      y = side === "top" ? a.top - offset - h : a.bottom + offset;
      x = align === "start" ? a.left : align === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
    } else {
      x = side === "left" ? a.left - offset - w : a.right + offset;
      y = align === "start" ? a.top : align === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
    }
    x = Math.max(padding, Math.min(x, vw - w - padding));
    y = Math.max(padding, Math.min(y, vh - h - padding));
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    el.dataset.side = side;
    return side;
  }
  function trackPosition(anchor, el, options) {
    const update = () => position(anchor, el, options);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }
  var FOCUSABLE = "[autofocus], input:not([type=hidden]), select, textarea, button, a[href], [tabindex]:not([tabindex='-1'])";
  function focusFirst(container) {
    const target = container.querySelector(FOCUSABLE);
    if (target) target.focus();
    else {
      container.tabIndex = -1;
      container.focus();
    }
  }
  var isOpenPopover = (el) => el.matches(":popover-open");
  function dismissOnOutside(host, panel, close) {
    const outside = (e) => {
      if (!host.contains(e.target)) close();
    };
    const dismiss = (e) => {
      if (e.type === "scroll" && panel.contains(e.target)) return;
      close();
    };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", dismiss);
    };
  }

  // src/components/textarea.js
  function autosize(ta) {
    const cs = getComputedStyle(ta);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const pad2 = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const maxRows = parseInt(ta.dataset.maxRows || "0", 10);
    ta.style.height = "auto";
    const full = ta.scrollHeight + border;
    const cap = maxRows ? lh * maxRows + pad2 + border : Infinity;
    ta.style.height = `${Math.min(full, cap)}px`;
    ta.style.overflowY = full > cap ? "auto" : "hidden";
  }
  function countText(ta) {
    const out = ta.dataset.tslCount && document.querySelector(ta.dataset.tslCount);
    if (!out) return;
    const max = ta.maxLength > 0 ? ta.maxLength : 0;
    out.textContent = max ? `${ta.value.length} / ${max}` : String(ta.value.length);
    out.classList.toggle("is-over", Boolean(max) && ta.value.length >= max);
  }
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLTextAreaElement)) return;
    if (t.hasAttribute("data-tsl-autosize")) autosize(t);
    if (t.dataset.tslCount) countText(t);
  });

  // src/behaviors.js
  function syncRange(input) {
    const min = parseFloat(input.min || "0");
    const max = parseFloat(input.max || "100");
    const pct = (parseFloat(input.value) - min) / (max - min || 1) * 100;
    input.style.setProperty("--tsl-fill", `${pct}%`);
    const out = input.dataset.tslOutput && document.querySelector(input.dataset.tslOutput);
    if (out) out.textContent = input.value + (input.dataset.tslSuffix || "");
  }
  function sortTable(th) {
    const table = th.closest("table");
    const tbody = table && table.tBodies[0];
    if (!tbody) return;
    const col = Array.from(th.parentElement.children).indexOf(th);
    const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    th.parentElement.querySelectorAll("th[aria-sort]").forEach((h) => h.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", dir);
    const numeric = th.dataset.sort === "number";
    const read = (row) => {
      const cell = row.children[col];
      const raw = cell ? cell.dataset.value || cell.textContent.trim() : "";
      return numeric ? parseFloat(raw.replace(/[^0-9.-]/g, "")) || 0 : raw.toLowerCase();
    };
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
      const va = read(a);
      const vb = read(b);
      const cmp = numeric ? va - vb : va.localeCompare(vb);
      return dir === "ascending" ? cmp : -cmp;
    });
    rows.forEach((r) => tbody.appendChild(r));
  }
  function stepNumber(btn) {
    const wrap = btn.closest(".tsl-number");
    const input = wrap && wrap.querySelector("input");
    if (!input) return;
    const step = parseFloat(input.step || "1") * parseFloat(btn.dataset.step || "1");
    let next = (parseFloat(input.value) || 0) + step;
    if (input.min !== "") next = Math.max(parseFloat(input.min), next);
    if (input.max !== "") next = Math.min(parseFloat(input.max), next);
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const opener = t.closest("[data-tsl-open]");
    if (opener) {
      const target = document.getElementById(opener.dataset.tslOpen);
      if (target && typeof target.open === "function" && target.tagName === "TSL-COMMAND") target.open();
      else if (target && typeof target.showModal === "function") target.showModal();
      return;
    }
    const closer = t.closest("[data-tsl-close]");
    if (closer) {
      const dialog = closer.closest("dialog");
      if (dialog) dialog.close(closer.dataset.tslClose || "");
      else {
        const pop = closer.closest("[popover]");
        if (pop && isOpenPopover(pop)) pop.hidePopover();
      }
      return;
    }
    if (t.tagName === "DIALOG" && t.classList.contains("tsl-dialog") && !t.hasAttribute("data-tsl-static")) {
      const r = t.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) t.close();
      return;
    }
    const copyBtn = t.closest("[data-tsl-copy]");
    if (copyBtn) {
      const sel = copyBtn.dataset.tslCopyTarget;
      const source = sel ? document.querySelector(sel) : null;
      const text = source ? source.value || source.textContent : copyBtn.dataset.tslCopy;
      copy(text || "").then((ok) => {
        const label = copyBtn.textContent;
        if (copyBtn.children.length === 0) {
          copyBtn.textContent = ok ? "Copiado" : "Error";
          setTimeout(() => copyBtn.textContent = label, 1200);
        }
        emit(copyBtn, "tsl-copy", { text, ok });
      });
      return;
    }
    const themeBtn = t.closest("[data-tsl-theme-toggle]");
    if (themeBtn) {
      setTheme(getResolvedTheme() === "dark" ? "light" : "dark");
      return;
    }
    const themeSet = t.closest("[data-tsl-theme]");
    if (themeSet) {
      setTheme(themeSet.dataset.tslTheme);
      return;
    }
    const presetSet = t.closest("[data-tsl-preset]");
    if (presetSet) {
      setPreset(presetSet.dataset.tslPreset);
      return;
    }
    const toggle = t.closest("[data-tsl-toggle]");
    if (toggle) {
      const on = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(on));
      emit(toggle, "tsl-change", { pressed: on });
      return;
    }
    const stepper = t.closest(".tsl-number > button[data-step]");
    if (stepper) {
      stepNumber(stepper);
      return;
    }
    const sortTh = t.closest("table[data-tsl-sortable] th[data-sort]");
    if (sortTh) sortTable(sortTh);
  });
  document.addEventListener("keydown", (e) => {
    const th = e.target instanceof Element && e.target.closest("table[data-tsl-sortable] th[data-sort]");
    if (th && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      sortTable(th);
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target instanceof HTMLInputElement && e.target.classList.contains("tsl-range")) syncRange(e.target);
  });
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target instanceof Element && e.target.closest(".tsl-card--interactive");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--tsl-mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--tsl-my", `${e.clientY - r.top}px`);
    },
    { passive: true }
  );
  function init(root2 = document) {
    root2.querySelectorAll("input.tsl-range").forEach(syncRange);
    root2.querySelectorAll("textarea[data-tsl-autosize]").forEach(autosize);
    root2.querySelectorAll("textarea[data-tsl-count]").forEach(countText);
    root2.querySelectorAll("table[data-tsl-sortable] th[data-sort]").forEach((th) => {
      if (!th.hasAttribute("tabindex")) th.tabIndex = 0;
    });
  }

  // src/components/tabs.js
  var TslTabs = class extends TslElement {
    setup() {
      this.tabs = Array.from(this.querySelectorAll(":scope > .tsl-tabs__list > .tsl-tabs__tab"));
      this.panels = Array.from(this.querySelectorAll(":scope > .tsl-tabs__panel"));
      const list = this.querySelector(":scope > .tsl-tabs__list");
      if (list) list.setAttribute("role", "tablist");
      this.tabs.forEach((tab) => {
        const key = tab.dataset.tab;
        const panel = this.panels.find((p) => p.dataset.panel === key);
        tab.id = tab.id || nextId("tsl-tab");
        tab.type = "button";
        tab.setAttribute("role", "tab");
        if (panel) {
          panel.id = panel.id || nextId("tsl-panel");
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("tabindex", "0");
          panel.setAttribute("aria-labelledby", tab.id);
          tab.setAttribute("aria-controls", panel.id);
        }
        tab.addEventListener("click", () => this.select(key, true));
        tab.addEventListener("keydown", (e) => {
          const next = moveFocus(this.tabs, tab, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
            this.select(next.dataset.tab, true);
          }
        });
      });
      const initial = this.getAttribute("value") || this.tabs[0] && this.tabs[0].dataset.tab;
      this.select(initial, false);
    }
    get value() {
      return this._value;
    }
    set value(v) {
      this.select(v, false);
    }
    select(key, fire) {
      if (!this.tabs.some((t) => t.dataset.tab === key)) return;
      this._value = key;
      this.tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      this.panels.forEach((p) => p.hidden = p.dataset.panel !== key);
      if (fire) emit(this, "tsl-change", { value: key });
    }
  };
  define("tsl-tabs", TslTabs);

  // src/components/segmented.js
  var TslSegmented = class extends TslElement {
    setup() {
      this.classList.add("tsl-segmented");
      this.setAttribute("role", "radiogroup");
      this.items = Array.from(this.querySelectorAll(".tsl-segmented__item"));
      this.items.forEach((item) => {
        item.type = "button";
        item.setAttribute("role", "radio");
        item.addEventListener("click", () => this.select(item.value, true));
        item.addEventListener("keydown", (e) => {
          const next = moveFocus(this.items, item, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
            this.select(next.value, true);
          }
        });
      });
      this.select(this.getAttribute("value") || this.items[0] && this.items[0].value, false);
    }
    get value() {
      return this._value;
    }
    set value(v) {
      this.select(v, false);
    }
    select(value, fire) {
      if (!this.items.some((i) => i.value === value)) return;
      this._value = value;
      this.items.forEach((i) => {
        const on = i.value === value;
        i.setAttribute("aria-checked", String(on));
        i.tabIndex = on ? 0 : -1;
      });
      if (fire) emit(this, "tsl-change", { value });
    }
  };
  define("tsl-segmented", TslSegmented);

  // src/components/menu.js
  var openMenus = /* @__PURE__ */ new Set();
  var TslMenu = class extends TslElement {
    setup() {
      this.trigger = this.querySelector("[data-tsl-trigger]") || this.querySelector("button");
      this.list = this.querySelector(".tsl-menu__list");
      if (!this.trigger || !this.list) return;
      this.list.id = this.list.id || nextId("tsl-menu");
      this.list.setAttribute("role", "menu");
      this.list.hidden = true;
      this.trigger.setAttribute("aria-haspopup", "menu");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this.list.id);
      this.items().forEach((item) => {
        item.setAttribute("role", "menuitem");
        item.tabIndex = -1;
      });
      this.trigger.addEventListener("click", () => this.list.hidden ? this.open() : this.close());
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.open(e.key === "ArrowUp" ? "last" : "first");
        }
      });
      this.list.addEventListener("keydown", (e) => {
        const items = this.items();
        if (e.key === "Escape") {
          e.preventDefault();
          this.close(true);
          return;
        }
        if (e.key === "Tab") {
          this.close();
          return;
        }
        const next = moveFocus(items, document.activeElement, e.key);
        if (next) {
          e.preventDefault();
          next.focus();
        }
      });
      this.list.addEventListener("click", (e) => {
        const item = e.target.closest(".tsl-menu__item");
        if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
        emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
        this.close(true);
      });
    }
    items() {
      return Array.from(this.list.querySelectorAll(".tsl-menu__item:not([disabled])"));
    }
    open(focus = "first") {
      openMenus.forEach((m) => m !== this && m.close());
      this.list.hidden = false;
      this.trigger.setAttribute("aria-expanded", "true");
      openMenus.add(this);
      const items = this.items();
      const target = focus === "last" ? items[items.length - 1] : items[0];
      if (target) target.focus();
    }
    close(returnFocus = false) {
      if (!this.list || this.list.hidden) return;
      this.list.hidden = true;
      this.trigger.setAttribute("aria-expanded", "false");
      openMenus.delete(this);
      if (returnFocus) this.trigger.focus();
    }
  };
  document.addEventListener("pointerdown", (e) => {
    openMenus.forEach((menu) => {
      if (!menu.contains(e.target)) menu.close();
    });
  });
  define("tsl-menu", TslMenu);

  // src/components/command.js
  function fuzzyScore(text, query2) {
    if (!query2) return 1;
    const t = text.toLowerCase();
    const q = query2.toLowerCase().trim();
    const at = t.indexOf(q);
    if (at !== -1) return 1e3 - at;
    let qi = 0;
    let first = -1;
    let lastHit = -1;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        if (first === -1) first = ti;
        lastHit = ti;
        qi++;
      }
    }
    if (qi < q.length) return 0;
    const span = lastHit - first + 1;
    return span <= q.length * 3 ? 100 - span : 0;
  }
  var TslCommand = class extends TslElement {
    setup() {
      const items = Array.from(this.querySelectorAll(":scope > .tsl-command__item"));
      this.dialog = document.createElement("dialog");
      this.dialog.className = "tsl-dialog tsl-command";
      this.dialog.setAttribute("aria-label", this.getAttribute("label") || "Paleta de comandos");
      this.dialog.innerHTML = `
      <div class="tsl-command__search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input class="tsl-command__input" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" />
        <kbd class="tsl-kbd">ESC</kbd>
      </div>
      <div class="tsl-command__list" role="listbox"></div>
      <div class="tsl-command__empty" hidden></div>
      <div class="tsl-command__footer"><span>↑ ↓ navegar · ↵ elegir</span><span></span></div>`;
      this.input = this.dialog.querySelector(".tsl-command__input");
      this.listEl = this.dialog.querySelector(".tsl-command__list");
      this.emptyEl = this.dialog.querySelector(".tsl-command__empty");
      this.input.placeholder = this.getAttribute("placeholder") || "Escribe un comando o busca…";
      this.emptyEl.textContent = this.getAttribute("empty") || "Sin resultados.";
      this.listEl.id = nextId("tsl-cmdlist");
      this.input.setAttribute("aria-controls", this.listEl.id);
      this.groups = [];
      items.forEach((item) => {
        item.type = "button";
        item.id = item.id || nextId("tsl-cmd");
        item.setAttribute("role", "option");
        item.tabIndex = -1;
        const groupName = item.dataset.group || "";
        let group = this.groups.find((g) => g.name === groupName);
        if (!group) {
          const header = document.createElement("div");
          header.className = "tsl-command__group";
          header.textContent = groupName;
          header.hidden = !groupName;
          group = { name: groupName, header, items: [] };
          this.groups.push(group);
        }
        group.items.push(item);
      });
      this.groups.forEach((g) => {
        this.listEl.appendChild(g.header);
        g.items.forEach((i) => this.listEl.appendChild(i));
      });
      this.appendChild(this.dialog);
      this.input.addEventListener("input", () => this.filter());
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.moveActive(e.key === "ArrowDown" ? 1 : -1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (this.active) this.choose(this.active);
        }
      });
      this.listEl.addEventListener("click", (e) => {
        const item = e.target.closest(".tsl-command__item");
        if (item) this.choose(item);
      });
      this.listEl.addEventListener("pointermove", (e) => {
        const item = e.target.closest(".tsl-command__item");
        if (item && item !== this.active) this.setActive(item);
      });
      this.dialog.addEventListener("click", (e) => {
        if (e.target === this.dialog) this.close();
      });
      const hotkey = this.getAttribute("hotkey");
      if (hotkey) {
        document.addEventListener("keydown", (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
            e.preventDefault();
            this.dialog.open ? this.close() : this.open();
          }
        });
      }
    }
    visibleItems() {
      return Array.from(this.listEl.querySelectorAll(".tsl-command__item:not([hidden])"));
    }
    // Hides non-matches and reorders by relevance (groups by their best item)
    filter() {
      const q = this.input.value.trim();
      const scoreOf = (item, g) => Math.max(
        fuzzyScore(item.textContent, q) * 2,
        fuzzyScore(`${item.dataset.keywords || ""} ${g.name}`, q)
      );
      const ranked = this.groups.map((g, gi) => {
        const items = g.items.map((item, ii) => ({ item, ii, score: q ? scoreOf(item, g) : 1 }));
        items.forEach((x) => x.item.hidden = x.score === 0);
        if (q) items.sort((a, b) => b.score - a.score || a.ii - b.ii);
        const best = Math.max(0, ...items.map((x) => x.score));
        g.header.hidden = !g.name || best === 0;
        return { g, gi, items, best };
      });
      if (q) ranked.sort((a, b) => b.best - a.best || a.gi - b.gi);
      ranked.forEach(({ g, items }) => {
        this.listEl.appendChild(g.header);
        items.forEach((x) => this.listEl.appendChild(x.item));
      });
      const first = ranked.flatMap((r) => r.items).find((x) => !x.item.hidden);
      this.emptyEl.hidden = Boolean(first);
      this.setActive(first ? first.item : null);
      this.listEl.scrollTop = 0;
    }
    setActive(item) {
      if (this.active) this.active.setAttribute("aria-selected", "false");
      this.active = item;
      if (item) {
        item.setAttribute("aria-selected", "true");
        item.scrollIntoView({ block: "nearest" });
        this.input.setAttribute("aria-activedescendant", item.id);
      } else {
        this.input.removeAttribute("aria-activedescendant");
      }
    }
    moveActive(delta) {
      const visible = this.visibleItems();
      if (!visible.length) return;
      const idx = visible.indexOf(this.active);
      this.setActive(visible[(idx + delta + visible.length) % visible.length]);
    }
    choose(item) {
      emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
      this.close();
    }
    open() {
      if (!this.dialog || this.dialog.open) return;
      this.input.value = "";
      this.filter();
      this.dialog.showModal();
      this.input.focus();
    }
    close() {
      if (this.dialog && this.dialog.open) this.dialog.close();
    }
  };
  define("tsl-command", TslCommand);

  // src/components/otp.js
  var TslOtp = class extends TslElement {
    setup() {
      const length = Math.max(1, parseInt(this.getAttribute("length") || "6", 10));
      const numeric = this.getAttribute("mode") !== "text";
      this.setAttribute("role", "group");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Código de verificación");
      this.cells = Array.from({ length }, (_, i) => {
        const cell = document.createElement("input");
        cell.className = "tsl-otp__cell";
        cell.maxLength = 1;
        cell.autocomplete = i === 0 ? "one-time-code" : "off";
        cell.inputMode = numeric ? "numeric" : "text";
        cell.setAttribute("aria-label", `Carácter ${i + 1} de ${length}`);
        this.appendChild(cell);
        return cell;
      });
      if (this.getAttribute("name")) {
        this.hidden_ = document.createElement("input");
        this.hidden_.type = "hidden";
        this.hidden_.name = this.getAttribute("name");
        this.appendChild(this.hidden_);
      }
      const valid = (ch) => numeric ? /\d/.test(ch) : /\S/.test(ch);
      this.cells.forEach((cell, i) => {
        cell.addEventListener("input", () => {
          const ch = cell.value.slice(-1);
          cell.value = valid(ch) ? ch : "";
          if (cell.value && i < length - 1) this.cells[i + 1].focus();
          this.changed();
        });
        cell.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !cell.value && i > 0) {
            this.cells[i - 1].focus();
            this.cells[i - 1].value = "";
            this.changed();
            e.preventDefault();
          } else if (e.key === "ArrowLeft" && i > 0) {
            this.cells[i - 1].focus();
          } else if (e.key === "ArrowRight" && i < length - 1) {
            this.cells[i + 1].focus();
          }
        });
        cell.addEventListener("focus", () => cell.select());
        cell.addEventListener("paste", (e) => {
          e.preventDefault();
          const chars = (e.clipboardData.getData("text") || "").split("").filter(valid);
          chars.slice(0, length - i).forEach((ch, k) => this.cells[i + k].value = ch);
          this.cells[Math.min(i + chars.length, length - 1)].focus();
          this.changed();
        });
      });
    }
    get value() {
      return this.cells ? this.cells.map((c) => c.value).join("") : "";
    }
    clear() {
      this.cells.forEach((c) => c.value = "");
      this.cells[0].focus();
      this.changed();
    }
    changed() {
      const value = this.value;
      if (this.hidden_) this.hidden_.value = value;
      emit(this, "tsl-change", { value });
      if (value.length === this.cells.length) emit(this, "tsl-complete", { value });
    }
  };
  define("tsl-otp", TslOtp);

  // src/components/tags.js
  var TslTags = class extends TslElement {
    setup() {
      this.tags = [];
      this.input = document.createElement("input");
      this.input.className = "tsl-tags__input";
      this.input.placeholder = this.getAttribute("placeholder") || "Añadir…";
      this.input.setAttribute("aria-label", this.getAttribute("label") || "Añadir etiqueta");
      this.appendChild(this.input);
      if (this.getAttribute("name")) {
        this.hidden_ = document.createElement("input");
        this.hidden_.type = "hidden";
        this.hidden_.name = this.getAttribute("name");
        this.appendChild(this.hidden_);
      }
      (this.getAttribute("value") || "").split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => this.addTag(t, false));
      this.addEventListener("click", (e) => {
        if (e.target === this) this.input.focus();
      });
      this.input.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === ",") && this.input.value.trim()) {
          e.preventDefault();
          this.addTag(this.input.value.trim(), true);
          this.input.value = "";
        } else if (e.key === "Backspace" && !this.input.value && this.tags.length) {
          this.removeTag(this.tags[this.tags.length - 1], true);
        }
      });
    }
    get value() {
      return this.tags.slice();
    }
    addTag(tag, fire) {
      const max = parseInt(this.getAttribute("max") || "0", 10);
      if (this.tags.includes(tag) || max && this.tags.length >= max) return;
      this.tags.push(tag);
      const chip = document.createElement("span");
      chip.className = "tsl-chip";
      chip.dataset.tag = tag;
      const label = document.createElement("span");
      label.textContent = tag;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "tsl-chip__remove";
      rm.setAttribute("aria-label", `Quitar ${tag}`);
      rm.textContent = "✕";
      rm.addEventListener("click", () => this.removeTag(tag, true));
      chip.append(label, rm);
      this.insertBefore(chip, this.input);
      this.sync(fire);
    }
    removeTag(tag, fire) {
      this.tags = this.tags.filter((t) => t !== tag);
      const chip = Array.from(this.querySelectorAll(".tsl-chip")).find((c) => c.dataset.tag === tag);
      if (chip) chip.remove();
      this.input.focus();
      this.sync(fire);
    }
    sync(fire) {
      if (this.hidden_) this.hidden_.value = this.tags.join(",");
      if (fire) emit(this, "tsl-change", { value: this.value });
    }
  };
  define("tsl-tags", TslTags);

  // src/components/dropzone.js
  var formatBytes = (n) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };
  var TslDropzone = class extends TslElement {
    setup() {
      this.files = [];
      this.tabIndex = 0;
      this.setAttribute("role", "button");
      this.fileInput = document.createElement("input");
      this.fileInput.type = "file";
      this.fileInput.hidden = true;
      if (this.hasAttribute("multiple")) this.fileInput.multiple = true;
      if (this.getAttribute("accept")) this.fileInput.accept = this.getAttribute("accept");
      if (this.getAttribute("name")) this.fileInput.name = this.getAttribute("name");
      this.listEl = document.createElement("div");
      this.listEl.className = "tsl-dropzone__files";
      this.append(this.fileInput, this.listEl);
      this.addEventListener("click", (e) => {
        if (e.target !== this.fileInput) this.fileInput.click();
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.fileInput.click();
        }
      });
      this.fileInput.addEventListener("change", () => this.take(this.fileInput.files));
      ["dragenter", "dragover"].forEach(
        (type) => this.addEventListener(type, (e) => {
          e.preventDefault();
          this.setAttribute("data-dragging", "");
        })
      );
      ["dragleave", "drop"].forEach(
        (type) => this.addEventListener(type, (e) => {
          e.preventDefault();
          this.removeAttribute("data-dragging");
        })
      );
      this.addEventListener("drop", (e) => this.take(e.dataTransfer.files));
    }
    take(fileList) {
      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;
      this.files = this.hasAttribute("multiple") ? this.files.concat(incoming) : incoming.slice(0, 1);
      this.listEl.textContent = "";
      this.files.forEach((f) => {
        const row = document.createElement("div");
        row.className = "tsl-dropzone__file";
        const name = document.createElement("span");
        name.textContent = f.name;
        const size = document.createElement("span");
        size.className = "tsl-muted";
        size.textContent = formatBytes(f.size);
        row.append(name, size);
        this.listEl.appendChild(row);
      });
      emit(this, "tsl-change", { files: this.files.slice() });
    }
  };
  define("tsl-dropzone", TslDropzone);

  // src/components/calendar.js
  var TslCalendar = class extends TslElement {
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
      this.weekStart = parseInt(this.getAttribute("week-start") || "1", 10) % 7;
      this.mode = this.getAttribute("mode") === "range" ? "range" : "single";
      this.months = Math.max(1, parseInt(this.getAttribute("months") || "1", 10));
      this.min = this.getAttribute("min") || "";
      this.max = this.getAttribute("max") || "";
      this.selected = null;
      this.start = null;
      this.end = null;
      this.hover = null;
      this.parseValue(this.getAttribute("value"));
      const base = this.selected || this.start || /* @__PURE__ */ new Date();
      this.view = new Date(base.getFullYear(), base.getMonth(), 1);
      this.focusDate = new Date(base);
      this.render(false);
      this.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-cal-nav]");
        if (nav) {
          this.shift(parseInt(nav.dataset.calNav, 10));
          return;
        }
        const day = e.target.closest(".tsl-cal__day[data-date]");
        if (day && !day.disabled) this.pick(fromISO(day.dataset.date));
      });
      this.addEventListener("pointerover", (e) => {
        if (this.mode !== "range" || !this.start || this.end) return;
        const day = e.target.closest(".tsl-cal__day[data-date]");
        this.hover = day ? fromISO(day.dataset.date) : null;
        this.paintPreview();
      });
      this.addEventListener("pointerleave", () => {
        if (this.hover) {
          this.hover = null;
          this.paintPreview();
        }
      });
      this.addEventListener("keydown", (e) => {
        if (!e.target.classList.contains("tsl-cal__day")) return;
        const d = fromISO(e.target.dataset.date);
        if (!d) return;
        const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (steps[e.key] !== void 0) d.setDate(d.getDate() + steps[e.key]);
        else if (e.key === "PageUp" || e.key === "PageDown") {
          const dir = e.key === "PageUp" ? -1 : 1;
          const day = d.getDate();
          d.setDate(1);
          d.setMonth(d.getMonth() + (e.shiftKey ? 12 * dir : dir));
          d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
        } else return;
        e.preventDefault();
        if (this.isDisabled(toISO(d))) return;
        this.focusDate = d;
        const first = this.view.getFullYear() * 12 + this.view.getMonth();
        const idx = d.getFullYear() * 12 + d.getMonth();
        if (idx < first) this.view = new Date(d.getFullYear(), d.getMonth(), 1);
        else if (idx > first + this.months - 1) this.view = new Date(d.getFullYear(), d.getMonth() - (this.months - 1), 1);
        this.render(true);
      });
    }
    parseValue(v) {
      if (this.mode === "range") {
        const [a, b] = String(v || "").split("/");
        this.start = fromISO(a);
        this.end = fromISO(b);
      } else {
        this.selected = fromISO(v);
      }
    }
    get value() {
      if (this.mode === "range") return this.start && this.end ? `${toISO(this.start)}/${toISO(this.end)}` : "";
      return this.selected ? toISO(this.selected) : "";
    }
    set value(v) {
      this.parseValue(v);
      const ref = this.selected || this.start;
      if (ref) {
        this.view = new Date(ref.getFullYear(), ref.getMonth(), 1);
        this.focusDate = new Date(ref);
      }
      if (this._tslReady) this.render(false);
    }
    isDisabled(iso) {
      return Boolean(this.min && iso < this.min || this.max && iso > this.max);
    }
    shift(months) {
      this.view = new Date(this.view.getFullYear(), this.view.getMonth() + months, 1);
      this.focusDate = new Date(this.view);
      this.render(false);
    }
    pick(date) {
      if (!date || this.isDisabled(toISO(date))) return;
      this.focusDate = date;
      if (this.mode === "range") {
        if (!this.start || this.end) {
          this.start = date;
          this.end = null;
        } else if (date < this.start) {
          this.start = date;
        } else {
          this.end = date;
        }
        this.hover = null;
        this.render(true);
        emit(this, "tsl-change", {
          start: toISO(this.start),
          end: this.end ? toISO(this.end) : null,
          value: this.value,
          complete: Boolean(this.end)
        });
        return;
      }
      this.selected = date;
      if (date.getMonth() !== this.view.getMonth()) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
      this.render(true);
      emit(this, "tsl-change", { value: toISO(date), date });
    }
    // Vista previa del rango mientras el cursor se mueve (sin volver a renderizar)
    paintPreview() {
      const a = this.start && toISO(this.start);
      const b = this.hover && toISO(this.hover);
      this.querySelectorAll(".tsl-cal__day[data-date]").forEach((btn) => {
        const iso = btn.dataset.date;
        const on = Boolean(a && b && !this.end && iso > (a < b ? a : b) && iso < (a < b ? b : a));
        btn.classList.toggle("is-preview", on);
      });
    }
    renderMonth(view, idx, total) {
      const y = view.getFullYear();
      const m = view.getMonth();
      const title = new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(view);
      const dowFmt = new Intl.DateTimeFormat(this.locale, { weekday: "narrow" });
      const fullFmt = new Intl.DateTimeFormat(this.locale, { dateStyle: "full" });
      const todayISO = toISO(/* @__PURE__ */ new Date());
      const focusISO = toISO(this.focusDate);
      const sISO = this.mode === "range" ? this.start && toISO(this.start) : this.selected && toISO(this.selected);
      const eISO = this.mode === "range" && this.end ? toISO(this.end) : null;
      const offset = (new Date(y, m, 1).getDay() - this.weekStart + 7) % 7;
      const start = new Date(y, m, 1 - offset);
      let dows = "";
      for (let i = 0; i < 7; i++) {
        dows += `<span class="tsl-cal__dow">${dowFmt.format(new Date(2023, 0, 1 + (this.weekStart + i) % 7))}</span>`;
      }
      let cells = "";
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const outside = d.getMonth() !== m;
        if (outside && total > 1) {
          cells += `<span class="tsl-cal__day is-blank" aria-hidden="true"></span>`;
          continue;
        }
        const iso = toISO(d);
        const pressed = iso === sISO || iso === eISO;
        const cls = [
          "tsl-cal__day",
          outside ? "is-outside" : "",
          iso === todayISO ? "is-today" : "",
          iso === sISO && eISO ? "is-range-start" : "",
          iso === eISO ? "is-range-end" : "",
          sISO && eISO && iso > sISO && iso < eISO ? "in-range" : ""
        ].join(" ");
        const off = this.isDisabled(iso);
        cells += `<button type="button" class="${cls}" data-date="${iso}" aria-label="${fullFmt.format(d)}" aria-pressed="${pressed}" tabindex="${iso === focusISO && !off ? 0 : -1}"${off ? " disabled" : ""}>${d.getDate()}</button>`;
      }
      const prev = `<button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm tsl-btn--icon" data-cal-nav="-1" aria-label="Mes anterior">‹</button>`;
      const next = `<button type="button" class="tsl-btn tsl-btn--subtle tsl-btn--sm tsl-btn--icon" data-cal-nav="1" aria-label="Mes siguiente">›</button>`;
      const spacer = `<span class="tsl-cal__nav-spacer" aria-hidden="true"></span>`;
      return `<div class="tsl-cal__month">
      <div class="tsl-cal__head">${idx === 0 ? prev : spacer}<span aria-live="polite">${title}</span>${idx === total - 1 ? next : spacer}</div>
      <div class="tsl-cal__grid">${dows}${cells}</div>
    </div>`;
    }
    render(keepFocus) {
      let html = "";
      for (let i = 0; i < this.months; i++) {
        const view = new Date(this.view.getFullYear(), this.view.getMonth() + i, 1);
        html += this.renderMonth(view, i, this.months);
      }
      this.innerHTML = `<div class="tsl-cal__months">${html}</div>`;
      if (!this.querySelector('.tsl-cal__day[tabindex="0"]')) {
        const first = this.querySelector(".tsl-cal__day[data-date]:not([disabled]):not(.is-outside)");
        if (first) first.tabIndex = 0;
      }
      if (keepFocus) {
        const target = this.querySelector(`[data-date="${toISO(this.focusDate)}"]:not(.is-outside), [data-date="${toISO(this.focusDate)}"]`);
        if (target && !target.disabled) target.focus();
      }
    }
  };
  define("tsl-calendar", TslCalendar);

  // src/components/sparkline.js
  var TslSparkline = class extends HTMLElement {
    static get observedAttributes() {
      return ["values", "fill"];
    }
    connectedCallback() {
      this.render();
      if (!this._ro && "ResizeObserver" in window) {
        this._ro = new ResizeObserver(() => this.render());
        this._ro.observe(this);
      }
    }
    disconnectedCallback() {
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
    }
    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }
    render() {
      const values = (this.getAttribute("values") || "").split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
      if (values.length < 2) {
        this.innerHTML = "";
        return;
      }
      const w = Math.max(20, Math.round(this.clientWidth) || 100);
      const h = Math.max(8, Math.round(this.clientHeight) || 30);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min || 1;
      const pts = values.map((v, i) => [3 + i / (values.length - 1) * (w - 6), h - 3 - (v - min) / span * (h - 6)]);
      const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
      const last = pts[pts.length - 1];
      const area = this.hasAttribute("fill") ? `<path d="${line} L${last[0]},${h} L${pts[0][0]},${h} Z" fill="currentColor" opacity="0.14" stroke="none"/>` : "";
      this.setAttribute("role", "img");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", `Tendencia: ${values.join(", ")}`);
      const key = `${w}x${h}:${line}:${area ? 1 : 0}`;
      if (key === this._key) return;
      this._key = key;
      this.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${area}<path d="${line}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="currentColor"/></svg>`;
    }
  };
  define("tsl-sparkline", TslSparkline);

  // src/components/popover.js
  var TslPopover = class extends TslElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > button");
      this.panel = this.querySelector(":scope > .tsl-popover__panel");
      if (!this.trigger || !this.panel) return;
      this.panel.id = this.panel.id || nextId("tsl-popover");
      this.panel.setAttribute("popover", this.hasAttribute("manual") ? "manual" : "auto");
      if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "dialog");
      if (this.getAttribute("label") && !this.panel.hasAttribute("aria-label")) {
        this.panel.setAttribute("aria-label", this.getAttribute("label"));
      }
      this.trigger.setAttribute("popovertarget", this.panel.id);
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this.panel.id);
      this.panel.addEventListener("toggle", (e) => {
        const open = e.newState === "open";
        this.trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          this.reposition();
          this.stop = trackPosition(this.trigger, this.panel, this.options());
          focusFirst(this.panel);
          emit(this, "tsl-open", {});
        } else {
          if (this.stop) this.stop();
          this.stop = null;
          emit(this, "tsl-close", {});
        }
      });
      if (this.hasAttribute("manual")) {
        this.panel.addEventListener("keydown", (e) => {
          if (e.key === "Escape") this.close();
        });
      }
    }
    options() {
      return {
        placement: this.getAttribute("placement") || "bottom-start",
        offset: parseInt(this.getAttribute("offset") || "6", 10)
      };
    }
    reposition() {
      position(this.trigger, this.panel, this.options());
    }
    get isOpen() {
      return Boolean(this.panel) && isOpenPopover(this.panel);
    }
    open() {
      if (this.panel && !this.isOpen) this.panel.showPopover();
    }
    close() {
      if (this.isOpen) this.panel.hidePopover();
    }
    toggle() {
      this.isOpen ? this.close() : this.open();
    }
  };
  define("tsl-popover", TslPopover);

  // src/components/hovercard.js
  var TslHoverCard = class extends TslElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > a, :scope > button");
      this.panel = this.querySelector(":scope > .tsl-popover__panel");
      if (!this.trigger || !this.panel) return;
      this.panel.id = this.panel.id || nextId("tsl-hovercard");
      this.panel.setAttribute("popover", "manual");
      if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "group");
      this.trigger.setAttribute("aria-controls", this.panel.id);
      this.trigger.setAttribute("aria-expanded", "false");
      const delay = (name, fallback) => parseInt(this.getAttribute(name) || String(fallback), 10);
      const schedule = (fn, ms) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(fn, ms);
      };
      const enter = () => schedule(() => this.open(), delay("open-delay", 300));
      const leave = () => schedule(() => this.close(), delay("close-delay", 150));
      [this.trigger, this.panel].forEach((el) => {
        el.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && enter());
        el.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && leave());
        el.addEventListener("focusin", enter);
        el.addEventListener("focusout", (e) => {
          if (!this.contains(e.relatedTarget)) leave();
        });
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          e.stopPropagation();
          clearTimeout(this.timer);
          this.close();
        }
      });
    }
    get isOpen() {
      return Boolean(this.panel) && isOpenPopover(this.panel);
    }
    open() {
      if (!this.panel || this.isOpen) return;
      this.panel.showPopover();
      position(this.trigger, this.panel, {
        placement: this.getAttribute("placement") || "bottom-start",
        offset: parseInt(this.getAttribute("offset") || "8", 10)
      });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stop = trackPosition(this.trigger, this.panel, { placement: this.getAttribute("placement") || "bottom-start", offset: 8 });
      emit(this, "tsl-open", {});
    }
    close() {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stop) this.stop();
      this.stop = null;
      emit(this, "tsl-close", {});
    }
  };
  define("tsl-hovercard", TslHoverCard);

  // src/components/context-menu.js
  var TslContextMenu = class extends TslElement {
    setup() {
      this.list = this.querySelector(":scope > .tsl-menu__list");
      if (!this.list) return;
      this.list.id = this.list.id || nextId("tsl-ctx");
      this.list.setAttribute("popover", "manual");
      this.list.setAttribute("role", "menu");
      this.items().forEach((item) => {
        item.setAttribute("role", "menuitem");
        item.tabIndex = -1;
      });
      this.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (this.list.contains(e.target)) return;
        this.openAt(e.clientX, e.clientY);
      });
      this.addEventListener("keydown", (e) => {
        if (this.list.contains(e.target)) return;
        if (e.key === "ContextMenu" || e.shiftKey && e.key === "F10") {
          e.preventDefault();
          const r = (e.target instanceof Element ? e.target : this).getBoundingClientRect();
          this.openAt(r.left + r.width / 2, r.top + r.height / 2);
        }
      });
      let press = 0;
      const cancel = () => clearTimeout(press);
      this.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch" || this.list.contains(e.target)) return;
        const { clientX, clientY } = e;
        press = setTimeout(() => this.openAt(clientX, clientY), 550);
      });
      ["pointerup", "pointermove", "pointercancel"].forEach((t) => this.addEventListener(t, cancel));
      this.list.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.close(true);
          return;
        }
        const next = moveFocus(this.items(), document.activeElement, e.key);
        if (next) {
          e.preventDefault();
          next.focus();
        } else if (e.key === "Tab") {
          this.close();
        }
      });
      this.list.addEventListener("click", (e) => {
        const item = e.target.closest(".tsl-menu__item");
        if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
        emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
        this.close(true);
      });
      this.outside = (e) => {
        if (!this.list.contains(e.target)) this.close();
      };
      this.dismiss = () => this.close();
    }
    items() {
      return Array.from(this.list.querySelectorAll(".tsl-menu__item:not([disabled])"));
    }
    openAt(x, y) {
      this.close();
      this.returnTo = document.activeElement;
      this.list.showPopover();
      position(null, this.list, { point: { x, y }, placement: "bottom-start", offset: 2 });
      const first = this.items()[0];
      if (first) first.focus();
      setTimeout(() => {
        if (!isOpenPopover(this.list)) return;
        document.addEventListener("pointerdown", this.outside, true);
        window.addEventListener("scroll", this.dismiss, true);
        window.addEventListener("resize", this.dismiss);
      }, 0);
    }
    close(returnFocus = false) {
      if (!this.list || !isOpenPopover(this.list)) return;
      this.list.hidePopover();
      document.removeEventListener("pointerdown", this.outside, true);
      window.removeEventListener("scroll", this.dismiss, true);
      window.removeEventListener("resize", this.dismiss);
      if (returnFocus && this.returnTo && this.returnTo.isConnected) this.returnTo.focus();
    }
  };
  define("tsl-context-menu", TslContextMenu);

  // src/components/sheet.js
  document.addEventListener("pointerdown", (e) => {
    const handle = e.target instanceof Element && e.target.closest(".tsl-sheet__handle");
    const dialog = handle && handle.closest("dialog");
    if (!dialog) return;
    const startY = e.clientY;
    let dy = 0;
    handle.setPointerCapture(e.pointerId);
    dialog.style.transition = "none";
    const move = (ev) => {
      dy = Math.max(0, ev.clientY - startY);
      dialog.style.transform = `translateY(${dy}px)`;
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      dialog.style.transition = "";
      dialog.style.transform = "";
      if (dy > Math.min(120, dialog.offsetHeight / 3)) dialog.close();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });

  // src/core/form.js
  var TslFormElement = class extends TslElement {
    static get formAssociated() {
      return true;
    }
    constructor() {
      super();
      try {
        this.internals = this.attachInternals();
      } catch (_) {
        this.internals = null;
      }
    }
    get name() {
      return this.getAttribute("name") || "";
    }
    get form() {
      return this.internals ? this.internals.form : null;
    }
    get validity() {
      return this.internals ? this.internals.validity : null;
    }
    get validationMessage() {
      return this.internals ? this.internals.validationMessage : "";
    }
    checkValidity() {
      return this.internals ? this.internals.checkValidity() : true;
    }
    reportValidity() {
      return this.internals ? this.internals.reportValidity() : true;
    }
    // Propiedad que refleja el atributo `disabled`
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      this.toggleAttribute("disabled", Boolean(value));
    }
    get isDisabled() {
      return this.hasAttribute("disabled") || Boolean(this.formDisabled);
    }
    formResetCallback() {
      this.reset();
    }
    formDisabledCallback(disabled) {
      this.formDisabled = disabled;
      this.syncDisabled();
    }
    attributeChangedCallback(name) {
      if (name === "disabled" && this._tslReady) this.syncDisabled();
    }
    static get observedAttributes() {
      return ["disabled"];
    }
    syncDisabled() {
    }
    reset() {
    }
    // Publica el valor al formulario (null = no se envía) y aplica "required"
    publish(value, empty, anchor) {
      if (!this.internals) return;
      this.internals.setFormValue(value);
      if (this.hasAttribute("required") && empty) {
        this.internals.setValidity({ valueMissing: true }, this.getAttribute("required-message") || "Completa este campo.", anchor);
      } else {
        this.internals.setValidity({});
      }
    }
  };

  // src/components/select.js
  var CHEVRON = `<svg class="tsl-trigger__icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  var CHECK = `<svg class="tsl-select__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
  var TslSelect = class extends TslFormElement {
    setup() {
      this.multiple = this.hasAttribute("multiple");
      this.inline = this.hasAttribute("autocomplete");
      this.searchable = this.hasAttribute("searchable") && !this.inline;
      this.creatable = this.hasAttribute("creatable");
      this.options = this.readOptions();
      this.initial = this.initialValues();
      this.values = this.initial.slice();
      this.query = "";
      this.active = null;
      this.typeahead = "";
      this.build();
      this.renderList();
      this.sync(false);
    }
    readOptions() {
      const out = [];
      const read = (o, group) => out.push({
        value: o.getAttribute("value") !== null ? o.getAttribute("value") : o.textContent.trim(),
        label: o.textContent.trim(),
        disabled: o.hasAttribute("disabled"),
        hint: o.dataset.hint || "",
        selected: o.hasAttribute("selected"),
        group
      });
      Array.from(this.children).forEach((child) => {
        if (child.tagName === "OPTION") read(child, "");
        else if (child.tagName === "OPTGROUP") Array.from(child.children).forEach((o) => read(o, child.getAttribute("label") || ""));
      });
      return out;
    }
    initialValues() {
      const attr = this.getAttribute("value");
      let vals = attr !== null && attr !== "" ? this.multiple ? attr.split(",").map((v) => v.trim()) : [attr] : this.options.filter((o) => o.selected).map((o) => o.value);
      if (!this.multiple) vals = vals.slice(0, 1);
      return vals.filter((v) => this.options.some((o) => o.value === v));
    }
    build() {
      const listId = nextId("tsl-select-list");
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "tsl-select__wrap";
      if (this.inline) {
        this.trigger = document.createElement("div");
        this.trigger.className = "tsl-trigger tsl-trigger--input";
        this.input = document.createElement("input");
        this.input.className = "tsl-trigger__input";
        this.input.type = "text";
        this.input.autocomplete = "off";
        this.input.spellcheck = false;
        this.input.placeholder = this.getAttribute("placeholder") || "";
        this.input.setAttribute("role", "combobox");
        this.input.setAttribute("aria-autocomplete", "list");
        this.owner = this.input;
        this.trigger.appendChild(this.input);
        this.trigger.insertAdjacentHTML("beforeend", CHEVRON);
      } else {
        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "tsl-trigger";
        this.trigger.innerHTML = `<span class="tsl-trigger__value"></span>${CHEVRON}`;
        this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
        this.owner = this.trigger;
      }
      this.trigger.setAttribute("aria-haspopup", "listbox");
      this.wrap.appendChild(this.trigger);
      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "tsl-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar selección");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);
      this.panel = document.createElement("div");
      this.panel.className = "tsl-select__panel";
      this.panel.setAttribute("popover", "manual");
      if (this.searchable) {
        const box = document.createElement("div");
        box.className = "tsl-select__searchbox";
        this.search = document.createElement("input");
        this.search.className = "tsl-select__search";
        this.search.type = "text";
        this.search.autocomplete = "off";
        this.search.spellcheck = false;
        this.search.placeholder = this.getAttribute("search-placeholder") || "Buscar…";
        this.search.setAttribute("aria-label", this.getAttribute("search-placeholder") || "Buscar");
        this.search.setAttribute("role", "combobox");
        this.search.setAttribute("aria-expanded", "true");
        this.search.setAttribute("aria-controls", listId);
        this.search.setAttribute("aria-autocomplete", "list");
        box.appendChild(this.search);
        this.panel.appendChild(box);
        this.owner = this.search;
      }
      this.list = document.createElement("div");
      this.list.className = "tsl-select__list";
      this.list.id = listId;
      this.list.setAttribute("role", "listbox");
      if (this.multiple) this.list.setAttribute("aria-multiselectable", "true");
      if (this.getAttribute("label")) this.list.setAttribute("aria-label", this.getAttribute("label"));
      this.empty = document.createElement("div");
      this.empty.className = "tsl-select__empty";
      this.empty.textContent = this.getAttribute("empty") || "Sin resultados";
      this.empty.hidden = true;
      this.panel.append(this.list, this.empty);
      this.append(this.wrap, this.panel);
      if (this.owner === this.trigger) {
        this.trigger.setAttribute("role", "combobox");
        this.trigger.setAttribute("aria-controls", listId);
        this.trigger.setAttribute("aria-expanded", "false");
      } else {
        this.trigger.setAttribute("aria-expanded", "false");
        if (this.owner === this.input) this.input.setAttribute("aria-controls", listId);
      }
      if (this.getAttribute("label")) this.owner.setAttribute("aria-label", this.getAttribute("label"));
      this.bind();
    }
    bind() {
      const toggle = () => this.isOpen ? this.close() : this.open();
      if (this.inline) {
        this.input.addEventListener("focus", () => !this.isDisabled && this.input.select());
        this.input.addEventListener("click", () => !this.isDisabled && !this.isOpen && this.open());
        this.input.addEventListener("input", () => {
          this.query = this.input.value;
          if (!this.isOpen) this.open();
          else this.renderList();
        });
        this.trigger.addEventListener("pointerdown", (e) => {
          if (e.target !== this.input) {
            e.preventDefault();
            this.input.focus();
            toggle();
          }
        });
        this.input.addEventListener("blur", () => {
          setTimeout(() => {
            if (!this.contains(document.activeElement)) {
              this.close();
              this.showSelection();
            }
          }, 0);
        });
      } else {
        this.trigger.addEventListener("click", toggle);
      }
      if (this.search) {
        this.search.addEventListener("input", () => {
          this.query = this.search.value;
          this.renderList();
        });
      }
      this.owner.addEventListener("keydown", (e) => this.onKey(e));
      this.clearBtn.addEventListener("click", () => {
        this.setValues([], true);
        this.owner.focus();
      });
      this.list.addEventListener("pointerdown", (e) => e.preventDefault());
      this.list.addEventListener("click", (e) => {
        const el = e.target.closest(".tsl-select__option");
        if (el) this.choose(this.visible.find((r) => r.id === el.id));
      });
      this.list.addEventListener("pointermove", (e) => {
        const el = e.target.closest(".tsl-select__option");
        const rec = el && this.visible.find((r) => r.id === el.id);
        if (rec && !rec.disabled && rec !== this.active) this.setActive(rec, false);
      });
      this.panel.addEventListener("focusout", (e) => {
        if (!this.contains(e.relatedTarget) && this.isOpen && !this.inline) this.close();
      });
    }
    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }
    get value() {
      return this.multiple ? this.values.slice() : this.values[0] || "";
    }
    set value(v) {
      const vals = (Array.isArray(v) ? v : v === "" || v == null ? [] : [v]).map(String);
      this.setValues(this.multiple ? vals : vals.slice(0, 1), false);
    }
    /** Reemplaza las opciones: [{ value, label, disabled, hint, group }] */
    setOptions(list) {
      this.options = list.map((o) => ({ value: String(o.value), label: o.label || String(o.value), disabled: Boolean(o.disabled), hint: o.hint || "", group: o.group || "", selected: false }));
      this.values = this.values.filter((v) => this.options.some((o) => o.value === v));
      this.renderList();
      this.sync(false);
    }
    labelOf(value) {
      const o = this.options.find((x) => x.value === value);
      return o ? o.label : value;
    }
    // ---- Lista --------------------------------------------------------------
    filteredOptions() {
      const q = normalize(this.query.trim());
      const list = this.options.filter((o) => !q || normalize(`${o.label} ${o.hint}`).includes(q));
      const exact = this.options.some((o) => normalize(o.label) === q);
      if (this.creatable && q && !exact) {
        list.push({ value: this.query.trim(), label: `${this.getAttribute("create-label") || "Crear"} «${this.query.trim()}»`, create: true, group: "", hint: "", disabled: false });
      }
      return list;
    }
    renderList() {
      this.visible = this.filteredOptions();
      this.list.textContent = "";
      let group = null;
      this.visible.forEach((rec, i) => {
        rec.id = `${this.list.id}-${i}`;
        if (rec.group !== group && rec.group) {
          const g = document.createElement("div");
          g.className = "tsl-select__group";
          g.setAttribute("role", "presentation");
          g.textContent = rec.group;
          this.list.appendChild(g);
        }
        group = rec.group;
        const el = document.createElement("div");
        el.className = "tsl-select__option";
        el.id = rec.id;
        el.setAttribute("role", "option");
        el.setAttribute("aria-selected", String(this.values.includes(rec.value) && !rec.create));
        if (rec.disabled) el.setAttribute("aria-disabled", "true");
        const text = document.createElement("span");
        text.className = "tsl-select__label";
        text.textContent = rec.label;
        el.appendChild(text);
        if (rec.hint) {
          const hint = document.createElement("span");
          hint.className = "tsl-select__hint";
          hint.textContent = rec.hint;
          el.appendChild(hint);
        }
        el.insertAdjacentHTML("beforeend", CHECK);
        this.list.appendChild(el);
      });
      this.empty.hidden = this.visible.length > 0;
      const enabled = this.visible.filter((r) => !r.disabled);
      const firstSelected = enabled.find((r) => this.values.includes(r.value) && !r.create);
      this.setActive(this.query ? enabled[0] : firstSelected || enabled[0], true);
    }
    el(rec) {
      return rec && this.list.querySelector(`#${CSS.escape(rec.id)}`);
    }
    setActive(rec, scroll) {
      const prev = this.el(this.active);
      if (prev) prev.classList.remove("is-active");
      this.active = rec || null;
      const el = this.el(rec);
      if (el) {
        el.classList.add("is-active");
        if (scroll !== false) el.scrollIntoView({ block: "nearest" });
        this.owner.setAttribute("aria-activedescendant", el.id);
      } else {
        this.owner.removeAttribute("aria-activedescendant");
      }
    }
    move(delta) {
      const enabled = this.visible.filter((r) => !r.disabled);
      if (!enabled.length) return;
      const idx = enabled.indexOf(this.active);
      this.setActive(enabled[(idx + delta + enabled.length) % enabled.length], true);
    }
    // ---- Interacción ----------------------------------------------------------
    onKey(e) {
      if (this.isDisabled) return;
      const k = e.key;
      if (!this.isOpen) {
        if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " " && !this.inline) {
          e.preventDefault();
          this.open();
        } else if (!this.inline && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          this.open();
          this.jump(k);
        } else if (k === "Backspace" && this.multiple && this.values.length && (!this.inline || !this.input.value)) {
          this.setValues(this.values.slice(0, -1), true);
        }
        return;
      }
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        this.move(k === "ArrowDown" ? 1 : -1);
      } else if (k === "Home" || k === "End") {
        if (this.inline || this.search) return;
        e.preventDefault();
        const enabled = this.visible.filter((r) => !r.disabled);
        this.setActive(k === "Home" ? enabled[0] : enabled[enabled.length - 1], true);
      } else if (k === "Enter" || k === " " && !this.inline && !this.search && !this.typeahead) {
        e.preventDefault();
        if (this.active) this.choose(this.active);
      } else if (k === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close(true);
      } else if (k === "Tab") {
        this.close();
      } else if (k === "Backspace" && this.multiple && this.values.length && !(this.search || this.input || {}).value) {
        this.setValues(this.values.slice(0, -1), true);
      } else if (!this.inline && !this.search && k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        this.jump(k);
      }
    }
    // Búsqueda por teclado en select sin buscador
    jump(ch) {
      clearTimeout(this.typeTimer);
      this.typeahead += normalize(ch);
      this.typeTimer = setTimeout(() => this.typeahead = "", 600);
      const enabled = this.visible.filter((r) => !r.disabled);
      const hit = enabled.find((r) => normalize(r.label).startsWith(this.typeahead));
      if (hit) this.setActive(hit, true);
    }
    choose(rec) {
      if (!rec || rec.disabled) return;
      if (rec.create) {
        this.options.push({ value: rec.value, label: rec.value, disabled: false, hint: "", group: "", selected: false });
        this.query = "";
        if (this.search) this.search.value = "";
        if (this.input) this.input.value = "";
      }
      if (this.multiple) {
        const has = this.values.includes(rec.value);
        this.values = has ? this.values.filter((v) => v !== rec.value) : this.values.concat(rec.value);
        this.renderList();
        this.sync(true);
        if (rec.create) this.setActive(this.visible.find((r) => r.value === rec.value), true);
      } else {
        this.query = "";
        this.values = [rec.value];
        this.renderList();
        this.sync(true);
        this.close(true);
      }
    }
    setValues(values, fire) {
      this.values = values;
      this.renderList();
      this.sync(fire);
    }
    reset() {
      this.values = this.initial.slice();
      this.query = "";
      this.renderList();
      this.sync(false);
    }
    open() {
      if (this.isDisabled || this.isOpen) return;
      this.query = "";
      if (this.search) this.search.value = "";
      this.renderList();
      this.panel.style.minWidth = `${this.wrap.offsetWidth}px`;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.owner.setAttribute("aria-expanded", "true");
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      if (this.search) this.search.focus();
      if (this.input) this.input.select();
      const el = this.el(this.active);
      if (el) el.scrollIntoView({ block: "nearest" });
      emit(this, "tsl-open", {});
    }
    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.owner.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      this.query = "";
      if (this.search) this.search.value = "";
      this.showSelection();
      if (returnFocus) (this.inline ? this.input : this.trigger).focus();
      emit(this, "tsl-close", {});
    }
    // ---- Presentación y formulario ------------------------------------------------
    showSelection() {
      if (this.inline) {
        this.input.value = this.multiple ? "" : this.values[0] ? this.labelOf(this.values[0]) : "";
        this.input.placeholder = this.multiple && this.values.length ? this.values.map((v) => this.labelOf(v)).join(", ") : this.getAttribute("placeholder") || "";
        return;
      }
      this.valueEl.textContent = "";
      if (!this.values.length) {
        this.valueEl.classList.add("is-placeholder");
        this.valueEl.textContent = this.getAttribute("placeholder") || "Selecciona…";
      } else if (this.multiple) {
        this.valueEl.classList.remove("is-placeholder");
        const max = parseInt(this.getAttribute("max-chips") || "3", 10);
        this.values.slice(0, max).forEach((v) => {
          const chip = document.createElement("span");
          chip.className = "tsl-select__chip";
          chip.textContent = this.labelOf(v);
          this.valueEl.appendChild(chip);
        });
        if (this.values.length > max) {
          const more = document.createElement("span");
          more.className = "tsl-select__chip tsl-select__chip--more";
          more.textContent = `+${this.values.length - max}`;
          this.valueEl.appendChild(more);
        }
      } else {
        this.valueEl.classList.remove("is-placeholder");
        this.valueEl.textContent = this.labelOf(this.values[0]);
      }
    }
    sync(fire) {
      this.showSelection();
      this.clearBtn.hidden = !this.values.length;
      this.syncDisabled();
      if (this.multiple) {
        const fd = new FormData();
        this.values.forEach((v) => fd.append(this.name, v));
        this.publish(this.values.length ? fd : null, !this.values.length, this.trigger);
      } else {
        this.publish(this.values.length ? this.values[0] : null, !this.values.length, this.trigger);
      }
      if (fire) emit(this, "tsl-change", { value: this.value, values: this.values.slice() });
    }
    syncDisabled() {
      if (!this.trigger) return;
      const d = this.isDisabled;
      if (this.input) this.input.disabled = d;
      else this.trigger.disabled = d;
      this.clearBtn.disabled = d;
      if (d) this.close();
    }
  };
  var TslCombobox = class extends TslSelect {
    setup() {
      this.setAttribute("autocomplete", "");
      super.setup();
    }
  };
  define("tsl-select", TslSelect);
  define("tsl-combobox", TslCombobox);

  // src/components/date-picker.js
  var TslDatePicker = class extends TslFormElement {
    setup() {
      this.range = this.hasAttribute("range");
      this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
      this.initial = this.getAttribute("value") || "";
      this.val = this.initial;
      this.build();
      this.sync(false);
    }
    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "tsl-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "tsl-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<svg class="tsl-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="tsl-trigger__value"></span>`;
      this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
      this.wrap.appendChild(this.trigger);
      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "tsl-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar fecha");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);
      this.panel = document.createElement("div");
      this.panel.className = "tsl-popover__panel tsl-date__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || (this.range ? "Elegir intervalo de fechas" : "Elegir fecha"));
      this.cal = document.createElement("tsl-calendar");
      ["locale", "week-start", "min", "max"].forEach((a) => this.hasAttribute(a) && this.cal.setAttribute(a, this.getAttribute(a)));
      if (this.range) this.cal.setAttribute("mode", "range");
      this.cal.setAttribute("months", this.getAttribute("months") || (this.range ? "2" : "1"));
      if (this.val) this.cal.setAttribute("value", this.val);
      this.panel.appendChild(this.cal);
      this.append(this.wrap, this.panel);
      this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open());
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
      this.cal.addEventListener("tsl-change", (e) => {
        e.stopPropagation();
        if (this.range && !e.detail.complete) return;
        this.set(e.detail.value, true);
        this.close(true);
      });
      this.clearBtn.addEventListener("click", () => {
        this.set("", true);
        this.trigger.focus();
      });
    }
    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }
    get value() {
      return this.val;
    }
    set value(v) {
      this.set(v || "", false);
    }
    get start() {
      return this.val.split("/")[0] || "";
    }
    get end() {
      return this.range ? this.val.split("/")[1] || "" : "";
    }
    set(v, fire) {
      this.val = v;
      if (this.cal._tslReady) this.cal.value = v;
      else if (v) this.cal.setAttribute("value", v);
      else this.cal.removeAttribute("value");
      this.sync(fire);
    }
    reset() {
      this.set(this.initial, false);
    }
    format(iso) {
      const d = fromISO(iso);
      return d ? new Intl.DateTimeFormat(this.locale, { dateStyle: this.getAttribute("date-style") || "medium" }).format(d) : "";
    }
    sync(fire) {
      const [a, b] = this.val.split("/");
      this.valueEl.classList.toggle("is-placeholder", !a);
      this.valueEl.textContent = a ? this.range ? `${this.format(a)} – ${this.format(b)}` : this.format(a) : this.getAttribute("placeholder") || (this.range ? "Elige un intervalo" : "Elige una fecha");
      this.clearBtn.hidden = !a;
      this.syncDisabled();
      this.publish(a ? this.val : null, !a, this.trigger);
      if (fire) emit(this, "tsl-change", { value: this.val, start: this.start, end: this.end });
    }
    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      this.clearBtn.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }
    open() {
      if (this.isDisabled || this.isOpen) return;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      const day = this.cal.querySelector('.tsl-cal__day[tabindex="0"]');
      if (day) day.focus();
      emit(this, "tsl-open", {});
    }
    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "tsl-close", {});
    }
  };
  define("tsl-date-picker", TslDatePicker);

  // src/components/time-picker.js
  var TslTimePicker = class extends TslFormElement {
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
      this.step = Math.max(1, parseInt(this.getAttribute("step") || "5", 10));
      this.h12 = this.hasAttribute("hour12");
      this.initial = this.getAttribute("value") || "";
      const t = this.parse(this.initial);
      this.h = t ? t[0] : null;
      this.m = t ? t[1] : null;
      this.period = this.h !== null && this.h >= 12 ? "PM" : "AM";
      this.build();
      this.sync(false);
    }
    parse(v) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(v || "");
      return m && +m[1] < 24 && +m[2] < 60 ? [+m[1], +m[2]] : null;
    }
    minutesOf(attr) {
      const t = this.parse(this.getAttribute(attr));
      return t ? t[0] * 60 + t[1] : null;
    }
    outOfRange(total) {
      const lo = this.minutesOf("min");
      const hi = this.minutesOf("max");
      return lo !== null && total < lo || hi !== null && total > hi;
    }
    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "tsl-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "tsl-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<svg class="tsl-trigger__lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="tsl-trigger__value"></span>`;
      this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
      this.wrap.appendChild(this.trigger);
      this.clearBtn = document.createElement("button");
      this.clearBtn.type = "button";
      this.clearBtn.className = "tsl-trigger__clear";
      this.clearBtn.setAttribute("aria-label", this.getAttribute("clear-label") || "Limpiar hora");
      this.clearBtn.textContent = "✕";
      this.clearBtn.hidden = true;
      if (this.hasAttribute("clearable")) this.wrap.appendChild(this.clearBtn);
      this.panel = document.createElement("div");
      this.panel.className = "tsl-popover__panel tsl-time__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir hora");
      this.cols = document.createElement("div");
      this.cols.className = "tsl-time__cols";
      this.panel.appendChild(this.cols);
      this.append(this.wrap, this.panel);
      this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open());
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.cols.addEventListener("click", (e) => {
        const opt = e.target.closest(".tsl-time__opt");
        if (opt && !opt.disabled) this.pick(opt.closest(".tsl-time__col").dataset.col, opt.dataset.v, true);
      });
      this.cols.addEventListener("keydown", (e) => this.onKey(e));
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
      this.clearBtn.addEventListener("click", () => {
        this.h = this.m = null;
        this.sync(true);
        this.trigger.focus();
      });
    }
    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }
    get value() {
      return this.h === null ? "" : `${pad(this.h)}:${pad(this.m === null ? 0 : this.m)}`;
    }
    set value(v) {
      const t = this.parse(v);
      this.h = t ? t[0] : null;
      this.m = t ? t[1] : null;
      if (t) this.period = t[0] >= 12 ? "PM" : "AM";
      this.sync(false);
    }
    reset() {
      this.value = this.initial;
    }
    // ---- Columnas -------------------------------------------------------------
    renderCols() {
      const hours = [];
      if (this.h12) for (let i = 1; i <= 12; i++) hours.push(i);
      else for (let i = 0; i < 24; i++) hours.push(i);
      const mins = [];
      for (let i = 0; i < 60; i += this.step) mins.push(i);
      if (this.m !== null && !mins.includes(this.m)) mins.push(this.m), mins.sort((a, b) => a - b);
      const hourSel = this.h === null ? null : this.h12 ? this.h % 12 || 12 : this.h;
      const col = (key, label, items) => `<div class="tsl-time__col" role="listbox" aria-label="${label}" data-col="${key}">${items.map((it) => `<button type="button" role="option" class="tsl-time__opt" data-v="${it.v}" aria-selected="${it.sel}" tabindex="${it.sel ? 0 : -1}"${it.off ? " disabled" : ""}>${it.t}</button>`).join("")}</div>`;
      const h24 = (n) => this.h12 ? n % 12 + (this.period === "PM" ? 12 : 0) : n;
      const hItems = hours.map((n) => {
        const t = h24(n);
        return { v: n, t: pad(n), sel: n === hourSel, off: this.outOfRange(t * 60 + 59) && this.outOfRange(t * 60) };
      });
      const mItems = mins.map((n) => ({ v: n, t: pad(n), sel: n === this.m, off: this.h !== null && this.outOfRange(this.h * 60 + n) }));
      let html = col("h", this.getAttribute("hour-label") || "Hora", hItems) + col("m", this.getAttribute("minute-label") || "Minutos", mItems);
      if (this.h12) {
        html += col("p", "AM/PM", ["AM", "PM"].map((p) => ({ v: p, t: p, sel: p === this.period, off: false })));
      }
      this.cols.innerHTML = html;
      this.cols.querySelectorAll(".tsl-time__col").forEach((c) => {
        if (!c.querySelector('[tabindex="0"]')) {
          const first = c.querySelector(".tsl-time__opt:not([disabled])");
          if (first) first.tabIndex = 0;
        }
      });
    }
    pick(colKey, v, userClick) {
      if (colKey === "h") {
        const n = +v;
        this.h = this.h12 ? n % 12 + (this.period === "PM" ? 12 : 0) : n;
        if (this.m === null) this.m = 0;
      } else if (colKey === "m") {
        this.m = +v;
        if (this.h === null) this.h = this.h12 && this.period === "PM" ? 12 : 0;
      } else {
        this.period = v;
        if (this.h !== null) this.h = this.h % 12 + (v === "PM" ? 12 : 0);
      }
      this.sync(true);
      this.renderCols();
      const sel = this.cols.querySelector(`[data-col="${colKey}"] [aria-selected="true"]`);
      if (sel) sel.focus();
      if (userClick && (colKey === "m" || colKey === "p")) this.close(true);
    }
    onKey(e) {
      const opt = e.target.closest(".tsl-time__opt");
      if (!opt) return;
      const colEl = opt.closest(".tsl-time__col");
      const key = colEl.dataset.col;
      const opts = Array.from(colEl.querySelectorAll(".tsl-time__opt:not([disabled])"));
      const i = opts.indexOf(opt);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = opts[Math.max(0, Math.min(opts.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
        if (next && next !== opt) this.pick(key, next.dataset.v, false);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        this.pick(key, opts[e.key === "Home" ? 0 : opts.length - 1].dataset.v, false);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const cols = Array.from(this.cols.querySelectorAll(".tsl-time__col"));
        const target = cols[cols.indexOf(colEl) + (e.key === "ArrowRight" ? 1 : -1)];
        if (target) (target.querySelector('[aria-selected="true"]') || target.querySelector(".tsl-time__opt:not([disabled])")).focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (opt.disabled) return;
        this.pick(key, opt.dataset.v, true);
        if (key === "h") {
          const m = this.cols.querySelector('[data-col="m"] [aria-selected="true"]') || this.cols.querySelector('[data-col="m"] .tsl-time__opt');
          if (m) m.focus();
        }
      }
    }
    // ---- Presentación -----------------------------------------------------------
    format() {
      if (this.h === null) return "";
      return new Intl.DateTimeFormat(this.locale, { hour: "numeric", minute: "2-digit", hour12: this.h12 }).format(new Date(2e3, 0, 1, this.h, this.m || 0));
    }
    sync(fire) {
      this.valueEl.classList.toggle("is-placeholder", this.h === null);
      this.valueEl.textContent = this.h === null ? this.getAttribute("placeholder") || "Elige una hora" : this.format();
      this.clearBtn.hidden = this.h === null;
      this.syncDisabled();
      this.publish(this.h === null ? null : this.value, this.h === null, this.trigger);
      if (fire) emit(this, "tsl-change", { value: this.value });
    }
    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      this.clearBtn.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }
    open() {
      if (this.isDisabled || this.isOpen) return;
      this.renderCols();
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      this.cols.querySelectorAll(".tsl-time__col").forEach((c) => {
        const sel = c.querySelector('[aria-selected="true"]');
        if (sel) c.scrollTop = sel.offsetTop - c.clientHeight / 2 + sel.offsetHeight / 2;
      });
      const first = this.cols.querySelector('[aria-selected="true"]') || this.cols.querySelector(".tsl-time__opt:not([disabled])");
      if (first) first.focus({ preventScroll: true });
      emit(this, "tsl-open", {});
    }
    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "tsl-close", {});
    }
  };
  define("tsl-time-picker", TslTimePicker);

  // src/components/bar.js
  var TslBar = class extends TslElement {
    get isMenubar() {
      return this.localName === "tsl-menubar";
    }
    setup() {
      this.setAttribute("role", this.isMenubar ? "menubar" : "navigation");
      this.entries = Array.from(this.querySelectorAll(":scope > .tsl-bar__item")).map((root2) => {
        const isLink = root2.tagName === "A";
        const trigger = isLink ? root2 : root2.querySelector(":scope > [data-tsl-trigger]") || root2.querySelector(":scope > button");
        const panel = isLink ? null : root2.querySelector(":scope > .tsl-menu__list, :scope > .tsl-bar__panel");
        return { root: root2, trigger, panel };
      }).filter((e) => e.trigger);
      this.current = null;
      this.stops = this.entries.map((e) => e.trigger);
      this.entries.forEach((entry) => {
        const { trigger, panel } = entry;
        if (this.isMenubar) trigger.setAttribute("role", "menuitem");
        if (!panel) return;
        panel.id = panel.id || nextId("tsl-bar-panel");
        panel.setAttribute("popover", "manual");
        if (this.isMenubar) panel.setAttribute("role", "menu");
        trigger.setAttribute("aria-haspopup", this.isMenubar ? "menu" : "true");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", panel.id);
        this.prepareList(panel);
        trigger.addEventListener("click", (e) => {
          if (this.current === entry) this.closeAll(false);
          else this.open(entry, e.detail === 0 ? "first" : null);
        });
        if (this.isMenubar) {
          trigger.addEventListener("pointerenter", () => {
            if (this.current && this.current !== entry) this.open(entry);
          });
        } else {
          const delay = parseInt(this.getAttribute("hover-delay") || "120", 10);
          entry.root.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "touch") return;
            clearTimeout(this.hoverTimer);
            this.hoverTimer = setTimeout(() => this.open(entry), this.current ? 0 : delay);
          });
          entry.root.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "touch") return;
            clearTimeout(this.hoverTimer);
            this.hoverTimer = setTimeout(() => this.current === entry && this.closeAll(false), 220);
          });
        }
      });
      if (this.isMenubar && this.stops.length) {
        this.stops.forEach((s, i) => s.tabIndex = i === 0 ? 0 : -1);
        this.addEventListener("focusin", (e) => {
          const idx = this.stops.indexOf(e.target);
          if (idx !== -1) this.stops.forEach((s, i) => s.tabIndex = i === idx ? 0 : -1);
        });
      }
      this.addEventListener("keydown", (e) => this.onKey(e));
      this.addEventListener("click", (e) => this.onItemClick(e));
    }
    // Roles y submenús de una lista de menú
    prepareList(list) {
      if (!this.isMenubar) return;
      list.querySelectorAll(":scope > .tsl-menu__item, :scope > .tsl-menu__sub > .tsl-menu__item").forEach((item) => {
        item.tabIndex = -1;
        item.setAttribute("role", item.hasAttribute("data-check") ? "menuitemcheckbox" : "menuitem");
      });
      list.querySelectorAll(":scope > .tsl-menu__sub").forEach((sub) => {
        const parent = sub.querySelector(":scope > .tsl-menu__item");
        const child = sub.querySelector(":scope > .tsl-menu__list");
        if (!parent || !child) return;
        child.id = child.id || nextId("tsl-bar-sub");
        child.setAttribute("popover", "manual");
        child.setAttribute("role", "menu");
        parent.setAttribute("aria-haspopup", "menu");
        parent.setAttribute("aria-expanded", "false");
        parent.setAttribute("aria-controls", child.id);
        this.prepareList(child);
        const timer = {};
        sub.addEventListener("pointerenter", (e) => {
          if (e.pointerType === "touch") return;
          clearTimeout(timer.t);
          timer.t = setTimeout(() => this.openSub(sub), 150);
        });
        sub.addEventListener("pointerleave", () => {
          clearTimeout(timer.t);
          timer.t = setTimeout(() => this.closeSub(sub), 200);
        });
      });
    }
    itemsOf(list) {
      return Array.from(list.querySelectorAll(":scope > .tsl-menu__item:not([disabled]), :scope > .tsl-menu__sub > .tsl-menu__item:not([disabled])"));
    }
    // ---- Abrir / cerrar -------------------------------------------------------
    open(entry, focus) {
      if (!entry.panel) return;
      if (this.current && this.current !== entry) this.closeAll(false);
      if (!entry.panel.matches(":popover-open")) {
        entry.panel.showPopover();
        position(entry.trigger, entry.panel, { placement: "bottom-start", offset: 4 });
        entry.trigger.setAttribute("aria-expanded", "true");
        this.current = entry;
        this.outside = (e) => {
          if (!this.contains(e.target)) this.closeAll(false);
        };
        this.reposition = () => position(entry.trigger, entry.panel, { placement: "bottom-start", offset: 4 });
        document.addEventListener("pointerdown", this.outside, true);
        window.addEventListener("scroll", this.reposition, true);
        window.addEventListener("resize", this.reposition);
        emit(this, "tsl-open", { item: entry.trigger.textContent.trim() });
      }
      if (focus) this.focusIn(entry.panel, focus);
    }
    focusIn(panel, which) {
      if (this.isMenubar) {
        const items = this.itemsOf(panel);
        const target = which === "last" ? items[items.length - 1] : items[0];
        if (target) target.focus();
      } else {
        const target = panel.querySelector(FOCUSABLE);
        if (target) target.focus();
      }
    }
    openSub(sub) {
      const parent = sub.querySelector(":scope > .tsl-menu__item");
      const child = sub.querySelector(":scope > .tsl-menu__list");
      if (!child || child.matches(":popover-open")) return;
      sub.parentElement.querySelectorAll(":scope > .tsl-menu__sub").forEach((s) => s !== sub && this.closeSub(s));
      child.showPopover();
      position(parent, child, { placement: "right-start", offset: 2 });
      parent.setAttribute("aria-expanded", "true");
    }
    closeSub(sub) {
      const parent = sub.querySelector(":scope > .tsl-menu__item");
      const child = sub.querySelector(":scope > .tsl-menu__list");
      if (!child || !child.matches(":popover-open")) return;
      child.querySelectorAll(":scope > .tsl-menu__sub").forEach((s) => this.closeSub(s));
      child.hidePopover();
      parent.setAttribute("aria-expanded", "false");
    }
    closeAll(returnFocus) {
      const entry = this.current;
      if (!entry) return;
      clearTimeout(this.hoverTimer);
      entry.panel.querySelectorAll(".tsl-menu__sub").forEach((s) => this.closeSub(s));
      if (entry.panel.matches(":popover-open")) entry.panel.hidePopover();
      entry.trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", this.outside, true);
      window.removeEventListener("scroll", this.reposition, true);
      window.removeEventListener("resize", this.reposition);
      this.current = null;
      if (returnFocus) entry.trigger.focus();
      emit(this, "tsl-close", {});
    }
    // ---- Teclado --------------------------------------------------------------
    onKey(e) {
      const t = e.target;
      const k = e.key;
      const stopIdx = this.stops.indexOf(t);
      if (stopIdx !== -1) {
        const entry = this.entries[stopIdx];
        if (k === "ArrowRight" || k === "ArrowLeft") {
          e.preventDefault();
          const next = this.entries[(stopIdx + (k === "ArrowRight" ? 1 : -1) + this.entries.length) % this.entries.length];
          next.trigger.focus();
          if (this.current && next.panel) this.open(next, this.isMenubar ? "first" : null);
        } else if (k === "Home" || k === "End") {
          e.preventDefault();
          this.stops[k === "Home" ? 0 : this.stops.length - 1].focus();
        } else if (k === "ArrowDown" && entry.panel) {
          e.preventDefault();
          this.open(entry, "first");
        } else if (k === "ArrowUp" && entry.panel && this.isMenubar) {
          e.preventDefault();
          this.open(entry, "last");
        } else if (k === "Escape" && this.current) {
          e.preventDefault();
          this.closeAll(true);
        }
        return;
      }
      const panel = this.current && this.current.panel;
      if (!panel || !panel.contains(t)) return;
      if (k === "Escape") {
        e.preventDefault();
        const list2 = t.closest(".tsl-menu__list");
        const sub = list2 && list2.parentElement.classList.contains("tsl-menu__sub") ? list2.parentElement : null;
        if (sub && this.isMenubar) {
          this.closeSub(sub);
          sub.querySelector(":scope > .tsl-menu__item").focus();
        } else this.closeAll(true);
        return;
      }
      if (k === "Tab") {
        this.closeAll(false);
        return;
      }
      if (!this.isMenubar) return;
      const list = t.closest(".tsl-menu__list");
      const items = this.itemsOf(list);
      const isSubParent = t.hasAttribute("data-submenu");
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
        const next = moveFocus(items, t, k);
        if (next) {
          e.preventDefault();
          next.focus();
        }
      } else if (k === "ArrowRight" && isSubParent) {
        e.preventDefault();
        const sub = t.parentElement;
        this.openSub(sub);
        this.focusIn(sub.querySelector(":scope > .tsl-menu__list"), "first");
      } else if (k === "ArrowLeft" && list.parentElement.classList.contains("tsl-menu__sub")) {
        e.preventDefault();
        const sub = list.parentElement;
        this.closeSub(sub);
        sub.querySelector(":scope > .tsl-menu__item").focus();
      } else if (k === "ArrowRight" || k === "ArrowLeft") {
        e.preventDefault();
        const i = this.entries.indexOf(this.current);
        const next = this.entries[(i + (k === "ArrowRight" ? 1 : -1) + this.entries.length) % this.entries.length];
        next.trigger.focus();
        if (next.panel) this.open(next, "first");
      } else if (k === "Enter" || k === " ") {
        if (isSubParent) {
          e.preventDefault();
          const sub = t.parentElement;
          this.openSub(sub);
          this.focusIn(sub.querySelector(":scope > .tsl-menu__list"), "first");
        }
      }
    }
    onItemClick(e) {
      const item = e.target.closest(".tsl-menu__item");
      if (item && this.isMenubar && this.contains(item)) {
        if (item.disabled || item.getAttribute("aria-disabled") === "true") return;
        if (item.hasAttribute("data-submenu")) {
          this.openSub(item.parentElement);
          return;
        }
        const detail = { value: item.dataset.value || item.textContent.trim(), item };
        if (item.hasAttribute("data-check")) {
          const on = item.getAttribute("aria-checked") !== "true";
          item.setAttribute("aria-checked", String(on));
          detail.checked = on;
        }
        emit(this, "tsl-select", detail);
        this.closeAll(true);
      } else if (!this.isMenubar && this.current && this.current.panel.contains(e.target) && e.target.closest("a[href], button")) {
        emit(this, "tsl-select", { value: e.target.closest("a, button").textContent.trim() });
        this.closeAll(false);
      }
    }
  };
  var TslMenubar = class extends TslBar {
  };
  var TslNavMenu = class extends TslBar {
  };
  define("tsl-menubar", TslMenubar);
  define("tsl-nav-menu", TslNavMenu);

  // src/components/slider.js
  var decimalsOf = (n) => (String(n).split(".")[1] || "").length;
  var TslSlider = class extends TslFormElement {
    setup() {
      this.min = parseFloat(this.getAttribute("min") || "0");
      this.max = parseFloat(this.getAttribute("max") || "100");
      this.step = parseFloat(this.getAttribute("step") || "1") || 1;
      const raw = this.getAttribute("value") || "";
      this.range = this.hasAttribute("range") || raw.includes(",");
      let vals = raw.split(",").map(Number).filter(Number.isFinite);
      const span = this.max - this.min;
      if (this.range) {
        if (vals.length < 2) vals = [this.min + span * 0.25, this.min + span * 0.75];
        vals = vals.slice(0, 2).map((v) => this.snap(v)).sort((a, b) => a - b);
      } else {
        vals = [this.snap(vals.length ? vals[0] : this.min)];
      }
      this.initial = vals.slice();
      this.vals = vals.slice();
      this.drag = null;
      this.build();
      this.update(false);
    }
    snap(v) {
      const stepped = Math.round((clamp(v, this.min, this.max) - this.min) / this.step) * this.step + this.min;
      return clamp(Number(stepped.toFixed(decimalsOf(this.step) + decimalsOf(this.min))), this.min, this.max);
    }
    build() {
      this.textContent = "";
      this.track = document.createElement("div");
      this.track.className = "tsl-slider__track";
      this.fill = document.createElement("div");
      this.fill.className = "tsl-slider__fill";
      this.track.appendChild(this.fill);
      this.thumbs = this.vals.map((_, i) => {
        const t = document.createElement("div");
        t.className = "tsl-slider__thumb";
        t.setAttribute("role", "slider");
        t.setAttribute("aria-orientation", "horizontal");
        t.setAttribute("aria-valuemin", String(this.min));
        t.setAttribute("aria-valuemax", String(this.max));
        const label = this.getAttribute("label") || "Valor";
        t.setAttribute("aria-label", this.range ? `${label}: ${i === 0 ? "mínimo" : "máximo"}` : label);
        t.dataset.i = String(i);
        this.track.appendChild(t);
        return t;
      });
      this.appendChild(this.track);
      this.track.addEventListener("pointerdown", (e) => {
        if (this.isDisabled || e.button !== 0) return;
        e.preventDefault();
        const v = this.valueAt(e.clientX);
        let i = this.thumbs.indexOf(e.target.closest(".tsl-slider__thumb"));
        if (i === -1) {
          i = 0;
          if (this.range) i = Math.abs(v - this.vals[0]) < Math.abs(v - this.vals[1]) || v === this.vals[0] && v === this.vals[1] && v < this.max ? 0 : 1;
        }
        this.drag = i;
        this.thumbs[i].focus();
        this.track.setPointerCapture(e.pointerId);
        this.classList.add("is-dragging");
        this.setThumb(i, v, false);
      });
      this.track.addEventListener("pointermove", (e) => {
        if (this.drag !== null) this.setThumb(this.drag, this.valueAt(e.clientX), false);
      });
      const end = () => {
        if (this.drag === null) return;
        this.drag = null;
        this.classList.remove("is-dragging");
        emit(this, "tsl-change", { value: this.value, values: this.vals.slice() });
      };
      this.track.addEventListener("pointerup", end);
      this.track.addEventListener("pointercancel", end);
      this.thumbs.forEach((t, i) => t.addEventListener("keydown", (e) => this.onKey(e, i)));
    }
    valueAt(clientX) {
      const r = this.track.getBoundingClientRect();
      return this.min + clamp((clientX - r.left) / r.width, 0, 1) * (this.max - this.min);
    }
    onKey(e, i) {
      if (this.isDisabled) return;
      const k = e.key;
      const cur = this.vals[i];
      let next = null;
      if (k === "ArrowRight" || k === "ArrowUp") next = cur + this.step;
      else if (k === "ArrowLeft" || k === "ArrowDown") next = cur - this.step;
      else if (k === "PageUp") next = cur + this.step * 10;
      else if (k === "PageDown") next = cur - this.step * 10;
      else if (k === "Home") next = this.min;
      else if (k === "End") next = this.max;
      if (next === null) return;
      e.preventDefault();
      this.setThumb(i, next, true);
    }
    setThumb(i, v, commit) {
      v = this.snap(v);
      if (this.range) v = i === 0 ? Math.min(v, this.vals[1]) : Math.max(v, this.vals[0]);
      if (v === this.vals[i]) return;
      this.vals[i] = v;
      this.update(true);
      if (commit) emit(this, "tsl-change", { value: this.value, values: this.vals.slice() });
    }
    get value() {
      return this.vals.join(",");
    }
    set value(v) {
      const vals = String(v).split(",").map(Number).filter(Number.isFinite).map((n) => this.snap(n));
      if (vals.length !== this.vals.length) return;
      this.vals = this.range ? vals.sort((a, b) => a - b) : vals;
      this.update(false);
    }
    get values() {
      return this.vals.slice();
    }
    reset() {
      this.vals = this.initial.slice();
      this.update(false);
    }
    syncDisabled() {
      if (!this.thumbs) return;
      this.toggleAttribute("aria-disabled", this.isDisabled);
      this.thumbs.forEach((t) => t.tabIndex = this.isDisabled ? -1 : 0);
    }
    update(fireInput) {
      const span = this.max - this.min || 1;
      const pct = this.vals.map((v) => (v - this.min) / span * 100);
      const prefix = this.getAttribute("prefix") || "";
      const suffix = this.getAttribute("suffix") || "";
      this.thumbs.forEach((t, i) => {
        t.style.setProperty("--p", `${pct[i]}%`);
        t.setAttribute("aria-valuenow", String(this.vals[i]));
        t.setAttribute("aria-valuetext", `${prefix}${this.vals[i]}${suffix}`);
        t.dataset.value = `${prefix}${this.vals[i]}${suffix}`;
        t.style.zIndex = this.range && this.vals[0] === this.vals[1] ? i === 0 ? pct[0] > 50 ? 2 : 1 : pct[1] > 50 ? 1 : 2 : "";
      });
      this.fill.style.left = this.range ? `${pct[0]}%` : "0";
      this.fill.style.width = this.range ? `${pct[1] - pct[0]}%` : `${pct[0]}%`;
      this.syncDisabled();
      if (this.range) {
        const fd = new FormData();
        this.vals.forEach((v) => fd.append(this.name, String(v)));
        this.publish(fd, false, this.thumbs[0]);
      } else {
        this.publish(String(this.vals[0]), false, this.thumbs[0]);
      }
      if (fireInput) emit(this, "tsl-input", { value: this.value, values: this.vals.slice() });
    }
  };
  define("tsl-slider", TslSlider);

  // src/components/rating.js
  var STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"/></svg>`;
  var TslRating = class extends TslFormElement {
    setup() {
      this.max = Math.max(1, parseInt(this.getAttribute("max") || "5", 10));
      this.half = this.hasAttribute("half");
      this.stepSize = this.half ? 0.5 : 1;
      this.initial = this.norm(parseFloat(this.getAttribute("value") || "0"));
      this.val = this.initial;
      this.hover = null;
      this.textContent = "";
      this.stars = Array.from({ length: this.max }, () => {
        const s = document.createElement("span");
        s.className = "tsl-rating__star";
        s.innerHTML = `${STAR}<span class="tsl-rating__fill">${STAR}</span>`;
        this.appendChild(s);
        return s;
      });
      this.setAttribute("aria-valuemin", "0");
      this.setAttribute("aria-valuemax", String(this.max));
      this.setAttribute("aria-label", this.getAttribute("label") || "Valoración");
      this.addEventListener("pointermove", (e) => {
        if (this.interactive && e.pointerType !== "touch") {
          this.hover = this.valueAt(e.clientX);
          this.paint();
        }
      });
      this.addEventListener("pointerleave", () => {
        this.hover = null;
        this.paint();
      });
      this.addEventListener("click", (e) => {
        if (!this.interactive) return;
        const v = this.valueAt(e.clientX);
        this.set(this.hasAttribute("clearable") && v === this.val ? 0 : v, true);
        this.focus();
      });
      this.addEventListener("keydown", (e) => {
        if (!this.interactive) return;
        const k = e.key;
        let next = null;
        if (k === "ArrowRight" || k === "ArrowUp") next = this.val + this.stepSize;
        else if (k === "ArrowLeft" || k === "ArrowDown") next = this.val - this.stepSize;
        else if (k === "Home") next = this.hasAttribute("clearable") ? 0 : this.stepSize;
        else if (k === "End") next = this.max;
        else if ((k === "Delete" || k === "Backspace") && this.hasAttribute("clearable")) next = 0;
        if (next === null) return;
        e.preventDefault();
        this.set(next, true);
      });
      this.syncDisabled();
      this.paint();
      this.sync(false);
    }
    get interactive() {
      return !this.hasAttribute("readonly") && !this.isDisabled;
    }
    norm(v) {
      if (!Number.isFinite(v)) return 0;
      return clamp(Math.round(v / this.stepSize) * this.stepSize, 0, this.max);
    }
    valueAt(clientX) {
      for (let i = 0; i < this.stars.length; i++) {
        const r = this.stars[i].getBoundingClientRect();
        if (clientX <= r.right) {
          const frac = clamp((clientX - r.left) / r.width, 0, 1);
          return i + (this.half && frac <= 0.5 ? 0.5 : 1);
        }
      }
      return this.max;
    }
    get value() {
      return this.val;
    }
    set value(v) {
      this.set(parseFloat(v), false);
    }
    set(v, fire) {
      this.val = this.norm(v);
      this.paint();
      this.sync(fire);
    }
    reset() {
      this.set(this.initial, false);
    }
    paint() {
      const shown = this.hover !== null && this.interactive ? this.hover : this.val;
      this.stars.forEach((s, i) => s.style.setProperty("--f", String(clamp(shown - i, 0, 1))));
      this.classList.toggle("is-hovering", this.hover !== null);
    }
    syncDisabled() {
      if (!this.stars) return;
      const ro = this.hasAttribute("readonly");
      this.setAttribute("role", ro ? "img" : "slider");
      if (this.interactive) this.tabIndex = 0;
      else this.removeAttribute("tabindex");
      this.toggleAttribute("aria-disabled", this.isDisabled);
    }
    sync(fire) {
      const text = `${this.val} de ${this.max}`;
      this.setAttribute("aria-valuenow", String(this.val));
      this.setAttribute("aria-valuetext", text);
      if (this.hasAttribute("readonly")) this.setAttribute("aria-label", `${this.getAttribute("label") || "Valoración"}: ${text}`);
      this.publish(this.val ? String(this.val) : null, !this.val, this);
      if (fire) emit(this, "tsl-change", { value: this.val });
    }
  };
  define("tsl-rating", TslRating);

  // src/components/color-picker.js
  var DEFAULT_SWATCHES = "#f43f5e,#f59e0b,#10b981,#0ea5e9,#6366f1,#a855f7,#ec4899,#141415,#8e8e96,#ffffff";
  var TslColorPicker = class extends TslFormElement {
    setup() {
      this.alphaOn = this.hasAttribute("alpha");
      this.initial = this.getAttribute("value") || "#6366f1";
      this.setHex(this.initial, false);
      this.build();
      this.paint();
      this.sync(false);
    }
    setHex(str, fire) {
      const c = parseHex(str);
      if (!c) return false;
      [this.h, this.s, this.v] = rgb2hsv(c.r, c.g, c.b);
      this.a = this.alphaOn ? c.a : 1;
      if (fire) this.sync(true);
      return true;
    }
    get value() {
      return toHex(...hsv2rgb(this.h, this.s, this.v), this.a);
    }
    set value(v) {
      if (this.setHex(v, false) && this.area) {
        this.paint();
        this.sync(false);
      }
    }
    reset() {
      this.value = this.initial;
    }
    build() {
      this.textContent = "";
      this.wrap = document.createElement("div");
      this.wrap.className = "tsl-select__wrap";
      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "tsl-trigger";
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.innerHTML = `<span class="tsl-color__swatch"><span></span></span><span class="tsl-trigger__value tsl-mono"></span>`;
      this.swatchEl = this.trigger.querySelector(".tsl-color__swatch > span");
      this.valueEl = this.trigger.querySelector(".tsl-trigger__value");
      if (this.getAttribute("label")) this.trigger.setAttribute("aria-label", this.getAttribute("label"));
      this.wrap.appendChild(this.trigger);
      this.panel = document.createElement("div");
      this.panel.className = "tsl-popover__panel tsl-color__panel";
      this.panel.setAttribute("popover", "manual");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", this.getAttribute("label") || "Elegir color");
      const slider = (cls, label) => {
        const el = document.createElement("div");
        el.className = cls;
        el.tabIndex = 0;
        el.setAttribute("role", "slider");
        el.setAttribute("aria-label", label);
        const thumb = document.createElement("span");
        thumb.className = "tsl-color__thumb";
        el.appendChild(thumb);
        return el;
      };
      this.area = slider("tsl-color__area", this.getAttribute("area-label") || "Saturación y brillo");
      this.hue = slider("tsl-color__hue", this.getAttribute("hue-label") || "Tono");
      this.hue.setAttribute("aria-valuemin", "0");
      this.hue.setAttribute("aria-valuemax", "360");
      this.panel.append(this.area, this.hue);
      if (this.alphaOn) {
        this.alpha = slider("tsl-color__alpha", this.getAttribute("alpha-label") || "Opacidad");
        this.alpha.setAttribute("aria-valuemin", "0");
        this.alpha.setAttribute("aria-valuemax", "100");
        this.panel.appendChild(this.alpha);
      }
      const row = document.createElement("div");
      row.className = "tsl-color__row";
      this.hexInput = document.createElement("input");
      this.hexInput.className = "tsl-input tsl-mono";
      this.hexInput.spellcheck = false;
      this.hexInput.maxLength = 9;
      this.hexInput.setAttribute("aria-label", "Valor hexadecimal");
      row.appendChild(this.hexInput);
      if ("EyeDropper" in window) {
        const eye = document.createElement("button");
        eye.type = "button";
        eye.className = "tsl-btn tsl-btn--icon";
        eye.setAttribute("aria-label", "Cuentagotas");
        eye.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3z"/></svg>`;
        eye.addEventListener("click", async () => {
          try {
            const { sRGBHex } = await new window.EyeDropper().open();
            this.setHex(sRGBHex, true);
            this.paint();
          } catch (_) {
          }
        });
        row.appendChild(eye);
      }
      this.panel.appendChild(row);
      const swatches = (this.getAttribute("swatches") || DEFAULT_SWATCHES).split(",").map((s) => s.trim()).filter(Boolean);
      if (swatches.length && this.getAttribute("swatches") !== "") {
        const sw = document.createElement("div");
        sw.className = "tsl-color__swatches";
        swatches.forEach((hex) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "tsl-color__chip";
          b.style.setProperty("--c", hex);
          b.setAttribute("aria-label", hex);
          b.dataset.hex = hex;
          sw.appendChild(b);
        });
        sw.addEventListener("click", (e) => {
          const b = e.target.closest(".tsl-color__chip");
          if (b && this.setHex(b.dataset.hex, true)) this.paint();
        });
        this.panel.appendChild(sw);
      }
      this.append(this.wrap, this.panel);
      this.drag(this.area, (x, y) => {
        this.s = x;
        this.v = 1 - y;
      });
      this.drag(this.hue, (x) => this.h = x * 360);
      if (this.alpha) this.drag(this.alpha, (x) => this.a = Math.round(x * 100) / 100);
      this.keys(this.area, (e) => {
        const d = e.shiftKey ? 0.1 : 0.01;
        if (e.key === "ArrowRight") this.s = clamp(this.s + d, 0, 1);
        else if (e.key === "ArrowLeft") this.s = clamp(this.s - d, 0, 1);
        else if (e.key === "ArrowUp") this.v = clamp(this.v + d, 0, 1);
        else if (e.key === "ArrowDown") this.v = clamp(this.v - d, 0, 1);
        else return false;
      });
      this.keys(this.hue, (e) => {
        const d = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") this.h = clamp(this.h + d, 0, 360);
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.h = clamp(this.h - d, 0, 360);
        else return false;
      });
      if (this.alpha) {
        this.keys(this.alpha, (e) => {
          const d = e.shiftKey ? 0.1 : 0.01;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") this.a = clamp(Math.round((this.a + d) * 100) / 100, 0, 1);
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this.a = clamp(Math.round((this.a - d) * 100) / 100, 0, 1);
          else return false;
        });
      }
      const commitHex = () => {
        if (this.setHex(this.hexInput.value, true)) this.paint();
        else this.hexInput.value = this.value;
      };
      this.hexInput.addEventListener("change", commitHex);
      this.hexInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitHex();
        }
      });
      this.trigger.addEventListener("click", () => this.isOpen ? this.close() : this.open());
      this.trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      });
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close(true);
        }
      });
      this.panel.addEventListener("focusout", (e) => {
        if (this.isOpen && e.relatedTarget && !this.contains(e.relatedTarget)) this.close();
      });
    }
    // Arrastre con puntero: fn recibe (x, y) normalizados 0..1
    drag(el, fn) {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        fn(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
        this.paint();
        this.sync(false, true);
      };
      el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        el.focus();
        el.setPointerCapture(e.pointerId);
        el._dragging = true;
        move(e);
      });
      el.addEventListener("pointermove", (e) => el._dragging && move(e));
      const end = () => {
        if (!el._dragging) return;
        el._dragging = false;
        this.sync(true);
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    }
    keys(el, fn) {
      el.addEventListener("keydown", (e) => {
        if (fn(e) === false) return;
        e.preventDefault();
        this.paint();
        this.sync(true);
      });
    }
    paint() {
      const [r, g, b] = hsv2rgb(this.h, this.s, this.v);
      const hue = `hsl(${this.h} 100% 50%)`;
      this.panel.style.setProperty("--hue", hue);
      this.panel.style.setProperty("--rgb", `${r} ${g} ${b}`);
      this.area.firstChild.style.left = `${this.s * 100}%`;
      this.area.firstChild.style.top = `${(1 - this.v) * 100}%`;
      this.area.setAttribute("aria-valuetext", `Saturación ${Math.round(this.s * 100)}%, brillo ${Math.round(this.v * 100)}%`);
      this.hue.firstChild.style.left = `${this.h / 360 * 100}%`;
      this.hue.setAttribute("aria-valuenow", String(Math.round(this.h)));
      if (this.alpha) {
        this.alpha.firstChild.style.left = `${this.a * 100}%`;
        this.alpha.setAttribute("aria-valuenow", String(Math.round(this.a * 100)));
      }
      if (document.activeElement !== this.hexInput) this.hexInput.value = this.value;
    }
    sync(fire, live) {
      const hex = this.value;
      this.swatchEl.style.background = hex;
      this.valueEl.textContent = hex;
      if (document.activeElement !== this.hexInput && this.hexInput) this.hexInput.value = hex;
      this.syncDisabled();
      this.publish(hex, false, this.trigger);
      if (live) emit(this, "tsl-input", { value: hex });
      else if (fire) emit(this, "tsl-change", { value: hex });
    }
    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }
    syncDisabled() {
      if (!this.trigger) return;
      this.trigger.disabled = this.isDisabled;
      if (this.isDisabled) this.close();
    }
    open() {
      if (this.isDisabled || this.isOpen) return;
      this.panel.showPopover();
      position(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.trigger.setAttribute("aria-expanded", "true");
      this.stopPos = trackPosition(this.wrap, this.panel, { placement: "bottom-start", offset: 4 });
      this.stopOutside = dismissOnOutside(this, this.panel, () => this.close());
      this.paint();
      this.area.focus();
      emit(this, "tsl-open", {});
    }
    close(returnFocus = false) {
      if (!this.isOpen) return;
      this.panel.hidePopover();
      this.trigger.setAttribute("aria-expanded", "false");
      if (this.stopPos) this.stopPos();
      if (this.stopOutside) this.stopOutside();
      this.stopPos = this.stopOutside = null;
      if (returnFocus) this.trigger.focus();
      emit(this, "tsl-close", {});
    }
  };
  define("tsl-color-picker", TslColorPicker);

  // src/components/password.js
  var PW_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  var PW_COLORS = ["var(--tsl-danger)", "var(--tsl-danger)", "var(--tsl-warning)", "var(--tsl-info)", "var(--tsl-success)"];
  function passwordScore(v, min) {
    return [v.length >= min, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
  }
  var TslPassword = class extends TslElement {
    setup() {
      this.min = parseInt(this.getAttribute("min-length") || "8", 10);
      let input = this.querySelector("input");
      if (!input) {
        input = document.createElement("input");
        ["name", "placeholder", "required", "autocomplete", "id"].forEach((a) => {
          if (this.hasAttribute(a)) input.setAttribute(a, this.getAttribute(a));
        });
        if (!input.hasAttribute("autocomplete")) input.autocomplete = "new-password";
        if (this.getAttribute("label")) input.setAttribute("aria-label", this.getAttribute("label"));
      }
      this.input = input;
      input.type = "password";
      input.classList.add("tsl-input");
      const group = document.createElement("div");
      group.className = "tsl-input-group";
      this.toggle = document.createElement("button");
      this.toggle.type = "button";
      this.toggle.className = "tsl-btn tsl-btn--subtle tsl-btn--sm";
      this.toggle.style.margin = "3px";
      this.toggle.setAttribute("aria-pressed", "false");
      this.paintToggle(false);
      this.toggle.addEventListener("click", () => {
        const show = this.input.type === "password";
        this.input.type = show ? "text" : "password";
        this.paintToggle(show);
        this.input.focus();
      });
      group.append(input, this.toggle);
      this.textContent = "";
      this.appendChild(group);
      if (this.hasAttribute("meter")) {
        const row = document.createElement("div");
        row.className = "tsl-row tsl-password__meter";
        row.style.setProperty("--gap", "8px");
        this.meter = document.createElement("div");
        this.meter.className = "tsl-meter";
        this.meter.style.cssText = "flex:1;height:5px";
        for (let i = 0; i < 4; i++) {
          const seg = document.createElement("span");
          seg.style.setProperty("--w", "25%");
          this.meter.appendChild(seg);
        }
        this.meter.setAttribute("role", "meter");
        this.meter.setAttribute("aria-label", "Seguridad de la contraseña");
        this.meter.setAttribute("aria-valuemin", "0");
        this.meter.setAttribute("aria-valuemax", "4");
        this.labelEl = document.createElement("span");
        this.labelEl.className = "tsl-hint";
        this.labelEl.setAttribute("aria-live", "polite");
        row.append(this.meter, this.labelEl);
        this.appendChild(row);
      }
      input.addEventListener("input", () => this.update(true));
      this.update(false);
    }
    paintToggle(shown) {
      this.toggle.textContent = shown ? this.getAttribute("hide-label") || "Ocultar" : this.getAttribute("show-label") || "Mostrar";
      this.toggle.setAttribute("aria-label", shown ? "Ocultar contraseña" : "Mostrar contraseña");
      this.toggle.setAttribute("aria-pressed", String(shown));
    }
    get value() {
      return this.input.value;
    }
    update(fire) {
      const v = this.input.value;
      const score = passwordScore(v, this.min);
      if (this.meter) {
        this.meter.querySelectorAll("span").forEach((seg, i) => seg.style.setProperty("--c", v && i < score ? PW_COLORS[score] : "transparent"));
        this.meter.setAttribute("aria-valuenow", String(v ? score : 0));
        this.labelEl.textContent = v ? PW_LABELS[score] : "";
      }
      if (fire) emit(this, "tsl-change", { value: v, score });
    }
  };
  define("tsl-password", TslPassword);

  // src/components/mention.js
  var MIRROR_PROPS = ["direction", "boxSizing", "width", "overflowX", "overflowY", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "lineHeight", "fontFamily", "textAlign", "textTransform", "textIndent", "letterSpacing", "wordSpacing", "tabSize"];
  function caretPoint(field) {
    const isInput = field.tagName === "INPUT";
    const cs = getComputedStyle(field);
    const mirror = document.createElement("div");
    MIRROR_PROPS.forEach((p) => mirror.style[p] = cs[p]);
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = isInput ? "pre" : "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.top = "0";
    mirror.style.left = "-9999px";
    mirror.textContent = field.value.slice(0, field.selectionStart);
    const marker = document.createElement("span");
    marker.textContent = field.value.slice(field.selectionStart) || ".";
    mirror.appendChild(marker);
    document.body.appendChild(mirror);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    const rect = field.getBoundingClientRect();
    const point = {
      x: rect.left + marker.offsetLeft - field.scrollLeft + parseFloat(cs.borderLeftWidth) * 0,
      y: rect.top + marker.offsetTop - field.scrollTop + lh
    };
    mirror.remove();
    return point;
  }
  var TslMention = class extends TslElement {
    setup() {
      this.field = this.querySelector("textarea, input");
      if (!this.field) return;
      this.trig = this.getAttribute("trigger") || "@";
      this.users = Array.from(this.querySelectorAll(":scope > option")).map((o) => ({
        value: o.getAttribute("value") || o.textContent.trim(),
        label: o.textContent.trim(),
        hint: o.dataset.hint || ""
      }));
      this.querySelectorAll(":scope > option").forEach((o) => o.remove());
      this.items = [];
      this.index = 0;
      this.range = null;
      const id = nextId("tsl-mention");
      this.panel = document.createElement("div");
      this.panel.className = "tsl-select__panel tsl-mention__panel";
      this.panel.setAttribute("popover", "manual");
      this.listEl = document.createElement("div");
      this.listEl.className = "tsl-select__list";
      this.listEl.id = id;
      this.listEl.setAttribute("role", "listbox");
      this.listEl.setAttribute("aria-label", this.getAttribute("label") || "Menciones");
      this.panel.appendChild(this.listEl);
      this.appendChild(this.panel);
      const f = this.field;
      f.setAttribute("role", "combobox");
      f.setAttribute("aria-autocomplete", "list");
      f.setAttribute("aria-expanded", "false");
      f.setAttribute("aria-controls", id);
      f.addEventListener("input", () => this.detect());
      f.addEventListener("click", () => this.detect());
      f.addEventListener("blur", () => setTimeout(() => !this.panel.contains(document.activeElement) && this.close(), 0));
      f.addEventListener("keydown", (e) => {
        if (!this.isOpen) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this.index = (this.index + (e.key === "ArrowDown" ? 1 : -1) + this.items.length) % this.items.length;
          this.paint();
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          this.pick(this.items[this.index]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      });
      this.listEl.addEventListener("pointerdown", (e) => e.preventDefault());
      this.listEl.addEventListener("click", (e) => {
        const el = e.target.closest(".tsl-select__option");
        if (el) this.pick(this.items[Number(el.dataset.i)]);
      });
      this.listEl.addEventListener("pointermove", (e) => {
        const el = e.target.closest(".tsl-select__option");
        if (el && Number(el.dataset.i) !== this.index) {
          this.index = Number(el.dataset.i);
          this.paint();
        }
      });
    }
    get isOpen() {
      return Boolean(this.panel) && this.panel.matches(":popover-open");
    }
    // Busca "@consulta" justo antes del cursor
    detect() {
      const f = this.field;
      const before = f.value.slice(0, f.selectionStart);
      const esc = this.trig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = new RegExp(`(^|\\s)${esc}([\\p{L}\\p{N}_.\\-]*)$`, "u").exec(before);
      if (!m) {
        this.close();
        return;
      }
      const query2 = m[2];
      const q = normalize(query2);
      const max = parseInt(this.getAttribute("max") || "6", 10);
      this.items = this.users.filter((u) => !q || normalize(`${u.value} ${u.label}`).includes(q)).slice(0, max);
      this.range = { start: f.selectionStart - query2.length - this.trig.length, end: f.selectionStart };
      if (!this.items.length) {
        this.close();
        return;
      }
      this.index = Math.min(this.index, this.items.length - 1);
      this.render();
      if (!this.isOpen) this.panel.showPopover();
      this.place();
      f.setAttribute("aria-expanded", "true");
    }
    render() {
      this.listEl.textContent = "";
      this.items.forEach((u, i) => {
        const el = document.createElement("div");
        el.className = "tsl-select__option";
        el.id = `${this.listEl.id}-${i}`;
        el.dataset.i = String(i);
        el.setAttribute("role", "option");
        const name = document.createElement("span");
        name.className = "tsl-select__label";
        name.textContent = u.label;
        const handle = document.createElement("span");
        handle.className = "tsl-select__hint";
        handle.textContent = `${this.trig}${u.value}`;
        el.append(name, handle);
        this.listEl.appendChild(el);
      });
      this.paint();
    }
    paint() {
      Array.from(this.listEl.children).forEach((el, i) => {
        el.classList.toggle("is-active", i === this.index);
        el.setAttribute("aria-selected", String(i === this.index));
        if (i === this.index) this.field.setAttribute("aria-activedescendant", el.id);
      });
    }
    place() {
      position(null, this.panel, { point: caretPoint(this.field), placement: "bottom-start", offset: 4 });
    }
    pick(user) {
      if (!user || !this.range) return;
      const f = this.field;
      const insert = `${this.trig}${user.value} `;
      f.value = f.value.slice(0, this.range.start) + insert + f.value.slice(this.range.end);
      const caret = this.range.start + insert.length;
      f.setSelectionRange(caret, caret);
      this.close();
      f.dispatchEvent(new Event("input", { bubbles: true }));
      f.focus();
      emit(this, "tsl-mention", { user, value: insert.trim() });
    }
    close() {
      if (this.panel && this.isOpen) this.panel.hidePopover();
      if (this.field) {
        this.field.setAttribute("aria-expanded", "false");
        this.field.removeAttribute("aria-activedescendant");
      }
    }
  };
  define("tsl-mention", TslMention);

  // src/components/toggle-group.js
  var TslToggleGroup = class extends TslElement {
    setup() {
      this.multiple = this.getAttribute("type") === "multiple";
      this.items = Array.from(this.querySelectorAll(".tsl-toggle-group__item"));
      this.setAttribute("role", "group");
      const initial = (this.getAttribute("value") || "").split(",").map((v) => v.trim()).filter(Boolean);
      this.values = this.multiple ? initial : initial.slice(0, 1);
      this.items.forEach((item) => {
        item.type = "button";
        item.addEventListener("click", () => this.toggle(item.value));
        item.addEventListener("keydown", (e) => {
          const next = moveFocus(this.items.filter((i) => !i.disabled), item, e.key, { horizontal: true });
          if (next) {
            e.preventDefault();
            next.focus();
          }
        });
      });
      this.paint();
    }
    get value() {
      return this.multiple ? this.values.slice() : this.values[0] || "";
    }
    set value(v) {
      this.values = (Array.isArray(v) ? v : v ? [v] : []).map(String);
      this.paint();
    }
    toggle(value) {
      const on = this.values.includes(value);
      if (this.multiple) this.values = on ? this.values.filter((v) => v !== value) : this.values.concat(value);
      else if (on) {
        if (this.hasAttribute("required")) return;
        this.values = [];
      } else this.values = [value];
      this.paint();
      emit(this, "tsl-change", { value: this.value });
    }
    paint() {
      const focusable = this.items.find((i) => this.values.includes(i.value) && !i.disabled) || this.items.find((i) => !i.disabled);
      this.items.forEach((i) => {
        i.setAttribute("aria-pressed", String(this.values.includes(i.value)));
        i.tabIndex = i === focusable ? 0 : -1;
      });
    }
  };
  define("tsl-toggle-group", TslToggleGroup);

  // src/components/collapsible.js
  var TslCollapsible = class extends TslElement {
    setup() {
      this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > button");
      this.content = this.querySelector(":scope > .tsl-collapsible__content");
      if (!this.trigger || !this.content) return;
      const inner = document.createElement("div");
      inner.className = "tsl-collapsible__inner";
      inner.append(...this.content.childNodes);
      this.content.appendChild(inner);
      this.content.id = this.content.id || nextId("tsl-collapsible");
      this.trigger.setAttribute("aria-controls", this.content.id);
      this.trigger.addEventListener("click", () => this.toggle());
      this.paint();
    }
    get isOpen() {
      return this.hasAttribute("open");
    }
    set isOpen(v) {
      this.toggleAttribute("open", Boolean(v));
      this.paint();
    }
    toggle(force) {
      const next = force === void 0 ? !this.isOpen : Boolean(force);
      if (next === this.isOpen) return;
      this.isOpen = next;
      emit(this, "tsl-toggle", { open: next });
    }
    open() {
      this.toggle(true);
    }
    close() {
      this.toggle(false);
    }
    paint() {
      if (!this.content) return;
      this.trigger.setAttribute("aria-expanded", String(this.isOpen));
      this.content.inert = !this.isOpen;
    }
  };
  define("tsl-collapsible", TslCollapsible);

  // src/components/scroll-area.js
  var TslScrollArea = class extends TslElement {
    setup() {
      this.viewport = document.createElement("div");
      this.viewport.className = "tsl-scroll-area__viewport";
      this.viewport.tabIndex = 0;
      this.viewport.setAttribute("role", "region");
      this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Contenido desplazable");
      this.viewport.append(...this.childNodes);
      this.appendChild(this.viewport);
      const o = this.getAttribute("orientation") || "vertical";
      this.viewport.style.overflowX = o === "vertical" ? "hidden" : "auto";
      this.viewport.style.overflowY = o === "horizontal" ? "hidden" : "auto";
      const update = () => this.edges();
      this.viewport.addEventListener("scroll", update, { passive: true });
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(update);
        this.ro.observe(this.viewport);
        Array.from(this.viewport.children).forEach((c) => this.ro.observe(c));
      }
      this.edges();
    }
    disconnectedCallback() {
      if (this.ro) this.ro.disconnect();
    }
    edges() {
      const v = this.viewport;
      const set = (name, on) => on ? this.setAttribute(name, "") : this.removeAttribute(name);
      set("data-top", v.scrollTop > 1);
      set("data-bottom", v.scrollTop + v.clientHeight < v.scrollHeight - 1);
      set("data-left", v.scrollLeft > 1);
      set("data-right", v.scrollLeft + v.clientWidth < v.scrollWidth - 1);
    }
    // Misma firma que Element.scrollTo: (opciones) o (x, y); se aplica al área desplazable
    scrollTo(...args) {
      this.viewport.scrollTo(...args);
    }
  };
  define("tsl-scroll-area", TslScrollArea);

  // src/components/resizable.js
  var TslResizable = class extends TslElement {
    setup() {
      this.vertical = this.getAttribute("direction") === "vertical";
      this.panels = Array.from(this.querySelectorAll(":scope > .tsl-resizable__panel"));
      this.setAttribute("data-direction", this.vertical ? "vertical" : "horizontal");
      if (this.panels.length < 2) return;
      const declared = this.panels.map((p) => parseFloat(p.dataset.size));
      const fixed = declared.reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0);
      const free = declared.filter((n) => !Number.isFinite(n)).length;
      this.initial = declared.map((n) => Number.isFinite(n) ? n : (100 - fixed) / free);
      this.sizes = this.initial.slice();
      const key = this.getAttribute("storage-key");
      if (key) {
        try {
          const saved = JSON.parse(storage.get(`tsl-resizable:${key}`) || "null");
          if (Array.isArray(saved) && saved.length === this.panels.length) this.sizes = saved;
        } catch (_) {
        }
      }
      this.handles = [];
      this.panels.slice(0, -1).forEach((panel, i) => {
        const h = document.createElement("div");
        h.className = "tsl-resizable__handle";
        h.tabIndex = 0;
        h.setAttribute("role", "separator");
        h.setAttribute("aria-orientation", this.vertical ? "horizontal" : "vertical");
        h.setAttribute("aria-label", this.getAttribute("handle-label") || "Cambiar tamaño");
        panel.after(h);
        this.handles.push(h);
        this.bindHandle(h, i);
      });
      this.apply();
    }
    min(i) {
      return parseFloat(this.panels[i].dataset.min || "10");
    }
    max(i) {
      return parseFloat(this.panels[i].dataset.max || "90");
    }
    // Mueve `delta` puntos porcentuales entre el panel i y el i+1, respetando mínimos y máximos
    resize(i, delta) {
      const a = this.sizes[i];
      const b = this.sizes[i + 1];
      const total = a + b;
      let next = clamp(a + delta, Math.max(this.min(i), total - this.max(i + 1)), Math.min(this.max(i), total - this.min(i + 1)));
      next = Math.round(next * 100) / 100;
      if (next === a) return false;
      this.sizes[i] = next;
      this.sizes[i + 1] = Math.round((total - next) * 100) / 100;
      this.apply();
      return true;
    }
    bindHandle(h, i) {
      let start = null;
      h.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        const r = this.getBoundingClientRect();
        const handlesPx = this.handles.reduce((s, x) => s + (this.vertical ? x.offsetHeight : x.offsetWidth), 0);
        start = { pos: this.vertical ? e.clientY : e.clientX, size: this.sizes[i], avail: (this.vertical ? r.height : r.width) - handlesPx };
        this.classList.add("is-resizing");
      });
      h.addEventListener("pointermove", (e) => {
        if (!start) return;
        const dx = (this.vertical ? e.clientY : e.clientX) - start.pos;
        const total = this.sizes[i] + this.sizes[i + 1];
        const target = start.size + dx / start.avail * 100;
        this.resize(i, target - this.sizes[i]);
        void total;
      });
      const end = () => {
        if (!start) return;
        start = null;
        this.classList.remove("is-resizing");
        this.save();
      };
      h.addEventListener("pointerup", end);
      h.addEventListener("pointercancel", end);
      h.addEventListener("dblclick", () => {
        const total = this.sizes[i] + this.sizes[i + 1];
        const ratio = this.initial[i] / (this.initial[i] + this.initial[i + 1]);
        this.resize(i, total * ratio - this.sizes[i]);
        this.save();
      });
      h.addEventListener("keydown", (e) => {
        const prev = this.vertical ? "ArrowUp" : "ArrowLeft";
        const next = this.vertical ? "ArrowDown" : "ArrowRight";
        const step = e.shiftKey ? 10 : 2;
        let moved = null;
        if (e.key === prev) moved = this.resize(i, -step);
        else if (e.key === next) moved = this.resize(i, step);
        else if (e.key === "Home") moved = this.resize(i, -100);
        else if (e.key === "End") moved = this.resize(i, 100);
        else return;
        e.preventDefault();
        if (moved) this.save();
      });
    }
    apply() {
      this.panels.forEach((p, i) => {
        p.style.flex = `${this.sizes[i]} 1 0%`;
      });
      this.handles.forEach((h, i) => {
        h.setAttribute("aria-valuenow", String(Math.round(this.sizes[i])));
        h.setAttribute("aria-valuemin", String(this.min(i)));
        h.setAttribute("aria-valuemax", String(this.max(i)));
        h.setAttribute("aria-controls", this.panels[i].id || (this.panels[i].id = nextId("tsl-panel")));
      });
      emit(this, "tsl-resize", { sizes: this.sizes.slice() });
    }
    save() {
      const key = this.getAttribute("storage-key");
      if (key) storage.set(`tsl-resizable:${key}`, JSON.stringify(this.sizes));
    }
  };
  define("tsl-resizable", TslResizable);

  // src/components/tree.js
  var TslTree = class extends TslElement {
    setup() {
      this.mode = this.getAttribute("selection") || "single";
      this.checkable = this.hasAttribute("checkable");
      this.rootList = this.querySelector(":scope > ul");
      if (!this.rootList) return;
      this.selected = /* @__PURE__ */ new Set();
      this.rootList.setAttribute("role", "tree");
      if (this.mode === "multiple") this.rootList.setAttribute("aria-multiselectable", "true");
      if (this.getAttribute("label")) this.rootList.setAttribute("aria-label", this.getAttribute("label"));
      this.typeahead = "";
      this.build(this.rootList, 1);
      this.addEventListener("click", (e) => this.onClick(e));
      this.addEventListener("dblclick", (e) => {
        const li = e.target.closest("li[role=treeitem]");
        if (li && !e.target.closest(".tsl-tree__check")) this.toggleItem(li);
      });
      this.addEventListener("keydown", (e) => this.onKey(e));
      this.addEventListener("change", (e) => {
        const box = e.target.closest(".tsl-tree__check");
        if (box) this.setChecked(box.closest("li"), box.checked, true);
      });
      this.addEventListener("focusin", (e) => {
        const li = e.target.closest("li[role=treeitem]");
        if (li && e.target === li) this.rove(li);
      });
      const first = this.items().find((li) => li.getAttribute("aria-selected") === "true") || this.items()[0];
      if (first) first.tabIndex = 0;
      this.refreshChecks();
    }
    build(ul, level) {
      ul.querySelectorAll(":scope > li").forEach((li) => {
        const sub = li.querySelector(":scope > ul");
        const nodes = Array.from(li.childNodes).filter((n) => n !== sub);
        const row = document.createElement("div");
        row.className = "tsl-tree__row";
        const chevron = document.createElement("span");
        chevron.className = "tsl-tree__chevron";
        chevron.setAttribute("aria-hidden", "true");
        if (!sub) chevron.classList.add("is-leaf");
        row.appendChild(chevron);
        if (this.checkable) {
          const box = document.createElement("input");
          box.type = "checkbox";
          box.className = "tsl-check tsl-tree__check";
          box.tabIndex = -1;
          box.setAttribute("aria-hidden", "true");
          row.appendChild(box);
        }
        const label = document.createElement("span");
        label.className = "tsl-tree__label";
        label.append(...nodes);
        row.appendChild(label);
        li.insertBefore(row, sub);
        li.setAttribute("role", "treeitem");
        li.setAttribute("aria-level", String(level));
        li.tabIndex = -1;
        li.dataset.value = li.dataset.value || label.textContent.trim();
        li.setAttribute("aria-label", li.getAttribute("aria-label") || label.textContent.trim());
        if (this.mode !== "none") li.setAttribute("aria-selected", String(li.hasAttribute("data-selected")));
        if (li.hasAttribute("data-selected")) this.selected.add(li.dataset.value);
        if (this.checkable && li.hasAttribute("data-checked")) row.querySelector(".tsl-tree__check").checked = true;
        if (sub) {
          sub.setAttribute("role", "group");
          li.setAttribute("aria-expanded", String(li.hasAttribute("data-expanded")));
          this.build(sub, level + 1);
        }
      });
    }
    items() {
      return Array.from(this.querySelectorAll("li[role=treeitem]"));
    }
    visibleItems() {
      return this.items().filter((li) => {
        let p = li.parentElement && li.parentElement.closest("li[role=treeitem]");
        while (p) {
          if (p.getAttribute("aria-expanded") !== "true") return false;
          p = p.parentElement && p.parentElement.closest("li[role=treeitem]");
        }
        return true;
      });
    }
    rove(li) {
      this.items().forEach((x) => x.tabIndex = x === li ? 0 : -1);
    }
    focusItem(li) {
      if (!li) return;
      this.rove(li);
      li.focus();
    }
    hasChildren(li) {
      return li.hasAttribute("aria-expanded");
    }
    get value() {
      return this.mode === "multiple" ? Array.from(this.selected) : Array.from(this.selected)[0] || "";
    }
    set value(v) {
      const vals = Array.isArray(v) ? v : v ? [v] : [];
      this.selected = new Set(vals.map(String));
      this.items().forEach((li) => this.mode !== "none" && li.setAttribute("aria-selected", String(this.selected.has(li.dataset.value))));
    }
    get checkedValues() {
      return this.items().filter((li) => li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check:checked")).map((li) => li.dataset.value);
    }
    expand(value, on = true) {
      const li = this.items().find((x) => x.dataset.value === value);
      if (li && this.hasChildren(li)) this.setExpanded(li, on);
    }
    expandAll(on = true) {
      this.items().forEach((li) => this.hasChildren(li) && this.setExpanded(li, on, false));
    }
    collapseAll() {
      this.expandAll(false);
    }
    setExpanded(li, on, fire = true) {
      if (!this.hasChildren(li) || li.getAttribute("aria-expanded") === "true" === on) return;
      li.setAttribute("aria-expanded", String(on));
      if (!on) {
        const active = document.activeElement;
        if (active && li !== active && li.contains(active)) this.focusItem(li);
      }
      if (fire) emit(this, "tsl-toggle", { value: li.dataset.value, expanded: on });
    }
    toggleItem(li) {
      this.setExpanded(li, li.getAttribute("aria-expanded") !== "true");
    }
    select(li, fire = true) {
      if (this.mode === "none") return;
      const v = li.dataset.value;
      if (this.mode === "multiple") {
        if (this.selected.has(v)) this.selected.delete(v);
        else this.selected.add(v);
      } else {
        this.selected = /* @__PURE__ */ new Set([v]);
      }
      this.items().forEach((x) => x.setAttribute("aria-selected", String(this.selected.has(x.dataset.value))));
      if (fire) emit(this, "tsl-select", { value: v, values: Array.from(this.selected) });
    }
    // Marca un nodo y todos sus descendientes; los ancestros quedan en estado mixto
    setChecked(li, on, fire) {
      li.querySelectorAll(".tsl-tree__check").forEach((b) => (b.checked = on, b.indeterminate = false));
      this.refreshChecks();
      if (fire) emit(this, "tsl-check", { values: this.checkedValues });
    }
    refreshChecks() {
      if (!this.checkable) return;
      const items = this.items().reverse();
      items.forEach((li) => {
        const box = li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check");
        const kids = Array.from(li.querySelectorAll(":scope > ul > li > .tsl-tree__row > .tsl-tree__check"));
        if (kids.length) {
          const checked = kids.filter((k) => k.checked).length;
          const mixed = kids.some((k) => k.indeterminate);
          box.checked = checked === kids.length;
          box.indeterminate = !box.checked && (checked > 0 || mixed);
        }
        li.setAttribute("aria-checked", box.indeterminate ? "mixed" : String(box.checked));
      });
    }
    onClick(e) {
      const li = e.target.closest("li[role=treeitem]");
      if (!li || !this.contains(li)) return;
      if (e.target.closest(".tsl-tree__chevron")) {
        this.toggleItem(li);
        this.focusItem(li);
        return;
      }
      if (e.target.closest(".tsl-tree__check")) return;
      this.focusItem(li);
      this.select(li);
    }
    onKey(e) {
      const li = e.target.closest && e.target.closest("li[role=treeitem]");
      if (!li || e.target !== li) return;
      const vis = this.visibleItems();
      const i = vis.indexOf(li);
      const k = e.key;
      let handled = true;
      if (k === "ArrowDown") this.focusItem(vis[Math.min(vis.length - 1, i + 1)]);
      else if (k === "ArrowUp") this.focusItem(vis[Math.max(0, i - 1)]);
      else if (k === "Home") this.focusItem(vis[0]);
      else if (k === "End") this.focusItem(vis[vis.length - 1]);
      else if (k === "ArrowRight") {
        if (this.hasChildren(li)) {
          if (li.getAttribute("aria-expanded") !== "true") this.setExpanded(li, true);
          else this.focusItem(li.querySelector(":scope > ul > li"));
        }
      } else if (k === "ArrowLeft") {
        if (this.hasChildren(li) && li.getAttribute("aria-expanded") === "true") this.setExpanded(li, false);
        else this.focusItem(li.parentElement.closest("li[role=treeitem]"));
      } else if (k === "Enter") this.select(li);
      else if (k === " ") {
        if (this.checkable) {
          const box = li.querySelector(":scope > .tsl-tree__row > .tsl-tree__check");
          this.setChecked(li, !box.checked || box.indeterminate, true);
        } else this.select(li);
      } else if (k === "*") {
        li.parentElement.querySelectorAll(":scope > li").forEach((s) => this.hasChildren(s) && this.setExpanded(s, true));
      } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(this.typeTimer);
        this.typeahead += normalize(k);
        this.typeTimer = setTimeout(() => this.typeahead = "", 600);
        const order = vis.slice(i + 1).concat(vis.slice(0, i + 1));
        const hit = order.find((x) => normalize(x.dataset.value).startsWith(this.typeahead));
        if (hit) this.focusItem(hit);
        handled = Boolean(hit);
      } else handled = false;
      if (handled) e.preventDefault();
    }
  };
  define("tsl-tree", TslTree);

  // src/components/virtual-list.js
  var TslVirtualList = class extends TslElement {
    setup() {
      this._items = this._items || [];
      this.rowHeight = parseFloat(this.getAttribute("item-height") || "36");
      this.overscan = parseInt(this.getAttribute("overscan") || "6", 10);
      this.selectable = this.hasAttribute("selectable");
      this.activeIndex = -1;
      this.rows = /* @__PURE__ */ new Map();
      this.uid = nextId("tsl-vlist");
      this.viewport = document.createElement("div");
      this.viewport.className = "tsl-vlist__viewport";
      this.viewport.tabIndex = 0;
      this.viewport.setAttribute("role", this.selectable ? "listbox" : "list");
      this.viewport.setAttribute("aria-label", this.getAttribute("label") || "Lista");
      this.spacer = document.createElement("div");
      this.spacer.className = "tsl-vlist__spacer";
      this.viewport.appendChild(this.spacer);
      this.textContent = "";
      this.appendChild(this.viewport);
      if (this.getAttribute("height")) this.style.height = this.getAttribute("height");
      this.viewport.addEventListener("scroll", () => this.render(), { passive: true });
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(() => this.render());
        this.ro.observe(this.viewport);
      }
      if (this.selectable) {
        this.viewport.addEventListener("keydown", (e) => this.onKey(e));
        this.viewport.addEventListener("click", (e) => {
          const row = e.target.closest(".tsl-vlist__row");
          if (row) this.activate(Number(row.dataset.i), true);
        });
        this.viewport.addEventListener("focus", () => this.activeIndex < 0 && this._items.length && this.activate(0, false));
      }
      this.resize();
      this.render();
    }
    disconnectedCallback() {
      if (this.ro) this.ro.disconnect();
    }
    get items() {
      return this._items || [];
    }
    set items(list) {
      this._items = Array.isArray(list) ? list : [];
      this.activeIndex = -1;
      if (!this._tslReady) return;
      this.rows.forEach((el) => el.remove());
      this.rows.clear();
      this.resize();
      this.viewport.scrollTop = 0;
      this.render();
    }
    resize() {
      this.spacer.style.height = `${this._items.length * this.rowHeight}px`;
      this.viewport.setAttribute("aria-rowcount", String(this._items.length));
    }
    draw(item, i) {
      const out = typeof this.renderItem === "function" ? this.renderItem(item, i) : item && typeof item === "object" ? item.label ?? JSON.stringify(item) : item;
      return out instanceof Node ? out : document.createTextNode(String(out));
    }
    render() {
      if (!this.viewport) return;
      const h = this.rowHeight;
      const top = this.viewport.scrollTop;
      const view = this.viewport.clientHeight || parseFloat(this.getAttribute("height")) || 320;
      const start = Math.max(0, Math.floor(top / h) - this.overscan);
      const end = Math.min(this._items.length, Math.ceil((top + view) / h) + this.overscan);
      this.rows.forEach((el, i) => {
        if (i < start || i >= end) {
          el.remove();
          this.rows.delete(i);
        }
      });
      for (let i = start; i < end; i++) {
        if (this.rows.has(i)) continue;
        const el = document.createElement("div");
        el.className = "tsl-vlist__row";
        el.id = `${this.uid}-${i}`;
        el.dataset.i = String(i);
        el.style.height = `${h}px`;
        el.style.transform = `translateY(${i * h}px)`;
        el.setAttribute("role", this.selectable ? "option" : "listitem");
        el.setAttribute("aria-posinset", String(i + 1));
        el.setAttribute("aria-setsize", String(this._items.length));
        if (this.selectable) el.setAttribute("aria-selected", String(i === this.activeIndex));
        el.classList.toggle("is-active", i === this.activeIndex);
        el.appendChild(this.draw(this._items[i], i));
        this.spacer.appendChild(el);
        this.rows.set(i, el);
      }
    }
    scrollToIndex(i, align = "nearest") {
      i = clamp(i, 0, Math.max(0, this._items.length - 1));
      const h = this.rowHeight;
      const top = this.viewport.scrollTop;
      const view = this.viewport.clientHeight;
      const y = i * h;
      if (align === "start") this.viewport.scrollTop = y;
      else if (align === "center") this.viewport.scrollTop = y - (view - h) / 2;
      else if (align === "end") this.viewport.scrollTop = y - view + h;
      else if (y < top) this.viewport.scrollTop = y;
      else if (y + h > top + view) this.viewport.scrollTop = y + h - view;
      this.render();
    }
    activate(i, fire) {
      if (i < 0 || i >= this._items.length) return;
      const prev = this.rows.get(this.activeIndex);
      if (prev) {
        prev.classList.remove("is-active");
        prev.setAttribute("aria-selected", "false");
      }
      this.activeIndex = i;
      this.scrollToIndex(i);
      const el = this.rows.get(i);
      if (el) {
        el.classList.add("is-active");
        el.setAttribute("aria-selected", "true");
        this.viewport.setAttribute("aria-activedescendant", el.id);
      }
      if (fire) emit(this, "tsl-select", { item: this._items[i], index: i });
    }
    onKey(e) {
      const n = this._items.length;
      if (!n) return;
      const page = Math.max(1, Math.floor(this.viewport.clientHeight / this.rowHeight) - 1);
      const cur = this.activeIndex < 0 ? 0 : this.activeIndex;
      const k = e.key;
      let target = null;
      if (k === "ArrowDown") target = cur + 1;
      else if (k === "ArrowUp") target = cur - 1;
      else if (k === "PageDown") target = cur + page;
      else if (k === "PageUp") target = cur - page;
      else if (k === "Home") target = 0;
      else if (k === "End") target = n - 1;
      else if (k === "Enter" || k === " ") {
        e.preventDefault();
        this.activate(cur, true);
        return;
      }
      if (target === null) return;
      e.preventDefault();
      this.activate(clamp(target, 0, n - 1), false);
    }
  };
  define("tsl-virtual-list", TslVirtualList);

  // src/components/sortable.js
  var SORTABLES = /* @__PURE__ */ new Map();
  var TslSortable = class extends TslElement {
    setup() {
      this.group = this.getAttribute("group") || this.id || nextId("tsl-sortgroup");
      this.axis = this.getAttribute("direction") || "vertical";
      if (!SORTABLES.has(this.group)) SORTABLES.set(this.group, /* @__PURE__ */ new Set());
      SORTABLES.get(this.group).add(this);
      this.setAttribute("role", "list");
      this.prepare();
      this.mo = new MutationObserver(() => this.prepare());
      this.mo.observe(this, { childList: true });
      this.addEventListener("pointerdown", (e) => this.onPointerDown(e));
      this.addEventListener("keydown", (e) => this.onKey(e));
    }
    disconnectedCallback() {
      if (this.mo) this.mo.disconnect();
      if (SORTABLES.has(this.group)) SORTABLES.get(this.group).delete(this);
    }
    get itemEls() {
      return Array.from(this.children).filter((c) => c.classList.contains("tsl-sortable__item"));
    }
    prepare() {
      this.itemEls.forEach((el) => {
        if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
        el.setAttribute("role", "listitem");
        el.setAttribute("aria-roledescription", "elemento ordenable");
      });
    }
    get siblings() {
      return Array.from(SORTABLES.get(this.group) || []).sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    }
    nameOf(item) {
      return item.getAttribute("aria-label") || item.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
    }
    listName() {
      return this.getAttribute("label") || this.getAttribute("aria-label") || "";
    }
    // ---- Puntero -----------------------------------------------------------------
    onPointerDown(e) {
      if (e.button !== 0 || this.drag) return;
      const item = e.target.closest(".tsl-sortable__item");
      if (!item || item.parentElement !== this) return;
      const handle = this.getAttribute("handle");
      if (handle) {
        if (!e.target.closest(handle)) return;
      } else if (e.target.closest("input, textarea, select, a[href], button, [contenteditable]")) return;
      this.pending = { item, x: e.clientX, y: e.clientY, id: e.pointerId };
      const move = (ev) => this.onPointerMove(ev);
      const up = (ev) => {
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", up, true);
        document.removeEventListener("pointercancel", up, true);
        document.removeEventListener("keydown", esc, true);
        this.endDrag(ev.type === "pointercancel");
      };
      const esc = (ev) => {
        if (ev.key === "Escape" && this.drag) {
          ev.preventDefault();
          up({ type: "pointercancel" });
        }
      };
      document.addEventListener("pointermove", move, true);
      document.addEventListener("pointerup", up, true);
      document.addEventListener("pointercancel", up, true);
      document.addEventListener("keydown", esc, true);
    }
    onPointerMove(e) {
      if (!this.pending) return;
      if (!this.drag) {
        if (Math.hypot(e.clientX - this.pending.x, e.clientY - this.pending.y) < 5) return;
        this.startDrag(e);
      }
      const d = this.drag;
      d.item.style.left = `${e.clientX - d.dx}px`;
      d.item.style.top = `${e.clientY - d.dy}px`;
      const target = this.containerAt(e.clientX, e.clientY) || d.container;
      this.placeIn(target, e.clientX, e.clientY);
      this.autoscroll(e, target);
    }
    startDrag(e) {
      const item = this.pending.item;
      const rect = item.getBoundingClientRect();
      const cs = getComputedStyle(item);
      const placeholder = document.createElement("div");
      placeholder.className = "tsl-sortable__placeholder";
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.margin = cs.margin;
      this.drag = {
        item,
        placeholder,
        container: this,
        origin: { container: this, next: item.nextElementSibling, index: this.itemEls.indexOf(item) },
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top
      };
      item.after(placeholder);
      item.classList.add("is-dragging");
      item.style.cssText += `;position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;z-index:1000;pointer-events:none`;
      document.body.classList.add("tsl-is-sorting");
      announce(`${this.nameOf(item)} tomado.`);
    }
    containerAt(x, y) {
      const group = SORTABLES.get(this.group);
      for (const el of document.elementsFromPoint(x, y)) {
        const c = el.closest && el.closest("tsl-sortable");
        if (c && group.has(c)) return c;
      }
      return null;
    }
    // Coloca el marcador en el punto de inserción de `target` según el puntero
    placeIn(target, x, y) {
      const d = this.drag;
      const items = target.itemEls.filter((i) => i !== d.item);
      let before = null;
      if (target.axis === "grid") {
        let best = Infinity;
        items.forEach((it) => {
          const r = it.getBoundingClientRect();
          const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
          if (dist < best) {
            best = dist;
            before = x < r.left + r.width / 2 ? it : it.nextElementSibling;
          }
        });
      } else {
        const horizontal = target.axis === "horizontal";
        before = items.find((it) => {
          const r = it.getBoundingClientRect();
          return horizontal ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
        });
      }
      while (before && (before === d.placeholder || !before.classList.contains("tsl-sortable__item"))) before = before.nextElementSibling;
      if (before) {
        if (d.placeholder.nextElementSibling !== before || d.placeholder.parentElement !== target) target.insertBefore(d.placeholder, before);
      } else if (d.placeholder.parentElement !== target || d.placeholder.nextElementSibling) target.appendChild(d.placeholder);
      d.container = target;
    }
    autoscroll(e, target) {
      if (e.clientY < 50) window.scrollBy(0, -14);
      else if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 14);
      if (target.scrollHeight > target.clientHeight + 2) {
        const r = target.getBoundingClientRect();
        if (e.clientY < r.top + 36) target.scrollTop -= 10;
        else if (e.clientY > r.bottom - 36) target.scrollTop += 10;
      }
    }
    endDrag(cancel) {
      this.pending = null;
      const d = this.drag;
      this.drag = null;
      if (!d) return;
      document.body.classList.remove("tsl-is-sorting");
      const { item, placeholder, origin } = d;
      const to = { container: placeholder.parentElement, index: Array.from(placeholder.parentElement.children).filter((c) => c.classList.contains("tsl-sortable__item") || c === placeholder).indexOf(placeholder) };
      if (cancel) {
        placeholder.remove();
        if (origin.next && origin.next.parentElement === origin.container) origin.container.insertBefore(item, origin.next);
        else origin.container.appendChild(item);
      } else placeholder.replaceWith(item);
      item.classList.remove("is-dragging");
      ["position", "left", "top", "width", "height", "margin", "z-index", "pointer-events"].forEach((p) => item.style.removeProperty(p));
      if (cancel) {
        announce("Movimiento cancelado.");
        return;
      }
      this.finish(item, origin, to.container);
    }
    finish(item, origin, container) {
      const index = container.itemEls.indexOf(item);
      const changed = container !== origin.container || index !== origin.index;
      if (changed) {
        const list = container.listName();
        announce(`${this.nameOf(item)} soltado${list ? ` en ${list}` : ""}, posición ${index + 1} de ${container.itemEls.length}.`);
        emit(container, "tsl-sort", { item, from: { container: origin.container, index: origin.index }, to: { container, index } });
      } else announce(`${this.nameOf(item)} soltado en su posición original.`);
    }
    // ---- Teclado -----------------------------------------------------------------
    onKey(e) {
      const item = e.target.closest(".tsl-sortable__item");
      if (!item || item.parentElement !== this || e.target !== item) return;
      const k = e.key;
      const items = this.itemEls;
      const i = items.indexOf(item);
      const vertical = this.axis !== "horizontal";
      const prevKey = vertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = vertical ? "ArrowDown" : "ArrowRight";
      const grabbed = this.kb && this.kb.item === item;
      if (k === " " || k === "Enter") {
        e.preventDefault();
        if (!grabbed) {
          this.kb = { item, origin: { container: this, next: item.nextElementSibling, index: i } };
          item.setAttribute("aria-pressed", "true");
          item.classList.add("is-grabbed");
          announce(`${this.nameOf(item)} tomado. Posición ${i + 1} de ${items.length}. Usa las flechas para mover, Espacio para soltar y Escape para cancelar.`);
        } else this.dropKb();
        return;
      }
      if (k === "Escape" && grabbed) {
        e.preventDefault();
        const { origin } = this.kb;
        if (origin.next && origin.next.parentElement === origin.container) origin.container.insertBefore(item, origin.next);
        else origin.container.appendChild(item);
        this.kb = null;
        item.removeAttribute("aria-pressed");
        item.classList.remove("is-grabbed");
        item.focus();
        announce("Movimiento cancelado.");
        return;
      }
      if (!grabbed) {
        if (k === prevKey || k === nextKey) {
          e.preventDefault();
          const t = items[i + (k === nextKey ? 1 : -1)];
          if (t) t.focus();
        }
        return;
      }
      let moved = false;
      if (k === prevKey && i > 0) {
        this.insertBefore(item, items[i - 1]);
        moved = true;
      } else if (k === nextKey && i < items.length - 1) {
        this.insertBefore(item, items[i + 1].nextElementSibling);
        moved = true;
      } else if (k === "Home" || k === "End") {
        if (k === "Home") this.insertBefore(item, items[0]);
        else this.appendChild(item);
        moved = true;
      } else if (vertical && (k === "ArrowLeft" || k === "ArrowRight") || !vertical && (k === "ArrowUp" || k === "ArrowDown")) {
        const lists = this.siblings;
        const to = lists[lists.indexOf(this) + (k === "ArrowRight" || k === "ArrowDown" ? 1 : -1)];
        if (to) {
          const targetItems = to.itemEls;
          const ref = targetItems[Math.min(i, targetItems.length)] || null;
          to.insertBefore(item, ref);
          this.kb.item = item;
          item.focus();
          const idx = to.itemEls.indexOf(item);
          announce(`${to.listName() ? `${to.listName()}, ` : ""}posición ${idx + 1} de ${to.itemEls.length}.`);
          to.kb = this.kb;
          this.kb = null;
          return;
        }
        moved = false;
      } else return;
      e.preventDefault();
      if (moved) {
        item.focus();
        announce(`Posición ${this.itemEls.indexOf(item) + 1} de ${this.itemEls.length}.`);
      }
    }
    dropKb() {
      const { item, origin } = this.kb;
      this.kb = null;
      item.removeAttribute("aria-pressed");
      item.classList.remove("is-grabbed");
      this.finish(item, origin, this);
    }
  };
  define("tsl-sortable", TslSortable);

  // src/components/data-table.js
  var TslDataTable = class extends TslElement {
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
      this.q = "";
      this.sortState = null;
      this.page = 0;
      this.pageSize = parseInt(this.getAttribute("page-size") || "10", 10);
      this.selected = /* @__PURE__ */ new Set();
      this.hiddenCols = /* @__PURE__ */ new Set();
      this.density = this.getAttribute("density") || "normal";
      this.lastIndex = null;
      this._columns = this._columns || [];
      this._rows = this._rows || [];
      this.fromMarkup();
      this._columns.forEach((c) => c.hidden && this.hiddenCols.add(c.key));
      this.buildShell();
      this.update();
    }
    fromMarkup() {
      const table = this.querySelector("table");
      if (!table || this._columns.length) return;
      this._columns = Array.from(table.querySelectorAll("thead th")).map((th, i) => ({
        key: th.dataset.key || `c${i}`,
        label: th.textContent.trim(),
        sort: th.dataset.sort,
        align: th.dataset.align || (th.classList.contains("is-num") ? "end" : void 0)
      }));
      this._rows = Array.from(table.querySelectorAll("tbody tr")).map((tr, r) => {
        const row = { id: tr.dataset.id || String(r) };
        Array.from(tr.cells).forEach((td, i) => {
          const col = this._columns[i];
          if (!col) return;
          const text = td.textContent.trim();
          row[col.key] = col.sort === "number" ? parseFloat(text.replace(/[^0-9.,-]/g, "").replace(",", ".")) : text;
        });
        return row;
      });
      if (!this.getAttribute("caption") && table.caption) this.setAttribute("caption", table.caption.textContent.trim());
    }
    get columns() {
      return this._columns;
    }
    set columns(cols) {
      this._columns = Array.isArray(cols) ? cols : [];
      if (!this._tslReady) return;
      this.hiddenCols = new Set(this._columns.filter((c) => c.hidden).map((c) => c.key));
      this.sortState = null;
      this.buildColumnMenu();
      this.update();
    }
    get rows() {
      return this._rows;
    }
    set rows(rows) {
      this._rows = Array.isArray(rows) ? rows : [];
      if (!this._tslReady) return;
      const ids = new Set(this._rows.map((r) => String(r.id)));
      this.selected = new Set(Array.from(this.selected).filter((id) => ids.has(id)));
      this.update();
    }
    get selectedIds() {
      return Array.from(this.selected);
    }
    get selectedRows() {
      return this._rows.filter((r) => this.selected.has(String(r.id)));
    }
    clearSelection() {
      this.selected.clear();
      this.refreshSelection(true);
    }
    get loading() {
      return this.hasAttribute("loading");
    }
    set loading(v) {
      this.toggleAttribute("loading", Boolean(v));
      if (this._tslReady) this.update();
    }
    // ---- Estructura -----------------------------------------------------------------
    buildShell() {
      const t = (name, fallback) => this.getAttribute(name) || fallback;
      this.textContent = "";
      this.toolbar = document.createElement("div");
      this.toolbar.className = "tsl-dt__toolbar";
      if (this.hasAttribute("searchable")) {
        this.search = document.createElement("input");
        this.search.type = "search";
        this.search.className = "tsl-input tsl-dt__search";
        this.search.placeholder = t("search-placeholder", "Buscar…");
        this.search.setAttribute("aria-label", t("search-placeholder", "Buscar en la tabla"));
        let timer = 0;
        this.search.addEventListener("input", () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            this.q = this.search.value;
            this.page = 0;
            this.update();
          }, 150);
        });
        this.toolbar.appendChild(this.search);
      }
      const spacer = document.createElement("span");
      spacer.className = "tsl-spacer";
      this.toolbar.appendChild(spacer);
      this.selInfo = document.createElement("span");
      this.selInfo.className = "tsl-dt__selinfo";
      this.selInfo.hidden = true;
      this.selCount = document.createElement("strong");
      this.selClear = document.createElement("button");
      this.selClear.type = "button";
      this.selClear.className = "tsl-btn tsl-btn--sm tsl-btn--subtle";
      this.selClear.textContent = t("clear-label", "Limpiar");
      this.selClear.addEventListener("click", () => this.clearSelection());
      this.selInfo.append(this.selCount, this.selClear);
      this.toolbar.appendChild(this.selInfo);
      const pop = document.createElement("tsl-popover");
      pop.setAttribute("placement", "bottom-end");
      const trig = document.createElement("button");
      trig.type = "button";
      trig.className = "tsl-btn tsl-btn--sm";
      trig.setAttribute("data-tsl-trigger", "");
      trig.textContent = `${t("columns-label", "Columnas")} ▾`;
      this.colPanel = document.createElement("div");
      this.colPanel.className = "tsl-popover__panel tsl-dt__colmenu";
      this.colPanel.setAttribute("aria-label", t("columns-label", "Columnas visibles"));
      pop.append(trig, this.colPanel);
      this.toolbar.appendChild(pop);
      this.buildColumnMenu();
      this.densityBtn = document.createElement("button");
      this.densityBtn.type = "button";
      this.densityBtn.className = "tsl-btn tsl-btn--sm";
      this.densityBtn.addEventListener("click", () => {
        const order = ["compact", "normal", "comfortable"];
        this.density = order[(order.indexOf(this.density) + 1) % order.length];
        this.paintDensity();
      });
      this.toolbar.appendChild(this.densityBtn);
      if (this.hasAttribute("exportable")) {
        const exp = document.createElement("button");
        exp.type = "button";
        exp.className = "tsl-btn tsl-btn--sm";
        exp.textContent = t("export-label", "Exportar CSV");
        exp.addEventListener("click", () => this.exportCsv());
        this.toolbar.appendChild(exp);
      }
      this.wrap = document.createElement("div");
      this.wrap.className = "tsl-dt__wrap";
      if (this.getAttribute("height")) this.wrap.style.maxHeight = this.getAttribute("height");
      this.table = document.createElement("table");
      this.table.className = "tsl-table tsl-dt__table";
      this.caption = document.createElement("caption");
      this.caption.className = "tsl-sr-only";
      this.caption.textContent = this.getAttribute("caption") || "Tabla de datos";
      this.thead = document.createElement("thead");
      this.tbody = document.createElement("tbody");
      this.table.append(this.caption, this.thead, this.tbody);
      this.wrap.appendChild(this.table);
      this.footer = document.createElement("div");
      this.footer.className = "tsl-dt__footer";
      this.rangeText = document.createElement("span");
      this.rangeText.className = "tsl-muted";
      this.rangeText.setAttribute("aria-live", "polite");
      const sizeLabel = document.createElement("label");
      sizeLabel.className = "tsl-dt__size";
      sizeLabel.append(`${t("rows-label", "Filas")} `);
      this.sizeSel = document.createElement("select");
      this.sizeSel.className = "tsl-select";
      this.sizeSel.addEventListener("change", () => {
        this.pageSize = parseInt(this.sizeSel.value, 10);
        this.page = 0;
        this.update();
        emit(this, "tsl-page", { page: this.page, pageSize: this.pageSize });
      });
      sizeLabel.appendChild(this.sizeSel);
      this.pager = document.createElement("nav");
      this.pager.className = "tsl-pagination";
      this.pager.setAttribute("aria-label", t("pager-label", "Paginación"));
      this.pager.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-page]");
        if (!b || b.disabled) return;
        this.page = Number(b.dataset.page);
        this.update();
        emit(this, "tsl-page", { page: this.page, pageSize: this.pageSize });
      });
      const sp = document.createElement("span");
      sp.className = "tsl-spacer";
      this.footer.append(this.rangeText, sp, sizeLabel, this.pager);
      this.append(this.toolbar, this.wrap, this.footer);
      this.paintDensity();
    }
    buildColumnMenu() {
      if (!this.colPanel) return;
      this.colPanel.textContent = "";
      this._columns.forEach((c) => {
        const label = document.createElement("label");
        label.className = "tsl-choice";
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "tsl-check";
        box.checked = !this.hiddenCols.has(c.key);
        box.addEventListener("change", () => {
          if (box.checked) this.hiddenCols.delete(c.key);
          else if (this._columns.length - this.hiddenCols.size > 1) this.hiddenCols.add(c.key);
          else box.checked = true;
          this.update();
        });
        label.append(box, c.label);
        this.colPanel.appendChild(label);
      });
    }
    paintDensity() {
      const names = { compact: "Compacta", normal: "Normal", comfortable: "Cómoda" };
      this.setAttribute("density", this.density);
      this.densityBtn.textContent = `${this.getAttribute("density-label") || "Densidad"}: ${names[this.density]}`;
    }
    // ---- Datos derivados ----------------------------------------------------------------
    get visibleColumns() {
      return this._columns.filter((c) => !this.hiddenCols.has(c.key));
    }
    textOf(row, col) {
      const v = row[col.key];
      if (col.format) return String(col.format(v, row));
      if (v === null || v === void 0) return "";
      return typeof v === "number" ? new Intl.NumberFormat(this.locale).format(v) : String(v);
    }
    get processedRows() {
      const cols = this.visibleColumns;
      const q = normalize(this.q.trim());
      let rows = q ? this._rows.filter((r) => cols.some((c) => normalize(this.textOf(r, c)).includes(q))) : this._rows.slice();
      if (this.sortState) {
        const { key, dir } = this.sortState;
        const col = this._columns.find((c) => c.key === key);
        const num = (v) => v === null || v === void 0 || v === "" ? NaN : col.sort === "date" ? Date.parse(v) : Number(v);
        rows = rows.map((r, i) => ({ r, i })).sort((a, b) => {
          const va = a.r[key];
          const vb = b.r[key];
          const na = va === null || va === void 0 || va === "";
          const nb = vb === null || vb === void 0 || vb === "";
          if (na || nb) return na === nb ? a.i - b.i : na ? 1 : -1;
          let cmp;
          if (col.sort === "number" || col.sort === "date") {
            const x = num(va);
            const y = num(vb);
            cmp = x - y;
            if (Number.isNaN(cmp)) cmp = 0;
          } else cmp = String(va).localeCompare(String(vb), this.locale, { numeric: true, sensitivity: "base" });
          return (dir === "asc" ? cmp : -cmp) || a.i - b.i;
        }).map((x) => x.r);
      }
      return rows;
    }
    // ---- Render -------------------------------------------------------------------------
    update() {
      if (!this.tbody) return;
      const cols = this.visibleColumns;
      const all = this.processedRows;
      this.total = all.length;
      this.pages = Math.max(1, Math.ceil(all.length / this.pageSize));
      this.page = Math.min(this.page, this.pages - 1);
      this.pageRows = all.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
      this.table.setAttribute("aria-rowcount", String(all.length + 1));
      this.renderHead(cols);
      this.renderBody(cols);
      this.renderFooter();
      this.refreshSelection(false);
    }
    renderHead(cols) {
      const tr = document.createElement("tr");
      if (this.hasAttribute("selectable")) {
        const th = document.createElement("th");
        th.className = "tsl-dt__select";
        this.headBox = document.createElement("input");
        this.headBox.type = "checkbox";
        this.headBox.className = "tsl-check";
        this.headBox.setAttribute("aria-label", this.getAttribute("select-all-label") || "Seleccionar la página");
        this.headBox.addEventListener("change", () => {
          this.pageRows.forEach((r) => this.headBox.checked ? this.selected.add(String(r.id)) : this.selected.delete(String(r.id)));
          this.refreshSelection(true);
        });
        th.appendChild(this.headBox);
        tr.appendChild(th);
      }
      cols.forEach((c) => {
        const th = document.createElement("th");
        th.scope = "col";
        if (c.align === "end") th.classList.add("is-num");
        if (c.width) th.style.width = c.width;
        if (c.sort) {
          const dir = this.sortState && this.sortState.key === c.key ? this.sortState.dir : null;
          th.setAttribute("aria-sort", dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none");
          const b = document.createElement("button");
          b.type = "button";
          b.className = "tsl-dt__sort";
          b.append(c.label);
          const icon = document.createElement("span");
          icon.className = "tsl-dt__sorticon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = dir === "asc" ? "↑" : dir === "desc" ? "↓" : "↕";
          b.appendChild(icon);
          b.addEventListener("click", () => this.sortBy(c.key));
          th.appendChild(b);
        } else th.textContent = c.label;
        tr.appendChild(th);
      });
      this.thead.textContent = "";
      this.thead.appendChild(tr);
    }
    sortBy(key) {
      const cur = this.sortState && this.sortState.key === key ? this.sortState.dir : null;
      this.sortState = cur === null ? { key, dir: "asc" } : cur === "asc" ? { key, dir: "desc" } : null;
      this.page = 0;
      this.update();
      emit(this, "tsl-sort", { key, dir: this.sortState ? this.sortState.dir : null });
    }
    renderBody(cols) {
      this.tbody.textContent = "";
      const span = cols.length + (this.hasAttribute("selectable") ? 1 : 0);
      if (this.loading) {
        for (let r = 0; r < Math.min(this.pageSize, 6); r++) {
          const tr = document.createElement("tr");
          for (let c = 0; c < span; c++) {
            const td = document.createElement("td");
            const sk = document.createElement("span");
            sk.className = "tsl-skeleton";
            sk.style.setProperty("--w", `${50 + (r * 7 + c * 13) % 40}%`);
            td.appendChild(sk);
            tr.appendChild(td);
          }
          this.tbody.appendChild(tr);
        }
        this.table.setAttribute("aria-busy", "true");
        return;
      }
      this.table.removeAttribute("aria-busy");
      if (!this.pageRows.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = span;
        td.className = "tsl-dt__empty";
        const msg = this.q ? `${this.getAttribute("no-match-text") || "Sin resultados para"} «${this.q}»` : this.getAttribute("empty-text") || "Sin datos";
        td.textContent = msg;
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return;
      }
      this.pageRows.forEach((row, ri) => {
        const tr = document.createElement("tr");
        tr.dataset.id = String(row.id);
        tr.setAttribute("aria-rowindex", String(this.page * this.pageSize + ri + 2));
        if (this.hasAttribute("selectable")) {
          const td = document.createElement("td");
          td.className = "tsl-dt__select";
          const box = document.createElement("input");
          box.type = "checkbox";
          box.className = "tsl-check";
          box.setAttribute("aria-label", `${this.getAttribute("select-row-label") || "Seleccionar fila"} ${this.page * this.pageSize + ri + 1}`);
          box.addEventListener("click", (e) => this.onRowBox(e, ri, row));
          td.appendChild(box);
          tr.appendChild(td);
        }
        cols.forEach((c) => {
          const td = document.createElement("td");
          if (c.align === "end") td.classList.add("is-num");
          if (c.render) {
            const out = c.render(row);
            if (out instanceof Node) td.appendChild(out);
            else td.textContent = out == null ? "" : String(out);
          } else td.textContent = this.textOf(row, c);
          tr.appendChild(td);
        });
        tr.addEventListener("click", (e) => {
          if (!e.target.closest("input, button, a, select")) emit(this, "tsl-row-click", { row });
        });
        this.tbody.appendChild(tr);
      });
    }
    onRowBox(e, ri, row) {
      const checked = e.target.checked;
      if (e.shiftKey && this.lastIndex !== null) {
        const [a, b] = [Math.min(this.lastIndex, ri), Math.max(this.lastIndex, ri)];
        this.pageRows.slice(a, b + 1).forEach((r) => checked ? this.selected.add(String(r.id)) : this.selected.delete(String(r.id)));
      } else if (checked) this.selected.add(String(row.id));
      else this.selected.delete(String(row.id));
      this.lastIndex = ri;
      this.refreshSelection(true);
    }
    refreshSelection(fire) {
      if (!this.tbody) return;
      let onPage = 0;
      this.tbody.querySelectorAll("tr[data-id]").forEach((tr) => {
        const on = this.selected.has(tr.dataset.id);
        if (on) onPage++;
        tr.classList.toggle("is-selected", on);
        tr.setAttribute("aria-selected", String(on));
        const box = tr.querySelector(".tsl-dt__select .tsl-check");
        if (box) box.checked = on;
      });
      if (this.headBox && this.pageRows) {
        this.headBox.checked = this.pageRows.length > 0 && onPage === this.pageRows.length;
        this.headBox.indeterminate = onPage > 0 && onPage < this.pageRows.length;
      }
      const n = this.selected.size;
      this.selInfo.hidden = n === 0;
      this.selCount.textContent = `${n} ${n === 1 ? this.getAttribute("selected-one") || "seleccionada" : this.getAttribute("selected-many") || "seleccionadas"}`;
      if (fire) emit(this, "tsl-selection", { ids: this.selectedIds, rows: this.selectedRows });
    }
    renderFooter() {
      const from = this.total ? this.page * this.pageSize + 1 : 0;
      const to = Math.min(this.total, (this.page + 1) * this.pageSize);
      this.rangeText.textContent = this.total ? `${from}–${to} de ${new Intl.NumberFormat(this.locale).format(this.total)}` : "0 resultados";
      const sizes = (this.getAttribute("page-size-options") || "5,10,20,50").split(",").map((n) => parseInt(n, 10));
      if (!sizes.includes(this.pageSize)) sizes.push(this.pageSize);
      sizes.sort((a, b) => a - b);
      this.sizeSel.textContent = "";
      sizes.forEach((n) => {
        const o = document.createElement("option");
        o.value = String(n);
        o.textContent = String(n);
        o.selected = n === this.pageSize;
        this.sizeSel.appendChild(o);
      });
      const mk = (label, page, extra = {}) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.dataset.page = String(page);
        Object.entries(extra).forEach(([k, v]) => v === true ? b.setAttribute(k, "") : b.setAttribute(k, v));
        return b;
      };
      this.pager.textContent = "";
      this.pager.hidden = this.pages < 2;
      if (this.pages < 2) return;
      const p = this.page;
      const last = this.pages - 1;
      this.pager.appendChild(mk("‹", Math.max(0, p - 1), { "aria-label": "Página anterior", ...p === 0 ? { disabled: true } : {} }));
      const nums = new Set([0, last, p - 1, p, p + 1].filter((n) => n >= 0 && n <= last));
      let prev = -1;
      Array.from(nums).sort((a, b) => a - b).forEach((n) => {
        if (n - prev > 1) {
          const dots = document.createElement("span");
          dots.textContent = "…";
          this.pager.appendChild(dots);
        }
        this.pager.appendChild(mk(String(n + 1), n, n === p ? { "aria-current": "page" } : { "aria-label": `Página ${n + 1}` }));
        prev = n;
      });
      this.pager.appendChild(mk("›", Math.min(last, p + 1), { "aria-label": "Página siguiente", ...p === last ? { disabled: true } : {} }));
    }
    // ---- Exportar ---------------------------------------------------------------------------
    toCSV() {
      const cols = this.visibleColumns;
      const esc = (s) => /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      const lines = [cols.map((c) => esc(c.label)).join(",")];
      this.processedRows.forEach((r) => lines.push(cols.map((c) => esc(this.textOf(r, c))).join(",")));
      return lines.join("\n");
    }
    exportCsv(filename = "datos.csv") {
      const blob = new Blob([`\uFEFF${this.toCSV()}`], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
    }
  };
  define("tsl-data-table", TslDataTable);

  // src/components/chart.js
  function niceTicks(min, max, count = 4) {
    if (min === max) max = min + 1;
    const raw = (max - min) / count;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
    const lo = Math.floor(min / step + 1e-9) * step;
    const hi = Math.ceil(max / step - 1e-9) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
    return { lo, hi, ticks };
  }
  function linePath(pts, smooth) {
    if (!pts.length) return "";
    const f = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    if (!smooth || pts.length < 3) return `M${pts.map(f).join("L")}`;
    const n = pts.length;
    const dx = [];
    const m = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = pts[i + 1][0] - pts[i][0];
      m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
    }
    const t = [m[0]];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    t[n - 1] = m[n - 2];
    for (let i = 0; i < n - 1; i++) {
      if (m[i] === 0) t[i] = t[i + 1] = 0;
      else {
        const a = t[i] / m[i];
        const b = t[i + 1] / m[i];
        const s = a * a + b * b;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          t[i] = tau * a * m[i];
          t[i + 1] = tau * b * m[i];
        }
      }
    }
    let d = `M${f(pts[0])}`;
    for (let i = 0; i < n - 1; i++) {
      const c1 = [pts[i][0] + dx[i] / 3, pts[i][1] + t[i] * dx[i] / 3];
      const c2 = [pts[i + 1][0] - dx[i] / 3, pts[i + 1][1] - t[i + 1] * dx[i] / 3];
      d += `C${f(c1)} ${f(c2)} ${f(pts[i + 1])}`;
    }
    return d;
  }
  var polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  var color = (i) => `var(--tsl-chart-${i % 8 + 1})`;
  var escXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var TslChart = class extends TslElement {
    static get observedAttributes() {
      return ["type", "data", "height", "stacked", "horizontal", "smooth", "legend", "caption"];
    }
    attributeChangedCallback(name, old, val) {
      if (!this._tslReady || old === val) return;
      if (name === "data") this._data = this.parseAttrData();
      this.render();
    }
    parseAttrData() {
      try {
        return JSON.parse(this.getAttribute("data") || "null");
      } catch (_) {
        return null;
      }
    }
    get data() {
      return this._data;
    }
    set data(v) {
      this._data = v;
      this.hidden_ = /* @__PURE__ */ new Set();
      if (this._tslReady) this.render();
    }
    setup() {
      this.locale = this.getAttribute("locale") || document.documentElement.lang || void 0;
      if (this._data === void 0) this._data = this.parseAttrData();
      this.hidden_ = this.hidden_ || /* @__PURE__ */ new Set();
      this.active = -1;
      this.width = 0;
      this.textContent = "";
      this.caption = document.createElement("div");
      this.caption.className = "tsl-chart__caption";
      this.legendEl = document.createElement("div");
      this.legendEl.className = "tsl-chart__legend";
      this.stage = document.createElement("div");
      this.stage.className = "tsl-chart__stage";
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute("aria-hidden", "true");
      this.tip = document.createElement("div");
      this.tip.className = "tsl-chart__tip";
      this.tip.hidden = true;
      this.stage.append(this.svg, this.tip);
      this.liveEl = document.createElement("div");
      this.liveEl.className = "tsl-sr-only";
      this.liveEl.setAttribute("aria-live", "polite");
      this.tableEl = document.createElement("div");
      this.tableEl.className = "tsl-sr-only";
      this.append(this.caption, this.legendEl, this.stage, this.liveEl, this.tableEl);
      this.tabIndex = 0;
      this.setAttribute("role", "group");
      this.setAttribute("aria-roledescription", "gráfica");
      this.classList.add("is-animating");
      setTimeout(() => this.classList.remove("is-animating"), 900);
      this.svg.addEventListener("pointermove", (e) => this.onPointer(e));
      this.svg.addEventListener("pointerleave", () => this.setActive(-1));
      this.svg.addEventListener("click", (e) => {
        if (this.active >= 0) emit(this, "tsl-chart-click", this.describe(this.active));
        void e;
      });
      this.addEventListener("keydown", (e) => this.onKey(e));
      this.addEventListener("blur", () => this.setActive(-1));
      this.legendEl.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-i]");
        if (!b) return;
        const i = Number(b.dataset.i);
        if (this.hidden_.has(i)) this.hidden_.delete(i);
        else if (this.legendItems().length - this.hidden_.size > 1) this.hidden_.add(i);
        this.render();
      });
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(() => {
          const w = Math.round(this.stage.clientWidth);
          if (w && w !== this.width) {
            this.width = w;
            this.render();
          }
        });
        this.ro.observe(this.stage);
      }
      this.width = Math.round(this.stage.clientWidth) || 600;
      this.render();
    }
    disconnectedCallback() {
      if (this.ro) this.ro.disconnect();
    }
    get type() {
      return this.getAttribute("type") || "line";
    }
    get height() {
      return parseInt(this.getAttribute("height") || "240", 10);
    }
    fmt(v) {
      if (v === null || v === void 0 || Number.isNaN(v)) return "—";
      const s = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 }).format(v);
      return `${this.getAttribute("prefix") || ""}${s}${this.getAttribute("suffix") || ""}`;
    }
    tick(v) {
      const s = new Intl.NumberFormat(this.locale, { notation: Math.abs(v) >= 1e4 ? "compact" : "standard", maximumFractionDigits: 1 }).format(v);
      return `${this.getAttribute("prefix") || ""}${s}${this.getAttribute("suffix") || ""}`;
    }
    // Elementos de leyenda según el tipo (series o segmentos)
    legendItems() {
      const d = this._data || {};
      if (this.type === "donut") return (d.segments || []).map((s, i) => ({ name: s.label, i }));
      if (["line", "area", "bar"].includes(this.type)) return (d.series || []).map((s, i) => ({ name: s.name, i }));
      return [];
    }
    render() {
      if (!this.svg) return;
      const d = this._data;
      const W = this.width || 600;
      const H = this.height;
      this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", String(H));
      this.hit = null;
      const cap = this.getAttribute("caption");
      this.caption.textContent = cap || "";
      this.caption.hidden = !cap;
      this.setAttribute("aria-label", cap || this.getAttribute("aria-label") || "Gráfica");
      let markup = "";
      if (!d) markup = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
      else if (this.type === "donut") markup = this.renderDonut(W, H, d);
      else if (this.type === "gauge") markup = this.renderGauge(W, H, d);
      else if (this.type === "heatmap") markup = this.renderHeatmap(W, H, d);
      else markup = this.renderXY(W, H, d);
      this.svg.innerHTML = markup;
      this.cursor = this.svg.querySelector(".tsl-chart__cursor");
      this.renderLegend();
      this.renderTable();
      if (this.active >= 0) this.setActive(Math.min(this.active, (this.hit ? this.hit.count : 1) - 1), true);
    }
    renderLegend() {
      const items = this.legendItems();
      const show = this.hasAttribute("legend") || this.type === "donut" && this.getAttribute("legend") !== "false" || items.length > 1 && this.getAttribute("legend") !== "false";
      this.legendEl.textContent = "";
      this.legendEl.hidden = !show || !items.length;
      items.forEach(({ name, i }) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tsl-chart__legend-item";
        b.dataset.i = String(i);
        b.setAttribute("aria-pressed", String(!this.hidden_.has(i)));
        const dot = document.createElement("span");
        dot.className = "tsl-chart__dot";
        dot.style.background = color(i);
        b.append(dot, name);
        this.legendEl.appendChild(b);
      });
    }
    renderTable() {
      const d = this._data;
      if (!d) return this.tableEl.textContent = "";
      let head = [];
      let body = [];
      if (["line", "area", "bar"].includes(this.type)) {
        head = ["", ...(d.series || []).map((s) => s.name)];
        body = (d.labels || []).map((l, i) => [l, ...(d.series || []).map((s) => this.fmt(s.values[i]))]);
      } else if (this.type === "donut") {
        head = ["", "Valor"];
        body = (d.segments || []).map((s) => [s.label, this.fmt(s.value)]);
      } else if (this.type === "gauge") {
        head = ["", "Valor"];
        body = [[d.label || "Valor", this.fmt(d.value)]];
      } else if (this.type === "heatmap") {
        head = ["", ...d.cols || []];
        body = (d.rows || []).map((r, ri) => [r, ...(d.values[ri] || []).map((v) => this.fmt(v))]);
      }
      const table = document.createElement("table");
      const cap = document.createElement("caption");
      cap.textContent = this.getAttribute("caption") || "Datos de la gráfica";
      table.appendChild(cap);
      const thead = document.createElement("tr");
      head.forEach((h) => {
        const th = document.createElement("th");
        th.textContent = h;
        thead.appendChild(th);
      });
      table.appendChild(thead);
      body.forEach((r) => {
        const tr = document.createElement("tr");
        r.forEach((c, i) => {
          const td = document.createElement(i === 0 ? "th" : "td");
          td.textContent = String(c);
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
      this.tableEl.textContent = "";
      this.tableEl.appendChild(table);
    }
    // ---- Línea / área / barras ------------------------------------------------------------
    renderXY(W, H, d) {
      const labels = d.labels || [];
      const all = d.series || [];
      const vis = all.map((s, i) => ({ s, i })).filter(({ i }) => !this.hidden_.has(i));
      const type = this.type;
      const stacked = type === "bar" && this.hasAttribute("stacked");
      const horizontal = type === "bar" && this.hasAttribute("horizontal");
      const n = labels.length;
      if (!n || !vis.length) return `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
      const values = (s) => s.values.map((v) => v === null || v === void 0 ? NaN : Number(v));
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i < n; i++) {
        if (stacked) {
          let pos = 0;
          let neg = 0;
          vis.forEach(({ s }) => {
            const v = values(s)[i] || 0;
            if (v >= 0) pos += v;
            else neg += v;
          });
          hi = Math.max(hi, pos);
          lo = Math.min(lo, neg);
        } else {
          vis.forEach(({ s }) => {
            const v = values(s)[i];
            if (!Number.isNaN(v)) {
              hi = Math.max(hi, v);
              lo = Math.min(lo, v);
            }
          });
        }
      }
      if (!Number.isFinite(lo)) lo = 0;
      if (!Number.isFinite(hi)) hi = 1;
      if (type === "bar" || type === "area") lo = Math.min(0, lo);
      const { lo: y0v, hi: y1v, ticks } = niceTicks(lo, Math.max(hi, lo + 1));
      const tickLen = Math.max(...ticks.map((t) => this.tick(t).length));
      const labelLen = Math.max(...labels.map((l) => String(l).length));
      const m = { top: 10, right: 14, bottom: horizontal ? 24 : 28, left: horizontal ? Math.min(160, labelLen * 6.4 + 14) : Math.max(34, tickLen * 6.4 + 12) };
      const pw = Math.max(10, W - m.left - m.right);
      const ph = Math.max(10, H - m.top - m.bottom);
      const vs = (v) => horizontal ? m.left + (v - y0v) / (y1v - y0v) * pw : m.top + ph - (v - y0v) / (y1v - y0v) * ph;
      const band = (horizontal ? ph : pw) / n;
      const cpos = (i) => type === "bar" ? (horizontal ? m.top : m.left) + band * (i + 0.5) : n === 1 ? m.left + pw / 2 : m.left + pw * i / (n - 1);
      let out = "";
      ticks.forEach((t) => {
        const p = vs(t);
        if (horizontal) out += `<line class="tsl-chart__grid" x1="${p}" x2="${p}" y1="${m.top}" y2="${m.top + ph}"/><text class="tsl-chart__tick" x="${p}" y="${H - 8}" text-anchor="middle">${escXml(this.tick(t))}</text>`;
        else out += `<line class="tsl-chart__grid" x1="${m.left}" x2="${m.left + pw}" y1="${p}" y2="${p}"/><text class="tsl-chart__tick" x="${m.left - 8}" y="${p + 3.5}" text-anchor="end">${escXml(this.tick(t))}</text>`;
      });
      const maxLabels = Math.max(1, Math.floor(horizontal ? ph / 16 : pw / (labelLen * 6.4 + 10)));
      const every = Math.ceil(n / maxLabels);
      labels.forEach((l, i) => {
        if (i % every) return;
        if (horizontal) out += `<text class="tsl-chart__tick" x="${m.left - 8}" y="${cpos(i) + 3.5}" text-anchor="end">${escXml(l)}</text>`;
        else out += `<text class="tsl-chart__tick" x="${cpos(i)}" y="${H - 9}" text-anchor="middle">${escXml(l)}</text>`;
      });
      const zero = vs(Math.max(y0v, Math.min(0, y1v)));
      if (type === "bar") {
        const g = Math.max(2, band * 0.2);
        const inner = band - g;
        const k = stacked ? 1 : vis.length;
        const bw = Math.max(2, inner / k - (k > 1 ? 2 : 0));
        vis.forEach(({ s, i: si }, vi) => {
          const vals = values(s);
          labels.forEach((_, i) => {
            const v = vals[i];
            if (Number.isNaN(v)) return;
            let a = zero;
            let b = vs(v);
            if (stacked) {
              let base = 0;
              for (let j = 0; j < vi; j++) {
                const pv = values(vis[j].s)[i] || 0;
                if (pv >= 0 === v >= 0) base += pv;
              }
              a = vs(base);
              b = vs(base + v);
            }
            const start = band * i + g / 2 + (stacked ? 0 : vi * (inner / k));
            if (horizontal) {
              const x = Math.min(a, b);
              out += `<rect class="tsl-chart__bar" x="${x}" y="${m.top + start}" width="${Math.max(1, Math.abs(b - a))}" height="${bw}" rx="2" fill="${color(si)}"/>`;
            } else {
              const y = Math.min(a, b);
              out += `<rect class="tsl-chart__bar" x="${m.left + start}" y="${y}" width="${bw}" height="${Math.max(1, Math.abs(b - a))}" rx="2" fill="${color(si)}"/>`;
            }
          });
        });
        out += `<line class="tsl-chart__axis" ${horizontal ? `x1="${zero}" x2="${zero}" y1="${m.top}" y2="${m.top + ph}"` : `x1="${m.left}" x2="${m.left + pw}" y1="${zero}" y2="${zero}"`}/>`;
      } else {
        vis.forEach(({ s, i: si }) => {
          const pts = values(s).map((v, i) => Number.isNaN(v) ? null : [cpos(i), vs(v)]);
          const segs = [];
          let cur = [];
          pts.forEach((p) => {
            if (p) cur.push(p);
            else if (cur.length) segs.push(cur), cur = [];
          });
          if (cur.length) segs.push(cur);
          segs.forEach((seg) => {
            const smooth = this.hasAttribute("smooth");
            const path = linePath(seg, smooth);
            if (type === "area") out += `<path class="tsl-chart__area" d="${path}L${seg[seg.length - 1][0].toFixed(1)},${zero}L${seg[0][0].toFixed(1)},${zero}Z" fill="${color(si)}"/>`;
            out += `<path class="tsl-chart__line" d="${path}" pathLength="1" stroke="${color(si)}"/>`;
          });
          if (n <= 24) pts.forEach((p) => p && (out += `<circle class="tsl-chart__point" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="${color(si)}"/>`));
        });
      }
      out += `<g class="tsl-chart__cursor"></g>`;
      this.hit = { kind: "xy", count: n, m, pw, ph, band, cpos, vs, vis, values, labels, horizontal, stacked, type, zero };
      return out;
    }
    // ---- Dona -----------------------------------------------------------------------------------
    segments() {
      const d = this._data || {};
      return (d.segments || []).map((s, i) => ({ ...s, i })).filter((s) => !this.hidden_.has(s.i) && Number(s.value) > 0);
    }
    renderDonut(W, H, d) {
      const segs = this.segments();
      const total = segs.reduce((a2, s) => a2 + Number(s.value), 0);
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.max(20, Math.min(W, H) / 2 - 10);
      const ratio = parseFloat(this.getAttribute("thickness") || "0.3");
      const ri = r * (1 - ratio);
      if (!total) return `<text x="${cx}" y="${cy}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
      let out = "";
      let a = -Math.PI / 2;
      const gap = segs.length > 1 ? 0.025 : 0;
      segs.forEach((s) => {
        const sweep = Math.min(Number(s.value) / total * Math.PI * 2, Math.PI * 2 - 1e-4);
        const a0 = a + gap / 2;
        const a1 = a + sweep - gap / 2;
        a += sweep;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const [x0, y0] = polar(cx, cy, r, a0);
        const [x1, y1] = polar(cx, cy, r, a1);
        const [x2, y2] = polar(cx, cy, ri, a1);
        const [x3, y3] = polar(cx, cy, ri, a0);
        const mid = (a0 + a1) / 2;
        out += `<path class="tsl-chart__seg" data-i="${s.i}" data-dx="${Math.cos(mid).toFixed(3)}" data-dy="${Math.sin(mid).toFixed(3)}" d="M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}A${ri},${ri} 0 ${large} 0 ${x3.toFixed(2)},${y3.toFixed(2)}Z" fill="${color(s.i)}"/>`;
      });
      out += `<g class="tsl-chart__center"><text class="tsl-chart__center-value" x="${cx}" y="${cy + 2}" text-anchor="middle">${escXml(this.fmt(total))}</text><text class="tsl-chart__center-label" x="${cx}" y="${cy + 20}" text-anchor="middle">${escXml(this.getAttribute("center-label") || "Total")}</text></g>`;
      this.hit = { kind: "donut", count: segs.length, segs, total, cx, cy, r, d };
      return out;
    }
    // ---- Gauge -----------------------------------------------------------------------------------
    renderGauge(W, H, d) {
      const min = d.min ?? 0;
      const max = d.max ?? 100;
      const value = clamp(Number(d.value), min, max);
      const ratio = (value - min) / (max - min || 1);
      const r = Math.max(30, Math.min(W / 2 - 22, H - 52));
      const cx = W / 2;
      const cy = H - 34;
      const stroke = 16;
      const arc = (r0, from, to) => {
        const [x0, y0] = polar(cx, cy, r0, Math.PI + from * Math.PI);
        const [x1, y1] = polar(cx, cy, r0, Math.PI + to * Math.PI);
        return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r0},${r0} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
      };
      let out = `<path class="tsl-chart__track" d="${arc(r, 0, 1)}" stroke-width="${stroke}"/>`;
      const th = (d.thresholds || []).slice().sort((a, b) => a.to - b.to);
      let prev = min;
      th.forEach((t) => {
        const a = (prev - min) / (max - min || 1);
        const b = (clamp(t.to, min, max) - min) / (max - min || 1);
        if (b > a) out += `<path class="tsl-chart__band-arc" d="${arc(r, a, b)}" stroke="${t.color || color(0)}" stroke-width="${stroke}"/>`;
        prev = t.to;
      });
      const hit = th.find((t) => value <= t.to);
      const c = hit && hit.color || color(0);
      if (ratio > 0) out += `<path class="tsl-chart__value-arc" d="${arc(r, 0, ratio)}" pathLength="1" stroke="${c}" stroke-width="${stroke}"/>`;
      out += `<text class="tsl-chart__center-value" x="${cx}" y="${cy - 8}" text-anchor="middle">${escXml(this.fmt(Number(d.value)))}</text>`;
      if (d.label) out += `<text class="tsl-chart__center-label" x="${cx}" y="${cy + 12}" text-anchor="middle">${escXml(d.label)}</text>`;
      out += `<text class="tsl-chart__tick" x="${cx - r}" y="${cy + 18}" text-anchor="middle">${escXml(this.tick(min))}</text><text class="tsl-chart__tick" x="${cx + r}" y="${cy + 18}" text-anchor="middle">${escXml(this.tick(max))}</text>`;
      this.setAttribute("aria-valuenow", String(d.value));
      this.setAttribute("aria-valuetext", `${d.label ? `${d.label}: ` : ""}${this.fmt(Number(d.value))}`);
      this.hit = { kind: "gauge", count: 1 };
      return out;
    }
    // ---- Mapa de calor ---------------------------------------------------------------------------
    renderHeatmap(W, H, d) {
      const rows = d.rows || [];
      const cols = d.cols || [];
      const vals = d.values || [];
      if (!rows.length || !cols.length) return `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="tsl-chart__tick">Sin datos</text>`;
      const flat = vals.flat().filter((v) => v !== null && v !== void 0 && !Number.isNaN(v));
      const lo = d.min ?? Math.min(...flat);
      const hi = d.max ?? Math.max(...flat);
      const left = Math.min(120, Math.max(...rows.map((r) => String(r).length)) * 6.4 + 12);
      const top = 22;
      const bottom = 26;
      const cw = (W - left - 8) / cols.length;
      const ch = Math.max(10, Math.min(36, (H - top - bottom) / rows.length));
      let out = "";
      cols.forEach((c, ci) => out += `<text class="tsl-chart__tick" x="${left + cw * (ci + 0.5)}" y="${top - 8}" text-anchor="middle">${escXml(c)}</text>`);
      rows.forEach((r, ri) => {
        out += `<text class="tsl-chart__tick" x="${left - 8}" y="${top + ch * (ri + 0.5) + 3.5}" text-anchor="end">${escXml(r)}</text>`;
        cols.forEach((_, ci) => {
          const v = (vals[ri] || [])[ci];
          const empty = v === null || v === void 0 || Number.isNaN(v);
          const t = empty ? 0 : (v - lo) / (hi - lo || 1);
          out += `<rect class="tsl-chart__cell${empty ? " is-empty" : ""}" data-r="${ri}" data-c="${ci}" x="${(left + cw * ci + 1).toFixed(1)}" y="${(top + ch * ri + 1).toFixed(1)}" width="${Math.max(1, cw - 2).toFixed(1)}" height="${Math.max(1, ch - 2)}" rx="3" fill="${color(0)}" fill-opacity="${empty ? 0 : (0.1 + 0.9 * t).toFixed(3)}"/>`;
        });
      });
      const ly = top + ch * rows.length + 10;
      const steps = 5;
      out += `<text class="tsl-chart__tick" x="${left}" y="${ly + 9}" text-anchor="start">${escXml(this.tick(lo))}</text><text class="tsl-chart__tick" x="${W - 8}" y="${ly + 9}" text-anchor="end">${escXml(this.tick(hi))}</text>`;
      for (let i = 0; i < steps; i++) out += `<rect x="${(W / 2 - 40 + i * 16).toFixed(1)}" y="${ly}" width="14" height="10" rx="2" fill="${color(0)}" fill-opacity="${(0.1 + 0.9 * i / (steps - 1)).toFixed(2)}"/>`;
      out += `<g class="tsl-chart__cursor"></g>`;
      this.hit = { kind: "heat", count: rows.length * cols.length, rows, cols, vals, left, top, cw, ch };
      return out;
    }
    // ---- Interacción -------------------------------------------------------------------------------
    onPointer(e) {
      const h = this.hit;
      if (!h) return;
      const r = this.svg.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * (this.width || r.width);
      const y = e.clientY - r.top;
      if (h.kind === "xy") {
        const along = h.horizontal ? y : x;
        const start = h.horizontal ? h.m.top : h.m.left;
        let idx;
        if (h.type === "bar") idx = Math.floor((along - start) / h.band);
        else {
          let best = 0;
          let dist = Infinity;
          for (let i = 0; i < h.count; i++) {
            const dd = Math.abs(h.cpos(i) - along);
            if (dd < dist) dist = dd, best = i;
          }
          idx = best;
        }
        const inside = x >= h.m.left - 4 && x <= h.m.left + h.pw + 4 && y >= h.m.top - 4 && y <= h.m.top + h.ph + 4;
        this.setActive(inside ? clamp(idx, 0, h.count - 1) : -1, false, e);
      } else if (h.kind === "donut") {
        const seg = e.target.closest && e.target.closest("path[data-i]");
        const i = seg ? h.segs.findIndex((s) => s.i === Number(seg.dataset.i)) : -1;
        this.setActive(i, false, e);
      } else if (h.kind === "heat") {
        const c = e.target.closest && e.target.closest("rect[data-r]");
        this.setActive(c ? Number(c.dataset.r) * h.cols.length + Number(c.dataset.c) : -1, false, e);
      }
    }
    onKey(e) {
      const h = this.hit;
      if (!h || h.kind === "gauge") return;
      const k = e.key;
      let next = null;
      const cur = this.active < 0 ? -1 : this.active;
      if (h.kind === "heat") {
        const cols = h.cols.length;
        const base = cur < 0 ? 0 : cur;
        if (k === "ArrowRight") next = cur < 0 ? 0 : Math.min(h.count - 1, base + 1);
        else if (k === "ArrowLeft") next = cur < 0 ? 0 : Math.max(0, base - 1);
        else if (k === "ArrowDown") next = cur < 0 ? 0 : Math.min(h.count - 1, base + cols);
        else if (k === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, base - cols);
      } else {
        const horizontal = h.kind === "xy" && h.horizontal;
        const fwd = horizontal ? "ArrowDown" : "ArrowRight";
        const back = horizontal ? "ArrowUp" : "ArrowLeft";
        if (k === fwd || h.kind === "donut" && k === "ArrowDown") next = cur < 0 ? 0 : Math.min(h.count - 1, cur + 1);
        else if (k === back || h.kind === "donut" && k === "ArrowUp") next = cur < 0 ? 0 : Math.max(0, cur - 1);
      }
      if (k === "Home") next = 0;
      else if (k === "End") next = h.count - 1;
      else if (k === "Escape") {
        this.setActive(-1);
        return;
      } else if ((k === "Enter" || k === " ") && this.active >= 0) {
        e.preventDefault();
        emit(this, "tsl-chart-click", this.describe(this.active));
        return;
      }
      if (next === null) return;
      e.preventDefault();
      this.setActive(next, true);
    }
    // Datos del punto activo: etiqueta y valores por serie
    describe(i) {
      const h = this.hit;
      if (!h) return null;
      if (h.kind === "xy") {
        return { index: i, label: h.labels[i], values: h.vis.map(({ s }) => ({ name: s.name, value: s.values[i], color: color(h.vis.find((v) => v.s === s).i) })) };
      }
      if (h.kind === "donut") {
        const s = h.segs[i];
        return { index: i, label: s.label, values: [{ name: s.label, value: Number(s.value), color: color(s.i), percent: Number(s.value) / h.total * 100 }] };
      }
      if (h.kind === "heat") {
        const r = Math.floor(i / h.cols.length);
        const c = i % h.cols.length;
        return { index: i, label: `${h.rows[r]} · ${h.cols[c]}`, values: [{ name: h.rows[r], value: (h.vals[r] || [])[c], color: color(0) }] };
      }
      return null;
    }
    setActive(i, fromKeyboard = false, pointerEvent) {
      const h = this.hit;
      const changed = i !== this.active;
      this.active = i;
      this.querySelectorAll(".tsl-chart__seg.is-active").forEach((el) => el.classList.remove("is-active"));
      if (this.cursor) this.cursor.textContent = "";
      this.stage.classList.toggle("has-active", i >= 0);
      if (!h || i < 0) {
        this.tip.hidden = true;
        this.liveEl.textContent = "";
        if (h && h.kind === "donut") this.resetCenter();
        return;
      }
      const info = this.describe(i);
      let ax = 0;
      let ay = 0;
      if (h.kind === "xy") {
        const pos = h.cpos(i);
        const g = this.cursor;
        let marks = "";
        if (h.type === "bar") {
          marks = h.horizontal ? `<rect class="tsl-chart__hl" x="${h.m.left}" y="${h.m.top + h.band * i}" width="${h.pw}" height="${h.band}"/>` : `<rect class="tsl-chart__hl" x="${h.m.left + h.band * i}" y="${h.m.top}" width="${h.band}" height="${h.ph}"/>`;
          ax = h.horizontal ? h.m.left + h.pw / 2 : pos;
          ay = h.horizontal ? pos : h.m.top;
        } else {
          marks = `<line class="tsl-chart__cross" x1="${pos}" x2="${pos}" y1="${h.m.top}" y2="${h.m.top + h.ph}"/>`;
          h.vis.forEach(({ s, i: si }) => {
            const v = Number(s.values[i]);
            if (!Number.isNaN(v) && s.values[i] !== null) marks += `<circle class="tsl-chart__hot" cx="${pos}" cy="${h.vs(v)}" r="4.5" fill="${color(si)}"/>`;
          });
          ax = pos;
          ay = h.m.top;
        }
        if (g) g.innerHTML = marks;
      } else if (h.kind === "donut") {
        const el = this.svg.querySelectorAll("path[data-i]")[i];
        if (el) {
          el.classList.add("is-active");
          el.style.transform = `translate(${(Number(el.dataset.dx) * 5).toFixed(1)}px, ${(Number(el.dataset.dy) * 5).toFixed(1)}px)`;
        }
        this.svg.querySelectorAll("path[data-i]").forEach((p, j) => j !== i && (p.style.transform = ""));
        const c = this.svg.querySelector(".tsl-chart__center");
        if (c) {
          c.querySelector(".tsl-chart__center-value").textContent = this.fmt(info.values[0].value);
          c.querySelector(".tsl-chart__center-label").textContent = `${info.label} · ${info.values[0].percent.toFixed(1)}%`;
        }
        const mid = Math.atan2(Number(el.dataset.dy), Number(el.dataset.dx));
        ax = h.cx + (h.r + 6) * Math.cos(mid);
        ay = h.cy + (h.r + 6) * Math.sin(mid);
      } else if (h.kind === "heat") {
        const r = Math.floor(i / h.cols.length);
        const c = i % h.cols.length;
        if (this.cursor) this.cursor.innerHTML = `<rect class="tsl-chart__cell-hl" x="${(h.left + h.cw * c + 0.5).toFixed(1)}" y="${(h.top + h.ch * r + 0.5).toFixed(1)}" width="${(h.cw - 1).toFixed(1)}" height="${(h.ch - 1).toFixed(1)}" rx="3"/>`;
        ax = h.left + h.cw * (c + 0.5);
        ay = h.top + h.ch * r;
      }
      this.showTip(info, ax, ay, pointerEvent);
      this.liveEl.textContent = `${info.label}: ${info.values.map((v) => `${v.name !== info.label ? `${v.name} ` : ""}${this.fmt(v.value)}`).join(", ")}`;
      if (changed) emit(this, "tsl-chart-hover", info);
      void fromKeyboard;
    }
    resetCenter() {
      const h = this.hit;
      const c = this.svg.querySelector(".tsl-chart__center");
      if (c && h && h.kind === "donut") {
        c.querySelector(".tsl-chart__center-value").textContent = this.fmt(h.total);
        c.querySelector(".tsl-chart__center-label").textContent = this.getAttribute("center-label") || "Total";
        this.svg.querySelectorAll("path[data-i]").forEach((p) => p.style.transform = "");
      }
    }
    showTip(info, ax, ay, pointerEvent) {
      this.tip.textContent = "";
      const title = document.createElement("div");
      title.className = "tsl-chart__tip-title";
      title.textContent = info.label;
      this.tip.appendChild(title);
      info.values.forEach((v) => {
        const row = document.createElement("div");
        row.className = "tsl-chart__tip-row";
        const dot = document.createElement("span");
        dot.className = "tsl-chart__dot";
        dot.style.background = v.color;
        const name = document.createElement("span");
        name.textContent = v.name === info.label ? "" : v.name;
        const val = document.createElement("strong");
        val.textContent = this.fmt(v.value);
        row.append(dot, name, val);
        if (v.percent !== void 0) {
          const pct = document.createElement("span");
          pct.className = "tsl-muted";
          pct.textContent = `${v.percent.toFixed(1)}%`;
          row.appendChild(pct);
        }
        this.tip.appendChild(row);
      });
      this.tip.hidden = false;
      const W = this.stage.clientWidth;
      const tw = this.tip.offsetWidth;
      const th = this.tip.offsetHeight;
      let x = ax + 12;
      let y = ay + 4;
      if (pointerEvent && this.hit.kind !== "xy") {
        const r = this.stage.getBoundingClientRect();
        x = pointerEvent.clientX - r.left + 14;
        y = pointerEvent.clientY - r.top + 14;
      }
      if (x + tw > W - 4) x = (this.hit.kind === "xy" ? ax : x) - tw - 14;
      this.tip.style.left = `${clamp(x, 4, Math.max(4, W - tw - 4))}px`;
      this.tip.style.top = `${clamp(y, 4, Math.max(4, this.height - th - 4))}px`;
    }
  };
  define("tsl-chart", TslChart);

  // src/components/sidebar.js
  var TslSidebar = class extends TslElement {
    setup() {
      this.id = this.id || nextId("tsl-sidebar");
      if (!this.hasAttribute("role")) this.setAttribute("role", "navigation");
      if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", this.getAttribute("label") || "Barra lateral");
      this.layout = this.closest(".tsl-sidebar-layout") || this.parentElement;
      this.mobile = false;
      this.mobileIsOpen = false;
      const saved = this.storageKey && storage.get(`tsl-sidebar:${this.storageKey}`);
      if (saved !== null && saved !== void 0) this.toggleAttribute("collapsed", saved === "1");
      this.backdrop = document.createElement("div");
      this.backdrop.className = "tsl-sidebar__backdrop";
      this.backdrop.addEventListener("click", () => this.closeMobile());
      this.layout.appendChild(this.backdrop);
      this.querySelectorAll(".tsl-sidebar__sub").forEach((sub) => {
        const btn = sub.previousElementSibling;
        if (!btn || !btn.classList.contains("tsl-sidebar__item")) return;
        sub.id = sub.id || nextId("tsl-sidebar-sub");
        btn.setAttribute("aria-controls", sub.id);
        if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", String(!sub.hidden));
        sub.hidden = btn.getAttribute("aria-expanded") !== "true";
        btn.addEventListener("click", () => {
          const open = btn.getAttribute("aria-expanded") !== "true";
          btn.setAttribute("aria-expanded", String(open));
          sub.hidden = !open;
        });
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.mobile && this.mobileIsOpen) {
          e.preventDefault();
          this.closeMobile();
        }
      });
      this.addEventListener("click", (e) => {
        if (this.mobile && e.target.closest("a[href]")) this.closeMobile();
      });
      this.onKey = (e) => {
        const key = this.getAttribute("shortcut");
        if (key && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          this.toggle();
        }
      };
      document.addEventListener("keydown", this.onKey);
      this.resizer = new ResizeObserver(() => this.measure());
      this.resizer.observe(this.layout);
      this.measure();
    }
    disconnectedCallback() {
      document.removeEventListener("keydown", this.onKey);
      if (this.resizer) this.resizer.disconnect();
      if (this.backdrop) this.backdrop.remove();
      this._tslReady = false;
    }
    get storageKey() {
      return this.getAttribute("storage-key");
    }
    get breakpoint() {
      return parseInt(this.getAttribute("breakpoint"), 10) || 720;
    }
    get side() {
      return this.getAttribute("side") === "end" ? "end" : "start";
    }
    get collapsed() {
      return this.hasAttribute("collapsed");
    }
    set collapsed(v) {
      this.toggle(!v);
    }
    get isMobile() {
      return this.mobile;
    }
    get mobileOpen() {
      return this.mobileIsOpen;
    }
    measure() {
      const mobile = this.layout.clientWidth < this.breakpoint;
      if (mobile !== this.mobile) {
        this.mobile = mobile;
        this.mobileIsOpen = false;
      }
      this.paint();
    }
    /** Alterna la barra: en escritorio la contrae, en móvil abre o cierra el cajón. Con `true` la muestra y con `false` la oculta. */
    toggle(show) {
      if (this.mobile) {
        const next = show === void 0 ? !this.mobileIsOpen : Boolean(show);
        return next ? this.openMobile() : this.closeMobile();
      }
      const collapsed = show === void 0 ? !this.collapsed : !show;
      if (collapsed === this.collapsed) return;
      this.toggleAttribute("collapsed", collapsed);
      if (this.storageKey) storage.set(`tsl-sidebar:${this.storageKey}`, collapsed ? "1" : "0");
      this.paint();
      emit(this, "tsl-toggle", { collapsed, open: !collapsed, mobile: false });
    }
    collapse() {
      this.toggle(false);
    }
    expand() {
      this.toggle(true);
    }
    openMobile() {
      if (!this.mobile || this.mobileIsOpen) return;
      this.mobileIsOpen = true;
      this.returnFocus = document.activeElement;
      this.paint();
      const first = this.querySelector("a[href], button:not([disabled])");
      if (first) first.focus();
      emit(this, "tsl-toggle", { collapsed: this.collapsed, open: true, mobile: true });
    }
    closeMobile() {
      if (!this.mobile || !this.mobileIsOpen) return;
      this.mobileIsOpen = false;
      this.paint();
      if (this.returnFocus && this.returnFocus.isConnected) this.returnFocus.focus();
      emit(this, "tsl-toggle", { collapsed: this.collapsed, open: false, mobile: true });
    }
    paint() {
      const rail = !this.mobile && this.collapsed;
      const hidden = this.mobile ? !this.mobileIsOpen : rail && this.getAttribute("collapsible") === "offcanvas";
      this.dataset.side = this.side;
      this.toggleAttribute("data-mobile", this.mobile);
      this.toggleAttribute("data-open", this.mobile && this.mobileIsOpen);
      this.toggleAttribute("data-rail", rail && this.getAttribute("collapsible") !== "offcanvas");
      this.inert = hidden;
      this.backdrop.toggleAttribute("data-open", this.mobile && this.mobileIsOpen);
      this.autoTitled = this.autoTitled || /* @__PURE__ */ new WeakSet();
      this.querySelectorAll(".tsl-sidebar__item").forEach((item) => {
        const text = item.querySelector(".tsl-sidebar__text");
        if (!text) return;
        if (rail) {
          if (!item.title) {
            item.title = text.textContent.trim();
            this.autoTitled.add(item);
          }
        } else if (this.autoTitled.has(item)) {
          this.autoTitled.delete(item);
          item.title = "";
          item.removeAttribute("title");
        }
      });
      const expanded = this.mobile ? this.mobileIsOpen : !this.collapsed;
      document.querySelectorAll("[data-tsl-sidebar-toggle]").forEach((btn) => {
        if (this.owns(btn)) {
          btn.setAttribute("aria-controls", this.id);
          btn.setAttribute("aria-expanded", String(expanded));
        }
      });
    }
    owns(btn) {
      const target = btn.dataset.tslSidebarToggle;
      return target ? target === this.id : this.layout.contains(btn);
    }
  };
  define("tsl-sidebar", TslSidebar);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tsl-sidebar-toggle]");
    if (!btn) return;
    const sidebars = Array.from(document.querySelectorAll("tsl-sidebar"));
    const target = btn.dataset.tslSidebarToggle;
    const sb = sidebars.find((s) => target ? s.id === target : s.layout && s.layout.contains(btn));
    if (sb) sb.toggle();
  });

  // src/components/radio-group.js
  var TslRadioGroup = class extends TslFormElement {
    setup() {
      this.setAttribute("role", "radiogroup");
      if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) this.setAttribute("aria-label", this.getAttribute("label") || "Opciones");
      this.items = Array.from(this.querySelectorAll(".tsl-radio"));
      this.initial = this.getAttribute("value") || "";
      this.items.forEach((item) => {
        item.type = "button";
        item.setAttribute("role", "radio");
        const mark = document.createElement("span");
        mark.className = "tsl-radio__mark";
        mark.setAttribute("aria-hidden", "true");
        item.prepend(mark);
        item.addEventListener("click", () => this.choose(item.value, true));
        item.addEventListener("keydown", (e) => this.onKey(e, item));
      });
      this.choose(this.initial, false);
      this.syncDisabled();
    }
    get orientation() {
      return this.getAttribute("orientation") === "horizontal" ? "horizontal" : "vertical";
    }
    get value() {
      return this.val || "";
    }
    set value(v) {
      this.choose(String(v ?? ""), false);
    }
    enabledItems() {
      return this.items.filter((i) => !i.disabled && !this.isDisabled);
    }
    onKey(e, item) {
      const rtl = getComputedStyle(this).direction === "rtl";
      const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"];
      const fwd = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
      const list = this.enabledItems();
      if (!list.length) return;
      const at = list.indexOf(item);
      let next = null;
      if (fwd.includes(e.key)) next = list[(at + 1) % list.length];
      else if (back.includes(e.key)) next = list[(at - 1 + list.length) % list.length];
      else if (e.key === "Home") next = list[0];
      else if (e.key === "End") next = list[list.length - 1];
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.choose(item.value, true);
        return;
      }
      if (!next) return;
      e.preventDefault();
      next.focus();
      this.choose(next.value, true);
    }
    choose(value, fire) {
      if (this.isDisabled) return;
      const target = this.items.find((i) => i.value === value && !i.disabled);
      if (value && !target) return;
      const changed = (target ? target.value : "") !== this.value;
      this.val = target ? target.value : "";
      this.paint();
      if (fire && changed) emit(this, "tsl-change", { value: this.val });
    }
    paint() {
      const list = this.enabledItems();
      const stop = this.items.find((i) => i.value === this.val && !i.disabled) || list[0];
      this.items.forEach((i) => {
        const on = Boolean(this.val) && i.value === this.val;
        i.setAttribute("aria-checked", String(on));
        i.tabIndex = i === stop ? 0 : -1;
      });
      this.setAttribute("aria-orientation", this.orientation);
      this.publish(this.val || null, !this.val, this.items[0]);
    }
    syncDisabled() {
      this.toggleAttribute("aria-disabled", this.isDisabled);
      this.items.forEach((i) => {
        i.inert = this.isDisabled;
      });
      if (this._tslReady) this.paint();
    }
    reset() {
      this.val = "";
      this.choose(this.initial, false);
    }
  };
  define("tsl-radio-group", TslRadioGroup);

  // src/components/carousel.js
  var reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TslCarousel = class extends TslElement {
    setup() {
      this.track = this.querySelector(":scope > .tsl-carousel__track");
      if (!this.track) return;
      this.slides = Array.from(this.track.querySelectorAll(":scope > .tsl-carousel__slide"));
      this.current = 0;
      this.setAttribute("role", "region");
      this.setAttribute("aria-roledescription", "carrusel");
      this.setAttribute("aria-label", this.getAttribute("label") || "Carrusel");
      this.style.setProperty("--tsl-per-view", String(this.perView));
      this.track.tabIndex = 0;
      this.track.setAttribute("role", "group");
      this.track.setAttribute("aria-label", `${this.getAttribute("label") || "Carrusel"}: diapositivas`);
      this.track.id = this.track.id || nextId("tsl-carousel");
      this.slides.forEach((s, i) => {
        s.setAttribute("role", "group");
        s.setAttribute("aria-roledescription", "diapositiva");
        s.setAttribute("aria-label", `${i + 1} de ${this.slides.length}`);
      });
      this.prevBtn = this.control("prev", "Anterior", "‹");
      this.nextBtn = this.control("next", "Siguiente", "›");
      this.prevBtn.addEventListener("click", () => this.prev());
      this.nextBtn.addEventListener("click", () => this.next());
      if (this.hasAttribute("dots") || this.hasAttribute("autoplay")) {
        this.bar = document.createElement("div");
        this.bar.className = "tsl-carousel__bar";
        this.appendChild(this.bar);
      }
      if (this.hasAttribute("dots")) this.buildDots();
      if (this.hasAttribute("autoplay")) this.buildAutoplay();
      this.track.addEventListener("scroll", () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          this.sync(true);
        });
      }, { passive: true });
      this.track.addEventListener("keydown", (e) => {
        const keys = this.vertical ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
        const rtl = getComputedStyle(this).direction === "rtl" && !this.vertical;
        if (e.key === keys[0]) this[rtl ? "next" : "prev"]();
        else if (e.key === keys[1]) this[rtl ? "prev" : "next"]();
        else if (e.key === "Home") this.goTo(0);
        else if (e.key === "End") this.goTo(this.pageCount - 1);
        else return;
        e.preventDefault();
        this.pauseAuto();
      });
      this.addEventListener("mouseenter", () => this.hovered = true);
      this.addEventListener("mouseleave", () => this.hovered = false);
      this.addEventListener("focusin", () => this.focused = true);
      this.addEventListener("focusout", () => this.focused = false);
      this.resizer = new ResizeObserver(() => this.sync(false));
      this.resizer.observe(this.track);
      this.sync(false);
      this.startAuto();
    }
    disconnectedCallback() {
      clearInterval(this.timer);
      if (this.resizer) this.resizer.disconnect();
      this._tslReady = false;
    }
    get vertical() {
      return this.getAttribute("orientation") === "vertical";
    }
    get perView() {
      return Math.max(1, parseInt(this.getAttribute("per-view"), 10) || 1);
    }
    get loop() {
      return this.hasAttribute("loop");
    }
    get pageCount() {
      return Math.max(1, this.slides.length - this.perView + 1);
    }
    get index() {
      return this.current;
    }
    set index(v) {
      this.goTo(v, false);
    }
    control(kind, label, glyph) {
      let btn = this.querySelector(`:scope > [data-tsl-${kind}]`);
      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = `tsl-btn tsl-btn--icon tsl-carousel__nav tsl-carousel__${kind}`;
        btn.textContent = glyph;
        this.appendChild(btn);
      }
      btn.setAttribute("aria-label", label);
      btn.setAttribute("aria-controls", this.track.id);
      return btn;
    }
    buildDots() {
      this.dotBar = document.createElement("div");
      this.dotBar.className = "tsl-carousel__dots";
      for (let i = 0; i < this.pageCount; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "tsl-carousel__dot";
        dot.setAttribute("aria-label", `Ir a la diapositiva ${i + 1}`);
        dot.addEventListener("click", () => {
          this.goTo(i);
          this.pauseAuto();
        });
        this.dotBar.appendChild(dot);
      }
      this.bar.appendChild(this.dotBar);
    }
    buildAutoplay() {
      this.playBtn = document.createElement("button");
      this.playBtn.type = "button";
      this.playBtn.className = "tsl-btn tsl-btn--icon tsl-btn--sm tsl-carousel__play";
      this.playBtn.addEventListener("click", () => this.playing ? this.pauseAuto() : this.startAuto(true));
      this.bar.appendChild(this.playBtn);
      this.playing = false;
    }
    startAuto(force) {
      if (!this.hasAttribute("autoplay") || reduced() && !force) return this.paintPlay();
      clearInterval(this.timer);
      const ms = Math.max(1500, parseInt(this.getAttribute("autoplay"), 10) || 5e3);
      this.playing = true;
      this.timer = setInterval(() => {
        if (this.hovered || this.focused || document.hidden) return;
        if (this.current >= this.pageCount - 1) this.goTo(0);
        else this.next();
      }, ms);
      this.paintPlay();
    }
    pauseAuto() {
      clearInterval(this.timer);
      this.playing = false;
      this.paintPlay();
    }
    paintPlay() {
      if (!this.playBtn) return;
      this.playBtn.textContent = this.playing ? "❚❚" : "▶";
      this.playBtn.setAttribute("aria-label", this.playing ? "Pausar avance automático" : "Reanudar avance automático");
      this.track.setAttribute("aria-live", this.playing ? "off" : "polite");
    }
    offsetOf(slide) {
      const t = this.track.getBoundingClientRect();
      const s = slide.getBoundingClientRect();
      if (this.vertical) return s.top - t.top;
      return getComputedStyle(this).direction === "rtl" ? s.right - t.right : s.left - t.left;
    }
    goTo(i, smooth = true) {
      const page = this.loop ? (i % this.pageCount + this.pageCount) % this.pageCount : Math.min(this.pageCount - 1, Math.max(0, i));
      const slide = this.slides[page];
      if (!slide) return;
      const delta = this.offsetOf(slide);
      this.track.scrollBy({ [this.vertical ? "top" : "left"]: delta, behavior: smooth && !reduced() ? "smooth" : "instant" });
      if (!smooth || reduced()) this.sync(true);
    }
    next() {
      this.goTo(this.loop && this.current >= this.pageCount - 1 ? 0 : this.current + 1);
    }
    prev() {
      this.goTo(this.loop && this.current <= 0 ? this.pageCount - 1 : this.current - 1);
    }
    /** Calcula la diapositiva visible a partir del desplazamiento y actualiza controles y accesibilidad. */
    sync(fire) {
      if (!this.slides.length) return;
      let best = 0;
      let dist = Infinity;
      this.slides.forEach((s, i) => {
        const d = Math.abs(this.offsetOf(s));
        if (d < dist - 0.5) {
          dist = d;
          best = i;
        }
      });
      const idx = Math.min(best, this.pageCount - 1);
      const changed = idx !== this.current;
      this.current = idx;
      this.slides.forEach((s, i) => {
        const visible = i >= idx && i < idx + this.perView;
        s.inert = !visible;
        s.toggleAttribute("data-active", visible);
      });
      const atStart = idx <= 0;
      const atEnd = idx >= this.pageCount - 1;
      this.prevBtn.disabled = !this.loop && atStart;
      this.nextBtn.disabled = !this.loop && atEnd;
      if (this.dotBar) {
        Array.from(this.dotBar.children).forEach((d, i) => {
          d.setAttribute("aria-current", String(i === idx));
        });
      }
      if (changed && fire) emit(this, "tsl-change", { index: idx, count: this.pageCount });
    }
  };
  define("tsl-carousel", TslCarousel);

  // src/index.js
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init());
    } else {
      init();
    }
    window.TeselaUI = { version: VERSION, toast, copy, confirm: confirmDialog, position, setTheme, getTheme, getResolvedTheme, setPreset, getPreset, setAccent, presets, init };
  }
})();
