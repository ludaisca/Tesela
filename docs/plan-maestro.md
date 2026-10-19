# Tesela — plan maestro

Qué agregar, qué mejorar y cómo convertir Tesela en una biblioteca personal completa con **varias galerías de diseño**.

Fecha: 2026-10-19 · Base: `main` en `7018cdc` (v1.4.0)

---

## 0. Cómo leer este plan

- **Prioridad:** P1 (pronto, desbloquea otras cosas), P2 (importante), P3 (cuando haya tiempo).
- **Tamaño:** S (≤ 1 día), M (2–4 días), L (1–2 semanas), XL (más de 2 semanas).
- **«Hecho» siempre incluye** el checklist de componente que ya usa el repo:
  - módulo en `src/components/`;
  - CSS en `src/css/`;
  - entrada en `src/meta/elements.js`;
  - sección en `components.html`, que debe pasar axe;
  - prueba Playwright en `tests/`;
  - `npm run build`, porque `lib/` se versiona;
  - cifras al día en `index.html`, README y PRODUCT.md.

  Los componentes nuevos además siguen el contrato de `TslElement`:
  - `listen()` para las escuchas globales;
  - `super.disconnectedCallback()`;
  - `observedAttributes` más `attributeChanged()`;
  - textos por defecto cambiables.

### Cómo entiendo «otras galerías»

Hoy hay **una** galería (`index.html`): 212 experimentos en 24 carpetas, todos con el estilo Tesela (mono, negro lacado, dorado mate). Lo entiendo en dos sentidos, y el plan cubre los dos:

1. **Galerías por lenguaje de diseño.** Los mismos componentes con otra identidad visual completa: Material 3, iOS, Fluent, neobrutalismo, vidrio, terminal, editorial… Cada una con su portada, sus fuentes, su movimiento y sus experimentos. Esto es lo que más cambia la arquitectura, porque hoy un preset solo cambia colores, 3 radios, 2 sombras y la fuente de títulos.
2. **Galerías por tipo de pieza.** Colecciones temáticas con la misma estética: bloques de marketing, plantillas de app completas, pantallas móviles, correos HTML, iconos, movimiento, gráficas.

Si solo te interesa una de las dos, se recorta la fase 4. Las decisiones abiertas están al final.

---

## 1. Dónde estamos (cifras verificadas)

| Área | Hoy |
|---|---|
| Elementos `tsl-*` | 47 (11 asociados a formularios) |
| Familias solo CSS | unas 60 (botón, insignia, tarjeta, alerta, tabla, acordeón, tooltip, diálogo, toast, skeleton…) |
| Secciones de documentación | 112 en `components.html` (254 KB, una sola página) |
| Galería | 212 experimentos, 24 carpetas, miniaturas SVG hechas a mano |
| Tokens | 37: 27 de color, 2 de sombra, 3 de radio, 3 de fuente, 1 de curva y 1 de anillo |
| Presets | 11: 5 cambian solo el acento, 3 tocan la forma (papel, brutalista, suave) |
| Iconos | 183 de Lucide más 6 adaptadores (Lucide completo, Tabler, Phosphor, Heroicons, Material, Simple Icons) |
| Pruebas | 1244 en 30 archivos, solo Chromium; axe en 112 secciones × 2 temas |
| Peso | JS 291 KB min / 77 KB gz · CSS 139 KB min / 23 KB gz |
| CI | `ci.yml`: build, lib/ sin cambios y `npm test` |
| Despliegue | GitHub Pages (`ludaisca.github.io/tesela`) y nginx con Podman en local |

**Fortalezas:**
- cero dependencias en tiempo de ejecución;
- light DOM y `@layer`;
- tipos, manifiesto CEM y datos para VS Code generados a partir de una sola fuente;
- RTL completo, `forced-colors` y axe;
- familia de conversación/IA muy completa;
- formularios nativos con `ElementInternals`.

**Debilidades estructurales que limitan todo lo demás:**
1. **Tokens insuficientes para cambiar de estilo.** En `src/css/` hay 174 `font-size` en px, unos 195 `padding`, 108 `border: 1px`, 92 `border-radius`, 81 `999px`/`50%` y 56 `transition` escritos a mano.
2. **Textos en español sin mecanismo de idioma.** Se cambian atributo por atributo y hay textos que no se pueden cambiar (carrusel, calendario, subida, toast, copiar, razonamiento).
3. **Lógica de teclado duplicada:**
   - typeahead copiado en `tree.js` y `select.js`;
   - unos 18 componentes con flechas propias;
   - `aria-activedescendant` hecho 4 veces por separado.
4. **La galería está pensada para una sola instancia:**
   - globales `TESELA_*`;
   - «212» escrito en `index.html`, en las pruebas y en los documentos;
   - claves de `localStorage` compartidas;
   - experimentos con unos 958 `style=""` en línea.
5. **Solo Chromium**, sin regresión visual y sin axe en estados abiertos (diálogos, menús, listbox).
6. **Paquete sin publicar:** `private`, `UNLICENSED`, sin CHANGELOG ni etiquetas, y la versión duplicada en `src/core/base.js`.

---

## 2. Fase 0 — Higiene (P1, S cada uno)

