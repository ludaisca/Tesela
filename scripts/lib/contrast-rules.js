// Reglas de contraste (WCAG 2.x) que debe cumplir cada preset en cada modo.
// Las superficies translúcidas se componen sobre el fondo antes de medir.
const { contrast, over, parse } = require("./color");

const TEXT = ["success", "warning", "danger", "info"];

// min: mínimos por regla; el preset «alto-contraste» exige AAA (7:1) en todo el texto
function minimums(preset) {
  const aaa = preset === "alto-contraste";
  return { body: 7, muted: aaa ? 7 : 4.5, subtle: aaa ? 7 : 3, accentText: aaa ? 7 : 4.5, accentUi: 3, semantic: aaa ? 7 : 4.5, badge: aaa ? 7 : 4.5 };
}

function check(tokensApi) {
  const out = [];
  const modes = ["dark", "light"];
  const presets = { tesela: {}, ...tokensApi.presets };
  Object.entries(presets).forEach(([name, def]) => {
    modes.forEach((mode) => {
      const ov = { ...(def.common || {}), ...(def[mode] || {}) };
      const v = tokensApi.resolve(mode, ov);
      const min = minimums(name);
      const bg = parse(v["color.bg"]);
      const elev = parse(v["color.bg-elevated"]);
      const add = (rule, label, ratio, need) => out.push({ preset: name, mode, rule, label, ratio, min: need, ok: ratio >= need - 1e-9 });
      [["bg", bg], ["bg-elevated", elev]].forEach(([n, base]) => {
        add("body", `texto / ${n}`, contrast(v["color.fg"], base), min.body);
        add("muted", `texto atenuado / ${n}`, contrast(v["color.fg-muted"], base), min.muted);
        add("subtle", `texto tenue / ${n}`, contrast(v["color.fg-subtle"], base), min.subtle);
        TEXT.forEach((t) => add("semantic", `${t} / ${n}`, contrast(v[`color.${t}`], base), min.semantic));
      });
      add("accentText", "texto del acento / acento", contrast(v["color.accent-fg"], v["color.accent"]), min.accentText);
      add("accentText", "texto de peligro / peligro (botón)", contrast(v["color.danger-fg"], v["color.danger"]), min.accentText);
      add("accentUi", "acento / fondo", contrast(v["color.accent"], bg), min.accentUi);
      // Insignias: texto del color sobre su propio velo (15 % del color sobre el fondo)
      TEXT.forEach((t) => {
        const tint = over({ ...parse(v[`color.${t}`]), a: 0.15 }, bg);
        add("badge", `insignia ${t}`, contrast(v[`color.${t}`], tint), min.badge);
      });
    });
  });
  return out;
}

module.exports = { check, minimums };
