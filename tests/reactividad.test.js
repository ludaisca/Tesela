// Reactividad: cambiar después del montaje los atributos documentados en src/meta/elements.js
// (textos, `value`, `disabled`) tiene efecto, como en un elemento nativo.
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// Textos que solo se pintan en un estado concreto (y se leen del atributo en ese momento): la prueba
// genérica no puede verlos en el DOM sin provocar el estado, así que solo se exige que no fallen.
const CONDICIONALES = new Set([
  'tsl-time-picker hour-label', 'tsl-time-picker minute-label', // columnas del panel, se pintan al abrir
  'tsl-wizard step-label', // anuncio de la región aria-live al cambiar de paso
  'tsl-sortable label', // anuncio al reordenar
  'tsl-prompt-input stop-label', // solo mientras genera
  'tsl-reasoning thinking-label', 'tsl-reasoning done-label', // dependen de si piensa o ya pensó
  'tsl-data-table select-all-label', 'tsl-data-table select-row-label', // solo con `selectable`
  'tsl-data-table empty-text', // solo sin filas
  'tsl-data-table selected-one', 'tsl-data-table selected-many', // solo con filas elegidas
  'tsl-password show-label', 'tsl-password hide-label', // uno u otro según el estado
  'tsl-password label', 'tsl-password placeholder', // pasan al input solo si lo crea el componente
  'tsl-upload busy-message', // mensaje de validación, no se pinta
  'tsl-select placeholder', 'tsl-date-picker placeholder', 'tsl-time-picker placeholder', // solo con el campo vacío (ver el apartado 5)
  'tsl-select search-placeholder', 'tsl-select create-label', 'tsl-select clear-label', 'tsl-time-picker clear-label', // solo con searchable, creatable o clearable
  'tsl-color-picker alpha-label', // solo con `alpha`
  'tsl-prompt-input label', // solo si el textarea no trae su propio nombre accesible
  'tsl-reasoning instant-label', // solo si pensó menos de un segundo
  'tsl-data-table no-match-text', // solo con una búsqueda sin resultados
  'tsl-chart center-label', // solo en donas
  'tsl-context input-label', 'tsl-context output-label', 'tsl-context reasoning-label', 'tsl-context cached-label', 'tsl-context cost-label' // filas con datos
]);
const isText = (a) => a !== 'aria-label' && (a === 'label' || a === 'placeholder' || a === 'empty' || a === 'empty-text' || a === 'no-match-text' || a === 'caption' || a === 'hint' || /-(label|placeholder)$/.test(a) || /^selected-/.test(a));

