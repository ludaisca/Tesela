import { emit, storage } from "../core/base.js";

const THEME_KEY = "tsl-theme";

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

export function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  storage.set(THEME_KEY, next);
  emit(document, "tsl-theme", { theme: next });
  return next;
}

const storedTheme = storage.get(THEME_KEY);
if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
