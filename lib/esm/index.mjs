/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import "./chunks/chunk-KC5TMFMV.mjs";
import {
  copy
} from "./chunks/chunk-J27NL24N.mjs";
import {
  confirmDialog
} from "./chunks/chunk-CMU4DMHV.mjs";
import {
  getTheme,
  setTheme
} from "./chunks/chunk-W5P3OGDX.mjs";
import {
  toast
} from "./chunks/chunk-JBL644AG.mjs";
import "./chunks/chunk-ICA3TM7S.mjs";
import "./chunks/chunk-PSZSDBK6.mjs";
import "./chunks/chunk-EWIIVIGD.mjs";
import "./chunks/chunk-ZBYB7WQJ.mjs";
import {
  autosize,
  countText
} from "./chunks/chunk-3LFDYVPY.mjs";
import "./chunks/chunk-FQJFMOKS.mjs";
import "./chunks/chunk-J4GXO5HF.mjs";
import "./chunks/chunk-O3R2A6RQ.mjs";
import "./chunks/chunk-6C6VPEYD.mjs";
import "./chunks/chunk-TMCJSC4C.mjs";
import "./chunks/chunk-6DTO7AHQ.mjs";
import "./chunks/chunk-EOQRJM5C.mjs";
import "./chunks/chunk-UVEFD4ZR.mjs";
import "./chunks/chunk-J4AISNOZ.mjs";
import "./chunks/chunk-72W3WKYE.mjs";
import "./chunks/chunk-IOJBBAZX.mjs";
import "./chunks/chunk-LIZQPXC3.mjs";
import "./chunks/chunk-AJSXMJDR.mjs";
import "./chunks/chunk-U77TC7K5.mjs";
import "./chunks/chunk-B7S5SY2U.mjs";
import "./chunks/chunk-HJ6FA6WA.mjs";
import "./chunks/chunk-5GDJ36YM.mjs";
import "./chunks/chunk-DO4O4DQP.mjs";
import "./chunks/chunk-GOJZBUDA.mjs";
import "./chunks/chunk-ZLIJSZWN.mjs";
import "./chunks/chunk-Z44AQYQK.mjs";
import "./chunks/chunk-KHD2AFUN.mjs";
import "./chunks/chunk-KIWXUIMA.mjs";
import "./chunks/chunk-KR3A5CGS.mjs";
import "./chunks/chunk-OKAMU2NB.mjs";
import "./chunks/chunk-QKSLHDXH.mjs";
import "./chunks/chunk-4DZTV6DW.mjs";
import {
  isOpenPopover,
  position
} from "./chunks/chunk-EWFNMPDO.mjs";
import {
  VERSION,
  emit
} from "./chunks/chunk-ZOAS4LFV.mjs";

