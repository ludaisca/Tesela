// Cascada en capas y alto contraste: el CSS del usuario gana sin !important, y con forced-colors
// (contraste de Windows) el foco, los botones y los controles siguen siendo distinguibles.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const root = path.resolve(__dirname, '..');

(async () => {
  // ---- 1) El bundle va entero en capas, en el orden declarado ----
  const css = fs.readFileSync(path.join(root, 'lib/tesela-ui.css'), 'utf8');
  const body = css.replace(/^\/\*![^\n]*\n/, '');
  ok(body.startsWith('@layer tesela.tokens, tesela.base, tesela.components, tesela.utilities;'), 'tesela-ui.css empieza declarando el orden de las capas');
  // Fuera de los bloques @layer solo queda la declaración del orden
  let depth = 0;
  let outside = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '{') depth++;
    if (depth === 0) outside += ch;
    if (ch === '}') depth--;
  }
  outside = outside.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@layer [^;{]+;/, '').replace(/@layer tesela\.[a-z]+\s*/g, '').trim();
  ok(outside === '', `no queda ninguna regla fuera de una capa tesela.*${outside ? ` (sobra: ${outside.slice(0, 80)})` : ''}`);
  const minCss = fs.readFileSync(path.join(root, 'lib/tesela-ui.min.css'), 'utf8');
  ok(/@layer tesela\.tokens,tesela\.base,tesela\.components,tesela\.utilities;/.test(minCss), 'la versión minificada conserva las capas');

  // ---- 2) !important: solo los que fuerzan un estado que debe ganar siempre ----
  // Sin comentarios (se reemplazan por líneas vacías para conservar la numeración)
  const src = fs.readdirSync(path.join(root, 'src/css')).map((f) => [f, fs.readFileSync(path.join(root, 'src/css', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ''))]);
  const importants = src.flatMap(([f, s]) => s.split('\n').map((l, i) => [f, i + 1, l]).filter(([, , l]) => /!important/.test(l)));
  const allowed = (f, l) => (f === '01-base.css' && /display: none/.test(l)) || (f === '23-animaciones.css') || (f === '03-botones.css' && /color: transparent/.test(l));
  const extra = importants.filter(([f, , l]) => !allowed(f, l));
  ok(importants.length === 6 && extra.length === 0, `!important solo en hidden, popover cerrado, movimiento reducido y botón ocupado (${importants.length})${extra.length ? `; sobran: ${extra.map(([f, n]) => `${f}:${n}`).join(', ')}` : ''}`);

  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(`${base}/tests/fixtures/blank.html`);
  await p.waitForFunction(() => window.TeselaUI);
  await p.evaluate(() => {
    document.getElementById('principal').insertAdjacentHTML('beforeend', `
      <button class="tsl-btn tsl-btn--primary" id="btn">Guardar</button>
      <button class="tsl-btn" id="btn2">Cancelar</button>
      <input class="tsl-input" id="campo" />
      <label class="tsl-choice"><input type="checkbox" class="tsl-check" id="c1" /> Uno</label>
      <label class="tsl-choice"><input type="checkbox" class="tsl-check" id="c2" checked /> Dos</label>
      <input type="checkbox" role="switch" class="tsl-switch" id="s1" />
      <input type="checkbox" role="switch" class="tsl-switch" id="s2" checked />
      <div class="tsl-row" id="fila"><span>a</span></div>
      <span id="ref-highlight" style="background: Highlight; color: Highlight">x</span>
      <span id="ref-canvas" style="background: Canvas">x</span>`);
  });

  // ---- 3) El CSS del usuario sin capa gana sin !important, aunque su selector sea más débil ----
  const before = await p.evaluate(() => getComputedStyle(document.getElementById('btn')).backgroundColor);
  await p.addStyleTag({ content: 'button { background: rgb(1, 2, 3); transition: none; } .tsl-row { gap: 31px; }' });
  const after = await p.evaluate(() => ({ bg: getComputedStyle(document.getElementById('btn')).backgroundColor, gap: getComputedStyle(document.getElementById('fila')).columnGap }));
  ok(before !== 'rgb(1, 2, 3)' && after.bg === 'rgb(1, 2, 3)', `un selector de tipo del usuario (button) gana a .tsl-btn--primary (${before} → ${after.bg})`);
  ok(after.gap === '31px', 'y a las utilidades (.tsl-row)');
  // hidden sigue mandando aunque el usuario defina display
  const hiddenWins = await p.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '.tsl-btn { display: inline-flex; }';
    document.head.appendChild(s);
    const el = document.getElementById('btn2');
    el.hidden = true;
    const d = getComputedStyle(el).display;
    el.hidden = false;
    s.remove();
    return d;
  });
  ok(hiddenWins === 'none', 'el atributo hidden sigue ocultando un componente aunque el usuario le dé display');

  // ---- 4) forced-colors ----
  await p.emulateMedia({ forcedColors: 'active' });
  await p.addStyleTag({ content: '* { transition: none !important; }' });
  await p.waitForTimeout(300);
  const fc = await p.evaluate(() => matchMedia('(forced-colors: active)').matches);
  ok(fc, 'la emulación de forced-colors está activa');
  await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('rgb(1, 2, 3)') && s.remove()));
  await p.keyboard.press('Tab');
  const focus = await p.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { id: el.id, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
  });
  ok(focus.id === 'btn' && focus.style !== 'none' && focus.width >= 2, `el foco de teclado se ve con un contorno real (${focus.style} ${focus.width}px)`);
  for (const id of ['campo', 'c1', 's1']) {
    await p.focus(`#${id}`);
    await p.keyboard.press('Shift+Tab');
    await p.keyboard.press('Tab');
    const st = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    ok(st !== 'none', `#${id} también muestra el contorno de foco (${st})`);
  }
  const look = await p.evaluate(() => {
    const bg = (id) => getComputedStyle(document.getElementById(id)).backgroundColor;
    const bc = (id) => getComputedStyle(document.getElementById(id)).borderTopColor;
    return { hl: bg('ref-highlight'), canvas: bg('ref-canvas'), c1: bg('c1'), c2: bg('c2'), s1: bg('s1'), s2: bg('s2'), btn: bg('btn'), btn2: bg('btn2'), btnBorder: bc('btn2'), canvasBorder: bc('ref-canvas') };
  });
  ok(look.c2 === look.hl && look.c1 !== look.c2, `una casilla marcada se distingue de una vacía (${look.c1} / ${look.c2})`);
  ok(look.s2 === look.hl && look.s1 !== look.s2, `un interruptor activo se distingue de uno apagado (${look.s1} / ${look.s2})`);
  ok(look.btn !== look.btn2, `el botón principal se distingue del secundario (${look.btn} / ${look.btn2})`);
  ok(look.btnBorder !== 'rgba(0, 0, 0, 0)', `los botones tienen borde visible (${look.btnBorder})`);

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
