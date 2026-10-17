// Galería: los 212 experimentos montan con contenido y sin errores de consola.
const { chromium } = require('playwright');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto((process.env.BASE_URL || 'http://localhost:24100') + '/index.html'); await p.waitForLoadState('networkidle');

  const total = await p.evaluate(() => window.TESELA_FLAT_ITEMS.length);
  ok((await p.locator('.exp-card-item').count()) === total && total === 212, `galería: ${total} tarjetas, una por experimento`);
  const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map(i => i.path));
  const empty = [];
  for (const path of paths) {
    await p.evaluate(h => { location.hash = '#' + h; }, path);
    await p.waitForTimeout(25);
    const len = await p.evaluate(() => document.querySelector('#sandbox-stage').innerText.trim().length);
    if (!len) empty.push(path);
  }
  ok(empty.length === 0, `galería: los ${paths.length} experimentos montan con contenido` + (empty.length ? ` (vacíos: ${empty.slice(0, 5).join(', ')})` : ''));
  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
