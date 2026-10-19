#!/usr/bin/env node
// Genera src/icons/base.js: el set base de iconos de Tesela, tomado de Lucide (ISC).
//   npm run icons
// Solo se incluyen los nombres de BASE (los que usan los componentes y la documentación, más el
// vocabulario habitual de una interfaz). Para cualquier otro icono de Lucide u otra biblioteca se
// registra una biblioteca externa (ver src/core/icons.js). El archivo generado se versiona.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "node_modules/lucide-static/icons");
const { version } = require("lucide-static/package.json");

const BASE = [
  // Acciones y estados
  "x", "check", "plus", "minus", "search", "copy", "clipboard-check", "trash-2", "pencil", "square-pen", "download", "upload",
  "cloud-upload", "refresh-cw", "rotate-ccw", "undo-2", "redo-2", "external-link", "link", "filter", "sliders-horizontal",
  "ellipsis", "ellipsis-vertical", "grip-vertical", "maximize-2", "minimize-2", "log-in", "log-out", "send",
  // Flechas y chevrones
  "chevron-down", "chevron-up", "chevron-left", "chevron-right", "chevrons-up-down", "arrow-up", "arrow-down", "arrow-left",
  "arrow-right", "arrow-up-down",
  // Avisos
  "info", "circle-alert", "triangle-alert", "circle-check", "circle-x", "circle-help", "loader-circle", "circle", "circle-dot",
  "circle-dashed", "square",
  // Navegación y estructura
  "menu", "panel-left", "house", "settings", "layout-dashboard", "layout-grid", "list", "list-ordered", "table", "folder",
  "package", "box", "layers", "inbox", "bell", "bookmark", "pin", "flag", "tag", "hash", "at-sign", "globe", "map-pin",
  // Personas y seguridad
  "user", "users", "lock", "key-round", "fingerprint", "shield", "shield-check", "eye", "eye-off", "handshake", "building-2",
  // Comunicación y medios
  "mail", "message-square", "phone", "mic", "camera", "image", "video", "music", "play", "pause", "file", "file-text", "paperclip",
  // Datos y comercio
  "calendar", "clock", "chart-column", "chart-line", "chart-pie", "trending-up", "trending-down", "activity", "credit-card",
  "wallet", "receipt", "shopping-cart",
  // Desarrollo
  "command", "terminal", "code", "git-branch", "git-pull-request", "database", "server", "cpu", "keyboard",
  // Texto enriquecido
  "bold", "italic", "underline", "strikethrough", "heading", "quote", "type",
  // Valoración y tema
  "star", "heart", "thumbs-up", "thumbs-down", "sparkles", "zap", "rocket", "smile", "snowflake", "sun", "moon", "sun-moon",
  "contrast", "palette", "brain", "lightbulb", "file-image", "file-audio", "file-video", "file-spreadsheet", "file-archive", "file-code",
  // Reacciones, estados y aplicaciones
  "party-popper", "laugh", "frown", "meh", "smile-plus", "hand", "share-2", "folder-open", "files", "archive", "smartphone",
  "laptop", "headphones", "volume-2", "volume-x", "message-circle", "sticky-note", "notebook-pen", "flask-conical", "leaf",
  "tree-palm", "pizza", "thermometer", "coffee", "wifi-off", "satellite-dish", "square-dashed", "gift", "award", "history",
  "user-plus", "calendar-days", "scissors", "copy-plus", "skip-back", "skip-forward"
];

const inner = (svg) =>
  svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/\s*\n\s*/g, "")
    .replace(/\s*\/>/g, "/>")
    .trim();

const out = {};
for (const name of [...new Set(BASE)].sort()) {
  const file = path.join(dir, `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Lucide no tiene el icono «${name}»`);
  out[name] = inner(fs.readFileSync(file, "utf8"));
}

const body = Object.entries(out)
  .map(([k, v]) => `  ${/^[a-z]+$/.test(k) ? k : JSON.stringify(k)}: ${JSON.stringify(v)}`)
  .join(",\n");
const src = `// Generado por scripts/build-icons.js a partir de lucide-static ${version}. No editar a mano.
// Iconos de Lucide (https://lucide.dev), licencia ISC: Copyright (c) Lucide Icons and Contributors.
// Cuadrícula de 24 × 24, trazo de 2, sin relleno y color currentColor.
export const LUCIDE_VERSION = "${version}";
export const baseIcons = {
${body}
};
`;
fs.mkdirSync(path.join(root, "src/icons"), { recursive: true });
fs.writeFileSync(path.join(root, "src/icons/base.js"), src);
fs.copyFileSync(path.join(root, "node_modules/lucide-static/LICENSE"), path.join(root, "src/icons/LICENSE-lucide.txt"));
console.log(`src/icons/base.js: ${Object.keys(out).length} iconos de Lucide ${version} (${(src.length / 1024).toFixed(1)} KB)`);
