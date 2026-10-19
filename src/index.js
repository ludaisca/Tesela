// Tesela UI — punto de entrada del bundle completo.
// Registra todos los elementos, instala los comportamientos delegados y expone window.TeselaUI.
import { VERSION } from "./core/base.js";
import { getDirection, getPreset, getResolvedTheme, getTheme, presets, setAccent, setDirection, setPreset, setTheme } from "./api/theme.js";
import { toast } from "./api/toast.js";
import { copy } from "./api/clipboard.js";
import { confirmDialog } from "./api/confirm.js";
import { position } from "./core/position.js";
import { init } from "./behaviors.js";
import { getIcon, iconLibraries, iconNames, registerIconLibrary, registerIcons, unregisterIconLibrary } from "./core/icons.js";
import "./components/icon.js";
import "./components/tabs.js";
import "./components/segmented.js";
import "./components/menu.js";
import "./components/command.js";
import "./components/otp.js";
import "./components/tags.js";
import "./components/dropzone.js";
import "./components/calendar.js";
import "./components/sparkline.js";
import "./components/popover.js";
import "./components/hovercard.js";
import "./components/context-menu.js";
import "./components/sheet.js";
import "./components/select.js";
import "./components/date-picker.js";
import "./components/time-picker.js";
import "./components/bar.js";
import "./components/slider.js";
import "./components/rating.js";
import "./components/color-picker.js";
import "./components/password.js";
import "./components/mention.js";
import "./components/toggle-group.js";
import "./components/collapsible.js";
import "./components/scroll-area.js";
import "./components/resizable.js";
import "./components/textarea.js";
import "./components/tree.js";
import "./components/virtual-list.js";
import "./components/sortable.js";
import "./components/data-table.js";
import "./components/chart.js";
import "./components/sidebar.js";
import "./components/radio-group.js";
import "./components/carousel.js";
import "./components/message-scroller.js";
import "./components/questionnaire.js";
import "./components/prompt-input.js";
import "./components/reasoning.js";
import "./components/branch.js";
import "./components/context.js";
import "./components/wizard.js";
import "./components/currency.js";
import "./components/phone.js";
import "./components/upload.js";
import "./components/editor.js";

export { VERSION, getTheme, getResolvedTheme, setTheme, getPreset, setPreset, setAccent, setDirection, getDirection, presets, toast, copy, confirmDialog as confirm, position, init, getIcon, iconLibraries, iconNames, registerIconLibrary, registerIcons, unregisterIconLibrary };

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }

  window.TeselaUI = { version: VERSION, toast, copy, confirm: confirmDialog, position, setTheme, getTheme, getResolvedTheme, setPreset, getPreset, setAccent, setDirection, getDirection, presets, init, getIcon, iconLibraries, iconNames, registerIconLibrary, registerIcons, unregisterIconLibrary };
}
