/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias · Iconos: Lucide (ISC), (c) Lucide Icons and Contributors */
import {
  copy
} from "./chunks/chunk-BB7T5XPI.mjs";
import {
  confirmDialog
} from "./chunks/chunk-PQJIRV5S.mjs";
import {
  getDirection,
  getPreset,
  getResolvedTheme,
  getTheme,
  presets,
  setAccent,
  setDirection,
  setPreset,
  setTheme
} from "./chunks/chunk-AHLQTCXC.mjs";
import {
  toast
} from "./chunks/chunk-4C7TRKPI.mjs";
import "./chunks/chunk-ZCVN3UUP.mjs";
import "./chunks/chunk-IETU4A2W.mjs";
import "./chunks/chunk-O2KPEL3D.mjs";
import "./chunks/chunk-HLEQKWI5.mjs";
import "./chunks/chunk-P3HSQISW.mjs";
import "./chunks/chunk-RBRNRRB7.mjs";
import "./chunks/chunk-46GT4M45.mjs";
import "./chunks/chunk-EU3CIIDG.mjs";
import "./chunks/chunk-QLVMHNXZ.mjs";
import "./chunks/chunk-XR4Y53ES.mjs";
import "./chunks/chunk-QSSLWIF7.mjs";
import "./chunks/chunk-63NXR4WQ.mjs";
import "./chunks/chunk-TJYLMFR7.mjs";
import "./chunks/chunk-CXOUGXGW.mjs";
import "./chunks/chunk-MNPLETMR.mjs";
import "./chunks/chunk-I3INC34U.mjs";
import {
  autosize,
  countText
} from "./chunks/chunk-7SBQ3Q2I.mjs";
import "./chunks/chunk-DHS3AUIU.mjs";
import "./chunks/chunk-R3Y7QQ22.mjs";
import "./chunks/chunk-2KT3XEDB.mjs";
import "./chunks/chunk-GSSPAAMZ.mjs";
import "./chunks/chunk-UWBIPGTR.mjs";
import "./chunks/chunk-KT5SCEZY.mjs";
import "./chunks/chunk-DFCGWI5V.mjs";
import "./chunks/chunk-HW44VJAC.mjs";
import "./chunks/chunk-PRCGWH5B.mjs";
import "./chunks/chunk-E5ARZDNQ.mjs";
import "./chunks/chunk-O6ZTMEFM.mjs";
import "./chunks/chunk-JFYSJUKC.mjs";
import "./chunks/chunk-7OVNZXI5.mjs";
import "./chunks/chunk-5HTYOLQM.mjs";
import "./chunks/chunk-AFXJXBEJ.mjs";
import "./chunks/chunk-SMYXSTQP.mjs";
import "./chunks/chunk-3UILDMWN.mjs";
import "./chunks/chunk-SHBAP6WN.mjs";
import "./chunks/chunk-TRTBB62S.mjs";
import "./chunks/chunk-O6DS5H5K.mjs";
import "./chunks/chunk-BAMDKX5D.mjs";
import "./chunks/chunk-4MKXKWVU.mjs";
import "./chunks/chunk-PIARUXAU.mjs";
import "./chunks/chunk-AOL6YQ5R.mjs";
import "./chunks/chunk-5X53KRUA.mjs";
import "./chunks/chunk-O7LKKASK.mjs";
import "./chunks/chunk-5QMO65M2.mjs";
import "./chunks/chunk-UGLJSQP3.mjs";
import {
  getIcon,
  iconLibraries,
  iconNames,
  registerIconLibrary,
  registerIcons,
  unregisterIconLibrary
} from "./chunks/chunk-VKGZI2YC.mjs";
import "./chunks/chunk-UUBHD3GY.mjs";
import "./chunks/chunk-PG27P2EE.mjs";
import "./chunks/chunk-CWW3V55V.mjs";
import "./chunks/chunk-HP2KEPMO.mjs";
import "./chunks/chunk-MOCSE4V7.mjs";
import {
  isOpenPopover,
  position
} from "./chunks/chunk-IRN2HHDY.mjs";
import {
  VERSION,
  emit
} from "./chunks/chunk-LW5JCRG7.mjs";

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
      const icon = copyBtn.querySelector(":scope > tsl-icon:only-child");
      if (icon && !copyBtn.textContent.trim()) {
        const prev = icon.dataset.tslCopyIcon || icon.getAttribute("name");
        icon.dataset.tslCopyIcon = prev;
        icon.setAttribute("name", ok ? "check" : "x");
        clearTimeout(icon._tslCopyTimer);
        icon._tslCopyTimer = setTimeout(() => {
          icon.setAttribute("name", prev);
          delete icon.dataset.tslCopyIcon;
        }, 1200);
      } else if (copyBtn.children.length === 0) {
        copyBtn.textContent = ok ? "Copiado" : "Error";
        setTimeout(() => copyBtn.textContent = label, 1200);
      }
      emit(copyBtn, "tsl-copy", { text, ok });
    });
    return;
  }
  const themeBtn = t.closest("[data-tsl-theme-toggle]");
  if (themeBtn) {
    setTheme(getResolvedTheme() === "dark" ? "light" : "dark");
    return;
  }
  const themeSet = t.closest("[data-tsl-theme]");
  if (themeSet) {
    setTheme(themeSet.dataset.tslTheme);
    return;
  }
  const presetSet = t.closest("[data-tsl-preset]");
  if (presetSet) {
    setPreset(presetSet.dataset.tslPreset);
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
  window.TeselaUI = { version: VERSION, toast, copy, confirm: confirmDialog, position, setTheme, getTheme, getResolvedTheme, setPreset, getPreset, setAccent, setDirection, getDirection, presets, init, getIcon, iconLibraries, iconNames, registerIconLibrary, registerIcons, unregisterIconLibrary };
}
export {
  VERSION,
  confirmDialog as confirm,
  copy,
  getDirection,
  getIcon,
  getPreset,
  getResolvedTheme,
  getTheme,
  iconLibraries,
  iconNames,
  init,
  position,
  presets,
  registerIconLibrary,
  registerIcons,
  setAccent,
  setDirection,
  setPreset,
  setTheme,
  toast,
  unregisterIconLibrary
};
