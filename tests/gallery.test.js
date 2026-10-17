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
  // Regresión: «Compartir enlace» vaciaba <tsl-tags> con tags.remove(v), que desde el renombrado
  // del método es Element.remove() y habría borrado el campo del DOM.
  await p.evaluate(() => { location.hash = '#/c/modals/share-link'; });
  await p.waitForTimeout(150);
  await p.getByRole('button', { name: 'Compartir…' }).click();
  await p.locator('tsl-tags input').fill('nueva@acme.com'); await p.keyboard.press('Enter');
  ok((await p.locator('tsl-tags .tsl-chip').count()) === 1, 'compartir enlace: el correo se añade como etiqueta');
  await p.locator('[data-invite]').click();
  ok(await p.locator('tsl-tags').evaluate(e => e.isConnected) && (await p.locator('tsl-tags .tsl-chip').count()) === 0, 'compartir enlace: tras invitar, <tsl-tags> sigue en el DOM y queda vacío');
  ok((await p.locator('[data-people] li', { hasText: 'nueva@acme.com' }).count()) === 1, 'compartir enlace: la persona invitada aparece en la lista');
  await p.keyboard.press('Escape');

  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
