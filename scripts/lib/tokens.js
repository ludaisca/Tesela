// Lectura y resolución de tokens (src/tokens/*.json). Lo comparten la compilación y las pruebas.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../../src/tokens");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

// Lista plana de tokens: { path, group, name, cssVar, type, dark, light, description }
function flatten(doc) {
  const out = [];
  Object.entries(doc).forEach(([group, g]) => {
    if (group.startsWith("$")) return;
    Object.entries(g).forEach(([name, t]) => {
      if (name.startsWith("$")) return;
      const light = t.$extensions && t.$extensions["tesela.mode"] ? t.$extensions["tesela.mode"].light : undefined;
      out.push({
        path: `${group}.${name}`, group, name, type: g.$type, description: t.$description || "",
        cssVar: `--tsl-${[group === "color" ? null : group, name === "default" ? null : name].filter(Boolean).join("-")}`,
        dark: t.$value, light
      });
    });
  });
  return out;
}

const alias = (v) => /^\{([a-z-]+\.[a-z0-9-]+)\}$/.exec(String(v));

function load() {
  const doc = read("tokens.json");
  const tokens = flatten(doc);
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const varOf = (p) => byPath.get(p).cssVar;
  const css = (v) => {
    const m = alias(v);
    return m ? `var(${varOf(m[1])})` : v;
  };
  // Valores resueltos (sin alias) para un modo, con los cambios de un preset
  const resolve = (mode, overrides = {}) => {
    const val = {};
    tokens.forEach((t) => (val[t.path] = overrides[t.path] !== undefined ? overrides[t.path] : mode === "light" && t.light !== undefined ? t.light : t.dark));
    const deref = (p, seen = []) => {
      const m = alias(val[p]);
      return m && !seen.includes(m[1]) ? deref(m[1], [...seen, p]) : val[p];
    };
    return Object.fromEntries(tokens.map((t) => [t.path, deref(t.path)]));
  };
  const presets = read("presets.json").presets;
  return { doc, tokens, byPath, css, resolve, presets };
}

module.exports = { load, flatten, alias };
