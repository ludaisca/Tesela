// Utilidades de color para las comprobaciones de contraste (WCAG 2.x). Sin dependencias.
// Acepta #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() y compone el color con transparencia sobre un fondo.

function parse(str) {
  const s = String(str).trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) throw new Error(`Color no válido: ${str}`);
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  throw new Error(`Color no válido: ${str}`);
}

// Compone `fg` (con su alfa) sobre un fondo opaco
function over(fg, bg) {
  const f = typeof fg === "string" ? parse(fg) : fg;
  const b = typeof bg === "string" ? parse(bg) : bg;
  return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 };
}

function luminance(c) {
  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

// Relación de contraste de `fg` sobre `bg` (el fondo debe ser opaco o se compone sobre blanco)
function contrast(fg, bg) {
  const b = over(typeof bg === "string" ? parse(bg) : bg, { r: 255, g: 255, b: 255, a: 1 });
  const f = over(typeof fg === "string" ? parse(fg) : fg, b);
  const [hi, lo] = [luminance(f), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

module.exports = { parse, over, luminance, contrast };
