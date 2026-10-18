---
name: Tesela
description: Galería de 212 experimentos como una pared de mosaico sobre negro lacado, con dorado mate reservado a favoritos y filetes.
colors:
  lacquer-black: "#141415"
  lacquer-raised: "#1b1b1d"
  ink: "#f5f5f7"
  ink-muted: "#8e8e96"
  ink-subtle: "#6a6a74"
  rule: "rgba(255, 255, 255, 0.095)"
  rule-strong: "rgba(255, 255, 255, 0.22)"
  gilt: "#c3a569"
  gilt-ink: "#17130a"
  paper-light: "#f8f8f7"
  paper-raised-light: "#ffffff"
  ink-light: "#141416"
  ink-muted-light: "#63636b"
  gilt-light-text: "#7b5e21"
  gilt-light-fill: "#b99347"
  stone-light: "#a9a396"
typography:
  display:
    fontFamily: "Marcellus, 'Trajan Pro', 'Times New Roman', serif"
    fontSize: "clamp(38px, 5.6vw, 76px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Marcellus, 'Trajan Pro', 'Times New Roman', serif"
    fontSize: "clamp(26px, 3vw, 36px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  address:
    fontFamily: "Marcellus, 'Trajan Pro', 'Times New Roman', serif"
    fontSize: "30px"
    fontWeight: 400
    letterSpacing: "0.06em"
  brand:
    fontFamily: "Marcellus, 'Trajan Pro', 'Times New Roman', serif"
    fontSize: "16px"
    fontWeight: 400
    letterSpacing: "0.26em"
  body:
    fontFamily: "'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
  label:
    fontFamily: "'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  mono:
    fontFamily: "'Spline Sans Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  tile: "1px"
  tag: "3px"
  panel: "4px"
  control: "6px"
spacing:
  tile-gap: "3px"
  xs: "8px"
  sm: "16px"
  md: "32px"
  gutter: "clamp(20px, 4vw, 56px)"
  page: "1360px"
components:
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lacquer-black}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "40px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "40px"
  button-quiet:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "40px"
  header:
    backgroundColor: "{colors.lacquer-black}"
    height: "56px"
  wall-frame:
    backgroundColor: "{colors.lacquer-raised}"
    rounded: "{rounded.panel}"
    padding: "clamp(10px, 1.5vw, 20px)"
  tile-favourite:
    backgroundColor: "{colors.gilt}"
    rounded: "{rounded.tile}"
  address-card:
    backgroundColor: "{colors.lacquer-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.address}"
    rounded: "{rounded.panel}"
    padding: "14px 20px"
  wall-tip:
    backgroundColor: "{colors.lacquer-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "8px 10px"
  card-frame:
    rounded: "6px"
  token-popover:
    backgroundColor: "{colors.lacquer-raised}"
    rounded: "{rounded.control}"
    padding: "16px"
    width: "280px"
---

# Design System: Tesela

## Overview

**Creative North Star: "La pared de teselas"**

La portada es un mosaico de smalti sobre negro lacado: 212 piezas, una por experimento, en módulo cuadrado estricto. Cada carpeta aporta su color a sus piezas, pero mate y desaturado: el color de la carpeta se mezcla con el fondo elevado del tema (`--tile-mix` 42 % en oscuro, 28 % en claro, sobre `--tile-ground`), de modo que la pared se lee como piedra y no como paleta de interfaz. Todo lo demás (marco, texto, controles) es neutro y sale de los tokens `--tsl-*` de la biblioteca, por lo que tema, preset y acento se respetan.

El tono es serio y premium por sobriedad: filetes de 1 px, sin degradados ni brillos, sombras pequeñas con desplazamiento, un solo tono dorado. La estructura es una cabecera de 56 px, un frontispicio con titular a la izquierda y texto con acciones a la derecha, y la pared completa a continuación; después, las 24 carpetas con tarjetas. El único momento de movimiento es la colocación de la pared al cargar.

**Key Characteristics:**
- Pared de módulo cuadrado exacto (`aspect-ratio: 1`, hueco de 3 px), ordenada carpeta a carpeta en flujo por columnas.
- Color de carpeta mate; dorado mate para favoritos y filetes finos, nunca como relleno decorativo.
- Bisel de 1 px en cada tesela y variación de luminosidad fija por pieza (0 a 8 %).
- Marcellus en capitales para titulares y números; Libre Franklin para texto; Spline Sans Mono solo para direcciones, archivos y atajos.
- Tema oscuro por defecto; claro y sistema reasignan solo el dorado y la piedra.

