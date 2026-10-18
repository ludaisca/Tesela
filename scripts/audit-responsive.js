#!/usr/bin/env node
// Auditor de diseño adaptable: mide, en muchos tamaños de pantalla, si una página se desborda en horizontal
// y qué elementos lo provocan. Uso:  node scripts/audit-responsive.js [pagina.html] [--viewports 320,375,768]
const { chromium } = require("playwright");
const { start } = require("../tests/server");
const { measurePage } = require("./lib/responsive-measure");

const SIZES = [
  [320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [480, 800], [600, 900], [768, 1024],
  [820, 1180], [1024, 768], [1280, 800], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [667, 375], [812, 375]
];

async function main() {
  const args = process.argv.slice(2);
  const page = args.find((a) => a.endsWith(".html")) || "components.html";
  const vi = args.indexOf("--viewports");
  const sizes = vi > -1 ? args[vi + 1].split(",").map((w) => SIZES.find(([x]) => x === +w) || [+w, 800]) : SIZES;
  const srv = await start();
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, isMobile: w < 900 });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${srv.address().port}/${page}`);
    await p.waitForLoadState("networkidle");
    await p.waitForTimeout(400);
    const m = await p.evaluate(measurePage);
    const over = m.scrollW > m.vw + 1;
    if (over || m.offenders.length) bad++;
    console.log(`${String(w).padStart(4)}×${String(h).padEnd(4)} ancho de página ${m.scrollW}/${m.vw} ${over ? "← DESBORDA" : "ok"}  elementos fuera: ${m.offenders.length}`);
    const seen = new Set();
    m.offenders.filter((o) => !seen.has(o.el) && seen.add(o.el)).slice(0, 6).forEach((o) => console.log(`        ${o.el}  [${o.left}…${o.right}] ${o.w}px`));
    await ctx.close();
  }
  await b.close();
  srv.close();
  console.log(bad ? `\n${bad} tamaños con problemas` : "\nSin desbordes");
}
main();
