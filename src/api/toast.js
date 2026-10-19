import { icon } from "../core/icons.js";

function toastRegion() {
  let region = document.querySelector(".tsl-toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "tsl-toast-region";
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", "Notificaciones");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  return region;
}

/**
 * TeselaUI.toast("Saved") or TeselaUI.toast({ title, description, variant, duration, action: { label, onClick } })
 * variant: "success" | "info" | "warning" | "danger" | "neutral". duration: ms, 0 = sticky.
 * Returns a function that dismisses the toast.
 */
export function toast(options) {
  const opts = typeof options === "string" ? { title: options } : options || {};
  const { title = "", description = "", variant = "success", duration = 3200, action } = opts;

  const el = document.createElement("div");
  el.className = `tsl-toast tsl-toast--${variant}`;
  el.setAttribute("role", variant === "danger" ? "alert" : "status");

  const body = document.createElement("div");
  body.className = "tsl-toast__body";
  if (title) {
    const t = document.createElement("div");
    t.className = "tsl-toast__title";
    t.textContent = title;
    body.appendChild(t);
  }
  if (description) {
    const d = document.createElement("div");
    d.className = "tsl-toast__desc";
    d.textContent = description;
    body.appendChild(d);
  }
  el.appendChild(body);

  let timer = 0;
  const dismiss = () => {
    clearTimeout(timer);
    if (!el.isConnected || el.classList.contains("is-leaving")) return;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 220);
  };

  if (action && action.label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tsl-btn tsl-btn--sm tsl-toast__action";
    btn.textContent = action.label;
    btn.addEventListener("click", () => {
      if (typeof action.onClick === "function") action.onClick();
      dismiss();
    });
    el.appendChild(btn);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.className = "tsl-toast__close";
  close.setAttribute("aria-label", "Cerrar");
  close.appendChild(icon("x"));
  close.addEventListener("click", dismiss);
  el.appendChild(close);

  toastRegion().appendChild(el);
  if (duration > 0) {
    const arm = () => (timer = setTimeout(dismiss, duration));
    el.addEventListener("pointerenter", () => clearTimeout(timer));
    el.addEventListener("pointerleave", arm);
    arm();
  }
  return dismiss;
}
