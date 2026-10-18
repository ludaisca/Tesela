// Descripción de la API pública de cada elemento. De aquí se generan lib/custom-elements.json,
// lib/types/tesela-ui.d.ts, los datos de autocompletado de VS Code y las tablas de «API» de la
// documentación. tests/api.test.js comprueba que coincide con el código (atributos, eventos y métodos).
//
// type: expresión de TypeScript. docs: id(s) de la sección de components.html donde se documenta.

const attr = (name, type, description, def) => ({ name, type, description, ...(def !== undefined ? { default: def } : {}) });
const prop = (name, type, description, readonly = false) => ({ name, type, description, readonly });
const method = (name, params, returns, description) => ({ name, params, returns, description });
const event = (name, detail, description) => ({ name, detail, description });
const param = (name, type, optional = false) => ({ name, type, optional });

// Atributos y miembros de TslFormElement (select, combobox, fecha, hora, slider, rating, color)
const formAttrs = [
  attr("name", "string", "Nombre con el que el valor viaja en el formulario."),
  attr("disabled", "boolean", "Deshabilita el campo (también lo hace un `<fieldset disabled>`)."),
  attr("required", "boolean", "Obliga a tener valor: aplica la validación nativa del formulario."),
  attr("required-message", "string", "Mensaje de validación cuando falta el valor.", "Completa este campo.")
];
const formProps = [
  prop("disabled", "boolean", "Refleja el atributo `disabled`."),
  prop("form", "HTMLFormElement | null", "Formulario al que pertenece.", true),
  prop("validity", "ValidityState", "Estado de validación.", true),
  prop("validationMessage", "string", "Mensaje de validación actual.", true)
];
const formMethods = [
  method("checkValidity", [], "boolean", "Indica si el campo es válido."),
  method("reportValidity", [], "boolean", "Valida y muestra el aviso nativo si no lo es.")
];
const openClose = [
  event("tsl-open", "{}", "El panel se abrió."),
  event("tsl-close", "{}", "El panel se cerró.")
];

