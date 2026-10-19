// Asistente: entrada de prompt, sugerencias, razonamiento, fuentes y citas, versiones, acciones y medidor de contexto.
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}/components.html`); await p.waitForLoadState('networkidle');
  const show = async (id) => { await p.evaluate(i => document.getElementById(i).scrollIntoView({ block: 'center' }), id); await p.waitForTimeout(200); };
  // Registra los eventos de un elemento en window.__ev
  const listen = (sel, names) => p.evaluate(([s, ns]) => { window.__ev = []; const el = document.querySelector(s); ns.forEach(n => el.addEventListener(n, e => window.__ev.push({ type: n, detail: e.detail }))); }, [sel, names]);
  const events = () => p.evaluate(() => window.__ev);

  // ---- Entrada de prompt ----
  await show('prompt-input');
  const pi = p.locator('#demo-prompt');
  const ta = pi.locator('textarea');
  const submit = pi.locator('[data-submit]');
  // La demo simula una respuesta: aquí se prueba el elemento sin ella
  await p.evaluate(async () => {
    const doc = new DOMParser().parseFromString(await (await fetch('components.html')).text(), 'text/html');
    document.querySelector('#demo-prompt').replaceWith(doc.querySelector('#prompt-input > template').content.querySelector('tsl-prompt-input'));
  });
  await p.waitForTimeout(50);
  ok(await submit.isDisabled() && await submit.getAttribute('aria-label') === 'Enviar' && await submit.getAttribute('data-state') === 'send', 'vacía: el botón «Enviar» está deshabilitado');
  const h0 = await ta.evaluate(e => e.getBoundingClientRect().height);
  await ta.fill('Primera línea');
  ok(!(await submit.isDisabled()), 'con texto, el botón se habilita');
  await ta.press('Shift+Enter'); await ta.press('Shift+Enter'); await ta.type('tercera');
  const h1 = await ta.evaluate(e => e.getBoundingClientRect().height);
  ok(await ta.inputValue() === 'Primera línea\n\ntercera' && h1 > h0 + 20, `Mayús+Enter salta de línea y la caja crece (${Math.round(h0)} → ${Math.round(h1)} px)`);
  await listen('#demo-prompt', ['tsl-submit', 'tsl-stop', 'tsl-error', 'tsl-files']);
  await ta.evaluate(e => e.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, isComposing: true })));
  ok((await events()).length === 0, 'Enter durante la composición de un IME no envía');
  await pi.locator('select').selectOption('profundo');
  await ta.press('Enter');
  let ev = (await events()).find(e => e.type === 'tsl-submit');
  ok(ev && ev.detail.text === 'Primera línea\n\ntercera' && ev.detail.values.modelo === 'profundo' && Array.isArray(ev.detail.files), 'Enter envía tsl-submit con el texto y los demás campos (modelo)');
  ok(await ta.inputValue() === '' && await submit.isDisabled() && Math.abs((await ta.evaluate(e => e.getBoundingClientRect().height)) - h0) < 2, 'tras enviar se vacía y vuelve a su altura');

  // Adjuntos: botón, validación de tipo, tamaño y cantidad, y quitar
  const file = (name, type, size) => ({ name, mimeType: type, buffer: Buffer.alloc(size) });
  await pi.locator('input[type=file]').setInputFiles([file('a.pdf', 'application/pdf', 1000), file('virus.exe', 'application/x-msdownload', 10), file('enorme.png', 'image/png', 11 * 1024 * 1024)]);
  await p.waitForTimeout(100);
  let evs = await events();
  const errors = evs.filter(e => e.type === 'tsl-error').map(e => e.detail.reason).join();
  ok(errors === 'type,size', `rechaza por tipo (accept) y por tamaño (max-size): ${errors}`);
  ok(await pi.locator('.tsl-attachment').count() === 1 && await pi.locator('.tsl-attachment__title').first().textContent() === 'a.pdf' && !(await submit.isDisabled()), 'el archivo válido aparece como adjunto y basta para poder enviar');
  ok(await pi.locator('.tsl-prompt-input__attachments').getAttribute('role') === 'list' && await pi.locator('.tsl-attachment').first().getAttribute('role') === 'listitem', 'los adjuntos son una lista accesible');
  await pi.locator('input[type=file]').setInputFiles(['1', '2', '3', '4'].map(n => file(`n${n}.txt`, 'text/plain', 5)));
  await p.waitForTimeout(100);
  ok(await pi.locator('.tsl-attachment').count() === 4 && (await events()).filter(e => e.type === 'tsl-error' && e.detail.reason === 'count').length === 1 && await pi.locator('[data-attach]').isDisabled(), 'max-files=4: el quinto se rechaza y el botón de adjuntar se deshabilita');
  await pi.locator('.tsl-attachment').first().locator('button').click();
  ok(await pi.locator('.tsl-attachment').count() === 3 && await ta.evaluate(e => document.activeElement === e) && !(await pi.locator('[data-attach]').isDisabled()), 'quitar un adjunto devuelve el foco al texto');
  // Pegar una imagen
  await ta.evaluate(e => { const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(20)], 'pegada.png', { type: 'image/png' })); e.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  await p.waitForTimeout(100);
  ok(await pi.locator('.tsl-attachment__title', { hasText: 'pegada.png' }).count() === 1 && await pi.locator('.tsl-attachment img').count() === 1, 'pegar una imagen la adjunta con miniatura');
  // Arrastrar archivos
  await pi.evaluate(e => { const dt = new DataTransfer(); dt.items.add(new File(['x'], 'soltado.pdf', { type: 'application/pdf' })); e.removeFile(0); e.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true, cancelable: true })); });
  ok(await pi.getAttribute('data-dragging') !== null, 'al arrastrar archivos encima se marca la caja (data-dragging)');
  await pi.evaluate(e => { const dt = new DataTransfer(); dt.items.add(new File(['x'], 'soltado.pdf', { type: 'application/pdf' })); e.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); });
  ok(await pi.getAttribute('data-dragging') === null && await pi.locator('.tsl-attachment__title', { hasText: 'soltado.pdf' }).count() === 1, 'al soltarlos se adjuntan');
  // Envío solo con adjuntos y cancelable
  await p.evaluate(() => document.querySelector('#demo-prompt').addEventListener('tsl-submit', e => e.preventDefault(), { once: true }));
  await submit.click();
  ev = (await events()).filter(e => e.type === 'tsl-submit').pop();
  ok(ev.detail.text === '' && ev.detail.files.length === 4 && await pi.locator('.tsl-attachment').count() === 4, 'preventDefault() en tsl-submit conserva texto y adjuntos');
  await pi.evaluate(e => e.clear());
  ok(await pi.locator('.tsl-attachment').count() === 0 && await pi.locator('.tsl-prompt-input__attachments').isHidden(), 'clear() vacía los adjuntos y oculta la fila');

  // Respuesta en curso: espera, detener y Enter bloqueado
  await ta.fill('Otra pregunta');
  await pi.evaluate(e => (e.status = 'submitted'));
  ok(await submit.getAttribute('data-state') === 'wait' && await submit.getAttribute('aria-label') === 'Detener' && !(await submit.isDisabled()), 'submitted: el botón muestra espera y se llama «Detener»');
  await pi.evaluate(e => (e.status = 'streaming'));
  const n0 = (await events()).filter(e => e.type === 'tsl-submit').length;
  await ta.press('Enter');
  ok((await events()).filter(e => e.type === 'tsl-submit').length === n0 && await ta.inputValue() === 'Otra pregunta', 'streaming: Enter no envía ni borra lo escrito');
  await submit.click();
  ok(await submit.getAttribute('data-state') === 'stop' && (await events()).some(e => e.type === 'tsl-stop'), 'streaming: el botón es un cuadrado y emite tsl-stop');
  await pi.evaluate(e => (e.status = 'ready'));
  ok(await submit.getAttribute('aria-label') === 'Enviar' && !(await submit.isDisabled()), 'al volver a ready el botón vuelve a enviar');
  // Ctrl+Enter
  await pi.evaluate(e => e.setAttribute('submit-key', 'mod-enter'));
  await ta.press('Enter');
  ok(await ta.inputValue() === 'Otra pregunta\n', 'submit-key=mod-enter: Enter salta de línea…');
  await ta.press('Control+Enter');
  ok(await ta.inputValue() === '' && (await events()).filter(e => e.type === 'tsl-submit').pop().detail.text === 'Otra pregunta', '…y Ctrl+Enter envía');
  await pi.evaluate(e => e.setAttribute('disabled', ''));
  ok(await ta.isDisabled() && await submit.isDisabled() && await pi.locator('[data-attach]').isDisabled(), 'disabled bloquea texto, adjuntos y envío');

  // ---- Sugerencias ----
  await show('suggestion');
  const sp = p.locator('#demo-suggest-prompt');
  await listen('#demo-suggest-prompt', ['tsl-submit']);
  await p.locator('#suggestion .tsl-suggestion').nth(1).click();
  ok(await sp.evaluate(e => e.value) === 'Escribe una prueba para el componente de calendario' && await sp.locator('textarea').evaluate(e => document.activeElement === e), 'una sugerencia rellena la caja con data-value y la enfoca');
  await p.locator('#suggestion .tsl-suggestion').nth(0).click();
  ok(await sp.evaluate(e => e.value) === 'Resume este documento', 'sin data-value usa su texto');
  await p.locator('#suggestion .tsl-suggestion[data-send]').click();
  ev = (await events()).pop();
  ok(ev && ev.detail.text === '¿Qué temas hay?' && await sp.evaluate(e => e.value) === '', 'data-send envía la sugerencia al momento');
  ok(await p.locator('#suggestion .tsl-suggestions').evaluate(e => getComputedStyle(e).overflowX) === 'auto', 'la fila de sugerencias se desplaza en horizontal');

  // ---- Razonamiento ----
  await show('reasoning');
  const r1 = p.locator('#reasoning tsl-reasoning').first();
  const t1 = r1.locator('.tsl-reasoning__trigger');
  ok(await t1.textContent() === 'Pensó durante 12 s' && await t1.locator('.tsl-reasoning__icon svg').count() === 1 && await t1.getAttribute('aria-expanded') === 'false' && await r1.locator('.tsl-reasoning__content').evaluate(e => e.inert && e.getBoundingClientRect().height < 1), 'terminado: «Pensó durante 12 s», plegado e inert');
  await t1.click(); await p.waitForTimeout(300);
  ok(await t1.getAttribute('aria-expanded') === 'true' && await r1.locator('.tsl-reasoning__content').evaluate(e => !e.inert && e.getBoundingClientRect().height > 30), 'al pulsar se despliega');
  const rr = p.locator('#demo-reasoning');
  await listen('#demo-reasoning', ['tsl-complete', 'tsl-toggle']);
  await rr.evaluate(e => e.setAttribute('streaming', ''));
  await p.waitForTimeout(1150);
  const lab = rr.locator('.tsl-reasoning__label');
  ok(await rr.getAttribute('open') !== null && (await lab.textContent()).startsWith('Pensando…') && await lab.evaluate(e => getComputedStyle(e).animationName) === 'tsl-shimmer', `streaming: se abre y anuncia «${await lab.textContent()}» con brillo`);
  ok(await rr.locator('[role=status]').textContent() === 'Pensando…', 'el estado se anuncia en una región aparte (sin repetir el contador)');
  await rr.evaluate(e => e.removeAttribute('streaming'));
  ok(await lab.textContent() === 'Pensó durante 1 s' && (await events()).some(e => e.type === 'tsl-complete' && e.detail.duration >= 1), 'al terminar dice cuánto pensó y emite tsl-complete');
  ok(await rr.getAttribute('open') !== null, 'sigue abierto durante close-delay…');
  await p.waitForTimeout(1700);
  ok(await rr.getAttribute('open') === null && !(await events()).some(e => e.type === 'tsl-toggle'), '…y luego se pliega solo (sin tsl-toggle, no lo hizo la persona)');
  // Si la persona lo toca durante el razonamiento, no se pliega solo
  await rr.evaluate(e => e.setAttribute('streaming', ''));
  await rr.locator('.tsl-reasoning__trigger').click(); await rr.locator('.tsl-reasoning__trigger').click();
  await rr.evaluate(e => e.removeAttribute('streaming'));
  await p.waitForTimeout(1700);
  ok(await rr.getAttribute('open') !== null && (await events()).filter(e => e.type === 'tsl-toggle').length === 2, 'si la persona lo abrió o cerró a mano, se respeta su decisión');

  // ---- Fuentes y citas ----
  await show('sources');
  const src = p.locator('#sources .tsl-sources');
  const pointing = () => src.locator('.tsl-collapsible__chevron').evaluate(e => { const c = getComputedStyle(e), m = new DOMMatrix(c.transform); const vx = parseFloat(c.borderRightWidth) > 0 ? 1 : -1, vy = parseFloat(c.borderBottomWidth) > 0 ? 1 : -1; const x = m.a * vx + m.c * vy, y = m.b * vx + m.d * vy; return Math.abs(x) < 0.1 ? (y > 0 ? 'abajo' : 'arriba') : (x > 0 ? 'derecha' : 'izquierda'); });
  const shut = await pointing();
  await src.locator('.tsl-sources__trigger').click(); await p.waitForTimeout(300);
  ok(shut === 'derecha' && await pointing() === 'abajo', 'el chevron de un tsl-collapsible gira al abrirse (derecha → abajo)');
  ok(await src.locator('.tsl-source').count() === 3 && await src.locator('.tsl-source').first().isVisible(), 'el disparador despliega la lista de fuentes');
  ok(await src.locator('.tsl-source__title').first().evaluate(e => getComputedStyle(e).textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth), 'un título largo se trunca y el dominio sigue visible');
  const cite = p.locator('#sources .tsl-citation').first();
  const line = await cite.evaluate(e => { const r = e.getBoundingClientRect(), t = e.closest('div').getBoundingClientRect(); return { inline: getComputedStyle(e.closest('tsl-hovercard')).display === 'inline', h: r.height, lh: parseFloat(getComputedStyle(e.closest('div')).lineHeight) }; });
  ok(line.inline && line.h <= line.lh, 'la cita va en línea con el texto, sin romper el renglón');
  await cite.hover(); await p.waitForTimeout(500);
  const panel = p.locator('#sources .tsl-citation__panel').first();
  ok(await panel.isVisible() && await cite.getAttribute('aria-expanded') === 'true' && (await panel.textContent()).includes('Contrast (Minimum)'), 'al pasar por la cita se abre su tarjeta con título y fragmento');
  await p.mouse.move(5, 5); await p.waitForTimeout(400);
  ok(!(await panel.isVisible()), 'al salir se cierra');
  await cite.focus(); await p.waitForTimeout(450);
  ok(await panel.isVisible(), 'también se abre al llegar con el teclado');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok(!(await panel.isVisible()), 'Escape la cierra');

  // ---- Versiones y acciones ----
  await show('branch');
  const br = p.locator('#demo-branch');
  const visible = () => br.evaluate(e => [...e.querySelectorAll('.tsl-branch__item')].filter(i => !i.hidden).map(i => i.textContent.trim().slice(0, 10)));
  const count = br.locator('.tsl-branch__count');
  ok(await count.textContent() === '2 de 2' && (await visible()).length === 1 && (await visible())[0].startsWith('Usa setAcc'), 'empieza en la última versión y muestra solo una');
  ok(await br.locator('.tsl-branch__selector').evaluate(e => e.parentElement.classList.contains('tsl-message__footer')), 'usa el selector que se colocó en el pie');
  await listen('#demo-branch', ['tsl-change']);
  await br.locator('.tsl-branch__prev').click();
  ok(await count.textContent() === '1 de 2' && (await visible())[0].startsWith('Puedes cam') && (await events())[0].detail.index === 0, '«Versión anterior» muestra la primera y emite tsl-change');
  await br.locator('.tsl-branch__prev').click();
  ok(await count.textContent() === '2 de 2', 'en el extremo da la vuelta');
  await p.locator('#demo-branch-retry').click(); await p.waitForTimeout(50);
  ok(await count.textContent() === '3 de 3' && (await visible())[0].startsWith('Versión 3'), 'al llegar una versión nueva salta a ella');
  ok(await br.locator('.tsl-branch__prev').getAttribute('aria-label') === 'Versión anterior' && await br.locator('.tsl-branch__selector').getAttribute('role') === 'group', 'botones con nombre y selector agrupado');
  const single = await p.evaluate(async () => { const el = document.createElement('tsl-branch'); el.innerHTML = '<div class="tsl-branch__item">Única</div>'; document.body.appendChild(el); await new Promise(r => setTimeout(r, 30)); const hidden = el.querySelector('.tsl-branch__selector').hidden; el.remove(); return hidden; });
  ok(single, 'con una sola versión no muestra el selector');
  const actions = br.locator('.tsl-message__actions');
  await p.evaluate(() => document.activeElement.blur()); await p.mouse.move(5, 5); await p.waitForTimeout(200);
  const hoverable = await p.evaluate(() => matchMedia('(hover: hover)').matches);
  const op0 = Number(await actions.evaluate(e => getComputedStyle(e).opacity));
  // La opacidad tiene transición: se espera a que termine (con margen si la máquina va cargada)
  const settled = async () => { await p.waitForFunction(() => getComputedStyle(document.querySelector('#demo-branch .tsl-message__actions')).opacity === '1', null, { timeout: 2000 }).catch(() => {}); return Number(await actions.evaluate(e => getComputedStyle(e).opacity)); };
  await br.locator('.tsl-branch__item:not([hidden]) .tsl-bubble').hover();
  const op1 = await settled();
  await p.mouse.move(5, 5); await br.locator('[aria-label="Regenerar"]').focus();
  const op2 = await settled();
  ok(!hoverable || (op0 === 0 && op1 === 1 && op2 === 1), `las acciones aparecen al pasar por el mensaje o al enfocarlas (${op0} → ${op1}, foco ${op2})`);
  await br.locator('[aria-label="Buena respuesta"]').click();
  ok(await br.locator('[aria-label="Buena respuesta"]').getAttribute('aria-pressed') === 'true', 'valorar es un botón conmutador (aria-pressed)');

  // ---- Medidor de contexto ----
  await show('context');
  const cx = p.locator('#context tsl-context');
  const levels = await cx.evaluateAll(a => a.map(e => e.getAttribute('data-level') + ':' + e.querySelector('.tsl-context__percent').textContent.replace(/\s/g, ' ')));
  ok(levels.join() === 'ok:24 %,warn:79 %,danger:96 %', `nivel y porcentaje por umbral: ${levels}`);
  const arcColors = await cx.evaluateAll(a => a.map(e => getComputedStyle(e.querySelector('.tsl-context__arc')).stroke));
  ok(new Set(arcColors).size === 3, 'el anillo cambia de color con el nivel');
  const dash = await cx.first().locator('.tsl-context__arc').getAttribute('stroke-dasharray');
  ok(dash === '24.10 100', `el arco dibuja la fracción usada (${dash})`);
  const trig = cx.first().locator('button');
  const name = (await trig.getAttribute('aria-label')).replace(/\s/g, ' ');
  ok(name === 'Contexto: 24 % usado (48,2 mil / 200 mil tokens)', `el anillo tiene un nombre con porcentaje y tokens: «${name}»`);
  await trig.click(); await p.waitForTimeout(300);
  const cp = cx.first().locator('.tsl-context__panel');
  const rows = await cp.locator('.tsl-context__rows > div').evaluateAll(a => a.map(r => r.textContent.replace(/\s/g, ' ')));
  ok(await cp.isVisible() && rows.join('|') === 'Entrada36 mil|Salida9 mil|Razonamiento3,2 mil|En caché12 mil', `el panel desglosa los tokens: ${rows.join(' | ')}`);
  ok((await cp.locator('.tsl-context__cost').textContent()).replace(/\s/g, ' ') === '0,0874 US$' && (await cp.locator('.tsl-context__title').textContent()).startsWith('Equilibrado'), 'muestra el modelo y el coste en la moneda indicada');
  const meter = cp.locator('[role=meter]');
  ok(await meter.getAttribute('aria-valuenow') === '48200' && await meter.getAttribute('aria-valuemax') === '200000', 'la barra es un role=meter con sus valores');
  const head = await cp.locator('.tsl-context__head').evaluate(e => e.getBoundingClientRect().height);
  ok(head < 24, `la cabecera del panel cabe en una línea (${Math.round(head)} px)`);
  await p.keyboard.press('Escape');
  const second = await cx.nth(1).evaluate(async e => { e.querySelector('button').click(); await new Promise(r => setTimeout(r, 200)); const out = { rows: e.querySelectorAll('.tsl-context__rows > div').length, rowsHidden: e.querySelector('.tsl-context__rows').hidden, foot: e.querySelector('.tsl-context__foot').hidden }; e.close(); return out; });
  ok(second.rows === 0 && second.rowsHidden && second.foot, 'sin desglose ni coste, el panel solo muestra la barra');
  await p.locator('#demo-context-add').click();
  ok((await cx.first().locator('.tsl-context__percent').textContent()).replace(/\s/g, ' ') === '34 %', 'al cambiar used se actualiza al momento');
  const en = await p.evaluate(async () => { const d = document.createElement('div'); d.lang = 'en'; d.innerHTML = '<tsl-context used="48200" max="200000" cost="1.5" currency="EUR"></tsl-context>'; document.body.appendChild(d); await new Promise(r => setTimeout(r, 30)); const el = d.firstChild; const out = el.querySelector('.tsl-context__total').textContent + ' · ' + el.querySelector('.tsl-context__cost').textContent; d.remove(); return out; });
  ok(en === '48.2K / 200K · €1.50', `las cifras siguen el idioma de la página: ${en}`);

  // ---- Patrón: chat completo ----
  await show('pattern-chat');
  const chat = p.locator('#pattern-chat .tsl-chat');
  const geo = await chat.evaluate(c => { const r = (s) => c.querySelector(s).getBoundingClientRect(); return { h: c.getBoundingClientRect().height, head: r('.tsl-chat__header').bottom, scTop: r('tsl-message-scroller').top, scBottom: r('tsl-message-scroller').bottom, comp: r('.tsl-chat__composer').top }; });
  ok(Math.round(geo.h) === 560 && Math.abs(geo.head - geo.scTop) < 1.5 && Math.abs(geo.scBottom - geo.comp) < 1.5, `el chat reparte su alto: cabecera, conversación que ocupa el resto y caja de entrada (${Math.round(geo.scBottom - geo.scTop)} px de conversación)`);
  const citeP = await chat.evaluate(c => { const h = c.querySelector('.tsl-citation-card'); const para = h.closest('p'); return Boolean(para) && para.textContent.trim().endsWith('.') && para.querySelectorAll('.tsl-citation-card').length === 1; });
  ok(citeP, 'la cita con su tarjeta (<span>) va dentro del párrafo y el punto final no salta de línea');
  const cs = p.locator('#chat-scroller'), cp2 = p.locator('#chat-prompt'), meter2 = p.locator('#chat-context');
  const atEnd = () => cs.evaluate(e => { const v = e.querySelector('.tsl-message-scroller__viewport'); return v.scrollHeight - v.scrollTop - v.clientHeight <= 2; });
  ok(await atEnd(), 'arranca mostrando el final de la conversación');
  const used0 = Number(await meter2.getAttribute('used'));
  await cp2.locator('select').selectOption('Profundo');
  await p.locator('#pattern-chat .tsl-suggestion').first().click();
  await p.waitForTimeout(150);
  const msgs = p.locator('#chat-log > .tsl-message');
  ok(await msgs.count() === 4 && (await msgs.nth(2).textContent()).trim() === '¿Qué presets de tema hay?' && await msgs.nth(2).evaluate(e => e.classList.contains('tsl-message--end')), 'la sugerencia se envía como mensaje propio');
  ok(await cp2.getAttribute('status') === 'submitted' && await msgs.nth(3).locator('tsl-reasoning').getAttribute('streaming') !== null, 'mientras espera: botón en espera y razonamiento en curso');
  await p.waitForTimeout(1700);
  ok(await cp2.getAttribute('status') === 'streaming' && await msgs.nth(3).locator('tsl-reasoning').getAttribute('streaming') === null, 'al escribir: el razonamiento termina y el botón pasa a «Detener»');
  await p.waitForFunction(() => document.querySelector('#chat-prompt').getAttribute('status') === 'ready', null, { timeout: 8000 });
  const answer = (await msgs.nth(3).locator('.tsl-branch__item').textContent()).trim();
  ok(answer.startsWith('Hay once presets') && await msgs.nth(3).locator('.tsl-message__footer').isVisible() && await msgs.nth(3).locator('[data-tsl-copy]').getAttribute('data-tsl-copy') === answer, 'la respuesta se escribe entera, muestra su pie y «Copiar» copia ese texto');
  ok(Number(await meter2.getAttribute('used')) > used0 && await meter2.getAttribute('model') === 'Profundo', 'el medidor suma los tokens y muestra el modelo elegido');
  await p.waitForTimeout(300);
  ok(await atEnd(), 'la conversación sigue el final mientras llega la respuesta');
  // Detener a medias
  await cp2.locator('textarea').fill('¿Funciona en RTL?');
  await cp2.locator('textarea').press('Enter');
  await p.waitForFunction(() => document.querySelector('#chat-prompt').getAttribute('status') === 'streaming', null, { timeout: 4000 });
  await p.waitForTimeout(200);
  await cp2.locator('[data-submit]').click();
  await p.waitForTimeout(300);
  const stopped = await p.locator('#chat-log > .tsl-marker').last().textContent();
  const partial = (await msgs.last().locator('.tsl-branch__item').textContent()).trim();
  await p.waitForTimeout(600);
  ok(stopped.includes('Respuesta detenida') && await cp2.getAttribute('status') === 'ready' && partial.length > 0 && (await msgs.last().locator('.tsl-branch__item').textContent()).trim() === partial, `«Detener» corta la respuesta donde iba («${partial.slice(0, 20)}…») y lo anuncia`);
  // Regenerar la primera respuesta
  const first = msgs.nth(1).locator('tsl-branch');
  await first.locator('[data-regenerar]').click();
  await p.waitForFunction(() => document.querySelector('#chat-prompt').getAttribute('status') === 'ready', null, { timeout: 8000 });
  ok(await first.locator('.tsl-branch__count').textContent() === '2 de 2' && await first.locator('.tsl-branch__selector').isVisible(), 'regenerar añade una versión y aparece el selector «2 de 2»');
  await first.locator('.tsl-branch__prev').click();
  ok((await first.locator('.tsl-branch__item:not([hidden])').textContent()).includes('setAccent()'), 'y se puede volver a la versión original');
  // Adjuntos en el mensaje propio
  await cp2.locator('input[type=file]').setInputFiles([{ name: 'captura.png', mimeType: 'image/png', buffer: Buffer.alloc(30) }]);
  await cp2.locator('textarea').fill('Mira esto');
  await cp2.locator('textarea').press('Enter');
  await p.waitForTimeout(150);
  const mine = p.locator('#chat-log > .tsl-message--end').last();
  ok(await mine.locator('.tsl-attachment__title').textContent() === 'captura.png' && (await mine.locator('.tsl-bubble').textContent()) === 'Mira esto', 'los adjuntos enviados aparecen sobre la burbuja propia');
  await p.waitForFunction(() => document.querySelector('#chat-prompt').getAttribute('status') === 'ready', null, { timeout: 8000 });
  // Al estrecharse (girar el móvil) la conversación no suelta el final
  await p.setViewportSize({ width: 1280, height: 1000 }); await p.waitForTimeout(400);
  await cs.evaluate(e => e.scrollToEnd(false)); await p.waitForTimeout(200);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(600);
  ok(await atEnd() && await cs.getAttribute('data-away') === null, 'al estrecharse la ventana sigue mostrando el final, sin «Ir al final»');
  await p.setViewportSize({ width: 1200, height: 900 }); await p.waitForTimeout(300);

  ok(errs.length === 0, 'sin errores de JavaScript' + (errs.length ? `: ${errs.join(' | ')}` : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
