# Tesela — biblioteca de componentes

Biblioteca de componentes **sin dependencias** (HTML + CSS + Custom Elements) y una galería de **212 experimentos funcionales en 24 carpetas** construidos con ella. Inspirada en [devl.dev](https://www.devl.dev/).

- **Documentación de la biblioteca:** `components.html`
- **Galería de experimentos:** `index.html`

## Tesela (`tesela-ui`)

78 componentes (botones, formularios, OTP, tags, dropzone, calendario, tabs, menús, paleta de comandos, diálogos, drawers, toasts, tablas ordenables, sparklines, popover, hover card, menú contextual, confirmación, sheets, select, combobox, selector de fecha, rango de fechas, selector de hora, barra de menús, menú de navegación, slider de rango, rating, selector de color, contraseña con medidor, textarea autoajustable, menciones, toggle group, collapsible, scroll area, paneles redimensionables, tree view, lista virtualizada, listas ordenables, kanban, tabla de datos y gráficas de línea, área, barras, dona, gauge y mapa de calor…) más patrones de ejemplo.

### Uso

Copia la carpeta `lib/` a tu proyecto:

```html
<link rel="stylesheet" href="lib/tesela-ui.css" />
<script src="lib/tesela-ui.js" defer></script>

<body class="tsl">
  <button class="tsl-btn tsl-btn--primary">Guardar</button>
  <tsl-tabs> … </tsl-tabs>
</body>
```

- **CSS (`tesela-ui.css`):** tokens `--tsl-*` y clases `tsl-*`. Funciona sin JS.
- **JS (`tesela-ui.js`):** Custom Elements en light DOM (`<tsl-tabs>`, `<tsl-segmented>`, `<tsl-menu>`, `<tsl-command>`, `<tsl-otp>`, `<tsl-tags>`, `<tsl-dropzone>`, `<tsl-calendar>`, `<tsl-sparkline>`, `<tsl-popover>`, `<tsl-hovercard>`, `<tsl-context-menu>`, `<tsl-select>`, `<tsl-combobox>`, `<tsl-date-picker>`, `<tsl-time-picker>`, `<tsl-menubar>`, `<tsl-nav-menu>`, `<tsl-slider>`, `<tsl-rating>`, `<tsl-color-picker>`, `<tsl-password>`, `<tsl-mention>`, `<tsl-toggle-group>`, `<tsl-collapsible>`, `<tsl-scroll-area>`, `<tsl-resizable>`, `<tsl-tree>`, `<tsl-virtual-list>`, `<tsl-sortable>`, `<tsl-data-table>`, `<tsl-chart>`) y atributos `data-tsl-*` (abrir/cerrar diálogos, copiar, tema, tablas ordenables, rangos, steppers).
- **API global:** `TeselaUI.toast()`, `TeselaUI.confirm()` (promesa), `TeselaUI.position()` (motor de posicionamiento), `TeselaUI.copy()`, `TeselaUI.setTheme()`, `TeselaUI.getTheme()`, `TeselaUI.init(root)`.
- **Eventos:** todos los componentes emiten eventos `tsl-*` que burbujean (`tsl-change`, `tsl-select`, `tsl-complete`, `tsl-copy`, `tsl-theme`).
- **Formularios:** `tsl-select`, `tsl-combobox`, `tsl-date-picker`, `tsl-time-picker`, `tsl-slider`, `tsl-rating` y `tsl-color-picker` son *form-associated* (`ElementInternals`): aparecen en `FormData`, respetan `required`, `form.reset()` y `<fieldset disabled>`.
- **Temas:** oscuro por defecto; `data-theme="light"` en `<html>`. Cambia la marca sobrescribiendo `--tsl-accent`, `--tsl-radius`, etc.
- **Accesibilidad:** roles ARIA, navegación por teclado, `<dialog>` nativo y soporte de `prefers-reduced-motion`.
- **Textos por defecto en español** (etiquetas ARIA, placeholders, "Copiado"…); se pueden cambiar con atributos (`label`, `placeholder`, `empty`).

## Estructura

| Ruta | Contenido |
|---|---|
| `lib/tesela-ui.css`, `lib/tesela-ui.js` | La biblioteca (lo único que necesitas copiar) |
| `components.html`, `docs/` | Documentación interactiva de la biblioteca |
| `index.html`, `css/`, `js/` | Galería de experimentos |
| `js/data.js` | Catálogo de carpetas y experimentos |
| `js/experiments/*.js`, `css/experiments.css` | Los 212 experimentos, construidos con tesela-ui |

## Galería

- Abre cualquier tarjeta: el sandbox monta el experimento y lo desmonta al salir (intervalos, animaciones, audio y listeners se limpian solos).
- Pulsa **C** (o el botón `</> Código`) para ver y copiar su **HTML** y **JavaScript** reales.
- Atajos: **⌘K** buscar · **R** aleatorio · **T** tema · **B** blueprint · flechas para navegar. Si el foco está dentro de un experimento, sus atajos tienen prioridad.
- El panel **Tokens** cambia el acento y el radio en vivo y copia las variables CSS.

### Añadir un experimento

1. Agrégalo a la carpeta correspondiente en `js/data.js`.
2. Regístralo en `js/experiments/*.js`:

```js
TESELA_XP.add("forms", "mi-formulario", {
  html: `<form class="tsl-stack" data-xp-form data-success="Guardado {name}">…</form>`,
  setup(root, ctx) {
    TESELA_XP.formSetup(root, ctx);          // validación genérica
    ctx.every(1000, () => { /* … */ });    // se limpia al desmontar
    ctx.on(window, "resize", () => {});    // listener con limpieza automática
  }
});
```

`ctx` ofrece `$`, `$$`, `toast`, `every`, `timeout`, `raf`, `on`, `onCleanup` y `fmt`. Constructores reutilizables: `TESELA_XP.table(cfg)`, `TESELA_XP.formSetup`, `TESELA_XP.field`, `TESELA_XP.chart.*`, `TESELA_XP.fitCanvas`.

## Pruebas

Las pruebas corren en un Chromium real con Playwright e incluyen teclado, arrastre con el ratón, formularios y accesibilidad. Cada archivo de `tests/` cubre un grupo de componentes:

| Archivo | Cubre |
|---|---|
| `tests/overlays.test.js` | popover, hover card, menú contextual, confirmación, sheets |
| `tests/fields.test.js` | select, combobox, fecha, rango, hora, formularios, menubar, nav menu |
| `tests/inputs.test.js` | slider, rating, color, contraseña, textarea, menciones, toggle group, estructura |
| `tests/data.test.js` | tree, lista virtual, ordenables, kanban, tabla de datos, gráficas |
| `tests/gallery.test.js` | los 212 experimentos de la galería montan sin errores |

```bash
npm install                        # solo la primera vez (instala Playwright)
npx playwright install chromium    # solo la primera vez
npm test                           # todas las pruebas
node tests/run.js data             # solo los archivos que contengan "data"
BASE_URL=http://host:24100 node tests/run.js   # contra un servidor ya levantado
```

`tests/run.js` levanta su propio servidor estático (`tests/server.js`, sin dependencias) y también encuentra una instalación global de Playwright. Si añades un componente, añade su prueba en el archivo del grupo correspondiente.

## Desarrollo local

Es un sitio estático. En este servidor se levanta con Podman (nginx) en el puerto **24100**:

```bash
podman compose up -d          # http://<ip-tailscale>:24100
podman compose down
```

`docker-compose.yml` es portable (sirve `./` con nginx, con `:z` por SELinux) y `docker-compose.override.yml` publica el puerto 24100 solo en desarrollo. La IP de Tailscale se obtiene con `tailscale ip -4`.