Cosas pequeñas que conviene limpiar antes de crecer.

| # | Tarea | Archivos | Hecho cuando |
|---|---|---|---|
| 0.1 | Una sola fuente de versión: `VERSION` se inyecta en el build desde `package.json` | `src/core/base.js`, `scripts/build.js` (`define`) | No hay número escrito a mano |
| 0.2 | Las cifras de PRODUCT.md y README ya están al día (2026-10-19); falta una prueba que las compare con las reales | `PRODUCT.md`, `README.md`, `tests/portada.test.js` | La prueba falla si hay deriva |
| 0.3 | ⌘K de la galería escribe «N results» en inglés | `js/app.js:613` | Todo en español |
| 0.4 | `isNew` por experimento, no solo por carpeta; botón de filtro «En curso» o quitar `wip` | `js/data.js`, `js/app.js` | El filtro «Nuevos» marca piezas, no carpetas |
| 0.5 | Fallback de rutas sin `#` en nginx, y `.nojekyll` para Pages | `deploy/nginx.conf`, raíz | `/c/modals/x` no da 404 |
| 0.6 | gzip/brotli y caché en nginx | `deploy/nginx.conf` | Cabeceras correctas |
| 0.7 | Scripts `dev` (build en watch + servidor) y `serve` | `package.json`, `scripts/build.js --watch` | `npm run dev` recompila al guardar |
| 0.8 | Cerrar la deriva de `css/styles.css` (sandbox y ⌘K en Inter, acentos hex propios) | `css/styles.css` | Sigue `DESIGN.md` |

---

## 3. Fase 1 — Fundamentos del sistema de diseño (P1, XL)

**Es la fase clave.** Sin ella no puede haber galerías de otros estilos: hay que convertir los valores escritos a mano en tokens y separar **estilo** de **paleta**.

### 1.1 Ampliar los tokens (L)

Añadir a `src/tokens/tokens.json`, en formato DTCG como ahora:

| Categoría | Tokens propuestos | Para qué |
|---|---|---|
| Tipografía | `font.size.{2xs,xs,sm,md,lg,xl,2xl,3xl,display}`, `font.weight.{regular,medium,semibold,bold}`, `font.leading.{tight,normal,relaxed}`, `font.tracking.{tight,normal,wide,caps}`, `font.body` (hoy la base es la mono) | Material type scale, iOS Dynamic Type, editorial |
| Espaciado | `space.{0,1,2,3,4,5,6,8,10,12,16}` sobre una base (`--tsl-space-unit`, 4 px) | Densidad y ritmo |
| Densidad y controles | `control.height.{sm,md,lg}`, `control.padding-x`, `density` (compacta/normal/cómoda) | Fluent compacto frente a iOS amplio; hoy lo resuelve `25-tactil.css` aparte |
| Bordes | `border.width.{default,strong,focus}`, `border.style` | Neobrutalismo con bordes de 3 px |
| Radios | sumar `radius.{lg,xl,full}` a los 3 actuales | Píldoras y círculos que sigan al estilo |
| Elevación | `shadow.{xs,sm,md,lg,xl,inset}` y `surface.tonal.{1..5}` | Elevación tonal de Material 3 y sombras duras de brutalismo |
| Capas | `z.{base,dropdown,sticky,overlay,modal,toast,tooltip}` | Hoy hay valores 1/2/5/39/40/60/70/1000 escritos a mano |
| Movimiento | `duration.{instant,fast,normal,slow,emphasis}`, `ease.{standard,emphasized,decelerate,accelerate,spring}` | Spring de iOS, emphasized de Material |
| Foco | `focus.width`, `focus.offset`, `focus.color`, `focus.style` (anillo/contorno/subrayado) | Hoy `ring.default` no lo cambia ningún preset |
| Estados | `state.hover`, `state.press`, `state.selected`, `state.disabled` (opacidades de capa de estado) | Capas de estado de Material y «reveal» de Fluent |
| Materiales | `material.blur`, `material.glass-opacity`, `material.noise` (url), `gradient.{brand,surface}` | Vidrio, acrílico y mica |
| Puntos de quiebre | documentados como tokens, no usables en `@media` | Las consultas usan `@container` y valores del build |

La regla de contraste (`scripts/lib/contrast-rules.js`) y `tests/tokens.test.js` tienen que aceptar superficies translúcidas: medir el vidrio compuesto sobre el fondo de peor caso.

### 1.2 Refactor del CSS a tokens (XL, por lotes)

- Sustituir los literales por tokens archivo por archivo de `src/css/`, empezando por `03-botones`, `06-controles`, `17-dialogos`, `21c-campos` y `16-menus`.
- Una prueba nueva, `tests/literales.test.js`, cuenta los literales que quedan (px de `font-size`, `padding`, `border-radius`, `transition`, `z-index`) y **solo puede bajar**: un presupuesto que se ajusta en cada lote.
- Criterio de hecho: el estilo Tesela se ve **idéntico al píxel**. Lo comprueba la regresión visual de la fase 6, que conviene montar antes de este refactor.

### 1.3 Separar estilo y paleta (L)

Hoy `data-preset` mezcla las dos cosas. Propuesta:

