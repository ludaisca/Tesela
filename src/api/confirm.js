import { nextId } from "../core/base.js";

/**
 * TeselaUI.confirm("¿Eliminar?") o TeselaUI.confirm({ title, description, confirmLabel,
 * cancelLabel, variant: "danger" }) → Promise<boolean>.
 * cancelLabel: null muestra solo el botón de aceptar (alerta). Esc o cancelar → false.
 */
export function confirmDialog(options) {
  const o = typeof options === "string" ? { title: options } : options || {};
  const { title = "¿Estás seguro?", description = "", confirmLabel = "Aceptar", cancelLabel = "Cancelar", variant = "default" } = o;

  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "tsl-dialog";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("data-tsl-static", "");
    const titleId = nextId("tsl-alert-title");
    dialog.setAttribute("aria-labelledby", titleId);

    const header = document.createElement("div");
    header.className = "tsl-dialog__header";
    const h = document.createElement("h2");
    h.className = "tsl-dialog__title";
    h.id = titleId;
    h.textContent = title;
    header.appendChild(h);
    if (description) {
      const p = document.createElement("p");
      p.className = "tsl-dialog__desc";
      p.id = nextId("tsl-alert-desc");
      p.textContent = description;
      header.appendChild(p);
      dialog.setAttribute("aria-describedby", p.id);
    }

    const footer = document.createElement("div");
    footer.className = "tsl-dialog__footer";
    let cancelBtn = null;
    if (cancelLabel !== null) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "tsl-btn";
      cancelBtn.textContent = cancelLabel;
      cancelBtn.addEventListener("click", () => dialog.close("cancel"));
      footer.appendChild(cancelBtn);
    }
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.className = `tsl-btn ${variant === "danger" ? "tsl-btn--danger" : "tsl-btn--primary"}`;
    okBtn.textContent = confirmLabel;
    okBtn.addEventListener("click", () => dialog.close("confirm"));
    footer.appendChild(okBtn);

    // Una acción destructiva arranca con el foco en "Cancelar"
    (variant === "danger" && cancelBtn ? cancelBtn : okBtn).setAttribute("autofocus", "");

    dialog.append(header, footer);
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "confirm");
      dialog.remove();
    });
    document.body.appendChild(dialog);
    dialog.showModal();
  });
}
