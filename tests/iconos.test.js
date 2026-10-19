// Iconos: <tsl-icon>, el registro de bibliotecas, su uso en los componentes y la ausencia de emojis.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
const root = path.resolve(__dirname, '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// ---- 1) Sin emojis ni glifos usados como icono en el código, la documentación y la galería ----
// Se admiten flechas y símbolos de teclado (← → ↑ ↓ ⌘ ⇧ ↵ ⌫) porque nombran teclas, y los signos
// tipográficos (— · … ∞ −). Todo lo demás de estos rangos es un icono improvisado.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
const ICON_GLYPHS = /[‹›✕✖✓✔✗✘▶◀▲▼▸◂▾▴►◄❚★☆✦✧⚠☰⌂⚙✉↻↺⌕◐◑◧◎▣◔▤▦●○◌■□◆◇❝❞♡♥♪♫⇅⊘⋮⧉⎘✎⎇]/u;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'js')), ...walk(path.join(root, 'docs')), ...walk(path.join(root, 'css')), 'components.html', 'index.html', 'README.md']
  .map((f) => path.resolve(root, f))
  .filter((f) => /\.(js|css|html|md)$/.test(f) && !f.includes(`${path.sep}icons${path.sep}`));
const hits = [];
files.forEach((f) => fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
  const m = line.match(EMOJI) || line.match(ICON_GLYPHS);
  if (m) hits.push(`${path.relative(root, f)}:${i + 1} «${m[0]}»`);
}));
ok(hits.length === 0, `sin emojis ni glifos de icono en ${files.length} archivos` + (hits.length ? `:\n   - ${hits.slice(0, 15).join('\n   - ')}` : ''));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  // La página no depende de la red para estas pruebas: los CDN de la sección de ejemplo se bloquean
  await p.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');

  // ---- 2) Set base: síncrono, decorativo por defecto, con nombre accesible si lleva label ----
  const r = await p.evaluate(() => {
    const el = document.createElement('tsl-icon');
    el.setAttribute('name', 'search');
    document.body.append(el);
    const svg = el.querySelector('svg');
    const out = {
      sync: !!svg,
      viewBox: svg && svg.getAttribute('viewBox'),
      stroke: svg && svg.getAttribute('stroke'),
      hidden: el.getAttribute('aria-hidden'),
      focusable: svg && svg.getAttribute('focusable'),
      size: getComputedStyle(el).width === getComputedStyle(el).fontSize
    };
    el.setAttribute('label', 'Buscar');
    out.role = el.getAttribute('role');
    out.name = el.getAttribute('aria-label');
    out.hiddenAfter = el.hasAttribute('aria-hidden');
    el.setAttribute('size', 'xl');
    out.xl = getComputedStyle(el).width;
    el.name = 'house';
    out.renamed = el.querySelector('svg').innerHTML !== svg.innerHTML;
    el.remove();
    out.count = TeselaUI.iconNames().length;
    return out;
  });
  ok(r.sync && r.viewBox === '0 0 24 24' && r.stroke === 'currentColor', 'el set base se pinta al instante como SVG de trazo con currentColor');
  ok(r.hidden === 'true' && r.focusable === 'false' && r.size, 'sin label es decorativo (aria-hidden), no enfocable y mide 1em');
  ok(r.role === 'img' && r.name === 'Buscar' && !r.hiddenAfter, 'con label se anuncia como imagen con su nombre');
  ok(r.xl === '24px' && r.renamed, 'size="xl" mide 24 px y cambiar name vuelve a pintarlo');
  ok(r.count >= 180, `el set base trae ${r.count} iconos`);

  // ---- 3) Bibliotecas y SVG propios ----
  const lib = await p.evaluate(async () => {
    const wait = (el, ev) => new Promise((res) => el.addEventListener(ev, () => res(ev), { once: true }));
    // Icono creado antes de registrar su biblioteca: se pinta en cuanto se registra
    const late = document.createElement('tsl-icon');
    late.setAttribute('library', 'propia');
    late.setAttribute('name', 'rombo');
    document.body.append(late);
    const before = late.querySelector('svg');
    const loaded = wait(late, 'tsl-load');
    TeselaUI.registerIconLibrary('propia', {
      resolver: (n) => Promise.resolve(n === 'rombo' ? '<svg viewBox="0 0 10 10"><path d="M5 0 10 5 5 10 0 5Z" onclick="window.__pwned=4"/></svg>' : null),
      mutator: (svg) => svg.setAttribute('fill', 'currentColor')
    });
    await loaded;
    const svg = late.querySelector('svg');
    // Iconos sueltos añadidos al set base
    TeselaUI.registerIcons({ marca: '<circle cx="12" cy="12" r="4"/>' });
    const mine = document.createElement('tsl-icon');
    mine.setAttribute('name', 'marca');
    document.body.append(mine);
    // Nombre inexistente → tsl-error y data-missing
    const bad = document.createElement('tsl-icon');
    bad.setAttribute('library', 'propia');
    bad.setAttribute('name', 'nada');
    const err = wait(bad, 'tsl-error');
    document.body.append(bad);
    await err;
    // Archivo suelto con contenido peligroso: se limpia
    const ext = document.createElement('tsl-icon');
    ext.setAttribute('src', 'tests/fixtures/icono-externo.svg');
    const extLoaded = wait(ext, 'tsl-load');
    document.body.append(ext);
    await extLoaded;
    const esvg = ext.querySelector('svg');
    const out = {
      before: !!before,
      after: !!svg && svg.getAttribute('fill') === 'currentColor' && !svg.querySelector('[onclick]'),
      mine: !!mine.querySelector('circle') && mine.querySelector('svg').getAttribute('stroke') === 'currentColor',
      missing: bad.hasAttribute('data-missing') && !bad.querySelector('svg'),
      clean: !!esvg && !esvg.querySelector('script, title') && !esvg.hasAttribute('onload') && !esvg.hasAttribute('width') && !/javascript:/.test(esvg.outerHTML),
      pwned: window.__pwned || 0,
      presets: Object.keys(TeselaUI.iconLibraries).sort().join(','),
      tabler: TeselaUI.iconLibraries.tabler({ variant: 'filled' }).resolver('heart'),
      phosphor: TeselaUI.iconLibraries.phosphor({ weight: 'bold' }).resolver('rocket'),
      heroMini: TeselaUI.iconLibraries.heroicons({ variant: 'mini' }).resolver('bell'),
      own: TeselaUI.iconLibraries.lucide({ base: '/iconos' }).resolver('x')
    };
    [late, mine, bad, ext].forEach((e) => e.remove());
    TeselaUI.unregisterIconLibrary('propia');
    return out;
  });
  ok(!lib.before && lib.after, 'un icono pedido antes de registrar su biblioteca se pinta al registrarla; el mutator se aplica');
  ok(lib.mine, 'registerIcons añade SVG propios (contenido interior) con los atributos del set base');
  ok(lib.missing, 'un nombre inexistente emite tsl-error y marca data-missing');
  ok(lib.clean && lib.pwned === 0, 'un SVG externo se limpia: sin <script>, <title>, on* ni javascript:, y sin tamaño fijo');
  ok(lib.presets === 'heroicons,lucide,material,phosphor,simple,tabler', 'adaptadores para Lucide, Tabler, Phosphor, Heroicons, Material Symbols y Simple Icons');
  ok(/@tabler\/icons@3\.49\.0\/icons\/filled\/heart\.svg$/.test(lib.tabler) && /assets\/bold\/rocket-bold\.svg$/.test(lib.phosphor) && /heroicons@2\.2\.0\/20\/solid\/bell\.svg$/.test(lib.heroMini), 'los adaptadores construyen rutas con versión fijada y variantes');
  ok(lib.own === '/iconos/x.svg', 'base permite servir los SVG desde un servidor propio');

  // ---- 4) Los componentes usan iconos SVG ----
  const comp = await p.evaluate(() => {
    const close = TeselaUI.toast({ title: 'Prueba', duration: 0 });
    const t = document.querySelector('.tsl-toast:last-child .tsl-toast__close');
    const toast = !!(t && t.querySelector('svg')) && t.textContent.trim() === '';
    close();
    const clear = document.querySelector('tsl-select[clearable] .tsl-trigger__clear');
    const reasoning = document.querySelector('tsl-reasoning .tsl-reasoning__icon svg');
    const sortIcons = [...document.querySelectorAll('tsl-data-table .tsl-dt__sorticon')].every((s) => s.querySelector('svg'));
    return { toast, clear: !clear || !!clear.querySelector('svg'), reasoning: !!reasoning, sortIcons };
  });
  ok(comp.toast && comp.clear, 'el cierre del toast y el botón de limpiar del select son iconos SVG');
  ok(comp.reasoning && comp.sortIcons, 'el razonamiento y el orden de la tabla de datos usan iconos del set base');
  const btn = await p.evaluate(() => {
    const b = document.createElement('button');
    b.innerHTML = '<tsl-icon name="x"></tsl-icon>';
    document.body.append(b);
    const pe = getComputedStyle(b.firstChild).pointerEvents;
    b.remove();
    return pe;
  });
  ok(btn === 'none', 'dentro de un botón el icono no recibe el puntero (el clic llega al botón)');
  const copied = await p.evaluate(async () => {
    const b = document.createElement('button');
    b.setAttribute('data-tsl-copy', 'hola');
    b.setAttribute('aria-label', 'Copiar');
    b.innerHTML = '<tsl-icon name="copy"></tsl-icon>';
    document.body.append(b);
    b.click();
    await new Promise((res) => b.addEventListener('tsl-copy', res, { once: true }));
    const during = b.firstChild.getAttribute('name');
    await new Promise((res) => setTimeout(res, 1400));
    const after = b.firstChild.getAttribute('name');
    b.remove();
    return { during, after };
  });
  ok(copied.during !== 'copy' && copied.after === 'copy', `un botón de copiar con solo icono confirma cambiando el icono (${copied.during}) y lo restaura`);

  // ---- 5) Documentación: la rejilla del set base ----
  await p.evaluate(() => document.getElementById('icon').scrollIntoView());
  const grid = await p.evaluate(() => ({ n: document.querySelectorAll('#demo-icon-grid li').length, total: TeselaUI.iconNames().length }));
  ok(grid.n === r.count, `la documentación muestra los ${r.count} iconos del set base`);
  await p.fill('#demo-icon-filter', 'arrow');
  const shown = await p.evaluate(() => [...document.querySelectorAll('#demo-icon-grid li')].filter((l) => !l.hidden).map((l) => l.firstChild.dataset.name));
  ok(shown.length > 0 && shown.every((n) => n.includes('arrow')), 'el filtro de la rejilla deja solo los que coinciden');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? `: ${errs.slice(0, 3)}` : ''));
  await b.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