- **`data-style`**: el lenguaje de diseño. Fija forma, tipografía, densidad, movimiento, foco, materiales y su paleta neutra por defecto. Por ejemplo `tesela`, `material`, `cupertino`, `fluent`, `neobrutal`, `vidrio`, `terminal`, `editorial`.
- **`data-preset`**: la paleta. Acento y neutros, como ahora: esmeralda, ámbar, cielo, rosa, violeta, medianoche, alto-contraste…
- **`data-theme`**: oscuro, claro o sistema, sin cambios.
- **`data-density`**: compacta, normal o cómoda.

Una paleta funciona con cualquier estilo. Papel, brutalista y suave pasan a ser estilos, y se mantienen como alias de preset por compatibilidad.

API:
- `TeselaUI.setStyle()`, `getStyle()` y `styles`;
- el script anti-parpadeo `theme-init.js` también aplica el estilo;
- todo funciona en cualquier contenedor, igual que `[data-preset]` hoy.

Archivos:
- `src/tokens/styles.json` (nuevo);
- `scripts/build-tokens.js`, que genera `lib/styles/<estilo>.css`;
- `src/api/theme.js`, `src/theme-init.js`;
- `tests/tokens.test.js`, que hoy fija «11 presets» y «37 tokens» y debe leer las cifras del JSON.

### 1.4 Fuentes por estilo (M)

- Cada estilo declara sus fuentes. El build genera `@font-face` y copia los `.woff2` a `lib/fonts/` con su licencia, como ya se hace con Lucide.
- Solo fuentes OFL o Apache, autoalojadas (sin Google Fonts en tiempo de ejecución):
  - Roboto Flex (Material);
  - Inter (Cupertino: SF no se puede redistribuir; se usa la pila `system-ui` primero);
  - IBM Plex Sans y Mono (Fluent y empresa);
  - Space Grotesk (neobrutal);
  - JetBrains Mono o Spline Sans Mono (terminal);
  - Fraunces o Newsreader (editorial).
- Carga perezosa: la fuente solo se pide cuando se activa el estilo.

### 1.5 Comportamientos que dependen del estilo (M)

Algunos estilos piden más que CSS:
- ripple de Material;
- spring de iOS al abrir hojas;
- «reveal» de Fluent.

Propuesta: *hooks* opcionales en `src/styles/<estilo>.js` que se registran con `TeselaUI.registerStyle()`. El núcleo no los carga si no se usa ese estilo, así que el peso base no crece. Siempre respetan `prefers-reduced-motion`.

---

## 4. Fase 2 — Motor de galerías reutilizable (P1, L)

Convertir la galería actual en un **motor** y la galería Tesela en **una instancia** de ese motor.

| # | Tarea | Detalle |
|---|---|---|
| 2.1 | Separar motor e instancia | `gallery/engine/` contiene la pared, el minimapa, el sandbox, ⌘K, los favoritos, la dirección numérica, Blueprint y el panel de tokens; viene de `js/app.js` y `js/experiments/core.js`. Cada galería tiene un `manifest.js` con título, tesis, estilo, paleta, carpetas y experimentos |
| 2.2 | Espacio de nombres | Clave `galería/carpeta/pieza`; `localStorage` con prefijo por galería (`tesela-favorites` → `tsl-gal:<id>:favoritos`); migrar los favoritos existentes |
| 2.3 | Cifras derivadas | Nada de «212» escrito a mano: título, meta, contadores, `aria-label` de la pared y pruebas leen el manifiesto. La rejilla (`--rows`) se calcula a partir del número de piezas |
| 2.4 | Experimentos sin estilos en línea | Pasar los unos 958 `style=""` y las clases `.xp-*` con radios fijos a clases que usen tokens, para que **el mismo experimento** se vea bien en cualquier estilo. Por lotes de carpeta y con presupuesto que solo baja, como 1.2 |
| 2.5 | Miniaturas generadas | Script `scripts/miniaturas.js` que monta cada experimento con Playwright, lo captura por estilo y lo guarda en `.webp` con `<img>` y `alt`. Los SVG hechos a mano se conservan para la galería Tesela si se quiere mantener su carácter; las demás usan capturas. La prueba de centrado ±14 pasa a ser solo para SVG |
| 2.6 | Portada por galería | Cada galería puede tener su propia portada (la pared de teselas es la de Tesela; Material podría usar una cuadrícula de tarjetas M3; terminal, un listado `ls -la`). El motor ofrece la pared por defecto |
| 2.7 | Centro de galerías | `galerias.html` (o la raíz) lista las galerías con su tesis, cifras y muestra viva. Selector de estilo global en la cabecera |
| 2.8 | Comparador | Vista partida: el mismo experimento en dos estilos lado a lado, con cortina arrastrable (puede usar el futuro `tsl-image-compare`) |
| 2.9 | Rutas | `#/g/<galería>/c/<carpeta>/<pieza>` con compatibilidad para `#/c/…`; páginas estáticas `galerias/<id>/index.html` sin build, igual que hoy |
| 2.10 | Pruebas por galería | `gallery.test.js`, `gallery-layout.test.js`, `responsive.test.js` y axe recorren **todas** las galerías del manifiesto, no cifras fijas |

