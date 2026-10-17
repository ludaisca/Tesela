#!/usr/bin/env node
// Compila src/ → lib/ (lo que se publica y se copia a otros proyectos).
//   node scripts/build.js              → escribe en lib/
//   node scripts/build.js --out dir    → escribe en otro directorio (lo usa tests/build.test.js)
// Genera:
//   tesela-ui.js / .min.js   bundle completo (IIFE) para <script src>; expone window.TeselaUI
//   tesela-ui.css / .min.css CSS completo
//   esm/index.mjs            bundle ESM y un módulo por componente (esm/components/*.mjs, esm/api/*.mjs)
//   css/*.css                una hoja por sección, para cargar solo lo necesario
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const outFlag = process.argv.indexOf("--out");
const out = path.resolve(outFlag > -1 ? process.argv[outFlag + 1] : path.join(root, "lib"));
const banner = `/*! Tesela UI v${pkg.version} — biblioteca de componentes sin dependencias */`;

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

  // CSS: completo, minificado y por secciones
  const parts = list("src/css", ".css");
  const css = `${banner}\n${parts.map((f) => fs.readFileSync(rel("src/css", f), "utf8").trim()).join("\n\n")}\n`;
  fs.writeFileSync(path.join(out, "tesela-ui.css"), css);
  fs.writeFileSync(path.join(out, "tesela-ui.min.css"), `${banner}\n${(await esbuild.transform(css, { loader: "css", minify: true })).code}`);
  fs.mkdirSync(path.join(out, "css"), { recursive: true });
  parts.forEach((f) => fs.copyFileSync(rel("src/css", f), path.join(out, "css", f)));

  const kb = (f) => `${(fs.statSync(path.join(out, f)).size / 1024).toFixed(1)} KB`;
  console.log(`Tesela UI ${pkg.version} → ${path.relative(root, out) || "."}`);
  ["tesela-ui.js", "tesela-ui.min.js", "tesela-ui.css", "tesela-ui.min.css"].forEach((f) => console.log(`  ${f.padEnd(20)} ${kb(f)}`));
  console.log(`  esm/                 ${entries.length} entradas`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