// src/behaviors.js
function syncRange(input) {
  const min = parseFloat(input.min || "0");
  const max = parseFloat(input.max || "100");
  const pct = (parseFloat(input.value) - min) / (max - min || 1) * 100;
  input.style.setProperty("--tsl-fill", `${pct}%`);
  const out = input.dataset.tslOutput && document.querySelector(input.dataset.tslOutput);
  if (out) out.textContent = input.value + (input.dataset.tslSuffix || "");
}
function sortTable(th) {
  const table = th.closest("table");
  const tbody = table && table.tBodies[0];
  if (!tbody) return;
  const col = Array.from(th.parentElement.children).indexOf(th);
  const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
  th.parentElement.querySelectorAll("th[aria-sort]").forEach((h) => h.removeAttribute("aria-sort"));
  th.setAttribute("aria-sort", dir);
  const numeric = th.dataset.sort === "number";
  const read = (row) => {
    const cell = row.children[col];
    const raw = cell ? cell.dataset.value || cell.textContent.trim() : "";
    return numeric ? parseFloat(raw.replace(/[^0-9.-]/g, "")) || 0 : raw.toLowerCase();
  };
  const rows = Array.from(tbody.rows);
  rows.sort((a, b) => {
    const va = read(a);
    const vb = read(b);
    const cmp = numeric ? va - vb : va.localeCompare(vb);
    return dir === "ascending" ? cmp : -cmp;
  });
  rows.forEach((r) => tbody.appendChild(r));
}
function stepNumber(btn) {
  const wrap = btn.closest(".tsl-number");
  const input = wrap && wrap.querySelector("input");
  if (!input) return;
  const step = parseFloat(input.step || "1") * parseFloat(btn.dataset.step || "1");
  let next = (parseFloat(input.value) || 0) + step;
  if (input.min !== "") next = Math.max(parseFloat(input.min), next);
  if (input.max !== "") next = Math.min(parseFloat(input.max), next);
  input.value = String(next);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
document.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;
  const opener = t.closest("[data-tsl-open]");
  if (opener) {
    const target = document.getElementById(opener.dataset.tslOpen);
    if (target && typeof target.open === "function" && target.tagName === "TSL-COMMAND") target.open();
    else if (target && typeof target.showModal === "function") target.showModal();
    return;
  }
  const closer = t.closest("[data-tsl-close]");
  if (closer) {
    const dialog = closer.closest("dialog");
    if (dialog) dialog.close(closer.dataset.tslClose || "");
    else {
      const pop = closer.closest("[popover]");
      if (pop && isOpenPopover(pop)) pop.hidePopover();
    }
    return;
  }
  if (t.tagName === "DIALOG" && t.classList.contains("tsl-dialog") && !t.hasAttribute("data-tsl-static")) {
    const r = t.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) t.close();
    return;
  }
  const copyBtn = t.closest("[data-tsl-copy]");
  if (copyBtn) {
    const sel = copyBtn.dataset.tslCopyTarget;
    const source = sel ? document.querySelector(sel) : null;
    const text = source ? source.value || source.textContent : copyBtn.dataset.tslCopy;
    copy(text || "").then((ok) => {
      const label = copyBtn.textContent;
      if (copyBtn.children.length === 0) {
        copyBtn.textContent = ok ? "Copiado" : "Error";
        setTimeout(() => copyBtn.textContent = label, 1200);
      }
      emit(copyBtn, "tsl-copy", { text, ok });
    });
    return;
  }
  const themeBtn = t.closest("[data-tsl-theme-toggle]");
  if (themeBtn) {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    return;
  }
  const toggle = t.closest("[data-tsl-toggle]");
  if (toggle) {
    const on = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(on));
    emit(toggle, "tsl-change", { pressed: on });
    return;
  }
  const stepper = t.closest(".tsl-number > button[data-step]");
  if (stepper) {
    stepNumber(stepper);
    return;
  }
  const sortTh = t.closest("table[data-tsl-sortable] th[data-sort]");
  if (sortTh) sortTable(sortTh);
});
document.addEventListener("keydown", (e) => {
  const th = e.target instanceof Element && e.target.closest("table[data-tsl-sortable] th[data-sort]");
  if (th && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    sortTable(th);
  }
});
document.addEventListener("input", (e) => {
  if (e.target instanceof HTMLInputElement && e.target.classList.contains("tsl-range")) syncRange(e.target);
});
document.addEventListener(
  "pointermove",
  (e) => {
    const card = e.target instanceof Element && e.target.closest(".tsl-card--interactive");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--tsl-mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--tsl-my", `${e.clientY - r.top}px`);
  },
  { passive: true }
);
function init(root = document) {
  root.querySelectorAll("input.tsl-range").forEach(syncRange);
  root.querySelectorAll("textarea[data-tsl-autosize]").forEach(autosize);
  root.querySelectorAll("textarea[data-tsl-count]").forEach(countText);
  root.querySelectorAll("table[data-tsl-sortable] th[data-sort]").forEach((th) => {
    if (!th.hasAttribute("tabindex")) th.tabIndex = 0;
  });
}

// src/index.js
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }
  window.TeselaUI = { version: VERSION, toast, copy, confirm: confirmDialog, position, setTheme, getTheme, init };
}
export {
  VERSION,
  confirmDialog as confirm,
  copy,
  getTheme,
  init,
  position,
  setTheme,
  toast
};
