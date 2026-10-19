#!/usr/bin/env node
// Auditor de equilibrio visual de los experimentos: mide, dentro del escenario del sandbox, cuánto ocupa el contenido
// y si queda descentrado. Uso: node scripts/audit-layout.js [--size 1440x900] [--only categoria/slug] [--shots carpeta]
const { chromium } = require("playwright");
const { start } = require("../tests/server");

function measureBalance() {
  const stage = document.getElementById("sandbox-stage");
  const sr = stage.getBoundingClientRect();
  let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity, n = 0;
  stage.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed" || el.closest("[hidden], template, [popover]:not(:popover-open), dialog:not([open]), defs, clipPath, mask, pattern, linearGradient, radialGradient, filter")) return;
    const own = Array.from(el.childNodes).some((x) => x.nodeType === 3 && x.textContent.trim());
    const paints = own || /^(svg|canvas|img|video|input|button|select|textarea)$/.test(el.localName) || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.opacity) > 0.05) || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
    if (!paints) return;
    if (el.closest("svg") && el.localName !== "svg") return;
    let x = el.getBoundingClientRect();
    // Lo que queda recortado por un ancestro con overflow (diapositivas fuera de vista, listas con scroll) solo cuenta por su parte visible
    for (let a = el.parentElement; a && a !== stage; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (/(hidden|clip|auto|scroll)/.test(o.overflowX + o.overflowY)) {
        const c = a.getBoundingClientRect();
        x = { left: Math.max(x.left, c.left), right: Math.min(x.right, c.right), top: Math.max(x.top, c.top), bottom: Math.min(x.bottom, c.bottom) };
        x.width = x.right - x.left; x.height = x.bottom - x.top;
      }
    }
    if (x.width < 2 || x.height < 2 || x.right < sr.left || x.left > sr.right) return;
    l = Math.min(l, x.left); r = Math.max(r, x.right); t = Math.min(t, x.top); b = Math.max(b, x.bottom); n++;
  });
  if (!n) return { empty: true, sw: sr.width, sh: sr.height };
  const cl = Math.max(0, l - sr.left), cr = Math.max(0, sr.right - r), ct = Math.max(0, t - sr.top), cb = Math.max(0, sr.bottom - b);
  return { sw: Math.round(sr.width), sh: Math.round(sr.height), cl: Math.round(cl), cr: Math.round(cr), ct: Math.round(ct), cb: Math.round(cb), cw: Math.round(r - l), ch: Math.round(b - t), sx: stage.scrollWidth - stage.clientWidth, sy: stage.scrollHeight - stage.clientHeight };
}

async function main() {
  const args = process.argv.slice(2);
  const val = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
  const [w, h] = val("--size", "1440x900").split("x").map(Number);
  const only = val("--only", null);
  const shots = val("--shots", null);
  const srv = await start();
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForLoadState("networkidle");
  const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map((i) => i.path));
  const rows = [];
  for (const path of paths) {
    if (only && !path.includes(only)) continue;
    await p.evaluate((x) => { location.hash = "#" + x; }, path);
    await p.waitForTimeout(120);
    const m = await p.evaluate(measureBalance);
    rows.push({ path, ...m });
    if (shots) await p.screenshot({ path: `${shots}/${path.replace(/\//g, "__")}.png` });
  }
  require("fs").writeFileSync(process.env.OUT || "/tmp/audit-layout.json", JSON.stringify(rows, null, 1));
  const flag = (r) => {
    if (r.empty) return "vacío";
    const out = [];
    const slackX = r.cl + r.cr, slackY = r.ct + r.cb;
    if (slackX > 40 && Math.abs(r.cl - r.cr) > Math.max(24, slackX * 0.25)) out.push(`descentrado H (${r.cl}|${r.cr})`);
    if (r.cw < r.sw * 0.55 && slackX > 200) out.push(`ancho aprovechado ${Math.round((r.cw / r.sw) * 100)} %`);
    if (r.ch < r.sh * 0.45 && slackY > 200) out.push(`alto aprovechado ${Math.round((r.ch / r.sh) * 100)} % (arriba ${r.ct}, abajo ${r.cb})`);
    if (r.sx > 1) out.push(`scroll H ${r.sx}`);
    return out.join(" · ");
  };
  const bad = rows.map((r) => [r, flag(r)]).filter(([, f]) => f);
  console.log(`=== ${w}×${h}: ${bad.length} de ${rows.length} con algo que revisar`);
  bad.forEach(([r, f]) => console.log(`${r.path.padEnd(38)} ${r.sw}×${r.sh}  ${f}`));
  await b.close();
  srv.close();
}
module.exports = { measureBalance };
if (require.main === module) main();
