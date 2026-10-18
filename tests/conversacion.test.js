// Familia de conversación: mensaje, marcador, zona con seguimiento, adjunto, traza, bloque de código y cuestionario.
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');
  const show = async (id) => { await p.evaluate(i => document.getElementById(i).scrollIntoView({ block: 'center' }), id); await p.waitForTimeout(200); };

  // ---- Mensaje y marcador ----
  await show('message');
  const rects = await p.evaluate(() => {
    const box = document.querySelector('#message .demo-max, #message .tsl-stack').getBoundingClientRect();
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    return { box: { l: box.left, r: box.right }, start: r('#message .tsl-message:not(.tsl-message--end) .tsl-bubble'), end: r('#message .tsl-message--end .tsl-bubble') };
  });
  ok(rects.start.left - rects.box.l < 60 && rects.box.r - rects.end.right < 4, 'el mensaje propio se alinea al final y el ajeno al inicio');
  ok(await p.locator('#message .tsl-message--end .tsl-bubble').evaluate(e => getComputedStyle(e).backgroundColor === getComputedStyle(document.documentElement).getPropertyValue('--tsl-accent').trim() || getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)'), 'la burbuja propia usa el acento');
  const grp = await p.locator('#message .tsl-message-group .tsl-bubble').evaluateAll(a => a.map(x => Math.round(x.getBoundingClientRect().left)));
  ok(grp.length === 2 && grp[0] === grp[1], 'en un grupo, el avatar vacío mantiene alineadas las burbujas');
  const sep = await p.locator('#message .tsl-marker--separator').evaluate(e => { const a = getComputedStyle(e, '::before'), z = getComputedStyle(e, '::after'); return a.height === '1px' && z.height === '1px' && a.content === '""'; });
  ok(sep, 'el marcador separador dibuja líneas a ambos lados de la etiqueta');
  ok(await p.locator('#message .tsl-bubble').first().evaluate(e => getComputedStyle(e).overflowWrap) === 'anywhere', 'las burbujas parten palabras largas');

  // ---- Zona de conversación ----
  await show('message-scroller');
  const sc = p.locator('#demo-scroller');
  const vp = sc.locator('.tsl-message-scroller__viewport');
  const pos = () => vp.evaluate(e => ({ top: e.scrollTop, max: e.scrollHeight - e.clientHeight }));
  await p.waitForTimeout(300);
  let s0 = await pos();
  ok(s0.max > 0 && s0.max - s0.top <= 2, 'arranca mostrando el último mensaje');
  ok(await vp.getAttribute('role') === 'region' && await sc.locator('[role=log]').getAttribute('aria-live') === 'polite', 'visor enfocable con nombre y contenido role=log (polite)');
  await p.locator('#demo-scroller-add').click(); await p.waitForTimeout(300);
  let s1 = await pos();
  ok(s1.max > s0.max && s1.max - s1.top <= 2, 'al llegar un mensaje estando al final, lo sigue');
  await vp.evaluate(e => { e.scrollTop = 0; }); await p.waitForTimeout(250);
  ok(await sc.getAttribute('data-away') !== null && await sc.locator('.tsl-message-scroller__end').isVisible(), 'al subir aparece «Ir al final»');
  const before = (await pos()).top;
  await p.locator('#demo-scroller-add').click(); await p.waitForTimeout(300);
  ok((await pos()).top === before, 'si la persona subió, un mensaje nuevo no le mueve el visor');
  ok(await sc.evaluate(e => e.atEnd) === false, 'atEnd es falso al estar arriba');
  await sc.locator('.tsl-message-scroller__end').click(); await p.waitForTimeout(900);
  s1 = await pos();
  ok(s1.max - s1.top <= 2 && await sc.getAttribute('data-away') === null, 'el botón baja al final y se oculta');
  // Streaming: crece el último mensaje
  const last = await sc.evaluate(e => { const l = e.querySelector('.tsl-bubble:last-of-type'); return l ? true : false; });
  await p.evaluate(() => { const bs = document.querySelectorAll('#demo-scroller-log .tsl-bubble'); bs[bs.length - 1].innerHTML += '<br>línea<br>línea<br>línea<br>línea'; });
  await p.waitForTimeout(300);
  s1 = await pos();
  ok(last && s1.max - s1.top <= 2, 'si crece el último mensaje (streaming) sigue en el final');

  // ---- Adjunto ----
  await show('attachment');
  const att = p.locator('#attachment .tsl-attachment');
  ok(await att.count() === 4, 'cuatro adjuntos de ejemplo');
  const tw = await att.nth(0).locator('.tsl-attachment__title').evaluate(e => { const c = getComputedStyle(e); return c.textOverflow + '/' + c.whiteSpace; });
  ok(tw === 'ellipsis/nowrap', 'el nombre largo se trunca con puntos suspensivos');
  ok(await att.nth(1).locator('.tsl-attachment__title').evaluate(e => getComputedStyle(e).animationName) === 'tsl-shimmer', 'subiendo: el título tiene el brillo animado');
  ok(await att.nth(2).evaluate(e => getComputedStyle(e).borderTopColor) !== await att.nth(0).evaluate(e => getComputedStyle(e).borderTopColor) && await att.nth(2).locator('.tsl-attachment__desc').evaluate(e => getComputedStyle(e).color) !== await att.nth(0).locator('.tsl-attachment__desc').evaluate(e => getComputedStyle(e).color), 'error: borde y descripción en color de peligro');
  const grpScroll = await p.locator('#attachment .tsl-attachment-group').evaluate(e => getComputedStyle(e).overflowX);
  ok(grpScroll === 'auto', 'el grupo de adjuntos se desplaza en horizontal');

  // ---- Traza ----
  await show('trace');
  const lines = p.locator('#trace .tsl-trace__line');
  ok(await lines.count() === 5, 'cinco líneas de traza');
  ok(await lines.nth(2).evaluate(e => getComputedStyle(e.querySelector('.tsl-trace__title')).animationName) === 'tsl-shimmer', 'running: el título brilla');
  ok(Number(await lines.nth(4).evaluate(e => getComputedStyle(e).opacity)) < 0.7, 'pending: la línea se atenúa');
  const tr = p.locator('#demo-trace-open');
  ok(await tr.locator('button').getAttribute('aria-expanded') === 'true', 'la línea desplegable muestra su detalle (aria-expanded)');
  await tr.locator('button').click(); await p.waitForTimeout(350);
  ok(await tr.locator('button').getAttribute('aria-expanded') === 'false' && await tr.locator('.tsl-collapsible__content').evaluate(e => e.inert && e.getBoundingClientRect().height < 1), 'al pulsarla se pliega el detalle (altura 0 e inert)');
  const tt = await lines.nth(0).locator('.tsl-trace__title').evaluate(e => getComputedStyle(e).textOverflow);
  ok(tt === 'ellipsis', 'el título de la traza se trunca');

  // ---- Bloque de código ----
  await show('code-block');
  const cb = p.locator('#code-block .tsl-codeblock');
  const textX = () => cb.locator('.tsl-codeblock__line').first().evaluate(l => { const r = document.createRange(); r.setStart(l.lastChild, 0); r.setEnd(l.lastChild, 1); return r.getBoundingClientRect().left - l.getBoundingClientRect().left; });
  const withNums = await textX();
  await p.evaluate(() => { document.querySelector('#code-block .tsl-codeblock__content').removeAttribute('data-numbers'); });
  const noNums = await textX();
  await p.evaluate(() => { document.querySelector('#code-block .tsl-codeblock__content').setAttribute('data-numbers', ''); });
  ok(withNums - noNums > 30 && await cb.locator('.tsl-codeblock__line').nth(3).evaluate(l => getComputedStyle(l, '::before').content) === 'counter(tsl-line)', `data-numbers reserva la columna de números (${Math.round(withNums - noNums)} px) con un contador`);
  const rows = await cb.locator('.tsl-codeblock__line').evaluateAll(a => a.map(l => Math.round(l.getBoundingClientRect().top)));
  const diffs = rows.slice(1).map((t, i) => t - rows[i]);
  ok(diffs.every(d => d >= 18 && d <= 20), `las líneas no dejan filas vacías entre sí (${diffs})`);
  ok(await cb.locator('[data-variant=added]').evaluate(e => getComputedStyle(e, '::after').content) === '"+"' && await cb.locator('[data-variant=removed]').evaluate(e => getComputedStyle(e, '::after').content) === '"−"', 'las líneas añadida y eliminada llevan su marca + y −');
  ok(await cb.locator('[data-variant=added]').evaluate(e => getComputedStyle(e).backgroundColor) !== await cb.locator('[data-variant=removed]').evaluate(e => getComputedStyle(e).backgroundColor), 'añadida y eliminada tienen fondos distintos');
  ok(await cb.locator('.tsl-codeblock__content').evaluate(e => getComputedStyle(e).direction) === 'ltr', 'el código siempre va de izquierda a derecha');
  await cb.locator('[data-tsl-copy]').click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => navigator.clipboard.readText()) === "TeselaUI.setPreset('esmeralda');", 'copiar entrega el texto indicado, sin números ni marcas');
  await p.evaluate(() => { document.querySelector('#code-block .tsl-codeblock__content').dataset.wrap = ''; });
  ok(await cb.locator('.tsl-codeblock__content').evaluate(e => getComputedStyle(e).whiteSpace) === 'pre-wrap', 'data-wrap ajusta las líneas largas');

  // ---- Cuestionario ----
  await show('questionnaire');
  const q = p.locator('#demo-q');
  const info = () => q.evaluate(e => ({ idx: e.activeIndex, n: e.count, text: e.querySelector('[data-progress]').textContent, vis: [...e.querySelectorAll('.tsl-questionnaire__item')].filter(i => !i.hidden).map(i => i.dataset.name), btn: ['prev', 'skip', 'next', 'submit'].map(k => { const b = e.querySelector(`[data-${k}]`); return b.hidden ? 'x' : b.disabled ? 'd' : 'o'; }).join('') }));
  let st = await info();
  ok(st.text === 'Pregunta 1 de 2' && st.vis.join() === 'rol' && st.btn === 'dxox', 'inicio: «Pregunta 1 de 2» (la condicional aún no cuenta); sin Anterior ni Omitir');
  await q.locator('[data-next]').click();
  ok((await info()).idx === 0 && await q.locator('.tsl-questionnaire__error').first().textContent() === 'Elige una respuesta para continuar.' && await q.locator('.tsl-questionnaire__item').first().getAttribute('aria-invalid') === 'true', 'obligatoria sin respuesta: no avanza y muestra el aviso');
  ok(await q.locator('.tsl-questionnaire__error').first().getAttribute('role') === 'alert', 'el aviso es role=alert');
  await q.locator('input[value=design]').click();
  ok(await q.locator('.tsl-questionnaire__error').first().textContent() === '' && await q.locator('.tsl-questionnaire__item').first().getAttribute('aria-invalid') === null, 'al responder se limpia el aviso');
  await q.locator('[data-next]').click();
  st = await info();
  ok(st.vis.join() === 'comentario' && st.text === 'Pregunta 2 de 2' && st.btn === 'oxxo', 'con rol=diseño se salta la pregunta condicional y la última muestra «Enviar»');
  await q.locator('[data-prev]').click();
  await q.locator('input[value=dev]').click();
  st = await info();
  ok(st.text === 'Pregunta 1 de 3', 'rol=desarrollo activa la condicional: ahora son 3');
  await q.locator('[data-next]').click();
  st = await info();
  ok(st.vis.join() === 'stack' && st.text === 'Pregunta 2 de 3' && st.btn === 'ooox', 'aparece la pregunta condicional');
  ok(await q.locator('[data-skip]').isVisible(), 'una pregunta no obligatoria ofrece «Omitir»');
  // Atajos 1-9
  await q.locator('.tsl-questionnaire__item:not([hidden]) input').first().focus();
  await p.keyboard.press('1'); await p.keyboard.press('3');
  ok(await q.evaluate(e => e.value('stack').join()) === 'react,wc', 'las teclas 1 y 3 marcan casillas');
  await p.keyboard.press('1');
  ok(await q.evaluate(e => e.value('stack').join()) === 'wc', 'la tecla 1 de nuevo la desmarca');
  await q.locator('[data-skip]').click();
  st = await info();
  ok(st.vis.join() === 'comentario' && st.btn === 'oxxo', 'Omitir avanza; en la última aparece «Enviar»');
  // Texto + Enter + envío
  await p.evaluate(() => { window.__sub = null; document.getElementById('demo-q').addEventListener('tsl-submit', e => { window.__sub = e.detail.answers; }); });
  await q.locator('input[name=comentario]').fill('Todo bien');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  const sub = await p.evaluate(() => window.__sub);
  ok(sub && sub.rol === 'dev' && sub.stack === 'wc' && sub.comentario === 'Todo bien' && Object.keys(sub).length === 3, 'Enter en el campo envía: tsl-submit entrega las respuestas');
  // Respuestas de preguntas que dejaron de aplicar no se envían
  await q.evaluate(e => e.goTo(0)); await q.locator('input[value=design]').click();
  const ans = await q.evaluate(e => Object.keys(e.answers).join());
  ok(ans === 'rol,comentario', 'al dejar de aplicar una pregunta, sus respuestas salen de answers');
  await q.evaluate(e => e.reset()); await p.waitForTimeout(100);
  st = await info();
  ok(st.idx === 0 && st.text === 'Pregunta 1 de 2' && await q.locator('input:checked').count() === 0, 'reset() borra las respuestas y vuelve a la primera');

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
