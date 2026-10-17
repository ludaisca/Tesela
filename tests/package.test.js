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
  // Las rutas de package.json (main, module, types, exports…) apuntan a archivos reales
  const refs = [pkg.main, pkg.module, pkg.types, pkg.customElements, pkg.style];
  const walkExports = (v) => (typeof v === 'string' ? [v] : Object.values(v).flatMap(walkExports));
  walkExports(pkg.exports).forEach(v => refs.push(v));
  const dead = refs.filter(r => !r.includes('*') && !fs.existsSync(path.join(root, r)));
  const globs = refs.filter(r => r.includes('*')).filter(r => { const dir = path.join(root, path.dirname(r)); const ext = path.extname(r); return !fs.existsSync(dir) || !fs.readdirSync(dir).some(f => f.endsWith(ext)); });
  ok(dead.length === 0 && globs.length === 0, `package.json: ${refs.length} rutas (main, module, types, exports…) apuntan a archivos que existen` + (dead.length + globs.length ? ` (rotas: ${[...dead, ...globs]})` : ''));
  ok(pkg.private === true, 'package.json: sigue marcado como private (no se publica por accidente)');
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

  // 3) Ningún elemento pisa miembros nativos de HTMLElement (p. ej. remove(), matches()), salvo con la misma firma
  await p.goto(`${base}/tests/fixtures/esm-index.html`); await p.waitForFunction(() => window.__listo);
  const clashes = await p.evaluate(() => {
    const life = new Set(['constructor', 'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'formResetCallback', 'formDisabledCallback']);
    const out = {};
    ['tsl-tabs', 'tsl-segmented', 'tsl-menu', 'tsl-command', 'tsl-otp', 'tsl-tags', 'tsl-dropzone', 'tsl-calendar', 'tsl-sparkline', 'tsl-popover', 'tsl-hovercard', 'tsl-context-menu', 'tsl-select', 'tsl-combobox', 'tsl-date-picker', 'tsl-time-picker', 'tsl-menubar', 'tsl-nav-menu', 'tsl-slider', 'tsl-rating', 'tsl-color-picker', 'tsl-password', 'tsl-mention', 'tsl-toggle-group', 'tsl-collapsible', 'tsl-scroll-area', 'tsl-resizable', 'tsl-tree', 'tsl-virtual-list', 'tsl-sortable', 'tsl-data-table', 'tsl-chart'].forEach((t) => {
      const bad = [];
      for (let k = customElements.get(t); k && k !== HTMLElement; k = Object.getPrototypeOf(k)) {
        Object.getOwnPropertyNames(k.prototype).forEach((n) => { if (!life.has(n) && n in HTMLElement.prototype) bad.push(n); });
      }
      if (bad.length) out[t] = [...new Set(bad)];
    });
    return out;
  });
  // scrollTo de <tsl-scroll-area> conserva la firma nativa y reenvía al área desplazable
  const allowed = { 'tsl-scroll-area': ['scrollTo'] };
  const real = Object.fromEntries(Object.entries(clashes).map(([t, ns]) => [t, ns.filter((n) => !(allowed[t] || []).includes(n))]).filter(([, ns]) => ns.length));
  ok(Object.keys(real).length === 0, 'los 32 elementos no sobrescriben miembros nativos de HTMLElement' + (Object.keys(real).length ? `: ${JSON.stringify(real)}` : ''));
  const natives = await p.evaluate(async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sel = document.createElement('tsl-select');
    sel.innerHTML = '<option value="a">A</option>';
    const tags = document.createElement('tsl-tags');
    tags.setAttribute('value', 'uno,dos');
    const area = document.createElement('tsl-scroll-area');
    area.style.cssText = 'height:40px;display:block';
    area.innerHTML = '<div style="height:400px">alto</div>';
    host.append(sel, tags, area);
    await new Promise((r) => setTimeout(r, 80));
    const r = {};
    r.matches = sel.matches('tsl-select');
    sel.disabled = true; await new Promise((x) => setTimeout(x, 30));
    r.disabledProp = sel.querySelector('.tsl-trigger').disabled && sel.hasAttribute('disabled');
    sel.disabled = false; await new Promise((x) => setTimeout(x, 30));
    r.enabledAgain = !sel.querySelector('.tsl-trigger').disabled;
    tags.addTag('tres', true);
    r.tags = tags.value.join(',');
    tags.removeTag('uno', true);
    r.tagsAfter = tags.value.join(',');
    area.scrollTo(0, 60); area.scrollTo({ top: 90 });
    r.scrolled = area.querySelector('.tsl-scroll-area__viewport').scrollTop;
    tags.remove();
    r.removedFromDom = !tags.isConnected;
    host.remove();
    return r;
  });
  ok(natives.matches === true, 'select.matches(selector) mantiene su comportamiento nativo');
  ok(natives.removedFromDom === true, 'tags.remove() vuelve a quitar el elemento del DOM');
  ok(natives.tags === 'uno,dos,tres' && natives.tagsAfter === 'dos,tres', 'tags.addTag()/removeTag() añaden y quitan etiquetas');
  ok(natives.scrolled === 90, 'scroll-area.scrollTo(x, y) y scrollTo({ top }) llegan al área desplazable (' + natives.scrolled + ')');
  ok(natives.disabledProp === true && natives.enabledAgain === true, 'la propiedad disabled de los campos refleja el atributo y deshabilita/habilita el control');

  // 4) El bundle IIFE minificado equivale al normal
  await p.goto(`${base}/tests/fixtures/esm-tabs.html`);
  const tags = await p.evaluate(async (u) => { const r = await fetch(u); return (await r.text()).match(/define\("tsl-[a-z-]+"/g)?.length || (await (await fetch(u)).text()).match(/"tsl-[a-z-]+"/g)?.length; }, `${base}/lib/tesela-ui.min.js`);
  ok(tags >= 30, `el bundle minificado define los elementos (${tags} registros)`);
  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
