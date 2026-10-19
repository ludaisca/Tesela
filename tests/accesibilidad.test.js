// Accesibilidad automatizada: axe-core (WCAG 2.2 A/AA y buenas prácticas) sobre todas las secciones de
// components.html, en tema oscuro y claro. Una línea por sección: así un fallo dice dónde está.
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
// Las muestras de la tabla de tokens pintan cada color sobre el fondo para enseñarlo, incluido el
// texto tenue (3:1 a propósito, solo para texto decorativo): no son texto de la interfaz
const EXCLUDE = ['.docs-swatch-pair'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));

  for (const theme of ['dark', 'light']) {
    await p.goto(`${base}/components.html`);
    await p.waitForLoadState('networkidle');
    await p.evaluate((t) => TeselaUI.setTheme(t), theme);
    // Sin transiciones: axe mide colores ya asentados
    await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    await p.waitForTimeout(200);
    const sections = await p.evaluate(() => Array.from(document.querySelectorAll('section.doc[id]')).map((s) => s.id));

    let builder = new AxeBuilder({ page: p }).withTags(TAGS);
    EXCLUDE.forEach((sel) => (builder = builder.exclude(sel)));
    const { violations } = await builder.analyze();

    // Cada nodo con fallo, a su sección (o «fuera de las secciones»: cabecera, navegación…)
    const bySection = new Map();
    for (const v of violations) {
      const where = await p.evaluate((targets) => targets.map((t) => {
        try {
          const el = document.querySelector(t[t.length - 1]);
          const s = el && el.closest('section.doc[id]');
          return s ? s.id : '(fuera de las secciones)';
        } catch (_) {
          return '(fuera de las secciones)';
        }
      }), v.nodes.map((n) => n.target));
      v.nodes.forEach((n, i) => {
        const list = bySection.get(where[i]) || bySection.set(where[i], []).get(where[i]);
        list.push(`${v.id}: ${n.target.join(' ')} — ${(n.failureSummary || '').split('\n').slice(1).join(' ').trim().slice(0, 140)}`);
      });
    }

    ok(sections.length >= 100, `${theme}: se analizan las ${sections.length} secciones de components.html`);
    for (const id of sections) {
      const found = bySection.get(id) || [];
      ok(found.length === 0, `${theme}: #${id} sin fallos de axe${found.length ? `:\n   - ${found.slice(0, 5).join('\n   - ')}` : ''}`);
    }
    const outside = bySection.get('(fuera de las secciones)') || [];
    ok(outside.length === 0, `${theme}: cabecera y navegación sin fallos de axe${outside.length ? `:\n   - ${outside.slice(0, 5).join('\n   - ')}` : ''}`);
  }

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
