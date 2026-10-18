// Componentes solo de CSS: .tsl-item (fila genérica).
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
  await p.locator('#item').scrollIntoViewIfNeeded();
  const items = p.locator('#item .tsl-item');

  ok(await items.count() === 3, 'tres items de ejemplo');
  const row = await items.first().evaluate(e => { const r = e.getBoundingClientRect(); const m = e.querySelector('.tsl-item__media').getBoundingClientRect(), a = e.querySelector('.tsl-item__actions').getBoundingClientRect(), c = e.querySelector('.tsl-item__content').getBoundingClientRect(); return { sameRow: Math.abs((m.top + m.height / 2) - (a.top + a.height / 2)) < 3, order: m.right <= c.left + 1 && c.right <= a.left + 1, actionsAtEnd: Math.abs(r.right - 14 - 1 - a.right) < 3 }; });
  ok(row.sameRow && row.order, 'medio, contenido y acciones van en una fila, en ese orden');
  ok(row.actionsAtEnd, 'las acciones quedan pegadas al final');
  ok(await items.first().evaluate(e => getComputedStyle(e).borderTopColor !== 'rgba(0, 0, 0, 0)' && parseFloat(getComputedStyle(e).borderTopWidth) === 1), 'variante --outline dibuja borde');

  // Enlace: hover y foco
  const link = p.locator('#item a.tsl-item');
  const bg0 = await link.evaluate(e => getComputedStyle(e).backgroundColor);
  await link.hover(); await p.waitForTimeout(250);
  ok(await link.evaluate(e => getComputedStyle(e).backgroundColor) !== bg0, 'el item-enlace cambia de fondo al pasar el cursor');
  await p.mouse.move(5, 5); await link.focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
  ok(await link.evaluate(e => getComputedStyle(e).boxShadow !== 'none'), 'el item-enlace muestra anillo de foco con teclado');

  // Tamaño sm
  const hs = await items.nth(2).evaluate(e => e.querySelector('.tsl-item__media').getBoundingClientRect().height);
  ok(hs === 28, 'tamaño --sm reduce el medio (28 px)');

  // Contenedor estrecho: texto largo y acciones pasan de línea sin desbordar
  const r = await p.evaluate(() => {
    const host = document.createElement('div'); host.style.cssText = 'width:240px;position:fixed;left:0;top:0;background:#000';
    host.innerHTML = '<div class="tsl-item tsl-item--outline"><div class="tsl-item__media tsl-item__media--icon">★</div><div class="tsl-item__content"><div class="tsl-item__title">Una_palabra_extremadamente_larga_sin_espacios_para_romper</div><p class="tsl-item__desc">Descripción</p></div><div class="tsl-item__actions"><button class="tsl-btn tsl-btn--sm">Uno</button><button class="tsl-btn tsl-btn--sm">Dos</button></div></div>';
    document.body.appendChild(host);
    const it = host.firstChild, ir = it.getBoundingClientRect();
    const over = [...it.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > ir.right + 1).length;
    const out = { over, scroll: it.scrollWidth <= it.clientWidth + 1, w: Math.round(ir.width) };
    host.remove();
    return out;
  });
  ok(r.over === 0 && r.scroll && r.w === 240, 'en 240 px nada se sale del item (el título largo se parte)');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
