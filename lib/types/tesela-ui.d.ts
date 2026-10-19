// Tesela UI v1.4.0 — tipos generados desde src/meta/elements.js. No editar a mano.
/** Ajuste de tema: `system` sigue al sistema operativo. */
export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";
export type PresetName = "tesela" | "esmeralda" | "ambar" | "cielo" | "rosa" | "violeta" | "medianoche" | "papel" | "alto-contraste" | "brutalista" | "suave";
export type Side = "top" | "bottom" | "left" | "right";
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "success" | "info" | "warning" | "danger" | "neutral";
  /** Milisegundos; 0 = no se cierra sola. */
  duration?: number;
  action?: { label: string; onClick?: () => void };
}
export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  /** `null` muestra solo el botón de aceptar (alerta). */
  cancelLabel?: string | null;
  variant?: "default" | "danger";
}
export interface PositionOptions {
  placement?: string;
  offset?: number;
  padding?: number;
  point?: { x: number; y: number };
}
export declare const VERSION: string;
/** Presets de tema disponibles. */
export declare const presets: ReadonlyArray<{ name: PresetName; label: string; description: string }>;
/** Muestra una notificación efímera y devuelve una función para cerrarla. */
export declare function toast(options: string | ToastOptions): () => void;
/** Copia al portapapeles (con respaldo para `file://`). */
export declare function copy(text: string): Promise<boolean>;
/** Diálogo de confirmación modal; resuelve `true` si se acepta. */
export declare function confirm(options: string | ConfirmOptions): Promise<boolean>;
/** Posiciona un elemento flotante junto a un ancla o a un punto; devuelve el lado final. */
export declare function position(anchor: Element | null, el: HTMLElement, options?: PositionOptions): Side;
/** Cambia el ajuste de tema (`dark`, `light` o `system`, que sigue al sistema operativo) y lo guarda en `localStorage`. */
export declare function setTheme(theme: Theme): Theme;
/** Ajuste de tema actual. */
export declare function getTheme(): Theme;
/** Tema efectivo: resuelve `system` según el sistema operativo. */
export declare function getResolvedTheme(): ResolvedTheme;
/** Aplica un preset de tema (se ignora un nombre desconocido) y lo guarda. Devuelve el preset activo. */
export declare function setPreset(name: PresetName): PresetName;
/** Preset activo. */
export declare function getPreset(): PresetName;
/** Cambia el acento (`#rgb` o `#rrggbb`) y elige solo el color de texto legible; `null` lo restablece. Devuelve ese color de texto. */
export declare function setAccent(color: string | null): string | null;
/** Cambia la dirección de escritura del documento (atributo `dir` de `<html>`) y la guarda; los componentes se espejan. Devuelve la dirección activa. */
export declare function setDirection(dir: "ltr" | "rtl"): "ltr" | "rtl";
/** Dirección de escritura actual. */
export declare function getDirection(): "ltr" | "rtl";
/** Inicializa los ayudantes estáticos tras insertar HTML dinámico. */
export declare function init(root?: ParentNode): void;
export interface TeselaUIGlobal {
  version: string;
  /** Presets de tema disponibles. */
  presets: typeof presets;
  /** Muestra una notificación efímera y devuelve una función para cerrarla. */
  toast: typeof toast;
  /** Copia al portapapeles (con respaldo para `file://`). */
  copy: typeof copy;
  /** Diálogo de confirmación modal; resuelve `true` si se acepta. */
  confirm: typeof confirm;
  /** Posiciona un elemento flotante junto a un ancla o a un punto; devuelve el lado final. */
  position: typeof position;
  /** Cambia el ajuste de tema (`dark`, `light` o `system`, que sigue al sistema operativo) y lo guarda en `localStorage`. */
  setTheme: typeof setTheme;
  /** Ajuste de tema actual. */
  getTheme: typeof getTheme;
  /** Tema efectivo: resuelve `system` según el sistema operativo. */
  getResolvedTheme: typeof getResolvedTheme;
  /** Aplica un preset de tema (se ignora un nombre desconocido) y lo guarda. Devuelve el preset activo. */
  setPreset: typeof setPreset;
  /** Preset activo. */
  getPreset: typeof getPreset;
  /** Cambia el acento (`#rgb` o `#rrggbb`) y elige solo el color de texto legible; `null` lo restablece. Devuelve ese color de texto. */
  setAccent: typeof setAccent;
  /** Cambia la dirección de escritura del documento (atributo `dir` de `<html>`) y la guarda; los componentes se espejan. Devuelve la dirección activa. */
  setDirection: typeof setDirection;
  /** Dirección de escritura actual. */
  getDirection: typeof getDirection;
  /** Inicializa los ayudantes estáticos tras insertar HTML dinámico. */
  init: typeof init;
}

