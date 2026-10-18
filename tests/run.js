#!/usr/bin/env node
// Ejecuta todas las pruebas de navegador (Playwright + Chromium).
//   node tests/run.js                 → levanta un servidor propio y corre todo
//   node tests/run.js fields          → solo los archivos cuyo nombre contenga "fields"
//   BASE_URL=http://host:24100 node tests/run.js   → usa un servidor ya levantado
// Requiere Playwright: `npm i -D playwright && npx playwright install chromium`, o una instalación global.
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { start } = require("./server");

(async () => {
  const filter = process.argv[2] || "";
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js") && f.includes(filter)).sort();
  if (!files.length) {
    console.error(`Sin pruebas que coincidan con "${filter}"`);
    process.exit(2);
  }

  let server = null;
  let base = process.env.BASE_URL;
  if (!base) {
    server = await start();
    base = `http://127.0.0.1:${server.address().port}`;
  }

  // Si Playwright no está instalado en el proyecto, se busca la instalación global
  const env = { ...process.env, BASE_URL: base };
  try {
    require.resolve("playwright");
  } catch (_) {
    try {
      env.NODE_PATH = [env.NODE_PATH, execSync("npm root -g", { encoding: "utf8" }).trim()].filter(Boolean).join(path.delimiter);
    } catch (_) {}
  }

  let failed = 0;
  let passed = 0;
  for (const file of files) {
    console.log(`\n=== ${file} ===`);
    // Asíncrono: el servidor propio vive en este mismo proceso y debe seguir atendiendo
    const r = await new Promise((resolve) => {
      const child = spawn(process.execPath, [path.join(__dirname, file)], { env });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));
      child.on("close", (status) => resolve({ status, stdout, stderr }));
    });
    const out = r.stdout + r.stderr;
    const lines = out.split("\n");
    lines.filter((l) => /^(FAIL|PASS) /.test(l)).forEach((l) => /^FAIL/.test(l) && console.log(l));
    const p = lines.filter((l) => l.startsWith("PASS ")).length;
    const f = lines.filter((l) => l.startsWith("FAIL ")).length;
    passed += p;
    failed += f;
    console.log(`${p} correctas, ${f} fallidas${r.status !== 0 && f === 0 ? `  (error de ejecución: ${(r.stderr || "").split("\n").find((l) => /Error/.test(l)) || (r.stderr || "").trim().split("\n")[0]})` : ""}`);
    if (r.status !== 0 && f === 0) failed += 1;
  }

  if (server) server.close();
  console.log(`\n${failed ? "✗" : "✓"} ${passed} correctas, ${failed} fallidas`);
  process.exit(failed ? 1 : 0);
})();
