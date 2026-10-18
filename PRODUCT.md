# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Desarrolladores y diseñadores externos que llegan a Tesela desde GitHub, buscadores o una recomendación y deciden en pocos minutos si adoptar la biblioteca. Después de decidir, vuelven a la galería a buscar un patrón concreto (un formulario, una tabla, un diálogo) y a copiar su código. Hablan español; la interfaz y todo el contenido van en español.

## Product Purpose
Tesela es una biblioteca de componentes sin dependencias (HTML + CSS + Custom Elements, prefijo `tsl-`, global `TeselaUI`) con tokens exportables, presets de tema, modo claro, oscuro y de sistema, soporte RTL y diseño adaptable. La página principal es la **galería**: 212 experimentos funcionales en 24 carpetas construidos con la propia biblioteca. Su éxito es que una persona nueva entienda en segundos qué es Tesela y la calidad que tiene, y que una persona recurrente encuentre y copie un patrón sin fricción.

## Positioning
Una biblioteca propia y completa (94 secciones de componentes) que se prueba a sí misma: cada experimento es un uso real, con pruebas en navegador (más de 640 comprobaciones), auditorías de contraste WCAG, de desborde y de centrado. No depende de ningún framework.

## Operating Context
Se sirve como sitio estático (`index.html` es la galería, `components.html` es la documentación de la biblioteca). Interacciones existentes que deben seguir funcionando: buscador y paleta ⌘K, filtros Todos / Nuevos / Favoritos, favoritos persistentes, vista de cuadrícula y de lista, minimapa de carpetas, sandbox a pantalla completa por experimento (`#/c/carpeta/slug`) con cajón de código, atajos de teclado, selector de tema, preset y acento de la biblioteca, panel de tokens. Despliegue con nginx en Podman en el puerto 24100.

## Capabilities and Constraints
- Debe respetar el tema, el preset y el acento elegidos por la persona (tema oscuro por defecto); también debe verse bien en claro, en `system` y con los demás presets.
- Funciona de 320 a 2560 px, con táctil y con RTL (hay pruebas que lo verifican: `tests/responsive.test.js`, `tests/rtl.test.js`, `tests/gallery-layout.test.js`).
- Sin dependencias de ejecución; esbuild solo en desarrollo.
- Todo el texto en español.
- Las 212 miniaturas SVG de los experimentos son parte del contenido; se pueden reencuadrar pero no reemplazar por imágenes ajenas.

## Brand Commitments
Nombre **Tesela** (paquete `tesela-ui`, prefijo `tsl-`); devl.dev se menciona solo como inspiración. Tono pedido explícitamente por la persona responsable: **más serio y premium**.

## Evidence on Hand
Números reales y verificables: 212 experimentos, 24 carpetas, 94 secciones de componentes documentadas, 11 presets de tema, 36 tokens, más de 640 comprobaciones automáticas. No hay clientes, testimonios, descargas ni estrellas que citar: no se deben inventar.

## Product Principles
1. Mostrar el producto antes que describirlo: la galería es la prueba.
2. Sobriedad con precisión: el rigor se nota en el detalle, no en el adorno.
3. Los números verificables sustituyen a los adjetivos.
4. Una página que se puede usar a diario, no solo admirar una vez.
5. Todo lo que se promete tiene una prueba automática detrás.

## Accessibility & Inclusion
Contraste WCAG AA como mínimo (los presets ya cumplen AA y `alto-contraste` AAA), navegación completa con teclado, `prefers-reduced-motion` respetado, objetivos táctiles de al menos 24 px (40 px en los controles con puntero táctil; las teselas de la pared de la portada miden unos 34 px en móvil porque son un índice cuyo contenido también está en las tarjetas de debajo) y soporte RTL.