## Colors

Negro lacado y neutros fríos del tema, con un único dorado mate y el color de cada carpeta apagado en la pared.

### Primary
- **Dorado mate** (`gilt`, #c3a569): favoritos (relleno de la tesela y estrella), filete corto de 48 × 3 px sobre cada carpeta, subrayado inferior de 2 px del filtro o conmutador activo, marca de la cabecera, direcciones en el tooltip, borde de la tarjeta de dirección (al 42 %, `--gilt-soft`). En claro se parte en dos: texto y filetes #7b5e21, relleno #b99347, tinta #ffffff.

### Neutral
- **Negro lacado** (#141415): fondo de página; **Lacado elevado** (#1b1b1d): marco de la pared, tooltip, tarjeta de dirección, popover, miniaturas.
- **Tinta** (#f5f5f7), **tinta atenuada** (#8e8e96) y **tinta tenue** (#6a6a74): texto principal, secundario y rótulos del carril.
- **Filete** (blanco al 9,5 %) y **filete fuerte** (blanco al 22 %): separadores y bordes de controles y marco.
- **Claro:** papel #f8f8f7, elevado #ffffff, tinta #141416, atenuada #63636b; la **piedra clara** (#a9a396) sustituye al fondo elevado como base de mezcla de las teselas.

### Colores de carpeta
Cada carpeta trae un acento propio (de #06b6d4 a #fb7185, definido en `js/data.js`); nunca se usa a plena saturación en la portada, solo a través de la mezcla `--tile-mix`. Las 24 carpetas se distinguen por tono, no por intensidad.

### Named Rules
**The Gilt Reserve Rule.** El dorado solo marca favoritos y filetes finos. Si algo no es un favorito, un filete o el estado activo de un control, no lleva dorado.

**The Muted Stone Rule.** El color de una carpeta se mezcla siempre con `--tile-ground`; en claro la piedra se apaga (28 % sobre #a9a396), no se vuelve pastel.

**The Token Alias Rule.** Los neutros de la portada son alias de `--tsl-*`; no se escriben hex de tema en `galeria.css`.

## Typography

**Display Font:** Marcellus (con Trajan Pro, Times New Roman, serif)
**Body Font:** Libre Franklin (con la pila del sistema sans)
**Label/Mono Font:** Spline Sans Mono (con ui-monospace)

**Character:** capitales de inscripción para lo que se graba (titular, carpetas, números), grotesca humanista neutra para leer, mono solo donde hay una dirección o un archivo. Las fuentes están alojadas en `fonts/` (latin y latin-ext, `font-display: swap`).

### Hierarchy
- **Display** (400, clamp(38px, 5.6vw, 76px), 1.04, -0.01em): titular del frontispicio, equilibrado con `text-wrap: balance`.
- **Headline** (400, clamp(26px, 3vw, 36px), 1.1): título de carpeta.
- **Número de dirección** (Marcellus 400, 30px, +0.06em, cifras tabulares): tarjeta de dirección.
- **Marca** (Marcellus 400, 16px, +0.26em) y pie (14px, +0.2em, mayúsculas).
- **Body** (Libre Franklin 400, 16.5px, 1.6, máx. 52ch): texto de apoyo; subtítulo de carpeta a 14px / 1.55 y 62ch.
- **Title** (600, 14px, 1.35): título de tarjeta.
- **Label** (500, 13 a 13.5px): botones, enlaces de cabecera, filtros.
- **Mono** (Spline Sans Mono 400, 12px; 10 a 12px en carril y atajos): N.º de tarjeta, nombre de archivo, rango de carpeta (+0.04em), etiquetas de pila, `kbd`.

### Named Rules
**The Mono Is An Address Rule.** Spline Sans Mono solo aparece junto a una dirección (N.º 001 a 212), un archivo o un atajo; nunca en prosa ni en títulos.

**The Inscription Rule.** Marcellus va en un solo peso (400); la jerarquía se hace con tamaño y espaciado, no con negrita.

## Layout

Contenedor de 1360 px (`--page`) centrado, con gutter fluido `clamp(20px, 4vw, 56px)` y respeto de `env(safe-area-inset-*)`. Ritmo vertical: frontispicio con relleno superior `clamp(40px, 7vw, 88px)`; pared a `clamp(32px, 5vw, 56px)` del frontispicio; galería con `clamp(56px, 8vw, 104px)` arriba y 120px abajo; entre carpetas `clamp(56px, 7vw, 88px)`; escala interna de 8, 12, 16, 32 px.

**Frontispicio.** Rejilla 1.25fr / 0.75fr alineada al pie: titular a la izquierda, apoyo y acciones a la derecha, para que la pared entre en la primera pantalla. Por debajo de 900 px se apila en una columna.

**Pared.** Rejilla por columnas (`grid-auto-flow: column`, columnas `1fr`, hueco 3 px) con filas según el ancho, de modo que la tesela queda entre 38 y 70 px: 8 filas (27 columnas) desde 1100 px; 12 filas bajo 1100; 15 bajo 900; 18 bajo 760; 24 bajo 600; 27 bajo 480; 31 bajo 360. Las celdas sobrantes quedan vacías.

**Galería.** Tarjetas 16:10 en 1 columna, 2 desde 640 px, 3 desde 1024 y 4 desde 1360; hueco 32 × 20 px. La vista en lista es de una columna con filetes de 1 px y, desde 1024 px, miniatura de 340 px a la izquierda.

**Cabecera.** Barra fija de 56 px; bajo 768 px pasa a dos filas (marca arriba, controles repartidos debajo); bajo 600 px se ocultan documentación, tokens, blueprint, azar y sonido, y el botón ⌘K del frontispicio. Bajo 900 px se oculta el recuento. El carril de carpetas solo existe desde 1440 px. Objetivos táctiles de 40 px con puntero grueso.

## Elevation & Depth

Plano y tonal. La profundidad se da con un escalón de superficie (fondo, fondo elevado), filetes de 1 px y un bisel en cada tesela; las sombras son pocas y con desplazamiento, solo en elementos flotantes.

### Shadow Vocabulary
- **Flotante** (`0 8px 16px -8px rgba(0,0,0,0.55)`, `--shadow-pop`): tooltip, tarjeta de dirección, carril de carpetas al pasar, popover de tokens.
- **Bisel de tesela** (`inset 0 1px 0 #fff al 15 %, inset 0 -1px 0 #000 al 28 %`): cada tesela, la miniatura del carril y la del título de carpeta; en favoritas, 32 % y 24 %.
- **Tesela elevada** (`0 0 0 1px var(--fg), 0 6px 14px -6px rgba(0,0,0,.55)`): hover, foco y vínculo; la actual lleva solo el anillo de 1 px.

### Named Rules
**The No Gloss Rule.** Sin degradados ni brillos; la luz es el bisel de 1 px y nada más.

## Shapes

Aristas casi vivas: teselas y marcas de color 1 px, etiquetas y `kbd` 3 px, marco de la pared, tooltip y tarjeta de dirección 4 px, controles y popover 6 px, tarjetas de experimento 6 px (`--card-radius`). El marco de la pared lleva un filete dorado interior (contorno de 1 px a -7 px) además de su borde. Nada es pastilla ni círculo.

## Components

### Cabecera
Barra fija, fondo del tema al 92 % con desenfoque de 10 px y filete inferior. Marca: cuatro teselas de 7 px (la segunda dorada) y «TESELA» en Marcellus con espaciado 0,26em; recuento separado por filete. Enlaces y botones de 32 px, radio 6 px, atenuados y a tinta en hover; el conmutador activo lleva subrayado dorado de 2 px. Foco: contorno de 2 px en tinta con separación de 2 px.

### Acciones del frontispicio
Tres botones de 40 px, radio 6 px. **Sólido** (fondo tinta, texto fondo): «Explorar la galería». **Línea** (borde fuerte): «Documentación». **Silencioso** (sin borde, atenuado, con atajo): «Buscar ⌘K». Hover: el sólido se aclara al 86 %, el de línea gana fondo de hover y borde atenuado.

### Pared y tesela
Enlace cuadrado de 1:1, radio 1 px, color = mezcla de la carpeta con la piedra y luminosidad desplazada por `--j` (0 a 8 %) hacia la tinta. Favorita: relleno dorado. Filtrada fuera: opacidad 0,14. Hover, foco y vínculo: escala 1,14 con anillo de tinta; foco además con contorno de 2 px. Etiqueta accesible «N.º 001: título, carpeta …».

### Tooltip de la pared
Caja flotante de 4 px, máx. 280 px: dirección en mono dorado, nombre en 600 y carpeta atenuada, 12px. Aparece con 120 ms y 4 px de ascenso.

### Tarjeta de dirección (HUD)
Fija a 28 px del borde inferior, centrada, mín. 420 px; borde dorado al 42 %. Número en Marcellus 30px con los dígitos pendientes atenuados; el nombre se anuncia solo cuando el número ya no puede crecer.

### Leyenda y filtros
Debajo de la pared: píldoras Todos / Nuevos / Favoritos de 32 px con recuento atenuado y subrayado dorado en la activa; pista con `kbd` en mono y una llave dorada de 9 px para «favorito».

### Carril de carpetas
Fijo a la derecha desde 1440 px, centrado en vertical. En reposo muestra solo teselas de 10 px; al pasar o enfocar se despliega con índice, nombre (118px) y recuento en mono, sobre fondo elevado con borde y sombra flotante. La carpeta activa escala 1,35 con anillo de tinta.

### Cabecera de carpeta
Filete de 1 px con un tramo dorado de 48 × 3 px al inicio; título en Marcellus con una tesela de 12 px del color de la carpeta; rango en mono (p. ej. 001–009); subtítulo atenuado; a la derecha, acción silenciosa «abrir el primero». Etiqueta «Nueva» en versalitas de 10,5px con borde dorado al 42 %.

### Tarjeta de experimento
Miniatura SVG 16:10 con borde de 1 px y radio 6 px, saturada al 82 % en reposo y plena en hover/foco (borde pasa a atenuado). Debajo: título en 600 y N.º en mono a la derecha; archivo en mono atenuado con elipsis. Acciones (código, favorito) en una pastilla de 5 px de radio arriba a la derecha, visibles en hover, foco, si hay favorito y siempre con puntero grueso; la estrella favorita se rellena de dorado. Insignia «WIP» en mayúsculas de 10px.

### Vista en lista
Una columna, filas con filetes de 1 px y 24 px de relleno vertical; desde 1024 px miniatura de 340 px y metadatos al lado; etiquetas de pila en mono de 12px con borde de 1 px y radio 3 px.

### Pie
Filete superior, texto de 12.5px atenuado; la marca en Marcellus 14px, mayúsculas, +0,2em.

### Popover de tokens
Panel fijo de 280 px bajo la cabecera, borde fuerte, radio 6 px, sombra flotante, relleno 16 px; muestras de 24 px (radio 2 px) con borde de tinta y escala 1,12 al activarse.

### Estados y movimiento
Foco visible siempre con contorno de 2 px en tinta. Transiciones de 120 a 240 ms con `cubic-bezier(0.22, 1, 0.36, 1)` para movimiento y `ease` para color. **Único momento de movimiento:** `lay-in` de 480 ms (opacidad 0 y escala 0,55 a plena), con retraso de 2,4 ms por pieza (`--i`), solo con `prefers-reduced-motion: no-preference`. Con movimiento reducido se anulan transiciones de teselas, tooltip, HUD y carril, y no hay escalado en hover. Capa Blueprint (tecla B): rejilla de 32 px y contornos discontinuos dorados sobre pared y tarjetas.

### Tema
Oscuro por defecto; `light` y `system` (vía `prefers-color-scheme`) reasignan neutros desde `--tsl-*` y solo en `galeria.css` el dorado, su tinta, `--tile-ground` y `--tile-mix`. Preset y acento de la biblioteca siguen aplicándose.

## Do's and Don'ts

### Do:
- **Do** dar a cada pieza nueva el color de su carpeta mediante `--tile`, mezclado con `--tile-ground` al `--tile-mix` del tema.
- **Do** mantener la tesela cuadrada, con hueco de 3 px y bisel de 1 px.
- **Do** reservar el dorado para favoritos, filetes finos y estados activos.
- **Do** componer las cifras y direcciones (N.º 001 a 212) en Marcellus o mono con cifras tabulares.
- **Do** limitar el movimiento de entrada a la colocación de la pared y respetar `prefers-reduced-motion`.
- **Do** usar alias `--tsl-*` para cualquier neutro nuevo.

### Don't:
- **Don't** usar el acento de carpeta a plena saturación en la portada ni pasteles en claro.
- **Don't** añadir degradados, brillos o sombras de gran difusión; las sombras llevan desplazamiento y radio corto.
- **Don't** usar Spline Sans Mono para prosa ni Marcellus en negrita.
- **Don't** variar el módulo de la tesela por importancia o tamaño: la simetría exacta es el mosaico.
- **Don't** repetir tres tarjetas promocionales iguales como frontispicio.

## Not canonized

Deriva preexistente en `css/styles.css` (el sandbox y la paleta ⌘K conservan Inter y la pila mono antigua; `html` hereda `--font-mono`; acentos `--accent-*` en hex propios; `.sb-eyebrow` en mayúsculas pequeñas en el sandbox). No son reglas de la portada y no deben heredarse en superficies nuevas.
