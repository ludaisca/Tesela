import { baseIcons } from "../icons/base.js";

/*
 * Registro de iconos. Cada biblioteca tiene un nombre y resuelve un nombre de icono a SVG:
 *   - "tesela" (por defecto): el set base incluido, síncrono y sin red (iconos de Lucide).
 *   - Las que registres con registerIcons() (SVG propios) o registerIconLibrary() (cualquier fuente:
 *     una URL de CDN o de tu servidor, un import ESM, una función que devuelva el SVG…).
 * Un SVG externo se limpia antes de insertarse (sin <script>, <foreignObject>, manejadores on* ni
 * enlaces javascript:) y se guarda en caché por URL.
 */

const DEFAULT = "tesela";
const libraries = new Map();
const cache = new Map();
const listeners = new Set();

// Atributos de presentación de un icono de trazo (los de Lucide)
const STROKE = { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" };

libraries.set(DEFAULT, { icons: { ...baseIcons }, viewBox: "0 0 24 24", attrs: STROKE });

const SVG_NS = "http://www.w3.org/2000/svg";

// Convierte el texto de un SVG en un elemento seguro, o null si no es un SVG válido
export function parseSvg(text) {
  const doc = new DOMParser().parseFromString(String(text).trim(), "image/svg+xml");
  const svg = doc.documentElement;
  if (!svg || svg.localName !== "svg" || doc.querySelector("parsererror")) return null;
  svg.querySelectorAll("script, foreignObject, title, desc").forEach((n) => n.remove());
  for (const el of [svg, ...svg.querySelectorAll("*")]) {
    for (const a of [...el.attributes]) {
      const v = a.value.trim().toLowerCase();
      if (a.name.startsWith("on") || ((a.name === "href" || a.name === "xlink:href") && v.startsWith("javascript:"))) el.removeAttribute(a.name);
    }
  }
  return document.importNode(svg, true);
}

// Crea el <svg> de un icono a partir de su contenido interior y los atributos de la biblioteca
function fromInner(inner, lib) {
  const svg = parseSvg(`<svg xmlns="${SVG_NS}" viewBox="${lib.viewBox || "0 0 24 24"}">${inner}</svg>`);
  if (svg) for (const [k, v] of Object.entries(lib.attrs || {})) svg.setAttribute(k, v);
  return svg;
}

function finish(svg, lib, name) {
  if (!svg) return null;
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.removeAttribute("class");
  svg.removeAttribute("role");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("tsl-icon__svg");
  if (lib.mutator) lib.mutator(svg, name);
  return svg;
}

const isFullSvg = (s) => /^\s*<svg[\s>]/i.test(s);

// Texto de un SVG remoto, pedido una sola vez por URL
const fetchText = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : null)).catch(() => null));
  return cache.get(url);
};

// SVG de un archivo suelto (<tsl-icon src="…">)
export async function iconFromUrl(url) {
  const text = await fetchText(url);
  return text ? finish(parseSvg(text), {}, url) : null;
}

// SVG de un icono ya disponible sin red (biblioteca por defecto o iconos registrados), o null
export function iconSync(name, library = DEFAULT) {
  const lib = libraries.get(library || DEFAULT);
  const src = lib && lib.icons && lib.icons[name];
  if (typeof src !== "string") return null;
  return finish(isFullSvg(src) ? parseSvg(src) : fromInner(src, lib), lib, name);
}

// SVG de cualquier icono (puede pedirlo a la red). Devuelve null si no existe.
export async function getIcon(name, library = DEFAULT) {
  const sync = iconSync(name, library);
  if (sync) return sync;
  const lib = libraries.get(library || DEFAULT);
  if (!lib || !lib.resolver) return null;
  let src = await lib.resolver(name);
  if (src && typeof src === "object" && "default" in src) src = src.default; // import() de un módulo
  if (!src) return null;
  if (/^(https?:|\/|\.{1,2}\/|data:)/.test(src) && !isFullSvg(src)) {
    src = await fetchText(src);
    if (!src) return null;
  }
  return finish(isFullSvg(src) ? parseSvg(src) : fromInner(src, lib), lib, name);
}

