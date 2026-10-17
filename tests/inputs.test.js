const { chromium } = require('playwright');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto((process.env.BASE_URL || 'http://localhost:24100') + '/components.html'); await p.waitForLoadState('networkidle');
  const go = async id => { await p.locator(id).scrollIntoViewIfNeeded(); await p.waitForTimeout(900); };
  const val = sel => p.evaluate(s => document.querySelector(s).value, sel);
  const txt = sel => p.locator(sel).first().innerText();
  const vis = sel => p.locator(sel).first().isVisible();
  const attr = (sel, a) => p.locator(sel).first().getAttribute(a);

  // ---------- SLIDER ----------
  await go('#slider');
  const SL = '#demo-slider', RG = '#demo-range2';
  ok((await p.locator(SL + ' .tsl-slider__thumb').count()) === 1 && (await val(SL)) === '40', 'slider: un pulgar, valor 40');
  await p.locator(SL + ' .tsl-slider__thumb').focus();
  await p.keyboard.press('ArrowRight');
  ok((await val(SL)) === '41' && (await txt('#demo-slider-out')) === '41%', 'slider: → suma 1 y emite tsl-input');
  await p.keyboard.press('End'); ok((await val(SL)) === '100', 'slider: End → máximo');
  await p.keyboard.press('Home'); ok((await val(SL)) === '0', 'slider: Home → mínimo');
  await p.keyboard.press('PageUp'); ok((await val(SL)) === '10', 'slider: PgUp suma 10 pasos');
  ok((await attr(SL + ' .tsl-slider__thumb', 'aria-valuetext')) === '10%', 'slider: aria-valuetext con sufijo');
  const tb = await p.locator(SL + ' .tsl-slider__track').boundingBox();
  await p.mouse.click(tb.x + tb.width * 0.75, tb.y + 2);
  ok(Math.abs(+(await val(SL)) - 75) <= 1, `slider: clic en la pista → ${await val(SL)} (≈75)`);
  ok((await p.locator(RG + ' .tsl-slider__thumb').count()) === 2 && (await val(RG)) === '200,800', 'rango: dos pulgares, valor "200,800"');
  const th = p.locator(RG + ' .tsl-slider__thumb');
  await th.nth(0).focus(); await p.keyboard.press('ArrowRight');
  ok((await val(RG)) === '250,800', 'rango: respeta step=50');
  await p.keyboard.press('End');
  ok((await val(RG)) === '800,800', 'rango: el mínimo no cruza al máximo');
  await th.nth(1).focus(); await p.keyboard.press('Home');
  ok((await val(RG)) === '800,800', 'rango: el máximo no cruza al mínimo');
  await p.keyboard.press('End'); await th.nth(0).focus(); await p.keyboard.press('Home'); await p.keyboard.press('PageUp');
  ok((await val(RG)) === '500,1000', 'rango: se recupera → "500,1000"');
  const rb = await p.locator(RG + ' .tsl-slider__track').boundingBox();
  const t1 = await th.nth(1).boundingBox();
  await p.mouse.move(t1.x + t1.width / 2, t1.y + t1.height / 2); await p.mouse.down();
  await p.mouse.move(rb.x + rb.width * 0.7, t1.y + 8, { steps: 5 }); await p.mouse.up();
  ok((await val(RG)) === '500,700', 'rango: arrastrar el pulgar derecho a 70% → "500,700" (' + await val(RG) + ')');
  ok((await txt('#demo-range2-out')) === '$500 – $700', 'rango: tsl-input actualiza la salida');
  await p.mouse.click(rb.x + rb.width * 0.1, rb.y + 2);
  ok((await val(RG)).startsWith('100,'), 'rango: clic cerca del extremo mueve el pulgar más cercano (' + await val(RG) + ')');

  // ---------- RATING ----------
  await go('#rating');
  const RT = '#demo-rating';
  ok((await attr(RT, 'aria-valuenow')) === '3' && (await attr(RT, 'role')) === 'slider', 'rating: valor 3 y role slider');
  ok(await p.evaluate(() => [...document.querySelectorAll('#demo-rating .tsl-rating__star')].map(s => s.style.getPropertyValue('--f')).join() === '1,1,1,0,0'), 'rating: 3 estrellas llenas');
  await p.locator(RT + ' .tsl-rating__star').nth(3).click();
  ok((await val(RT)) === 4 && (await txt('#demo-rating-out')) === '4 de 5', 'rating: clic en la 4ª → 4');
  await p.locator(RT + ' .tsl-rating__star').nth(3).click();
  ok((await val(RT)) === 0 && (await txt('#demo-rating-out')) === 'Sin valorar', 'rating: clic en el mismo valor lo borra (clearable)');
  await p.locator(RT).focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  ok((await val(RT)) === 2, 'rating: → ×2 = 2');
  await p.keyboard.press('End'); ok((await val(RT)) === 5, 'rating: End = 5');
  await p.keyboard.press('Delete'); ok((await val(RT)) === 0, 'rating: Supr borra');
  await p.locator(RT + ' .tsl-rating__star').nth(1).hover();
  ok(await p.evaluate(() => document.querySelector('#demo-rating').classList.contains('is-hovering') && document.querySelectorAll('#demo-rating .tsl-rating__star')[1].style.getPropertyValue('--f') === '1'), 'rating: vista previa al pasar el cursor');
  const half = '#rating tsl-rating[half]:not([readonly])';
  const sb = await p.locator(half + ' .tsl-rating__star').nth(1).boundingBox();
  await p.mouse.click(sb.x + sb.width * 0.25, sb.y + sb.height / 2);
  ok((await val(half)) === 1.5, 'rating: mitad izquierda de la 2ª estrella → 1.5');
  await p.mouse.click(sb.x + sb.width * 0.8, sb.y + sb.height / 2);
  ok((await val(half)) === 2, 'rating: mitad derecha → 2');
  const ro = '#rating tsl-rating[readonly]';
  await p.locator(ro + ' .tsl-rating__star').nth(0).click();
  ok((await val(ro)) === 4.5 && (await attr(ro, 'role')) === 'img' && (await attr(ro, 'tabindex')) === null, 'rating: solo lectura no cambia, role img, sin tabindex');
  ok((await attr(ro, 'aria-label')).includes('4.5 de 5'), 'rating: aria-label legible en solo lectura');

  // ---------- COLOR ----------
  await go('#color-picker');
  const CP = '#demo-color';
  ok((await val(CP)) === '#6366f1', 'color: valor inicial');
  await p.locator(CP + ' .tsl-trigger').click();
  ok(await vis(CP + ' .tsl-color__panel'), 'color: abre panel');
  ok(await p.evaluate(() => document.activeElement.classList.contains('tsl-color__area')), 'color: foco en el área');
  const hexI = CP + ' input';
  await p.locator(hexI).fill('#ff0000'); await p.keyboard.press('Enter');
  ok((await val(CP)) === '#ff0000' && (await txt(CP + ' .tsl-trigger__value')) === '#ff0000', 'color: hex escrito se aplica');
  await p.locator(hexI).fill('f0f'); await p.keyboard.press('Enter');
  ok((await val(CP)) === '#ff00ff', 'color: hex corto #f0f → #ff00ff');
  await p.locator(hexI).fill('zzz'); await p.keyboard.press('Enter');
  ok((await p.locator(hexI).inputValue()) === '#ff00ff', 'color: hex inválido se revierte');
  await p.locator(hexI).fill('#ff0000'); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => { const t = document.querySelector('#demo-color .tsl-color__area .tsl-color__thumb'); return t.style.left === '100%' && t.style.top === '0%'; }), 'color: pulgar del área en saturación 100% / brillo 100%');
  await p.locator(CP + ' .tsl-color__hue').focus(); await p.keyboard.press('Shift+ArrowRight');
  ok((await val(CP)) !== '#ff0000' && (await attr(CP + ' .tsl-color__hue', 'aria-valuenow')) === '10', 'color: Shift+→ en tono +10° cambia el color');
  await p.locator(CP + ' .tsl-color__area').focus(); await p.keyboard.press('Shift+ArrowLeft');
  ok(await p.evaluate(() => document.querySelector('#demo-color .tsl-color__area').getAttribute('aria-valuetext').includes('Saturación 90%')), 'color: Shift+← baja saturación a 90%');
  let inputs = 0;
  await p.evaluate(() => { window.__in = 0; document.querySelector('#demo-color').addEventListener('tsl-input', () => window.__in++); });
  const ab = await p.locator(CP + ' .tsl-color__area').boundingBox();
  await p.mouse.move(ab.x + 10, ab.y + 10); await p.mouse.down();
  await p.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2, { steps: 6 }); await p.mouse.up();
  inputs = await p.evaluate(() => window.__in);
  ok(inputs >= 3, `color: arrastrar el área emite tsl-input en vivo (${inputs})`);
  ok(await p.evaluate(() => { const t = document.querySelector('#demo-color .tsl-color__area .tsl-color__thumb'); return Math.abs(parseFloat(t.style.left) - 50) < 2 && Math.abs(parseFloat(t.style.top) - 50) < 2; }), 'color: el pulgar queda en el centro (50% / 50%)');
  await p.locator(CP + ' .tsl-color__chip').first().click();
  ok((await val(CP)) === '#f43f5e', 'color: muestra aplica el valor');
  ok((await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tsl-accent').trim())) !== '', 'color: el demo cambió --tsl-accent con tsl-input');
  await p.keyboard.press('Escape');
  ok(!(await vis(CP + ' .tsl-color__panel')) && await p.evaluate(() => document.activeElement.matches('#demo-color .tsl-trigger')), 'color: Esc cierra el panel y devuelve el foco');
  const CA = '#color-picker tsl-color-picker[alpha]';
  ok((await val(CA)) === '#10b981cc', 'color alpha: valor de 8 dígitos');
  await p.locator(CA + ' .tsl-trigger').click();
  await p.locator(CA + ' .tsl-color__alpha').focus(); await p.keyboard.press('Shift+ArrowLeft');
  ok((await val(CA)) === '#10b981b3', 'color alpha: Shift+← baja opacidad a 70% → b3 (' + await val(CA) + ')');
  await p.keyboard.press('Escape');
  ok(await p.evaluate(() => { const f = document.createElement('form'); const c = document.createElement('tsl-color-picker'); c.setAttribute('name', 'c'); c.setAttribute('value', '#123456'); f.appendChild(c); document.body.appendChild(f); return new Promise(r => setTimeout(() => { const v = new FormData(f).get('c'); f.remove(); r(v === '#123456'); }, 50)); }), 'color: FormData incluye el valor');

  // ---------- PASSWORD ----------
  await go('#password');
  const PW = '#password tsl-password';
  ok((await attr(PW + ' input', 'type')) === 'password', 'password: oculta por defecto');
  await p.locator(PW + ' input').fill('hola');
  ok((await txt(PW + ' .tsl-hint')) === 'Muy débil', 'password: "hola" → Muy débil');
  await p.locator(PW + ' input').fill('Hola1234');
  ok((await txt(PW + ' .tsl-hint')) === 'Aceptable' && (await attr(PW + ' .tsl-meter', 'aria-valuenow')) === '2', 'password: "Hola1234" → Aceptable (2)');
  await p.locator(PW + ' input').fill('Hola1234!xy');
  ok((await txt(PW + ' .tsl-hint')) === 'Fuerte', 'password: "Hola1234!xy" → Fuerte');
  await p.locator(PW + ' .tsl-btn').click();
  ok((await attr(PW + ' input', 'type')) === 'text' && (await attr(PW + ' .tsl-btn', 'aria-pressed')) === 'true' && (await txt(PW + ' .tsl-btn')) === 'Ocultar', 'password: mostrar cambia type y aria-pressed');
  await p.locator(PW + ' .tsl-btn').click();
  ok((await attr(PW + ' input', 'type')) === 'password', 'password: volver a ocultar');
  await p.locator(PW + ' input').fill('');
  ok((await txt(PW + ' .tsl-hint')) === '', 'password: vacío sin etiqueta');

  // ---------- TEXTAREA ----------
  await go('#textarea-autosize');
  const TA = '#demo-ta';
  const h0 = await p.locator(TA).evaluate(e => e.offsetHeight);
  await p.locator(TA).fill('1\n2\n3\n4');
  const h4 = await p.locator(TA).evaluate(e => e.offsetHeight);
  ok(h4 > h0, `textarea: crece con el contenido (${h0}→${h4}px)`);
  await p.locator(TA).fill(Array.from({ length: 14 }, (_, i) => 'línea ' + i).join('\n'));
  const info = await p.locator(TA).evaluate(e => { const cs = getComputedStyle(e); return { h: e.offsetHeight, ov: e.style.overflowY, cap: parseFloat(cs.lineHeight) * 6 + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 2 }; });
  ok(info.h <= info.cap + 2 && info.ov === 'auto', `textarea: se detiene en 6 filas (${info.h}px ≤ ${Math.round(info.cap)}px) y muestra scroll`);
  ok((await txt('#demo-ta-count')).endsWith('/ 160') && (await txt('#demo-ta-count')) !== '0 / 160', 'textarea: contador actualizado');
  await p.locator(TA).fill('x'.repeat(200));
  ok((await txt('#demo-ta-count')) === '160 / 160' && (await p.locator('#demo-ta-count').getAttribute('class')).includes('is-over'), 'textarea: maxlength corta y el contador marca el tope');

  // ---------- MENTION ----------
  await go('#mention');
  const MN = '#demo-mention';
  await p.locator(MN + ' textarea').click();
  await p.keyboard.type('Hola @lu');
  ok(await vis(MN + ' .tsl-mention__panel') && (await p.locator(MN + ' .tsl-select__option').count()) === 2, 'mention: "@lu" muestra 2 usuarios (Luis, Lucía)');
  const tab = await p.locator(MN + ' textarea').boundingBox(), pab = await p.locator(MN + ' .tsl-mention__panel').boundingBox();
  ok(pab.y > tab.y && pab.y < tab.y + tab.height + 40 && pab.x >= tab.x, 'mention: el panel aparece junto al cursor');
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.querySelector('#demo-mention .is-active').textContent.includes('Lucía')), 'mention: ↓ activa la segunda opción');
  await p.keyboard.press('Enter');
  ok((await p.locator(MN + ' textarea').inputValue()) === 'Hola @lucia ' && !(await vis(MN + ' .tsl-mention__panel')), 'mention: Enter inserta "@lucia " y cierra');
  ok(await p.locator('.tsl-toast', { hasText: 'Mencionaste a Lucía Fernández' }).count() > 0, 'mention: emite tsl-mention');
  await p.keyboard.type('@zz');
  ok(!(await vis(MN + ' .tsl-mention__panel')), 'mention: sin coincidencias no muestra panel');
  await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace');
  ok((await p.locator(MN + ' .tsl-select__option').count()) === 4, 'mention: solo "@" lista a todos');
  await p.keyboard.press('Escape');
  ok(!(await vis(MN + ' .tsl-mention__panel')), 'mention: Esc cierra');
  await p.locator(MN + ' textarea').fill(''); await p.keyboard.type('correo a@b');
  ok(!(await vis(MN + ' .tsl-mention__panel')), 'mention: "a@b" (sin espacio previo) no dispara');
  await p.locator(MN + ' textarea').fill(''); await p.keyboard.type('@ma');
  await p.locator(MN + ' .tsl-select__option').nth(1).click();
  ok((await p.locator(MN + ' textarea').inputValue()) === '@mateo ', 'mention: clic en una opción la inserta');

  // ---------- CHOICE CARD ----------
  await go('#choice-card');
  const cards = p.locator('#choice-card .tsl-choice-card');
  const border = i => cards.nth(i).evaluate(e => getComputedStyle(e).borderColor);
  ok((await border(1)) !== (await border(0)), 'tarjeta: la marcada tiene otro borde (:has)');
  await cards.nth(0).click();
  ok(await p.evaluate(() => document.querySelector('#choice-card input[value=free]').checked && !document.querySelector('#choice-card input[value=pro]').checked), 'tarjeta: clic en cualquier parte marca su radio');
  ok((await border(0)) !== (await border(1)), 'tarjeta: el estilo sigue a la selección');
  await cards.nth(2).click({ force: true });
  ok(await p.evaluate(() => !document.querySelector('#choice-card input[value=ent]').checked), 'tarjeta: la deshabilitada no se marca');

  // ---------- TOGGLE GROUP ----------
  await go('#toggle-group');
  const TM = '#demo-tg-multi', TS = '#demo-tg-single';
  ok((await attr(TM + ' [value=negrita]', 'aria-pressed')) === 'true', 'toggle: valor inicial pressed');
  await p.locator(TM + ' [value=cursiva]').click();
  ok(JSON.stringify(await val(TM)) === '["negrita","cursiva"]' && (await txt('#demo-tg-out')) === 'negrita · cursiva · centro', 'toggle múltiple: combina valores');
  await p.locator(TM + ' [value=negrita]').click();
  ok(JSON.stringify(await val(TM)) === '["cursiva"]', 'toggle múltiple: volver a pulsar quita');
  await p.locator(TS + ' [value=centro]').click();
  ok((await val(TS)) === 'centro', 'toggle required: no se puede deseleccionar');
  await p.locator(TS + ' [value=der]').click();
  ok((await val(TS)) === 'der' && (await attr(TS + ' [value=centro]', 'aria-pressed')) === 'false', 'toggle single: cambia la selección');
  await p.locator(TS + ' [value=der]').focus(); await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.value === 'centro'), 'toggle: ← mueve el foco (roving)');
  ok((await attr(TS + ' [value=der]', 'tabindex')) === '0' && (await attr(TS + ' [value=izq]', 'tabindex')) === '-1', 'toggle: tabindex itinerante en el seleccionado');

  // ---------- COLLAPSIBLE ----------
  await go('#collapsible');
  const CO = '#demo-collapsible';
  const ch = () => p.locator(CO + ' .tsl-collapsible__content').evaluate(e => e.getBoundingClientRect().height);
  ok((await attr(CO + ' [data-tsl-trigger]', 'aria-expanded')) === 'true' && (await ch()) > 40, 'collapsible: abierto al inicio');
  await p.evaluate(() => (window.__t = []) && document.querySelector('#demo-collapsible').addEventListener('tsl-toggle', e => window.__t.push(e.detail.open)));
  await p.locator(CO + ' [data-tsl-trigger]').click(); await p.waitForTimeout(450);
  ok((await attr(CO + ' [data-tsl-trigger]', 'aria-expanded')) === 'false' && (await ch()) < 2, 'collapsible: cierra con altura 0');
  ok(await p.locator(CO + ' .tsl-collapsible__content').evaluate(e => e.inert), 'collapsible: contenido cerrado es inert');
  await p.locator(CO + ' [data-tsl-trigger]').click(); await p.waitForTimeout(450);
  ok((await ch()) > 40 && JSON.stringify(await p.evaluate(() => window.__t)) === '[false,true]', 'collapsible: reabre y emite tsl-toggle');

  // ---------- SCROLL AREA ----------
  await go('#scroll-area');
  const SA = '#scroll-area tsl-scroll-area';
  ok((await p.locator(SA).getAttribute('data-bottom')) !== null && (await p.locator(SA).getAttribute('data-top')) === null, 'scroll area: solo borde inferior con contenido al inicio');
  ok((await attr(SA + ' .tsl-scroll-area__viewport', 'tabindex')) === '0', 'scroll area: enfocable con teclado');
  await p.locator(SA + ' .tsl-scroll-area__viewport').evaluate(e => (e.scrollTop = e.scrollHeight)); await p.waitForTimeout(150);
  ok((await p.locator(SA).getAttribute('data-bottom')) === null && (await p.locator(SA).getAttribute('data-top')) !== null, 'scroll area: al final solo queda el borde superior');
  ok(await p.locator(SA + ' .tsl-scroll-area__viewport').evaluate(e => getComputedStyle(e).getPropertyValue('--tsl-fade-t').trim() === '28px'), 'scroll area: el degradado superior se activa');

  // ---------- RESIZABLE ----------
  await go('#resizable');
  const RZ = '#resizable tsl-resizable[storage-key]';
  const w = i => p.locator(RZ + ' > .tsl-resizable__panel').nth(i).evaluate(e => e.getBoundingClientRect().width);
  const cw = () => p.locator(RZ).evaluate(e => e.clientWidth);
  await p.evaluate(() => localStorage.removeItem('tsl-resizable:docs-demo'));
  await p.reload(); await p.waitForLoadState('networkidle'); await go('#resizable');
  let total = await cw();
  const frac = async () => (await w(0)) / ((await w(0)) + (await w(1)));
  ok(Math.abs((await frac()) - 0.28) < 0.01, `resizable: tamaño inicial 28% (${(await frac()).toFixed(3)})`);
  ok((await attr(RZ + ' > .tsl-resizable__handle', 'role')) === 'separator' && (await attr(RZ + ' > .tsl-resizable__handle', 'aria-valuenow')) === '28', 'resizable: separador accesible con aria-valuenow');
  const hb = await p.locator(RZ + ' > .tsl-resizable__handle').boundingBox();
  await p.mouse.move(hb.x + 1, hb.y + 20); await p.mouse.down();
  await p.mouse.move(hb.x + 121, hb.y + 20, { steps: 6 }); await p.mouse.up();
  ok((await frac()) > 0.36 && (await frac()) < 0.5, `resizable: arrastrar +120px ensancha el panel (${(await frac()).toFixed(3)})`);
  await p.mouse.move(hb.x + 121, hb.y + 20); await p.mouse.down();
  await p.mouse.move(hb.x + 800, hb.y + 20, { steps: 6 }); await p.mouse.up();
  ok((await frac()) <= 0.5001, `resizable: respeta data-max=50 (${(await frac()).toFixed(3)})`);
  await p.locator(RZ + ' > .tsl-resizable__handle').focus(); await p.keyboard.press('Home');
  ok(Math.abs((await frac()) - 0.15) < 0.01, `resizable: Home → mínimo 15% (${(await frac()).toFixed(3)})`);
  await p.keyboard.press('ArrowRight');
  ok(Math.abs((await frac()) - 0.17) < 0.01, 'resizable: → suma 2%');
  await p.locator(RZ + ' > .tsl-resizable__handle').dblclick();
  ok(Math.abs((await frac()) - 0.28) < 0.01, 'resizable: doble clic restablece 28%');
  await p.keyboard.press('Shift+ArrowRight');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('tsl-resizable:docs-demo'))[0] > 30), 'resizable: storage-key persiste los tamaños');
  const nh = RZ + ' tsl-resizable > .tsl-resizable__handle';
  const eh = () => p.locator(RZ + ' tsl-resizable > .tsl-resizable__panel').nth(0).evaluate(e => e.getBoundingClientRect().height);
  const e0 = await eh();
  const vb = await p.locator(nh).boundingBox();
  await p.mouse.move(vb.x + 40, vb.y + 1); await p.mouse.down();
  await p.mouse.move(vb.x + 40, vb.y - 40, { steps: 5 }); await p.mouse.up();
  ok((await eh()) < e0 - 20, `resizable anidado (vertical): arrastrar arriba reduce el editor (${Math.round(e0)}→${Math.round(await eh())}px)`);

  // ---------- SEPARATOR / ASPECT ----------
  await go('#separator');
  const sep = await p.locator('#separator .tsl-separator').first().boundingBox();
  const sepv = await p.locator('#separator .tsl-separator--vertical').first().boundingBox();
  ok(sep.height === 1 && sep.width > 100 && sepv.width === 1 && sepv.height >= 14, `separator: horizontal 1px de alto (${sep.height}), vertical 1px de ancho con altura (${sepv.height})`);
  await go('#aspect-ratio');
  const ar = await p.locator('#aspect-ratio .tsl-aspect').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return r.width / r.height; }));
  ok(Math.abs(ar[0] - 16 / 9) < 0.02 && Math.abs(ar[1] - 1) < 0.02 && Math.abs(ar[2] - 0.8) < 0.02, `aspect ratio: 16/9, 1/1 y 4/5 (${ar.map(x => x.toFixed(2)).join(', ')})`);

  ok(errs.length === 0, 'sin errores de consola/página' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
