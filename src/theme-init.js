// Aplica el tema, el preset y el acento guardados ANTES del primer pintado, para evitar el parpadeo.
// Es un script clásico (no un módulo): cárgalo en <head>, sin defer ni async:
//   <script src="lib/theme-init.js"></script>
// Lee las mismas claves de localStorage que usa TeselaUI (setTheme, setPreset y setAccent).
(function () {
  try {
    var d = document.documentElement;
    var s = window.localStorage;
    var theme = s.getItem("tsl-theme");
    var preset = s.getItem("tsl-preset");
    var accent = s.getItem("tsl-accent");
    var fg = s.getItem("tsl-accent-fg");
    if (theme === "dark" || theme === "light" || theme === "system") d.setAttribute("data-theme", theme);
    if (preset && /^[a-z0-9-]+$/.test(preset) && preset !== "tesela") d.setAttribute("data-preset", preset);
    if (accent && fg && /^#[0-9a-f]{6}$/i.test(accent) && /^#[0-9a-f]{6}$/i.test(fg)) {
      d.style.setProperty("--tsl-accent", accent);
      d.style.setProperty("--tsl-accent-fg", fg);
    }
  } catch (e) {}
})();
