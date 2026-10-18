import { contrast, parseHex, toHex } from "../core/color.js";
import { emit, storage } from "../core/base.js";
import presetData from "../tokens/presets.json";

const THEME_KEY = "tsl-theme";
const PRESET_KEY = "tsl-preset";
const ACCENT_KEY = "tsl-accent";
const ACCENT_FG_KEY = "tsl-accent-fg";
const THEMES = ["dark", "light", "system"];
const root = () => document.documentElement;
const lightQuery = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null);

/** Presets disponibles: [{ name, label, description }]. El primero, «tesela», es el tema por defecto. */
export const presets = Object.entries(presetData.presets).map(([name, p]) => ({ name, label: p.label, description: p.description }));

/** Ajuste de tema: "dark" | "light" | "system" (este último sigue al sistema operativo). */
export function getTheme() {
  const t = root().getAttribute("data-theme");
  return THEMES.includes(t) ? t : "dark";
}

/** Tema efectivo ("dark" | "light"): resuelve "system" según el sistema operativo. */
export function getResolvedTheme() {
  const t = getTheme();
  if (t !== "system") return t;
  const q = lightQuery();
  return q && q.matches ? "light" : "dark";
}

export function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "dark";
  root().setAttribute("data-theme", next);
  storage.set(THEME_KEY, next);
  emit(document, "tsl-theme", { theme: next, resolved: getResolvedTheme() });
  return next;
}

export function getPreset() {
  const p = root().getAttribute("data-preset");
  return presets.some((x) => x.name === p) ? p : presets[0].name;
}

/** Aplica un preset (se ignora un nombre desconocido). Devuelve el preset activo. */
export function setPreset(name) {
  if (!presets.some((p) => p.name === name)) return getPreset();
  if (name === presets[0].name) root().removeAttribute("data-preset");
  else root().setAttribute("data-preset", name);
  storage.set(PRESET_KEY, name);
  emit(document, "tsl-preset", { preset: name });
  return name;
}

/**
 * Cambia el acento (#rgb o #rrggbb) y elige solo el color del texto que lo acompaña (blanco o casi negro,
 * el de mayor contraste). `setAccent(null)` quita el cambio y vuelve al acento del preset activo.
 * Devuelve el color de texto elegido (o null al restablecer).
 */
export function setAccent(color) {
  const style = root().style;
  if (color === null || color === undefined) {
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

// Restaura lo guardado en la sesión anterior
const storedTheme = storage.get(THEME_KEY);
if (THEMES.includes(storedTheme)) root().setAttribute("data-theme", storedTheme);
const storedPreset = storage.get(PRESET_KEY);
if (presets.some((p) => p.name === storedPreset) && storedPreset !== presets[0].name) root().setAttribute("data-preset", storedPreset);
const storedAccent = storage.get(ACCENT_KEY);
if (storedAccent) setAccent(storedAccent);

// Con tema «system», avisa cuando el sistema operativo cambia de claro a oscuro
const query = lightQuery();
if (query && query.addEventListener) {
  query.addEventListener("change", () => {
    if (getTheme() === "system") emit(document, "tsl-theme", { theme: "system", resolved: getResolvedTheme() });
  });
}
