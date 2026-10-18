// <tsl-sidebar>: contraer a iconos, cajón en pantallas estrechas, teclado, persistencia y submenús.
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');
  await p.locator('#sidebar').scrollIntoViewIfNeeded();
  const sb = p.locator('#demo-sidebar'), tg = p.locator('#sidebar [data-tsl-sidebar-toggle]');
  const w = () => sb.evaluate(e => Math.round(e.getBoundingClientRect().width));
  await p.waitForTimeout(300);

  ok(await sb.getAttribute('role') === 'navigation' && await sb.getAttribute('aria-label') === 'Navegación de la aplicación', 'rol navigation y nombre accesible');
  ok(await w() === 248, 'ancho completo al inicio (248 px)');
  ok(await tg.getAttribute('aria-expanded') === 'true' && await tg.getAttribute('aria-controls') === 'demo-sidebar', 'el botón refleja aria-expanded y aria-controls');

  // Contraer a iconos
  await tg.click(); await p.waitForTimeout(350);
  ok(await w() === 56, 'contraída a la columna de iconos (56 px)');
  ok(await tg.getAttribute('aria-expanded') === 'false', 'aria-expanded=false al contraer');
  ok(!(await sb.locator('.tsl-sidebar__text').first().isVisible()), 'las etiquetas se ocultan');
  ok(await sb.locator('.tsl-sidebar__item').first().getAttribute('title') === 'Inicio', 'el nombre pasa a title en modo iconos');
  await tg.click(); await p.waitForTimeout(350);
  ok(await w() === 248 && await sb.locator('.tsl-sidebar__item').first().getAttribute('title') === null, 'al expandir vuelve el ancho y se quita el title automático');

  // Atajo Ctrl+B y evento
  await p.evaluate(() => { window.__ev = []; document.getElementById('demo-sidebar').addEventListener('tsl-toggle', e => window.__ev.push(e.detail)); });
  await p.locator('body').click({ position: { x: 5, y: 300 } });
  await p.keyboard.press('Control+b'); await p.waitForTimeout(300);
  ok(await sb.evaluate(e => e.collapsed) && await w() === 56, 'Ctrl+B contrae');
  ok(await p.evaluate(() => JSON.stringify(window.__ev[0])) === '{"collapsed":true,"open":false,"mobile":false}', 'evento tsl-toggle con detalle');
  await p.keyboard.press('Control+b'); await p.waitForTimeout(300);
  ok(!(await sb.evaluate(e => e.collapsed)), 'Ctrl+B expande');

  // Submenú
  const sub = sb.locator('.tsl-sidebar__sub'), subBtn = sb.locator('button.tsl-sidebar__item');
  ok(await sub.isVisible(), 'submenú abierto al inicio');
  await subBtn.click();
  ok(!(await sub.isVisible()) && await subBtn.getAttribute('aria-expanded') === 'false', 'el botón cierra el submenú y actualiza aria-expanded');
  await subBtn.click();

  // Persistencia
  await p.evaluate(() => { const e = document.getElementById('demo-sidebar'); e.setAttribute('storage-key', 'prueba'); e.collapse(); });
  ok(await p.evaluate(() => localStorage.getItem('tsl-sidebar:prueba')) === '1', 'storage-key guarda el estado contraído');
  await p.evaluate(() => document.getElementById('demo-sidebar').expand());

  // Modo cajón: contenedor estrecho
  await p.setViewportSize({ width: 600, height: 800 });
  await p.locator('#sidebar').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  ok(await sb.evaluate(e => e.isMobile && e.hasAttribute('data-mobile')), 'bajo el breakpoint pasa a modo cajón');
  ok(await sb.evaluate(e => e.inert), 'el cajón cerrado es inert (no se enfoca)');
  const layoutBox = await p.locator('#sidebar .tsl-sidebar-layout').boundingBox();
  ok(await sb.evaluate(e => e.getBoundingClientRect().right) <= layoutBox.x + 1, 'el cajón cerrado queda fuera de la vista');
  await tg.focus(); await tg.click(); await p.waitForTimeout(350);
  ok(await sb.evaluate(e => e.mobileOpen && !e.inert), 'el botón abre el cajón');
  ok(await p.evaluate(() => document.getElementById('demo-sidebar').contains(document.activeElement)), 'el foco entra en el cajón');
  const ob = await sb.boundingBox();
  ok(ob.x >= layoutBox.x - 1 && ob.x + ob.width <= layoutBox.x + layoutBox.width + 1, 'el cajón abierto cabe dentro del contenedor');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await sb.evaluate(e => !e.mobileOpen) && await p.evaluate(() => document.activeElement.matches('[data-tsl-sidebar-toggle]')), 'Esc cierra y devuelve el foco al botón');
  await tg.click(); await p.waitForTimeout(300);
  await p.locator('#sidebar .tsl-sidebar__backdrop').click({ position: { x: layoutBox.width - 20, y: 150 } }); await p.waitForTimeout(300);
  ok(await sb.evaluate(e => !e.mobileOpen), 'clic en el fondo cierra el cajón');
  await tg.click(); await p.waitForTimeout(300);
  await sb.locator('a[href]').nth(1).click(); await p.waitForTimeout(300);
  ok(await sb.evaluate(e => !e.mobileOpen), 'elegir un enlace cierra el cajón');

  // Vuelta a escritorio
  await p.setViewportSize({ width: 1200, height: 800 }); await p.waitForTimeout(400);
  ok(await sb.evaluate(e => !e.isMobile && !e.inert) && await w() === 248, 'al ensanchar vuelve al modo de escritorio');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
