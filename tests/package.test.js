// Empaquetado: lib/ está al día con src/, y los módulos ESM funcionan por separado.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const root = path.resolve(__dirname, '..');
const walk = (d, base = d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), base) : [path.relative(base, path.join(d, e.name))]).sort();

(async () => {
  // 1) Compilar en un directorio temporal y comparar con lib/ (los artefactos versionados no pueden quedar desfasados)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tesela-build-'));
  execFileSync(process.execPath, [path.join(root, 'scripts/build.js'), '--out', tmp], { stdio: 'pipe' });
  const built = walk(tmp), committed = walk(path.join(root, 'lib'));
  ok(JSON.stringify(built) === JSON.stringify(committed), `lib/ contiene exactamente los ${built.length} archivos que genera la compilación` + (JSON.stringify(built) === JSON.stringify(committed) ? '' : ` (distintos: ${built.filter(f => !committed.includes(f)).concat(committed.filter(f => !built.includes(f))).slice(0, 5)})`));
  // Los .map llevan rutas relativas al directorio de salida: solo se comprueba que existan
  const stale = built.filter(f => !f.endsWith('.map') && committed.includes(f) && !fs.readFileSync(path.join(tmp, f)).equals(fs.readFileSync(path.join(root, 'lib', f))));
  ok(stale.length === 0, 'lib/ está al día con src/ (ejecuta `npm run build` si falla)' + (stale.length ? `: desfasados ${stale.slice(0, 4)}` : ''));
  fs.rmSync(tmp, { recursive: true, force: true });

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const banner = fs.readFileSync(path.join(root, 'lib/tesela-ui.js'), 'utf8').split('\n')[0];
  ok(banner.includes(`v${pkg.version}`), `la versión del bundle coincide con package.json (${pkg.version})`);
  const min = fs.statSync(path.join(root, 'lib/tesela-ui.min.js')).size, full = fs.statSync(path.join(root, 'lib/tesela-ui.js')).size;
  ok(min < full * 0.75, `el bundle minificado es mucho menor (${(min / 1024).toFixed(0)} KB frente a ${(full / 1024).toFixed(0)} KB)`);
  const cssFiles = fs.readdirSync(path.join(root, 'lib/css')).length;
  ok(cssFiles >= 30, `hay una hoja CSS por sección (${cssFiles})`);
  const parts = fs.readdirSync(path.join(root, 'lib/css')).sort().map(f => fs.readFileSync(path.join(root, 'lib/css', f), 'utf8').trim()).join('\n\n');
  const whole = fs.readFileSync(path.join(root, 'lib/tesela-ui.css'), 'utf8');
  ok(whole.replace(/^\/\*![^\n]*\n/, '').trim() === parts, 'las hojas por sección reconstruyen el CSS completo');

  // 2) Módulos ESM en un navegador real
  const base = process.env.BASE_URL || 'http://localhost:24100';
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));

  await p.goto(`${base}/tests/fixtures/esm-tabs.html`); await p.waitForFunction(() => window.__listo);
  ok(await p.evaluate(() => !!customElements.get('tsl-tabs')), 'ESM: importar components/tabs.mjs registra <tsl-tabs>');
  ok(await p.evaluate(() => !customElements.get('tsl-select') && !customElements.get('tsl-chart') && typeof window.TeselaUI === 'undefined'), 'ESM: un componente suelto no registra los demás ni crea el global');
  await p.locator('#t .tsl-tabs__tab').nth(1).click();
  ok((await p.locator('#t [data-panel=b]').isVisible()) && !(await p.locator('#t [data-panel=a]').isVisible()), 'ESM: <tsl-tabs> funciona de forma independiente');
  ok((await p.locator('#s').evaluate(e => e.children.length)) === 1, 'ESM: el elemento no importado queda sin actualizar (<tsl-select>)');
  const chunks = await p.evaluate(() => performance.getEntriesByType('resource').map(r => r.name).filter(n => n.includes('/esm/')));
  ok(chunks.length <= 4, `ESM: la página de tabs descarga pocos módulos (${chunks.length}) en vez del bundle completo`);

  await p.goto(`${base}/tests/fixtures/esm-index.html`); await p.waitForFunction(() => window.__listo);
  const api = await p.evaluate(() => window.__api);
  ok(api.VERSION === pkg.version && api.toast === 'function' && api.confirm === 'function' && api.position === 'function' && api.global === 'object', 'ESM: index.mjs exporta la API y registra window.TeselaUI');
  ok(await p.evaluate(() => ['tsl-select', 'tsl-data-table', 'tsl-chart', 'tsl-tree', 'tsl-menubar', 'tsl-nav-menu', 'tsl-combobox'].every(t => customElements.get(t))), 'ESM: index.mjs registra todos los elementos');
  await p.locator('#s .tsl-trigger').click();
  ok(await p.locator('#s .tsl-select__panel').isVisible(), 'ESM: <tsl-select> funciona desde el índice completo');

  // 3) El bundle IIFE minificado equivale al normal
  await p.goto(`${base}/tests/fixtures/esm-tabs.html`);
  const tags = await p.evaluate(async (u) => { const r = await fetch(u); return (await r.text()).match(/define\("tsl-[a-z-]+"/g)?.length || (await (await fetch(u)).text()).match(/"tsl-[a-z-]+"/g)?.length; }, `${base}/lib/tesela-ui.min.js`);
  ok(tags >= 30, `el bundle minificado define los elementos (${tags} registros)`);
  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
