# devl.dev v2 — Zero-Dependency Interactive UI Scratch Pad (24 Folders · 212 Experiments)

Recreación y evolución completa de **devl.dev** construida **100% desde cero sin librerías externas** (Cero Tailwind, Cero React, Cero Lucide, Cero dependencias NPM), conservando y elevando su línea estética técnica.

- **Live Demo (GitHub Pages):** [https://ludaisca.github.io/devl-scratchpad/](https://ludaisca.github.io/devl-scratchpad/)

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
