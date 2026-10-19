// <tsl-radio-group>: teclado, roles ARIA, formulario, validación, reinicio y deshabilitado.
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
  await p.locator('#radio-group').scrollIntoViewIfNeeded();
  const g = p.locator('#demo-radios'), h = p.locator('#demo-radios-h');
  const checked = (loc) => loc.evaluate(e => e.value);

  ok(await g.getAttribute('role') === 'radiogroup' && await g.getAttribute('aria-label') === 'Plan de suscripción', 'rol radiogroup y nombre accesible');
  ok(await g.locator('[role=radio]').count() === 3, 'cada opción tiene role=radio');
  ok(await checked(g) === 'pro' && await g.locator('[value=pro]').getAttribute('aria-checked') === 'true', 'value inicial seleccionado');
  ok(await h.evaluate(e => !e.hasAttribute('data-invalid')) && await h.locator('.tsl-radio__mark').first().evaluate(e => getComputedStyle(e).borderTopColor) === await g.locator('.tsl-radio__mark').first().evaluate(e => getComputedStyle(e).borderTopColor), 'un grupo obligatorio vacío no muestra error antes de validar');
  const tabs = await g.locator('.tsl-radio').evaluateAll(a => a.map(x => x.tabIndex));
  ok(JSON.stringify(tabs) === '[-1,0,-1]', 'un solo punto de tabulación (la opción marcada)');
  ok(await h.getAttribute('aria-orientation') === 'horizontal' && await g.getAttribute('aria-orientation') === 'vertical', 'aria-orientation según el atributo');

  // Clic y evento
  await p.evaluate(() => { window.__ev = []; document.getElementById('demo-radios').addEventListener('tsl-change', e => window.__ev.push(e.detail.value)); });
  await g.locator('[value=free]').click();
  ok(await checked(g) === 'free' && await p.evaluate(() => window.__ev.join()) === 'free', 'clic selecciona y emite tsl-change');
  await g.locator('[value=free]').click();
  ok(await p.evaluate(() => window.__ev.length) === 1, 'volver a elegir lo mismo no repite el evento');

  // Teclado
  await g.locator('[value=free]').focus();
  await p.keyboard.press('ArrowDown');
  ok(await checked(g) === 'pro' && await p.evaluate(() => document.activeElement.value) === 'pro', 'ArrowDown mueve el foco y selecciona');
  await p.keyboard.press('ArrowDown');
  ok(await checked(g) === 'free', 'salta la opción deshabilitada y da la vuelta');
  await p.keyboard.press('ArrowUp');
  ok(await checked(g) === 'pro', 'ArrowUp retrocede saltando la deshabilitada');
  await p.keyboard.press('Home');
  ok(await checked(g) === 'free', 'Inicio va a la primera');
  await p.keyboard.press('End');
  ok(await checked(g) === 'pro', 'Fin va a la última habilitada');
  await g.locator('[value=ent]').click({ force: true });
  ok(await checked(g) === 'pro', 'una opción deshabilitada no se puede elegir');

  // Horizontal: ← → y RTL
  await h.locator('[value=mensual]').focus(); await p.keyboard.press('ArrowRight');
  ok(await checked(h) === 'anual', 'ArrowRight avanza en LTR');
  await p.evaluate(() => { document.getElementById('demo-radios-h').style.direction = 'rtl'; });
  await p.keyboard.press('ArrowRight');
  ok(await checked(h) === 'mensual', 'en RTL ArrowRight retrocede');
  await p.evaluate(() => { document.getElementById('demo-radios-h').style.direction = ''; });

  // Formulario
  const fd = () => p.evaluate(() => Object.fromEntries(new FormData(document.querySelector('#radio-group form'))));
  ok(JSON.stringify(await fd()) === '{"plan":"pro","ciclo":"mensual"}', 'FormData incluye los valores seleccionados');
  await p.evaluate(() => document.getElementById('demo-radios-h').reset());
  ok(await checked(h) === '' && !('ciclo' in await fd()), 'reset() sin valor inicial deja el grupo vacío y fuera del formulario');
  ok(await h.evaluate(e => !e.checkValidity() && e.validationMessage === 'Elige un ciclo.'), 'required: inválido con el mensaje propio');
  ok(await h.evaluate(e => e.validity.valueMissing), 'validity.valueMissing activo');
  ok(await h.evaluate(e => e.hasAttribute('data-invalid')) && await h.locator('.tsl-radio__mark').first().evaluate(e => getComputedStyle(e).borderTopColor) !== await g.locator('.tsl-radio__mark').first().evaluate(e => getComputedStyle(e).borderTopColor), 'tras validar, el grupo vacío muestra el borde de error');
  await h.locator('[value=anual]').click();
  ok(await h.evaluate(e => e.checkValidity() && !e.hasAttribute('data-invalid')), 'al elegir una opción pasa a válido y se quita el borde de error');
  const tabsH = await h.locator('.tsl-radio').evaluateAll(a => a.map(x => x.tabIndex));
  await p.evaluate(() => { const e = document.getElementById('demo-radios-h'); e.value = ''; });
  ok(JSON.stringify(await h.locator('.tsl-radio').evaluateAll(a => a.map(x => x.tabIndex))) === '[0,-1]' && JSON.stringify(tabsH) === '[-1,0]', 'sin selección la primera opción es enfocable');

  // value por código y valor inexistente
  await p.evaluate(() => { document.getElementById('demo-radios').value = 'free'; });
  ok(await checked(g) === 'free' && await g.locator('[value=free]').getAttribute('aria-checked') === 'true', 'asignar value cambia la selección');
  await p.evaluate(() => { document.getElementById('demo-radios').value = 'nada'; });
  ok(await checked(g) === 'free', 'un valor inexistente se ignora');

  // fieldset disabled
  await p.evaluate(() => { const f = document.querySelector('#radio-group form'); const fs = document.createElement('fieldset'); fs.id = 'fs-r'; fs.append(...f.childNodes); f.append(fs); });
  await p.evaluate(() => { document.getElementById('fs-r').disabled = true; });
  await g.locator('[value=pro]').click({ force: true });
  ok(await checked(g) === 'free' && await g.evaluate(e => e.hasAttribute('aria-disabled')), 'fieldset disabled bloquea el grupo');
  await p.evaluate(() => { document.getElementById('fs-r').disabled = false; });
  await g.locator('[value=pro]').click();
  ok(await checked(g) === 'pro', 'al quitar disabled vuelve a funcionar');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