Archivos principales:
- `js/app.js` (motor);
- `js/data.js` (pasa a ser el manifiesto de Tesela);
- `js/experiments/*.js`;
- `js/previews.js`;
- `css/galeria.css`, `css/experiments.css`;
- `tests/portada.test.js`, `tests/gallery*.test.js`.

---

## 5. Fase 3 — Galerías nuevas

### 3A. Por lenguaje de diseño (dependen de las fases 1 y 2)

Cada galería tiene:
- **una tesis** de una línea;
- **su estilo** en `styles.json`;
- **sus fuentes**;
- **componentes o variantes propios**;
- **un subconjunto de los 212 experimentos** reestilizados, más piezas exclusivas;
- **pruebas**: contraste de su estilo con todas las paletas y modos, axe y regresión visual.

| Galería | Tesis | Rasgos de estilo | Piezas o componentes exclusivos | Prioridad |
|---|---|---|---|---|
| **Tesela** (actual) | Pared de teselas: sobria, premium, mono | Ya existe | — | — |
| **Material 3** | Superficies tonales y capas de estado | Elevación tonal, ripple, escala tipográfica M3, radios grandes, Roboto Flex | FAB y speed dial, *navigation rail*, *top app bar*, *bottom nav*, chips de filtro y de entrada, *snackbar* | P1 |
| **Cupertino (iOS/macOS)** | Contenido primero y vidrio | Títulos grandes, listas agrupadas, hojas con spring, desenfoque, `system-ui` | *Action sheet*, interruptor iOS, selector de rueda (fecha y hora), barra de pestañas, *swipe actions* | P1 |
| **Neobrutal** | Honestidad gráfica | Bordes de 3 px, sombras duras desplazadas, saturación alta, Space Grotesk | Pegatinas, marquesinas, tarjetas inclinadas (sin perder accesibilidad) | P2 |
| **Terminal / TUI** | La interfaz como consola | Solo mono, bordes ASCII o de caja, verde u ámbar fósforo, cursor parpadeante (con `reduced-motion`), modo CRT opcional | Prompt, *log* en vivo, tabla `ls`, barra de progreso ASCII, menú por teclas | P2 |
| **Fluent 2** | Productividad de escritorio | Acrílico y mica, densidad compacta, foco «reveal», IBM Plex o `system-ui` | *Ribbon* / barra de comandos con desbordamiento, panel de detalles, *teaching bubble* | P2 |
| **Vidrio / aurora** | Profundidad y luz | Desenfoque, degradados aurora, ruido, bordes de luz; con contraste vigilado (vidrio sobre el peor fondo) | Paneles flotantes, *dock*, tarjetas con brillo al cursor | P3 |
| **Editorial / impresa** | La interfaz como revista | Serif (Fraunces o Newsreader), columnas, filetes, capitulares, numeración romana | Artículo largo, índice con *scrollspy*, notas al margen, citas, estilos `@media print` | P2 |
| **Empresa densa** | Datos primero, estilo Carbon o Spectrum | Densidad compacta, rejilla de 8 px, IBM Plex, estados muy claros | Tabla editable, filtros complejos, panel lateral de detalles, *breadcrumbs* largos | P2 |
| **Lúdica** | Amable y redondeada | Radios muy grandes, colores cálidos, movimiento con rebote (opcional) | Pasos ilustrados, logros, rachas | P3 |
| **Suiza / Bauhaus** | Rejilla y tipografía | Grotesca, rejilla estricta, color plano primario, asimetría | Carteles, horarios, señalética | P3 |

### 3B. Galerías por tipo de pieza (solo necesitan la fase 2)

| Galería | Contenido | Prioridad |
|---|---|---|
| **Bloques de marketing** | *Heroes*, características, precios, testimonios, FAQ, CTA, pies, logos, equipo, *changelog*, 404 | P1 |
| **Plantillas de app completas** | SaaS (*onboarding*, panel, facturación), comercio (catálogo, carrito, *checkout*), banca, salud (citas), educación (curso), CRM, *helpdesk*: pantallas enlazadas que navegan entre sí | P1 |
| **Pantallas móviles** | Marco de teléfono, navegación inferior, hojas, gestos y *pull to refresh*, a 360–430 px | P2 |
| **Correos HTML** | Plantillas en tablas compatibles con clientes de correo (CSS en línea generado por script): bienvenida, factura, restablecer contraseña, resumen | P3 |
| **Iconos** | Explorador de los 183 iconos base y de los adaptadores: búsqueda, tamaño, trazo, copiar `<tsl-icon>`/SVG | P1 (S) |
| **Movimiento** | Microinteracciones y transiciones (View Transitions, `@starting-style`), cada una con su versión de movimiento reducido | P3 |
| **Gráficas** | Todas las variantes de `tsl-chart` y las nuevas de la fase 4, con datos reales de ejemplo | P2 |
| **Tipografía** | Especímenes de cada estilo: escala, pares, ritmo vertical | P3 |

---

## 6. Fase 4 — Componentes nuevos

Están ordenados por grupo. Los que hoy existen solo como CSS pasan a ser elementos y se mantiene la clase CSS como alternativa sin JS.

