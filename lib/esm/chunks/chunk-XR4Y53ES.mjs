/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */

// src/components/sheet.js
document.addEventListener("pointerdown", (e) => {
  const handle = e.target instanceof Element && e.target.closest(".tsl-sheet__handle");
  const dialog = handle && handle.closest("dialog");
  if (!dialog) return;
  const startY = e.clientY;
  let dy = 0;
  handle.setPointerCapture(e.pointerId);
  dialog.style.transition = "none";
  const move = (ev) => {
    dy = Math.max(0, ev.clientY - startY);
    dialog.style.transform = `translateY(${dy}px)`;
  };
  const up = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", up);
    handle.removeEventListener("pointercancel", up);
    dialog.style.transition = "";
    dialog.style.transform = "";
    if (dy > Math.min(120, dialog.offsetHeight / 3)) dialog.close();
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", up);
  handle.addEventListener("pointercancel", up);
});
