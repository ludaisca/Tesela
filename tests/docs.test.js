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

  await p.screenshot({ path: path.join(require('os').tmpdir(), 'tesela-api.png') });
  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