export const elements = [
  // ---------------------------------------------------------------- Navegación y menús
  {
    tag: "tsl-tabs", cls: "TslTabs", module: "components/tabs", docs: ["tabs"],
    summary: "Pestañas accesibles con teclado (← → Inicio Fin).",
    attributes: [attr("value", "string", "`data-tab` de la pestaña activa al iniciar (por defecto, la primera).")],
    properties: [prop("value", "string", "Pestaña activa.")],
    methods: [method("select", [param("key", "string"), param("fire", "boolean", true)], "void", "Activa una pestaña; con `fire` emite `tsl-change`.")],
    events: [event("tsl-change", "{ value: string }", "El usuario cambió de pestaña.")]
  },
  {
    tag: "tsl-segmented", cls: "TslSegmented", module: "components/segmented", docs: ["segmented"],
    summary: "Control segmentado (radiogroup) con teclado.",
    attributes: [attr("value", "string", "Valor seleccionado al iniciar.")],
    properties: [prop("value", "string", "Valor seleccionado.")],
    methods: [method("select", [param("value", "string"), param("fire", "boolean", true)], "void", "Selecciona un valor; con `fire` emite `tsl-change`.")],
    events: [event("tsl-change", "{ value: string }", "El usuario eligió otra opción.")]
  },
  {
    tag: "tsl-menu", cls: "TslMenu", module: "components/menu", docs: ["menu"],
    summary: "Menú desplegable con navegación por teclado y cierre al hacer clic fuera.",
    attributes: [],
    itemAttributes: [attr("aria-disabled", "boolean", "Ítem deshabilitado (también vale `disabled`).")],
    properties: [],
    methods: [
      method("open", [param("focus", '"first" | "last"', true)], "void", "Abre el menú y enfoca el primer o el último ítem."),
      method("close", [param("returnFocus", "boolean", true)], "void", "Cierra el menú.")
    ],
    events: [event("tsl-select", "{ value: string; item: HTMLElement }", "Se eligió un ítem (`data-value` o su texto).")]
  },
  {
    tag: "tsl-command", cls: "TslCommand", module: "components/command", docs: ["command"],
    summary: "Paleta de comandos en un `<dialog>` modal, con búsqueda difusa y grupos.",
    attributes: [
      attr("hotkey", "string", "Letra que, con Ctrl/⌘, abre la paleta."),
      attr("placeholder", "string", "Texto del campo de búsqueda."),
      attr("empty", "string", "Texto cuando no hay resultados.", "Sin resultados."),
      attr("label", "string", "Nombre accesible del diálogo.")
    ],
    properties: [],
    methods: [method("open", [], "void", "Abre la paleta."), method("close", [], "void", "La cierra.")],
    events: [event("tsl-select", "{ value: string; item: HTMLElement }", "Se eligió un comando.")]
  },
  {
    tag: "tsl-popover", cls: "TslPopover", module: "components/popover", docs: ["popover"],
    summary: "Panel flotante anclado a un disparador, con la API nativa `popover`.",
    attributes: [
      attr("placement", '"top" | "bottom" | "left" | "right" | `${"top" | "bottom" | "left" | "right"}-${"start" | "end"}`', "Lado preferido; se voltea si no cabe.", "bottom-start"),
      attr("offset", "number", "Separación en píxeles respecto al disparador.", "6"),
      attr("manual", "boolean", "Solo se cierra con código o con Esc (no al hacer clic fuera)."),
      attr("label", "string", "Nombre accesible del panel.")
    ],
    properties: [prop("isOpen", "boolean", "Indica si está abierto.", true)],
    methods: [
      method("open", [], "void", "Abre el panel."), method("close", [], "void", "Lo cierra."),
      method("toggle", [], "void", "Alterna."), method("reposition", [], "void", "Recalcula la posición.")
    ],
    events: openClose
  },
  {
    tag: "tsl-hovercard", cls: "TslHoverCard", module: "components/hovercard", docs: ["hovercard"],
    summary: "Vista previa que aparece al pasar el cursor o enfocar con teclado.",
    attributes: [
      attr("placement", "string", "Lado preferido (igual que `tsl-popover`).", "bottom-start"),
      attr("offset", "number", "Separación en píxeles.", "8"),
      attr("open-delay", "number", "Milisegundos antes de abrir.", "300"),
      attr("close-delay", "number", "Milisegundos antes de cerrar.", "150")
    ],
    properties: [prop("isOpen", "boolean", "Indica si está abierta.", true)],
    methods: [method("open", [], "void", "Abre la tarjeta."), method("close", [], "void", "La cierra.")],
    events: openClose
  },
  {
    tag: "tsl-context-menu", cls: "TslContextMenu", module: "components/context-menu", docs: ["context-menu"],
    summary: "Menú contextual (clic derecho, tecla de menú, Mayús+F10 y pulsación larga).",
    attributes: [],
    itemAttributes: [attr("aria-disabled", "boolean", "Ítem deshabilitado (también vale `disabled`).")],
    properties: [],
    methods: [
      method("openAt", [param("x", "number"), param("y", "number")], "void", "Abre el menú en unas coordenadas del viewport."),
      method("close", [param("returnFocus", "boolean", true)], "void", "Lo cierra.")
    ],
    events: [event("tsl-select", "{ value: string; item: HTMLElement }", "Se eligió un ítem.")]
  },
  {
    tag: "tsl-menubar", cls: "TslMenubar", module: "components/bar", docs: ["menubar"], extends: "TslBar",
    summary: "Barra de menús estilo aplicación, con submenús, ítems marcables y teclado completo.",
    attributes: [],
    itemAttributes: [
      attr("data-check", "boolean", "Ítem marcable: alterna `aria-checked` al elegirlo."),
      attr("data-submenu", "boolean", "Ítem que abre un submenú (el siguiente `.tsl-menu__list`).")
    ],
    properties: [],
    methods: [method("closeAll", [param("returnFocus", "boolean", true)], "void", "Cierra el menú abierto (y sus submenús).")],
    events: [
      event("tsl-select", "{ value: string; item: HTMLElement; checked?: boolean }", "Se eligió un ítem."),
      event("tsl-open", "{ item: string }", "Se abrió un menú."),
      event("tsl-close", "{}", "Se cerró el menú.")
    ]
  },
  {
    tag: "tsl-nav-menu", cls: "TslNavMenu", module: "components/bar", docs: ["nav-menu"], extends: "TslBar",
    summary: "Menú de navegación de cabecera: los paneles llevan contenido libre y se abren al pasar el cursor.",
    attributes: [attr("hover-delay", "number", "Milisegundos antes de abrir al pasar el cursor.", "120")],
    properties: [],
    methods: [method("closeAll", [param("returnFocus", "boolean", true)], "void", "Cierra el panel abierto.")],
    events: [
      event("tsl-select", "{ value: string }", "Se eligió un enlace del panel."),
      event("tsl-open", "{ item: string }", "Se abrió un panel."),
      event("tsl-close", "{}", "Se cerró el panel.")
    ]
  },

  // ---------------------------------------------------------------- Campos de formulario
  {
    tag: "tsl-otp", cls: "TslOtp", module: "components/otp", docs: ["otp"],
    summary: "Código de un solo uso en celdas separadas, con pegado y autoavance.",
    attributes: [
      attr("length", "number", "Número de celdas.", "6"),
      attr("mode", '"numeric" | "text"', "Tipo de carácter admitido.", "numeric"),
      attr("name", "string", "Nombre del campo oculto que viaja en el formulario."),
      attr("aria-label", "string", "Nombre accesible del grupo.", "Código de verificación")
    ],
    properties: [prop("value", "string", "Código escrito.", true)],
    methods: [method("clear", [], "void", "Vacía todas las celdas.")],
    events: [
      event("tsl-change", "{ value: string }", "Cambió el contenido."),
      event("tsl-complete", "{ value: string }", "Se rellenaron todas las celdas.")
    ]
  },
  {
    tag: "tsl-tags", cls: "TslTags", module: "components/tags", docs: ["tags"],
    summary: "Campo de etiquetas: Enter o coma añaden, Retroceso borra la última.",
    attributes: [
      attr("value", "string", "Etiquetas iniciales separadas por comas."),
      attr("name", "string", "Nombre del campo oculto (valor separado por comas)."),
      attr("placeholder", "string", "Texto del campo.", "Añadir…"),
      attr("label", "string", "Nombre accesible del campo.", "Añadir etiqueta"),
      attr("max", "number", "Máximo de etiquetas (0 = sin límite).", "0")
    ],
    properties: [prop("value", "string[]", "Etiquetas actuales.", true)],
    methods: [
      method("addTag", [param("tag", "string"), param("fire", "boolean", true)], "void", "Añade una etiqueta."),
      method("removeTag", [param("tag", "string"), param("fire", "boolean", true)], "void", "Quita una etiqueta.")
    ],
    events: [event("tsl-change", "{ value: string[] }", "Cambió la lista.")]
  },
  {
    tag: "tsl-dropzone", cls: "TslDropzone", module: "components/dropzone", docs: ["dropzone"],
    summary: "Zona para arrastrar o elegir archivos, con lista de los seleccionados.",
    attributes: [
      attr("accept", "string", "Tipos admitidos (igual que `<input accept>`)."),
      attr("multiple", "boolean", "Permite varios archivos."),
      attr("name", "string", "Nombre del `<input type=file>` interno.")
    ],
    properties: [prop("files", "File[]", "Archivos seleccionados.", true)],
    methods: [],
    events: [event("tsl-change", "{ files: File[] }", "Cambió la selección.")]
  },
  {
    tag: "tsl-calendar", cls: "TslCalendar", module: "components/calendar", docs: ["calendar"],
    summary: "Calendario con teclado (flechas, PgUp/PgDn), rango, varios meses y días deshabilitados.",
    attributes: [
      attr("value", "string", "Fecha ISO (`2026-10-14`) o intervalo `inicio/fin` con `mode=\"range\"`."),
      attr("locale", "string", "Idioma de los nombres (por defecto, el `lang` del documento)."),
      attr("week-start", "number", "Primer día de la semana (0 = domingo).", "1"),
      attr("min", "string", "Fecha ISO mínima seleccionable."),
      attr("max", "string", "Fecha ISO máxima seleccionable."),
      attr("mode", '"single" | "range"', "Selección de un día o de un intervalo.", "single"),
      attr("months", "number", "Meses visibles a la vez.", "1")
    ],
    properties: [prop("value", "string", "Fecha o intervalo ISO seleccionado.")],
    methods: [
      method("pick", [param("date", "Date")], "void", "Selecciona un día como si se hiciera clic."),
      method("shift", [param("months", "number")], "void", "Avanza o retrocede meses.")
    ],
    events: [event("tsl-change", "{ value: string; date?: Date; start?: string; end?: string | null; complete?: boolean }", "Cambió la selección (en rango, `complete` indica que ya hay inicio y fin).")]
  },
  {
    tag: "tsl-sparkline", cls: "TslSparkline", module: "components/sparkline", docs: ["stat"],
    summary: "Minigráfica de línea SVG que se adapta al tamaño del elemento.",
    attributes: [
      attr("values", "string", "Números separados por comas o espacios."),
      attr("fill", "boolean", "Rellena el área bajo la línea."),
      attr("aria-label", "string", "Descripción accesible (por defecto, la serie de valores).")
    ],
    cssProperties: [
      { name: "--w", description: "Ancho del elemento.", default: "120px" },
      { name: "--h", description: "Alto del elemento.", default: "32px" }
    ],
    properties: [], methods: [], events: []
  },
  {
    tag: "tsl-select", cls: "TslSelect", module: "components/select", docs: ["select-custom"], formAssociated: true,
    summary: "Select personalizado con listbox accesible, buscador, selección múltiple y creación de opciones.",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Valor inicial (con `multiple`, valores separados por comas)."),
      attr("placeholder", "string", "Texto cuando no hay selección.", "Selecciona…"),
      attr("searchable", "boolean", "Añade un buscador dentro del panel."),
      attr("multiple", "boolean", "Permite elegir varias opciones."),
      attr("creatable", "boolean", "Ofrece crear una opción nueva con el texto buscado."),
      attr("clearable", "boolean", "Muestra un botón para limpiar la selección."),
      attr("autocomplete", "boolean", "Convierte el disparador en un campo de texto (combobox)."),
      attr("label", "string", "Nombre accesible del campo."),
      attr("search-placeholder", "string", "Texto del buscador.", "Buscar…"),
      attr("empty", "string", "Texto cuando no hay coincidencias.", "Sin resultados"),
      attr("create-label", "string", "Prefijo de la opción de crear.", "Crear"),
      attr("clear-label", "string", "Nombre accesible del botón de limpiar.", "Limpiar selección"),
      attr("max-chips", "number", "Chips visibles con `multiple` antes del «+N».", "3")
    ],
    itemAttributes: [
      attr("value", "string", "Valor de la `<option>`."),
      attr("disabled", "boolean", "Opción deshabilitada."),
      attr("selected", "boolean", "Opción seleccionada al iniciar."),
      attr("data-hint", "string", "Texto secundario a la derecha de la opción.")
    ],
    properties: [
      prop("value", "string | string[]", "Valor seleccionado (arreglo con `multiple`)."),
      prop("isOpen", "boolean", "Indica si el panel está abierto.", true),
      ...formProps
    ],
    methods: [
      method("setOptions", [param("options", "Array<{ value: string; label?: string; disabled?: boolean; hint?: string; group?: string }>")], "void", "Reemplaza las opciones (útil con datos asíncronos)."),
      method("open", [], "void", "Abre el panel."),
      method("close", [param("returnFocus", "boolean", true)], "void", "Cierra el panel."),
      method("reset", [], "void", "Restablece el valor inicial."),
      ...formMethods
    ],
    events: [event("tsl-change", "{ value: string | string[]; values: string[] }", "Cambió la selección."), ...openClose]
  },
  {
    tag: "tsl-combobox", cls: "TslCombobox", module: "components/select", docs: ["combobox"], formAssociated: true, extends: "tsl-select",
    summary: "Campo de texto que filtra opciones mientras se escribe (`<tsl-select autocomplete>`).",
    attributes: [], properties: [], methods: [], events: []
  },
  {
    tag: "tsl-date-picker", cls: "TslDatePicker", module: "components/date-picker", docs: ["date-picker", "date-range"], formAssociated: true,
    summary: "Selector de fecha o de intervalo de fechas en un popover con calendario.",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Fecha ISO o intervalo `inicio/fin` con `range`."),
      attr("min", "string", "Fecha ISO mínima."),
      attr("max", "string", "Fecha ISO máxima."),
      attr("locale", "string", "Idioma del formato y del calendario."),
      attr("week-start", "number", "Primer día de la semana.", "1"),
      attr("range", "boolean", "Selecciona un intervalo (dos meses visibles por defecto)."),
      attr("months", "number", "Meses visibles.", "1 (2 con `range`)"),
      attr("date-style", '"short" | "medium" | "long" | "full"', "Formato de la fecha mostrada.", "medium"),
      attr("placeholder", "string", "Texto cuando no hay fecha."),
      attr("clearable", "boolean", "Muestra un botón para limpiar."),
      attr("label", "string", "Nombre accesible del panel."),
      attr("clear-label", "string", "Nombre accesible del botón de limpiar.", "Limpiar fecha")
    ],
    properties: [
      prop("value", "string", "Fecha o intervalo ISO."),
      prop("start", "string", "Inicio del intervalo (o la fecha).", true),
      prop("end", "string", "Fin del intervalo (vacío sin `range`).", true),
      prop("isOpen", "boolean", "Indica si el calendario está abierto.", true),
      ...formProps
    ],
    methods: [
      method("open", [], "void", "Abre el calendario."), method("close", [param("returnFocus", "boolean", true)], "void", "Lo cierra."),
      method("reset", [], "void", "Restablece el valor inicial."), ...formMethods
    ],
    events: [event("tsl-change", "{ value: string; start: string; end: string }", "Cambió la fecha o el intervalo."), ...openClose]
  },
  {
    tag: "tsl-time-picker", cls: "TslTimePicker", module: "components/time-picker", docs: ["time-picker"], formAssociated: true,
    summary: "Selector de hora con columnas de hora y minutos (y AM/PM con `hour12`).",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Hora inicial en formato `HH:MM` (24 h)."),
      attr("step", "number", "Minutos entre opciones.", "5"),
      attr("hour12", "boolean", "Muestra la hora en formato de 12 horas con AM/PM."),
      attr("min", "string", "Hora mínima (`HH:MM`)."),
      attr("max", "string", "Hora máxima (`HH:MM`)."),
      attr("locale", "string", "Idioma del formato mostrado."),
      attr("placeholder", "string", "Texto cuando no hay hora."),
      attr("clearable", "boolean", "Muestra un botón para limpiar."),
      attr("label", "string", "Nombre accesible del panel."),
      attr("clear-label", "string", "Nombre accesible del botón de limpiar.", "Limpiar hora"),
      attr("hour-label", "string", "Nombre accesible de la columna de horas.", "Hora"),
      attr("minute-label", "string", "Nombre accesible de la columna de minutos.", "Minutos")
    ],
    properties: [prop("value", "string", "Hora `HH:MM` (24 h) o cadena vacía."), prop("isOpen", "boolean", "Indica si el panel está abierto.", true), ...formProps],
    methods: [
      method("open", [], "void", "Abre el panel."), method("close", [param("returnFocus", "boolean", true)], "void", "Lo cierra."),
      method("reset", [], "void", "Restablece el valor inicial."), ...formMethods
    ],
    events: [event("tsl-change", "{ value: string }", "Cambió la hora."), ...openClose]
  },
  {
    tag: "tsl-slider", cls: "TslSlider", module: "components/slider", docs: ["slider"], formAssociated: true,
    summary: "Slider de uno o dos pulgares (rango) con tooltip y teclado.",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Valor inicial; con dos valores (`20,80`) es un rango."),
      attr("min", "number", "Valor mínimo.", "0"),
      attr("max", "number", "Valor máximo.", "100"),
      attr("step", "number", "Incremento.", "1"),
      attr("range", "boolean", "Dos pulgares que no se cruzan."),
      attr("prefix", "string", "Texto antes del valor mostrado."),
      attr("suffix", "string", "Texto después del valor mostrado."),
      attr("label", "string", "Nombre accesible.", "Valor")
    ],
    properties: [
      prop("value", "string", "Valor (o `min,max` en un rango)."),
      prop("values", "number[]", "Valores numéricos.", true),
      ...formProps
    ],
    methods: [method("reset", [], "void", "Restablece el valor inicial."), ...formMethods],
    events: [
      event("tsl-input", "{ value: string; values: number[] }", "Cambia mientras se arrastra."),
      event("tsl-change", "{ value: string; values: number[] }", "Se soltó el pulgar o cambió con el teclado.")
    ]
  },
  {
    tag: "tsl-rating", cls: "TslRating", module: "components/rating", docs: ["rating"], formAssociated: true,
    summary: "Valoración con estrellas (también medias estrellas) como único control `slider`.",
    attributes: [
      ...formAttrs,
      attr("value", "number", "Valoración inicial.", "0"),
      attr("max", "number", "Número de estrellas.", "5"),
      attr("half", "boolean", "Admite medias estrellas."),
      attr("clearable", "boolean", "Volver a elegir el mismo valor (o pulsar Supr) lo borra."),
      attr("readonly", "boolean", "Solo lectura."),
      attr("label", "string", "Nombre accesible.", "Valoración")
    ],
    properties: [prop("value", "number", "Valoración actual."), ...formProps],
    methods: [method("reset", [], "void", "Restablece el valor inicial."), ...formMethods],
    events: [event("tsl-change", "{ value: number }", "Cambió la valoración.")]
  },
  {
    tag: "tsl-radio-group", cls: "TslRadioGroup", module: "components/radio-group", docs: ["radio-group"], formAssociated: true,
    summary: "Grupo de radios con un solo punto de tabulación: las flechas mueven y seleccionan. Opciones `button.tsl-radio` con etiqueta y descripción; participa en formularios.",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Valor seleccionado al iniciar."),
      attr("orientation", '"vertical" | "horizontal"', "Disposición de las opciones.", "vertical"),
      attr("label", "string", "Nombre accesible del grupo.", "Opciones")
    ],
    itemAttributes: [
      attr("value", "string", "Valor de la opción."),
      attr("disabled", "boolean", "Opción deshabilitada.")
    ],
    properties: [prop("value", "string", "Valor seleccionado (cadena vacía si no hay)."), prop("orientation", '"vertical" | "horizontal"', "Disposición.", true), ...formProps],
    methods: [method("reset", [], "void", "Restablece la selección inicial."), ...formMethods],
    events: [event("tsl-change", "{ value: string }", "El usuario eligió otra opción.")]
  },
  {
    tag: "tsl-color-picker", cls: "TslColorPicker", module: "components/color-picker", docs: ["color-picker"], formAssociated: true,
    summary: "Selector de color con área de saturación/brillo, tono, opacidad, hexadecimal y cuentagotas.",
    attributes: [
      ...formAttrs,
      attr("value", "string", "Color inicial (`#rrggbb` o `#rrggbbaa`).", "#6366f1"),
      attr("alpha", "boolean", "Añade el control de opacidad."),
      attr("swatches", "string", "Colores de muestra separados por comas (vacío = sin muestras)."),
      attr("label", "string", "Nombre accesible."),
      attr("area-label", "string", "Nombre accesible del área.", "Saturación y brillo"),
      attr("hue-label", "string", "Nombre accesible del tono.", "Tono"),
      attr("alpha-label", "string", "Nombre accesible de la opacidad.", "Opacidad")
    ],
    properties: [prop("value", "string", "Color `#rrggbb` o `#rrggbbaa`."), prop("isOpen", "boolean", "Indica si el panel está abierto.", true), ...formProps],
    methods: [
      method("open", [], "void", "Abre el panel."), method("close", [param("returnFocus", "boolean", true)], "void", "Lo cierra."),
      method("reset", [], "void", "Restablece el valor inicial."), ...formMethods
    ],
    events: [
      event("tsl-input", "{ value: string }", "Cambia mientras se arrastra."),
      event("tsl-change", "{ value: string }", "Se confirmó el color."),
      ...openClose
    ]
  },
  {
    tag: "tsl-password", cls: "TslPassword", module: "components/password", docs: ["password"],
    summary: "Envuelve un `<input>` con botón mostrar/ocultar y medidor de seguridad opcional.",
    attributes: [
      attr("meter", "boolean", "Muestra el medidor de seguridad."),
      attr("min-length", "number", "Longitud mínima que cuenta para el medidor.", "8"),
      attr("name", "string", "Nombre del `<input>` si el elemento lo crea."),
      attr("placeholder", "string", "Texto del `<input>` si el elemento lo crea."),
      attr("required", "boolean", "Campo obligatorio (si el elemento crea el `<input>`)."),
      attr("autocomplete", "string", "Valor de `autocomplete` del `<input>`.", "new-password"),
      attr("id", "string", "Identificador que se traslada al `<input>` creado."),
      attr("label", "string", "Nombre accesible del `<input>` creado."),
      attr("show-label", "string", "Texto del botón para mostrar.", "Mostrar"),
      attr("hide-label", "string", "Texto del botón para ocultar.", "Ocultar")
    ],
    properties: [prop("value", "string", "Texto escrito.", true)],
    methods: [],
    events: [event("tsl-change", "{ value: string; score: number }", "Cambió el texto; `score` va de 0 a 4.")]
  },
  {
    tag: "tsl-mention", cls: "TslMention", module: "components/mention", docs: ["mention"],
    summary: "Menciones al escribir `@` (o el carácter elegido) en un textarea o input.",
    attributes: [
      attr("trigger", "string", "Carácter que abre la lista.", "@"),
      attr("max", "number", "Máximo de sugerencias.", "6"),
      attr("label", "string", "Nombre accesible de la lista.", "Menciones")
    ],
    itemAttributes: [attr("value", "string", "Identificador que se inserta tras el carácter."), attr("data-hint", "string", "Texto secundario.")],
    properties: [
      prop("users", "Array<{ value: string; label: string; hint?: string }>", "Usuarios sugeribles (se leen de las `<option>` hijas)."),
      prop("isOpen", "boolean", "Indica si la lista está abierta.", true)
    ],
    methods: [method("close", [], "void", "Cierra la lista.")],
    events: [event("tsl-mention", "{ user: { value: string; label: string; hint?: string }; value: string }", "Se insertó una mención.")]
  },
  {
    tag: "tsl-toggle-group", cls: "TslToggleGroup", module: "components/toggle-group", docs: ["toggle-group"],
    summary: "Grupo de botones con `aria-pressed`, de selección única o múltiple.",
    attributes: [
      attr("type", '"single" | "multiple"', "Un solo botón activo o varios.", "single"),
      attr("value", "string", "Valores activos iniciales separados por comas."),
      attr("required", "boolean", "En `single`, impide deseleccionar.")
    ],
    properties: [prop("value", "string | string[]", "Valor activo (arreglo con `multiple`).")],
    methods: [method("toggle", [param("value", "string")], "void", "Alterna un valor.")],
    events: [event("tsl-change", "{ value: string | string[] }", "Cambió la selección.")]
  },

  // ---------------------------------------------------------------- Estructura
  {
    tag: "tsl-collapsible", cls: "TslCollapsible", module: "components/collapsible", docs: ["collapsible"],
    summary: "Bloque que se muestra u oculta con altura animada (el contenido cerrado queda `inert`).",
    attributes: [attr("open", "boolean", "Abierto.")],
    properties: [prop("isOpen", "boolean", "Estado abierto/cerrado.")],
    methods: [
      method("toggle", [param("force", "boolean", true)], "void", "Alterna o fuerza un estado."),
      method("open", [], "void", "Abre."), method("close", [], "void", "Cierra.")
    ],
    events: [event("tsl-toggle", "{ open: boolean }", "Cambió el estado.")]
  },
  {
    tag: "tsl-sidebar", cls: "TslSidebar", module: "components/sidebar", docs: ["sidebar"],
    summary: "Barra lateral de navegación dentro de `.tsl-sidebar-layout`: completa, solo iconos u oculta; en pantallas estrechas se vuelve un cajón con fondo, Esc y devolución del foco.",
    attributes: [
      attr("collapsible", '"icon" | "offcanvas"', "Cómo se contrae en escritorio: a una columna de iconos o por completo.", "icon"),
      attr("collapsed", "boolean", "Contraída."),
      attr("side", '"start" | "end"', "Lado del diseño en que se coloca.", "start"),
      attr("breakpoint", "number", "Ancho del contenedor (px) por debajo del cual pasa a cajón.", "720"),
      attr("storage-key", "string", "Si se indica, recuerda si está contraída en `localStorage`."),
      attr("shortcut", "string", "Letra que, con Ctrl/⌘, la alterna (p. ej. `b`)."),
      attr("label", "string", "Nombre accesible de la navegación.", "Barra lateral")
    ],
    properties: [
      prop("collapsed", "boolean", "Contraída en escritorio."),
      prop("isMobile", "boolean", "Está en modo cajón.", true),
      prop("mobileOpen", "boolean", "El cajón está abierto.", true)
    ],
    methods: [
      method("toggle", [param("show", "boolean", true)], "void", "Contrae/expande (o abre/cierra el cajón en móvil); con `true` la muestra y con `false` la oculta."),
      method("collapse", [], "void", "Contrae."), method("expand", [], "void", "Expande."),
      method("openMobile", [], "void", "Abre el cajón (solo en modo estrecho)."), method("closeMobile", [], "void", "Cierra el cajón.")
    ],
    events: [event("tsl-toggle", "{ collapsed: boolean; open: boolean; mobile: boolean }", "Cambió el estado de la barra.")]
  },
  {
    tag: "tsl-carousel", cls: "TslCarousel", module: "components/carousel", docs: ["carousel"],
    summary: "Carrusel con scroll-snap nativo: botones, puntos, teclado, bucle y avance automático con pausa. Las diapositivas fuera de vista quedan `inert`.",
    attributes: [
      attr("label", "string", "Nombre accesible del carrusel.", "Carrusel"),
      attr("per-view", "number", "Diapositivas visibles a la vez.", "1"),
      attr("orientation", '"horizontal" | "vertical"', "Eje de desplazamiento (el vertical necesita una altura).", "horizontal"),
      attr("dots", "boolean", "Muestra los puntos de navegación."),
      attr("loop", "boolean", "Da la vuelta al llegar al final."),
      attr("autoplay", "number", "Milisegundos entre avances (mínimo 1500). Se pausa con el cursor, el foco, el botón y `prefers-reduced-motion`.")
    ],
    properties: [
      prop("index", "number", "Posición actual."),
      prop("perView", "number", "Diapositivas visibles.", true),
      prop("pageCount", "number", "Número de posiciones posibles.", true)
    ],
    methods: [
      method("goTo", [param("index", "number"), param("smooth", "boolean", true)], "void", "Va a una posición."),
      method("next", [], "void", "Avanza."), method("prev", [], "void", "Retrocede.")
    ],
    events: [event("tsl-change", "{ index: number; count: number }", "Cambió la diapositiva visible.")]
  },
  {
    tag: "tsl-scroll-area", cls: "TslScrollArea", module: "components/scroll-area", docs: ["scroll-area"],
    summary: "Zona desplazable con degradado en los bordes que aún tienen contenido (`data-top|bottom|left|right`). `scrollTo()` se aplica al área desplazable.",
    attributes: [
      attr("orientation", '"vertical" | "horizontal" | "both"', "Ejes con scroll.", "vertical"),
      attr("label", "string", "Nombre accesible de la región.", "Contenido desplazable")
    ],
    properties: [],
    methods: [],
    events: []
  },
  {
    tag: "tsl-resizable", cls: "TslResizable", module: "components/resizable", docs: ["resizable"],
    summary: "Paneles con separadores arrastrables (puntero y teclado), anidables y con tamaños persistentes.",
    attributes: [
      attr("direction", '"horizontal" | "vertical"', "Disposición de los paneles.", "horizontal"),
      attr("storage-key", "string", "Si se indica, recuerda los tamaños en `localStorage`."),
      attr("handle-label", "string", "Nombre accesible de los separadores.", "Cambiar tamaño")
    ],
    itemAttributes: [
      attr("data-size", "number", "Tamaño inicial del panel en %."),
      attr("data-min", "number", "Tamaño mínimo en %.", "10"),
      attr("data-max", "number", "Tamaño máximo en %.", "90")
    ],
    properties: [],
    methods: [],
    events: [event("tsl-resize", "{ sizes: number[] }", "Cambiaron los tamaños (porcentajes).")]
  },

  // ---------------------------------------------------------------- Datos
  {
    tag: "tsl-tree", cls: "TslTree", module: "components/tree", docs: ["tree"],
    summary: "Árbol accesible a partir de una lista anidada, con selección y casillas de estado mixto.",
    attributes: [
      attr("selection", '"single" | "multiple" | "none"', "Modo de selección.", "single"),
      attr("checkable", "boolean", "Añade casillas con estado mixto en los padres."),
      attr("label", "string", "Nombre accesible del árbol.")
    ],
    itemAttributes: [
      attr("data-value", "string", "Valor del nodo (por defecto, su texto)."),
      attr("data-expanded", "boolean", "Nodo expandido al iniciar."),
      attr("data-selected", "boolean", "Nodo seleccionado al iniciar."),
      attr("data-checked", "boolean", "Casilla marcada al iniciar (con `checkable`).")
    ],
    properties: [
      prop("value", "string | string[]", "Nodo(s) seleccionado(s)."),
      prop("checkedValues", "string[]", "Nodos con la casilla marcada.", true)
    ],
    methods: [
      method("expand", [param("value", "string"), param("on", "boolean", true)], "void", "Expande o colapsa un nodo."),
      method("expandAll", [param("on", "boolean", true)], "void", "Expande (o colapsa) todos."),
      method("collapseAll", [], "void", "Colapsa todos."),
      method("focusItem", [param("item", "HTMLLIElement | null")], "void", "Enfoca un nodo.")
    ],
    events: [
      event("tsl-select", "{ value: string; values: string[] }", "Se seleccionó un nodo."),
      event("tsl-toggle", "{ value: string; expanded: boolean }", "Se expandió o colapsó un nodo."),
      event("tsl-check", "{ values: string[] }", "Cambiaron las casillas marcadas.")
    ]
  },
  {
    tag: "tsl-virtual-list", cls: "TslVirtualList", module: "components/virtual-list", docs: ["virtual-list"],
    summary: "Lista virtualizada de alto de fila fijo: solo dibuja las filas visibles.",
    attributes: [
      attr("item-height", "number", "Alto de cada fila en píxeles.", "36"),
      attr("height", "string", "Alto del contenedor (CSS).", "320px"),
      attr("overscan", "number", "Filas extra que se dibujan fuera de la vista.", "6"),
      attr("selectable", "boolean", "Convierte la lista en un `listbox` navegable con teclado."),
      attr("label", "string", "Nombre accesible.", "Lista")
    ],
    properties: [
      prop("items", "unknown[]", "Elementos de la lista."),
      prop("renderItem", "((item: any, index: number) => Node | string) | undefined", "Cómo dibujar un elemento (un string se muestra como texto)."),
      prop("activeIndex", "number", "Índice activo (−1 si ninguno).", true)
    ],
    methods: [
      method("scrollToIndex", [param("index", "number"), param("align", '"start" | "center" | "end" | "nearest"', true)], "void", "Desplaza hasta un elemento."),
      method("activate", [param("index", "number"), param("fire", "boolean", true)], "void", "Activa un elemento (y lo desplaza a la vista).")
    ],
    events: [event("tsl-select", "{ item: unknown; index: number }", "Se eligió un elemento.")]
  },
  {
    tag: "tsl-sortable", cls: "TslSortable", module: "components/sortable", docs: ["sortable", "kanban"],
    summary: "Lista reordenable con puntero y teclado, también entre listas del mismo grupo (kanban).",
    attributes: [
      attr("group", "string", "Las listas con el mismo grupo intercambian elementos."),
      attr("direction", '"vertical" | "horizontal" | "grid"', "Disposición de los elementos.", "vertical"),
      attr("handle", "string", "Selector CSS del asa; si se indica, solo ella arrastra."),
      attr("label", "string", "Nombre de la lista (se usa en los anuncios).")
    ],
    properties: [prop("itemEls", "HTMLElement[]", "Elementos `.tsl-sortable__item` de la lista.", true)],
    methods: [],
    events: [event("tsl-sort", "{ item: HTMLElement; from: { container: HTMLElement; index: number }; to: { container: HTMLElement; index: number } }", "Un elemento cambió de posición (se emite en la lista de destino).")]
  },
  {
    tag: "tsl-data-table", cls: "TslDataTable", module: "components/data-table", docs: ["data-table"],
    summary: "Tabla con búsqueda, orden, selección, columnas visibles, densidad, paginación y exportación CSV.",
    attributes: [
      attr("page-size", "number", "Filas por página.", "10"),
      attr("page-size-options", "string", "Tamaños de página disponibles, separados por comas.", "5,10,20,50"),
      attr("selectable", "boolean", "Añade casillas de selección."),
      attr("searchable", "boolean", "Añade el campo de búsqueda."),
      attr("exportable", "boolean", "Añade el botón de exportar CSV."),
      attr("height", "string", "Alto máximo de la tabla (cabecera fija)."),
      attr("density", '"compact" | "normal" | "comfortable"', "Densidad de filas.", "normal"),
      attr("loading", "boolean", "Muestra esqueletos en lugar de las filas."),
      attr("caption", "string", "Título accesible de la tabla."),
      attr("empty-text", "string", "Texto sin datos.", "Sin datos"),
      attr("no-match-text", "string", "Texto sin coincidencias de búsqueda.", "Sin resultados para"),
      attr("locale", "string", "Idioma de los números y las fechas."),
      attr("density-label", "string", "Etiqueta del botón de densidad.", "Densidad"),
      attr("select-all-label", "string", "Nombre accesible de la casilla de cabecera.", "Seleccionar la página"),
      attr("select-row-label", "string", "Prefijo del nombre accesible de cada casilla de fila.", "Seleccionar fila"),
      attr("selected-one", "string", "Texto de «1 seleccionada».", "seleccionada"),
      attr("selected-many", "string", "Texto de «N seleccionadas».", "seleccionadas"),
      attr("search-placeholder", "string", "Texto del buscador.", "Buscar…"),
      attr("clear-label", "string", "Texto del botón de limpiar la selección.", "Limpiar"),
      attr("columns-label", "string", "Texto del menú de columnas.", "Columnas"),
      attr("export-label", "string", "Texto del botón de exportar.", "Exportar CSV"),
      attr("rows-label", "string", "Etiqueta del selector de filas por página.", "Filas"),
      attr("pager-label", "string", "Nombre accesible de la paginación.", "Paginación")
    ],
    properties: [
      prop("columns", "Array<{ key: string; label: string; sort?: \"text\" | \"number\" | \"date\"; align?: \"end\"; width?: string; hidden?: boolean; format?: (value: any, row: any) => string; render?: (row: any) => Node | string }>", "Definición de columnas."),
      prop("rows", "Array<{ id: string | number; [key: string]: any }>", "Filas de datos."),
      prop("loading", "boolean", "Refleja el atributo `loading`."),
      prop("selectedIds", "string[]", "Identificadores de las filas seleccionadas.", true),
      prop("selectedRows", "Array<{ id: string | number; [key: string]: any }>", "Filas seleccionadas.", true)
    ],
    methods: [
      method("clearSelection", [], "void", "Deselecciona todo."),
      method("sortBy", [param("key", "string")], "void", "Alterna el orden de una columna (asc → desc → ninguno)."),
      method("toCSV", [], "string", "Devuelve el CSV de las filas filtradas y ordenadas."),
      method("exportCsv", [param("filename", "string", true)], "void", "Descarga el CSV.")
    ],
    events: [
      event("tsl-sort", "{ key: string; dir: \"asc\" | \"desc\" | null }", "Cambió el orden."),
      event("tsl-page", "{ page: number; pageSize: number }", "Cambió la página o su tamaño."),
      event("tsl-selection", "{ ids: string[]; rows: Array<{ id: string | number; [key: string]: any }> }", "Cambió la selección."),
      event("tsl-row-click", "{ row: { id: string | number; [key: string]: any } }", "Se hizo clic en una fila.")
    ]
  },
  {
    tag: "tsl-chart", cls: "TslChart", module: "components/chart", docs: ["chart-line", "chart-bar", "chart-donut", "chart-heatmap"],
    summary: "Gráficas SVG: línea, área, barras, dona, gauge y mapa de calor, con tooltip, leyenda y teclado.",
    attributes: [
      attr("type", '"line" | "area" | "bar" | "donut" | "gauge" | "heatmap"', "Tipo de gráfica.", "line"),
      attr("data", "string", "Datos en JSON (alternativa a la propiedad `data`)."),
      attr("height", "number", "Alto en píxeles.", "240"),
      attr("caption", "string", "Título visible y nombre accesible."),
      attr("legend", "boolean", "Fuerza la leyenda (`legend=\"false\"` la oculta)."),
      attr("locale", "string", "Idioma de los números."),
      attr("prefix", "string", "Texto antes de los valores (`$`)."),
      attr("suffix", "string", "Texto después de los valores (`%`)."),
      attr("stacked", "boolean", "Barras apiladas."),
      attr("horizontal", "boolean", "Barras horizontales."),
      attr("smooth", "boolean", "Curvas suavizadas en línea y área."),
      attr("center-label", "string", "Texto bajo el total en la dona.", "Total"),
      attr("thickness", "number", "Grosor del anillo de la dona (0–1).", "0.3")
    ],
    properties: [
      prop("data", "unknown", "Datos (el formato depende del tipo)."),
      prop("type", "string", "Tipo de gráfica.", true),
      prop("height", "number", "Alto en píxeles.", true)
    ],
    methods: [method("render", [], "void", "Vuelve a dibujar la gráfica.")],
    events: [
      event("tsl-chart-hover", "{ index: number; label: string; values: Array<{ name: string; value: unknown; color: string; percent?: number }> }", "Cambió el punto activo."),
      event("tsl-chart-click", "{ index: number; label: string; values: Array<{ name: string; value: unknown; color: string; percent?: number }> }", "Se pulsó el punto activo.")
    ]
  }
];

