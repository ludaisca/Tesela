#!/usr/bin/env node
// Compila src/ → lib/ (lo que se publica y se copia a otros proyectos).
//   node scripts/build.js              → escribe en lib/
//   node scripts/build.js --out dir    → escribe en otro directorio (lo usa tests/build.test.js)
// Genera:
//   tesela-ui.js / .min.js   bundle completo (IIFE) para <script src>; expone window.TeselaUI
//   tesela-ui.css / .min.css CSS completo
//   esm/index.mjs            bundle ESM y un módulo por componente (esm/components/*.mjs, esm/api/*.mjs)
//   css/*.css                una hoja por sección, para cargar solo lo necesario
//   theme-init.js            tema, preset y acento guardados antes del primer pintado (sin parpadeo)
//   tokens/, themes/         tokens exportados (JSON, CSS, SCSS, JS, Tailwind) y un CSS por preset
//   types/, custom-elements.json, vscode.html-custom-data.json   ver scripts/build-meta.js
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { buildMeta } = require("./build-meta");
const { writeFiles: writeTokens } = require("./build-tokens");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const outFlag = process.argv.indexOf("--out");
const out = path.resolve(outFlag > -1 ? process.argv[outFlag + 1] : path.join(root, "lib"));
const banner = `/*! Tesela UI v${pkg.version} — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */`;

const rel = (...p) => path.join(root, ...p);
const list = (dir, ext) => fs.readdirSync(rel(dir)).filter((f) => f.endsWith(ext)).sort();

async function main() {
  fs.rmSync(path.join(out, "esm"), { recursive: true, force: true });
  fs.rmSync(path.join(out, "css"), { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const common = { bundle: true, target: "es2022", charset: "utf8", legalComments: "none", logLevel: "warning" };

  // Bundle completo para <script src>
  await esbuild.build({ ...common, entryPoints: [rel("src/index.js")], format: "iife", outfile: path.join(out, "tesela-ui.js"), banner: { js: banner } });
  await esbuild.build({ ...common, entryPoints: [rel("src/index.js")], format: "iife", minify: true, sourcemap: true, outfile: path.join(out, "tesela-ui.min.js"), banner: { js: banner } });

  // ESM: un módulo por componente + núcleo compartido en chunks
  const entries = [rel("src/index.js"), ...list("src/components", ".js").map((f) => rel("src/components", f)), ...list("src/api", ".js").map((f) => rel("src/api", f))];
  await esbuild.build({ ...common, entryPoints: entries, outbase: rel("src"), format: "esm", splitting: true, outdir: path.join(out, "esm"), outExtension: { ".js": ".mjs" }, chunkNames: "chunks/[name]-[hash]", banner: { js: banner } });

  // Tokens y presets (generados desde src/tokens/) → partes de CSS, lib/tokens/ y lib/themes/
  const tk = writeTokens(out);

  // CSS: completo, minificado y por secciones (archivos de src/css + partes generadas, por orden de nombre)
  const cssParts = new Map(list("src/css", ".css").map((f) => [f, fs.readFileSync(rel("src/css", f), "utf8").trim()]));
  cssParts.set("00-tokens.css", tk.tokensCss.trim());
  cssParts.set("24-presets.css", tk.presetsCss.trim());
  const parts = [...cssParts.keys()].sort();
  const css = `${banner}\n${parts.map((f) => cssParts.get(f)).join("\n\n")}\n`;
  fs.writeFileSync(path.join(out, "tesela-ui.css"), css);
  fs.writeFileSync(path.join(out, "tesela-ui.min.css"), `${banner}\n${(await esbuild.transform(css, { loader: "css", minify: true })).code}`);
  fs.mkdirSync(path.join(out, "css"), { recursive: true });
  parts.forEach((f) => fs.writeFileSync(path.join(out, "css", f), `${cssParts.get(f)}\n`));

  // Script anti-parpadeo (clásico, no módulo)
  const initSrc = fs.readFileSync(rel("src/theme-init.js"), "utf8");
  fs.writeFileSync(path.join(out, "theme-init.js"), `${banner}\n${(await esbuild.transform(initSrc, { minify: true, legalComments: "none", target: "es2015" })).code}`);

  // Licencia de los iconos del set base (Lucide, ISC): debe acompañar a la copia
  fs.copyFileSync(rel("src/icons/LICENSE-lucide.txt"), path.join(out, "LICENSE-lucide.txt"));

  const n = await buildMeta(root, out, pkg.version);

  const kb = (f) => `${(fs.statSync(path.join(out, f)).size / 1024).toFixed(1)} KB`;
  console.log(`Tesela UI ${pkg.version} → ${path.relative(root, out) || "."}`);
  ["tesela-ui.js", "tesela-ui.min.js", "tesela-ui.css", "tesela-ui.min.css"].forEach((f) => console.log(`  ${f.padEnd(20)} ${kb(f)}`));
  console.log(`  esm/                 ${entries.length} entradas`);
  console.log(`  tokens               ${tk.count} tokens, ${tk.presetCount} presets (tokens/, themes/)`);
  console.log(`  tipos y manifiesto   ${n} elementos (types/, custom-elements.json, vscode.html-custom-data.json)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
