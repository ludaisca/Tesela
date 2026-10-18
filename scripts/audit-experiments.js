#!/usr/bin/env node
// Auditor de los 212 experimentos de la galería: los monta uno a uno en el sandbox y mide si algo sobresale del ancho
// disponible (sin contar los contenedores con scroll propio). Uso: node scripts/audit-experiments.js [--widths 320,375,768] [--only categoria/slug]
const { chromium } = require("playwright");
const { start } = require("../tests/server");
const { measureStage } = require("./lib/responsive-measure");

async function main() {
  const args = process.argv.slice(2);
  const wi = args.indexOf("--widths");
  // --widths acepta anchos (320) o tamaños completos (667x375, para móviles en horizontal)
  const sizes = (wi > -1 ? args[wi + 1].split(",") : ["320", "375", "768"]).map((x) => { const [w, h] = x.split("x").map(Number); return [w, h || (w < 600 ? 700 : 900)]; });
  const oi = args.indexOf("--only");
  const only = oi > -1 ? args[oi + 1] : null;
  const srv = await start();
  const b = await chromium.launch();
  const summary = {};
  for (const [w, h] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, isMobile: w < 900 });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
    await p.waitForLoadState("networkidle");
    const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map((i) => i.path));
    const bad = [];
    for (const path of paths) {
      if (only && !path.includes(only)) continue;
      await p.evaluate((h) => { location.hash = "#" + h; }, path);
      await p.waitForTimeout(30);
      const m = await p.evaluate(measureStage);
      if (m.over || m.offenders.length || m.squeezed.length || m.small.length) bad.push({ path, ...m });
    }
    console.log(`\n=== ${w}×${h}px: ${bad.length} de ${only ? "los seleccionados" : paths.length} experimentos con desborde`);
    summary[`${w}x${h}`] = bad;
    const cnt = { desborde: bad.filter((x) => x.over || x.offenders.length).length, "texto aplastado": bad.filter((x) => x.squeezed.length).length, "objetivos táctiles <24px": bad.filter((x) => x.small.length).length };
    console.log("  " + Object.entries(cnt).map(([k, v]) => `${k}: ${v}`).join(" | "));
    bad.slice(0, +(process.env.SHOW || 12)).forEach((x) => console.log(`  ${x.path.padEnd(36)} scroll ${x.wrapSW}/${x.wrapCW} fuera:${x.offenders.length} aplast.:${x.squeezed.length} peq.:${x.small.length} ${x.offenders[0] ? x.offenders[0].el + " →" + x.offenders[0].right : x.squeezed[0] ? "«" + x.squeezed[0].text + "» " + x.squeezed[0].w + "px " + x.squeezed[0].el : x.small[0] ? x.small[0].el + " " + x.small[0].w + "×" + x.small[0].h : ""}`));
    // Resumen por tipo de elemento (último tramo del selector): ayuda a corregir causas, no casos
    const agg = {};
    bad.forEach((x) => [...x.small.map((o) => ["peq", o]), ...x.squeezed.map((o) => ["aplast", o]), ...x.offenders.map((o) => ["fuera", o])].forEach(([k, o]) => {
      const key = `${k}  ${o.el.split(">").pop()}`;
      (agg[key] = agg[key] || { n: 0, ex: new Set() }).n++;
      agg[key].ex.add(x.path.split("/").pop());
    }));
    Object.entries(agg).sort((a, b) => b[1].n - a[1].n).slice(0, +(process.env.TOP || 16)).forEach(([k, v]) => console.log(`   ${String(v.n).padStart(4)}× ${k.padEnd(44)} p. ej. ${[...v.ex].slice(0, 3).join(", ")}`));
    await ctx.close();
  }
  require("fs").writeFileSync(process.env.OUT || "/tmp/audit-experiments.json", JSON.stringify(summary, null, 1));
  await b.close();
  srv.close();
}
main();
