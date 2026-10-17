# Biblioteca de Componentes — devl-ui

Biblioteca de componentes **sin dependencias** (HTML + CSS + Custom Elements) y una galería de **212 experimentos funcionales en 24 carpetas** construidos con ella. Inspirada en [devl.dev](https://www.devl.dev/).

- **Documentación de la biblioteca:** `components.html`
- **Galería de experimentos:** `index.html`

## devl-ui

69 componentes (botones, formularios, OTP, tags, dropzone, calendario, tabs, menús, paleta de comandos, diálogos, drawers, toasts, tablas ordenables, sparklines, popover, hover card, menú contextual, confirmación, sheets, select, combobox, selector de fecha, rango de fechas, selector de hora, barra de menús, menú de navegación, slider de rango, rating, selector de color, contraseña con medidor, textarea autoajustable, menciones, toggle group, collapsible, scroll area y paneles redimensionables…) más patrones de ejemplo.

### Uso

Copia la carpeta `lib/` a tu proyecto:

```html
<link rel="stylesheet" href="lib/devl-ui.css" />
<script src="lib/devl-ui.js" defer></script>

<body class="dv">
  <button class="dv-btn dv-btn--primary">Guardar</button>
  <dv-tabs> … </dv-tabs>
</body>
```

- **CSS (`devl-ui.css`):** tokens `--dv-*` y clases `dv-*`. Funciona sin JS.
- **JS (`devl-ui.js`):** Custom Elements en light DOM (`<dv-tabs>`, `<dv-segmented>`, `<dv-menu>`, `<dv-command>`, `<dv-otp>`, `<dv-tags>`, `<dv-dropzone>`, `<dv-calendar>`, `<dv-sparkline>`, `<dv-popover>`, `<dv-hovercard>`, `<dv-context-menu>`, `<dv-select>`, `<dv-combobox>`, `<dv-date-picker>`, `<dv-time-picker>`, `<dv-menubar>`, `<dv-nav-menu>`, `<dv-slider>`, `<dv-rating>`, `<dv-color-picker>`, `<dv-password>`, `<dv-mention>`, `<dv-toggle-group>`, `<dv-collapsible>`, `<dv-scroll-area>`, `<dv-resizable>`) y atributos `data-dv-*` (abrir/cerrar diálogos, copiar, tema, tablas ordenables, rangos, steppers).
- **API global:** `DevlUI.toast()`, `DevlUI.confirm()` (promesa), `DevlUI.position()` (motor de posicionamiento), `DevlUI.copy()`, `DevlUI.setTheme()`, `DevlUI.getTheme()`, `DevlUI.init(root)`.
- **Eventos:** todos los componentes emiten eventos `dv-*` que burbujean (`dv-change`, `dv-select`, `dv-complete`, `dv-copy`, `dv-theme`).
- **Formularios:** `dv-select`, `dv-combobox`, `dv-date-picker`, `dv-time-picker`, `dv-slider`, `dv-rating` y `dv-color-picker` son *form-associated* (`ElementInternals`): aparecen en `FormData`, respetan `required`, `form.reset()` y `<fieldset disabled>`.
- **Temas:** oscuro por defecto; `data-theme="light"` en `<html>`. Cambia la marca sobrescribiendo `--dv-accent`, `--dv-radius`, etc.
- **Accesibilidad:** roles ARIA, navegación por teclado, `<dialog>` nativo y soporte de `prefers-reduced-motion`.
- **Textos por defecto en español** (etiquetas ARIA, placeholders, "Copiado"…); se pueden cambiar con atributos (`label`, `placeholder`, `empty`).

## Estructura

| Ruta | Contenido |
|---|---|
| `lib/devl-ui.css`, `lib/devl-ui.js` | La biblioteca (lo único que necesitas copiar) |
| `components.html`, `docs/` | Documentación interactiva de la biblioteca |
| `index.html`, `css/`, `js/` | Galería de experimentos |
| `js/data.js` | Catálogo de carpetas y experimentos |
| `js/experiments/*.js`, `css/experiments.css` | Los 212 experimentos, construidos con devl-ui |

## Galería

- Abre cualquier tarjeta: el sandbox monta el experimento y lo desmonta al salir (intervalos, animaciones, audio y listeners se limpian solos).
- Pulsa **C** (o el botón `</> Código`) para ver y copiar su **HTML** y **JavaScript** reales.
- Atajos: **⌘K** buscar · **R** aleatorio · **T** tema · **B** blueprint · flechas para navegar. Si el foco está dentro de un experimento, sus atajos tienen prioridad.
- El panel **Tokens** cambia el acento y el radio en vivo y copia las variables CSS.

### Añadir un experimento

1. Agrégalo a la carpeta correspondiente en `js/data.js`.
2. Regístralo en `js/experiments/*.js`:

```js
DEVL_XP.add("forms", "mi-formulario", {
  html: `<form class="dv-stack" data-xp-form data-success="Guardado {name}">…</form>`,
  setup(root, ctx) {
    DEVL_XP.formSetup(root, ctx);          // validación genérica
    ctx.every(1000, () => { /* … */ });    // se limpia al desmontar
    ctx.on(window, "resize", () => {});    // listener con limpieza automática
  }
});
```

`ctx` ofrece `$`, `$$`, `toast`, `every`, `timeout`, `raf`, `on`, `onCleanup` y `fmt`. Constructores reutilizables: `DEVL_XP.table(cfg)`, `DEVL_XP.formSetup`, `DEVL_XP.field`, `DEVL_XP.chart.*`, `DEVL_XP.fitCanvas`.

## Desarrollo local

Es un sitio estático. En este servidor se levanta con Podman (nginx) en el puerto **24100**:

```bash
podman compose up -d          # http://<ip-tailscale>:24100
podman compose down
```

`docker-compose.yml` es portable (sirve `./` con nginx, con `:z` por SELinux) y `docker-compose.override.yml` publica el puerto 24100 solo en desarrollo. La IP de Tailscale se obtiene con `tailscale ip -4`.
