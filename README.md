# devl.dev — Zero-Dependency Interactive UI Scratch Pad

Recreación completa y mejorada de **devl.dev** construida **100% desde cero sin librerías externas** (Cero Tailwind, Cero React, Cero Lucide, Cero dependencias NPM).

## Características Principales

- **18 Carpetas · 158 Experimentos de Diseño:** Catálogo completo (`Layouts`, `Forms`, `Auth & Onboarding`, `Dashboards`, `Tables`, `Filters`, `Empty states`, `Settings`, `Cards`, `Modals`, `Charts`, `Timelines`, `Calendars`, `Profile`, `Toasts & banners`, `Pricing`, `Tours & coachmarks`, `Threads & comments`).
- **Motor Generativo de Miniaturas SVG (`js/previews.js`):** 158 micro-interfaces vectoriales específicas por `slug` que se adaptan en tiempo real al tema (`Dark` / `Light`) y cobran vida al pasar el cursor (sin imágenes `.png` estáticas).
- **Shaders WebGL + Sintetizador Web Audio (`js/shaders.js`):** Campo de ruido procedural en WebGL reactivo al puntero y scroll, más micro-sonidos táctiles generados mediante osciladores nativos de Web Audio API.
- **Sandbox Interactivo a Pantalla Completa (`js/sandbox.js`):**
  - Layouts con paneles redimensionables mediante arrastre.
  - Gráficas SVG interactivas con crosshair y cálculo dinámico de métricas.
  - Tablas filtrables por búsqueda y estado en vivo.
  - Calculadora de precios con slider de asientos y descuento anual/mensual.
  - Generador de API Keys, verificación OTP de 6 dígitos, calendario interactivo, línea de tiempo en vivo y confirmación destructiva.
  - **Syntax Highlighter propio** libre de dependencias para inspeccionar y copiar el código en **React / TSX** o **Vanilla HTML/CSS**.
- **Command Palette (`⌘K`) con Vista Previa en Vivo:** Búsqueda difusa (*fuzzy search*) propia con navegación por teclado (`↑`, `↓`, `Enter`, `Esc`) y panel de previsualización instantánea.
- **Modo Blueprint X-Ray (`B`) y Folder Minimap Rail:** Superposición técnica de cotas y malla CAD más riel lateral con *scroll-spy* para saltar entre las 18 carpetas.

## Uso Local

Abre `index.html` directamente en cualquier navegador moderno o sírvelo con cualquier servidor estático:

```bash
npx serve .
```