### 4.1 Elementos que hoy son solo CSS o API (P1)

| Componente | Hoy | Qué falta | Tamaño |
|---|---|---|---|
| `tsl-tooltip` | `::after` en CSS, sin posicionar | Posicionado con `position.js` o *anchor positioning*, retardo, contenido rico, `aria-describedby`, Esc, táctil | M |
| `tsl-accordion` | `<details>` con CSS | Modo de uno o varios abiertos, flechas y Home/End, animación de altura, `open`/`value` reactivos | S |
| `tsl-dialog` / `tsl-drawer` | `<dialog>` + `data-tsl-open` | Elemento con `open()`, `close(valor)`, eventos `tsl-open`/`tsl-close`/`tsl-request-close` (cancelable), apilado, foco devuelto, lados del cajón, hoja inferior integrada | M |
| `tsl-toast-region` | API `TeselaUI.toast` | Elemento región: posición, límite de pila, pausa al pasar el cursor, `toast.promise()` (cargando → éxito o error), «Deshacer», agrupar duplicados | M |
| `tsl-number-input` | `.tsl-number` + behaviors | Asociado a formulario, formato Intl, `step`/`min`/`max`, rueda, flechas, mantener pulsado | S |
| `tsl-progress-ring` | Solo el gauge de `tsl-chart` | Anillo determinado e indeterminado con etiqueta | S |
| `tsl-avatar` | CSS | Iniciales de reserva, estado (en línea…), grupo con «+N», carga perezosa | S |
| `tsl-alert` | CSS | Descartable, con acción y con persistencia del descarte | S |
| `tsl-timeline` | CSS | Elemento con agrupación por fecha, estados y carga perezosa | S |

### 4.2 Formularios

| Componente | Detalle | Prioridad |
|---|---|---|
| `tsl-form` + `tsl-field` | Cablea solos la etiqueta, la pista y el error (`aria-describedby`); validación al salir del campo o al enviar; resumen de errores accesible al enviar; mensajes en español; integra todos los `TslFormElement` | P1 (M) |
| `tsl-datetime-picker` | Fecha y hora en un solo campo; zona horaria opcional | P2 |
| Rangos con atajos | «Hoy», «Últimos 7 días», «Este mes», «Trimestre» en `tsl-date-picker range` | P1 (S) |
| `tsl-input-mask` | Máscara genérica (RFC/CURP, tarjeta, código postal, fecha) con cursor estable (reutiliza la lógica de `currency.js` y `phone.js`) | P2 |
| `tsl-phone` completo | De 12 países a toda la lista ISO con máscaras; banderas en SVG, nunca emojis | P2 |
| `tsl-country-select` | Selector de países rico (nombre en el idioma, prefijo, búsqueda, banderas SVG) | P2 |
| `tsl-search` | Campo de búsqueda con recientes, sugerencias, atajo y limpiar | P2 (S) |
| `tsl-transfer-list` | Dos listas con mover, buscar y todos | P3 |
| `tsl-signature` | Firma en lienzo, exportar PNG o SVG, asociado a formulario | P3 |
| `tsl-color-swatches` | Muestras sueltas, asociado a formulario | P3 (S) |
| `tsl-address` | Autocompletar dirección con proveedor enchufable (sin dependencia fija) | P3 |
| `tsl-switch` | Interruptor como elemento, con etiquetas de encendido y apagado | P3 (S) |

### 4.3 Datos y contenido

| Componente | Detalle | Prioridad |
|---|---|---|
| `tsl-data-table` v2 | Virtualización de filas, columnas fijas y redimensionables, filtros por columna, agrupación y subtotales, filas expandibles, **edición de celdas** con teclado tipo hoja de cálculo, guardar la vista (orden, columnas, filtros) | P1 (XL, por partes) |
| `tsl-virtual-list` | Alto de fila variable (medido) | P2 (M) |
| `tsl-calendar` con eventos | Vistas mes, semana, día y agenda; arrastrar para crear o mover; eventos de varios días; zonas horarias | P2 (L) |
| `tsl-json-viewer` | Árbol plegable, búsqueda, copiar ruta y valor, tipos con color | P2 (M) |
| `tsl-diff` | Diferencias reales (algoritmo de Myers propio), unificado o lado a lado, aceptar o rechazar por bloque; útil para IA | P2 (M) |
| `tsl-code` | Bloque con resaltado ligero propio (`js/highlight.js` → núcleo), números de línea, copiar, plegar | P2 (M) |
| `tsl-code-editor` | Editor ligero: textarea con capa de resaltado, sangría, atajos | P3 (L) |
| `tsl-markdown` | Visor de Markdown seguro (subconjunto CommonMark, saneado con el saneador del editor) y modo *streaming* para IA | P2 (M) |
| Más tipos en `tsl-chart` | Dispersión, radar, embudo, *treemap*, velas (fintech), combinada barra+línea, área apilada; zoom y selección de rango; tooltips accesibles | P2 (L) |
| `tsl-heatmap-calendar` | Mapa de actividad estilo GitHub | P3 (S) |
| `tsl-gantt` | Tareas, dependencias, hitos, zoom temporal | P3 (XL) |
| `tsl-org-chart` | Organigrama plegable | P3 (L) |
| `tsl-kanban` | Elemento sobre `tsl-sortable`: columnas, límites WIP, añadir tarjeta, carriles | P2 (M) |
| `tsl-file-tree` | `tsl-tree` con iconos por tipo, carga perezosa, renombrar, arrastrar | P2 (M) |

