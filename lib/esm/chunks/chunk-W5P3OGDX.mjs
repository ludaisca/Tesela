/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  emit,
  storage
} from "./chunk-ZOAS4LFV.mjs";

// src/api/theme.js
var THEME_KEY = "tsl-theme";
function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}
function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  storage.set(THEME_KEY, next);
  emit(document, "tsl-theme", { theme: next });
  return next;
}
var storedTheme = storage.get(THEME_KEY);
if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);

export {
  getTheme,
  setTheme
};
