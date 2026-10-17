/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */

// src/components/textarea.js
function autosize(ta) {
  const cs = getComputedStyle(ta);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
  const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  const maxRows = parseInt(ta.dataset.maxRows || "0", 10);
  ta.style.height = "auto";
  const full = ta.scrollHeight + border;
  const cap = maxRows ? lh * maxRows + pad + border : Infinity;
  ta.style.height = `${Math.min(full, cap)}px`;
  ta.style.overflowY = full > cap ? "auto" : "hidden";
}
function countText(ta) {
  const out = ta.dataset.tslCount && document.querySelector(ta.dataset.tslCount);
  if (!out) return;
  const max = ta.maxLength > 0 ? ta.maxLength : 0;
  out.textContent = max ? `${ta.value.length} / ${max}` : String(ta.value.length);
  out.classList.toggle("is-over", Boolean(max) && ta.value.length >= max);
}
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLTextAreaElement)) return;
  if (t.hasAttribute("data-tsl-autosize")) autosize(t);
  if (t.dataset.tslCount) countText(t);
});

export {
  autosize,
  countText
};