### 4.4 Medios

| Componente | Detalle | Prioridad |
|---|---|---|
| `tsl-lightbox` | Galería a pantalla completa: teclado, gestos, zoom, pie de foto | P2 (M) |
| `tsl-image-compare` | Antes y después con cortina accesible (slider) | P2 (S) |
| `tsl-cropper` | Recorte con relación de aspecto y rotación; exporta a Blob | P3 (L) |
| `tsl-video` / `tsl-audio` | Controles propios accesibles, subtítulos (VTT), velocidad, capítulos, forma de onda en el audio | P3 (L) |
| `tsl-qr` | Generador de QR sin dependencias (implementación propia de Reed-Solomon), SVG | P3 (M) |
| `tsl-map` | Solo si hay proveedor de teselas enchufable; si no, descartar | P3 |

### 4.5 Navegación y estructura

| Componente | Detalle | Prioridad |
|---|---|---|
| `tsl-app-shell` | Cabecera, barra lateral, contenido y pie con *slots* y comportamiento adaptable | P1 (M) |
| `tsl-tabs` v2 | Desbordamiento con desplazamiento o menú «más», cerrables, reordenables, carga perezosa del panel | P2 (M) |
| `tsl-toolbar` | Barra de herramientas con roving focus y desbordamiento en menú | P2 (M) |
| `tsl-breadcrumb` | Colapsa los tramos intermedios en un menú | P2 (S) |
| `tsl-pagination` | Elemento con cálculo de páginas, saltar a página y tamaño | P2 (S) |
| `tsl-stepper` | Pasos como elemento (hoy `.tsl-steps`), vertical u horizontal, estados | P2 (S) |
| `tsl-toc` | Índice con *scrollspy* | P2 (S) |
| `tsl-tour` | Recorrido guiado: resalta un elemento, pasos, teclado, «no volver a mostrar» | P2 (M) |
| `tsl-notification-center` | Bandeja con no leídas, agrupación, marcar como leídas | P2 (M) |
| `tsl-split-button` / `tsl-fab` / `tsl-speed-dial` | Botón con menú y botón flotante | P3 (S) |
| `tsl-bottom-nav` / `tsl-nav-rail` | Navegación móvil y riel (para Material e iOS) | P2 (S) |

### 4.6 Interacción y utilidades (estilo Web Awesome)

| Pieza | Detalle | Prioridad |
|---|---|---|
| `TeselaUI.hotkeys` | Registro de atajos con ámbitos, secuencias («g i») y diálogo de ayuda con `?`, integrado con `tsl-command` | P1 (M) |
| `tsl-relative-time` | «hace 3 minutos» con Intl y actualización viva | P2 (S) |
| `tsl-format-number` / `-bytes` / `-date` | Formato declarativo | P2 (S) |
| `tsl-infinite-scroll` | Carga al llegar al final (IntersectionObserver), con estado y error | P2 (S) |
| `tsl-pull-to-refresh` / `tsl-swipe-actions` | Gestos táctiles con alternativa de teclado | P3 (M) |
| `tsl-include` | Inserta HTML de una URL (saneado) | P3 (S) |
| Deshacer | Pila de deshacer reutilizable que integran los toasts | P3 (S) |

### 4.7 IA (ampliar lo que ya es fuerte)

| Pieza | Detalle | Prioridad |
|---|---|---|
| `tsl-tool-call` | Llamada a herramienta: argumentos, estado, resultado plegable y aprobación | P2 (S) |
| `tsl-artifact` | Panel lateral de artefacto con versiones, copiar y descargar | P2 (M) |
| `tsl-model-select` | Selector de modelo con capacidades y coste | P3 (S) |
| `tsl-voice-input` | Dictado con Web Speech (degradación si no hay soporte) | P3 (S) |
| Respuesta en *streaming* | `tsl-markdown` incremental más cursor | P2 (con 4.3) |

---

## 7. Fase 5 — Mejoras de lo que ya existe

### 5.1 Núcleo compartido (P1, L)

- **`src/core/listbox.js`:** `aria-activedescendant`, typeahead, selección simple y múltiple, desplazar a la vista. Lo usarían `select`, `command`, `mention`, `virtual-list` y `tree`. Se borran las copias de typeahead en `tree.js` y `select.js`.
- **`src/core/roving.js`:** amplía `moveFocus` (rejillas 2D, saltar deshabilitados, RTL) para los unos 18 componentes con flechas propias: radio-group, rating, slider, carousel, sortable, time-picker, chart, resizable…
- **Cierre al clicar fuera:** `dismissOnOutside` en todos los paneles, también en context-menu.
- **Estados con `ElementInternals`:** `internals.states` (`:state(open)`, `:state(invalid)`, `:state(busy)`) además de los atributos, para que el CSS del usuario los pueda seleccionar.
- **Posicionamiento:** *CSS anchor positioning* cuando esté soportado, con el motor JS actual como alternativa.

