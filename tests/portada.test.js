// Portada de la galería: titular, pared de 212 teselas, filtros, favoritos, navegación con flechas y dirección numérica.
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  // Los favoritos de ejemplo se siembran aquí: la portada ya no trae ninguno por defecto
  await ctx.addInitScript(() => { if (!localStorage.getItem('tesela-favorites')) localStorage.setItem('tesela-favorites', JSON.stringify(['/c/layouts/workspace-rail', '/c/charts/revenue-area', '/c/modals/command-palette', '/c/pricing/three-tier'])); });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`${base}/index.html`); await p.waitForLoadState('networkidle'); await settle(p); await p.waitForTimeout(300);
  const tiles = p.locator('#wall .tile');

  // ---- Contenido ----
  ok(await p.evaluate(() => document.querySelectorAll('main').length === 1 && document.querySelector('main h1') && document.querySelector('main #wall') && document.querySelector('main #gallery-root') !== null), 'un único <main> contiene el titular, la pared y la galería');
  ok(await p.locator('h1').count() === 1 && (await p.locator('h1').textContent()).includes('doscientos doce'), 'un único h1 con el titular');
  ok(await p.evaluate(() => /Marcellus/.test(getComputedStyle(document.querySelector('h1')).fontFamily) && document.fonts.check('16px Marcellus')), 'el titular usa la capital de inscripción (Marcellus) servida desde el proyecto');
  ok(await p.evaluate(() => document.fonts.check('14px "Libre Franklin"') && document.fonts.check('12px "Spline Sans Mono"')), 'Libre Franklin y Spline Sans Mono cargadas desde el proyecto');
  ok(await p.evaluate(() => !document.querySelector('#ambient-canvas, .hero-promo-card, .hero-cards-grid')), 'sin lienzo ambiental ni tarjetas promocionales');
  ok(await p.evaluate(() => !/(?<![\w\/-])(FILES|FOLDERS|NEW|files?)(?![\w\/-])/.test(document.body.innerText.replace(/\s+/g, ' '))), 'sin textos en inglés sueltos en la portada');
  const claimed = await p.evaluate(async () => {
    const html = await (await fetch('components.html')).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sections = [...doc.querySelectorAll('section.doc')].filter(s => !['Inicio', 'Patrones'].includes(s.dataset.group)).length;
    const f = document.getElementById('hero-facts').textContent;
    return { sections, presets: TeselaUI.presets.length, text: f };
  });
  ok(claimed.text.includes(`${claimed.sections} componentes`) && claimed.text.includes(`${claimed.presets} temas`), `las cifras del titular son verificables (${claimed.sections} componentes, ${claimed.presets} temas)`);

  // ---- La pared ----
  ok(await tiles.count() === 212, 'la pared tiene 212 teselas, una por experimento');
  const geo = await p.evaluate(() => {
    const t = [...document.querySelectorAll('#wall .tile')].map(e => e.getBoundingClientRect());
    const cols = new Set(t.map(r => Math.round(r.left))).size, rows = new Set(t.map(r => Math.round(r.top))).size;
    return { cols, rows, square: t.every(r => Math.abs(r.width - r.height) < 0.6), min: Math.min(...t.map(r => r.width)), first: t[0].width };
  });
  ok(geo.rows === 8 && geo.cols === 27, `27 columnas × 8 filas a 1440 px (${geo.cols}×${geo.rows})`);
  ok(geo.square && geo.min > 38, `teselas cuadradas de ${Math.round(geo.first)} px`);
  const label = await tiles.nth(46).getAttribute('aria-label');
  ok(/^N\.º 047: /.test(label), `cada tesela anuncia su número y su título (${label.slice(0, 40)}…)`);
  ok(await p.evaluate(() => [...document.querySelectorAll('#wall .tile[tabindex="0"]')].length === 1), 'un solo punto de tabulación en la pared');
  const colors = await p.evaluate(() => new Set([...document.querySelectorAll('#wall .tile')].map(e => getComputedStyle(e).backgroundColor)).size);
  ok(colors > 60, `la variación de luminosidad por pieza da ${colors} tonos distintos`);

  // Rótulo
  await tiles.nth(46).hover(); await p.waitForTimeout(250);
  const tip = await p.evaluate(() => { const t = document.getElementById('wall-tip'); return { open: t.hasAttribute('data-open'), text: t.textContent }; });
  ok(tip.open && tip.text.includes('047'), 'al pasar sobre una tesela aparece su rótulo con el número');
  ok(await p.evaluate(() => document.querySelector('.minimap-item.is-hot') !== null), 'y el índice de carpetas señala su carpeta');
  await p.mouse.move(5, 5);
  ok(await p.evaluate(() => !document.getElementById('wall-tip').hasAttribute('data-open') && !document.querySelector('.minimap-item.is-hot')), 'el rótulo y la señal se retiran al salir');

  // Teclado en la pared
  await tiles.nth(0).focus();
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.dataset.i) === '1', 'flecha abajo baja una fila (índice 1)');
  await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => document.activeElement.dataset.i) === '9', 'flecha derecha pasa a la columna siguiente (+8 filas)');
  await p.keyboard.press('ArrowUp');
  await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.dataset.i) === '0', 'flechas arriba e izquierda regresan a la primera');
  await p.keyboard.press('End');
  ok(await p.evaluate(() => document.activeElement.dataset.i) === '211', 'Fin va a la última pieza');
  await p.keyboard.press('Home');
  ok(await p.evaluate(() => [...document.querySelectorAll('#wall .tile[tabindex="0"]')].length === 1 && document.activeElement.dataset.i === '0'), 'el único punto de tabulación acompaña al foco');

  // Abrir con clic / Enter
  await tiles.nth(46).click(); await p.waitForTimeout(500);
  ok(await p.evaluate(() => location.hash) === '#/c/forms/otp-verify' || (await p.evaluate(() => location.hash)).startsWith('#/c/'), 'una tesela abre su experimento en el sandbox');
  ok(await p.evaluate(() => document.querySelector('#wall .tile.is-current') !== null), 'la tesela del experimento abierto queda marcada');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('#wall .tile.is-current')), 'al cerrar el sandbox se quita la marca');

  // El foco vuelve a la tesela al cerrar el sandbox
  await tiles.nth(20).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.activeElement.dataset.i) === '20' && await p.evaluate(() => document.activeElement.tabIndex) === 0, 'tras Esc el foco vuelve a la tesela abierta, no a <body>');

  // ---- Dirección numérica ----
  await p.mouse.move(5, 300);
  await p.keyboard.press('1'); await p.keyboard.press('2');
  const hud = await p.evaluate(() => ({ open: document.getElementById('address-hud').hasAttribute('data-open'), num: document.getElementById('address-num').textContent, name: document.getElementById('address-name').textContent }));
  ok(hud.open && hud.num.startsWith('12') && /Sigue tecleando/.test(hud.name) && !/Layouts/.test(hud.name), `con «12» (que aún puede crecer) la dirección no adelanta un nombre (${hud.name})`);
  await p.keyboard.press('7');
  ok(await p.evaluate(() => /127/.test(document.getElementById('address-num').textContent)), 'con tres cifras ya se muestra la pieza');
  await p.waitForTimeout(700);
  ok((await p.evaluate(() => location.hash)).startsWith('#/c/'), 'tres cifras válidas abren la pieza tras un instante');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  await p.keyboard.press('1'); await p.keyboard.press('2');
  await p.keyboard.press('Escape');
  ok(await p.evaluate(() => !document.getElementById('address-hud').hasAttribute('data-open')), 'Esc cancela la dirección');
  await p.keyboard.press('0'); await p.keyboard.press('4'); await p.keyboard.press('7'); await p.waitForTimeout(700);
  ok((await p.evaluate(() => location.hash)).startsWith('#/c/') && await p.evaluate(() => /047/.test(document.querySelector('.sb-bc-index')?.textContent || '') || document.querySelector('.sb-bc-index').textContent.includes('47')), 'teclear «047» abre la pieza número 47');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.keyboard.press('9'); await p.keyboard.press('9'); await p.keyboard.press('9'); await p.waitForTimeout(600);
  const bad = await p.evaluate(() => ({ hash: location.hash, open: document.getElementById('address-hud').hasAttribute('data-open'), name: document.getElementById('address-name').textContent, toasts: document.querySelectorAll('.tsl-toast').length }));
  ok(!bad.hash.startsWith('#/c/') && bad.open && /No existe/.test(bad.name) && bad.toasts === 0, `un número que no existe (999) no abre nada y se queda visible sin repetirse en un aviso (${bad.name})`);
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => !document.getElementById('address-hud').hasAttribute('data-open')), 'y se retira solo tras leerlo');
  await p.keyboard.press('0'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /1 al 212/.test(document.getElementById('address-name').textContent)), 'un 0 solo pide un número del 1 al 212');
  await p.keyboard.press('Escape');
  // Con un campo de texto enfocado, los dígitos son texto
  await p.click('#btn-cmdk'); await p.waitForTimeout(200);
  await p.keyboard.type('55');
  ok(await p.evaluate(() => document.getElementById('cmdk-input').value) === '55' && await p.evaluate(() => !document.getElementById('address-hud').hasAttribute('data-open')), 'en un campo de texto los dígitos no activan la dirección');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  // ---- Filtros y favoritos ----
  await p.click('[data-filter-btn="favs"]'); await p.waitForTimeout(400);
  const fav = await p.evaluate(() => ({ shown: [...document.querySelectorAll('#wall .tile')].filter(t => t.dataset.match === 'true').length, gilt: document.querySelectorAll('#wall .tile.is-fav').length, cards: document.querySelectorAll('.exp-card-item').length, count: document.getElementById('count-favs').textContent }));
  ok(fav.shown === fav.gilt && fav.gilt === Number(fav.count) && fav.cards === fav.gilt, `«Favoritos» deja solo las teselas doradas (${fav.gilt}) y esas tarjetas`);
  ok(await tiles.first().evaluate(e => e.classList.contains('is-fav')) && Number(await p.evaluate(() => getComputedStyle(document.querySelectorAll('#wall .tile')[5]).opacity)) < 0.3, 'las demás teselas se atenúan');
  await p.click('[data-filter-btn="new"]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => [...document.querySelectorAll('#wall .tile')].filter(t => t.dataset.match === 'true').length === Number(document.getElementById('count-new').textContent)), '«Nuevos» deja las teselas de las carpetas nuevas');
  await p.click('[data-filter-btn="all"]'); await p.waitForTimeout(300);
  // Marcar una tarjeta como favorita dora su tesela
  const before = await p.evaluate(() => document.querySelectorAll('#wall .tile.is-fav').length);
  await p.evaluate(() => document.getElementById('gallery-root').scrollIntoView());
  const card = p.locator('.exp-card-item').nth(20);
  await card.hover(); await card.locator('[data-toggle-fav]').click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#wall .tile.is-fav').length) === before + 1 && Number(await p.evaluate(() => document.getElementById('count-favs').textContent)) === before + 1, 'marcar una tarjeta como favorita dora su tesela y actualiza el contador');
  await card.locator('[data-toggle-fav]').click();
  ok(await card.locator('[data-toggle-fav]').getAttribute('aria-pressed') === 'false', 'quitar el favorito actualiza aria-pressed');

  // ---- Galería ----
  const head = await p.evaluate(() => { const s = document.querySelector('.cat-section'); return { range: s.querySelector('.cat-range').textContent.replace(/\s+/g, ' ').trim(), title: getComputedStyle(s.querySelector('.cat-title')).fontFamily, addr: s.querySelector('.exp-card-addr').textContent }; });
  ok(/N\.º 001 – 012/.test(head.range) && /Marcellus/.test(head.title) && head.addr === 'N.º 001', `cada carpeta anuncia su rango de números (${head.range})`);
  ok(await p.evaluate(() => [...document.querySelectorAll('.exp-card-addr')].map(e => e.textContent).every((t, i) => t === `N.º ${String(i + 1).padStart(3, '0')}`)), 'las 212 tarjetas llevan su número en el orden de la pared');

  // Sin favoritos por defecto: nada dorado y un estado vacío que dice qué hacer
  const fresh = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await fresh.goto(`${base}/index.html`); await fresh.waitForLoadState('networkidle'); await fresh.waitForTimeout(400);
  ok(await fresh.evaluate(() => document.querySelectorAll('#wall .tile.is-fav').length === 0 && document.getElementById('count-favs').textContent === '0'), 'una persona nueva no ve favoritos que no marcó');
  await fresh.click('[data-filter-btn="favs"]'); await fresh.waitForTimeout(300);
  const empty = await fresh.evaluate(() => document.querySelector('.empty-filter-state')?.textContent.replace(/\s+/g, ' ').trim());
  ok(/Aún no marcaste favoritos: usa la estrella/.test(empty || '') && /Ver los 212 experimentos/.test(empty), `el estado vacío de favoritos explica cómo salir (${(empty || '').slice(0, 50)}…)`);
  await fresh.context().close();

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));

  // ---- Tamaños pequeños: teselas tocables y sin desborde ----
  for (const [w, h, rows] of [[320, 640, 31], [375, 700, 27], [500, 800, 24], [700, 800, 18], [800, 900, 15], [950, 800, 12]]) {
    const q = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true })).newPage();
    await q.goto(`${base}/index.html`); await q.waitForLoadState('networkidle'); await settle(q); await q.waitForTimeout(200);
    const m = await q.evaluate(() => { const t = [...document.querySelectorAll('#wall .tile')].map(e => e.getBoundingClientRect()); const f = document.getElementById('wall-frame').getBoundingClientRect(); return { min: Math.min(...t.map(r => r.width)), rows: new Set(t.map(r => Math.round(r.top))).size, inside: t.every(r => r.left >= f.left && r.right <= f.right), over: document.documentElement.scrollWidth > innerWidth + 1 }; });
    ok(m.rows === rows && m.min >= 33 && m.inside && !m.over, `${w} px: ${rows} filas, teselas de ${Math.round(m.min)} px (≥ 33) dentro del marco y sin desborde`);
    await q.context().close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
