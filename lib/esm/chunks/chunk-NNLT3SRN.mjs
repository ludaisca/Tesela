/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  isRtl
} from "./chunk-KUBYC2WE.mjs";

// src/core/position.js
var OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };
function position(anchor, el, { placement = "bottom", offset = 6, padding = 8, point } = {}) {
  const a = point ? { left: point.x, right: point.x, top: point.y, bottom: point.y, width: 0, height: 0 } : anchor.getBoundingClientRect();
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
function trackPosition(anchor, el, options = {}) {
  const update = () => position(anchor, el, options);
  const { signal } = options;
  window.addEventListener("scroll", update, { capture: true, signal });
  window.addEventListener("resize", update, { signal });
  return () => {
    window.removeEventListener("scroll", update, true);
    window.removeEventListener("resize", update);
  };
}
var FOCUSABLE = "[autofocus], input:not([type=hidden]), select, textarea, button, a[href], [tabindex]:not([tabindex='-1'])";
function focusFirst(container) {
  const target = container.querySelector(FOCUSABLE);
  if (target) target.focus();
  else {
    container.tabIndex = -1;
    container.focus();
  }
}
var isOpenPopover = (el) => el.matches(":popover-open");
function dismissOnOutside(host, panel, close) {
  const outside = (e) => {
    if (!host.contains(e.target)) close();
  };
  const dismiss = (e) => {
    if (e.type === "scroll" && panel.contains(e.target)) return;
    close();
  };
  const { signal } = host;
  document.addEventListener("pointerdown", outside, { capture: true, signal });
  window.addEventListener("resize", dismiss, { signal });
  return () => {
    document.removeEventListener("pointerdown", outside, true);
    window.removeEventListener("resize", dismiss);
  };
}

export {
  position,
  trackPosition,
  FOCUSABLE,
  focusFirst,
  isOpenPopover,
  dismissOnOutside
};
