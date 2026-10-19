# Cambios

Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). La biblioteca sigue el versionado semántico desde la v1.4.0. El historial anterior está en `git log`. La hoja de ruta está en [`docs/plan-maestro.md`](docs/plan-maestro.md).

## Sin publicar

### Añadido
- **Iconos:**
  - `<tsl-icon>` con un set base de 183 iconos de Lucide (ISC).
  - Adaptadores con versión fijada para Lucide completo, Tabler, Phosphor, Heroicons, Material Symbols y Simple Icons.
  - API para registrar bibliotecas e iconos: `registerIconLibrary`, `registerIcons`, `getIcon`, `iconNames`.
  - Máscaras `--tsl-svg-*` para usar los iconos solo con CSS.
- **Ciclo de vida en `TslElement`:**
  - `listen()` y `this.signal`: las escuchas en `document`/`window` se quitan al desmontar y vuelven al remontar.
  - `reconnected()`: al volver a montar un componente no se repite `setup()`.
- **Atributos reactivos:** `attributeChanged()`. `value`, `disabled`, `placeholder`, `label` y los textos `*-label` repintan el componente si cambian después del montaje.
- **CSS en capas:** `@layer tesela.tokens, tesela.base, tesela.components, tesela.utilities`, también en cada hoja de `lib/css/`.
- **Alto contraste:** soporte de `forced-colors` en `src/css/27-alto-contraste.css`: foco, botones, campos, casillas, radios, interruptores, slider y estados seleccionados.
- **Token `--tsl-danger-fg`:** texto sobre un relleno de peligro. Tiene regla de contraste en los 11 presets y fila en el comprobador de la documentación. Ahora hay 37 tokens.
- **Pruebas nuevas:**
  - `reactividad`, `ciclo-de-vida`, `capas` y `accesibilidad`;
  - axe-core (WCAG 2.2 AA) en las 112 secciones, en tema oscuro y claro.
- **CI:** `.github/workflows/ci.yml` hace `npm ci`, compila, comprueba que `lib/` está al día y ejecuta `npm test`.

### Cambiado
- `!important`: quedan solo en `hidden`, popover cerrado, `prefers-reduced-motion` y el texto de un botón ocupado. Se quitaron los de la tabla de datos.
- **Texto en `--tsl-fg-muted` (≥ 4,5:1):**
  - el texto informativo: valor vacío de los disparadores, `.tsl-hint`, etiquetas de la barra lateral, contadores;
  - todos los textos de sustitución.

  `--tsl-fg-subtle` queda para lo decorativo y lo deshabilitado.
- `.tsl-kbd` y la insignia neutra, un poco más claras para mantener 4,5:1.
- **Objetivos táctiles de 24 px:** botón de limpiar de los campos y puntos del carrusel.
- **Nombres de paginación:** el de `tsl-data-table` incluye su `caption`, para que dos tablas no repitan el nombre.
- **`tsl-prompt-input`:** con `disabled` también apaga los controles de su formulario.
- **Accesibilidad de varios componentes:**
  - combobox con `aria-expanded` en el input;
  - `tsl-mention` sin rol combobox en `<textarea>`;
  - `tsl-rating` de solo lectura sin atributos de valor;
  - `tsl-virtual-list` sin `aria-rowcount`;
  - medidor de `tsl-chart` con `role="meter"` en el área del dibujo;
  - cabeceras vacías de las tablas de las gráficas como celdas.

### Corregido
- **El atajo de un `<tsl-command hotkey>` desmontado** intentaba abrir un diálogo que ya no estaba en el documento.
- **Remontar duplicaba controles** en el carrusel, la barra lateral, las versiones y la zona de mensajes.
- **El carrusel reanudaba el avance automático** al remontarse aunque se hubiera pausado.
- **`tsl-upload`** pisaba la propiedad nativa `title`.

### Migración
- **Reset global de la página:** con las capas, tu CSS sin capa siempre gana. Un `* { margin: 0; padding: 0 }` sin capa quita los márgenes y rellenos de los componentes. Ponlo en una capa anterior y declara el orden antes de cargar Tesela: `<style>@layer reset, tesela;</style>`.
- **Subclases propias de `TslElement`** que definan `disconnectedCallback()`: deben llamar a `super.disconnectedCallback()`.

## 1.4.0

- Biblioteca dividida en módulos ES: un módulo por componente con su compilación (`scripts/build.js`).
- Tipos, `custom-elements.json` y datos de VS Code generados desde `src/meta/elements.js`.
- Componentes de datos, familia de conversación y patrones (panel de control, autenticación, ajustes, alta por pasos, chat).