(async () => {
  const { elements } = await import(pathToFileURL(path.join(__dirname, '../src/meta/elements.js')).href);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(`${base}/components.html`);
  await p.waitForLoadState('networkidle');

  // Primera instancia montada de cada etiqueta (fuera de la paleta de la documentación)
  await p.evaluate(() => {
    window.__first = (tag) => Array.from(document.querySelectorAll(tag)).find((el) => el._tslReady !== false && el.id !== 'docs-cmd' && !el.closest('template')) || null;
    // Texto visible o accesible del componente sin contar el propio atributo que se cambia
    window.__rendered = (el, attr) => el.innerHTML + Array.from(el.attributes).filter((a) => a.name !== attr).map((a) => a.value).join(' ');
  });

  // ---- 1) Los atributos de texto, `value` y `disabled` están observados ----
  const missing = [];
  for (const e of elements) {
    const obs = await p.evaluate((tag) => (customElements.get(tag).observedAttributes || []), e.tag);
    e.attributes.filter((a) => (isText(a.name) && !CONDICIONALES.has(`${e.tag} ${a.name}`)) || a.name === 'value' || a.name === 'disabled').forEach((a) => {
      if (!obs.includes(a.name)) missing.push(`${e.tag}[${a.name}]`);
    });
  }
  ok(missing.length === 0, `todos los atributos de texto, value y disabled se observan${missing.length ? ` (faltan: ${missing.join(', ')})` : ''}`);

  // ---- 2) Textos: el valor nuevo aparece en el DOM y el anterior desaparece ----
  // Se prueba en cada instancia de la página: basta una en la que el texto se vea, y ninguna puede
  // mostrar el primero y no el segundo (eso sería no reaccionar al cambio)
  await p.evaluate(() => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    window.__probe = async (el, attr) => {
      const before = el.getAttribute(attr);
      const t1 = `Rx${attr.replace(/-/g, '')}Uno`;
      const t2 = `Rx${attr.replace(/-/g, '')}Dos`;
      el.setAttribute(attr, t1);
      await frame();
      const seen1 = window.__rendered(el, attr).includes(t1);
      el.setAttribute(attr, t2);
      await frame();
      const html = window.__rendered(el, attr);
      if (before === null) el.removeAttribute(attr);
      else el.setAttribute(attr, before);
      return seen1 && html.includes(t2) && !html.includes(t1) ? 'ok' : seen1 ? 'no-cambia' : 'no-aparece';
    };
  });
  const sinEfecto = [];
  const probados = [];
  for (const e of elements) {
    for (const a of e.attributes.filter((x) => isText(x.name))) {
      const key = `${e.tag} ${a.name}`;
      const r = await p.evaluate(async ([tag, attr]) => {
        const all = Array.from(document.querySelectorAll(tag)).filter((el) => el._tslReady && el.id !== 'docs-cmd');
        if (!all.length) return 'sin-demo';
        const results = [];
        for (const el of all) results.push(await window.__probe(el, attr));
        return results.includes('no-cambia') ? 'no-cambia' : results.includes('ok') ? 'ok' : 'no-aparece';
      }, [e.tag, a.name]);
      if (r === 'sin-demo') continue;
      if (r === 'ok') probados.push(key);
      else if (r === 'no-cambia' || !CONDICIONALES.has(key)) sinEfecto.push(`${key} (${r})`);
    }
  }
  ok(sinEfecto.length === 0 && probados.length > 50, `cambiar un texto después del montaje lo repinta (${probados.length} atributos probados)${sinEfecto.length ? `; sin efecto: ${sinEfecto.join(', ')}` : ''}`);

  // ---- 3) disabled: ningún control interno queda enfocable, y al quitarlo vuelven ----
  const focusables = (tag) => p.evaluate((t) => {
    const el = window.__first(t);
    const list = [el, ...el.querySelectorAll('button, input, select, textarea, [contenteditable=true], [tabindex]')];
    return list.filter((n) => {
      if (n.closest('[inert]') || n.closest('[popover]:not(:popover-open)') || n.closest('[hidden]')) return false;
      if (n.disabled || n.type === 'hidden') return false;
      if (n === el && !n.hasAttribute('tabindex')) return false;
      return n.tabIndex >= 0;
    }).length;
  }, tag);
  for (const e of elements.filter((x) => x.attributes.some((a) => a.name === 'disabled'))) {
    if (!(await p.evaluate((t) => Boolean(window.__first(t)), e.tag))) continue;
    const enabled = await focusables(e.tag);
    await p.evaluate((t) => window.__first(t).setAttribute('disabled', ''), e.tag);
    const off = await focusables(e.tag);
    await p.evaluate((t) => window.__first(t).removeAttribute('disabled'), e.tag);
    const back = await focusables(e.tag);
    ok(enabled > 0 && off === 0 && back === enabled, `${e.tag}: disabled puesto después del montaje deshabilita los controles (${enabled} → ${off} → ${back})`);
  }

  // ---- 4) value: el atributo fija el valor (y el que se ve) ----
  const casos = {
    'tsl-tabs': (el) => Array.from(el.querySelectorAll('.tsl-tabs__tab')).find((t) => t.dataset.tab !== el.value).dataset.tab,
    'tsl-segmented': (el) => Array.from(el.querySelectorAll('.tsl-segmented__item')).find((t) => t.value !== el.value).value,
    'tsl-radio-group': (el) => Array.from(el.querySelectorAll('.tsl-radio')).find((r) => r.value !== el.value && !r.disabled).value,
    'tsl-toggle-group': (el) => el.querySelectorAll('.tsl-toggle-group__item')[1].value,
    'tsl-select': (el) => el.options.filter((o) => !o.disabled)[1].value,
    'tsl-tags': () => 'uno,dos',
    'tsl-calendar': () => '2026-03-15',
    'tsl-date-picker': () => '2026-03-15',
    'tsl-time-picker': () => '14:30',
    'tsl-slider': (el) => (el.range ? `${el.min},${el.max}` : String(el.max)),
    'tsl-rating': () => '2',
    'tsl-color-picker': () => '#112233',
    'tsl-currency': () => '42.50',
    'tsl-phone': () => '+525512345678'
  };
  for (const e of elements.filter((x) => x.attributes.some((a) => a.name === 'value'))) {
    ok(Boolean(casos[e.tag]), `${e.tag}: hay un caso de prueba para value`);
    if (!casos[e.tag]) continue;
    const r = await p.evaluate(async ([tag, fn]) => {
      const el = window.__first(tag);
      if (!el) return { skip: true };
      const v = new Function(`return (${fn})`)()(el);
      // Lo que se ve: el marcado y lo escrito en los campos
      const snap = () => el.innerHTML + Array.from(el.querySelectorAll('input')).map((i) => i.value).join('|');
      const html = snap();
      el.setAttribute('value', v);
      await new Promise((r) => requestAnimationFrame(r));
      const got = Array.isArray(el.value) ? el.value.join(',') : String(el.value);
      return { v, got, repainted: snap() !== html };
    }, [e.tag, casos[e.tag].toString()]);
    if (r.skip) continue;
    const want = e.tag === 'tsl-rating' ? '2' : r.v;
    ok(r.got === want && r.repainted, `${e.tag}: value="${r.v}" después del montaje cambia el valor a «${r.got}» y lo repinta`);
  }

  // Un `value` puesto por atributo es también el valor al que vuelve reset() del formulario
  const reset = await p.evaluate(async () => {
    const f = document.createElement('form');
    f.innerHTML = '<tsl-select name="r"><option value="a">A</option><option value="b">B</option><option value="c">C</option></tsl-select>';
    document.body.appendChild(f);
    await new Promise((r) => requestAnimationFrame(r));
    const s = f.firstElementChild;
    s.setAttribute('value', 'b');
    s.value = 'c';
    f.reset();
    const v = s.value;
    f.remove();
    return v;
  });
  ok(reset === 'b', `reset() del formulario vuelve al value puesto por atributo (${reset})`);

  // ---- 5) `placeholder` en los campos con texto de sustitución visible
  for (const [tag, sel] of [['tsl-select', '.tsl-trigger__value'], ['tsl-date-picker', '.tsl-trigger__value'], ['tsl-time-picker', '.tsl-trigger__value']]) {
    const shown = await p.evaluate(async ([t, s]) => {
      const host = document.createElement('div');
      host.innerHTML = `<${t}${t === 'tsl-select' ? '><option value="a">A</option>' : '>'}</${t}>`;
      document.body.appendChild(host);
      await new Promise((r) => requestAnimationFrame(r));
      const el = host.firstElementChild;
      el.setAttribute('placeholder', 'Elige algo');
      const txt = el.querySelector(s).textContent;
      host.remove();
      return txt;
    }, [tag, sel]);
    ok(shown === 'Elige algo', `${tag}: placeholder cambiado después del montaje se ve en el campo vacío («${shown}»)`);
  }

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
