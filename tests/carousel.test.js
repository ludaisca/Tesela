// <tsl-carousel>: desplazamiento, botones, puntos, teclado, bucle, varias a la vez, avance automático y accesibilidad.
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');
  await p.locator('#carousel').scrollIntoViewIfNeeded();
  const c = p.locator('#demo-carousel');
  const idx = () => c.evaluate(e => e.index);
  const settle = () => p.waitForTimeout(700);
  await settle();

  ok(await c.getAttribute('role') === 'region' && await c.getAttribute('aria-roledescription') === 'carrusel', 'región con roledescription «carrusel»');
  ok(await c.locator('.tsl-carousel__slide').nth(1).getAttribute('aria-label') === '2 de 4', 'cada diapositiva anuncia «n de total»');
  ok(await idx() === 0 && await c.locator('.tsl-carousel__prev').isDisabled() && !(await c.locator('.tsl-carousel__next').isDisabled()), 'inicio: «Anterior» deshabilitado');
  const inert = await c.locator('.tsl-carousel__slide').evaluateAll(a => a.map(s => s.inert));
  ok(JSON.stringify(inert) === '[false,true,true,true]', 'solo la diapositiva visible es interactiva (el resto inert)');
  ok(await c.locator('.tsl-carousel__dot').count() === 4 && await c.locator('.tsl-carousel__dot').first().getAttribute('aria-current') === 'true', '4 puntos, el primero activo');

  await p.evaluate(() => { window.__ev = []; document.getElementById('demo-carousel').addEventListener('tsl-change', e => window.__ev.push(e.detail.index)); });
  await c.locator('.tsl-carousel__next').click(); await settle();
  ok(await idx() === 1, 'Siguiente avanza una diapositiva');
  const tr = await c.locator('.tsl-carousel__track').boundingBox(), s2 = await c.locator('.tsl-carousel__slide').nth(1).boundingBox();
  ok(Math.abs(s2.x - tr.x) < 2, 'la diapositiva queda alineada con el borde (snap)');
  ok(await c.locator('.tsl-carousel__dot').nth(1).getAttribute('aria-current') === 'true', 'el punto activo sigue la posición');
  ok(await p.evaluate(() => window.__ev.join()) === '1', 'evento tsl-change con el índice');
  await c.locator('.tsl-carousel__dot').nth(3).click(); await settle();
  ok(await idx() === 3 && await c.locator('.tsl-carousel__next').isDisabled(), 'un punto salta a su diapositiva; al final «Siguiente» se deshabilita');
  await c.locator('.tsl-carousel__prev').click(); await settle();
  ok(await idx() === 2, 'Anterior retrocede');

  // Teclado
  await c.locator('.tsl-carousel__track').focus();
  await p.keyboard.press('Home'); await settle();
  ok(await idx() === 0, 'Inicio va a la primera');
  await p.keyboard.press('ArrowRight'); await settle();
  ok(await idx() === 1, 'flecha derecha avanza');
  await p.keyboard.press('End'); await settle();
  ok(await idx() === 3, 'Fin va a la última');
  await p.keyboard.press('ArrowLeft'); await settle();
  ok(await idx() === 2, 'flecha izquierda retrocede');

  // El contenido de una diapositiva oculta no recibe el foco con Tab
  await c.evaluate(e => e.goTo(0, false)); await settle();
  const btnInSlide3 = c.locator('.tsl-carousel__slide').nth(2).locator('button');
  await btnInSlide3.focus({ timeout: 500 }).catch(() => {});
  ok(!(await p.evaluate(() => document.activeElement.matches('.tsl-carousel__slide button'))), 'un botón dentro de una diapositiva oculta no se puede enfocar');

  // Desplazar a mano (rueda/dedo) actualiza el estado
  await c.locator('.tsl-carousel__track').evaluate(t => t.scrollBy({ left: t.clientWidth * 2, behavior: 'instant' })); await settle();
  ok(await idx() === 2, 'el desplazamiento manual actualiza el índice');

  // RTL
  await p.evaluate(() => { document.getElementById('demo-carousel').dir = 'rtl'; });
  await c.evaluate(e => e.goTo(0, false)); await settle();
  ok(await idx() === 0, 'RTL: primera diapositiva');
  await c.locator('.tsl-carousel__track').focus();
  await p.keyboard.press('ArrowLeft'); await settle();
  ok(await idx() === 1, 'RTL: flecha izquierda avanza');
  await p.evaluate(() => { document.getElementById('demo-carousel').dir = ''; });

  // Varias a la vez + bucle
  const m = p.locator('#demo-carousel-multi');
  ok(await m.evaluate(e => e.pageCount) === 3, 'per-view=2 con 4 diapositivas → 3 posiciones');
  const w = await m.locator('.tsl-carousel__slide').first().boundingBox(), mt = await m.locator('.tsl-carousel__track').boundingBox();
  ok(Math.abs(w.width * 2 + 12 - mt.width) < 2, 'dos diapositivas ocupan el ancho con el hueco entre ellas');
  await m.evaluate(e => e.pauseAuto());
  await m.evaluate(e => e.goTo(0, false)); await settle();
  await m.locator('.tsl-carousel__prev').click(); await settle();
  ok(await m.evaluate(e => e.index) === 2, 'loop: «Anterior» desde el inicio va al final');
  await m.locator('.tsl-carousel__next').click(); await settle();
  ok(await m.evaluate(e => e.index) === 0, 'loop: «Siguiente» desde el final vuelve al inicio');

  // Avance automático
  ok(await m.locator('.tsl-carousel__play').getAttribute('aria-label') === 'Reanudar avance automático', 'pausado: el botón ofrece reanudar');
  await m.evaluate(e => { e.setAttribute('autoplay', '1500'); e.startAuto(true); });
  await p.mouse.move(5, 5); await p.evaluate(() => document.activeElement.blur());
  await p.waitForTimeout(2600);
  ok(await m.evaluate(e => e.index) >= 1, 'autoplay avanza solo');
  await m.locator('.tsl-carousel__play').click();
  const frozen = await m.evaluate(e => e.index);
  await p.waitForTimeout(2200);
  ok(await m.evaluate(e => e.index) === frozen && await m.locator('.tsl-carousel__play').getAttribute('aria-label') === 'Reanudar avance automático', 'el botón pausa el avance');
  await p.evaluate(() => document.activeElement.blur());
  await m.evaluate(e => e.startAuto(true));
  const box = await m.boundingBox(); await p.mouse.move(box.x + 40, box.y + 40);
  const held = await m.evaluate(e => e.index);
  await p.waitForTimeout(2200);
  ok(await m.evaluate(e => e.index) === held, 'el cursor encima detiene el avance');
  await m.evaluate(e => e.pauseAuto());

  // Movimiento reducido: el autoplay no arranca solo
  // El foco dentro del carrusel también detiene el avance
  await m.evaluate(e => e.startAuto(true)); await m.locator('.tsl-carousel__next').focus();
  const kept = await m.evaluate(e => e.index); await p.waitForTimeout(2200);
  ok(await m.evaluate(e => e.index) === kept, 'el foco dentro del carrusel detiene el avance');
  await m.evaluate(e => e.pauseAuto());

  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.reload(); await p.waitForLoadState('networkidle');
  await p.locator('#carousel').scrollIntoViewIfNeeded();
  ok(await p.locator('#demo-carousel-multi').evaluate(e => e.playing === false), 'prefers-reduced-motion: no avanza automáticamente');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
