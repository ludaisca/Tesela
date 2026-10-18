// Funciones de medición para el diseño adaptable. Se ejecutan DENTRO de la página (page.evaluate),
// así que cada una debe ser autónoma. Las usan scripts/audit-*.js y tests/responsive.test.js.

// Elementos que sobresalen del ancho visible de una página, sin contar los contenedores con scroll propio
// ni lo que está fuera de pantalla a propósito (cajones cerrados). El recorte de <body>/<html> no cuenta.
function measurePage() {
  const vw = document.documentElement.clientWidth;
  const desc = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 4; e = e.parentElement) {
      parts.unshift(e.localName + (e.id ? `#${e.id}` : "") + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/)[0] : ""));
    }
    return parts.join(" > ");
  };
  const offenders = [];
  document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (el.closest("dialog:not([open])") || el.closest("[hidden]") || el.closest("template") || el.closest("[popover]:not(:popover-open)")) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.right <= vw + 1 && r.left >= -1) return;
    if (r.right <= 0 || r.left >= vw) return;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) return;
    }
    offenders.push({ el: desc(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
  });
  return { vw, scrollW: document.documentElement.scrollWidth, offenders };
}

// Mide el experimento montado en el sandbox: desbordes, texto aplastado y objetivos táctiles de menos de 24 px
function measureStage() {
  const stage = document.getElementById("sandbox-stage");
  const wrap = stage.closest(".sandbox-viewport-wrap") || stage;
  const vw = document.documentElement.clientWidth;
  const sr = stage.getBoundingClientRect();
  const limit = Math.min(vw, sr.right) + 1;
  const desc = (el) => {
    const parts = [];
    for (let e = el; e && e !== stage && parts.length < 3; e = e.parentElement) parts.unshift(e.localName + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/)[0] : ""));
    return parts.join(">");
  };
  const out = [];
  stage.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden]") || el.closest("dialog:not([open])") || el.closest("[popover]:not(:popover-open)")) return;
    if (el.closest("svg") && el.localName !== "svg") return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.right <= limit) return;
    for (let a = el.parentElement; a && a !== wrap; a = a.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) return;
    out.push({ el: desc(el), right: Math.round(r.right), w: Math.round(r.width) });
  });
  const pageOver = document.documentElement.scrollWidth > vw + 1;

  // Texto aplastado: un bloque estrecho (<64 px) con texto largo, que se parte palabra a palabra
  const squeezed = [];
  stage.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden], template, svg, dialog:not([open]), [popover]:not(:popover-open), canvas")) return;
    if (!/^(block|flex|grid|table-cell|list-item|inline-block|inline-flex)$/.test(cs.display)) return;
    if (parseFloat(cs.fontSize) < 2) return; // texto oculto a la vista a propósito (p. ej. puntos de eventos)
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");
    if (own.length < 14) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.width < 64) squeezed.push({ el: desc(el), w: Math.round(r.width), text: own.slice(0, 24) });
  });

  // Objetivos táctiles de menos de 24×24 px (WCAG 2.5.8), salvo enlaces dentro de un texto
  const small = [];
  if (vw < 900) {
    stage.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=switch], [role=tab], [tabindex='0']").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden], template, svg, dialog:not([open]), [popover]:not(:popover-open)")) return;
      if (el.matches("a") && cs.display === "inline") return;
      if (el.matches("input[type=range], tsl-otp input, tsl-tags input, tsl-select input")) return;
      let r = el.getBoundingClientRect();
      const label = el.closest("label");
      if (label && (el.matches("input[type=checkbox], input[type=radio]") || cs.opacity === "0")) r = label.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Excepción: el ancho de un marco de flamegraph es proporcional a su duración (no se puede agrandar sin falsear los datos)
      if (el.closest("[data-flame]")) r = { width: 99, height: r.height };
      // Un ::before absoluto que sobresale del elemento amplía su zona de pulsación
      const pb = getComputedStyle(el, "::before");
      if (pb.content !== "none" && pb.position === "absolute") {
        r = { width: Math.max(r.width, parseFloat(pb.width) || 0), height: Math.max(r.height, parseFloat(pb.height) || 0) };
      }
      if (r.width < 24 || r.height < 24) small.push({ el: desc(el), w: Math.round(r.width), h: Math.round(r.height) });
    });
  }
  return { vw, stageW: Math.round(sr.width), over: wrap.scrollWidth > wrap.clientWidth + 1, wrapSW: wrap.scrollWidth, wrapCW: wrap.clientWidth, pageOver, offenders: out, squeezed, small };
}

module.exports = { measurePage, measureStage };
