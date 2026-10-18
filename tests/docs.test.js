// Documentación: la pestaña «API» se genera desde lib/custom-elements.json en cada componente.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/custom-elements.json'), 'utf8'));
  const decls = manifest.modules.flatMap(m => m.declarations).filter(d => d.tagName);
  const sections = [...new Set(decls.flatMap(d => d['x-docs'] || []))];

  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto((process.env.BASE_URL || 'http://localhost:24100') + '/components.html'); await p.waitForLoadState('networkidle');

  const missing = [];
  for (const id of sections) {
    const has = await p.locator(`#${id} .tsl-segmented__item[value=api]`).count();
    if (!has) missing.push(id);
  }
  ok(missing.length === 0, `las ${sections.length} secciones de componentes tienen pestaña «API»` + (missing.length ? ` (faltan: ${missing})` : ''));
  ok((await p.locator('#button .tsl-segmented__item[value=api]').count()) === 0 && (await p.locator('#card .tsl-segmented__item[value=api]').count()) === 0, 'las secciones que no son un elemento (botón, tarjeta) no tienen pestaña «API»');

  await p.locator('#select-custom').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.locator('#select-custom .tsl-segmented__item[value=api]').click();
  const pane = p.locator('#select-custom .doc-apipane');
  ok(await pane.isVisible() && !(await p.locator('#select-custom .doc-demo').isVisible()), 'API: se muestra el panel y se oculta la vista previa');
  ok(!(await p.locator('#select-custom [data-doc-copy]').isVisible()), 'API: el botón «Copiar» se oculta');
  const titles = await pane.locator('h4').allInnerTexts();
  ok(['ATRIBUTOS', 'PROPIEDADES', 'MÉTODOS', 'EVENTOS'].every(t => titles.map(x => x.toUpperCase()).includes(t)), `API: grupos de tsl-select (${titles.join(', ')})`);
  ok(await pane.locator('td.doc-api__name code', { hasText: 'multiple' }).count() === 1 && await pane.locator('td.doc-api__name code', { hasText: 'tsl-change' }).count() === 1, 'API: lista el atributo multiple y el evento tsl-change');
  ok((await pane.locator('td code', { hasText: 'setOptions(options:' }).count()) === 1, 'API: los métodos muestran su firma con tipos');
  ok((await pane.locator('td code', { hasText: 'readonly boolean' }).count()) >= 1, 'API: las propiedades de solo lectura se marcan');
  ok((await pane.locator('td:last-child code').count()) > 5, 'API: las descripciones con `código` se convierten en <code>');
  ok((await pane.locator('td').evaluateAll(tds => tds.every(td => !td.querySelector('script, img, iframe')))), 'API: el texto se inserta como texto, sin interpretar HTML');
  await p.locator('#select-custom .tsl-segmented__item[value=preview]').click();
  ok(await p.locator('#select-custom .doc-demo').isVisible() && !(await pane.isVisible()) && await p.locator('#select-custom [data-doc-copy]').isVisible(), 'API: volver a «Vista previa» restaura la demo y el botón');

  await p.locator('#stat').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.locator('#stat .tsl-segmented__item[value=api]').click();
  ok((await p.locator('#stat .doc-apipane h4', { hasText: /Propiedades CSS/i }).count()) === 1, 'API: tsl-sparkline documenta sus propiedades CSS (--w, --h)');
  await p.locator('#combobox').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.locator('#combobox .tsl-segmented__item[value=api]').click();
  ok((await p.locator('#combobox .doc-apipane').innerText()).includes('Sin atributos propios'), 'API: un elemento sin API propia lo indica (tsl-combobox)');

  await p.locator('#date-range').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.locator('#date-range .tsl-segmented__item[value=api]').click();
  ok((await p.locator('#date-range .doc-apipane code', { hasText: 'tsl-date-picker' }).count()) >= 1, 'API: una misma etiqueta puede documentarse en varias secciones (fecha y rango)');

  // ---------- Temas y presets ----------
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForLoadState('networkidle');
  await p.locator('#themes').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  ok((await p.locator('#docs-presets .docs-preset').count()) === 11, 'temas: una tarjeta por cada uno de los 11 presets');
  const samples = await p.locator('#docs-presets .docs-preset__sample').evaluateAll(els => els.map(e => ({ preset: e.dataset.preset, bg: getComputedStyle(e).backgroundColor, accent: getComputedStyle(e.querySelector('.sample-btn')).backgroundColor })));
  ok(new Set(samples.map(x => x.accent)).size === 11 && new Set(samples.map(x => x.bg)).size >= 4, `temas: cada muestra aplica su propio preset dentro de la tarjeta (${new Set(samples.map(x => x.accent)).size} acentos y ${new Set(samples.map(x => x.bg)).size} fondos distintos)`);
  ok((await p.locator('#docs-presets .docs-preset[aria-pressed=true]').getAttribute('data-tsl-preset')) === 'tesela', 'temas: el preset activo por defecto es «tesela»');
  await p.locator('#docs-presets .docs-preset[data-tsl-preset=medianoche]').click();
  ok((await p.evaluate(() => document.documentElement.getAttribute('data-preset'))) === 'medianoche' && (await p.locator('#docs-presets .docs-preset[aria-pressed=true]').getAttribute('data-tsl-preset')) === 'medianoche', 'temas: pulsar una tarjeta aplica el preset a toda la página');
  ok((await p.evaluate(() => document.getElementById('docs-preset').value)) === 'medianoche', 'temas: el selector del panel lateral refleja el preset elegido');
  await p.locator('#docs-theme-inline .tsl-segmented__item[value=light]').click();
  ok((await p.evaluate(() => document.getElementById('docs-theme').value)) === 'light' && (await p.locator('#docs-presets .docs-preset__sample').first().getAttribute('data-theme')) === 'light', 'temas: el tema de la sección y el del panel lateral van juntos, y las muestras siguen el modo');

  // Comprobador de contraste: los 11 presets cumplen en claro y oscuro (también el cálculo en vivo coincide con las reglas)
  const names = await p.locator('#docs-presets .docs-preset').evaluateAll(els => els.map(e => e.dataset.tslPreset));
  const rowsPerCase = [];
  const failing = [];
  for (const name of names) {
    for (const theme of ['dark', 'light']) {
      await p.evaluate(([n, t]) => { TeselaUI.setPreset(n); TeselaUI.setTheme(t); }, [name, theme]);
      rowsPerCase.push(await p.locator('#docs-contrast tbody tr').count());
      const bad = await p.locator('#docs-contrast .tsl-badge--danger').count();
      if (bad) failing.push(`${name}/${theme}: ${bad}`);
    }
  }
  ok(rowsPerCase.every(n => n === 10) && failing.length === 0, `contraste en vivo: los ${names.length} presets cumplen los 10 pares en oscuro y en claro (${rowsPerCase.length} casos)` + (failing.length ? ` (fallan: ${failing})` : ''));
  await p.evaluate(() => { TeselaUI.setPreset('alto-contraste'); TeselaUI.setTheme('dark'); });
  const levels = await p.locator('#docs-contrast tbody tr td:last-child').allInnerTexts();
  ok(levels.filter(l => l.startsWith('AAA')).length >= 9, 'contraste en vivo: «alto-contraste» marca AAA en casi todos los pares (' + levels.filter(l => l.startsWith('AAA')).length + ' de 10)');

  // Acentos del panel: setAccent elige un texto legible, así que el botón de acento cumple siempre
  await p.evaluate(() => { TeselaUI.setPreset('tesela'); TeselaUI.setTheme('dark'); });
  const accentRows = [];
  for (const hex of ['#6365f0', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#a855f7']) {
    await p.locator(`.docs-swatch[data-accent="${hex}"]`).click();
    const row = p.locator('#docs-contrast tbody tr', { hasText: 'Texto del acento' });
    accentRows.push([hex, await row.locator('.tsl-badge').getAttribute('class')]);
  }
  ok(accentRows.every(([, c]) => c.includes('tsl-badge--success')), 'acentos del panel: el texto sobre el botón de acento cumple AA con cada uno de los 6 colores');
  ok((await p.locator('.docs-swatch[aria-pressed=true]').getAttribute('data-accent')) === '#a855f7', 'acentos del panel: se marca el último elegido');
  await p.locator('#docs-reset').click();
  const reset = await p.evaluate(() => ({ preset: TeselaUI.getPreset(), theme: TeselaUI.getTheme(), accent: document.documentElement.style.getPropertyValue('--tsl-accent'), pressed: document.querySelectorAll('.docs-swatch[aria-pressed=true]').length }));
  ok(reset.preset === 'tesela' && reset.theme === 'dark' && reset.accent === '' && reset.pressed === 0, '«Restablecer»: vuelve al preset y tema por defecto y quita el acento');

  await p.screenshot({ path: path.join(require('os').tmpdir(), 'tesela-api.png') });
  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
