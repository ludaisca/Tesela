import { isRtl } from "./base.js";

const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Posiciona `el` (position: fixed) junto a `anchor` o a un punto { x, y }.
 * placement: "top|bottom|left|right" + "-start|-end" opcional. Si no cabe, se voltea
 * al lado opuesto; después se ajusta para no salirse de la ventana. Devuelve el lado final.
 * En RTL, "start"/"end" y también "left"/"right" se leen como inicio/fin de la lectura (se espejan).
 */
export function position(anchor, el, { placement = "bottom", offset = 6, padding = 8, point } = {}) {
  const a = point
    ? { left: point.x, right: point.x, top: point.y, bottom: point.y, width: 0, height: 0 }
    : anchor.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  let [side, align = "center"] = placement.split("-");
  const rtl = isRtl(anchor && anchor.nodeType ? anchor : el);
  if (rtl && (side === "left" || side === "right")) side = OPPOSITE[side];
  const fits = {
    top: a.top - offset - h >= padding,
    bottom: a.bottom + offset + h <= vh - padding,
    left: a.left - offset - w >= padding,
    right: a.right + offset + w <= vw - padding
  };
  if (!fits[side] && fits[OPPOSITE[side]]) side = OPPOSITE[side];

  let x;
  let y;
  if (side === "top" || side === "bottom") {
    y = side === "top" ? a.top - offset - h : a.bottom + offset;
    const atStart = rtl ? a.right - w : a.left;
    const atEnd = rtl ? a.left : a.right - w;
    x = align === "start" ? atStart : align === "end" ? atEnd : a.left + a.width / 2 - w / 2;
  } else {
    x = side === "left" ? a.left - offset - w : a.right + offset;
    y = align === "start" ? a.top : align === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
  }
  x = Math.max(padding, Math.min(x, vw - w - padding));
  y = Math.max(padding, Math.min(y, vh - h - padding));
  el.style.left = `${Math.round(x)}px`;
  el.style.top = `${Math.round(y)}px`;
  el.dataset.side = side;
  return side;
}

// Reposiciona mientras el elemento esté abierto (scroll en cualquier contenedor y resize)
export function trackPosition(anchor, el, options) {
  const update = () => position(anchor, el, options);
  window.addEventListener("scroll", update, true);
  window.addEventListener("resize", update);
  return () => {
    window.removeEventListener("scroll", update, true);
    window.removeEventListener("resize", update);
  };
}

export const FOCUSABLE = "[autofocus], input:not([type=hidden]), select, textarea, button, a[href], [tabindex]:not([tabindex='-1'])";

export function focusFirst(container) {
  const target = container.querySelector(FOCUSABLE);
  if (target) target.focus();
  else {
    container.tabIndex = -1;
    container.focus();
  }
}

export const isOpenPopover = (el) => el.matches(":popover-open");

// Cierre propio para paneles manuales: clic fuera del campo, scroll o resize
export function dismissOnOutside(host, panel, close) {
  const outside = (e) => {
    if (!host.contains(e.target)) close();
  };
  const dismiss = (e) => {
    if (e.type === "scroll" && panel.contains(e.target)) return;
    close();
  };
  document.addEventListener("pointerdown", outside, true);
  window.addEventListener("resize", dismiss);
  return () => {
    document.removeEventListener("pointerdown", outside, true);
    window.removeEventListener("resize", dismiss);
  };
}
