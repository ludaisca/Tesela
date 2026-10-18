// Derecha a izquierda: API de dirección, guardado anti-parpadeo, sin desbordes y componentes espejados.
const { chromium } = require('playwright');
const { measurePage } = require('../scripts/lib/responsive-measure');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const mk = async (w, h) => { const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.__errs = []; p.on('pageerror', e => p.__errs.push(String(e))); return p; };
  const p = await mk(1200, 900);
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');

  // ---- API ----
  const api = await p.evaluate(() => {
    const ev = []; document.addEventListener('tsl-direction', e => ev.push(e.detail.direction));
    const a = TeselaUI.getDirection();
    const r = TeselaUI.setDirection('rtl');
    const o = { a, r, attr: document.documentElement.getAttribute('dir'), stored: localStorage.getItem('tsl-dir'), get: TeselaUI.getDirection(), bad: TeselaUI.setDirection('xyz'), ev: ev.join() };
    return o;
  });
  ok(api.a === 'ltr' && api.r === 'rtl' && api.attr === 'rtl' && api.stored === 'rtl' && api.get === 'rtl', 'setDirection("rtl"): atributo dir, localStorage, getDirection y valor devuelto');
  ok(api.bad === 'ltr' && api.ev === 'rtl,ltr', 'un valor desconocido se toma como ltr; el evento tsl-direction se emite en cada cambio');
  await p.evaluate(() => TeselaUI.setDirection('rtl'));

  // theme-init aplica dir antes de pintar
  await p.reload(); await p.waitForLoadState('networkidle');
  ok(await p.evaluate(() => document.documentElement.dir) === 'rtl', 'la dirección guardada se restaura al recargar');
  const fx = await p.context().newPage();
  await fx.addInitScript(() => localStorage.setItem('tsl-dir', 'rtl'));
  await fx.goto(`${base}/tests/fixtures/theme-init.html`);
  ok(await fx.evaluate(() => document.documentElement.getAttribute('dir')) === 'rtl', 'theme-init.js fija dir en <html> antes del primer pintado');
  await fx.close();

  // ---- Posiciones espejadas ----
  const show = (id) => p.evaluate(i => document.getElementById(i).scrollIntoView({ block: 'center' }), id);
  await show('tabs'); await p.waitForTimeout(150);
  const tabs = p.locator('#tabs .tsl-tabs__tab');
  const xs = await tabs.evaluateAll(a => a.map(t => Math.round(t.getBoundingClientRect().left)));
  ok(xs[0] > xs[1] && xs[1] > xs[2], 'las pestañas fluyen de derecha a izquierda');
  await tabs.first().focus(); await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.dataset.tab) === 'activity', 'pestañas: ← avanza a la siguiente en RTL');
  await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => document.activeElement.dataset.tab) === 'overview', 'pestañas: → retrocede en RTL');

  // Slider
  await show('slider'); await p.waitForTimeout(150);
  const sl = p.locator('#demo-slider');
  const thumb = await sl.locator('.tsl-slider__thumb').boundingBox(), track = await sl.locator('.tsl-slider__track').boundingBox();
  const frac = (track.x + track.width - (thumb.x + thumb.width / 2)) / track.width;
  ok(Math.abs(frac - 0.4) < 0.02, `slider: el 40 % se mide desde la derecha (${frac.toFixed(2)})`);
  const fill = await sl.locator('.tsl-slider__fill').boundingBox();
  ok(Math.abs((fill.x + fill.width) - (track.x + track.width)) < 2, 'slider: el relleno nace en el borde derecho');
  await sl.locator('.tsl-slider__track').click({ position: { x: 3, y: 2 } });
  ok(await sl.evaluate(e => parseFloat(e.value)) > 90, 'slider: pulsar en el extremo izquierdo da el valor máximo');
  await sl.locator('.tsl-slider__thumb').focus(); await p.keyboard.press('ArrowLeft');
  const before = await sl.evaluate(e => parseFloat(e.value));
  await p.keyboard.press('ArrowRight');
  ok(await sl.evaluate(e => parseFloat(e.value)) < before + 0.001 && await sl.evaluate(e => parseFloat(e.value)) === before - 1, 'slider: → disminuye y ← aumenta en RTL');

  // Rating
  await show('rating'); await p.waitForTimeout(150);
  const rt = p.locator('#demo-rating');
  const stars = await rt.locator('.tsl-rating__star').evaluateAll(a => a.map(s => Math.round(s.getBoundingClientRect().left)));
  ok(stars[0] > stars[4], 'rating: la primera estrella está a la derecha');
  await rt.locator('.tsl-rating__star').first().click();
  ok(await rt.evaluate(e => e.value) === 1, 'rating: pulsar la estrella de la derecha da 1');
  await rt.focus(); await p.keyboard.press('ArrowLeft');
  ok(await rt.evaluate(e => e.value) === 2, 'rating: ← aumenta en RTL');

  // Calendario
  await show('calendar'); await p.waitForTimeout(150);
  await p.locator('#demo-cal .tsl-cal__day[aria-pressed=true], #demo-cal .tsl-cal__day[tabindex="0"]').first().focus();
  const d0 = await p.evaluate(() => document.activeElement.dataset.date);
  await p.keyboard.press('ArrowLeft');
  const d1 = await p.evaluate(() => document.activeElement.dataset.date);
  ok(new Date(d1) - new Date(d0) === 864e5, `calendario: ← avanza un día en RTL (${d0} → ${d1})`);

  // Árbol
  await show('tree'); await p.waitForTimeout(150);
  const tree = p.locator('#tree tsl-tree');
  await tree.locator('[role=treeitem]').first().focus();
  ok(await p.evaluate(() => document.activeElement.getAttribute('aria-expanded')) === 'true', 'árbol: el primer nodo empieza expandido');
  await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => document.activeElement.getAttribute('aria-expanded')) === 'false', 'árbol: en RTL → contrae');
  await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.getAttribute('aria-expanded')) === 'true', 'árbol: en RTL ← expande');

  // Selector de fecha: su panel es más estrecho que el campo: en RTL debe alinearse al borde derecho (inicio), no al izquierdo
  await show('date-picker'); await p.waitForTimeout(150);
  const dp = p.locator('#date-picker tsl-date-picker[name=entrega]');
  await dp.locator('.tsl-trigger').click(); await p.waitForTimeout(200);
  const tb = await dp.locator('.tsl-trigger').boundingBox(), pb = await dp.locator('.tsl-date__panel').boundingBox();
  ok(tb.width - pb.width > 20 && Math.abs((pb.x + pb.width) - (tb.x + tb.width)) < 3, `selector de fecha: el panel (más estrecho que el campo) se ancla al borde derecho, no al izquierdo (Δ=${Math.round((pb.x + pb.width) - (tb.x + tb.width))})`);
  await p.keyboard.press('Escape');

  // Barra lateral a la derecha
  await show('sidebar'); await p.waitForTimeout(300);
  const lay = await p.locator('#sidebar .tsl-sidebar-layout').boundingBox(), sbb = await p.locator('#demo-sidebar').boundingBox();
  ok(Math.abs((sbb.x + sbb.width) - (lay.x + lay.width)) < 3, 'barra lateral: aparece en el lado derecho');

  // Carrusel
  await show('carousel'); await p.waitForTimeout(300);
  const car = p.locator('#demo-carousel');
  const pv = await car.locator('.tsl-carousel__prev').boundingBox(), nx = await car.locator('.tsl-carousel__next').boundingBox();
  ok(pv.x > nx.x, 'carrusel: «Anterior» queda a la derecha y «Siguiente» a la izquierda');

  // Sin errores
  ok(p.__errs.length === 0, 'sin errores de página' + (p.__errs.length ? ': ' + p.__errs[0] : ''));
  await p.close();

  // ---- Sin desbordes en RTL ----
  const SIZES = [[320, 568], [375, 667], [768, 1024], [1280, 800], [1920, 1080]];
  for (const page of ['components.html', 'index.html']) {
    const problems = [];
    for (const [w, h] of SIZES) {
      const q = await mk(w, h);
      await q.addInitScript(() => localStorage.setItem('tsl-dir', 'rtl'));
      await q.goto(`${base}/${page}`); await q.waitForLoadState('networkidle'); await q.waitForTimeout(250);
      const m = await q.evaluate(measurePage);
      if (m.scrollW > m.vw + 1 || m.offenders.length) problems.push(`${w}×${h}: ancho ${m.scrollW}/${m.vw}${m.offenders[0] ? ` · ${m.offenders[0].el}` : ''}`);
      await q.context().close();
    }
    ok(problems.length === 0, `${page} en RTL: sin desborde horizontal en ${SIZES.length} tamaños` + (problems.length ? `:\n   - ${problems.slice(0, 5).join('\n   - ')}` : ''));
  }

  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
