# devl.dev v2 — Zero-Dependency Interactive UI Scratch Pad (24 Folders · 212 Experiments)

Recreación y evolución completa de **devl.dev** construida **100% desde cero sin librerías externas** (Cero Tailwind, Cero React, Cero Lucide, Cero dependencias NPM), conservando y elevando su línea estética técnica.

- **Live Demo (GitHub Pages):** [https://ludaisca.github.io/devl-scratchpad/](https://ludaisca.github.io/devl-scratchpad/)
- **Biblioteca de componentes (docs):** [https://ludaisca.github.io/devl-scratchpad/components.html](https://ludaisca.github.io/devl-scratchpad/components.html)

## devl-ui — Biblioteca de componentes

Biblioteca propia **sin dependencias** con el mismo estilo de la galería: 43 componentes (botones, formularios, OTP, tags, dropzone, calendario, tabs, menús, command palette, diálogos, drawers, toasts, tablas ordenables, sparklines…) más patrones de ejemplo.

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

- **CSS (`devl-ui.css`):** tokens `--dv-*` + clases `dv-*`. Funciona sin JS.
- **JS (`devl-ui.js`):** Custom Elements en light DOM (`<dv-tabs>`, `<dv-segmented>`, `<dv-menu>`, `<dv-command>`, `<dv-otp>`, `<dv-tags>`, `<dv-dropzone>`, `<dv-calendar>`, `<dv-sparkline>`) y atributos `data-dv-*` (abrir/cerrar diálogos, copiar, tema, tablas ordenables, rangos, steppers).
- **API global:** `DevlUI.toast()`, `DevlUI.copy()`, `DevlUI.setTheme()`, `DevlUI.getTheme()`, `DevlUI.init(root)`.
- **Eventos:** todos los componentes emiten eventos `dv-*` que burbujean (`dv-change`, `dv-select`, `dv-complete`, `dv-copy`, `dv-theme`).
- **Temas:** oscuro por defecto; `data-theme="light"` en `<html>`. Cambia la marca sobrescribiendo `--dv-accent`, `--dv-radius`, etc.
- **Accesibilidad:** roles ARIA, navegación por teclado, `<dialog>` nativo y soporte de `prefers-reduced-motion`.

Abre `components.html` para ver cada componente en vivo, con su HTML/JS listo para copiar.

### Estructura

| Ruta | Contenido |
|---|---|
| `lib/devl-ui.css`, `lib/devl-ui.js` | La biblioteca (lo único que necesitas copiar) |
| `components.html`, `docs/` | Documentación interactiva de la biblioteca |
| `index.html`, `css/`, `js/` | Galería original de experimentos |

## Novedades de la Versión Mejorada (v2)

1. **24 Carpetas · 212 Experimentos (+54 nuevos componentes propios):**
   - Además de las 18 carpetas originales (todas actualizadas a estado producción sin stubs `WIP`), se añadieron **6 carpetas de nueva generación**:
     - **`AI & Agents` (10 archivos):** `prompt-composer`, `streaming-trace`, `tool-call-inspector`, `model-arena-selector`, `token-budget-meter`, `context-window-stack`, `agent-handoff-graph`, `citation-popover`, `voice-waveform-hud`, `diff-apply-review`.
     - **`Shaders & Canvas` (10 archivos):** `magnetic-cursor-grid`, `ascii-matrix-field`, `simplex-flow-lines`, `dither-halftone-shader`, `interactive-cloth-mesh`, `raymarched-sdf-orb`, `audio-fft-spectrum`, `bezier-node-graph`, `voronoi-cell-reactor`, `crt-scanline-terminal`.
     - **`DevTools & Logs` (9 archivos):** `network-waterfall`, `flamegraph-profiler`, `json-tree-explorer`, `sql-query-workbench`, `env-secrets-vault`, `webhook-payload-diff`, `cron-schedule-visualizer`, `memory-heap-map`, `regex-ast-tester`.
     - **`Command & Menus` (9 archivos):** `radial-pie-menu`, `raycast-action-bar`, `breadcrumb-dropdown-tree`, `context-menu-nested`, `floating-slash-menu`, `multi-step-omni-search`, `keyboard-chord-hud`, `dock-magnifier-bar`, `tab-switcher-expose`.
     - **`Media & Creative Tools` (8 archivos):** `bezier-easing-editor`, `synth-step-sequencer`, `waveform-scrubber`, `color-oklch-picker`, `video-timeline-trimmer`, `spatial-eq-parametric`, `sprite-frame-inspector`, `camera-pip-controller`.
     - **`Fintech & Treasury` (8 archivos):** `orderbook-depth-wall`, `virtual-card-vault`, `fx-currency-swap`, `treasury-runway-burn`, `liquidity-pool-range`, `wire-transfer-stepper`, `tax-lot-harvester`, `multi-sig-quorum`.
2. **Design Tokens Studio en Vivo:**
   - Panel flotante (`Tokens` en el header) para cambiar el color de acento global, el radio de curvatura (`0px Brutal`, `9px Default`, `16px Soft`) y exportar las variables CSS con un clic.
3. **Sandboxes Interactivos de Ingeniería Real:**
   - **Laboratorio de Shaders / Campo Magnético en 60fps** (`Magnetic Grid`, `ASCII Matrix`, `Harmonic Waves`) con control de radio de fuerza.
   - **Consola de Agentes IA con Streaming Token-a-Token** y presupuesto de ventana de contexto (`128k tokens`).
   - **Secuenciador Polifónico de 8 Pasos en Web Audio API** (`120 BPM` sintetizado en tiempo real).
   - **Inspector de Cascada de Red (HAR Waterfall)**, calculadora de liquidez FX, paneles redimensionables y gráficas SVG reactivas.
   - **Botón `</> Code` directo en cada tarjeta** para abrir instantáneamente el código en **React / TSX** o **Vanilla HTML/CSS** con nuestro *syntax highlighter* propio.
