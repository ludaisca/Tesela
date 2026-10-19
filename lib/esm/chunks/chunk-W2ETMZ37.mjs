/*! Tesela UI v1.4.0 — biblioteca de componentes sin dependencias */
import {
  TslElement,
  define,
  emit,
  nextId,
  storage
} from "./chunk-O4IHLMQS.mjs";

// src/components/sidebar.js
var TslSidebar = class extends TslElement {
  setup() {
    this.id = this.id || nextId("tsl-sidebar");
    if (!this.hasAttribute("role")) this.setAttribute("role", "navigation");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", this.getAttribute("label") || "Barra lateral");
    this.layout = this.closest(".tsl-sidebar-layout") || this.parentElement;
    this.mobile = false;
    this.mobileIsOpen = false;
    const saved = this.storageKey && storage.get(`tsl-sidebar:${this.storageKey}`);
    if (saved !== null && saved !== void 0) this.toggleAttribute("collapsed", saved === "1");
    this.backdrop = document.createElement("div");
    this.backdrop.className = "tsl-sidebar__backdrop";
    this.backdrop.addEventListener("click", () => this.closeMobile());
    this.layout.appendChild(this.backdrop);
    this.querySelectorAll(".tsl-sidebar__sub").forEach((sub) => {
      const btn = sub.previousElementSibling;
      if (!btn || !btn.classList.contains("tsl-sidebar__item")) return;
      sub.id = sub.id || nextId("tsl-sidebar-sub");
      btn.setAttribute("aria-controls", sub.id);
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", String(!sub.hidden));
      sub.hidden = btn.getAttribute("aria-expanded") !== "true";
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        sub.hidden = !open;
      });
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.mobile && this.mobileIsOpen) {
        e.preventDefault();
        this.closeMobile();
      }
    });
    this.addEventListener("click", (e) => {
      if (this.mobile && e.target.closest("a[href]")) this.closeMobile();
    });
    this.onKey = (e) => {
      const key = this.getAttribute("shortcut");
      if (key && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        this.toggle();
      }
    };
    document.addEventListener("keydown", this.onKey);
    this.resizer = new ResizeObserver(() => this.measure());
    this.resizer.observe(this.layout);
    this.measure();
  }
  disconnectedCallback() {
    document.removeEventListener("keydown", this.onKey);
    if (this.resizer) this.resizer.disconnect();
    if (this.backdrop) this.backdrop.remove();
    this._tslReady = false;
  }
  get storageKey() {
    return this.getAttribute("storage-key");
  }
  get breakpoint() {
    return parseInt(this.getAttribute("breakpoint"), 10) || 720;
  }
  get side() {
    return this.getAttribute("side") === "end" ? "end" : "start";
  }
  get collapsed() {
    return this.hasAttribute("collapsed");
  }
  set collapsed(v) {
    this.toggle(!v);
  }
  get isMobile() {
    return this.mobile;
  }
  get mobileOpen() {
    return this.mobileIsOpen;
  }
  measure() {
    const mobile = this.layout.clientWidth < this.breakpoint;
    if (mobile !== this.mobile) {
      this.mobile = mobile;
      this.mobileIsOpen = false;
    }
    this.paint();
  }
  /** Alterna la barra: en escritorio la contrae, en móvil abre o cierra el cajón. Con `true` la muestra y con `false` la oculta. */
  toggle(show) {
    if (this.mobile) {
      const next = show === void 0 ? !this.mobileIsOpen : Boolean(show);
      return next ? this.openMobile() : this.closeMobile();
    }
    const collapsed = show === void 0 ? !this.collapsed : !show;
    if (collapsed === this.collapsed) return;
    this.toggleAttribute("collapsed", collapsed);
    if (this.storageKey) storage.set(`tsl-sidebar:${this.storageKey}`, collapsed ? "1" : "0");
    this.paint();
    emit(this, "tsl-toggle", { collapsed, open: !collapsed, mobile: false });
  }
  collapse() {
    this.toggle(false);
  }
  expand() {
    this.toggle(true);
  }
  openMobile() {
    if (!this.mobile || this.mobileIsOpen) return;
    this.mobileIsOpen = true;
    this.returnFocus = document.activeElement;
    this.paint();
    const first = this.querySelector("a[href], button:not([disabled])");
    if (first) first.focus();
    emit(this, "tsl-toggle", { collapsed: this.collapsed, open: true, mobile: true });
  }
  closeMobile() {
    if (!this.mobile || !this.mobileIsOpen) return;
    this.mobileIsOpen = false;
    this.paint();
    if (this.returnFocus && this.returnFocus.isConnected) this.returnFocus.focus();
    emit(this, "tsl-toggle", { collapsed: this.collapsed, open: false, mobile: true });
  }
  paint() {
    const rail = !this.mobile && this.collapsed;
    const hidden = this.mobile ? !this.mobileIsOpen : rail && this.getAttribute("collapsible") === "offcanvas";
    this.dataset.side = this.side;
    this.toggleAttribute("data-mobile", this.mobile);
    this.toggleAttribute("data-open", this.mobile && this.mobileIsOpen);
    this.toggleAttribute("data-rail", rail && this.getAttribute("collapsible") !== "offcanvas");
    this.inert = hidden;
    this.backdrop.toggleAttribute("data-open", this.mobile && this.mobileIsOpen);
    this.autoTitled = this.autoTitled || /* @__PURE__ */ new WeakSet();
    this.querySelectorAll(".tsl-sidebar__item").forEach((item) => {
      const text = item.querySelector(".tsl-sidebar__text");
      if (!text) return;
      if (rail) {
        if (!item.title) {
          item.title = text.textContent.trim();
          this.autoTitled.add(item);
        }
      } else if (this.autoTitled.has(item)) {
        this.autoTitled.delete(item);
        item.title = "";
        item.removeAttribute("title");
      }
    });
    const expanded = this.mobile ? this.mobileIsOpen : !this.collapsed;
    document.querySelectorAll("[data-tsl-sidebar-toggle]").forEach((btn) => {
      if (this.owns(btn)) {
        btn.setAttribute("aria-controls", this.id);
        btn.setAttribute("aria-expanded", String(expanded));
      }
    });
  }
  owns(btn) {
    const target = btn.dataset.tslSidebarToggle;
    return target ? target === this.id : this.layout.contains(btn);
  }
};
define("tsl-sidebar", TslSidebar);
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tsl-sidebar-toggle]");
  if (!btn) return;
  const sidebars = Array.from(document.querySelectorAll("tsl-sidebar"));
  const target = btn.dataset.tslSidebarToggle;
  const sb = sidebars.find((s) => target ? s.id === target : s.layout && s.layout.contains(btn));
  if (sb) sb.toggle();
});

export {
  TslSidebar
};