export interface TslTabsEventMap {
  /** El usuario cambió de pestaña. */
  "tsl-change": CustomEvent<{ value: string }>;
}
/** Pestañas accesibles con teclado (← → Inicio Fin). */
export interface TslTabsElement extends HTMLElement {
  /** Pestaña activa. */
  value: string;
  /** Activa una pestaña; con `fire` emite `tsl-change`. */
  select(key: string, fire?: boolean): void;
  addEventListener<K extends keyof TslTabsEventMap>(type: K, listener: (this: TslTabsElement, ev: TslTabsEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTabsElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslTabsEventMap>(type: K, listener: (this: TslTabsElement, ev: TslTabsEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTabsElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslTabs: { new (): TslTabsElement; prototype: TslTabsElement };

export interface TslSegmentedEventMap {
  /** El usuario eligió otra opción. */
  "tsl-change": CustomEvent<{ value: string }>;
}
/** Control segmentado (radiogroup) con teclado. */
export interface TslSegmentedElement extends HTMLElement {
  /** Valor seleccionado. */
  value: string;
  /** Selecciona un valor; con `fire` emite `tsl-change`. */
  select(value: string, fire?: boolean): void;
  addEventListener<K extends keyof TslSegmentedEventMap>(type: K, listener: (this: TslSegmentedElement, ev: TslSegmentedEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSegmentedElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslSegmentedEventMap>(type: K, listener: (this: TslSegmentedElement, ev: TslSegmentedEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSegmentedElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslSegmented: { new (): TslSegmentedElement; prototype: TslSegmentedElement };

export interface TslMenuEventMap {
  /** Se eligió un ítem (`data-value` o su texto). */
  "tsl-select": CustomEvent<{ value: string; item: HTMLElement }>;
}
/** Menú desplegable con navegación por teclado y cierre al hacer clic fuera. */
export interface TslMenuElement extends HTMLElement {
  /** Abre el menú y enfoca el primer o el último ítem. */
  open(focus?: "first" | "last"): void;
  /** Cierra el menú. */
  close(returnFocus?: boolean): void;
  addEventListener<K extends keyof TslMenuEventMap>(type: K, listener: (this: TslMenuElement, ev: TslMenuEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslMenuEventMap>(type: K, listener: (this: TslMenuElement, ev: TslMenuEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslMenu: { new (): TslMenuElement; prototype: TslMenuElement };

export interface TslCommandEventMap {
  /** Se eligió un comando. */
  "tsl-select": CustomEvent<{ value: string; item: HTMLElement }>;
}
/** Paleta de comandos en un `<dialog>` modal, con búsqueda difusa y grupos. */
export interface TslCommandElement extends HTMLElement {
  /** Abre la paleta. */
  open(): void;
  /** La cierra. */
  close(): void;
  addEventListener<K extends keyof TslCommandEventMap>(type: K, listener: (this: TslCommandElement, ev: TslCommandEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCommandElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslCommandEventMap>(type: K, listener: (this: TslCommandElement, ev: TslCommandEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCommandElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslCommand: { new (): TslCommandElement; prototype: TslCommandElement };

export interface TslPopoverEventMap {
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Panel flotante anclado a un disparador, con la API nativa `popover`. */
export interface TslPopoverElement extends HTMLElement {
  /** Indica si está abierto. */
  readonly isOpen: boolean;
  /** Abre el panel. */
  open(): void;
  /** Lo cierra. */
  close(): void;
  /** Alterna. */
  toggle(): void;
  /** Recalcula la posición. */
  reposition(): void;
  addEventListener<K extends keyof TslPopoverEventMap>(type: K, listener: (this: TslPopoverElement, ev: TslPopoverEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPopoverElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslPopoverEventMap>(type: K, listener: (this: TslPopoverElement, ev: TslPopoverEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPopoverElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslPopover: { new (): TslPopoverElement; prototype: TslPopoverElement };

export interface TslHovercardEventMap {
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Vista previa que aparece al pasar el cursor o enfocar con teclado. */
export interface TslHovercardElement extends HTMLElement {
  /** Indica si está abierta. */
  readonly isOpen: boolean;
  /** Abre la tarjeta. */
  open(): void;
  /** La cierra. */
  close(): void;
  addEventListener<K extends keyof TslHovercardEventMap>(type: K, listener: (this: TslHovercardElement, ev: TslHovercardEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslHovercardElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslHovercardEventMap>(type: K, listener: (this: TslHovercardElement, ev: TslHovercardEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslHovercardElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslHoverCard: { new (): TslHovercardElement; prototype: TslHovercardElement };

export interface TslContextMenuEventMap {
  /** Se eligió un ítem. */
  "tsl-select": CustomEvent<{ value: string; item: HTMLElement }>;
}
/** Menú contextual (clic derecho, tecla de menú, Mayús+F10 y pulsación larga). */
export interface TslContextMenuElement extends HTMLElement {
  /** Abre el menú en unas coordenadas del viewport. */
  openAt(x: number, y: number): void;
  /** Lo cierra. */
  close(returnFocus?: boolean): void;
  addEventListener<K extends keyof TslContextMenuEventMap>(type: K, listener: (this: TslContextMenuElement, ev: TslContextMenuEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslContextMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslContextMenuEventMap>(type: K, listener: (this: TslContextMenuElement, ev: TslContextMenuEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslContextMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslContextMenu: { new (): TslContextMenuElement; prototype: TslContextMenuElement };

export interface TslMenubarEventMap {
  /** Se eligió un ítem. */
  "tsl-select": CustomEvent<{ value: string; item: HTMLElement; checked?: boolean }>;
  /** Se abrió un menú. */
  "tsl-open": CustomEvent<{ item: string }>;
  /** Se cerró el menú. */
  "tsl-close": CustomEvent<{}>;
}
/** Barra de menús estilo aplicación, con submenús, ítems marcables y teclado completo. */
export interface TslMenubarElement extends HTMLElement {
  /** Cierra el menú abierto (y sus submenús). */
  closeAll(returnFocus?: boolean): void;
  addEventListener<K extends keyof TslMenubarEventMap>(type: K, listener: (this: TslMenubarElement, ev: TslMenubarEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMenubarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslMenubarEventMap>(type: K, listener: (this: TslMenubarElement, ev: TslMenubarEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMenubarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslMenubar: { new (): TslMenubarElement; prototype: TslMenubarElement };

export interface TslNavMenuEventMap {
  /** Se eligió un enlace del panel. */
  "tsl-select": CustomEvent<{ value: string }>;
  /** Se abrió un panel. */
  "tsl-open": CustomEvent<{ item: string }>;
  /** Se cerró el panel. */
  "tsl-close": CustomEvent<{}>;
}
/** Menú de navegación de cabecera: los paneles llevan contenido libre y se abren al pasar el cursor. */
export interface TslNavMenuElement extends HTMLElement {
  /** Cierra el panel abierto. */
  closeAll(returnFocus?: boolean): void;
  addEventListener<K extends keyof TslNavMenuEventMap>(type: K, listener: (this: TslNavMenuElement, ev: TslNavMenuEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslNavMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslNavMenuEventMap>(type: K, listener: (this: TslNavMenuElement, ev: TslNavMenuEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslNavMenuElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslNavMenu: { new (): TslNavMenuElement; prototype: TslNavMenuElement };

export interface TslOtpEventMap {
  /** Cambió el contenido. */
  "tsl-change": CustomEvent<{ value: string }>;
  /** Se rellenaron todas las celdas. */
  "tsl-complete": CustomEvent<{ value: string }>;
}
/** Código de un solo uso en celdas separadas, con pegado y autoavance. */
export interface TslOtpElement extends HTMLElement {
  /** Código escrito. */
  readonly value: string;
  /** Vacía todas las celdas. */
  clear(): void;
  addEventListener<K extends keyof TslOtpEventMap>(type: K, listener: (this: TslOtpElement, ev: TslOtpEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslOtpElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslOtpEventMap>(type: K, listener: (this: TslOtpElement, ev: TslOtpEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslOtpElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslOtp: { new (): TslOtpElement; prototype: TslOtpElement };

export interface TslTagsEventMap {
  /** Cambió la lista. */
  "tsl-change": CustomEvent<{ value: string[] }>;
}
/** Campo de etiquetas: Enter o coma añaden, Retroceso borra la última. */
export interface TslTagsElement extends HTMLElement {
  /** Etiquetas actuales. */
  readonly value: string[];
  /** Añade una etiqueta. */
  addTag(tag: string, fire?: boolean): void;
  /** Quita una etiqueta. */
  removeTag(tag: string, fire?: boolean): void;
  addEventListener<K extends keyof TslTagsEventMap>(type: K, listener: (this: TslTagsElement, ev: TslTagsEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTagsElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslTagsEventMap>(type: K, listener: (this: TslTagsElement, ev: TslTagsEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTagsElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslTags: { new (): TslTagsElement; prototype: TslTagsElement };

export interface TslDropzoneEventMap {
  /** Cambió la selección. */
  "tsl-change": CustomEvent<{ files: File[] }>;
}
/** Zona para arrastrar o elegir archivos, con lista de los seleccionados. */
export interface TslDropzoneElement extends HTMLElement {
  /** Archivos seleccionados. */
  readonly files: File[];
  addEventListener<K extends keyof TslDropzoneEventMap>(type: K, listener: (this: TslDropzoneElement, ev: TslDropzoneEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDropzoneElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslDropzoneEventMap>(type: K, listener: (this: TslDropzoneElement, ev: TslDropzoneEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDropzoneElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslDropzone: { new (): TslDropzoneElement; prototype: TslDropzoneElement };

export interface TslCalendarEventMap {
  /** Cambió la selección (en rango, `complete` indica que ya hay inicio y fin). */
  "tsl-change": CustomEvent<{ value: string; date?: Date; start?: string; end?: string | null; complete?: boolean }>;
}
/** Calendario con teclado (flechas, PgUp/PgDn), rango, varios meses y días deshabilitados. */
export interface TslCalendarElement extends HTMLElement {
  /** Fecha o intervalo ISO seleccionado. */
  value: string;
  /** Selecciona un día como si se hiciera clic. */
  pick(date: Date): void;
  /** Avanza o retrocede meses. */
  shift(months: number): void;
  addEventListener<K extends keyof TslCalendarEventMap>(type: K, listener: (this: TslCalendarElement, ev: TslCalendarEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCalendarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslCalendarEventMap>(type: K, listener: (this: TslCalendarElement, ev: TslCalendarEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCalendarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslCalendar: { new (): TslCalendarElement; prototype: TslCalendarElement };

/** Minigráfica de línea SVG que se adapta al tamaño del elemento. */
export interface TslSparklineElement extends HTMLElement {

}
export declare const TslSparkline: { new (): TslSparklineElement; prototype: TslSparklineElement };

export interface TslSelectEventMap {
  /** Cambió la selección. */
  "tsl-change": CustomEvent<{ value: string | string[]; values: string[] }>;
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Select personalizado con listbox accesible, buscador, selección múltiple y creación de opciones. */
export interface TslSelectElement extends HTMLElement {
  /** Valor seleccionado (arreglo con `multiple`). */
  value: string | string[];
  /** Indica si el panel está abierto. */
  readonly isOpen: boolean;
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Reemplaza las opciones (útil con datos asíncronos). */
  setOptions(options: Array<{ value: string; label?: string; disabled?: boolean; hint?: string; group?: string }>): void;
  /** Abre el panel. */
  open(): void;
  /** Cierra el panel. */
  close(returnFocus?: boolean): void;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslSelectEventMap>(type: K, listener: (this: TslSelectElement, ev: TslSelectEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSelectElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslSelectEventMap>(type: K, listener: (this: TslSelectElement, ev: TslSelectEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSelectElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslSelect: { new (): TslSelectElement; prototype: TslSelectElement };

/** Campo de texto que filtra opciones mientras se escribe (`<tsl-select autocomplete>`). */
export interface TslComboboxElement extends TslSelectElement {

}
export declare const TslCombobox: { new (): TslComboboxElement; prototype: TslComboboxElement };

export interface TslDatePickerEventMap {
  /** Cambió la fecha o el intervalo. */
  "tsl-change": CustomEvent<{ value: string; start: string; end: string }>;
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Selector de fecha o de intervalo de fechas en un popover con calendario. */
export interface TslDatePickerElement extends HTMLElement {
  /** Fecha o intervalo ISO. */
  value: string;
  /** Inicio del intervalo (o la fecha). */
  readonly start: string;
  /** Fin del intervalo (vacío sin `range`). */
  readonly end: string;
  /** Indica si el calendario está abierto. */
  readonly isOpen: boolean;
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Abre el calendario. */
  open(): void;
  /** Lo cierra. */
  close(returnFocus?: boolean): void;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslDatePickerEventMap>(type: K, listener: (this: TslDatePickerElement, ev: TslDatePickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDatePickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslDatePickerEventMap>(type: K, listener: (this: TslDatePickerElement, ev: TslDatePickerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDatePickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslDatePicker: { new (): TslDatePickerElement; prototype: TslDatePickerElement };

export interface TslTimePickerEventMap {
  /** Cambió la hora. */
  "tsl-change": CustomEvent<{ value: string }>;
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Selector de hora con columnas de hora y minutos (y AM/PM con `hour12`). */
export interface TslTimePickerElement extends HTMLElement {
  /** Hora `HH:MM` (24 h) o cadena vacía. */
  value: string;
  /** Indica si el panel está abierto. */
  readonly isOpen: boolean;
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Abre el panel. */
  open(): void;
  /** Lo cierra. */
  close(returnFocus?: boolean): void;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslTimePickerEventMap>(type: K, listener: (this: TslTimePickerElement, ev: TslTimePickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTimePickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslTimePickerEventMap>(type: K, listener: (this: TslTimePickerElement, ev: TslTimePickerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTimePickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslTimePicker: { new (): TslTimePickerElement; prototype: TslTimePickerElement };

export interface TslSliderEventMap {
  /** Cambia mientras se arrastra. */
  "tsl-input": CustomEvent<{ value: string; values: number[] }>;
  /** Se soltó el pulgar o cambió con el teclado. */
  "tsl-change": CustomEvent<{ value: string; values: number[] }>;
}
/** Slider de uno o dos pulgares (rango) con tooltip y teclado. */
export interface TslSliderElement extends HTMLElement {
  /** Valor (o `min,max` en un rango). */
  value: string;
  /** Valores numéricos. */
  readonly values: number[];
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslSliderEventMap>(type: K, listener: (this: TslSliderElement, ev: TslSliderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSliderElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslSliderEventMap>(type: K, listener: (this: TslSliderElement, ev: TslSliderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSliderElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslSlider: { new (): TslSliderElement; prototype: TslSliderElement };

export interface TslRatingEventMap {
  /** Cambió la valoración. */
  "tsl-change": CustomEvent<{ value: number }>;
}
/** Valoración con estrellas (también medias estrellas) como único control `slider`. */
export interface TslRatingElement extends HTMLElement {
  /** Valoración actual. */
  value: number;
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslRatingEventMap>(type: K, listener: (this: TslRatingElement, ev: TslRatingEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslRatingElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslRatingEventMap>(type: K, listener: (this: TslRatingElement, ev: TslRatingEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslRatingElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslRating: { new (): TslRatingElement; prototype: TslRatingElement };

export interface TslRadioGroupEventMap {
  /** El usuario eligió otra opción. */
  "tsl-change": CustomEvent<{ value: string }>;
}
/** Grupo de radios con un solo punto de tabulación: las flechas mueven y seleccionan. Opciones `button.tsl-radio` con etiqueta y descripción; participa en formularios. */
export interface TslRadioGroupElement extends HTMLElement {
  /** Valor seleccionado (cadena vacía si no hay). */
  value: string;
  /** Disposición. */
  readonly orientation: "vertical" | "horizontal";
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Restablece la selección inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslRadioGroupEventMap>(type: K, listener: (this: TslRadioGroupElement, ev: TslRadioGroupEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslRadioGroupElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslRadioGroupEventMap>(type: K, listener: (this: TslRadioGroupElement, ev: TslRadioGroupEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslRadioGroupElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslRadioGroup: { new (): TslRadioGroupElement; prototype: TslRadioGroupElement };

export interface TslColorPickerEventMap {
  /** Cambia mientras se arrastra. */
  "tsl-input": CustomEvent<{ value: string }>;
  /** Se confirmó el color. */
  "tsl-change": CustomEvent<{ value: string }>;
  /** El panel se abrió. */
  "tsl-open": CustomEvent<{}>;
  /** El panel se cerró. */
  "tsl-close": CustomEvent<{}>;
}
/** Selector de color con área de saturación/brillo, tono, opacidad, hexadecimal y cuentagotas. */
export interface TslColorPickerElement extends HTMLElement {
  /** Color `#rrggbb` o `#rrggbbaa`. */
  value: string;
  /** Indica si el panel está abierto. */
  readonly isOpen: boolean;
  /** Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Formulario al que pertenece. */
  readonly form: HTMLFormElement | null;
  /** Estado de validación. */
  readonly validity: ValidityState;
  /** Mensaje de validación actual. */
  readonly validationMessage: string;
  /** Abre el panel. */
  open(): void;
  /** Lo cierra. */
  close(returnFocus?: boolean): void;
  /** Restablece el valor inicial. */
  reset(): void;
  /** Indica si el campo es válido. */
  checkValidity(): boolean;
  /** Valida y muestra el aviso nativo si no lo es. */
  reportValidity(): boolean;
  addEventListener<K extends keyof TslColorPickerEventMap>(type: K, listener: (this: TslColorPickerElement, ev: TslColorPickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslColorPickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslColorPickerEventMap>(type: K, listener: (this: TslColorPickerElement, ev: TslColorPickerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslColorPickerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslColorPicker: { new (): TslColorPickerElement; prototype: TslColorPickerElement };

export interface TslPasswordEventMap {
  /** Cambió el texto; `score` va de 0 a 4. */
  "tsl-change": CustomEvent<{ value: string; score: number }>;
}
/** Envuelve un `<input>` con botón mostrar/ocultar y medidor de seguridad opcional. */
export interface TslPasswordElement extends HTMLElement {
  /** Texto escrito. */
  readonly value: string;
  addEventListener<K extends keyof TslPasswordEventMap>(type: K, listener: (this: TslPasswordElement, ev: TslPasswordEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPasswordElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslPasswordEventMap>(type: K, listener: (this: TslPasswordElement, ev: TslPasswordEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPasswordElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslPassword: { new (): TslPasswordElement; prototype: TslPasswordElement };

export interface TslMentionEventMap {
  /** Se insertó una mención. */
  "tsl-mention": CustomEvent<{ user: { value: string; label: string; hint?: string }; value: string }>;
}
/** Menciones al escribir `@` (o el carácter elegido) en un textarea o input. */
export interface TslMentionElement extends HTMLElement {
  /** Usuarios sugeribles (se leen de las `<option>` hijas). */
  users: Array<{ value: string; label: string; hint?: string }>;
  /** Indica si la lista está abierta. */
  readonly isOpen: boolean;
  /** Cierra la lista. */
  close(): void;
  addEventListener<K extends keyof TslMentionEventMap>(type: K, listener: (this: TslMentionElement, ev: TslMentionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMentionElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslMentionEventMap>(type: K, listener: (this: TslMentionElement, ev: TslMentionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMentionElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslMention: { new (): TslMentionElement; prototype: TslMentionElement };

export interface TslToggleGroupEventMap {
  /** Cambió la selección. */
  "tsl-change": CustomEvent<{ value: string | string[] }>;
}
/** Grupo de botones con `aria-pressed`, de selección única o múltiple. */
export interface TslToggleGroupElement extends HTMLElement {
  /** Valor activo (arreglo con `multiple`). */
  value: string | string[];
  /** Alterna un valor. */
  toggle(value: string): void;
  addEventListener<K extends keyof TslToggleGroupEventMap>(type: K, listener: (this: TslToggleGroupElement, ev: TslToggleGroupEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslToggleGroupElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslToggleGroupEventMap>(type: K, listener: (this: TslToggleGroupElement, ev: TslToggleGroupEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslToggleGroupElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslToggleGroup: { new (): TslToggleGroupElement; prototype: TslToggleGroupElement };

export interface TslCollapsibleEventMap {
  /** Cambió el estado. */
  "tsl-toggle": CustomEvent<{ open: boolean }>;
}
/** Bloque que se muestra u oculta con altura animada (el contenido cerrado queda `inert`). */
export interface TslCollapsibleElement extends HTMLElement {
  /** Estado abierto/cerrado. */
  isOpen: boolean;
  /** Alterna o fuerza un estado. */
  toggle(force?: boolean): void;
  /** Abre. */
  open(): void;
  /** Cierra. */
  close(): void;
  addEventListener<K extends keyof TslCollapsibleEventMap>(type: K, listener: (this: TslCollapsibleElement, ev: TslCollapsibleEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCollapsibleElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslCollapsibleEventMap>(type: K, listener: (this: TslCollapsibleElement, ev: TslCollapsibleEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCollapsibleElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslCollapsible: { new (): TslCollapsibleElement; prototype: TslCollapsibleElement };

export interface TslSidebarEventMap {
  /** Cambió el estado de la barra. */
  "tsl-toggle": CustomEvent<{ collapsed: boolean; open: boolean; mobile: boolean }>;
}
/** Barra lateral de navegación dentro de `.tsl-sidebar-layout`: completa, solo iconos u oculta; en pantallas estrechas se vuelve un cajón con fondo, Esc y devolución del foco. */
export interface TslSidebarElement extends HTMLElement {
  /** Contraída en escritorio. */
  collapsed: boolean;
  /** Está en modo cajón. */
  readonly isMobile: boolean;
  /** El cajón está abierto. */
  readonly mobileOpen: boolean;
  /** Contrae/expande (o abre/cierra el cajón en móvil); con `true` la muestra y con `false` la oculta. */
  toggle(show?: boolean): void;
  /** Contrae. */
  collapse(): void;
  /** Expande. */
  expand(): void;
  /** Abre el cajón (solo en modo estrecho). */
  openMobile(): void;
  /** Cierra el cajón. */
  closeMobile(): void;
  addEventListener<K extends keyof TslSidebarEventMap>(type: K, listener: (this: TslSidebarElement, ev: TslSidebarEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSidebarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslSidebarEventMap>(type: K, listener: (this: TslSidebarElement, ev: TslSidebarEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSidebarElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslSidebar: { new (): TslSidebarElement; prototype: TslSidebarElement };

export interface TslCarouselEventMap {
  /** Cambió la diapositiva visible. */
  "tsl-change": CustomEvent<{ index: number; count: number }>;
}
/** Carrusel con scroll-snap nativo: botones, puntos, teclado, bucle y avance automático con pausa. Las diapositivas fuera de vista quedan `inert`. */
export interface TslCarouselElement extends HTMLElement {
  /** Posición actual. */
  index: number;
  /** Diapositivas visibles. */
  readonly perView: number;
  /** Número de posiciones posibles. */
  readonly pageCount: number;
  /** Va a una posición. */
  goTo(index: number, smooth?: boolean): void;
  /** Avanza. */
  next(): void;
  /** Retrocede. */
  prev(): void;
  addEventListener<K extends keyof TslCarouselEventMap>(type: K, listener: (this: TslCarouselElement, ev: TslCarouselEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCarouselElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslCarouselEventMap>(type: K, listener: (this: TslCarouselElement, ev: TslCarouselEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslCarouselElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslCarousel: { new (): TslCarouselElement; prototype: TslCarouselElement };

export interface TslMessageScrollerEventMap {
  /** La persona llegó o se alejó del final. */
  "tsl-scroll-state": CustomEvent<{ atEnd: boolean }>;
}
/** Zona de conversación con altura propia: sigue el final mientras llegan o crecen mensajes y, si la persona sube, deja de seguirlo y ofrece «Ir al final». El contenido es una región `log`. */
export interface TslMessageScrollerElement extends HTMLElement {
  /** El visor está al final. */
  readonly atEnd: boolean;
  /** Baja al último mensaje y vuelve a seguir el final. */
  scrollToEnd(smooth?: boolean): void;
  /** Sube al principio. */
  scrollToStart(smooth?: boolean): void;
  addEventListener<K extends keyof TslMessageScrollerEventMap>(type: K, listener: (this: TslMessageScrollerElement, ev: TslMessageScrollerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMessageScrollerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslMessageScrollerEventMap>(type: K, listener: (this: TslMessageScrollerElement, ev: TslMessageScrollerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslMessageScrollerElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslMessageScroller: { new (): TslMessageScrollerElement; prototype: TslMessageScrollerElement };

export interface TslQuestionnaireEventMap {
  /** Cambió la pregunta visible. */
  "tsl-step": CustomEvent<{ index: number; count: number; name: string }>;
  /** Se enviaron las respuestas. */
  "tsl-submit": CustomEvent<{ answers: Record<string, FormDataEntryValue | FormDataEntryValue[]> }>;
}
/** Formulario de una pregunta por pantalla: obligatorias, omitibles, condicionales, atajos 1-9 y progreso. Los datos son campos nativos de un `<form>`. */
export interface TslQuestionnaireElement extends HTMLElement {
  /** Respuestas de las preguntas que aplican. */
  readonly answers: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
  /** Posición de la pregunta actual entre las que aplican. */
  readonly activeIndex: number;
  /** Número de preguntas que aplican. */
  readonly count: number;
  /** Avanza si la actual está respondida (o no es obligatoria). */
  next(): boolean;
  /** Retrocede. */
  prev(): void;
  /** Omite la pregunta actual (solo si no es obligatoria). */
  skip(): void;
  /** Va a una pregunta. */
  goTo(index: number, focus?: boolean): void;
  /** Valida todas las obligatorias y emite `tsl-submit`. */
  submit(): boolean;
  /** Borra las respuestas y vuelve a la primera. */
  reset(): void;
  addEventListener<K extends keyof TslQuestionnaireEventMap>(type: K, listener: (this: TslQuestionnaireElement, ev: TslQuestionnaireEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslQuestionnaireElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslQuestionnaireEventMap>(type: K, listener: (this: TslQuestionnaireElement, ev: TslQuestionnaireEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslQuestionnaireElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslQuestionnaire: { new (): TslQuestionnaireElement; prototype: TslQuestionnaireElement };

export interface TslPromptInputEventMap {
  /** Envío con el texto, los adjuntos y los demás campos del formulario (p. ej. el modelo). Cancelable: `preventDefault()` conserva el contenido. */
  "tsl-submit": CustomEvent<{ text: string; files: File[]; values: Record<string, FormDataEntryValue | FormDataEntryValue[]> }>;
  /** Se pulsó «Detener» durante una respuesta. */
  "tsl-stop": CustomEvent<{}>;
  /** Cambiaron los adjuntos. */
  "tsl-files": CustomEvent<{ files: File[] }>;
  /** Se rechazó un archivo (también se anuncia). */
  "tsl-error": CustomEvent<{ file: File; reason: "type" | "size" | "count"; message: string }>;
  /** Una sugerencia `[data-tsl-suggest]` rellenó la caja (lo emite el botón). */
  "tsl-select": CustomEvent<{ value: string }>;
}
/** Caja de entrada de un chat sobre un `<form>`: crece con el texto, Enter envía y Mayús+Enter salta de línea (respeta el IME), adjuntos por botón `[data-attach]`, pegado o arrastre, y el botón `[data-submit]` pasa a «Detener» mientras hay respuesta en curso. */
export interface TslPromptInputElement extends HTMLElement {
  /** Texto escrito. */
  value: string;
  /** Archivos adjuntos. */
  readonly files: File[];
  /** Refleja el atributo `status`. */
  status: string;
  /** Hay una respuesta en curso (`submitted` o `streaming`). */
  readonly busy: boolean;
  /** Hay texto o adjuntos y no está deshabilitado ni ocupado. */
  readonly canSubmit: boolean;
  /** Emite `tsl-submit`; si nadie lo cancela, vacía la caja. */
  submit(): boolean;
  /** Emite `tsl-stop`. */
  stop(): void;
  /** Vacía el texto y los adjuntos. */
  clear(): void;
  /** Añade archivos validando tipo, tamaño y cantidad. */
  addFiles(files: FileList | File[]): void;
  /** Quita un adjunto. */
  removeFile(index: number): void;
  /** Abre el selector de archivos. */
  openFilePicker(): void;
  /** Enfoca el texto. */
  focus(options?: FocusOptions): void;
  addEventListener<K extends keyof TslPromptInputEventMap>(type: K, listener: (this: TslPromptInputElement, ev: TslPromptInputEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPromptInputElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslPromptInputEventMap>(type: K, listener: (this: TslPromptInputElement, ev: TslPromptInputEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslPromptInputElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslPromptInput: { new (): TslPromptInputElement; prototype: TslPromptInputElement };

export interface TslReasoningEventMap {
  /** La persona abrió o plegó el razonamiento. */
  "tsl-toggle": CustomEvent<{ open: boolean }>;
  /** Terminó el razonamiento (se quitó `streaming`). */
  "tsl-complete": CustomEvent<{ duration: number }>;
}
/** Razonamiento plegable de un asistente: con `streaming` se abre, muestra «Pensando…» y cuenta el tiempo; al terminar dice cuánto pensó y se pliega solo si la persona no lo tocó. */
export interface TslReasoningElement extends HTMLElement {
  /** El contenido está visible. */
  readonly isOpen: boolean;
  /** Tiene `streaming`. */
  readonly isStreaming: boolean;
  /** Segundos que duró (o lleva). */
  readonly duration: number;
  /** Abre o pliega. */
  toggle(force?: boolean): void;
  /** Abre el contenido. */
  open(): void;
  /** Pliega el contenido. */
  close(): void;
  addEventListener<K extends keyof TslReasoningEventMap>(type: K, listener: (this: TslReasoningElement, ev: TslReasoningEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslReasoningElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslReasoningEventMap>(type: K, listener: (this: TslReasoningElement, ev: TslReasoningEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslReasoningElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslReasoning: { new (): TslReasoningElement; prototype: TslReasoningElement };

export interface TslBranchEventMap {
  /** La persona cambió de versión. */
  "tsl-change": CustomEvent<{ index: number; count: number }>;
}
/** Versiones alternativas de un mensaje (`.tsl-branch__item`): muestra una con el selector «‹ 2 de 3 ›», empieza en la última y salta a cada versión nueva que llegue. */
export interface TslBranchElement extends HTMLElement {
  /** Versión visible, desde 0. */
  index: number;
  /** Número de versiones. */
  readonly count: number;
  /** Muestra una versión (da la vuelta en los extremos). */
  goTo(index: number, fire?: boolean): void;
  /** Versión siguiente. */
  next(): void;
  /** Versión anterior. */
  prev(): void;
  addEventListener<K extends keyof TslBranchEventMap>(type: K, listener: (this: TslBranchElement, ev: TslBranchEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslBranchElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslBranchEventMap>(type: K, listener: (this: TslBranchElement, ev: TslBranchEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslBranchElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslBranch: { new (): TslBranchElement; prototype: TslBranchElement };

/** Medidor del contexto de un modelo: anillo con el porcentaje usado que abre un panel con barra, desglose de tokens y coste. Pasa a aviso desde el 75 % y a peligro desde el 90 % (`data-level`). */
export interface TslContextElement extends HTMLElement {
  /** Tokens usados. */
  readonly used: number;
  /** Tamaño de la ventana. */
  readonly max: number;
  /** Fracción usada, entre 0 y 1. */
  readonly ratio: number;
  /** Nivel según el uso. */
  readonly level: "ok" | "warn" | "danger";
  /** Abre el panel. */
  open(): void;
  /** Cierra el panel. */
  close(): void;
}
export declare const TslContext: { new (): TslContextElement; prototype: TslContextElement };

export interface TslWizardEventMap {
  /** Cambió el paso visible. */
  "tsl-step": CustomEvent<{ index: number; count: number; title: string }>;
  /** Cambió algún campo. */
  "tsl-change": CustomEvent<{ values: Record<string, FormDataEntryValue | FormDataEntryValue[]> }>;
  /** Se enviaron todos los pasos válidos. */
  "tsl-submit": CustomEvent<{ values: Record<string, FormDataEntryValue | FormDataEntryValue[]> }>;
}
/** Formulario en varios pasos (`.tsl-wizard__step`): valida cada paso con la validación nativa antes de avanzar, dibuja el indicador `.tsl-steps` con los pasos visitados pulsables y, al enviar, revisa todos y emite `tsl-submit`. Botones `[data-prev]`, `[data-next]` y `[data-submit]`. */
export interface TslWizardElement extends HTMLElement {
  /** Paso visible, desde 0. */
  readonly index: number;
  /** Número de pasos. */
  readonly count: number;
  /** El paso visible es el último. */
  readonly isLast: boolean;
  /** Valores actuales del formulario. */
  readonly values: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
  /** Avanza si el paso actual es válido. */
  next(): boolean;
  /** Retrocede un paso. */
  prev(): boolean;
  /** Va a un paso; hacia delante solo si los anteriores son válidos. */
  goTo(index: number, focus?: boolean): boolean;
  /** Comprueba un paso y, con `report`, señala el primer campo inválido. */
  validate(index: number, report?: boolean): boolean;
  /** Valida todos los pasos (lleva al primero con errores) y emite `tsl-submit`. */
  submit(): boolean;
  /** Vuelve al primer paso sin borrar los campos (`form.reset()` también lo hace). */
  restart(): void;
  addEventListener<K extends keyof TslWizardEventMap>(type: K, listener: (this: TslWizardElement, ev: TslWizardEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslWizardElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslWizardEventMap>(type: K, listener: (this: TslWizardElement, ev: TslWizardEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslWizardElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslWizard: { new (): TslWizardElement; prototype: TslWizardElement };

/** Zona desplazable con degradado en los bordes que aún tienen contenido (`data-top|bottom|left|right`). `scrollTo()` se aplica al área desplazable. */
export interface TslScrollAreaElement extends HTMLElement {

}
export declare const TslScrollArea: { new (): TslScrollAreaElement; prototype: TslScrollAreaElement };

export interface TslResizableEventMap {
  /** Cambiaron los tamaños (porcentajes). */
  "tsl-resize": CustomEvent<{ sizes: number[] }>;
}
/** Paneles con separadores arrastrables (puntero y teclado), anidables y con tamaños persistentes. */
export interface TslResizableElement extends HTMLElement {
  addEventListener<K extends keyof TslResizableEventMap>(type: K, listener: (this: TslResizableElement, ev: TslResizableEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslResizableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslResizableEventMap>(type: K, listener: (this: TslResizableElement, ev: TslResizableEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslResizableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslResizable: { new (): TslResizableElement; prototype: TslResizableElement };

export interface TslTreeEventMap {
  /** Se seleccionó un nodo. */
  "tsl-select": CustomEvent<{ value: string; values: string[] }>;
  /** Se expandió o colapsó un nodo. */
  "tsl-toggle": CustomEvent<{ value: string; expanded: boolean }>;
  /** Cambiaron las casillas marcadas. */
  "tsl-check": CustomEvent<{ values: string[] }>;
}
/** Árbol accesible a partir de una lista anidada, con selección y casillas de estado mixto. */
export interface TslTreeElement extends HTMLElement {
  /** Nodo(s) seleccionado(s). */
  value: string | string[];
  /** Nodos con la casilla marcada. */
  readonly checkedValues: string[];
  /** Expande o colapsa un nodo. */
  expand(value: string, on?: boolean): void;
  /** Expande (o colapsa) todos. */
  expandAll(on?: boolean): void;
  /** Colapsa todos. */
  collapseAll(): void;
  /** Enfoca un nodo. */
  focusItem(item: HTMLLIElement | null): void;
  addEventListener<K extends keyof TslTreeEventMap>(type: K, listener: (this: TslTreeElement, ev: TslTreeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTreeElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslTreeEventMap>(type: K, listener: (this: TslTreeElement, ev: TslTreeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslTreeElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslTree: { new (): TslTreeElement; prototype: TslTreeElement };

export interface TslVirtualListEventMap {
  /** Se eligió un elemento. */
  "tsl-select": CustomEvent<{ item: unknown; index: number }>;
}
/** Lista virtualizada de alto de fila fijo: solo dibuja las filas visibles. */
export interface TslVirtualListElement extends HTMLElement {
  /** Elementos de la lista. */
  items: unknown[];
  /** Cómo dibujar un elemento (un string se muestra como texto). */
  renderItem: ((item: any, index: number) => Node | string) | undefined;
  /** Índice activo (−1 si ninguno). */
  readonly activeIndex: number;
  /** Desplaza hasta un elemento. */
  scrollToIndex(index: number, align?: "start" | "center" | "end" | "nearest"): void;
  /** Activa un elemento (y lo desplaza a la vista). */
  activate(index: number, fire?: boolean): void;
  addEventListener<K extends keyof TslVirtualListEventMap>(type: K, listener: (this: TslVirtualListElement, ev: TslVirtualListEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslVirtualListElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslVirtualListEventMap>(type: K, listener: (this: TslVirtualListElement, ev: TslVirtualListEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslVirtualListElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslVirtualList: { new (): TslVirtualListElement; prototype: TslVirtualListElement };

export interface TslSortableEventMap {
  /** Un elemento cambió de posición (se emite en la lista de destino). */
  "tsl-sort": CustomEvent<{ item: HTMLElement; from: { container: HTMLElement; index: number }; to: { container: HTMLElement; index: number } }>;
}
/** Lista reordenable con puntero y teclado, también entre listas del mismo grupo (kanban). */
export interface TslSortableElement extends HTMLElement {
  /** Elementos `.tsl-sortable__item` de la lista. */
  readonly itemEls: HTMLElement[];
  addEventListener<K extends keyof TslSortableEventMap>(type: K, listener: (this: TslSortableElement, ev: TslSortableEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSortableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslSortableEventMap>(type: K, listener: (this: TslSortableElement, ev: TslSortableEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslSortableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslSortable: { new (): TslSortableElement; prototype: TslSortableElement };

export interface TslDataTableEventMap {
  /** Cambió el orden. */
  "tsl-sort": CustomEvent<{ key: string; dir: "asc" | "desc" | null }>;
  /** Cambió la página o su tamaño. */
  "tsl-page": CustomEvent<{ page: number; pageSize: number }>;
  /** Cambió la selección. */
  "tsl-selection": CustomEvent<{ ids: string[]; rows: Array<{ id: string | number; [key: string]: any }> }>;
  /** Se hizo clic en una fila. */
  "tsl-row-click": CustomEvent<{ row: { id: string | number; [key: string]: any } }>;
}
/** Tabla con búsqueda, orden, selección, columnas visibles, densidad, paginación y exportación CSV. */
export interface TslDataTableElement extends HTMLElement {
  /** Definición de columnas. */
  columns: Array<{ key: string; label: string; sort?: "text" | "number" | "date"; align?: "end"; width?: string; hidden?: boolean; format?: (value: any, row: any) => string; render?: (row: any) => Node | string }>;
  /** Filas de datos. */
  rows: Array<{ id: string | number; [key: string]: any }>;
  /** Refleja el atributo `loading`. */
  loading: boolean;
  /** Identificadores de las filas seleccionadas. */
  readonly selectedIds: string[];
  /** Filas seleccionadas. */
  readonly selectedRows: Array<{ id: string | number; [key: string]: any }>;
  /** Deselecciona todo. */
  clearSelection(): void;
  /** Alterna el orden de una columna (asc → desc → ninguno). */
  sortBy(key: string): void;
  /** Devuelve el CSV de las filas filtradas y ordenadas. */
  toCSV(): string;
  /** Descarga el CSV. */
  exportCsv(filename?: string): void;
  addEventListener<K extends keyof TslDataTableEventMap>(type: K, listener: (this: TslDataTableElement, ev: TslDataTableEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDataTableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslDataTableEventMap>(type: K, listener: (this: TslDataTableElement, ev: TslDataTableEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslDataTableElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslDataTable: { new (): TslDataTableElement; prototype: TslDataTableElement };

export interface TslChartEventMap {
  /** Cambió el punto activo. */
  "tsl-chart-hover": CustomEvent<{ index: number; label: string; values: Array<{ name: string; value: unknown; color: string; percent?: number }> }>;
  /** Se pulsó el punto activo. */
  "tsl-chart-click": CustomEvent<{ index: number; label: string; values: Array<{ name: string; value: unknown; color: string; percent?: number }> }>;
}
/** Gráficas SVG: línea, área, barras, dona, gauge y mapa de calor, con tooltip, leyenda y teclado. */
export interface TslChartElement extends HTMLElement {
  /** Datos (el formato depende del tipo). */
  data: unknown;
  /** Tipo de gráfica. */
  readonly type: string;
  /** Alto en píxeles. */
  readonly height: number;
  /** Vuelve a dibujar la gráfica. */
  render(): void;
  addEventListener<K extends keyof TslChartEventMap>(type: K, listener: (this: TslChartElement, ev: TslChartEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslChartElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TslChartEventMap>(type: K, listener: (this: TslChartElement, ev: TslChartEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: TslChartElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare const TslChart: { new (): TslChartElement; prototype: TslChartElement };

declare global {
  interface HTMLElementTagNameMap {
    "tsl-tabs": TslTabsElement;
    "tsl-segmented": TslSegmentedElement;
    "tsl-menu": TslMenuElement;
    "tsl-command": TslCommandElement;
    "tsl-popover": TslPopoverElement;
    "tsl-hovercard": TslHovercardElement;
    "tsl-context-menu": TslContextMenuElement;
    "tsl-menubar": TslMenubarElement;
    "tsl-nav-menu": TslNavMenuElement;
    "tsl-otp": TslOtpElement;
    "tsl-tags": TslTagsElement;
    "tsl-dropzone": TslDropzoneElement;
    "tsl-calendar": TslCalendarElement;
    "tsl-sparkline": TslSparklineElement;
    "tsl-select": TslSelectElement;
    "tsl-combobox": TslComboboxElement;
    "tsl-date-picker": TslDatePickerElement;
    "tsl-time-picker": TslTimePickerElement;
    "tsl-slider": TslSliderElement;
    "tsl-rating": TslRatingElement;
    "tsl-radio-group": TslRadioGroupElement;
    "tsl-color-picker": TslColorPickerElement;
    "tsl-password": TslPasswordElement;
    "tsl-mention": TslMentionElement;
    "tsl-toggle-group": TslToggleGroupElement;
    "tsl-collapsible": TslCollapsibleElement;
    "tsl-sidebar": TslSidebarElement;
    "tsl-carousel": TslCarouselElement;
    "tsl-message-scroller": TslMessageScrollerElement;
    "tsl-questionnaire": TslQuestionnaireElement;
    "tsl-prompt-input": TslPromptInputElement;
    "tsl-reasoning": TslReasoningElement;
    "tsl-branch": TslBranchElement;
    "tsl-context": TslContextElement;
    "tsl-wizard": TslWizardElement;
    "tsl-scroll-area": TslScrollAreaElement;
    "tsl-resizable": TslResizableElement;
    "tsl-tree": TslTreeElement;
    "tsl-virtual-list": TslVirtualListElement;
    "tsl-sortable": TslSortableElement;
    "tsl-data-table": TslDataTableElement;
    "tsl-chart": TslChartElement;
  }
  interface Window {
    TeselaUI: TeselaUIGlobal;
  }
  interface DocumentEventMap {
    /** Cambió el tema (o el sistema operativo, con el tema «system»). */
    "tsl-theme": CustomEvent<{ theme: Theme; resolved: ResolvedTheme }>;
    "tsl-preset": CustomEvent<{ preset: PresetName }>;
    "tsl-accent": CustomEvent<{ accent: string | null; fg: string | null }>;
  }
}