export const api = {
  version: "string",
  constants: [
    { name: "presets", type: "ReadonlyArray<{ name: PresetName; label: string; description: string }>", description: "Presets de tema disponibles." }
  ],
  functions: [
    { name: "toast", params: [param("options", "string | ToastOptions")], returns: "() => void", description: "Muestra una notificación efímera y devuelve una función para cerrarla." },
    { name: "copy", params: [param("text", "string")], returns: "Promise<boolean>", description: "Copia al portapapeles (con respaldo para `file://`)." },
    { name: "confirm", params: [param("options", "string | ConfirmOptions")], returns: "Promise<boolean>", description: "Diálogo de confirmación modal; resuelve `true` si se acepta." },
    { name: "position", params: [param("anchor", "Element | null"), param("el", "HTMLElement"), param("options", "PositionOptions", true)], returns: "Side", description: "Posiciona un elemento flotante junto a un ancla o a un punto; devuelve el lado final." },
    { name: "setTheme", params: [param("theme", "Theme")], returns: "Theme", description: "Cambia el ajuste de tema (`dark`, `light` o `system`, que sigue al sistema operativo) y lo guarda en `localStorage`." },
    { name: "getTheme", params: [], returns: "Theme", description: "Ajuste de tema actual." },
    { name: "getResolvedTheme", params: [], returns: "ResolvedTheme", description: "Tema efectivo: resuelve `system` según el sistema operativo." },
    { name: "setPreset", params: [param("name", "PresetName")], returns: "PresetName", description: "Aplica un preset de tema (se ignora un nombre desconocido) y lo guarda. Devuelve el preset activo." },
    { name: "getPreset", params: [], returns: "PresetName", description: "Preset activo." },
    { name: "setAccent", params: [param("color", "string | null")], returns: "string | null", description: "Cambia el acento (`#rgb` o `#rrggbb`) y elige solo el color de texto legible; `null` lo restablece. Devuelve ese color de texto." },
    { name: "init", params: [param("root", "ParentNode", true)], returns: "void", description: "Inicializa los ayudantes estáticos tras insertar HTML dinámico." }
  ]
};
