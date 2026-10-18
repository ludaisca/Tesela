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

## Código fuente y compilación

El código vive en `src/` (módulos ES, uno por componente) y `lib/` es la salida compilada, lista para copiar o servir:

```bash
npm run build     # src/ → lib/ (bundle IIFE, minificado, módulos ESM y CSS por secciones)
```

| Ruta | Contenido |
|---|---|
| `src/core/` | Base de los Custom Elements, posicionamiento y campos de formulario compartidos |
| `src/components/` | Un módulo por componente (`tabs.js`, `select.js`, `chart.js`…) que se registra a sí mismo |
| `src/api/` | `toast`, `confirm`, `copy` y tema |
| `src/tokens/` | Tokens y presets en JSON: la fuente única del aspecto |
| `src/meta/` | Descripción de la API de cada elemento (genera tipos, manifiesto y la pestaña «API») |
| `src/css/` | Una hoja por sección; se concatenan en `lib/tesela-ui.css` |
| `lib/tesela-ui.js`, `.min.js` | Bundle completo para `<script src>` (expone `window.TeselaUI`) |
| `lib/esm/` | Bundle ESM y un módulo por componente para importar solo lo necesario |
| `lib/css/` | El CSS por secciones |
| `lib/types/`, `lib/custom-elements.json` | Tipos de TypeScript y manifiesto (ver más abajo) |

`tests/package.test.js` falla si `lib/` queda desfasado respecto a `src/`: ejecuta `npm run build` y confirma ambos.

## Temas, presets y tokens

Todo el estilo sale de 36 tokens definidos una sola vez en `src/tokens/tokens.json` (formato inspirado en W3C Design Tokens, con valor para el modo oscuro y el claro). De ahí se generan el CSS, las variables de Sass, un módulo JS con tipos y un preset de Tailwind.

| Qué | Cómo |
|---|---|
| Modo | `data-theme="dark" \| "light" \| "system"` en `<html>` (o en cualquier contenedor); `system` sigue al sistema operativo |
| Preset | `data-preset="esmeralda"` cambia colores, radios y tipografías de una vez. Hay 11: `tesela` (por defecto), `esmeralda`, `ambar`, `cielo`, `rosa`, `violeta`, `medianoche`, `papel`, `alto-contraste`, `brutalista` y `suave` |
| Acento | `TeselaUI.setAccent("#10b981")` cambia el acento y elige solo un texto legible (blanco o casi negro) |
| API | `TeselaUI.setTheme()`, `getTheme()`, `getResolvedTheme()`, `setPreset()`, `getPreset()`, `setAccent()`, `presets` y los eventos `tsl-theme`, `tsl-preset` y `tsl-accent` |
| Sin parpadeo | `<script src="lib/theme-init.js"></script>` en `<head>` aplica lo guardado antes del primer pintado |

Todos los presets cumplen el contraste WCAG en ambos modos (texto AAA, atenuado AA, texto del acento AA, insignias AA) y `alto-contraste` llega a AAA; `tests/tokens.test.js` lo comprueba con los valores reales del navegador. Los archivos exportados están en `lib/tokens/` (`tokens.json`, `tokens.css`, `tokens.scss`, `tokens.mjs`, `tailwind.preset.cjs`) y hay un CSS por preset en `lib/themes/`.

## Tipos y autocompletado

Los tipos y la descripción de la API se generan desde `src/meta/elements.js` (una sola fuente de verdad, validada por `tests/api.test.js` contra el código):

| Archivo | Para qué |
|---|---|
| `lib/types/tesela-ui.d.ts` | Tipos de TypeScript: cada elemento sale tipado en `querySelector`/`createElement`, los eventos `tsl-*` tienen su `detail` tipado y `window.TeselaUI` está declarado |
| `lib/custom-elements.json` | Manifiesto estándar (Custom Elements Manifest 1.0) para Storybook, documentación y herramientas |
| `lib/vscode.html-custom-data.json` | Autocompletado de etiquetas y atributos en VS Code |

```ts
import { toast, confirm } from "tesela-ui";
import type { TslSelectElement } from "tesela-ui";

const tabs = document.querySelector("tsl-tabs")!;          // TslTabsElement
tabs.addEventListener("tsl-change", (e) => e.detail.value); // string
```

Para el autocompletado en VS Code, añade a `.vscode/settings.json`:

```json
{ "html.customData": ["./lib/vscode.html-custom-data.json"] }
```

En `components.html` cada componente tiene una pestaña **API** con sus atributos, propiedades, métodos y eventos, generada desde el mismo manifiesto.

## Estructura

| Ruta | Contenido |
|---|---|
| `lib/` | La biblioteca compilada (lo único que necesitas copiar) |
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
| `tests/package.test.js` | `lib/` al día con `src/`, módulos ESM independientes, rutas de `package.json` y que ningún elemento pise miembros nativos de `HTMLElement` |
| `tests/api.test.js` | la descripción de la API coincide con el código; los tipos compilan con `tsc --strict` |
| `tests/docs.test.js` | la pestaña «API», la galería de presets y el comprobador de contraste |
| `tests/tokens.test.js` | tokens, contraste WCAG de los presets, archivos exportados, modos, presets y API de temas |

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