/**
 * Registra una biblioteca de iconos.
 *   registerIconLibrary("lucide", iconLibraries.lucide())
 *   registerIconLibrary("marca", { resolver: (n) => `/iconos/${n}.svg` })
 *   registerIconLibrary("propios", { icons: { cohete: "<svg …>…</svg>" } })
 * resolver(name) puede devolver una URL, el texto de un SVG, el contenido interior de un SVG o una
 * promesa de cualquiera de ellos. mutator(svg, name) ajusta el elemento antes de insertarlo
 * (p. ej. fill="currentColor"). viewBox y attrs se aplican a los SVG dados como contenido interior.
 */
export function registerIconLibrary(name, options = {}) {
  const prev = libraries.get(name) || {};
  libraries.set(name, { ...prev, ...options, icons: { ...(prev.icons || {}), ...(options.icons || {}) } });
  listeners.forEach((fn) => fn(name));
}

// Añade iconos sueltos (SVG completos o su contenido interior) a una biblioteca, por defecto a la base
export function registerIcons(icons, library = DEFAULT) {
  registerIconLibrary(library, { icons });
}

export const unregisterIconLibrary = (name) => {
  if (name === DEFAULT) return;
  libraries.delete(name);
  listeners.forEach((fn) => fn(name));
};

export const iconNames = (library = DEFAULT) => Object.keys((libraries.get(library) || {}).icons || {}).sort();
export const onLibraryChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const jsdelivr = (path) => `https://cdn.jsdelivr.net/npm/${path}`;
const fillCurrent = (svg) => {
  if (!svg.getAttribute("fill") || svg.getAttribute("fill") === "black") svg.setAttribute("fill", "currentColor");
};

/*
 * Adaptadores para bibliotecas conocidas. Cada uno devuelve las opciones para registerIconLibrary y
 * acepta { base } para servir los SVG desde tu propio servidor en lugar de jsDelivr (misma estructura
 * de carpetas que el paquete de npm). Las versiones están fijadas: cambiarlas es una decisión explícita.
 */
export const iconLibraries = {
  // Lucide (ISC): más de 1600 iconos de trazo; el mismo estilo que el set base
  lucide: ({ base = jsdelivr("lucide-static@1.59.0/icons") } = {}) => ({
    resolver: (n) => `${base}/${n}.svg`
  }),
  // Tabler (MIT): más de 5900 iconos; variant "outline" (trazo) o "filled"
  tabler: ({ variant = "outline", base = jsdelivr("@tabler/icons@3.49.0/icons") } = {}) => ({
    resolver: (n) => `${base}/${variant}/${n}.svg`
  }),
  // Phosphor (MIT): seis pesos (thin, light, regular, bold, fill, duotone)
  phosphor: ({ weight = "regular", base = jsdelivr("@phosphor-icons/core@2.1.1/assets") } = {}) => ({
    resolver: (n) => `${base}/${weight}/${n}${weight === "regular" ? "" : `-${weight}`}.svg`
  }),
  // Heroicons (MIT): variant "outline" o "solid" (24 px), "mini" (20 px) o "micro" (16 px)
  heroicons: ({ variant = "outline", base = jsdelivr("heroicons@2.2.0") } = {}) => ({
    resolver: (n) => `${base}/${variant === "mini" ? "20/solid" : variant === "micro" ? "16/solid" : `24/${variant}`}/${n}.svg`
  }),
  // Material Symbols (Apache 2.0): style "outlined", "rounded" o "sharp"; fill: true usa la variante rellena
  material: ({ style = "outlined", fill = false, base = jsdelivr("@material-symbols/svg-400@0.48.0") } = {}) => ({
    resolver: (n) => `${base}/${style}/${n}${fill ? "-fill" : ""}.svg`,
    mutator: fillCurrent
  }),
  // Simple Icons (CC0): logotipos de marcas (respeta las normas de uso de cada marca)
  simple: ({ base = jsdelivr("simple-icons@16.35.0/icons") } = {}) => ({
    resolver: (n) => `${base}/${n}.svg`,
    mutator: fillCurrent
  })
};

// Atajo para los componentes: un <span class="tsl-icon"> con el SVG del set base, listo para insertar
export function icon(name, className = "") {
  const span = document.createElement("span");
  span.className = `tsl-icon${className ? ` ${className}` : ""}`;
  span.setAttribute("aria-hidden", "true");
  const svg = iconSync(name);
  if (svg) span.appendChild(svg);
  return span;
}
