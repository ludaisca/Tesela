const { chromium } = require('playwright');
const URL = (process.env.BASE_URL || 'http://localhost:24100') + '/components.html';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL); await p.waitForLoadState('networkidle');

  // Popover
  await p.locator('#popover').scrollIntoViewIfNeeded();
  const pop = p.locator('#popover tsl-popover');
  const trig = pop.locator('[data-tsl-trigger]'), panel = pop.locator('.tsl-popover__panel');
  ok(!(await panel.isVisible()), 'popover cerrado al inicio');
  await trig.click();
  ok(await panel.isVisible(), 'popover abre con clic');
  ok((await trig.getAttribute('aria-expanded')) === 'true', 'aria-expanded=true');
  const tb = await trig.boundingBox(), pb = await panel.boundingBox();
  ok(pb.y >= tb.y + tb.height - 1 && Math.abs(pb.x - tb.x) < 4, `posicionado bajo el disparador (dx=${Math.round(pb.x - tb.x)})`);
  ok(await p.evaluate(() => document.activeElement.id === 'pop-w'), 'foco al primer campo');
  await p.keyboard.press('Escape');
  ok(!(await panel.isVisible()), 'Esc cierra popover');
  ok(await p.evaluate(() => document.activeElement.matches('#popover [data-tsl-trigger]')), 'foco vuelve al disparador');
  await trig.click(); await panel.getByText('Aplicar').click();
  ok(!(await panel.isVisible()), 'data-tsl-close cierra popover');
  await trig.click(); await p.mouse.click(5, 400);
  ok(!(await panel.isVisible()), 'clic fuera cierra popover');

  // Flip: ancla cerca del borde inferior
  const flip = await p.evaluate(() => {
    const a = document.createElement('button'); a.textContent = 'a';
    a.style.cssText = 'position:fixed;left:300px;top:' + (innerHeight - 30) + 'px';
    const f = document.createElement('div'); f.style.cssText = 'position:fixed;width:100px;height:120px';
    document.body.append(a, f);
    const side = TeselaUI.position(a, f, { placement: 'bottom' });
    const r = f.getBoundingClientRect(), ar = a.getBoundingClientRect();
    a.remove(); f.remove();
    return { side, bottomOk: r.bottom <= ar.top, inView: r.top >= 0 };
  });
  ok(flip.side === 'top' && flip.bottomOk && flip.inView, 'position() voltea a top cuando no cabe abajo');

  // Hover card
  await p.locator('#hovercard').scrollIntoViewIfNeeded();
  const hc = p.locator('#hovercard tsl-hovercard'), htrig = hc.locator('[data-tsl-trigger]'), hpanel = hc.locator('.tsl-popover__panel');
  await htrig.hover();
  await p.waitForTimeout(150);
  ok(!(await hpanel.isVisible()), 'hover card respeta open-delay');
  await p.waitForTimeout(350);
  ok(await hpanel.isVisible(), 'hover card abre al pasar el cursor');
  const hb = await hpanel.boundingBox(); await p.mouse.move(hb.x + 20, hb.y + 20);
  await p.waitForTimeout(400);
  ok(await hpanel.isVisible(), 'sigue abierta con el cursor sobre el panel');
  await p.mouse.move(5, 5); await p.waitForTimeout(400);
  ok(!(await hpanel.isVisible()), 'cierra al salir');
  await htrig.focus(); await p.waitForTimeout(400);
  ok(await hpanel.isVisible(), 'abre con foco de teclado');
  await p.keyboard.press('Escape');
  ok(!(await hpanel.isVisible()), 'Esc cierra hover card');

  // Menú contextual
  await p.locator('#context-menu').scrollIntoViewIfNeeded();
  const zone = p.locator('#context-menu .tsl-context-zone'), menu = p.locator('#context-menu .tsl-menu__list');
  const zb = await zone.boundingBox();
  await p.mouse.click(zb.x + 100, zb.y + 50, { button: 'right' });
  ok(await menu.isVisible(), 'menú contextual abre con clic derecho');
  const mb = await menu.boundingBox();
  ok(Math.abs(mb.x - (zb.x + 100)) < 6 && Math.abs(mb.y - (zb.y + 50)) < 6, `abre en el cursor (dx=${Math.round(mb.x - zb.x - 100)}, dy=${Math.round(mb.y - zb.y - 50)})`);
  ok(await p.evaluate(() => document.activeElement.dataset.value === 'copy'), 'foco en primer ítem');
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.dataset.value === 'paste'), '↓ mueve foco');
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.dataset.value === 'delete'), 'salta el ítem deshabilitado');
  await p.keyboard.press('Escape');
  ok(!(await menu.isVisible()), 'Esc cierra menú contextual');
  await p.mouse.click(zb.x + 60, zb.y + 40, { button: 'right' });
  await menu.getByText('Pegar').click();
  ok(await p.locator('.tsl-toast', { hasText: 'Acción: paste' }).count() > 0, 'tsl-select emitido al elegir');
  ok(!(await menu.isVisible()), 'cierra tras elegir');
  await zone.focus(); await p.keyboard.press('Shift+F10');
  ok(await menu.isVisible(), 'Shift+F10 abre el menú');
  await p.keyboard.press('Escape');

  // Confirmación
  await p.locator('#alert-dialog').scrollIntoViewIfNeeded();
  await p.locator('#demo-confirm-del').click();
  const dlg = p.locator('dialog[role=alertdialog]');
  ok(await dlg.isVisible(), 'alertdialog abre');
  ok(await p.evaluate(() => document.activeElement.textContent === 'Cancelar'), 'foco inicial en Cancelar (danger)');
  await p.mouse.click(5, 5);
  ok(await dlg.isVisible(), 'clic en el fondo no cierra');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  ok(await p.locator('.tsl-toast', { hasText: 'Cancelado' }).count() > 0 && (await dlg.count()) === 0, 'Esc resuelve false y limpia el DOM');
  await p.locator('#demo-confirm-del').click();
  await p.getByRole('button', { name: 'Eliminar', exact: true }).last().click();
  await p.waitForTimeout(100);
  ok(await p.locator('.tsl-toast', { hasText: 'Proyecto eliminado' }).count() > 0, 'confirmar resuelve true');
  await p.locator('#demo-confirm-alert').click();
  ok((await p.locator('dialog[role=alertdialog] .tsl-btn').count()) === 1, 'cancelLabel:null → un solo botón');
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);

  // Sheet / drawer
  await p.locator('#sheet').scrollIntoViewIfNeeded();
  await p.getByRole('button',{name:'Abrir sheet'}).click();
  const sheet = p.locator('#demo-sheet');
  ok(await sheet.isVisible(), 'sheet abre');
  await p.waitForTimeout(350);
  const sb = await sheet.boundingBox();
  ok(Math.abs(sb.y + sb.height - 800) < 3, `sheet anclado abajo (bottom=${Math.round(sb.y + sb.height)})`);
  const hb2 = await p.locator('#demo-sheet .tsl-sheet__handle').boundingBox();
  await p.mouse.move(hb2.x + hb2.width / 2, hb2.y + 10); await p.mouse.down();
  await p.mouse.move(hb2.x + hb2.width / 2, hb2.y + 60, { steps: 4 });
  await p.mouse.move(hb2.x + hb2.width / 2, hb2.y + 200, { steps: 6 }); await p.mouse.up();
  await p.waitForTimeout(150);
  ok(!(await sheet.isVisible()), 'arrastrar el asa cierra el sheet');
  await p.getByRole('button',{name:'Drawer izquierdo'}).click(); await p.waitForTimeout(350);
  const db = await p.locator('#demo-drawer-start').boundingBox();
  ok(db.x === 0 && db.height >= 790, 'drawer izquierdo pegado a la izquierda a toda altura');
  await p.keyboard.press('Escape');

  // Paleta de comandos: el botón "Buscar" de la cabecera abre <tsl-command> mediante data-tsl-open
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(900);
  await p.locator('.docs-topbar [data-tsl-open="docs-cmd"]').click();
  ok(await p.locator('tsl-command dialog').first().evaluate(d => d.open), 'paleta: data-tsl-open abre <tsl-command>');
  await p.keyboard.type('toast');
  ok((await p.locator('tsl-command .tsl-command__item:not([hidden])').count()) >= 1, 'paleta: filtra al escribir');
  await p.keyboard.press('Escape');
  ok(!(await p.locator('tsl-command dialog').first().evaluate(d => d.open)), 'paleta: Esc la cierra');
  await p.keyboard.press('Control+k');
  ok(await p.locator('tsl-command dialog').first().evaluate(d => d.open), 'paleta: Ctrl+K la abre');
  await p.keyboard.press('Escape');

  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
