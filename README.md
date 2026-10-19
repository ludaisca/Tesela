# Tesela — biblioteca de componentes

Biblioteca de componentes **sin dependencias** (HTML + CSS + Custom Elements) y una galería de **212 experimentos funcionales en 24 carpetas** construidos con ella. Inspirada en [devl.dev](https://www.devl.dev/).

- **Documentación de la biblioteca:** `components.html`
- **Galería de experimentos:** `index.html`

## Tesela (`tesela-ui`)

112 secciones de componentes (iconos, botones, formularios, OTP, tags, dropzone, calendario, tabs, menús, paleta de comandos, diálogos, drawers, toasts, tablas ordenables, sparklines, popover, hover card, menú contextual, confirmación, sheets, select, combobox, selector de fecha, rango de fechas, selector de hora, barra de menús, menú de navegación, slider de rango, rating, selector de color, contraseña con medidor, textarea autoajustable, menciones, toggle group, collapsible, scroll area, paneles redimensionables, tree view, lista virtualizada, listas ordenables, kanban, tabla de datos, gráficas de línea, área, barras, dona, gauge y mapa de calor, barra lateral, grupo de radios, carrusel, item y la familia de conversación: mensaje, burbuja, adjunto, traza, bloque de código, zona con seguimiento, cuestionario, entrada de prompt con adjuntos, sugerencias, razonamiento, fuentes y citas, versiones de respuesta, medidor de contexto, asistente por pasos, importe, teléfono, subida de archivos con progreso y editor de texto enriquecido…) más patrones completos: panel de control, autenticación, ajustes con navegación lateral, alta por pasos y chat con asistente.

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
- **JS (`tesela-ui.js`):** Custom Elements en light DOM (`<tsl-icon>`, `<tsl-tabs>`, `<tsl-segmented>`, `<tsl-menu>`, `<tsl-command>`, `<tsl-otp>`, `<tsl-tags>`, `<tsl-dropzone>`, `<tsl-calendar>`, `<tsl-sparkline>`, `<tsl-popover>`, `<tsl-hovercard>`, `<tsl-context-menu>`, `<tsl-select>`, `<tsl-combobox>`, `<tsl-date-picker>`, `<tsl-time-picker>`, `<tsl-menubar>`, `<tsl-nav-menu>`, `<tsl-slider>`, `<tsl-rating>`, `<tsl-color-picker>`, `<tsl-password>`, `<tsl-mention>`, `<tsl-toggle-group>`, `<tsl-collapsible>`, `<tsl-scroll-area>`, `<tsl-resizable>`, `<tsl-tree>`, `<tsl-virtual-list>`, `<tsl-sortable>`, `<tsl-data-table>`, `<tsl-chart>`, `<tsl-sidebar>`, `<tsl-radio-group>`, `<tsl-carousel>`, `<tsl-message-scroller>`, `<tsl-questionnaire>`, `<tsl-prompt-input>`, `<tsl-reasoning>`, `<tsl-branch>`, `<tsl-context>`, `<tsl-wizard>`, `<tsl-currency>`, `<tsl-phone>`, `<tsl-upload>`, `<tsl-editor>`) y atributos `data-tsl-*` (abrir/cerrar diálogos, copiar, tema, tablas ordenables, rangos, steppers).
- **API global:** `TeselaUI.toast()`, `TeselaUI.confirm()` (promesa), `TeselaUI.position()` (motor de posicionamiento), `TeselaUI.copy()`, `TeselaUI.setTheme()`, `TeselaUI.getTheme()`, `TeselaUI.init(root)`, `TeselaUI.registerIconLibrary()`, `TeselaUI.registerIcons()`, `TeselaUI.iconLibraries`, `TeselaUI.iconNames()`, `TeselaUI.getIcon()`.
- **Eventos:** todos los componentes emiten eventos `tsl-*` que burbujean (`tsl-change`, `tsl-select`, `tsl-complete`, `tsl-copy`, `tsl-theme`).
- **Formularios:** `tsl-select`, `tsl-combobox`, `tsl-date-picker`, `tsl-time-picker`, `tsl-slider`, `tsl-rating`, `tsl-color-picker`, `tsl-currency`, `tsl-phone`, `tsl-upload` y `tsl-editor` son *form-associated* (`ElementInternals`): aparecen en `FormData`, respetan `required`, `form.reset()` y `<fieldset disabled>`.
- **Temas:** oscuro por defecto; `data-theme="light"` en `<html>`. Cambia la marca sobrescribiendo `--tsl-accent`, `--tsl-radius`, etc.
- **CSS en capas:** todo va en `@layer tesela.tokens, tesela.base, tesela.components, tesela.utilities`, así que tu CSS sin capa gana siempre, sin `!important` ni subir la especificidad (`button { … }` le gana a `.tsl-btn--primary`). Si usas tus propias capas, declara el orden una vez: `@layer tesela, app;`. Un reset global (`* { margin: 0; padding: 0 }`) sin capa también ganaría y le quitaría a los componentes márgenes y rellenos: ponlo en una capa anterior, declarada antes de cargar Tesela (`<style>@layer reset, tesela;</style>`), como hace `index.html`. Solo quedan `!important` donde un estado debe mandar siempre: `hidden`, popover cerrado, `prefers-reduced-motion` y el texto oculto de un botón ocupado.
- **Atributos reactivos:** cambiar después del montaje `value`, `disabled`, `placeholder`, `label` o cualquier texto `*-label` repinta el componente, como en un elemento nativo (`tests/reactividad.test.js`).
- **SPA:** los componentes quitan sus escuchas de `document`/`window` al salir del documento y las recuperan si se vuelven a montar; mover un elemento no repite su `setup()`.
- **Accesibilidad:** roles ARIA, navegación por teclado, `<dialog>` nativo, `prefers-reduced-motion` y alto contraste (`forced-colors`: foco, botones, campos, casillas e interruptores). Cada sección de la documentación pasa axe-core (WCAG 2.2 AA) en tema oscuro y claro (`tests/accesibilidad.test.js`).
- **Textos por defecto en español** (etiquetas ARIA, placeholders, "Copiado"…); se pueden cambiar con atributos (`label`, `placeholder`, `empty`).

## Iconos

`<tsl-icon name="search"></tsl-icon>` pinta un SVG en línea que hereda el color (`currentColor`) y mide `1em`. Sin `label` es decorativo (`aria-hidden`); con `label="…"` se anuncia como imagen. Tamaños con `size="xs|sm|md|lg|xl"`, `font-size` o `--tsl-icon-size`; grosor del trazo con `--tsl-icon-stroke`; `spin` para indicadores de carga y `flip-rtl` para flechas que deben espejarse en RTL.

- **Set base incluido:** 183 iconos de [Lucide](https://lucide.dev) (licencia ISC), los que usan los propios componentes más el vocabulario habitual de una interfaz. Se pintan al instante, sin red. La lista se elige en `scripts/build-icons.js` y se regenera con `npm run icons`; la licencia viaja en `lib/LICENSE-lucide.txt` y en la cabecera del bundle.
- **Otras bibliotecas:** se registran con un adaptador y se piden bajo demanda (una vez por icono, con caché). Hay adaptadores con versión fijada para Lucide completo, Tabler, Phosphor, Heroicons, Material Symbols y Simple Icons (logotipos):

```js
TeselaUI.registerIconLibrary("tabler", TeselaUI.iconLibraries.tabler());               // jsDelivr
TeselaUI.registerIconLibrary("ph", TeselaUI.iconLibraries.phosphor({ weight: "bold" }));
TeselaUI.registerIconLibrary("lucide", TeselaUI.iconLibraries.lucide({ base: "/vendor/lucide" })); // tu servidor
```

```html
<tsl-icon library="tabler" name="rocket"></tsl-icon>
```

- **Iconos propios:** `TeselaUI.registerIcons({ marca: "<svg viewBox='0 0 24 24'>…</svg>" })` los añade al set base; ``registerIconLibrary("marca", { resolver: (n) => `/iconos/${n}.svg` })`` crea una biblioteca con cualquier fuente (URL, texto SVG o `import()`), y `<tsl-icon src="/logo.svg">` carga un archivo suelto.
- **Seguridad:** todo SVG externo se limpia antes de insertarse (sin `<script>`, `<foreignObject>`, manejadores `on*` ni enlaces `javascript:`).
- **Sin JS:** el CSS expone las mismas formas como máscaras (`--tsl-svg-check`, `--tsl-svg-x`, `--tsl-svg-chevron-down`…) para `::before`/`::after`.
- **Sin emojis:** ni la biblioteca ni la documentación ni la galería usan emojis o glifos como icono; `tests/iconos.test.js` falla si vuelve a entrar alguno.

## Código fuente y compilación

El código vive en `src/` (módulos ES, uno por componente) y `lib/` es la salida compilada, lista para copiar o servir:

```bash
npm run build     # src/ → lib/ (bundle IIFE, minificado, módulos ESM y CSS por secciones)
```

| Ruta | Contenido |
|---|---|
| `src/core/` | Base de los Custom Elements, posicionamiento, campos de formulario y registro de iconos |
| `src/icons/` | Set base de iconos generado desde Lucide (`npm run icons`) y su licencia |
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

Todo el estilo sale de 37 tokens definidos una sola vez en `src/tokens/tokens.json` (formato inspirado en W3C Design Tokens, con valor para el modo oscuro y el claro). De ahí se generan el CSS, las variables de Sass, un módulo JS con tipos y un preset de Tailwind.

| Qué | Cómo |
|---|---|
| Modo | `data-theme="dark" \| "light" \| "system"` en `<html>` (o en cualquier contenedor); `system` sigue al sistema operativo |
| Preset | `data-preset="esmeralda"` cambia colores, radios y tipografías de una vez. Hay 11: `tesela` (por defecto), `esmeralda`, `ambar`, `cielo`, `rosa`, `violeta`, `medianoche`, `papel`, `alto-contraste`, `brutalista` y `suave` |
| Acento | `TeselaUI.setAccent("#10b981")` cambia el acento y elige solo un texto legible (blanco o casi negro) |
| API | `TeselaUI.setTheme()`, `getTheme()`, `getResolvedTheme()`, `setPreset()`, `getPreset()`, `setAccent()`, `presets` y los eventos `tsl-theme`, `tsl-preset` y `tsl-accent` |
| Dirección | `TeselaUI.setDirection("rtl")` (o `dir="rtl"` en `<html>`/un contenedor) espeja los componentes: el CSS usa propiedades lógicas y el teclado, el puntero y el posicionamiento respetan el sentido de lectura. Gráficas, minigráficos, selectores de color y OTP conservan la orientación izquierda-derecha. Evento `tsl-direction` |
| Sin parpadeo | `<script src="lib/theme-init.js"></script>` en `<head>` aplica lo guardado (tema, preset, acento y dirección) antes del primer pintado |

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
| `docs/plan-maestro.md` | Hoja de ruta: qué agregar, qué mejorar y las galerías por estilo |
| `CHANGELOG.md` | Cambios por versión |
| `.github/workflows/ci.yml` | Integración continua (build, `lib/` al día y pruebas) |

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

## Añadir un componente

Cada componente nuevo pasa por estos pasos (la CI falla si falta alguno de los que se pueden comprobar):

1. **Módulo** en `src/components/<nombre>.js`, una subclase de `TslElement` (`src/core/base.js`) o de `TslFormElement` (`src/core/form.js`) si va en formularios.
2. **CSS** en `src/css/<nn>-<nombre>.css`. Cae en la capa `tesela.components`; para otra capa, añádelo al mapa `LAYERS` de `scripts/build.js`. Usa tokens `--tsl-*`, no valores fijos.
3. **API** en `src/meta/elements.js`: atributos, propiedades, métodos y eventos. De ahí salen los tipos, el manifiesto, el autocompletado y la pestaña «API» (`tests/api.test.js` comprueba que coincide con el código).
4. **Documentación**: una `section.doc` en `components.html`, que debe pasar axe en tema oscuro y claro (`tests/accesibilidad.test.js`).
5. **Prueba** Playwright en el archivo de su grupo en `tests/`.
6. `npm run build` y versiona `lib/`.
7. Cifras al día en `index.html` (`#hero-facts`), este README y `PRODUCT.md`.

Contrato de `TslElement`, que comprueban `tests/ciclo-de-vida.test.js` y `tests/reactividad.test.js`:

| Pieza | Para qué |
|---|---|
| `setup()` | Construye el componente una sola vez, cuando sus hijos ya están en el DOM |
| `reconnected()` | Se llama al volver a montarlo: reobserva (`ResizeObserver`, `MutationObserver`) sin repetir `setup()` |
| `this.listen(target, tipo, fn, opciones)` | Escuchas en `document`/`window` que se quitan al desmontar y vuelven al remontar |
| `this.signal` | Para escuchas temporales (mientras un panel está abierto): `{ signal: this.signal }` |
| `static get observedAttributes()` + `attributeChanged(nombre, antes, ahora)` | Todo atributo documentado (`value`, `disabled`, `placeholder`, `label`, `*-label`…) repinta si cambia después del montaje. Devuelve `[...super.observedAttributes, …]` |
| `disconnectedCallback()` | Si lo defines, llama a `super.disconnectedCallback()` |

Reglas de la casa: textos por defecto en español y cambiables por atributo; iconos con `<tsl-icon>`, nunca emojis ni glifos (`tests/iconos.test.js`); el texto informativo usa `--tsl-fg-muted` (≥ 4,5:1) y `--tsl-fg-subtle` queda para lo decorativo y lo deshabilitado; objetivos táctiles de al menos 24 px.

## Hoja de ruta

El plan completo está en [`docs/plan-maestro.md`](docs/plan-maestro.md): higiene, ampliación de tokens (tipografía, espaciado, densidad, elevación, movimiento, foco, materiales), separación de **estilo** y **paleta**, un motor de galerías reutilizable, galerías por lenguaje de diseño (Material 3, Cupertino, neobrutal, terminal, Fluent, editorial…) y por tipo de pieza (marketing, plantillas de app, móviles, iconos…), unos 80 componentes nuevos con prioridad y tamaño, mejoras de los existentes (núcleo de listbox y teclado, idiomas, rendimiento), pruebas en Firefox y WebKit con regresión visual, y el orden por versiones (v1.5 → v2.x).

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
| `tests/responsive.test.js` | sin desborde de 320 a 2560 px (15 tamaños), los 212 experimentos en móvil, 20 paneles flotantes dentro de la pantalla y ergonomía táctil |
| `tests/sidebar.test.js` | barra lateral: modo de iconos, cajón en móvil, teclado, persistencia y submenús |
| `tests/radio-group.test.js` | grupo de radios: teclado, ARIA, formularios, validación y `fieldset disabled` |
| `tests/carousel.test.js` | carrusel: snap, botones, puntos, teclado, bucle, varias a la vez, avance automático y RTL |
| `tests/estilos.test.js` | componentes solo de CSS (item) |
| `tests/rtl.test.js` | derecha a izquierda: API, guardado, posiciones y teclado espejados y sin desbordes |
| `tests/portada.test.js` | portada de la galería: pared de 212 teselas, flechas, dirección numérica, filtros, favoritos, cifras verificables y tamaños de 320 a 950 px |
| `tests/gallery-layout.test.js` | minimapa sin tapar contenido, escenario del sandbox centrado, 212 miniaturas equilibradas y muestras de la documentación centradas en su marco |
| `tests/conversacion.test.js` | mensaje, marcador, zona con seguimiento, adjunto, traza, bloque de código y cuestionario |
| `tests/asistente.test.js` | entrada de prompt (Enter/IME, adjuntos por botón, pegado y arrastre, detener), sugerencias, razonamiento, fuentes y citas, versiones, acciones, medidor de contexto y el patrón de chat completo (enviar, detener, regenerar, adjuntos, seguir el final al estrecharse) |
| `tests/bloques.test.js` | asistente por pasos (validación por paso, indicador, envío y reinicio), alta de un espacio, panel de control (periodos, búsqueda, consultas de contenedor), autenticación (errores por campo, registro, código, recuperación) y ajustes (secciones, guardar y descartar, zona de peligro) |
| `tests/reactividad.test.js` | cambiar `value`, `disabled`, `placeholder`, `label` y los textos `*-label` después del montaje: todos los atributos documentados se observan y repintan |
| `tests/ciclo-de-vida.test.js` | sin escuchas en `document`/`window` tras desmontar (paleta, editor, barra lateral, menús y paneles abiertos) y remontaje sin duplicar controles |
| `tests/capas.test.js` | todo el CSS en `@layer tesela.*`, el CSS del usuario gana sin `!important`, `!important` solo donde manda un estado y alto contraste (`forced-colors`) |
| `tests/accesibilidad.test.js` | axe-core (WCAG 2.2 AA y buenas prácticas) en cada sección de la documentación, tema oscuro y claro |
| `tests/controles.test.js` | importe (formato por idioma, cursor, decimales, límites), teléfono (forma por país, prefijo al pegar, E.164), subida (validación, progreso, cancelar, reintentar, `action` real) y editor (barra accesible, formato, enlaces, listas, pegado saneado, límites) |

`scripts/audit-layout.js` (equilibrio de cada experimento), `scripts/audit-previews.js` (centrado de las miniaturas), `scripts/audit-responsive.js` y `scripts/audit-experiments.js` imprimen el detalle de los desbordes y de los objetivos táctiles pequeños (los usa `tests/responsive.test.js`).

```bash
npm install                        # solo la primera vez (instala Playwright)
npx playwright install chromium    # solo la primera vez
npm test                           # todas las pruebas
node tests/run.js data             # solo los archivos que contengan "data"
BASE_URL=http://host:24100 node tests/run.js   # contra un servidor ya levantado
```

En cada pull request, `.github/workflows/ci.yml` instala con `npm ci`, compila, comprueba que `lib/` no cambia (está versionado: hay que compilar antes de hacer commit) y ejecuta `npm test`.

`tests/run.js` levanta su propio servidor estático (`tests/server.js`, sin dependencias) y también encuentra una instalación global de Playwright. Si añades un componente, añade su prueba en el archivo del grupo correspondiente.

## Desarrollo local

Es un sitio estático. En este servidor se levanta con Podman (nginx) en el puerto **24100**:

```bash
podman compose up -d          # http://<ip-tailscale>:24100
podman compose down
```

`docker-compose.yml` es portable (sirve `./` con nginx, con `:z` por SELinux) y `docker-compose.override.yml` publica el puerto 24100 solo en desarrollo. La IP de Tailscale se obtiene con `tailscale ip -4`.
