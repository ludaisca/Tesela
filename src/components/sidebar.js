import { TslElement, define, emit, nextId, storage } from "../core/base.js";

/**
 * <div class="tsl-sidebar-layout">
 *   <tsl-sidebar collapsible="icon" storage-key="app" shortcut="b" label="Navegación principal">
 *     <div class="tsl-sidebar__header">…</div>
 *     <div class="tsl-sidebar__content">
 *       <div class="tsl-sidebar__group">
 *         <div class="tsl-sidebar__label">Plataforma</div>
 *         <ul class="tsl-sidebar__menu">
 *           <li><a class="tsl-sidebar__item" href="#" aria-current="page"><span class="tsl-sidebar__icon" aria-hidden="true"><tsl-icon name="house"></tsl-icon></span><span class="tsl-sidebar__text">Inicio</span></a></li>
 *         </ul>
 *       </div>
 *     </div>
 *     <div class="tsl-sidebar__footer">…</div>
 *   </tsl-sidebar>
 *   <div class="tsl-sidebar-inset"><button data-tsl-sidebar-toggle aria-label="Alternar barra lateral"><tsl-icon name="panel-left"></tsl-icon></button>…</div>
 * </div>
 */
export class TslSidebar extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label"];
  }

  attributeChanged() {
    if (this.ownLabel) this.setAttribute("aria-label", this.getAttribute("label") || "Barra lateral");
  }

  setup() {
    this.id = this.id || nextId("tsl-sidebar");
    if (!this.hasAttribute("role")) this.setAttribute("role", "navigation");
    // Un aria-label del autor manda sobre `label`
    this.ownLabel = !this.hasAttribute("aria-label");
    if (this.ownLabel) this.setAttribute("aria-label", this.getAttribute("label") || "Barra lateral");
    this.layout = this.closest(".tsl-sidebar-layout") || this.parentElement;
    this.mobile = false;
    this.mobileIsOpen = false;

    const saved = this.storageKey && storage.get(`tsl-sidebar:${this.storageKey}`);
    if (saved !== null && saved !== undefined) this.toggleAttribute("collapsed", saved === "1");

    this.backdrop = document.createElement("div");
    this.backdrop.className = "tsl-sidebar__backdrop";
    this.backdrop.addEventListener("click", () => this.closeMobile());
    this.layout.appendChild(this.backdrop);

    // Submenús: un botón con aria-expanded seguido de una lista
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
    // Un clic en un enlace cierra el cajón en móvil
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
    this.listen(document, "keydown", this.onKey);

    this.resizer = new ResizeObserver(() => this.measure());
    this.resizer.observe(this.layout);
    this.measure();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizer) this.resizer.disconnect();
    if (this.backdrop) this.backdrop.remove();
  }

  reconnected() {
    this.layout = this.closest(".tsl-sidebar-layout") || this.parentElement;
    this.layout.appendChild(this.backdrop);
    this.resizer.observe(this.layout);
    this.measure();
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
      const next = show === undefined ? !this.mobileIsOpen : Boolean(show);
      return next ? this.openMobile() : this.closeMobile();
    }
    const collapsed = show === undefined ? !this.collapsed : !show;
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
    // En el modo de iconos el texto se oculta: el nombre pasa a title (solo si el ítem no trae uno propio)
    this.autoTitled = this.autoTitled || new WeakSet();
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
}

define("tsl-sidebar", TslSidebar);

// Los botones [data-tsl-sidebar-toggle] funcionan sin código propio
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tsl-sidebar-toggle]");
  if (!btn) return;
  const sidebars = Array.from(document.querySelectorAll("tsl-sidebar"));
  const target = btn.dataset.tslSidebarToggle;
  const sb = sidebars.find((s) => (target ? s.id === target : s.layout && s.layout.contains(btn)));
  if (sb) sb.toggle();
});
