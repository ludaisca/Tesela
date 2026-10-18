// Diseño adaptable: sin desbordes en 15 tamaños, los 212 experimentos en móvil, paneles flotantes dentro de la
// pantalla, objetivos táctiles cómodos y que el ratón no cambie de aspecto.
const { chromium } = require('playwright');
const { measurePage, measureStage } = require('../scripts/lib/responsive-measure');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const base = process.env.BASE_URL || 'http://localhost:24100';

const SIZES = [[320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [600, 900], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440], [667, 375], [812, 375]];
const touch = (w) => w < 900;

(async () => {
  const b = await chromium.launch();
  const newPage = async (w, h, forceTouch) => {
    const t = forceTouch !== undefined ? forceTouch : touch(w);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: t, isMobile: t });
    const p = await ctx.newPage();
    p.__errs = [];
    p.on('pageerror', e => p.__errs.push(String(e)));
    return p;
  };

  // ============ 1) Páginas completas: sin desborde horizontal en ningún tamaño ============
  for (const page of ['components.html', 'index.html']) {
    const problems = [];
    for (const [w, h] of SIZES) {
      const p = await newPage(w, h);
      await p.goto(`${base}/${page}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(250);
      const m = await p.evaluate(measurePage);
      if (m.scrollW > m.vw + 1 || m.offenders.length) problems.push(`${w}×${h}: ancho ${m.scrollW}/${m.vw}${m.offenders[0] ? ` · ${m.offenders[0].el}` : ''}`);
      await p.context().close();
    }
    ok(problems.length === 0, `${page}: sin desborde horizontal en ${SIZES.length} tamaños (320 a 2560 px, vertical y horizontal)` + (problems.length ? `:\n   - ${problems.slice(0, 5).join('\n   - ')}` : ''));
  }

  // ============ 2) Los 212 experimentos en móvil ============
  for (const [w, h] of [[320, 568], [375, 667], [667, 375]]) {
    const p = await newPage(w, h);
    await p.goto(`${base}/index.html`); await p.waitForLoadState('networkidle');
    const paths = await p.evaluate(() => window.TESELA_FLAT_ITEMS.map(i => i.path));
    const bad = [];
    for (const path of paths) {
      await p.evaluate(x => { location.hash = '#' + x; }, path);
      await p.waitForTimeout(25);
      const m = await p.evaluate(measureStage);
      if (m.over || m.offenders.length || m.squeezed.length || m.small.length) bad.push(`${path.split('/').slice(2).join('/')} (${m.over || m.offenders.length ? 'desborda' : m.squeezed.length ? 'texto aplastado' : 'objetivo pequeño'})`);
    }
    ok(paths.length === 212 && bad.length === 0, `galería a ${w}×${h}: los ${paths.length} experimentos sin desborde, sin texto aplastado y con objetivos táctiles ≥ 24 px` + (bad.length ? ` (fallan ${bad.length}: ${bad.slice(0, 6).join(', ')})` : ''));
    ok(p.__errs.length === 0, `galería a ${w}×${h}: sin errores de página`);
    await p.context().close();
  }

  // ============ 3) Paneles flotantes: siempre dentro de la pantalla ============
  const dentro = async (p, sel, nombre, problems) => {
    const r = await p.evaluate((s) => {
      const el = [...document.querySelectorAll(s)].find(e => { const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && e.getBoundingClientRect().width > 0; });
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, vw: document.documentElement.clientWidth, vh: window.innerHeight, scrolls: el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(cs.overflowY) };
    }, sel);
    if (!r) { problems.push(`${nombre}: no se abrió`); return; }
    const okH = r.l >= -0.5 && r.r <= r.vw + 0.5;
    const okV = r.t >= -0.5 && (r.b <= r.vh + 0.5 || (r.scrolls && r.t + 1 >= 0 && r.b - r.t <= r.vh + 1));
    if (!okH || !okV) problems.push(`${nombre}: [${Math.round(r.l)},${Math.round(r.t)}]→[${Math.round(r.r)},${Math.round(r.b)}] en ${r.vw}×${r.vh}`);
  };
  const go = async (p, id) => { await p.evaluate(i => document.getElementById(i).scrollIntoView({ behavior: 'instant', block: 'center' }), id); await p.waitForTimeout(150); };

  for (const [w, h] of [[320, 568], [375, 667], [667, 375], [768, 1024]]) {
    const p = await newPage(w, h);
    await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(300);
    const problems = [];
    const step = async (nombre, sec, open, sel, close) => {
      try {
        await go(p, sec); await open(); await p.waitForTimeout(260);
        await dentro(p, sel, nombre, problems);
      } catch (e) { problems.push(`${nombre}: ${String(e.message).split('\n')[0]}`); }
      try { await (close || (() => p.keyboard.press('Escape')))(); } catch (_) {}
      await p.waitForTimeout(120);
    };
    await step('popover', 'popover', () => p.locator('#popover [data-tsl-trigger]').click(), '#popover .tsl-popover__panel');
    await step('hover card', 'hovercard', async () => { await p.locator('#hovercard [data-tsl-trigger]').focus(); await p.waitForTimeout(500); }, '#hovercard .tsl-popover__panel');
    await step('menú contextual', 'context-menu', async () => { const bb = await p.locator('#context-menu .tsl-context-zone').boundingBox(); await p.mouse.click(bb.x + bb.width - 4, bb.y + bb.height - 4, { button: 'right' }); }, '#context-menu .tsl-menu__list');
    await step('select', 'select-custom', () => p.locator('#select-custom tsl-select[name=pais] .tsl-trigger').click(), '#select-custom .tsl-select__panel');
    await step('select múltiple', 'select-custom', () => p.locator('#select-custom tsl-select[name=equipos] .tsl-trigger').click(), '#select-custom .tsl-select__panel');
    await step('combobox', 'combobox', () => p.locator('#combobox tsl-combobox[name=fw] input').click(), '#combobox .tsl-select__panel');
    await step('selector de fecha', 'date-picker', () => p.locator('#date-picker tsl-date-picker[name=entrega] .tsl-trigger').click(), '#date-picker .tsl-date__panel');
    await step('rango de fechas (2 meses)', 'date-range', () => p.locator('#demo-daterange .tsl-trigger').click(), '#demo-daterange .tsl-date__panel');
    await step('selector de hora', 'time-picker', () => p.locator('#time-picker tsl-time-picker[name=inicio] .tsl-trigger').click(), '#time-picker .tsl-time__panel');
    await step('selector de color', 'color-picker', () => p.locator('#demo-color .tsl-trigger').click(), '#demo-color .tsl-color__panel');
    await step('menú de barra', 'menubar', () => p.locator('#demo-menubar .tsl-bar__item:nth-child(1) > [data-tsl-trigger]').click(), '#demo-menubar .tsl-bar__item:nth-child(1) > .tsl-menu__list');
    await step('submenú', 'menubar', async () => { await p.locator('#demo-menubar .tsl-bar__item:nth-child(1) > [data-tsl-trigger]').click(); await p.locator('#demo-menubar [data-submenu]').click(); }, '#demo-menubar .tsl-menu__sub > .tsl-menu__list');
    await step('menú de navegación', 'nav-menu', () => p.locator('#nav-menu .tsl-bar__item:nth-child(1) > [data-tsl-trigger]').click(), '#nav-menu .tsl-bar__panel');
    await step('menú de columnas de la tabla', 'data-table', () => p.locator('#demo-dt .tsl-dt__toolbar tsl-popover [data-tsl-trigger]').click(), '#demo-dt .tsl-dt__colmenu');
    await step('menciones', 'mention', async () => { await p.locator('#demo-mention textarea').click(); await p.keyboard.type('@'); }, '#demo-mention .tsl-mention__panel');
    await step('confirmación', 'alert-dialog', () => p.locator('#demo-confirm-del').click(), 'dialog[role=alertdialog]');
    await step('sheet', 'sheet', () => p.getByRole('button', { name: 'Abrir sheet' }).click(), '#demo-sheet');
    await step('drawer izquierdo', 'sheet', () => p.getByRole('button', { name: 'Drawer izquierdo' }).click(), '#demo-drawer-start');
    await step('paleta de comandos', 'install', () => p.locator('.docs-topbar [data-tsl-open="docs-cmd"]').click(), 'tsl-command dialog[open]');
    await step('avisos (toasts)', 'toast', () => p.evaluate(() => { TeselaUI.toast({ title: 'Cambios guardados correctamente en el proyecto', description: 'Una descripción larga para comprobar que el aviso cabe en pantallas muy estrechas sin desbordar.', action: { label: 'Deshacer' }, duration: 0 }); TeselaUI.toast({ title: 'Segundo aviso', variant: 'info', duration: 0 }); }), '.tsl-toast', () => p.evaluate(() => document.querySelectorAll('.tsl-toast__close').forEach(c => c.click())));
    ok(problems.length === 0, `paneles flotantes a ${w}×${h}: los 20 caben en la pantalla (o se desplazan por dentro)` + (problems.length ? `:\n   - ${problems.slice(0, 6).join('\n   - ')}` : ''));
    ok(p.__errs.length === 0, `paneles flotantes a ${w}×${h}: sin errores de página`);
    await p.context().close();
  }

  // ============ 4) Objetivos táctiles cómodos con el dedo; el ratón conserva su aspecto ============
  const sizesOf = (p) => p.evaluate(() => {
    const h = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    const w = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().width) : null; };
    return { btn: h('#button .tsl-btn:not(.tsl-btn--sm):not(.tsl-btn--lg)'), btnSm: h('#button .tsl-btn--sm'), input: h('#input .tsl-input'), check: w('#checkbox .tsl-check'), sw: w('#switch .tsl-switch'), tab: h('#tabs .tsl-tabs__tab'), chip: h('#chip .tsl-chip') };
  });
  const tp = await newPage(375, 667, true);
  await tp.goto(`${base}/components.html`); await tp.waitForLoadState('networkidle');
  const coarse = await tp.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const ts = await sizesOf(tp);
  ok(coarse && ts.btn >= 40 && ts.btnSm >= 36 && ts.input >= 40 && ts.check >= 24 && ts.sw >= 44 && ts.tab >= 40 && ts.chip >= 34, `táctil (pointer: coarse): botón ${ts.btn}px, botón pequeño ${ts.btnSm}px, campo ${ts.input}px, casilla ${ts.check}px, interruptor ${ts.sw}px, pestaña ${ts.tab}px, chip ${ts.chip}px`);
  await tp.context().close();
  const mp = await newPage(1280, 800, false);
  await mp.goto(`${base}/components.html`); await mp.waitForLoadState('networkidle');
  const ms = await sizesOf(mp);
  ok(ms.btn === 32 && ms.btnSm === 26 && ms.input === 34 && ms.check === 16 && ms.sw === 36, `ratón (pointer: fine): el tamaño de siempre — botón ${ms.btn}px, pequeño ${ms.btnSm}px, campo ${ms.input}px, casilla ${ms.check}px, interruptor ${ms.sw}px`);
  await mp.context().close();

  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
