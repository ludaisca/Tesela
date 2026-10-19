import { TslElement, define, emit, moveFocus, nextId } from "../core/base.js";
import { isOpenPopover, position } from "../core/position.js";

// <tsl-context-menu>
//   <div class="tsl-context-zone" tabindex="0">Clic derecho aquí</div>
//   <div class="tsl-menu__list">…items…</div>
// </tsl-context-menu>
export class TslContextMenu extends TslElement {
  setup() {
    this.list = this.querySelector(":scope > .tsl-menu__list");
    if (!this.list) return;
    this.list.id = this.list.id || nextId("tsl-ctx");
    // "manual": con "auto" el mouseup que sigue al contextmenu (Linux/Windows) lo cerraría al instante
    this.list.setAttribute("popover", "manual");
    this.list.setAttribute("role", "menu");
    this.items().forEach((item) => {
      item.setAttribute("role", "menuitem");
      item.tabIndex = -1;
    });

    this.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (this.list.contains(e.target)) return;
      this.openAt(e.clientX, e.clientY);
    });

    // Teclado: tecla de menú contextual o Shift+F10
    this.addEventListener("keydown", (e) => {
      if (this.list.contains(e.target)) return;
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        const r = (e.target instanceof Element ? e.target : this).getBoundingClientRect();
        this.openAt(r.left + r.width / 2, r.top + r.height / 2);
      }
    });

    // Táctil: pulsación larga
    let press = 0;
    const cancel = () => clearTimeout(press);
    this.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch" || this.list.contains(e.target)) return;
      const { clientX, clientY } = e;
      press = setTimeout(() => this.openAt(clientX, clientY), 550);
    });
    ["pointerup", "pointermove", "pointercancel"].forEach((t) => this.addEventListener(t, cancel));

    this.list.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.close(true);
        return;
      }
      const next = moveFocus(this.items(), document.activeElement, e.key);
      if (next) {
        e.preventDefault();
        next.focus();
      } else if (e.key === "Tab") {
        this.close();
      }
    });
    this.list.addEventListener("click", (e) => {
      const item = e.target.closest(".tsl-menu__item");
      if (!item || item.disabled || item.getAttribute("aria-disabled") === "true") return;
      emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
      this.close(true);
    });
    this.outside = (e) => {
      if (!this.list.contains(e.target)) this.close();
    };
    // Solo cierra un scroll que mueve la zona (el documento o un contenedor suyo), no el de otro
    // elemento de la página como un carrusel que avanza solo
    this.dismiss = (e) => {
      const t = e && e.type === "scroll" ? e.target : null;
      if (t && t !== document && t.nodeType === 1 && !t.contains(this)) return;
      this.close();
    };
  }

  items() {
    return Array.from(this.list.querySelectorAll(".tsl-menu__item:not([disabled])"));
  }

  openAt(x, y) {
    this.close();
    this.returnTo = document.activeElement;
    this.list.showPopover();
    position(null, this.list, { point: { x, y }, placement: "bottom-start", offset: 2 });
    const first = this.items()[0];
    if (first) first.focus();
    // Cierre propio: clic fuera, scroll o resize (se registra tras el evento que lo abrió)
    setTimeout(() => {
      if (!isOpenPopover(this.list)) return;
      document.addEventListener("pointerdown", this.outside, true);
      window.addEventListener("scroll", this.dismiss, true);
      window.addEventListener("resize", this.dismiss);
    }, 0);
  }

  close(returnFocus = false) {
    if (!this.list || !isOpenPopover(this.list)) return;
    this.list.hidePopover();
    document.removeEventListener("pointerdown", this.outside, true);
    window.removeEventListener("scroll", this.dismiss, true);
    window.removeEventListener("resize", this.dismiss);
    if (returnFocus && this.returnTo && this.returnTo.isConnected) this.returnTo.focus();
  }
}

define("tsl-context-menu", TslContextMenu);
