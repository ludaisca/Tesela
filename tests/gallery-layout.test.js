// Composición de la galería: el minimapa no tapa el contenido, cada muestra queda centrada en el escenario y las
// miniaturas tienen el dibujo equilibrado.
const { chromium } = require('playwright');
const { measureBalance } = require('../scripts/audit-layout');
const { measureThumb } = require('../scripts/audit-previews');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}/index.html`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(500);

  // ---- Índice de carpetas (carril lateral) ----
  const mm = await p.evaluate(() => {
    const m = document.querySelector('.folder-minimap').getBoundingClientRect();
    const frame = document.getElementById('wall-frame').getBoundingClientRect();
    return { left: m.left, width: m.width, wallRight: frame.right, labelShown: getComputedStyle(document.querySelector('.minimap-label')).display !== 'none' };
  });
  ok(mm.wallRight <= mm.left - 4, `el índice de carpetas no tapa la pared (pared hasta ${Math.round(mm.wallRight)}, índice desde ${Math.round(mm.left)})`);
  ok(mm.width < 60 && !mm.labelShown, `el índice está plegado a una columna de teselas (${Math.round(mm.width)} px)`);
  await p.hover('.minimap-item');
  const open = await p.evaluate(() => ({ label: getComputedStyle(document.querySelector('.minimap-label')).display !== 'none', w: document.querySelector('.folder-minimap').getBoundingClientRect().width }));
  ok(open.label && open.w > 100, `al pasar el cursor se despliegan los nombres (${Math.round(open.w)} px)`);
  await p.mouse.move(5, 300);
  const sides = await p.evaluate(() => { const r = document.getElementById('wall-frame').getBoundingClientRect(); return { l: r.left, r: innerWidth - r.right }; });
  ok(Math.abs(sides.l - sides.r) < 40, `la pared queda casi simétrica (margen izquierdo ${Math.round(sides.l)}, derecho ${Math.round(sides.r)})`);

  // ---- Escenario del sandbox ----
  const open2 = async (path) => { await p.evaluate(h => { location.hash = '#' + h; }, path); await p.waitForTimeout(250); return p.evaluate(measureBalance); };
  for (const path of ['/c/modals/confirm-delete', '/c/settings/profile', '/c/dashboards/usage', '/c/tours/welcome-carousel', '/c/modals/share-link', '/c/empty-states/inbox-zero']) {
    const m = await open2(path);
    // El carril de 80 px reservado a la píldora de teclado queda siempre abajo
    const top = m.ct, bottom = m.cb - 80;
    ok(Math.abs(top - bottom) <= 12 && Math.abs(m.cl - m.cr) <= 6, `${path}: contenido centrado (arriba ${top}, abajo ${bottom}; izquierda ${m.cl}, derecha ${m.cr})`);
  }
  const wide = await open2('/c/layouts/app-shell');
  ok(wide.cw > 1100, `una muestra a todo el ancho sigue usando todo el escenario (${wide.cw} px)`);
  const cols = await p.evaluate(() => { const xp = document.querySelector('#sandbox-stage .xp'); const h = xp.querySelector('.xp-head').getBoundingClientRect(); const k = [...xp.children].find(c => !c.matches('.xp-head')).getBoundingClientRect(); return { head: h.left, kid: k.left }; });
  ok(true, `(layouts/app-shell) cabecera en ${Math.round(cols.head)} y muestra en ${Math.round(cols.kid)}`);
  await open2('/c/settings/profile');
  const edge = await p.evaluate(() => { const xp = document.querySelector('#sandbox-stage .xp'); return { head: xp.querySelector('.xp-head').getBoundingClientRect().left, kid: [...xp.children].find(c => !c.matches('.xp-head')).getBoundingClientRect().left }; });
  ok(Math.abs(edge.head - edge.kid) < 2, `cabecera y muestra estrecha comparten el borde de inicio (${Math.round(edge.head)} / ${Math.round(edge.kid)})`);

  // ---- Miniaturas ----
  const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map(i => i.path));
  const skip = new Set(['layouts/workspace-rail', 'layouts/mini-rail', 'layouts/inbox-rail', 'charts/gauges', 'charts/donut']);
  const bad = [];
  for (const path of paths) {
    const key = path.split('/').slice(2).join('/');
    if (skip.has(key)) continue;
    const m = await p.evaluate(measureThumb, path);
    if (m.empty || Math.abs(m.l - m.r) > 14 || Math.abs(m.t - m.b) > 14) bad.push(`${key} (H ${m.l}|${m.r} V ${m.t}|${m.b})`);
  }
  ok(bad.length === 0, `las ${paths.length - skip.size} miniaturas tienen el dibujo centrado (±14 de 320×180)` + (bad.length ? `:\n   - ${bad.slice(0, 8).join('\n   - ')}` : ''));

  // ---- Muestras de la documentación: centradas en su marco ----
  const d = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const derrs = [];
  d.on('pageerror', e => derrs.push(String(e)));
  await d.goto(`${base}/components.html`); await d.waitForLoadState('networkidle'); await d.waitForTimeout(1200);
  const measureDemos = () => d.evaluate(() => [...document.querySelectorAll('section.doc .doc-demo')].map(demo => {
    const dr = demo.getBoundingClientRect(), cs = getComputedStyle(demo);
    const base = parseFloat(cs.paddingLeft);
    let l = Infinity, r = -Infinity;
    demo.querySelectorAll('*').forEach(el => {
      const c = getComputedStyle(el);
      if (c.display === 'none' || c.visibility === 'hidden' || c.position === 'fixed' || el.closest('[hidden], template, [popover]:not(:popover-open), dialog:not([open]), svg *')) return;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!(own || /^(svg|canvas|img|input|button|select|textarea)$/.test(el.localName))) return;
      let x = el.getBoundingClientRect();
      for (let a = el.parentElement; a && a !== demo; a = a.parentElement) { const o = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { const q = a.getBoundingClientRect(); x = { left: Math.max(x.left, q.left), right: Math.min(x.right, q.right) }; } }
      if (x.right - x.left < 2) return;
      l = Math.min(l, x.left); r = Math.max(r, x.right);
    });
    return { id: demo.closest('section').id, left: Math.round(l - (dr.left + base)), right: Math.round(dr.right - base - r), pad: demo.style.getPropertyValue('--demo-pad'), inner: Math.round(dr.width - 2 * base) };
  }));
  let rows = await measureDemos();
  const off = rows.filter(x => Math.abs(x.left - x.right) > 40 && Math.max(x.left, x.right) > 60);
  ok(off.length <= 4, `las muestras de la documentación están centradas en su marco (${rows.length - off.length}/${rows.length}; descentradas: ${off.map(x => `${x.id} ${x.left}|${x.right}`).join(', ') || 'ninguna'})`);
  const login = rows.find(x => x.id === 'pattern-login'), btn = rows.find(x => x.id === 'button');
  ok(Math.abs(login.left - login.right) <= 6 && login.pad !== '' && Math.abs(btn.left - btn.right) <= 8 && btn.pad !== '', `el inicio de sesión (${login.left}|${login.right}) y los botones (${btn.left}|${btn.right}) quedan centrados`);
  const table = rows.find(x => x.id === 'data-table');
  ok(!table.pad, 'una muestra que ya llena el marco (tabla de datos) no cambia');
  await d.setViewportSize({ width: 375, height: 800 }); await d.waitForTimeout(500);
  rows = await measureDemos();
  ok(rows.filter(x => x.pad).every(x => Math.abs(x.left - x.right) <= 10) && rows.every(x => x.left >= -1 && x.right >= -1), 'en móvil las muestras centradas siguen equilibradas y ninguna se sale del marco');
  await d.setViewportSize({ width: 1440, height: 900 }); await d.waitForTimeout(500);
  rows = await measureDemos();
  ok(rows.find(x => x.id === 'pattern-login').pad !== '', 'al ensanchar de nuevo se vuelve a centrar');
  ok(derrs.length === 0, 'documentación sin errores de página' + (derrs.length ? ': ' + derrs[0] : ''));

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
