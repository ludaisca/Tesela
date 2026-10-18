// Genera, a partir de src/meta/elements.js, los archivos que describen la API:
//   custom-elements.json            manifiesto estándar (Custom Elements Manifest 1.0)
//   types/tesela-ui.d.ts            tipos de TypeScript (elementos, eventos tipados y API global)
//   vscode.html-custom-data.json    autocompletado de etiquetas y atributos en VS Code
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const pascal = (tag) => tag.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const ifaceOf = (tag) => `${pascal(tag)}Element`;
const evMapOf = (tag) => `${pascal(tag)}EventMap`;
const text = (s) => ({ text: s });
const literals = (type) => (/^("[^"]+"( \| )?)+$/.test(type) ? [...type.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : []);

function dts(elements, api, version, presetNames) {
  const L = [];
  const doc = (d, ind = "  ") => (d ? `${ind}/** ${d.replace(/\*\//g, "*\\/")} */\n` : "");
  L.push(`// Tesela UI v${version} — tipos generados desde src/meta/elements.js. No editar a mano.`);
  L.push(`/** Ajuste de tema: \`system\` sigue al sistema operativo. */\nexport type Theme = "dark" | "light" | "system";\nexport type ResolvedTheme = "dark" | "light";\nexport type PresetName = ${presetNames.map((n) => JSON.stringify(n)).join(" | ")};`);
  L.push(`export type Side = "top" | "bottom" | "left" | "right";`);
  L.push(`export interface ToastOptions {\n  title?: string;\n  description?: string;\n  variant?: "success" | "info" | "warning" | "danger" | "neutral";\n  /** Milisegundos; 0 = no se cierra sola. */\n  duration?: number;\n  action?: { label: string; onClick?: () => void };\n}`);
  L.push(`export interface ConfirmOptions {\n  title?: string;\n  description?: string;\n  confirmLabel?: string;\n  /** \`null\` muestra solo el botón de aceptar (alerta). */\n  cancelLabel?: string | null;\n  variant?: "default" | "danger";\n}`);
  L.push(`export interface PositionOptions {\n  placement?: string;\n  offset?: number;\n  padding?: number;\n  point?: { x: number; y: number };\n}`);
  L.push(`export declare const VERSION: string;`);
  (api.constants || []).forEach((c) => L.push(`${doc(c.description, "")}export declare const ${c.name}: ${c.type};`));
  api.functions.forEach((f) => {
    L.push(`${doc(f.description, "")}export declare function ${f.name}(${f.params.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ")}): ${f.returns};`);
  });
  L.push(`export interface TeselaUIGlobal {\n  version: string;\n${(api.constants || []).map((c) => `${doc(c.description)}  ${c.name}: typeof ${c.name};`).join("\n")}\n${api.functions.map((f) => `${doc(f.description)}  ${f.name}: typeof ${f.name};`).join("\n")}\n}`);
  L.push("");

  // Tres sobrecargas: eventos propios del elemento, eventos nativos de HTMLElement y cualquier otro nombre
  const listener = (name, map, self) => {
    const opts = name === "addEventListener" ? "AddEventListenerOptions" : "EventListenerOptions";
    return [
      `  ${name}<K extends keyof ${map}>(type: K, listener: (this: ${self}, ev: ${map}[K]) => any, options?: boolean | ${opts}): void;`,
      `  ${name}<K extends keyof HTMLElementEventMap>(type: K, listener: (this: ${self}, ev: HTMLElementEventMap[K]) => any, options?: boolean | ${opts}): void;`,
      `  ${name}(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | ${opts}): void;`
    ];
  };

  elements.forEach((e) => {
    const iface = ifaceOf(e.tag);
    const parent = e.extends && e.extends.startsWith("tsl-") ? ifaceOf(e.extends) : "HTMLElement";
    const map = evMapOf(e.tag);
    if (e.events.length) {
      L.push(`export interface ${map} {\n${e.events.map((ev) => `${doc(ev.description)}  "${ev.name}": CustomEvent<${ev.detail}>;`).join("\n")}\n}`);
    }
    const members = [];
    e.properties.forEach((p) => members.push(`${doc(p.description)}  ${p.readonly ? "readonly " : ""}${p.name}: ${p.type};`));
    e.methods.forEach((m) => members.push(`${doc(m.description)}  ${m.name}(${m.params.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ")}): ${m.returns};`));
    if (e.events.length) {
      members.push(...listener("addEventListener", map, iface), ...listener("removeEventListener", map, iface));
    }
    L.push(`${doc(e.summary, "")}export interface ${iface} extends ${parent} {\n${members.join("\n")}\n}`);
    L.push(`export declare const ${e.cls}: { new (): ${iface}; prototype: ${iface} };`);
    L.push("");
  });

  L.push(`declare global {\n  interface HTMLElementTagNameMap {\n${elements.map((e) => `    "${e.tag}": ${ifaceOf(e.tag)};`).join("\n")}\n  }\n  interface Window {\n    TeselaUI: TeselaUIGlobal;\n  }\n  interface DocumentEventMap {\n    /** Cambió el tema (o el sistema operativo, con el tema «system»). */\n    "tsl-theme": CustomEvent<{ theme: Theme; resolved: ResolvedTheme }>;\n    "tsl-preset": CustomEvent<{ preset: PresetName }>;\n    "tsl-accent": CustomEvent<{ accent: string | null; fg: string | null }>;\n  }\n}\n`);
  return L.join("\n");
}

function manifest(elements, api, version) {
  const byModule = new Map();
  elements.forEach((e) => (byModule.get(e.module) || byModule.set(e.module, []).get(e.module)).push(e));
  const mod = (m) => `esm/${m}.mjs`;
  const modules = [];
  byModule.forEach((els, m) => {
    const declarations = [];
    if (els.some((e) => e.extends === "TslBar")) {
      declarations.push({ kind: "class", name: "TslBar", description: "Base común de la barra de menús y del menú de navegación.", superclass: { name: "TslElement", module: "esm/core/base.mjs" } });
    }
    els.forEach((e) => {
      const attributes = e.attributes.map((a) => ({ name: a.name, type: text(a.type), description: a.description, ...(a.default !== undefined ? { default: a.default } : {}) }));
      const members = [
        ...e.properties.map((p) => ({ kind: "field", name: p.name, type: text(p.type), description: p.description, ...(p.readonly ? { readonly: true } : {}) })),
        ...e.methods.map((mm) => ({ kind: "method", name: mm.name, description: mm.description, parameters: mm.params.map((p) => ({ name: p.name, type: text(p.type), ...(p.optional ? { optional: true } : {}) })), return: { type: text(mm.returns) } }))
      ];
      declarations.push({
        kind: "class", name: e.cls, tagName: e.tag, customElement: true, description: e.summary,
        superclass: e.extends ? { name: e.extends === "tsl-select" ? "TslSelect" : e.extends, module: mod(e.extends === "tsl-select" ? e.module : e.module) } : { name: e.formAssociated ? "TslFormElement" : "TslElement", module: e.formAssociated ? "esm/core/form.mjs" : "esm/core/base.mjs" },
        attributes, members,
        events: e.events.map((ev) => ({ name: ev.name, type: text(`CustomEvent<${ev.detail}>`), description: ev.description })),
        ...(e.cssProperties ? { cssProperties: e.cssProperties } : {}),
        ...(e.itemAttributes && e.itemAttributes.length ? { "x-itemAttributes": e.itemAttributes.map((a) => ({ name: a.name, description: a.description })) } : {}),
        ...(e.docs ? { "x-docs": e.docs } : {}),
        ...(e.formAssociated ? { "x-formAssociated": true } : {})
      });
    });
    modules.push({
      kind: "javascript-module", path: mod(m), declarations,
      exports: [
        ...els.flatMap((e) => [{ kind: "js", name: e.cls, declaration: { name: e.cls, module: mod(m) } }, { kind: "custom-element-definition", name: e.tag, declaration: { name: e.cls, module: mod(m) } }])
      ]
    });
  });
  return { schemaVersion: "1.0.0", readme: "README.md", "x-version": version, modules };
}

function vscode(elements) {
  const md = (v) => ({ kind: "markdown", value: v });
  return {
    version: 1.1,
    tags: elements.map((e) => ({
      name: e.tag,
      description: md(e.summary),
      attributes: [...e.attributes, ...(e.itemAttributes || []).map((a) => ({ ...a, description: `(en los hijos) ${a.description}` }))]
        .filter((a, i, arr) => arr.findIndex((b) => b.name === a.name) === i)
        .map((a) => ({
          name: a.name,
          description: md(`${a.description}${a.default !== undefined ? ` Por defecto: \`${a.default}\`.` : ""}`),
          ...(a.type === "boolean" ? { valueSet: "v" } : literals(a.type).length ? { values: literals(a.type).map((v) => ({ name: v })) } : {})
        }))
    })),
    valueSets: [{ name: "v", values: [] }]
  };
}

async function buildMeta(root, out, version) {
  const { elements, api } = await import(pathToFileURL(path.join(root, "src/meta/elements.js")).href);
  fs.mkdirSync(path.join(out, "types"), { recursive: true });
  const presetNames = Object.keys(JSON.parse(fs.readFileSync(path.join(root, "src/tokens/presets.json"), "utf8")).presets);
  fs.writeFileSync(path.join(out, "types/tesela-ui.d.ts"), dts(elements, api, version, presetNames));
  fs.writeFileSync(path.join(out, "custom-elements.json"), `${JSON.stringify(manifest(elements, api, version), null, 2)}\n`);
  fs.writeFileSync(path.join(out, "vscode.html-custom-data.json"), `${JSON.stringify(vscode(elements), null, 2)}\n`);
  return elements.length;
}

module.exports = { buildMeta };