### 5.2 Internacionalización (P1, L)

- `src/i18n/`: catálogos `es` (por defecto), `en` y `pt`. Registro con `TeselaUI.setLocale()` y `registerTranslations()`.
- Prioridad de un texto: atributo → idioma del elemento (`lang` más cercano) → catálogo → español.
- Mover todos los textos escritos en el código, incluidos los que hoy no se pueden cambiar: carrusel, calendario, subida, toast, copiar, razonamiento y valores por defecto de `confirm`.
- Prueba: `tests/i18n.test.js` monta cada componente en inglés y comprueba que no queda ningún texto en español.

### 5.3 Componentes concretos (P2)

| Componente | Mejora |
|---|---|
| `tsl-select` | Virtualizar listas largas; carga asíncrona (`loader`) con debounce y estados; agrupar las seleccionadas arriba |
| `tsl-command` | Subpáginas (navegar dentro de un comando), recientes, atajos visibles por ítem, fuentes asíncronas |
| `tsl-date-picker` | Escribir la fecha a mano con validación por idioma; atajos de rango (4.2) |
| `tsl-editor` | Tablas, imágenes, menciones dentro del editor, contador de palabras, Markdown de entrada y salida |
| `tsl-carousel` | Miniaturas, pantalla completa (con lightbox), modo fundido |
| `tsl-chart` | Leyenda con teclado completa, exportar PNG o SVG, tema por estilo |
| `tsl-upload` | Pegar desde el portapapeles, carpetas, reanudar subida (*chunks*), vista previa de imagen |
| `tsl-tree` | Arrastrar para mover, carga perezosa, filtro |
| `tsl-sidebar` | Varios niveles, búsqueda dentro, estado por ruta activa |
| `tsl-rating` | Iconos propios (corazones, etc. con `tsl-icon`) |

### 5.4 Accesibilidad (P1, M)

- axe en **estados abiertos**: diálogos, `tsl-command`, popovers, menús, listbox del select, date-picker, hojas y toasts.
- axe en la galería, en RTL, con el preset `alto-contraste` y a 375 px.
- `prefers-contrast: more` → activar las reglas de alto contraste sin elegir el preset.
- `@media print` (documentación y tablas) y `hover: none`.
- Lista de comprobación manual con lector de pantalla (NVDA con Firefox, VoiceOver con Safari) por componente, en `docs/a11y/`.
- Tabla de teclado por componente, generada desde `elements.js` (campo nuevo `keyboard`) y mostrada en la pestaña API.

### 5.5 Rendimiento y peso (P2, M)

- **Iconos recortables:** hoy cualquier componente con icono arrastra los 183 (34 KB). Basta un módulo por icono, o que el núcleo use solo los iconos que necesita y el resto se registre aparte. Objetivo: `tabs` sigue en unos 1 KB gz y `select` baja de 15 KB gz.
- **Cargador automático:** `tesela-autoloader.js` observa etiquetas `tsl-*` sin definir y las importa al vuelo.
- **CSS por componente:** cada ESM sabe qué hoja necesita; mapa `componente → hoja` en `custom-elements.json`.
- **Presupuesto de tamaño en CI:** falla si un componente crece más de un X % sin justificarlo.

---

## 8. Fase 6 — Pruebas y CI (P1, M–L)

| # | Tarea | Detalle |
|---|---|---|
| 6.1 | Regresión visual | Capturas de cada sección de la documentación y de cada experimento, por estilo y tema, comparadas con una referencia (comparador de píxeles propio o `@playwright/test` como dependencia de desarrollo). **Antes del refactor 1.2** |
| 6.2 | Firefox y WebKit | Matriz en CI; empezar con las pruebas de componentes; ajustar lo que falle (Popover API, `ElementInternals` y `:has()` ya están en los tres) |
| 6.3 | Paralelismo | `tests/run.js` lanza varios archivos a la vez (hoy van en serie) |
| 6.4 | Pruebas unitarias sin navegador | `core/` (posición, fechas, `moveFocus`, saneador, color) con `node:test` |
| 6.5 | Cobertura | Cobertura JS de Playwright con un informe sencillo |
| 6.6 | Lint | ESLint, Stylelint y Prettier como dependencias de desarrollo, en CI |
| 6.7 | CI más útil | Caché de navegadores, artefactos (capturas, diferencias) cuando falla, informe de tamaño en el PR, auditorías `scripts/audit-*.js` en CI |
| 6.8 | Cifras sin escribir a mano | Todas las pruebas leen los números del manifiesto, de `elements.js` y de los tokens |

---

## 9. Fase 7 — Paquete, DX y documentación (P2)

### 7.1 Paquete

- **Licencia:** decidir (ver decisiones abiertas). Si es solo personal, mantener `private` y poner un `LICENSE` claro.
- Versionado semántico, etiquetas `v1.5.0` y *releases* de GitHub con `lib/` comprimido. `CHANGELOG.md` ya existe (2026-10-19): mantenerlo en cada PR.
- *Source maps* del ESM y tipos por componente (`./components/*` con condición `types`).
- Tipos para frameworks generados desde `custom-elements.json`:
  - React: `JSX.IntrinsicElements`;
  - Vue: `GlobalComponents`;
  - Svelte: `svelteHTML`.
