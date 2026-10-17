import { TslElement, define, emit, nextId } from "../core/base.js";
import { focusFirst, isOpenPopover, position, trackPosition } from "../core/position.js";

// <tsl-popover placement="bottom-start" offset="6" manual>
//   <button data-tsl-trigger>…</button>
//   <div class="tsl-popover__panel">…</div>
// </tsl-popover>
export class TslPopover extends TslElement {
  setup() {
    this.trigger = this.querySelector(":scope > [data-tsl-trigger]") || this.querySelector(":scope > button");
    this.panel = this.querySelector(":scope > .tsl-popover__panel");
    if (!this.trigger || !this.panel) return;

    this.panel.id = this.panel.id || nextId("tsl-popover");
    this.panel.setAttribute("popover", this.hasAttribute("manual") ? "manual" : "auto");
    if (!this.panel.hasAttribute("role")) this.panel.setAttribute("role", "dialog");
    if (this.getAttribute("label") && !this.panel.hasAttribute("aria-label")) {
      this.panel.setAttribute("aria-label", this.getAttribute("label"));
    }
    this.trigger.setAttribute("popovertarget", this.panel.id);
    this.trigger.setAttribute("aria-haspopup", "dialog");
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.setAttribute("aria-controls", this.panel.id);

    this.panel.addEventListener("toggle", (e) => {
      const open = e.newState === "open";
      this.trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        this.reposition();
        this.stop = trackPosition(this.trigger, this.panel, this.options());
        focusFirst(this.panel);
        emit(this, "tsl-open", {});
      } else {
        if (this.stop) this.stop();
        this.stop = null;
        emit(this, "tsl-close", {});
      }
    });
    if (this.hasAttribute("manual")) {
      this.panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.close();
      });
    }
  }

  options() {
    return {
      placement: this.getAttribute("placement") || "bottom-start",
      offset: parseInt(this.getAttribute("offset") || "6", 10)
    };
  }

  reposition() {
    position(this.trigger, this.panel, this.options());
  }

  get isOpen() {
    return Boolean(this.panel) && isOpenPopover(this.panel);
  }

  open() {
    if (this.panel && !this.isOpen) this.panel.showPopover();
  }

  close() {
    if (this.isOpen) this.panel.hidePopover();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

define("tsl-popover", TslPopover);
