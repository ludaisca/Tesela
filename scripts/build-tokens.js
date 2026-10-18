// Genera, a partir de src/tokens/tokens.json y presets.json:
//   · el CSS de tokens y de presets (partes 00-tokens.css y 24-presets.css del bundle),
//   · lib/themes/<preset>.css,
//   · lib/tokens/: tokens.json, presets.json, tokens.css, tokens.scss, tokens.mjs (+ .d.mts) y tailwind.preset.cjs.
const fs = require("fs");
const path = require("path");
const { load, alias } = require("./lib/tokens");

const GEN = "/* Generado por scripts/build-tokens.js desde src/tokens/. No editar a mano. */";
const key = (t) => t.cssVar.replace(/^--tsl-/, "");

function generate() {
  const T = load();
  const byVar = new Map(T.tokens.map((t) => [t.cssVar, t.path]));
  const depsOf = (value) => {
    const out = new Set();
    const m = alias(value);
    if (m) out.add(m[1]);
    [...String(value).matchAll(/var\((--tsl-[a-z0-9-]+)\)/g)].forEach((x) => byVar.has(x[1]) && out.add(byVar.get(x[1])));
    return out;
  };
  const isDerived = (value) => depsOf(value).size > 0;
  const decl = (p, value) => `  ${T.byPath.get(p).cssVar}: ${T.css(value)};`;
  const block = (selector, lines, indent = "") =>
    `${indent}${selector} {\n${lines.map((l) => (indent ? `${indent}${l}` : l)).join("\n")}\n${indent}}`;

  // ---- Tokens base --------------------------------------------------------------------
  const modeAware = T.tokens.filter((t) => t.light !== undefined);
  const plain = T.tokens.filter((t) => t.light === undefined && !isDerived(t.dark));
  const derived = T.tokens.filter((t) => t.light === undefined && isDerived(t.dark));
  const valueOf = (t, mode) => (mode === "light" && t.light !== undefined ? t.light : t.dark);
  const modeLines = (mode) => [
    ...modeAware.map((t) => decl(t.path, valueOf(t, mode))),
    ...derived.map((t) => decl(t.path, valueOf(t, mode))), // se repiten en cada modo: dependen de bg y accent
    `  color-scheme: ${mode};`
  ];
  const banner = (title) => `${GEN}\n\n/* ----------------------------------------------------------------------------\n   ${title}\n   ---------------------------------------------------------------------------- */`;
  const tokensCss = [
    banner("Tokens"),
    block(':root,\n[data-theme="dark"],\n[data-theme="system"]', modeLines("dark")),
    block('[data-theme="light"]', modeLines("light")),
    block("@media (prefers-color-scheme: light)", [block('[data-theme="system"]', modeLines("light"), "  ")]),
    block(":root", plain.map((t) => decl(t.path, t.dark)))
  ].join("\n\n") + "\n";

  // ---- Presets -------------------------------------------------------------------------
  const presetNames = Object.keys(T.presets);
  const presetCss = (name) => {
    const def = T.presets[name];
    const common = def.common || {};
    const parts = [`/* Preset «${def.label}»: ${def.description} */`];
    // Declaraciones de un bloque + las variables derivadas que dependen de lo que el bloque cambia
    const lines = (overrides, mode) => {
      const changed = new Set(Object.keys(overrides));
      const out = Object.entries(overrides).map(([p, v]) => decl(p, v));
      T.tokens.forEach((t) => {
        if (changed.has(t.path)) return;
        const v = common[t.path] !== undefined ? common[t.path] : valueOf(t, mode);
        if ([...depsOf(v)].some((d) => changed.has(d))) out.push(decl(t.path, v));
      });
      return out;
    };
    const hasMode = (mode) => def[mode] && Object.keys(def[mode]).length;
    if (Object.keys(common).length) parts.push(block(`[data-preset="${name}"]`, lines(common, "dark")));
    if (hasMode("dark")) parts.push(block(`[data-preset="${name}"]:not([data-theme="light"])`, lines(def.dark, "dark")));
    if (hasMode("light") || hasMode("dark")) {
      if (hasMode("light")) parts.push(block(`[data-preset="${name}"][data-theme="light"]`, lines(def.light, "light")));
      // El bloque oscuro (:not([data-theme="light"])) también alcanza a «system»: lo que el preset cambia solo en
      // oscuro debe volver a su valor claro cuando el sistema operativo está en claro.
      const sysLight = { ...def.light };
      Object.keys(def.dark || {}).forEach((pth) => {
        if (sysLight[pth] === undefined) sysLight[pth] = common[pth] !== undefined ? common[pth] : valueOf(T.byPath.get(pth), "light");
      });
      parts.push(block("@media (prefers-color-scheme: light)", [block(`[data-preset="${name}"][data-theme="system"]`, lines(sysLight, "light"), "  ")]));
    }
    return parts.join("\n") + "\n";
  };
  const presetFiles = {};
  presetNames.filter((n) => Object.keys(T.presets[n]).some((k) => ["common", "dark", "light"].includes(k))).forEach((n) => (presetFiles[n] = presetCss(n)));
  const presetsCss = [banner('Presets de tema: <html data-preset="esmeralda"> (o cualquier contenedor)'), ...Object.values(presetFiles)].join("\n\n") + "\n";

  // ---- Exportaciones ---------------------------------------------------------------------
  const resolved = (mode, ov) => T.resolve(mode, ov);
  const flat = (mode, ov) => Object.fromEntries(T.tokens.map((t) => [key(t), resolved(mode, ov)[t.path]]));
  const dark = flat("dark");
  const light = flat("light");
  const presets = Object.fromEntries(presetNames.map((n) => {
    const d = T.presets[n];
    const common = d.common || {};
    const toKeys = (o) => Object.fromEntries(Object.entries(o).map(([p, v]) => [key(T.byPath.get(p)), v]));
    return [n, { label: d.label, description: d.description, common: toKeys(common), dark: toKeys(d.dark || {}), light: toKeys(d.light || {}) }];
  }));
  const names = Object.fromEntries(T.tokens.map((t) => [key(t), t.cssVar]));
  const vars = Object.fromEntries(T.tokens.map((t) => [key(t), `var(${t.cssVar})`]));

  const sassVal = (v) => (/,(?![^()]*\))/.test(v) ? JSON.stringify(v) : v);
  const sassMap = (o, ind) => `(\n${Object.entries(o).map(([k, v]) => `${ind}  "${k}": ${sassVal(v)}`).join(",\n")}\n${ind})`;
  const scss = [
    "// Tesela UI — tokens (generado por scripts/build-tokens.js; no editar a mano).",
    "// Variables que apuntan a las propiedades CSS (se adaptan al modo y al preset activos):",
    ...T.tokens.map((t) => `$tsl-${key(t)}: var(${t.cssVar}); // ${t.description}`),
    "",
    "// Valores en bruto, por modo, por si hacen falta en cálculos de Sass:",
    `$tsl-tokens-dark: ${sassMap(dark, "")};`,
    `$tsl-tokens-light: ${sassMap(light, "")};`,
    "",
    "// Presets de tema (solo lo que cambian respecto a los tokens base):",
    `$tsl-presets: (\n${Object.entries(presets).map(([n, p]) => `  "${n}": (\n    "label": ${JSON.stringify(p.label)},\n    "common": ${sassMap(p.common, "    ")},\n    "dark": ${sassMap(p.dark, "    ")},\n    "light": ${sassMap(p.light, "    ")}\n  )`).join(",\n")}\n);`,
    ""
  ].join("\n");

  const mjs = `// Tesela UI — tokens (generado por scripts/build-tokens.js; no editar a mano).\n` +
    `export const tokens = ${JSON.stringify({ dark, light, names, vars }, null, 2)};\n\n` +
    `export const presets = ${JSON.stringify(presets, null, 2)};\n\nexport default tokens;\n`;
  const union = Object.keys(names).map((k) => JSON.stringify(k)).join(" | ");
  const dmts = `// Tesela UI — tipos de los tokens (generado). No editar a mano.\n` +
    `export type TokenName = ${union};\n` +
    `export interface TokenSet { dark: Record<TokenName, string>; light: Record<TokenName, string>; names: Record<TokenName, string>; vars: Record<TokenName, string>; }\n` +
    `export interface Preset { label: string; description: string; common: Partial<Record<TokenName, string>>; dark: Partial<Record<TokenName, string>>; light: Partial<Record<TokenName, string>>; }\n` +
    `export declare const tokens: TokenSet;\nexport declare const presets: Record<${presetNames.map((n) => JSON.stringify(n)).join(" | ")}, Preset>;\nexport default tokens;\n`;

  const tw = (group, fn) => Object.fromEntries(T.tokens.filter((t) => t.group === group).map((t) => [fn(t), `var(${t.cssVar})`]));
  const tailwind = `// Tesela UI — preset de Tailwind (generado por scripts/build-tokens.js; no editar a mano).\n` +
    `// Uso: presets: [require("tesela-ui/tokens/tailwind.preset.cjs")]  →  bg-tsl-bg, text-tsl-fg, rounded-tsl, shadow-tsl-lg…\n` +
    `// Los colores usan variables CSS, así que cambian solos con el modo (data-theme) y el preset (data-preset).\n` +
    `module.exports = ${JSON.stringify({
      theme: { extend: {
        colors: { tsl: tw("color", (t) => t.name) },
        borderRadius: { tsl: "var(--tsl-radius)", "tsl-sm": "var(--tsl-radius-sm)", "tsl-xs": "var(--tsl-radius-xs)" },
        boxShadow: { tsl: "var(--tsl-shadow)", "tsl-lg": "var(--tsl-shadow-lg)", "tsl-ring": "var(--tsl-ring)" },
        fontFamily: { "tsl-mono": ["var(--tsl-font-mono)"], "tsl-sans": ["var(--tsl-font-sans)"], "tsl-heading": ["var(--tsl-font-heading)"] },
        transitionTimingFunction: { tsl: "var(--tsl-ease)" }
      } }
    }, null, 2)};\n`;

  return { T, tokensCss, presetsCss, presetFiles, scss, mjs, dmts, tailwind, count: T.tokens.length, presetCount: presetNames.length };
}

function writeFiles(out) {
  const g = generate();
  const w = (rel, content) => {
    const f = path.join(out, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, content);
  };
  const src = (f) => fs.readFileSync(path.join(__dirname, "../src/tokens", f), "utf8");
  fs.rmSync(path.join(out, "tokens"), { recursive: true, force: true });
  fs.rmSync(path.join(out, "themes"), { recursive: true, force: true });
  w("tokens/tokens.json", src("tokens.json"));
  w("tokens/presets.json", src("presets.json"));
  w("tokens/tokens.css", g.tokensCss);
  w("tokens/tokens.scss", g.scss);
  w("tokens/tokens.mjs", g.mjs);
  w("tokens/tokens.d.mts", g.dmts);
  w("tokens/tailwind.preset.cjs", g.tailwind);
  Object.entries(g.presetFiles).forEach(([n, css]) => w(`themes/${n}.css`, `${GEN}\n${css}`));
  return g;
}

module.exports = { generate, writeFiles };
