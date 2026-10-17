// API: la descripción de src/meta/elements.js coincide con el código, y los archivos generados son válidos.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

(async () => {
  const { elements, api } = await import(pathToFileURL(path.join(root, 'src/meta/elements.js')).href);
  const base = ['src/core/base.js', 'src/core/form.js'].map(read).join('\n');
  const docsHtml = read('components.html');

  // --- 1) Todos los elementos definidos en el código están descritos, y viceversa
  const defined = new Set();
  fs.readdirSync(path.join(root, 'src/components')).forEach((f) => [...read(`src/components/${f}`).matchAll(/define\("(tsl-[a-z-]+)"/g)].forEach((m) => defined.add(m[1])));
  const described = new Set(elements.map((e) => e.tag));
  ok(JSON.stringify([...defined].sort()) === JSON.stringify([...described].sort()),
    `los ${defined.size} elementos definidos coinciden con los descritos` + ([...defined].filter((t) => !described.has(t)).concat([...described].filter((t) => !defined.has(t))).join(',') ? ` (distintos: ${[...defined].filter((t) => !described.has(t)).concat([...described].filter((t) => !defined.has(t)))})` : ''));

  // --- 2) Por módulo: atributos, eventos, clases, propiedades y métodos
  const byModule = new Map();
  elements.forEach((e) => (byModule.get(e.module) || byModule.set(e.module, []).get(e.module)).push(e));
  const problems = [];
  byModule.forEach((els, mod) => {
    const src = read(`src/${mod}.js`);
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const all = `${code}\n${base}`;
    els.forEach((e) => {
      if (!new RegExp(`export class ${e.cls}\\b`).test(src)) problems.push(`${e.tag}: falta export class ${e.cls}`);
      e.attributes.forEach((a) => { if (!all.includes(`"${a.name}"`)) problems.push(`${e.tag}: el atributo «${a.name}» no aparece en el código`); });
      (e.itemAttributes || []).forEach((a) => { if (!all.includes(`"${a.name}"`) && !all.includes(`dataset.${a.name.replace(/^data-/, '').replace(/-(\w)/g, (_, c) => c.toUpperCase())}`)) problems.push(`${e.tag}: el atributo de ítem «${a.name}» no aparece en el código`); });
      e.properties.forEach((p) => { if (!new RegExp(`(?:get |set |this\\.|^\\s+)${p.name}\\b`, 'm').test(all)) problems.push(`${e.tag}: la propiedad «${p.name}» no existe`); });
      e.methods.forEach((m) => { if (!new RegExp(`^\\s+(?:async )?${m.name}\\(`, 'm').test(all)) problems.push(`${e.tag}: el método «${m.name}()» no existe`); });
      e.events.forEach((ev) => { if (!code.includes(`"${ev.name}"`) && !all.includes(`"${ev.name}"`)) problems.push(`${e.tag}: el evento «${ev.name}» no se emite`); });
    });
    // Sentido inverso: todo lo que el código lee/emite está documentado
    const documented = new Set(els.flatMap((e) => [...e.attributes, ...(e.itemAttributes || [])].map((a) => a.name)));
    const readAttrs = new Set([...code.matchAll(/(?:getAttribute|hasAttribute)\("([a-z][a-z0-9-]*)"\)/g)].map((m) => m[1]));
    readAttrs.forEach((a) => { if (!/^(aria-|role$|tabindex$|class$)/.test(a) && !documented.has(a)) problems.push(`${mod}: el código lee «${a}» pero no está documentado`); });
    const emitted = new Set([...code.matchAll(/emit\([^,]+,\s*"(tsl-[a-z-]+)"/g)].map((m) => m[1]));
    const docEvents = new Set(els.flatMap((e) => e.events.map((ev) => ev.name)));
    emitted.forEach((ev) => { if (!docEvents.has(ev)) problems.push(`${mod}: emite «${ev}» sin documentarlo`); });
    docEvents.forEach((ev) => { if (!emitted.has(ev) && !all.includes(`"${ev}"`)) problems.push(`${mod}: documenta «${ev}» pero no lo emite`); });
  });
  ok(problems.length === 0, `la metadata de los ${elements.length} elementos coincide con el código (atributos, eventos, miembros)` + (problems.length ? `:\n   - ${problems.slice(0, 12).join('\n   - ')}` : ''));

  // --- 3) Documentación: cada sección referenciada existe y no hay secciones de componentes sin API
  const missingDocs = elements.flatMap((e) => (e.docs || []).filter((d) => !docsHtml.includes(`id="${d}"`)).map((d) => `${e.tag}→#${d}`));
  ok(missingDocs.length === 0, 'cada elemento apunta a una sección real de components.html' + (missingDocs.length ? ` (faltan: ${missingDocs})` : ''));

  // --- 4) Archivos generados
  const manifest = JSON.parse(read('lib/custom-elements.json'));
  const decls = manifest.modules.flatMap((m) => m.declarations).filter((d) => d.tagName);
  ok(manifest.schemaVersion === '1.0.0' && decls.length === elements.length, `custom-elements.json: esquema 1.0.0 con ${decls.length} elementos`);
  const defs = manifest.modules.flatMap((m) => m.exports).filter((x) => x.kind === 'custom-element-definition');
  ok(defs.length === elements.length && defs.every((d) => fs.existsSync(path.join(root, 'lib', manifest.modules.find((m) => m.exports.includes(d)).path))), 'custom-elements.json: cada definición apunta a un módulo ESM que existe');
  const select = decls.find((d) => d.tagName === 'tsl-select');
  ok(select.attributes.some((a) => a.name === 'multiple' && a.type.text === 'boolean') && select.events.some((e) => e.name === 'tsl-change') && select.members.some((m) => m.name === 'setOptions'), 'custom-elements.json: tsl-select lleva atributos, eventos y métodos');
  const vs = JSON.parse(read('lib/vscode.html-custom-data.json'));
  ok(vs.tags.length === elements.length && vs.tags.find((t) => t.name === 'tsl-data-table').attributes.some((a) => a.name === 'density' && a.values && a.values.length === 3), 'datos de VS Code: todas las etiquetas y valores enumerados (density)');
  const dts = read('lib/types/tesela-ui.d.ts');
  ok(elements.every((e) => dts.includes(`"${e.tag}": `)) && dts.includes('interface Window'), 'tesela-ui.d.ts: HTMLElementTagNameMap incluye todos los elementos y Window.TeselaUI');
  ok(api.functions.every((f) => new RegExp(`export declare function ${f.name}\\(`).test(dts)), `tesela-ui.d.ts: declara las ${api.functions.length} funciones de la API global`);

  // --- 5) TypeScript real: el uso válido compila en strict y los errores esperados siguen siéndolo
  let tsOut = '';
  try {
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', path.join(root, 'tests/types/tsconfig.json')], { stdio: 'pipe' });
  } catch (e) { tsOut = String(e.stdout || e.message).split('\n').slice(0, 6).join('\n'); }
  ok(tsOut === '', 'tsc (strict): tests/types/usage.ts compila y rechaza los usos incorrectos' + (tsOut ? `:\n${tsOut}` : ''));

  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
