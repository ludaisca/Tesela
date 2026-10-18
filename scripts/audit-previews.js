#!/usr/bin/env node
// Auditor de las miniaturas de la galería: mide cuánto margen deja el dibujo a cada lado del área útil (320×180, bajo la barra
// de la ventana) y marca las que quedan descentradas. Uso: node scripts/audit-previews.js [--tol 14] [--only categoria/slug]
const { chromium } = require("playwright");
const { start } = require("../tests/server");

function measureThumb(path) {
  const item = window.TESELA_FLAT_ITEMS.find((x) => x.path === path);
  const html = window.TESELA_PREVIEWS.generatePreviewSVG(item.categoryId, item, item.itemIndex);
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:0;top:0;width:320px;height:200px;opacity:0;pointer-events:none";
  host.innerHTML = html;
  document.body.appendChild(host);
  const svg = host.querySelector("svg");
  const o = svg.getBoundingClientRect();
  let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity, n = 0;
  svg.querySelectorAll("rect, circle, ellipse, path, line, polyline, polygon, text").forEach((el) => {
    if (el.closest(".chrome-bar, pattern, defs, clipPath, mask")) return;
    const x = el.getBoundingClientRect();
    if (!x.width && !x.height) return;
    const w = x.width, h = x.height;
    // Fondo y trama de puntos: cubren todo el lienzo
    if (w >= 316 && h >= 196) return;
    // Se ignoran los trazos tenues (rejillas, guías) y lo que queda bajo la barra de la ventana
    if (x.bottom <= o.top + 20) return;
    l = Math.min(l, x.left - o.left); r = Math.max(r, x.right - o.left); t = Math.min(t, x.top - o.top); b = Math.max(b, x.bottom - o.top); n++;
  });
  host.remove();
  if (!n) return { empty: true };
  return { l: Math.round(l), r: Math.round(320 - r), t: Math.round(t - 20), b: Math.round(200 - b), n };
}

async function main() {
  const args = process.argv.slice(2);
  const val = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
  const tol = +val("--tol", 14);
  const only = val("--only", null);
  const srv = await start();
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForLoadState("networkidle");
  const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map((i) => i.path));
  const rows = [];
  for (const path of paths) {
    if (only && !path.includes(only)) continue;
    rows.push({ path, ...(await p.evaluate(measureThumb, path)) });
  }
  require("fs").writeFileSync(process.env.OUT || "/tmp/audit-previews.json", JSON.stringify(rows, null, 1));
  const flag = (r) => {
    if (r.empty) return "vacía";
    const out = [];
    if (Math.abs(r.l - r.r) > tol) out.push(`H ${r.l}|${r.r}`);
    if (Math.abs(r.t - r.b) > tol) out.push(`V ${r.t}|${r.b}`);
    return out.join("  ");
  };
  const bad = rows.map((r) => [r, flag(r)]).filter(([, f]) => f);
  console.log(`=== ${bad.length} de ${rows.length} miniaturas descentradas (tolerancia ${tol} unidades de 320×180)`);
  bad.forEach(([r, f]) => console.log(`${r.path.padEnd(40)} ${f}`));
  await b.close();
  srv.close();
}
module.exports = { measureThumb };
if (require.main === module) main();