- Envoltorios opcionales para React en un paquete aparte, sin dependencias en el núcleo.

### 7.2 DX

- **Generador** `npm run nuevo -- tsl-nombre`: crea los archivos del checklist de componente (módulo, CSS, meta, sección y prueba) con el contrato de `TslElement` listo.
- `npm run dev`: build en watch, servidor y recarga.
- `CONTRIBUTING.md`: el checklist, el contrato de `TslElement`, las capas CSS, los tokens y la regla de no usar emojis. Hoy viven en la sección «Añadir un componente» del README; moverlas cuando crezcan.

### 7.3 Documentación

- Partir `components.html` (254 KB) en una página por componente generada desde `elements.js` y las demos, manteniendo una vista índice; o cargar las secciones de forma perezosa.
- **Playground** en la pestaña API: controles generados desde el manifiesto que cambian atributos en vivo (ahora que todos son reactivos).
- Guía «Crea tu propio estilo» (tokens, fuentes, *hooks*) y «Crea tu galería» (manifiesto y experimentos).
- Ejemplos de uso con React, Vue, Svelte, Astro y HTML puro.
- Selector de estilo, paleta, tema y densidad en la documentación, igual que en las galerías.

---

## 10. Fase 8 — Despliegue (P3, S)

- Pages con `.nojekyll`; dominio propio opcional (`tesela.<dominio>`).
- O bien desplegar con Coolify como sitio estático (nginx con gzip/brotli y caché), con Pages como espejo.
- Rutas por galería (`/galerias/<id>/`) que funcionen en los dos sitios.

---

## 11. Orden recomendado (hitos)

| Hito | Contenido | Por qué en este orden |
|---|---|---|
| **v1.5 — Limpieza** | Fase 0, 6.1 (regresión visual), 6.3 (paralelo), 5.1 (núcleo listbox/roving), galería de iconos (3B) | Red de seguridad antes de tocar el CSS; ganancias rápidas |
| **v1.6 — Tokens** | 1.1 y 1.2 (refactor a tokens por lotes), 5.4 (a11y en estados abiertos) | El estilo Tesela debe quedar idéntico al píxel |
| **v1.7 — Idiomas y formularios** | 5.2 (i18n), 4.1 (tooltip, accordion, dialog, toast-region, number-input), 4.2 `tsl-form`/`tsl-field` | Lo más usado en el día a día |
| **v2.0 — Estilos y motor de galerías** | 1.3, 1.4, 1.5 y fase 2 completa | Cambio grande: alias de compatibilidad para presets |
| **v2.1 — Primeras galerías** | Material 3 y Cupertino (3A); bloques de marketing y plantillas de app (3B) | Las más distintas entre sí validan el sistema |
| **v2.2+ — Oleadas** | Una galería nueva por versión (neobrutal, terminal, editorial, Fluent, empresa…) y componentes de la fase 4 por grupos | Ritmo sostenido |
| **Continuo** | 5.3, 5.5, fases 6 a 8 | Calidad |

Trabajo en paralelo posible: la fase 4 (componentes) avanza al mismo tiempo que las fases 1 y 2. Los componentes nuevos se escriben desde el principio con tokens.

---

## 12. Riesgos y cómo controlarlos

| Riesgo | Control |
|---|---|
| El refactor a tokens cambia el aspecto sin querer | Regresión visual antes de empezar; lotes pequeños; el presupuesto de literales solo baja |
| El estilo vidrio y otros estilos rompen el contraste | La regla de contraste mide superficies compuestas; axe por estilo y paleta |
| El peso crece con cada estilo | Estilos y fuentes en archivos aparte, carga perezosa, presupuesto de tamaño |
| Las galerías se vuelven trabajo de miniaturas | Miniaturas generadas con capturas; los SVG a mano solo en Tesela |
| Romper a quien ya usa `data-preset` | Alias de compatibilidad y guía de migración en v2.0 |
| Los emojis se cuelan en galerías lúdicas | `tests/iconos.test.js` ya lo impide; se amplía a todas las galerías |
| Fuentes con licencia dudosa | Solo OFL o Apache, autoalojadas, con su licencia en `lib/fonts/` |

---

## 13. Decisiones abiertas

1. **Galerías:** ¿por lenguaje de diseño (Material, iOS, neobrutal…), por tipo de pieza (marketing, plantillas, móviles…) o las dos? Mi recomendación es las dos, empezando por Material 3, Cupertino y bloques de marketing.
2. **¿Qué estilos te importan más?** Para decidir el orden de 3A.
3. **Licencia:** ¿se queda privada (`UNLICENSED`) o la abres (MIT)? Afecta a releases, npm y envoltorios.
4. **Frameworks:** ¿usas Tesela dentro de React, Vue o Astro? Si sí, los tipos y envoltorios suben a P1.
5. **Idiomas:** ¿basta con español e inglés, o también portugués u otros?
6. **Miniaturas:** ¿mantener el SVG hecho a mano en la galería Tesela, o pasar todas a capturas generadas?
7. **Despliegue:** ¿Pages está bien, o prefieres un dominio propio servido con Coolify?
