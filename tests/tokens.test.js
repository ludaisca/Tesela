// Tokens y temas: fuente única en JSON, contraste de los presets, archivos exportados, modos, presets y API.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const T = require('../scripts/lib/tokens').load();
const { check } = require('../scripts/lib/contrast-rules');
const { contrast, parse } = require('../scripts/lib/color');

(async () => {
  // ================= Node: fuente, contraste y archivos exportados =================
  const vars = T.tokens.map(t => t.cssVar);
  ok(T.tokens.length === 37 && new Set(vars).size === 37 && vars.every(v => /^--tsl-[a-z0-9-]+$/.test(v)), `tokens.json: ${T.tokens.length} tokens con nombre de variable único`);
  ok(T.tokens.every(t => t.type && t.dark && t.description) && T.tokens.every(t => /^\{[a-z-]+\.[a-z0-9-]+\}$/.test(t.dark) ? T.byPath.has(t.dark.slice(1, -1)) : true), 'tokens.json: cada token tiene tipo, valor y descripción; los alias apuntan a tokens que existen');
  const presetNames = Object.keys(T.presets);
  const unknownKeys = presetNames.flatMap(n => ['common', 'dark', 'light'].flatMap(m => Object.keys(T.presets[n][m] || {}).filter(k => !T.byPath.has(k)).map(k => `${n}.${m}.${k}`)));
  ok(unknownKeys.length === 0 && presetNames[0] === 'tesela' && presetNames.length === 11, `presets.json: ${presetNames.length} presets y todas sus claves son tokens reales` + (unknownKeys.length ? ` (desconocidas: ${unknownKeys})` : ''));

  const rules = check(T);
  const bad = rules.filter(r => !r.ok);
  ok(bad.length === 0, `contraste WCAG: los ${presetNames.length} presets × 2 modos cumplen las ${rules.length} reglas (texto AAA, atenuado AA, acento, insignias)` + (bad.length ? `:\n   - ${bad.slice(0, 6).map(b => `${b.preset}/${b.mode}: ${b.label} ${b.ratio.toFixed(2)} < ${b.min}`).join('\n   - ')}` : ''));
  const hc = rules.filter(r => r.preset === 'alto-contraste' && r.rule !== 'accentUi');
  ok(hc.every(r => r.min >= 7 || r.rule === 'subtle' || r.rule === 'accentUi') && Math.min(...hc.map(r => r.ratio)) >= 7, 'el preset «alto-contraste» alcanza AAA (7:1) en todo el texto');

  // Variables --tsl-* que usa el código: o son tokens o son locales de un componente
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  const LOCAL = new Set(['--tsl-mx', '--tsl-my', '--tsl-fill', '--tsl-fade-t', '--tsl-fade-b', '--tsl-fade-l', '--tsl-fade-r', '--tsl-chart-', '--tsl-sidebar-width', '--tsl-sidebar-rail', '--tsl-per-view', '--tsl-start', '--tsl-q-progress', '--tsl-icon-size', '--tsl-icon-stroke']);
  const used = new Set();
  [...walk(path.join(root, 'src')), path.join(root, 'components.html'), ...walk(path.join(root, 'docs'))].filter(f => /\.(css|js|html)$/.test(f) && !f.includes(`${path.sep}tokens${path.sep}`)).forEach(f => [...fs.readFileSync(f, 'utf8').matchAll(/var\((--tsl-[a-z0-9-]+)/g)].forEach(m => used.add(m[1])));
  const unknownVars = [...used].filter(v => !vars.includes(v) && !LOCAL.has(v) && !v.startsWith('--tsl-svg-'));
  ok(unknownVars.length === 0, 'todas las variables --tsl-* que usa el código existen como token o son locales de un componente' + (unknownVars.length ? ` (desconocidas: ${unknownVars})` : ''));

  const tokensCss = read('lib/tokens/tokens.css');
  const unlayer = (css) => css.replace(/^@layer [^;]+;\n@layer tesela\.tokens \{\n/, '').replace(/\n\}\s*$/, '');
  ok(unlayer(read('lib/css/00-tokens.css').trim()) === tokensCss.trim() && vars.every(v => tokensCss.includes(`${v}:`)), 'tokens.css coincide con la parte 00-tokens.css del bundle y declara los 37 tokens');
  const mjs = await import(pathToFileURL(path.join(root, 'lib/tokens/tokens.mjs')).href);
  const keyOf = (t) => t.cssVar.replace(/^--tsl-/, '');
  const dark = T.resolve('dark'), light = T.resolve('light');
  ok(T.tokens.every(t => mjs.tokens.dark[keyOf(t)] === dark[t.path] && mjs.tokens.light[keyOf(t)] === light[t.path] && mjs.tokens.names[keyOf(t)] === t.cssVar && mjs.tokens.vars[keyOf(t)] === `var(${t.cssVar})`), 'tokens.mjs: valores oscuro/claro, nombres y var() coinciden con la fuente (alias resueltos)');
  ok(Object.keys(mjs.presets).length === 11 && mjs.presets.esmeralda.dark.accent === T.presets.esmeralda.dark['color.accent'], 'tokens.mjs: exporta los presets con las claves cortas');
  const dmts = read('lib/tokens/tokens.d.mts');
  ok(T.tokens.every(t => dmts.includes(`"${keyOf(t)}"`)) && presetNames.every(n => dmts.includes(`"${n}"`)), 'tokens.d.mts: tipa los 37 tokens y los 11 presets');
  const scss = read('lib/tokens/tokens.scss');
  ok(T.tokens.every(t => scss.includes(`$tsl-${keyOf(t)}: var(${t.cssVar});`)) && scss.includes('$tsl-presets:') && scss.includes('$tsl-tokens-light:'), 'tokens.scss: una variable por token que apunta a su propiedad CSS, más los mapas por modo y los presets');
  const tw = require(path.join(root, 'lib/tokens/tailwind.preset.cjs'));
  const twVars = JSON.stringify(tw).match(/var\((--tsl-[a-z0-9-]+)\)/g).map(s => s.slice(4, -1));
  ok(twVars.every(v => vars.includes(v)) && Object.keys(tw.theme.extend.colors.tsl).length === T.tokens.filter(t => t.group === 'color').length, 'preset de Tailwind: solo referencia tokens que existen y cubre todos los colores');
  ok(Object.keys(T.presets).filter(n => n !== 'tesela').every(n => fs.existsSync(path.join(root, `lib/themes/${n}.css`))) && read('lib/css/24-presets.css').includes('data-preset="esmeralda"'), 'lib/themes/: un CSS por preset (y todos incluidos en el bundle)');
  JSON.parse(read('lib/tokens/tokens.json')); JSON.parse(read('lib/tokens/presets.json'));

  // ================= Navegador =================
  const base = process.env.BASE_URL || 'http://localhost:24100';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');

  // Valores esperados (texto CSS) de cada token para un modo y un conjunto de cambios
  // El navegador devuelve las propiedades personalizadas con los var() ya sustituidos: se hace lo mismo aquí
  const expected = (mode, ov = {}) => {
    const raw = Object.fromEntries(T.tokens.map(t => [t.cssVar, T.css(ov[t.path] !== undefined ? ov[t.path] : mode === 'light' && t.light !== undefined ? t.light : t.dark)]));
    const subst = (v, depth = 0) => (depth > 5 ? v : v.replace(/var\((--tsl-[a-z0-9-]+)\)/g, (_, name) => subst(raw[name], depth + 1)));
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, subst(v)]));
  };
  const computed = (attrs, scheme) => p.evaluate(({ attrs, vars }) => {
    const r = document.documentElement;
    ['data-theme', 'data-preset'].forEach(a => (attrs[a] ? r.setAttribute(a, attrs[a]) : r.removeAttribute(a)));
    const cs = getComputedStyle(r);
    return Object.fromEntries(vars.map(v => [v, cs.getPropertyValue(v).trim()]));
  }, { attrs, vars });
  const diff = (got, want) => Object.keys(want).filter(k => got[k] !== want[k]).map(k => `${k}: «${got[k]}» ≠ «${want[k]}»`);

  await p.evaluate(() => localStorage.clear());
  const results = [];
  for (const [scheme, theme, mode] of [['dark', null, 'dark'], ['dark', 'dark', 'dark'], ['dark', 'light', 'light'], ['light', 'system', 'light'], ['dark', 'system', 'dark']]) {
    await p.emulateMedia({ colorScheme: scheme });
    const d = diff(await computed({ 'data-theme': theme, 'data-preset': null }), expected(mode));
    results.push(d.length ? `base ${theme || 'sin data-theme'}/${scheme}: ${d.slice(0, 2)}` : null);
  }
  ok(results.every(r => !r), 'base: los 37 tokens calculados coinciden con tokens.json en oscuro, claro y «system» (con el sistema en claro y en oscuro)' + (results.filter(Boolean).length ? `:\n   - ${results.filter(Boolean).join('\n   - ')}` : ''));

  const presetProblems = [];
  for (const n of presetNames.filter(x => x !== 'tesela')) {
    const def = T.presets[n];
    for (const [scheme, theme, mode] of [['dark', 'dark', 'dark'], ['dark', 'light', 'light'], ['light', 'system', 'light'], ['dark', 'system', 'dark']]) {
      await p.emulateMedia({ colorScheme: scheme });
      const ov = { ...(def.common || {}), ...(def[mode] || {}) };
      const d = diff(await computed({ 'data-theme': theme, 'data-preset': n }), expected(mode, ov));
      if (d.length) presetProblems.push(`${n} ${theme}/${scheme}: ${d.slice(0, 2)}`);
    }
  }
  ok(presetProblems.length === 0, `presets: los 37 tokens calculados de los ${presetNames.length - 1} presets coinciden con presets.json en los 4 casos (oscuro, claro, system en claro y en oscuro)` + (presetProblems.length ? `:\n   - ${presetProblems.slice(0, 4).join('\n   - ')}` : ''));

  // Un contenedor con su propio preset y modo: las variables derivadas (--tsl-ring) usan SU acento, no el de <html>
  await p.evaluate(() => { document.documentElement.removeAttribute('data-preset'); document.documentElement.setAttribute('data-theme', 'dark'); });
  const scoped = await p.evaluate(() => {
    const host = document.createElement('div');
    host.innerHTML = '<div id="sc" class="tsl" data-preset="medianoche" data-theme="light" style="background:var(--tsl-bg);color:var(--tsl-fg)"><div id="pr" style="box-shadow:var(--tsl-ring)"></div><div id="ref" style="box-shadow:0 0 0 2px #f3f6fd, 0 0 0 4px color-mix(in srgb, #2f54eb 75%, transparent)"></div></div>';
    document.body.appendChild(host);
    const cs = (id, prop) => getComputedStyle(host.querySelector(id))[prop];
    const out = { bg: cs('#sc', 'backgroundColor'), fg: cs('#sc', 'color'), ring: cs('#pr', 'boxShadow'), ref: cs('#ref', 'boxShadow'), rootBg: getComputedStyle(document.body).getPropertyValue('--tsl-bg').trim() };
    host.remove();
    return out;
  });
  ok(scoped.bg === 'rgb(243, 246, 253)' && scoped.fg === 'rgb(15, 27, 61)', `contenedor con data-preset propio: fondo y texto del preset «medianoche» en claro (${scoped.bg}) aunque la página sea oscura`);
  ok(scoped.ring === scoped.ref && scoped.rootBg === '#141415', '--tsl-ring del contenedor usa el acento del contenedor (no el de la página)');

  // Contraste real renderizado: botón de acento y texto de la página en cada preset y modo
  const rendered = await p.evaluate(async () => {
    const lum = (rgb) => { const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
    const out = [];
    for (const preset of window.TeselaUI.presets.map(x => x.name)) {
      for (const theme of ['dark', 'light']) {
        window.TeselaUI.setPreset(preset); window.TeselaUI.setTheme(theme);
        const host = document.createElement('div'); host.className = 'tsl'; host.style.cssText = 'background:var(--tsl-bg);color:var(--tsl-fg)';
        host.innerHTML = '<button class="tsl-btn tsl-btn--accent">a</button><button class="tsl-btn tsl-btn--primary">p</button>';
        document.body.appendChild(host);
        const [a, pr] = host.querySelectorAll('button');
        const ca = getComputedStyle(a), cp = getComputedStyle(pr), ch = getComputedStyle(host);
        out.push({ preset, theme, accent: ratio(ca.color, ca.backgroundColor), primary: ratio(cp.color, cp.backgroundColor), body: ratio(ch.color, ch.backgroundColor) });
        host.remove();
      }
    }
    window.TeselaUI.setPreset('tesela'); window.TeselaUI.setTheme('dark');
    return out;
  });
  const weak = rendered.filter(r => r.accent < (r.preset === 'alto-contraste' ? 7 : 4.5) || r.body < 7 || r.primary < 7);
  ok(rendered.length === 22 && weak.length === 0, 'contraste renderizado: botón de acento ≥ 4,5:1 (7:1 en alto contraste), botón primario y texto de página ≥ 7:1 en los 22 casos' + (weak.length ? `: ${JSON.stringify(weak.slice(0, 2))}` : ''));

  // ---------- API ----------
  await p.evaluate(() => localStorage.clear());
  await p.emulateMedia({ colorScheme: 'dark' });
  await p.reload(); await p.waitForLoadState('networkidle');
  const api0 = await p.evaluate(() => ({ theme: TeselaUI.getTheme(), preset: TeselaUI.getPreset(), names: TeselaUI.presets.map(x => x.name), hasLabels: TeselaUI.presets.every(x => x.label && x.description) }));
  ok(api0.theme === 'dark' && api0.preset === 'tesela' && JSON.stringify(api0.names) === JSON.stringify(presetNames) && api0.hasLabels, 'API: tema «dark» y preset «tesela» por defecto; presets coincide con presets.json');
  const exportsOk = await p.evaluate(() => ['setTheme', 'getTheme', 'getResolvedTheme', 'setPreset', 'getPreset', 'setAccent', 'setDirection', 'getDirection', 'toast', 'copy', 'confirm', 'position', 'init'].every(f => typeof TeselaUI[f] === 'function'));
  ok(exportsOk, 'API: window.TeselaUI expone todas las funciones de temas');

  await p.evaluate(() => { window.__ev = []; document.addEventListener('tsl-preset', e => __ev.push(['preset', e.detail.preset])); document.addEventListener('tsl-theme', e => __ev.push(['theme', e.detail.theme, e.detail.resolved])); document.addEventListener('tsl-accent', e => __ev.push(['accent', e.detail.accent, e.detail.fg])); });
  const sp = await p.evaluate(() => ({ r: TeselaUI.setPreset('esmeralda'), attr: document.documentElement.getAttribute('data-preset'), accent: getComputedStyle(document.documentElement).getPropertyValue('--tsl-accent').trim(), stored: localStorage.getItem('tsl-preset') }));
  ok(sp.r === 'esmeralda' && sp.attr === 'esmeralda' && sp.accent === T.presets.esmeralda.dark['color.accent'] && sp.stored === 'esmeralda', 'setPreset("esmeralda"): atributo, acento calculado y localStorage');
  const sp2 = await p.evaluate(() => ({ r: TeselaUI.setPreset('no-existe'), attr: document.documentElement.getAttribute('data-preset') }));
  ok(sp2.r === 'esmeralda' && sp2.attr === 'esmeralda', 'setPreset(desconocido) se ignora y conserva el preset activo');
  const sp3 = await p.evaluate(() => ({ r: TeselaUI.setPreset('tesela'), attr: document.documentElement.hasAttribute('data-preset') }));
  ok(sp3.r === 'tesela' && sp3.attr === false, 'setPreset("tesela") quita el atributo y vuelve al tema por defecto');
  const ev1 = await p.evaluate(() => window.__ev.filter(e => e[0] === 'preset').map(e => e[1]).join(','));
  ok(ev1 === 'esmeralda,tesela', 'evento tsl-preset en cada cambio válido (y ninguno con el nombre desconocido)');

  await p.emulateMedia({ colorScheme: 'light' });
  const st = await p.evaluate(() => ({ r: TeselaUI.setTheme('system'), theme: TeselaUI.getTheme(), res: TeselaUI.getResolvedTheme(), bg: getComputedStyle(document.documentElement).getPropertyValue('--tsl-bg').trim(), stored: localStorage.getItem('tsl-theme') }));
  ok(st.r === 'system' && st.theme === 'system' && st.res === 'light' && st.bg === T.byPath.get('color.bg').light && st.stored === 'system', 'setTheme("system") con el sistema en claro: tema efectivo «light» y colores claros');
  await p.evaluate(() => (window.__ev.length = 0));
  await p.emulateMedia({ colorScheme: 'dark' });
  await p.waitForFunction(() => window.__ev.some(e => e[0] === 'theme'), null, { timeout: 5000 }).catch(() => {});
  const sysEv = await p.evaluate(() => ({ ev: window.__ev.filter(e => e[0] === 'theme').map(e => e.slice(1).join('/')), res: TeselaUI.getResolvedTheme() }));
  ok(sysEv.res === 'dark' && sysEv.ev.includes('system/dark'), 'con el tema «system», un cambio del sistema operativo emite tsl-theme con el tema efectivo (' + sysEv.ev + ')');
  ok((await p.evaluate(() => TeselaUI.setTheme('azul'))) === 'dark', 'setTheme(desconocido) vuelve a «dark»');

  // Atributos declarativos y botón de alternar
  const decl = await p.evaluate(async () => {
    const mk = (attrs) => { const b = document.createElement('button'); Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v)); document.body.appendChild(b); return b; };
    const out = {};
    mk({ 'data-tsl-theme': 'light' }).click(); out.light = TeselaUI.getTheme();
    mk({ 'data-tsl-preset': 'papel' }).click(); out.preset = TeselaUI.getPreset();
    mk({ 'data-tsl-theme-toggle': '' }).click(); out.toggled = TeselaUI.getTheme();
    TeselaUI.setTheme('system');
    mk({ 'data-tsl-theme-toggle': '' }).click(); out.fromSystem = TeselaUI.getTheme() + '/' + TeselaUI.getResolvedTheme();
    mk({ 'data-tsl-preset': 'tesela' }).click();
    return out;
  });
  ok(decl.light === 'light' && decl.preset === 'papel' && decl.toggled === 'dark' && decl.fromSystem === 'light/light', 'data-tsl-theme, data-tsl-preset y data-tsl-theme-toggle (alterna según el tema efectivo, también desde «system»): ' + JSON.stringify(decl));

  // setAccent: elige el texto legible y se restablece con null
  const acc = await p.evaluate(() => {
    const r = document.documentElement.style;
    const out = {};
    out.amber = TeselaUI.setAccent('#f59e0b'); out.amberVar = r.getPropertyValue('--tsl-accent') + '/' + r.getPropertyValue('--tsl-accent-fg');
    out.navy = TeselaUI.setAccent('#1e3a8a');
    out.short = TeselaUI.setAccent('#0af'); out.shortVar = r.getPropertyValue('--tsl-accent');
    out.bad = TeselaUI.setAccent('rojo'); out.afterBad = r.getPropertyValue('--tsl-accent');
    out.stored = localStorage.getItem('tsl-accent') + '/' + localStorage.getItem('tsl-accent-fg');
    out.reset = TeselaUI.setAccent(null); out.afterReset = r.getPropertyValue('--tsl-accent') + r.getPropertyValue('--tsl-accent-fg');
    return out;
  });
  ok(acc.amber === '#0b0b0c' && acc.amberVar === '#f59e0b/#0b0b0c' && acc.navy === '#ffffff', 'setAccent: texto oscuro sobre ámbar y blanco sobre azul marino');
  ok(acc.shortVar === '#00aaff' && acc.bad === null && acc.afterBad === '#00aaff', 'setAccent: expande #rgb, ignora valores no válidos');
  ok(acc.stored === '#00aaff/#0b0b0c' && acc.reset === null && acc.afterReset === '', 'setAccent: guarda el acento y su texto; setAccent(null) lo restablece');
  // Barrido: para cualquier acento, el texto elegido llega a 4,5:1 (el peor caso teórico es ≈4,58)
  const sweep = [];
  for (let h = 0; h < 360; h += 7) for (const [s, l] of [[0.9, 0.5], [0.5, 0.4], [0.7, 0.62], [1, 0.3], [0.3, 0.7], [0, 0.46]]) {
    const k = (n) => { const a = s * Math.min(l, 1 - l); const q = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(q - 3, 9 - q, 1)); };
    sweep.push('#' + [k(0), k(8), k(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''));
  }
  const fgs = await p.evaluate((colors) => colors.map(c => [c, TeselaUI.setAccent(c)]), sweep);
  await p.evaluate(() => TeselaUI.setAccent(null));
  const worst = Math.min(...fgs.map(([c, fg]) => contrast(parse(fg), parse(c))));
  ok(worst >= 4.5, `setAccent: con ${sweep.length} acentos (todos los tonos y luminosidades) el texto elegido cumple 4,5:1 (peor caso ${worst.toFixed(2)})`);

  // Persistencia: se restaura al recargar
  await p.evaluate(() => { TeselaUI.setPreset('medianoche'); TeselaUI.setTheme('light'); TeselaUI.setAccent('#e11d48'); });
  await p.reload(); await p.waitForLoadState('networkidle');
  const back = await p.evaluate(() => ({ preset: TeselaUI.getPreset(), theme: TeselaUI.getTheme(), accent: document.documentElement.style.getPropertyValue('--tsl-accent'), fg: document.documentElement.style.getPropertyValue('--tsl-accent-fg') }));
  ok(back.preset === 'medianoche' && back.theme === 'light' && back.accent === '#e11d48' && back.fg === '#ffffff', 'persistencia: preset, tema y acento se restauran al recargar');

  // theme-init.js: aplica lo guardado antes del primer pintado, sin cargar la biblioteca
  await p.evaluate(() => { localStorage.setItem('tsl-theme', 'light'); localStorage.setItem('tsl-preset', 'papel'); localStorage.setItem('tsl-accent', '#ff8800'); localStorage.setItem('tsl-accent-fg', '#0b0b0c'); });
  await p.goto(`${base}/tests/fixtures/theme-init.html`);
  const seen = await p.evaluate(() => ({ ...window.__visto, btn: getComputedStyle(document.getElementById('b')).backgroundColor, lib: typeof window.TeselaUI }));
  ok(seen.theme === 'light' && seen.preset === 'papel' && seen.accent === '#ff8800' && seen.fg === '#0b0b0c' && seen.cuerpoYaExiste === false, 'theme-init.js: aplica tema, preset y acento guardados en <head>, antes de que exista el cuerpo');
  ok(seen.lib === 'undefined' && seen.btn === 'rgb(255, 136, 0)', 'theme-init.js: funciona sin cargar tesela-ui.js (el botón de acento ya sale con el color guardado)');
  await p.evaluate(() => { localStorage.setItem('tsl-preset', '<img src=x onerror=alert(1)>'); localStorage.setItem('tsl-theme', 'rojo'); localStorage.setItem('tsl-accent', 'url(x)'); });
  await p.goto(`${base}/tests/fixtures/theme-init.html`);
  const safe = await p.evaluate(() => window.__visto);
  ok(safe.preset === null && safe.theme === null && safe.accent === '', 'theme-init.js: ignora valores guardados no válidos (nada de lo guardado se inserta tal cual)');

  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
